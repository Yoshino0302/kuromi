import { Engine } from './core/EngineCore.js'
import { ValentineScene } from './scenes/ValentineScene.js'
import { Logger } from './utils/Logger.js'
class Application{
constructor(){
this.engine=null
this.scene=null
this._boot()}
_boot(){
Logger.info('Application boot')
this.engine=new Engine({
containerId:'app',
debug:true})
this.scene=new ValentineScene(this.engine)
this.engine.setScene(this.scene)
this.engine.start()
Logger.info('Application started Valentine cinematic experience')}}
window.addEventListener('DOMContentLoaded',()=>{
new Application()})
