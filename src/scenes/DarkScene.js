import * as THREE from 'https://jspm.dev/three'

export class DarkScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  init() {

    this.camera.position.set(0, 0, 35)
    this.scene.fog = new THREE.FogExp2(0x0a0015, 0.03)

    this.createEnergyCore()
    this.createOrbitRings()
    this.createCrystalPortal()
    this.createLights()
  }

  // ===============================
  // ENERGY CORE
  // ===============================
  createEnergyCore() {

    const geo = new THREE.IcosahedronGeometry(6, 3)

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xff00aa,
      emissive: 0xff00aa,
      emissiveIntensity: 1.8,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 1,
      transmission: 0.6,
      thickness: 1.5,
      transparent: true
    })

    this.core = new THREE.Mesh(geo, mat)
    this.scene.add(this.core)

    // inner glow
    const innerGeo = new THREE.SphereGeometry(3.5, 64, 64)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff00ff
    })

    this.innerCore = new THREE.Mesh(innerGeo, innerMat)
    this.scene.add(this.innerCore)
  }

  // ===============================
  // ORBIT RINGS
  // ===============================
  createOrbitRings() {

    this.rings = []

    for (let i = 0; i < 3; i++) {

      const ringGeo = new THREE.TorusGeometry(10 + i * 2, 0.15, 32, 200)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff00aa
      })

      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI

      this.scene.add(ring)
      this.rings.push(ring)
    }
  }

  // ===============================
  // CRYSTAL PORTAL
  // ===============================
  createCrystalPortal() {

    const geo = new THREE.IcosahedronGeometry(12, 1)

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xff66cc,
      emissive: 0xff0088,
      emissiveIntensity: 0.8,
      transmission: 0.9,
      thickness: 2,
      metalness: 0.1,
      roughness: 0,
      transparent: true
    })

    this.portal = new THREE.Mesh(geo, mat)
    this.portal.position.z = -15
    this.scene.add(this.portal)
  }

  // ===============================
  // LIGHTS
  // ===============================
  createLights() {

    const light1 = new THREE.PointLight(0xff00aa, 6, 200)
    light1.position.set(20, 20, 20)

    const light2 = new THREE.PointLight(0xff0088, 6, 200)
    light2.position.set(-20, -10, 10)

    this.scene.add(light1)
    this.scene.add(light2)
  }

  // ===============================
  // UPDATE LOOP
  // ===============================
  update() {

    const elapsed = this.clock.getElapsedTime()

    // core rotation
    this.core.rotation.x += 0.01
    this.core.rotation.y += 0.015

    // breathing pulse
    const pulse = 1 + Math.sin(elapsed * 2) * 0.05
    this.core.scale.set(pulse, pulse, pulse)

    // inner distortion effect
    this.innerCore.rotation.y += 0.02

    // orbit rings rotation
    this.rings.forEach((ring, i) => {
      ring.rotation.x += 0.005 + i * 0.002
      ring.rotation.y += 0.004 + i * 0.002
    })

    // portal slow spin
    this.portal.rotation.y += 0.003
    this.portal.rotation.x += 0.002

    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
