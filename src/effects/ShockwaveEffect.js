import * as THREE from 'https://jspm.dev/three'
export class ShockwaveEffect {
    constructor(scene, resourceManager, memoryTracker) {
        this.scene = scene
        this.resourceManager = resourceManager
        this.memoryTracker = memoryTracker
        this.pool = []
        this.active = []
        this.maxShockwaves = 16
        this.lifeDuration = 1.1
        this.startScale = 0.4
        this.endScale = 9.5
        this.geometry = null
        this.materialTemplate = null
    }
    init() {
        const texture =
            this.resourceManager.loadTexture(
                'https://threejs.org/examples/textures/sprites/circle.png'
            )
        this.geometry =
            this.memoryTracker.trackGeometry(
                new THREE.RingGeometry(
                    0.6,
                    0.9,
                    96,
                    1
                )
            )
        this.materialTemplate =
            new THREE.MeshBasicMaterial({
                map: texture,
                color: 0xff66cc,
                transparent: true,
                opacity: 0.7,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                alphaTest: 0.001
            })
        for (let i = 0; i < this.maxShockwaves; i++) {
            const material =
                this.memoryTracker.trackMaterial(
                    this.materialTemplate.clone()
                )
            const mesh =
                new THREE.Mesh(
                    this.geometry,
                    material
                )
            mesh.visible = false
            mesh.frustumCulled = false
            this.pool.push({
                mesh,
                life: 0,
                maxLife: 0
            })
        }
    }
    spawn(position) {
        if (this.pool.length === 0)
            return
        const sw =
            this.pool.pop()
        sw.life =
            this.lifeDuration
        sw.maxLife =
            this.lifeDuration
        sw.mesh.position.copy(position)
        sw.mesh.rotation.x =
            -Math.PI * 0.5
        sw.mesh.scale.setScalar(
            this.startScale
        )
        sw.mesh.material.opacity =
            0.7
        sw.mesh.visible = true
        this.scene.add(sw.mesh)
        this.active.push(sw)
    }
    update(delta) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const sw =
                this.active[i]
            sw.life -= delta
            const t =
                1 - (sw.life / sw.maxLife)
            const ease =
                t * t * (3 - 2 * t)
            const scale =
                this.startScale +
                (this.endScale - this.startScale)
                * ease
            sw.mesh.scale.setScalar(scale)
            sw.mesh.material.opacity =
                (1 - ease) *
                (1 - ease) *
                0.7
            if (sw.life <= 0) {
                this.scene.remove(sw.mesh)
                sw.mesh.visible = false
                this.active.splice(i, 1)
                this.pool.push(sw)
            }
        }
    }
    dispose() {
        this.active.forEach(sw =>
            this.scene.remove(sw.mesh)
        )
        this.pool.length = 0
        this.active.length = 0
        if (this.geometry)
            this.geometry.dispose()
    }
}
