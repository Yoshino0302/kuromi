import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

export class LightingSystem{

constructor(scene,camera,colors={},options={}){

this.scene=scene
this.camera=camera
this.colors=colors||ValentineColors
this.options=options

this.state='constructed'
this.disposed=false

this.clock=new THREE.Clock()

this.lights=[]
this.dynamicLights=[]

this.ambientLight=null
this.mainLight=null
this.rimLight=null

this.tmpVec=new THREE.Vector3()

this._create()

this.state='initialized'

}

_create(){

this._createAmbient()
this._createMainLight()
this._createRimLight()

}

_createAmbient(){

this.ambientLight=new THREE.AmbientLight(
this.colors.primary,
0.35
)

this.scene.add(this.ambientLight)

this.lights.push(this.ambientLight)

}

_createMainLight(){

this.mainLight=new THREE.PointLight(
this.colors.glow,
25,
100,
2
)

this.mainLight.position.set(0,0,5)

this._configureShadow(this.mainLight)

this.scene.add(this.mainLight)

this.lights.push(this.mainLight)
this.dynamicLights.push(this.mainLight)

}

_createRimLight(){

this.rimLight=new THREE.PointLight(
this.colors.secondary,
18,
100,
2
)

this.rimLight.position.set(0,2,-6)

this._configureShadow(this.rimLight)

this.scene.add(this.rimLight)

this.lights.push(this.rimLight)
this.dynamicLights.push(this.rimLight)

}

_configureShadow(light){

light.castShadow=true

light.shadow.mapSize.width=512
light.shadow.mapSize.height=512

light.shadow.bias=-0.0005
light.shadow.normalBias=0.02

light.shadow.radius=2

}

update(delta,elapsed){

if(this.disposed)return

if(elapsed===undefined){
elapsed=this.clock.getElapsedTime()
}

this._updateDynamicLights(elapsed)

this._updateCameraReactiveLight(elapsed)

}

_updateDynamicLights(elapsed){

for(let i=0;i<this.dynamicLights.length;i++){

const light=this.dynamicLights[i]

const baseIntensity=i===0?22:16

const pulse=Math.sin(elapsed*2+i*0.7)*4

light.intensity=baseIntensity+pulse

}

}

_updateCameraReactiveLight(elapsed){

if(!this.camera)return

const cam=this.camera.getCamera?.()||this.camera

if(!cam)return

this.tmpVec.copy(cam.position)

this.tmpVec.multiplyScalar(0.25)

this.tmpVec.y+=1.5

this.mainLight.position.lerp(this.tmpVec,0.02)

}

addLight(light){

if(this.disposed)return

this.scene.add(light)

this.lights.push(light)

if(light.isPointLight||light.isSpotLight||light.isDirectionalLight){
this.dynamicLights.push(light)
}

}

removeLight(light){

if(this.disposed)return

this.scene.remove(light)

const i=this.lights.indexOf(light)
if(i!==-1)this.lights.splice(i,1)

const j=this.dynamicLights.indexOf(light)
if(j!==-1)this.dynamicLights.splice(j,1)

}

setIntensity(multiplier){

for(const light of this.dynamicLights){

light.intensity*=multiplier

}

}

setColor(color){

for(const light of this.lights){

light.color.set(color)

}

}

getLights(){

return this.lights

}

dispose(){

if(this.disposed)return

this.state='disposing'

for(const light of this.lights){

this.scene.remove(light)

if(light.shadow?.map){
light.shadow.map.dispose()
}

}

this.lights.length=0
this.dynamicLights.length=0

this.ambientLight=null
this.mainLight=null
this.rimLight=null

this.tmpVec=null

this.scene=null
this.camera=null

this.disposed=true
this.state='disposed'

}

}
