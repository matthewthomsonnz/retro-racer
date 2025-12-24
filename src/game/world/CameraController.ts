import * as THREE from 'three';
import { Player } from '../player/Player';
import { Angle } from '../../utils/Angle';
export class CameraController {
    private readonly camera: THREE.PerspectiveCamera;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
    }

    cycleCamera(): number {
        return 0;
    }

    updateForPlayer(player: Player): void {
        const backDistance = 90;
        const sideOffset = 35;
        const height = 24;

        const forwardX = Math.cos(Angle.toRadians(-player.rotation));
        const forwardZ = Math.sin(Angle.toRadians(-player.rotation));

        const rightX = -forwardZ;
        const rightZ = forwardX;

        const camX = player.x - forwardX * backDistance + rightX * sideOffset;
        const camZ = player.z - forwardZ * backDistance + rightZ * sideOffset;
        const camY = player.y + height;

        this.camera.position.set(camX, camY, camZ);
        this.camera.fov = 40;
        this.camera.lookAt(player.x, player.y + 18, player.z);
    }
}
