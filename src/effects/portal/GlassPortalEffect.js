import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../../config/ValentineColors.js'

export class GlassPortalEffect{

constructor(options={}){

this.options=options

this.scene=options.scene||null
this.camera=options.camera||null
this.colors=options.colors||ValentineColors

this.state='constructed'
this.disposed=false

this.group=new THREE.Group()
this.group.name='GlassPortalEffect'

this.mesh=null
this.geometry=null
this.material=null

this.clock=new THREE.Clock()

this.rotationSpeed=options.rotationSpeed||0.5
this.pulseSpeed=options.pulseSpeed||2.0
this.pulseAmplitude=options.pulseAmplitude||0.15

this.baseScale=1

this.tmpVec=new THREE.Vector3()

this._createPortal()

if(this.scene){
this.scene.add(this.group)
}

this.state='initialized'

}

_createPortal(){

this.geometry=new THREE.TorusGeometry(
2,
0.35,
128,
256
)

this.material=new THREE.MeshPhysicalMaterial({

color:this.colors.primary,

emissive:this.colors.glow,
emissiveIntensity:2.5,

metalness:0.0,
roughness:0.0,

transmission:1.0,
thickness:1.8,

ior:1.45,

transparent:true,
opacity:0.95,

depthWrite:false,

})

this.mesh=new THREE.Mesh(
this.geometry,
this.material
)

this.mesh.castShadow=false
this.mesh.receiveShadow=false

this.group.add(this.mesh)

}

update(delta,elapsed){

if(this.disposed)return

if(elapsed===undefined){
elapsed=this.clock.getElapsedTime()
}

this._updateRotation(delta)

this._updatePulse(elapsed)

this._updateCameraReactive(elapsed)

}

_updateRotation(delta){

this.group.rotation.z+=delta*this.rotationSpeed

}

_updatePulse(elapsed){

const pulse=Math.sin(elapsed*this.pulseSpeed)*this.pulseAmplitude

const scale=this.baseScale+pulse

this.group.scale.set(scale,scale,scale)

}

_updateCameraReactive(elapsed){

if(!this.camera)return

const cam=this.camera.getCamera?.()||this.camera

if(!cam)return

this.tmpVec.copy(cam.position)

const distance=this.tmpVec.distanceTo(this.group.position)

const intensity=THREE.MathUtils.clamp(
1.5+(10-distance)*0.15,
1.5,
4.0
)

this.material.emissiveIntensity+=
(intensity-this.material.emissiveIntensity)*0.05

}

setPosition(x,y,z){

this.group.position.set(x,y,z)

}

setScale(scale){

this.baseScale=scale

this.group.scale.set(scale,scale,scale)

}

setRotationSpeed(speed){

this.rotationSpeed=speed

}

setPulse(amplitude,speed){

this.pulseAmplitude=amplitude
this.pulseSpeed=speed

}

resize(width,height){

}

getObject(){

return this.group

}

dispose(){

if(this.disposed)return

this.state='disposing'

if(this.scene){
this.scene.remove(this.group)
}

if(this.mesh){

this.group.remove(this.mesh)

}

if(this.geometry){
this.geometry.dispose()
}

if(this.material){
this.material.dispose()
}

this.mesh=null
this.geometry=null
this.material=null

this.group=null
this.scene=null
this.camera=null

this.tmpVec=null

this.disposed=true
this.state='disposed'

}

}
