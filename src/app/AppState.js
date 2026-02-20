import {EventEmitter} from '../utils/EventEmitter.js'
import {StateMachine} from '../utils/StateMachine.js'

export const AppPhase=Object.freeze({
CREATED:0,
BOOTSTRAPPING:1,
BOOTSTRAPPED:2,
INITIALIZING:3,
INITIALIZED:4,
STARTING:5,
RUNNING:6,
PAUSED:7,
RESUMING:8,
STOPPING:9,
STOPPED:10,
SHUTTING_DOWN:11,
SHUTDOWN:12,
ERROR:13,
DESTROYED:14
})

export class AppState extends EventEmitter{

constructor(app){

super()

this.app=app

this.phase=AppPhase.CREATED
this.previousPhase=null

this.frame=0
this.time=0
this.delta=0

this.running=false
this.paused=false
this.initialized=false
this.destroyed=false
this.bootstrapped=false

this.visibility=true
this.focus=true

this.metrics={
fps:0,
frameTime:0,
memory:0,
cpu:0,
gpu:0
}

this._machine=new StateMachine({context:this})

this._configureStateMachine()

}

_configureStateMachine(){

this._machine.addState('created',{
onEnter:()=>this._setPhase(AppPhase.CREATED)
})

this._machine.addState('bootstrapping',{
onEnter:()=>this._setPhase(AppPhase.BOOTSTRAPPING)
})

this._machine.addState('bootstrapped',{
onEnter:()=>{
this.bootstrapped=true
this._setPhase(AppPhase.BOOTSTRAPPED)
}
})

this._machine.addState('initializing',{
onEnter:()=>this._setPhase(AppPhase.INITIALIZING)
})

this._machine.addState('initialized',{
onEnter:()=>{
this.initialized=true
this._setPhase(AppPhase.INITIALIZED)
}
})

this._machine.addState('starting',{
onEnter:()=>this._setPhase(AppPhase.STARTING)
})

this._machine.addState('running',{
onEnter:()=>{
this.running=true
this.paused=false
this._setPhase(AppPhase.RUNNING)
}
})

this._machine.addState('paused',{
onEnter:()=>{
this.paused=true
this.running=false
this._setPhase(AppPhase.PAUSED)
}
})

this._machine.addState('resuming',{
onEnter:()=>this._setPhase(AppPhase.RESUMING)
})

this._machine.addState('stopping',{
onEnter:()=>this._setPhase(AppPhase.STOPPING)
})

this._machine.addState('stopped',{
onEnter:()=>{
this.running=false
this._setPhase(AppPhase.STOPPED)
}
})

this._machine.addState('shutting_down',{
onEnter:()=>this._setPhase(AppPhase.SHUTTING_DOWN)
})

this._machine.addState('shutdown',{
onEnter:()=>this._setPhase(AppPhase.SHUTDOWN)
})

this._machine.addState('error',{
onEnter:()=>this._setPhase(AppPhase.ERROR)
})

this._machine.addState('destroyed',{
onEnter:()=>{
this.destroyed=true
this.running=false
this._setPhase(AppPhase.DESTROYED)
}
})

this._machine.setState('created')

}

_setPhase(newPhase){

if(this.phase===newPhase)return

this.previousPhase=this.phase
this.phase=newPhase

this.emit('phase',newPhase,this.previousPhase)

}

bootstrap(){

this._machine.setState('bootstrapping')
this._machine.setState('bootstrapped')

}

initialize(){

this._machine.setState('initializing')
this._machine.setState('initialized')

}

start(){

this._machine.setState('starting')
this._machine.setState('running')

}

pause(){

if(this.paused)return
this._machine.setState('paused')

}

resume(){

this._machine.setState('resuming')
this._machine.setState('running')

}

stop(){

this._machine.setState('stopping')
this._machine.setState('stopped')

}

shutdown(){

this._machine.setState('shutting_down')
this._machine.setState('shutdown')

}

destroy(){

this._machine.setState('destroyed')
this.removeAllListeners()
this.app=null

}

error(err){

this.lastError=err
this.emit('error',err)
this._machine.setState('error')

}

step(delta,time){

this.delta=delta
this.time=time
this.frame++

this.metrics.frameTime=delta

this.emit('step',delta,time,this.frame)

}

setVisibility(visible){

this.visibility=visible

this.emit('visibility',visible)

}

setFocus(focus){

this.focus=focus

this.emit('focus',focus)

}

setFPS(fps){

this.metrics.fps=fps

}

setMemory(bytes){

this.metrics.memory=bytes

}

setCPU(ms){

this.metrics.cpu=ms

}

setGPU(ms){

this.metrics.gpu=ms

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

getPhase(){

return this.phase

}

getMetrics(){

return this.metrics

}

reset(){

this.frame=0
this.time=0
this.delta=0

this.metrics.fps=0
this.metrics.frameTime=0

}

}
