import * as THREE from 'https://jspm.dev/three'
import { Renderer } from '../renderer/Renderer.js'
import { SceneManager } from '../scene/SceneManager.js'
import { CameraSystem } from '../camera/CameraSystem.js'
import { PerformanceMonitor } from '../systems/PerformanceMonitor.js'
import { PerformanceScaler } from '../systems/PerformanceScaler.js'

export class Engine{

constructor(){

this.clock=new THREE.Clock()

this.renderer=new Renderer()

this.sceneManager=new SceneManager()

this.cameraSystem=new CameraSystem()

this.performanceMonitor=new PerformanceMonitor()

this.performanceScaler=new PerformanceScaler(
this.renderer.getRenderer()
)

this.running=false

this.bindResize()

}

bindResize(){

window.addEventListener(
'resize',
()=>{
this.renderer.resize()
}
)

}

update(delta){

this.sceneManager.update(delta)

this.cameraSystem.update(delta)

const fps=
this.performanceMonitor.update(delta)

this.performanceScaler.update(fps)

}

render(){

this.renderer.render(
this.sceneManager.getScene(),
this.cameraSystem.getCamera()
)

}

start(){

if(this.running)return

this.running=true

const loop=()=>{

if(!this.running)return

const delta=
this.clock.getDelta()

this.update(delta)

this.render()

requestAnimationFrame(loop)

}

loop()

}

stop(){

this.running=false

}

}
