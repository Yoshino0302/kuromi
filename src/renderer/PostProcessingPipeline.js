import * as THREE from 'https://jspm.dev/three'

import { RenderGraph } from './rendergraph/RenderGraph.js'

import { RenderPass } from './rendergraph/RenderPass.js'

export class PostProcessingPipeline{

constructor(renderer){

this.renderer=renderer

this.renderGraph=new RenderGraph()

this.initTargets()

this.initPasses()

}

initTargets(){

const size=this.renderer.getSize(new THREE.Vector2())

this.renderTarget=new THREE.WebGLRenderTarget(
size.x,
size.y,
{
type:THREE.HalfFloatType,
format:THREE.RGBAFormat,
colorSpace:THREE.SRGBColorSpace
}
)

}

initPasses(){

this.renderGraph.addPass(
new RenderPass(
"mainRender",
(context)=>{

this.renderer.setRenderTarget(
this.renderTarget
)

this.renderer.render(
context.scene,
context.camera
)

}
)
)

this.renderGraph.addPass(
new RenderPass(
"finalBlit",
(context)=>{

this.renderer.setRenderTarget(null)

this.renderer.render(
context.scene,
context.camera
)

}
)
)

}

render(scene,camera){

this.renderGraph.execute({
scene,
camera
})

}

resize(width,height){

this.renderTarget.setSize(width,height)

}

}
