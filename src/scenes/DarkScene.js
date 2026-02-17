import * as THREE from 'https://jspm.dev/three'
import { initPortal } from '../effects/portal.js'
import { initGalaxy } from '../effects/galaxy.js'

export class DarkScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  init() {

    this.camera.position.set(0, 0, 40)
    this.scene.fog = new THREE.FogExp2(0x0a0015, 0.05)

    // CORE
    const geo = new THREE.TorusGeometry(8, 2.5, 64, 200)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff00aa,
      emissive: 0xff0088,
      emissiveIntensity: 4,
      metalness: 1,
      roughness: 0
    })

    this.core = new THREE.Mesh(geo, mat)
    this.scene.add(this.core)

    // PORTAL
    const portalData = initPortal(this.scene)
    this.portalUpdate = portalData?.update || null

    // GALAXY
    const galaxyData = initGalaxy(this.scene)
    this.galaxyUpdate = galaxyData?.update || null

    // LIGHT
    const light = new THREE.PointLight(0xff00aa, 8, 200)
    light.position.set(10, 10, 10)
    this.scene.add(light)
  }

  update() {

    if (!this.core) return

    const elapsed = this.clock.getElapsedTime()

    this.core.rotation.x += 0.01
    this.core.rotation.y += 0.015

    if (this.portalUpdate) this.portalUpdate(elapsed)
    if (this.galaxyUpdate) this.galaxyUpdate(elapsed)

    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
