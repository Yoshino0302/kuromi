import {Engine} from '../core/Engine.js'
import {EngineConfig} from '../core/EngineConfig.js'
import {Lifecycle} from '../core/Lifecycle.js'
import {App} from './App.js'
import {AppState} from './AppState.js'
import {RendererConfig} from '../config/RendererConfig.js'
import {CameraConfig} from '../config/CameraConfig.js'
import {LightingConfig} from '../config/LightingConfig.js'
export class AppBootstrap{
static instance=null
static async boot(options={}){
if(AppBootstrap.instance)return AppBootstrap.instance
const bootstrap=new AppBootstrap(options)
AppBootstrap.instance=bootstrap
await bootstrap.initialize()
return bootstrap
}
constructor(options){
this.options=options
this.engine=null
this.app=null
this.state=new AppState()
this.lifecycle=new Lifecycle()
this.container=null
this.resizeObserver=null
this.boundResize=this.handleResize.bind(this)
this.boundVisibility=this.handleVisibility.bind(this)
this.boundUpdate=this.update.bind(this)
this.boundPause=this.pause.bind(this)
this.boundResume=this.resume.bind(this)
this.boundStop=this.stop.bind(this)
}
async initialize(){
this.resolveContainer()
const engineConfig=new EngineConfig(this.options.engine||{})
const rendererConfig=new RendererConfig(this.options.renderer||{})
const cameraConfig=new CameraConfig(this.options.camera||{})
const lightingConfig=new LightingConfig(this.options.lighting||{})
this.engine=new Engine({engineConfig,rendererConfig,cameraConfig,lightingConfig,container:this.container,state:this.state})
await this.engine.initialize()
this.app=new App(this.engine,this.state,this.options.app||{})
await this.app.initialize()
this.setupObservers()
this.setupLifecycle()
this.handleResize()
await this.engine.start()
await this.app.start()
this.lifecycle.start()
}
resolveContainer(){
if(this.options.container instanceof HTMLElement)this.container=this.options.container
else if(typeof this.options.container==='string')this.container=document.getElementById(this.options.container)
if(!this.container)this.container=document.getElementById('app')||document.body
}
setupObservers(){
this.resizeObserver=new ResizeObserver(this.boundResize)
this.resizeObserver.observe(this.container)
document.addEventListener('visibilitychange',this.boundVisibility,{passive:true})
window.addEventListener('error',e=>this.handleError(e.error||e),{passive:true})
window.addEventListener('unhandledrejection',e=>this.handleError(e.reason),{passive:true})
}
setupLifecycle(){
this.lifecycle.on('update',this.boundUpdate)
this.lifecycle.on('pause',this.boundPause)
this.lifecycle.on('resume',this.boundResume)
this.lifecycle.on('stop',this.boundStop)
}
update(dt){
if(this.engine)this.engine.update(dt)
if(this.app)this.app.update(dt)
}
pause(){
if(this.engine)this.engine.pause()
if(this.app)this.app.pause()
}
resume(){
if(this.engine)this.engine.resume()
if(this.app)this.app.resume()
}
stop(){
if(this.resizeObserver){this.resizeObserver.disconnect();this.resizeObserver=null}
document.removeEventListener('visibilitychange',this.boundVisibility)
if(this.engine)this.engine.stop()
if(this.app)this.app.stop()
this.lifecycle.stop()
}
handleResize(){
if(!this.container||!this.engine)return
const rect=this.container.getBoundingClientRect()
const width=Math.max(1,Math.floor(rect.width))
const height=Math.max(1,Math.floor(rect.height))
const dpr=window.devicePixelRatio||1
this.engine.resize(width,height,dpr)
}
handleVisibility(){
if(document.hidden)this.pause()
else this.resume()
}
handleError(error){
console.error('[KUROMI ENGINE FATAL]',error)
this.state.set('fatalError',error)
this.pause()
}
}
export async function bootApp(options){return AppBootstrap.boot(options)}
if(document.readyState==='complete'||document.readyState==='interactive'){
queueMicrotask(()=>{AppBootstrap.boot().catch(e=>console.error(e))})
}else{
window.addEventListener('DOMContentLoaded',()=>{AppBootstrap.boot().catch(e=>console.error(e))},{once:true})
}
