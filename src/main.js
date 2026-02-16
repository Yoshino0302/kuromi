import * as THREE from 'https://jspm.dev/three'
import { SceneManager } from './SceneManager.js'
import { IntroScene } from './scenes/IntroScene.js'
import { DarkScene } from './scenes/DarkScene.js'

const canvas = document.getElementById('bg')

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const manager = new SceneManager(renderer, camera)

const intro = new IntroScene(camera)
manager.setScene(intro)

document.getElementById('enterBtn').addEventListener('click', () => {
  const dark = new DarkScene(camera)
  manager.setScene(dark)
})

function animate() {
  requestAnimationFrame(animate)
  manager.update()
}

animate()
