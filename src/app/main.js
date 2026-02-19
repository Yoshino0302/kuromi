import * as THREE from 'https://jspm.dev/three'
import { SceneManager } from './SceneManager.js'
import { IntroScene } from './scenes/IntroScene.js'
import { DarkScene } from './scenes/DarkScene.js'
const canvas = document.getElementById('bg')
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  depth: true,
  stencil: false,
  powerPreference: "high-performance"
})
/* AAA TRANSPARENCY SORT SAFETY */
renderer.sortObjects = true

renderer.setSize(window.innerWidth, window.innerHeight)
/* SAFE PIXEL RATIO LIMIT */
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
)
/* MODERN COLOR PIPELINE */
renderer.outputColorSpace = THREE.SRGBColorSpace
/* CINEMATIC TONE MAPPING */
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.
/* MODERN LIGHTING PIPELINE */
/* Three.js r155+ uses physically correct lighting by default */
/* No legacy lighting flags needed */
/* GPU SAFETY */
renderer.info.autoReset = true
renderer.shadowMap.enabled = false
renderer.shadowMap.type = THREE.PCFSoftShadowMap
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
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
)
})
const manager = new SceneManager(renderer, camera)
const introScene = new IntroScene(camera)
/* AAA ENGINE SAFE INITIALIZATION */
introScene.init()
manager.setScene(introScene)
document.getElementById('enterBtn').addEventListener('click', () => {
  const darkScene = new DarkScene(camera)
  /* AAA ENGINE SAFE INITIALIZATION */
darkScene.init()
  document.querySelector('.overlay').style.display = 'none'
  manager.setScene(darkScene)
})
function animate() {
  requestAnimationFrame(animate)
  manager.update()
  /* FORCE GPU COMMAND FLUSH SAFETY */
  renderer.render(
    manager.currentScene.scene,
    camera
  )
}
animate()

