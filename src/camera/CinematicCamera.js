import * as THREE from 'https://jspm.dev/three'
export class CinematicCamera{
constructor(){
this.camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000)
this.camera.position.set(0,2,8)
this.target=new THREE.Vector3(0,0,0)
this.currentLook=new THREE.Vector3(0,0,0)
this.time=0
this.orbitRadius=8
this.orbitSpeed=0.15
this.breathAmplitude=0.25
this.breathSpeed=1.2
this.shakeAmplitude=0.04
this.shakeSpeed=18
this.positionSmooth=3.5
this.lookSmooth=4.5
this.tmpVec=new THREE.Vector3()
this.installResize()
}
installResize(){
window.addEventListener('resize',()=>{
this.camera.aspect=window.innerWidth/window.innerHeight
this.camera.updateProjectionMatrix()
})
}
setTarget(x,y,z){
this.target.set(x,y,z)
}
setOrbitRadius(radius){
this.orbitRadius=radius
}
setOrbitSpeed(speed){
this.orbitSpeed=speed
}
setBreath(amplitude,speed){
this.breathAmplitude=amplitude
this.breathSpeed=speed
}
setShake(amplitude,speed){
this.shakeAmplitude=amplitude
this.shakeSpeed=speed
}
update(delta){
this.time+=delta
const orbitAngle=this.time*this.orbitSpeed
const breath=Math.sin(this.time*this.breathSpeed)*this.breathAmplitude
const shakeX=Math.sin(this.time*this.shakeSpeed)*this.shakeAmplitude
const shakeY=Math.cos(this.time*this.shakeSpeed*1.3)*this.shakeAmplitude
const desiredX=this.target.x+Math.cos(orbitAngle)*this.orbitRadius
const desiredZ=this.target.z+Math.sin(orbitAngle)*this.orbitRadius
const desiredY=this.target.y+2.0+breath
this.tmpVec.set(desiredX+shakeX,desiredY+shakeY,desiredZ)
this.camera.position.lerp(this.tmpVec,Math.min(delta*this.positionSmooth,1.0))
this.currentLook.lerp(this.target,Math.min(delta*this.lookSmooth,1.0))
this.camera.lookAt(this.currentLook)
}
getCamera(){
return this.camera
}
}
