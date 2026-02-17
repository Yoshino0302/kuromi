import * as THREE from 'https://jspm.dev/three'

export class DarkScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
  }

  init() {

    this.camera.position.set(0, 0, 30)

    const geo = new THREE.TorusKnotGeometry(6, 1.5, 200, 32)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff00aa,
      emissive: 0xff0088,
      emissiveIntensity: 1,
      metalness: 1,
      roughness: 0
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.scene.add(this.mesh)

    const light = new THREE.PointLight(0xff00aa, 4)
    light.position.set(10, 10, 10)
    this.scene.add(light)
  }

  update() {
    this.mesh.rotation.x += 0.01
    this.mesh.rotation.y += 0.015
  }

  dispose() {
    this.scene.clear()
  }
}
