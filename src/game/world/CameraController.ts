import * as THREE from 'three';
import { Player } from '../player/Player';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Angle } from '../../utils/Angle';
export class CameraController {
    private readonly camera: THREE.PerspectiveCamera;
    private domElement?: HTMLElement;
    private orbitControls?: any;
    private cameraMode: number = 0;

    constructor(camera: THREE.PerspectiveCamera, domElement?: HTMLElement) {
        this.domElement = domElement;
        this.camera = camera;
        if (this.domElement) {
            this.orbitControls = new OrbitControls(this.camera, this.domElement);
            this.orbitControls.enabled = false;
        }
    }

    toggleOrbitControls(): void {
        if (!this.orbitControls) {
            if (!this.domElement) {
                return;
            }
            this.orbitControls = new OrbitControls(this.camera, this.domElement);
        }
        this.orbitControls.enabled = !this.orbitControls.enabled;
        if (!this.orbitControls.enabled) {
            this.orbitControls.reset();
        }
    }

    cycleCamera(): number {
        this.cameraMode = (this.cameraMode + 1) % 3;
        return this.cameraMode;
    }

    updateForPlayer(player: Player): void {
        if (this.orbitControls && this.orbitControls.enabled) {
            this.orbitControls.update();
            return;
        }

        switch (this.cameraMode) {
            case 1: {
                const distance = 200;
                const height = 400;
                const forwardX = Math.cos(Angle.toRadians(-player.rotation));
                const forwardZ = Math.sin(Angle.toRadians(-player.rotation));
                const camX = player.x - forwardX * distance;
                const camZ = player.z - forwardZ * distance;
                const camY = player.y + height;
                this.camera.position.set(camX, camY, camZ);
                this.camera.lookAt(player.x, player.y + 20, player.z);
                break;
            }
            case 2: {
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
            default: {
                this.camera.position.set(player.x + 200, player.y + 400, player.z);
                this.camera.lookAt(player.x, player.y + 20, player.z);
                break;
            }
        }
    }
}
