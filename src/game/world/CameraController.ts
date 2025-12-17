import * as THREE from 'three';
import { Player } from '../player/Player';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export class CameraController {
    private readonly camera: THREE.PerspectiveCamera;

    private domElement?: HTMLElement;
    constructor(camera: THREE.PerspectiveCamera, domElement?: HTMLElement) {
        this.domElement = domElement;
        this.camera = camera;
    }
    updateForPlayer(player: Player): void {
            this.camera.position.set(-100, 20, 0);
            this.camera.lookAt(0, 0, 0);
            this.camera.position.set(player.x + 200, player.y + 400, player.z);
            this.camera.lookAt(player.x, player.y + 20, player.z);
        }
}


