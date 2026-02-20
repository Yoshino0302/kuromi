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

/* =========================
NEW KERNEL ADDITIONS (NON-BREAKING)
========================= */

class EngineKernelClock{
constructor(engine){
this.engine=engine
this.last=0
this.delta=0
this.time=0
}
reset(now){
this.last=now
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

class EngineFramePacer{
constructor(){
this.enabled=false
this.targetFPS=60
this.frameDuration=1000/60
this.last=0
}
setFPS(fps){
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

class EngineThreadManager{
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

class EngineSubsystemRegistry{
constructor(){
this.systems=new Map()
}
register(name,system){
this.systems.set(name,system)
}
get(name){
return this.systems.get(name)
}
dispose(){
this.systems.clear()
}
}

class EngineRenderIsolation{
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

/* =========================
ENGINE (ORIGINAL + SAFE MERGE)
========================= */

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
this.config=options.config||{}

this.state=ENGINE_STATE.CONSTRUCTED

this.running=false
this.initialized=false
this.destroyed=false
this.paused=false
this._disposed=false

/* ORIGINAL CLOCK (KEEP) */
this.clock=new THREE.Clock(false)

/* NEW KERNEL CLOCK (ADD) */
this.kernelClock=new EngineKernelClock(this)

/* NEW KERNEL SYSTEMS (ADD) */
this.threadManager=new EngineThreadManager()
this.subsystemRegistry=new EngineSubsystemRegistry()
this.framePacer=new EngineFramePacer()
this.renderIsolation=new EngineRenderIsolation(this)

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

this.deterministic=options.deterministic===true
this.lockStep=options.lockStep===true
this.fixedSeed=options.fixedSeed??0

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
this._disabledSystems=new WeakSet()

this._resizeObserver=null

this._lastNow=0
this._panic=false

this._boundTick=this._tick.bind(this)
this._boundResize=this._handleResize.bind(this)
this._boundVisibility=this._handleVisibility.bind(this)

Object.seal(this)

}

/* =========================
INIT (UNCHANGED + REGISTRY ADD)
========================= */

async init(){

if(this.initialized)return this
if(this._initPromise)return this._initPromise

this._initPromise=(async()=>{

this.state=ENGINE_STATE.INITIALIZING
this._emit('init:start')

if(this.deterministic){
this._initDeterministicSeed(this.fixedSeed)
}

this.renderer=new Renderer({...this.options,engine:this})
this.pipeline=new RenderPipeline(this)
this.cameraSystem=new CameraSystem({...this.options,engine:this})
this.sceneManager=new SceneManager({...this.options,engine:this})
this.environmentSystem=new EnvironmentSystem(this)
this.systemManager=new SystemManager(this)
this.scheduler=new TaskScheduler(this)
this.memoryMonitor=new MemoryMonitor(this)
this.assetManager=new AssetManager(this)

/* REGISTER SYSTEMS */
this.subsystemRegistry.register('renderer',this.renderer)
this.subsystemRegistry.register('pipeline',this.pipeline)
this.subsystemRegistry.register('scene',this.sceneManager)
this.subsystemRegistry.register('camera',this.cameraSystem)

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
this._disposed=false

this.state=ENGINE_STATE.INITIALIZED

this._emit('init:complete')

return this

})()

return this._initPromise

}

/* =========================
TICK (ONLY SAFE ADDITIONS)
========================= */

_tick(now){

/* KERNEL CLOCK UPDATE (NON-BREAKING ADD) */
this.kernelClock.update(now)

/* ORIGINAL LOGIC UNCHANGED */

let delta

if(this.lockStep){
delta=this.fixedDelta
}else{
delta=(now-this._lastNow)*0.001
}

this._lastNow=now

if(!Number.isFinite(delta))delta=0

if(delta>this.maxDelta){
delta=this.maxDelta
this._panic=true
this._emit('panic',delta)
}

if(delta<this.minDelta)delta=this.minDelta

delta*=this.timeScale

this.delta=delta
this.time+=delta
this.frame++

this.accumulator+=delta

let subSteps=0

this._emit('frame:start',delta)

while(this.accumulator>=this.fixedDelta){

if(subSteps>=this.maxSubSteps){

this.accumulator=0
this._panic=true

this._emit('panic:spiral')

break

}

this._emit('frame:fixed',this.fixedDelta)

this._safeCall(this.scheduler,'fixedUpdate',this.fixedDelta)
this._safeCall(this.systemManager,'fixedUpdate',this.fixedDelta)

this.accumulator-=this.fixedDelta

subSteps++

}

this.alpha=this.accumulator/this.fixedDelta

this._emit('frame:update',delta)

this._safeCall(this.scheduler,'update',delta)
this._safeCall(this.systemManager,'update',delta)
this._safeCall(this.environmentSystem,'update',delta)
this._safeCall(this.cameraSystem,'update',delta)
this._safeCall(this.sceneManager,'update',delta,this.time,this.alpha)

this._emit('frame:late',delta)

this._safeCall(this.systemManager,'lateUpdate',delta)

const fps=this._safeCall(this.performanceMonitor,'update',delta)||0

this._safeCall(this.performanceScaler,'update',fps,delta)
this._safeCall(this.memoryMonitor,'update',delta)

this._emit('frame:render',delta)

/* RENDER ISOLATION ADD */
this.renderIsolation.exec(()=>{
this._render(delta,this.alpha)
})

this._emit('frame:end',delta)

this._panic=false

}

/* =========================
SHUTDOWN ADDITIONS
========================= */

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

/* NEW DISPOSALS */
this.threadManager.dispose()
this.subsystemRegistry.dispose()

this.initialized=false
this.destroyed=true
this._disposed=true

Engine.instance=null

this.state=ENGINE_STATE.DESTROYED

this._emit('shutdown:complete')

})()

return this._shutdownPromise

}

/* REST OF ORIGINAL FILE UNCHANGED */

}
