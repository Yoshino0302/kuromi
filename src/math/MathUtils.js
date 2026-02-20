import * as THREE from 'https://jspm.dev/three'

export class MathUtils{

static EPSILON=1e-6

static clamp(v,min,max){
return v<min?min:(v>max?max:v)
}

static saturate(v){
return v<0?0:(v>1?1:v)
}

static lerp(a,b,t){
return a+(b-a)*t
}

static inverseLerp(a,b,v){
if(a===b)return 0
return (v-a)/(b-a)
}

static remap(inMin,inMax,outMin,outMax,v){
const t=(v-inMin)/(inMax-inMin)
return outMin+(outMax-outMin)*t
}

static smoothstep(min,max,v){
const t=MathUtils.saturate((v-min)/(max-min))
return t*t*(3-2*t)
}

static smootherstep(min,max,v){
const t=MathUtils.saturate((v-min)/(max-min))
return t*t*t*(t*(t*6-15)+10)
}

static damp(current,target,lambda,delta){
const t=1-Math.exp(-lambda*delta)
return current+(target-current)*t
}

static fract(v){
return v-Math.floor(v)
}

static mod(a,b){
return ((a%b)+b)%b
}

static pingPong(t,length){
t=MathUtils.mod(t,length*2)
return length-Math.abs(t-length)
}

static repeat(t,length){
return MathUtils.mod(t,length)
}

static sign(v){
return v<0?-1:(v>0?1:0)
}

static degToRad(deg){
return deg*Math.PI/180
}

static radToDeg(rad){
return rad*180/Math.PI
}

static randomRange(min,max){
return min+Math.random()*(max-min)
}

static randomInt(min,max){
return Math.floor(MathUtils.randomRange(min,max+1))
}

static randomSign(){
return Math.random()<0.5?-1:1
}

static randomBool(chance=0.5){
return Math.random()<chance
}

static randomChoice(array){
return array[Math.floor(Math.random()*array.length)]
}

static randomVector3(out,min,max){

out.x=MathUtils.randomRange(min.x,max.x)
out.y=MathUtils.randomRange(min.y,max.y)
out.z=MathUtils.randomRange(min.z,max.z)

return out

}

static randomUnitVector3(out){

const z=MathUtils.randomRange(-1,1)
const a=MathUtils.randomRange(0,Math.PI*2)
const r=Math.sqrt(1-z*z)

out.x=r*Math.cos(a)
out.y=r*Math.sin(a)
out.z=z

return out

}

static distance(a,b){

const dx=a.x-b.x
const dy=a.y-b.y
const dz=a.z-b.z

return Math.sqrt(dx*dx+dy*dy+dz*dz)

}

static distanceSquared(a,b){

const dx=a.x-b.x
const dy=a.y-b.y
const dz=a.z-b.z

return dx*dx+dy*dy+dz*dz

}

static angleBetweenVectors(a,b){

const dot=a.dot(b)
const len=a.length()*b.length()

if(len<MathUtils.EPSILON)return 0

return Math.acos(MathUtils.clamp(dot/len,-1,1))

}

static projectOnPlane(out,vector,planeNormal){

const dot=vector.dot(planeNormal)

out.copy(vector).addScaledVector(planeNormal,-dot)

return out

}

static reflect(out,vector,normal){

const dot=vector.dot(normal)

out.copy(vector).addScaledVector(normal,-2*dot)

return out

}

static isPowerOfTwo(v){
return (v&(v-1))===0&&v!==0
}

static nextPowerOfTwo(v){
v--
v|=v>>1
v|=v>>2
v|=v>>4
v|=v>>8
v|=v>>16
v++
return v
}

static dampVector3(out,current,target,lambda,delta){

const t=1-Math.exp(-lambda*delta)

out.x=current.x+(target.x-current.x)*t
out.y=current.y+(target.y-current.y)*t
out.z=current.z+(target.z-current.z)*t

return out

}

static dampQuaternion(out,current,target,lambda,delta){

const t=1-Math.exp(-lambda*delta)

THREE.Quaternion.slerp(current,target,out,t)

return out

}

}
