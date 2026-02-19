import * as THREE from 'https://jspm.dev/three'

export class CameraShake{

constructor(){

this.intensity=0

this.decay=2.0

this.offset=new THREE.Vector3()

}

trigger(intensity){

this.intensity=intensity

}

update(delta){

if(this.intensity<=0){

this.offset.set(0,0,0)

return

}

this.offset.x=(Math.random()-0.5)*this.intensity

this.offset.y=(Math.random()-0.5)*this.intensity

this.offset.z=(Math.random()-0.5)*this.intensity

this.intensity-=delta*this.decay

if(this.intensity<0){

this.intensity=0

}

}

getOffset(){

return this.offset

}

}
