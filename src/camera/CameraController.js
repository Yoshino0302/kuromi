export class CameraController{

constructor(camera){

this.camera=camera

this.moveSpeed=5

this.keys={}

window.addEventListener(
'keydown',
(e)=>this.keys[e.code]=true
)

window.addEventListener(
'keyup',
(e)=>this.keys[e.code]=false
)

}

update(delta){

const speed=this.moveSpeed*delta

if(this.keys['KeyW'])
this.camera.position.z-=speed

if(this.keys['KeyS'])
this.camera.position.z+=speed

if(this.keys['KeyA'])
this.camera.position.x-=speed

if(this.keys['KeyD'])
this.camera.position.x+=speed

}

}
