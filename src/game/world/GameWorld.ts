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
    rearWheel: THREE.Mesh | null = null;
    frontWheel: THREE.Mesh | null = null;
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
        this.track.position.set(0, 0, 0);
        this.track.scale.set(10, 10, 30);

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
        const geometry = new THREE.CylinderGeometry(2, 2, 15, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        this.rearWheel = new THREE.Mesh(geometry, material);
        this.rearWheel.rotation.x = Angle.toRadians(90);
        this.rearWheel.position.set(-9, 1.5, 0.3);

        this.frontWheel = new THREE.Mesh(geometry, material);
        this.frontWheel.rotation.x = Angle.toRadians(90);
        this.frontWheel.position.set(7, 1.5, 0.3);

        if (this.player.carModel) {
            this.player.carModel.add(this.frontWheel);
            this.player.carModel.add(this.rearWheel);
        }
    }

    private createLights(): void {
        const lights: [THREE.Light, [number, number, number]][] = [
            [new THREE.PointLight(0xffffff, 5, 5155), [0, 0, 0]],
            [new THREE.PointLight(0xffffff, 5, 6155), [0, 0, 0]],
            [new THREE.HemisphereLight(0xfff0f0, 0x606066, 2.2), [1, 1, 1]],
        ];

        lights.forEach(entry => {
            const light = entry[0];
            const [x, y, z] = entry[1];
            light.position.set(x, y, z);
            this.rendererContext.scene.add(light);
        });
    }
}

