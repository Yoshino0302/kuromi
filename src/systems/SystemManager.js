import * as THREE from 'https://jspm.dev/three'

export class SystemManager{

constructor(engine){
this.engine=engine
this.systems=new Map()
this.systemList=[]
this.updateQueue=[]
this.lateUpdateQueue=[]
this.fixedUpdateQueue=[]
this.initQueue=[]
this.shutdownQueue=[]
this._sorted=false
this._initialized=false
this._running=false
this._count=0
this._updateCount=0
this._lateCount=0
this._fixedCount=0
this._initCount=0
this._shutdownCount=0
this._temp=[]
}

register(system,priority=100){
if(!system)throw new Error('SystemManager.register: system required')
const name=system.name||system.constructor.name
if(!name)throw new Error('SystemManager.register: system must have name')
if(this.systems.has(name))return this.systems.get(name).system
const record={
name:name,
system:system,
priority:priority,
enabled:true,
initialized:false,
started:false
}
this.systems.set(name,record)
this.systemList[this._count++]=record
this._sorted=false
return system
}

unregister(name){
const record=this.systems.get(name)
if(!record)return
record.enabled=false
this.systems.delete(name)
let idx=-1
for(let i=0;i<this._count;i++){
if(this.systemList[i]===record){idx=i;break}
}
if(idx!==-1){
for(let i=idx;i<this._count-1;i++){
this.systemList[i]=this.systemList[i+1]
}
this.systemList[this._count-1]=null
this._count--
}
this._sorted=false
}

get(name){
const record=this.systems.get(name)
return record?record.system:null
}

has(name){
return this.systems.has(name)
}

enable(name){
const record=this.systems.get(name)
if(record)record.enabled=true
}

disable(name){
const record=this.systems.get(name)
if(record)record.enabled=false
}

init(){
if(this._initialized)return
this._buildQueues()
for(let i=0;i<this._initCount;i++){
const record=this.initQueue[i]
if(!record.enabled||record.initialized)continue
const sys=record.system
try{
if(sys.init)sys.init(this.engine)
record.initialized=true
}catch(e){
console.error('System init failed:',record.name,e)
}
}
this._initialized=true
}

start(){
if(this._running)return
if(!this._initialized)this.init()
for(let i=0;i<this._updateCount;i++){
const record=this.updateQueue[i]
if(!record.enabled||record.started)continue
const sys=record.system
try{
if(sys.start)sys.start(this.engine)
record.started=true
}catch(e){
console.error('System start failed:',record.name,e)
}
}
this._running=true
}

update(delta){
if(!this._running)return
for(let i=0;i<this._updateCount;i++){
const record=this.updateQueue[i]
if(!record.enabled)continue
const sys=record.system
try{
if(sys.update)sys.update(delta,this.engine)
}catch(e){
console.error('System update failed:',record.name,e)
}
}
}

lateUpdate(delta){
if(!this._running)return
for(let i=0;i<this._lateCount;i++){
const record=this.lateUpdateQueue[i]
if(!record.enabled)continue
const sys=record.system
try{
if(sys.lateUpdate)sys.lateUpdate(delta,this.engine)
}catch(e){
console.error('System lateUpdate failed:',record.name,e)
}
}
}

fixedUpdate(delta){
if(!this._running)return
for(let i=0;i<this._fixedCount;i++){
const record=this.fixedUpdateQueue[i]
if(!record.enabled)continue
const sys=record.system
try{
if(sys.fixedUpdate)sys.fixedUpdate(delta,this.engine)
}catch(e){
console.error('System fixedUpdate failed:',record.name,e)
}
}
}

shutdown(){
if(!this._initialized)return
for(let i=this._shutdownCount-1;i>=0;i--){
const record=this.shutdownQueue[i]
const sys=record.system
try{
if(sys.shutdown)sys.shutdown(this.engine)
}catch(e){
console.error('System shutdown failed:',record.name,e)
}
record.initialized=false
record.started=false
}
this._running=false
this._initialized=false
}

_buildQueues(){
if(this._sorted)return
const list=this.systemList
const count=this._count
const temp=this._temp
for(let i=0;i<count;i++)temp[i]=list[i]
temp.length=count
temp.sort((a,b)=>a.priority-b.priority)
this.updateQueue.length=0
this.lateUpdateQueue.length=0
this.fixedUpdateQueue.length=0
this.initQueue.length=0
this.shutdownQueue.length=0
this._updateCount=0
this._lateCount=0
this._fixedCount=0
this._initCount=0
this._shutdownCount=0
for(let i=0;i<count;i++){
const record=temp[i]
this.initQueue[this._initCount++]=record
this.shutdownQueue[this._shutdownCount++]=record
if(record.system.update)this.updateQueue[this._updateCount++]=record
if(record.system.lateUpdate)this.lateUpdateQueue[this._lateCount++]=record
if(record.system.fixedUpdate)this.fixedUpdateQueue[this._fixedCount++]=record
}
this._sorted=true
}

clear(){
this.shutdown()
this.systems.clear()
this.systemList.length=0
this.updateQueue.length=0
this.lateUpdateQueue.length=0
this.fixedUpdateQueue.length=0
this.initQueue.length=0
this.shutdownQueue.length=0
this._count=0
this._updateCount=0
this._lateCount=0
this._fixedCount=0
this._initCount=0
this._shutdownCount=0
this._sorted=false
}

}
