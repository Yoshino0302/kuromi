import {Engine} from '../core/Engine.js'
import {EngineState} from '../core/EngineState.js'
import {App} from './App.js'
import {EventEmitter} from '../utils/EventEmitter.js'

export class AppBootstrap extends EventEmitter{

constructor(options={}){

super()

this.options=options

this.engine=null
this.state=null
this.app=null

this.container=null
this.canvas=null

this.booted=false
this.started=false
this.destroyed=false

this._bootPromise=null
this._startPromise=null
this._shutdownPromise=null

this._boundVisibility=this._handleVisibility.bind(this)
this._boundBeforeUnload=this._handleBeforeUnload.bind(this)

}

async boot(){

if(this.booted)return this
if(this._bootPromise)return this._bootPromise

this._bootPromise=this._bootInternal()

return this._bootPromise

}

async _bootInternal(){

this.emit('boot:start')

this._resolveDOM()

this.state=new EngineState()

this.engine=new Engine({
canvas:this.canvas,
container:this.container,
debug:this.options.debug===true,
config:this.options.config||{}
})

await this.engine.init()

this.app=new App(
this.engine,
this.state,
this.options.app||{}
)

await this.app.initialize()

this._bindState()

this._installDOMHooks()

this.booted=true

this.emit('boot:complete',this)

return this

}

async start(){

if(this.started)return this
if(this._startPromise)return this._startPromise

this._startPromise=this._startInternal()

return this._startPromise

}

async _startInternal(){

if(!this.booted){

await this.boot()

}

this.emit('start')

await this.engine.start()

await this.app.start()

this.started=true

return this

}

pause(){

if(!this.engine)return

this.engine.pause()

}

resume(){

if(!this.engine)return

this.engine.resume()

}

stop(){

if(!this.engine)return

this.engine.stop()

}

async shutdown(){

if(this.destroyed)return
if(this._shutdownPromise)return this._shutdownPromise

this._shutdownPromise=this._shutdownInternal()

return this._shutdownPromise

}

async _shutdownInternal(){

this.emit('shutdown:start')

this._removeDOMHooks()

await this.app?.destroy?.()

await this.engine?.shutdown?.()

this.engine=null
this.app=null
this.state=null

this.booted=false
this.started=false
this.destroyed=true

this.emit('shutdown:complete')

}

_bindState(){

const engine=this.engine
const state=this.state

engine.on('init:start',()=>{
state.setPhase?.(1)
})

engine.on('init:complete',()=>{
state.markInitialized?.()
})

engine.on('start',()=>{
state.markRunning?.()
})

engine.on('pause',()=>{
state.markPaused?.()
})

engine.on('resume',()=>{
state.markResumed?.()
})

engine.on('stop',()=>{
state.markStopped?.()
})

engine.on('shutdown:complete',()=>{
state.markDestroyed?.()
})

engine.on('frame:start',(delta)=>{

state.delta=delta
state.time=engine.getTime?.()||0
state.frame=engine.getFrame?.()||0

})

}

_resolveDOM(){

this.container=
this.options.container||
document.body

this.canvas=
this.options.canvas||
this._createCanvas()

if(!this.canvas.parentNode){

this.container.appendChild(this.canvas)

}

}

_createCanvas(){

const canvas=document.createElement('canvas')

canvas.style.width='100%'
canvas.style.height='100%'
canvas.style.display='block'

return canvas

}

_installDOMHooks(){

document.addEventListener(
'visibilitychange',
this._boundVisibility,
{passive:true}
)

window.addEventListener(
'beforeunload',
this._boundBeforeUnload,
{passive:true}
)

}

_removeDOMHooks(){

document.removeEventListener(
'visibilitychange',
this._boundVisibility
)

window.removeEventListener(
'beforeunload',
this._boundBeforeUnload
)

}

_handleVisibility(){

if(document.hidden){

this.pause()

}else{

this.resume()

}

}

_handleBeforeUnload(){

this.shutdown()

}

getEngine(){

return this.engine

}

getState(){

return this.state

}

getApp(){

return this.app

}

isRunning(){

return this.engine?.isRunning?.()||false

}

}
