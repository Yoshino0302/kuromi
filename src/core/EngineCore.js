import * as THREE from 'https://jspm.dev/three'
import { Renderer } from '../renderer/Renderer.js'
import { SceneManager } from '../scenes/SceneManager.js'
import { ResourceManager } from '../systems/ResourceManager.js'
import { GPUResourceTracker } from '../systems/GPUResourceTracker.js'
import { MemoryTracker } from '../systems/MemoryTracker.js'
import { UpdateScheduler } from '../systems/UpdateScheduler.js'
import { Clock } from '../utils/Clock.js'
import { Logger } from '../utils/Logger.js'
export class EngineCore
{
    constructor(config = {})
    {
        this.config = config
        this.initialized = false
        this.running = false
        this.destroyed = false
        this.renderer = null
        this.sceneManager = null
        this.resourceManager = null
        this.gpuTracker = null
        this.memoryTracker = null
        this.scheduler = null
        this.clock = new Clock()
        this._boundLoop = this._loop.bind(this)
        Logger.info('EngineCore constructed')
    }
    async init()
    {
        if (this.initialized)
        {
            Logger.warn('Engine already initialized')
            return
        }
        Logger.info('Engine initialization started')
        this._initSystems()
        this._initRenderer()
        this._initSceneManager()
        this.initialized = true
        Logger.info('Engine initialization completed')
    }
    _initSystems()
    {
        this.memoryTracker = new MemoryTracker()
        this.gpuTracker = new GPUResourceTracker()
        this.resourceManager = new ResourceManager({
            gpuTracker: this.gpuTracker,
            memoryTracker: this.memoryTracker
        })
        this.scheduler = new UpdateScheduler()
        Logger.info('Systems initialized')
    }
    _initRenderer()
    {
        this.renderer = new Renderer({
            canvas: this.config.canvas,
            gpuTracker: this.gpuTracker
        })
        Logger.info('Renderer initialized')
    }
    _initSceneManager()
    {
        this.sceneManager = new SceneManager({
            renderer: this.renderer,
            resourceManager: this.resourceManager,
            gpuTracker: this.gpuTracker,
            memoryTracker: this.memoryTracker
        })
        Logger.info('SceneManager initialized')
    }
    start()
    {
        if (!this.initialized)
        {
            throw new Error('Engine must be initialized before start')
        }
        if (this.running)
        {
            Logger.warn('Engine already running')
            return
        }
        this.running = true
        this.clock.start()
        requestAnimationFrame(this._boundLoop)
        Logger.info('Engine started')
    }
    stop()
    {
        this.running = false
        Logger.info('Engine stopped')
    }
    async destroy()
    {
        if (this.destroyed)
        {
            return
        }
        this.stop()
        await this.sceneManager.destroy()
        this.resourceManager.destroy()
        this.renderer.destroy()
        this.gpuTracker.destroy()
        this.memoryTracker.destroy()
        this.scheduler.destroy()
        this.destroyed = true
        Logger.info('Engine destroyed')
    }
    _loop()
    {
        if (!this.running)
        {
            return
        }
        const delta = this.clock.getDelta()
        this.scheduler.update(delta)
        this.sceneManager.update(delta)
        this.renderer.render(this.sceneManager.getActiveScene())
        requestAnimationFrame(this._boundLoop)
    }
    async loadScene(sceneClass)
    {
        return this.sceneManager.loadScene(sceneClass)
    }
    getRenderer()
    {
        return this.renderer
    }
    getSceneManager()
    {
        return this.sceneManager
    }
    getResourceManager()
    {
        return this.resourceManager
    }
    getGPUTracker()
    {
        return this.gpuTracker
    }
    getMemoryTracker()
    {
        return this.memoryTracker
    }
}
