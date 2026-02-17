import * as THREE from 'https://jspm.dev/three'
export class IntroScene{
constructor(camera){this.camera=camera;this.scene=new THREE.Scene();this.clock=new THREE.Clock()}
init(){
this.camera.position.set(0,0,26)
this.scene.background=new THREE.Color(0x080012)
this.scene.fog=new THREE.FogExp2(0x120018,0.028)
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
const g=new THREE.ExtrudeGeometry(s,{depth:5.2,bevelEnabled:true,bevelThickness:1.6,bevelSize:1.25,bevelSegments:20,curveSegments:90})
g.center()
const pos=g.attributes.position
const cols=[]
for(let i=0;i<pos.count;i++){
const y=pos.getY(i)
const c=new THREE.Color()
if(y>4)c.set('#ffd6ff')
else if(y>2)c.set('#ff6ec7')
else if(y>0)c.set('#ff2a5f')
else if(y>-2)c.set('#d1007a')
else if(y>-5)c.set('#7a005f')
else c.set('#3a003f')
cols.push(c.r,c.g,c.b)
}
g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3))
const m=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:0.06,metalness:0.05,clearcoat:1,clearcoatRoughness:0,transmission:0.92,thickness:3.8,ior:1.52,reflectivity:1,emissive:0xff2a8a,emissiveIntensity:2,transparent:true})
this.heart=new THREE.Mesh(g,m)
this.scene.add(this.heart)
}
createGlowShell(){
const g=this.heart.geometry.clone()
const m=new THREE.MeshBasicMaterial({color:0xff4fd8,transparent:true,opacity:0.09,side:THREE.BackSide})
this.glow=new THREE.Mesh(g,m)
this.glow.scale.set(1.2,1.2,1.2)
this.scene.add(this.glow)
}
createInnerCore(){
const g=new THREE.SphereGeometry(3.7,64,64)
const m=new THREE.MeshBasicMaterial({color:0xff0066,transparent:true,opacity:0.55})
this.core=new THREE.Mesh(g,m)
this.scene.add(this.core)
}
createAura(){
const g=new THREE.SphereGeometry(11,64,64)
const m=new THREE.MeshBasicMaterial({color:0xaa00ff,transparent:true,opacity:0.04,side:THREE.BackSide})
this.aura=new THREE.Mesh(g,m)
this.scene.add(this.aura)
}
createRings(){
this.rings=[]
for(let i=0;i<5;i++){
const g=new THREE.TorusGeometry(12+i*1.8,0.2,32,800)
const m=new THREE.MeshBasicMaterial({color:0xff2a8a,transparent:true,opacity:0.4})
const r=new THREE.Mesh(g,m)
r.rotation.x=Math.random()*Math.PI
r.rotation.y=Math.random()*Math.PI
this.scene.add(r)
this.rings.push(r)
}
}
createParticles(){
const count=6000
const g=new THREE.BufferGeometry()
const p=new Float32Array(count*3)
const c=new Float32Array(count*3)
for(let i=0;i<count;i++){
const r=20*Math.random()
const a=Math.random()*Math.PI*2
const x=Math.cos(a)*r
const y=(Math.random()-0.5)*15
const z=Math.sin(a)*r
p[i*3]=x
p[i*3+1]=y
p[i*3+2]=z
const col=new THREE.Color()
if(r<7)col.set('#ff2a5f')
else if(r<14)col.set('#ff00aa')
else col.set('#aa00ff')
c[i*3]=col.r
c[i*3+1]=col.g
c[i*3+2]=col.b
}
g.setAttribute('position',new THREE.BufferAttribute(p,3))
g.setAttribute('color',new THREE.BufferAttribute(c,3))
const m=new THREE.PointsMaterial({vertexColors:true,size:0.045,transparent:true,opacity:0.75})
this.particles=new THREE.Points(g,m)
this.scene.add(this.particles)
}
createLights(){
const l1=new THREE.PointLight(0xff2a5f,20,350)
l1.position.set(24,20,26)
const l2=new THREE.PointLight(0xaa00ff,18,320)
l2.position.set(-24,-18,22)
const l3=new THREE.PointLight(0xff66ff,12,260)
l3.position.set(0,28,16)
this.scene.add(l1,l2,l3)
}
update(){
const t=this.clock.getElapsedTime()
const beat=1+Math.sin(t*6)*0.09+Math.sin(t*12)*0.05
this.heart.scale.set(beat,beat,beat)
this.glow.scale.set(beat*1.22,beat*1.22,beat*1.22)
this.core.scale.set(beat*0.78,beat*0.78,beat*0.78)
this.aura.scale.set(beat*1.3,beat*1.3,beat*1.3)
const hueShift=(Math.sin(t*0.5)+1)/2
this.core.material.color.setHSL(0.95-hueShift*0.35,1,0.55)
this.heart.material.emissive.setHSL(0.98-hueShift*0.4,1,0.6)
this.rings.forEach((r,i)=>{r.rotation.y+=0.0015+i*0.0007;r.rotation.x+=0.0009;r.material.color.setHSL(0.9+Math.sin(t*0.4+i)*0.1,1,0.55)})
this.particles.rotation.y+=0.0013
this.camera.position.x=Math.sin(t*0.35)*2.2
this.camera.position.y=Math.cos(t*0.28)*1.6
this.camera.lookAt(0,0,0)
}
dispose(){this.scene.clear()}
}
