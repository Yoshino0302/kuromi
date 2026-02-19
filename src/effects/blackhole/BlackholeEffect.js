import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../src/config/ValentineColors.js'
export class BlackholeEffect{
constructor(scene){
this.scene=scene
this.group=new THREE.Group()
this.scene.add(this.group)
this.time=0
this.createSingularity()
this.createAccretionDisk()
this.createPhotonRing()
this.createGlow()
}
createSingularity(){
this.geo=new THREE.PlaneGeometry(5,5,1,1)
this.mat=new THREE.ShaderMaterial({
transparent:true,
depthWrite:false,
blending:THREE.AdditiveBlending,
uniforms:{
time:{value:0},
colorA:{value:new THREE.Color(ValentineColors.accent)},
colorB:{value:new THREE.Color(ValentineColors.primary)}
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
float spin=angle+time*2.5+(1.0-r)*6.0;
vec2 distorted=vec2(cos(spin),sin(spin))*r;
float n=noise(distorted*6.0+time);
float disk=smoothstep(0.5,0.2,r);
float hole=smoothstep(0.2,0.0,r);
vec3 color=mix(colorA,colorB,n);
float alpha=disk*(1.0-hole)*1.4;
gl_FragColor=vec4(color,alpha);
}
`
})
this.mesh=new THREE.Mesh(this.geo,this.mat)
this.group.add(this.mesh)
}
createAccretionDisk(){
const geo=new THREE.RingGeometry(1.2,2.2,128)
const mat=new THREE.MeshBasicMaterial({
color:ValentineColors.primary,
transparent:true,
opacity:0.6,
blending:THREE.AdditiveBlending,
side:THREE.DoubleSide
})
this.disk=new THREE.Mesh(geo,mat)
this.disk.rotation.x=Math.PI*0.5
this.group.add(this.disk)
}
createPhotonRing(){
const geo=new THREE.RingGeometry(0.9,1.1,128)
const mat=new THREE.MeshBasicMaterial({
color:ValentineColors.glow,
transparent:true,
opacity:0.9,
blending:THREE.AdditiveBlending,
side:THREE.DoubleSide
})
this.ring=new THREE.Mesh(geo,mat)
this.group.add(this.ring)
}
createGlow(){
const geo=new THREE.PlaneGeometry(7,7)
const mat=new THREE.MeshBasicMaterial({
color:ValentineColors.secondary,
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
this.mat.uniforms.time.value=this.time
this.disk.rotation.z+=delta*1.5
this.ring.rotation.z-=delta*0.8
this.disk.material.opacity=0.5+Math.sin(this.time*3.0)*0.2
this.ring.material.opacity=0.8+Math.sin(this.time*4.0)*0.15
this.glow.material.opacity=0.2+Math.sin(this.time*2.0)*0.1
}
dispose(){
this.scene.remove(this.group)
this.geo.dispose()
this.mat.dispose()
this.disk.geometry.dispose()
this.disk.material.dispose()
this.ring.geometry.dispose()
this.ring.material.dispose()
this.glow.geometry.dispose()
this.glow.material.dispose()
}
}
