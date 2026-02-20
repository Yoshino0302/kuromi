import * as THREE from 'https://jspm.dev/three'

const CONTROLLER_STATE={
INITIALIZED:0,
ACTIVE:1,
DISABLED:2,
DISPOSED:3
}

export class CameraController{

constructor(camera,options={}){

this.camera=camera
this.options=options

this.state=CONTROLLER_STATE.INITIALIZED
this.disposed=false

this.enabled=true

this.moveSpeed=options.moveSpeed??6
this.sprintMultiplier=options.sprintMultiplier??2

this.acceleration=options.acceleration??16
this.deceleration=options.deceleration??14

this.maxVelocity=options.maxVelocity??12

this.space=options.space??'camera'

this.velocity=new THREE.Vector3()
this.direction=new THREE.Vector3()

this.forward=new THREE.Vector3()
this.right=new THREE.Vector3()
this.up=new THREE.Vector3(0,1,0)

this.moveVector=new THREE.Vector3()

this.keys=Object.create(null)

this._keydownHandler=(e)=>{

this.keys[e.code]=true

}

this._keyupHandler=(e)=>{

this.keys[e.code]=false

}

window.addEventListener('keydown',this._keydownHandler,{passive:true})
window.addEventListener('keyup',this._keyupHandler,{passive:true})

}

update(delta){

if(this.disposed)return
if(!this.enabled)return
if(!this.camera)return
if(delta<=0)return

this._computeInputDirection()

this._updateVelocity(delta)

this._applyMovement(delta)

}

_computeInputDirection(){

const dir=this.direction

dir.set(0,0,0)

if(this.keys['KeyW'])dir.z-=1
if(this.keys['KeyS'])dir.z+=1
if(this.keys['KeyA'])dir.x-=1
if(this.keys['KeyD'])dir.x+=1
if(this.keys['Space'])dir.y+=1
if(this.keys['ShiftLeft'])dir.y-=1

if(dir.lengthSq()>1){

dir.normalize()

}

}

_updateVelocity(delta){

const vel=this.velocity
const dir=this.direction

if(dir.lengthSq()>0){

this._computeMovementBasis()

this.moveVector.set(0,0,0)

this.moveVector.addScaledVector(this.forward,dir.z)
this.moveVector.addScaledVector(this.right,dir.x)
this.moveVector.addScaledVector(this.up,dir.y)

if(this.moveVector.lengthSq()>0){

this.moveVector.normalize()

}

let speed=this.moveSpeed

if(this.keys['ShiftRight']){

speed*=this.sprintMultiplier

}

const accel=this.acceleration*delta

vel.addScaledVector(this.moveVector,accel*speed)

}else{

const decay=Math.exp(-this.deceleration*delta)

vel.multiplyScalar(decay)

}

const max=this.maxVelocity

const lenSq=vel.lengthSq()

if(lenSq>max*max){

vel.multiplyScalar(max/Math.sqrt(lenSq))

}

}

_computeMovementBasis(){

if(this.space==='world'){

this.forward.set(0,0,-1)
this.right.set(1,0,0)

return

}

if(this.space==='camera'){

this.camera.getWorldDirection(this.forward)

this.forward.normalize()

this.right.crossVectors(this.forward,this.up).normalize()

return

}

if(this.space==='local'){

this.forward.set(0,0,-1).applyQuaternion(this.camera.quaternion)
this.right.set(1,0,0).applyQuaternion(this.camera.quaternion)

return

}

}

_applyMovement(delta){

this.camera.position.addScaledVector(this.velocity,delta)

}

setEnabled(enabled){

this.enabled=enabled

this.state=enabled?CONTROLLER_STATE.ACTIVE:CONTROLLER_STATE.DISABLED

}

setSpeed(speed){

this.moveSpeed=speed

}

setSprintMultiplier(multiplier){

this.sprintMultiplier=multiplier

}

setSpace(space){

this.space=space

}

stop(){

this.velocity.set(0,0,0)

}

getVelocity(){

return this.velocity

}

dispose(){

if(this.disposed)return

window.removeEventListener('keydown',this._keydownHandler)
window.removeEventListener('keyup',this._keyupHandler)

this.velocity=null
this.direction=null
this.forward=null
this.right=null
this.up=null
this.moveVector=null

this.camera=null

this.keys=null

this.disposed=true

this.state=CONTROLLER_STATE.DISPOSED

}

}
