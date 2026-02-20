import * as THREE from 'https://jspm.dev/three'
import {Renderer} from '../renderer/Renderer.js'
import {RenderPipeline} from '../renderer/RenderPipeline.js'
import {SceneManager} from '../scene/SceneManager.js'
import {CameraSystem} from '../camera/CameraSystem.js'
import {PerformanceMonitor} from '../systems/PerformanceMonitor.js'
import {PerformanceScaler} from '../systems/PerformanceScaler.js'
import {SystemManager} from '../systems/SystemManager.js'
import {TaskScheduler} from '../systems/TaskScheduler.js'
import {MemoryMonitor} from '../systems/MemoryMonitor.js'
import {AssetManager} from '../assets/AssetManager.js'
import {EnvironmentSystem} from '../world/EnvironmentSystem.js'

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

export class Engine{

static instance=null

static getInstance(options){
if(!Engine.instance){
Engine.instance=new Engine(options)
}
return Engine.instance
}

constructor(options={}){

if(Engine.instance){
return Engine.instance
}

Engine.instance=this

this.options=options||{}
this.debug=options.debug===true
this.config=options.config||{}

this.state=ENGINE_STATE.CONSTRUCTED

this.running=false
this.initialized=false
this.destroyed=false
this.paused=false

this.clock=new THREE.Clock(false)

this.delta=0
this.time=0
this.frame=0

this.maxDelta=0.05
this.minDelta=0.000001

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

this._rafId=0
this._loopActive=false

this._initPromise=null
this._shutdownPromise=null

this._listeners=new Map()

this._resizeObserver=null

this._boundTick=this._tick.bind(this)
this._boundResize=this._handleResize.bind(this)
this._boundVisibility=this._handleVisibility.bind(this)

this._lastNow=0

Object.seal(this)

}

async init(){

if(this.initialized)return this
if(this._initPromise)return this._initPromise

this._initPromise=(async()=>{

this.state=ENGINE_STATE.INITIALIZING

this._emit('init:start')

this.renderer=new Renderer({...this.options,engine:this})

this.pipeline=new RenderPipeline(this)

this.cameraSystem=new CameraSystem({...this.options,engine:this})

this.sceneManager=new SceneManager({...this.options,engine:this})

this.environmentSystem=new EnvironmentSystem(this)

this.systemManager=new SystemManager(this)

this.scheduler=new TaskScheduler(this)

this.memoryMonitor=new MemoryMonitor(this)

this.assetManager=new AssetManager(this)

await this.pipeline?.init?.()
await this.sceneManager?.init?.()
await this.environmentSystem?.init?.()
await this.systemManager?.init?.()
await this.scheduler?.init?.()
await this.assetManager?.init?.()

this.performanceMonitor=new PerformanceMonitor({
targetFPS:60,
sampleInterval:0.25
})

const rawRenderer=this.renderer.getRenderer?.()

if(rawRenderer){

this.performanceScaler=new PerformanceScaler(
rawRenderer,
{
targetFPS:60,
minFPS:30,
maxScale:1,
minScale:0.5
}
)

this.performanceScaler.attachPipeline?.(this.pipeline)

const size=this.renderer.getSize?.()

if(size){

this.performanceScaler.setSize(size.width,size.height)

}

}

this._installResize()
this._installVisibility()

this.initialized=true
this.destroyed=false

this.state=ENGINE_STATE.INITIALIZED

this._emit('init:complete')

return this

})()

return this._initPromise

}

async start(){

if(this.destroyed)return
if(this.running)return

if(!this.initialized){
await this.init()
}

this.running=true
this.paused=false

this.clock.start()

this._lastNow=performance.now()

this.state=ENGINE_STATE.RUNNING

this._emit('start')

this._startLoop()

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

if(this._rafId){
cancelAnimationFrame(this._rafId)
this._rafId=0
}

this._loopActive=false

}

_tick(now){

let delta=(now-this._lastNow)*0.001

this._lastNow=now

if(!Number.isFinite(delta))delta=0

if(delta>this.maxDelta)delta=this.maxDelta
if(delta<this.minDelta)delta=this.minDelta

this.delta=delta
this.time+=delta
this.frame++

this._emit('frame:start',delta)

this.scheduler?.update?.(delta)

this.systemManager?.update?.(delta)

this.environmentSystem?.update?.(delta)

this.cameraSystem?.update?.(delta)

this.sceneManager?.update?.(delta,this.time)

const fps=this.performanceMonitor?.update?.(delta)

this.performanceScaler?.update?.(fps,delta)

this.memoryMonitor?.update?.(delta)

this._emit('frame:update',delta)

this._render(delta)

this._emit('frame:end',delta)

}

_render(){

const renderer=this.renderer
const scene=this.sceneManager?.getScene?.()
const camera=this.cameraSystem?.getCamera?.()

if(!renderer||!scene||!camera)return

if(this.pipeline?.render){

this.pipeline.render(renderer,scene,camera,this.delta)

}else{

renderer.render(scene,camera)

}

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
if(this._shutdownPromise)return this._shutdownPromise

this._shutdownPromise=(async()=>{

this.state=ENGINE_STATE.SHUTTING_DOWN

this._emit('shutdown:start')

this.stop()

this._removeResize()
this._removeVisibility()

await this._dispose(this.assetManager)
await this._dispose(this.scheduler)
await this._dispose(this.systemManager)
await this._dispose(this.environmentSystem)
await this._dispose(this.pipeline)
await this._dispose(this.sceneManager)
await this._dispose(this.cameraSystem)
await this._dispose(this.renderer)
await this._dispose(this.performanceScaler)
await this._dispose(this.performanceMonitor)

this.initialized=false
this.destroyed=true

this.state=ENGINE_STATE.DESTROYED

this._emit('shutdown:complete')

})()

return this._shutdownPromise

}

async restart(){

await this.shutdown()

this.destroyed=false

await this.init()

await this.start()

}

async _dispose(system){

if(!system)return

try{
await system?.dispose?.()
}catch(e){

if(this.debug){
console.warn('[ENGINE DISPOSE ERROR]',e)
}

}

}

_handleResize(){

this.renderer?.resize?.()

const size=this.renderer?.getSize?.()

if(size){

this.performanceScaler?.setSize?.(
size.width,
size.height
)

}

this._emit('resize')

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

this._resizeObserver?.disconnect?.()

this._resizeObserver=null

}

_handleVisibility(){

if(document.visibilityState==='hidden'){
this.pause()
}else{
this.resume()
}

this._emit('visibility',document.visibilityState)

}

_installVisibility(){

document.addEventListener('visibilitychange',this._boundVisibility)

}

_removeVisibility(){

document.removeEventListener('visibilitychange',this._boundVisibility)

}

on(event,callback){

if(!this._listeners.has(event)){
this._listeners.set(event,new Set())
}

const set=this._listeners.get(event)

set.add(callback)

return()=>set.delete(callback)

}

_emit(event,data){

const set=this._listeners.get(event)

if(!set)return

for(const cb of set){

try{
cb(data)
}catch(e){

if(this.debug){
console.warn('[ENGINE EVENT ERROR]',e)
}

}

}

}

getRenderer(){return this.renderer}
getScene(){return this.sceneManager?.getScene?.()}
getCamera(){return this.cameraSystem?.getCamera?.()}
getPerformance(){return this.performanceMonitor?.getMetrics?.()}
getScale(){return this.performanceScaler?.getScale?.()??1}
getTime(){return this.time}
getFrame(){return this.frame}
getState(){return this.state}
isRunning(){return this.running}
isPaused(){return this.paused}
isInitialized(){return this.initialized}
isDestroyed(){return this.destroyed}

}
