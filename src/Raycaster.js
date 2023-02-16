import { Vector2, Vector3, Raycaster } from 'three';

class _Raycaster {
    constructor() {
        this.mouse = new Vector2();
        this.raycaster = new Raycaster();
        this.camera = null;
        this.onClickEntities = [];
        this.container = null;
        this.origin = new Vector3();
        this.direction = new Vector3();
    }

    setFromCamera(camera, container) {
        this.camera = camera;
        this.container = container;
    }

    setFromOrigin(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    castFromCamera(event) {
        this.mouse.x = (event.clientX / this.container.clientWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / this.container.clientHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        return this.raycaster.intersectObjects(this.onClickEntities, true);
    }

    castFromOrigin() {
        this.raycaster.set(this.origin, this.direction);
        return this.raycaster.intersectObjects(this.onClickEntities, true);
    }
}

export default _Raycaster;