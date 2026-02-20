import * as THREE from 'https://jspm.dev/three'

const TRACK_STATE={
INITIALIZED:0,
READY:1,
DISPOSED:2
}

export class CameraKeyframeTrack{

constructor(options={}){

this.options=options

this.keyframes=[]

this.duration=0

this.state=TRACK_STATE.INITIALIZED
this.disposed=false

this._lastIndex=0

this._samplePosition=new THREE.Vector3()
this._sampleTarget=new THREE.Vector3()

this._result={
position:this._samplePosition,
target:this._sampleTarget
}

this._interpolation=options.interpolation||'smooth'

}

addKeyframe(time,position,target){

if(this.disposed)return

if(!Number.isFinite(time))return
if(!position||!target)return

const keyframe={
time:Math.max(0,time),
position:position.clone(),
target:target.clone()
}

this.keyframes.push(keyframe)

this._sortKeyframes()

this.duration=this.keyframes[this.keyframes.length-1].time

this.state=TRACK_STATE.READY

}

_sortKeyframes(){

this.keyframes.sort((a,b)=>a.time-b.time)

}

sample(time){

if(this.disposed)return null

const count=this.keyframes.length

if(count===0)return null

if(count===1){

this._samplePosition.copy(this.keyframes[0].position)
this._sampleTarget.copy(this.keyframes[0].target)

return this._result

}

time=this._clampTime(time)

const index=this._findSegment(time)

this._lastIndex=index

const k1=this.keyframes[index]
const k2=this.keyframes[index+1]

const span=k2.time-k1.time

let t=span>0?(time-k1.time)/span:0

t=this._interpolate(t)

this._samplePosition.lerpVectors(
k1.position,
k2.position,
t
)

this._sampleTarget.lerpVectors(
k1.target,
k2.target,
t
)

return this._result

}

_findSegment(time){

const keyframes=this.keyframes

let low=0
let high=keyframes.length-2

let mid=0

while(low<=high){

mid=(low+high)>>1

const k1=keyframes[mid]
const k2=keyframes[mid+1]

if(time>=k1.time&&time<=k2.time){

return mid

}

if(time<k1.time){

high=mid-1

}else{

low=mid+1

}

}

return Math.max(0,Math.min(this.keyframes.length-2,low))

}

_interpolate(t){

switch(this._interpolation){

case 'linear':
return t

case 'smooth':
return t*t*(3-2*t)

case 'smoother':
return t*t*t*(t*(6*t-15)+10)

default:
return t

}

}

_clampTime(time){

if(time<=0)return 0
if(time>=this.duration)return this.duration
return time

}

getDuration(){

return this.duration

}

getKeyframeCount(){

return this.keyframes.length

}

isReady(){

return this.state===TRACK_STATE.READY

}

clear(){

if(this.disposed)return

this.keyframes.length=0

this.duration=0

this._lastIndex=0

this.state=TRACK_STATE.INITIALIZED

}

dispose(){

if(this.disposed)return

this.keyframes.length=0

this._samplePosition=null
this._sampleTarget=null

this._result=null

this.disposed=true

this.state=TRACK_STATE.DISPOSED

}

}
