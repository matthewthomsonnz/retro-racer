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
const basisString = 'sB\\00M\\00h\n' +
    '\\00\\00\\39\\C1\\05\\00\\00\\01\\00\\00\\00\\01\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\07\\00\\C0\\00\\00\\00\\2F\\00\\00\\0C\\00\\EF\\00\\00\\00\\31\\00\\00\\20\\01\\00\\00\\37\\00\\00\\00\\4D\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\00\\10\\00\\10\\00\\04\\00\\04\\00\\57\n' +
    '\\01\\00\\00\\0B\\00\\00\\00\\E6\\D0\\00\\00\\00\\01\\00\\08\\00\\08\\00\\02\\00\\02\\00\\62\\01\\00\\00\\04\\00\\00\\00\\BF\\83\\00\\00\\00\\02\\00\\04\\00\\04\\00\\01\\00\\01\\00\\66\\01\\00\\00\\02\\00\\00\\00\\F1\\A7\\00\\00\\00\\03\\00\\02\\00\\02\\00\\01\\00\\01\\00\\68\\01\\00\\00\\01\\00\\00\\00\\4B\\A2\\00\\00\n' +
    '\\00\\04\\00\\01\\00\\01\\00\\01\\00\\01\\00\\69\\01\\00\\00\\01\\00\\00\\00\\4B\\A2\\01\\C0\\04\\00\\00\\00\\00\\00\\00\\02\\04\\88\\1B\\20\\00\\00\\00\\00\\29\\A3\\23\\F8\\00\\A6\\04\\00\\00\\00\\00\\00\\90\\1F\\02\\04\\20\\02\\80\\00\\00\\00\\20\\44\\9F\\64\\2D\\C6\\6B\\B4\\B2\\AA\\AA\\AA\\B2\\BA\\BA\\AA\\AA\\AC\\AE\n' +
    '\\AE\\AC\\AC\\AA\\A2\\E0\\E1\\01\\00\\00\\00\\10\\00\\00\\00\\00\\04\\04\\04\\04\\04\\06\\06\\06\\1E\\18\\18\\10\\18\\18\\18\\18\\50\\55\\55\\55\\05\\00\\41\\5C\\00\\00\\00\\00\\40\\D8\\15\\46\\14\\69\\E4\\FF\\0E\\65\\07\\40\\04\\00\\01\\00\\00\\20\\90\\C9\\4D\\C0\\DB\\40\\02\\00\\88\\80\\73\\0F\\60\\31\\02\\A1\\12\\94\n' +
    '\\22\\00\\98\\00\\00\\00\\00\\00\\00\\40\\00\\01\\04\\DC\\1F\\2B\\FB\\39\\EA\\BC\\90\\69\\03\\DB,~\n'
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
