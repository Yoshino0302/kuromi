import * as THREE from 'https://jspm.dev/three'
import { BaseScene } from './BaseScene.js'
import { HeartInstancedSystem } from '../effects/HeartInstancedSystem.js'
import { HeartGlowShader } from '../shaders/HeartGlowShader.js'
import { CinematicCameraSystem } from '../effects/CinematicCameraSystem.js'
import { ValentinePostProcessing } from '../effects/ValentinePostProcessing.js'
import { Logger } from '../utils/Logger.js'
export class ValentineScene extends BaseScene{
constructor(engine){
super(engine)
this.scene=new THREE.Scene()
this.scene.background=new THREE.Color(0x050005)
this.camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000)
this.camera.position.set(0,2,8)
this.renderer=this.engine.renderer.getRenderer()
this.hearts=null
this.glowShader=null
this.cameraSystem=null
this.postProcessing=null
this.light=null
this.ambient=null
this.target=new THREE.Vector3(0,0,0)}
init(){
this._createLights()
this._createHearts()
this._createCameraSystem()
this._createPostProcessing()
Logger.info('ValentineScene initialized')}
_createLights(){
this.ambient=new THREE.AmbientLight(0xff3366,0.6)
this.scene.add(this.ambient)
this.light=new THREE.PointLight(0xff6699,5,50,2)
this.light.position.set(0,5,5)
this.scene.add(this.light)}
_createHearts(){
this.glowShader=new HeartGlowShader({gpuTracker:this.engine.gpuTracker})
this.hearts=new HeartInstancedSystem({
scene:this.scene,
gpuTracker:this.engine.gpuTracker,
memoryTracker:this.engine.memoryTracker,
count:3000})
this.hearts.mesh.material=this.glowShader.getMaterial()}
_createCameraSystem(){
this.cameraSystem=new CinematicCameraSystem({camera:this.camera,target:this.target})
this.cameraSystem.setOrbitRadius(8)
this.cameraSystem.setHeight(2)
this.cameraSystem.setBreath(0.25,0.9)}
_createPostProcessing(){
this.postProcessing=new ValentinePostProcessing({
renderer:this.renderer,
scene:this.scene,
camera:this.camera,
gpuTracker:this.engine.gpuTracker})}
update(delta){
if(this.hearts)this.hearts.update(delta)
if(this.glowShader)this.glowShader.update(delta)
if(this.cameraSystem)this.cameraSystem.update(delta)
if(this.postProcessing)this.postProcessing.render()}
resize(width,height){
this.camera.aspect=width/height
this.camera.updateProjectionMatrix()
if(this.postProcessing)this.postProcessing.resize(width,height)}
destroy(){
if(this.hearts)this.hearts.destroy()
if(this.glowShader)this.glowShader.destroy()
if(this.cameraSystem)this.cameraSystem.destroy()
if(this.postProcessing)this.postProcessing.destroy()
this.scene.clear()
Logger.info('ValentineScene destroyed')}
getSceneWrapper(){
return{
scene:this.scene,
camera:this.camera,
renderer:this.renderer}}}
