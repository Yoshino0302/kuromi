import * as THREE from 'https://jspm.dev/three'

const CAMERA_STATE={
CONSTRUCTED:0,
INITIALIZED:1,
ACTIVE:2,
PAUSED:3,
DISPOSING:4,
DISPOSED:5
}

export class CinematicCamera{

constructor(options={}){

this.options=options
this.debug=options.debug===true

this.state=CAMERA_STATE.CONSTRUCTED
this.disposed=false
this.paused=false

this.camera=new THREE.PerspectiveCamera(
options.fov??60,
window.innerWidth/window.innerHeight,
options.near??0.1,
options.far??2000
)

this.camera.matrixAutoUpdate=true

this.position=this.camera.position
this.target=new THREE.Vector3()

this.currentLook=new THREE.Vector3()

this.desiredPosition=new THREE.Vector3()
this.desiredLook=new THREE.Vector3()

this.externalShake=new THREE.Vector3()
this.internalShake=new THREE.Vector3()
this.finalShake=new THREE.Vector3()

this.tmpVec=new THREE.Vector3()
this.tmpVec2=new THREE.Vector3()

this.forward=new THREE.Vector3()
this.right=new THREE.Vector3()
this.up=new THREE.Vector3(0,1,0)

this.time=0

this.positionSmooth=options.positionSmooth??6
this.lookSmooth=options.lookSmooth??8

this.orbitEnabled=options.orbitEnabled??false
this.orbitRadius=options.orbitRadius??8
this.orbitSpeed=options.orbitSpeed??0.15

this.breathEnabled=options.breathEnabled??false
this.breathAmplitude=options.breathAmplitude??0.25
this.breathSpeed=options.breathSpeed??1.2

this.shakeEnabled=options.shakeEnabled??true
this.shakeAmplitude=options.shakeAmplitude??0.04
this.shakeSpeed=options.shakeSpeed??18

this._resizeHandler=this._handleResize.bind(this)

window.addEventListener(
'resize',
this._resizeHandler,
{passive:true}
)

this._reset()

this.state=CAMERA_STATE.INITIALIZED

}

_reset(){

this.position.set(0,2,8)

this.target.set(0,0,0)

this.desiredPosition.copy(this.position)
this.desiredLook.copy(this.target)

this.currentLook.copy(this.target)

this.externalShake.set(0,0,0)
this.internalShake.set(0,0,0)
this.finalShake.set(0,0,0)

}

_handleResize(){

if(this.disposed)return

const aspect=window.innerWidth/window.innerHeight

this.camera.aspect=aspect
this.camera.updateProjectionMatrix()

}

update(delta){

if(this.disposed)return
if(this.paused)return
if(delta<=0)return

this.time+=delta

this._computeProceduralMotion(delta)

this._computeShake(delta)

this._integratePosition(delta)

this._integrateLook(delta)

this._applyTransform()

this._clearFrameShake()

}

_computeProceduralMotion(delta){

if(!this.orbitEnabled&&!this.breathEnabled)return

const t=this.time

this.tmpVec.copy(this.target)

if(this.orbitEnabled){

const angle=t*this.orbitSpeed

this.tmpVec.x+=Math.cos(angle)*this.orbitRadius
this.tmpVec.z+=Math.sin(angle)*this.orbitRadius

}

if(this.breathEnabled){

this.tmpVec.y+=Math.sin(t*this.breathSpeed)*this.breathAmplitude

}

this.desiredPosition.copy(this.tmpVec)

this.desiredLook.copy(this.target)

}

_computeShake(delta){

if(!this.shakeEnabled){

this.internalShake.set(0,0,0)

}else{

const t=this.time*this.shakeSpeed

this.internalShake.set(
Math.sin(t)*this.shakeAmplitude,
Math.cos(t*1.37)*this.shakeAmplitude,
Math.sin(t*0.73)*this.shakeAmplitude
)

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

_clearFrameShake(){

this.externalShake.set(0,0,0)

}

pause(){

if(this.disposed)return
if(this.paused)return

this.paused=true

this.state=CAMERA_STATE.PAUSED

}

resume(){

if(this.disposed)return
if(!this.paused)return

this.paused=false

this.state=CAMERA_STATE.ACTIVE

}

setTarget(x,y,z){

this.target.set(x,y,z)

}

setTargetVector(vec){

this.target.copy(vec)

}

setPosition(x,y,z){

this.position.set(x,y,z)
this.desiredPosition.copy(this.position)

}

setPositionVector(vec){

this.position.copy(vec)
this.desiredPosition.copy(vec)

}

setOrbitEnabled(v){

this.orbitEnabled=v

}

setBreathEnabled(v){

this.breathEnabled=v

}

setShakeEnabled(v){

this.shakeEnabled=v

}

addShake(offset){

if(!offset)return

this.externalShake.add(offset)

}

lookAt(vec){

this.target.copy(vec)

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

this.getRightVector()

this.up.crossVectors(this.right,this.forward).normalize()

return this.up

}

dispose(){

if(this.disposed)return

this.state=CAMERA_STATE.DISPOSING

window.removeEventListener(
'resize',
this._resizeHandler
)

this.camera=null

this.position=null
this.target=null
this.currentLook=null

this.desiredPosition=null
this.desiredLook=null

this.externalShake=null
this.internalShake=null
this.finalShake=null

this.tmpVec=null
this.tmpVec2=null

this.forward=null
this.right=null
this.up=null

this.disposed=true

this.state=CAMERA_STATE.DISPOSED

}

}
