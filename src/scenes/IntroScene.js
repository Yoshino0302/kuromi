import * as THREE from 'https://jspm.dev/three'

export class IntroScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  init() {

    this.camera.position.set(0, 0, 32)
    this.scene.fog = new THREE.FogExp2(0x090012, 0.03)

    this.createCrystalCore()
    this.createSigilSystem()
    this.createShockwaveSystem()
    this.createParticleAura()
    this.createLights()
  }

  // =========================
  // CENTRAL CRYSTAL CORE
  // =========================
  createCrystalCore() {

    const geo = new THREE.OctahedronGeometry(6, 2)

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xff00aa,
      emissive: 0xff00ff,
      emissiveIntensity: 1.8,
      transmission: 0.85,
      thickness: 1.4,
      roughness: 0,
      metalness: 0.15,
      transparent: true
    })

    this.crystal = new THREE.Mesh(geo, mat)
    this.scene.add(this.crystal)

    // inner glow sphere
    const innerGeo = new THREE.SphereGeometry(3.5, 64, 64)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.25
    })

    this.innerGlow = new THREE.Mesh(innerGeo, innerMat)
    this.scene.add(this.innerGlow)
  }

  // =========================
  // SIGIL RING SYSTEM
  // =========================
  createSigilSystem() {

    this.rings = []

    for (let i = 0; i < 5; i++) {

      const geo = new THREE.TorusGeometry(9 + i * 1.5, 0.12, 32, 300)

      const mat = new THREE.MeshBasicMaterial({
        color: 0xff00aa,
        transparent: true,
        opacity: 0.75
      })

      const ring = new THREE.Mesh(geo, mat)

      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI

      this.scene.add(ring)
      this.rings.push(ring)
    }
  }

  // =========================
  // SHOCKWAVE EFFECT
  // =========================
  createShockwaveSystem() {

    const geo = new THREE.RingGeometry(6, 6.5, 64)

    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })

    this.shockwave = new THREE.Mesh(geo, mat)
    this.shockwave.rotation.x = Math.PI / 2

    this.scene.add(this.shockwave)
  }

  // =========================
  // PARTICLE AURA
  // =========================
  createParticleAura() {

    const count = 2000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {

      const radius = 12 * Math.random()
      const angle = Math.random() * Math.PI * 2

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xff00ff,
      size: 0.07
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  // =========================
  // LIGHTS
  // =========================
  createLights() {

    const light1 = new THREE.PointLight(0xff00aa, 6, 200)
    light1.position.set(15, 15, 20)

    const light2 = new THREE.PointLight(0xff0088, 6, 200)
    light2.position.set(-15, -10, 15)

    this.scene.add(light1)
    this.scene.add(light2)
  }

  // =========================
  // UPDATE LOOP
  // =========================
  update() {

    const t = this.clock.getElapsedTime()

    // crystal rotation
    this.crystal.rotation.y += 0.01
    this.crystal.rotation.x += 0.006

    // breathing pulse
    const pulse = 1 + Math.sin(t * 2.5) * 0.08
    this.crystal.scale.set(pulse, pulse, pulse)
    this.innerGlow.scale.set(pulse, pulse, pulse)

    // ring rotations
    this.rings.forEach((ring, i) => {
      ring.rotation.x += 0.002 + i * 0.0008
      ring.rotation.y += 0.003 + i * 0.0006
    })

    // shockwave pulse
    const shockScale = 1 + Math.sin(t * 3) * 0.2
    this.shockwave.scale.set(shockScale, shockScale, shockScale)

    // particle drift
    this.particles.rotation.y += 0.0015

    // subtle cinematic camera drift
    this.camera.position.x = Math.sin(t * 0.4) * 2
    this.camera.position.y = Math.cos(t * 0.3) * 1.5
    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
