import * as THREE from 'https://jspm.dev/three'
import { Renderer } from '../renderer/Renderer.js'
import { CinematicCamera } from '../camera/CinematicCamera.js'
import { LightingSystem } from '../lighting/LightingSystem.js'
import { PortalEffect } from '../effects/PortalEffect.js'
import { BlackholeEffect } from '../effects/BlackholeEffect.js'
import { HeartParticlesSystem } from '../effects/HeartParticlesSystem.js'
import { PostProcessingPipeline } from '../renderer/PostProcessingPipeline.js'
export class SceneManager{
constructor(){
this.rendererSystem=new Renderer()
this.renderer=this.rendererSystem.getRenderer()
this.scene=new THREE.Scene()
this.scene.matrixAutoUpdate=true
this.clock=new THREE.Clock()
this.running=false
this.initCamera()
this.initLighting()
this.initEffects()
this.initPostProcessing()
this.installResize()
}
initCamera(){
this.cameraSystem=new CinematicCamera()
this.camera=this.cameraSystem.getCamera()
this.cameraSystem.setTarget(0,0,0)
}
initLighting(){
this.lighting=new LightingSystem(this.scene)
}
initEffects(){
this.portal=new PortalEffect(this.scene)
this.portal.setPosition(0,0,0)
this.portal.setScale(1.0)
this.blackhole=new BlackholeEffect(this.scene)
this.blackhole.setPosition(0,0,-4)
this.blackhole.setScale(0.8)
this.hearts=new HeartParticlesSystem(this.scene,2500)
}
initPostProcessing(){
this.pipeline=new PostProcessingPipeline(this.renderer)
}
installResize(){
window.addEventListener('resize',()=>{
this.resize()
})
}
resize(){
const width=window.innerWidth
const height=window.innerHeight
this.rendererSystem.resize()
this.pipeline.resize(width,height)
this.camera.aspect=width/height
this.camera.updateProjectionMatrix()
}
start(){
if(this.running)return
this.running=true
this.clock.start()
this.loop()
}
stop(){
this.running=false
}
loop(){
if(!this.running)return
requestAnimationFrame(()=>this.loop())
const delta=this.clock.getDelta()
this.update(delta)
this.render()
}
update(delta){
this.cameraSystem.update(delta)
this.lighting.update(delta)
this.portal.update(delta)
this.blackhole.update(delta)
this.hearts.update(delta)
}
render(){
this.rendererSystem.beginFrame()
this.pipeline.render(this.scene,this.camera)
}
dispose(){
this.stop()
this.portal.dispose()
this.blackhole.dispose()
this.hearts.dispose()
this.lighting.dispose()
}
getScene(){
return this.scene
}
getCamera(){
return this.camera
}
getRenderer(){
return this.renderer
}
}
