import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class Renderer{
constructor(config={}){
this.canvas=config.canvas||document.querySelector('canvas')
this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:true,powerPreference:'high-performance'})
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
this.renderer.setSize(window.innerWidth,window.innerHeight,false)
this.renderer.outputColorSpace=THREE.SRGBColorSpace
this.renderer.toneMapping=THREE.ACESFilmicToneMapping
this.renderer.toneMappingExposure=1
this.destroyed=false
this._resizeHandler=this._handleResize.bind(this)
window.addEventListener('resize',this._resizeHandler,{passive:true})
Logger.info('Renderer constructed')}
_handleResize(){
if(this.destroyed)return
const width=window.innerWidth
const height=window.innerHeight
if(width<=0||height<=0)return
this.renderer.setSize(width,height,false)}
render(sceneWrapper){
if(this.destroyed)return
if(!sceneWrapper)return
const scene=sceneWrapper.scene
const camera=sceneWrapper.camera
if(!scene||!camera)return
this.renderer.render(scene,camera)}
getThreeRenderer(){
return this.renderer}
setPixelRatio(ratio){
if(this.destroyed)return
this.renderer.setPixelRatio(ratio)}
setSize(width,height){
if(this.destroyed)return
if(width<=0||height<=0)return
this.renderer.setSize(width,height,false)}
async destroy(){
if(this.destroyed)return
window.removeEventListener('resize',this._resizeHandler)
this.renderer.dispose()
this.destroyed=true
Logger.info('Renderer destroyed')}}
