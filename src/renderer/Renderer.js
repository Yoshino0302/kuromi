import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

export class Renderer{

constructor(options={}){

this.options=options
this.engine=options.engine||null
this.debug=options.debug===true

this.state='constructed'
this.disposed=false

this.canvas=options.canvas||document.createElement('canvas')

this.gl=this._createContext(this.canvas)

this.renderer=this._createRenderer(this.canvas,this.gl)

this._configureRenderer()

this._attachCanvas()

this._installContextLossHandler()

this._installResizeObserver()

this.width=0
this.height=0

this.resize(window.innerWidth,window.innerHeight)

this.state='initialized'

}

_createContext(canvas){

const gl=canvas.getContext('webgl2',{
alpha:false,
antialias:true,
powerPreference:'high-performance',
stencil:false,
depth:true,
preserveDrawingBuffer:false
})

if(!gl){
throw new Error('WebGL2 not supported')
}

return gl

}

_createRenderer(canvas,context){

const renderer=new THREE.WebGLRenderer({
canvas:canvas,
context:context,
antialias:true,
alpha:false,
powerPreference:'high-performance',
precision:'highp',
premultipliedAlpha:false,
preserveDrawingBuffer:false,
failIfMajorPerformanceCaveat:false
})

return renderer

}

_configureRenderer(){

const r=this.renderer

r.setPixelRatio(Math.min(window.devicePixelRatio||1,2))

r.outputColorSpace=THREE.SRGBColorSpace

r.toneMapping=THREE.ACESFilmicToneMapping
r.toneMappingExposure=1.15

r.shadowMap.enabled=true
r.shadowMap.type=THREE.PCFSoftShadowMap

r.physicallyCorrectLights=true

r.setClearColor(ValentineColors.background,1)

r.info.autoReset=true

}

_attachCanvas(){

if(this.canvas.parentElement)return

document.body.style.margin='0'
document.body.style.padding='0'
document.body.style.overflow='hidden'

document.body.appendChild(this.canvas)

}

_installResizeObserver(){

this._resizeObserver=new ResizeObserver(entries=>{

for(const entry of entries){

const rect=entry.contentRect

this.resize(rect.width,rect.height)

}

})

this._resizeObserver.observe(document.body)

window.addEventListener('resize',this._boundWindowResize=()=>{
this.resize(window.innerWidth,window.innerHeight)
},{passive:true})

}

_installContextLossHandler(){

this._contextLostHandler=(event)=>{
event.preventDefault()
this.state='context_lost'
if(this.debug){
console.warn('WebGL context lost')
}
}

this._contextRestoreHandler=()=>{
this.state='context_restored'
this._reconfigureAfterRestore()
if(this.debug){
console.warn('WebGL context restored')
}
}

this.canvas.addEventListener('webglcontextlost',this._contextLostHandler,false)
this.canvas.addEventListener('webglcontextrestored',this._contextRestoreHandler,false)

}

_reconfigureAfterRestore(){

this._configureRenderer()

this.resize(this.width,this.height)

}

resize(width,height){

if(this.disposed)return

width=Math.max(1,Math.floor(width))
height=Math.max(1,Math.floor(height))

if(width===this.width&&height===this.height)return

this.width=width
this.height=height

this.renderer.setSize(width,height,false)

if(this.engine){

const camera=this.engine.getCamera?.()

if(camera){

camera.aspect=width/height
camera.updateProjectionMatrix()

}

const sceneManager=this.engine.sceneManager

if(sceneManager?.resize){

sceneManager.resize(width,height)

}

}

}

render(scene,camera){

if(this.disposed)return
if(!scene||!camera)return

this.renderer.render(scene,camera)

}

getRenderer(){

return this.renderer

}

getCanvas(){

return this.canvas

}

getContext(){

return this.gl

}

getSize(){

return{
width:this.width,
height:this.height
}

}

dispose(){

if(this.disposed)return

this.state='disposing'

if(this._resizeObserver){

this._resizeObserver.disconnect()
this._resizeObserver=null

}

window.removeEventListener('resize',this._boundWindowResize)

this.canvas.removeEventListener('webglcontextlost',this._contextLostHandler)
this.canvas.removeEventListener('webglcontextrestored',this._contextRestoreHandler)

this.renderer.dispose()

const ext=this.gl.getExtension('WEBGL_lose_context')

if(ext){
ext.loseContext()
}

this.gl=null
this.renderer=null

if(this.canvas.parentElement){
this.canvas.parentElement.removeChild(this.canvas)
}

this.canvas=null

this.disposed=true
this.state='disposed'

}

}
