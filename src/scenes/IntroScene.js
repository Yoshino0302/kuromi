import * as THREE from 'https://jspm.dev/three'
import { GalaxyEffect } from '../effects/GalaxyEffect.js'
import { SnowEffect } from '../effects/SnowEffect.js'
import { DustEffect } from '../effects/DustEffect.js'
import { FireworkEffect } from '../effects/FireworkEffect.js'
import { ShockwaveEffect } from '../effects/ShockwaveEffect.js'
export class IntroScene {
    constructor(engine, camera, resourceManager, memoryTracker) {
        this.engine = engine
        this.camera = camera
        this.resourceManager = resourceManager
        this.memoryTracker = memoryTracker
        this.scene = new THREE.Scene()
        this.clock = new THREE.Clock()
        this.elapsedTime = 0
        this.effects = []
        this.initialized = false
    }
    init() {
        if (this.initialized)
            return
        this.initialized = true
        this.setupCamera()
        this.setupLights()
        this.createEffects()
    }
    setupCamera() {
        this.camera.position.set(
            0,
            12,
            45
        )
        this.camera.lookAt(0, 0, 0)
    }
    setupLights() {
        const ambient =
            new THREE.AmbientLight(
                0xff66aa,
                0.8
            )
        this.scene.add(ambient)
        const directional =
            new THREE.DirectionalLight(
                0xff3377,
                1.2
            )
        directional.position.set(
            5,
            10,
            7
        )
        this.scene.add(directional)
    }
    createEffects() {
        this.galaxy =
            new GalaxyEffect(
                this.scene,
                this.resourceManager,
                this.memoryTracker
            )
        this.snow =
            new SnowEffect(
                this.scene,
                this.resourceManager,
                this.memoryTracker
            )
        this.dust =
            new DustEffect(
                this.scene,
                this.resourceManager,
                this.memoryTracker
            )
        this.fireworks =
            new FireworkEffect(
                this.scene,
                this.resourceManager,
                this.memoryTracker
            )
        this.shockwave =
            new ShockwaveEffect(
                this.scene,
                this.resourceManager,
                this.memoryTracker
            )
        this.effects.push(
            this.galaxy,
            this.snow,
            this.dust,
            this.fireworks,
            this.shockwave
        )
        this.effects.forEach(effect =>
            effect.init()
        )
    }
    update(delta) {
        this.elapsedTime += delta
        const time = this.elapsedTime
        this.galaxy.update(time)
        this.snow.update(delta)
        this.dust.update(delta)
        this.fireworks.update(delta)
        this.shockwave.update(delta)
        this.updateCameraMotion(time)
    }
    updateCameraMotion(time) {
        this.camera.position.x =
            Math.sin(time * 0.15) * 6
        this.camera.position.y =
            12 + Math.cos(time * 0.25) * 2
        this.camera.lookAt(0, 0, 0)
    }
    dispose() {
        this.effects.forEach(effect =>
            effect.dispose()
        )
        this.scene.clear()
    }
}
