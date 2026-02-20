export class Noise{

static _perm=new Uint8Array(512)
static _grad3=new Float32Array([
1,1,0,-1,1,0,1,-1,0,-1,-1,0,
1,0,1,-1,0,1,1,0,-1,-1,0,-1,
0,1,1,0,-1,1,0,1,-1,0,-1,-1
])

static _initialized=false

static init(seed=12345){

if(this._initialized)return

const p=new Uint8Array(256)

for(let i=0;i<256;i++){
p[i]=i
}

let s=seed>>>0

for(let i=255;i>0;i--){

s=(s*1664525+1013904223)>>>0

const r=(s+31)%(i+1)

const tmp=p[i]
p[i]=p[r]
p[r]=tmp

}

for(let i=0;i<512;i++){
this._perm[i]=p[i&255]
}

this._initialized=true

}

static _fade(t){
return t*t*t*(t*(t*6-15)+10)
}

static _lerp(a,b,t){
return a+(b-a)*t
}

static _grad(hash,x,y,z){

const h=hash%12
const i=h*3

return this._grad3[i]*x+
this._grad3[i+1]*y+
this._grad3[i+2]*z

}

static noise3(x,y,z){

if(!this._initialized)this.init()

const X=Math.floor(x)&255
const Y=Math.floor(y)&255
const Z=Math.floor(z)&255

x-=Math.floor(x)
y-=Math.floor(y)
z-=Math.floor(z)

const u=this._fade(x)
const v=this._fade(y)
const w=this._fade(z)

const A=this._perm[X]+Y
const AA=this._perm[A]+Z
const AB=this._perm[A+1]+Z

const B=this._perm[X+1]+Y
const BA=this._perm[B]+Z
const BB=this._perm[B+1]+Z

return this._lerp(
this._lerp(
this._lerp(
this._grad(this._perm[AA],x,y,z),
this._grad(this._perm[BA],x-1,y,z),
u
),
this._lerp(
this._grad(this._perm[AB],x,y-1,z),
this._grad(this._perm[BB],x-1,y-1,z),
u
),
v
),
this._lerp(
this._lerp(
this._grad(this._perm[AA+1],x,y,z-1),
this._grad(this._perm[BA+1],x-1,y,z-1),
u
),
this._lerp(
this._grad(this._perm[AB+1],x,y-1,z-1),
this._grad(this._perm[BB+1],x-1,y-1,z-1),
u
),
v
),
w
)

}

static noise2(x,y){
return this.noise3(x,y,0)
}

static noise1(x){
return this.noise3(x,0,0)
}

static fbm3(x,y,z,octaves=4,lacunarity=2,gain=0.5){

let sum=0
let amp=1
let freq=1
let max=0

for(let i=0;i<octaves;i++){

sum+=this.noise3(x*freq,y*freq,z*freq)*amp

max+=amp

amp*=gain
freq*=lacunarity

}

return sum/max

}

static fbm2(x,y,octaves=4,lacunarity=2,gain=0.5){
return this.fbm3(x,y,0,octaves,lacunarity,gain)
}

static fbm1(x,octaves=4,lacunarity=2,gain=0.5){
return this.fbm3(x,0,0,octaves,lacunarity,gain)
}

static turbulence3(x,y,z,octaves=4){

let sum=0
let amp=1
let freq=1

for(let i=0;i<octaves;i++){

sum+=Math.abs(this.noise3(x*freq,y*freq,z*freq))*amp

amp*=0.5
freq*=2

}

return sum

}

static ridge3(x,y,z,octaves=4){

let sum=0
let amp=0.5
let freq=1
let prev=1

for(let i=0;i<octaves;i++){

let n=this.noise3(x*freq,y*freq,z*freq)

n=1-Math.abs(n)

n*=n

sum+=n*amp*prev

prev=n

freq*=2
amp*=0.5

}

return sum

}

}
