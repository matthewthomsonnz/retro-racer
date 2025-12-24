import * as THREE from 'three';
import { Angle } from '../../utils/Angle';

const STEERING_SCALE = 5.0;
const GROUNDING_LERP = 1;
const GROUND_NORMAL_EASE = 0.08;

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
    groundPitch: number;
    groundRoll: number;
    groundNormal: THREE.Vector3;

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
        this.groundPitch = 0;
        this.groundRoll = 0;
        this.groundNormal = new THREE.Vector3(0, 1, 0);
    }

    updateGrounding(track: THREE.Object3D | null): void {
        if (!track) {
            return;
        }

        const hitPoints: Partial<Record<keyof PlayerRayPositions, THREE.Vector3>> = {};

        Object.entries(this.rayPositions).forEach(entry => {
            const key = entry[0] as keyof PlayerRayPositions;

            entry[1][0] = this.x + 14 * Math.cos(Angle.toRadians(entry[1][3] - this.rotation));
            entry[1][2] = this.z + 14 * Math.sin(Angle.toRadians(entry[1][3] - this.rotation));

            const ray = new THREE.Raycaster();
            ray.ray.origin.set(entry[1][0], entry[1][1] + 1110, entry[1][2]);
            ray.ray.direction.set(0, -1, 0);
            const intersections = ray.intersectObject(track, true);

            if (intersections[0] !== undefined) {
                hitPoints[key] = intersections[0].point.clone();
            }
        });

        const points = Object.values(hitPoints).filter((v): v is THREE.Vector3 => v !== undefined);
        if (points.length > 0) {
            const targetY = Math.max(...points.map(p => p.y));
            const nextY = this.y + (targetY - this.y) * GROUNDING_LERP;
            this.y = Math.max(nextY, targetY);
            this.velocityY = 0;
        }

        const fl = hitPoints.frontL;
        const fr = hitPoints.frontR;
        const rl = hitPoints.rearL;
        const rr = hitPoints.rearR;

        if (fl && fr && rl && rr) {
            const leftMid = fl.clone().add(rl).multiplyScalar(0.5);
            const rightMid = fr.clone().add(rr).multiplyScalar(0.5);
            const frontMid = fl.clone().add(fr).multiplyScalar(0.5);
            const rearMid = rl.clone().add(rr).multiplyScalar(0.5);

            const lateral = rightMid.clone().sub(leftMid);
            const longitudinal = frontMid.clone().sub(rearMid);

            if (lateral.lengthSq() > 1e-6 && longitudinal.lengthSq() > 1e-6) {
                const normal = new THREE.Vector3().crossVectors(longitudinal, lateral).normalize();
                if (normal.y < 0) {
                    normal.multiplyScalar(-1);
                }

                this.groundNormal.lerp(normal, GROUND_NORMAL_EASE).normalize();

                const yawRad = Angle.toRadians(this.rotation);
                const cosY = Math.cos(yawRad);
                const sinY = Math.sin(yawRad);

                const forwardDir = new THREE.Vector3(cosY, 0, -sinY);
                const rightDir = new THREE.Vector3(-sinY, 0, -cosY);

                const pitchComponent = this.groundNormal.dot(forwardDir);
                const rollComponent = this.groundNormal.dot(rightDir);

                this.groundPitch = -Math.atan2(pitchComponent, this.groundNormal.y);
                this.groundRoll = Math.atan2(rollComponent, this.groundNormal.y);
            }
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
