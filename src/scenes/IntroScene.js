import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){this.camera=camera;this.scene=new THREE.Scene();this.clock=new THREE.Clock()}
init(){
this.camera.position.set(0,0,26)
this.scene.background=new THREE.Color(0x070010)
this.scene.fog=new THREE.FogExp2(0x090012,0.03)
this.createHeart()
this.createGlowShell()
this.createInnerCore()
this.createAura()
this.createRings()
this.createParticles()
this.createLights()
}
createHeart(){
const s=new THREE.Shape()
s.moveTo(0,5)
s.bezierCurveTo(0,9,-7,9,-7,2)
s.bezierCurveTo(-7,-3,0,-6,0,-9)
s.bezierCurveTo(0,-6,7,-3,7,2)
s.bezierCurveTo(7,9,0,9,0,5)
const g=new THREE.ExtrudeGeometry(s,{depth:5,bevelEnabled:true,bevelThickness:1.5,bevelSize:1.2,bevelSegments:18,curveSegments:80})
g.center()
const pos=g.attributes.position
const cols=[]
for(let i=0;i<pos.count;i++){
const y=pos.getY(i)
const c=new THREE.Color()
if(y>4)c.set('#ffe6fa')
else if(y>2)c.set('#ff9be8')
else if(y>0)c.set('#ff4fc3')
else if(y>-2)c.set('#e1008c')
else if(y>-5)c.set('#9c005f')
else c.set('#540032')
cols.push(c.r,c.g,c.b)
}
g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3))
const m=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:0.08,metalness:0.05,clearcoat:1,clearcoatRoughness:0,transmission:0.9,thickness:3.5,ior:1.5,reflectivity:1,emissive:0xff3fb0,emissiveIntensity:1.8,transparent:true})
this.heart=new THREE.Mesh(g,m)
this.scene.add(this.heart)
}
createGlowShell(){
const g=this.heart.geometry.clone()
const m=new THREE.MeshBasicMaterial({color:0xff66ff,transparent:true,opacity:0.08,side:THREE.BackSide})
this.glow=new THREE.Mesh(g,m)
this.glow.scale.set(1.15,1.15,1.15)
this.scene.add(this.glow)
}
createInnerCore(){
const g=new THREE.SphereGeometry(3.6,64,64)
const m=new THREE.MeshBasicMaterial({color:0xff00cc,transparent:true,opacity:0.5})
this.core=new THREE.Mesh(g,m)
this.scene.add(this.core)
}
createAura(){
const g=new THREE.SphereGeometry(10,64,64)
const m=new THREE.MeshBasicMaterial({color:0xff66ff,transparent:true,opacity:0.05,side:THREE.BackSide})
this.aura=new THREE.Mesh(g,m)
this.scene.add(this.aura)
}
createRings(){
this.rings=[]
const tones=[0xff00aa,0xff66ff,0xff2a8a,0xff99ff]
for(let i=0;i<4;i++){
const g=new THREE.TorusGeometry(12+i*1.6,0.18,32,700)
const m=new THREE.MeshBasicMaterial({color:tones[i],transparent:true,opacity:0.45})
const r=new THREE.Mesh(g,m)
r.rotation.x=Math.random()*Math.PI
r.rotation.y=Math.random()*Math.PI
this.scene.add(r)
this.rings.push(r)
}
}
createParticles(){
const count=5000
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
for(let i=0;i<count;i++){
const r=18*Math.random()
const a=Math.random()*Math.PI*2
p[i*3]=Math.cos(a)*r
p[i*3+1]=(Math.random()-0.5)*14
p[i*3+2]=Math.sin(a)*r
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
const m=new THREE.PointsMaterial({color:0xff88dd,size:0.04,transparent:true,opacity:0.75})
this.particles=new THREE.Points(g,m)
this.scene.add(this.particles)
}
createLights(){
const l1=new THREE.PointLight(0xff4fc3,18,300)
l1.position.set(22,18,24)
const l2=new THREE.PointLight(0xaa00ff,15,280)
l2.position.set(-22,-16,20)
const l3=new THREE.PointLight(0xffc2f2,10,220)
l3.position.set(0,24,14)
this.scene.add(l1,l2,l3)
}
update(){
const t=this.clock.getElapsedTime()
const beat=1+Math.sin(t*6)*0.08+Math.sin(t*12)*0.045
this.heart.scale.set(beat,beat,beat)
this.glow.scale.set(beat*1.18,beat*1.18,beat*1.18)
this.core.scale.set(beat*0.8,beat*0.8,beat*0.8)
this.aura.scale.set(beat*1.25,beat*1.25,beat*1.25)
const hue=(Math.sin(t*0.6)+1)/2
this.core.material.color.setHSL(0.9-hue*0.3,1,0.6)
this.heart.material.emissive.setHSL(0.95-hue*0.35,1,0.55)
this.rings.forEach((r,i)=>{r.rotation.y+=0.0012+i*0.0006;r.rotation.x+=0.0007;r.material.opacity=0.35+Math.sin(t*3+i)*0.1})
this.particles.rotation.y+=0.0011
this.camera.position.x=Math.sin(t*0.35)*2
this.camera.position.y=Math.cos(t*0.28)*1.4
this.camera.lookAt(0,0,0)
}
dispose(){this.scene.clear()}
}
