const POINTER_STATE={
UP:0,
DOWN:1
}

export class Pointer{

constructor(target=window){

this.target=target

this.enabled=true

this.x=0
this.y=0

this.prevX=0
this.prevY=0

this.dx=0
this.dy=0

this.normalizedX=0
this.normalizedY=0

this.state=POINTER_STATE.UP
this.prevState=POINTER_STATE.UP

this.buttons=new Map()
this.wheelDelta=0

this._rect=null

this._moveCallbacks=[]
this._downCallbacks=[]
this._upCallbacks=[]
this._wheelCallbacks=[]

this._enterCallbacks=[]
this._leaveCallbacks=[]

this._eventQueue=[]

this._listening=false

this._onMove=this._handleMove.bind(this)
this._onDown=this._handleDown.bind(this)
this._onUp=this._handleUp.bind(this)
this._onWheel=this._handleWheel.bind(this)
this._onEnter=this._handleEnter.bind(this)
this._onLeave=this._handleLeave.bind(this)

this.listen()

}

listen(){

if(this._listening)return

this.target.addEventListener('pointermove',this._onMove,false)
this.target.addEventListener('pointerdown',this._onDown,false)
this.target.addEventListener('pointerup',this._onUp,false)
this.target.addEventListener('pointerwheel',this._onWheel,false)
this.target.addEventListener('wheel',this._onWheel,false)

this.target.addEventListener('pointerenter',this._onEnter,false)
this.target.addEventListener('pointerleave',this._onLeave,false)

this._listening=true

}

stop(){

if(!this._listening)return

this.target.removeEventListener('pointermove',this._onMove,false)
this.target.removeEventListener('pointerdown',this._onDown,false)
this.target.removeEventListener('pointerup',this._onUp,false)
this.target.removeEventListener('pointerwheel',this._onWheel,false)
this.target.removeEventListener('wheel',this._onWheel,false)

this.target.removeEventListener('pointerenter',this._onEnter,false)
this.target.removeEventListener('pointerleave',this._onLeave,false)

this._listening=false

}

_handleMove(e){

if(!this.enabled)return

this._eventQueue.push({
type:'move',
event:e
})

}

_handleDown(e){

if(!this.enabled)return

this._eventQueue.push({
type:'down',
event:e
})

}

_handleUp(e){

if(!this.enabled)return

this._eventQueue.push({
type:'up',
event:e
})

}

_handleWheel(e){

if(!this.enabled)return

this._eventQueue.push({
type:'wheel',
event:e
})

}

_handleEnter(e){

if(!this.enabled)return

this._eventQueue.push({
type:'enter',
event:e
})

}

_handleLeave(e){

if(!this.enabled)return

this._eventQueue.push({
type:'leave',
event:e
})

}

update(){

if(!this.enabled)return

this.prevX=this.x
this.prevY=this.y

this.prevState=this.state

this.dx=0
this.dy=0

this.wheelDelta=0

const rect=this._getRect()

const queue=this._eventQueue

for(let i=0;i<queue.length;i++){

const evt=queue[i]
const e=evt.event

switch(evt.type){

case'move':

this.x=e.clientX-rect.left
this.y=e.clientY-rect.top

this.dx=this.x-this.prevX
this.dy=this.y-this.prevY

this.normalizedX=(this.x/rect.width)*2-1
this.normalizedY=-(this.y/rect.height)*2+1

for(let j=0;j<this._moveCallbacks.length;j++){
this._moveCallbacks[j](this,e)
}

break

case'down':

this.buttons.set(e.button,true)
this.state=POINTER_STATE.DOWN

for(let j=0;j<this._downCallbacks.length;j++){
this._downCallbacks[j](this,e)
}

break

case'up':

this.buttons.set(e.button,false)
this.state=POINTER_STATE.UP

for(let j=0;j<this._upCallbacks.length;j++){
this._upCallbacks[j](this,e)
}

break

case'wheel':

this.wheelDelta=e.deltaY

for(let j=0;j<this._wheelCallbacks.length;j++){
this._wheelCallbacks[j](this,e)
}

break

case'enter':

for(let j=0;j<this._enterCallbacks.length;j++){
this._enterCallbacks[j](this,e)
}

break

case'leave':

for(let j=0;j<this._leaveCallbacks.length;j++){
this._leaveCallbacks[j](this,e)
}

break

}

}

queue.length=0

}

_getRect(){

if(!this._rect){

if(this.target===window){

this._rect={
left:0,
top:0,
width:window.innerWidth,
height:window.innerHeight
}

}else{

this._rect=this.target.getBoundingClientRect()

}

}

return this._rect

}

refreshRect(){

this._rect=null

}

isDown(){

return this.state===POINTER_STATE.DOWN

}

isPressed(){

return this.state===POINTER_STATE.DOWN&&this.prevState!==POINTER_STATE.DOWN

}

isReleased(){

return this.state===POINTER_STATE.UP&&this.prevState===POINTER_STATE.DOWN

}

isButtonDown(button){

return this.buttons.get(button)===true

}

onMove(fn){

this._moveCallbacks.push(fn)

}

onDown(fn){

this._downCallbacks.push(fn)

}

onUp(fn){

this._upCallbacks.push(fn)

}

onWheel(fn){

this._wheelCallbacks.push(fn)

}

onEnter(fn){

this._enterCallbacks.push(fn)

}

onLeave(fn){

this._leaveCallbacks.push(fn)

}

dispose(){

this.stop()

this._moveCallbacks.length=0
this._downCallbacks.length=0
this._upCallbacks.length=0
this._wheelCallbacks.length=0
this._enterCallbacks.length=0
this._leaveCallbacks.length=0

this.buttons.clear()

this.target=null

}

}
