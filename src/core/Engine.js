import * as THREE from 'https://jspm.dev/three'
import {Renderer} from '../renderer/Renderer.js'
import {CinematicRenderPipeline} from '../renderer/CinematicRenderPipeline.js'
import {SceneManager} from '../scene/SceneManager.js'
import {CameraSystem} from '../camera/CameraSystem.js'
import {SystemManager} from '../systems/SystemManager.js'
import {TaskScheduler} from '../systems/TaskScheduler.js'
import {MemoryMonitor} from '../systems/MemoryMonitor.js'
import {AssetManager} from '../assets/AssetManager.js'
import {EnvironmentSystem} from '../world/EnvironmentSystem.js'
import {PerformanceMonitor} from '../systems/PerformanceMonitor.js'
import {PerformanceScaler} from '../systems/PerformanceScaler.js'

const ENGINE_STATE={CONSTRUCTED:0,INITIALIZING:1,INITIALIZED:2,RUNNING:3,PAUSED:4,STOPPED:5,SHUTTING_DOWN:6,DESTROYED:7}
const EXECUTION_MODE={CPU_PRIORITY:0,GPU_PRIORITY:1,CINEMATIC_PRIORITY:2}
const FRAME_PHASE={BEGIN:0,FIXED:1,UPDATE:2,PRE_RENDER:3,RENDER:4,POST_RENDER:5,END:6}

class FrameGraphResourceManager{
constructor(){
this.resources=new Map()
this.descriptors=new Map()
this.refCounts=new Map()
}
register(name,resource,desc){
this.resources.set(name,resource)
this.descriptors.set(name,desc)
this.refCounts.set(name,0)
}
get(name){
return this.resources.get(name)
}
addRef(name){
this.refCounts.set(name,(this.refCounts.get(name)||0)+1)
}
release(name){
let c=(this.refCounts.get(name)||0)-1
if(c<=0){
this.resources.delete(name)
this.descriptors.delete(name)
this.refCounts.delete(name)
}else{
this.refCounts.set(name,c)
}
}
has(name){
return this.resources.has(name)
}
clear(){
this.resources.clear()
this.descriptors.clear()
this.refCounts.clear()
}
}

class FrameGraphExecutor{
constructor(engine){
this.engine=engine
this.nodes=[]
this.sorted=[]
this.executionList=new Array(512)
this.executionCount=0
this.resourceManager=new FrameGraphResourceManager()
}
addPass(pass){
this.nodes.push(pass)
}
compile(){
const visited=new Set()
const sorted=[]
const visit=(node)=>{
if(visited.has(node))return
visited.add(node)
if(node.dependencies){
for(let i=0;i<node.dependencies.length;i++){
visit(node.dependencies[i])
}
}
sorted.push(node)
}
for(let i=0;i<this.nodes.length;i++){
visit(this.nodes[i])
}
this.sorted=sorted
this.executionCount=sorted.length
}
execute(context){
const list=this.sorted
const count=this.executionCount
const rm=this.resourceManager
for(let i=0;i<count;i++){
const pass=list[i]
if(pass.execute){
pass.execute(context,rm)
}
}
}
clear(){
this.nodes.length=0
this.sorted.length=0
this.executionCount=0
this.resourceManager.clear()
}
}

class GPUStateCache{
constructor(gl){
this.gl=gl
this.program=null
this.material=null
this.geometry=null
this.framebuffer=null
this.blend=null
this.depth=null
}
setProgram(program){
if(this.program===program)return
this.program=program
this.gl.useProgram(program)
}
setFramebuffer(fb){
if(this.framebuffer===fb)return
this.framebuffer=fb
this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,fb)
}
reset(){
this.program=null
this.material=null
this.geometry=null
this.framebuffer=null
this.blend=null
this.depth=null
}
}

class CinematicRenderQueue{
constructor(){
this.opaque=[]
this.transparent=[]
this.volumetric=[]
this.post=[]
this.ui=[]
this.execution=new Array(4096)
this.executionCount=0
}
clear(){
this.opaque.length=0
this.transparent.length=0
this.volumetric.length=0
this.post.length=0
this.ui.length=0
this.executionCount=0
}
add(object,material,depth,flags){
const entry={object,material,depth,flags}
if(flags&1){
this.transparent.push(entry)
}else{
this.opaque.push(entry)
}
}
sort(){
this.opaque.sort((a,b)=>a.depth-b.depth)
this.transparent.sort((a,b)=>b.depth-a.depth)
}
build(){
let i=0
const exec=this.execution
const o=this.opaque
const t=this.transparent
for(let j=0;j<o.length;j++)exec[i++]=o[j]
for(let j=0;j<t.length;j++)exec[i++]=t[j]
this.executionCount=i
}
}

export class Engine{

static instance=null

static getInstance(options={}){
if(!Engine.instance)Engine.instance=new Engine(options)
return Engine.instance
}

constructor(options={}){

if(Engine.instance)return Engine.instance
Engine.instance=this

this.options=options
this.state=ENGINE_STATE.CONSTRUCTED
this.executionMode=EXECUTION_MODE.CINEMATIC_PRIORITY
this.cinematic=true

this.clock=new THREE.Clock(false)
this.cinematicClock=0

this.targetFPS=options.targetFPS||23.976
this.frameInterval=1/this.targetFPS
this.lockFPS=true

this.time=0
this.delta=0
this.rawDelta=0
this.frame=0
this.alpha=0

this.accumulator=0
this.fixedDelta=1/60
this.maxSubSteps=4

this.running=false
this.paused=false
this.initialized=false
this.destroyed=false

this.renderer=null
this.pipeline=null
this.sceneManager=null
this.cameraSystem=null
this.systemManager=null
this.scheduler=null
this.memoryMonitor=null
this.assetManager=null
this.environmentSystem=null
this.performanceMonitor=null
this.performanceScaler=null

this.frameGraph=new FrameGraphExecutor(this)

this.renderQueue=new CinematicRenderQueue()

this.gpuStateCache=null

this.executionGraph=new Array(64)
this.executionGraphSize=0

this.commandQueue=new Array(8192)
this.commandCount=0

this.listeners=new Map()

this.frameHistory=new Float32Array(512)
this.frameHistoryIndex=0

this.exposureHistory=new Float32Array(512)
this.exposureIndex=0

this.temporalState={
viewMatrix:new THREE.Matrix4(),
projectionMatrix:new THREE.Matrix4(),
viewProjectionMatrix:new THREE.Matrix4(),
prevViewMatrix:new THREE.Matrix4(),
prevProjectionMatrix:new THREE.Matrix4(),
prevViewProjectionMatrix:new THREE.Matrix4(),
cameraPosition:new THREE.Vector3(),
prevCameraPosition:new THREE.Vector3(),
jitter:new THREE.Vector2(),
prevJitter:new THREE.Vector2()
}

this.cameraPhysical={
sensorWidth:36,
sensorHeight:24,
focalLength:50,
aperture:1.4,
shutterSpeed:1/48,
ISO:100,
focusDistance:10,
shutterAngle:180
}

this.exposureState={
current:1,
target:1,
adaptationRate:1.5,
min:0.0001,
max:100000
}

this.colorState={
ACES:true,
HDR:true,
colorSpace:'ACEScg'
}

this.temporalBuffers={
frameIndex:0,
historyValid:false
}

this.memoryState={
allocated:0,
peak:0
}

this.renderWorker=null
this.workerReady=false
this.workerQueue=[]
this.workerResults=[]

this._rafId=0
this._loopActive=false
this._lastNow=0
this._phase=FRAME_PHASE.BEGIN
this._boundTick=this._tick.bind(this)

Object.seal(this)

this._initWorker()

}

_initWorker(){

try{

this.renderWorker=new Worker('../workers/RenderWorker.js',{type:'module'})

this.renderWorker.onmessage=(e)=>{

this.workerResults.push(e.data)

}

this.workerReady=true

}catch(e){

this.workerReady=false

}

}
  async init(){

if(this.initialized)return this

this.state=ENGINE_STATE.INITIALIZING

this.renderer=new Renderer({...this.options,engine:this})
await this.renderer.init?.()

const rawRenderer=this.renderer.getRenderer?.()
const gl=rawRenderer?.getContext?.()

if(gl){
this.gpuStateCache=new GPUStateCache(gl)
}

this.pipeline=new CinematicRenderPipeline(this)
await this.pipeline.init?.()

this.sceneManager=new SceneManager({...this.options,engine:this})
await this.sceneManager.init?.()

this.cameraSystem=new CameraSystem({...this.options,engine:this})
await this.cameraSystem.init?.()

this.systemManager=new SystemManager(this)
await this.systemManager.init?.()

this.scheduler=new TaskScheduler(this)
await this.scheduler.init?.()

this.memoryMonitor=new MemoryMonitor(this)

this.assetManager=new AssetManager(this)
await this.assetManager.init?.()

this.environmentSystem=new EnvironmentSystem(this)
await this.environmentSystem.init?.()

this.performanceMonitor=new PerformanceMonitor({targetFPS:this.targetFPS})

if(rawRenderer){

this.performanceScaler=new PerformanceScaler(rawRenderer,{
targetFPS:this.targetFPS,
minFPS:12,
maxScale:1,
minScale:0.25
})

this.performanceScaler.attachPipeline?.(this.pipeline)

}

this._buildExecutionGraph()

this.frameGraph.clear()

this.initialized=true
this.state=ENGINE_STATE.INITIALIZED

return this

}

_buildExecutionGraph(){

this.executionGraphSize=0

this.executionGraph[this.executionGraphSize++]=this._phaseBegin.bind(this)
this.executionGraph[this.executionGraphSize++]=this._phaseFixed.bind(this)
this.executionGraph[this.executionGraphSize++]=this._phaseUpdate.bind(this)
this.executionGraph[this.executionGraphSize++]=this._phasePreRender.bind(this)
this.executionGraph[this.executionGraphSize++]=this._phaseRender.bind(this)
this.executionGraph[this.executionGraphSize++]=this._phasePostRender.bind(this)
this.executionGraph[this.executionGraphSize++]=this._phaseEnd.bind(this)

}

start(){

if(this.running)return

this.running=true
this.paused=false

this.clock.start()

this._lastNow=performance.now()

this._startLoop()

}

_startLoop(){

if(this._loopActive)return

this._loopActive=true

const loop=(now)=>{

if(!this.running){

this._loopActive=false
return

}

this._rafId=requestAnimationFrame(loop)

this._tick(now)

}

this._rafId=requestAnimationFrame(loop)

}

_tick(now){

this.rawDelta=(now-this._lastNow)*0.001
this._lastNow=now

if(!Number.isFinite(this.rawDelta))this.rawDelta=0

this.delta=this.lockFPS?this.frameInterval:this.rawDelta

this._updateCinematicClock()

this._updateTemporalState()

this._solvePhysicalExposure()

this._recordFrameTime(this.delta)

this._processWorkerResults()

this._runExecutionGraph()

this.time+=this.delta
this.frame++

this.temporalBuffers.frameIndex++

}

_processWorkerResults(){

const results=this.workerResults

if(results.length===0)return

for(let i=0;i<results.length;i++){

const res=results[i]

if(res.type==="visibility"){
this.sceneManager.applyVisibility?.(res.visible)
}

}

results.length=0

}

_runExecutionGraph(){

const graph=this.executionGraph
const size=this.executionGraphSize

for(let i=0;i<size;i++){

graph[i]()

}

}

_phaseBegin(){

this._phase=FRAME_PHASE.BEGIN

this.commandCount=0

this.renderQueue.clear()

this._emit?.('frame:begin',this.delta)

}

_phaseFixed(){

this._phase=FRAME_PHASE.FIXED

this.accumulator+=this.delta

let subSteps=0

while(this.accumulator>=this.fixedDelta){

if(subSteps>=this.maxSubSteps){

this.accumulator=0
break

}

this.scheduler?.fixedUpdate?.(this.fixedDelta)

this.systemManager?.fixedUpdate?.(this.fixedDelta)

this.accumulator-=this.fixedDelta

subSteps++

}

this.alpha=this.accumulator/this.fixedDelta

}

_phaseUpdate(){

this._phase=FRAME_PHASE.UPDATE

this.scheduler?.update?.(this.delta)

this.systemManager?.update?.(this.delta)

this.environmentSystem?.update?.(this.delta)

this.cameraSystem?.update?.(this.delta)

this.sceneManager?.update?.(this.delta,this.time,this.alpha)

if(this.workerReady){

const objects=this.sceneManager.getRenderables?.()

const camera=this.cameraSystem.getCamera?.()

if(objects&&camera){

this.renderWorker.postMessage({
type:'visibility',
objects,
cameraMatrix:camera.matrixWorld.elements
})

}

}

}

_phasePreRender(){

this._phase=FRAME_PHASE.PRE_RENDER

this.performanceMonitor?.update?.(this.delta)

const fps=this.performanceMonitor?.getFPS?.()||this.targetFPS

this.performanceScaler?.update?.(fps,this.delta)

this.memoryMonitor?.update?.(this.delta)

this._buildRenderQueue()

}
  _buildRenderQueue(){

const scene=this.sceneManager?.getScene?.()
const camera=this.cameraSystem?.getCamera?.()

if(!scene||!camera)return

const queue=this.renderQueue
queue.clear()

const renderables=this.sceneManager.getRenderables?.()

if(!renderables)return

const camPos=camera.position

for(let i=0;i<renderables.length;i++){

const obj=renderables[i]

if(!obj.visible)continue

const dx=obj.position.x-camPos.x
const dy=obj.position.y-camPos.y
const dz=obj.position.z-camPos.z

const depth=dx*dx+dy*dy+dz*dz

const material=obj.material

let flags=0

if(material?.transparent)flags|=1

queue.add(obj,material,depth,flags)

}

queue.sort()

queue.build()

}

_phaseRender(){

this._phase=FRAME_PHASE.RENDER

const renderer=this.renderer
const pipeline=this.pipeline
const camera=this.cameraSystem?.getCamera?.()
const scene=this.sceneManager?.getScene?.()

if(!renderer||!pipeline||!camera||!scene)return

const context={
engine:this,
renderer,
pipeline,
camera,
scene,
queue:this.renderQueue,
gpuState:this.gpuStateCache,
delta:this.delta,
alpha:this.alpha
}

this.frameGraph.execute(context)

pipeline.render?.(
renderer,
scene,
camera,
this.delta,
this.alpha,
this.renderQueue
)

}

_phasePostRender(){

this._phase=FRAME_PHASE.POST_RENDER

this._executeGPUCommandBuffer()

this._updateHDRState()

}

_phaseEnd(){

this._phase=FRAME_PHASE.END

this.temporalBuffers.historyValid=true

this._emit?.('frame:end',this.delta)

}

_executeGPUCommandBuffer(){

const count=this.commandCount
const queue=this.commandQueue

for(let i=0;i<count;i++){

const cmd=queue[i]

if(cmd){

try{
cmd()
}catch(e){
console.warn('[GPU COMMAND ERROR]',e)
}

queue[i]=null

}

}

this.commandCount=0

}

enqueueCommand(fn){

if(this.commandCount>=this.commandQueue.length)return

this.commandQueue[this.commandCount++]=fn

}

submitFrameGraphPass(pass){

this.frameGraph.addPass(pass)

}

compileFrameGraph(){

this.frameGraph.compile()

}

clearFrameGraph(){

this.frameGraph.clear()

}

executeFrameGraph(context){

this.frameGraph.execute(context)

}

_updateHDRState(){

if(!this.pipeline)return

this.pipeline.currentExposure=this.exposureState.current
this.pipeline.hdrEnabled=this.colorState.HDR
this.pipeline.acesEnabled=this.colorState.ACES

}

_allocateMemory(bytes){

this.memoryState.allocated+=bytes

if(this.memoryState.allocated>this.memoryState.peak){
this.memoryState.peak=this.memoryState.allocated
}

}

_freeMemory(bytes){

this.memoryState.allocated-=bytes

if(this.memoryState.allocated<0){
this.memoryState.allocated=0
}

}
  _initCinematicCameraAnimator(){

const camera=this.cameraSystem?.getCamera?.()

if(!camera)return

this.cinematicCameraAnimator={
camera,
tracks:new Array(256),
trackCount:0,
time:0,
duration:0,
playing:false
}

}

addCameraKeyframe(time,pos,rot,fov){

const anim=this.cinematicCameraAnimator

if(!anim)return

anim.tracks[anim.trackCount++]={
time,
pos:pos.clone(),
rot:rot.clone(),
fov
}

if(time>anim.duration){
anim.duration=time
}

}

playCameraAnimation(){

if(!this.cinematicCameraAnimator)return

this.cinematicCameraAnimator.playing=true
this.cinematicCameraAnimator.time=0

}

_updateCameraAnimator(dt){

const anim=this.cinematicCameraAnimator

if(!anim||!anim.playing)return

anim.time+=dt

const t=anim.time

if(t>=anim.duration){

anim.playing=false
return

}

let k1=null
let k2=null

for(let i=0;i<anim.trackCount-1;i++){

const a=anim.tracks[i]
const b=anim.tracks[i+1]

if(t>=a.time&&t<=b.time){

k1=a
k2=b
break

}

}

if(!k1||!k2)return

const alpha=(t-k1.time)/(k2.time-k1.time)

const smooth=alpha*alpha*(3-2*alpha)

anim.camera.position.lerpVectors(
k1.pos,
k2.pos,
smooth
)

anim.camera.quaternion.slerpQuaternions(
k1.rot,
k2.rot,
smooth
)

anim.camera.fov=
k1.fov+(k2.fov-k1.fov)*smooth

anim.camera.updateProjectionMatrix()

}

_updateCinematicClock(){

const dt=this.delta

this.cinematicClock+=dt

this._updateCameraAnimator(dt)

}

_updateTemporalState(){

const camera=this.cameraSystem?.getCamera?.()

if(!camera)return

const t=this.temporalState

t.prevViewMatrix.copy(t.viewMatrix)
t.prevProjectionMatrix.copy(t.projectionMatrix)
t.prevViewProjectionMatrix.copy(t.viewProjectionMatrix)
t.prevCameraPosition.copy(t.cameraPosition)
t.prevJitter.copy(t.jitter)

t.viewMatrix.copy(camera.matrixWorldInverse)

t.projectionMatrix.copy(camera.projectionMatrix)

t.viewProjectionMatrix.multiplyMatrices(
t.projectionMatrix,
t.viewMatrix
)

t.cameraPosition.copy(camera.position)

this._generateTemporalJitter()

}

_generateTemporalJitter(){

const index=this.temporalBuffers.frameIndex%16

const jitterX=this._halton(index,2)-0.5
const jitterY=this._halton(index,3)-0.5

this.temporalState.jitter.set(jitterX,jitterY)

}

_halton(index,base){

let result=0
let f=1/base
let i=index

while(i>0){

result+=f*(i%base)

i=Math.floor(i/base)

f/=base

}

return result

}

_solvePhysicalExposure(){

const c=this.cameraPhysical

const aperture=c.aperture
const shutter=c.shutterSpeed
const ISO=c.ISO

const ev=(aperture*aperture)/shutter*(100/ISO)

const exposure=1/ev

const state=this.exposureState

state.target=Math.min(
state.max,
Math.max(state.min,exposure)
)

const speed=state.adaptationRate*this.delta

state.current+=
(state.target-state.current)*speed

this.exposureHistory[this.exposureIndex]=state.current

this.exposureIndex++

if(this.exposureIndex>=this.exposureHistory.length){
this.exposureIndex=0
}

if(this.pipeline){
this.pipeline.currentExposure=state.current
}

}

_recordFrameTime(dt){

this.frameHistory[this.frameHistoryIndex]=dt

this.frameHistoryIndex++

if(this.frameHistoryIndex>=this.frameHistory.length){
this.frameHistoryIndex=0
}

}
  stop(){

if(!this.running)return

this.running=false
this.paused=false

cancelAnimationFrame(this._rafId)

this._rafId=0
this._loopActive=false

this.clock.stop()

this._emit?.('stop')

this.state=ENGINE_STATE.STOPPED

}

pause(){

if(this.paused)return

this.paused=true

this.clock.stop()

this._emit?.('pause')

}

resume(){

if(!this.paused)return

this.paused=false

this.clock.start()

this._lastNow=performance.now()

this._emit?.('resume')

}

async shutdown(){

if(this.destroyed)return

this.state=ENGINE_STATE.SHUTTING_DOWN

this.stop()

if(this.renderWorker){

this.renderWorker.terminate()

this.renderWorker=null

this.workerReady=false

}

await this._dispose(this.pipeline)
await this._dispose(this.sceneManager)
await this._dispose(this.cameraSystem)
await this._dispose(this.systemManager)
await this._dispose(this.scheduler)
await this._dispose(this.environmentSystem)
await this._dispose(this.assetManager)
await this._dispose(this.performanceScaler)
await this._dispose(this.performanceMonitor)
await this._dispose(this.renderer)

this.frameGraph.clear()

this.commandQueue.fill(null)

this.executionGraphSize=0

this.initialized=false
this.destroyed=true

Engine.instance=null

this.state=ENGINE_STATE.DESTROYED

this._emit?.('shutdown')

}

async restart(){

await this.shutdown()

this.destroyed=false

await this.init()

this.start()

}

async _dispose(system){

if(!system)return

try{

await system.dispose?.()

}catch(e){

console.warn('[DISPOSE ERROR]',e)

}

}

on(event,fn){

let set=this.listeners.get(event)

if(!set){

set=new Set()

this.listeners.set(event,set)

}

set.add(fn)

return()=>set.delete(fn)

}

_emit(event,data){

const set=this.listeners.get(event)

if(!set)return

for(const fn of set){

try{
fn(data)
}catch(e){
console.warn('[EVENT ERROR]',e)
}

}

}

_setExecutionMode(mode){

this.executionMode=mode

}

_setCinematicFPS(fps){

if(!Number.isFinite(fps))return

this.targetFPS=fps

this.frameInterval=1/fps

}

_setCinematicCameraParameters(params={}){

const c=this.cameraPhysical

if(params.sensorWidth!==undefined)c.sensorWidth=params.sensorWidth
if(params.sensorHeight!==undefined)c.sensorHeight=params.sensorHeight
if(params.focalLength!==undefined)c.focalLength=params.focalLength
if(params.aperture!==undefined)c.aperture=params.aperture
if(params.shutterSpeed!==undefined)c.shutterSpeed=params.shutterSpeed
if(params.ISO!==undefined)c.ISO=params.ISO
if(params.focusDistance!==undefined)c.focusDistance=params.focusDistance
if(params.shutterAngle!==undefined)c.shutterAngle=params.shutterAngle

}

getCinematicExposure(){

return this.exposureState.current

}

getPhysicalCamera(){

return this.cameraPhysical

}

getTemporalState(){

return this.temporalState

}

getMemoryStats(){

return{
allocated:this.memoryState.allocated,
peak:this.memoryState.peak
}

}

getFrameStats(){

return{
frame:this.frame,
time:this.time,
delta:this.delta,
fps:1/this.delta
}

}

isRunning(){return this.running}
isInitialized(){return this.initialized}
isDestroyed(){return this.destroyed}

}
