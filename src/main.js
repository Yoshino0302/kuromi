import { Engine } from './core/Engine.js'

const ENGINE_STATES={
IDLE:0,
BOOTING:1,
RUNNING:2,
SUSPENDED:3,
SHUTTING_DOWN:4,
DISPOSED:5,
FAILED:6
}

let engineInstance=null
let engineState=ENGINE_STATES.IDLE

let bootPromise=null
let shutdownPromise=null

let bootToken=0
let shutdownToken=0

let contextLost=false
let visibilityState=document.visibilityState

const engineEvents=new Set()

const engineConfig={
debug:false,
autoStart:true,
exposeGlobal:true,
canvas:null,
maxPixelRatio:Math.min(window.devicePixelRatio||1,2),
suspendOnHidden:true,
resumeOnVisible:true,
recoverContext:true,
bootTimeout:30000,
shutdownTimeout:10000
}

function emit(event,data){

for(const cb of engineEvents){

try{

cb(event,data)

}catch(e){

console.warn('[KUROMI ENGINE EVENT ERROR]',e)

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

let canvas=document.getElementById('kuromi-engine-canvas')

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
canvas.style.touchAction='none'

canvas.tabIndex=-1

document.body.appendChild(canvas)

return canvas

}

function installContextRecovery(canvas){

if(!engineConfig.recoverContext)return

canvas.addEventListener(
'webglcontextlost',
(event)=>{

event.preventDefault()

contextLost=true

engineState=ENGINE_STATES.SUSPENDED

emit('context:lost',null)

},
{passive:false}
)

canvas.addEventListener(
'webglcontextrestored',
()=>{

contextLost=false

emit('context:restored',null)

restartEngine()

},
{passive:true}
)

}

async function createEngine(token){

const canvas=resolveCanvas()

installContextRecovery(canvas)

const engine=new Engine({
canvas,
config:engineConfig,
debug:engineConfig.debug,
maxPixelRatio:engineConfig.maxPixelRatio
})

await engine.init()

if(token!==bootToken){

await engine.shutdown?.()

throw new Error('Boot invalidated')

}

await engine.start()

return engine

}

async function bootInternal(){

if(engineInstance)return engineInstance

bootToken++

const token=bootToken

engineState=ENGINE_STATES.BOOTING

emit('boot:start',null)

try{

const engine=await Promise.race([
createEngine(token),
new Promise((_,reject)=>setTimeout(()=>{
reject(new Error('Boot timeout'))
},engineConfig.bootTimeout))
])

if(token!==bootToken){

await engine.shutdown?.()

throw new Error('Boot invalidated')

}

engineInstance=engine

exposeGlobal(engineInstance)

engineState=ENGINE_STATES.RUNNING

emit('boot:complete',engineInstance)

return engineInstance

}catch(err){

engineInstance=null

engineState=ENGINE_STATES.FAILED

emit('boot:error',err)

console.error('[KUROMI ENGINE BOOT FAILED]',err)

throw err

}

}

export async function bootEngine(){

if(engineState===ENGINE_STATES.RUNNING)return engineInstance

if(bootPromise)return bootPromise

bootPromise=(async()=>{

if(document.visibilityState==='hidden'){

await new Promise(resolve=>{

const onVisible=()=>{

document.removeEventListener(
'visibilitychange',
onVisible
)

resolve()

}

document.addEventListener(
'visibilitychange',
onVisible,
{once:true}
)

})

}

return bootInternal()

})()

try{

return await bootPromise

}finally{

bootPromise=null

}

}

export async function shutdownEngine(){

if(!engineInstance)return

if(shutdownPromise)return shutdownPromise

shutdownToken++

const token=shutdownToken

engineState=ENGINE_STATES.SHUTTING_DOWN

shutdownPromise=(async()=>{

emit('shutdown:start',engineInstance)

const engine=engineInstance

engineInstance=null

clearGlobal()

try{

await Promise.race([

(async()=>{

engine.stop?.()

await engine.shutdown?.()

engine.dispose?.()

}),

new Promise((_,reject)=>setTimeout(()=>{
reject(new Error('Shutdown timeout'))
},engineConfig.shutdownTimeout))

])

}catch(e){

console.warn('[KUROMI ENGINE SHUTDOWN WARNING]',e)

}

if(token!==shutdownToken)return

engineState=ENGINE_STATES.DISPOSED

emit('shutdown:complete',null)

})()

try{

await shutdownPromise

}finally{

shutdownPromise=null

}

}

export async function restartEngine(){

await shutdownEngine()

engineState=ENGINE_STATES.IDLE

return bootEngine()

}

function installVisibilityHandler(){

document.addEventListener(
'visibilitychange',
()=>{

visibilityState=document.visibilityState

emit('visibility',visibilityState)

const engine=engineInstance

if(!engine)return

if(
engineConfig.suspendOnHidden &&
visibilityState==='hidden'
){

engine.stop?.()

engineState=ENGINE_STATES.SUSPENDED

}

if(
engineConfig.resumeOnVisible &&
visibilityState==='visible' &&
!contextLost
){

engine.start?.()

engineState=ENGINE_STATES.RUNNING

}

}
)

}

function installLifecycleHooks(){

window.addEventListener(
'beforeunload',
shutdownEngine,
{passive:true}
)

window.addEventListener(
'pagehide',
shutdownEngine,
{passive:true}
)

window.addEventListener(
'error',
(event)=>{

emit('error',event.error)

console.error('[KUROMI ENGINE RUNTIME ERROR]',event.error)

}
)

window.addEventListener(
'unhandledrejection',
(event)=>{

emit('rejection',event.reason)

console.error('[KUROMI ENGINE PROMISE REJECTION]',event.reason)

}
)

}

function installHotReloadGuard(){

if(import.meta?.hot){

import.meta.hot.dispose(()=>{

shutdownEngine()

})

}

}

function autoBoot(){

if(!engineConfig.autoStart)return

if(document.readyState==='loading'){

document.addEventListener(
'DOMContentLoaded',
bootEngine,
{once:true}
)

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
