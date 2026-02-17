import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){
this.camera=camera
this.scene=new THREE.Scene()
this.clock=new THREE.Clock()
this.fireworks=[]
this.trails=[]
this.slowmo=0
}
init(){
this.camera.position.set(0,0,30)
this.scene.background=new THREE.Color(0x0d001a)
this.scene.fog=new THREE.FogExp2(0x1c0030,0.018)
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
const g=new THREE.ExtrudeGeometry(s,{depth:6,bevelEnabled:true,bevelThickness:2,bevelSize:1.5,bevelSegments:32,curveSegments:160})
g.center()
const pos=g.attributes.position
const cols=[]
for(let i=0;i<pos.count;i++){
const y=pos.getY(i)
const c=new THREE.Color()
if(y>6)c.set('#fff7fb')
else if(y>4)c.set('#ffd6f3')
else if(y>2)c.set('#ff9ee0')
else if(y>0)c.set('#ff66c8')
else if(y>-2)c.set('#ff3399')
else if(y>-4)c.set('#e60073')
else if(y>-6)c.set('#a8005c')
else c.set('#5c0038')
cols.push(c.r,c.g,c.b)
}
g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3))
const m=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:0.15,metalness:0.05,clearcoat:1,clearcoatRoughness:0,transmission:0.94,thickness:5,ior:1.55,transparent:true})
this.heart=new THREE.Mesh(g,m)
this.scene.add(this.heart)
}
createShell(){
const g=this.heart.geometry.clone()
const m=new THREE.MeshPhysicalMaterial({color:0xffaadf,roughness:0.05,transmission:0.7,thickness:7,transparent:true,opacity:0.2})
this.shell=new THREE.Mesh(g,m)
this.shell.scale.set(1.1,1.1,1.1)
this.scene.add(this.shell)
}
createCore(){
const g=new THREE.SphereGeometry(4.5,128,128)
const m=new THREE.ShaderMaterial({
transparent:true,
uniforms:{time:{value:0}},
vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`uniform float time;varying vec3 vPos;void main(){float r=length(vPos);float wave=sin(r*6.0-time*4.0)*0.5+0.5;vec3 col=mix(vec3(1.0,0.3,0.6),vec3(0.7,0.0,0.8),wave);gl_FragColor=vec4(col,0.25);}`
})
this.core=new THREE.Mesh(g,m)
this.scene.add(this.core)
}
createSnow(){
this.snow=[]
for(let l=0;l<3;l++){
const count=3000
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
p[i*3]=(Math.random()-0.5)*70
p[i*3+1]=Math.random()*45
p[i*3+2]=(Math.random()-0.5)*70
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:new THREE.Color().setHSL(0.9,0.5,0.95-l*0.2),size:0.05+l*0.03,transparent:true,opacity:0.9-l*0.3})
const snow=new THREE.Points(g,m)
this.scene.add(snow)
this.snow.push({mesh:snow,speed:0.02+l*0.025})
}
}
createDust(){
const count=2500
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
const r=12+Math.random()*8
const a=Math.random()*Math.PI*2
p[i*3]=Math.cos(a)*r
p[i*3+1]=(Math.random()-0.5)*10
p[i*3+2]=Math.sin(a)*r
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:0xff99cc,size:0.08,transparent:true,opacity:0.6})
this.dust=new THREE.Points(g,m)
this.scene.add(this.dust)
}
spawnRocket(){
const g=new THREE.BufferGeometry()
const p=new Float32Array(3)
p[0]=(Math.random()-0.5)*25
p[1]=-25
p[2]=(Math.random()-0.5)*25
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:0xffcce6,size:0.18})
const rocket=new THREE.Points(g,m)
rocket.userData={vy:0.6,phase:'up'}
this.scene.add(rocket)
this.fireworks.push(rocket)
}
explode(pos){
this.slowmo=0.6
const count=500
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
const dir=new THREE.Vector3((Math.random()-0.5),(Math.random()-0.5),(Math.random()-0.5)).normalize().multiplyScalar(Math.random()*7)
p[i*3]=pos.x+dir.x
p[i*3+1]=pos.y+dir.y
p[i*3+2]=pos.z+dir.z
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const col=new THREE.Color().setHSL(0.85+Math.random()*0.1,1,0.6)
const m=new THREE.PointsMaterial({color:col,size:0.14,transparent:true,opacity:1})
const burst=new THREE.Points(g,m)
burst.userData={life:1}
this.scene.add(burst)
this.fireworks.push(burst)
}
createLights(){
const l1=new THREE.PointLight(0xff6699,12,400)
l1.position.set(30,25,35)
const l2=new THREE.PointLight(0xff3385,10,320)
l2.position.set(-30,-20,30)
this.scene.add(l1,l2)
}
update(){
const dt=this.clock.getDelta()*(this.slowmo>0?this.slowmo:1)
if(this.slowmo>0)this.slowmo-=0.01
const t=this.clock.elapsedTime
const beat=1+Math.sin(t*6)*0.09+Math.sin(t*12)*0.05
this.heart.scale.set(beat,beat,beat)
this.shell.scale.set(beat*1.1,beat*1.1,beat*1.1)
this.core.scale.set(beat*0.85,beat*0.85,beat*0.85)
this.dust.rotation.y+=0.002
this.snow.forEach(layer=>{
const pos=layer.mesh.geometry.attributes.position
for(let i=0;i<pos.count;i++){
let y=pos.getY(i)-layer.speed
if(y<-30)y=40
pos.setY(i,y)
}
pos.needsUpdate=true
})
if(Math.random()<0.015)this.spawnRocket()
this.fireworks.forEach((fw,i)=>{
if(fw.userData.phase==='up'){
fw.position.y+=fw.userData.vy
fw.userData.vy+=0.02
if(fw.position.y>Math.random()*18){
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
this.core.material.uniforms.time.value=t
this.camera.position.x=Math.sin(t*0.25)*3
this.camera.position.y=Math.cos(t*0.2)*2
this.camera.lookAt(0,0,0)
}
dispose(){this.scene.clear()}
}
