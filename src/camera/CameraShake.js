import * as THREE from 'https://jspm.dev/three'

export class CameraShake{

constructor(options={}){

this.options=options

this.enabled=true

this.trauma=0
this.maxTrauma=options.maxTrauma??1

this.decay=options.decay??1.5

this.frequency=options.frequency??18

this.amplitude=options.amplitude??1

this.time=0

this.offset=new THREE.Vector3()

this.seedX=Math.random()*1000
this.seedY=Math.random()*2000
this.seedZ=Math.random()*3000

this.tmpVec=new THREE.Vector3()

this.state='initialized'

this.disposed=false

}

trigger(intensity=1){

if(this.disposed)return

this.trauma+=intensity

if(this.trauma>this.maxTrauma){

this.trauma=this.maxTrauma

}

}

setTrauma(value){

this.trauma=Math.max(0,Math.min(this.maxTrauma,value))

}

addTrauma(value){

this.trigger(value)

}

clear(){

this.trauma=0

this.offset.set(0,0,0)

}

update(delta){

if(this.disposed)return

if(!this.enabled){

this.offset.set(0,0,0)

return

}

this.time+=delta

if(this.trauma<=0){

this.offset.set(0,0,0)

return

}

const shake=this.trauma*this.trauma

const t=this.time*this.frequency

this.offset.set(

this._noise1D(t+this.seedX),
this._noise1D(t+this.seedY),
this._noise1D(t+this.seedZ)

)

this.offset.multiplyScalar(shake*this.amplitude)

this._decay(delta)

}

_decay(delta){

this.trauma-=this.decay*delta

if(this.trauma<0){

this.trauma=0

}

}

_noise1D(x){

return Math.sin(x)*Math.sin(x*1.3+17.23)*Math.sin(x*0.7+3.11)

}

getOffset(){

return this.offset

}

getTrauma(){

return this.trauma

}

isActive(){

return this.trauma>0.0001

}

setEnabled(enabled){

this.enabled=enabled

}

dispose(){

if(this.disposed)return

this.offset=null

this.tmpVec=null

this.disposed=true

this.state='disposed'

}

}
