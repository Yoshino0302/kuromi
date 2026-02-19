
import {EngineCore} from './core/EngineCore.js'
import {IntroScene} from './scenes/IntroScene.js'
const canvas=document.getElementById("app")
const engine=new EngineCore(canvas)
const scene=new IntroScene(engine)
engine.sceneManager.set(scene)
engine.start()
window.engine=engine
