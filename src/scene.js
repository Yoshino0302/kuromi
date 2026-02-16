import * as THREE from 'https://jspm.dev/three'

export function initScene(canvas) {

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x000000, 10, 50)

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 20

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  const ambient = new THREE.AmbientLight(0xff00aa, 0.6)
  scene.add(ambient)

  const point = new THREE.PointLight(0xff0088, 2)
  point.position.set(5, 5, 5)
  scene.add(point)

  return { scene, camera, renderer }
}
