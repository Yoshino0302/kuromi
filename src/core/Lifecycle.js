import {EventEmitter} from '../utils/EventEmitter.js'

export const LifecyclePhase=Object.freeze({
CREATED:0,
INITIALIZING:1,
INITIALIZED:2,
STARTING:3,
RUNNING:4,
PAUSING:5,
PAUSED:6,
RESUMING:7,
STOPPING:8,
STOPPED:9,
DESTROYING:10,
DESTROYED:11,
ERROR:12
})

export class Lifecycle extends EventEmitter{

constructor(owner){

super()

this.owner=owner||null

this.phase=LifecyclePhase.CREATED
this.previousPhase=null

this.initialized=false
this.running=false
this.paused=false
this.destroyed=false

this.locked=false

this.history=[]

}

getPhase(){

return this.phase

}

is(phase){

return this.phase===phase

}

canTransition(next){

if(this.locked)return false

switch(this.phase){

case LifecyclePhase.CREATED:
return next===LifecyclePhase.INITIALIZING

case LifecyclePhase.INITIALIZING:
return next===LifecyclePhase.INITIALIZED||next===LifecyclePhase.ERROR

case LifecyclePhase.INITIALIZED:
return next===LifecyclePhase.STARTING||next===LifecyclePhase.DESTROYING

case LifecyclePhase.STARTING:
return next===LifecyclePhase.RUNNING||next===LifecyclePhase.ERROR

case LifecyclePhase.RUNNING:
return next===LifecyclePhase.PAUSING||
next===LifecyclePhase.STOPPING||
next===LifecyclePhase.ERROR

case LifecyclePhase.PAUSING:
return next===LifecyclePhase.PAUSED

case LifecyclePhase.PAUSED:
return next===LifecyclePhase.RESUMING||
next===LifecyclePhase.STOPPING||
next===LifecyclePhase.DESTROYING

case LifecyclePhase.RESUMING:
return next===LifecyclePhase.RUNNING

case LifecyclePhase.STOPPING:
return next===LifecyclePhase.STOPPED

case LifecyclePhase.STOPPED:
return next===LifecyclePhase.STARTING||
next===LifecyclePhase.DESTROYING

case LifecyclePhase.DESTROYING:
return next===LifecyclePhase.DESTROYED

case LifecyclePhase.DESTROYED:
return false

case LifecyclePhase.ERROR:
return next===LifecyclePhase.DESTROYING

default:
return false

}

}

transition(next,data){

if(!this.canTransition(next)){

this.emit('transition:invalid',this.phase,next)

return false

}

this.previousPhase=this.phase

this.phase=next

this.history.push({
from:this.previousPhase,
to:next,
time:performance.now(),
data:data||null
})

this._applyFlags(next)

this.emit('transition',next,this.previousPhase,data)

this.emit(`phase:${next}`,next,this.previousPhase,data)

return true

}

_applyFlags(phase){

switch(phase){

case LifecyclePhase.INITIALIZED:
this.initialized=true
break

case LifecyclePhase.RUNNING:
this.running=true
this.paused=false
break

case LifecyclePhase.PAUSED:
this.running=false
this.paused=true
break

case LifecyclePhase.STOPPED:
this.running=false
break

case LifecyclePhase.DESTROYED:
this.running=false
this.destroyed=true
break

case LifecyclePhase.ERROR:
this.running=false
break

}

}

initialize(data){

return this.transition(
LifecyclePhase.INITIALIZING,
data
)

}

initialized(data){

return this.transition(
LifecyclePhase.INITIALIZED,
data
)

}

start(data){

return this.transition(
LifecyclePhase.STARTING,
data
)

}

running(data){

return this.transition(
LifecyclePhase.RUNNING,
data
)

}

pause(data){

return this.transition(
LifecyclePhase.PAUSING,
data
)

}

paused(data){

return this.transition(
LifecyclePhase.PAUSED,
data
)

}

resume(data){

return this.transition(
LifecyclePhase.RESUMING,
data
)

}

resumed(data){

return this.transition(
LifecyclePhase.RUNNING,
data
)

}

stop(data){

return this.transition(
LifecyclePhase.STOPPING,
data
)

}

stopped(data){

return this.transition(
LifecyclePhase.STOPPED,
data
)

}

destroy(data){

return this.transition(
LifecyclePhase.DESTROYING,
data
)

}

destroyed(data){

return this.transition(
LifecyclePhase.DESTROYED,
data
)

}

error(err){

return this.transition(
LifecyclePhase.ERROR,
err
)

}

lock(){

this.locked=true

}

unlock(){

this.locked=false

}

reset(){

this.phase=LifecyclePhase.CREATED
this.previousPhase=null

this.initialized=false
this.running=false
this.paused=false
this.destroyed=false

this.history.length=0

this.locked=false

this.emit('reset')

}

getHistory(){

return this.history

}

getLastTransition(){

if(this.history.length===0)return null

return this.history[this.history.length-1]

}

isRunning(){

return this.phase===LifecyclePhase.RUNNING

}

isPaused(){

return this.phase===LifecyclePhase.PAUSED

}

isDestroyed(){

return this.phase===LifecyclePhase.DESTROYED

}

}
