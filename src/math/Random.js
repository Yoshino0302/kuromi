import * as THREE from 'https://jspm.dev/three'

export class Random{

constructor(seed=123456789){

this._state=seed>>>0

}

setSeed(seed){

this._state=seed>>>0

}

next(){

let x=this._state

x^=x<<13
x^=x>>>17
x^=x<<5

this._state=x>>>0

return this._state/4294967295

}

float(min=0,max=1){
return min+(max-min)*this.next()
}

int(min,max){
return Math.floor(this.float(min,max+1))
}

bool(chance=0.5){
return this.next()<chance
}

sign(){
return this.next()<0.5?-1:1
}

range(min,max){
return this.float(min,max)
}

pick(array){
return array[this.int(0,array.length-1)]
}

shuffle(array){

for(let i=array.length-1;i>0;i--){

const j=this.int(0,i)

const tmp=array[i]
array[i]=array[j]
array[j]=tmp

}

return array

}

vector2(out,min,max){

out.x=this.float(min.x,max.x)
out.y=this.float(min.y,max.y)

return out

}

vector3(out,min,max){

out.x=this.float(min.x,max.x)
out.y=this.float(min.y,max.y)
out.z=this.float(min.z,max.z)

return out

}

insideUnitSphere(out){

let x,y,z,d

do{

x=this.float(-1,1)
y=this.float(-1,1)
z=this.float(-1,1)

d=x*x+y*y+z*z

}while(d>1||d===0)

out.set(x,y,z)

return out

}

onUnitSphere(out){

this.insideUnitSphere(out)

return out.normalize()

}

insideUnitCircle(out){

let x,y,d

do{

x=this.float(-1,1)
y=this.float(-1,1)

d=x*x+y*y

}while(d>1||d===0)

out.set(x,y)

return out

}

rotationEuler(out){

out.set(
this.float(0,Math.PI*2),
this.float(0,Math.PI*2),
this.float(0,Math.PI*2)
)

return out

}

rotationQuaternion(out){

const u1=this.next()
const u2=this.next()
const u3=this.next()

const sqrt1=Math.sqrt(1-u1)
const sqrt2=Math.sqrt(u1)

out.set(
sqrt1*Math.sin(2*Math.PI*u2),
sqrt1*Math.cos(2*Math.PI*u2),
sqrt2*Math.sin(2*Math.PI*u3),
sqrt2*Math.cos(2*Math.PI*u3)
)

return out

}

color(out){

out.setRGB(
this.next(),
this.next(),
this.next()
)

return out

}

weighted(weights){

let sum=0

for(let i=0;i<weights.length;i++){
sum+=weights[i]
}

let r=this.float(0,sum)

for(let i=0;i<weights.length;i++){

if(r<weights[i])return i

r-=weights[i]

}

return weights.length-1

}

static global=new Random(987654321)

static float(min=0,max=1){
return Random.global.float(min,max)
}

static int(min,max){
return Random.global.int(min,max)
}

static bool(chance=0.5){
return Random.global.bool(chance)
}

static pick(array){
return Random.global.pick(array)
}

static vector3(out,min,max){
return Random.global.vector3(out,min,max)
}

}
