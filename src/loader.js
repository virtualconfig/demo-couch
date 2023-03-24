import { LoadingManager, TextureLoader, PMREMGenerator, UnsignedByteType, HalfFloatType } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';

class LoaderService {
    constructor() {
        this.loadingManager = new LoadingManager();
        this.hdrLoader = new RGBELoader(this.loadingManager);
        this.textureLoader = new TextureLoader(this.loadingManager);
        this.gltfLoader = new GLTFLoader(this.loadingManager);
    }

    loadGLTF(url) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            this.gltfLoader.load(url, res => {
                const end = Date.now();
                console.log(`Loading time for ${url}: ${end - start} ms`);
                resolve(res.scene)
            })
        })
    }

    loadHDR(url, renderer) {
        return new Promise((resolve, reject) => {
            let pmremGenerator = new PMREMGenerator(renderer)
            pmremGenerator.compileEquirectangularShader()

            this.hdrLoader.setDataType(HalfFloatType)
            this.hdrLoader.load(url, (texture) => {
                var envMap = pmremGenerator.fromEquirectangular(texture).texture;
                resolve(envMap)
            })
        })
    }

    loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(url, (res) => {
                // res.wrapS = RepeatWrapping;
                // res.wrapT = RepeatWrapping;
                // res.rotation = Math.PI / 4;
                // res.center = new Vector2(0.5, 0.5); // center of texture.
                resolve(res)
            })
        })
    }
}

export default new LoaderService();