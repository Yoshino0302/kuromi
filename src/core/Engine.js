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

const ENGINE_STATE={
CONSTRUCTED:0,
INITIALIZING:1,
INITIALIZED:2,
RUNNING:3,
PAUSED:4,
STOPPED:5,
SHUTTING_DOWN:6,
DESTROYED:7
}

const EXECUTION_MODE={
CPU_PRIORITY:0,
GPU_PRIORITY:1,
CINEMATIC_PRIORITY:2
}

const FRAME_PHASE={
BEGIN:0,
FIXED:1,
UPDATE:2,
PRE_RENDER:3,
RENDER:4,
POST_RENDER:5,
END:6
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

this.targetFPS=options.targetFPS||23.976
this.frameInterval=1/this.targetFPS
this.lockFPS=true

this.time=0
this.timeHi=0
this.timeLo=0

this.delta=0
this.rawDelta=0

this.frame=0
this.deterministicFrame=0

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

this.executionGraph=new Array(64)
this.executionGraphSize=0

this.commandQueue=new Array(8192)
this.commandCount=0

this.gpuSubmissionQueue=new Array(8192)
this.gpuSubmissionCount=0

this.listeners=new Map()

this.frameHistory=new Float32Array(512)
this.frameHistoryIndex=0

this.frameVariance={
mean:0,
variance:0,
samples:0
}

this.executionLock=false

this._rafId=0
this._loopActive=false
this._lastNow=0
this._phase=FRAME_PHASE.BEGIN

this._boundTick=this._tick.bind(this)

Object.seal(this)

}
  this.cinematicClock=0

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

this.lensState={
anamorphic:false,
squeeze:1.0,
distortion:0,
chromaticAberration:0,
vignette:0
}

this.focusState={
current:this.cameraPhysical.focusDistance,
target:this.cameraPhysical.focusDistance,
velocity:0
}

this.exposureState={
current:1,
target:1,
adaptationRate:1.5,
min:0.00001,
max:100000
}

this.exposureHistogram=new Uint32Array(256)

this.temporalBuffers={
frameIndex:0,
historyValid:false
}

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

this.temporalHistory={
camera:new Array(128),
exposure:new Float32Array(128),
jitter:new Float32Array(256),
index:0
}

this.motionVectorState={
prevViewProj:new THREE.Matrix4(),
currViewProj:new THREE.Matrix4()
}

this.temporalStability={
factor:0.9,
filteredExposure:1
}

this.floatingOrigin=new THREE.Vector3()

this.visibilityState={
objects:new Array(65536),
count:0
}

this.memoryState={
allocated:0,
peak:0
}

this.gpuMemory={
allocated:0,
peak:0
}

this.resourceRegistry=new Set()

this.renderStateCache={
camera:null,
scene:null,
pipeline:null
}

this.pipelineDirty=true

this.frameGraph={
nodes:[],
compiled:false
}

this.frameStability=1

this.randomState=1234567

this.driftCorrection={
error:0
}

this.framePacing={
history:new Float32Array(64),
index:0,
smoothed:0
}

this.absoluteTimeAccumulator={
hi:0,
lo:0
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

this.performanceMonitor=new PerformanceMonitor({
targetFPS:this.targetFPS
})

const rawRenderer=this.renderer.getRenderer?.()

if(rawRenderer){

this.performanceScaler=new PerformanceScaler(
rawRenderer,
{
targetFPS:this.targetFPS,
minFPS:12,
maxScale:1,
minScale:0.25
}
)

this.performanceScaler.attachPipeline?.(
this.pipeline
)

}

this._buildExecutionGraph()

this._compileFrameGraph()

this.initialized=true

this.state=ENGINE_STATE.INITIALIZED

this._emit('initialized')

return this

}

_compileFrameGraph(){

const fg=this.frameGraph

if(fg.compiled)return

for(let i=0;i<fg.nodes.length;i++){

const node=fg.nodes[i]

if(node?.compile)
node.compile(this)

}

fg.compiled=true

}

_buildExecutionGraph(){

let i=0

this.executionGraph[i++]=this._phaseBegin.bind(this)

this.executionGraph[i++]=this._phaseFixed.bind(this)

this.executionGraph[i++]=this._phaseUpdate.bind(this)

this.executionGraph[i++]=this._phasePreRender.bind(this)

this.executionGraph[i++]=this._phaseRender.bind(this)

this.executionGraph[i++]=this._phasePostRender.bind(this)

this.executionGraph[i++]=this._phaseEnd.bind(this)

this.executionGraphSize=i

}

start(){

if(this.running)return

this.running=true

this.paused=false

this.clock.start()

this._lastNow=performance.now()

this._startLoop()

this.state=ENGINE_STATE.RUNNING

this._emit('start')

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

if(this.executionLock)return

this.executionLock=true

this.rawDelta=(now-this._lastNow)*0.001

this._lastNow=now

if(!Number.isFinite(this.rawDelta)||this.rawDelta<0)
this.rawDelta=0

if(this.rawDelta>0.25)
this.rawDelta=0.25

this.delta=this.lockFPS
?this.frameInterval
:this.rawDelta

this._accumulateAbsoluteTime(this.delta)

this.time+=this.delta

this.deterministicFrame=(this.deterministicFrame+1)>>>0

this._updateFrameVariance(this.delta)

this._updateFramePacing(this.delta)

this._updateCinematicClock()

this._updateTemporalState()

this._updateTemporalHistory()

this._updateMotionVectorState()

this._solvePhysicalExposure()

this._updateFocusSystem()

this._recordFrameTime(this.delta)

this._runExecutionGraph()

this.frame++

this.temporalBuffers.frameIndex++

this.executionLock=false

}

_accumulateAbsoluteTime(dt){

let lo=this.absoluteTimeAccumulator.lo+dt

let hi=this.absoluteTimeAccumulator.hi

if(lo>=1){

const carry=Math.floor(lo)

lo-=carry

hi+=carry

}

this.absoluteTimeAccumulator.lo=lo

this.absoluteTimeAccumulator.hi=hi

}

_updateFrameVariance(dt){

const v=this.frameVariance

v.samples++

const delta=dt-v.mean

v.mean+=delta/v.samples

v.variance+=delta*(dt-v.mean)

}

_updateFramePacing(dt){

const fp=this.framePacing

fp.history[fp.index]=dt

fp.index=(fp.index+1)&63

let sum=0

for(let i=0;i<64;i++)
sum+=fp.history[i]

fp.smoothed=sum/64

}

_updateCinematicClock(){

this.cinematicClock+=this.delta

}

_updateTemporalHistory(){

const th=this.temporalHistory

const i=th.index

th.camera[i]=this.cameraSystem?.getCamera?.()

th.exposure[i]=this.exposureState.current

th.jitter[i*2]=this.temporalState.jitter.x
th.jitter[i*2+1]=this.temporalState.jitter.y

th.index=(i+1)&127

}

_updateMotionVectorState(){

this.motionVectorState.prevViewProj.copy(
this.motionVectorState.currViewProj
)

this.motionVectorState.currViewProj.copy(
this.temporalState.viewProjectionMatrix
)

}

_updateFocusSystem(){

const f=this.focusState

const diff=f.target-f.current

f.velocity+=diff*0.1*this.delta

f.velocity*=0.9

f.current+=f.velocity

this.cameraPhysical.focusDistance=f.current

}

_recordFrameTime(dt){

this.frameHistory[this.frameHistoryIndex]=dt

this.frameHistoryIndex=(this.frameHistoryIndex+1)&511

}

_runExecutionGraph(){

const graph=this.executionGraph

for(let i=0;i<this.executionGraphSize;i++)
graph[i]()

}
  _updateTemporalState(){

const camera=this.cameraSystem?.getCamera?.()

if(!camera)return

const ts=this.temporalState

ts.prevViewMatrix.copy(ts.viewMatrix)
ts.prevProjectionMatrix.copy(ts.projectionMatrix)
ts.prevViewProjectionMatrix.copy(ts.viewProjectionMatrix)
ts.prevCameraPosition.copy(ts.cameraPosition)
ts.prevJitter.copy(ts.jitter)

ts.viewMatrix.copy(camera.matrixWorldInverse)

ts.projectionMatrix.copy(camera.projectionMatrix)

ts.viewProjectionMatrix.multiplyMatrices(
ts.projectionMatrix,
ts.viewMatrix
)

ts.cameraPosition.copy(camera.position)

this._generateTemporalJitter()

}

_generateTemporalJitter(){

const index=this.temporalBuffers.frameIndex&7

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

const ev100=(c.aperture*c.aperture)/c.shutterSpeed*(100/c.ISO)

let exposure=1/ev100

if(exposure<this.exposureState.min)
exposure=this.exposureState.min

else if(exposure>this.exposureState.max)
exposure=this.exposureState.max

this.exposureState.target=exposure

this.exposureState.current+=(
this.exposureState.target-
this.exposureState.current
)*this.exposureState.adaptationRate*this.delta

this.temporalStability.filteredExposure=
this.temporalStability.factor*
this.temporalStability.filteredExposure+
(1-this.temporalStability.factor)*
this.exposureState.current

if(this.pipeline){

this.pipeline.currentExposure=
this.temporalStability.filteredExposure

}

}

_phaseBegin(){

this._phase=FRAME_PHASE.BEGIN

this.commandCount=0

this.gpuSubmissionCount=0

this._emit('frameBegin',this.delta)

}

_phaseFixed(){

this._phase=FRAME_PHASE.FIXED

this.accumulator+=this.delta

let steps=0

while(this.accumulator>=this.fixedDelta){

this.scheduler?.fixedUpdate?.(
this.fixedDelta
)

this.systemManager?.fixedUpdate?.(
this.fixedDelta
)

this.accumulator-=this.fixedDelta

steps++

if(steps>=this.maxSubSteps){

this.accumulator=0
break

}

}

this.alpha=this.accumulator/this.fixedDelta

}

_phaseUpdate(){

this._phase=FRAME_PHASE.UPDATE

const dt=this.delta

this.scheduler?.update?.(dt)

this.systemManager?.update?.(dt)

this.environmentSystem?.update?.(dt)

this.cameraSystem?.update?.(dt)

this.sceneManager?.update?.(
dt,
this.time,
this.alpha
)

}

_phasePreRender(){

this._phase=FRAME_PHASE.PRE_RENDER

this.performanceMonitor?.update?.(
this.delta
)

const fps=this.performanceMonitor?.getFPS?.()
||this.targetFPS

this.performanceScaler?.update?.(
fps,
this.delta
)

this.memoryMonitor?.update?.(
this.delta
)

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

this._executeGPUSubmissionQueue()

this._updateHDRState()

}

_phaseEnd(){

this._phase=FRAME_PHASE.END

this.temporalBuffers.historyValid=true

this._emit('frameEnd')

}

_executeCommandQueue(){

const queue=this.commandQueue

for(let i=0;i<this.commandCount;i++){

const cmd=queue[i]

if(cmd){

try{cmd()}
catch(e){console.warn(e)}

queue[i]=null

}

}

this.commandCount=0

}

_executeGPUSubmissionQueue(){

const queue=this.gpuSubmissionQueue

for(let i=0;i<this.gpuSubmissionCount;i++){

const cmd=queue[i]

if(cmd){

try{cmd()}
catch(e){console.warn(e)}

queue[i]=null

}

}

this.gpuSubmissionCount=0

}

_updateHDRState(){

if(!this.pipeline)return

this.pipeline.currentExposure=
this.temporalStability.filteredExposure

this.pipeline.hdrEnabled=trueenqueueCommand(fn){

const index=this.commandCount

if(index>=this.commandQueue.length)return

this.commandQueue[index]=fn

this.commandCount=index+1

}

enqueueGPUCommand(fn){

const index=this.gpuSubmissionCount

if(index>=this.gpuSubmissionQueue.length)return

this.gpuSubmissionQueue[index]=fn

this.gpuSubmissionCount=index+1

}

_allocateMemory(bytes){

this.memoryState.allocated+=bytes

if(this.memoryState.allocated>
this.memoryState.peak)
this.memoryState.peak=
this.memoryState.allocated

}

_freeMemory(bytes){

this.memoryState.allocated-=bytes

if(this.memoryState.allocated<0)
this.memoryState.allocated=0

}

_allocateGPUMemory(bytes){

this.gpuMemory.allocated+=bytes

if(this.gpuMemory.allocated>
this.gpuMemory.peak)
this.gpuMemory.peak=
this.gpuMemory.allocated

}

_freeGPUMemory(bytes){

this.gpuMemory.allocated-=bytes

if(this.gpuMemory.allocated<0)
this.gpuMemory.allocated=0

}

_setCinematicCameraParameters(params={}){

const c=this.cameraPhysical

if(params.sensorWidth!==undefined)
c.sensorWidth=params.sensorWidth

if(params.sensorHeight!==undefined)
c.sensorHeight=params.sensorHeight

if(params.focalLength!==undefined)
c.focalLength=params.focalLength

if(params.aperture!==undefined)
c.aperture=params.aperture

if(params.shutterSpeed!==undefined)
c.shutterSpeed=params.shutterSpeed

if(params.ISO!==undefined)
c.ISO=params.ISO

if(params.focusDistance!==undefined){

this.focusState.target=
params.focusDistance

}

if(params.shutterAngle!==undefined)
c.shutterAngle=params.shutterAngle

}

_setCinematicFPS(fps){

if(!Number.isFinite(fps)||fps<=0)return

this.targetFPS=fps

this.frameInterval=1/fps

}

_setExecutionMode(mode){

this.executionMode=mode

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

this._emit('stop')

}

pause(){

if(this.paused)return

this.paused=true

this.clock.stop()

this.state=ENGINE_STATE.PAUSED

this._emit('pause')

}

resume(){

if(!this.paused)return

this.paused=false

this.clock.start()

this._lastNow=performance.now()

this.state=ENGINE_STATE.RUNNING

this._emit('resume')

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

this.gpuSubmissionQueue.fill(null)

this.resourceRegistry.clear()

this.initialized=false

this.destroyed=true

Engine.instance=null

this.state=ENGINE_STATE.DESTROYED

this._emit('shutdown')

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

try{fn(data)}
catch(e){console.warn(e)}

}

}

_random(){

this.randomState=
(this.randomState*1664525+
1013904223)|0

return(
(this.randomState>>>0)/
4294967296
)

}

getCinematicExposure(){

return this.temporalStability.filteredExposure

}

getPhysicalCamera(){

return this.cameraPhysical

}

getTemporalState(){

return this.temporalState

}

getTemporalHistory(){

return this.temporalHistory

}

getMemoryStats(){

return{
cpuAllocated:this.memoryState.allocated,
cpuPeak:this.memoryState.peak,
gpuAllocated:this.gpuMemory.allocated,
gpuPeak:this.gpuMemory.peak
}

}

getFrameStats(){

return{
frame:this.frame,
deterministicFrame:this.deterministicFrame,
time:this.time,
delta:this.delta,
smoothedDelta:this.framePacing.smoothed,
fps:1/this.delta
}

}

isRunning(){return this.running}

isInitialized(){return this.initialized}

isDestroyed(){return this.destroyed}

}

this.pipeline.acesEnabled=true

}
  
