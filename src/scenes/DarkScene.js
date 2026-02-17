import * as THREE from 'https://jspm.dev/three'
import { initPortal } from '../effects/portal.js'
import { initGalaxy } from '../effects/galaxy.js'
import { AudioEngine } from '../core/AudioEngine.js'

export class DarkScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  async init() {

    this.camera.position.set(0, 0, 40)

    this.scene.fog = new THREE.FogExp2(0x0a0015, 0.05)

    // AUDIO
    this.audioEngine = new AudioEngine(this.camera)
    await this.audioEngine.load('./assets/cyberpunk.mp3')

    document.addEventListener('click', () => {
      this.audioEngine.play()
    })

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
    this.portalUpdate = portalData.update

    // GALAXY
    const galaxyData = initGalaxy(this.scene)
    this.galaxyUpdate = galaxyData.update

    // LIGHT
    const light = new THREE.PointLight(0xff00aa, 8, 200)
    light.position.set(10, 10, 10)
    this.scene.add(light)

    // MOUSE GRAVITY
    this.mouse = new THREE.Vector2()

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 20
      this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 20
    })
  }

  update() {

    const elapsed = this.clock.getElapsedTime()

    this.audioEngine.update()

    const bass = this.audioEngine.data.bass
    const avg = this.audioEngine.data.average

    // AUDIO REACTIVE CORE
    const pulse = 1 + bass * 1.5
    this.core.scale.set(pulse, pulse, pulse)

    this.core.rotation.x += 0.01 + avg * 0.1
    this.core.rotation.y += 0.015 + avg * 0.1

    // UPDATE PORTAL + GALAXY
    if (this.portalUpdate) this.portalUpdate(elapsed + bass * 5)
    if (this.galaxyUpdate) this.galaxyUpdate(elapsed)

    // CAMERA FOLLOW MOUSE
    this.camera.position.x += (this.mouse.x - this.camera.position.x) * 0.05
    this.camera.position.y += (-this.mouse.y - this.camera.position.y) * 0.05

    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
