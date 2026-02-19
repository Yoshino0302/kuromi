import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class HeartGlowShader{
constructor(config={}){
this.color=config.color||new THREE.Color(1,0.2,0.4)
this.glowColor=config.glowColor||new THREE.Color(1,0.05,0.2)
this.timeUniform={value:0}
this.intensityUniform={value:1}
this.material=null
this.gpuTracker=config.gpuTracker
this._create()}
_create(){
this.material=new THREE.ShaderMaterial({
transparent:true,
depthWrite:false,
blending:THREE.AdditiveBlending,
uniforms:{
uTime:this.timeUniform,
uIntensity:this.intensityUniform,
uColor:{value:this.color},
uGlowColor:{value:this.glowColor}},
vertexShader:`varying vec3 vNormal;
varying vec3 vWorldPosition;
void main(){
vNormal=normalize(normalMatrix*normal);
vec4 worldPosition=modelMatrix*vec4(position,1.0);
vWorldPosition=worldPosition.xyz;
gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`,
fragmentShader:`uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;
uniform vec3 uGlowColor;
varying vec3 vNormal;
varying vec3 vWorldPosition;
void main(){
vec3 viewDir=normalize(cameraPosition-vWorldPosition);
float fresnel=pow(1.0-dot(viewDir,vNormal),3.0);
float heartbeat=sin(uTime*2.5)*0.5+0.5;
float pulse=sin(uTime*6.0)*0.5+0.5;
float energy=heartbeat*0.7+pulse*0.3;
vec3 base=uColor*(0.6+energy*0.8);
vec3 glow=uGlowColor*fresnel*(1.5+energy*2.0);
vec3 finalColor=base+glow;
float alpha=(0.6+fresnel)*uIntensity;
gl_FragColor=vec4(finalColor,alpha);
}`}
)
if(this.gpuTracker)this.gpuTracker.track(this.material)
Logger.info('HeartGlowShader created')}
getMaterial(){
return this.material}
update(delta){
this.timeUniform.value+=delta}
setIntensity(value){
this.intensityUniform.value=value}
destroy(){
if(!this.material)return
if(this.gpuTracker)this.gpuTracker.untrack(this.material)
this.material.dispose()
this.material=null
Logger.info('HeartGlowShader destroyed')}}
