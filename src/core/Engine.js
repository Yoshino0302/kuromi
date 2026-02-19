import * as THREE from 'https://jspm.dev/three'
import { Renderer } from '../renderer/Renderer.js'
import { SceneManager } from '../scene/SceneManager.js'
import { CameraSystem } from '../camera/CameraSystem.js'
import { PerformanceMonitor } from '../systems/PerformanceMonitor.js'
import { PerformanceScaler } from '../systems/PerformanceScaler.js'

const ENGINE_STATE={
CONSTRUCTED:0,
INITIALIZING:1,
INITIALIZED:2,
RUNNING:3,
STOPPED:4,
SHUTTING_DOWN:5,
DESTROYED:6
}

export class Engine{

constructor(options={}){

this.options=options
this.debug=options.debug===true
this.config=options.config||{}

this.state=ENGINE_STATE.CONSTRUCTED

this.running=false
this.initialized=false
this.destroyed=false

this.clock=new THREE.Clock(false)

this.delta=0
this.time=0
this.frame=0

this.maxDelta=0.1
this.minDelta=0.00001

this.renderer=null
this.sceneManager=null
this.cameraSystem=null
this.performanceMonitor=null
this.performanceScaler=null

this._rafId=null
this._loop=null

this._initPromise=null
this._shutdownPromise=null

this._listeners=new Map()

this._boundTick=this._tick.bind(this)
this._boundResize=this._handleResize.bind(this)
this._boundVisibility=this._handleVisibility.bind(this)

this._resizeObserver=null

}

async init(){

if(this.initialized)return this
if(this._initPromise)return this._initPromise

this._initPromise=(async()=>{

this.state=ENGINE_STATE.INITIALIZING

this._emit('init:start')

this.renderer=new Renderer(this.options)

this.cameraSystem=new CameraSystem(this.options)

this.sceneManager=new SceneManager({
renderer:this.renderer,
camera:this.cameraSystem.getCamera(),
options:this.options
})

this.performanceMonitor=new PerformanceMonitor(this.options)

const rawRenderer=this.renderer.getRenderer?.()

if(rawRenderer){

this.performanceScaler=new PerformanceScaler(
rawRenderer,
this.options
)

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
this.state=ENGINE_STATE.RUNNING

this.clock.start()

this._emit('start')

this._startLoop()

}

_startLoop(){

if(this._loop)return

this._loop=(t)=>{

if(!this.running)return

this._rafId=requestAnimationFrame(this._loop)

this._boundTick()

}

this._rafId=requestAnimationFrame(this._loop)

}

_stopLoop(){

if(this._rafId!==null){

cancelAnimationFrame(this._rafId)

this._rafId=null

}

this._loop=null

}

_tick(){

let delta=this.clock.getDelta()

if(delta>this.maxDelta)delta=this.maxDelta
if(delta<this.minDelta)delta=this.minDelta

this.delta=delta
this.time+=delta
this.frame++

this._emit('frame:start',delta)

this.update(delta)

this._emit('frame:update',delta)

this.render(delta)

this._emit('frame:render',delta)

this._emit('frame:end',delta)

}

update(delta){

if(this.cameraSystem?.update){

this.cameraSystem.update(delta)

}

if(this.sceneManager?.update){

this.sceneManager.update(delta)

}

if(this.performanceMonitor){

const fps=this.performanceMonitor.update(delta)

if(this.performanceScaler?.update){

this.performanceScaler.update(fps)

}

}

}

render(){

if(!this.renderer)return

const scene=this.sceneManager?.getScene?.()
const camera=this.cameraSystem?.getCamera?.()

if(!scene||!camera)return

this.renderer.render(scene,camera)

}

stop(){

if(!this.running)return

this.running=false

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

await this._dispose(this.performanceScaler)
await this._dispose(this.performanceMonitor)
await this._dispose(this.sceneManager)
await this._dispose(this.cameraSystem)
await this._dispose(this.renderer)

this.performanceScaler=null
this.performanceMonitor=null
this.sceneManager=null
this.cameraSystem=null
this.renderer=null

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

if(system.shutdown){

await system.shutdown()

}

if(system.dispose){

system.dispose()

}

}

_handleResize(){

if(!this.renderer)return

this.renderer.resize?.()

this._emit('resize')

}

_installResize(){

window.addEventListener(
'resize',
this._boundResize,
{passive:true}
)

if(typeof ResizeObserver!=='undefined'){

const canvas=this.renderer?.getCanvas?.()

if(canvas){

this._resizeObserver=new ResizeObserver(
this._boundResize
)

this._resizeObserver.observe(canvas)

}

}

}

_removeResize(){

window.removeEventListener(
'resize',
this._boundResize
)

if(this._resizeObserver){

this._resizeObserver.disconnect()

this._resizeObserver=null

}

}

_handleVisibility(){

if(document.visibilityState==='hidden'){

this.clock.stop()

}else{

if(this.running){

this.clock.start()

}

}

this._emit(
'visibility',
document.visibilityState
)

}

_installVisibility(){

document.addEventListener(
'visibilitychange',
this._boundVisibility
)

}

_removeVisibility(){

document.removeEventListener(
'visibilitychange',
this._boundVisibility
)

}

on(event,callback){

if(!this._listeners.has(event)){

this._listeners.set(event,new Set())

}

const set=this._listeners.get(event)

set.add(callback)

return()=>{

set.delete(callback)

}

}

_emit(event,data){

const set=this._listeners.get(event)

if(!set)return

for(const cb of set){

try{

cb(data)

}catch(e){

if(this.debug){

console.warn(
'[KUROMI ENGINE EVENT ERROR]',
e
)

}

}

}

}

getRenderer(){

return this.renderer

}

getScene(){

return this.sceneManager?.getScene?.()

}

getCamera(){

return this.cameraSystem?.getCamera?.()

}

isRunning(){

return this.running

}

isInitialized(){

return this.initialized

}

isDestroyed(){

return this.destroyed

}

getState(){

return this.state

}

}
