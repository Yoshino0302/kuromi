import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

const RENDERER_STATE={
CONSTRUCTED:0,
INITIALIZED:1,
CONTEXT_LOST:2,
CONTEXT_RESTORED:3,
DISPOSED:4
}

export class Renderer{

constructor(options={}){

this.options=options
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
this.maxPixelRatio=Math.min(
options.maxPixelRatio||window.devicePixelRatio||1,
2
)

this._contextLost=false
this._rendering=false

this._boundResize=this._handleResize.bind(this)
this._boundContextLost=this._handleContextLost.bind(this)
this._boundContextRestored=this._handleContextRestored.bind(this)

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

throw new Error(
'[KUROMI ENGINE] WebGL2 not supported'
)

}

return gl

}

_createRenderer(canvas,gl){

const renderer=new THREE.WebGLRenderer({
canvas:canvas,
context:gl,
antialias:true,
alpha:false,
precision:'highp',
powerPreference:'high-performance',
premultipliedAlpha:false,
preserveDrawingBuffer:false
})

return renderer

}

_configureRenderer(){

const r=this.renderer

this._updatePixelRatio()

r.outputColorSpace=THREE.SRGBColorSpace

r.toneMapping=THREE.ACESFilmicToneMapping

r.toneMappingExposure=1.15

r.shadowMap.enabled=true
r.shadowMap.type=THREE.PCFSoftShadowMap

r.physicallyCorrectLights=true

r.setClearColor(
ValentineColors.background,
1
)

r.info.autoReset=true

}

_updatePixelRatio(){

const target=Math.min(
window.devicePixelRatio||1,
this.maxPixelRatio
)

if(target===this.pixelRatio)return

this.pixelRatio=target

this.renderer.setPixelRatio(this.pixelRatio)

}

_installResizeHandlers(){

window.addEventListener(
'resize',
this._boundResize,
{passive:true}
)

if(typeof ResizeObserver!=='undefined'){

this._resizeObserver=new ResizeObserver(()=>{
this._handleResize()
})

this._resizeObserver.observe(document.body)

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

console.warn(
'[KUROMI ENGINE] WebGL context lost'
)

}

}

_handleContextRestored(){

this._contextLost=false

this._configureRenderer()

this.resize(this.width,this.height)

this.state=RENDERER_STATE.CONTEXT_RESTORED

if(this.debug){

console.warn(
'[KUROMI ENGINE] WebGL context restored'
)

}

}

_handleResize(){

if(this.disposed)return

this.resize(
window.innerWidth,
window.innerHeight
)

}

resize(width,height){

if(this.disposed)return

width=Math.max(1,width|0)
height=Math.max(1,height|0)

if(width===this.width&&height===this.height)return

this.width=width
this.height=height

this._updatePixelRatio()

this.renderer.setSize(
width,
height,
false
)

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

if(this._contextLost)return

if(this._rendering)return

if(!scene||!camera)return

this._rendering=true

this.renderer.render(scene,camera)

this._rendering=false

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

dispose(){

if(this.disposed)return

this.state=RENDERER_STATE.DISPOSED

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

const ext=this.gl.getExtension(
'WEBGL_lose_context'
)

if(ext){

ext.loseContext()

}

if(this.canvas.parentElement){

this.canvas.parentElement.removeChild(
this.canvas
)

}

this.renderer=null
this.gl=null
this.canvas=null

this.disposed=true

}

}
