import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { levelOneData } from '../../data/levels';

export class AssetLoader {
    private readonly textureLoader: THREE.TextureLoader;
    private readonly objectLoader: any;

    constructor(manager?: THREE.LoadingManager) {
        const loadingManager = manager ?? new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(loadingManager);
        this.objectLoader = new OBJLoader(loadingManager);
    }

    loadCarModel(): Promise<THREE.Object3D> {
        const url = '/src/assets/models/car.obj';
        return new Promise((resolve, reject) => {
            this.objectLoader.load(url, resolve, undefined, reject);
        });
    }

    loadTrackModel(): Promise<THREE.Object3D> {
        const trackWidth = levelOneData.track.width ?? 6;

        const shape = new THREE.Shape();
        shape.moveTo(-trackWidth, 0);
        shape.lineTo(trackWidth, 0, );
        shape.lineTo(trackWidth, -2, );
        shape.lineTo(trackWidth+2, -2, );
        shape.lineTo(trackWidth+2, -3, );
        shape.lineTo(-trackWidth-2, -3, );
        shape.lineTo(-trackWidth-2, -2, );
        shape.lineTo(-trackWidth, -2, );
        shape.lineTo(-trackWidth, 0, );

        const path = new THREE.CurvePath<THREE.Vector3>();
        let currentPoint = new THREE.Vector3(0, 0, 0);
        let currentDir = new THREE.Vector3(1, 0, 0); // forward direction

        const addStraight = (length: number) => {
            const next = currentPoint.clone().add(currentDir.clone().multiplyScalar(length));
            path.add(new THREE.LineCurve3(currentPoint.clone(), next.clone()));
            currentPoint = next;
        };

        const addCurve = (amount: number, turnRight: boolean) => {
            const baseAngle = Math.PI / 2; // amount 4 -> 90deg
            const angle = (amount / 4) * baseAngle * (turnRight ? -1 : 1);
            const endDir = currentDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();

            const radiusBase = 17; // base radius used in original code
            const radius = (amount / 4) * radiusBase;

            const perpRight = new THREE.Vector3(-currentDir.z, 0, currentDir.x).normalize();
            const sideSign = -Math.sign(angle); // choose perp direction so positive for right-turn

            const curveEnd = currentPoint.clone()
                .add(currentDir.clone().multiplyScalar(radius))
                .add(perpRight.clone().multiplyScalar(sideSign * radius));

            const cpLen = radius * 0.3;
            const cpSide = radius * 0.6 * sideSign;

            const cp1 = currentPoint.clone()
                .add(currentDir.clone().multiplyScalar(cpLen))
                .add(perpRight.clone().multiplyScalar(cpSide));

            const cp2 = curveEnd.clone()
                .sub(endDir.clone().multiplyScalar(cpLen))
                .add(perpRight.clone().multiplyScalar(cpSide));

            path.add(new THREE.CubicBezierCurve3(currentPoint.clone(), cp1, cp2, curveEnd.clone()));

            currentPoint = curveEnd;
            currentDir = endDir;
        };

        const segments = levelOneData.track.segments ?? [];

        if (segments.length > 0 && segments[0].curve && !segments[0].straight) {
            addStraight(10);
        }

        for (const seg of segments) {
            const s: any = seg;
            if (s.straight) {
                addStraight(Number(s.straight));
            } else if (s.curve) {
                const curve: any = s.curve;
                const curveAmount = Number(curve.left ?? curve.right ?? 0);
                if (curve.right !== undefined) {
                    addCurve(curveAmount, true);
                } else if (curve.left !== undefined) {
                    addCurve(curveAmount, false);
                } else {
                    addStraight(10);
                }
            } else {
                addStraight(10);
            }
        }

        const extrudeSettings = {
            steps: 100,
            bevelEnabled: false,
            extrudePath: path
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const material = new THREE.MeshStandardMaterial({
            color: 0x555555,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        return Promise.resolve(mesh);
    }

    loadWaterTexture(): Promise<THREE.Texture> {
        const url = '/src/assets/textures/water.jpg';
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                texture => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.offset.set(0, 0);
                    texture.repeat.set(16, 16);
                    resolve(texture);
                },
                undefined,
                reject,
            );
        });
    }
}
