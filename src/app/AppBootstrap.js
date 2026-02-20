import {Engine} from '../core/Engine.js'
import {EngineState} from '../core/EngineState.js'
import {createEngineConfig} from '../config/EngineConfig.js'
import {App} from './App.js'
import {AppState} from './AppState.js'
import {EventEmitter} from '../utils/EventEmitter.js'

export class AppBootstrap extends EventEmitter{

constructor(options={}){

super()

this.options=options

this.engine=null
this.engineState=null

this.app=null
this.appState=null

this.config=null

this.initialized=false
this.started=false
this.destroyed=false

this.container=null
this.canvas=null

}

async initialize(options={}){

if(this.initialized||this.destroyed)return

this.config=createEngineConfig(options.engine||{})

this.resolveContainer(options.container)

this.resolveCanvas(options.canvas)

this.engineState=new EngineState()

this.appState=new AppState()

this.engine=new Engine(this.config,this.engineState)

this.app=new App(this.engine,this.appState,options.app||{})

await this.engine.initialize({
container:this.container,
canvas:this.canvas
})

await this.app.initialize()

this.bindEvents()

this.initialized=true

this.emit('initialized',this)

return this

}

resolveContainer(container){

if(typeof container==='string'){

this.container=document.querySelector(container)

}else if(container instanceof HTMLElement){

this.container=container

}else{

this.container=document.body

}

}

resolveCanvas(canvas){

if(typeof canvas==='string'){

this.canvas=document.querySelector(canvas)

}else if(canvas instanceof HTMLCanvasElement){

this.canvas=canvas

}else{

this.canvas=document.createElement('canvas')

this.container.appendChild(this.canvas)

}

}

bindEvents(){

this.engine.on('start',()=>{

this.emit('engine:start')

})

this.engine.on('stop',()=>{

this.emit('engine:stop')

})

this.app.on('started',()=>{

this.emit('app:started')

})

this.app.on('stopped',()=>{

this.emit('app:stopped')

})

}

async start(){

if(this.started||this.destroyed)return

if(!this.initialized){

await this.initialize(this.options)

}

await this.engine.start()

await this.app.start()

this.started=true

this.emit('started',this)

}

pause(){

if(this.destroyed)return

this.engine.pause()

this.app.pause()

this.emit('paused',this)

}

resume(){

if(this.destroyed)return

this.engine.resume()

this.app.resume()

this.emit('resumed',this)

}

stop(){

if(!this.started||this.destroyed)return

this.app.stop()

this.engine.stop()

this.started=false

this.emit('stopped',this)

}

destroy(){

if(this.destroyed)return

this.stop()

this.app?.destroy()

this.engine?.destroy()

this.removeCanvas()

this.engine=null
this.app=null
this.engineState=null
this.appState=null

this.initialized=false
this.started=false
this.destroyed=true

this.emit('destroyed',this)

this.removeAllListeners()

}

removeCanvas(){

if(
this.canvas&&
this.canvas.parentNode
){

this.canvas.parentNode.removeChild(this.canvas)

}

this.canvas=null

}

getEngine(){

return this.engine

}

getApp(){

return this.app

}

getConfig(){

return this.config

}

isInitialized(){

return this.initialized

}

isStarted(){

return this.started

}

isDestroyed(){

return this.destroyed

}

}
