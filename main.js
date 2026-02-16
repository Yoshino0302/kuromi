import * as THREE from 'https://jspm.dev/three'
import { EffectComposer } from 'https://jspm.dev/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/UnrealBloomPass.js'

const canvas = document.getElementById('webgl')

// ============================
// BASIC
// ============================
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
100
)
camera.position.set(0,0,9)

const renderer = new THREE.WebGLRenderer({canvas, antialias:true})
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.25

// ============================
// POST PROCESSING
// ============================
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene,camera))

const bloom = new UnrealBloomPass(
new THREE.Vector2(window.innerWidth,window.innerHeight),
1.8,
0.6,
0.8
)
composer.addPass(bloom)

// ============================
// BACKGROUND NEBULA
// ============================
const bgGeo = new THREE.PlaneGeometry(100,100)

const bgMat = new THREE.ShaderMaterial({
uniforms:{
time:{value:0}
},
vertexShader:`
varying vec2 vUv;
void main(){
vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`,
fragmentShader:`
uniform float time;
varying vec2 vUv;

void main(){
vec2 uv = vUv;

float glow = 0.5 + 0.5*sin(time*0.2 + uv.y*5.0);
vec3 col1 = vec3(0.08,0.0,0.15);
vec3 col2 = vec3(0.6,0.0,0.5);

vec3 color = mix(col1,col2,glow);
gl_FragColor = vec4(color,1.0);
}
`,
side:THREE.DoubleSide
})

const bg = new THREE.Mesh(bgGeo,bgMat)
bg.position.z = -20
scene.add(bg)

// ============================
// LIGHT
// ============================
const ambient = new THREE.AmbientLight(0xffffff,0.2)
scene.add(ambient)

const rim = new THREE.PointLight(0xff00aa,15,40)
rim.position.set(0,3,-3)
scene.add(rim)

// ============================
// SILHOUETTE GROUP
// ============================
const group = new THREE.Group()

const fresnelMat = new THREE.ShaderMaterial({
uniforms:{
color:{value:new THREE.Color(0xff00aa)},
},
vertexShader:`
varying vec3 vNormal;
varying vec3 vViewPosition;
void main(){
vNormal = normalize(normalMatrix * normal);
vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
vViewPosition = -mvPosition.xyz;
gl_Position = projectionMatrix * mvPosition;
}
`,
fragmentShader:`
uniform vec3 color;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main(){
float fresnel = dot(normalize(vViewPosition), vNormal);
fresnel = 1.0 - fresnel;
fresnel = pow(fresnel,3.0);

vec3 finalColor = vec3(0.0) + color * fresnel;
gl_FragColor = vec4(finalColor,1.0);
}
`,
transparent:true
})

// body
const body = new THREE.Mesh(
new THREE.SphereGeometry(1.5,64,64),
fresnelMat
)
body.position.y = -0.5
group.add(body)

// head
const head = new THREE.Mesh(
new THREE.SphereGeometry(1.2,64,64),
fresnelMat
)
head.position.y = 1.5
group.add(head)

// ears
const earGeo = new THREE.ConeGeometry(0.6,2,64)
const ear1 = new THREE.Mesh(earGeo,fresnelMat)
ear1.position.set(-0.8,3,0)
ear1.rotation.z = 0.2
group.add(ear1)

const ear2 = ear1.clone()
ear2.position.x = 0.8
ear2.rotation.z = -0.2
group.add(ear2)

scene.add(group)

// ============================
// HEART PARTICLES FIELD
// ============================
const heartGeo = new THREE.TorusGeometry(0.1,0.04,16,30)
const heartMat = new THREE.MeshBasicMaterial({color:0xff69b4})

for(let i=0;i<100;i++){
const h = new THREE.Mesh(heartGeo,heartMat)
h.position.set(
(Math.random()-0.5)*20,
(Math.random()-0.5)*20,
(Math.random()-0.5)*20
)
scene.add(h)
}

// ============================
// ANIMATE
// ============================
const clock = new THREE.Clock()

function animate(){
requestAnimationFrame(animate)

const t = clock.getElapsedTime()

bgMat.uniforms.time.value = t

camera.position.x = Math.sin(t*0.2)*1.5
camera.position.y = Math.sin(t*0.1)*0.5
camera.lookAt(0,0,0)

group.rotation.y = Math.sin(t)*0.4

composer.render()
}

animate()

// ============================
// RESIZE
// ============================
window.addEventListener('resize',()=>{
camera.aspect=window.innerWidth/window.innerHeight
camera.updateProjectionMatrix()
renderer.setSize(window.innerWidth,window.innerHeight)
composer.setSize(window.innerWidth,window.innerHeight)
})
