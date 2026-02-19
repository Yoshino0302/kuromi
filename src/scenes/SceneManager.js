import { Logger } from '../utils/Logger.js'
export class SceneManager{
constructor(config={}){
this.engine=config.engine||null
this.renderer=config.renderer||null
this.resourceManager=config.resourceManager||null
this.gpuTracker=config.gpuTracker||null
this.memoryTracker=config.memoryTracker||null
this.currentScene=null
this.currentSceneWrapper=null
this.loading=false
this.destroyed=false
Logger.info('SceneManager constructed')}
async loadScene(SceneClass,config={}){
if(this.destroyed)return
if(this.loading)return
this.loading=true
const previousScene=this.currentScene
try{
if(previousScene){
await previousScene.destroy()
this.currentScene=null
this.currentSceneWrapper=null}
const sceneInstance=new SceneClass({renderer:this.renderer,resourceManager:this.resourceManager,gpuTracker:this.gpuTracker,memoryTracker:this.memoryTracker,...config})
if(!sceneInstance)throw new Error('Scene instantiation failed')
const sceneWrapper=sceneInstance.getSceneWrapper()
if(!sceneWrapper||!sceneWrapper.scene||!sceneWrapper.camera||!sceneWrapper.renderer)throw new Error('Invalid sceneWrapper invariant')
await sceneInstance.init(sceneWrapper)
this.currentScene=sceneInstance
this.currentSceneWrapper=sceneWrapper
Logger.info('Scene loaded: '+SceneClass.name)}
catch(err){
Logger.error('Scene load failed',err)
if(previousScene){
this.currentScene=previousScene
this.currentSceneWrapper=previousScene.getSceneWrapper()}}
finally{
this.loading=false}}
update(delta){
if(this.destroyed)return
if(!this.currentScene)return
this.currentScene.update(delta)}
resize(width,height){
if(this.destroyed)return
if(!this.currentScene)return
this.currentScene.resize(width,height)}
getSceneWrapper(){
return this.currentSceneWrapper}
getCurrentScene(){
return this.currentScene}
async destroy(){
if(this.destroyed)return
if(this.currentScene){
await this.currentScene.destroy()
this.currentScene=null
this.currentSceneWrapper=null}
this.destroyed=true
Logger.info('SceneManager destroyed')}}
