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

this.time=0

this.lights=[]
this.dynamicLights=[]

this.ambientLight=null
this.keyLight=null
this.rimLight=null
this.fillLight=null

this.tmpVec=new THREE.Vector3()
this.tmpVec2=new THREE.Vector3()

this.baseIntensities=new Map()

this.shadowMapSize=options.shadowMapSize??1024

this.enableCameraTracking=options.enableCameraTracking??true

this._create()

this.state='initialized'

}

_create(){

this._createAmbient()
this._createKeyLight()
this._createRimLight()
this._createFillLight()

}

_createAmbient(){

this.ambientLight=new THREE.AmbientLight(
this.colors.primary,
0.35
)

this.scene.add(this.ambientLight)

this.lights.push(this.ambientLight)

}

_createKeyLight(){

this.keyLight=new THREE.PointLight(
this.colors.glow,
28,
120,
2
)

this.keyLight.position.set(0,2,6)

this._configureShadow(this.keyLight)

this.scene.add(this.keyLight)

this.lights.push(this.keyLight)
this.dynamicLights.push(this.keyLight)

this.baseIntensities.set(this.keyLight,28)

}

_createRimLight(){

this.rimLight=new THREE.PointLight(
this.colors.secondary,
18,
100,
2
)

this.rimLight.position.set(-4,3,-6)

this._configureShadow(this.rimLight)

this.scene.add(this.rimLight)

this.lights.push(this.rimLight)
this.dynamicLights.push(this.rimLight)

this.baseIntensities.set(this.rimLight,18)

}

_createFillLight(){

this.fillLight=new THREE.PointLight(
this.colors.accentSoft,
10,
80,
2
)

this.fillLight.position.set(4,1,-2)

this.scene.add(this.fillLight)

this.lights.push(this.fillLight)
this.dynamicLights.push(this.fillLight)

this.baseIntensities.set(this.fillLight,10)

}

_configureShadow(light){

light.castShadow=true

light.shadow.mapSize.width=this.shadowMapSize
light.shadow.mapSize.height=this.shadowMapSize

light.shadow.bias=-0.0004
light.shadow.normalBias=0.02

light.shadow.radius=2

}

update(delta,elapsed){

if(this.disposed)return

if(delta<=0)return

this.time+=delta

this._updateDynamicLights()

if(this.enableCameraTracking){

this._updateCameraTracking()

}

}

_updateDynamicLights(){

const t=this.time

let i=0

for(const light of this.dynamicLights){

const base=this.baseIntensities.get(light)||10

const pulse=
Math.sin(t*1.7+i)*2+
Math.sin(t*0.9+i*0.5)*1.5

light.intensity=base+pulse

i++

}

}

_updateCameraTracking(){

if(!this.camera)return

const cam=this.camera.getCamera?.()||this.camera

if(!cam)return

this.tmpVec.copy(cam.position)

this.tmpVec.multiplyScalar(0.35)

this.tmpVec.y+=2.0

this.keyLight.position.lerp(this.tmpVec,0.05)

}

addLight(light,baseIntensity=10){

if(this.disposed)return

this.scene.add(light)

this.lights.push(light)

if(light.isPointLight||light.isSpotLight||light.isDirectionalLight){

this.dynamicLights.push(light)

this.baseIntensities.set(light,baseIntensity)

}

}

removeLight(light){

if(this.disposed)return

this.scene.remove(light)

let i=this.lights.indexOf(light)
if(i!==-1)this.lights.splice(i,1)

let j=this.dynamicLights.indexOf(light)
if(j!==-1)this.dynamicLights.splice(j,1)

this.baseIntensities.delete(light)

}

setGlobalIntensity(multiplier){

for(const light of this.dynamicLights){

const base=this.baseIntensities.get(light)||10

light.intensity=base*multiplier

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

this.baseIntensities.clear()

this.ambientLight=null
this.keyLight=null
this.rimLight=null
this.fillLight=null

this.tmpVec=null
this.tmpVec2=null

this.scene=null
this.camera=null

this.disposed=true

this.state='disposed'

}

}
