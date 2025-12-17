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

        Object.entries(this.rayPositions).forEach(entry => {
            const ray = new THREE.Raycaster();
            ray.ray.origin.set(entry[1][0], entry[1][1] + 1110, entry[1][2]);
            ray.ray.direction.set(0, -1, 0);
            const intersections = ray.intersectObject(track, true);

            entry[1][0] = this.x + 14 * Math.cos(Angle.toRadians(entry[1][3] - this.rotation));
            entry[1][2] = this.z + 14 * Math.sin(Angle.toRadians(entry[1][3] - this.rotation));

            if (intersections[0] === undefined) {
                missingHits += 1;
            }
        });

        if ((missingHits === 4 && this.y > -780) || (this.y < -90 && this.y > -780)) {
            this.y -= 5;
        }
    }

    updatePosition(): void {
        this.x += this.velocity * Math.cos(Angle.toRadians(-this.rotation));
        this.z += this.velocity * Math.sin(Angle.toRadians(-this.rotation));

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
