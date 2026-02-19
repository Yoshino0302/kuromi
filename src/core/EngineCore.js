
import {Clock} from '../utils/Clock.js'
import {Logger} from '../utils/Logger.js'
import {GPUResourceTracker} from '../systems/GPUResourceTracker.js'
import {MemoryTracker} from '../systems/MemoryTracker.js'
import {ResourceManager} from '../systems/ResourceManager.js'
import {UpdateScheduler} from '../systems/UpdateScheduler.js'
import {Renderer} from '../renderer/Renderer.js'
import {SceneManager} from '../scenes/SceneManager.js'
export class EngineCore{
constructor(canvas){
Logger.log("EngineCore init")
this.clock=new Clock()
this.gpu=new GPUResourceTracker()
this.memory=new MemoryTracker()
this.resources=new ResourceManager(this.gpu)
this.scheduler=new UpdateScheduler()
this.renderer=new Renderer(canvas,this.gpu)
this.sceneManager=new SceneManager(this)
this.running=false
}
start(){
this.running=true
this.loop()
}
loop(){
if(!this.running)return
const dt=this.clock.tick()
this.scheduler.update(dt)
this.sceneManager.update(dt)
requestAnimationFrame(()=>this.loop())
}
dispose(){
this.running=false
this.resources.dispose()
this.gpu.dispose()
Logger.log("Engine disposed")
}
}
