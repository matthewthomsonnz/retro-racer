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
                shape.lineTo(trackWidth + 20, -4);
                shape.lineTo(trackWidth - 20, -4);
                shape.lineTo(-trackWidth - 20, -2);
                shape.lineTo(-trackWidth, -2);
                shape.lineTo(-trackWidth, 0);

                const path = new THREE.CurvePath<THREE.Vector3>();

                // Starting position and heading (0 radians = +X direction)
                let currentPos = new THREE.Vector3(-10, 0, 0);
                let currentHeading = 0;
                let currentHeight = 0;

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
                    currentHeight += segment.height || 0;

                    if (segment.straight) {
                        const length = segment.straight;
                        // Project forward based on current heading
                        const endPos = new THREE.Vector3(
                            currentPos.x + Math.cos(currentHeading) * length,
                            currentHeight,
                            currentPos.z + Math.sin(currentHeading) * length
                        );

                        path.add(new THREE.LineCurve3(currentPos.clone(), endPos));
                        currentPos = endPos;

                    } else if (segment.curve) {
                        const isLeft = !!segment.curve.left;
                        const severity = ((segment.curve as any).left || (segment.curve as any).right) as string;
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
                            currentHeight,
                            currentPos.z + Math.sin(currentHeading) * radius
                        );

                        const endPoint = new THREE.Vector3(
                            controlPoint.x + Math.cos(nextHeading) * radius,
                            currentHeight,
                            controlPoint.z + Math.sin(nextHeading) * radius
                        );

                        path.add(new THREE.QuadraticBezierCurve3(currentPos.clone(), controlPoint, endPoint));

                        currentPos = endPoint;
                        currentHeading = nextHeading;
                    }
                });

                const segments = levelOneData.track.segments;
                const steps = 200;

                const vertices: number[] = [];
                const indices: number[] = [];
                const uvs: number[] = [];

                const curveLengths = path.getCurveLengths();
                const totalLength = curveLengths[curveLengths.length - 1];
                const segmentEndTs = curveLengths.map(l => l / totalLength);

                const frames = path.computeFrenetFrames(steps, false);

                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const pos = path.getPoint(t);
                    const normal = frames.normals[i];
                    const binormal = frames.binormals[i];

                    let segmentIndex = segmentEndTs.findIndex(endT => t <= endT);
                    if (segmentIndex === -1) {
                        segmentIndex = segments.length - 1;
                    }

                    const bankAngle = (segments[segmentIndex].bankAngle || 0) * Math.PI / 180;

                    const rotatedNormal = normal.clone().multiplyScalar(Math.cos(bankAngle))
                        .add(binormal.clone().multiplyScalar(Math.sin(bankAngle)));
                    const rotatedBinormal = binormal.clone().multiplyScalar(Math.cos(bankAngle))
                        .sub(normal.clone().multiplyScalar(Math.sin(bankAngle)));

                    // Extrude shape points at this position
                    const shapePoints = shape.getPoints();
                    shapePoints.forEach((pt, j) => {
                        const vertex = pos.clone()
                            .add(rotatedNormal.clone().multiplyScalar(pt.x))
                            .add(rotatedBinormal.clone().multiplyScalar(pt.y));
                        vertices.push(vertex.x, vertex.y, vertex.z);
                        uvs.push(j / shapePoints.length, t);
                    });
                }

// Build faces
                const pointsPerStep = shape.getPoints().length;
                for (let i = 0; i < steps; i++) {
                    for (let j = 0; j < pointsPerStep - 1; j++) {
                        const a = i * pointsPerStep + j;
                        const b = a + pointsPerStep;
                        const c = a + 1;
                        const d = b + 1;

                        indices.push(a, b, c);
                        indices.push(b, d, c);
                    }
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geometry.setIndex(indices);
                geometry.computeVertexNormals();
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
        const url = '/src/assets/textures/road.ktx2';
        return new Promise((resolve, reject) => {
            this.basisLoader.load(url, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(90.5, 910.5);
                resolve(texture);
            }, undefined, reject);
        });
    }
}
