import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

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
        const trackWidth = 6;

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

        const startPoint = new THREE.Vector3(0, 0, 0);
        const path = new THREE.CurvePath<THREE.Vector3>();
        const straightEnd = new THREE.Vector3(10, 0, 0);
        path.add(new THREE.LineCurve3(startPoint, straightEnd));

        const curveRadius = 17;
        const curveStart = straightEnd.clone();
        const curveEnd = new THREE.Vector3(22, 0, curveRadius);

        const cp1 = new THREE.Vector3(3, 0, 22 );
        const cp2 = new THREE.Vector3(3 * 0.45, 0, 22);

        path.add(new THREE.CubicBezierCurve3(
            curveStart,
            cp1,
            cp2,
            curveEnd
        ));
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
