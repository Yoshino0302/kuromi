import {SystemManager} from '../systems/SystemManager.js'
import {TaskScheduler} from '../systems/TaskScheduler.js'
import {MemoryMonitor} from '../systems/MemoryMonitor.js'
import {PerformanceMonitor} from '../systems/PerformanceMonitor.js'
import {SystemProfiler} from '../systems/SystemProfiler.js'
import {AnimationSystem} from '../animation/AnimationSystem.js'
import {InputSystem} from '../input/InputSystem.js'
import {LightingSystem} from '../lighting/LightingSystem.js'
import {SceneManager} from '../scene/SceneManager.js'
import {CameraSystem} from '../camera/CameraSystem.js'
import {PostProcessing} from '../effects/post/PostProcessing.js'
import {EventEmitter} from '../utils/EventEmitter.js'
export class App extends EventEmitter{
constructor(engine,state,options={}){
super()
this.engine=engine
this.state=state
this.options=options
this.initialized=false
this.running=false
this.systemManager=new SystemManager()
this.scheduler=new TaskScheduler()
this.memoryMonitor=new MemoryMonitor()
this.performanceMonitor=new PerformanceMonitor()
this.profiler=new SystemProfiler()
this.animationSystem=new AnimationSystem()
this.inputSystem=new InputSystem()
this.lightingSystem=new LightingSystem()
this.sceneManager=new SceneManager()
this.cameraSystem=new CameraSystem()
this.postProcessing=null
this.context={
engine:this.engine,
state:this.state,
app:this,
systems:this.systemManager,
scheduler:this.scheduler
}
this.boundUpdate=this.update.bind(this)
this.boundVisibility=this.handleVisibility.bind(this)
}
async initialize(){
if(this.initialized)return
this.registerCoreSystems()
await this.initializeSystems()
this.initializePostProcessing()
this.bindEngineEvents()
this.bindDOMEvents()
this.initialized=true
this.emit('initialized',this)
}
registerCoreSystems(){
this.systemManager.register('input',this.inputSystem,10)
this.systemManager.register('animation',this.animationSystem,20)
this.systemManager.register('lighting',this.lightingSystem,30)
this.systemManager.register('camera',this.cameraSystem,40)
this.systemManager.register('scene',this.sceneManager,50)
this.systemManager.register('memoryMonitor',this.memoryMonitor,90)
this.systemManager.register('performanceMonitor',this.performanceMonitor,91)
this.systemManager.register('profiler',this.profiler,92)
}
async initializeSystems(){
const systems=this.systemManager.getAll()
for(let i=0;i<systems.length;i++){
const sys=systems[i]
if(sys&&typeof sys.initialize==='function'){
await sys.initialize(this.context)
}
}
}
initializePostProcessing(){
if(this.engine.renderer){
this.postProcessing=new PostProcessing(this.engine.renderer,this.engine)
if(typeof this.postProcessing.initialize==='function'){
this.postProcessing.initialize(this.context)
}
}
}
bindEngineEvents(){
if(this.engine.on){
this.engine.on('update',this.boundUpdate)
this.engine.on('pause',()=>this.pause())
this.engine.on('resume',()=>this.resume())
this.engine.on('stop',()=>this.stop())
}
}
bindDOMEvents(){
document.addEventListener('visibilitychange',this.boundVisibility,{passive:true})
}
async start(){
if(this.running)return
this.running=true
const systems=this.systemManager.getAll()
for(let i=0;i<systems.length;i++){
const sys=systems[i]
if(sys&&typeof sys.start==='function'){
await sys.start(this.context)
}
}
this.emit('started',this)
}
update(dt){
if(!this.running)return
this.scheduler.update(dt)
this.systemManager.update(dt,this.context)
if(this.postProcessing&&typeof this.postProcessing.update==='function'){
this.postProcessing.update(dt,this.context)
}
this.performanceMonitor.update(dt)
this.memoryMonitor.update(dt)
this.profiler.update(dt)
}
pause(){
if(!this.running)return
this.running=false
this.systemManager.pause(this.context)
this.scheduler.pause()
this.emit('paused',this)
}
resume(){
if(this.running)return
this.running=true
this.systemManager.resume(this.context)
this.scheduler.resume()
this.emit('resumed',this)
}
stop(){
if(!this.initialized)return
this.running=false
this.systemManager.stop(this.context)
this.scheduler.stop()
document.removeEventListener('visibilitychange',this.boundVisibility)
this.emit('stopped',this)
}
handleVisibility(){
if(document.hidden)this.pause()
else this.resume()
}
destroy(){
this.stop()
this.systemManager.destroy(this.context)
this.scheduler.destroy()
this.removeAllListeners()
this.initialized=false
}
}
