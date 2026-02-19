import * as THREE from 'https://jspm.dev/three'
export class IntroScene {
constructor(camera){
this.camera=camera
this.scene=new THREE.Scene()
this.textureLoader=new THREE.TextureLoader()
this.particleTexture=this.textureLoader.load(
'/kuromi/src/assets/textures/circle.png'
)
this.particleTexture.colorSpace=THREE.SRGBColorSpace
this.particleTexture.generateMipmaps=true
this.particleTexture.minFilter=THREE.LinearMipmapLinearFilter
this.particleTexture.magFilter=THREE.LinearFilter
this.particleTexture.premultiplyAlpha=false
this.particleTexture.flipY=false
this.particleTexture.needsUpdate=true
/* =========================
   CORE TIMING
========================= */
this.clock=new THREE.Clock()
this.elapsedTime=0
/* =========================
   PERFORMANCE CONFIG
========================= */
this.GRAVITY=9.8*0.5
this.MAX_FIREWORKS=12
this.fireworkSpawnAccumulator=0
this.fireworkSpawnRate=0.4
/* =========================
   FPS SYSTEM
========================= */
this.densityFactor=1
this.frameCount=0
this.fpsTimer=0
this.fps=60
/* =========================
   SYSTEM STATES
========================= */
this.fireworks=[]
this.shockwaves=[]
/* =========================
   REUSABLE OBJECTS
========================= */
this._tempColor=new THREE.Color()
}
init(){
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
   LIGHTS
========================= */
initLights(){
this.ambientLight=new THREE.AmbientLight(0xff66aa,0.8)
this.scene.add(this.ambientLight)
this.directionalLight=new THREE.DirectionalLight(0xff3377,1.2)
this.directionalLight.position.set(5,10,7)
this.scene.add(this.directionalLight)
}
/* =========================
   SKY
========================= */
createGradientSky(){
const geometry=new THREE.SphereGeometry(500,64,64)
this.skyMaterial=new THREE.ShaderMaterial({
side:THREE.BackSide,
uniforms:{uTime:{value:0}},
vertexShader:`
varying vec3 vPos;
void main(){
vPos=position;
gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
`,
fragmentShader:`
varying vec3 vPos;
void main(){
float h=normalize(vPos).y;
vec3 c1=vec3(0.35,0.0,0.4);
vec3 c2=vec3(0.8,0.0,0.3);
vec3 c3=vec3(1.0,0.3,0.6);
vec3 col=mix(c1,c2,smoothstep(-0.2,0.5,h));
col=mix(col,c3,pow(max(h,0.0),3.0));
gl_FragColor=vec4(col,1.0);
}
`
})
this.skyMesh=new THREE.Mesh(geometry,this.skyMaterial)
this.scene.add(this.skyMesh)
}
/* =========================
   HEART
========================= */
createHeart(){
const shape=new THREE.Shape()
shape.moveTo(0,0)
shape.bezierCurveTo(0,3,-4,3,-4,0)
shape.bezierCurveTo(-4,-3,0,-5,0,-7)
shape.bezierCurveTo(0,-5,4,-3,4,0)
shape.bezierCurveTo(4,3,0,3,0,0)
const geometry=new THREE.ExtrudeGeometry(shape,{
depth:2,
bevelEnabled:true,
bevelSegments:6,
steps:2,
bevelSize:0.4,
bevelThickness:0.6
})
geometry.center()
const material=new THREE.MeshStandardMaterial({
color:0xff2a6d,
emissive:0x550022,
roughness:0.3,
metalness:0.1
})
this.heartMesh=new THREE.Mesh(geometry,material)
this.heartMesh.scale.set(0.7,0.7,0.7)
this.scene.add(this.heartMesh)
this.beatTime=0
}
/* =========================
   GALAXY (OPTIMIZED INIT)
========================= */
createGalaxy(){
this.galaxyCount=6000
const geometry=new THREE.BufferGeometry()
this.galaxyPositions=new Float32Array(this.galaxyCount*3)
this.galaxyColors=new Float32Array(this.galaxyCount*3)
for(let i=0;i<this.galaxyCount;i++){
const r=Math.random()*150
const branch=i%5
const angle=branch/5*Math.PI*2+r*0.05
const px=Math.cos(angle)*r+(Math.random()-0.5)*5
const py=(Math.random()-0.5)*20
const pz=Math.sin(angle)*r+(Math.random()-0.5)*5
this.galaxyPositions[i*3]=px
this.galaxyPositions[i*3+1]=py
this.galaxyPositions[i*3+2]=pz
const h=0.9-Math.random()*0.2
this._tempColor.setHSL(h,0.8,0.6)
this.galaxyColors[i*3]=this._tempColor.r
this.galaxyColors[i*3+1]=this._tempColor.g
this.galaxyColors[i*3+2]=this._tempColor.b
}
geometry.setAttribute(
'position',
new THREE.BufferAttribute(this.galaxyPositions,3)
)
geometry.setAttribute(
'color',
new THREE.BufferAttribute(this.galaxyColors,3)
)
this.galaxyMaterial=new THREE.PointsMaterial({
size:0.7,
map:this.particleTexture,
alphaMap:this.particleTexture,
vertexColors:true,
transparent:true,
alphaTest:0.001,
depthWrite:false,
blending:THREE.AdditiveBlending,
sizeAttenuation:true
})
this.galaxyMaterial.needsUpdate=true
this.galaxyPoints=new THREE.Points(geometry,this.galaxyMaterial)
this.scene.add(this.galaxyPoints)
}
updateGalaxy(t){
this.galaxyPoints.rotation.y=t*0.01
}
/* =========================
   SNOW SYSTEM (CPU OPTIMIZED)
========================= */
createSnow(){
this.snowCount=1500
const geometry=new THREE.BufferGeometry()
this.snowPositions=new Float32Array(this.snowCount*3)
for(let i=0;i<this.snowCount;i++){
const stride=i*3
this.snowPositions[stride]=(Math.random()-0.5)*200
this.snowPositions[stride+1]=Math.random()*100
this.snowPositions[stride+2]=(Math.random()-0.5)*200
}
geometry.setAttribute(
'position',
new THREE.BufferAttribute(this.snowPositions,3)
)
this.snowMaterial=new THREE.PointsMaterial({
color:0xffb6ff,
size:0.6,
map:this.particleTexture,
alphaMap:this.particleTexture,
transparent:true,
alphaTest:0.001,
depthWrite:false,
blending:THREE.AdditiveBlending,
sizeAttenuation:true
})
this.snowMaterial.needsUpdate=true
this.snowPoints=new THREE.Points(geometry,this.snowMaterial)
this.scene.add(this.snowPoints)
this._snowResetHeight=100
this._snowFloor=-10
this._snowFallSpeed=10
}
updateSnow(delta){
const positions=this.snowPositions
const count=this.snowCount
const fallSpeed=this._snowFallSpeed*delta
const floor=this._snowFloor
const resetHeight=this._snowResetHeight
for(let i=0;i<count;i++){
const stride=i*3+1
positions[stride]-=fallSpeed
if(positions[stride]<floor){
positions[stride]=resetHeight
}
}
this.snowPoints.geometry.attributes.position.needsUpdate=true
}
/* =========================
   DUST SYSTEM (Rotation Only - Cleaned)
========================= */
createDust(){
this.dustCount=2000
const geometry=new THREE.BufferGeometry()
this.dustPositions=new Float32Array(this.dustCount*3)
for(let i=0;i<this.dustCount;i++){
const stride=i*3
this.dustPositions[stride]=(Math.random()-0.5)*100
this.dustPositions[stride+1]=(Math.random()-0.5)*50
this.dustPositions[stride+2]=(Math.random()-0.5)*100
}
geometry.setAttribute(
'position',
new THREE.BufferAttribute(this.dustPositions,3)
)
this.dustMaterial=new THREE.PointsMaterial({
color:0xff77aa,
size:0.3,
map:this.particleTexture,
alphaMap:this.particleTexture,
transparent:true,
alphaTest:0.001,
depthWrite:false,
blending:THREE.AdditiveBlending,
sizeAttenuation:true
})
this.dustMaterial.needsUpdate=true
this.dustPoints=new THREE.Points(geometry,this.dustMaterial)
this.scene.add(this.dustPoints)
this._dustRotYSpeed=0.02
this._dustRotXSpeed=0.01
}
updateDust(time){
this.dustPoints.rotation.y=time*this._dustRotYSpeed
this.dustPoints.rotation.x=time*this._dustRotXSpeed
}
/* =========================
   FIREWORK SYSTEM (STABLE + OPTIMIZED)
========================= */
createFireworks(){
this.fireworks=[]
this._fireworkBaseSpawnRate=0.4
this._fireworkSpawnAccumulator=0
this._fireworkLife=2
this._fireworkGravity=this.GRAVITY
}
/* =========================
   SPAWN
========================= */
spawnFirework(){
if(this.fireworks.length>=this.MAX_FIREWORKS) return
const patterns=['sphere','ring','spiral','burst']
const type=patterns[(Math.random()*patterns.length)|0]
const count=(200*this.densityFactor)|0
const geometry=new THREE.BufferGeometry()
const positions=new Float32Array(count*3)
const velocities=new Float32Array(count*3)
/* UPGRADE: add color buffer (required for vertexColors) */
const colors=new Float32Array(count*3)
for(let i=0;i<count;i++){
const stride=i*3
let dx=0,dy=0,dz=0
if(type==='sphere'){
dx=Math.random()*2-1
dy=Math.random()*2-1
dz=Math.random()*2-1
const len=Math.sqrt(dx*dx+dy*dy+dz*dz)||1
dx/=len
dy/=len
dz/=len
}
else if(type==='ring'){
const a=Math.random()*Math.PI*2
dx=Math.cos(a)
dy=0
dz=Math.sin(a)
}
else if(type==='spiral'){
const ratio=i/count
const a=ratio*Math.PI*10
dx=Math.cos(a)
dy=ratio
dz=Math.sin(a)
}
else{
dx=Math.random()*2-1
dy=Math.random()*2-1
dz=Math.random()*2-1
}
positions[stride]=0
positions[stride+1]=0
positions[stride+2]=0
const speed=Math.random()*20+20
velocities[stride]=dx*speed
velocities[stride+1]=dy*speed
velocities[stride+2]=dz*speed
/* UPGRADE: cinematic pink/purple gradient */
colors[stride]=1
colors[stride+1]=0.3+Math.random()*0.4
colors[stride+2]=0.6+Math.random()*0.4
}
geometry.setAttribute(
'position',
new THREE.BufferAttribute(positions,3)
)
/* UPGRADE: enable vertex color */
geometry.setAttribute(
'color',
new THREE.BufferAttribute(colors,3)
)
/* keep your color logic intact */
this._tempColor.setHSL(Math.random(),1,0.6)
/* UPGRADE: proper cinematic material */
const material=new THREE.PointsMaterial({
size:0.15,
map:this.particleTexture,
transparent:true,
alphaTest:0.001,
depthWrite:false,
blending:THREE.AdditiveBlending,
vertexColors:true,
sizeAttenuation:true
})
material.alphaMap=this.particleTexture
material.needsUpdate=true
const points=new THREE.Points(geometry,material)
points.position.set(
(Math.random()-0.5)*40,
Math.random()*20+5,
(Math.random()-0.5)*40
)
this.scene.add(points)
this.fireworks.push({
points,
positions,
velocities,
life:this._fireworkLife,
maxLife:this._fireworkLife,
count
})
}
/* =========================
   UPDATE
========================= */
updateFireworks(delta){
const gravity=this._fireworkGravity
const fireworks=this.fireworks
for(let i=fireworks.length-1;i>=0;i--){
const fw=fireworks[i]
const positions=fw.positions
const velocities=fw.velocities
const count=fw.count
for(let j=0;j<count;j++){
const stride=j*3
positions[stride]+=velocities[stride]*delta
positions[stride+1]+=velocities[stride+1]*delta
positions[stride+2]+=velocities[stride+2]*delta
velocities[stride+1]-=gravity*delta
}
fw.points.geometry.attributes.position.needsUpdate=true
fw.life-=delta
/* keep your cubic easing */
const normalized=fw.life/fw.maxLife
const eased=normalized*normalized*normalized
fw.points.material.opacity=eased
/* UPGRADE: cinematic size fade */
fw.points.material.size=0.15*(0.5+normalized*0.5)
if(fw.life<=0){
this.scene.remove(fw.points)
fw.points.geometry.dispose()
fw.points.material.dispose()
fireworks.splice(i,1)
}
}
/* keep your accumulator logic */
this._fireworkSpawnAccumulator+=delta
const spawnInterval=this._fireworkBaseSpawnRate/this.densityFactor
while(this._fireworkSpawnAccumulator>=spawnInterval){
this.spawnFirework()
this._fireworkSpawnAccumulator-=spawnInterval
}
}
/* =========================
   SHOCKWAVE SYSTEM (POOLED)
========================= */
createShockwave(){
this.shockwaves=[]
/* Shared geometry & material */
this._shockwaveGeometry=new THREE.RingGeometry(0.5,0.7,64)
this._shockwaveMaterial=new THREE.MeshBasicMaterial({
color:0xff66aa,
transparent:true,
opacity:0.6,
side:THREE.DoubleSide
})
/* Object pool */
this._shockwavePool=[]
this._maxShockwaves=10
}
/* =========================
   SPAWN (POOLING)
========================= */
spawnShockwave(position){
let mesh
if(this._shockwavePool.length>0){
mesh=this._shockwavePool.pop()
}else{
mesh=new THREE.Mesh(
this._shockwaveGeometry,
this._shockwaveMaterial.clone()
)
}
mesh.position.copy(position)
mesh.rotation.x=-Math.PI/2
mesh.scale.set(1,1,1)
mesh.material.opacity=0.6
this.scene.add(mesh)
this.shockwaves.push({
mesh,
life:1,
maxLife:1
})
}
/* =========================
   UPDATE
========================= */
updateShockwave(delta){
for(let i=this.shockwaves.length-1;i>=0;i--){
const s=this.shockwaves[i]
/* Scale expansion */
const scaleFactor=1+delta*5
s.mesh.scale.multiplyScalar(scaleFactor)
/* Smooth fade */
s.life-=delta
const normalized=s.life/s.maxLife
const eased=normalized*normalized
s.mesh.material.opacity=0.6*eased
if(s.life<=0){
this.scene.remove(s.mesh)
/* Return to pool instead of dispose */
if(this._shockwavePool.length<this._maxShockwaves){
this._shockwavePool.push(s.mesh)
}else{
s.mesh.material.dispose()
}
this.shockwaves.splice(i,1)
}
}
}
/* =========================
   FPS ADAPTIVE (SMOOTHED)
========================= */
updateFPS(delta){
this.frameCount++
this.fpsTimer+=delta
if(this.fpsTimer>=1){
const currentFPS=this.frameCount/this.fpsTimer
/* Smooth moving average */
this.fps=this.fps*0.7+currentFPS*0.3
this.frameCount=0
this.fpsTimer=0
/* Adaptive density */
if(this.fps<45){
this.densityFactor=Math.max(0.4,this.densityFactor-0.05)
}
else if(this.fps>55){
this.densityFactor=Math.min(1.5,this.densityFactor+0.05)
}
}
}
/* =========================
   MAIN UPDATE LOOP (CLEAN)
========================= */
update(delta){
/* Stable time accumulation */
this.elapsedTime+=delta
const time=this.elapsedTime
/* FPS adaptation */
this.updateFPS(delta)
/* Heart beat */
this.beatTime+=delta*3
const beatScale=1+Math.sin(this.beatTime)*0.08
this.heartMesh.scale.set(
beatScale,
beatScale,
beatScale
)
/* Systems */
this.updateSnow(delta)
this.updateDust(time)
this.updateGalaxy(time)
this.updateFireworks(delta)
this.updateShockwave(delta)
/* Sky */
if(this.skyMaterial){
this.skyMaterial.uniforms.uTime.value=time
}
}
/* =========================
   FIREWORK SAFETY CAP (HARD LIMIT)
========================= */
enforceFireworkLimit(){
if(this.fireworks.length<=this.MAX_FIREWORKS) return
const overflow=this.fireworks.length-this.MAX_FIREWORKS
for(let i=0;i<overflow;i++){
const fw=this.fireworks.shift()
this.scene.remove(fw.points)
fw.points.geometry.dispose()
fw.points.material.dispose()
}
}
/* =========================
   CLEAN DISPOSE (GPU SAFE)
========================= */
dispose(){
/* =========================
   FIREWORKS
========================= */
for(const fw of this.fireworks){
this.scene.remove(fw.points)
fw.points.geometry.dispose()
fw.points.material.dispose()
}
this.fireworks.length=0
/* =========================
   SHOCKWAVES (ACTIVE)
========================= */
for(const s of this.shockwaves){
this.scene.remove(s.mesh)
}
this.shockwaves.length=0
/* =========================
   SHOCKWAVE POOL
========================= */
for(const mesh of this._shockwavePool){
mesh.material.dispose()
}
this._shockwavePool.length=0
/* Shared shockwave resources */
if(this._shockwaveGeometry){
this._shockwaveGeometry.dispose()
}
if(this._shockwaveMaterial){
this._shockwaveMaterial.dispose()
}
/* =========================
   STATIC SYSTEMS
========================= */
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
if(this.ambientLight){
this.scene.remove(this.ambientLight)
}
if(this.directionalLight){
this.scene.remove(this.directionalLight)
}
/* Final scene cleanup */
while(this.scene.children.length>0){
this.scene.remove(this.scene.children[0])
}
}
}
