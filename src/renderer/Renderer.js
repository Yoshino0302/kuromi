import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

const RENDERER_STATE={
CONSTRUCTED:0,
INITIALIZING:1,
INITIALIZED:2,
CONTEXT_LOST:3,
CONTEXT_RESTORED:4,
DISPOSING:5,
DISPOSED:6
}

export class Renderer{

constructor(options={}){

this.options=options||{}
this.engine=options.engine||null
this.debug=options.debug===true

this.state=RENDERER_STATE.CONSTRUCTED
this.disposed=false

this.canvas=options.canvas||this._createCanvas()

this.gl=this._createContext(this.canvas)

this.renderer=this._createRenderer(this.canvas,this.gl)

this.width=1
this.height=1

this.pixelRatio=1
this.appliedPixelRatio=0

this.maxPixelRatio=Math.min(
options.maxPixelRatio??window.devicePixelRatio??1,
2
)

this._contextLost=false
this._rendering=false
this._frameId=0

this._clearColor=new THREE.Color()
this._tmpColor=new THREE.Color()

this._resizeObserver=null

this._boundResize=this._handleResize.bind(this)
this._boundContextLost=this._handleContextLost.bind(this)
this._boundContextRestored=this._handleContextRestored.bind(this)

this._initialize()

}

_initialize(){

this.state=RENDERER_STATE.INITIALIZING

this._configureRenderer()

this._installContextHandlers()
this._installResizeHandlers()

this.resize(
window.innerWidth,
window.innerHeight
)

this.state=RENDERER_STATE.INITIALIZED

}

_createCanvas(){

const canvas=document.createElement('canvas')

canvas.id='kuromi-engine-canvas'

canvas.style.position='fixed'
canvas.style.top='0'
canvas.style.left='0'
canvas.style.width='100%'
canvas.style.height='100%'
canvas.style.display='block'
canvas.style.outline='none'

document.body.appendChild(canvas)

return canvas

}

_createContext(canvas){

const gl=canvas.getContext('webgl2',{
alpha:false,
antialias:true,
powerPreference:'high-performance',
depth:true,
stencil:false,
premultipliedAlpha:false,
preserveDrawingBuffer:false,
failIfMajorPerformanceCaveat:false
})

if(!gl){

throw new Error('[KUROMI ENGINE] WebGL2 required')

}

return gl

}

_createRenderer(canvas,gl){

return new THREE.WebGLRenderer({
canvas:canvas,
context:gl,
antialias:true,
alpha:false,
precision:'highp',
powerPreference:'high-performance',
premultipliedAlpha:false,
preserveDrawingBuffer:false
})

}

_configureRenderer(){

const r=this.renderer

this._applyPixelRatio(
Math.min(
window.devicePixelRatio||1,
this.maxPixelRatio
)
)

r.outputColorSpace=THREE.SRGBColorSpace

r.toneMapping=THREE.ACESFilmicToneMapping
r.toneMappingExposure=
this.options.exposure??
ValentineColors.exposure??
1.25

r.physicallyCorrectLights=true

r.shadowMap.enabled=true

r.shadowMap.type=
this.options.shadowType??
THREE.PCFSoftShadowMap

r.shadowMap.autoUpdate=true

r.sortObjects=true

this._clearColor.set(
ValentineColors.backgroundBottom??
0x000000
)

r.setClearColor(
this._clearColor,
1
)

r.info.autoReset=false

}

_applyPixelRatio(ratio){

ratio=Math.max(
0.25,
Math.min(ratio,this.maxPixelRatio)
)

if(Math.abs(ratio-this.appliedPixelRatio)<0.001)return

this.pixelRatio=ratio
this.appliedPixelRatio=ratio

this.renderer.setPixelRatio(ratio)

}

_installResizeHandlers(){

window.addEventListener(
'resize',
this._boundResize,
{passive:true}
)

if(typeof ResizeObserver!=='undefined'){

this._resizeObserver=
new ResizeObserver(this._boundResize)

this._resizeObserver.observe(this.canvas)

}

}

_installContextHandlers(){

this.canvas.addEventListener(
'webglcontextlost',
this._boundContextLost,
false
)

this.canvas.addEventListener(
'webglcontextrestored',
this._boundContextRestored,
false
)

}

_handleContextLost(event){

event.preventDefault()

this._contextLost=true

this.state=RENDERER_STATE.CONTEXT_LOST

if(this.debug){

console.warn('[KUROMI Renderer] Context Lost')

}

}

_handleContextRestored(){

this._contextLost=false

this._configureRenderer()

this.resize(
this.width,
this.height
)

this.state=RENDERER_STATE.CONTEXT_RESTORED

if(this.debug){

console.warn('[KUROMI Renderer] Context Restored')

}

}

_handleResize(){

if(this.disposed)return

const width=
this.canvas.clientWidth||
window.innerWidth

const height=
this.canvas.clientHeight||
window.innerHeight

this.resize(width,height)

}

resize(width,height){

if(this.disposed)return

width=Math.max(1,width|0)
height=Math.max(1,height|0)

if(
width===this.width&&
height===this.height
)return

this.width=width
this.height=height

this.renderer.setSize(
width,
height,
false
)

this._updateEngineCamera()

this._updateEngineScene()

}

_updateEngineCamera(){

if(!this.engine)return

const camera=
this.engine.getCamera?.()

if(!camera)return

camera.aspect=
this.width/this.height

camera.updateProjectionMatrix()

}

_updateEngineScene(){

const sceneManager=
this.engine?.sceneManager

sceneManager?.resize?.(
this.width,
this.height
)

}

render(scene,camera){

if(this.disposed)return
if(this._contextLost)return
if(this._rendering)return
if(!scene||!camera)return

this._rendering=true

this._frameId++

this.renderer.info.reset()

this.renderer.render(
scene,
camera
)

this._rendering=false

}

setExposure(value){

this.renderer.toneMappingExposure=value

}

getExposure(){

return this.renderer.toneMappingExposure

}

setPixelRatio(ratio){

this._applyPixelRatio(ratio)

}

getPixelRatio(){

return this.pixelRatio

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
height:this.height,
pixelRatio:this.pixelRatio
}

}

getFrameId(){

return this._frameId

}

isContextLost(){

return this._contextLost

}

dispose(){

if(this.disposed)return

this.state=RENDERER_STATE.DISPOSING

if(this._resizeObserver){

this._resizeObserver.disconnect()
this._resizeObserver=null

}

window.removeEventListener(
'resize',
this._boundResize
)

this.canvas.removeEventListener(
'webglcontextlost',
this._boundContextLost
)

this.canvas.removeEventListener(
'webglcontextrestored',
this._boundContextRestored
)

this.renderer.dispose()

const ext=
this.gl.getExtension(
'WEBGL_lose_context'
)

ext?.loseContext?.()

if(this.canvas.parentElement){

this.canvas.parentElement.removeChild(
this.canvas
)

}

this.renderer=null
this.gl=null
this.canvas=null

this.disposed=true

this.state=RENDERER_STATE.DISPOSED

}

}
