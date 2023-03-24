import { LoadingManager, TextureLoader, PMREMGenerator, UnsignedByteType, HalfFloatType } from 'three';

class UtilsService {
    constructor() { }

    removeAllChildsOf(mesh) {
        for (var i = mesh.children.length - 1; i >= 0; i--) {
            var obj = mesh.children[i];
            mesh.remove(obj);
        }
    }
}

export default new UtilsService();