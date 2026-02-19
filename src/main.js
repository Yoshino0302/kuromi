import { EngineCore } from './core/EngineCore.js'
import { ValentineScene } from './scenes/ValentineScene.js'
import { Logger } from './utils/Logger.js'
class Application{
constructor(){
this.engine=null
this.scene=null
this._boot()}
_boot(){
Logger.info('Application boot')
this.engine=new EngineCore({
containerId:'app',
debug:true})
this.scene=new ValentineScene(this.engine)
this.engine.sceneManager.setScene(this.scene)
this.engine.start()
Logger.info('Valentine cinematic experience started')}}
window.addEventListener('DOMContentLoaded',()=>{
new Application()})
