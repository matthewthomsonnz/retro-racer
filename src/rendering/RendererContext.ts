import * as THREE from 'three';

export class RendererContext {
    readonly scene: THREE.Scene;
    readonly camera: THREE.PerspectiveCamera;
    readonly renderer: THREE.WebGLRenderer;

    constructor() {
        this.scene = new THREE.Scene();
        window.axesHelper = new THREE.AxesHelper( 45 ).setColors( new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff) );
        this.scene.add( axesHelper );
        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }
}

