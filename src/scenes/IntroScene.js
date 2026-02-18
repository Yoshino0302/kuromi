import * as THREE from 'https://jspm.dev/three'

class IntroSceneV2{
constructor(){
this.container=document.body
this.clock=new THREE.Clock()
this.scene=new THREE.Scene()
this.camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,2000)
this.camera.position.set(0,2,12)
this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})
this.renderer.setSize(window.innerWidth,window.innerHeight)
this.renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))
this.renderer.outputColorSpace=THREE.SRGBColorSpace
this.renderer.toneMapping=THREE.ACESFilmicToneMapping
this.renderer.toneMappingExposure=1.2
this.container.appendChild(this.renderer.domElement)
window.addEventListener('resize',()=>this.onResize())
this.fps=60
this.frameCount=0
this.fpsTimer=0
this.densityFactor=1
this.initLights()
this.createGradientSky()
this.createHeart()
this.animate()
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
const mat=new THREE.ShaderMaterial({
side:THREE.BackSide,
uniforms:{uTime:{value:0}},
vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`varying vec3 vPos;void main(){float h=normalize(vPos).y;vec3 c1=vec3(0.35,0.0,0.4);vec3 c2=vec3(0.8,0.0,0.3);vec3 c3=vec3(1.0,0.3,0.6);vec3 col=mix(c1,c2,smoothstep(-0.2,0.5,h));col=mix(col,c3,pow(max(h,0.0),3.0));gl_FragColor=vec4(col,1.0);}`
})
this.sky=new THREE.Mesh(geo,mat)
this.scene.add(this.sky)
}
createHeart(){
const shape=new THREE.Shape()
shape.moveTo(0,0)
shape.bezierCurveTo(0,3,-4,3,-4,0)
shape.bezierCurveTo(-4,-3,0,-5,0,-7)
shape.bezierCurveTo(0,-5,4,-3,4,0)
shape.bezierCurveTo(4,3,0,3,0,0)
const geo=new THREE.ExtrudeGeometry(shape,{depth:2,bevelEnabled:true,bevelSegments:6,steps:2,bevelSize:0.4,bevelThickness:0.6})
geo.center()
const mat=new THREE.MeshStandardMaterial({color:0xff2a6d,emissive:0x550022,roughness:0.3,metalness:0.1})
this.heart=new THREE.Mesh(geo,mat)
this.heart.scale.set(0.7,0.7,0.7)
this.scene.add(this.heart)
this.beatTime=0
}
createSnow(){
this.snowCount=1500
const geo=new THREE.BufferGeometry()
const pos=new Float32Array(this.snowCount*3)
for(let i=0;i<this.snowCount;i++){
pos[i*3]=(Math.random()-0.5)*200
pos[i*3+1]=Math.random()*100
pos[i*3+2]=(Math.random()-0.5)*200
}
geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
const mat=new THREE.PointsMaterial({color:0xffb6ff,size:0.6,transparent:true,opacity:0.8,depthWrite:false})
this.snow=new THREE.Points(geo,mat)
this.scene.add(this.snow)
}
updateSnow(dt){
const arr=this.snow.geometry.attributes.position.array
for(let i=0;i<this.snowCount;i++){
arr[i*3+1]-=dt*10
if(arr[i*3+1]<-10)arr[i*3+1]=100
}
this.snow.geometry.attributes.position.needsUpdate=true
}
createDust(){
this.dustCount=2000
const geo=new THREE.BufferGeometry()
const pos=new Float32Array(this.dustCount*3)
for(let i=0;i<this.dustCount;i++){
pos[i*3]=(Math.random()-0.5)*100
pos[i*3+1]=(Math.random()-0.5)*50
pos[i*3+2]=(Math.random()-0.5)*100
}
geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
const mat=new THREE.PointsMaterial({color:0xff77aa,size:0.3,transparent:true,opacity:0.6})
this.dust=new THREE.Points(geo,mat)
this.scene.add(this.dust)
}
updateDust(t){
this.dust.rotation.y=t*0.02
this.dust.rotation.x=t*0.01
}
createGalaxy(){
this.galaxyCount=6000
const geo=new THREE.BufferGeometry()
const pos=new Float32Array(this.galaxyCount*3)
const colors=new Float32Array(this.galaxyCount*3)
for(let i=0;i<this.galaxyCount;i++){
const r=Math.random()*150
const branch=i%5
const angle=branch/5*Math.PI*2+r*0.05
pos[i*3]=Math.cos(angle)*r+(Math.random()-0.5)*5
pos[i*3+1]=(Math.random()-0.5)*20
pos[i*3+2]=Math.sin(angle)*r+(Math.random()-0.5)*5
const color=new THREE.Color().setHSL(0.9-Math.random()*0.2,0.8,0.6)
colors[i*3]=color.r
colors[i*3+1]=color.g
colors[i*3+2]=color.b
}
geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
geo.setAttribute('color',new THREE.BufferAttribute(colors,3))
const mat=new THREE.PointsMaterial({size:0.7,vertexColors:true,transparent:true,opacity:0.9,depthWrite:false})
this.galaxy=new THREE.Points(geo,mat)
this.scene.add(this.galaxy)
}
updateGalaxy(t){
this.galaxy.rotation.y=t*0.01
}
createFireworks(){
this.fireworks=[]
this.fireworkPool=200
}
spawnFirework(){
const patterns=['sphere','ring','spiral','burst']
const type=patterns[Math.floor(Math.random()*patterns.length)]
const count=Math.floor(200*this.densityFactor)
const geo=new THREE.BufferGeometry()
const pos=new Float32Array(count*3)
const vel=[]
for(let i=0;i<count;i++){
let dir=new THREE.Vector3()
if(type==='sphere'){dir.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize()}
if(type==='ring'){const a=Math.random()*Math.PI*2;dir.set(Math.cos(a),0,Math.sin(a))}
if(type==='spiral'){const a=i/count*Math.PI*10;dir.set(Math.cos(a),i/count,Math.sin(a))}
if(type==='burst'){dir.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1)}
pos[i*3]=0
pos[i*3+1]=0
pos[i*3+2]=0
vel.push(dir.multiplyScalar(Math.random()*20+20))
}
geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
const mat=new THREE.PointsMaterial({color:new THREE.Color().setHSL(Math.random(),1,0.6),size:0.8,transparent:true,opacity:1,depthWrite:false})
const points=new THREE.Points(geo,mat)
points.position.set((Math.random()-0.5)*40,Math.random()*20+5,(Math.random()-0.5)*40)
this.scene.add(points)
this.fireworks.push({points,vel,life:2})
}
updateFireworks(dt){
for(let i=this.fireworks.length-1;i>=0;i--){
const fw=this.fireworks[i]
const arr=fw.points.geometry.attributes.position.array
for(let j=0;j<fw.vel.length;j++){
arr[j*3]+=fw.vel[j].x*dt
arr[j*3+1]+=fw.vel[j].y*dt
arr[j*3+2]+=fw.vel[j].z*dt
fw.vel[j].y-=9.8*dt*0.5
}
fw.points.geometry.attributes.position.needsUpdate=true
fw.life-=dt
fw.points.material.opacity=fw.life/2
if(fw.life<=0){
this.scene.remove(fw.points)
this.fireworks.splice(i,1)
}
}
if(Math.random()<0.4*this.densityFactor)this.spawnFirework()
}
createShockwave(){
this.shockwaves=[]
}
spawnShockwave(pos){
const geo=new THREE.RingGeometry(0.5,0.7,64)
const mat=new THREE.MeshBasicMaterial({color:0xff66aa,transparent:true,opacity:0.6,side:THREE.DoubleSide})
const mesh=new THREE.Mesh(geo,mat)
mesh.position.copy(pos)
mesh.rotation.x=-Math.PI/2
this.scene.add(mesh)
this.shockwaves.push({mesh,life:1})
}
updateShockwave(dt){
for(let i=this.shockwaves.length-1;i>=0;i--){
const s=this.shockwaves[i]
s.mesh.scale.multiplyScalar(1+dt*5)
s.mesh.material.opacity-=dt
s.life-=dt
if(s.life<=0){
this.scene.remove(s.mesh)
this.shockwaves.splice(i,1)
}
}
}
updateFPS(dt){
this.frameCount++
this.fpsTimer+=dt
if(this.fpsTimer>=1){
this.fps=this.frameCount
this.frameCount=0
this.fpsTimer=0
if(this.fps<45)this.densityFactor=Math.max(0.4,this.densityFactor-0.1)
if(this.fps>55)this.densityFactor=Math.min(1.5,this.densityFactor+0.1)
}
}
initAll(){
this.createSnow()
this.createDust()
this.createGalaxy()
this.createFireworks()
this.createShockwave()
}
animate(){
requestAnimationFrame(()=>this.animate())
const dt=this.clock.getDelta()
const t=this.clock.elapsedTime
this.updateFPS(dt)
this.beatTime+=dt*3
const beatScale=1+Math.sin(this.beatTime)*0.08
this.heart.scale.set(beatScale,beatScale,beatScale)
this.updateSnow(dt)
this.updateDust(t)
this.updateGalaxy(t)
this.updateFireworks(dt)
this.updateShockwave(dt)
this.renderer.render(this.scene,this.camera)
}
onResize(){
this.camera.aspect=window.innerWidth/window.innerHeight
this.camera.updateProjectionMatrix()
this.renderer.setSize(window.innerWidth,window.innerHeight)
}
}
const intro=new IntroSceneV2()
intro.initAll()
