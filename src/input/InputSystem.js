import * as THREE from 'https://jspm.dev/three'

export class InputSystem{

constructor(engine,domElement=null){
this.engine=engine
this.name='InputSystem'
this.priority=10

this.domElement=domElement||engine?.renderer?.domElement||document.body

this.enabled=true
this.initialized=false
this.running=false

this._keys=new Uint8Array(256)
this._keysPrev=new Uint8Array(256)

this._buttons=new Uint8Array(8)
this._buttonsPrev=new Uint8Array(8)

this._mouseX=0
this._mouseY=0
this._mouseDX=0
this._mouseDY=0

this._wheel=0
this._wheelDelta=0

this._pointerLocked=false

this._rect={left:0,top:0,width:1,height:1}

this._onKeyDown=this._handleKeyDown.bind(this)
this._onKeyUp=this._handleKeyUp.bind(this)
this._onMouseDown=this._handleMouseDown.bind(this)
this._onMouseUp=this._handleMouseUp.bind(this)
this._onMouseMove=this._handleMouseMove.bind(this)
this._onWheel=this._handleWheel.bind(this)
this._onPointerLockChange=this._handlePointerLockChange.bind(this)
this._onContextMenu=(e)=>e.preventDefault()
}

init(){

if(this.initialized)return

const el=this.domElement

window.addEventListener('keydown',this._onKeyDown,false)
window.addEventListener('keyup',this._onKeyUp,false)

el.addEventListener('mousedown',this._onMouseDown,false)
el.addEventListener('mouseup',this._onMouseUp,false)
el.addEventListener('mousemove',this._onMouseMove,false)
el.addEventListener('wheel',this._onWheel,false)
el.addEventListener('contextmenu',this._onContextMenu,false)

document.addEventListener('pointerlockchange',this._onPointerLockChange,false)

this._updateRect()

this.initialized=true
}

start(){
this.running=true
}

update(){

if(!this.enabled||!this.running)return

this._mouseDX=0
this._mouseDY=0
this._wheelDelta=0

this._keysPrev.set(this._keys)
this._buttonsPrev.set(this._buttons)
}

shutdown(){

if(!this.initialized)return

const el=this.domElement

window.removeEventListener('keydown',this._onKeyDown)
window.removeEventListener('keyup',this._onKeyUp)

el.removeEventListener('mousedown',this._onMouseDown)
el.removeEventListener('mouseup',this._onMouseUp)
el.removeEventListener('mousemove',this._onMouseMove)
el.removeEventListener('wheel',this._onWheel)
el.removeEventListener('contextmenu',this._onContextMenu)

document.removeEventListener('pointerlockchange',this._onPointerLockChange)

this.running=false
this.initialized=false
}

_handleKeyDown(e){

const code=e.keyCode

if(code<256)this._keys[code]=1

this.engine?.events?.emit('input:keyDown',code,e)
}

_handleKeyUp(e){

const code=e.keyCode

if(code<256)this._keys[code]=0

this.engine?.events?.emit('input:keyUp',code,e)
}

_handleMouseDown(e){

const btn=e.button

if(btn<8)this._buttons[btn]=1

this.engine?.events?.emit('input:mouseDown',btn,e)
}

_handleMouseUp(e){

const btn=e.button

if(btn<8)this._buttons[btn]=0

this.engine?.events?.emit('input:mouseUp',btn,e)
}

_handleMouseMove(e){

const rect=this.domElement.getBoundingClientRect()

const x=e.clientX-rect.left
const y=e.clientY-rect.top

this._mouseDX+=e.movementX||0
this._mouseDY+=e.movementY||0

this._mouseX=x
this._mouseY=y

this.engine?.events?.emit('input:mouseMove',x,y,e)
}

_handleWheel(e){

this._wheelDelta=e.deltaY
this._wheel+=e.deltaY

this.engine?.events?.emit('input:wheel',e.deltaY,e)
}

_handlePointerLockChange(){

this._pointerLocked=document.pointerLockElement===this.domElement

this.engine?.events?.emit('input:pointerLock',this._pointerLocked)
}

_updateRect(){

const r=this.domElement.getBoundingClientRect()

this._rect.left=r.left
this._rect.top=r.top
this._rect.width=r.width
this._rect.height=r.height
}

requestPointerLock(){

this.domElement.requestPointerLock()
}

exitPointerLock(){

document.exitPointerLock()
}

isKeyDown(code){
return this._keys[code]===1
}

isKeyPressed(code){
return this._keys[code]===1&&this._keysPrev[code]===0
}

isKeyReleased(code){
return this._keys[code]===0&&this._keysPrev[code]===1
}

isMouseDown(button){
return this._buttons[button]===1
}

isMousePressed(button){
return this._buttons[button]===1&&this._buttonsPrev[button]===0
}

isMouseReleased(button){
return this._buttons[button]===0&&this._buttonsPrev[button]===1
}

getMouseX(){
return this._mouseX
}

getMouseY(){
return this._mouseY
}

getMouseDX(){
return this._mouseDX
}

getMouseDY(){
return this._mouseDY
}

getWheel(){
return this._wheel
}

getWheelDelta(){
return this._wheelDelta
}

isPointerLocked(){
return this._pointerLocked
}

clear(){

this._keys.fill(0)
this._keysPrev.fill(0)

this._buttons.fill(0)
this._buttonsPrev.fill(0)

this._mouseDX=0
this._mouseDY=0
this._wheelDelta=0
}

}
