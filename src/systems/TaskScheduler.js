import * as THREE from 'https://jspm.dev/three'

export class TaskScheduler{

constructor(engine){
this.engine=engine
this.name='TaskScheduler'
this.priority=15

this.enabled=true
this.initialized=false
this.running=false

this._queue=[]
this._queueCount=0

this._delayed=[]
this._delayedCount=0

this._recurring=[]
this._recurringCount=0

this._frameBudgetMS=2.0
this._frameStart=0

this._taskId=1

this._activeTasks=new Map()

this._tempTask=null
}

init(){
this.initialized=true
}

start(){
this.running=true
}

update(delta){

if(!this.enabled||!this.running)return

this._frameStart=performance.now()

this._processDelayed()

this._processQueue()

this._processRecurring(delta)
}

_processQueue(){

let now=performance.now()

while(this._queueCount>0){

if(now-this._frameStart>=this._frameBudgetMS)break

const task=this._queue[0]

for(let i=0;i<this._queueCount-1;i++){
this._queue[i]=this._queue[i+1]
}

this._queueCount--
this._queue[this._queueCount]=null

if(task.cancelled)continue

try{

task.fn(task.data)

}catch(e){

console.error('TaskScheduler task error:',e)

}

this._activeTasks.delete(task.id)

now=performance.now()
}
}

_processDelayed(){

if(this._delayedCount===0)return

const now=performance.now()

let write=0

for(let i=0;i<this._delayedCount;i++){

const task=this._delayed[i]

if(task.cancelled){
this._activeTasks.delete(task.id)
continue
}

if(now>=task.time){

this._queue[this._queueCount++]=task

}else{

this._delayed[write++]=task

}
}

this._delayedCount=write
}

_processRecurring(delta){

for(let i=0;i<this._recurringCount;i++){

const task=this._recurring[i]

if(task.cancelled)continue

task.elapsed+=delta

if(task.elapsed>=task.interval){

task.elapsed=0

try{

task.fn(delta,task.data)

}catch(e){

console.error('TaskScheduler recurring task error:',e)

}
}
}
}

schedule(fn,data=null){

if(!fn)return 0

const id=this._taskId++

const task={
id:id,
fn:fn,
data:data,
cancelled:false
}

this._queue[this._queueCount++]=task

this._activeTasks.set(id,task)

return id
}

scheduleDelayed(fn,delayMS,data=null){

if(!fn)return 0

const id=this._taskId++

const task={
id:id,
fn:fn,
data:data,
time:performance.now()+delayMS,
cancelled:false
}

this._delayed[this._delayedCount++]=task

this._activeTasks.set(id,task)

return id
}

scheduleRecurring(fn,intervalMS,data=null){

if(!fn)return 0

const id=this._taskId++

const task={
id:id,
fn:fn,
data:data,
interval:intervalMS,
elapsed:0,
cancelled:false
}

this._recurring[this._recurringCount++]=task

this._activeTasks.set(id,task)

return id
}

cancel(id){

const task=this._activeTasks.get(id)

if(!task)return false

task.cancelled=true

this._activeTasks.delete(id)

return true
}

cancelAll(){

for(const task of this._activeTasks.values()){
task.cancelled=true
}

this._activeTasks.clear()
}

setFrameBudget(ms){
this._frameBudgetMS=ms
}

getFrameBudget(){
return this._frameBudgetMS
}

getPendingCount(){
return this._queueCount+this._delayedCount+this._recurringCount
}

getActiveCount(){
return this._activeTasks.size
}

clear(){

this._queue.length=0
this._queueCount=0

this._delayed.length=0
this._delayedCount=0

this._recurring.length=0
this._recurringCount=0

this._activeTasks.clear()
}

shutdown(){

this.clear()

this.running=false
this.initialized=false
}

}
