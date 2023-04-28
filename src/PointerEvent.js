import { Object3D } from 'three';
import StayOnPlane from '../src/StayOnPlane';

let scope;
class PointerEvent {
    constructor() {
        this.pitchObject = new Object3D();
        this.yawObject = new Object3D();
        this.keysPressed = [];
        this.moveIncerement = 0.02;
        this.yawPos = this.yawObject.position.clone();
    };

    setPointerLockEvent(camera, scene) {
        scope = this;
        const camPos = camera.position.clone();
        const camRot = camera.rotation.clone();
        camera.position.set(0, 0, 0);
        camera.rotation.set(0, 0, 0);

        scope.pitchObject.add(camera);

        scope.yawObject.position.set(camPos.x, camPos.y, camPos.z);
        scope.yawObject.rotation.set(0, -2.64, 0);
        scope.yawObject.add(scope.pitchObject);
        scene.add(scope.yawObject);
        scope.yawPos = camPos.clone();

        window.yawPos = scope.yawPos;
        window.yawObject = scope.yawObject;

    };
    checkCollisions(){
        StayOnPlane.checkCollisions()
    }
    translateCamera() {
        scope.keysPressed.forEach((key) => {
            if (key == 87 || key == 38) {
                StayOnPlane.moveIncerementZ = -scope.moveIncerement;
            }
            if (key == 83 || key == 40) {
                StayOnPlane.moveIncerementZ = scope.moveIncerement;
            }
            if (key == 65 || key == 37) {
                StayOnPlane.moveIncerementX = -scope.moveIncerement;
            }
            if (key == 68 || key == 39) {
                StayOnPlane.moveIncerementX = scope.moveIncerement;
            }
        });
        StayOnPlane.updateDefaultPosition();
        StayOnPlane.checkCollisions();
    };

    setMesh(object, camera){
        StayOnPlane.init(object, camera);
    }

    handleMotionEvent(event) {
        if (event.acceleration.z > 3) {
            StayOnPlane.moveIncerementZ = -0.16;
        }
        
        StayOnPlane.updateDefaultPosition();
       
    };

    onMove(event){
        StayOnPlane.checkCollisions();
    }

    onRotate(event) {
        event.preventDefault();

        scope.yawObject.rotation.y -= event.velocityX * 0.02;

        scope.pitchObject.rotation.x -= event.velocityY * 0.02;
        scope.pitchObject.rotation.x = Math.max(- Math.PI / 2, Math.min(Math.PI / 2, scope.pitchObject.rotation.x));

    };

    onKeyDown(event) {
        if (scope.keysPressed.indexOf(event.which) == -1) {
            scope.keysPressed.push(event.which);
        }
    };

    onKeyUp(event) {
        if (scope.keysPressed.indexOf(event.which) != -1) {
            scope.keysPressed.splice(scope.keysPressed.indexOf(event.which), 1);
        }
    };
}

export default new PointerEvent();