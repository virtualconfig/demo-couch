import {
    Vector3,
    Matrix3
} from 'three';
import Raycaster from '../src/Raycaster';

class StayOnPlane {
    constructor() {
        this.mesh = null;
        this.origin = null;
        this.lastGoodPosition = new Vector3();
        this.raycaster = new Raycaster();
        this.moveIncerementX = 0;
        this.moveIncerementZ = 0;
        this.rotation = 0;
    };

    init(mesh, orgin) {
        this.mesh = mesh;
        this.origin = orgin;
        this.rotation = this.origin.rotation.y;
        this.raycaster.onClickEntities.push(this.mesh);
        this.lastGoodPosition = this.origin.position.clone();
    }

    updateDefaultPosition() {
        this.origin.position.x += Math.cos(this.origin.rotation.y) * this.moveIncerementX + Math.sin(this.origin.rotation.y) * this.moveIncerementZ;
        this.origin.position.z -= -Math.cos(this.origin.rotation.y) * this.moveIncerementZ + Math.sin(this.origin.rotation.y) * this.moveIncerementX;
        this.moveIncerementX = this.moveIncerementZ = 0;
    }

    checkCollisions() {
        let origin = this.origin.position.clone();

        let moveDir = new Vector3(
            this.origin.position.x - this.lastGoodPosition.x,
            this.origin.position.y - this.lastGoodPosition.y,
            this.origin.position.z - this.lastGoodPosition.z
        ).normalize();

        this.raycaster.setFromOrigin(origin, moveDir);
        const intersections = this.raycaster.castFromOrigin();

        if (intersections.length) {
            if (intersections[0].point.distanceTo(this.origin.position) > 0.18) {
                this.updateDefaultPosition();
                 this.lastGoodPosition.copy(this.origin.position);
            } else {
                this.origin.position.copy(this.lastGoodPosition);
                const normalMatrix = new Matrix3().getNormalMatrix(intersections[0].object.matrixWorld);
                const worldNormal = intersections[0].face.normal.clone().applyMatrix3(normalMatrix).normalize();
                let reflect = new Vector3().copy(moveDir).reflect(worldNormal);
                let destination = new Vector3().addVectors(moveDir, reflect).normalize();
                this.origin.position.x += destination.x * 0.02 * Math.sin(moveDir.angleTo(worldNormal));
                this.origin.position.z += destination.z * 0.02 * Math.sin(moveDir.angleTo(worldNormal));
            }
        } else {
            this.origin.position.copy(this.lastGoodPosition);
        }
    }

}

export default new StayOnPlane();