import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../src/config/ValentineColors.js'
export class HeartParticlesSystem{
constructor(scene,count=2000){
this.scene=scene
this.count=count
this.time=0
this.geometry=new THREE.BufferGeometry()
const positions=new Float32Array(count*3)
const offsets=new Float32Array(count)
const scales=new Float32Array(count)
for(let i=0;i<count;i++){
positions[i*3+0]=(Math.random()-0.5)*10
positions[i*3+1]=(Math.random()-0.5)*6
positions[i*3+2]=(Math.random()-0.5)*10
offsets[i]=Math.random()*Math.PI*2
scales[i]=Math.random()*1.5+0.5
}
this.geometry.setAttribute('position',new THREE.BufferAttribute(positions,3))
this.geometry.setAttribute('offset',new THREE.BufferAttribute(offsets,1))
this.geometry.setAttribute('scale',new THREE.BufferAttribute(scales,1))
this.material=new THREE.ShaderMaterial({
transparent:true,
depthWrite:false,
blending:THREE.AdditiveBlending,
uniforms:{
time:{value:0},
colorA:{value:new THREE.Color(ValentineColors.primary)},
colorB:{value:new THREE.Color(ValentineColors.accent)}
},
vertexShader:`
uniform float time;
attribute float offset;
attribute float scale;
varying float vMix;
void main(){
vec3 pos=position;
float t=time*0.6+offset;
pos.y+=sin(t*1.5)*0.5*scale;
pos.x+=cos(t*0.9)*0.4*scale;
pos.z+=sin(t*0.7)*0.4*scale;
vMix=sin(t)*0.5+0.5;
vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);
gl_PointSize=scale*12.0*(300.0/-mvPosition.z);
gl_Position=projectionMatrix*mvPosition;
}
`,
fragmentShader:`
uniform vec3 colorA;
uniform vec3 colorB;
varying float vMix;
void main(){
vec2 uv=gl_PointCoord.xy-0.5;
float d=length(uv);
if(d>0.5)discard;
float alpha=1.0-smoothstep(0.0,0.5,d);
vec3 color=mix(colorA,colorB,vMix);
gl_FragColor=vec4(color,alpha);
}
`
})
this.points=new THREE.Points(this.geometry,this.material)
this.scene.add(this.points)
}
update(delta){
this.time+=delta
this.material.uniforms.time.value=this.time
}
dispose(){
this.scene.remove(this.points)
this.geometry.dispose()
this.material.dispose()
}
}
