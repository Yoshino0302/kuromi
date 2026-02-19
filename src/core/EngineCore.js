import * as THREE from 'https://jspm.dev/three'
import { Renderer } from '../renderer/Renderer.js'
import { RenderLoop } from '../renderer/RenderLoop.js'
import { SceneManager } from './SceneManager.js'
import { ResourceManager } from './ResourceManager.js'
import { MemoryTracker } from './MemoryTracker.js'
export class EngineCore {
    constructor(canvas) {
        this.canvas = canvas
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        this.memoryTracker = new MemoryTracker()
        this.resourceManager =
            new ResourceManager(this.memoryTracker)
        this.renderer =
            new Renderer(canvas)
        this.sceneManager =
            new SceneManager()
        this.renderLoop =
            new RenderLoop(
                (delta) => this.update(delta),
                () => this.render()
            )
        this.setupResize()
    }
    setupResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect =
                window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
        })
    }
    setScene(sceneClass) {
        const scene =
            new sceneClass(
                this,
                this.camera,
                this.resourceManager,
                this.memoryTracker
            )
        this.sceneManager.setScene(scene)
    }
    start() {
        this.renderLoop.start()
    }
    stop() {
        this.renderLoop.stop()
    }
    update(delta) {
        this.sceneManager.update(delta)
    }
    render() {
        const scene =
            this.sceneManager.currentScene
        if (!scene) return
        this.renderer.render(
            scene.scene,
            this.camera
        )
    }
    dispose() {
        this.stop()
        this.memoryTracker.disposeAll()
    }
}
