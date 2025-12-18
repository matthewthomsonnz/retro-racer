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

        const addStraight = (length: number) => {
            const next = currentPoint.clone().add(new THREE.Vector3(length, 0, 0));
            path.add(new THREE.LineCurve3(currentPoint.clone(), next.clone()));
            currentPoint = next;
        };

        const addRightCurve = (radius: number) => {
            const curveStart = currentPoint.clone();
            const curveRadius = radius;
            const scale = curveRadius / 17; // preserve proportions used originally
            const xOffset = 22 * scale;
            const cpZ = 22 * scale;
            const cp1x = 3 * scale;
            const cp2x = 3 * 0.45 * scale;
            const curveEnd = currentPoint.clone().add(new THREE.Vector3(xOffset, 0, curveRadius));
            const cp1 = currentPoint.clone().add(new THREE.Vector3(cp1x, 0, cpZ));
            const cp2 = currentPoint.clone().add(new THREE.Vector3(cp2x, 0, cpZ));
            path.add(new THREE.CubicBezierCurve3(curveStart, cp1, cp2, curveEnd));
            currentPoint = curveEnd;
        };

        const addLeftCurve = (radius: number) => {
            const curveStart = currentPoint.clone();
            const curveRadius = radius;
            const scale = curveRadius / 17;
            const xOffset = 22 * scale;
            const cpZ = 22 * scale;
            const cp1x = 3 * scale;
            const cp2x = 3 * 0.45 * scale;
            const curveEnd = currentPoint.clone().add(new THREE.Vector3(xOffset, 0, -curveRadius));
            const cp1 = currentPoint.clone().add(new THREE.Vector3(cp1x, 0, -cpZ));
            const cp2 = currentPoint.clone().add(new THREE.Vector3(cp2x, 0, -cpZ));
            path.add(new THREE.CubicBezierCurve3(curveStart, cp1, cp2, curveEnd));
            currentPoint = curveEnd;
        };

        const segments = levelOneData.track.segments ?? [];



        for (const seg of segments) {
            if (seg.straight) {
                addStraight(Number(seg.straight));
            } else if (seg.curve) {
                const curveAmount = Number(seg.curve.left ?? seg.curve.right ?? 0);
                if (seg.curve.right !== undefined) {
                    addRightCurve(curveAmount * 4);
                } else if (seg.curve.left !== undefined) {
                    addLeftCurve(curveAmount * 4);
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
