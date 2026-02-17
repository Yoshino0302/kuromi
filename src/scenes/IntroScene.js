import * as THREE from 'https://jspm.dev/three'

export class IntroScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  init() {

    this.camera.position.set(0, 0, 26)
    this.scene.fog = new THREE.FogExp2(0x14001f, 0.04)

    this.createHeart()
    this.createInnerCore()
    this.createGlassShell()
    this.createMagicRings()
    this.createParticles()
    this.createLights()
  }

  // =================================
  // HEART BASE
  // =================================
  createHeart() {

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
      curveSegments: 40
    })

    geometry.center()

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xff2a6d,
      emissive: 0xff0066,
      emissiveIntensity: 1.5,
      roughness: 0.3,
      metalness: 0.15,
      clearcoat: 1,
      transmission: 0.5,
      thickness: 2,
      transparent: true
    })

    this.heart = new THREE.Mesh(geometry, material)
    this.scene.add(this.heart)
  }

  // =================================
  // INNER ENERGY CORE
  // =================================
  createInnerCore() {

    const geo = new THREE.SphereGeometry(3.2, 64, 64)

    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00cc,
      transparent: true,
      opacity: 0.3
    })

    this.innerCore = new THREE.Mesh(geo, mat)
    this.scene.add(this.innerCore)
  }

  // =================================
  // GLASS OUTER SHELL
  // =================================
  createGlassShell() {

    const geo = new THREE.SphereGeometry(7.5, 64, 64)

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xff66aa,
      transmission: 0.9,
      thickness: 3,
      roughness: 0,
      metalness: 0,
      transparent: true,
      opacity: 0.15
    })

    this.shell = new THREE.Mesh(geo, mat)
    this.scene.add(this.shell)
  }

  // =================================
  // MAGIC RINGS (SOFT COLOR MIX)
  // =================================
  createMagicRings() {

    this.rings = []

    const colors = [0xff00aa, 0xff66cc, 0xff3399]

    for (let i = 0; i < 3; i++) {

      const geo = new THREE.TorusGeometry(11 + i * 1.5, 0.12, 32, 300)

      const mat = new THREE.MeshBasicMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.5
      })

      const ring = new THREE.Mesh(geo, mat)

      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI

      this.scene.add(ring)
      this.rings.push(ring)
    }
  }

  // =================================
  // PARTICLE AURA
  // =================================
  createParticles() {

    const count = 2000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {

      const r = 15 * Math.random()
      const a = Math.random() * Math.PI * 2

      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = Math.sin(a) * r
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xff66cc,
      size: 0.07,
      transparent: true,
      opacity: 0.6
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  // =================================
  // LIGHTS
  // =================================
  createLights() {

    const l1 = new THREE.PointLight(0xff0066, 8, 200)
    l1.position.set(15, 15, 20)

    const l2 = new THREE.PointLight(0xff66cc, 6, 200)
    l2.position.set(-15, -10, 15)

    this.scene.add(l1)
    this.scene.add(l2)
  }

  // =================================
  // UPDATE (NO ROTATION)
  // =================================
  update() {

    const t = this.clock.getElapsedTime()

    // realistic double heartbeat
    const beat =
      1 +
      Math.sin(t * 6) * 0.05 +
      Math.sin(t * 12) * 0.03

    this.heart.scale.set(beat, beat, beat)
    this.innerCore.scale.set(beat * 0.9, beat * 0.9, beat * 0.9)
    this.shell.scale.set(beat * 1.05, beat * 1.05, beat * 1.05)

    // soft ring drift (không quay nhanh)
    this.rings.forEach((ring, i) => {
      ring.rotation.y += 0.001 + i * 0.0003
    })

    // particle drift
    this.particles.rotation.y += 0.0008

    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
