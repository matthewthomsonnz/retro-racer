import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { levelOneData } from '../../data/levels';
import { CornerSeverity } from '../../data/CornerSeverity.ts';

export class AssetLoader {
    private readonly textureLoader: THREE.TextureLoader;
    private readonly objectLoader: any;
    private readonly basisLoader: KTX2Loader;

    constructor(renderer: THREE.WebGLRenderer, manager?: THREE.LoadingManager) {
        const loadingManager = manager ?? new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(loadingManager);
        this.objectLoader = new OBJLoader(loadingManager);
        this.basisLoader = new KTX2Loader(loadingManager);
        this.basisLoader.setTranscoderPath('/node_modules/three/examples/js/libs/basis/');
        console.log(renderer)
        this.basisLoader.detectSupport(renderer);
    }

    loadCarModel(): Promise<THREE.Object3D> {
        const url = '/src/assets/models/car.obj';
        return new Promise((resolve, reject) => {
            this.objectLoader.load(url, resolve, undefined, reject);
        });
    }

    loadTrackModel(roadTexture?: THREE.Texture): Promise<THREE.Object3D> {
        return new Promise((resolve) => {
            resolve(createProceduralTrack(roadTexture));

            function createProceduralTrack(roadTexture?: THREE.Texture): THREE.Object3D {
                const trackWidth = levelOneData.track.width;
                const shape = new THREE.Shape();
                shape.moveTo(-trackWidth, 0);
                shape.lineTo(trackWidth, 0);
                shape.lineTo(trackWidth, -2);
                shape.lineTo(trackWidth + 20, -2);
                shape.lineTo(-trackWidth - 20, -2);
                shape.lineTo(-trackWidth, -2);
                shape.lineTo(-trackWidth, 0);

                const path = new THREE.CurvePath<THREE.Vector3>();

                // Starting position and heading (0 radians = +X direction)
                let currentPos = new THREE.Vector3(-10, 0, 0);
                let currentHeading = 0;

                // Helper to get angle from our new object enum
                function getAngle(severityValue: string): number {
                    for (const corner of Object.values(CornerSeverity)) {
                        if (corner.value === severityValue) {
                            return (corner.degrees * Math.PI) / 180;
                        }
                    }
                    return Math.PI / 2; // Default 90 deg
                }

                levelOneData.track.segments.forEach(segment => {
                    if (segment.straight) {
                        const length = segment.straight;
                        // Project forward based on current heading
                        const endPos = new THREE.Vector3(
                            currentPos.x + Math.cos(currentHeading) * length,
                            0,
                            currentPos.z + Math.sin(currentHeading) * length
                        );

                        path.add(new THREE.LineCurve3(currentPos.clone(), endPos));
                        currentPos = endPos;

                    } else if (segment.curve) {
                        const isLeft = !!segment.curve.left;
                        const severity = (segment.curve.left || segment.curve.right) as string;
                        const turnAngle = getAngle(severity);

                        // Radius will be handled properly in the future as per your plan
                        const radius = 40;

                        // Determine the new heading
                        // In Three.js/Math, positive rotation is counter-clockwise.
                        const nextHeading = isLeft ? currentHeading - turnAngle : currentHeading + turnAngle;

                        /**
                         * To create a smooth arc using a Quadratic Bezier:
                         * The control point is the intersection of the current heading
                         * and the next heading.
                         */
                        const controlPoint = new THREE.Vector3(
                            currentPos.x + Math.cos(currentHeading) * radius,
                            0,
                            currentPos.z + Math.sin(currentHeading) * radius
                        );

                        const endPoint = new THREE.Vector3(
                            controlPoint.x + Math.cos(nextHeading) * radius,
                            0,
                            controlPoint.z + Math.sin(nextHeading) * radius
                        );

                        path.add(new THREE.QuadraticBezierCurve3(currentPos.clone(), controlPoint, endPoint));

                        currentPos = endPoint;
                        currentHeading = nextHeading;
                    }
                });

                const extrudeSettings = {
                    steps: 200, // Increased steps for smoother non-90 deg curves
                    bevelEnabled: false,
                    extrudePath: path
                };

                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const material = new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide
                });
                if (roadTexture) {
                    material.map = roadTexture;
                }

                return new THREE.Mesh(geometry, material);
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

    loadRoadTexture(): Promise<THREE.Texture> {
        const url = '/src/assets/textures/desertTile.ktx2';
        return new Promise((resolve, reject) => {
            this.basisLoader.load(url, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(0.5, 0.5);
                resolve(texture);
            }, undefined, reject);
        });
    }
}
