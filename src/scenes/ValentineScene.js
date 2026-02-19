import * as THREE from 'https://jspm.dev/three'
import { BaseScene } from './BaseScene.js'
import { HeartInstancedSystem } from '../effects/HeartInstancedSystem.js'
import { HeartGlowShader } from '../shaders/HeartGlowShader.js'
import { CinematicCameraSystem } from '../effects/CinematicCameraSystem.js'
import { ValentinePostProcessing } from '../effects/ValentinePostProcessing.js'
import { Logger } from '../utils/Logger.js'
export class ValentineScene extends BaseScene{
constructor(){
super()
this.scene=null
this.camera=null
this.renderer=null
this.hearts=null
this.glowShader=null
this.cameraSystem=null
this.postProcessing=null
this.target=new THREE.Vector3(0,0,0)
Logger.info('ValentineScene constructed')}
init(sceneWrapper){
this.scene=sceneWrapper.scene
this.camera=sceneWrapper.camera
this.renderer=sceneWrapper.renderer
this.scene.background=new THREE.Color(0x050005)
this._createLights()
this._createHearts()
this._createCameraSystem()
this._createPostProcessing()
Logger.info('ValentineScene initialized')}
_createLights(){
const ambient=new THREE.AmbientLight(0xff3366,0.6)
this.scene.add(ambient)
const light=new THREE.PointLight(0xff6699,5,50,2)
light.position.set(0,5,5)
this.scene.add(light)}
_createHearts(){
this.glowShader=new HeartGlowShader({})
this.hearts=new HeartInstancedSystem({
scene:this.scene,
count:3000})
this.hearts.mesh.material=this.glowShader.getMaterial()}
_createCameraSystem(){
this.cameraSystem=new CinematicCameraSystem({
camera:this.camera,
target:this.target})
this.cameraSystem.setOrbitRadius(8)
this.cameraSystem.setHeight(2)
this.cameraSystem.setBreath(0.25,0.9)}
_createPostProcessing(){
this.postProcessing=new ValentinePostProcessing({
renderer:this.renderer,
scene:this.scene,
camera:this.camera})}
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
Logger.info('ValentineScene destroyed')}}
