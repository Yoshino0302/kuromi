import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class BaseScene{
constructor(config={}){
this.renderer=config.renderer||null
this.resourceManager=config.resourceManager||null
this.gpuTracker=config.gpuTracker||null
this.memoryTracker=config.memoryTracker||null
this.scene=new THREE.Scene()
this.camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000)
this.sceneWrapper={scene:this.scene,camera:this.camera}
this.objects=new Set()
this.initialized=false
this.destroyed=false
Logger.info(this.constructor.name+' constructed')}
async init(){
this.initialized=true}
update(delta){}
add(object){
if(!object)return
this.scene.add(object)
this.objects.add(object)
if(object.geometry&&this.gpuTracker)this.gpuTracker.track(object.geometry)
if(object.material){
if(Array.isArray(object.material)){
for(let i=0;i<object.material.length;i++)if(this.gpuTracker)this.gpuTracker.track(object.material[i])}
else if(this.gpuTracker)this.gpuTracker.track(object.material)}
if(this.memoryTracker)this.memoryTracker.track(object)}
remove(object){
if(!object)return
this.scene.remove(object)
this.objects.delete(object)
if(this.memoryTracker)this.memoryTracker.untrack(object)}
getSceneWrapper(){
return this.sceneWrapper}
resize(width,height){
this.camera.aspect=width/height
this.camera.updateProjectionMatrix()}
async destroy(){
if(this.destroyed)return
for(const object of this.objects){
this.scene.remove(object)
if(object.geometry){
object.geometry.dispose()
if(this.gpuTracker)this.gpuTracker.untrack(object.geometry)}
if(object.material){
if(Array.isArray(object.material)){
for(let i=0;i<object.material.length;i++){
object.material[i].dispose()
if(this.gpuTracker)this.gpuTracker.untrack(object.material[i])}}
else{
object.material.dispose()
if(this.gpuTracker)this.gpuTracker.untrack(object.material)}}if(this.memoryTracker)this.memoryTracker.untrack(object)}
this.objects.clear()
this.destroyed=true
Logger.info(this.constructor.name+' destroyed')}}
