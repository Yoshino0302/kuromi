import * as THREE from 'https://jspm.dev/three'

export class CameraController{

constructor(camera,options={}){

this.camera=camera

this.options=options

this.enabled=true

this.moveSpeed=options.moveSpeed??6.0
this.acceleration=options.acceleration??14.0
this.deceleration=options.deceleration??10.0
this.maxVelocity=options.maxVelocity??10.0

this.velocity=new THREE.Vector3()
this.direction=new THREE.Vector3()

this.forward=new THREE.Vector3()
this.right=new THREE.Vector3()
this.up=new THREE.Vector3(0,1,0)

this.keys=Object.create(null)

this._keydownHandler=(e)=>{

this.keys[e.code]=true

}

this._keyupHandler=(e)=>{

this.keys[e.code]=false

}

window.addEventListener('keydown',this._keydownHandler,{passive:true})

window.addEventListener('keyup',this._keyupHandler,{passive:true})

this.state='initialized'

this.disposed=false

}

update(delta){

if(this.disposed)return

if(!this.enabled)return

if(!this.camera)return

this._computeDirection()

this._integrateVelocity(delta)

this._applyMovement(delta)

}

_computeDirection(){

this.direction.set(0,0,0)

if(this.keys['KeyW'])this.direction.z-=1
if(this.keys['KeyS'])this.direction.z+=1
if(this.keys['KeyA'])this.direction.x-=1
if(this.keys['KeyD'])this.direction.x+=1
if(this.keys['Space'])this.direction.y+=1
if(this.keys['ShiftLeft'])this.direction.y-=1

if(this.direction.lengthSq()>0){

this.direction.normalize()

}

}

_integrateVelocity(delta){

if(this.direction.lengthSq()>0){

this.forward.set(0,0,-1).applyQuaternion(this.camera.quaternion)
this.right.set(1,0,0).applyQuaternion(this.camera.quaternion)

const moveVec=new THREE.Vector3()

moveVec.addScaledVector(this.forward,this.direction.z)
moveVec.addScaledVector(this.right,this.direction.x)
moveVec.addScaledVector(this.up,this.direction.y)

moveVec.normalize()

const accel=this.acceleration*delta

this.velocity.addScaledVector(moveVec,accel*this.moveSpeed)

}else{

const decay=Math.exp(-this.deceleration*delta)

this.velocity.multiplyScalar(decay)

}

const speed=this.velocity.length()

if(speed>this.maxVelocity){

this.velocity.multiplyScalar(this.maxVelocity/speed)

}

}

_applyMovement(delta){

this.camera.position.addScaledVector(this.velocity,delta)

}

setEnabled(enabled){

this.enabled=enabled

}

setSpeed(speed){

this.moveSpeed=speed

}

stop(){

this.velocity.set(0,0,0)

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

this.camera=null

this.keys=null

this.disposed=true

this.state='disposed'

}

}
