import * as THREE from 'https://jspm.dev/three'
export class Renderer {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: "high-performance"
        })
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.25
        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        )
        this.resize()
        window.addEventListener(
            'resize',
            () => this.resize()
        )
    }
    resize() {
        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        )
    }
    render(scene, camera) {
        this.renderer.render(scene, camera)
    }
}
