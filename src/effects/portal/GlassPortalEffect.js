import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../src/config/ValentineColors.js'
export class PortalEffect{
constructor(scene){
this.scene=scene
this.time=0
this.group=new THREE.Group()
this.scene.add(this.group)
this.createCore()
this.createRings()
this.createGlow()
}
createCore(){
this.coreGeo=new THREE.PlaneGeometry(4,4,1,1)
this.coreMat=new THREE.ShaderMaterial({
transparent:true,
depthWrite:false,
blending:THREE.AdditiveBlending,
uniforms:{
time:{value:0},
colorA:{value:new THREE.Color(ValentineColors.primary)},
colorB:{value:new THREE.Color(ValentineColors.accent)}
},
vertexShader:`
varying vec2 vUv;
void main(){
vUv=uv;
gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
`,
fragmentShader:`
uniform float time;
uniform vec3 colorA;
uniform vec3 colorB;
varying vec2 vUv;
float hash(vec2 p){
return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);
}
float noise(vec2 p){
vec2 i=floor(p);
vec2 f=fract(p);
float a=hash(i);
float b=hash(i+vec2(1.0,0.0));
float c=hash(i+vec2(0.0,1.0));
float d=hash(i+vec2(1.0,1.0));
vec2 u=f*f*(3.0-2.0*f);
return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}
void main(){
vec2 uv=vUv-0.5;
float r=length(uv);
float angle=atan(uv.y,uv.x);
float swirl=angle+time*1.2+(1.0-r)*3.0;
vec2 distorted=vec2(cos(swirl),sin(swirl))*r;
float n=noise(distorted*4.0+time*0.5);
float mask=smoothstep(0.6,0.2,r);
vec3 color=mix(colorA,colorB,n);
float alpha=(1.0-r)*mask*1.4;
gl_FragColor=vec4(color,alpha);
}
`
})
this.coreMesh=new THREE.Mesh(this.coreGeo,this.coreMat)
this.group.add(this.coreMesh)
}
createRings(){
this.rings=[]
for(let i=0;i<3;i++){
const geo=new THREE.RingGeometry(2.2+i*0.3,2.4+i*0.3,64)
const mat=new THREE.MeshBasicMaterial({
color:i%2===0?ValentineColors.primary:ValentineColors.accent,
transparent:true,
opacity:0.35,
blending:THREE.AdditiveBlending,
side:THREE.DoubleSide
})
const mesh=new THREE.Mesh(geo,mat)
mesh.rotation.z=Math.random()*Math.PI
this.group.add(mesh)
this.rings.push(mesh)
}
}
createGlow(){
const geo=new THREE.PlaneGeometry(6,6)
const mat=new THREE.MeshBasicMaterial({
color:ValentineColors.glow,
transparent:true,
opacity:0.25,
blending:THREE.AdditiveBlending,
depthWrite:false
})
this.glow=new THREE.Mesh(geo,mat)
this.group.add(this.glow)
}
setPosition(x,y,z){
this.group.position.set(x,y,z)
}
setScale(s){
this.group.scale.setScalar(s)
}
update(delta){
this.time+=delta
this.coreMat.uniforms.time.value=this.time
for(let i=0;i<this.rings.length;i++){
const ring=this.rings[i]
ring.rotation.z+=delta*(0.4+i*0.2)
ring.material.opacity=0.25+Math.sin(this.time*2.0+i)*0.15
}
this.glow.material.opacity=0.2+Math.sin(this.time*3.0)*0.1
}
dispose(){
this.scene.remove(this.group)
this.coreGeo.dispose()
this.coreMat.dispose()
this.glow.geometry.dispose()
this.glow.material.dispose()
for(const r of this.rings){
r.geometry.dispose()
r.material.dispose()
}
}
}
