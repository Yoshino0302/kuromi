import * as THREE from 'https://jspm.dev/three'

import { PostProcessingPipeline } from './PostProcessingPipeline.js'

export class Renderer{

constructor(){

this.renderer=new THREE.WebGLRenderer({
antialias:true,
powerPreference:'high-performance'
})

this.renderer.setSize(
window.innerWidth,
window.innerHeight
)

this.renderer.setPixelRatio(
Math.min(window.devicePixelRatio,2)
)

this.renderer.outputColorSpace=
THREE.SRGBColorSpace

this.renderer.toneMapping=
THREE.ACESFilmicToneMapping

this.renderer.toneMappingExposure=1.0

this.renderer.shadowMap.enabled=true

document.body.appendChild(
this.renderer.domElement
)

this.pipeline=
new PostProcessingPipeline(
this.renderer
)

window.addEventListener(
'resize',
()=>this.onResize()
)

}

onResize(){

const w=window.innerWidth
const h=window.innerHeight

this.renderer.setSize(w,h)

this.pipeline.resize(w,h)

}

render(scene,camera){

this.pipeline.render(
scene,
camera
)

}

getRenderer(){

return this.renderer

}

}
