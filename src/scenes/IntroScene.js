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
this.rockets=[]
this.bursts=[]
this.trails=[]
this.burstPool=[]
this.trailPool=[]
this.snow=[]
this.tmpVec=new THREE.Vector3()
}
init(){
this.camera.position.set(0,0,70)
this.scene.background=new THREE.Color(0x120018)
this.scene.fog=new THREE.FogExp2(0x1a0030,0.01)
this.createLights()
this.createHeart()
this.createCore()
this.createAura()
this.createGalaxy()
this.createSnow()
this.createDust()
this.initFireworks()
}
createLights(){
const amb=new THREE.AmbientLight(0xffffff,0.6)
const key=new THREE.DirectionalLight(0xff66cc,1.4)
key.position.set(30,30,40)
const rim=new THREE.DirectionalLight(0xffffff,3)
rim.position.set(0,0,60)
this.scene.add(amb,key,rim)
}
createHeart(){
const s=new THREE.Shape()
s.moveTo(0,5)
s.bezierCurveTo(0,8,-6,8,-6,2)
s.bezierCurveTo(-6,-2,0,-5,0,-8)
s.bezierCurveTo(0,-5,6,-2,6,2)
s.bezierCurveTo(6,8,0,8,0,5)
const g=new THREE.ExtrudeGeometry(s,{depth:4.5,bevelEnabled:true,bevelThickness:1.2,bevelSize:1.1,bevelSegments:18,curveSegments:70})
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
else c.set('#660033')
cols.push(c.r,c.g,c.b)
}
g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3))
const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.25,metalness:0.35})
this.heart=new THREE.Mesh(g,m)
this.scene.add(this.heart)
}
createCore(){
const g=new THREE.SphereGeometry(4.5,96,96)
const m=new THREE.ShaderMaterial({
transparent:true,
uniforms:{time:{value:0}},
vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`uniform float time;varying vec3 vPos;void main(){float r=length(vPos);float pulse=0.5+0.5*sin(r*10.0-time*5.0);vec3 col=mix(vec3(1.0,0.3,0.6),vec3(0.6,0.0,1.0),pulse);gl_FragColor=vec4(col,0.3);}`
})
this.core=new THREE.Mesh(g,m)
this.scene.add(this.core)
}
createAura(){
const g=new THREE.SphereGeometry(12,64,64)
const m=new THREE.ShaderMaterial({
transparent:true,
blending:THREE.AdditiveBlending,
depthWrite:false,
uniforms:{time:{value:0}},
vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`uniform float time;varying vec3 vPos;void main(){float d=length(vPos)/12.0;float glow=smoothstep(1.0,0.2,d);float pulse=0.6+0.4*sin(time*2.0);vec3 col=vec3(1.0,0.2,0.7);gl_FragColor=vec4(col,glow*0.5*pulse);}`
})
this.aura=new THREE.Mesh(g,m)
this.scene.add(this.aura)
}
createGalaxy(){
const count=8000
const g=new THREE.BufferGeometry()
const arr=new Float32Array(count*3)
for(let i=0;i<count;i++){
const r=Math.random()*100
const a=r*0.18+Math.random()*0.6
arr[i*3]=Math.cos(a)*r
arr[i*3+1]=(Math.random()-0.5)*70
arr[i*3+2]=Math.sin(a)*r
}
g.setAttribute('position',new THREE.BufferAttribute(arr,3))
const m=new THREE.PointsMaterial({color:0xff66cc,size:0.13,transparent:true,opacity:0.7})
this.galaxy=new THREE.Points(g,m)
this.scene.add(this.galaxy)
}
createSnow(){
for(let l=0;l<3;l++){
const count=2000
const g=new THREE.BufferGeometry()
const arr=new Float32Array(count*3)
for(let i=0;i<count;i++){
arr[i*3]=(Math.random()-0.5)*90
arr[i*3+1]=Math.random()*60
arr[i*3+2]=(Math.random()-0.5)*90
}
g.setAttribute('position',new THREE.BufferAttribute(arr,3))
const m=new THREE.PointsMaterial({color:new THREE.Color().setHSL(0.9,0.6,0.9-l*0.2),size:0.06+l*0.03,transparent:true,opacity:0.8-l*0.3})
const snow=new THREE.Points(g,m)
this.scene.add(snow)
this.snow.push({mesh:snow,speed:0.02+l*0.02})
}
}
createDust(){
const count=2000
const g=new THREE.BufferGeometry()
const arr=new Float32Array(count*3)
for(let i=0;i<count;i++){
const r=14+Math.random()*8
const a=Math.random()*Math.PI*2
arr[i*3]=Math.cos(a)*r
arr[i*3+1]=(Math.random()-0.5)*12
arr[i*3+2]=Math.sin(a)*r
}
g.setAttribute('position',new THREE.BufferAttribute(arr,3))
const m=new THREE.PointsMaterial({color:0xff99cc,size:0.09,transparent:true,opacity:0.6})
this.dust=new THREE.Points(g,m)
this.scene.add(this.dust)
}
initFireworks(){
for(let i=0;i<20;i++){
const g=new THREE.BufferGeometry()
g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(600*3),3))
const m=new THREE.PointsMaterial({color:0xff66cc,size:0.15,transparent:true,opacity:1})
const burst=new THREE.Points(g,m)
burst.visible=false
burst.userData={life:0}
this.scene.add(burst)
this.burstPool.push(burst)
}
}
spawnRocket(){
const geo=new THREE.BufferGeometry()
geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array([(Math.random()-0.5)*40,-40,(Math.random()-0.5)*40]),3))
const mat=new THREE.PointsMaterial({color:0xffffff,size:0.22})
const rocket=new THREE.Points(geo,mat)
rocket.userData={vy:1}
this.scene.add(rocket)
this.rockets.push(rocket)
}
explode(x,y,z){
if(this.burstPool.length===0)return
const burst=this.burstPool.pop()
burst.visible=true
burst.userData.life=1
const pos=burst.geometry.attributes.position
for(let i=0;i<pos.count;i++){
const dir=this.tmpVec.set((Math.random()-0.5),(Math.random()-0.5),(Math.random()-0.5)).normalize().multiplyScalar(Math.random()*10)
pos.setXYZ(i,x+dir.x,y+dir.y,z+dir.z)
}
pos.needsUpdate=true
this.bursts.push(burst)
}
updateFireworks(){
if(Math.random()<0.04*this.adaptive)this.spawnRocket()
for(let i=this.rockets.length-1;i>=0;i--){
const r=this.rockets[i]
r.position.y+=r.userData.vy
r.userData.vy+=0.05
if(r.position.y>25){
this.explode(r.position.x,r.position.y,r.position.z)
this.scene.remove(r)
this.rockets.splice(i,1)
}
}
for(let i=this.bursts.length-1;i>=0;i--){
const b=this.bursts[i]
b.material.opacity-=0.03
b.userData.life-=0.03
b.position.y-=0.08
if(b.userData.life<=0){
b.visible=false
b.material.opacity=1
this.burstPool.push(b)
this.bursts.splice(i,1)
}
}
}
updateCamera(dt){
if(this.phase==='intro'){
this.phaseTime+=dt
this.camera.position.z-=dt*15
if(this.camera.position.z<=40){
this.camera.position.z=40
this.phase='idle'
}
}else{
const t=this.clock.elapsedTime
this.camera.position.x=Math.sin(t*0.2)*3
this.camera.position.y=Math.cos(t*0.18)*2
}
this.camera.lookAt(0,0,0)
}
update(){
const dt=this.clock.getDelta()
this.frame++
if(this.frame%30===0){
this.fps=1/dt
this.adaptive=this.fps<45?0.6:1
}
const t=this.clock.elapsedTime
const beat=1+Math.sin(t*6)*0.08
this.heart.scale.set(beat,beat,beat)
this.core.scale.set(beat*0.85,beat*0.85,beat*0.85)
this.aura.scale.set(beat*1.1,beat*1.1,beat*1.1)
this.core.material.uniforms.time.value=t
this.aura.material.uniforms.time.value=t
this.galaxy.rotation.y+=0.001
this.dust.rotation.y+=0.002
for(let layer of this.snow){
const pos=layer.mesh.geometry.attributes.position
for(let i=0;i<pos.count;i++){
let y=pos.getY(i)-layer.speed
if(y<-50)y=60
pos.setY(i,y)
}
pos.needsUpdate=true
}
this.updateFireworks()
this.updateCamera(dt)
}
dispose(){this.scene.clear()}
}
