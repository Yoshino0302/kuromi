import * as THREE from 'https://jspm.dev/three'
import { GLTFLoader } from 'https://jspm.dev/three/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.getElementById('webgl')

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 8

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2

// =========================
// LIGHTING
// =========================
const ambient = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambient)

const pointLight = new THREE.PointLight(0xff69b4, 5, 50)
pointLight.position.set(5, 5, 5)
scene.add(pointLight)

// =========================
// SCENE 1 - HEART PLANET
// =========================
const heartGeometry = new THREE.SphereGeometry(2, 64, 64)
const heartMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4da6,
    emissive: 0xff1493,
    emissiveIntensity: 1,
    roughness: 0.2,
    metalness: 0.6
})

const heartPlanet = new THREE.Mesh(heartGeometry, heartMaterial)
scene.add(heartPlanet)

// PARTICLES
const particleCount = 2000
const particleGeometry = new THREE.BufferGeometry()
const positions = new Float32Array(particleCount * 3)

for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50
}

particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)

const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05
})

const particles = new THREE.Points(particleGeometry, particleMaterial)
scene.add(particles)

// =========================
// SCENE 2 - KUROMI WORLD
// =========================
let kuromiModel = null
const loader = new GLTFLoader()

loader.load('./assets/kuromi.glb', (gltf) => {
    kuromiModel = gltf.scene
    kuromiModel.scale.set(2,2,2)
    kuromiModel.position.y = -2
    kuromiModel.visible = false
    scene.add(kuromiModel)
})

// Neon heart behind Kuromi
const neonGeometry = new THREE.TorusGeometry(3, 0.2, 32, 100)
const neonMaterial = new THREE.MeshStandardMaterial({
    color: 0xff00aa,
    emissive: 0xff00aa,
    emissiveIntensity: 3
})

const neonHeart = new THREE.Mesh(neonGeometry, neonMaterial)
neonHeart.rotation.x = Math.PI / 2
neonHeart.position.y = -2
neonHeart.visible = false
scene.add(neonHeart)

// =========================
// SCENE SWITCH
// =========================
let currentScene = 1

window.addEventListener('click', () => {
    if (currentScene === 1) {
        currentScene = 2
        heartPlanet.visible = false
        if (kuromiModel) kuromiModel.visible = true
        neonHeart.visible = true
        pointLight.color.set(0xff00aa)
        scene.background = new THREE.Color(0x1a001f)
    }
})

// =========================
// ANIMATION LOOP
// =========================
const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    const elapsed = clock.getElapsedTime()

    if (currentScene === 1) {
        heartPlanet.rotation.y += 0.003
        particles.rotation.y += 0.0005
    }

    if (currentScene === 2 && kuromiModel) {
        kuromiModel.rotation.y = Math.sin(elapsed) * 0.3
        neonHeart.rotation.z += 0.01
    }

    renderer.render(scene, camera)
}

animate()

// =========================
// RESIZE
// =========================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})
