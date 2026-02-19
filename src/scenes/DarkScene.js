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
        this.elapsedTime = 0
        this.effects = []
        this.initialized = false
        this.tempVec = new THREE.Vector3()
    }
    init() {
        if (this.initialized) return
        this.initialized = true
        this.scene.background =
            new THREE.Color(0x020204)
        this.scene.fog =
            new THREE.FogExp2(0x050508, 0.018)
        this.camera.position.set(0, 8, 28)
        const ambient =
            new THREE.AmbientLight(0x220011, 0.35)
        const directional =
            new THREE.DirectionalLight(0xff2255, 0.7)
        directional.position.set(-6, 8, 4)
        const rim =
            new THREE.PointLight(0xff0044, 2.2, 120)
        rim.position.set(0, 12, 0)
        this.scene.add(ambient)
        this.scene.add(directional)
        this.scene.add(rim)
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
        this.effects.forEach(e => e.init())
    }
    update(delta) {
        this.elapsedTime += delta
        const t = this.elapsedTime
        this.galaxy.update(t * 0.6)
        this.snow.update(delta * 0.7)
        this.dust.update(delta)
        this.fireworks.update(delta)
        this.shockwave.update(delta)
        const radius = 28
        this.camera.position.x =
            Math.sin(t * 0.12) * radius
        this.camera.position.z =
            Math.cos(t * 0.12) * radius
        this.camera.position.y =
            8 + Math.sin(t * 0.3) * 2
        this.camera.lookAt(0, 4, 0)
        if ((t % 6) < delta) {
            this.tempVec.set(
                (Math.random() - 0.5) * 30,
                0.2,
                (Math.random() - 0.5) * 30
            )
            this.shockwave.spawn(this.tempVec)
        }
    }
    dispose() {
        this.effects.forEach(e => e.dispose())
        this.scene.clear()
    }
}
