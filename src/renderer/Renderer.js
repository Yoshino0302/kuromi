import * as THREE from 'https://jspm.dev/three'
export class Renderer {
    constructor(canvas) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error(
                'Renderer: invalid canvas element'
            )
        }
        this.canvas = canvas
        this.renderer =
            new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
                preserveDrawingBuffer: false
            })
        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace
        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.25
        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        )
        this.renderer.setClearColor(
            0x000000,
            0
        )
        this.resize()
        this.handleResize =
            () => this.resize()
        window.addEventListener(
            'resize',
            this.handleResize
        )
    }
    resize() {
        const width =
            window.innerWidth
        const height =
            window.innerHeight
        this.renderer.setSize(
            width,
            height,
            false
        )
    }
    render(scene, camera) {
        if (!scene || !camera) return
        this.renderer.render(
            scene,
            camera
        )
    }
    dispose() {
        window.removeEventListener(
            'resize',
            this.handleResize
        )
        this.renderer.dispose()
    }
}
