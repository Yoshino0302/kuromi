import * as THREE from 'https://jspm.dev/three'

export class Curves{

static lerp(a,b,t){
return a+(b-a)*t
}

static lerpVector3(out,a,b,t){
out.x=a.x+(b.x-a.x)*t
out.y=a.y+(b.y-a.y)*t
out.z=a.z+(b.z-a.z)*t
return out
}

static lerpQuaternion(out,a,b,t){
THREE.Quaternion.slerp(a,b,out,t)
return out
}

static smoothstep(t){
return t*t*(3-2*t)
}

static smootherstep(t){
return t*t*t*(t*(t*6-15)+10)
}

static cubicBezier(t,p0,p1,p2,p3){
const it=1-t
return(
it*it*it*p0+
3*it*it*t*p1+
3*it*t*t*p2+
t*t*t*p3
)
}

static cubicBezierVector3(out,t,p0,p1,p2,p3){

const it=1-t

out.x=
it*it*it*p0.x+
3*it*it*t*p1.x+
3*it*t*t*p2.x+
t*t*t*p3.x

out.y=
it*it*it*p0.y+
3*it*it*t*p1.y+
3*it*t*t*p2.y+
t*t*t*p3.y

out.z=
it*it*it*p0.z+
3*it*it*t*p1.z+
3*it*t*t*p2.z+
t*t*t*p3.z

return out
}

static quadraticBezier(t,p0,p1,p2){
const it=1-t
return it*it*p0+2*it*t*p1+t*t*p2
}

static quadraticBezierVector3(out,t,p0,p1,p2){

const it=1-t

out.x=it*it*p0.x+2*it*t*p1.x+t*t*p2.x
out.y=it*it*p0.y+2*it*t*p1.y+t*t*p2.y
out.z=it*it*p0.z+2*it*t*p1.z+t*t*p2.z

return out
}

static catmullRom(t,p0,p1,p2,p3){

const v0=(p2-p0)*0.5
const v1=(p3-p1)*0.5

const t2=t*t
const t3=t*t2

return(
(2*p1-2*p2+v0+v1)*t3+
(-3*p1+3*p2-2*v0-v1)*t2+
v0*t+
p1
)

}

static catmullRomVector3(out,t,p0,p1,p2,p3){

const v0x=(p2.x-p0.x)*0.5
const v0y=(p2.y-p0.y)*0.5
const v0z=(p2.z-p0.z)*0.5

const v1x=(p3.x-p1.x)*0.5
const v1y=(p3.y-p1.y)*0.5
const v1z=(p3.z-p1.z)*0.5

const t2=t*t
const t3=t*t2

out.x=
(2*p1.x-2*p2.x+v0x+v1x)*t3+
(-3*p1.x+3*p2.x-2*v0x-v1x)*t2+
v0x*t+
p1.x

out.y=
(2*p1.y-2*p2.y+v0y+v1y)*t3+
(-3*p1.y+3*p2.y-2*v0y-v1y)*t2+
v0y*t+
p1.y

out.z=
(2*p1.z-2*p2.z+v0z+v1z)*t3+
(-3*p1.z+3*p2.z-2*v0z-v1z)*t2+
v0z*t+
p1.z

return out
}

static hermite(t,p0,p1,m0,m1){

const t2=t*t
const t3=t*t2

const h00=2*t3-3*t2+1
const h10=t3-2*t2+t
const h01=-2*t3+3*t2
const h11=t3-t2

return(
h00*p0+
h10*m0+
h01*p1+
h11*m1
)

}

static damp(current,target,lambda,delta){

const t=1-Math.exp(-lambda*delta)
return current+(target-current)*t

}

static dampVector3(out,current,target,lambda,delta){

const t=1-Math.exp(-lambda*delta)

out.x=current.x+(target.x-current.x)*t
out.y=current.y+(target.y-current.y)*t
out.z=current.z+(target.z-current.z)*t

return out

}

static pingPong(t,length){

t=t%(length*2)
return length-Math.abs(t-length)

}

static repeat(t,length){

return t-Math.floor(t/length)*length

}

}
