import * as THREE from 'https://jspm.dev/three'

import { GlassPortalEffect } from '../effects/portal/GlassPortalEffect.js'
import { BlackholeEffect } from '../effects/blackhole/BlackholeEffect.js'
import { VortexEffect } from '../effects/vortex/VortexEffect.js'
import { VolumetricLight } from '../effects/volumetric/VolumetricLight.js'
import { EnergyParticles } from '../effects/particles/EnergyParticles.js'

export class SceneManager{

constructor(){

this.scene=new THREE.Scene()

this.scene.background=new THREE.Color(0x000000)

this.createCoreObjects()

this.createLights()

this.createEffects()

}

createCoreObjects(){

const geometry=new THREE.BoxGeometry(1,1,1)

const material=new THREE.MeshStandardMaterial({
color:0xff00ff,
emissive:0x220022,
roughness:0.25,
metalness:0.9
})

this.testMesh=new THREE.Mesh(
geometry,
material
)

this.testMesh.position.set(0,0,0)

this.scene.add(this.testMesh)

}

createLights(){

this.directionalLight=new THREE.DirectionalLight(
0xffffff,
3.0
)

this.directionalLight.position.set(5,10,5)

this.scene.add(this.directionalLight)

this.ambientLight=new THREE.AmbientLight(
0xffffff,
0.25
)

this.scene.add(this.ambientLight)

}

createEffects(){

this.portalEffect=
new GlassPortalEffect(this.scene)

this.blackholeEffect=
new BlackholeEffect(this.scene)

this.vortexEffect=
new VortexEffect(this.scene)

this.volumetricLight=
new VolumetricLight(this.scene)

this.energyParticles=
new EnergyParticles(this.scene)

}

update(delta){

if(this.testMesh){

this.testMesh.rotation.x+=delta*0.5
this.testMesh.rotation.y+=delta*0.7

}

if(this.portalEffect){

this.portalEffect.update(delta)

}

if(this.blackholeEffect){

this.blackholeEffect.update(delta)

}

if(this.vortexEffect){

this.vortexEffect.update(delta)

}

if(this.volumetricLight){

this.volumetricLight.update(delta)

}

if(this.energyParticles){

this.energyParticles.update(delta)

}

}

getScene(){

return this.scene

}

}
