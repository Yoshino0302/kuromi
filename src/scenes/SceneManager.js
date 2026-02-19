import { Logger } from '../utils/Logger.js'
export class SceneManager{
constructor(config={}){
this.renderer=config.renderer||null
this.resourceManager=config.resourceManager||null
this.gpuTracker=config.gpuTracker||null
this.memoryTracker=config.memoryTracker||null
this.activeScene=null
this.activeSceneInstance=null
this.sceneStack=[]
Logger.info('SceneManager created')}
async loadScene(SceneClass){
if(!SceneClass)throw new Error('SceneClass required')
if(this.activeSceneInstance)await this._unloadCurrentScene()
const sceneInstance=new SceneClass({
renderer:this.renderer,
resourceManager:this.resourceManager,
gpuTracker:this.gpuTracker,
memoryTracker:this.memoryTracker})
if(typeof sceneInstance.init==='function')await sceneInstance.init(sceneInstance.sceneWrapper)
this.activeSceneInstance=sceneInstance
this.activeScene=sceneInstance.getSceneWrapper()
this.sceneStack.push(sceneInstance)
Logger.info('Scene loaded: '+SceneClass.name)
return sceneInstance}
async switchScene(SceneClass){
return this.loadScene(SceneClass)}
async _unloadCurrentScene(){
if(!this.activeSceneInstance)return
if(typeof this.activeSceneInstance.destroy==='function')await this.activeSceneInstance.destroy()
const index=this.sceneStack.indexOf(this.activeSceneInstance)
if(index!==-1)this.sceneStack.splice(index,1)
Logger.info('Scene unloaded: '+this.activeSceneInstance.constructor.name)
this.activeSceneInstance=null
this.activeScene=null}
update(delta){
if(!this.activeSceneInstance)return
if(typeof this.activeSceneInstance.update==='function')this.activeSceneInstance.update(delta)}
getActiveScene(){
return this.activeScene}
getActiveSceneInstance(){
return this.activeSceneInstance}
async destroy(){
if(this.activeSceneInstance)await this._unloadCurrentScene()
this.sceneStack.length=0
Logger.info('SceneManager destroyed')}}
