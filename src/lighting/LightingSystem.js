import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

const LIGHTING_STATE={
CONSTRUCTED:0,
INITIALIZING:1,
INITIALIZED:2,
ACTIVE:3,
DISPOSING:4,
DISPOSED:5
}

export class LightingSystem{

constructor(scene,camera,colors={},options={}){

this.scene=scene||null
this.camera=camera||null

this.colors=colors||ValentineColors
this.options=options||{}

this.state=LIGHTING_STATE.CONSTRUCTED
this.disposed=false
this.initialized=false

this.time=0

this.lights=[]
this.dynamicLights=[]
this.shadowLights=[]

this.ambientLight=null
this.keyLight=null
this.rimLight=null
this.fillLight=null

this.enableCameraTracking=options.enableCameraTracking??true
this.enableLightAnimation=options.enableLightAnimation??true
this.enableShadows=options.enableShadows??true
this.enableCinematicSync=options.enableCinematicSync??true

this.shadowMapSize=options.shadowMapSize??1024

this.globalIntensity=1
this.globalColorMultiplier=new THREE.Color(1,1,1)

this.baseIntensities=new Map()
this.baseColors=new Map()

this.tmpVec=new THREE.Vector3()
this.tmpVec2=new THREE.Vector3()
this.tmpVec3=new THREE.Vector3()

this._cameraObject=null
this._cameraPosition=new THREE.Vector3()

this._pulsePhase=0

this._initialize()

}

_initialize(){

if(this.disposed)return

this.state=LIGHTING_STATE.INITIALIZING

this._resolveCamera()

this._createLights()

this.initialized=true
this.state=LIGHTING_STATE.INITIALIZED

}

_resolveCamera(){

if(!this.camera)return

this._cameraObject=
this.camera.getCamera?.()||
this.camera.camera||
this.camera

}

_createLights(){

this._createAmbient()
this._createKeyLight()
this._createRimLight()
this._createFillLight()

}

_createAmbient(){

const color=this.colors.primary||0xffffff

this.ambientLight=new THREE.AmbientLight(
color,
0.35
)

this._registerLight(this.ambientLight,0.35,color,false)

}

_createKeyLight(){

const color=this.colors.glow||0xffffff

this.keyLight=new THREE.PointLight(
color,
28,
120,
2
)

this.keyLight.position.set(0,3,6)

this._configureShadow(this.keyLight)

this._registerLight(this.keyLight,28,color,true)

}

_createRimLight(){

const color=this.colors.secondary||0xffffff

this.rimLight=new THREE.PointLight(
color,
18,
100,
2
)

this.rimLight.position.set(-6,4,-8)

this._configureShadow(this.rimLight)

this._registerLight(this.rimLight,18,color,true)

}

_createFillLight(){

const color=this.colors.accentSoft||0xffffff

this.fillLight=new THREE.PointLight(
color,
10,
80,
2
)

this.fillLight.position.set(6,2,-3)

this._registerLight(this.fillLight,10,color,true)

}

_configureShadow(light){

if(!this.enableShadows)return

light.castShadow=true

light.shadow.mapSize.width=this.shadowMapSize
light.shadow.mapSize.height=this.shadowMapSize

light.shadow.bias=-0.0004
light.shadow.normalBias=0.02

light.shadow.radius=2

this.shadowLights.push(light)

}

_registerLight(light,intensity,color,dynamic){

if(!light)return
if(this.disposed)return

this.scene.add(light)

this.lights.push(light)

this.baseIntensities.set(light,intensity)

this.baseColors.set(
light,
new THREE.Color(color)
)

if(dynamic){

this.dynamicLights.push(light)

}

}

update(delta){

if(this.disposed)return
if(!this.initialized)return
if(delta<=0)return

this.time+=delta

if(this.enableLightAnimation){

this._updateLightAnimation(delta)

}

if(this.enableCameraTracking){

this._updateCameraTracking(delta)

}

if(this.enableCinematicSync){

this._updateCinematicSync(delta)

}

}

_updateLightAnimation(delta){

const t=this.time

this._pulsePhase+=delta*0.5

let index=0

for(const light of this.dynamicLights){

const base=this.baseIntensities.get(light)||1

const pulse=
Math.sin(t*1.7+index)*2+
Math.sin(t*0.9+index*0.5)*1.5+
Math.sin(this._pulsePhase)*1.0

light.intensity=
(base+pulse)*this.globalIntensity

index++

}

}

_updateCameraTracking(delta){

if(!this._cameraObject)return

this._cameraPosition.copy(
this._cameraObject.position
)

this.tmpVec.copy(this._cameraPosition)
this.tmpVec.multiplyScalar(0.35)
this.tmpVec.y+=2.5

if(this.keyLight){

this.keyLight.position.lerp(
this.tmpVec,
0.08
)

}

}

_updateCinematicSync(delta){

if(!this._cameraObject)return

const height=this._cameraObject.position.y

const heightFactor=
THREE.MathUtils.clamp(
height*0.15,
0.8,
1.4
)

for(const light of this.dynamicLights){

light.intensity*=heightFactor

}

}

setGlobalIntensity(value){

this.globalIntensity=value

}

setGlobalColor(color){

this.globalColorMultiplier.set(color)

for(const light of this.lights){

const base=this.baseColors.get(light)
if(!base)continue

light.color.copy(base)
light.color.multiply(this.globalColorMultiplier)

}

}

addLight(light,baseIntensity=10){

if(this.disposed)return

this._registerLight(
light,
baseIntensity,
light.color?.getHex?.()||0xffffff,
true
)

}

removeLight(light){

if(this.disposed)return
if(!light)return

this.scene.remove(light)

let i=this.lights.indexOf(light)
if(i!==-1)this.lights.splice(i,1)

let j=this.dynamicLights.indexOf(light)
if(j!==-1)this.dynamicLights.splice(j,1)

let k=this.shadowLights.indexOf(light)
if(k!==-1)this.shadowLights.splice(k,1)

this.baseIntensities.delete(light)
this.baseColors.delete(light)

}

getLights(){

return this.lights

}

getKeyLight(){

return this.keyLight

}

getAmbientLight(){

return this.ambientLight

}

getRimLight(){

return this.rimLight

}

getFillLight(){

return this.fillLight

}

dispose(){

if(this.disposed)return

this.state=LIGHTING_STATE.DISPOSING

for(const light of this.lights){

this.scene.remove(light)

if(light.shadow?.map){

light.shadow.map.dispose()

}

}

this.lights.length=0
this.dynamicLights.length=0
this.shadowLights.length=0

this.baseIntensities.clear()
this.baseColors.clear()

this.ambientLight=null
this.keyLight=null
this.rimLight=null
this.fillLight=null

this.tmpVec=null
this.tmpVec2=null
this.tmpVec3=null

this._cameraObject=null
this._cameraPosition=null

this.scene=null
this.camera=null

this.initialized=false
this.disposed=true

this.state=LIGHTING_STATE.DISPOSED

}

}
