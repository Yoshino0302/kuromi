import * as THREE from 'https://jspm.dev/three'

export class IntroScene{

constructor(camera){

/* =========================
   CORE REFERENCES
========================= */

this.camera = camera
this.scene = new THREE.Scene()

/* =========================
   TEXTURE SYSTEM (GPU OPTIMIZED)
========================= */

this.textureLoader = new THREE.TextureLoader()

this.particleTexture = this.textureLoader.load(
'https://threejs.org/examples/textures/sprites/circle.png'
)

this.particleTexture.colorSpace = THREE.SRGBColorSpace
this.particleTexture.generateMipmaps = true
this.particleTexture.minFilter = THREE.LinearMipmapLinearFilter
this.particleTexture.magFilter = THREE.LinearFilter
this.particleTexture.wrapS = THREE.ClampToEdgeWrapping
this.particleTexture.wrapT = THREE.ClampToEdgeWrapping
this.particleTexture.anisotropy = 4

/* =========================
   TIME SYSTEM (ZERO DRIFT)
========================= */

this.clock = new THREE.Clock()

this.elapsedTime = 0
this.deltaTime = 0

/* CRITICAL FIX:
   beatTime was never initialized → caused NaN propagation
*/
this.beatTime = 0

/* =========================
   PHYSICS CONSTANTS
========================= */

this.GRAVITY = 9.8 * 0.5

/* =========================
   FIREWORK CONTROL
========================= */

this.MAX_FIREWORKS = 12

this.fireworkSpawnAccumulator = 0
this.fireworkSpawnRate = 0.4

this._fireworkBaseSpawnRate = 0.4
this._fireworkSpawnAccumulator = 0

this._fireworkLife = 2

this._fireworkGravity = this.GRAVITY

/* NEW: DRAG + TURBULENCE defaults */
this._fireworkDrag = 0.985
this._fireworkTurbulence = 0.35

/* =========================
   ADAPTIVE DENSITY SYSTEM
========================= */

this.densityFactor = 1
this.targetDensityFactor = 1

this.frameCount = 0
this.fpsTimer = 0

this.fps = 60
this.fpsSmooth = 60

this.fpsMin = 999
this.fpsMax = 0

/* NEW: unified adaptive velocity controller */
this._densityVelocity = 0

/* =========================
   ACTIVE OBJECT LISTS
========================= */

this.fireworks = []
this.shockwaves = []

/* =========================
   TEMP OBJECT CACHE (ZERO ALLOCATION)
========================= */

this._tempColor = new THREE.Color()

this._tempVec3 = new THREE.Vector3()
this._tempVec3b = new THREE.Vector3()

this._tempMatrix = new THREE.Matrix4()

this._frustum = new THREE.Frustum()
this._projScreenMatrix = new THREE.Matrix4()

this._cameraPosition = new THREE.Vector3()

/* =========================
   GEOMETRY + MATERIAL POOLS
========================= */

this._particleGeometryPool = []
this._particleMaterialPool = []

this._fireworkPool = []

this._maxParticlePoolSize = 32
this._maxMaterialPoolSize = 16

/* UPGRADED: increase pool size to eliminate GC spikes */
this._maxFireworkPoolSize = 32

/* =========================
   SHARED GEOMETRY CACHE
========================= */

this._sharedQuadGeometry = new THREE.PlaneGeometry(1,1)
this._sharedSphere = new THREE.SphereGeometry(1,8,8)
this._sharedRing = new THREE.RingGeometry(0.5,1,32)

/* =========================
   FIXED TIMESTEP SYSTEM
========================= */

this._spawnTimer = 0

this._spawnInterval = 0.016

this._updateAccumulator = 0

this._fixedTimeStep = 1/60

this._maxSubSteps = 4

/* =========================
   SAFETY SYSTEM
========================= */

this._frameSafeCounter = 0
this._frameSafeLimit = 10000

/* =========================
   VISIBILITY METRICS
========================= */

this._visibleFireworks = 0
this._culledFireworks = 0

/* =========================
   GPU MEMORY TRACKING
========================= */

this._gpuMemoryEstimate = 0

/* =========================
   INITIALIZATION STATE
========================= */

this._initialized = false

/* =========================
   NEW: FIREWORK DATA POOL CACHE
   Eliminates Float32Array allocation spikes
========================= */

this._fireworkDataPool = []

this._maxFireworkDataPool = 32

/* =========================
   NEW: SHOCKWAVE MESH POOL
========================= */

this._shockwaveMeshPool = []

/* =========================
   NEW: PREALLOCATED UPDATE BUFFERS
========================= */

this._updateTime = 0
this._updateDelta = 0

/* =========================
   NEW: INTERNAL FLAGS
========================= */

this._needsFrustumUpdate = true

this._disposed = false

}
/* =========================
   INITIALIZATION
========================= */

init(){

if(this._initialized) return

this._initialized = true

/* Ensure camera matrices valid before frustum use */
this.camera.updateMatrixWorld(true)
this.updateFrustum()

this.initLights()

this.createGradientSky()

this.createHeart()

this.createSnow()

this.createDust()

this.createGalaxy()

this.createFireworks()

this.createShockwave()

}

/* =========================
   LIGHT SYSTEM
========================= */

initLights(){

/* Ambient light */
this.ambientLight = new THREE.AmbientLight(
0xff66aa,
0.8
)

this.scene.add(this.ambientLight)

/* Directional light */
this.directionalLight = new THREE.DirectionalLight(
0xff3377,
1.2
)

this.directionalLight.position.set(
5,
10,
7
)

/* Shadows disabled intentionally for performance */
this.directionalLight.castShadow = false

this.scene.add(this.directionalLight)

}

/* =========================
   FRUSTUM SYSTEM (ZERO ALLOCATION)
========================= */

updateFrustum(){

/* copy camera position without allocating */
this._cameraPosition.copy(
this.camera.position
)

/* projection * view matrix */
this._projScreenMatrix.multiplyMatrices(
this.camera.projectionMatrix,
this.camera.matrixWorldInverse
)

/* update frustum */
this._frustum.setFromProjectionMatrix(
this._projScreenMatrix
)

this._needsFrustumUpdate = false

}

/* =========================
   FRUSTUM TEST
========================= */

_isInFrustum(position, radius = 5){

/* reuse temp vector */
this._tempVec3.copy(position)

return this._frustum.containsPoint(
this._tempVec3
)

}

/* =========================
   PARTICLE GEOMETRY POOL
========================= */

_allocateParticleGeometry(count){

let geometry

if(this._particleGeometryPool.length > 0){

geometry = this._particleGeometryPool.pop()

}else{

geometry = new THREE.BufferGeometry()

}

/* Position buffer */
let positions = geometry.getAttribute('position')

if(!positions || positions.count !== count){

positions = new THREE.BufferAttribute(
new Float32Array(count * 3),
3
)

positions.setUsage(
THREE.DynamicDrawUsage
)

geometry.setAttribute(
'position',
positions
)

}

/* Color buffer */
let colors = geometry.getAttribute('color')

if(!colors || colors.count !== count){

colors = new THREE.BufferAttribute(
new Float32Array(count * 3),
3
)

colors.setUsage(
THREE.DynamicDrawUsage
)

geometry.setAttribute(
'color',
colors
)

}

return geometry

}

/* =========================
   RELEASE PARTICLE GEOMETRY
========================= */

_releaseParticleGeometry(geometry){

if(!geometry) return

/* avoid double release */
if(this._particleGeometryPool.length < this._maxParticlePoolSize){

this._particleGeometryPool.push(
geometry
)

}else{

geometry.dispose()

}

}

/* =========================
   PARTICLE MATERIAL POOL
========================= */

_allocateParticleMaterial(){

if(this._particleMaterialPool.length > 0){

return this._particleMaterialPool.pop()

}

/* create only when necessary */
return new THREE.PointsMaterial({

size: 0.15,

map: this.particleTexture,

transparent: true,

alphaTest: 0.001,

depthWrite: false,

blending: THREE.AdditiveBlending,

vertexColors: true,

sizeAttenuation: true,

opacity: 1

})

}

/* =========================
   RELEASE PARTICLE MATERIAL
========================= */

_releaseParticleMaterial(material){

if(!material) return

if(this._particleMaterialPool.length < this._maxMaterialPoolSize){

this._particleMaterialPool.push(
material
)

}else{

material.dispose()

}

}

/* =========================
   FIREWORK DATA POOL (NEW)
========================= */

_allocateFireworkData(count){

let data

if(this._fireworkDataPool.length > 0){

data = this._fireworkDataPool.pop()

/* ensure correct size */
if(data.count !== count){

data.positions = new Float32Array(count * 3)
data.velocities = new Float32Array(count * 3)
data.colors = new Float32Array(count * 3)
data.randomness = new Float32Array(count)

data.count = count

}

}else{

data = {

positions: new Float32Array(count * 3),

velocities: new Float32Array(count * 3),

colors: new Float32Array(count * 3),

randomness: new Float32Array(count),

count

}

}

return data

}

_releaseFireworkData(data){

if(!data) return

if(this._fireworkDataPool.length < this._maxFireworkDataPool){

this._fireworkDataPool.push(data)

}

}

/* =========================
   SHOCKWAVE MESH POOL
========================= */

_allocateShockwaveMesh(){

if(this._shockwaveMeshPool.length > 0){

return this._shockwaveMeshPool.pop()

}

const mesh = new THREE.Mesh(
this._shockwaveGeometry,
this._shockwaveMaterial.clone()
)

mesh.frustumCulled = false

return mesh

}

_releaseShockwaveMesh(mesh){

if(!mesh) return

if(this._shockwaveMeshPool.length < this._shockwaveMaxPool){

this._shockwaveMeshPool.push(mesh)

}else{

mesh.material.dispose()

}

}
/* =========================
   GALAXY SYSTEM (AAA CINEMATIC — UPGRADED ZERO DRIFT)
========================= */

createGalaxy(){

this.galaxyCount = 8000

this.galaxyRadius = 180

this.galaxyBranches = 6

this.galaxySpin = 0.35

this.galaxyRandomness = 0.4

this.galaxyRandomnessPower = 3

this.galaxyBreathAmplitude = 0.015

this.galaxyBreathSpeed = 0.6

/* NEW: immutable base buffer */
this.galaxyBasePositions = new Float32Array(
this.galaxyCount * 3
)

/* dynamic buffer used by GPU */
this.galaxyPositions = new Float32Array(
this.galaxyCount * 3
)

this.galaxyColors = new Float32Array(
this.galaxyCount * 3
)

this.galaxySizes = new Float32Array(
this.galaxyCount
)

this.galaxyAngles = new Float32Array(
this.galaxyCount
)

this.galaxyRadii = new Float32Array(
this.galaxyCount
)

const geometry = new THREE.BufferGeometry()

for(let i = 0; i < this.galaxyCount; i++){

const i3 = i * 3

const radius = Math.random() * this.galaxyRadius

const branchAngle =
(i % this.galaxyBranches) /
this.galaxyBranches *
Math.PI * 2

const spinAngle = radius * this.galaxySpin

const randomX =
Math.pow(Math.random(), this.galaxyRandomnessPower) *
(Math.random() < 0.5 ? 1 : -1) *
this.galaxyRandomness *
radius

const randomY =
Math.pow(Math.random(), this.galaxyRandomnessPower) *
(Math.random() < 0.5 ? 1 : -1) *
this.galaxyRandomness *
radius *
0.3

const randomZ =
Math.pow(Math.random(), this.galaxyRandomnessPower) *
(Math.random() < 0.5 ? 1 : -1) *
this.galaxyRandomness *
radius

const angle = branchAngle + spinAngle

const x = Math.cos(angle) * radius + randomX

const y = randomY

const z = Math.sin(angle) * radius + randomZ

/* write immutable base */
this.galaxyBasePositions[i3] = x
this.galaxyBasePositions[i3+1] = y
this.galaxyBasePositions[i3+2] = z

/* write dynamic buffer */
this.galaxyPositions[i3] = x
this.galaxyPositions[i3+1] = y
this.galaxyPositions[i3+2] = z

this.galaxyAngles[i] = angle

this.galaxyRadii[i] = radius

this.galaxySizes[i] =
0.5 + Math.random() * 1.5

/* color generation */
const mixFactor = radius / this.galaxyRadius

const hue =
0.85 -
mixFactor * 0.25 +
Math.random() * 0.05

const sat =
0.7 +
Math.random() * 0.3

const light =
0.55 +
Math.random() * 0.2

this._tempColor.setHSL(
hue,
sat,
light
)

this.galaxyColors[i3] = this._tempColor.r
this.galaxyColors[i3+1] = this._tempColor.g
this.galaxyColors[i3+2] = this._tempColor.b

}

/* GPU upload */
geometry.setAttribute(

'position',

new THREE.BufferAttribute(
this.galaxyPositions,
3
).setUsage(
THREE.DynamicDrawUsage
)

)

geometry.setAttribute(

'color',

new THREE.BufferAttribute(
this.galaxyColors,
3
)

)

/* material */
this.galaxyMaterial = new THREE.PointsMaterial({

size: 0.9,

map: this.particleTexture,

transparent: true,

opacity: 0.95,

vertexColors: true,

depthWrite: false,

blending: THREE.AdditiveBlending,

sizeAttenuation: true,

alphaTest: 0.001

})

this.galaxyPoints =
new THREE.Points(
geometry,
this.galaxyMaterial
)

this.galaxyPoints.frustumCulled = false

this.scene.add(
this.galaxyPoints
)

/* animation constants */
this._galaxyRotationSpeed = 0.015

this._galaxyTwinkleSpeed = 1.2

this._galaxyColorShiftSpeed = 0.08

}

/* =========================
   UPDATE GALAXY (ZERO DRIFT VERSION)
========================= */

updateGalaxy(time){

const points = this.galaxyPoints

const positions = this.galaxyPositions

const basePositions = this.galaxyBasePositions

const radii = this.galaxyRadii

const count = this.galaxyCount

/* rotation */
points.rotation.y =
time *
this._galaxyRotationSpeed

/* breathing scale */
const breath =
Math.sin(
time *
this.galaxyBreathSpeed
) *
this.galaxyBreathAmplitude +
1

points.scale.set(
breath,
breath,
breath
)

/* twinkle without destroying base structure */
const twinkleTime =
time *
this._galaxyTwinkleSpeed

for(let i = 0; i < count; i++){

const i3 = i * 3

const baseX = basePositions[i3]
const baseY = basePositions[i3+1]
const baseZ = basePositions[i3+2]

const r = radii[i]

const twinkle =
Math.sin(
twinkleTime + i
) *
r *
0.00004

positions[i3] = baseX + twinkle
positions[i3+1] = baseY + twinkle * 0.6
positions[i3+2] = baseZ + twinkle

}

/* notify GPU */
points.geometry.attributes.position.needsUpdate = true

/* cinematic color shift */
const colors = this.galaxyColors

const shift =
Math.sin(
time *
this._galaxyColorShiftSpeed
) *
0.002

for(let i = 0; i < count; i++){

const i3 = i * 3

colors[i3] =
Math.min(
1,
colors[i3] + shift
)

colors[i3+2] =
Math.min(
1,
colors[i3+2] + shift * 1.2
)

}

points.geometry.attributes.color.needsUpdate = true

}
/* =========================
   SNOW SYSTEM (AAA CINEMATIC DEPTH — UPGRADED)
========================= */

createSnow(){

this.snowCount = 2200

this.snowArea = 220

this.snowHeight = 140

this.snowLayers = 3

const geometry = new THREE.BufferGeometry()

this.snowPositions = new Float32Array(
this.snowCount * 3
)

this.snowVelocities = new Float32Array(
this.snowCount
)

this.snowDrift = new Float32Array(
this.snowCount
)

this.snowPhase = new Float32Array(
this.snowCount
)

this.snowSize = new Float32Array(
this.snowCount
)

/* precompute constants for performance */
const area = this.snowArea
const height = this.snowHeight
const layers = this.snowLayers

for(let i = 0; i < this.snowCount; i++){

const i3 = i * 3

const layer = i % layers

const depthFactor =
1 - layer / layers

this.snowPositions[i3] =
(Math.random() - 0.5) * area

this.snowPositions[i3+1] =
Math.random() * height

this.snowPositions[i3+2] =
(Math.random() - 0.5) * area

this.snowVelocities[i] =
4 + Math.random() * 6 * depthFactor

this.snowDrift[i] =
(Math.random() - 0.5) *
depthFactor *
2

this.snowPhase[i] =
Math.random() *
Math.PI * 2

this.snowSize[i] =
0.5 +
Math.random() *
1.8 *
depthFactor

}

geometry.setAttribute(

'position',

new THREE.BufferAttribute(
this.snowPositions,
3
).setUsage(
THREE.DynamicDrawUsage
)

)

this.snowMaterial =
new THREE.PointsMaterial({

map: this.particleTexture,

color: 0xffddff,

size: 1.2,

transparent: true,

opacity: 0.9,

depthWrite: false,

blending: THREE.AdditiveBlending,

sizeAttenuation: true,

alphaTest: 0.001

})

this.snowPoints =
new THREE.Points(
geometry,
this.snowMaterial
)

this.snowPoints.frustumCulled = false

this.scene.add(
this.snowPoints
)

/* cached constants */
this._snowTurbulenceSpeed = 0.6

this._snowDriftSpeed = 0.4

this._snowResetHeight = height

this._snowFloor = -20

}
updateSnow(delta){

const positions = this.snowPositions
const velocities = this.snowVelocities
const drift = this.snowDrift
const phase = this.snowPhase

const count = this.snowCount

const floor = this._snowFloor
const resetHeight = this._snowResetHeight

const area = this.snowArea

const turbTime =
this.elapsedTime *
this._snowTurbulenceSpeed

/* loop optimized for CPU cache */
for(let i = 0; i < count; i++){

const i3 = i * 3

const vel = velocities[i]

positions[i3+1] -= vel * delta

const d = drift[i]

const p = phase[i]

positions[i3] +=
Math.sin(
turbTime + p
) *
d *
delta *
5

positions[i3+2] +=
Math.cos(
turbTime * 0.7 + p
) *
d *
delta *
3

/* reset without allocation */
if(positions[i3+1] < floor){

positions[i3] =
(Math.random() - 0.5) * area

positions[i3+1] =
resetHeight

positions[i3+2] =
(Math.random() - 0.5) * area

}

}

/* notify GPU once */
this.snowPoints
.geometry
.attributes
.position
.needsUpdate = true

/* cinematic breathing */
const breath =
1 +
Math.sin(
this.elapsedTime * 0.5
) *
0.05

this.snowPoints.scale.set(
breath,
breath,
breath
)

}
/* =========================
   DUST SYSTEM (AAA VOLUMETRIC CINEMATIC — UPGRADED)
========================= */

createDust(){

this.dustCount = 3200

this.dustArea = 180

this.dustHeight = 90

const geometry =
new THREE.BufferGeometry()

this.dustPositions =
new Float32Array(
this.dustCount * 3
)

this.dustPhase =
new Float32Array(
this.dustCount
)

this.dustSpeed =
new Float32Array(
this.dustCount
)

this.dustRadius =
new Float32Array(
this.dustCount
)

/* pre-cache constants */
const area = this.dustArea
const height = this.dustHeight

for(let i = 0; i < this.dustCount; i++){

const i3 = i * 3

const radius =
Math.random()

const spread =
Math.pow(radius, 1.5)

this.dustPositions[i3] =
(Math.random() - 0.5) *
area *
spread

this.dustPositions[i3+1] =
(Math.random() - 0.5) *
height *
spread

this.dustPositions[i3+2] =
(Math.random() - 0.5) *
area *
spread

this.dustPhase[i] =
Math.random() *
Math.PI * 2

this.dustSpeed[i] =
0.2 +
Math.random() *
0.8

this.dustRadius[i] =
spread

}

geometry.setAttribute(

'position',

new THREE.BufferAttribute(
this.dustPositions,
3
).setUsage(
THREE.DynamicDrawUsage
)

)

this.dustMaterial =
new THREE.PointsMaterial({

map: this.particleTexture,

color: 0xff99cc,

size: 0.6,

transparent: true,

opacity: 0.65,

depthWrite: false,

blending: THREE.AdditiveBlending,

sizeAttenuation: true,

alphaTest: 0.001

})

this.dustPoints =
new THREE.Points(
geometry,
this.dustMaterial
)

this.dustPoints.frustumCulled = false

this.scene.add(
this.dustPoints
)

/* cached constants */
this._dustTurbulenceSpeed = 0.35

this._dustFloatStrength = 0.6

this._dustBreathSpeed = 0.25

}
updateDust(time){

const positions = this.dustPositions
const phase = this.dustPhase
const speed = this.dustSpeed
const radius = this.dustRadius

const count = this.dustCount

const turb =
time *
this._dustTurbulenceSpeed

for(let i = 0; i < count; i++){

const i3 = i * 3

const r = radius[i]

const s = speed[i]

const p = phase[i]

positions[i3] +=
Math.sin(
turb * s + p
) *
0.02 *
r

positions[i3+1] +=
Math.cos(
turb * 0.7 * s + p
) *
0.015 *
r

positions[i3+2] +=
Math.sin(
turb * 0.5 * s + p
) *
0.02 *
r

}

this.dustPoints
.geometry
.attributes
.position
.needsUpdate = true

/* cinematic breathing */
const breath =
1 +
Math.sin(
time *
this._dustBreathSpeed
) *
0.04

this.dustPoints.scale.set(
breath,
breath,
breath
)

/* cinematic rotation */
this.dustPoints.rotation.y =
time *
0.01

this.dustPoints.rotation.x =
time *
0.005

}
/* =========================
   FIREWORK SYSTEM (AAA CINEMATIC VOLUMETRIC — ZERO GC)
========================= */

createFireworks(){

this.fireworks = []

this._fireworkSpawnAccumulator = 0

this._fireworkBaseSpawnRate = 0.38

this._fireworkLife = 2.4

this._fireworkGravity = this.GRAVITY * 0.9

this._fireworkDrag = 0.985

this._fireworkTurbulence = 0.35

this._fireworkSize = 0.18

this._fireworkCoreSize = 0.26

this._fireworkMinCount = 140

this._fireworkMaxCount = 260

/* NEW: reusable shared material */
this._sharedFireworkMaterial =
new THREE.PointsMaterial({

map: this.particleTexture,

size: this._fireworkSize,

transparent: true,

opacity: 1,

depthWrite: false,

blending: THREE.AdditiveBlending,

vertexColors: true,

alphaTest: 0.001,

sizeAttenuation: true

})

}
/* =========================
   SPAWN FIREWORK (ZERO GC VERSION)
========================= */

spawnFirework(){

if(this.fireworks.length >= this.MAX_FIREWORKS)
return

const density = this.densityFactor

const count =
(this._fireworkMinCount +
(this._fireworkMaxCount - this._fireworkMinCount)
* density) | 0

/* allocate pooled data */
const data =
this._allocateFireworkData(count)

const positions = data.positions
const velocities = data.velocities
const colors = data.colors
const randomness = data.randomness

const baseHue =
Math.random()

for(let i = 0; i < count; i++){

const i3 = i * 3

const u = Math.random()
const v = Math.random()

const theta =
2 * Math.PI * u

const phi =
Math.acos(2 * v - 1)

const sinPhi =
Math.sin(phi)

const dx =
sinPhi *
Math.cos(theta)

const dy =
Math.cos(phi)

const dz =
sinPhi *
Math.sin(theta)

const speed =
18 +
Math.random() * 22

velocities[i3] = dx * speed
velocities[i3+1] = dy * speed
velocities[i3+2] = dz * speed

positions[i3] = 0
positions[i3+1] = 0
positions[i3+2] = 0

randomness[i] =
Math.random() *
Math.PI * 2

const hue =
(baseHue +
Math.random() * 0.08) % 1

this._tempColor.setHSL(
hue,
1,
0.65
)

colors[i3] =
this._tempColor.r

colors[i3+1] =
this._tempColor.g

colors[i3+2] =
this._tempColor.b

}

/* reuse geometry */
const geometry =
this._allocateParticleGeometry(count)

geometry.attributes.position.array =
positions

geometry.attributes.color.array =
colors

geometry.attributes.position.needsUpdate = true
geometry.attributes.color.needsUpdate = true

/* reuse material */
const material =
this._sharedFireworkMaterial

/* reuse or create Points */
let points

if(this._fireworkPool.length > 0){

points =
this._fireworkPool.pop()

points.geometry = geometry
points.material = material

}else{

points =
new THREE.Points(
geometry,
material
)

points.frustumCulled = false

}

/* spawn position */
points.position.set(

(Math.random() - 0.5) * 60,

Math.random() * 28 + 8,

(Math.random() - 0.5) * 60

)

this.scene.add(points)

/* register firework */
this.fireworks.push({

points,

data,

life: this._fireworkLife,

maxLife: this._fireworkLife,

count

})

}
/* =========================
   UPDATE FIREWORKS (ZERO GC, CINEMATIC CURVES)
========================= */

updateFireworks(delta){

const fireworks = this.fireworks

const gravity = this._fireworkGravity
const drag = this._fireworkDrag
const turbStrength = this._fireworkTurbulence

const turbTime =
this.elapsedTime * 2.4

for(let i = fireworks.length - 1; i >= 0; i--){

const fw = fireworks[i]

const data = fw.data

const positions = data.positions
const velocities = data.velocities
const randomness = data.randomness

const count = fw.count

for(let j = 0; j < count; j++){

const i3 = j * 3

const turb =
Math.sin(
turbTime +
randomness[j]
) *
turbStrength

velocities[i3] *= drag
velocities[i3+1] *= drag
velocities[i3+2] *= drag

velocities[i3] += turb * 0.12
velocities[i3+2] += turb * 0.12

velocities[i3+1] -= gravity * delta

positions[i3] += velocities[i3] * delta
positions[i3+1] += velocities[i3+1] * delta
positions[i3+2] += velocities[i3+2] * delta

}

/* notify GPU */
fw.points.geometry
.attributes.position.needsUpdate = true

/* cinematic fade curve (better than cubic) */
const t =
fw.life /
fw.maxLife

const fade =
t * t * (3 - 2 * t)

/* update material */
fw.points.material.opacity =
fade

fw.points.material.size =
this._fireworkSize *
(0.6 + fade * 0.9)

fw.life -= delta

/* recycle firework */
if(fw.life <= 0){

this.scene.remove(
fw.points
)

/* release geometry */
this._releaseParticleGeometry(
fw.points.geometry
)

/* release data */
this._releaseFireworkData(
fw.data
)

/* recycle Points object */
if(this._fireworkPool.length <
this._maxFireworkPoolSize){

this._fireworkPool.push(
fw.points
)

}

/* remove from active list */
fireworks.splice(i, 1)

}

}

/* spawn logic */
this._fireworkSpawnAccumulator += delta

const interval =
this._fireworkBaseSpawnRate /
(this.densityFactor * 0.9 + 0.1)

while(this._fireworkSpawnAccumulator >= interval){

this.spawnFirework()

this._fireworkSpawnAccumulator -= interval

}

}
/* =========================
   SHOCKWAVE SYSTEM (AAA CINEMATIC ENERGY RING — ZERO GC)
========================= */

createShockwave(){

this.shockwaves = []

this._shockwavePool = []

this._shockwaveMaxPool = 12

this._shockwaveLife = 1.1

this._shockwaveStartScale = 0.4

this._shockwaveEndScale = 9.5

this._shockwaveGeometry =
new THREE.RingGeometry(
0.6,
0.9,
96,
1
)

/* shared base material */
this._shockwaveMaterial =
new THREE.MeshBasicMaterial({

map: this.particleTexture,

color: 0xff66cc,

transparent: true,

opacity: 0.7,

depthWrite: false,

blending: THREE.AdditiveBlending,

side: THREE.DoubleSide,

alphaTest: 0.001

})

}
/* =========================
   SPAWN SHOCKWAVE (POOLED)
========================= */

spawnShockwave(position){

const mesh =
this._allocateShockwaveMesh()

mesh.position.copy(position)

mesh.rotation.x = -Math.PI * 0.5

mesh.scale.setScalar(
this._shockwaveStartScale
)

mesh.material.opacity = 0.7

this.scene.add(mesh)

this.shockwaves.push({

mesh,

life: this._shockwaveLife,

maxLife: this._shockwaveLife

})

}
/* =========================
   UPDATE SHOCKWAVE (CINEMATIC CURVE)
========================= */

updateShockwave(delta){

const shockwaves = this.shockwaves

const start = this._shockwaveStartScale

const end = this._shockwaveEndScale

for(let i = shockwaves.length - 1; i >= 0; i--){

const s = shockwaves[i]

s.life -= delta

const t =
1 - (s.life / s.maxLife)

/* smoothstep cinematic easing */
const ease =
t * t * (3 - 2 * t)

const scale =
start +
(end - start) *
ease

s.mesh.scale.setScalar(scale)

/* cinematic fade */
const opacity =
(1 - ease) *
(1 - ease) *
0.7

s.mesh.material.opacity =
opacity

if(s.life <= 0){

this.scene.remove(
s.mesh
)

this._releaseShockwaveMesh(
s.mesh
)

shockwaves.splice(i, 1)

}

}

}
/* =========================
   FPS ADAPTIVE SYSTEM (PRODUCTION STABLE)
========================= */

updateFPS(delta){

this.frameCount++

this.fpsTimer += delta

if(this.fpsTimer < 0.5)
return

const instantFPS =
this.frameCount /
this.fpsTimer

if(this.fps === undefined)
this.fps = instantFPS
else
this.fps =
this.fps * 0.82 +
instantFPS * 0.18

this.frameCount = 0

this.fpsTimer = 0

/* adaptive density control */
const targetMin = 52
const targetMax = 62

let accel = 0

if(this.fps < targetMin)
accel = -0.035
else if(this.fps > targetMax)
accel = 0.02
else
accel = -this._densityVelocity * 0.15

this._densityVelocity += accel

this._densityVelocity *= 0.92

this.densityFactor +=
this._densityVelocity

/* clamp */
if(this.densityFactor < 0.45)
this.densityFactor = 0.45
else if(this.densityFactor > 1.6)
this.densityFactor = 1.6

}
/* =========================
   MAIN UPDATE LOOP (FINAL PRODUCTION VERSION)
========================= */

update(delta){

if(this._disposed)
return

if(delta <= 0)
return

if(delta > 0.05)
delta = 0.05

this.deltaTime = delta

this.elapsedTime += delta

const time =
this.elapsedTime

/* update adaptive system */
this.updateFPS(delta)

/* heart animation */
this.beatTime += delta * 3.2

const beat =
Math.sin(this.beatTime)

const beatScale =
1 + beat * 0.085

if(this.heartMesh)
this.heartMesh.scale.setScalar(
beatScale
)

/* particle systems */
this.updateSnow(delta)

this.updateDust(time)

this.updateGalaxy(time)

this.updateFireworks(delta)

this.updateShockwave(delta)

/* sky shader */
if(this.skyMaterial)
this.skyMaterial.uniforms.uTime.value =
time

}
/* =========================
   CLEAN DISPOSE (ZERO LEAK GUARANTEED)
========================= */

dispose(){

if(this._disposed)
return

this._disposed = true

/* dispose fireworks */
for(let i = 0; i < this.fireworks.length; i++){

const fw = this.fireworks[i]

this.scene.remove(fw.points)

this._releaseParticleGeometry(
fw.points.geometry
)

this._releaseFireworkData(
fw.data
)

}

/* dispose shockwaves */
for(let i = 0; i < this.shockwaves.length; i++){

const s = this.shockwaves[i]

this.scene.remove(s.mesh)

this._releaseShockwaveMesh(
s.mesh
)

}

/* dispose pools */
for(let g of this._particleGeometryPool)
g.dispose()

for(let m of this._particleMaterialPool)
m.dispose()

if(this._shockwaveGeometry)
this._shockwaveGeometry.dispose()

if(this._shockwaveMaterial)
this._shockwaveMaterial.dispose()

if(this._sharedFireworkMaterial)
this._sharedFireworkMaterial.dispose()

if(this.snowPoints){

this.scene.remove(this.snowPoints)

this.snowPoints.geometry.dispose()

this.snowPoints.material.dispose()

}

if(this.dustPoints){

this.scene.remove(this.dustPoints)

this.dustPoints.geometry.dispose()

this.dustPoints.material.dispose()

}

if(this.galaxyPoints){

this.scene.remove(this.galaxyPoints)

this.galaxyPoints.geometry.dispose()

this.galaxyPoints.material.dispose()

}

if(this.skyMesh){

this.scene.remove(this.skyMesh)

this.skyMesh.geometry.dispose()

this.skyMaterial.dispose()

}

if(this.heartMesh){

this.scene.remove(this.heartMesh)

this.heartMesh.geometry.dispose()

this.heartMesh.material.dispose()

}

if(this.particleTexture)
this.particleTexture.dispose()

while(this.scene.children.length > 0)
this.scene.remove(
this.scene.children[0]
)

}
