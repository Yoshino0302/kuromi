import * as THREE from 'https://jspm.dev/three'
import { Renderer } from '../renderer/Renderer.js'
import { SceneManager } from '../scene/SceneManager.js'
import { CameraSystem } from '../camera/CameraSystem.js'
import { PerformanceMonitor } from '../systems/PerformanceMonitor.js'
import { PerformanceScaler } from '../systems/PerformanceScaler.js'

export class Engine{

constructor(options={}){

this.options=options
this.debug=options.debug===true
this.config=options.config||{}

this.state='constructed'
this.running=false
this.initialized=false
this.destroyed=false

this.clock=new THREE.Clock()
this.delta=0
this.time=0
this.frame=0

this.renderer=null
this.sceneManager=null
this.cameraSystem=null
this.performanceMonitor=null
this.performanceScaler=null

this._loopHandle=null
this._rafId=null

this._resizeObserver=null
this._boundResizeHandler=this._handleResize.bind(this)
this._boundVisibilityHandler=this._handleVisibilityChange.bind(this)

this._initPromise=null
this._shutdownPromise=null

this._eventListeners=new Set()

}

async init(){

if(this.initialized)return this
if(this._initPromise)return this._initPromise

this._initPromise=(async()=>{

this._emit('init:start')

this.renderer=new Renderer(this.options)
this.sceneManager=new SceneManager(this.options)
this.cameraSystem=new CameraSystem(this.options)

this.performanceMonitor=new PerformanceMonitor(this.options)

const rawRenderer=this.renderer.getRenderer?.()
if(rawRenderer){
this.performanceScaler=new PerformanceScaler(rawRenderer,this.options)
}

this._installResizeObserver()
this._installVisibilityHandler()

this.initialized=true
this.state='initialized'

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
this.state='running'

this.clock.start()

this._emit('start')

this._startLoop()

}

_stopLoop(){

if(this._rafId!==null){
cancelAnimationFrame(this._rafId)
this._rafId=null
}

this._loopHandle=null

}

_startLoop(){

if(this._loopHandle)return

this._loopHandle=(time)=>{

if(!this.running)return

this._rafId=requestAnimationFrame(this._loopHandle)

this._tick()

}

this._rafId=requestAnimationFrame(this._loopHandle)

}

_tick(){

this.delta=this.clock.getDelta()
this.time+=this.delta
this.frame++

this._emit('beforeUpdate',this.delta)

this.update(this.delta)

this._emit('afterUpdate',this.delta)

this._emit('beforeRender',this.delta)

this.render()

this._emit('afterRender',this.delta)

}

update(delta){

if(this.sceneManager?.update){
this.sceneManager.update(delta)
}

if(this.cameraSystem?.update){
this.cameraSystem.update(delta)
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
this.state='stopped'

this.clock.stop()

this._stopLoop()

this._emit('stop')

}

async shutdown(){

if(this.destroyed)return
if(this._shutdownPromise)return this._shutdownPromise

this._shutdownPromise=(async()=>{

this._emit('shutdown:start')

this.stop()

this._removeVisibilityHandler()
this._removeResizeObserver()

await this._disposeSubsystem(this.performanceScaler)
await this._disposeSubsystem(this.performanceMonitor)
await this._disposeSubsystem(this.cameraSystem)
await this._disposeSubsystem(this.sceneManager)
await this._disposeSubsystem(this.renderer)

this.performanceScaler=null
this.performanceMonitor=null
this.cameraSystem=null
this.sceneManager=null
this.renderer=null

this.destroyed=true
this.initialized=false
this.state='destroyed'

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

async _disposeSubsystem(system){

if(!system)return

if(typeof system.shutdown==='function'){
await system.shutdown()
}

if(typeof system.dispose==='function'){
system.dispose()
}

}

_handleResize(){

if(!this.renderer)return

this.renderer.resize?.()

this._emit('resize')

}

_installResizeObserver(){

window.addEventListener('resize',this._boundResizeHandler,{passive:true})

if(typeof ResizeObserver!=='undefined'&&this.renderer?.getCanvas){

const canvas=this.renderer.getCanvas()

if(canvas){

this._resizeObserver=new ResizeObserver(()=>{
this._handleResize()
})

this._resizeObserver.observe(canvas)

}

}

}

_removeResizeObserver(){

window.removeEventListener('resize',this._boundResizeHandler)

if(this._resizeObserver){
this._resizeObserver.disconnect()
this._resizeObserver=null
}

}

_handleVisibilityChange(){

if(document.visibilityState==='hidden'){

this.clock.stop()

}else if(document.visibilityState==='visible'&&this.running){

this.clock.start()

}

this._emit('visibility',document.visibilityState)

}

_installVisibilityHandler(){

document.addEventListener('visibilitychange',this._boundVisibilityHandler)

}

_removeVisibilityHandler(){

document.removeEventListener('visibilitychange',this._boundVisibilityHandler)

}

on(event,callback){

this._eventListeners.add({event,callback})

return()=>{
this._eventListeners.forEach(listener=>{
if(listener.callback===callback){
this._eventListeners.delete(listener)
}
})
}

}

_emit(event,data){

for(const listener of this._eventListeners){

if(listener.event===event){

try{
listener.callback(data)
}catch(e){
if(this.debug){
console.warn('[Engine event error]',e)
}
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

}
