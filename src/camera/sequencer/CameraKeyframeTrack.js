import * as THREE from 'https://jspm.dev/three'

export class CameraKeyframeTrack{

constructor(options={}){

this.options=options

this.keyframes=[]

this.duration=0

this._lastIndex=0

this._samplePosition=new THREE.Vector3()
this._sampleTarget=new THREE.Vector3()

this._result={
position:this._samplePosition,
target:this._sampleTarget
}

this.disposed=false

this.state='initialized'

}

addKeyframe(time,position,target){

if(this.disposed)return

const keyframe={
time:time,
position:position.clone(),
target:target.clone()
}

this.keyframes.push(keyframe)

this._sortKeyframes()

this.duration=this.keyframes[this.keyframes.length-1].time

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

let i=this._lastIndex

if(i>=count-1)i=0

if(time<this.keyframes[i].time){

i=0

}

while(i<count-1){

const k1=this.keyframes[i]
const k2=this.keyframes[i+1]

if(time>=k1.time&&time<=k2.time){

this._lastIndex=i

const span=k2.time-k1.time

let t=span>0?(time-k1.time)/span:0

t=this._smoothStep(t)

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

i++

}

const last=this.keyframes[count-1]

this._samplePosition.copy(last.position)
this._sampleTarget.copy(last.target)

return this._result

}

_smoothStep(t){

return t*t*(3-2*t)

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

clear(){

this.keyframes.length=0

this.duration=0

this._lastIndex=0

}

dispose(){

if(this.disposed)return

this.keyframes=null

this._samplePosition=null
this._sampleTarget=null

this._result=null

this.disposed=true

this.state='disposed'

}

}
