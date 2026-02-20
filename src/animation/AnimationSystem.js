import * as THREE from 'https://jspm.dev/three'

export class AnimationSystem{

constructor(engine){
this.engine=engine
this.name='AnimationSystem'
this.priority=20

this.enabled=true
this.initialized=false
this.running=false

this._animations=[]
this._count=0

this._pool=[]
this._poolCount=0
this._poolSize=256

this._activeMap=new Map()

this._nextId=1

this._easing=this._createEasingTable()

this._tempRemove=[]
this._tempRemoveCount=0
}

init(){
for(let i=0;i<this._poolSize;i++){
this._pool[i]=this._createAnim()
this._poolCount++
}
this.initialized=true
}

start(){
this.running=true
}

update(delta){

if(!this.enabled||!this.running)return

const dt=delta*1000

this._tempRemoveCount=0

for(let i=0;i<this._count;i++){

const anim=this._animations[i]

if(!anim.active)continue

anim.elapsed+=dt

let t=anim.elapsed/anim.duration

if(t>=1)t=1

const eased=this._ease(anim.ease,t)

this._apply(anim,eased)

if(anim.onUpdate)anim.onUpdate(eased,anim.target)

if(t===1){

if(anim.loop){

anim.elapsed=0

}else{

anim.active=false

if(anim.onComplete)anim.onComplete(anim.target)

this.engine?.events?.emit('animation:complete',anim)

this._tempRemove[this._tempRemoveCount++]=anim

}
}
}

for(let i=0;i<this._tempRemoveCount;i++){
this._release(this._tempRemove[i])
}
}

_createAnim(){
return{
id:0,
target:null,
property:null,
start:0,
end:0,
duration:0,
elapsed:0,
ease:0,
active:false,
loop:false,
onUpdate:null,
onComplete:null
}
}

_acquire(){
let anim
if(this._poolCount>0){
this._poolCount--
anim=this._pool[this._poolCount]
}else{
anim=this._createAnim()
}
this._animations[this._count++]=anim
return anim
}

_release(anim){

this._activeMap.delete(anim.id)

let idx=-1

for(let i=0;i<this._count;i++){
if(this._animations[i]===anim){
idx=i
break
}
}

if(idx!==-1){
for(let i=idx;i<this._count-1;i++){
this._animations[i]=this._animations[i+1]
}
this._count--
}

anim.target=null
anim.property=null
anim.onUpdate=null
anim.onComplete=null
anim.active=false

this._pool[this._poolCount++]=anim
}

animate(target,property,to,duration=1000,ease='linear',options=null){

if(!target)return 0

const anim=this._acquire()

anim.id=this._nextId++
anim.target=target
anim.property=property
anim.start=target[property]
anim.end=to
anim.duration=duration
anim.elapsed=0
anim.ease=ease
anim.active=true
anim.loop=options?.loop||false
anim.onUpdate=options?.onUpdate||null
anim.onComplete=options?.onComplete||null

this._activeMap.set(anim.id,anim)

this.engine?.events?.emit('animation:start',anim)

return anim.id
}

stop(id){

const anim=this._activeMap.get(id)

if(!anim)return false

anim.active=false

this._release(anim)

return true
}

stopAll(){

for(const anim of this._activeMap.values()){
anim.active=false
this._pool[this._poolCount++]=anim
}

this._activeMap.clear()
this._count=0
}

_apply(anim,t){

const value=anim.start+(anim.end-anim.start)*t

anim.target[anim.property]=value
}

_ease(type,t){

const fn=this._easing[type]

return fn?fn(t):t
}

_createEasingTable(){

return{

linear:(t)=>t,

easeInQuad:(t)=>t*t,

easeOutQuad:(t)=>t*(2-t),

easeInOutQuad:(t)=>t<0.5?2*t*t:-1+(4-2*t)*t,

easeInCubic:(t)=>t*t*t,

easeOutCubic:(t)=>(--t)*t*t+1,

easeInOutCubic:(t)=>t<0.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1,

easeInQuart:(t)=>t*t*t*t,

easeOutQuart:(t)=>1-(--t)*t*t*t,

easeInOutQuart:(t)=>t<0.5?8*t*t*t*t:1-8*(--t)*t*t*t,

easeInQuint:(t)=>t*t*t*t*t,

easeOutQuint:(t)=>1+(--t)*t*t*t*t,

easeInOutQuint:(t)=>t<0.5?16*t*t*t*t*t:1+16*(--t)*t*t*t*t

}
}

get(id){
return this._activeMap.get(id)||null
}

get count(){
return this._count
}

get activeCount(){
return this._activeMap.size
}

clear(){

this.stopAll()

this._pool.length=0
this._poolCount=0

this._animations.length=0
this._count=0
}

shutdown(){

this.clear()

this.running=false
this.initialized=false
}

}
