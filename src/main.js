import * as THREE from 'https://jspm.dev/three'
import { SceneManager } from './SceneManager.js'
import { IntroScene } from './scenes/IntroScene.js'
import { DarkScene } from './scenes/DarkScene.js'

const canvas = document.getElementById('bg')

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const manager = new SceneManager(renderer, camera)

const introScene = new IntroScene(camera)
manager.setScene(introScene)

document.getElementById('enterBtn').addEventListener('click', () => {

  const darkScene = new DarkScene(camera)

  document.querySelector('.overlay').style.display = 'none'

  manager.setScene(darkScene)
})

function animate() {
  requestAnimationFrame(animate)
  manager.update()
}

animate()
