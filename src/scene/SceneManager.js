import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'
import { GlassPortalEffect } from '../effects/portal/GlassPortalEffect.js'
import { BlackholeEffect } from '../effects/blackhole/BlackholeEffect.js'
import { HeartParticlesSystem } from '../effects/HeartParticlesSystem.js'
import { LightingSystem } from '../lighting/LightingSystem.js'

const SCENE_STATE={
CONSTRUCTED:0,
INITIALIZING:1,
INITIALIZED:2,
ACTIVE:3,
DISPOSING:4,
DISPOSED:5
}

export class SceneManager{

constructor(options={}){

this.options=options||{}
this.engine=options.engine||null
this.debug=options.debug===true

this.state=SCENE_STATE.CONSTRUCTED

this.initialized=false
this.disposed=false

this.scene=new THREE.Scene()

this.clock=new THREE.Clock(false)

this.subsystems=new Set()
this.objects=new Set()

this.portal=null
this.blackhole=null
this.hearts=null
this.lighting=null

this.environment=null

this._initPromise=null

this._delta=0
this._elapsed=0

this._configureScene()

}

_configureScene(){

this.scene.background=new THREE.Color(
ValentineColors.backgroundTop??
ValentineColors.background??
0x000000
)

this.scene.fog=new THREE.FogExp2(
ValentineColors.fog??
0x000000,
ValentineColors.fogDensity??
0.045
)

this.scene.matrixAutoUpdate=true

}

async init(){

if(this.initialized)return this
if(this._initPromise)return this._initPromise

this._initPromise=(async()=>{

this.state=SCENE_STATE.INITIALIZING

this._debug('Init start')

this._createLighting()
this._createPortal()
this._createBlackhole()
this._createHearts()

this._registerSubsystem(this.lighting)
this._registerSubsystem(this.portal)
this._registerSubsystem(this.blackhole)
this._registerSubsystem(this.hearts)

this.clock.start()

this.initialized=true
this.state=SCENE_STATE.ACTIVE

this._debug('Init complete')

return this

})()

return this._initPromise

}

_createLighting(){

this.lighting=new LightingSystem(
this.scene,
this._getCamera(),
ValentineColors,
this.options.lighting||{}
)

}

_createPortal(){

this.portal=new GlassPortalEffect({
scene:this.scene,
camera:this._getCamera(),
colors:ValentineColors,
engine:this.engine
})

}

_createBlackhole(){

this.blackhole=new BlackholeEffect({
scene:this.scene,
camera:this._getCamera(),
colors:ValentineColors,
engine:this.engine
})

this.blackhole.setPosition(0,0,-6)

}

_createHearts(){

this.hearts=new HeartParticlesSystem({
scene:this.scene,
colors:ValentineColors,
engine:this.engine,
count:this.options.heartCount??600
})

}

_registerSubsystem(system){

if(!system)return

this.subsystems.add(system)

}

_unregisterSubsystem(system){

if(!system)return

this.subsystems.delete(system)

}

_getCamera(){

return this.engine?.getCamera?.()||null

}

update(delta,elapsed){

if(this.disposed)return

if(!this.initialized){

this.init()
return

}

if(delta===undefined){

this._delta=this.clock.getDelta()
this._elapsed=this.clock.elapsedTime

}else{

this._delta=delta
this._elapsed=elapsed??this.clock.elapsedTime

}

for(const system of this.subsystems){

system?.update?.(
this._delta,
this._elapsed
)

}

}

resize(width,height){

if(this.disposed)return

for(const system of this.subsystems){

system?.resize?.(
width,
height
)

}

}

add(object){

if(!object)return

this.scene.add(object)

this.objects.add(object)

}

remove(object){

if(!object)return

this.scene.remove(object)

this.objects.delete(object)

this._disposeObject(object)

}

clear(){

for(const object of this.objects){

this.scene.remove(object)

this._disposeObject(object)

}

this.objects.clear()

}

_disposeObject(object){

if(!object)return

if(object.geometry){

object.geometry.dispose()
object.geometry=null

}

if(object.material){

if(Array.isArray(object.material)){

for(const mat of object.material){

mat?.dispose?.()

}

}else{

object.material.dispose()

}

object.material=null

}

}

dispose(){

if(this.disposed)return

this.state=SCENE_STATE.DISPOSING

this._debug('Disposing')

for(const system of this.subsystems){

system?.dispose?.()

}

this.subsystems.clear()

this.clear()

this.scene.clear()

this.scene.background=null
this.scene.environment=null
this.scene.fog=null

this.scene=null

this.portal=null
this.blackhole=null
this.hearts=null
this.lighting=null

this.initialized=false
this.disposed=true

this.state=SCENE_STATE.DISPOSED

this._debug('Disposed')

}

getScene(){

return this.scene

}

getSubsystemCount(){

return this.subsystems.size

}

getObjectCount(){

return this.objects.size

}

_debug(...args){

if(this.debug){

console.warn(
'[KUROMI Scene]',
...args
)

}

}

}
