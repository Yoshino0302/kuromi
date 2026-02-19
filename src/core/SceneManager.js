export class SceneManager {
    constructor() {
        this.currentScene = null
    }
    setScene(scene) {
        if (this.currentScene) {
            this.currentScene.dispose()
        }
        this.currentScene = scene
        scene.init()
    }
    update(delta) {
        if (!this.currentScene) return
        this.currentScene.update(delta)
    }
}
