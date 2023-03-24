import { Color, DirectionalLight, PCFSoftShadowMap, PlaneGeometry, Mesh, ShadowMaterial, UnsignedByteType, PMREMGenerator, Clock, PerspectiveCamera, Scene, Object3D, TextureLoader, WebGLRenderer, ReinhardToneMapping, sRGBEncoding, ACESFilmicToneMapping, GridHelper, LoadingManager } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import LoaderService from './loader'
import UtilsService from './utils'
import ShaderService from './shader'

function init() {
  start = Date.now();
  scene = new Scene();
  camera = new PerspectiveCamera(25, document.getElementById("webGL").clientWidth / document.getElementById("webGL").clientHeight, 0.01, 30);
  camera.position.set(3.0, 3.0, 6.0);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(document.getElementById("webGL").clientWidth, document.getElementById("webGL").clientHeight);
  renderer.toneMappingExposure = 1.2;
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  document.getElementById("webGL").appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.5, 0);
  controls.update();
  controls.screenSpacePanning = true;

  const sun = new DirectionalLight(0xfffefa, 1)
  sun.position.set(16, 14, 12)
  sun.castShadow = true
  sun.shadow.mapSize.width = 4096
  sun.shadow.mapSize.height = 4096
  sun.shadow.bias = -0.00007
  sun.shadow.camera.near = 10
  sun.shadow.camera.far = 90
  scene.add(sun)

  const size = 10;
  const divisions = 10;
  const gridHelper = new GridHelper(size, divisions);
  scene.add(gridHelper)
  objectHolder = new Object3D();
  scene.add(objectHolder)
  const geometry = new PlaneGeometry(100, 100);
  geometry.rotateX(- Math.PI / 2);

  const material = new ShadowMaterial();
  material.opacity = 0.6;
  const plane = new Mesh(geometry, material);
  plane.receiveShadow = true;
  scene.add(plane);
  window.addEventListener('resize', onWindowResize, false);

  const promises = [];
  promises.push(LoaderService.loadHDR("./public/assets/env.hdr", renderer));
  promises.push(LoaderService.loadGLTF("./public/assets/fotoliu-procesat.glb"));
  promises.push(LoaderService.loadGLTF("./public/assets/materials.glb"));



  Promise.all(promises).then((result) => {
    const hdr = result[0];
    couch = result[1];
    const materialsScene = result[2];

    materialsScene.traverse(child => {
      if (child.material) {
        const tempMat = child.material.clone();
        ShaderService.convertToTriplanar(tempMat)
        materials[child.name] = tempMat;
      }
    })
    applyMaterialToScene(couch, selectedMaterial)


    objectHolder.add(couch);

    scene.background = new Color(0xffffff);
    scene.environment = hdr;
    console.log(materials)
    const end = Date.now();
    console.log(`Total time: ${end - start} ms`);
  })

  renderer.setAnimationLoop(animate);
}

function loadModel(glbName) {
  document.getElementById("loading-screen").style.display = "block"
  LoaderService.loadGLTF("./public/assets/" + glbName).then(res => {
    couch = res;
    applyMaterialToScene(couch, selectedMaterial)
    for (var i = objectHolder.children.length - 1; i >= 0; i--) {
      var obj = objectHolder.children[i];
      objectHolder.remove(obj);
    }
    objectHolder.add(couch)
  })

}

function applyMaterialToScene(object, materialName) {
  object.traverse(child => {
    if (child.material && materials[materialName] && !child.name.includes("skip")) {
      child.material = materials[materialName]
      child.castShadow = true; //default is false
      child.receiveShadow = true; //default
      selectedMaterial = materialName
    }
  })
}

function animate() {
  render();
};

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = document.getElementById("webGL").clientWidth / document.getElementById("webGL").clientHeight
  camera.updateProjectionMatrix()

  renderer.setSize(document.getElementById("webGL").clientWidth, document.getElementById("webGL").clientHeight)
}

var camera, scene, renderer, controls, start, couch;

var materials = {}
var selectedMaterial = "piele1"
var objectHolder; 

document.getElementById("models").onchange = function (val) {
  console.log(this.value)
  loadModel(this.value)
}

document.getElementById("mat-1").onclick = function (val) {
  applyMaterialToScene(couch, this.dataset.value)
}
document.getElementById("mat-2").onclick = function (val) {
  applyMaterialToScene(couch, this.dataset.value)
}
document.getElementById("mat-3").onclick = function (val) {
  applyMaterialToScene(couch, this.dataset.value)
}
document.getElementById("mat-4").onclick = function (val) {
  applyMaterialToScene(couch, this.dataset.value)
}
init();