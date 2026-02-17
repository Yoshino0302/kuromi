import * as THREE from 'https://jspm.dev/three'
import { EffectComposer } from 'https://jspm.dev/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/ShaderPass.js'

const GlitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      uv.x += sin(uv.y * 50.0 + uTime * 20.0) * 0.01;
      vec4 color = texture2D(tDiffuse, uv);
      gl_FragColor = color;
    }
  `
}

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
      2.2,
      1.5,
      0.05
    )
    this.composer.addPass(this.bloomPass)

    this.glitchPass = new ShaderPass(GlitchShader)
    this.composer.addPass(this.glitchPass)
  }

  setScene(sceneInstance) {
    this.currentScene = sceneInstance
    this.currentScene.init()
    this.renderPass.scene = this.currentScene.scene
  }

  update() {

    const elapsed = this.clock.getElapsedTime()

    if (this.currentScene?.update) {
      this.currentScene.update(elapsed)
    }

    this.glitchPass.uniforms.uTime.value = elapsed

    this.composer.render()
  }
}
