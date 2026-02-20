import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

export class HeartParticlesSystem{

constructor(options={}){

this.options=options

this.scene=options.scene||null

this.colors=options.colors||ValentineColors

this.count=options.count??2000

this.boundingRadius=options.boundingRadius??20

this.state='constructed'
this.disposed=false

this.time=0

this.geometry=null
this.material=null
this.points=null

this.positions=null
this.offsets=null
this.scales=null

this.pixelRatio=Math.min(window.devicePixelRatio||1,2)

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

const radius=this.boundingRadius

for(let i=0;i<this.count;i++){

const i3=i*3

this.positions[i3+0]=(Math.random()-0.5)*radius
this.positions[i3+1]=(Math.random()-0.5)*radius*0.6
this.positions[i3+2]=(Math.random()-0.5)*radius

this.offsets[i]=Math.random()*Math.PI*2

this.scales[i]=Math.random()*1.2+0.4

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

this.geometry.boundingSphere=
new THREE.Sphere(
new THREE.Vector3(0,0,0),
radius*1.5
)

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

pixelRatio:{value:this.pixelRatio}

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

float t=time+offset;

float waveY=sin(t*1.7)*0.45*scale;
float waveX=cos(t*1.1)*0.35*scale;
float waveZ=sin(t*0.9)*0.35*scale;

pos.x+=waveX;
pos.y+=waveY;
pos.z+=waveZ;

vMix=sin(t)*0.5+0.5;

vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);

float dist=max(-mvPosition.z,0.001);

float size=scale*16.0*pixelRatio;

size*=clamp(300.0/dist,0.0,4.0);

gl_PointSize=size;

vAlpha=clamp(size/12.0,0.15,1.0);

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

float d=dot(uv,uv);

if(d>0.25)discard;

float alpha=smoothstep(0.25,0.0,d);

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

this.points.matrixAutoUpdate=true

}

update(delta){

if(this.disposed)return
if(delta<=0)return

this.time+=delta

this.material.uniforms.time.value=this.time

}

setCount(count){

if(this.disposed)return

this.count=count

this._rebuild()

}

setColors(colorA,colorB){

if(this.disposed)return

this.material.uniforms.colorA.value.set(colorA)
this.material.uniforms.colorB.value.set(colorB)

}

setPixelRatio(ratio){

if(this.disposed)return

this.pixelRatio=Math.min(ratio,2)

this.material.uniforms.pixelRatio.value=this.pixelRatio

}

_rebuild(){

if(this.points&&this.scene){

this.scene.remove(this.points)

}

if(this.geometry)this.geometry.dispose()
if(this.material)this.material.dispose()

this._createGeometry()
this._createMaterial()
this._createPoints()

if(this.scene){

this.scene.add(this.points)

}

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

if(this.geometry)this.geometry.dispose()
if(this.material)this.material.dispose()

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
