import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){
this.camera=camera
this.scene=new THREE.Scene()
this.clock=new THREE.Clock()
this.fireworks=[]
this.trails=[]
}
init(){
this.camera.position.set(0,0,28)
this.scene.background=new THREE.Color(0x0c0018)
this.scene.fog=new THREE.FogExp2(0x1a002b,0.02)
this.createHeart()
this.createShell()
this.createCore()
this.createSnow()
this.createDust()
this.createLights()
}
createHeart(){
const s=new THREE.Shape()
s.moveTo(0,5)
s.bezierCurveTo(0,9,-7,9,-7,2)
s.bezierCurveTo(-7,-3,0,-6,0,-9)
s.bezierCurveTo(0,-6,7,-3,7,2)
s.bezierCurveTo(7,9,0,9,0,5)
const g=new THREE.ExtrudeGeometry(s,{depth:6,bevelEnabled:true,bevelThickness:1.8,bevelSize:1.4,bevelSegments:30,curveSegments:140})
g.center()
const pos=g.attributes.position
const cols=[]
for(let i=0;i<pos.count;i++){
const y=pos.getY(i)
const c=new THREE.Color()
if(y>6)c.set('#fff5fb')
else if(y>4)c.set('#ffd6f0')
else if(y>2)c.set('#ff9edc')
else if(y>0)c.set('#ff66c4')
else if(y>-2)c.set('#ff3399')
else if(y>-4)c.set('#e60073')
else if(y>-6)c.set('#a8005c')
else c.set('#5c0038')
cols.push(c.r,c.g,c.b)
}
g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3))
const m=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:0.12,metalness:0.05,clearcoat:1,clearcoatRoughness:0,transmission:0.93,thickness:4.8,ior:1.55,transparent:true})
this.heart=new THREE.Mesh(g,m)
this.scene.add(this.heart)
}
createShell(){
const g=this.heart.geometry.clone()
const m=new THREE.MeshPhysicalMaterial({color:0xff99dd,roughness:0.05,transmission:0.6,thickness:6,transparent:true,opacity:0.25})
this.shell=new THREE.Mesh(g,m)
this.shell.scale.set(1.08,1.08,1.08)
this.scene.add(this.shell)
}
createCore(){
const g=new THREE.SphereGeometry(4.2,64,64)
const m=new THREE.MeshBasicMaterial({color:0xff66aa,transparent:true,opacity:0.2})
this.core=new THREE.Mesh(g,m)
this.scene.add(this.core)
}
createSnow(){
this.snow=[]
for(let l=0;l<3;l++){
const count=2500
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
p[i*3]=(Math.random()-0.5)*60
p[i*3+1]=Math.random()*40
p[i*3+2]=(Math.random()-0.5)*60
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:new THREE.Color().setHSL(0.9,0.6,0.9-l*0.15),size:0.05+l*0.03,transparent:true,opacity:0.9-l*0.25})
const snow=new THREE.Points(g,m)
this.scene.add(snow)
this.snow.push({mesh:snow,speed:0.02+l*0.02})
}
}
createDust(){
const count=2000
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
const r=10+Math.random()*6
const a=Math.random()*Math.PI*2
p[i*3]=Math.cos(a)*r
p[i*3+1]=(Math.random()-0.5)*8
p[i*3+2]=Math.sin(a)*r
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:0xff88cc,size:0.07,transparent:true,opacity:0.6})
this.dust=new THREE.Points(g,m)
this.scene.add(this.dust)
}
spawnRocket(){
const g=new THREE.BufferGeometry()
const p=new Float32Array(3)
p[0]=(Math.random()-0.5)*20
p[1]=-20
p[2]=(Math.random()-0.5)*20
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:0xff99cc,size:0.15})
const rocket=new THREE.Points(g,m)
rocket.userData={vy:0.5,phase:'up'}
this.scene.add(rocket)
this.fireworks.push(rocket)
}
explode(pos){
const count=400
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
const dir=new THREE.Vector3((Math.random()-0.5),(Math.random()-0.5),(Math.random()-0.5)).normalize().multiplyScalar(Math.random()*6)
p[i*3]=pos.x+dir.x
p[i*3+1]=pos.y+dir.y
p[i*3+2]=pos.z+dir.z
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const col=new THREE.Color().setHSL(0.85+Math.random()*0.1,1,0.6)
const m=new THREE.PointsMaterial({color:col,size:0.12,transparent:true,opacity:1})
const burst=new THREE.Points(g,m)
burst.userData={life:1}
this.scene.add(burst)
this.fireworks.push(burst)
}
createLights(){
const l1=new THREE.PointLight(0xff6699,10,350)
l1.position.set(25,20,30)
const l2=new THREE.PointLight(0xff3385,8,280)
l2.position.set(-25,-18,25)
this.scene.add(l1,l2)
}
update(){
const t=this.clock.getElapsedTime()
const beat=1+Math.sin(t*6)*0.08+Math.sin(t*12)*0.05
this.heart.scale.set(beat,beat,beat)
this.shell.scale.set(beat*1.08,beat*1.08,beat*1.08)
this.core.scale.set(beat*0.85,beat*0.85,beat*0.85)
this.heart.rotation.z=Math.sin(t*0.4)*0.04
this.dust.rotation.y+=0.002
this.snow.forEach(layer=>{
const pos=layer.mesh.geometry.attributes.position
for(let i=0;i<pos.count;i++){
let y=pos.getY(i)-layer.speed
if(y<-25)y=35
pos.setY(i,y)
}
pos.needsUpdate=true
})
if(Math.random()<0.015)this.spawnRocket()
this.fireworks.forEach((fw,i)=>{
if(fw.userData.phase==='up'){
fw.position.y+=fw.userData.vy
fw.userData.vy+=0.015
if(fw.position.y>Math.random()*15){
const pos=fw.position.clone()
this.scene.remove(fw)
this.fireworks.splice(i,1)
this.explode(pos)
}
}else{
fw.material.opacity-=0.02
fw.userData.life-=0.02
fw.position.y-=0.05
if(fw.userData.life<=0){
this.scene.remove(fw)
this.fireworks.splice(i,1)
}
}
})
this.camera.position.x=Math.sin(t*0.3)*2.5
this.camera.position.y=Math.cos(t*0.25)*1.8
this.camera.lookAt(0,0,0)
}
dispose(){this.scene.clear()}
}
