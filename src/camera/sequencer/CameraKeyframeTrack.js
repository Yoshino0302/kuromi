import * as THREE from 'https://jspm.dev/three'

export class CameraKeyframeTrack{

constructor(){

this.keyframes=[]

this.duration=0

}

addKeyframe(time,position,target){

this.keyframes.push({
time,
position:position.clone(),
target:target.clone()
})

if(time>this.duration){

this.duration=time

}

}

sample(time){

if(this.keyframes.length===0)return null

let k1=this.keyframes[0]
let k2=this.keyframes[this.keyframes.length-1]

for(let i=0;i<this.keyframes.length-1;i++){

const a=this.keyframes[i]
const b=this.keyframes[i+1]

if(time>=a.time && time<=b.time){

k1=a
k2=b
break

}

}

const t=(time-k1.time)/(k2.time-k1.time)

const position=new THREE.Vector3().lerpVectors(
k1.position,
k2.position,
t
)

const target=new THREE.Vector3().lerpVectors(
k1.target,
k2.target,
t
)

return{
position,
target
}

}

}
