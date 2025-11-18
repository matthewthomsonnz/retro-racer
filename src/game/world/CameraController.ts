import * as THREE from 'three';
import { Player } from '../player/Player';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
    private readonly camera: THREE.PerspectiveCamera;
    private domElement?: HTMLElement;
    private orbitControls: any;

    constructor(camera: THREE.PerspectiveCamera, domElement?: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;
    }

    updateForPlayer(player: Player): void {
        if (this.orbitControls) {
            return;
        }

        if (player.chaseCameraEnabled && player.carModel) {
            player.carModel.add(this.camera);
            this.camera.position.set(-100, 20, 0);
            this.camera.lookAt(0, 0, 0);
        } else {
            if (player.carModel) {
                player.carModel.remove(this.camera);
            }
            this.camera.position.set(player.x + 200, player.y + 400, player.z);
            this.camera.lookAt(player.x, player.y + 20, player.z);
        }
    }

    enableOrbitControls(): void {
        if (this.orbitControls) {
            return;
        }

        const element = this.domElement ?? document.body;
        this.orbitControls = new OrbitControls(this.camera, element);
        this.orbitControls.enableDamping = true;
        this.orbitControls.update();
    }

    disableOrbitControls(): void {
        if (!this.orbitControls) {
            return;
        }

        this.orbitControls.dispose();
        this.orbitControls = undefined;
    }

    toggleOrbitControls(): void {
        if (this.orbitControls) {
            this.disableOrbitControls();
        } else {
            this.enableOrbitControls();
        }
    }

    updateControls(): void {
        if (this.orbitControls) {
            this.orbitControls.update();
        }
    }
}
