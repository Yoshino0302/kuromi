const TWEEN_STATE={
IDLE:0,
RUNNING:1,
PAUSED:2,
COMPLETED:3,
DISPOSED:4
}

let _tweenId=0

export class Tween{

constructor(target,options={}){

this.id=_tweenId++

this.target=target

this.from=options.from||{}
this.to=options.to||{}

this.duration=options.duration||1
this.delay=options.delay||0

this.easing=options.easing||Tween.Easing.linear

this.repeat=options.repeat||0
this.yoyo=options.yoyo||false

this.autoStart=options.autoStart!==false

this.time=0
this.elapsed=0

this.state=TWEEN_STATE.IDLE

this.direction=1
this.loopCount=0

this.onStart=options.onStart||null
this.onUpdate=options.onUpdate||null
this.onComplete=options.onComplete||null
this.onRepeat=options.onRepeat||null

this._started=false

this._valuesStart={}
this._valuesEnd={}

this._initValues()

if(this.autoStart)this.start()

}

_initValues(){

for(const key in this.to){

this._valuesStart[key]=
this.from[key]!==undefined
?this.from[key]
:this.target[key]

this._valuesEnd[key]=this.to[key]

}

}

start(){

if(this.state===TWEEN_STATE.DISPOSED)return

this.state=TWEEN_STATE.RUNNING
this.time=0
this.elapsed=0
this.loopCount=0
this.direction=1

this._started=false

}

pause(){

if(this.state!==TWEEN_STATE.RUNNING)return

this.state=TWEEN_STATE.PAUSED

}

resume(){

if(this.state!==TWEEN_STATE.PAUSED)return

this.state=TWEEN_STATE.RUNNING

}

stop(){

this.state=TWEEN_STATE.COMPLETED

}

update(delta){

if(this.state!==TWEEN_STATE.RUNNING)return false

this.time+=delta

if(this.time<this.delay)return true

if(!this._started){

this._started=true

if(this.onStart)this.onStart(this)

}

this.elapsed+=delta*this.direction

let t=this.elapsed/this.duration

t=Math.max(0,Math.min(1,t))

const eased=this.easing(t)

this._apply(eased)

if(this.onUpdate)this.onUpdate(this,eased)

if(t>=1){

if(this.loopCount<this.repeat){

this.loopCount++

if(this.yoyo){

this.direction*=-1

}else{

this.elapsed=0

}

if(this.onRepeat)this.onRepeat(this)

}else{

this.state=TWEEN_STATE.COMPLETED

if(this.onComplete)this.onComplete(this)

return false

}

}

return true

}

_apply(t){

for(const key in this._valuesStart){

const start=this._valuesStart[key]
const end=this._valuesEnd[key]

this.target[key]=start+(end-start)*t

}

}

isRunning(){

return this.state===TWEEN_STATE.RUNNING

}

isComplete(){

return this.state===TWEEN_STATE.COMPLETED

}

dispose(){

this.state=TWEEN_STATE.DISPOSED

this.target=null

this.onStart=null
this.onUpdate=null
this.onComplete=null
this.onRepeat=null

}

static Easing={

linear:t=>t,

easeInQuad:t=>t*t,

easeOutQuad:t=>t*(2-t),

easeInOutQuad:t=>
t<0.5
?2*t*t
:-1+(4-2*t)*t,

easeInCubic:t=>t*t*t,

easeOutCubic:t=>(--t)*t*t+1,

easeInOutCubic:t=>
t<0.5
?4*t*t*t
:(t-1)*(2*t-2)*(2*t-2)+1,

easeInQuart:t=>t*t*t*t,

easeOutQuart:t=>1-(--t)*t*t*t,

easeInOutQuart:t=>
t<0.5
?8*t*t*t*t
:1-8*(--t)*t*t*t

}

}
