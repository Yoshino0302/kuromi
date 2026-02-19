import * as THREE from 'https://jspm.dev/three'
import { RenderGraph } from './rendergraph/RenderGraph.js'
import { RenderPass } from './rendergraph/RenderPass.js'
import { ValentineColors } from '../src/config/ValentineColors.js'
export class PostProcessingPipeline{
constructor(renderer){
this.renderer=renderer
this.renderGraph=new RenderGraph()
this.size=new THREE.Vector2()
this.renderer.getSize(this.size)
this.initTargets()
this.initQuad()
this.initPasses()
}
initTargets(){
this.hdrTarget=new THREE.WebGLRenderTarget(this.size.x,this.size.y,{type:THREE.HalfFloatType,format:THREE.RGBAFormat,colorSpace:THREE.SRGBColorSpace})
this.brightTarget=new THREE.WebGLRenderTarget(this.size.x,this.size.y,{type:THREE.HalfFloatType,format:THREE.RGBAFormat})
this.blurTargetA=new THREE.WebGLRenderTarget(this.size.x,this.size.y,{type:THREE.HalfFloatType,format:THREE.RGBAFormat})
this.blurTargetB=new THREE.WebGLRenderTarget(this.size.x,this.size.y,{type:THREE.HalfFloatType,format:THREE.RGBAFormat})
}
initQuad(){
this.screenScene=new THREE.Scene()
this.screenCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1)
this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null)
this.screenScene.add(this.quad)
this.brightMaterial=new THREE.ShaderMaterial({
uniforms:{tDiffuse:{value:null},threshold:{value:1.0}},
vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
fragmentShader:`uniform sampler2D tDiffuse;uniform float threshold;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(0.299,0.587,0.114));gl_FragColor=l>threshold?vec4(c,1.0):vec4(0.0);}`
})
this.blurMaterial=new THREE.ShaderMaterial({
uniforms:{tDiffuse:{value:null},direction:{value:new THREE.Vector2(1,0)},resolution:{value:this.size}},
vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 direction;uniform vec2 resolution;varying vec2 vUv;void main(){vec2 off=direction/resolution;vec3 result=texture2D(tDiffuse,vUv).rgb*0.227027;result+=texture2D(tDiffuse,vUv+off*1.384615).rgb*0.316216;result+=texture2D(tDiffuse,vUv-off*1.384615).rgb*0.316216;result+=texture2D(tDiffuse,vUv+off*3.230769).rgb*0.070270;result+=texture2D(tDiffuse,vUv-off*3.230769).rgb*0.070270;gl_FragColor=vec4(result,1.0);}`
})
this.finalMaterial=new THREE.ShaderMaterial({
uniforms:{tScene:{value:null},tBloom:{value:null},pink:{value:new THREE.Color(ValentineColors.primary)},red:{value:new THREE.Color(ValentineColors.accent)}},
vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
fragmentShader:`uniform sampler2D tScene;uniform sampler2D tBloom;uniform vec3 pink;uniform vec3 red;varying vec2 vUv;void main(){vec3 scene=texture2D(tScene,vUv).rgb;vec3 bloom=texture2D(tBloom,vUv).rgb;vec3 color=scene+bloom*1.2;float vignette=smoothstep(0.8,0.2,length(vUv-0.5));color*=vignette;vec3 grade=mix(pink,red,clamp(color.r,0.0,1.0));color=mix(color,grade,0.15);gl_FragColor=vec4(color,1.0);}`
})
}
initPasses(){
this.renderGraph.addPass(new RenderPass("hdr",(ctx)=>{this.renderer.setRenderTarget(this.hdrTarget);this.renderer.render(ctx.scene,ctx.camera)}))
this.renderGraph.addPass(new RenderPass("bright",(ctx)=>{this.quad.material=this.brightMaterial;this.brightMaterial.uniforms.tDiffuse.value=this.hdrTarget.texture;this.renderer.setRenderTarget(this.brightTarget);this.renderer.render(this.screenScene,this.screenCamera)}))
this.renderGraph.addPass(new RenderPass("blurH",(ctx)=>{this.quad.material=this.blurMaterial;this.blurMaterial.uniforms.tDiffuse.value=this.brightTarget.texture;this.blurMaterial.uniforms.direction.value.set(1,0);this.renderer.setRenderTarget(this.blurTargetA);this.renderer.render(this.screenScene,this.screenCamera)}))
this.renderGraph.addPass(new RenderPass("blurV",(ctx)=>{this.quad.material=this.blurMaterial;this.blurMaterial.uniforms.tDiffuse.value=this.blurTargetA.texture;this.blurMaterial.uniforms.direction.value.set(0,1);this.renderer.setRenderTarget(this.blurTargetB);this.renderer.render(this.screenScene,this.screenCamera)}))
this.renderGraph.addPass(new RenderPass("final",(ctx)=>{this.quad.material=this.finalMaterial;this.finalMaterial.uniforms.tScene.value=this.hdrTarget.texture;this.finalMaterial.uniforms.tBloom.value=this.blurTargetB.texture;this.renderer.setRenderTarget(null);this.renderer.render(this.screenScene,this.screenCamera)}))
}
render(scene,camera){
this.renderGraph.execute({scene,camera})
}
resize(width,height){
this.hdrTarget.setSize(width,height)
this.brightTarget.setSize(width,height)
this.blurTargetA.setSize(width,height)
this.blurTargetB.setSize(width,height)
this.blurMaterial.uniforms.resolution.value.set(width,height)
}
}
