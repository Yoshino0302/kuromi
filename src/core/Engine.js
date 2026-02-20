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

this.executionGraph=new Array(32)
this.executionGraphSize=0

this.commandQueue=new Array(4096)
this.commandCount=0

this.listeners=new Map()

this.frameHistory=new Float32Array(256)
this.frameHistoryIndex=0

this.exposureHistory=new Float32Array(256)
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

this._rafId=0
this._loopActive=false

this._lastNow=0

this._phase=FRAME_PHASE.BEGIN

this._boundTick=this._tick.bind(this)

Object.seal(this)

}

async init(){

if(this.initialized)return this

this.state=ENGINE_STATE.INITIALIZING

this.renderer=new Renderer({...this.options,engine:this})

this.pipeline=new CinematicRenderPipeline(this)

this.sceneManager=new SceneManager({...this.options,engine:this})

this.cameraSystem=new CameraSystem({...this.options,engine:this})

this.systemManager=new SystemManager(this)

this.scheduler=new TaskScheduler(this)

this.memoryMonitor=new MemoryMonitor(this)

this.assetManager=new AssetManager(this)

this.environmentSystem=new EnvironmentSystem(this)

await this.renderer.init?.()
await this.pipeline.init?.()
await this.sceneManager.init?.()
await this.cameraSystem.init?.()
await this.systemManager.init?.()
await this.scheduler.init?.()
await this.assetManager.init?.()
await this.environmentSystem.init?.()

this.performanceMonitor=new PerformanceMonitor({targetFPS:this.targetFPS})

const rawRenderer=this.renderer.getRenderer?.()

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

if(this.lockFPS){

this.delta=this.frameInterval

}else{

this.delta=this.rawDelta

}

this._updateCinematicClock()

this._updateTemporalState()

this._solvePhysicalExposure()

this._recordFrameTime(this.delta)

this._runExecutionGraph()

this.time+=this.delta

this.frame++

this.temporalBuffers.frameIndex++

}

_updateCinematicClock(){

this.cinematicClock+=this.delta

}

_updateTemporalState(){

const camera=this.cameraSystem?.getCamera?.()

if(!camera)return

this.temporalState.prevViewMatrix.copy(this.temporalState.viewMatrix)
this.temporalState.prevProjectionMatrix.copy(this.temporalState.projectionMatrix)
this.temporalState.prevViewProjectionMatrix.copy(this.temporalState.viewProjectionMatrix)
this.temporalState.prevCameraPosition.copy(this.temporalState.cameraPosition)
this.temporalState.prevJitter.copy(this.temporalState.jitter)

this.temporalState.viewMatrix.copy(camera.matrixWorldInverse)

this.temporalState.projectionMatrix.copy(camera.projectionMatrix)

this.temporalState.viewProjectionMatrix.multiplyMatrices(
this.temporalState.projectionMatrix,
this.temporalState.viewMatrix
)

this.temporalState.cameraPosition.copy(camera.position)

this._generateTemporalJitter()

}

_generateTemporalJitter(){

const index=this.temporalBuffers.frameIndex%8

const haltonX=this._halton(index,2)-0.5
const haltonY=this._halton(index,3)-0.5

this.temporalState.jitter.set(haltonX,haltonY)

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

this.exposureState.target=Math.min(
this.exposureState.max,
Math.max(this.exposureState.min,exposure)
)

this.exposureState.current+=(
this.exposureState.target-this.exposureState.current
)*this.exposureState.adaptationRate*this.delta

this.exposureHistory[this.exposureIndex]=this.exposureState.current

this.exposureIndex++

if(this.exposureIndex>=this.exposureHistory.length){
this.exposureIndex=0
}

if(this.pipeline){

this.pipeline.currentExposure=this.exposureState.current

}

}

_recordFrameTime(dt){

this.frameHistory[this.frameHistoryIndex]=dt

this.frameHistoryIndex++

if(this.frameHistoryIndex>=this.frameHistory.length){
this.frameHistoryIndex=0
}

}

_runExecutionGraph(){

for(let i=0;i<this.executionGraphSize;i++){

this.executionGraph[i]()

}

}

_phaseBegin(){

this._phase=FRAME_PHASE.BEGIN

this.commandCount=0

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

}

_phasePreRender(){

this._phase=FRAME_PHASE.PRE_RENDER

this.performanceMonitor?.update?.(this.delta)

const fps=this.performanceMonitor?.getFPS?.()||this.targetFPS

this.performanceScaler?.update?.(fps,this.delta)

this.memoryMonitor?.update?.(this.delta)

}

_phaseRender(){

this._phase=FRAME_PHASE.RENDER

const renderer=this.renderer
const scene=this.sceneManager?.getScene?.()
const camera=this.cameraSystem?.getCamera?.()

if(!renderer||!scene||!camera)return

this.pipeline?.render?.(
renderer,
scene,
camera,
this.delta,
this.alpha
)

}

_phasePostRender(){

this._phase=FRAME_PHASE.POST_RENDER

this._executeCommandQueue()

}

_phaseEnd(){

this._phase=FRAME_PHASE.END

this.temporalBuffers.historyValid=true

}

_executeCommandQueue(){

for(let i=0;i<this.commandCount;i++){

const cmd=this.commandQueue[i]

if(cmd)cmd()

this.commandQueue[i]=null

}

this.commandCount=0

}

enqueueCommand(fn){

if(this.commandCount>=this.commandQueue.length)return

this.commandQueue[this.commandCount++]=fn

}
  _executeGPUCommandBuffer(){

if(!this.commandCount)return

for(let i=0;i<this.commandCount;i++){

const cmd=this.commandQueue[i]

if(cmd){

try{

cmd()

}catch(e){

console.warn('[GPU COMMAND ERROR]',e)

}

}

this.commandQueue[i]=null

}

this.commandCount=0

}

_allocateMemory(bytes){

this.memoryState.allocated+=bytes

if(this.memoryState.allocated>this.memoryState.peak){

this.memoryState.peak=this.memoryState.allocated

}

}

_freeMemory(bytes){

this.memoryState.allocated-=bytes

if(this.memoryState.allocated<0)this.memoryState.allocated=0

}

_updateHDRState(){

if(!this.pipeline)return

this.pipeline.currentExposure=this.exposureState.current

this.pipeline.hdrEnabled=this.colorState.HDR

this.pipeline.acesEnabled=this.colorState.ACES

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

_setCinematicFPS(fps){

if(!Number.isFinite(fps))return

this.targetFPS=fps

this.frameInterval=1/fps

}

_setExecutionMode(mode){

this.executionMode=mode

}

_phasePostRender(){

this._phase=FRAME_PHASE.POST_RENDER

this._executeGPUCommandBuffer()

this._updateHDRState()

}

stop(){

if(!this.running)return

this.running=false

this.paused=false

cancelAnimationFrame(this._rafId)

this._rafId=0

this._loopActive=false

this.clock.stop()

this.state=ENGINE_STATE.STOPPED

this._emit?.('stop')

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
