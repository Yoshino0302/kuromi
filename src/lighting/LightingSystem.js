import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../src/config/ValentineColors.js'
export class LightingSystem{
constructor(scene){
this.scene=scene
this.group=new THREE.Group()
this.scene.add(this.group)
this.time=0
this.initAmbient()
this.initKeyLight()
this.initFillLight()
this.initRimLight()
this.initGlowLight()
}
initAmbient(){
this.ambient=new THREE.AmbientLight(ValentineColors.ambient,0.35)
this.group.add(this.ambient)
}
initKeyLight(){
this.keyLight=new THREE.DirectionalLight(ValentineColors.primary,2.8)
this.keyLight.position.set(5,8,6)
this.keyLight.castShadow=true
this.keyLight.shadow.mapSize.width=2048
this.keyLight.shadow.mapSize.height=2048
this.keyLight.shadow.camera.near=0.1
this.keyLight.shadow.camera.far=100
this.keyLight.shadow.camera.left=-15
this.keyLight.shadow.camera.right=15
this.keyLight.shadow.camera.top=15
this.keyLight.shadow.camera.bottom=-15
this.keyTarget=new THREE.Object3D()
this.keyTarget.position.set(0,0,0)
this.group.add(this.keyTarget)
this.keyLight.target=this.keyTarget
this.group.add(this.keyLight)
}
initFillLight(){
this.fillLight=new THREE.PointLight(ValentineColors.secondary,1.2,50,2)
this.fillLight.position.set(-6,4,-4)
this.fillLight.castShadow=false
this.group.add(this.fillLight)
}
initRimLight(){
this.rimLight=new THREE.DirectionalLight(ValentineColors.accent,2.2)
this.rimLight.position.set(-8,6,-8)
this.rimTarget=new THREE.Object3D()
this.rimTarget.position.set(0,0,0)
this.group.add(this.rimTarget)
this.rimLight.target=this.rimTarget
this.group.add(this.rimLight)
}
initGlowLight(){
this.glowLight=new THREE.PointLight(ValentineColors.glow,3.5,30,2)
this.glowLight.position.set(0,3,0)
this.group.add(this.glowLight)
}
update(delta){
this.time+=delta
const t=this.time*0.6
this.keyLight.position.x=Math.cos(t)*6
this.keyLight.position.z=Math.sin(t)*6
this.rimLight.position.x=Math.cos(t+Math.PI)*7
this.rimLight.position.z=Math.sin(t+Math.PI)*7
this.fillLight.position.y=4+Math.sin(t*2.0)*1.2
this.glowLight.intensity=3.0+Math.sin(t*3.0)*0.8
}
setIntensity(multiplier){
this.keyLight.intensity=2.8*multiplier
this.fillLight.intensity=1.2*multiplier
this.rimLight.intensity=2.2*multiplier
this.glowLight.intensity=3.5*multiplier
this.ambient.intensity=0.35*multiplier
}
dispose(){
this.group.remove(this.keyLight)
this.group.remove(this.fillLight)
this.group.remove(this.rimLight)
this.group.remove(this.glowLight)
this.group.remove(this.ambient)
this.scene.remove(this.group)
}
}
