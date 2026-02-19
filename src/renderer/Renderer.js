import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class Renderer{
constructor(config={}){
this.canvas=config.canvas||this._createCanvas()
this.gpuTracker=config.gpuTracker||null
this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:true,powerPreference:'high-performance',stencil:false,depth:true})
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
this.renderer.setSize(window.innerWidth,window.innerHeight,false)
this.renderer.outputColorSpace=THREE.SRGBColorSpace
this.renderer.toneMapping=THREE.ACESFilmicToneMapping
this.renderer.toneMappingExposure=1
this.renderer.shadowMap.enabled=false
this.renderer.autoClear=true
this.viewport={width:window.innerWidth,height:window.innerHeight}
this._resizeHandler=this._onResize.bind(this)
window.addEventListener('resize',this._resizeHandler,false)
Logger.info('Renderer created')}
_createCanvas(){
const canvas=document.createElement('canvas')
canvas.style.position='absolute'
canvas.style.top='0'
canvas.style.left='0'
canvas.style.width='100%'
canvas.style.height='100%'
document.body.appendChild(canvas)
return canvas}
_onResize(){
const width=window.innerWidth
const height=window.innerHeight
if(width===this.viewport.width&&height===this.viewport.height)return
this.viewport.width=width
this.viewport.height=height
this.renderer.setSize(width,height,false)
Logger.info('Renderer resized')}
render(sceneWrapper){
if(!sceneWrapper)return
const scene=sceneWrapper.scene
const camera=sceneWrapper.camera
if(!scene||!camera)return
this.renderer.render(scene,camera)}
getThreeRenderer(){
return this.renderer}
getCanvas(){
return this.canvas}
getViewport(){
return this.viewport}
disposeObject(object){
if(!object)return
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
if(this.gpuTracker)this.gpuTracker.untrack(object.material)}}}
destroy(){
window.removeEventListener('resize',this._resizeHandler,false)
this.renderer.dispose()
Logger.info('Renderer destroyed')}}
