import * as THREE from 'https://jspm.dev/three'
import { EffectComposer } from 'https://jspm.dev/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'https://jspm.dev/three/examples/jsm/postprocessing/ShaderPass.js'
import { Logger } from '../utils/Logger.js'
export class ValentinePostProcessing{
constructor(config){
this.renderer=config.renderer
this.scene=config.scene
this.camera=config.camera
this.gpuTracker=config.gpuTracker
this.composer=null
this.renderPass=null
this.bloomPass=null
this.colorPass=null
this._init()}
_init(){
const size=new THREE.Vector2()
this.renderer.getSize(size)
this.composer=new EffectComposer(this.renderer)
this.renderPass=new RenderPass(this.scene,this.camera)
this.bloomPass=new UnrealBloomPass(size,1.5,0.4,0.85)
this.bloomPass.threshold=0
this.bloomPass.strength=1.8
this.bloomPass.radius=0.6
const shader={
uniforms:{
tDiffuse:{value:null},
tint:{value:new THREE.Vector3(1.05,0.85,0.95)},
intensity:{value:0.15}},
vertexShader:`varying vec2 vUv;
void main(){
vUv=uv;
gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`,
fragmentShader:`uniform sampler2D tDiffuse;
uniform vec3 tint;
uniform float intensity;
varying vec2 vUv;
void main(){
vec4 color=texture2D(tDiffuse,vUv);
color.rgb*=tint;
float vignette=smoothstep(0.8,0.2,length(vUv-0.5));
color.rgb*=mix(1.0,vignette,0.35);
color.rgb+=vec3(0.15,0.05,0.1)*intensity;
gl_FragColor=color;
}`}
this.colorPass=new ShaderPass(shader)
this.composer.addPass(this.renderPass)
this.composer.addPass(this.bloomPass)
this.composer.addPass(this.colorPass)
if(this.gpuTracker){
this.gpuTracker.track(this.composer)
this.gpuTracker.track(this.bloomPass)}
Logger.info('ValentinePostProcessing initialized')}
render(){
if(this.composer)this.composer.render()}
resize(width,height){
if(this.composer)this.composer.setSize(width,height)}
destroy(){
if(!this.composer)return
this.composer.dispose()
if(this.gpuTracker){
this.gpuTracker.untrack(this.composer)
this.gpuTracker.untrack(this.bloomPass)}
this.composer=null
Logger.info('ValentinePostProcessing destroyed')}}
