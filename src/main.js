/*
FILE: src/main.js
ROLE: Engine entry point compatible with EngineCore API
*/
import { EngineCore } from './core/EngineCore.js'
import { ValentineScene } from './scenes/ValentineScene.js'
import { Logger } from './utils/Logger.js'
class Application{
constructor(){
this.engine=null
this._boot()}
async _boot(){
Logger.info('Application boot')
this.engine=new EngineCore({
containerId:'app',
debug:true})
await this.engine.loadScene(ValentineScene)
this.engine.start()
Logger.info('Valentine cinematic experience started')}}
window.addEventListener('DOMContentLoaded',()=>{
new Application()})
