export const LifecyclePhase=Object.freeze({
CREATED:0,
INITIALIZING:1,
INITIALIZED:2,
STARTING:3,
STARTED:4,
STOPPING:5,
STOPPED:6,
DISPOSING:7,
DISPOSED:8
})

export class Lifecycle{

constructor(engine){

if(!engine)throw new Error('Lifecycle requires engine')

this.engine=engine

this.phase=LifecyclePhase.CREATED

this._systems=[]
this._systemMap=new Map()

this._initOrder=[]
this._startOrder=[]
this._stopOrder=[]
this._disposeOrder=[]

this._initialized=false
this._started=false
this._disposed=false

this._initializing=false
this._starting=false
this._stopping=false
this._disposing=false

this._listeners=new Map()

}

register(name,system,options={}){

if(!name)throw new Error('Lifecycle.register: name required')
if(!system)throw new Error('Lifecycle.register: system required')

if(this._systemMap.has(name))return system

const entry={
name,
system,
priority:options.priority??100,
dependsOn:options.dependsOn??[],
autoInit:options.autoInit!==false,
autoStart:options.autoStart!==false,
autoStop:options.autoStop!==false,
autoDispose:options.autoDispose!==false,
initialized:false,
started:false,
disposed:false
}

this._systems.push(entry)
this._systemMap.set(name,entry)

this._sort()

return system

}

get(name){

return this._systemMap.get(name)?.system??null

}

has(name){

return this._systemMap.has(name)

}

async init(){

if(this._initialized)return
if(this._initializing)return

this._initializing=true

this.phase=LifecyclePhase.INITIALIZING

this._emit('init:start')

for(const entry of this._initOrder){

if(!entry.autoInit)continue
if(entry.initialized)continue

await this._safeCall(entry,'init')

entry.initialized=true

this._emit('system:init',entry.name)

}

this._initialized=true
this._initializing=false

this.phase=LifecyclePhase.INITIALIZED

this._emit('init:complete')

}

async start(){

if(this._started)return
if(this._starting)return

this._starting=true

this.phase=LifecyclePhase.STARTING

this._emit('start:start')

for(const entry of this._startOrder){

if(!entry.autoStart)continue
if(entry.started)continue

await this._safeCall(entry,'start')

entry.started=true

this._emit('system:start',entry.name)

}

this._started=true
this._starting=false

this.phase=LifecyclePhase.STARTED

this._emit('start:complete')

}

async stop(){

if(!this._started)return
if(this._stopping)return

this._stopping=true

this.phase=LifecyclePhase.STOPPING

this._emit('stop:start')

for(const entry of this._stopOrder){

if(!entry.autoStop)continue
if(!entry.started)continue

await this._safeCall(entry,'stop')

entry.started=false

this._emit('system:stop',entry.name)

}

this._started=false
this._stopping=false

this.phase=LifecyclePhase.STOPPED

this._emit('stop:complete')

}

async dispose(){

if(this._disposed)return
if(this._disposing)return

this._disposing=true

this.phase=LifecyclePhase.DISPOSING

this._emit('dispose:start')

for(const entry of this._disposeOrder){

if(!entry.autoDispose)continue
if(entry.disposed)continue

await this._safeCall(entry,'dispose')

entry.disposed=true

this._emit('system:dispose',entry.name)

}

this._systems.length=0
this._systemMap.clear()

this._disposed=true
this._disposing=false

this.phase=LifecyclePhase.DISPOSED

this._emit('dispose:complete')

}

async restart(){

await this.stop()
await this.start()

}

_sort(){

this._systems.sort((a,b)=>a.priority-b.priority)

this._initOrder=[...this._systems]
this._startOrder=[...this._systems]
this._stopOrder=[...this._systems].reverse()
this._disposeOrder=[...this._systems].reverse()

}

async _safeCall(entry,method){

const fn=entry.system?.[method]

if(!fn)return

try{

const result=fn.call(entry.system,this.engine)

if(result instanceof Promise){

await result

}

}catch(err){

this._emit('error',{
system:entry.name,
method,
error:err
})

if(this.engine?.debug){

console.error('[Lifecycle Error]',entry.name,method,err)

}

}

}

on(event,fn){

let set=this._listeners.get(event)

if(!set){

set=new Set()
this._listeners.set(event,set)

}

set.add(fn)

return()=>set.delete(fn)

}

_emit(event,data){

const set=this._listeners.get(event)

if(!set)return

for(const fn of set){

fn(data)

}

}

getPhase(){

return this.phase

}

isInitialized(){

return this.phase>=LifecyclePhase.INITIALIZED

}

isStarted(){

return this.phase>=LifecyclePhase.STARTED

}

isDisposed(){

return this.phase===LifecyclePhase.DISPOSED

}

destroy(){

this._systems.length=0
this._systemMap.clear()
this._listeners.clear()
this.engine=null

}

}
