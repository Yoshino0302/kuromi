import * as THREE from 'https://jspm.dev/three'
import { initScene } from './scene.js'
import { initParticles } from './particles.js'
import { initSilhouette } from './silhouette.js'
import { initInteraction } from './interaction.js'
import { initGalaxy } from './galaxy.js'
import { initPortal } from './portal.js'
import { initNeonRings } from './neonRings.js'

const canvas = document.getElementById('bg')

const { scene, camera, renderer } = initScene(canvas)

initParticles(scene)
initSilhouette(scene)
initInteraction(camera)
initGalaxy(scene)
initPortal(scene, camera)
initNeonRings(scene)

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()
