import * as THREE from 'https://jspm.dev/three'

import { ValentineColors } from '../config/ValentineColors.js'

import { GlassPortalEffect } from '../effects/portal/GlassPortalEffect.js'
import { BlackholeEffect } from '../effects/blackhole/BlackholeEffect.js'
import { VortexEffect } from '../effects/vortex/VortexEffect.js'
import { VolumetricLight } from '../effects/volumetric/VolumetricLight.js'
import { EnergyParticles } from '../effects/particles/EnergyParticles.js'

export class SceneManager{

constructor(){

this.scene=new THREE.Scene()

this.scene.background=new THREE.Color(
ValentineColors.backgroundBottom
)

this.createCoreObjects()

this.createLights()

this.createEffects()

}

createCoreObjects(){

const geometry=new THREE.BoxGeometry(1,1,1)

const material=new THREE.MeshStandardMaterial({

color:new THREE.Color(
ValentineColors.primary
),

emissive:new THREE.Color(
ValentineColors.deep
),

emissiveIntensity:1.8,

roughness:0.25,

metalness:0.9

})

this.testMesh=new THREE.Mesh(
geometry,
material
)

this.scene.add(this.testMesh)

}

createLights(){

this.keyLight=new THREE.DirectionalLight(
ValentineColors.primarySoft,
4.5
)

this.keyLight.position.set(5,10,5)

this.scene.add(this.keyLight)

this.fillLight=new THREE.PointLight(
ValentineColors.secondarySoft,
7.0,
25
)

this.fillLight.position.set(-5,4,5)

this.scene.add(this.fillLight)

this.rimLight=new THREE.PointLight(
ValentineColors.accentSoft,
6.0,
25
)

this.rimLight.position.set(0,6,-6)

this.scene.add(this.rimLight)

this.ambientLight=new THREE.AmbientLight(
ValentineColors.deepSoft,
0.7
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

this.testMesh.rotation.x+=delta*0.4
this.testMesh.rotation.y+=delta*0.7

this.portalEffect.update(delta)

this.blackholeEffect.update(delta)

this.vortexEffect.update(delta)

this.volumetricLight.update(delta)

this.energyParticles.update(delta)

}

getScene(){

return this.scene

}

}
