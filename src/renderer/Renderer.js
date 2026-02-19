import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'
export class Renderer{
constructor(){
this.canvas=document.getElementById('engine-canvas')
if(!this.canvas){
this.canvas=document.createElement('canvas')
this.canvas.id='engine-canvas'
document.body.appendChild(this.canvas)
}
this.renderer=new THREE.WebGLRenderer({
canvas:this.canvas,
antialias:true,
alpha:false,
powerPreference:'high-performance',
stencil:false,
depth:true,
precision:'highp',
premultipliedAlpha:false,
preserveDrawingBuffer:false,
failIfMajorPerformanceCaveat:false
})
this.clock=new THREE.Clock()
this.targetDPR=Math.min(window.devicePixelRatio||1,2)
this.currentDPR=this.targetDPR
this.configureRenderer()
this.configureCinematicDefaults()
this.resize()
this.installResizeListener()
}
configureRenderer(){
this.renderer.outputColorSpace=THREE.SRGBColorSpace
this.renderer.toneMapping=THREE.ACESFilmicToneMapping
this.renderer.toneMappingExposure=1.35
this.renderer.useLegacyLights=false
this.renderer.physicallyCorrectLights=true
this.renderer.shadowMap.enabled=true
this.renderer.shadowMap.type=THREE.PCFSoftShadowMap
this.renderer.shadowMap.autoUpdate=true
this.renderer.shadowMap.needsUpdate=true
this.renderer.sortObjects=true
this.renderer.setClearColor(new THREE.Color(ValentineColors.background),1)
this.renderer.setPixelRatio(this.currentDPR)
}
configureCinematicDefaults(){
this.renderer.info.autoReset=true
this.renderer.debug.checkShaderErrors=false
this.renderer.setAnimationLoop(null)
this.globalExposure=1.35
this.exposureTarget=1.35
this.exposureSpeed=1.5
}
installResizeListener(){
window.addEventListener('resize',()=>{
this.resize()
})
}
resize(){
const width=window.innerWidth
const height=window.innerHeight
this.renderer.setPixelRatio(this.currentDPR)
this.renderer.setSize(width,height,false)
}
updateExposure(delta){
const diff=this.exposureTarget-this.globalExposure
this.globalExposure+=diff*Math.min(delta*this.exposureSpeed,1.0)
this.renderer.toneMappingExposure=this.globalExposure
}
setExposure(value){
this.exposureTarget=value
}
setDPR(value){
this.targetDPR=Math.min(value,2)
}
updateDPR(delta){
const diff=this.targetDPR-this.currentDPR
this.currentDPR+=diff*Math.min(delta*2.0,1.0)
this.renderer.setPixelRatio(this.currentDPR)
}
beginFrame(){
const delta=this.clock.getDelta()
this.updateExposure(delta)
this.updateDPR(delta)
}
render(scene,camera){
this.beginFrame()
this.renderer.render(scene,camera)
}
getRenderer(){
return this.renderer
}
getCanvas(){
return this.canvas
}
getSize(target){
return this.renderer.getSize(target)
}
}
