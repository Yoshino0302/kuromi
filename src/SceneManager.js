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

    // ---------- POST PROCESSING ----------
    this.composer = new EffectComposer(this.renderer)

    this.renderPass = new RenderPass(new THREE.Scene(), this.camera)
    this.composer.addPass(this.renderPass)

    // FULL CYBERPUNK GLOW MODE (C)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.2,   // strength (rất mạnh)
      1.5,   // radius (glow lan rộng)
      0.05   // threshold (gần như mọi neon đều glow)
    )

    this.composer.addPass(this.bloomPass)

    window.addEventListener('resize', () => {
      this.composer.setSize(window.innerWidth, window.innerHeight)
    })
  }

  setScene(sceneInstance) {

    if (this.currentScene?.dispose) {
      this.currentScene.dispose()
    }

    this.currentScene = sceneInstance
    this.currentScene.init()

    // Update render pass scene
    this.renderPass.scene = this.currentScene.scene
  }

  update() {

    if (!this.currentScene) return

    const delta = this.clock.getDelta()

    if (this.currentScene.update) {
      this.currentScene.update(delta)
    }

    // Render with bloom composer
    this.composer.render()
  }
}
