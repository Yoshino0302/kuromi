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
DISPOSING:3,
DISPOSED:4
}

export class SceneManager{

constructor(options={}){

this.options=options
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

this._initPromise=null

this._configureScene()

}

_configureScene(){

this.scene.background=new THREE.Color(
ValentineColors.background
)

this.scene.fog=new THREE.FogExp2(
ValentineColors.fog,
0.045
)

}

async init(){

if(this.initialized)return this
if(this._initPromise)return this._initPromise

this._initPromise=(async()=>{

this.state=SCENE_STATE.INITIALIZING

this._emitDebug('Scene init start')

this._createLighting()

this._createPortal()

this._createBlackhole()

this._createHearts()

this._register(this.lighting)
this._register(this.portal)
this._register(this.blackhole)
this._register(this.hearts)

this.clock.start()

this.initialized=true

this.state=SCENE_STATE.INITIALIZED

this._emitDebug('Scene init complete')

return this

})()

return this._initPromise

}

_createLighting(){

this.lighting=new LightingSystem(
this.scene,
this._getCamera(),
ValentineColors
)

}

_createPortal(){

this.portal=new GlassPortalEffect({
scene:this.scene,
camera:this._getCamera(),
colors:ValentineColors
})

}

_createBlackhole(){

this.blackhole=new BlackholeEffect({
scene:this.scene,
camera:this._getCamera(),
colors:ValentineColors
})

this.blackhole.setPosition(0,0,-6)

}

_createHearts(){

this.hearts=new HeartParticlesSystem({
scene:this.scene,
colors:ValentineColors,
count:600
})

}

_register(system){

if(!system)return

this.subsystems.add(system)

}

_unregister(system){

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

delta=this.clock.getDelta()

elapsed=this.clock.elapsedTime

}else if(elapsed===undefined){

elapsed=this.clock.elapsedTime

}

for(const system of this.subsystems){

try{

system?.update?.(delta,elapsed)

}catch(e){

this._emitDebug(
'Subsystem update failure',
e
)

}

}

}

resize(width,height){

if(this.disposed)return

for(const system of this.subsystems){

try{

system?.resize?.(width,height)

}catch(e){

this._emitDebug(
'Subsystem resize failure',
e
)

}

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

}

if(object.material){

if(Array.isArray(object.material)){

for(const mat of object.material){

mat.dispose()

}

}else{

object.material.dispose()

}

}

}

dispose(){

if(this.disposed)return

this.state=SCENE_STATE.DISPOSING

this._emitDebug('Scene disposing')

for(const system of this.subsystems){

try{

system?.dispose?.()

}catch(e){

this._emitDebug(
'Subsystem dispose failure',
e
)

}

}

this.subsystems.clear()

this.clear()

this.scene.clear()

this.scene=null

this.portal=null
this.blackhole=null
this.hearts=null
this.lighting=null

this.initialized=false
this.disposed=true

this.state=SCENE_STATE.DISPOSED

this._emitDebug('Scene disposed')

}

getScene(){

return this.scene

}

_emitDebug(...args){

if(this.debug){

console.warn(
'[KUROMI SCENE]',
...args
)

}

}

}
