import { Color, Group, MeshBasicMaterial, DirectionalLight, MeshPhongMaterial, BoxGeometry, PCFSoftShadowMap, PlaneGeometry, Mesh, ShadowMaterial, UnsignedByteType, PMREMGenerator, Clock, PerspectiveCamera, Scene, Object3D, TextureLoader, WebGLRenderer, ReinhardToneMapping, sRGBEncoding, ACESFilmicToneMapping, GridHelper, LoadingManager, DoubleSide } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import LoaderService from './loader'
import UtilsService from './utils'
import ShaderService from './shader'
import { ProgressiveShadows } from './ProgressiveShadows';

function init() {
  start = Date.now();
  scene = new Scene();
  camera = new PerspectiveCamera(25, document.getElementById("webGL").clientWidth / document.getElementById("webGL").clientHeight, 1, 1000);
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
  // sun.castShadow = true
  // sun.shadow.mapSize.width = 4096
  // sun.shadow.mapSize.height = 4096
  // sun.shadow.bias = -0.00007
  // sun.shadow.camera.near = 10
  // sun.shadow.camera.far = 90
  scene.add(sun)

  progressiveShadows = new ProgressiveShadows(renderer, scene, { size: 5 })

  progressiveShadows.lightOrigin.position.set(16, 16, 16)
  console.log(progressiveShadows)
  // progressiveShadows.params.debugHelpers = false
  // progressiveShadows.params.lightRadius = 0.08
  // progressiveShadows.averagingWindow.value = 200
  const size = 10;
  const divisions = 10;
  const gridHelper = new GridHelper(size, divisions);
  scene.add(gridHelper)

  objectHolder = new Object3D();
  objectHolder.position.y = 0.01
  scene.add(objectHolder)



  // const geometry = new PlaneGeometry(100, 100);
  // geometry.rotateX(- Math.PI / 2);
  // const material = new ShadowMaterial();
  // material.opacity = 0.6;
  // const plane = new Mesh(geometry, material);
  // plane.receiveShadow = true;
  // scene.add(plane);


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
        child.material.side = 2
        const tempMat = child.material.clone();
        ShaderService.convertToTriplanar(tempMat)
        materials[child.name] = tempMat;
      }
    })
    console.log(materialsScene)

    objectHolder.add(couch);
    progressiveShadows.recalculate()

    applyMaterialToScene(objectHolder, selectedMaterial)
    scene.background = new Color(0xffffff);
    scene.environment = hdr;
    progressiveShadows.clear()

    const end = Date.now();
    console.log(`Total time: ${end - start} ms`);
  })

  renderer.setAnimationLoop(animate);
}

function loadModel(glbName) {
  document.getElementById("loading-screen").style.display = "block"
  LoaderService.loadGLTF("./public/assets/" + glbName).then(res => {
    progressiveShadows.recalculate()
    couch = res;

    applyMaterialToScene(couch, selectedMaterial)
    for (var i = objectHolder.children.length - 1; i >= 0; i--) {
      var obj = objectHolder.children[i];
      objectHolder.remove(obj);
    }
    objectHolder.add(couch)
    progressiveShadows.clear()
  })

}

function applyMaterialToScene(object, materialName) {
  object.traverse(child => {
    console.log(child.material, materials, materialName)
    if (child.material && materials[materialName] && !child.name.includes("skip")) {
      child.material = materials[materialName]
      child.castShadow = true; //default is false
      child.receiveShadow = true; //default
      selectedMaterial = materialName
      child.material.needsUpdate = true
    }
  })

}

function animate() {
  render();
};

function render() {

  progressiveShadows.update(camera)
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
const shadowMapRes = 512, lightMapRes = 1024, lightCount = 8;
let lightOrigin = null, progressiveSurfacemap;
let progressiveShadows
const dirLights = [], lightmapObjects = [];
const lightRadius = 15
const ambientWeight = 0.5
let object = new Mesh();
const blendWindow = 100
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