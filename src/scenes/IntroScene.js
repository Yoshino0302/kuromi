import * as THREE from 'https://jspm.dev/three'

export class IntroScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  init() {

    this.camera.position.set(0, 0, 28)
    this.scene.fog = new THREE.FogExp2(0x0a0015, 0.035)

    this.createHeart()
    this.createInnerGlow()
    this.createMagicRings()
    this.createShockwave()
    this.createParticles()
    this.createLights()
  }

  // ===================================
  // 3D HEART GEOMETRY
  // ===================================
  createHeart() {

    const heartShape = new THREE.Shape()

    heartShape.moveTo(0, 5)
    heartShape.bezierCurveTo(0, 8, -6, 8, -6, 3)
    heartShape.bezierCurveTo(-6, -2, 0, -5, 0, -8)
    heartShape.bezierCurveTo(0, -5, 6, -2, 6, 3)
    heartShape.bezierCurveTo(6, 8, 0, 8, 0, 5)

    const extrudeSettings = {
      depth: 4,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 8,
      curveSegments: 32
    }

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)

    geometry.center()

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xff0066,
      emissive: 0xff0099,
      emissiveIntensity: 1.8,
      metalness: 0.2,
      roughness: 0.25,
      clearcoat: 1,
      transmission: 0.3,
      thickness: 1.2
    })

    this.heart = new THREE.Mesh(geometry, material)
    this.scene.add(this.heart)
  }

  // ===================================
  // INNER GLOW CORE
  // ===================================
  createInnerGlow() {

    const geo = new THREE.SphereGeometry(3, 64, 64)

    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00cc,
      transparent: true,
      opacity: 0.25
    })

    this.innerGlow = new THREE.Mesh(geo, mat)
    this.scene.add(this.innerGlow)
  }

  // ===================================
  // MAGIC ORBIT RINGS
  // ===================================
  createMagicRings() {

    this.rings = []

    for (let i = 0; i < 4; i++) {

      const geo = new THREE.TorusGeometry(10 + i * 1.5, 0.15, 32, 300)

      const mat = new THREE.MeshBasicMaterial({
        color: 0xff00aa,
        transparent: true,
        opacity: 0.7
      })

      const ring = new THREE.Mesh(geo, mat)

      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI

      this.scene.add(ring)
      this.rings.push(ring)
    }
  }

  // ===================================
  // SHOCKWAVE EFFECT
  // ===================================
  createShockwave() {

    const geo = new THREE.RingGeometry(8, 8.5, 64)

    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    })

    this.shockwave = new THREE.Mesh(geo, mat)
    this.shockwave.rotation.x = Math.PI / 2

    this.scene.add(this.shockwave)
  }

  // ===================================
  // PARTICLE AURA
  // ===================================
  createParticles() {

    const count = 2500
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {

      const r = 14 * Math.random()
      const a = Math.random() * Math.PI * 2

      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = Math.sin(a) * r
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xff00ff,
      size: 0.08
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  // ===================================
  // LIGHTS
  // ===================================
  createLights() {

    const l1 = new THREE.PointLight(0xff0099, 8, 200)
    l1.position.set(15, 15, 20)

    const l2 = new THREE.PointLight(0xff00aa, 6, 200)
    l2.position.set(-15, -10, 15)

    this.scene.add(l1)
    this.scene.add(l2)
  }

  // ===================================
  // UPDATE LOOP
  // ===================================
  update() {

    const t = this.clock.getElapsedTime()

    // heart rotation
    this.heart.rotation.y += 0.01
    this.heart.rotation.x += 0.004

    // heartbeat pulse
    const beat = 1 + Math.sin(t * 4) * 0.08
    this.heart.scale.set(beat, beat, beat)
    this.innerGlow.scale.set(beat, beat, beat)

    // magic rings rotation
    this.rings.forEach((ring, i) => {
      ring.rotation.x += 0.002 + i * 0.0008
      ring.rotation.y += 0.003 + i * 0.0006
    })

    // shockwave pulse
    const shockScale = 1 + Math.sin(t * 3) * 0.2
    this.shockwave.scale.set(shockScale, shockScale, shockScale)

    // particle swirl
    this.particles.rotation.y += 0.0015

    // cinematic camera drift
    this.camera.position.x = Math.sin(t * 0.4) * 2
    this.camera.position.y = Math.cos(t * 0.3) * 1.5
    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
