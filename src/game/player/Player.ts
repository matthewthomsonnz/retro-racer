import * as THREE from 'three';
import { Angle } from '../../utils/Angle';

const STEERING_SCALE = 5.0;
const GROUNDING_LERP = 1;

export type PlayerKeyState = {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
};

export type PlayerRayPositions = {
    frontL: [number, number, number, number];
    frontR: [number, number, number, number];
    rearL: [number, number, number, number];
    rearR: [number, number, number, number];
};

export class Player {
    x: number;
    y: number;
    z: number;
    velocityX: number;
    velocityZ: number;
    velocityY: number;
    turnVelocity: number;
    lap: number;
    rotation: number;
    chaseCameraEnabled: boolean;
    checkpointReached: boolean;
    keyState: PlayerKeyState;
    rayPositions: PlayerRayPositions;
    carModel: THREE.Object3D | null;

    constructor(x: number, y: number, z: number, rotation: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.velocityX = 0;
        this.velocityZ = 0;
        this.velocityY = 0;
        this.turnVelocity = 0;
        this.lap = 1;
        this.rotation = rotation;
        this.chaseCameraEnabled = true;
        this.checkpointReached = false;
        this.keyState = {
            w: false,
            a: false,
            s: false,
            d: false,
        };
        this.rayPositions = {
            frontL: [0, 10, 0, -20],
            frontR: [12, 10, 0, 20],
            rearL: [0, 10, 12, 200],
            rearR: [12, 10, 12, 160],
        };
        this.carModel = null;
    }

    updateGrounding(track: THREE.Object3D | null): void {
        if (!track) {
            return;
        }

        let missingHits = 0;
        let hitYs: number[] = [];

        Object.entries(this.rayPositions).forEach(entry => {
            const ray = new THREE.Raycaster();
            ray.ray.origin.set(entry[1][0], entry[1][1] + 1110, entry[1][2]);
            ray.ray.direction.set(0, -1, 0);
            const intersections = ray.intersectObject(track, true);

            entry[1][0] = this.x + 14 * Math.cos(Angle.toRadians(entry[1][3] - this.rotation));
            entry[1][2] = this.z + 14 * Math.sin(Angle.toRadians(entry[1][3] - this.rotation));

            if (intersections[0] === undefined) {
                missingHits += 1;
            } else {
                hitYs.push(intersections[0].point.y);
            }
        });

        if (hitYs.length > 0) {
            const targetY = Math.max(...hitYs);
            const nextY = this.y + (targetY - this.y) * GROUNDING_LERP;
            this.y = Math.max(nextY, targetY);
            this.velocityY = 0;
        }
    }

    updatePosition(): void {
        this.velocityY -= -0.2; // gravity
        this.y += this.velocityY;

        // acceleration
        const accel = 0.1;
        if (this.keyState.w) {
            this.velocityX += Math.cos(Angle.toRadians(-this.rotation)) * accel;
            this.velocityZ += Math.sin(Angle.toRadians(-this.rotation)) * accel;
        }
        if (this.keyState.s) {
            this.velocityX -= Math.cos(Angle.toRadians(-this.rotation)) * accel * 0.5;
            this.velocityZ -= Math.sin(Angle.toRadians(-this.rotation)) * accel * 0.5;
        }

        // friction
        this.velocityX *= 0.995;
        this.velocityZ *= 0.995;

        // drift
        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityZ ** 2);
        if (speed > 0.01) {
            const currentAngle = Math.atan2(this.velocityZ, this.velocityX);
            const targetAngle = Angle.toRadians(-this.rotation);
            let angleDiff = targetAngle - currentAngle;
            angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
            let driftFactor = Math.min(0.25, 0.02 + speed * 0.03);
            if (this.keyState.s) {
                driftFactor *= 1.5;
            }
            const newAngle = currentAngle + angleDiff * driftFactor;
            this.velocityX = Math.cos(newAngle) * speed;
            this.velocityZ = Math.sin(newAngle) * speed;
        }

        this.x += this.velocityX;
        this.z += this.velocityZ;

        (window as any).axesHelper.position.set(this.x, this.y, this.z);

        if (this.keyState.a) {
            this.turnVelocity += 0.012;
        } else if (this.keyState.d) {
            this.turnVelocity -= 0.012;
        } else {
            this.turnVelocity *= 0.7;
        }

        this.turnVelocity = Math.max(-0.22, Math.min(0.22, this.turnVelocity));

        const turnFactor = Math.max(0.06, 0.12 - speed * 0.002);
        this.rotation += this.turnVelocity * turnFactor * STEERING_SCALE;

        if (Math.abs(this.velocityX) > 0 && !this.keyState.w && !this.keyState.s) {
            this.velocityX *= 0.96;
        }
    }
}
