import {Engine} from '../core/Engine.js'
import {AppState} from './AppState.js'
import {Lifecycle} from '../core/Lifecycle.js'

export class AppBootstrap{

constructor(options={}){

this.options=options

this.engine=null
this.state=null
this.lifecycle=null

this.container=options.container||document.body
this.canvas=options.canvas||null

this.autoStart=options.autoStart!==false

this._bootPromise=null
this._started=false
this._destroyed=false

this._boundVisibility=this._handleVisibility.bind(this)
this._boundFocus=this._handleFocus.bind(this)
this._boundBlur=this._handleBlur.bind(this)

}

async boot(){

if(this._bootPromise)return this._bootPromise

this._bootPromise=this._boot()

return this._bootPromise

}

async _boot(){

if(this._destroyed)throw new Error('AppBootstrap destroyed')

this.state=new AppState(this)

this.state.bootstrap()

this.engine=new Engine({
container:this.container,
canvas:this.canvas,
...this.options.engine
})

this.lifecycle=new Lifecycle(this.engine)

this._installDOMHooks()

this.state.initialize()

await this.engine.init()

this.lifecycle.register('engine',this.engine,{
priority:0,
autoInit:false,
autoStart:false
})

this.state.start()

if(this.autoStart){

await this.start()

}

return this

}

async start(){

if(this._started)return

this._started=true

await this.engine.start()

this.state.start()

}

pause(){

if(!this.engine)return

this.engine.pause()

this.state.pause()

}

resume(){

if(!this.engine)return

this.engine.resume()

this.state.resume()

}

stop(){

if(!this.engine)return

this.engine.stop()

this.state.stop()

}

async shutdown(){

if(this._destroyed)return

this.state.shutdown()

await this.lifecycle.dispose()

await this.engine.shutdown()

this._removeDOMHooks()

this.state.destroy()

this.engine=null
this.lifecycle=null

this._destroyed=true

}

_handleVisibility(){

const visible=document.visibilityState==='visible'

this.state.setVisibility(visible)

if(!visible){

this.pause()

}else{

this.resume()

}

}

_handleFocus(){

this.state.setFocus(true)

}

_handleBlur(){

this.state.setFocus(false)

}

_installDOMHooks(){

document.addEventListener(
'visibilitychange',
this._boundVisibility,
{passive:true}
)

window.addEventListener(
'focus',
this._boundFocus,
{passive:true}
)

window.addEventListener(
'blur',
this._boundBlur,
{passive:true}
)

}

_removeDOMHooks(){

document.removeEventListener(
'visibilitychange',
this._boundVisibility
)

window.removeEventListener(
'focus',
this._boundFocus
)

window.removeEventListener(
'blur',
this._boundBlur
)

}

getEngine(){

return this.engine

}

getState(){

return this.state

}

getLifecycle(){

return this.lifecycle

}

isRunning(){

return this.state?.isRunning?.()??false

}

isDestroyed(){

return this._destroyed

}

}
