import * as THREE from 'https://jspm.dev/three'

export class DarkScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
  }

  init() {

    const geo = new THREE.TorusKnotGeometry(5, 1, 200, 32)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff00aa,
      emissive: 0xff0088,
      metalness: 1,
      roughness: 0
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.scene.add(this.mesh)

    const light = new THREE.PointLight(0xff00aa, 3)
    light.position.set(5,5,5)
    this.scene.add(light)

    this.camera.position.z = 25
  }

  update() {
    this.mesh.rotation.x += 0.01
    this.mesh.rotation.y += 0.01
  }

  dispose() {
    this.scene.clear()
  }
}
