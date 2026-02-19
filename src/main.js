import { Engine } from './core/Engine.js'

const ENGINE_STATES={
IDLE:0,
BOOTING:1,
RUNNING:2,
SHUTTING_DOWN:3,
DISPOSED:4
}

let engineInstance=null
let engineState=ENGINE_STATES.IDLE

let bootPromise=null
let shutdownPromise=null

const engineEvents=new Set()

const engineConfig={
debug:false,
autoStart:true,
exposeGlobal:true,
canvas:null,
maxPixelRatio:Math.min(window.devicePixelRatio||1,2),
suspendOnHidden:true,
resumeOnVisible:true,
recoverContext:true
}

let visibilityState=document.visibilityState
let contextLost=false

function emit(event,data){
for(const cb of engineEvents){
try{
cb(event,data)
}catch(e){
console.warn('[KUROMI ENGINE] Event error',e)
}
}
}

export function onEngineEvent(callback){
engineEvents.add(callback)
return()=>engineEvents.delete(callback)
}

export function getEngine(){
return engineInstance
}

export function isEngineRunning(){
return engineState===ENGINE_STATES.RUNNING
}

export function isEngineBooting(){
return engineState===ENGINE_STATES.BOOTING
}

export function isEngineShutdown(){
return engineState===ENGINE_STATES.DISPOSED
}

export function configureEngine(config={}){
Object.assign(engineConfig,config)
}

function exposeGlobal(engine){
if(!engineConfig.exposeGlobal)return
try{
Object.defineProperty(window,'engine',{
value:engine,
configurable:true
})
}catch{
window.engine=engine
}
}

function clearGlobal(){
try{
delete window.engine
}catch{
window.engine=null
}
}

function resolveCanvas(){
if(engineConfig.canvas)return engineConfig.canvas
let canvas=document.querySelector('#kuromi-engine-canvas')
if(canvas)return canvas
canvas=document.createElement('canvas')
canvas.id='kuromi-engine-canvas'
canvas.style.position='fixed'
canvas.style.top='0'
canvas.style.left='0'
canvas.style.width='100%'
canvas.style.height='100%'
canvas.style.display='block'
canvas.style.outline='none'
canvas.tabIndex=-1
document.body.appendChild(canvas)
return canvas
}

function installContextRecovery(canvas){
if(!engineConfig.recoverContext)return
canvas.addEventListener('webglcontextlost',(event)=>{
event.preventDefault()
contextLost=true
emit('context:lost',null)
console.warn('[KUROMI ENGINE] WebGL context lost')
})
canvas.addEventListener('webglcontextrestored',()=>{
contextLost=false
emit('context:restored',null)
restartEngine()
console.warn('[KUROMI ENGINE] WebGL context restored')
})
}

async function createEngine(){
const canvas=resolveCanvas()
installContextRecovery(canvas)
const engine=new Engine({
canvas,
config:engineConfig,
debug:engineConfig.debug,
maxPixelRatio:engineConfig.maxPixelRatio
})
if(engine.init)await engine.init()
if(engine.start)await engine.start()
return engine
}

async function bootInternal(){
if(engineInstance)return engineInstance
engineState=ENGINE_STATES.BOOTING
emit('boot:start',null)
try{
engineInstance=await createEngine()
exposeGlobal(engineInstance)
engineState=ENGINE_STATES.RUNNING
emit('boot:complete',engineInstance)
return engineInstance
}catch(err){
engineInstance=null
engineState=ENGINE_STATES.IDLE
emit('boot:error',err)
console.error('[KUROMI ENGINE] Boot failed:',err)
throw err
}
}

export async function bootEngine(){
if(engineState===ENGINE_STATES.RUNNING)return engineInstance
if(bootPromise)return bootPromise
bootPromise=new Promise(async(resolve,reject)=>{
try{
if(document.visibilityState==='hidden'){
const onVisible=()=>{
document.removeEventListener('visibilitychange',onVisible)
bootInternal().then(resolve).catch(reject)
}
document.addEventListener('visibilitychange',onVisible,{once:true})
return
}
const engine=await bootInternal()
resolve(engine)
}catch(e){
reject(e)
}finally{
bootPromise=null
}
})
return bootPromise
}

export async function shutdownEngine(){
if(!engineInstance)return
if(shutdownPromise)return shutdownPromise
engineState=ENGINE_STATES.SHUTTING_DOWN
shutdownPromise=new Promise(async(resolve)=>{
emit('shutdown:start',engineInstance)
try{
if(engineInstance.stop)engineInstance.stop()
if(engineInstance.shutdown)await engineInstance.shutdown()
if(engineInstance.dispose)engineInstance.dispose()
}catch(e){
console.warn('[KUROMI ENGINE] Shutdown warning:',e)
}
clearGlobal()
engineInstance=null
engineState=ENGINE_STATES.DISPOSED
emit('shutdown:complete',null)
shutdownPromise=null
resolve()
})
return shutdownPromise
}

export async function restartEngine(){
await shutdownEngine()
engineState=ENGINE_STATES.IDLE
return bootEngine()
}

function installVisibilityHandler(){
document.addEventListener('visibilitychange',()=>{
const newState=document.visibilityState
emit('visibility',newState)
if(!engineInstance)return
if(engineConfig.suspendOnHidden&&newState==='hidden'){
if(engineInstance.pause)engineInstance.pause()
}
if(engineConfig.resumeOnVisible&&newState==='visible'){
if(engineInstance.resume)engineInstance.resume()
}
visibilityState=newState
})
}

function installLifecycleHooks(){
window.addEventListener('beforeunload',shutdownEngine)
window.addEventListener('pagehide',shutdownEngine)
window.addEventListener('error',(event)=>{
emit('error',event.error)
console.error('[KUROMI ENGINE] Runtime error:',event.error)
})
window.addEventListener('unhandledrejection',(event)=>{
emit('rejection',event.reason)
console.error('[KUROMI ENGINE] Promise rejection:',event.reason)
})
}

function installHotReloadGuard(){
if(import.meta&&import.meta.hot){
import.meta.hot.dispose(()=>{
shutdownEngine()
})
}
}

function autoBoot(){
if(!engineConfig.autoStart)return
if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',bootEngine,{once:true})
}else{
bootEngine()
}
}

installLifecycleHooks()
installHotReloadGuard()
installVisibilityHandler()
autoBoot()

export default{
boot:bootEngine,
shutdown:shutdownEngine,
restart:restartEngine,
get:getEngine,
configure:configureEngine,
running:isEngineRunning,
booting:isEngineBooting,
shutdownState:isEngineShutdown,
onEvent:onEngineEvent
}
