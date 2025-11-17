import * as THREE from 'three';
import { Player } from '../player/Player';

export class CameraController {
    private readonly camera: THREE.PerspectiveCamera;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
    }

    updateForPlayer(player: Player): void {
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
}
