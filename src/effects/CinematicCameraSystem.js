import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class CinematicCameraSystem{
constructor(config={}){
this.camera=config.camera
this.target=config.target||new THREE.Vector3(0,0,0)
this.enabled=true
this.time=0
this.basePosition=new THREE.Vector3()
this.offset=new THREE.Vector3()
this.shakeIntensity=0
this.breathAmplitude=0.15
this.breathSpeed=0.8
this.orbitRadius=6
this.orbitSpeed=0.15
this.height=1.5
this.lookLerp=0.05
this.posLerp=0.02
this.noiseSeed=Math.random()*1000
if(this.camera)this.basePosition.copy(this.camera.position)
Logger.info('CinematicCameraSystem initialized')}
setTarget(target){
this.target.copy(target)}
setOrbitRadius(radius){
this.orbitRadius=radius}
setHeight(height){
this.height=height}
setBreath(amplitude,speed){
this.breathAmplitude=amplitude
this.breathSpeed=speed}
shake(intensity){
this.shakeIntensity=intensity}
update(delta){
if(!this.enabled||!this.camera)return
this.time+=delta
const orbitAngle=this.time*this.orbitSpeed
const orbitX=Math.cos(orbitAngle)*this.orbitRadius
const orbitZ=Math.sin(orbitAngle)*this.orbitRadius
const breathY=Math.sin(this.time*this.breathSpeed)*this.breathAmplitude
const noise=Math.sin(this.time*1.3+this.noiseSeed)*0.1
this.offset.set(
orbitX+noise,
this.height+breathY,
orbitZ)
const desiredPosition=new THREE.Vector3().copy(this.target).add(this.offset)
this.camera.position.lerp(desiredPosition,this.posLerp)
const desiredLook=new THREE.Vector3().copy(this.target)
const currentLook=new THREE.Vector3()
this.camera.getWorldDirection(currentLook)
currentLook.add(this.camera.position)
currentLook.lerp(desiredLook,this.lookLerp)
this.camera.lookAt(currentLook)
if(this.shakeIntensity>0){
this.camera.position.x+=(Math.random()-0.5)*this.shakeIntensity
this.camera.position.y+=(Math.random()-0.5)*this.shakeIntensity
this.camera.position.z+=(Math.random()-0.5)*this.shakeIntensity
this.shakeIntensity*=0.9
if(this.shakeIntensity<0.001)this.shakeIntensity=0}}
destroy(){
this.enabled=false
this.camera=null
Logger.info('CinematicCameraSystem destroyed')}}
