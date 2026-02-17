import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){this.camera=camera;this.scene=new THREE.Scene();this.clock=new THREE.Clock();this.fireworks=[]}
init(){
this.camera.position.set(0,0,26)
this.scene.background=new THREE.Color(0x0b0016)
this.scene.fog=new THREE.FogExp2(0x180028,0.022)
this.createHeart()
this.createCore()
this.createSnowLayers()
this.createLights()
}
createHeart(){
const s=new THREE.Shape()
s.moveTo(0,5)
s.bezierCurveTo(0,9,-7,9,-7,2)
s.bezierCurveTo(-7,-3,0,-6,0,-9)
s.bezierCurveTo(0,-6,7,-3,7,2)
s.bezierCurveTo(7,9,0,9,0,5)
const g=new THREE.ExtrudeGeometry(s,{depth:6,bevelEnabled:true,bevelThickness:1.8,bevelSize:1.4,bevelSegments:28,curveSegments:120})
g.center()
const pos=g.attributes.position
const cols=[]
for(let i=0;i<pos.count;i++){
const y=pos.getY(i)
const c=new THREE.Color()
if(y>5)c.set('#fff0f8')
else if(y>3)c.set('#ffd1ec')
else if(y>1)c.set('#ff99d6')
else if(y>-1)c.set('#ff4fb0')
else if(y>-3)c.set('#ff1f8a')
else if(y>-5)c.set('#cc0066')
else if(y>-7)c.set('#99004d')
else c.set('#5c0033')
cols.push(c.r,c.g,c.b)
}
g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3))
const m=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:0.12,metalness:0.05,clearcoat:1,clearcoatRoughness:0,transmission:0.92,thickness:4.5,ior:1.52,transparent:true})
this.heart=new THREE.Mesh(g,m)
this.scene.add(this.heart)
}
createCore(){
const g=new THREE.SphereGeometry(4,64,64)
const m=new THREE.MeshBasicMaterial({color:0xff66aa,transparent:true,opacity:0.2})
this.core=new THREE.Mesh(g,m)
this.scene.add(this.core)
}
createSnowLayers(){
this.snowLayers=[]
for(let l=0;l<3;l++){
const count=2500
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
p[i*3]=(Math.random()-0.5)*50
p[i*3+1]=Math.random()*35
p[i*3+2]=(Math.random()-0.5)*50
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:new THREE.Color().setHSL(0.9,0.6,0.8-l*0.1),size:0.06+l*0.03,transparent:true,opacity:0.8-l*0.2})
const snow=new THREE.Points(g,m)
this.scene.add(snow)
this.snowLayers.push({mesh:snow,speed:0.03+l*0.02})
}
}
spawnFirework(){
const origin=new THREE.Vector3((Math.random()-0.5)*20,-15,(Math.random()-0.5)*20)
const rocketGeo=new THREE.BufferGeometry()
const rocketPos=new Float32Array(3)
rocketPos[0]=origin.x
rocketPos[1]=origin.y
rocketPos[2]=origin.z
rocketGeo.setAttribute('position',new THREE.BufferAttribute(rocketPos,3))
const rocketMat=new THREE.PointsMaterial({color:0xff99cc,size:0.15})
const rocket=new THREE.Points(rocketGeo,rocketMat)
rocket.userData={vy:0.4,life:1,phase:'up'}
this.scene.add(rocket)
this.fireworks.push(rocket)
}
explode(position){
const count=300
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
const dir=new THREE.Vector3((Math.random()-0.5),(Math.random()-0.5),(Math.random()-0.5)).normalize().multiplyScalar(Math.random()*5)
p[i*3]=position.x+dir.x
p[i*3+1]=position.y+dir.y
p[i*3+2]=position.z+dir.z
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
const l1=new THREE.PointLight(0xff6699,10,300)
l1.position.set(20,20,25)
const l2=new THREE.PointLight(0xff3385,8,250)
l2.position.set(-20,-15,20)
this.scene.add(l1,l2)
}
update(){
const t=this.clock.getElapsedTime()
const beat=1+Math.sin(t*6)*0.07+Math.sin(t*12)*0.04
this.heart.scale.set(beat,beat,beat)
this.core.scale.set(beat*0.85,beat*0.85,beat*0.85)
this.heart.rotation.z=Math.sin(t*0.4)*0.05
this.snowLayers.forEach(layer=>{
const pos=layer.mesh.geometry.attributes.position
for(let i=0;i<pos.count;i++){
let y=pos.getY(i)-layer.speed
if(y<-20)y=30
pos.setY(i,y)
}
pos.needsUpdate=true
})
if(Math.random()<0.02)this.spawnFirework()
this.fireworks.forEach((fw,i)=>{
if(fw.userData.phase==='up'){
fw.position.y+=fw.userData.vy
fw.userData.vy+=0.01
if(fw.position.y>Math.random()*10){this.scene.remove(fw);this.fireworks.splice(i,1);this.explode(fw.position.clone())}
}else{
fw.material.opacity-=0.02
fw.userData.life-=0.02
if(fw.userData.life<=0){this.scene.remove(fw);this.fireworks.splice(i,1)}
}
})
this.camera.position.x=Math.sin(t*0.3)*2
this.camera.position.y=Math.cos(t*0.25)*1.5
this.camera.lookAt(0,0,0)
}
dispose(){this.scene.clear()}
}
