import * as THREE from 'https://jspm.dev/three'

export class IntroScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
  }

  init() {

    const geo = new THREE.ConeGeometry(5, 10, 4)
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0088 })
    this.mesh = new THREE.Mesh(geo, mat)

    this.scene.add(this.mesh)
    this.camera.position.z = 20
  }

  update() {
    this.mesh.rotation.y += 0.01
  }

  dispose() {
    this.scene.clear()
  }
}
