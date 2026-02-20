import {EventEmitter} from '../utils/EventEmitter.js'

export const AppPhase=Object.freeze({
CREATED:0,
INITIALIZING:1,
INITIALIZED:2,
STARTING:3,
RUNNING:4,
PAUSING:5,
PAUSED:6,
RESUMING:7,
STOPPING:8,
STOPPED:9,
DESTROYING:10,
DESTROYED:11,
ERROR:12
})

export class AppState extends EventEmitter{

constructor(){

super()

this.phase=AppPhase.CREATED
this.previousPhase=null

this.running=false
this.paused=false
this.initialized=false
this.destroyed=false

this.frame=0
this.time=0
this.delta=0

this.startTime=0
this.pauseTime=0
this.resumeTime=0
this.stopTime=0

this.flags={
ready:false,
visible:true,
focused:true,
background:false
}

this.metrics={
fps:0,
frameTime:0,
cpuTime:0,
gpuTime:0,
memory:0
}

this._fpsAccumulator=0
this._fpsFrames=0

this.error=null

}

setPhase(newPhase){

if(this.phase===newPhase)return

this.previousPhase=this.phase
this.phase=newPhase

this.emit('phase',newPhase,this.previousPhase)
this.emit(`phase:${newPhase}`,newPhase,this.previousPhase)

}

markInitializing(){

this.setPhase(AppPhase.INITIALIZING)

}

markInitialized(){

this.initialized=true
this.setPhase(AppPhase.INITIALIZED)

}

markStarting(){

this.setPhase(AppPhase.STARTING)

}

markRunning(){

this.running=true
this.paused=false

this.startTime=performance.now()

this.setPhase(AppPhase.RUNNING)

this.emit('running')

}

markPausing(){

this.setPhase(AppPhase.PAUSING)

}

markPaused(){

this.running=false
this.paused=true

this.pauseTime=performance.now()

this.setPhase(AppPhase.PAUSED)

this.emit('paused')

}

markResuming(){

this.setPhase(AppPhase.RESUMING)

}

markResumed(){

this.running=true
this.paused=false

this.resumeTime=performance.now()

this.setPhase(AppPhase.RUNNING)

this.emit('resumed')

}

markStopping(){

this.setPhase(AppPhase.STOPPING)

}

markStopped(){

this.running=false

this.stopTime=performance.now()

this.setPhase(AppPhase.STOPPED)

this.emit('stopped')

}

markDestroying(){

this.setPhase(AppPhase.DESTROYING)

}

markDestroyed(){

this.destroyed=true
this.running=false

this.setPhase(AppPhase.DESTROYED)

this.emit('destroyed')

}

markError(error){

this.error=error

this.setPhase(AppPhase.ERROR)

this.emit('error',error)

}

step(dt,time){

if(!this.running)return

this.delta=dt
this.time=time

this.frame++

this.metrics.frameTime=dt

this.updateFPS(dt)

this.emit('step',dt,time,this.frame)

}

updateFPS(dt){

this._fpsAccumulator+=dt
this._fpsFrames++

if(this._fpsAccumulator>=0.5){

this.metrics.fps=this._fpsFrames/this._fpsAccumulator

this._fpsAccumulator=0
this._fpsFrames=0

this.emit('fps',this.metrics.fps)

}

}

setVisible(visible){

this.flags.visible=visible

this.emit('visible',visible)

}

setFocused(focused){

this.flags.focused=focused

this.emit('focused',focused)

}

setReady(ready=true){

this.flags.ready=ready

this.emit('ready',ready)

}

setBackground(background){

this.flags.background=background

this.emit('background',background)

}

setMemory(bytes){

this.metrics.memory=bytes

this.emit('memory',bytes)

}

setCPUTime(ms){

this.metrics.cpuTime=ms

this.emit('cpu',ms)

}

setGPUTime(ms){

this.metrics.gpuTime=ms

this.emit('gpu',ms)

}

reset(){

this.frame=0
this.time=0
this.delta=0

this.metrics.fps=0
this.metrics.frameTime=0

this._fpsAccumulator=0
this._fpsFrames=0

this.emit('reset')

}

isRunning(){

return this.phase===AppPhase.RUNNING

}

isPaused(){

return this.phase===AppPhase.PAUSED

}

isInitialized(){

return this.initialized

}

isDestroyed(){

return this.destroyed

}

destroy(){

if(this.destroyed)return

this.markDestroying()

this.removeAllListeners()

this.markDestroyed()

}

}
