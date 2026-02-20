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
this.debug=options.debug===true
this.cinematic=true

this.state=ENGINE_STATE.CONSTRUCTED

this.clock=new THREE.Clock(false)

this.time=0
this.delta=0
this.rawDelta=0
this.frame=0
this.alpha=0

this.timeScale=1
this.fixedDelta=1/60
this.maxDelta=0.1
this.minDelta=1e-6
this.accumulator=0
this.maxSubSteps=5

this.targetFPS=60
this.targetFrameTime=1/this.targetFPS

this.running=false
this.paused=false
this.initialized=false
this.destroyed=false
this.disposed=false

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

this.executionGraph=new Array(16)
this.executionGraphSize=0

this.frameHistory=new Float32Array(120)
this.frameHistoryIndex=0

this.exposureHistory=new Float32Array(64)
this.exposureIndex=0

this.commandQueue=new Array(1024)
this.commandCount=0

this.listeners=new Map()

this._rafId=0
this._loopActive=false

this._lastNow=0
this._frameStart=0
this._frameCPU=0
this._frameGPU=0

this._panic=false
this._phase=FRAME_PHASE.BEGIN

this._resizeObserver=null

this._boundTick=this._tick.bind(this)
this._boundResize=this._resize.bind(this)
this._boundVisibility=this._visibility.bind(this)

Object.seal(this)

}

async init(){

if(this.initialized)return this

this.state=ENGINE_STATE.INITIALIZING

this._emit('init:start')

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

this.performanceMonitor=new PerformanceMonitor({targetFPS:this.targetFPS,sampleInterval:0.25})

const rawRenderer=this.renderer.getRenderer?.()

if(rawRenderer){

this.performanceScaler=new PerformanceScaler(rawRenderer,{
targetFPS:this.targetFPS,
minFPS:24,
maxScale:1,
minScale:0.5
})

this.performanceScaler.attachPipeline?.(this.pipeline)

const size=this.renderer.getSize?.()

if(size)this.performanceScaler.setSize(size.width,size.height)

}

this._buildExecutionGraph()

this._installResize()
this._installVisibility()

this.initialized=true
this.destroyed=false
this.disposed=false

this.state=ENGINE_STATE.INITIALIZED

this._emit('init:complete')

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

async start(){

if(this.running)return

if(!this.initialized)await this.init()

this.running=true
this.paused=false

this.clock.start()

this._lastNow=performance.now()

this._startLoop()

this.state=ENGINE_STATE.RUNNING

this._emit('start')

}

pause(){

if(!this.running)return
if(this.paused)return

this.paused=true

this.clock.stop()

this.state=ENGINE_STATE.PAUSED

this._emit('pause')

}

resume(){

if(!this.running)return
if(!this.paused)return

this.paused=false

this.clock.start()

this._lastNow=performance.now()

this.state=ENGINE_STATE.RUNNING

this._emit('resume')

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

if(this.paused)return

this._tick(now)

}

this._rafId=requestAnimationFrame(loop)

}

_stopLoop(){

cancelAnimationFrame(this._rafId)

this._rafId=0

this._loopActive=false

}
  _tick(now){

this._frameStart=now

this.rawDelta=(now-this._lastNow)*0.001

this._lastNow=now

if(!Number.isFinite(this.rawDelta))this.rawDelta=0

if(this.rawDelta>this.maxDelta){
this.rawDelta=this.maxDelta
this._panic=true
this._emit('panic',this.rawDelta)
}

if(this.rawDelta<this.minDelta)this.rawDelta=this.minDelta

this.delta=this.rawDelta*this.timeScale

this._recordFrameTime(this.delta)

this._stabilizeFrameTime()

this.accumulator+=this.delta

this._runExecutionGraph()

this._frameCPU=(performance.now()-this._frameStart)*0.001

this.frame++

this.time+=this.delta

}

_runExecutionGraph(){

for(let i=0;i<this.executionGraphSize;i++){
this.executionGraph[i]()
}

}

_phaseBegin(){

this._phase=FRAME_PHASE.BEGIN

this.commandCount=0

this._emit('frame:begin',this.delta)

}

_phaseFixed(){

this._phase=FRAME_PHASE.FIXED

let subSteps=0

while(this.accumulator>=this.fixedDelta){

if(subSteps>=this.maxSubSteps){

this.accumulator=0

this._panic=true

this._emit('panic:spiral')

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

this._updateTemporalExposure()

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

this._emit('frame:rendered',this.delta)

}

_phaseEnd(){

this._phase=FRAME_PHASE.END

this._emit('frame:end',this.delta)

this._panic=false

}

_recordFrameTime(dt){

this.frameHistory[this.frameHistoryIndex]=dt

this.frameHistoryIndex++

if(this.frameHistoryIndex>=this.frameHistory.length){
this.frameHistoryIndex=0
}

}

_stabilizeFrameTime(){

let sum=0

const len=this.frameHistory.length

for(let i=0;i<len;i++){
sum+=this.frameHistory[i]
}

const avg=sum/len

if(avg<=0)return

const diff=this.delta-avg

this.delta-=diff*0.1

}

_updateTemporalExposure(){

const exposure=this.pipeline?.currentExposure||1

this.exposureHistory[this.exposureIndex]=exposure

this.exposureIndex++

if(this.exposureIndex>=this.exposureHistory.length){
this.exposureIndex=0
}

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

getAverageFrameTime(){

let sum=0

for(let i=0;i<this.frameHistory.length;i++){
sum+=this.frameHistory[i]
}

return sum/this.frameHistory.length

}

getAverageExposure(){

let sum=0

for(let i=0;i<this.exposureHistory.length;i++){
sum+=this.exposureHistory[i]
}

return sum/this.exposureHistory.length

}
  _resize(){

const renderer=this.renderer

if(!renderer)return

renderer.resize?.()

const size=renderer.getSize?.()

if(size){

this.pipeline?.resize?.(size.width,size.height)

this.performanceScaler?.setSize?.(size.width,size.height)

}

this.enqueueCommand(()=>{

this._emit('resize',size)

})

}

_visibility(){

if(document.visibilityState==='hidden'){

this.pause()

}else{

this.resume()

}

this._emit('visibility',document.visibilityState)

}

_installResize(){

window.addEventListener('resize',this._boundResize,{passive:true})

const canvas=this.renderer?.getCanvas?.()

if(canvas&&typeof ResizeObserver!=='undefined'){

this._resizeObserver=new ResizeObserver(this._boundResize)

this._resizeObserver.observe(canvas)

}

}

_removeResize(){

window.removeEventListener('resize',this._boundResize)

if(this._resizeObserver){

this._resizeObserver.disconnect()

this._resizeObserver=null

}

}

_installVisibility(){

document.addEventListener('visibilitychange',this._boundVisibility)

}

_removeVisibility(){

document.removeEventListener('visibilitychange',this._boundVisibility)

}

stop(){

if(!this.running)return

this.running=false

this.paused=false

this.clock.stop()

this._stopLoop()

this.state=ENGINE_STATE.STOPPED

this._emit('stop')

}

async shutdown(){

if(this.destroyed)return

this.state=ENGINE_STATE.SHUTTING_DOWN

this._emit('shutdown:start')

this.stop()

this._removeResize()

this._removeVisibility()

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

this.initialized=false
this.destroyed=true
this.disposed=true

Engine.instance=null

this.state=ENGINE_STATE.DESTROYED

this._emit('shutdown:complete')

}

async restart(){

await this.shutdown()

this.destroyed=false
this.disposed=false

await this.init()

await this.start()

}

async _dispose(system){

if(!system)return

try{

await system.dispose?.()

}catch(e){

if(this.debug){

console.warn('[ENGINE DISPOSE ERROR]',e)

}

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

if(this.debug){

console.warn('[ENGINE EVENT ERROR]',e)

}

}

}

}

setTimeScale(scale){

if(!Number.isFinite(scale))return

this.timeScale=Math.max(0,scale)

this._emit('timescale',this.timeScale)

}

getRenderer(){return this.renderer}
getPipeline(){return this.pipeline}
getScene(){return this.sceneManager?.getScene?.()}
getCamera(){return this.cameraSystem?.getCamera?.()}
getFrame(){return this.frame}
getTime(){return this.time}
getDelta(){return this.delta}
getAlpha(){return this.alpha}
getFPS(){return this.performanceMonitor?.getFPS?.()||0}
getExposure(){return this.pipeline?.currentExposure||1}
getAverageExposure(){return this.getAverageExposure?.()}
getState(){return this.state}
isRunning(){return this.running}
isPaused(){return this.paused}
isInitialized(){return this.initialized}
isDestroyed(){return this.destroyed}
isDisposed(){return this.disposed}

}
