import { Renderer } from '../renderer/Renderer.js'
import { SceneManager } from '../scene/SceneManager.js'
import { CameraSystem } from '../camera/CameraSystem.js'
import { PerformanceMonitor } from '../systems/PerformanceMonitor.js'

export class Engine{

constructor(){

this.renderer=new Renderer()

this.sceneManager=new SceneManager()

this.cameraSystem=new CameraSystem()

this.performanceMonitor=new PerformanceMonitor()

this.lastTime=performance.now()

this.running=false

}

start(){

this.running=true

this.loop()

}

stop(){

this.running=false

}

loop(){

if(!this.running)return

const now=performance.now()

const delta=(now-this.lastTime)/1000

this.lastTime=now

this.performanceMonitor.update(delta)

this.sceneManager.update(delta)

this.cameraSystem.update(delta)

this.renderer.render(
this.sceneManager.getScene(),
this.cameraSystem.getCamera()
)

requestAnimationFrame(()=>this.loop())

}

}
