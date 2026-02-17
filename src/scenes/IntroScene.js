import * as THREE from 'https://jspm.dev/three'

export class IntroScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
  }

  init() {

    this.camera.position.set(0, 0, 20)

    const geo = new THREE.ConeGeometry(5, 10, 4)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff0088,
      emissive: 0xff0088,
      metalness: 0.8,
      roughness: 0.2
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.scene.add(this.mesh)

    const light = new THREE.PointLight(0xff00aa, 3)
    light.position.set(5, 5, 5)
    this.scene.add(light)
  }

  update() {
    this.mesh.rotation.y += 0.01
  }

  dispose() {
    this.scene.clear()
  }
}
