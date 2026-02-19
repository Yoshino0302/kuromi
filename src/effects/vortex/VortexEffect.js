import * as THREE from 'https://jspm.dev/three'

export class VortexEffect{

constructor(scene){

this.scene=scene

this.time=0

this.createVortex()

}

createVortex(){

const geometry=new THREE.CylinderGeometry(
0.1,
2,
3,
128,
128,
true
)

const material=new THREE.ShaderMaterial({

side:THREE.DoubleSide,

transparent:true,

uniforms:{
time:{value:0}
},

vertexShader:`

varying vec2 vUv;

void main(){

vUv=uv;

vec3 pos=position;

pos.x+=
sin(pos.y*5.0+time*5.0)*0.2;

gl_Position=
projectionMatrix*
modelViewMatrix*
vec4(pos,1.0);

}
`,

fragmentShader:`

varying vec2 vUv;

uniform float time;

void main(){

float glow=
sin(vUv.y*10.0-time*3.0)*0.5+0.5;

vec3 color=
vec3(glow,glow*0.5,1.0);

gl_FragColor=
vec4(color,0.6);

}
`

})

this.mesh=new THREE.Mesh(
geometry,
material
)

this.mesh.position.x=-3

this.scene.add(this.mesh)

}

update(delta){

this.time+=delta

this.mesh.material.uniforms.time.value=
this.time

this.mesh.rotation.y+=delta

}

}
