import * as THREE from 'https://jspm.dev/three'
export class GalaxyEffect {
    constructor(scene, resourceManager, memoryTracker) {
        this.scene = scene
        this.resourceManager = resourceManager
        this.memoryTracker = memoryTracker
        this.points = null
        this.geometry = null
        this.material = null
        this.positionAttr = null
        this.basePositions = null
        this.positions = null
        this.colors = null
        this.radii = null
        this.count = 8000
        this.radius = 180
        this.branches = 6
        this.spin = 0.35
        this.rotationSpeed = 0.015
        this.breathAmplitude = 0.015
        this.breathSpeed = 0.6
        this.twinkleSpeed = 1.2
        this.tempColor = new THREE.Color()
    }
    init() {
        const texture =
            this.resourceManager.loadTexture(
                'https://threejs.org/examples/textures/sprites/circle.png'
            )
        this.basePositions =
            new Float32Array(this.count * 3)
        this.positions =
            new Float32Array(this.count * 3)
        this.colors =
            new Float32Array(this.count * 3)
        this.radii =
            new Float32Array(this.count)
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3
            const radius =
                Math.random() * this.radius
            const branch =
                (i % this.branches) /
                this.branches *
                Math.PI * 2
            const spinAngle =
                radius * this.spin
            const angle =
                branch + spinAngle
            const randX =
                (Math.random() - 0.5) * radius * 0.4
            const randY =
                (Math.random() - 0.5) * radius * 0.15
            const randZ =
                (Math.random() - 0.5) * radius * 0.4
            const x =
                Math.cos(angle) * radius + randX
            const y = randY
            const z =
                Math.sin(angle) * radius + randZ
            this.basePositions[i3] = x
            this.basePositions[i3+1] = y
            this.basePositions[i3+2] = z
            this.positions[i3] = x
            this.positions[i3+1] = y
            this.positions[i3+2] = z
            this.radii[i] = radius
            this.tempColor.setHSL(
                0.85 - radius / this.radius * 0.3,
                0.8,
                0.65
            )
            this.colors[i3] =
                this.tempColor.r
            this.colors[i3+1] =
                this.tempColor.g
            this.colors[i3+2] =
                this.tempColor.b
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
        const colorAttr =
            new THREE.BufferAttribute(
                this.colors,
                3
            )
        this.geometry.setAttribute(
            'position',
            this.positionAttr
        )
        this.geometry.setAttribute(
            'color',
            colorAttr
        )
        this.material =
            this.memoryTracker.trackMaterial(
                new THREE.PointsMaterial({
                    map: texture,
                    size: 0.9,
                    transparent: true,
                    opacity: 0.95,
                    vertexColors: true,
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
    update(time) {
        const pos = this.positions
        const base = this.basePositions
        const radii = this.radii
        const count = this.count
        this.points.rotation.y =
            time * this.rotationSpeed
        const breath =
            Math.sin(time * this.breathSpeed)
            * this.breathAmplitude + 1
        this.points.scale.set(
            breath,
            breath,
            breath
        )
        const twTime =
            time * this.twinkleSpeed
        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const r = radii[i]
            const tw =
                Math.sin(twTime + i)
                * r * 0.00004
            pos[i3] =
                base[i3] + tw
            pos[i3+1] =
                base[i3+1] + tw * 0.6
            pos[i3+2] =
                base[i3+2] + tw
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
