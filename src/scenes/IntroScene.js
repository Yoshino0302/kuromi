import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){
this.camera=camera
this.scene=new THREE.Scene()
this.clock=new THREE.Clock()
this.phase='intro'
this.phaseTime=0
this.fps=60
this.frame=0
this.adaptive=1
this.tmpVec=new THREE.Vector3()
this.rockets=[]
this.bursts=[]
this.trails=[]
this.burstPool=[]
this.trailPool=[]
this.snow=[]
this.galaxyRotation=0
}
init(){
this.camera.position.set(0,0,75)
this.scene.background=new THREE.Color(0x130018)
this.scene.fog=new THREE.FogExp2(0x1a0030,0.009)
this.createLights()
this.createHeart()
this.createCore()
this.createInnerGlow()
this.createOuterAura()
this.createGalaxy()
this.createSnow()
this.createDust()
this.initFireworkPools()
}
createLights(){
const amb=new THREE.AmbientLight(0xffffff,0.55)
const key=new THREE.DirectionalLight(0xff66cc,1.6)
key.position.set(30,30,45)
const rim=new THREE.DirectionalLight(0xffffff,3.2)
rim.position.set(0,0,70)
this.scene.add(amb,key,rim)
}
createHeart(){
const s=new THREE.Shape()
s.moveTo(0,5)
s.bezierCurveTo(0,8,-6,8,-6,2)
s.bezierCurveTo(-6,-2,0,-5,0,-8)
s.bezierCurveTo(0,-5,6,-2,6,2)
s.bezierCurveTo(6,8,0,8,0,5)
const g=new THREE.ExtrudeGeometry(s,{depth:5,bevelEnabled:true,bevelThickness:1.3,bevelSize:1.2,bevelSegments:20,curveSegments:80})
g.center()
const pos=g.attributes.position
const cols=[]
for(let i=0;i<pos.count;i++){
const y=pos.getY(i)
const c=new THREE.Color()
if(y>3)c.set('#ffffff')
else if(y>1)c.set('#ff9ee0')
else if(y>-1)c.set('#ff4db8')
else if(y>-3)c.set('#c0007a')
else c.set('#5a0033')
cols.push(c.r,c.g,c.b)
}
g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3))
const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.22,metalness:0.4})
this.heart=new THREE.Mesh(g,m)
this.scene.add(this.heart)
}
createCore(){
const g=new THREE.SphereGeometry(5,96,96)
const m=new THREE.ShaderMaterial({
transparent:true,
uniforms:{time:{value:0}},
vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`uniform float time;varying vec3 vPos;void main(){float r=length(vPos);float wave=0.5+0.5*sin(r*12.0-time*6.0);vec3 col=mix(vec3(1.0,0.3,0.6),vec3(0.6,0.0,1.0),wave);gl_FragColor=vec4(col,0.35);}`
})
this.core=new THREE.Mesh(g,m)
this.scene.add(this.core)
}
createInnerGlow(){
const g=new THREE.SphereGeometry(8,64,64)
const m=new THREE.ShaderMaterial({
transparent:true,
blending:THREE.AdditiveBlending,
depthWrite:false,
uniforms:{time:{value:0}},
vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`uniform float time;varying vec3 vPos;void main(){float d=length(vPos)/8.0;float pulse=0.6+0.4*sin(time*3.0);float glow=smoothstep(1.0,0.25,d);vec3 col=vec3(1.0,0.2,0.7);gl_FragColor=vec4(col,glow*0.6*pulse);}`
})
this.innerGlow=new THREE.Mesh(g,m)
this.scene.add(this.innerGlow)
}
createOuterAura(){
const g=new THREE.SphereGeometry(16,48,48)
const m=new THREE.ShaderMaterial({
transparent:true,
blending:THREE.AdditiveBlending,
depthWrite:false,
uniforms:{time:{value:0}},
vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`uniform float time;varying vec3 vPos;void main(){float d=length(vPos)/16.0;float ring=smoothstep(1.0,0.5,d);float pulse=0.5+0.5*sin(time*1.5);vec3 col=vec3(0.8,0.1,1.0);gl_FragColor=vec4(col,ring*0.35*pulse);}`
})
this.outerAura=new THREE.Mesh(g,m)
this.scene.add(this.outerAura)
}
createGalaxy(){
const count=10000
const g=new THREE.BufferGeometry()
const arr=new Float32Array(count*3)
for(let i=0;i<count;i++){
const r=Math.random()*120
const a=r*0.15+Math.random()*0.8
arr[i*3]=Math.cos(a)*r
arr[i*3+1]=(Math.random()-0.5)*80
arr[i*3+2]=Math.sin(a)*r
}
g.setAttribute('position',new THREE.BufferAttribute(arr,3))
const m=new THREE.PointsMaterial({color:0xff66cc,size:0.14,transparent:true,opacity:0.75})
this.galaxy=new THREE.Points(g,m)
this.scene.add(this.galaxy)
}
createSnow(){
for(let l=0;l<3;l++){
const count=2500
const g=new THREE.BufferGeometry()
const arr=new Float32Array(count*3)
for(let i=0;i<count;i++){
arr[i*3]=(Math.random()-0.5)*100
arr[i*3+1]=Math.random()*70
arr[i*3+2]=(Math.random()-0.5)*100
}
g.setAttribute('position',new THREE.BufferAttribute(arr,3))
const m=new THREE.PointsMaterial({color:new THREE.Color().setHSL(0.9,0.6,0.9-l*0.2),size:0.06+l*0.04,transparent:true,opacity:0.85-l*0.3})
const snow=new THREE.Points(g,m)
this.scene.add(snow)
this.snow.push({mesh:snow,speed:0.025+l*0.02})
}
}
createDust(){
const count=3000
const g=new THREE.BufferGeometry()
const arr=new Float32Array(count*3)
for(let i=0;i<count;i++){
const r=16+Math.random()*10
const a=Math.random()*Math.PI*2
arr[i*3]=Math.cos(a)*r
arr[i*3+1]=(Math.random()-0.5)*14
arr[i*3+2]=Math.sin(a)*r
}
g.setAttribute('position',new THREE.BufferAttribute(arr,3))
const m=new THREE.PointsMaterial({color:0xff99cc,size:0.1,transparent:true,opacity:0.65})
this.dust=new THREE.Points(g,m)
this.scene.add(this.dust)
}
initFireworkPools(){
for(let i=0;i<30;i++){
const g=new THREE.BufferGeometry()
g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(800*3),3))
const m=new THREE.PointsMaterial({color:0xff66cc,size:0.18,transparent:true,opacity:1})
const burst=new THREE.Points(g,m)
burst.visible=false
burst.userData={life:0,vel:null}
this.scene.add(burst)
this.burstPool.push(burst)
}
}
launchRocket(){
if(this.burstPool.length===0)return
const rocket={
pos:new THREE.Vector3((Math.random()-0.5)*60,-40,(Math.random()-0.5)*40),
vel:new THREE.Vector3((Math.random()-0.5)*0.6,2.8+Math.random()*1.4,(Math.random()-0.5)*0.6),
life:0,
targetY:15+Math.random()*25
}
this.rockets.push(rocket)
}
spawnTrail(position){
if(this.trailPool.length<200){
const g=new THREE.BufferGeometry()
g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([position.x,position.y,position.z]),3))
const m=new THREE.PointsMaterial({color:0xff99dd,size:0.25,transparent:true,opacity:0.9})
const p=new THREE.Points(g,m)
p.userData={life:1}
this.scene.add(p)
this.trailPool.push(p)
}else{
const p=this.trailPool[this.frame%this.trailPool.length]
p.position.copy(position)
p.material.opacity=1
p.userData.life=1
}
}
explode(position){
if(this.burstPool.length===0)return
const burst=this.burstPool.pop()
const count=800
const posArr=new Float32Array(count*3)
const velArr=[]
for(let i=0;i<count;i++){
const theta=Math.random()*Math.PI*2
const phi=Math.random()*Math.PI
const speed=1+Math.random()*2.5
const vx=Math.sin(phi)*Math.cos(theta)*speed
const vy=Math.cos(phi)*speed
const vz=Math.sin(phi)*Math.sin(theta)*speed
velArr.push(new THREE.Vector3(vx,vy,vz))
posArr[i*3]=position.x
posArr[i*3+1]=position.y
posArr[i*3+2]=position.z
}
burst.geometry.setAttribute('position',new THREE.BufferAttribute(posArr,3))
burst.userData.vel=velArr
burst.userData.life=1.2
burst.visible=true
this.bursts.push(burst)
}
updateFireworks(dt){
if(Math.random()<0.08*this.adaptive)this.launchRocket()
for(let i=this.rockets.length-1;i>=0;i--){
const r=this.rockets[i]
r.life+=dt
r.pos.addScaledVector(r.vel,dt*60)
this.spawnTrail(r.pos)
if(r.pos.y>=r.targetY){
this.explode(r.pos.clone())
this.rockets.splice(i,1)
}
}
for(let i=this.bursts.length-1;i>=0;i--){
const b=this.bursts[i]
b.userData.life-=dt
const pos=b.geometry.attributes.position
for(let j=0;j<pos.count;j++){
const v=b.userData.vel[j]
v.multiplyScalar(0.96)
pos.array[j*3]+=v.x
pos.array[j*3+1]+=v.y
pos.array[j*3+2]+=v.z
}
pos.needsUpdate=true
b.material.opacity=b.userData.life
if(b.userData.life<=0){
b.visible=false
this.burstPool.push(b)
this.bursts.splice(i,1)
}
}
for(let i=0;i<this.trailPool.length;i++){
const t=this.trailPool[i]
t.userData.life-=dt*1.8
t.material.opacity=t.userData.life
if(t.userData.life<=0)t.material.opacity=0
}
}
updateSnow(dt){
for(let i=0;i<this.snow.length;i++){
const s=this.snow[i]
const pos=s.mesh.geometry.attributes.position
for(let j=0;j<pos.count;j++){
pos.array[j*3+1]-=s.speed*60*dt
if(pos.array[j*3+1]<-40)pos.array[j*3+1]=50
}
pos.needsUpdate=true
}
}
updateGalaxy(dt){
this.galaxyRotation+=dt*0.15
this.galaxy.rotation.y=this.galaxyRotation
}
updateHeart(t){
const beat=1+Math.sin(t*6)*0.05+Math.sin(t*12)*0.02
this.heart.scale.set(beat,beat,beat)
this.core.material.uniforms.time.value=t
this.innerGlow.material.uniforms.time.value=t
this.outerAura.material.uniforms.time.value=t
}
updateCamera(t){
this.camera.position.x=Math.sin(t*0.25)*6
this.camera.position.y=Math.cos(t*0.18)*3
this.camera.lookAt(0,0,0)
}
updateAdaptive(dt){
this.frame++
if(this.frame%30===0){
this.fps=1/dt
if(this.fps<45)this.adaptive=Math.max(0.6,this.adaptive-0.1)
if(this.fps>58)this.adaptive=Math.min(1.2,this.adaptive+0.05)
}
}
update(){
const dt=this.clock.getDelta()
const t=this.clock.getElapsedTime()
this.updateAdaptive(dt)
this.updateHeart(t)
this.updateGalaxy(dt)
this.updateSnow(dt)
this.updateFireworks(dt)
this.updateCamera(t)
}
dispose(){
this.scene.clear()
}
}
