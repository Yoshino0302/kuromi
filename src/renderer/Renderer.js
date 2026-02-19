import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

export class Renderer{

constructor(engine){

this.engine=engine

this.canvas=document.createElement('canvas')

this.gl=this.canvas.getContext('webgl2',{
alpha:false,
antialias:true,
powerPreference:'high-performance',
stencil:false,
depth:true
})

this.renderer=new THREE.WebGLRenderer({
canvas:this.canvas,
context:this.gl,
antialias:true,
alpha:false,
powerPreference:'high-performance'
})

this._configureRenderer()

this._attachCanvas()

this._setupResize()

}

_configureRenderer(){

this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))

this.renderer.setSize(
window.innerWidth,
window.innerHeight,
false
)

this.renderer.outputColorSpace=THREE.SRGBColorSpace

this.renderer.toneMapping=THREE.ACESFilmicToneMapping

this.renderer.toneMappingExposure=1.15

this.renderer.shadowMap.enabled=true

this.renderer.shadowMap.type=THREE.PCFSoftShadowMap

this.renderer.physicallyCorrectLights=true

this.renderer.setClearColor(
ValentineColors.background,
1
)

}

_attachCanvas(){

document.body.style.margin='0'
document.body.style.padding='0'
document.body.style.overflow='hidden'
document.body.appendChild(this.canvas)

}

_setupResize(){

window.addEventListener('resize',()=>{

const width=window.innerWidth
const height=window.innerHeight

this.renderer.setSize(width,height,false)

if(this.engine.camera){

this.engine.camera.aspect=width/height
this.engine.camera.updateProjectionMatrix()

}

if(this.engine.sceneManager){

this.engine.sceneManager.resize(width,height)

}

})

}

render(scene,camera){

this.renderer.render(scene,camera)

}

dispose(){

this.renderer.dispose()

}

}
