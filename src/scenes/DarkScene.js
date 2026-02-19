import * as THREE from 'https://jspm.dev/three'
import { GalaxyEffect } from '../effects/GalaxyEffect.js'
import { SnowEffect } from '../effects/SnowEffect.js'
import { DustEffect } from '../effects/DustEffect.js'
import { FireworkEffect } from '../effects/FireworkEffect.js'
import { ShockwaveEffect } from '../effects/ShockwaveEffect.js'
export class DarkScene {
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
        this.setupEnvironment()
        this.setupCamera()
        this.setupLights()
        this.createEffects()
    }
    setupEnvironment() {
        this.scene.background =
            new THREE.Color(0x020204)
        this.scene.fog =
            new THREE.FogExp2(
                0x050508,
                0.018
            )
    }
    setupCamera() {
        this.camera.position.set(
            0,
            8,
            28
        )
        this.camera.lookAt(0, 0, 0)
    }
    setupLights() {
        const ambient =
            new THREE.AmbientLight(
                0x220011,
                0.35
            )
        this.scene.add(ambient)
        const directional =
            new THREE.DirectionalLight(
                0xff2255,
                0.7
            )
        directional.position.set(
            -6,
            8,
            4
        )
        this.scene.add(directional)
        const rim =
            new THREE.PointLight(
                0xff0044,
                2.2,
                120,
                2
            )
        rim.position.set(
            0,
            12,
            0
        )
        this.scene.add(rim)
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
        this.galaxy.update(time * 0.6)
        this.snow.update(delta * 0.7)
        this.dust.update(delta)
        this.fireworks.update(delta)
        this.shockwave.update(delta)
        this.updateCamera(time)
        this.updateShockwaveSpawner(time)
    }
    updateCamera(time) {
        const radius = 28
        this.camera.position.x =
            Math.sin(time * 0.12) * radius
        this.camera.position.z =
            Math.cos(time * 0.12) * radius
        this.camera.position.y =
            8 + Math.sin(time * 0.3) * 2
        this.camera.lookAt(0, 4, 0)
    }
    updateShockwaveSpawner(time) {
        if ((time % 6) < 0.02) {
            const pos =
                new THREE.Vector3(
                    (Math.random() - 0.5) * 30,
                    0.2,
                    (Math.random() - 0.5) * 30
                )
            this.shockwave.spawn(pos)
        }
    }
    dispose() {
        this.effects.forEach(effect =>
            effect.dispose()
        )
        this.scene.clear()
    }
}
