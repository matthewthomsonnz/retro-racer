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
        return new Promise((resolve) => {

            resolve(createProceduralTrack())

            function createProceduralTrack(): THREE.Object3D {
                const trackWidth = 6;
                const shape = new THREE.Shape();
                shape.moveTo(-trackWidth, 0);
                shape.lineTo(trackWidth, 0);
                shape.lineTo(trackWidth, -2);
                shape.lineTo(trackWidth + 2, -2);
                shape.lineTo(trackWidth + 2, -3);
                shape.lineTo(-trackWidth - 2, -3);
                shape.lineTo(-trackWidth - 2, -2);
                shape.lineTo(-trackWidth, -2);
                shape.lineTo(-trackWidth, 0);

                const startPoint = new THREE.Vector3(-10, 0, 0);
                const path = new THREE.CurvePath<THREE.Vector3>();
                const straightEnd = new THREE.Vector3(30, 0, 0);
                path.add(new THREE.LineCurve3(startPoint, straightEnd));

                const curveStart = straightEnd;
                const curveEnd = new THREE.Vector3(30, 0, 40);
                const curveControl = new THREE.Vector3(70, 0, 0);
                const curve = new THREE.QuadraticBezierCurve3(curveStart, curveControl, curveEnd);
                path.add(curve);

                const tangentDirection = new THREE.Vector3(-40, 0, 40).normalize();
                const straightStart = curveEnd;
                const straightEnd2 = straightStart.clone().add(tangentDirection.clone().multiplyScalar(50));
                const straight2 = new THREE.LineCurve3(straightStart, straightEnd2);
                path.add(straight2);

                const curveStart2 = straightEnd2;
                const curveEnd2 = new THREE.Vector3(30, 0, 130);
                const curveControl2 = new THREE.Vector3(-30, 0, 100);
                const curve2 = new THREE.QuadraticBezierCurve3(curveStart2, curveControl2, curveEnd2);
                path.add(curve2);


                // const leftCurveStart = straightEnd2;
                // const leftCurveDirection = tangentDirection.clone();
                // const leftCurveEnd = leftCurveStart.clone().add(new THREE.Vector3(-40, 0, 20));
                // const leftCurveControl = leftCurveStart.clone().add(leftCurveDirection.multiplyScalar(40)).add(new THREE.Vector3(-40, 0, 0));
                // const leftCurve = new THREE.QuadraticBezierCurve3(leftCurveStart, leftCurveControl, leftCurveEnd);
                // path.add(leftCurve);

                const extrudeSettings = {
                    steps: 100,
                    bevelEnabled: false,
                    extrudePath: path
                } as any;

                console.log('Creating ExtrudeGeometry with:', { shape, extrudeSettings });
                console.log('THREE.ExtrudeGeometry available:', typeof THREE.ExtrudeGeometry);
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

                const material = new THREE.MeshStandardMaterial({
                    color: 0x555555,
                    side: THREE.DoubleSide
                });
                const mesh = new THREE.Mesh(geometry, material);
                return mesh;
            }
        });
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
