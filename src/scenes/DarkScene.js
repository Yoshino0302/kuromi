import * as THREE from 'https://jspm.dev/three'

export class DarkScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  init() {

    this.camera.position.set(0, 0, 45)
    this.scene.fog = new THREE.FogExp2(0x080012, 0.025)

    this.createReactorCore()
    this.createHexPortal()
    this.createEnergyVortex()
    this.createLights()
  }

  // =========================
  // REACTOR CORE
  // =========================
  createReactorCore() {

    const geo = new THREE.SphereGeometry(6, 128, 128)

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xff0099,
      emissive: 0xff00cc,
      emissiveIntensity: 2,
      metalness: 0.2,
      roughness: 0,
      transmission: 0.6,
      thickness: 1.5,
      transparent: true
    })

    this.core = new THREE.Mesh(geo, mat)
    this.scene.add(this.core)

    // outer glow shell
    const shellGeo = new THREE.SphereGeometry(7.5, 64, 64)
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.15
    })

    this.shell = new THREE.Mesh(shellGeo, shellMat)
    this.scene.add(this.shell)
  }

  // =========================
  // HEX PORTAL FRAME
  // =========================
  createHexPortal() {

    this.portalRings = []

    for (let i = 0; i < 6; i++) {

      const geo = new THREE.TorusGeometry(14 + i * 1.2, 0.2, 32, 300)

      const mat = new THREE.MeshBasicMaterial({
        color: 0xff00aa
      })

      const ring = new THREE.Mesh(geo, mat)

      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI

      this.scene.add(ring)
      this.portalRings.push(ring)
    }
  }

  // =========================
  // ENERGY VORTEX PARTICLES
  // =========================
  createEnergyVortex() {

    const count = 4000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {

      const radius = 20 * Math.random()
      const angle = Math.random() * Math.PI * 2

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xff00ff,
      size: 0.08
    })

    this.vortex = new THREE.Points(geometry, material)
    this.scene.add(this.vortex)
  }

  // =========================
  // LIGHTS
  // =========================
  createLights() {

    const l1 = new THREE.PointLight(0xff00aa, 8, 200)
    l1.position.set(20, 20, 20)

    const l2 = new THREE.PointLight(0xff0088, 8, 200)
    l2.position.set(-20, -15, 15)

    this.scene.add(l1)
    this.scene.add(l2)
  }

  // =========================
  // UPDATE LOOP
  // =========================
  update() {

    const t = this.clock.getElapsedTime()

    // core spin
    this.core.rotation.y += 0.01
    this.core.rotation.x += 0.006

    // breathing pulse
    const pulse = 1 + Math.sin(t * 3) * 0.06
    this.core.scale.set(pulse, pulse, pulse)
    this.shell.scale.set(pulse, pulse, pulse)

    // portal rings rotation
    this.portalRings.forEach((ring, i) => {
      ring.rotation.x += 0.002 + i * 0.0008
      ring.rotation.y += 0.003 + i * 0.0006
    })

    // vortex spin
    this.vortex.rotation.y += 0.0015

    // subtle camera motion
    this.camera.position.x = Math.sin(t * 0.3) * 3
    this.camera.position.y = Math.cos(t * 0.2) * 2
    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
