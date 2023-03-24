import { Color, UnsignedByteType, PMREMGenerator, Clock, PerspectiveCamera, Scene, Object3D, TextureLoader, WebGLRenderer, ReinhardToneMapping, sRGBEncoding, ACESFilmicToneMapping, GridHelper, LoadingManager } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import LoaderService from './loader'
import UtilsService from './utils'
import ShaderService from './shader'

function init() {
  start = Date.now();
  scene = new Scene();
  camera = new PerspectiveCamera(55, document.getElementById("webGL").clientWidth / document.getElementById("webGL").clientHeight, 0.01, 30);
  camera.position.set(-3.0, 3.0, -3.0);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(document.getElementById("webGL").clientWidth, document.getElementById("webGL").clientHeight);
  renderer.toneMappingExposure = 1.2;
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;
  document.getElementById("webGL").appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();
  controls.screenSpacePanning = true;

  const size = 10;
  const divisions = 10;
  const gridHelper = new GridHelper(size, divisions);
  scene.add(gridHelper)

  window.addEventListener('resize', onWindowResize, false);

  const promises = [];
  promises.push(LoaderService.loadHDR("./public/assets/env.hdr", renderer));
  promises.push(LoaderService.loadGLTF("./public/assets/couch.glb"));

  Promise.all(promises).then((result) => {
    const hdr = result[0];
    const couch = result[1];

    scene.add(couch);

    scene.background = hdr;
    scene.environment = hdr;

    const end = Date.now();
    console.log(`Total time: ${end - start} ms`);
  })

  renderer.setAnimationLoop(animate);
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

var camera, scene, renderer, controls, start;

init();