import { Engine } from './core/Engine.js'

let engineInstance=null
let bootPromise=null
let shutdownPromise=null
let bootState='idle'
let shutdownState='idle'

const engineEvents=new Set()

const engineConfig={
debug:true,
autoStart:true,
exposeGlobal:true,
canvas:null,
maxPixelRatio:Math.min(window.devicePixelRatio||1,2)
}

function emit(event,data){
for(const cb of engineEvents){
try{cb(event,data)}catch(e){console.warn('[KUROMI ENGINE] Event listener error',e)}
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
return bootState==='running'
}

export function isEngineBooting(){
return bootState==='booting'
}

export function isEngineShutdown(){
return shutdownState==='complete'
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
let canvas=document.querySelector('canvas')
if(canvas)return canvas
canvas=document.createElement('canvas')
canvas.id='kuromi-engine-canvas'
canvas.style.width='100%'
canvas.style.height='100%'
canvas.style.display='block'
document.body.appendChild(canvas)
return canvas
}

async function createEngine(){
const canvas=resolveCanvas()
const engine=new Engine({
canvas,
config:engineConfig,
debug:engineConfig.debug
})
if(typeof engine.init==='function'){
await engine.init()
}
if(typeof engine.start==='function'){
await engine.start()
}
return engine
}

async function bootInternal(){
if(engineInstance)return engineInstance
bootState='booting'
emit('boot:start',null)
try{
engineInstance=await createEngine()
exposeGlobal(engineInstance)
bootState='running'
emit('boot:complete',engineInstance)
return engineInstance
}catch(err){
engineInstance=null
bootState='idle'
emit('boot:error',err)
console.error('[KUROMI ENGINE] Boot failed:',err)
throw err
}
}

export async function bootEngine(){
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
shutdownPromise=new Promise(async(resolve)=>{
shutdownState='shutting'
emit('shutdown:start',engineInstance)
try{
if(typeof engineInstance.shutdown==='function'){
await engineInstance.shutdown()
}
if(typeof engineInstance.dispose==='function'){
engineInstance.dispose()
}
}catch(e){
console.warn('[KUROMI ENGINE] Shutdown warning:',e)
}
clearGlobal()
engineInstance=null
bootState='idle'
shutdownState='complete'
emit('shutdown:complete',null)
shutdownPromise=null
resolve()
})
return shutdownPromise
}

export async function restartEngine(){
await shutdownEngine()
return bootEngine()
}

function installLifecycleHooks(){
window.addEventListener('beforeunload',shutdownEngine)
window.addEventListener('pagehide',shutdownEngine)
window.addEventListener('visibilitychange',()=>{
emit('visibility',document.visibilityState)
})
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
