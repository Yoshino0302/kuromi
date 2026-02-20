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

class KernelClock{
constructor(engine){
this.engine=engine
this.time=0
this.delta=0
this.last=0
}
reset(now){
this.last=now||performance.now()
}
update(now){
let delta=(now-this.last)*0.001
this.last=now
if(delta>this.engine.maxDelta)delta=this.engine.maxDelta
if(delta<this.engine.minDelta)delta=this.engine.minDelta
this.delta=delta*this.engine.timeScale
this.time+=this.delta
return this.delta
}
}

class FramePacer{
constructor(){
this.enabled=false
this.targetFPS=60
this.frameDuration=1000/60
this.last=0
}
setTargetFPS(fps){
this.targetFPS=fps
this.frameDuration=1000/fps
}
begin(now){
if(!this.enabled)return true
if(now-this.last>=this.frameDuration){
this.last=now
return true
}
return false
}
}

class ThreadManager{
constructor(){
this.workers=new Set()
}
create(url){
const w=new Worker(url,{type:'module'})
this.workers.add(w)
return w
}
dispose(){
for(const w of this.workers)w.terminate()
this.workers.clear()
}
}

class SubsystemRegistry{
constructor(){
this.systems=[]
}
register(system,priority=0){
this.systems.push({system,priority})
this.systems.sort((a,b)=>a.priority-b.priority)
}
update(delta){
for(const s of this.systems){
s.system?.update?.(delta)
}
}
dispose(){
this.systems.length=0
}
}

class RenderIsolation{
constructor(engine){
this.engine=engine
}
exec(fn){
try{
fn()
}catch(e){
this.engine._emit('render:error',e)
if(this.engine.debug)console.warn(e)
}
}
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

if(Engine.instance)return Engine.instance
Engine.instance=this

this.options=options||{}
this.debug=options.debug===true

this.state=ENGINE_STATE.CONSTRUCTED

this.running=false
this.initialized=false
this.destroyed=false
this.paused=false

this.clock=new THREE.Clock(false)

this.kernelClock=new KernelClock(this)
this.framePacer=new FramePacer()
this.threadManager=new ThreadManager()
this.subsystemRegistry=new SubsystemRegistry()
this.renderIsolation=new RenderIsolation(this)

this.delta=0
this.time=0
this.frame=0

this.timeScale=1

this.fixedDelta=1/60
this.accumulator=0
this.alpha=0
this.maxSubSteps=10

this.maxDelta=0.25
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
this._lastNow=0

this._listeners=new Map()

this._resizeObserver=null

this._boundTick=this._tick.bind(this)
this._boundResize=this._handleResize.bind(this)
this._boundVisibility=this._handleVisibility.bind(this)

Object.seal(this)

}

/* INIT FULL */

async init(){

if(this.initialized)return
if(this.state===ENGINE_STATE.INITIALIZING)return

this.state=ENGINE_STATE.INITIALIZING

this._emit('init:start')

this.assetManager=new AssetManager(this)

this.renderer=new Renderer(this.options.renderer||{})
await this.renderer.init?.()

this.pipeline=new RenderPipeline(this)
await this.pipeline.init?.()

this.sceneManager=new SceneManager(this)
await this.sceneManager.init?.()

this.cameraSystem=new CameraSystem(this)
await this.cameraSystem.init?.()

this.systemManager=new SystemManager(this)
await this.systemManager.init?.()

this.scheduler=new TaskScheduler(this)
await this.scheduler.init?.()

this.environmentSystem=new EnvironmentSystem(this)
await this.environmentSystem.init?.()

this.performanceMonitor=new PerformanceMonitor(this)
await this.performanceMonitor.init?.()

this.performanceScaler=new PerformanceScaler(this)
await this.performanceScaler.init?.()

this.memoryMonitor=new MemoryMonitor(this)
await this.memoryMonitor.init?.()

this._setupResize()
this._setupVisibility()

this.initialized=true

this.state=ENGINE_STATE.INITIALIZED

this._emit('init:complete')

}

/* START */

async start(){

if(this.running)return

if(!this.initialized){
await this.init()
}

this.running=true
this.paused=false

this.clock.start()

this._lastNow=performance.now()

this.kernelClock.reset(this._lastNow)

this.state=ENGINE_STATE.RUNNING

this._emit('start')

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

if(this.paused)return

if(!this.framePacer.begin(now))return

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

/* MAIN TICK */

_tick(now){

const delta=this.kernelClock.update(now)

this.delta=delta
this.time=this.kernelClock.time
this.frame++

this.accumulator+=delta

let steps=0

this._emit('frame:start',delta)

while(this.accumulator>=this.fixedDelta){

if(steps>=this.maxSubSteps){

this.accumulator=0

this._emit('panic')

break

}

this._emit('frame:fixed',this.fixedDelta)

this._safeCall(this.scheduler,'fixedUpdate',this.fixedDelta)

this._safeCall(this.systemManager,'fixedUpdate',this.fixedDelta)

steps++

this.accumulator-=this.fixedDelta

}

this.alpha=this.accumulator/this.fixedDelta

this._emit('frame:update',delta)

this._safeCall(this.scheduler,'update',delta)

this._safeCall(this.systemManager,'update',delta)

this._safeCall(this.environmentSystem,'update',delta)

this._safeCall(this.cameraSystem,'update',delta)

this._safeCall(this.sceneManager,'update',delta,this.time,this.alpha)

this.subsystemRegistry.update(delta)

this._safeCall(this.systemManager,'lateUpdate',delta)

const fps=this.performanceMonitor?.update?.(delta)||0

this.performanceScaler?.update?.(fps,delta)

this.memoryMonitor?.update?.(delta)

this._emit('frame:render',delta)

this._render(delta,this.alpha)

this._emit('frame:end',delta)

}

/* RENDER */

_render(delta,alpha){

const renderer=this.renderer
const scene=this.sceneManager?.getScene?.()
const camera=this.cameraSystem?.getCamera?.()

if(!renderer||!scene||!camera)return

this.renderIsolation.exec(()=>{

if(this.pipeline?.render){

this.pipeline.render(renderer,scene,camera,delta,alpha)

}else{

renderer.render(scene,camera)

}

})

}

/* SAFE CALL */

_safeCall(obj,method,...args){

if(!obj)return

const fn=obj?.[method]

if(!fn)return

try{

return fn.apply(obj,args)

}catch(e){

this._emit('system:error',{system:obj,error:e})

if(this.debug){
console.warn('[ENGINE SYSTEM ERROR]',method,e)
}

}

}

/* STOP */

stop(){

if(!this.running)return

this.running=false

this.clock.stop()

this._stopLoop()

this.state=ENGINE_STATE.STOPPED

this._emit('stop')

}

/* PAUSE */

pause(){

if(!this.running)return
if(this.paused)return

this.paused=true

this.clock.stop()

this.state=ENGINE_STATE.PAUSED

this._emit('pause')

}

/* RESUME */

resume(){

if(!this.running)return
if(!this.paused)return

this.paused=false

this.clock.start()

this._lastNow=performance.now()

this.kernelClock.reset(this._lastNow)

this.state=ENGINE_STATE.RUNNING

this._emit('resume')

}

/* SHUTDOWN */

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

await this._dispose(this.memoryMonitor)

await this._dispose(this.renderer)

this.threadManager.dispose()

this.subsystemRegistry.dispose()

this.initialized=false

this.destroyed=true

Engine.instance=null

this.state=ENGINE_STATE.DESTROYED

this._emit('shutdown:complete')

}

/* DISPOSE */

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

/* RESIZE */

_handleResize(){

this.renderer?.resize?.()

const size=this.renderer?.getSize?.()

if(size){

this.performanceScaler?.setSize?.(size.width,size.height)

}

this._emit('resize')

}

_setupResize(){

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

/* VISIBILITY */

_handleVisibility(){

if(document.visibilityState==='hidden'){

this.pause()

}else{

this.resume()

}

this._emit('visibility',document.visibilityState)

}

_setupVisibility(){

document.addEventListener('visibilitychange',this._boundVisibility)

}

_removeVisibility(){

document.removeEventListener('visibilitychange',this._boundVisibility)

}

/* EVENTS */

on(event,callback){

if(!this._listeners.has(event)){

this._listeners.set(event,new Set())

}

const set=this._listeners.get(event)

set.add(callback)

return()=>set.delete(callback)

}

off(event,callback){

const set=this._listeners.get(event)

if(!set)return

set.delete(callback)

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

/* GETTERS */

getRenderer(){return this.renderer}
getScene(){return this.sceneManager?.getScene?.()}
getCamera(){return this.cameraSystem?.getCamera?.()}
getPerformance(){return this.performanceMonitor?.getMetrics?.()}
getScale(){return this.performanceScaler?.getScale?.()??1}
getTime(){return this.time}
getFrame(){return this.frame}
getState(){return this.state}
getTimeScale(){return this.timeScale}
getInterpolationAlpha(){return this.alpha}
isRunning(){return this.running}
isPaused(){return this.paused}
isInitialized(){return this.initialized}
isDestroyed(){return this.destroyed}

}
