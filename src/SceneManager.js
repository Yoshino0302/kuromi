export class SceneManager {

  constructor(renderer, camera) {
    this.renderer = renderer
    this.camera = camera
    this.currentScene = null
  }

  setScene(sceneInstance) {

    if (this.currentScene?.dispose) {
      this.currentScene.dispose()
    }

    this.currentScene = sceneInstance
    this.currentScene.init()
  }

  update() {
    if (!this.currentScene) return

    if (this.currentScene.update) {
      this.currentScene.update()
    }

    this.renderer.render(this.currentScene.scene, this.camera)
  }
}
