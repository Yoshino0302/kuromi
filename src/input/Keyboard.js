const KEY_STATE={
UP:0,
DOWN:1,
HELD:2,
RELEASED:3
}

export class Keyboard{

constructor(target=document){

this.target=target

this.enabled=true

this.keys=new Uint8Array(256)
this.previous=new Uint8Array(256)

this.timestamps=new Float64Array(256)

this.repeatDelay=0.35
this.repeatInterval=0.035

this._repeatTimers=new Float64Array(256)

this._listeners=new Map()

this._boundDown=this._onKeyDown.bind(this)
this._boundUp=this._onKeyUp.bind(this)
this._boundBlur=this._onBlur.bind(this)

this._install()

}

_install(){

this.target.addEventListener('keydown',this._boundDown,false)
this.target.addEventListener('keyup',this._boundUp,false)

window.addEventListener('blur',this._boundBlur,false)

}

dispose(){

this.target.removeEventListener('keydown',this._boundDown)
this.target.removeEventListener('keyup',this._boundUp)

window.removeEventListener('blur',this._boundBlur)

this._listeners.clear()

}

update(time){

for(let i=0;i<256;i++){

const state=this.keys[i]

if(state===KEY_STATE.DOWN){

this.keys[i]=KEY_STATE.HELD

this._repeatTimers[i]=time+this.repeatDelay

}else if(state===KEY_STATE.RELEASED){

this.keys[i]=KEY_STATE.UP

}

if(this.keys[i]===KEY_STATE.HELD){

if(time>=this._repeatTimers[i]){

this._emit(i,'repeat')

this._repeatTimers[i]=time+this.repeatInterval

}

}

}

}

_onKeyDown(e){

if(!this.enabled)return

const code=e.keyCode&255

if(this.keys[code]===KEY_STATE.UP){

this.keys[code]=KEY_STATE.DOWN

this.timestamps[code]=performance.now()

this._emit(code,'down')

}

}

_onKeyUp(e){

if(!this.enabled)return

const code=e.keyCode&255

this.keys[code]=KEY_STATE.RELEASED

this.timestamps[code]=performance.now()

this._emit(code,'up')

}

_onBlur(){

for(let i=0;i<256;i++){

this.keys[i]=KEY_STATE.UP

}

}

isDown(code){

return this.keys[code]===KEY_STATE.DOWN

}

isHeld(code){

return this.keys[code]===KEY_STATE.HELD

}

isUp(code){

return this.keys[code]===KEY_STATE.UP

}

isReleased(code){

return this.keys[code]===KEY_STATE.RELEASED

}

getDuration(code){

if(this.keys[code]===KEY_STATE.UP)return 0

return performance.now()-this.timestamps[code]

}

on(code,type,callback){

const key=`${code}:${type}`

if(!this._listeners.has(key)){

this._listeners.set(key,new Set())

}

this._listeners.get(key).add(callback)

return()=>{

this._listeners.get(key)?.delete(callback)

}

}

_emit(code,type){

const key=`${code}:${type}`

const set=this._listeners.get(key)

if(!set)return

for(const cb of set){

cb(code,type)

}

}

enable(){

this.enabled=true

}

disable(){

this.enabled=false

}

reset(){

for(let i=0;i<256;i++){

this.keys[i]=KEY_STATE.UP

}

}

}
