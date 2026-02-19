import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../../config/ValentineColors.js'

export class GlassPortalEffect{

constructor(scene){

this.scene=scene

this.time=0

this.createPortal()

}

createPortal(){

const geometry=new THREE.TorusGeometry(
2,
0.15,
64,
128
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
sin(vUv.x*6.283+time*2.0)*0.5+0.5;

vec3 color=mix(
vec3(1.0,0.3,0.6),
vec3(1.0,0.0,0.3),
glow
);

gl_FragColor=
vec4(color,1.0);

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

this.mesh.rotation.z+=delta*0.6

}

}
