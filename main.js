import * as THREE from 'https://jspm.dev/three'
import { EffectComposer } from 'https://jspm.dev/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/UnrealBloomPass.js'

const canvas = document.getElementById('webgl')

// =================================
// BASIC SETUP
// =================================
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
100
)
camera.position.set(0,0,8)

const renderer = new THREE.WebGLRenderer({canvas, antialias:true})
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2

// =================================
// POST PROCESSING
// =================================
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene,camera))

const bloom = new UnrealBloomPass(
new THREE.Vector2(window.innerWidth,window.innerHeight),
1.5,
0.4,
0.85
)
composer.addPass(bloom)

// =================================
// LIGHT
// =================================
const ambient = new THREE.AmbientLight(0xffffff,0.4)
scene.add(ambient)

const backLight = new THREE.PointLight(0xff00aa,5,20)
backLight.position.set(0,2,-2)
scene.add(backLight)

// =================================
// SCENE 1 – HEART PLANET
// =================================
const heartGeo = new THREE.SphereGeometry(2,64,64)
const heartMat = new THREE.MeshStandardMaterial({
color:0xff4da6,
emissive:0xff1493,
emissiveIntensity:2,
roughness:0.2,
metalness:0.7
})

const heart = new THREE.Mesh(heartGeo,heartMat)
scene.add(heart)

// PARTICLES
const particleCount = 2000
const particleGeo = new THREE.BufferGeometry()
const pos = new Float32Array(particleCount*3)

for(let i=0;i<particleCount*3;i++){
pos[i]=(Math.random()-0.5)*50
}

particleGeo.setAttribute('position',
new THREE.BufferAttribute(pos,3))

const particleMat = new THREE.PointsMaterial({
color:0xffffff,
size:0.05
})

const particles = new THREE.Points(particleGeo,particleMat)
scene.add(particles)

// =================================
// SCENE 2 – SILHOUETTE (INSPIRED)
// =================================
const group = new THREE.Group()

// body
const body = new THREE.Mesh(
new THREE.SphereGeometry(1.5,64,64),
new THREE.MeshBasicMaterial({color:0x000000})
)
body.position.y = -0.5
group.add(body)

// head
const head = new THREE.Mesh(
new THREE.SphereGeometry(1.2,64,64),
new THREE.MeshBasicMaterial({color:0x000000})
)
head.position.y = 1.5
group.add(head)

// ears
const earGeo = new THREE.ConeGeometry(0.6,2,64)
const ear1 = new THREE.Mesh(earGeo,new THREE.MeshBasicMaterial({color:0x000000}))
ear1.position.set(-0.8,3,0)
ear1.rotation.z = 0.2
group.add(ear1)

const ear2 = ear1.clone()
ear2.position.x = 0.8
ear2.rotation.z = -0.2
group.add(ear2)

group.visible = false
scene.add(group)

// neon heart background
const neon = new THREE.Mesh(
new THREE.TorusGeometry(3,0.15,32,200),
new THREE.MeshBasicMaterial({color:0xff00aa})
)
neon.rotation.x = Math.PI/2
neon.visible = false
scene.add(neon)

// =================================
// TRANSITION
// =================================
let sceneIndex = 1
let transitioning = false

window.addEventListener('click',()=>{
if(sceneIndex===1 && !transitioning){
transitioning = true
}
})

const clock = new THREE.Clock()

function animate(){
requestAnimationFrame(animate)

const t = clock.getElapsedTime()

// cinematic camera motion
camera.position.x = Math.sin(t*0.2)*1.5
camera.lookAt(0,0,0)

if(sceneIndex===1){

heart.rotation.y += 0.01
particles.rotation.y += 0.0005

if(transitioning){
heart.scale.multiplyScalar(0.97)
if(heart.scale.x<0.05){
heart.visible=false
particles.visible=false
group.visible=true
neon.visible=true
scene.background=new THREE.Color(0x14001f)
sceneIndex=2
}
}

}else{

group.rotation.y = Math.sin(t)*0.3
neon.rotation.z += 0.01

}

composer.render()
}

animate()

// =================================
// RESIZE
// =================================
window.addEventListener('resize',()=>{
camera.aspect=window.innerWidth/window.innerHeight
camera.updateProjectionMatrix()
renderer.setSize(window.innerWidth,window.innerHeight)
composer.setSize(window.innerWidth,window.innerHeight)
})
