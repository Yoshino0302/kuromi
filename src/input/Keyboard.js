const KEY_STATE={
UP:0,
DOWN:1
}

export class Keyboard{

constructor(target=window){

this.target=target

this.enabled=true

this.keys=new Map()
this.prevKeys=new Map()

this.downCallbacks=new Map()
this.upCallbacks=new Map()
this.pressCallbacks=new Map()

this.anyDownCallbacks=[]
this.anyUpCallbacks=[]

this._eventQueue=[]

this._onKeyDown=this._handleKeyDown.bind(this)
this._onKeyUp=this._handleKeyUp.bind(this)
this._onBlur=this._handleBlur.bind(this)

this._listening=false

this.listen()

}

listen(){

if(this._listening)return

this.target.addEventListener('keydown',this._onKeyDown,false)
this.target.addEventListener('keyup',this._onKeyUp,false)
window.addEventListener('blur',this._onBlur,false)

this._listening=true

}

stop(){

if(!this._listening)return

this.target.removeEventListener('keydown',this._onKeyDown,false)
this.target.removeEventListener('keyup',this._onKeyUp,false)
window.removeEventListener('blur',this._onBlur,false)

this._listening=false

}

_handleKeyDown(e){

if(!this.enabled)return

const code=e.code

if(this.keys.get(code)===KEY_STATE.DOWN)return

this.keys.set(code,KEY_STATE.DOWN)

this._eventQueue.push({
type:'down',
code,
event:e
})

}

_handleKeyUp(e){

if(!this.enabled)return

const code=e.code

this.keys.set(code,KEY_STATE.UP)

this._eventQueue.push({
type:'up',
code,
event:e
})

}

_handleBlur(){

this.keys.clear()

}

update(){

if(!this.enabled)return

for(const [code,state] of this.keys){

this.prevKeys.set(code,state)

}

const queue=this._eventQueue

for(let i=0;i<queue.length;i++){

const evt=queue[i]
const code=evt.code

if(evt.type==='down'){

const list=this.downCallbacks.get(code)
if(list){
for(let j=0;j<list.length;j++)list[j](evt.event)
}

for(let j=0;j<this.anyDownCallbacks.length;j++){
this.anyDownCallbacks[j](code,evt.event)
}

}else{

const list=this.upCallbacks.get(code)
if(list){
for(let j=0;j<list.length;j++)list[j](evt.event)
}

for(let j=0;j<this.anyUpCallbacks.length;j++){
this.anyUpCallbacks[j](code,evt.event)
}

}

}

this._eventQueue.length=0

}

isDown(code){

return this.keys.get(code)===KEY_STATE.DOWN

}

isUp(code){

return !this.keys.has(code)||this.keys.get(code)===KEY_STATE.UP

}

isPressed(code){

return this.isDown(code)&&this.prevKeys.get(code)!==KEY_STATE.DOWN

}

isReleased(code){

return this.isUp(code)&&this.prevKeys.get(code)===KEY_STATE.DOWN

}

onKeyDown(code,fn){

let list=this.downCallbacks.get(code)

if(!list){
list=[]
this.downCallbacks.set(code,list)
}

list.push(fn)

}

onKeyUp(code,fn){

let list=this.upCallbacks.get(code)

if(!list){
list=[]
this.upCallbacks.set(code,list)
}

list.push(fn)

}

onAnyKeyDown(fn){

this.anyDownCallbacks.push(fn)

}

onAnyKeyUp(fn){

this.anyUpCallbacks.push(fn)

}

clear(){

this.keys.clear()
this.prevKeys.clear()
this._eventQueue.length=0

}

dispose(){

this.stop()

this.clear()

this.downCallbacks.clear()
this.upCallbacks.clear()

this.anyDownCallbacks.length=0
this.anyUpCallbacks.length=0

this.target=null

}

}
