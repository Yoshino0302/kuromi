import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'
import { GlassPortalEffect } from '../effects/portal/GlassPortalEffect.js'
import { BlackholeEffect } from '../effects/blackhole/BlackholeEffect.js'
import { HeartParticlesSystem } from '../effects/HeartParticlesSystem.js'
import { LightingSystem } from '../lighting/LightingSystem.js'

export class SceneManager{

constructor(engine){

this.engine=engine
this.renderer=engine.renderer
this.camera=engine.camera

this.scene=new THREE.Scene()

this.clock=new THREE.Clock()

this.initialized=false

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

init(){

if(this.initialized)return

this._initLighting()
this._initPortal()
this._initBlackhole()
this._initHearts()

this.initialized=true

}

_initLighting(){

this.lighting=new LightingSystem(
this.scene,
this.camera,
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
camera:this.camera,
colors:ValentineColors
})

}

_initBlackhole(){

this.blackhole=new BlackholeEffect({
scene:this.scene,
camera:this.camera,
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

update(){

if(!this.initialized)return

const delta=this.clock.getDelta()
const elapsed=this.clock.elapsedTime

if(this.portal)this.portal.update(delta,elapsed)

if(this.blackhole)this.blackhole.update(delta,elapsed)

if(this.hearts)this.hearts.update(delta,elapsed)

if(this.lighting)this.lighting.update(delta,elapsed)

}

render(){

this.renderer.render(
this.scene,
this.camera
)

}

resize(width,height){

if(this.portal&&this.portal.resize)this.portal.resize(width,height)

if(this.blackhole&&this.blackhole.resize)this.blackhole.resize(width,height)

}

dispose(){

if(this.portal)this.portal.dispose()

if(this.blackhole)this.blackhole.dispose()

if(this.hearts)this.hearts.dispose()

if(this.lighting)this.lighting.dispose()

}

}
