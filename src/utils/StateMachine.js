export class StateMachine{

constructor(options={}){

this._states=new Map()
this._transitions=new Map()

this._current=null
this._previous=null

this._locked=false

this._context=options.context||this

this._listeners=new Map()

this._transitionQueue=[]

this._processing=false

}

addState(name,config={}){

if(!name)throw new Error('StateMachine: state name required')

this._states.set(name,{
name,
onEnter:config.onEnter||null,
onExit:config.onExit||null,
onUpdate:config.onUpdate||null,
onEvent:config.onEvent||null
})

return this

}

removeState(name){

this._states.delete(name)

for(const[key,set]of this._transitions){

set.delete(name)

}

return this

}

addTransition(from,to,guard=null){

if(!this._states.has(from))throw new Error(`StateMachine: unknown state ${from}`)
if(!this._states.has(to))throw new Error(`StateMachine: unknown state ${to}`)

let set=this._transitions.get(from)

if(!set){

set=new Map()
this._transitions.set(from,set)

}

set.set(to,guard)

return this

}

setState(name,data=null){

if(this._locked)return false

if(this._current===name)return true

if(!this._states.has(name))throw new Error(`StateMachine: invalid state ${name}`)

if(this._current){

const allowed=this._transitions.get(this._current)

if(allowed){

const guard=allowed.get(name)

if(guard&&guard(this._context,data)===false){

return false

}

}

}

this._locked=true

const prev=this._current

if(prev){

const prevState=this._states.get(prev)

if(prevState.onExit){

prevState.onExit(this._context,name,data)

}

}

this._previous=prev

this._current=name

const state=this._states.get(name)

if(state.onEnter){

state.onEnter(this._context,prev,data)

}

this._emit('transition',{
from:prev,
to:name,
data
})

this._locked=false

return true

}

queueState(name,data=null){

this._transitionQueue.push([name,data])

if(!this._processing){

this._processQueue()

}

}

_processQueue(){

this._processing=true

while(this._transitionQueue.length>0){

const[name,data]=this._transitionQueue.shift()

this.setState(name,data)

}

this._processing=false

}

update(delta){

if(!this._current)return

const state=this._states.get(this._current)

if(state.onUpdate){

state.onUpdate(this._context,delta)

}

}

handleEvent(event,data){

if(!this._current)return

const state=this._states.get(this._current)

if(state.onEvent){

state.onEvent(this._context,event,data)

}

this._emit('event',{
state:this._current,
event,
data
})

}

on(event,callback){

let set=this._listeners.get(event)

if(!set){

set=new Set()
this._listeners.set(event,set)

}

set.add(callback)

return()=>set.delete(callback)

}

once(event,callback){

const off=this.on(event,(...args)=>{

off()
callback(...args)

})

return off

}

off(event,callback){

const set=this._listeners.get(event)

if(set){

set.delete(callback)

}

}

_emit(event,data){

const set=this._listeners.get(event)

if(!set)return

for(const cb of set){

cb(data)

}

}

getState(){

return this._current

}

getPreviousState(){

return this._previous

}

is(state){

return this._current===state

}

canTransition(to){

if(!this._current)return true

const map=this._transitions.get(this._current)

if(!map)return true

return map.has(to)

}

clear(){

this._states.clear()
this._transitions.clear()
this._listeners.clear()
this._transitionQueue.length=0
this._current=null
this._previous=null

}

destroy(){

this.clear()
this._context=null

}

}
