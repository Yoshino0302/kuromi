import {EventEmitter} from '../utils/EventEmitter.js'

export const EnginePhase=Object.freeze({
CREATED:0,
INITIALIZING:1,
INITIALIZED:2,
STARTING:3,
RUNNING:4,
PAUSED:5,
STOPPING:6,
STOPPED:7,
DESTROYED:8,
ERROR:9
})

export class EngineState extends EventEmitter{

constructor(){

super()

this.phase=EnginePhase.CREATED
this.previousPhase=EnginePhase.CREATED

this.frame=0
this.time=0
this.delta=0

this.fixedDelta=1/60
this.accumulator=0

this.timeScale=1
this.maxDelta=0.25

this.startTime=0
this.lastTime=0
this.pauseTime=0
this.resumeTime=0

this.running=false
this.paused=false
this.stopped=false
this.destroyed=false

this.error=null

this.flags={
initialized:false,
started:false,
ready:false,
visible:true,
focused:true
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

Object.seal(this)

}

setPhase(newPhase){

if(this.phase===newPhase)return

this.previousPhase=this.phase
this.phase=newPhase

this.emit('phase',newPhase,this.previousPhase)
this.emit(`phase:${newPhase}`,newPhase,this.previousPhase)

}

markInitializing(){

this.setPhase(EnginePhase.INITIALIZING)

}

markInitialized(){

this.flags.initialized=true

this.setPhase(EnginePhase.INITIALIZED)

}

markStarting(){

this.flags.started=true

this.setPhase(EnginePhase.STARTING)

}

markRunning(){

const now=performance.now()

this.running=true
this.paused=false
this.stopped=false

this.startTime=now
this.lastTime=now

this.setPhase(EnginePhase.RUNNING)

}

markPaused(){

if(this.paused)return

this.paused=true
this.running=false

this.pauseTime=performance.now()

this.setPhase(EnginePhase.PAUSED)

}

markResumed(){

if(!this.paused)return

this.paused=false
this.running=true

this.resumeTime=performance.now()
this.lastTime=this.resumeTime

this.setPhase(EnginePhase.RUNNING)

}

markStopping(){

this.running=false

this.setPhase(EnginePhase.STOPPING)

}

markStopped(){

this.running=false
this.stopped=true

this.setPhase(EnginePhase.STOPPED)

}

markDestroyed(){

if(this.destroyed)return

this.destroyed=true
this.running=false
this.paused=false
this.stopped=true

this.setPhase(EnginePhase.DESTROYED)

}

markError(error){

this.error=error||new Error('Engine error')

this.running=false

this.setPhase(EnginePhase.ERROR)

this.emit('error',this.error)

}

step(now){

if(this.destroyed)return false
if(this.stopped)return false
if(!this.running)return false

const rawDelta=(now-this.lastTime)*0.001

this.lastTime=now

if(rawDelta<=0)return false

const clampedDelta=rawDelta>this.maxDelta?this.maxDelta:rawDelta

const scaledDelta=clampedDelta*this.timeScale

this.delta=scaledDelta

this.time+=scaledDelta

this.frame++

this.accumulator+=scaledDelta

this.metrics.frameTime=scaledDelta

this._updateFPS(scaledDelta)

this.emit('step',scaledDelta,this.time,this.frame)

return true

}

_updateFPS(delta){

this._fpsAccumulator+=delta
this._fpsFrames++

if(this._fpsAccumulator>=0.5){

this.metrics.fps=this._fpsFrames/this._fpsAccumulator

this._fpsAccumulator=0
this._fpsFrames=0

}

}

consumeFixedStep(){

if(this.accumulator>=this.fixedDelta){

this.accumulator-=this.fixedDelta

return this.fixedDelta

}

return 0

}

setTimeScale(scale){

const safe=scale<0?0:scale

if(this.timeScale===safe)return

this.timeScale=safe

this.emit('timescale',safe)

}

setFixedDelta(dt){

if(dt<=0)return

this.fixedDelta=dt

}

setMaxDelta(dt){

if(dt<=0)return

this.maxDelta=dt

}

setVisible(visible){

if(this.flags.visible===visible)return

this.flags.visible=visible

this.emit('visible',visible)

}

setFocused(focused){

if(this.flags.focused===focused)return

this.flags.focused=focused

this.emit('focused',focused)

}

setReady(ready=true){

if(this.flags.ready===ready)return

this.flags.ready=ready

this.emit('ready',ready)

}

setMemoryUsage(bytes){

this.metrics.memory=bytes||0

}

setCPUTime(ms){

this.metrics.cpuTime=ms||0

}

setGPUTime(ms){

this.metrics.gpuTime=ms||0

}

reset(){

this.frame=0
this.time=0
this.delta=0
this.accumulator=0

this.metrics.fps=0
this.metrics.frameTime=0

this._fpsAccumulator=0
this._fpsFrames=0

}

isRunning(){

return this.phase===EnginePhase.RUNNING

}

isPaused(){

return this.phase===EnginePhase.PAUSED

}

isStopped(){

return this.phase===EnginePhase.STOPPED

}

isDestroyed(){

return this.phase===EnginePhase.DESTROYED

}

destroy(){

if(this.destroyed)return

this.markDestroyed()

this.removeAllListeners()

}

}
