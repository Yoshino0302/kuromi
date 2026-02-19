import * as THREE from 'https://jspm.dev/three'

export class GlassPortalEffect{

constructor(scene){

this.scene=scene

this.time=0

this.createPortal()

}

createPortal(){

const geometry=new THREE.TorusGeometry(
1.5,
0.05,
128,
256
)

const material=new THREE.ShaderMaterial({

transparent:true,

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

uniform float time;

varying vec2 vUv;

void main(){

float glow=
sin(vUv.x*10.0+time*2.0)*0.5+0.5;

vec3 color=
mix(
vec3(0.2,0.6,1.0),
vec3(1.0,0.2,1.0),
glow
);

gl_FragColor=
vec4(color,0.8);

}
`

})

this.mesh=new THREE.Mesh(
geometry,
material
)

this.scene.add(this.mesh)

}

update(delta){

this.time+=delta

this.mesh.material.uniforms.time.value=
this.time

this.mesh.rotation.z+=delta*0.5

}

}
