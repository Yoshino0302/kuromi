import * as THREE from 'https://jspm.dev/three'

export class CinematicCamera{

constructor(){

this.camera=new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
2000
)

this.position=new THREE.Vector3(0,0,5)

this.target=new THREE.Vector3(0,0,0)

this.currentPosition=this.position.clone()

this.currentTarget=this.target.clone()

this.positionLerpSpeed=5.0

this.targetLerpSpeed=5.0

this.shakeOffset=new THREE.Vector3()

window.addEventListener(
'resize',
()=>this.onResize()
)

}

onResize(){

this.camera.aspect=
window.innerWidth/window.innerHeight

this.camera.updateProjectionMatrix()

}

setPosition(x,y,z){

this.position.set(x,y,z)

}

setTarget(x,y,z){

this.target.set(x,y,z)

}

update(delta){

this.currentPosition.lerp(
this.position,
delta*this.positionLerpSpeed
)

this.currentTarget.lerp(
this.target,
delta*this.targetLerpSpeed
)

this.camera.position.copy(
this.currentPosition
).add(this.shakeOffset)

this.camera.lookAt(
this.currentTarget
)

}

getCamera(){

return this.camera

}

addShake(offset){

this.shakeOffset.copy(offset)

}

clearShake(){

this.shakeOffset.set(0,0,0)

}

}
