import * as THREE from 'https://jspm.dev/three'
import { EngineCore } from '../core/EngineCore.js'
import { SceneManager } from '../core/SceneManager.js'
import { ResourceManager } from '../core/ResourceManager.js'
import { MemoryTracker } from '../core/MemoryTracker.js'
import { IntroScene } from '../scenes/IntroScene.js'
import { DarkScene } from '../scenes/DarkScene.js'
class MainEngine {
    constructor() {
        this.canvas = null
        this.renderer = null
        this.camera = null
        this.engineCore = null
        this.sceneManager = null
        this.resourceManager = null
        this.memoryTracker = null
        this.introScene = null
        this.darkScene = null
        this.clock = new THREE.Clock()
        this.running = false
        this.initialized = false
        this.delta = 0
        this.maxDelta = 0.033
        this.boundLoop = this.loop.bind(this)
        this.boundResize = this.onResize.bind(this)
        this.boundVisibility = this.onVisibilityChange.bind(this)
    }
    init() {
        if (this.initialized)
            return
        this.initialized = true
        try {
            this.resolveCanvas()
            this.initRenderer()
            this.initManagers()
            this.initScenes()
            this.initEvents()
            this.start()
        }
        catch (e) {
            console.error('ENGINE INIT FAILED:', e)
        }
    }
    resolveCanvas() {
        this.canvas =
            document.getElementById('bg')
        if (!this.canvas)
            throw new Error('Canvas #bg not found')
    }
    initRenderer() {
        this.renderer =
            new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: false,
                depth: true,
                stencil: false,
                powerPreference: 'high-performance'
            })
        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace
        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure =
            1.0
        this.renderer.shadowMap.enabled = false
        this.renderer.info.autoReset = true
        this.renderer.sortObjects = true
        this.camera =
            new THREE.PerspectiveCamera(
                60,
                window.innerWidth / window.innerHeight,
                0.1,
                2000
            )
        this.onResize()
    }
    initManagers() {
        this.engineCore =
            new EngineCore(
                this.renderer,
                this.camera
            )
        this.resourceManager =
            new ResourceManager()
        this.memoryTracker =
            new MemoryTracker()
        this.sceneManager =
            new SceneManager(
                this.engineCore,
                this.camera
            )
    }
    initScenes() {
        this.introScene =
            new IntroScene(
                this.engineCore,
                this.camera,
                this.resourceManager,
                this.memoryTracker
            )
        this.darkScene =
            new DarkScene(
                this.engineCore,
                this.camera,
                this.resourceManager,
                this.memoryTracker
            )
        this.introScene.init()
        this.darkScene.init()
        this.sceneManager.setScene(
            this.introScene
        )
        const enterBtn =
            document.getElementById('enterBtn')
        if (enterBtn) {
            enterBtn.addEventListener(
                'click',
                () => this.switchToDarkScene()
            )
        }
    }
    switchToDarkScene() {
        try {
            const overlay =
                document.querySelector('.overlay')
            if (overlay)
                overlay.style.display = 'none'
            this.sceneManager.setScene(
                this.darkScene
            )
        }
        catch (e) {
            console.error('Scene switch failed:', e)
        }
    }
    initEvents() {
        window.addEventListener(
            'resize',
            this.boundResize
        )
        document.addEventListener(
            'visibilitychange',
            this.boundVisibility
        )
    }
    onResize() {
        const width = window.innerWidth
        const height = window.innerHeight
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(
            width,
            height,
            false
        )
        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        )
    }
    onVisibilityChange() {
        if (document.hidden)
            this.pause()
        else
            this.resume()
    }
    start() {
        if (this.running)
            return
        this.running = true
        this.clock.start()
        requestAnimationFrame(
            this.boundLoop
        )
    }
    pause() {
        this.running = false
    }
    resume() {
        if (!this.running) {
            this.running = true
            this.clock.getDelta()
            requestAnimationFrame(
                this.boundLoop
            )
        }
    }
    loop() {
        if (!this.running)
            return
        requestAnimationFrame(
            this.boundLoop
        )
        this.delta =
            this.clock.getDelta()
        if (this.delta > this.maxDelta)
            this.delta = this.maxDelta
        try {
            this.sceneManager.update(
                this.delta
            )
            const current =
                this.sceneManager.getCurrentScene()
            if (current && current.scene) {
                this.renderer.render(
                    current.scene,
                    this.camera
                )
            }
        }
        catch (e) {
            console.error('FRAME ERROR:', e)
            this.pause()
        }
    }
    shutdown() {
        this.pause()
        window.removeEventListener(
            'resize',
            this.boundResize
        )
        document.removeEventListener(
            'visibilitychange',
            this.boundVisibility
        )
        if (this.sceneManager)
            this.sceneManager.dispose()
        if (this.memoryTracker)
            this.memoryTracker.dispose()
        if (this.renderer)
            this.renderer.dispose()
    }
}
const ENGINE = new MainEngine()
ENGINE.init()
window.ENGINE = ENGINE
