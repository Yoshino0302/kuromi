import { Renderer } from '../renderer/Renderer.js'
import { SceneManager } from '../scenes/SceneManager.js'
import { ResourceManager } from '../systems/ResourceManager.js'
import { GPUResourceTracker } from '../systems/GPUResourceTracker.js'
import { MemoryTracker } from '../systems/MemoryTracker.js'
import { Logger } from '../utils/Logger.js'
export class EngineCore{
constructor(config={}){
this.canvas=config.canvas||document.querySelector('canvas')
this.renderer=new Renderer({canvas:this.canvas})
this.gpuTracker=new GPUResourceTracker()
this.memoryTracker=new MemoryTracker()
this.resourceManager=new ResourceManager({gpuTracker:this.gpuTracker})
this.sceneManager=new SceneManager({engine:this,renderer:this.renderer.getThreeRenderer(),resourceManager:this.resourceManager,gpuTracker:this.gpuTracker,memoryTracker:this.memoryTracker})
this.running=false
this.destroyed=false
this._boundLoop=this._loop.bind(this)
Logger.info('EngineCore constructed')}
async loadScene(SceneClass,config={}){
if(this.destroyed)return
await this.sceneManager.loadScene(SceneClass,config)}
start(){
if(this.destroyed)return
if(this.running)return
this.running=true
requestAnimationFrame(this._boundLoop)
Logger.info('EngineCore started')}
_loop(time){
if(!this.running||this.destroyed)return
const delta=time*0.001
this.sceneManager.update(delta)
const sceneWrapper=this.sceneManager.getSceneWrapper()
if(sceneWrapper)this.renderer.render(sceneWrapper)
requestAnimationFrame(this._boundLoop)}
resize(width,height){
if(this.destroyed)return
this.renderer.setSize(width,height)
this.sceneManager.resize(width,height)}
async destroy(){
if(this.destroyed)return
this.running=false
await this.sceneManager.destroy()
await this.renderer.destroy()
await this.resourceManager.destroy()
await this.gpuTracker.destroy()
if(this.memoryTracker&&typeof this.memoryTracker.destroy==='function')await this.memoryTracker.destroy()
this.destroyed=true
Logger.info('EngineCore destroyed')}}
