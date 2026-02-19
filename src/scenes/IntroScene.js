import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){
/* =========================
   CORE REFERENCES
========================= */
this.camera = camera
this.scene = new THREE.Scene()
/* =========================
   DISPOSE FLAG
========================= */
this._disposed = false
/* =========================
   TEXTURE SYSTEM
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
   TIME SYSTEM
========================= */
this.clock = new THREE.Clock()
this.elapsedTime = 0
this.deltaTime = 0
this.beatTime = 0
/* =========================
   PHYSICS CONSTANTS
========================= */
this.GRAVITY = 9.8 * 0.5
/* =========================
   FPS SYSTEM
========================= */
this.frameCount = 0
this.fpsTimer = 0
this.fps = 60
this.fpsSmooth = 60
this.densityFactor = 1
this._densityVelocity = 0
/* =========================
   FRUSTUM SYSTEM (ZERO ALLOCATION)
========================= */
this._frustum = new THREE.Frustum()
this._projScreenMatrix = new THREE.Matrix4()
this._cameraPosition = new THREE.Vector3()
this._tempVec3 = new THREE.Vector3()
this._tempColor = new THREE.Color()
/* =========================
   FIREWORK CONSTANTS
========================= */
this.MAX_FIREWORKS = 12
this._fireworkMinCount = 140
this._fireworkMaxCount = 260
/* LOCK MAX SIZE → ZERO resize allocation */
this._fireworkMaxParticleCapacity =
this._fireworkMaxCount
/* =========================
   MEMORY POOLS
========================= */
this._particleGeometryPool = new Array(32)
this._particleGeometryPoolCount = 0
this._particleMaterialPool = new Array(32)
this._particleMaterialPoolCount = 0
this._fireworkMeshPool = new Array(32)
this._fireworkMeshPoolCount = 0
this._fireworkDataPool = new Array(32)
this._fireworkDataPoolCount = 0
this._shockwaveMeshPool = new Array(16)
this._shockwaveMeshPoolCount = 0
/* =========================
   ACTIVE OBJECT LISTS
========================= */
this.fireworks = new Array(this.MAX_FIREWORKS)
this.fireworkCount = 0
this.shockwaves = new Array(16)
this.shockwaveCount = 0
/* =========================
   PREALLOCATED SHARED GEOMETRIES
========================= */
this._sharedQuadGeometry =
new THREE.PlaneGeometry(1,1)
this._shockwaveGeometry =
new THREE.RingGeometry(
0.6,
0.9,
96,
1
)
/* =========================
   SHARED MATERIAL TEMPLATES
========================= */
this._fireworkMaterialTemplate =
new THREE.PointsMaterial({
map: this.particleTexture,
size: 0.18,
transparent: true,
opacity: 1,
depthWrite: false,
blending: THREE.AdditiveBlending,
vertexColors: true,
sizeAttenuation: true,
alphaTest: 0.001
})
this._shockwaveMaterialTemplate =
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
/* =========================
   FIREWORK DATA PREALLOC POOL
========================= */
this._prewarmFireworkDataPool()
/* =========================
   FIREWORK GEOMETRY PREALLOC
========================= */
this._prewarmGeometryPool()
/* =========================
   FIREWORK MESH PREALLOC
========================= */
this._prewarmMeshPool()
/* =========================
   SHOCKWAVE POOL PREALLOC
========================= */
this._prewarmShockwavePool()
/* =========================
   INITIALIZATION FLAG
========================= */
this._initialized = false
}
/* =========================
   PREWARM FIREWORK DATA POOL
========================= */
_prewarmFireworkDataPool(){
const capacity =
this._fireworkMaxParticleCapacity
for(let i = 0; i < 32; i++){
const data = {
positions:
new Float32Array(capacity * 3),
velocities:
new Float32Array(capacity * 3),
colors:
new Float32Array(capacity * 3),
randomness:
new Float32Array(capacity),
count: 0
}
this._fireworkDataPool[
this._fireworkDataPoolCount++
] = data
}
}
/* =========================
   PREWARM GEOMETRY POOL
========================= */
_prewarmGeometryPool(){
const capacity =
this._fireworkMaxParticleCapacity
for(let i = 0; i < 32; i++){
const geometry =
new THREE.BufferGeometry()
const pos =
new THREE.BufferAttribute(
new Float32Array(capacity * 3),
3
)
pos.setUsage(
THREE.DynamicDrawUsage
)
const col =
new THREE.BufferAttribute(
new Float32Array(capacity * 3),
3
)
col.setUsage(
THREE.DynamicDrawUsage
)
geometry.setAttribute(
'position',
pos
)
geometry.setAttribute(
'color',
col
)
this._particleGeometryPool[
this._particleGeometryPoolCount++
] = geometry
}
}
/* =========================
   PREWARM FIREWORK MESH POOL
========================= */
_prewarmMeshPool(){
for(let i = 0; i < 32; i++){
const material =
this._fireworkMaterialTemplate.clone()
const geometry =
this._particleGeometryPool[
--this._particleGeometryPoolCount
]
const mesh =
new THREE.Points(
geometry,
material
)
mesh.frustumCulled = false
mesh.visible = false
this._fireworkMeshPool[
this._fireworkMeshPoolCount++
] = mesh
}
}
/* =========================
   PREWARM SHOCKWAVE POOL
========================= */
_prewarmShockwavePool(){
for(let i = 0; i < 16; i++){
const material =
this._shockwaveMaterialTemplate.clone()
const mesh =
new THREE.Mesh(
this._shockwaveGeometry,
material
)
mesh.visible = false
mesh.frustumCulled = false
this._shockwaveMeshPool[
this._shockwaveMeshPoolCount++
] = mesh
}
}
_allocateFireworkData(){
if(this._fireworkDataPoolCount === 0)
return null
return this._fireworkDataPool[
--this._fireworkDataPoolCount
]
}
_releaseFireworkData(data){
this._fireworkDataPool[
this._fireworkDataPoolCount++
] = data
}
_allocateFireworkMesh(){
if(this._fireworkMeshPoolCount === 0)
return null
const mesh =
this._fireworkMeshPool[
--this._fireworkMeshPoolCount
]
mesh.visible = true
return mesh
}
_releaseFireworkMesh(mesh){
mesh.visible = false
this._fireworkMeshPool[
this._fireworkMeshPoolCount++
] = mesh
}
_allocateShockwaveMesh(){
if(this._shockwaveMeshPoolCount === 0)
return null
const mesh =
this._shockwaveMeshPool[
--this._shockwaveMeshPoolCount
]
mesh.visible = true
return mesh
}
_releaseShockwaveMesh(mesh){
mesh.visible = false
this._shockwaveMeshPool[
this._shockwaveMeshPoolCount++
] = mesh
}
/* =========================
   INITIALIZATION
========================= */
init(){
if(this._initialized)
return
this._initialized = true
this.camera.updateMatrixWorld(true)
this.updateFrustum()
this.initLights()
this.createGalaxy()
this.createSnow()
this.createDust()
this.createFireworks()
this.createShockwave()
}
updateFrustum(){
this._cameraPosition.copy(
this.camera.position
)
this._projScreenMatrix.multiplyMatrices(
this.camera.projectionMatrix,
this.camera.matrixWorldInverse
)
this._frustum.setFromProjectionMatrix(
this._projScreenMatrix
)
}
initLights(){
this.ambientLight =
new THREE.AmbientLight(
0xff66aa,
0.8
)
this.scene.add(
this.ambientLight
)
this.directionalLight =
new THREE.DirectionalLight(
0xff3377,
1.2
)
this.directionalLight.position.set(
5,
10,
7
)
this.directionalLight.castShadow = false
this.scene.add(
this.directionalLight
)
}
createGalaxy(){
const count = 8000
this.galaxyCount = count
this.galaxyRadius = 180
this.galaxyBranches = 6
this.galaxySpin = 0.35
this.galaxyBreathAmplitude = 0.015
this.galaxyBreathSpeed = 0.6
this._galaxyRotationSpeed = 0.015
this._galaxyTwinkleSpeed = 1.2
this._galaxyColorShiftSpeed = 0.08
/* immutable base */
this.galaxyBasePositions =
new Float32Array(count * 3)
this.galaxyPositions =
new Float32Array(count * 3)
this.galaxyColors =
new Float32Array(count * 3)
this.galaxyRadii =
new Float32Array(count)
const base = this.galaxyBasePositions
const pos = this.galaxyPositions
const col = this.galaxyColors
const radii = this.galaxyRadii
const radiusMax = this.galaxyRadius
const branches = this.galaxyBranches
const spin = this.galaxySpin
for(let i = 0; i < count; i++){
const i3 = i * 3
const radius =
Math.random() * radiusMax
const branch =
(i % branches) /
branches *
Math.PI * 2
const spinAngle =
radius * spin
const angle =
branch + spinAngle
const rand =
Math.random()
const rand2 =
Math.random()
const rand3 =
Math.random()
const x =
Math.cos(angle) * radius +
(rand - 0.5) * radius * 0.4
const y =
(rand2 - 0.5) *
radius * 0.15
const z =
Math.sin(angle) * radius +
(rand3 - 0.5) * radius * 0.4
base[i3] = x
base[i3+1] = y
base[i3+2] = z
pos[i3] = x
pos[i3+1] = y
pos[i3+2] = z
radii[i] = radius
this._tempColor.setHSL(
0.85 - radius / radiusMax * 0.3,
0.8,
0.65
)
col[i3] = this._tempColor.r
col[i3+1] = this._tempColor.g
col[i3+2] = this._tempColor.b
}
const geometry =
new THREE.BufferGeometry()
this._galaxyPositionAttr =
new THREE.BufferAttribute(
pos,
3
)
this._galaxyPositionAttr.setUsage(
THREE.DynamicDrawUsage
)
this._galaxyColorAttr =
new THREE.BufferAttribute(
col,
3
)
geometry.setAttribute(
'position',
this._galaxyPositionAttr
)
geometry.setAttribute(
'color',
this._galaxyColorAttr
)
this.galaxyMaterial =
new THREE.PointsMaterial({
map: this.particleTexture,
size: 0.9,
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
}
updateGalaxy(time){
const points = this.galaxyPoints
const pos = this.galaxyPositions
const base = this.galaxyBasePositions
const radii = this.galaxyRadii
const count = this.galaxyCount
points.rotation.y =
time *
this._galaxyRotationSpeed
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
const twTime =
time *
this._galaxyTwinkleSpeed
for(let i = 0; i < count; i++){
const i3 = i * 3
const r = radii[i]
const tw =
Math.sin(
twTime + i
) *
r *
0.00004
pos[i3] =
base[i3] + tw
pos[i3+1] =
base[i3+1] +
tw * 0.6
pos[i3+2] =
base[i3+2] + tw
}
this._galaxyPositionAttr.needsUpdate = true
}
createSnow(){
const count = 2200
this.snowCount = count
this.snowArea = 220
this.snowHeight = 140
this._snowFloor = -20
this._snowResetHeight =
this.snowHeight
this._snowTurbulenceSpeed = 0.6
this.snowPositions =
new Float32Array(count * 3)
this.snowVelocities =
new Float32Array(count)
this.snowDrift =
new Float32Array(count)
this.snowPhase =
new Float32Array(count)
const pos = this.snowPositions
const vel = this.snowVelocities
const drift = this.snowDrift
const phase = this.snowPhase
const area = this.snowArea
const height = this.snowHeight
for(let i = 0; i < count; i++){
const i3 = i * 3
pos[i3] =
(Math.random() - 0.5) * area
pos[i3+1] =
Math.random() * height
pos[i3+2] =
(Math.random() - 0.5) * area
vel[i] =
4 + Math.random() * 6
drift[i] =
(Math.random() - 0.5) * 2
phase[i] =
Math.random() *
Math.PI * 2
}
const geometry =
new THREE.BufferGeometry()
this._snowPositionAttr =
new THREE.BufferAttribute(
pos,
3
)
this._snowPositionAttr.setUsage(
THREE.DynamicDrawUsage
)
geometry.setAttribute(
'position',
this._snowPositionAttr
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
}
updateSnow(delta){
const pos = this.snowPositions
const vel = this.snowVelocities
const drift = this.snowDrift
const phase = this.snowPhase
const count = this.snowCount
const floor =
this._snowFloor
const reset =
this._snowResetHeight
const area =
this.snowArea
const turbTime =
this.elapsedTime *
this._snowTurbulenceSpeed
for(let i = 0; i < count; i++){
const i3 = i * 3
pos[i3+1] -=
vel[i] * delta
pos[i3] +=
Math.sin(
turbTime + phase[i]
) *
drift[i] *
delta * 5
pos[i3+2] +=
Math.cos(
turbTime * 0.7 +
phase[i]
) *
drift[i] *
delta * 3
if(pos[i3+1] < floor){
pos[i3] =
(Math.random() - 0.5) *
area
pos[i3+1] =
reset
pos[i3+2] =
(Math.random() - 0.5) *
area
}
}
this._snowPositionAttr.needsUpdate = true
}
createDust(){
const count = 3200
this.dustCount = count
this.dustArea = 180
this.dustHeight = 90
this._dustTurbulenceSpeed = 0.35
this._dustBreathSpeed = 0.25
this.dustPositions =
new Float32Array(count * 3)
this.dustPhase =
new Float32Array(count)
this.dustSpeed =
new Float32Array(count)
const pos = this.dustPositions
const phase = this.dustPhase
const speed = this.dustSpeed
const area = this.dustArea
const height = this.dustHeight
for(let i = 0; i < count; i++){
const i3 = i * 3
pos[i3] =
(Math.random() - 0.5) * area
pos[i3+1] =
(Math.random() - 0.5) * height
pos[i3+2] =
(Math.random() - 0.5) * area
phase[i] =
Math.random() *
Math.PI * 2
speed[i] =
0.2 +
Math.random() * 0.8
}
const geometry =
new THREE.BufferGeometry()
this._dustPositionAttr =
new THREE.BufferAttribute(
pos,
3
)
this._dustPositionAttr.setUsage(
THREE.DynamicDrawUsage
)
geometry.setAttribute(
'position',
this._dustPositionAttr
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
}
updateDust(time){
const pos = this.dustPositions
const phase = this.dustPhase
const speed = this.dustSpeed
const count = this.dustCount
const turb =
time *
this._dustTurbulenceSpeed
for(let i = 0; i < count; i++){
const i3 = i * 3
pos[i3] +=
Math.sin(
turb * speed[i] +
phase[i]
) *
0.02
pos[i3+1] +=
Math.cos(
turb * 0.7 *
speed[i] +
phase[i]
) *
0.015
pos[i3+2] +=
Math.sin(
turb * 0.5 *
speed[i] +
phase[i]
) *
0.02
}
this._dustPositionAttr.needsUpdate = true
}
/* =========================
   FIREWORK SYSTEM INIT
========================= */
createFireworks(){
this.fireworkCount = 0
this._fireworkSpawnAccumulator = 0
this._fireworkBaseSpawnRate = 0.38
this._fireworkLife = 2.4
this._fireworkGravity =
this.GRAVITY * 0.9
this._fireworkDrag = 0.985
this._fireworkTurbulence = 0.35
this._fireworkSize = 0.18
}
spawnFirework(){
if(this.fireworkCount >= this.MAX_FIREWORKS)
return
const mesh =
this._allocateFireworkMesh()
if(mesh === null)
return
const data =
this._allocateFireworkData()
if(data === null){
this._releaseFireworkMesh(mesh)
return
}
const density =
this.densityFactor
const min =
this._fireworkMinCount
const max =
this._fireworkMaxCount
const count =
(min +
(max - min) *
density) | 0
data.count = count
const pos = data.positions
const vel = data.velocities
const col = data.colors
const rand = data.randomness
const baseHue =
Math.random()
for(let i = 0; i < count; i++){
const i3 = i * 3
const u =
Math.random()
const v =
Math.random()
const theta =
u * Math.PI * 2
const phi =
Math.acos(
2 * v - 1
)
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
vel[i3] =
dx * speed
vel[i3+1] =
dy * speed
vel[i3+2] =
dz * speed
pos[i3] = 0
pos[i3+1] = 0
pos[i3+2] = 0
rand[i] =
Math.random() *
Math.PI * 2
this._tempColor.setHSL(
(baseHue +
Math.random() * 0.08) % 1,
1,
0.65
)
col[i3] =
this._tempColor.r
col[i3+1] =
this._tempColor.g
col[i3+2] =
this._tempColor.b
}
/* SAFE GPU BUFFER UPDATE */
const geometry =
mesh.geometry
const posAttr =
geometry.attributes.position
const colAttr =
geometry.attributes.color
posAttr.array.set(pos)
colAttr.array.set(col)
posAttr.updateRange.offset = 0
posAttr.updateRange.count =
count * 3
colAttr.updateRange.offset = 0
colAttr.updateRange.count =
count * 3
posAttr.needsUpdate = true
colAttr.needsUpdate = true
geometry.setDrawRange(
0,
count
)
/* RESET SAFE STATE */
mesh.material.opacity = 1
mesh.material.size =
this._fireworkSize
mesh.scale.set(
1,
1,
1
)
mesh.position.set(
(Math.random() - 0.5) * 60,
Math.random() * 28 + 8,
(Math.random() - 0.5) * 60
)
mesh.visible = true
this.scene.add(mesh)
/* REGISTER FIREWORK */
const index =
this.fireworkCount++
this.fireworks[index] = {
mesh: mesh,
data: data,
life: this._fireworkLife,
maxLife: this._fireworkLife,
count: count
}
}
updateFireworks(delta){
const gravity =
this._fireworkGravity
const drag =
this._fireworkDrag
const turbStrength =
this._fireworkTurbulence
const turbTime =
this.elapsedTime * 2.4
for(let i = this.fireworkCount - 1; i >= 0; i--){
const fw =
this.fireworks[i]
const mesh =
fw.mesh
const data =
fw.data
const pos =
data.positions
const vel =
data.velocities
const rand =
data.randomness
const count =
fw.count
for(let j = 0; j < count; j++){
const i3 =
j * 3
const turb =
Math.sin(
turbTime +
rand[j]
) *
turbStrength
vel[i3] *= drag
vel[i3+1] *= drag
vel[i3+2] *= drag
vel[i3] += turb * 0.12
vel[i3+2] += turb * 0.12
vel[i3+1] -=
gravity * delta
pos[i3] +=
vel[i3] * delta
pos[i3+1] +=
vel[i3+1] * delta
pos[i3+2] +=
vel[i3+2] * delta
}
/* SAFE GPU UPDATE */
const attr =
mesh.geometry.attributes.position
attr.array.set(pos)
attr.updateRange.offset = 0
attr.updateRange.count =
count * 3
attr.needsUpdate = true
/* CINEMATIC FADE */
fw.life -= delta
const t =
fw.life /
fw.maxLife
const fade =
t * t * (3 - 2 * t)
mesh.material.opacity =
fade
mesh.material.size =
this._fireworkSize *
(0.6 + fade * 0.9)
/* SAFE RECYCLE */
if(fw.life <= 0){
this.scene.remove(mesh)
this._releaseFireworkMesh(mesh)
this._releaseFireworkData(
data
)
/* swap remove */
const last =
--this.fireworkCount
if(i !== last){
this.fireworks[i] =
this.fireworks[last]
}
}
}
/* SPAWN CONTROL */
this._fireworkSpawnAccumulator += delta
const interval =
this._fireworkBaseSpawnRate /
(this.densityFactor * 0.9 + 0.1)
while(
this._fireworkSpawnAccumulator >= interval
){
this.spawnFirework()
this._fireworkSpawnAccumulator -= interval
}
}
/* =========================
   SHOCKWAVE SYSTEM INIT
========================= */
createShockwave(){
this.shockwaveCount = 0
this._shockwaveLife = 1.1
this._shockwaveStartScale = 0.4
this._shockwaveEndScale = 9.5
}
spawnShockwave(position){
const mesh =
this._allocateShockwaveMesh()
if(mesh === null)
return
/* SAFE STATE RESET */
mesh.position.copy(position)
mesh.rotation.x =
- Math.PI * 0.5
mesh.scale.setScalar(
this._shockwaveStartScale
)
mesh.material.opacity =
0.7
mesh.visible = true
this.scene.add(mesh)
/* REGISTER */
const index =
this.shockwaveCount++
this.shockwaves[index] = {
mesh: mesh,
life: this._shockwaveLife,
maxLife: this._shockwaveLife
}
}
updateShockwave(delta){
const start =
this._shockwaveStartScale
const end =
this._shockwaveEndScale
for(let i = this.shockwaveCount - 1; i >= 0; i--){
const sw =
this.shockwaves[i]
const mesh =
sw.mesh
sw.life -= delta
const t =
1 - (sw.life / sw.maxLife)
/* smoothstep cinematic easing */
const ease =
t * t * (3 - 2 * t)
/* SCALE UPDATE */
const scale =
start +
(end - start) *
ease
mesh.scale.setScalar(
scale
)
/* OPACITY UPDATE */
mesh.material.opacity =
(1 - ease) *
(1 - ease) *
0.7
/* RECYCLE SAFE */
if(sw.life <= 0){
this.scene.remove(mesh)
this._releaseShockwaveMesh(mesh)
/* swap removal */
const last =
--this.shockwaveCount
if(i !== last){
this.shockwaves[i] =
this.shockwaves[last]
}
}
}
}
/* =========================
   FPS ADAPTIVE SYSTEM
========================= */
updateFPS(delta){
this.frameCount++
this.fpsTimer += delta
if(this.fpsTimer < 0.5)
return
const instantFPS =
this.frameCount /
this.fpsTimer
this.fps =
this.fps * 0.82 +
instantFPS * 0.18
this.frameCount = 0
this.fpsTimer = 0
/* adaptive density */
const targetMin = 52
const targetMax = 62
let accel = 0
if(this.fps < targetMin)
accel = -0.035
else if(this.fps > targetMax)
accel = 0.02
else
accel =
- this._densityVelocity * 0.15
this._densityVelocity += accel
this._densityVelocity *= 0.92
this.densityFactor +=
this._densityVelocity
/* clamp safe */
if(this.densityFactor < 0.45)
this.densityFactor = 0.45
else if(this.densityFactor > 1.6)
this.densityFactor = 1.6
}
/* =========================
   MAIN UPDATE LOOP
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
/* update frustum every frame (camera may move) */
this.updateFrustum()
/* adaptive density */
this.updateFPS(delta)
/* heart beat safe */
this.beatTime +=
delta * 3.2
const beat =
Math.sin(this.beatTime)
const beatScale =
1 + beat * 0.085
if(this.heartMesh !== undefined){
this.heartMesh.scale.setScalar(
beatScale
)
}
/* particle systems */
this.updateSnow(delta)
this.updateDust(time)
this.updateGalaxy(time)
this.updateFireworks(delta)
this.updateShockwave(delta)
/* sky shader safe */
if(this.skyMaterial !== undefined){
this.skyMaterial.uniforms.uTime.value =
time
}
}
/* =========================
   FINAL DISPOSE SYSTEM
========================= */
dispose(){
if(this._disposed)
return
this._disposed = true
/* =========================
   REMOVE ACTIVE FIREWORKS
========================= */
for(let i = 0; i < this.fireworkCount; i++){
const fw =
this.fireworks[i]
this.scene.remove(
fw.mesh
)
this._releaseFireworkMesh(
fw.mesh
)
this._releaseFireworkData(
fw.data
)
}
this.fireworkCount = 0
/* =========================
   REMOVE ACTIVE SHOCKWAVES
========================= */
for(let i = 0; i < this.shockwaveCount; i++){
const sw =
this.shockwaves[i]
this.scene.remove(
sw.mesh
)
this._releaseShockwaveMesh(
sw.mesh
)
}
this.shockwaveCount = 0
/* =========================
   DISPOSE FIREWORK POOL
========================= */
for(let i = 0;
i < this._fireworkMeshPoolCount;
i++){
const mesh =
this._fireworkMeshPool[i]
mesh.geometry.dispose()
mesh.material.dispose()
}
/* =========================
   DISPOSE SHOCKWAVE POOL
========================= */
for(let i = 0;
i < this._shockwaveMeshPoolCount;
i++){
const mesh =
this._shockwaveMeshPool[i]
mesh.material.dispose()
}
/* =========================
   DISPOSE GALAXY
========================= */
if(this.galaxyPoints !== undefined){
this.scene.remove(
this.galaxyPoints
)
this.galaxyPoints.geometry.dispose()
this.galaxyPoints.material.dispose()
}
/* =========================
   DISPOSE SNOW
========================= */
if(this.snowPoints !== undefined){
this.scene.remove(
this.snowPoints
)
this.snowPoints.geometry.dispose()
this.snowPoints.material.dispose()
}
/* =========================
   DISPOSE DUST
========================= */
if(this.dustPoints !== undefined){
this.scene.remove(
this.dustPoints
)
this.dustPoints.geometry.dispose()
this.dustPoints.material.dispose()
}
/* =========================
   DISPOSE SHARED GEOMETRIES
========================= */
if(this._shockwaveGeometry !== undefined){
this._shockwaveGeometry.dispose()
}
/* =========================
   DISPOSE TEXTURE
========================= */
if(this.particleTexture !== undefined){
this.particleTexture.dispose()
}
/* =========================
   CLEAR SCENE SAFE
========================= */
while(this.scene.children.length > 0){
this.scene.remove(
this.scene.children[0]
)
}
}
