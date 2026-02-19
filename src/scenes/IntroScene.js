import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){
this.camera=camera
this.scene=new THREE.Scene()
this.textureLoader=new THREE.TextureLoader()
this.particleTexture=this.textureLoader.load('https://threejs.org/examples/textures/sprites/circle.png')
this.particleTexture.colorSpace=THREE.SRGBColorSpace
this.particleTexture.generateMipmaps=true
this.particleTexture.minFilter=THREE.LinearMipmapLinearFilter
this.particleTexture.magFilter=THREE.LinearFilter
this.particleTexture.wrapS=THREE.ClampToEdgeWrapping
this.particleTexture.wrapT=THREE.ClampToEdgeWrapping
this.particleTexture.anisotropy=4
this.clock=new THREE.Clock()
this.elapsedTime=0
this.deltaTime=0
this.GRAVITY=9.8*0.5
this.MAX_FIREWORKS=12
this.fireworkSpawnAccumulator=0
this.fireworkSpawnRate=0.4
this._fireworkBaseSpawnRate=0.4
this._fireworkSpawnAccumulator=0
this._fireworkLife=2
this._fireworkGravity=this.GRAVITY
this.densityFactor=1
this.targetDensityFactor=1
this.frameCount=0
this.fpsTimer=0
this.fps=60
this.fpsSmooth=60
this.fpsMin=999
this.fpsMax=0
this.fireworks=[]
this.shockwaves=[]
this._tempColor=new THREE.Color()
this._tempVec3=new THREE.Vector3()
this._tempVec3b=new THREE.Vector3()
this._tempMatrix=new THREE.Matrix4()
this._frustum=new THREE.Frustum()
this._projScreenMatrix=new THREE.Matrix4()
this._cameraPosition=new THREE.Vector3()
this._particleGeometryPool=[]
this._particleMaterialPool=[]
this._fireworkPool=[]
this._maxParticlePoolSize=32
this._maxMaterialPoolSize=16
this._maxFireworkPoolSize=24
this._sharedQuadGeometry=new THREE.PlaneGeometry(1,1)
this._sharedSphere=new THREE.SphereGeometry(1,8,8)
this._sharedRing=new THREE.RingGeometry(0.5,1,32)
this._spawnTimer=0
this._spawnInterval=0.016
this._updateAccumulator=0
this._fixedTimeStep=1/60
this._maxSubSteps=4
this._frameSafeCounter=0
this._frameSafeLimit=10000
this._visibleFireworks=0
this._culledFireworks=0
this._gpuMemoryEstimate=0
this._initialized=false
}
init(){
if(this._initialized) return
this._initialized=true
this.initLights()
this.createGradientSky()
this.createHeart()
this.createSnow()
this.createDust()
this.createGalaxy()
this.createFireworks()
this.createShockwave()
}
initLights(){
this.ambientLight=new THREE.AmbientLight(0xff66aa,0.8)
this.scene.add(this.ambientLight)
this.directionalLight=new THREE.DirectionalLight(0xff3377,1.2)
this.directionalLight.position.set(5,10,7)
this.directionalLight.castShadow=false
this.scene.add(this.directionalLight)
}
update(delta){
if(delta<=0)return
if(delta>0.05)delta=0.05
this.elapsedTime+=delta
const time=this.elapsedTime
this.updateFPS(delta)
this.beatTime+=delta*3.2
const beat=Math.sin(this.beatTime)
const beatScale=1+beat*0.085
this.heartMesh.scale.setScalar(beatScale)
this.updateSnow(delta)
this.updateDust(time)
this.updateGalaxy(time)
this.updateFireworks(delta)
this.updateShockwave(delta)
if(this.skyMaterial){
this.skyMaterial.uniforms.uTime.value=time
}
}
_fixedUpdate(dt){
this.updateFPS(dt)
this.updateSnow(dt)
this.updateDust(this.elapsedTime)
this.updateGalaxy(this.elapsedTime)
this.updateFireworks(dt)
this.updateShockwave(dt)
this.updateHeart(dt)
this.updateFrustum()
}
_postUpdate(delta){
if(this.skyMaterial){
this.skyMaterial.uniforms.uTime.value=this.elapsedTime
}
}
updateHeart(delta){
this.beatTime+=delta*3
const beatScale=1+Math.sin(this.beatTime)*0.08
this.heartMesh.scale.set(beatScale,beatScale,beatScale)
}
updateFPS(delta){
this.frameCount++
this.fpsTimer+=delta
if(this.fpsTimer>=0.25){
const currentFPS=this.frameCount/this.fpsTimer
this.fpsSmooth=this.fpsSmooth*0.9+currentFPS*0.1
this.fps=this.fpsSmooth
if(this.fps<this.fpsMin)this.fpsMin=this.fps
if(this.fps>this.fpsMax)this.fpsMax=this.fps
this.frameCount=0
this.fpsTimer=0
if(this.fps<50)this.targetDensityFactor=0.5
else if(this.fps<58)this.targetDensityFactor=0.75
else if(this.fps>62)this.targetDensityFactor=1.25
this.densityFactor+=((this.targetDensityFactor)-this.densityFactor)*0.05
}
}
updateFrustum(){
this._cameraPosition.copy(this.camera.position)
this._projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse)
this._frustum.setFromProjectionMatrix(this._projScreenMatrix)
}
_isInFrustum(position,radius=5){
this._tempVec3.copy(position)
return this._frustum.containsPoint(this._tempVec3)
}
_allocateParticleGeometry(count){
let geometry
if(this._particleGeometryPool.length>0){
geometry=this._particleGeometryPool.pop()
}else{
geometry=new THREE.BufferGeometry()
}
let positions=geometry.getAttribute('position')
let colors=geometry.getAttribute('color')
if(!positions||positions.count!==count){
positions=new THREE.BufferAttribute(new Float32Array(count*3),3)
positions.setUsage(THREE.DynamicDrawUsage)
geometry.setAttribute('position',positions)
}
if(!colors||colors.count!==count){
colors=new THREE.BufferAttribute(new Float32Array(count*3),3)
colors.setUsage(THREE.DynamicDrawUsage)
geometry.setAttribute('color',colors)
}
return geometry
}
_releaseParticleGeometry(geometry){
if(this._particleGeometryPool.length<this._maxParticlePoolSize){
this._particleGeometryPool.push(geometry)
}else{
geometry.dispose()
}
}
_allocateParticleMaterial(){
if(this._particleMaterialPool.length>0){
return this._particleMaterialPool.pop()
}
return new THREE.PointsMaterial({
size:0.15,
map:this.particleTexture,
transparent:true,
alphaTest:0.001,
depthWrite:false,
blending:THREE.AdditiveBlending,
vertexColors:true,
sizeAttenuation:true,
opacity:1
})
}
_releaseParticleMaterial(material){
if(this._particleMaterialPool.length<this._maxMaterialPoolSize){
this._particleMaterialPool.push(material)
}else{
material.dispose()
}
}
/* =========================
   GALAXY SYSTEM (AAA CINEMATIC)
========================= */
createGalaxy(){
this.galaxyCount=8000
this.galaxyRadius=180
this.galaxyBranches=6
this.galaxySpin=0.35
this.galaxyRandomness=0.4
this.galaxyRandomnessPower=3
this.galaxyBreathAmplitude=0.015
this.galaxyBreathSpeed=0.6
const geometry=new THREE.BufferGeometry()
this.galaxyPositions=new Float32Array(this.galaxyCount*3)
this.galaxyColors=new Float32Array(this.galaxyCount*3)
this.galaxySizes=new Float32Array(this.galaxyCount)
this.galaxyAngles=new Float32Array(this.galaxyCount)
this.galaxyRadii=new Float32Array(this.galaxyCount)
for(let i=0;i<this.galaxyCount;i++){
const i3=i*3
const radius=Math.random()*this.galaxyRadius
const branchAngle=(i%this.galaxyBranches)/this.galaxyBranches*Math.PI*2
const spinAngle=radius*this.galaxySpin
const randomX=Math.pow(Math.random(),this.galaxyRandomnessPower)*(Math.random()<0.5?1:-1)*this.galaxyRandomness*radius
const randomY=Math.pow(Math.random(),this.galaxyRandomnessPower)*(Math.random()<0.5?1:-1)*this.galaxyRandomness*radius*0.3
const randomZ=Math.pow(Math.random(),this.galaxyRandomnessPower)*(Math.random()<0.5?1:-1)*this.galaxyRandomness*radius
const angle=branchAngle+spinAngle
const x=Math.cos(angle)*radius+randomX
const y=randomY
const z=Math.sin(angle)*radius+randomZ
this.galaxyPositions[i3]=x
this.galaxyPositions[i3+1]=y
this.galaxyPositions[i3+2]=z
this.galaxyAngles[i]=angle
this.galaxyRadii[i]=radius
this.galaxySizes[i]=0.5+Math.random()*1.5
const mixFactor=radius/this.galaxyRadius
const hue=0.85-mixFactor*0.25+Math.random()*0.05
const sat=0.7+Math.random()*0.3
const light=0.55+Math.random()*0.2
this._tempColor.setHSL(hue,sat,light)
this.galaxyColors[i3]=this._tempColor.r
this.galaxyColors[i3+1]=this._tempColor.g
this.galaxyColors[i3+2]=this._tempColor.b
}
geometry.setAttribute('position',new THREE.BufferAttribute(this.galaxyPositions,3).setUsage(THREE.DynamicDrawUsage))
geometry.setAttribute('color',new THREE.BufferAttribute(this.galaxyColors,3))
this.galaxyMaterial=new THREE.PointsMaterial({
size:0.9,
map:this.particleTexture,
transparent:true,
opacity:0.95,
vertexColors:true,
depthWrite:false,
blending:THREE.AdditiveBlending,
sizeAttenuation:true,
alphaTest:0.001
})
this.galaxyPoints=new THREE.Points(geometry,this.galaxyMaterial)
this.galaxyPoints.frustumCulled=false
this.scene.add(this.galaxyPoints)
this._galaxyRotationSpeed=0.015
this._galaxyTwinkleSpeed=1.2
this._galaxyColorShiftSpeed=0.08
}
updateGalaxy(time){
const rot=time*this._galaxyRotationSpeed
this.galaxyPoints.rotation.y=rot
const breath=Math.sin(time*this.galaxyBreathSpeed)*this.galaxyBreathAmplitude+1
this.galaxyPoints.scale.set(breath,breath,breath)
const positions=this.galaxyPositions
const count=this.galaxyCount
for(let i=0;i<count;i++){
const i3=i*3+1
const base=this.galaxyRadii[i]*0.002
positions[i3]+=Math.sin(time*this._galaxyTwinkleSpeed+i)*base*0.02
}
this.galaxyPoints.geometry.attributes.position.needsUpdate=true
const colors=this.galaxyColors
const shift=Math.sin(time*this._galaxyColorShiftSpeed)*0.05
for(let i=0;i<count;i++){
const i3=i*3
colors[i3]=Math.min(1,colors[i3]+shift*0.002)
colors[i3+2]=Math.min(1,colors[i3+2]+shift*0.003)
}
this.galaxyPoints.geometry.attributes.color.needsUpdate=true
}
/* =========================
   SNOW SYSTEM (AAA CINEMATIC DEPTH)
========================= */
createSnow(){
this.snowCount=2200
this.snowArea=220
this.snowHeight=140
this.snowLayers=3
const geometry=new THREE.BufferGeometry()
this.snowPositions=new Float32Array(this.snowCount*3)
this.snowVelocities=new Float32Array(this.snowCount)
this.snowDrift=new Float32Array(this.snowCount)
this.snowPhase=new Float32Array(this.snowCount)
this.snowSize=new Float32Array(this.snowCount)
for(let i=0;i<this.snowCount;i++){
const i3=i*3
const layer=i%this.snowLayers
const depthFactor=1-layer/(this.snowLayers)
this.snowPositions[i3]=(Math.random()-0.5)*this.snowArea
this.snowPositions[i3+1]=Math.random()*this.snowHeight
this.snowPositions[i3+2]=(Math.random()-0.5)*this.snowArea
this.snowVelocities[i]=4+Math.random()*6*depthFactor
this.snowDrift[i]=(Math.random()-0.5)*depthFactor*2
this.snowPhase[i]=Math.random()*Math.PI*2
this.snowSize[i]=0.5+Math.random()*1.8*depthFactor
}
geometry.setAttribute('position',new THREE.BufferAttribute(this.snowPositions,3).setUsage(THREE.DynamicDrawUsage))
this.snowMaterial=new THREE.PointsMaterial({
map:this.particleTexture,
color:0xffddff,
size:1.2,
transparent:true,
opacity:0.9,
depthWrite:false,
blending:THREE.AdditiveBlending,
sizeAttenuation:true,
alphaTest:0.001
})
this.snowPoints=new THREE.Points(geometry,this.snowMaterial)
this.snowPoints.frustumCulled=false
this.scene.add(this.snowPoints)
this._snowTurbulenceSpeed=0.6
this._snowDriftSpeed=0.4
this._snowResetHeight=this.snowHeight
this._snowFloor=-20
}
updateSnow(delta){
const positions=this.snowPositions
const velocities=this.snowVelocities
const drift=this.snowDrift
const phase=this.snowPhase
const count=this.snowCount
const floor=this._snowFloor
const resetHeight=this._snowResetHeight
const turbTime=this.elapsedTime*this._snowTurbulenceSpeed
for(let i=0;i<count;i++){
const i3=i*3
positions[i3+1]-=velocities[i]*delta
positions[i3]+=Math.sin(turbTime+phase[i])*drift[i]*delta*5
positions[i3+2]+=Math.cos(turbTime*0.7+phase[i])*drift[i]*delta*3
if(positions[i3+1]<floor){
positions[i3]=(Math.random()-0.5)*this.snowArea
positions[i3+1]=resetHeight
positions[i3+2]=(Math.random()-0.5)*this.snowArea
}
}
this.snowPoints.geometry.attributes.position.needsUpdate=true
const breath=1+Math.sin(this.elapsedTime*0.5)*0.05
this.snowPoints.scale.set(breath,breath,breath)
}
/* =========================
   DUST SYSTEM (AAA VOLUMETRIC CINEMATIC)
========================= */
createDust(){
this.dustCount=3200
this.dustArea=180
this.dustHeight=90
const geometry=new THREE.BufferGeometry()
this.dustPositions=new Float32Array(this.dustCount*3)
this.dustPhase=new Float32Array(this.dustCount)
this.dustSpeed=new Float32Array(this.dustCount)
this.dustRadius=new Float32Array(this.dustCount)
for(let i=0;i<this.dustCount;i++){
const i3=i*3
const radius=Math.random()
const spread=Math.pow(radius,1.5)
this.dustPositions[i3]=(Math.random()-0.5)*this.dustArea*spread
this.dustPositions[i3+1]=(Math.random()-0.5)*this.dustHeight*spread
this.dustPositions[i3+2]=(Math.random()-0.5)*this.dustArea*spread
this.dustPhase[i]=Math.random()*Math.PI*2
this.dustSpeed[i]=0.2+Math.random()*0.8
this.dustRadius[i]=spread
}
geometry.setAttribute('position',new THREE.BufferAttribute(this.dustPositions,3).setUsage(THREE.DynamicDrawUsage))
this.dustMaterial=new THREE.PointsMaterial({
map:this.particleTexture,
color:0xff99cc,
size:0.6,
transparent:true,
opacity:0.65,
depthWrite:false,
blending:THREE.AdditiveBlending,
sizeAttenuation:true,
alphaTest:0.001
})
this.dustPoints=new THREE.Points(geometry,this.dustMaterial)
this.dustPoints.frustumCulled=false
this.scene.add(this.dustPoints)
this._dustTurbulenceSpeed=0.35
this._dustFloatStrength=0.6
this._dustBreathSpeed=0.25
}
updateDust(time){
const positions=this.dustPositions
const phase=this.dustPhase
const speed=this.dustSpeed
const radius=this.dustRadius
const count=this.dustCount
const turb=time*this._dustTurbulenceSpeed
for(let i=0;i<count;i++){
const i3=i*3
const r=radius[i]
positions[i3]+=Math.sin(turb*speed[i]+phase[i])*0.02*r
positions[i3+1]+=Math.cos(turb*0.7*speed[i]+phase[i])*0.015*r
positions[i3+2]+=Math.sin(turb*0.5*speed[i]+phase[i])*0.02*r
}
this.dustPoints.geometry.attributes.position.needsUpdate=true
const breath=1+Math.sin(time*this._dustBreathSpeed)*0.04
this.dustPoints.scale.set(breath,breath,breath)
this.dustPoints.rotation.y=time*0.01
this.dustPoints.rotation.x=time*0.005
}
/* =========================
   FIREWORK SYSTEM (AAA CINEMATIC VOLUMETRIC)
========================= */
createFireworks(){
this.fireworks=[]
this._fireworkSpawnAccumulator=0
this._fireworkBaseSpawnRate=0.38
this._fireworkLife=2.4
this._fireworkGravity=this.GRAVITY*0.9
this._fireworkDrag=0.985
this._fireworkTurbulence=0.35
this._fireworkSize=0.18
this._fireworkCoreSize=0.26
this._fireworkMinCount=140
this._fireworkMaxCount=260
}
/* =========================
   SPAWN
========================= */
spawnFirework(){
if(this.fireworks.length>=this.MAX_FIREWORKS)return
const density=this.densityFactor
const count=(this._fireworkMinCount+(this._fireworkMaxCount-this._fireworkMinCount)*density)|0
const geometry=new THREE.BufferGeometry()
const positions=new Float32Array(count*3)
const velocities=new Float32Array(count*3)
const colors=new Float32Array(count*3)
const randomness=new Float32Array(count)
const baseHue=Math.random()
for(let i=0;i<count;i++){
const i3=i*3
const u=Math.random()
const v=Math.random()
const theta=2*Math.PI*u
const phi=Math.acos(2*v-1)
const radius=Math.pow(Math.random(),0.35)
const sinPhi=Math.sin(phi)
const dx=sinPhi*Math.cos(theta)
const dy=Math.cos(phi)
const dz=sinPhi*Math.sin(theta)
const speed=18+Math.random()*22
velocities[i3]=dx*speed
velocities[i3+1]=dy*speed
velocities[i3+2]=dz*speed
positions[i3]=0
positions[i3+1]=0
positions[i3+2]=0
randomness[i]=Math.random()*Math.PI*2
const hue=(baseHue+Math.random()*0.08)%1
this._tempColor.setHSL(hue,1,0.65)
colors[i3]=this._tempColor.r
colors[i3+1]=this._tempColor.g
colors[i3+2]=this._tempColor.b
}
geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage))
geometry.setAttribute('color',new THREE.BufferAttribute(colors,3))
const material=new THREE.PointsMaterial({
map:this.particleTexture,
size:this._fireworkSize,
transparent:true,
opacity:1,
depthWrite:false,
blending:THREE.AdditiveBlending,
vertexColors:true,
alphaTest:0.001,
sizeAttenuation:true
})
const points=new THREE.Points(geometry,material)
points.frustumCulled=false
points.position.set((Math.random()-0.5)*60,Math.random()*28+8,(Math.random()-0.5)*60)
this.scene.add(points)
this.fireworks.push({
points,
positions,
velocities,
randomness,
life:this._fireworkLife,
maxLife:this._fireworkLife,
count
})
}
/* =========================
   UPDATE
========================= */
updateFireworks(delta){
const fireworks=this.fireworks
const gravity=this._fireworkGravity
const drag=this._fireworkDrag
const turbStrength=this._fireworkTurbulence
for(let i=fireworks.length-1;i>=0;i--){
const fw=fireworks[i]
const positions=fw.positions
const velocities=fw.velocities
const randomness=fw.randomness
const count=fw.count
const turbulenceTime=this.elapsedTime*2.4
for(let j=0;j<count;j++){
const i3=j*3
const turb=Math.sin(turbulenceTime+randomness[j])*turbStrength
velocities[i3]*=drag
velocities[i3+1]*=drag
velocities[i3+2]*=drag
velocities[i3]+=turb*0.12
velocities[i3+2]+=turb*0.12
velocities[i3+1]-=gravity*delta
positions[i3]+=velocities[i3]*delta
positions[i3+1]+=velocities[i3+1]*delta
positions[i3+2]+=velocities[i3+2]*delta
}
fw.points.geometry.attributes.position.needsUpdate=true
fw.life-=delta
const t=fw.life/fw.maxLife
const fade=t*t*t
fw.points.material.opacity=fade
fw.points.material.size=this._fireworkSize*(0.6+fade*0.9)
if(fw.life<=0){
this.scene.remove(fw.points)
fw.points.geometry.dispose()
fw.points.material.dispose()
fireworks.splice(i,1)
}
}
this._fireworkSpawnAccumulator+=delta
const interval=this._fireworkBaseSpawnRate/(this.densityFactor*0.9+0.1)
while(this._fireworkSpawnAccumulator>=interval){
this.spawnFirework()
this._fireworkSpawnAccumulator-=interval
}
}
/* =========================
   SHOCKWAVE SYSTEM (AAA CINEMATIC ENERGY RING)
========================= */
createShockwave(){
this.shockwaves=[]
this._shockwavePool=[]
this._shockwaveMaxPool=12
this._shockwaveLife=1.1
this._shockwaveStartScale=0.4
this._shockwaveEndScale=9.5
this._shockwaveGeometry=new THREE.RingGeometry(0.6,0.9,96,1)
this._shockwaveMaterial=new THREE.MeshBasicMaterial({
map:this.particleTexture,
color:0xff66cc,
transparent:true,
opacity:0.7,
depthWrite:false,
blending:THREE.AdditiveBlending,
side:THREE.DoubleSide,
alphaTest:0.001
})
}
/* =========================
   SPAWN
========================= */
spawnShockwave(position){
let mesh
if(this._shockwavePool.length>0){
mesh=this._shockwavePool.pop()
}else{
mesh=new THREE.Mesh(this._shockwaveGeometry,this._shockwaveMaterial.clone())
mesh.frustumCulled=false
}
mesh.position.copy(position)
mesh.rotation.x=-Math.PI*0.5
mesh.scale.setScalar(this._shockwaveStartScale)
mesh.material.opacity=0.7
this.scene.add(mesh)
this.shockwaves.push({
mesh,
life:this._shockwaveLife,
maxLife:this._shockwaveLife
})
}
/* =========================
   UPDATE
========================= */
updateShockwave(delta){
const shockwaves=this.shockwaves
const start=this._shockwaveStartScale
const end=this._shockwaveEndScale
for(let i=shockwaves.length-1;i>=0;i--){
const s=shockwaves[i]
s.life-=delta
const t=1-(s.life/s.maxLife)
const ease=t*t*(3-2*t)
const scale=start+(end-start)*ease
s.mesh.scale.setScalar(scale)
const opacity=(1-t)*(1-t)*0.7
s.mesh.material.opacity=opacity
if(s.life<=0){
this.scene.remove(s.mesh)
if(this._shockwavePool.length<this._shockwaveMaxPool){
this._shockwavePool.push(s.mesh)
}else{
s.mesh.material.dispose()
}
shockwaves.splice(i,1)
}
}
}
/* =========================
   FPS ADAPTIVE SYSTEM (AAA STABLE CONTROLLER)
========================= */
updateFPS(delta){
this.frameCount++
this.fpsTimer+=delta
if(this.fpsTimer<0.5)return
const instantFPS=this.frameCount/this.fpsTimer
if(this.fps===undefined)this.fps=instantFPS
else this.fps=this.fps*0.82+instantFPS*0.18
this.frameCount=0
this.fpsTimer=0
if(this._fpsMin===undefined){
this._fpsMin=this.fps
this._fpsMax=this.fps
}
if(this.fps<this._fpsMin)this._fpsMin=this.fps
else this._fpsMin=this._fpsMin*0.92+this.fps*0.08
if(this.fps>this._fpsMax)this._fpsMax=this.fps
else this._fpsMax=this._fpsMax*0.92+this.fps*0.08
const targetMin=52
const targetMax=62
const adjustDown=this.fps<targetMin
const adjustUp=this.fps>targetMax
if(this._densityVelocity===undefined)this._densityVelocity=0
if(adjustDown)this._densityVelocity-=0.035
else if(adjustUp)this._densityVelocity+=0.02
else this._densityVelocity*=0.85
this._densityVelocity*=0.92
this.densityFactor+=this._densityVelocity
if(this.densityFactor<0.45)this.densityFactor=0.45
else if(this.densityFactor>1.6)this.densityFactor=1.6
}
/* =========================
   MAIN UPDATE LOOP (AAA CINEMATIC CORE)
========================= */
update(delta){
if(delta<=0)return
if(delta>0.05)delta=0.05
this.elapsedTime+=delta
const time=this.elapsedTime
this.updateFPS(delta)
this.beatTime+=delta*3.2
const beat=Math.sin(this.beatTime)
const beatScale=1+beat*0.085
this.heartMesh.scale.setScalar(beatScale)
this.updateSnow(delta)
this.updateDust(time)
this.updateGalaxy(time)
this.updateFireworks(delta)
this.updateShockwave(delta)
if(this.skyMaterial){
this.skyMaterial.uniforms.uTime.value=time
}
}
/* =========================
   CLEAN DISPOSE (AAA ZERO LEAK)
========================= */
dispose(){
if(this.fireworks){
for(let i=0;i<this.fireworks.length;i++){
const fw=this.fireworks[i]
this.scene.remove(fw.points)
fw.points.geometry.dispose()
fw.points.material.dispose()
}
this.fireworks.length=0
}
if(this.shockwaves){
for(let i=0;i<this.shockwaves.length;i++){
const s=this.shockwaves[i]
this.scene.remove(s.mesh)
s.mesh.material.dispose()
}
this.shockwaves.length=0
}
if(this._shockwavePool){
for(let i=0;i<this._shockwavePool.length;i++){
this._shockwavePool[i].material.dispose()
}
this._shockwavePool.length=0
}
if(this._shockwaveGeometry){
this._shockwaveGeometry.dispose()
}
if(this._shockwaveMaterial){
this._shockwaveMaterial.dispose()
}
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
if(this.particleTexture){
this.particleTexture.dispose()
}
while(this.scene.children.length>0){
this.scene.remove(this.scene.children[0])
}
}
}
