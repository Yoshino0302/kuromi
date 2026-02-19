import * as THREE from 'https://jspm.dev/three'
import { EffectComposer } from 'https://jspm.dev/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/UnrealBloomPass.js'

export class SceneManager {

  constructor(renderer, camera) {

    this.renderer = renderer
    this.camera = camera
    this.currentScene = null
    this.clock = new THREE.Clock()

    this.composer = new EffectComposer(renderer)
    this.renderPass = new RenderPass(new THREE.Scene(), camera)
    this.composer.addPass(this.renderPass)

    this.bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,   // strength
  0.6,   // radius
  0.4    // threshold
)

    this.composer.addPass(this.bloomPass)
  }

  setScene(sceneInstance) {

    if (this.currentScene?.dispose) {
      this.currentScene.dispose()
    }

    this.currentScene = sceneInstance

    try {
      this.currentScene.init()
      this.renderPass.scene = this.currentScene.scene
    } catch (e) {
      console.error('Scene init failed:', e)
    }
  }

  update() {

    if (!this.currentScene) return

    const delta = this.clock.getDelta()

    try {
      if (this.currentScene.update) {
        this.currentScene.update(delta)
      }

      this.composer.render()
    } catch (e) {
      console.error('Scene update error:', e)
    }
  }
}
