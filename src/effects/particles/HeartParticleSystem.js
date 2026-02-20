import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

export class HeartParticlesSystem{

constructor(options={}){

this.options=options

this.scene=options.scene||null
this.colors=options.colors||ValentineColors
this.count=options.count||2000

this.state='constructed'
this.disposed=false

this.time=0

this.geometry=null
this.material=null
this.points=null

this.positions=null
this.offsets=null
this.scales=null

this.boundingRadius=options.boundingRadius||12

this._createGeometry()
this._createMaterial()
this._createPoints()

if(this.scene){
this.scene.add(this.points)
}

this.state='initialized'

}

_createGeometry(){

this.geometry=new THREE.BufferGeometry()

this.positions=new Float32Array(this.count*3)
this.offsets=new Float32Array(this.count)
this.scales=new Float32Array(this.count)

for(let i=0;i<this.count;i++){

const i3=i*3

this.positions[i3+0]=(Math.random()-0.5)*10
this.positions[i3+1]=(Math.random()-0.5)*6
this.positions[i3+2]=(Math.random()-0.5)*10

this.offsets[i]=Math.random()*Math.PI*2

this.scales[i]=Math.random()*1.5+0.5

}

this.geometry.setAttribute(
'position',
new THREE.BufferAttribute(this.positions,3)
)

this.geometry.setAttribute(
'offset',
new THREE.BufferAttribute(this.offsets,1)
)

this.geometry.setAttribute(
'scale',
new THREE.BufferAttribute(this.scales,1)
)

this.geometry.computeBoundingSphere()

}

_createMaterial(){

this.material=new THREE.ShaderMaterial({

transparent:true,

depthWrite:false,

blending:THREE.AdditiveBlending,

uniforms:{

time:{value:0},

colorA:{value:new THREE.Color(this.colors.primary)},

colorB:{value:new THREE.Color(this.colors.accent)},

pixelRatio:{value:Math.min(window.devicePixelRatio||1,2)}

},

vertexShader:`

uniform float time;
uniform float pixelRatio;

attribute float offset;
attribute float scale;

varying float vMix;
varying float vAlpha;

void main(){

vec3 pos=position;

float t=time*0.6+offset;

pos.y+=sin(t*1.5)*0.5*scale;
pos.x+=cos(t*0.9)*0.4*scale;
pos.z+=sin(t*0.7)*0.4*scale;

vMix=sin(t)*0.5+0.5;

vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);

float dist=-mvPosition.z;

float size=scale*14.0*pixelRatio;

size*=clamp(300.0/dist,0.0,4.0);

gl_PointSize=size;

vAlpha=clamp(size/10.0,0.2,1.0);

gl_Position=projectionMatrix*mvPosition;

}
`,

fragmentShader:`

uniform vec3 colorA;
uniform vec3 colorB;

varying float vMix;
varying float vAlpha;

void main(){

vec2 uv=gl_PointCoord.xy-0.5;

float d=length(uv);

if(d>0.5)discard;

float alpha=1.0-smoothstep(0.0,0.5,d);

vec3 color=mix(colorA,colorB,vMix);

gl_FragColor=vec4(color,alpha*vAlpha);

}
`

})

}

_createPoints(){

this.points=new THREE.Points(
this.geometry,
this.material
)

this.points.frustumCulled=false

}

update(delta){

if(this.disposed)return

this.time+=delta

this.material.uniforms.time.value=this.time

}

setCount(count){

if(this.disposed)return

this.count=count

this.dispose()

this._createGeometry()
this._createMaterial()
this._createPoints()

if(this.scene){
this.scene.add(this.points)
}

}

setColors(colorA,colorB){

if(this.disposed)return

this.material.uniforms.colorA.value.set(colorA)
this.material.uniforms.colorB.value.set(colorB)

}

setPixelRatio(ratio){

if(this.disposed)return

this.material.uniforms.pixelRatio.value=ratio

}

getObject(){

return this.points

}

dispose(){

if(this.disposed)return

this.state='disposing'

if(this.scene&&this.points){
this.scene.remove(this.points)
}

if(this.geometry){
this.geometry.dispose()
}

if(this.material){
this.material.dispose()
}

this.points=null
this.geometry=null
this.material=null

this.positions=null
this.offsets=null
this.scales=null

this.scene=null

this.disposed=true
this.state='disposed'

}

}
