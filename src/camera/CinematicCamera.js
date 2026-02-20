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

this.camera.matrixAutoUpdate=true

this.position=this.camera.position

this.target=new THREE.Vector3()
this.currentLook=new THREE.Vector3()

this.basePosition=new THREE.Vector3()

this.desiredPosition=new THREE.Vector3()
this.desiredLook=new THREE.Vector3()

this.velocity=new THREE.Vector3()
this.lookVelocity=new THREE.Vector3()

this.time=0

this.orbitRadius=options.orbitRadius??8
this.orbitSpeed=options.orbitSpeed??0.15
this.orbitEnabled=true

this.breathAmplitude=options.breathAmplitude??0.25
this.breathSpeed=options.breathSpeed??1.2
this.breathEnabled=true

this.shakeAmplitude=options.shakeAmplitude??0.04
this.shakeSpeed=options.shakeSpeed??18
this.shakeEnabled=true

this.externalShake=new THREE.Vector3()
this.internalShake=new THREE.Vector3()
this.finalShake=new THREE.Vector3()

this.positionSmooth=options.positionSmooth??6.0
this.lookSmooth=options.lookSmooth??8.0

this.tmpVec=new THREE.Vector3()
this.tmpVec2=new THREE.Vector3()

this.forward=new THREE.Vector3()
this.right=new THREE.Vector3()
this.up=new THREE.Vector3(0,1,0)

this.quaternion=new THREE.Quaternion()
this.tmpQuat=new THREE.Quaternion()

this._installResizeHandler()

this._reset()

this.state='initialized'

}

_reset(){

this.position.set(0,2,8)

this.basePosition.copy(this.position)

this.target.set(0,0,0)

this.currentLook.copy(this.target)

this.desiredPosition.copy(this.position)

this.desiredLook.copy(this.target)

this.velocity.set(0,0,0)
this.lookVelocity.set(0,0,0)

this.externalShake.set(0,0,0)
this.internalShake.set(0,0,0)
this.finalShake.set(0,0,0)

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

if(delta<=0)return

this.time+=delta

this._computeDesiredTransform(delta)

this._computeShake(delta)

this._integratePosition(delta)

this._integrateLook(delta)

this._applyTransform()

}

_computeDesiredTransform(delta){

const t=this.time

let x=this.target.x
let y=this.target.y+2
let z=this.target.z

if(this.orbitEnabled){

const angle=t*this.orbitSpeed

x+=Math.cos(angle)*this.orbitRadius
z+=Math.sin(angle)*this.orbitRadius

}

if(this.breathEnabled){

y+=Math.sin(t*this.breathSpeed)*this.breathAmplitude

}

this.desiredPosition.set(x,y,z)

this.desiredLook.copy(this.target)

}

_computeShake(delta){

if(this.shakeEnabled){

const t=this.time*this.shakeSpeed

this.internalShake.set(
Math.sin(t)*this.shakeAmplitude,
Math.cos(t*1.3)*this.shakeAmplitude,
Math.sin(t*0.7)*this.shakeAmplitude
)

}else{

this.internalShake.set(0,0,0)

}

this.finalShake.copy(this.internalShake)
this.finalShake.add(this.externalShake)

}

_integratePosition(delta){

const smooth=1-Math.exp(-this.positionSmooth*delta)

this.tmpVec.copy(this.desiredPosition)
this.tmpVec.add(this.finalShake)

this.position.lerp(this.tmpVec,smooth)

}

_integrateLook(delta){

const smooth=1-Math.exp(-this.lookSmooth*delta)

this.currentLook.lerp(this.desiredLook,smooth)

}

_applyTransform(){

this.camera.lookAt(this.currentLook)

}

setTarget(x,y,z){

this.target.set(x,y,z)

}

setTargetVector(vec3){

this.target.copy(vec3)

}

setPosition(x,y,z){

this.position.set(x,y,z)

this.desiredPosition.copy(this.position)

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

this.externalShake.add(offset)

}

clearShake(){

this.externalShake.set(0,0,0)

}

lookAt(vec3){

this.target.copy(vec3)

}

getCamera(){

return this.camera

}

getPosition(){

return this.position

}

getTarget(){

return this.target

}

getForwardVector(){

this.camera.getWorldDirection(this.forward)

return this.forward

}

getRightVector(){

this.getForwardVector()

this.right.crossVectors(this.forward,this.up).normalize()

return this.right

}

getUpVector(){

this.right.crossVectors(this.forward,this.up).normalize()

this.up.crossVectors(this.right,this.forward).normalize()

return this.up

}

dispose(){

if(this.disposed)return

this.state='disposing'

window.removeEventListener('resize',this._resizeHandler)

this.camera=null

this.position=null

this.target=null
this.currentLook=null

this.basePosition=null
this.desiredPosition=null
this.desiredLook=null

this.velocity=null
this.lookVelocity=null

this.externalShake=null
this.internalShake=null
this.finalShake=null

this.tmpVec=null
this.tmpVec2=null

this.forward=null
this.right=null
this.up=null

this.quaternion=null
this.tmpQuat=null

this.disposed=true

this.state='disposed'

}

}
