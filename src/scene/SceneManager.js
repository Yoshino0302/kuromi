import * as THREE from 'https://jspm.dev/three'
import { PortalEffect } from '../effects/PortalEffect.js'
import { BlackholeEffect } from '../effects/BlackholeEffect.js'
import { HeartParticlesSystem } from '../effects/HeartParticlesSystem.js'
import { LightingSystem } from '../lighting/LightingSystem.js'
import { ValentineColors } from '../config/ValentineColors.js'

export class SceneManager{

constructor(){

this.scene=new THREE.Scene()

this.scene.background=new THREE.Color(ValentineColors.background)

this.scene.matrixAutoUpdate=true

this.time=0

this.initialized=false

this.init()

}

init(){

if(this.initialized)return

this.initialized=true

this.initLighting()

this.initPortal()

this.initBlackhole()

this.initParticles()

this.initEnvironment()

}

initLighting(){

this.lightingSystem=
new LightingSystem(this.scene)

}

initPortal(){

this.portal=
new PortalEffect(this.scene)

this.portal.setPosition(0,0,0)

this.portal.setScale(1.0)

}

initBlackhole(){

this.blackhole=
new BlackholeEffect(this.scene)

this.blackhole.setPosition(0,0,-5)

this.blackhole.setScale(0.85)

}

initParticles(){

this.heartParticles=
new HeartParticlesSystem(
this.scene,
3000
)

}

initEnvironment(){

const geo=
new THREE.SphereGeometry(
50,
64,
64
)

const mat=
new THREE.ShaderMaterial({

side:THREE.BackSide,

uniforms:{
colorA:{
value:
new THREE.Color(
ValentineColors.primary
)
},
colorB:{
value:
new THREE.Color(
ValentineColors.accent
)
},
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
uniform vec3 colorA;
uniform vec3 colorB;
uniform float time;
varying vec3 vPos;
void main(){
float h=
normalize(vPos).y*
0.5+0.5;
vec3 color=
mix(colorA,colorB,h);
float pulse=
sin(time*0.5)*0.1+0.9;
gl_FragColor=
vec4(color*pulse,1.0);
}
`

})

this.environmentMesh=
new THREE.Mesh(geo,mat)

this.scene.add(
this.environmentMesh
)

this.environmentMaterial=
mat

}

update(delta){

this.time+=delta

if(this.portal)
this.portal.update(delta)

if(this.blackhole)
this.blackhole.update(delta)

if(this.heartParticles)
this.heartParticles.update(delta)

if(this.lightingSystem)
this.lightingSystem.update(delta)

if(this.environmentMaterial)
this.environmentMaterial.uniforms.time.value=
this.time

}

getScene(){

return this.scene

}

dispose(){

if(this.portal)
this.portal.dispose()

if(this.blackhole)
this.blackhole.dispose()

if(this.heartParticles)
this.heartParticles.dispose()

if(this.lightingSystem)
this.lightingSystem.dispose()

if(this.environmentMesh){

this.scene.remove(
this.environmentMesh
)

this.environmentMesh.geometry.dispose()

this.environmentMesh.material.dispose()

}

}

}
