import * as THREE from 'https://jspm.dev/three'

export class BlackholeEffect{

constructor(scene){

this.scene=scene

this.time=0

this.createBlackhole()

}

createBlackhole(){

const geometry=new THREE.SphereGeometry(
1,
128,
128
)

const material=new THREE.ShaderMaterial({

uniforms:{
time:{value:0}
},

vertexShader:`

varying vec3 vPos;

void main(){

vPos=position;

gl_Position=
projectionMatrix*
modelViewMatrix*
vec4(position,1.0);

}
`,

fragmentShader:`

uniform float time;

varying vec3 vPos;

void main(){

float dist=
length(vPos.xy);

float glow=
1.0-dist;

glow+=
sin(dist*10.0-time*3.0)*0.1;

vec3 color=
vec3(glow*0.5,glow*0.2,glow);

gl_FragColor=
vec4(color,1.0);

}
`

})

this.mesh=new THREE.Mesh(
geometry,
material
)

this.mesh.position.x=3

this.scene.add(this.mesh)

}

update(delta){

this.time+=delta

this.mesh.material.uniforms.time.value=
this.time

this.mesh.rotation.y+=delta*0.3

}

}
