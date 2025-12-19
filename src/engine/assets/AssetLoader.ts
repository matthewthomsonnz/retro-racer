import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { levelOneData } from '../../data/levels';
import {CornerSeverity} from "../../data/CornerSeverity.ts";

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
                const trackWidth = levelOneData.track.width;
                const shape = new THREE.Shape();
                shape.moveTo(-trackWidth, 0);
                shape.lineTo(trackWidth, 0);
                shape.lineTo(trackWidth, -2);
                shape.lineTo(trackWidth + 20, -2);
                shape.lineTo(trackWidth + 20, -2);
                shape.lineTo(-trackWidth - 20, -2);
                shape.lineTo(-trackWidth - 20, -2);
                shape.lineTo(-trackWidth, -2);
                shape.lineTo(-trackWidth, 0);

                const path = new THREE.CurvePath<THREE.Vector3>();

                // Starting position and direction
                let currentPos = new THREE.Vector3(-10, 0, 0);
                let currentDirection = new THREE.Vector3(1, 0, 0); // heading in +X direction

                // Helper function to get curve radius based on severity
                function getRadius(severity: string): number {
                    const radiusMap: { [key: string]: number } = {
                        [CornerSeverity.THREE]: 40,
                        // Add other severities here as needed
                    };
                    return radiusMap[severity] || 40;
                }

                // Process each segment
                levelOneData.track.segments.forEach(segment => {
                    if (segment.straight) {
                        // Add straight segment
                        const length = segment.straight;
                        const endPos = currentPos.clone().add(currentDirection.clone().multiplyScalar(length));
                        path.add(new THREE.LineCurve3(currentPos.clone(), endPos));
                        currentPos = endPos;

                    } else if (segment.curve) {
                        const isLeft = !!segment.curve.left;
                        const severity = segment.curve.left || segment.curve.right;
                        const radius = getRadius(severity);

                        // Calculate control point and end point based on current direction
                        let controlPoint: THREE.Vector3;
                        let endPoint: THREE.Vector3;

                        if (currentDirection.x > 0.5) {
                            // Heading in +X direction
                            if (!isLeft) {
                                // Turn left (towards +Z)
                                controlPoint = new THREE.Vector3(currentPos.x + radius, 0, currentPos.z);
                                endPoint = new THREE.Vector3(currentPos.x + radius, 0, currentPos.z + radius);
                                currentDirection.set(0, 0, 1);
                            } else {
                                // Turn right (towards -Z)
                                controlPoint = new THREE.Vector3(currentPos.x + radius, 0, currentPos.z);
                                endPoint = new THREE.Vector3(currentPos.x + radius, 0, currentPos.z - radius);
                                currentDirection.set(0, 0, -1);
                            }
                        } else if (currentDirection.x < -0.5) {
                            // Heading in -X direction
                            if (!isLeft) {
                                // Turn left (towards -Z)
                                controlPoint = new THREE.Vector3(currentPos.x - radius, 0, currentPos.z);
                                endPoint = new THREE.Vector3(currentPos.x - radius, 0, currentPos.z - radius);
                                currentDirection.set(0, 0, -1);
                            } else {
                                // Turn right (towards +Z)
                                controlPoint = new THREE.Vector3(currentPos.x - radius, 0, currentPos.z);
                                endPoint = new THREE.Vector3(currentPos.x - radius, 0, currentPos.z + radius);
                                currentDirection.set(0, 0, 1);
                            }
                        } else if (currentDirection.z > 0.5) {
                            // Heading in +Z direction
                            if (!isLeft) {
                                // Turn left (towards -X)
                                controlPoint = new THREE.Vector3(currentPos.x, 0, currentPos.z + radius);
                                endPoint = new THREE.Vector3(currentPos.x - radius, 0, currentPos.z + radius);
                                currentDirection.set(-1, 0, 0);
                            } else {
                                // Turn right (towards +X)
                                controlPoint = new THREE.Vector3(currentPos.x, 0, currentPos.z + radius);
                                endPoint = new THREE.Vector3(currentPos.x + radius, 0, currentPos.z + radius);
                                currentDirection.set(1, 0, 0);
                            }
                        } else if (currentDirection.z < -0.5) {
                            // Heading in -Z direction
                            if (!isLeft) {
                                // Turn left (towards +X)
                                controlPoint = new THREE.Vector3(currentPos.x, 0, currentPos.z - radius);
                                endPoint = new THREE.Vector3(currentPos.x + radius, 0, currentPos.z - radius);
                                currentDirection.set(1, 0, 0);
                            } else {
                                // Turn right (towards -X)
                                controlPoint = new THREE.Vector3(currentPos.x, 0, currentPos.z - radius);
                                endPoint = new THREE.Vector3(currentPos.x - radius, 0, currentPos.z - radius);
                                currentDirection.set(-1, 0, 0);
                            }
                        }

                        const curve = new THREE.QuadraticBezierCurve3(currentPos.clone(), controlPoint, endPoint);
                        path.add(curve);
                        currentPos = endPoint;
                    }
                });

                const extrudeSettings = {
                    steps: 100,
                    bevelEnabled: false,
                    extrudePath: path
                } as any;

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
