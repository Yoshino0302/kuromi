import * as THREE from 'https://jspm.dev/three'

export class IntroScene {

constructor(camera){
this.camera=camera
this.scene=new THREE.Scene()

this.clock=new THREE.Clock()
this.beatTime=0

this.densityFactor=1
this.frameCount=0
this.fpsTimer=0
this.fps=60

this.fireworks=[]
this.shockwaves=[]
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

initLights(){
this.ambient=new THREE.AmbientLight(0xff66aa,0.8)
this.scene.add(this.ambient)

this.dir=new THREE.DirectionalLight(0xff3377,1.2)
this.dir.position.set(5,10,7)
this.scene.add(this.dir)
}

createGradientSky(){
const geo=new THREE.SphereGeometry(500,64,64)

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

this.sky=new THREE.Mesh(geo,this.skyMaterial)
this.scene.add(this.sky)
}

createHeart(){
const shape=new THREE.Shape()
shape.moveTo(0,0)
shape.bezierCurveTo(0,3,-4,3,-4,0)
shape.bezierCurveTo(-4,-3,0,-5,0,-7)
shape.bezierCurveTo(0,-5,4,-3,4,0)
shape.bezierCurveTo(4,3,0,3,0,0)

const geo=new THREE.ExtrudeGeometry(shape,{
depth:2,
bevelEnabled:true,
bevelSegments:6,
steps:2,
bevelSize:0.4,
bevelThickness:0.6
})

geo.center()

const mat=new THREE.MeshStandardMaterial({
color:0xff2a6d,
emissive:0x550022,
roughness:0.3,
metalness:0.1
})

this.heart=new THREE.Mesh(geo,mat)
this.heart.scale.set(0.7,0.7,0.7)
this.scene.add(this.heart)
}
/* =========================
   SNOW SYSTEM (Optimized)
========================= */

createSnow(){
this.snowCount=1500

this.snowGeo=new THREE.BufferGeometry()
this.snowPositions=new Float32Array(this.snowCount*3)

for(let i=0;i<this.snowCount;i++){
this.snowPositions[i*3]=(Math.random()-0.5)*200
this.snowPositions[i*3+1]=Math.random()*100
this.snowPositions[i*3+2]=(Math.random()-0.5)*200
}

this.snowGeo.setAttribute(
'position',
new THREE.BufferAttribute(this.snowPositions,3)
)

this.snowMat=new THREE.PointsMaterial({
color:0xffb6ff,
size:0.6,
transparent:true,
opacity:0.8,
depthWrite:false
})

this.snow=new THREE.Points(this.snowGeo,this.snowMat)
this.scene.add(this.snow)
}

updateSnow(dt){
const arr=this.snowPositions

for(let i=0;i<this.snowCount;i++){
arr[i*3+1]-=dt*10
if(arr[i*3+1]<-10) arr[i*3+1]=100
}

this.snowGeo.attributes.position.needsUpdate=true
}


/* =========================
   DUST SYSTEM (Rotation Only)
========================= */

createDust(){
this.dustCount=2000

this.dustGeo=new THREE.BufferGeometry()
this.dustPositions=new Float32Array(this.dustCount*3)

for(let i=0;i<this.dustCount;i++){
this.dustPositions[i*3]=(Math.random()-0.5)*100
this.dustPositions[i*3+1]=(Math.random()-0.5)*50
this.dustPositions[i*3+2]=(Math.random()-0.5)*100
}

this.dustGeo.setAttribute(
'position',
new THREE.BufferAttribute(this.dustPositions,3)
)

this.dustMat=new THREE.PointsMaterial({
color:0xff77aa,
size:0.3,
transparent:true,
opacity:0.6,
depthWrite:false
})

this.dust=new THREE.Points(this.dustGeo,this.dustMat)
this.scene.add(this.dust)
}

updateDust(t){
this.dust.rotation.y=t*0.02
this.dust.rotation.x=t*0.01
}


/* =========================
   GALAXY SYSTEM (Optimized)
========================= */

createGalaxy(){
this.galaxyCount=6000

this.galaxyGeo=new THREE.BufferGeometry()
this.galaxyPositions=new Float32Array(this.galaxyCount*3)
this.galaxyColors=new Float32Array(this.galaxyCount*3)

for(let i=0;i<this.galaxyCount;i++){

const r=Math.random()*150
const branch=i%5
const angle=branch/5*Math.PI*2+r*0.05

this.galaxyPositions[i*3]=Math.cos(angle)*r+(Math.random()-0.5)*5
this.galaxyPositions[i*3+1]=(Math.random()-0.5)*20
this.galaxyPositions[i*3+2]=Math.sin(angle)*r+(Math.random()-0.5)*5

// tránh new THREE.Color trong loop
const h=0.9-Math.random()*0.2
const s=0.8
const l=0.6
const color=new THREE.Color()
color.setHSL(h,s,l)

this.galaxyColors[i*3]=color.r
this.galaxyColors[i*3+1]=color.g
this.galaxyColors[i*3+2]=color.b
}

this.galaxyGeo.setAttribute(
'position',
new THREE.BufferAttribute(this.galaxyPositions,3)
)

this.galaxyGeo.setAttribute(
'color',
new THREE.BufferAttribute(this.galaxyColors,3)
)

this.galaxyMat=new THREE.PointsMaterial({
size:0.7,
vertexColors:true,
transparent:true,
opacity:0.9,
depthWrite:false
})

this.galaxy=new THREE.Points(this.galaxyGeo,this.galaxyMat)
this.scene.add(this.galaxy)
}

updateGalaxy(t){
this.galaxy.rotation.y=t*0.01
}
/* =========================
   FIREWORK SYSTEM (Optimized)
========================= */

createFireworks(){
this.fireworks=[]
}

spawnFirework(){

const patterns=['sphere','ring','spiral','burst']
const type=patterns[Math.floor(Math.random()*patterns.length)]

const count=Math.floor(200*this.densityFactor)

const geo=new THREE.BufferGeometry()

const positions=new Float32Array(count*3)
const velocities=new Float32Array(count*3)

for(let i=0;i<count;i++){

let dx=0,dy=0,dz=0

if(type==='sphere'){
dx=Math.random()*2-1
dy=Math.random()*2-1
dz=Math.random()*2-1
const len=Math.sqrt(dx*dx+dy*dy+dz*dz)||1
dx/=len; dy/=len; dz/=len
}

if(type==='ring'){
const a=Math.random()*Math.PI*2
dx=Math.cos(a)
dy=0
dz=Math.sin(a)
}

if(type==='spiral'){
const a=i/count*Math.PI*10
dx=Math.cos(a)
dy=i/count
dz=Math.sin(a)
}

if(type==='burst'){
dx=Math.random()*2-1
dy=Math.random()*2-1
dz=Math.random()*2-1
}

positions[i*3]=0
positions[i*3+1]=0
positions[i*3+2]=0

const speed=Math.random()*20+20

velocities[i*3]=dx*speed
velocities[i*3+1]=dy*speed
velocities[i*3+2]=dz*speed
}

geo.setAttribute(
'position',
new THREE.BufferAttribute(positions,3)
)

const mat=new THREE.PointsMaterial({
color:new THREE.Color().setHSL(Math.random(),1,0.6),
size:0.8,
transparent:true,
opacity:1,
depthWrite:false
})

const points=new THREE.Points(geo,mat)

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
life:2,
count
})
}

updateFireworks(dt){

for(let i=this.fireworks.length-1;i>=0;i--){

const fw=this.fireworks[i]
const pos=fw.positions
const vel=fw.velocities

for(let j=0;j<fw.count;j++){

pos[j*3]+=vel[j*3]*dt
pos[j*3+1]+=vel[j*3+1]*dt
pos[j*3+2]+=vel[j*3+2]*dt

vel[j*3+1]-=9.8*dt*0.5
}

fw.points.geometry.attributes.position.needsUpdate=true

fw.life-=dt
fw.points.material.opacity=fw.life/2

if(fw.life<=0){

this.scene.remove(fw.points)
fw.points.geometry.dispose()
fw.points.material.dispose()

this.fireworks.splice(i,1)
}
}

if(Math.random()<0.4*this.densityFactor){
this.spawnFirework()
}
}


/* =========================
   SHOCKWAVE SYSTEM
========================= */

createShockwave(){
this.shockwaves=[]
}

spawnShockwave(position){

const geo=new THREE.RingGeometry(0.5,0.7,64)

const mat=new THREE.MeshBasicMaterial({
color:0xff66aa,
transparent:true,
opacity:0.6,
side:THREE.DoubleSide
})

const mesh=new THREE.Mesh(geo,mat)

mesh.position.copy(position)
mesh.rotation.x=-Math.PI/2

this.scene.add(mesh)

this.shockwaves.push({
mesh,
life:1
})
}

updateShockwave(dt){

for(let i=this.shockwaves.length-1;i>=0;i--){

const s=this.shockwaves[i]

s.mesh.scale.multiplyScalar(1+dt*5)
s.mesh.material.opacity-=dt
s.life-=dt

if(s.life<=0){

this.scene.remove(s.mesh)
s.mesh.geometry.dispose()
s.mesh.material.dispose()

this.shockwaves.splice(i,1)
}
}
}
/* =========================
   FPS ADAPTIVE SYSTEM
========================= */

updateFPS(dt){
this.frameCount++
this.fpsTimer+=dt

if(this.fpsTimer>=1){

this.fps=this.frameCount
this.frameCount=0
this.fpsTimer=0

if(this.fps<45){
this.densityFactor=Math.max(0.4,this.densityFactor-0.1)
}

if(this.fps>55){
this.densityFactor=Math.min(1.5,this.densityFactor+0.1)
}
}
}


/* =========================
   MAIN UPDATE LOOP
========================= */

update(delta){

const t=this.clock.elapsedTime

this.updateFPS(delta)

this.beatTime+=delta*3
const beatScale=1+Math.sin(this.beatTime)*0.08
this.heart.scale.set(beatScale,beatScale,beatScale)

this.updateSnow(delta)
this.updateDust(t)
this.updateGalaxy(t)
this.updateFireworks(delta)
this.updateShockwave(delta)

if(this.skyMaterial){
this.skyMaterial.uniforms.uTime.value=t
}
}


/* =========================
   CLEAN DISPOSE (GPU SAFE)
========================= */

dispose(){

// remove fireworks
for(const fw of this.fireworks){
this.scene.remove(fw.points)
fw.points.geometry.dispose()
fw.points.material.dispose()
}
this.fireworks=[]

// remove shockwaves
for(const s of this.shockwaves){
this.scene.remove(s.mesh)
s.mesh.geometry.dispose()
s.mesh.material.dispose()
}
this.shockwaves=[]

// traverse remaining objects
this.scene.traverse(obj=>{
if(obj.geometry) obj.geometry.dispose()

if(obj.material){
if(Array.isArray(obj.material)){
obj.material.forEach(m=>m.dispose())
}else{
obj.material.dispose()
}
}
})

// clear scene
while(this.scene.children.length>0){
this.scene.remove(this.scene.children[0])
}
}
