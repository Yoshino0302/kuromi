import * as THREE from 'https://jspm.dev/three'
export class FireworkEffect {
    constructor(scene, resourceManager, memoryTracker) {
        this.scene = scene
        this.resourceManager = resourceManager
        this.memoryTracker = memoryTracker
        this.texture = null
        this.pool = []
        this.active = []
        this.maxFireworks = 12
        this.maxParticles = 260
        this.minParticles = 140
        this.gravity = 9.8 * 0.45
        this.drag = 0.985
        this.turbulence = 0.35
        this.spawnRate = 0.38
        this.spawnAccumulator = 0
        this.elapsedTime = 0
        this.tempColor = new THREE.Color()
    }
    init() {
        this.texture =
            this.resourceManager.loadTexture(
                'https://threejs.org/examples/textures/sprites/circle.png'
            )
        for (let i = 0; i < this.maxFireworks; i++) {
            this.pool.push(
                this.createFirework()
            )
        }
    }
    createFirework() {
        const positions =
            new Float32Array(this.maxParticles * 3)
        const velocities =
            new Float32Array(this.maxParticles * 3)
        const colors =
            new Float32Array(this.maxParticles * 3)
        const randomness =
            new Float32Array(this.maxParticles)
        const geometry =
            this.memoryTracker.trackGeometry(
                new THREE.BufferGeometry()
            )
        const positionAttr =
            new THREE.BufferAttribute(
                positions,
                3
            )
        positionAttr.setUsage(
            THREE.DynamicDrawUsage
        )
        const colorAttr =
            new THREE.BufferAttribute(
                colors,
                3
            )
        geometry.setAttribute(
            'position',
            positionAttr
        )
        geometry.setAttribute(
            'color',
            colorAttr
        )
        const material =
            this.memoryTracker.trackMaterial(
                new THREE.PointsMaterial({
                    map: this.texture,
                    size: 0.18,
                    transparent: true,
                    opacity: 1,
                    vertexColors: true,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                    alphaTest: 0.001
                })
            )
        const mesh =
            new THREE.Points(
                geometry,
                material
            )
        mesh.frustumCulled = false
        return {
            mesh,
            positions,
            velocities,
            colors,
            randomness,
            count: 0,
            life: 0,
            maxLife: 0
        }
    }
    spawn() {
        if (this.pool.length === 0)
            return
        const fw =
            this.pool.pop()
        const count =
            this.minParticles +
            Math.random() *
            (this.maxParticles - this.minParticles)
        fw.count = count | 0
        fw.life = 2.4
        fw.maxLife = fw.life
        const baseHue =
            Math.random()
        for (let i = 0; i < fw.count; i++) {
            const i3 = i * 3
            const theta =
                Math.random() * Math.PI * 2
            const phi =
                Math.acos(
                    2 * Math.random() - 1
                )
            const sinPhi =
                Math.sin(phi)
            const dx =
                sinPhi * Math.cos(theta)
            const dy =
                Math.cos(phi)
            const dz =
                sinPhi * Math.sin(theta)
            const speed =
                18 + Math.random() * 22
            fw.velocities[i3] = dx * speed
            fw.velocities[i3+1] = dy * speed
            fw.velocities[i3+2] = dz * speed
            fw.positions[i3] = 0
            fw.positions[i3+1] = 0
            fw.positions[i3+2] = 0
            fw.randomness[i] =
                Math.random() * Math.PI * 2
            this.tempColor.setHSL(
                (baseHue + Math.random() * 0.08) % 1,
                1,
                0.65
            )
            fw.colors[i3] =
                this.tempColor.r
            fw.colors[i3+1] =
                this.tempColor.g
            fw.colors[i3+2] =
                this.tempColor.b
        }
        fw.mesh.position.set(
            (Math.random() - 0.5) * 60,
            Math.random() * 28 + 8,
            (Math.random() - 0.5) * 60
        )
        fw.mesh.geometry.attributes.position.array.set(
            fw.positions
        )
        fw.mesh.geometry.attributes.color.array.set(
            fw.colors
        )
        fw.mesh.geometry.setDrawRange(
            0,
            fw.count
        )
        fw.mesh.material.opacity = 1
        this.scene.add(fw.mesh)
        this.active.push(fw)
    }
    update(delta) {
        this.elapsedTime += delta
        const turbTime =
            this.elapsedTime * 2.4
        for (let i = this.active.length - 1; i >= 0; i--) {
            const fw = this.active[i]
            for (let j = 0; j < fw.count; j++) {
                const i3 = j * 3
                const turb =
                    Math.sin(
                        turbTime +
                        fw.randomness[j]
                    ) * this.turbulence
                fw.velocities[i3] *= this.drag
                fw.velocities[i3+1] *= this.drag
                fw.velocities[i3+2] *= this.drag
                fw.velocities[i3] += turb * 0.12
                fw.velocities[i3+2] += turb * 0.12
                fw.velocities[i3+1] -=
                    this.gravity * delta
                fw.positions[i3] +=
                    fw.velocities[i3] * delta
                fw.positions[i3+1] +=
                    fw.velocities[i3+1] * delta
                fw.positions[i3+2] +=
                    fw.velocities[i3+2] * delta
            }
            fw.mesh.geometry.attributes.position.needsUpdate = true
            fw.life -= delta
            const t =
                fw.life / fw.maxLife
            fw.mesh.material.opacity =
                t * t * (3 - 2 * t)
            if (fw.life <= 0) {
                this.scene.remove(fw.mesh)
                this.active.splice(i, 1)
                this.pool.push(fw)
            }
        }
        this.spawnAccumulator += delta
        if (this.spawnAccumulator >= this.spawnRate) {
            this.spawn()
            this.spawnAccumulator = 0
        }
    }
    dispose() {
        this.active.forEach(fw =>
            this.scene.remove(fw.mesh)
        )
        this.pool.length = 0
        this.active.length = 0
    }
}
