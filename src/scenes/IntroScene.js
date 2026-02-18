import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){
this.camera=camera
this.scene=new THREE.Scene()
this.clock=new THREE.Clock()
this.fireworks=[]
this.trails=[]
this.snow=[]
this.slowmo=0
}
init(){
this.camera.position.set(0,0,38)
this.scene.background=new THREE.Color(0x12001f)
this.scene.fog=new THREE.FogExp2(0x1a0030,0.01)
this.createHeart()
this.createShell()
this.createCore()
this.createHalo()
this.createGalaxy()
this.createSnow()
this.createDust()
this.createLights()
}
createHeart(){
const s=new THREE.Shape()
s.moveTo(0,5)
s.bezierCurveTo(0,8,-6,8,-6,2)
s.bezierCurveTo(-6,-2,0,-5,0,-8)
s.bezierCurveTo(0,-5,6,-2,6,2)
s.bezierCurveTo(6,8,0,8,0,5)
const g=new THREE.ExtrudeGeometry(s,{depth:4.5,bevelEnabled:true,bevelThickness:1.4,bevelSize:1.1,bevelSegments:18,curveSegments:70})
g.center()
const pos=g.attributes.position
const cols=[]
for(let i=0;i<pos.count;i++){
const y=pos.getY(i)
const c=new THREE.Color()
if(y>3)c.set('#ffffff')
else if(y>1)c.set('#ff9edc')
else if(y>-1)c.set('#ff4db8')
else if(y>-3)c.set('#d1007a')
else c.set('#7a003f')
cols.push(c.r,c.g,c.b)
}
g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3))
const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.22,metalness:0.25})
this.heart=new THREE.Mesh(g,m)
this.scene.add(this.heart)
}
createShell(){
const g=this.heart.geometry.clone()
const m=new THREE.MeshStandardMaterial({color:0xff66cc,transparent:true,opacity:0.15,roughness:0.1,metalness:0.3})
this.shell=new THREE.Mesh(g,m)
this.shell.scale.set(1.08,1.08,1.08)
this.scene.add(this.shell)
}
createCore(){
const g=new THREE.SphereGeometry(4.2,96,96)
const m=new THREE.ShaderMaterial({
transparent:true,
uniforms:{time:{value:0}},
vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`uniform float time;varying vec3 vPos;void main(){float r=length(vPos);float pulse=sin(r*10.0-time*6.0)*0.5+0.5;vec3 col=mix(vec3(1.0,0.3,0.6),vec3(0.6,0.0,0.9),pulse);gl_FragColor=vec4(col,0.3);}`
})
this.core=new THREE.Mesh(g,m)
this.scene.add(this.core)
}
createHalo(){
const g=new THREE.PlaneGeometry(40,40)
const m=new THREE.ShaderMaterial({
transparent:true,
uniforms:{time:{value:0}},
vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
fragmentShader:`uniform float time;varying vec2 vUv;void main(){vec2 uv=vUv-0.5;float d=length(uv);float glow=smoothstep(0.7,0.0,d);glow*=0.5;vec3 col=vec3(1.0,0.2,0.6);gl_FragColor=vec4(col,glow*0.4);}`
})
this.halo=new THREE.Mesh(g,m)
this.halo.position.z=-6
this.scene.add(this.halo)
}
createGalaxy(){
const count=8000
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
const radius=Math.random()*90
if(radius<14){p[i*3]=9999;p[i*3+1]=9999;p[i*3+2]=9999;continue}
const angle=radius*0.15+Math.random()*0.5
p[i*3]=Math.cos(angle)*radius
p[i*3+1]=(Math.random()-0.5)*60
p[i*3+2]=Math.sin(angle)*radius
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:0xff66cc,size:0.12,transparent:true,opacity:0.6})
this.galaxy=new THREE.Points(g,m)
this.scene.add(this.galaxy)
}
createSnow(){
for(let l=0;l<3;l++){
const count=2500
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
p[i*3]=(Math.random()-0.5)*80
p[i*3+1]=Math.random()*50
p[i*3+2]=(Math.random()-0.5)*80
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:new THREE.Color().setHSL(0.9,0.5,0.9-l*0.2),size:0.06+l*0.03,transparent:true,opacity:0.8-l*0.25})
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
p[0]=(Math.random()-0.5)*30
p[1]=-30
p[2]=(Math.random()-0.5)*30
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:0xffffff,size:0.2})
const rocket=new THREE.Points(g,m)
rocket.userData={vy:0.7,phase:'up'}
this.scene.add(rocket)
this.fireworks.push(rocket)
}
explode(pos){
this.slowmo=0.5
const count=600
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
const dir=new THREE.Vector3((Math.random()-0.5),(Math.random()-0.5),(Math.random()-0.5)).normalize().multiplyScalar(Math.random()*8)
p[i*3]=pos.x+dir.x
p[i*3+1]=pos.y+dir.y
p[i*3+2]=pos.z+dir.z
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:0xff66cc,size:0.16,transparent:true,opacity:1})
const burst=new THREE.Points(g,m)
burst.userData={life:1}
this.scene.add(burst)
this.fireworks.push(burst)
}
createLights(){
const amb=new THREE.AmbientLight(0xffffff,0.6)
const key=new THREE.DirectionalLight(0xff99cc,1.3)
key.position.set(20,25,30)
const rim=new THREE.DirectionalLight(0xffffff,2.5)
rim.position.set(0,0,45)
this.scene.add(amb,key,rim)
}
update(){
const dt=this.clock.getDelta()*(this.slowmo>0?this.slowmo:1)
if(this.slowmo>0)this.slowmo-=0.02
const t=this.clock.elapsedTime
const beat=1+Math.sin(t*6)*0.08
this.heart.scale.set(beat,beat,beat)
this.shell.scale.set(beat*1.08,beat*1.08,beat*1.08)
this.core.scale.set(beat*0.85,beat*0.85,beat*0.85)
this.halo.material.uniforms.time.value=t
this.core.material.uniforms.time.value=t
this.snow.forEach(layer=>{
const pos=layer.mesh.geometry.attributes.position
for(let i=0;i<pos.count;i++){
let y=pos.getY(i)-layer.speed
if(y<-40)y=50
pos.setY(i,y)
}
pos.needsUpdate=true
})
if(Math.random()<0.012)this.spawnRocket()
this.fireworks.forEach((fw,i)=>{
if(fw.userData.phase==='up'){
fw.position.y+=fw.userData.vy
fw.userData.vy+=0.03
if(fw.position.y>20){
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
this.camera.position.x=Math.sin(t*0.2)*3
this.camera.position.y=Math.cos(t*0.18)*2
this.camera.lookAt(0,0,0)
}
dispose(){this.scene.clear()}
}
