import * as THREE from 'https://jspm.dev/three'

export class VolumetricLight{

constructor(scene){

this.scene=scene

this.time=0

this.createLight()

}

createLight(){

const geometry=new THREE.ConeGeometry(
2,
6,
64,
64,
true
)

const material=new THREE.ShaderMaterial({

transparent:true,

depthWrite:false,

uniforms:{
time:{value:0}
},

vertexShader:`

varying vec2 vUv;

void main(){

vUv=uv;

gl_Position=
projectionMatrix*
modelViewMatrix*
vec4(position,1.0);

}
`,

fragmentShader:`

varying vec2 vUv;

uniform float time;

void main(){

float glow=
pow(1.0-vUv.y,3.0);

glow+=
sin(time*3.0+vUv.y*10.0)*0.1;

vec3 color=
vec3(0.3,0.6,1.0)*glow;

gl_FragColor=
vec4(color,glow*0.5);

}
`

})

this.mesh=new THREE.Mesh(
geometry,
material
)

this.mesh.rotation.x=Math.PI

this.mesh.position.y=3

this.scene.add(this.mesh)

}

update(delta){

this.time+=delta

this.mesh.material.uniforms.time.value=
this.time

}

}
