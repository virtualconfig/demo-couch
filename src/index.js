import * as THREE from 'three-full'
import './modal'

var camera, scene, renderer, controls, clock, rgbeLoader, textureLoader, gltfLoader
var mouse, raycaster;


function init() {
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.01,
    30
  )
  camera.position.set(-3.0, 3.0, -3.0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  rgbeLoader = new THREE.RGBELoader();
  textureLoader = new THREE.TextureLoader();
  clock = new THREE.Clock(true);

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  gltfLoader = new THREE.GLTFLoader();

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.setPixelRatio(1)
  renderer.toneMappingExposure = 1.2;
  // renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update()
  controls.screenSpacePanning = true;

  document.getElementById("webGL").appendChild(renderer.domElement)
  const size = 10;
  const divisions = 10;

  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);

  window.addEventListener('resize', onWindowResize, false)

}


function addGLTF(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, res => {
      const start = Date.now();
      scene.add(res.scene)
      renderer.compile(scene, camera)
      const end = Date.now();
      console.log(`Execution time for ${url}: ${end - start} ms`);
      resolve(res.scene)
    })
  })
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

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera)
};

init();