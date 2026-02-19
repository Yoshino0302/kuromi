import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'
import { GlassPortalEffect } from '../effects/portal/GlassPortalEffect.js'
import { BlackholeEffect } from '../effects/blackhole/BlackholeEffect.js'
import { HeartParticlesSystem } from '../effects/HeartParticlesSystem.js'
import { LightingSystem } from '../lighting/LightingSystem.js'

export class SceneManager{

constructor(options={}){

this.options=options
this.engine=options.engine||null
this.debug=options.debug===true

this.state='constructed'
this.initialized=false
this.disposed=false

this.scene=new THREE.Scene()

this.clock=new THREE.Clock()

this.subsystems=new Set()

this.portal=null
this.blackhole=null
this.hearts=null
this.lighting=null

this._setupSceneBase()

}

_setupSceneBase(){

this.scene.background=new THREE.Color(ValentineColors.background)

this.scene.fog=new THREE.FogExp2(
ValentineColors.fog,
0.045
)

}

async init(){

if(this.initialized)return

this.state='initializing'

this._initLighting()
this._initPortal()
this._initBlackhole()
this._initHearts()

this._registerSubsystem(this.lighting)
this._registerSubsystem(this.portal)
this._registerSubsystem(this.blackhole)
this._registerSubsystem(this.hearts)

this.initialized=true
this.state='initialized'

}

_initLighting(){

this.lighting=new LightingSystem(
this.scene,
this._getCamera(),
{
primary:ValentineColors.primary,
secondary:ValentineColors.secondary,
accent:ValentineColors.accent
}
)

}

_initPortal(){

this.portal=new GlassPortalEffect({
scene:this.scene,
camera:this._getCamera(),
colors:ValentineColors
})

}

_initBlackhole(){

this.blackhole=new BlackholeEffect({
scene:this.scene,
camera:this._getCamera(),
colors:ValentineColors
})

this.blackhole.setPosition(0,0,-6)

}

_initHearts(){

this.hearts=new HeartParticlesSystem({
scene:this.scene,
colors:ValentineColors,
count:600
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

if(this.engine?.getCamera){
return this.engine.getCamera()
}

return null

}

update(delta,elapsed){

if(this.disposed)return

if(!this.initialized){

this.init()

}

if(delta===undefined){

delta=this.clock.getDelta()
elapsed=this.clock.elapsedTime

}else if(elapsed===undefined){

elapsed=this.clock.elapsedTime

}

for(const system of this.subsystems){

if(system?.update){

system.update(delta,elapsed)

}

}

}

resize(width,height){

if(this.disposed)return

for(const system of this.subsystems){

if(system?.resize){

system.resize(width,height)

}

}

}

add(object){

this.scene.add(object)

}

remove(object){

this.scene.remove(object)

}

clear(){

const toRemove=[]

this.scene.traverse(child=>{
if(child.isMesh||child.isPoints||child.isLine){
toRemove.push(child)
}
})

for(const obj of toRemove){

this.scene.remove(obj)

if(obj.geometry)obj.geometry.dispose()

if(obj.material){

if(Array.isArray(obj.material)){

for(const mat of obj.material){
mat.dispose()
}

}else{
obj.material.dispose()
}

}

}

}

getScene(){

return this.scene

}

dispose(){

if(this.disposed)return

this.state='disposing'

for(const system of this.subsystems){

if(system?.dispose){

system.dispose()

}

}

this.subsystems.clear()

this.clear()

this.scene=null

this.portal=null
this.blackhole=null
this.hearts=null
this.lighting=null

this.initialized=false
this.disposed=true
this.state='disposed'

}

}
