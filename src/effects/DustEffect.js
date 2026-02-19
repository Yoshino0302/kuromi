import * as THREE from 'https://jspm.dev/three'
export class DustEffect {
    constructor(scene, resourceManager, memoryTracker) {
        this.scene = scene
        this.resourceManager = resourceManager
        this.memoryTracker = memoryTracker
        this.points = null
        this.geometry = null
        this.material = null
        this.positionAttr = null
        this.positions = null
        this.phase = null
        this.speed = null
        this.count = 3200
        this.area = 180
        this.height = 90
        this.turbulenceSpeed = 0.35
        this.elapsedTime = 0
    }
    init() {
        const texture =
            this.resourceManager.loadTexture(
                'https://threejs.org/examples/textures/sprites/circle.png'
            )
        this.positions =
            new Float32Array(this.count * 3)
        this.phase =
            new Float32Array(this.count)
        this.speed =
            new Float32Array(this.count)
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3
            this.positions[i3] =
                (Math.random() - 0.5) * this.area
            this.positions[i3+1] =
                (Math.random() - 0.5) * this.height
            this.positions[i3+2] =
                (Math.random() - 0.5) * this.area
            this.phase[i] =
                Math.random() * Math.PI * 2
            this.speed[i] =
                0.2 + Math.random() * 0.8
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
                    color: 0xff99cc,
                    size: 0.6,
                    transparent: true,
                    opacity: 0.65,
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
        const phase = this.phase
        const speed = this.speed
        const count = this.count
        const turb =
            this.elapsedTime * this.turbulenceSpeed
        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            pos[i3] +=
                Math.sin(
                    turb * speed[i] +
                    phase[i]
                ) * 0.02
            pos[i3+1] +=
                Math.cos(
                    turb * 0.7 *
                    speed[i] +
                    phase[i]
                ) * 0.015
            pos[i3+2] +=
                Math.sin(
                    turb * 0.5 *
                    speed[i] +
                    phase[i]
                ) * 0.02
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
