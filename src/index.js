import * as THREE from 'three-full'

var camera, scene, renderer, controls, clock, rgbeLoader, textureLoader, gltfLoader;

var cornerDoubleFull, cornerDoubleShort, cornerSimple, cornerSimpleFull, middleSimple, middleWithCover;

var matCouch, matCushion, matMetal, matPlastic, matBlanket;


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

document.getElementById("mdl-cnt-1").onclick = function (val) {
  setMiddles(this.dataset.value)
}
document.getElementById("mdl-cnt-2").onclick = function (val) {
  setMiddles(this.dataset.value)
}
document.getElementById("mdl-cnt-3").onclick = function (val) {
  setMiddles(this.dataset.value)
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


var showDimensions = false;
var cornerLeftName = "cornerDoubleShort";
var cornerRightName = "cornerSimple";
var middleParts = 1;
var matCouchName = "matLeather1";
var matPillowName = "matLeather1";

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

var models = {
  cornerDoubleFull: "",
  cornerDoubleShort: "",
  cornerSimple: "",
  cornerSimpleFull: "",
  middleSimple: "",
  middleWithCover: ""
}

var dummyLeft, dummyMiddle1, dummyMiddle2, dummyMiddle3, dummyRight;

function init() {
  clock = new THREE.Clock();
  camera = new THREE.PerspectiveCamera(55, document.getElementById("webGL").clientWidth / document.getElementById("webGL").clientHeight, 0.01, 30);
  camera.position.set(-3.0, 3.0, -3.0);

  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xf0f0f0);
  dummyLeft = new THREE.Object3D();
  dummyLeft.scale.x = -1;
  scene.add(dummyLeft);
  dummyMiddle1 = new THREE.Object3D();
  scene.add(dummyMiddle1);
  dummyMiddle2 = new THREE.Object3D();
  dummyMiddle2.position.x = 1;
  scene.add(dummyMiddle2);
  dummyMiddle3 = new THREE.Object3D();
  dummyMiddle3.position.x = 2;
  scene.add(dummyMiddle3);
  dummyRight = new THREE.Object3D();
  dummyRight.position.x = 1;
  scene.add(dummyRight);

  rgbeLoader = new THREE.RGBELoader();
  textureLoader = new THREE.TextureLoader();
  gltfLoader = new THREE.GLTFLoader();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(document.getElementById("webGL").clientWidth, document.getElementById("webGL").clientHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.setPixelRatio(1);
  renderer.toneMappingExposure = 1.2;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();
  controls.screenSpacePanning = true;

  document.getElementById("webGL").appendChild(renderer.domElement);

  const size = 10;
  const divisions = 10;
  const gridHelper = new THREE.GridHelper(size, divisions);

  window.addEventListener('resize', onWindowResize, false);


  const promises = [];
  promises.push(addGLTF("./public/assets/couch.glb"));
  promises.push(addCubeMap("./public/assets/env.hdr", renderer));



  Promise.all(promises).then((result) => {
    const couch = result[0];
    couch.traverse((child) => {
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



    // setModels({
    //   cornerLeftName: "cornerDoubleShort",
    //   cornerRightName: "cornerSimple",
    //   middleParts: 1,
    //   matCouchName: "matLeather",
    //   matPillowName: "matLeather"
    // })
    setLeftCorner(cornerLeftName)
    setRightCorner(cornerRightName)
    setMiddles(1)

    scene.background = new THREE.Color(0xffffff);
    scene.environment = result[1];

    animate();
  })
}

function setLeftCorner(cornerName) {
  const leftCorner = models[cornerName].clone();
  removeAllChildsOf(dummyLeft);
  dummyLeft.add(leftCorner);

  cornerLeftName = cornerName;
  injectMaterial(matCouchName, "couch");
  injectMaterial(matPillowName, "cushion");
  injectMaterial("matPlastic", "plastic");
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
}

function setMaterial(matName) {
  injectMaterial(matName, "couch");
  injectMaterial(matName, "cushion");
  injectMaterial("matPlastic", "plastic");
  matCouchName = matName;
  matPillowName = matName;
}


function injectMaterial(materialName, subMeshName) {
  console.log(materialName, subMeshName)
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

}

function addGLTF(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, res => {
      const start = Date.now();
      const end = Date.now();
      console.log(`Execution time for ${url}: ${end - start} ms`);
      resolve(res.scene)
    })
  })
}

function removeAllChildsOf(mesh) {
  for (var i = mesh.children.length - 1; i >= 0; i--) {
    var obj = mesh.children[i];
    mesh.remove(obj);
  }
}

function addCubeMap(url, renderer) {
  return new Promise((resolve, reject) => {
    let pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()

    rgbeLoader.setDataType(THREE.UnsignedByteType)
    rgbeLoader.load(url, (res) => {
      const envMap = pmremGenerator.fromEquirectangular(res).texture
      resolve(envMap)
    })
  })
}

function addTexture(url) {
  return new Promise((resolve, reject) => {
    textureLoader.load(url, (res) => {
      // res.wrapS = THREE.RepeatWrapping;
      // res.wrapT = THREE.RepeatWrapping;
      // res.rotation = Math.PI / 4;
      // res.center = new THREE.Vector2(0.5, 0.5); // center of texture.
      resolve(res)
    })
  })
}

function animate() {
  requestAnimationFrame(animate);
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

init();