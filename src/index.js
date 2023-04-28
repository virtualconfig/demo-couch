import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';


function init() {
  clock = new THREE.Clock()
  loadingManager = new THREE.LoadingManager();
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    3000
  )
  camera.position.set(150.0, 175.0, 600.0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  rgbeLoader = new RGBELoader(loadingManager)
  textureLoader = new THREE.TextureLoader(loadingManager)
  clock = new THREE.Clock(true)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  lutCubeLoader = new LUTCubeLoader(loadingManager);
  dracoLoader = new DRACOLoader(loadingManager);
  dracoLoader.setDecoderPath('public/gltf/');
  console.log(dracoLoader)
  gltfLoader = new GLTFLoader(loadingManager)
  gltfLoader.setDRACOLoader(dracoLoader);
  const megaDummy = new THREE.Object3D();

  dummyLeft = new THREE.Object3D();
  dummyLeft.scale.x = -1;
  megaDummy.add(dummyLeft);
  dummyMiddle1 = new THREE.Object3D();
  megaDummy.add(dummyMiddle1);
  dummyMiddle2 = new THREE.Object3D();
  dummyMiddle2.position.x = 1;
  megaDummy.add(dummyMiddle2);
  dummyMiddle3 = new THREE.Object3D();
  dummyMiddle3.position.x = 2;
  megaDummy.add(dummyMiddle3);
  dummyRight = new THREE.Object3D();
  dummyRight.position.x = 1;
  megaDummy.add(dummyRight);


  megaDummy.scale.set(100, 100, 100)
  megaDummy.position.set(68, 1.16, 60)
  scene.add(megaDummy)
  // dummyRight.position.y = dummyMiddle3.position.y = dummyMiddle2.position.y = dummyMiddle1.position.y = dummyLeft.position.y = -1.5

  renderer = new THREE.WebGLRenderer({antialias:true})
  const resolution = Math.min(window.devicePixelRatio, 2);
  console.log(resolution)
  renderer.setPixelRatio(resolution)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setPixelRatio(1)
  renderer.toneMappingExposure = 1.1
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  composer = new EffectComposer(renderer);

  // setComposer()

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(150, 60, 50)
  controls.update()
  controls.enablePan = false
  controls.maxDistance = 500
  controls.minDistance = 150
  controls.maxPolarAngle = 1.6
  controls.minPolarAngle = 1.2
  controls.minAzimuthAngle = -1
  controls.maxAzimuthAngle = 1
  controls.rotateSpeed = 0.5
  // controls.screenSpacePanning = true

  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
  cubeRenderTarget.texture.type = THREE.HalfFloatType;

  cubeCamera = new THREE.CubeCamera(1, 2000, cubeRenderTarget);
  cubeCamera.position.set(189, 30, 135)
  // cubeCamera.rotation.y = Math.PI;
  document.getElementById('webGL').appendChild(renderer.domElement)
  const size = 10
  const divisions = 10

  const gridHelper = new THREE.GridHelper(size, divisions)
  // scene.add(gridHelper)


  addCubeMap("bla bla", renderer).then((result) => {
    result.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = result;
    scene.environment = result


    const promises = []

    promises.push(addGLTF('public/assets/interior4-DRACO.glb'))
    promises.push(addGLTF('public/assets/couchDRACO.glb'))
    const start = Date.now()

    Promise.all(promises).then((res) => {
      res[0].scale.set(100, 100, 100)
      scene.add(res[0])

      res[0].traverse(child => {
        if (child.material) {
          if (child.material.aoMap) {
            child.material.aoMapIntensity = 1.8
            child.material.lightMap = child.material.aoMap
            child.material.lightMapIntensity = 1.2
          }
          if (child.name === "floor-01") {
            child.material.map.wrapS = child.material.map.wrapT = THREE.RepeatWrapping
            child.material.map.needsUpdate = true
            child.material.needsUpdate = true
            child.material.opacity = 1.1
            child.material.envMap = cubeRenderTarget.texture
          }
          if (child.name === "leaf-01") {
            child.material.alphaTest = 0.1
          }
          // if (child.name === "glass-02") {
          //   const envMaterial = new THREE.MeshStandardMaterial( {
          //     envMap: cubeRenderTarget.texture,
          //     roughness: 0.05,
          //     metalness: 1
          //   } );
          //   child.material = envMaterial

          //   // child.material.envMap = cubeRenderTarget.texture
          //   console.log(cubeCamera)
          //   mirrorObject = child;
          // }
          if (child.name === "glass-02") {

            const material = new THREE.MeshPhysicalMaterial({
              color: 0x161616,
              metalness: 0.0,
              roughness: 0.16,
              ior: 3,
              aoMap: child.material.aoMap,
              aoMapIntensity: 2,
              lightMap: child.material.aoMap,
              envMap: cubeRenderTarget.texture,
              envMapIntensity: 1,
              transmission: 1, // use material.transmission for glass materials
              specularIntensity: 1,
              specularColor: 0xffffff,
              opacity: 1.0,
              side: THREE.DoubleSide,
              transparent: false,
              thickness: 0.01
            });
            child.material = material
            child.material.needsUpdate = true
            mirrorObject = child;
          }
        }
      })

      // res[1].scale.set(100, 100, 100)
      // console.log(res[1])
      // scene.add(res[1])
      res[1].scale.set(100, 100, 100)
      meshScene = res[1]
      meshScene.traverse((child) => {
        if (child.material) {
          if (child.name === "matLeather1") materials.matLeather1 = child.material.clone();
          if (child.name === "matLeather2") materials.matLeather2 = child.material.clone();
          if (child.name === "matLinen1") materials.matLinen1 = child.material.clone();
          if (child.name === "matLinen2") materials.matLinen2 = child.material.clone();
          if (child.name === "matPlastic") {
            child.material.metalness = 1;
            child.material.color = new THREE.Color(0.5, 0.5, 0.5);
            child.material.transparent = true;
            child.material.opacity = 0.8
            materials.matPlastic = child.material.clone();
          }

          if (child.name === "cornerDoubleFull_couch") aoMaps.cornerDoubleFull = child.material.aoMap.clone();
          if (child.name === "cornerDoubleShort_couch") aoMaps.cornerDoubleShort = child.material.aoMap.clone();
          if (child.name === "cornerSimple_couch") aoMaps.cornerSimple = child.material.aoMap.clone();
          if (child.name === "cornerSimpleFull_couch") aoMaps.cornerSimpleFull = child.material.aoMap.clone();
          if (child.name === "middleSimple_couch") aoMaps.middleSimple = child.material.aoMap.clone();
          if (child.name === "middleWithCover_couch") aoMaps.middleWithCover = child.material.aoMap.clone();
        }

        if (child.name === "cornerDoubleFull") models.cornerDoubleFull = child.clone();
        if (child.name === "cornerDoubleShort") models.cornerDoubleShort = child.clone();
        if (child.name === "cornerSimple") models.cornerSimple = child.clone();
        if (child.name === "cornerSimpleFull") models.cornerSimpleFull = child.clone();
        if (child.name === "middleSimple") models.middleSimple = child.clone();
        if (child.name === "middleWithCover") models.middleWithCover = child.clone();

      });
      setLeftCorner(cornerLeftName)
      setRightCorner(cornerRightName)
      setMiddles(2)

      const end = Date.now();
      console.log(`Execution time: ${end - start} ms`);
      renderer.setAnimationLoop(animate);
    })
  })

  window.addEventListener('resize', onWindowResize, false)
}

function setComposer() {

  // const renderPass = new RenderPass(scene, camera)

  // const smaapass = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
  // const fxaaPass = new ShaderPass(FXAAShader);
  // fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * renderer.getPixelRatio());

  // fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * renderer.getPixelRatio());
  // const gammaCorrectionPass = new ShaderPass(THREE.GammaCorrectionShader)
  

  // composer.addPass(renderPass);
  // // composer.addPass(smaapass);
  // composer.addPass(fxaaPass);
  // // composer.addPass(gammaCorrectionPass)
}

function addGLTF(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, (res) => {
      resolve(res.scene)
    })
  })
}

function addCubeMap(url, renderer) {
  return new Promise((resolve, reject) => {
    rgbeLoader.setPath('public/assets/')
    rgbeLoader.load("aviation_museum_1k.hdr", (res) => {
      resolve(res)
    })
  })
}

function removeAllChildsOf(mesh) {
  for (var i = mesh.children.length - 1; i >= 0; i--) {
    var obj = mesh.children[i];
    mesh.remove(obj);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  if (mirrorObject) {
    mirrorObject.visible = false
    cubeCamera.update(renderer, scene);
    mirrorObject.visible = true
  }
  // composer.render();
  renderer.render(scene, camera)
}

function setLeftCorner(cornerName) {
  const leftCorner = models[cornerName].clone();
  removeAllChildsOf(dummyLeft);
  dummyLeft.add(leftCorner);

  cornerLeftName = cornerName;
  injectMaterial(matCouchName, "couch");
  injectMaterial(matPillowName, "cushion");
  injectMaterial("matPlastic", "plastic");
  injectMaterial(matCouchName, "seat-01", true);
}

function setRightCorner(cornerName) {
  const rightCorner = models[cornerName].clone();
  removeAllChildsOf(dummyRight);

  dummyRight.add(rightCorner);
  cornerRightName = cornerName
  injectMaterial(matCouchName, "couch");
  injectMaterial(matPillowName, "cushion");
  injectMaterial("matPlastic", "plastic");
}

function setMiddles(count) {
  const middlePart1 = models["middleSimple"].clone();
  const middlePart2 = models["middleSimple"].clone();
  const middlePart3 = models["middleSimple"].clone();

  removeAllChildsOf(dummyMiddle1);
  removeAllChildsOf(dummyMiddle2);
  removeAllChildsOf(dummyMiddle3);

  if (count == 1) {
    dummyMiddle1.add(middlePart1);
    dummyRight.position.x = 1;
  } else if (count == 2) {
    dummyMiddle1.add(middlePart1);
    dummyMiddle2.add(middlePart2);
    dummyRight.position.x = 2;
  } else {
    dummyMiddle1.add(middlePart1);
    dummyMiddle2.add(middlePart2);
    dummyMiddle3.add(middlePart3);
    dummyRight.position.x = 3;
  }
  middleParts = count
  injectMaterial(matCouchName, "couch");
  injectMaterial(matPillowName, "cushion");
  injectMaterial("matPlastic", "plastic");
  injectMaterial(matCouchName, "seat-01", true);
}

function setMaterial(matName) {
  injectMaterial(matName, "couch");
  injectMaterial(matName, "cushion");
  injectMaterial("matPlastic", "plastic");
  injectMaterial(matName, "seat-01", true);
  matCouchName = matName;
  matPillowName = matName;
}

function injectMaterial(materialName, subMeshName, force) {

  const cornerLeftSubMesh = dummyLeft.getObjectByName(cornerLeftName + "_" + subMeshName);
  if (cornerLeftSubMesh) {
    const leftAoMap = aoMaps[cornerLeftName];
    leftAoMap.needsUpdate = true;
    const leftCloneMat = materials[materialName].clone();
    leftCloneMat.aoMap = leftAoMap;
    leftCloneMat.lightMap = leftAoMap;
    leftCloneMat.needsUpdate = true;
    cornerLeftSubMesh.material = leftCloneMat;
  }

  const cornerRightSubMesh = dummyRight.getObjectByName(cornerRightName + "_" + subMeshName);
  if (cornerRightSubMesh) {
    const rightAoMap = aoMaps[cornerRightName]
    rightAoMap.needsUpdate = true;
    const rightCloneMat = materials[materialName].clone();
    rightCloneMat.aoMap = rightAoMap;
    rightCloneMat.lightMap = rightAoMap;
    rightCloneMat.needsUpdate = true;
    cornerRightSubMesh.material = rightCloneMat;
  }



  var middle1SubMesh = dummyMiddle1.getObjectByName("middleSimple_" + subMeshName);
  var middle2SubMesh = dummyMiddle2.getObjectByName("middleSimple_" + subMeshName);
  var middle3SubMesh = dummyMiddle3.getObjectByName("middleSimple_" + subMeshName);


  var middleAoMap = aoMaps["middleSimple"]
  middleAoMap.needsUpdate = true;

  var middleCloneMat = materials[materialName].clone();
  middleCloneMat.aoMap = middleAoMap;
  middleCloneMat.lightMap = middleAoMap;
  middleCloneMat.needsUpdate = true;

  if (middle1SubMesh) middle1SubMesh.material = middleCloneMat;
  if (middle2SubMesh) middle2SubMesh.material = middleCloneMat;
  if (middle3SubMesh) middle3SubMesh.material = middleCloneMat;

  // if (force) {
  //   var newChair = scene.getObjectByName(subMeshName)

  //   if (!couchNormalMap) {
  //     couchAOap = newChair.material.aoMap.clone()
  //     couchAOap.wrapS = couchAOap.wrapT = THREE.RepeatWrapping
  //     couchAOap.repeat.set(1,1)
  //     couchAOap.needsUpdate = true

  //   }
  //   let maty = middleCloneMat.clone()
  //   // mapy.wrapS = mapy.wrapT = THREE.RepeatWrapping
  //   // mapy.repeat.set(3,3)
  //   // mapy
  //   // console.log(newChair.material)
  //   newChair.material = maty
  //   newChair.material.aoMap = couchAOap
  //   newChair.material.map.wrapS =  newChair.material.map.wrapT = THREE.RepeatWrapping
  //   newChair.material.map.repeat.set(4,4)
  //   newChair.material.map.needsUpdate = true
  //   newChair.material.normalMap = null
  //   newChair.material.needsUpdate = true
  // }

}



// function addTexture(url) {
//   return new Promise((resolve, reject) => {
//     textureLoader.load(url, (res) => {
//       // res.wrapS = THREE.RepeatWrapping;
//       // res.wrapT = THREE.RepeatWrapping;
//       // res.rotation = Math.PI / 4;
//       // res.center = new THREE.Vector2(0.5, 0.5); // center of texture.
//       resolve(res)
//     })
//   })
// }


const start = Date.now();
let cubeCamera, cubeRenderTarget;

var camera,
  scene,
  renderer,
  controls,
  clock,
  rgbeLoader,
  textureLoader,
  gltfLoader
var lutCubeLoader
var loadingManager
var mouse, raycaster
var cube
var showDimensions = false;
var cornerLeftName = "cornerDoubleShort";
var cornerRightName = "cornerSimple";
var middleParts = 1;
var matCouchName = "matLeather1";
var matPillowName = "matLeather1";
var composer;
var materials = {
  matLeather: "",
  matLinen: "",
  matMuslin: "",
  matPlastic: ""
}


var aoMaps = {
  cornerDoubleFull: "",
  cornerDoubleShort: "",
  cornerSimple: "",
  cornerSimpleFull: "",
  middleSimple: "",
  middleWithCover: ""
}
var couchNormalMap;
var couchAOap;
var models = {
  cornerDoubleFull: "",
  cornerDoubleShort: "",
  cornerSimple: "",
  cornerSimpleFull: "",
  middleSimple: "",
  middleWithCover: ""
}
let dracoLoader;
let controller;

let reticle;
var dummyLeft, dummyMiddle1, dummyMiddle2, dummyMiddle3, dummyRight;
let hitTestSource = null;
let hitTestSourceRequested = false;
let meshScene;

document.getElementById("stg-dublu-intreg").onclick = function (val) {
  setLeftCorner(this.dataset.value)
}
document.getElementById("stg-dublu-scurt").onclick = function (val) {
  setLeftCorner(this.dataset.value)
}
document.getElementById("stg-simplu").onclick = function (val) {
  setLeftCorner(this.dataset.value)
}
document.getElementById("stg-simplu-intreg").onclick = function (val) {
  setLeftCorner(this.dataset.value)
}

document.getElementById("drpt-dublu-intreg").onclick = function (val) {
  setRightCorner(this.dataset.value)
}
document.getElementById("drpt-dublu-scurt").onclick = function (val) {
  setRightCorner(this.dataset.value)
}
document.getElementById("drpt-simplu").onclick = function (val) {
  setRightCorner(this.dataset.value)
}
document.getElementById("drpt-simplu-intreg").onclick = function (val) {
  setRightCorner(this.dataset.value)
}

document.getElementById("mat-1").onclick = function (val) {
  setMaterial(this.dataset.value)
}
document.getElementById("mat-2").onclick = function (val) {
  setMaterial(this.dataset.value)
}
document.getElementById("mat-3").onclick = function (val) {
  setMaterial(this.dataset.value)
}
document.getElementById("mat-4").onclick = function (val) {
  setMaterial(this.dataset.value)
}
var mirrorObject;

init()
