import * as THREE from 'https://jspm.dev/three'
export class SnowEffect {
    constructor(scene, resourceManager, memoryTracker) {
        this.scene = scene
        this.resourceManager = resourceManager
        this.memoryTracker = memoryTracker
        this.points = null
        this.geometry = null
        this.material = null
        this.positionAttr = null
        this.positions = null
        this.velocities = null
        this.drift = null
        this.phase = null
        this.count = 2200
        this.area = 220
        this.height = 140
        this.floor = -20
        this.resetHeight = this.height
        this.turbulenceSpeed = 0.6
        this.elapsedTime = 0
    }
    init() {
        const texture =
            this.resourceManager.loadTexture(
                'https://threejs.org/examples/textures/sprites/circle.png'
            )
        this.positions =
            new Float32Array(this.count * 3)
        this.velocities =
            new Float32Array(this.count)
        this.drift =
            new Float32Array(this.count)
        this.phase =
            new Float32Array(this.count)
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3
            this.positions[i3] =
                (Math.random() - 0.5) * this.area
            this.positions[i3+1] =
                Math.random() * this.height
            this.positions[i3+2] =
                (Math.random() - 0.5) * this.area
            this.velocities[i] =
                4 + Math.random() * 6
            this.drift[i] =
                (Math.random() - 0.5) * 2
            this.phase[i] =
                Math.random() * Math.PI * 2
        }
        this.geometry =
            this.memoryTracker.trackGeometry(
                new THREE.BufferGeometry()
            )
        this.positionAttr =
            new THREE.BufferAttribute(
                this.positions,
                3
            )
        this.positionAttr.setUsage(
            THREE.DynamicDrawUsage
        )
        this.geometry.setAttribute(
            'position',
            this.positionAttr
        )
        this.material =
            this.memoryTracker.trackMaterial(
                new THREE.PointsMaterial({
                    map: texture,
                    color: 0xffddff,
                    size: 1.2,
                    transparent: true,
                    opacity: 0.9,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                    sizeAttenuation: true,
                    alphaTest: 0.001
                })
            )
        this.points =
            new THREE.Points(
                this.geometry,
                this.material
            )
        this.points.frustumCulled = false
        this.scene.add(this.points)
    }
    update(delta) {
        this.elapsedTime += delta
        const pos = this.positions
        const vel = this.velocities
        const drift = this.drift
        const phase = this.phase
        const count = this.count
        const floor = this.floor
        const reset = this.resetHeight
        const area = this.area
        const turbTime =
            this.elapsedTime * this.turbulenceSpeed
        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            pos[i3+1] -= vel[i] * delta
            pos[i3] +=
                Math.sin(turbTime + phase[i])
                * drift[i] * delta * 5
            pos[i3+2] +=
                Math.cos(turbTime * 0.7 + phase[i])
                * drift[i] * delta * 3
            if (pos[i3+1] < floor) {
                pos[i3] =
                    (Math.random() - 0.5) * area
                pos[i3+1] =
                    reset
                pos[i3+2] =
                    (Math.random() - 0.5) * area
            }
        }
        this.positionAttr.needsUpdate = true
    }
    dispose() {
        if (!this.points) return
        this.scene.remove(this.points)
        this.geometry.dispose()
        this.material.dispose()
        this.points = null
    }
}
