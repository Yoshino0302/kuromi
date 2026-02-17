import * as THREE from 'https://jspm.dev/three'

export class IntroScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  init() {

    this.camera.position.set(0, 0, 26)
    this.scene.fog = new THREE.FogExp2(0x0d0015, 0.035)

    this.createHeartCore()
    this.createHeartGlow()
    this.createAuraShell()
    this.createEnergyRings()
    this.createParticles()
    this.createLights()
  }

  // =================================
  // MAIN 3D HEART (MULTI TONE)
  // =================================
  createHeartCore() {

    const shape = new THREE.Shape()

    shape.moveTo(0, 5)
    shape.bezierCurveTo(0, 9, -7, 9, -7, 2)
    shape.bezierCurveTo(-7, -3, 0, -6, 0, -9)
    shape.bezierCurveTo(0, -6, 7, -3, 7, 2)
    shape.bezierCurveTo(7, 9, 0, 9, 0, 5)

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 5,
      bevelEnabled: true,
      bevelThickness: 1.2,
      bevelSize: 1,
      bevelSegments: 10,
      curveSegments: 50
    })

    geometry.center()

    // gradient vertex color
    const colors = []
    const position = geometry.attributes.position

    for (let i = 0; i < position.count; i++) {

      const y = position.getY(i)

      const color = new THREE.Color()

      if (y > 2) {
        color.set('#ff99cc') // light pink
      } else if (y > -2) {
        color.set('#ff2a6d') // main pink
      } else {
        color.set('#c1005a') // darker bottom
      }

      colors.push(color.r, color.g, color.b)
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 1,
      transmission: 0.6,
      thickness: 2,
      emissive: 0xff0066,
      emissiveIntensity: 1.2,
      transparent: true
    })

    this.heart = new THREE.Mesh(geometry, material)
    this.scene.add(this.heart)
  }

  // =================================
  // INNER PLASMA CORE
  // =================================
  createHeartGlow() {

    const geo = new THREE.SphereGeometry(3.5, 64, 64)

    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00cc,
      transparent: true,
      opacity: 0.35
    })

    this.innerGlow = new THREE.Mesh(geo, mat)
    this.scene.add(this.innerGlow)
  }

  // =================================
  // OUTER AURA SHELL (FRESNEL EFFECT)
  // =================================
  createAuraShell() {

    const geo = new THREE.SphereGeometry(8, 64, 64)

    const mat = new THREE.MeshBasicMaterial({
      color: 0xff66cc,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    })

    this.aura = new THREE.Mesh(geo, mat)
    this.scene.add(this.aura)
  }

  // =================================
  // ENERGY RINGS
  // =================================
  createEnergyRings() {

    this.rings = []

    const tones = [0xff00aa, 0xff66ff, 0xff3399]

    for (let i = 0; i < 3; i++) {

      const geo = new THREE.TorusGeometry(11 + i * 1.5, 0.15, 32, 400)

      const mat = new THREE.MeshBasicMaterial({
        color: tones[i],
        transparent: true,
        opacity: 0.45
      })

      const ring = new THREE.Mesh(geo, mat)

      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI

      this.scene.add(ring)
      this.rings.push(ring)
    }
  }

  // =================================
  // PARTICLES
  // =================================
  createParticles() {

    const count = 2500
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {

      const r = 15 * Math.random()
      const a = Math.random() * Math.PI * 2

      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = Math.sin(a) * r
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
      color: 0xff66cc,
      size: 0.06,
      transparent: true,
      opacity: 0.6
    })

    this.particles = new THREE.Points(geo, mat)
    this.scene.add(this.particles)
  }

  // =================================
  // LIGHTS
  // =================================
  createLights() {

    const pink = new THREE.PointLight(0xff2a6d, 10, 200)
    pink.position.set(15, 15, 20)

    const purple = new THREE.PointLight(0xaa00ff, 8, 200)
    purple.position.set(-15, -10, 15)

    this.scene.add(pink)
    this.scene.add(purple)
  }

  // =================================
  // UPDATE
  // =================================
  update() {

    const t = this.clock.getElapsedTime()

    // double heartbeat
    const beat =
      1 +
      Math.sin(t * 6) * 0.05 +
      Math.sin(t * 12) * 0.03

    this.heart.scale.set(beat, beat, beat)
    this.innerGlow.scale.set(beat * 0.85, beat * 0.85, beat * 0.85)
    this.aura.scale.set(beat * 1.1, beat * 1.1, beat * 1.1)

    // subtle energy ring motion
    this.rings.forEach((ring, i) => {
      ring.rotation.y += 0.0008 + i * 0.0003
    })

    this.particles.rotation.y += 0.0006

    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
