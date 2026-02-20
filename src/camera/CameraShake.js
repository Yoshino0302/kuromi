import * as THREE from 'https://jspm.dev/three'

const SHAKE_STATE={
INITIALIZED:0,
ACTIVE:1,
DISABLED:2,
DISPOSED:3
}

export class CameraShake{

constructor(options={}){

this.options=options

this.state=SHAKE_STATE.INITIALIZED
this.disposed=false

this.enabled=options.enabled??true

this.trauma=0
this.maxTrauma=options.maxTrauma??1

this.decay=options.decay??1.6

this.frequency=options.frequency??20

this.amplitude=options.amplitude??1

this.positionInfluence=options.positionInfluence??new THREE.Vector3(1,1,1)
this.rotationInfluence=options.rotationInfluence??new THREE.Vector3(0.2,0.2,0.2)

this.time=0

this.offset=new THREE.Vector3()
this.rotationOffset=new THREE.Vector3()

this.seed=options.seed??1337

this._rngState=this.seed|0

this._noiseX=0
this._noiseY=0
this._noiseZ=0

this._tmpVec=new THREE.Vector3()

}

trigger(intensity=0.5){

if(this.disposed)return
if(!this.enabled)return

this.trauma+=intensity

if(this.trauma>this.maxTrauma){

this.trauma=this.maxTrauma

}

this.state=SHAKE_STATE.ACTIVE

}

setTrauma(value){

if(this.disposed)return

this.trauma=Math.max(0,Math.min(this.maxTrauma,value))

}

addTrauma(value){

this.trigger(value)

}

clear(){

this.trauma=0

this.offset.set(0,0,0)
this.rotationOffset.set(0,0,0)

this.state=SHAKE_STATE.INITIALIZED

}

update(delta){

if(this.disposed)return

if(!this.enabled){

this.offset.set(0,0,0)
this.rotationOffset.set(0,0,0)

return

}

if(this.trauma<=0){

this.offset.set(0,0,0)
this.rotationOffset.set(0,0,0)

return

}

this.time+=delta

const shake=this._computeShakePower()

const t=this.time*this.frequency

this._noiseX=this._noise(t+11.1)
this._noiseY=this._noise(t+47.3)
this._noiseZ=this._noise(t+93.7)

this.offset.set(
this._noiseX*this.positionInfluence.x,
this._noiseY*this.positionInfluence.y,
this._noiseZ*this.positionInfluence.z
)

this.offset.multiplyScalar(shake*this.amplitude)

this.rotationOffset.set(
this._noiseY*this.rotationInfluence.x,
this._noiseZ*this.rotationInfluence.y,
this._noiseX*this.rotationInfluence.z
)

this.rotationOffset.multiplyScalar(shake)

this._decay(delta)

}

_computeShakePower(){

return this.trauma*this.trauma

}

_decay(delta){

const decay=this.decay*delta

this.trauma-=decay

if(this.trauma<=0){

this.trauma=0

this.state=SHAKE_STATE.INITIALIZED

}

}

_noise(x){

const i=Math.floor(x)
const f=x-i

const a=this._hash(i)
const b=this._hash(i+1)

return this._lerp(a,b,this._smooth(f))

}

_hash(x){

let h=x|0

h^=h<<13
h^=h>>17
h^=h<<5

return (h&0xffff)/0xffff*2-1

}

_smooth(t){

return t*t*(3-2*t)

}

_lerp(a,b,t){

return a+(b-a)*t

}

getOffset(){

return this.offset

}

getRotationOffset(){

return this.rotationOffset

}

getTrauma(){

return this.trauma

}

isActive(){

return this.trauma>0.00001

}

setEnabled(enabled){

this.enabled=enabled

if(!enabled){

this.clear()

this.state=SHAKE_STATE.DISABLED

}else{

this.state=SHAKE_STATE.INITIALIZED

}

}

dispose(){

if(this.disposed)return

this.offset=null
this.rotationOffset=null

this._tmpVec=null

this.disposed=true

this.state=SHAKE_STATE.DISPOSED

}

}
