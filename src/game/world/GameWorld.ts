import * as THREE from 'three';
import { RendererContext } from '../../rendering/RendererContext';
import { AssetLoader } from '../../engine/assets/AssetLoader';
import { Player } from '../player/Player';
import { Angle } from '../../utils/Angle';

export class GameWorld {
    readonly rendererContext: RendererContext;
    readonly player: Player;
    readonly assetLoader: AssetLoader;

    waterMesh: THREE.Mesh | null = null;
    track: THREE.Object3D | null = null;
    rightRearWheel: THREE.Mesh | null = null;
    rightFrontWheel: THREE.Mesh | null = null;
    leftFrontWheel: THREE.Mesh | null = null;
    leftRearWheel: THREE.Mesh | null = null;
    isReady: boolean = false;

    constructor(rendererContext: RendererContext, player: Player, assetLoader: AssetLoader) {
        this.rendererContext = rendererContext;
        this.player = player;
        this.assetLoader = assetLoader;
    }

    async initialize(): Promise<void> {
        const loadingManager = new THREE.LoadingManager(() => {
            this.onAssetsLoaded();
        });

        const loader = new AssetLoader(loadingManager);

        const [trackModel, carModel, waterTexture] = await Promise.all([
            loader.loadTrackModel(),

            loader.loadCarModel(),
            loader.loadWaterTexture(),
        ]);

        this.track = trackModel;
        this.player.carModel = carModel;

        this.createWater(waterTexture);
        this.configureTrack();
        this.configureCar();
        this.createWheels();
        this.createLights();
    }

    private onAssetsLoaded(): void {
        this.isReady = true;
    }

    private createWater(texture: THREE.Texture): void {
        const geometry = new THREE.BoxGeometry(12552.5, 2.5, 12552.5);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        material.transparent = true;
        material.opacity = 0.0;
        material.map = texture;

        this.waterMesh = new THREE.Mesh(geometry, material);
        this.waterMesh.position.set(0, -650, 0);
        this.rendererContext.scene.add(this.waterMesh);
        this.rendererContext.scene.background = new THREE.Color(0x3fb8ff);
    }

    private configureTrack(): void {
        if (!this.track) {
            return;
        }

        this.rendererContext.scene.add(this.track);
        this.track.position.set(40, -120, -50);
        this.track.scale.set(10, 10, 10);

    }

    private configureCar(): void {
        if (!this.player.carModel) {
            return;
        }

        this.player.carModel.traverse(child => {
            if ((child as any).isMesh) {
                (child as any).material.color.setHex(0xff0000);
            }
        });

        this.rendererContext.scene.add(this.player.carModel);
    }

    private createWheels(): void {
        const geometry = new THREE.CylinderGeometry(2, 2, 0.1, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        this.rightRearWheel = new THREE.Mesh(geometry, material);
        this.rightRearWheel.rotation.x = Angle.toRadians(90);

        this.rightFrontWheel = new THREE.Mesh(geometry, material);
        this.rightFrontWheel.rotation.x = Angle.toRadians(90);

        this.leftFrontWheel = new THREE.Mesh(geometry, material);
        this.leftFrontWheel.rotation.x = Angle.toRadians(90);

        this.leftRearWheel = new THREE.Mesh(geometry, material);
        this.leftRearWheel.rotation.x = Angle.toRadians(90);

        if (this.player.carModel) {
            let meshCount = 0;
            this.player.carModel.traverse(child => { if ((child as any).isMesh) meshCount++; });

            const box = new THREE.Box3().setFromObject(this.player.carModel);

            const size = new THREE.Vector3().subVectors(box.max, box.min);
            const center = new THREE.Vector3().addVectors(box.min, box.max).multiplyScalar(0.5);
            const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
            const debugCube = new THREE.Mesh(geometry, material);
            debugCube.position.copy(center);
            this.player.carModel.add(debugCube);

            const minLocal = box.min.clone();
            const maxLocal = box.max.clone();
            this.player.carModel.worldToLocal(minLocal);
            this.player.carModel.worldToLocal(maxLocal);

            const sizeLocal = new THREE.Vector3().subVectors(maxLocal, minLocal);
            const centerLocal = new THREE.Vector3().addVectors(minLocal, maxLocal)

            const wheelRadius = 2;
            const xInset = 2;
            const zInset = 0;

            const halfLength = sizeLocal.x / 2;

            const frontX = centerLocal.x + halfLength - xInset;
            const rearX = centerLocal.x - halfLength + xInset;
            const rightZ = maxLocal.z - zInset;
            const leftZ = minLocal.z + zInset;
            const wheelY = minLocal.y + wheelRadius;

            this.rightFrontWheel.position.set(frontX, wheelY, rightZ);
            this.leftFrontWheel.position.set(frontX, wheelY, leftZ);
            this.rightRearWheel.position.set(rearX, wheelY, rightZ);
            this.leftRearWheel.position.set(rearX, wheelY, leftZ);

            this.player.carModel.add(this.rightFrontWheel);
            this.player.carModel.add(this.rightRearWheel);
            this.player.carModel.add(this.leftFrontWheel);
            this.player.carModel.add(this.leftRearWheel);
        }
    }

    private createLights(): void {
        const lights: [THREE.Light, [number, number, number]][] = [
            [new THREE.HemisphereLight(0xffffff, 0x000000, 5), [1, 1, 1]],
            [new THREE.PointLight(0xffffff, 220, 1), [1, 13, 1]],
        ];

        lights.forEach(entry => {
            const light = entry[0];
            const [x, y, z] = entry[1];
            light.position.set(x, y, z);
            this.rendererContext.scene.add(light);
        });
    }
}
