import { EngineCore } from './core/EngineCore.js'
import { IntroScene } from './scenes/IntroScene.js'
import { ValentineScene } from './scenes/ValentineScene.js'
import { Logger } from './utils/Logger.js'
const canvas=document.querySelector('canvas')||null
const engine=new EngineCore({canvas})
async function boot(){
try{
await engine.init()
await engine.loadScene(IntroScene)
setTimeout(()=>{
engine.loadScene(ValentineScene)
},4000)
engine.start()
window.__ENGINE__=engine
Logger.info('Engine boot complete')}
catch(e){
Logger.error('Engine boot failed',e)}}
boot()
export { engine }
