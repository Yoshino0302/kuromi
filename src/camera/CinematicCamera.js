import * as THREE from 'https://jspm.dev/three'

export class CinematicCamera{

constructor(options={}){

this.options=options
this.debug=options.debug===true

this.state='constructed'
this.disposed=false

this.camera=new THREE.PerspectiveCamera(
options.fov||60,
window.innerWidth/window.innerHeight,
options.near||0.1,
options.far||1000
)

this.camera.position.set(0,2,8)

this.target=new THREE.Vector3(0,0,0)
this.currentLook=new THREE.Vector3(0,0,0)

this.basePosition=this.camera.position.clone()

this.time=0

this.orbitRadius=options.orbitRadius||8
this.orbitSpeed=options.orbitSpeed||0.15
this.orbitEnabled=true

this.breathAmplitude=options.breathAmplitude||0.25
this.breathSpeed=options.breathSpeed||1.2
this.breathEnabled=true

this.shakeOffset=new THREE.Vector3()
this.shakeInternal=new THREE.Vector3()
this.shakeAmplitude=options.shakeAmplitude||0.04
this.shakeSpeed=options.shakeSpeed||18
this.shakeEnabled=true

this.positionSmooth=options.positionSmooth||3.5
this.lookSmooth=options.lookSmooth||4.5

this.tmpVec=new THREE.Vector3()
this.tmpLook=new THREE.Vector3()

this.velocity=new THREE.Vector3()

this._installResizeHandler()

this.state='initialized'

}

_installResizeHandler(){

this._resizeHandler=()=>{

if(this.disposed)return

const aspect=window.innerWidth/window.innerHeight

this.camera.aspect=aspect
this.camera.updateProjectionMatrix()

}

window.addEventListener('resize',this._resizeHandler,{passive:true})

}

update(delta){

if(this.disposed)return

this.time+=delta

this._computeOrbit(delta)

this._computeBreath(delta)

this._computeShake(delta)

this._applyPosition(delta)

this._applyLook(delta)

}

_computeOrbit(delta){

if(!this.orbitEnabled)return

const orbitAngle=this.time*this.orbitSpeed

const x=this.target.x+Math.cos(orbitAngle)*this.orbitRadius
const z=this.target.z+Math.sin(orbitAngle)*this.orbitRadius

this.tmpVec.setX(x)
this.tmpVec.setZ(z)

}

_computeBreath(delta){

if(!this.breathEnabled)return

const breath=Math.sin(this.time*this.breathSpeed)*this.breathAmplitude

this.tmpVec.setY(this.target.y+2.0+breath)

}

_computeShake(delta){

if(!this.shakeEnabled)return

const shakeX=Math.sin(this.time*this.shakeSpeed)*this.shakeAmplitude
const shakeY=Math.cos(this.time*this.shakeSpeed*1.3)*this.shakeAmplitude
const shakeZ=Math.sin(this.time*this.shakeSpeed*0.7)*this.shakeAmplitude

this.shakeInternal.set(shakeX,shakeY,shakeZ)

}

_applyPosition(delta){

this.tmpVec.add(this.shakeInternal)
this.tmpVec.add(this.shakeOffset)

const alpha=Math.min(delta*this.positionSmooth,1.0)

this.camera.position.lerp(this.tmpVec,alpha)

}

_applyLook(delta){

this.tmpLook.copy(this.target)

const alpha=Math.min(delta*this.lookSmooth,1.0)

this.currentLook.lerp(this.tmpLook,alpha)

this.camera.lookAt(this.currentLook)

}

setTarget(x,y,z){

this.target.set(x,y,z)

}

setTargetVector(vec3){

this.target.copy(vec3)

}

setPosition(x,y,z){

this.camera.position.set(x,y,z)

}

setOrbitRadius(radius){

this.orbitRadius=radius

}

setOrbitSpeed(speed){

this.orbitSpeed=speed

}

setOrbitEnabled(enabled){

this.orbitEnabled=enabled

}

setBreath(amplitude,speed){

this.breathAmplitude=amplitude
this.breathSpeed=speed

}

setBreathEnabled(enabled){

this.breathEnabled=enabled

}

setShake(amplitude,speed){

this.shakeAmplitude=amplitude
this.shakeSpeed=speed

}

setShakeEnabled(enabled){

this.shakeEnabled=enabled

}

addShake(offset){

if(!offset)return

this.shakeOffset.add(offset)

}

clearShake(){

this.shakeOffset.set(0,0,0)

}

lookAt(vec3){

this.target.copy(vec3)

}

getCamera(){

return this.camera

}

getPosition(){

return this.camera.position

}

getTarget(){

return this.target

}

getForwardVector(){

const forward=new THREE.Vector3()

this.camera.getWorldDirection(forward)

return forward

}

dispose(){

if(this.disposed)return

this.state='disposing'

window.removeEventListener('resize',this._resizeHandler)

this.camera=null

this.target=null
this.currentLook=null
this.tmpVec=null
this.tmpLook=null
this.shakeOffset=null
this.shakeInternal=null
this.velocity=null

this.disposed=true
this.state='disposed'

}

}
