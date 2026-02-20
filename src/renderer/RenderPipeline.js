import * as THREE from 'https://jspm.dev/three'

export class RenderPipeline{

constructor(renderer,engine){
this.renderer=renderer
this.engine=engine
this.gl=renderer.getContext()

this.stages=[]
this.stageCount=0

this._stageMap=new Map()

this._enabled=true
this._initialized=false

this._width=1
this._height=1

this._pixelRatio=1

this._clearColor=new THREE.Color(0x000000)
this._clearAlpha=1

this._currentRenderTarget=null
this._defaultRenderTarget=null

this._swapA=null
this._swapB=null
this._readBuffer=null
this._writeBuffer=null

this._quadScene=null
this._quadCamera=null
this._quadMesh=null

this._tempColor=new THREE.Color()

this._beforeCallbacks=[]
this._afterCallbacks=[]
this._beforeCount=0
this._afterCount=0
}

init(width,height,pixelRatio=1){
if(this._initialized)return

this._pixelRatio=pixelRatio
this.setSize(width,height)

this._quadScene=new THREE.Scene()
this._quadCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1)

const geometry=new THREE.PlaneGeometry(2,2)
const material=new THREE.MeshBasicMaterial({color:0xffffff})
this._quadMesh=new THREE.Mesh(geometry,material)
this._quadScene.add(this._quadMesh)

this._swapA=this._createRenderTarget()
this._swapB=this._createRenderTarget()

this._readBuffer=this._swapA
this._writeBuffer=this._swapB

this._initialized=true
}

setSize(width,height){
this._width=width
this._height=height

if(this._swapA){
this._swapA.setSize(width,height)
this._swapB.setSize(width,height)
}

for(let i=0;i<this.stageCount;i++){
const stage=this.stages[i]
if(stage.setSize)stage.setSize(width,height)
}
}

setPixelRatio(ratio){
this._pixelRatio=ratio
this.setSize(this._width,this._height)
}

setClear(color,alpha=1){
this._clearColor.set(color)
this._clearAlpha=alpha
}

addStage(name,stage,priority=100){
if(this._stageMap.has(name))return

stage.name=name
stage.priority=priority
stage.enabled=true
stage.initialized=false

this.stages[this.stageCount++]=stage
this._stageMap.set(name,stage)

this._sortStages()

if(stage.init){
stage.init(this)
stage.initialized=true
}
}

removeStage(name){
const stage=this._stageMap.get(name)
if(!stage)return

let index=-1
for(let i=0;i<this.stageCount;i++){
if(this.stages[i]===stage){
index=i
break
}
}

if(index!==-1){
for(let i=index;i<this.stageCount-1;i++){
this.stages[i]=this.stages[i+1]
}
this.stages[this.stageCount-1]=null
this.stageCount--
}

this._stageMap.delete(name)

if(stage.dispose)stage.dispose()
}

getStage(name){
return this._stageMap.get(name)
}

hasStage(name){
return this._stageMap.has(name)
}

enableStage(name){
const stage=this._stageMap.get(name)
if(stage)stage.enabled=true
}

disableStage(name){
const stage=this._stageMap.get(name)
if(stage)stage.enabled=false
}

render(scene,camera,delta){

if(!this._enabled)return

this._runBefore(delta)

const renderer=this.renderer

renderer.setRenderTarget(this._readBuffer)
renderer.setClearColor(this._clearColor,this._clearAlpha)
renderer.clear(true,true,true)
renderer.render(scene,camera)

for(let i=0;i<this.stageCount;i++){

const stage=this.stages[i]
if(!stage.enabled)continue

stage.render(
renderer,
this._readBuffer,
this._writeBuffer,
delta,
this
)

this._swapBuffers()
}

renderer.setRenderTarget(null)
renderer.render(this._quadScene,this._quadCamera)

this._runAfter(delta)
}

_swapBuffers(){
const temp=this._readBuffer
this._readBuffer=this._writeBuffer
this._writeBuffer=temp
}

_createRenderTarget(){
return new THREE.WebGLRenderTarget(
this._width,
this._height,
{
depthBuffer:true,
stencilBuffer:false,
minFilter:THREE.LinearFilter,
magFilter:THREE.LinearFilter,
format:THREE.RGBAFormat,
type:THREE.UnsignedByteType
}
)
}

_runBefore(delta){
for(let i=0;i<this._beforeCount;i++){
this._beforeCallbacks[i](delta,this)
}
}

_runAfter(delta){
for(let i=0;i<this._afterCount;i++){
this._afterCallbacks[i](delta,this)
}
}

onBeforeRender(fn){
this._beforeCallbacks[this._beforeCount++]=fn
}

onAfterRender(fn){
this._afterCallbacks[this._afterCount++]=fn
}

_sortStages(){
this.stages.length=this.stageCount
this.stages.sort((a,b)=>a.priority-b.priority)
}

dispose(){

for(let i=0;i<this.stageCount;i++){
const stage=this.stages[i]
if(stage.dispose)stage.dispose()
}

if(this._swapA)this._swapA.dispose()
if(this._swapB)this._swapB.dispose()

if(this._quadMesh){
this._quadMesh.geometry.dispose()
this._quadMesh.material.dispose()
}

this.stageCount=0
this._stageMap.clear()
}

get readBuffer(){
return this._readBuffer
}

get writeBuffer(){
return this._writeBuffer
}

get width(){
return this._width
}

get height(){
return this._height
}

get pixelRatio(){
return this._pixelRatio
}

set enabled(v){
this._enabled=v
}

get enabled(){
return this._enabled
}

}
