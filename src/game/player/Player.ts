import * as THREE from 'three';
import { Angle } from '../../utils/Angle';

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
    velocity: number;
    velocityY: number;
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
        this.velocity = 0;
        this.velocityY = 0;
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
            this.y = Math.min(...hitYs);
            this.velocityY = 0;
        }
    }

    updatePosition(): void {
        this.velocityY -= 0.1; // gravity
        this.y += this.velocityY;

        this.x += this.velocity * Math.cos(Angle.toRadians(-this.rotation));
        this.z += this.velocity * Math.sin(Angle.toRadians(-this.rotation));
        (window as any).axesHelper.position.set(this.x, this.y, this.z)
        if (this.keyState.w) {
            this.velocity += 0.02;
        }

        if (this.keyState.s && this.velocity > -1) {
            this.velocity -= 0.01;
        }

        if ((this.keyState.a && this.velocity > 0.1) || (this.keyState.d && this.velocity < -0.1)) {
            this.rotation += 1;
        }

        if ((this.keyState.d && this.velocity > 0.1) || (this.keyState.a && this.velocity < -0.1)) {
            this.rotation -= 1;
        }

        if (this.velocity > 0 && !this.keyState.w) {
            this.velocity -= 0.04;
        }
    }
}
