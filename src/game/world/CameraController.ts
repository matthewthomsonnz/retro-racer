import * as THREE from 'three';
import { Player } from '../player/Player';
import { Angle } from '../../utils/Angle';
export class CameraController {
    private readonly camera: THREE.PerspectiveCamera;
    private cameraMode: number = 1;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
    }

    cycleCamera(): number {
        this.cameraMode = (this.cameraMode + 1) % 2;
        return this.cameraMode;
    }

    updateForPlayer(player: Player): void {
        switch (this.cameraMode) {
            case 1: {
                const distance = 100;
                const height = 30;
                const forwardX = Math.cos(Angle.toRadians(-player.rotation));
                const forwardZ = Math.sin(Angle.toRadians(-player.rotation));
                const camX = player.x - forwardX * distance;
                const camZ = player.z - forwardZ * distance;
                const camY = player.y + height;
                this.camera.position.set(camX, camY, camZ);
                this.camera.fov = 0.0012312
                this.camera.lookAt(player.x, player.y + 20, player.z);
                break;
            }
            default: {
                const frontOffset = 20;
                const bumperHeight = 6;
                const forwardX = Math.cos(Angle.toRadians(-player.rotation));
                const forwardZ = Math.sin(Angle.toRadians(-player.rotation));
                const camX = player.x + forwardX * frontOffset;
                const camZ = player.z + forwardZ * frontOffset;
                const camY = player.y + bumperHeight;
                this.camera.position.set(camX, camY, camZ);
                const lookX = player.x + forwardX * (frontOffset + 200);
                const lookZ = player.z + forwardZ * (frontOffset + 200);
                this.camera.lookAt(lookX, player.y + 20, lookZ);
                break;
            }
        }
    }
}
