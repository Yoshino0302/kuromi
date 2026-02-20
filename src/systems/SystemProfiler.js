import * as THREE from 'https://jspm.dev/three'

export class SystemProfiler{

constructor({
enabled=true,
historySize=120,
autoLog=false,
logInterval=2000
}={}){
this.enabled=enabled
this.historySize=historySize
this.autoLog=autoLog
this.logInterval=logInterval
this.systems=new Map()
this.history=new Map()
this.active=new Map()
this.frameStart=0
this.frameTime=0
this.frameCount=0
this.lastLogTime=0
this.totalTime=0
this.maxFrameTime=0
this.minFrameTime=Infinity
this.avgFrameTime=0
this.fps=0
this._tmpNow=0
}

registerSystem(name){
if(this.systems.has(name))return
this.systems.set(name,{
name,
total:0,
calls:0,
avg:0,
min:Infinity,
max:0,
last:0
})
this.history.set(name,new Float32Array(this.historySize))
}

unregisterSystem(name){
this.systems.delete(name)
this.history.delete(name)
this.active.delete(name)
}

beginFrame(){
if(!this.enabled)return
this.frameStart=performance.now()
}

endFrame(){
if(!this.enabled)return
const now=performance.now()
const dt=now-this.frameStart
this.frameTime=dt
this.totalTime+=dt
this.frameCount++
if(dt>this.maxFrameTime)this.maxFrameTime=dt
if(dt<this.minFrameTime)this.minFrameTime=dt
this.avgFrameTime=this.totalTime/this.frameCount
this.fps=1000/this.avgFrameTime
if(this.autoLog&&now-this.lastLogTime>this.logInterval){
this.lastLogTime=now
this.log()
}
}

begin(name){
if(!this.enabled)return
this.active.set(name,performance.now())
}

end(name){
if(!this.enabled)return
const start=this.active.get(name)
if(start===undefined)return
const now=performance.now()
const dt=now-start
this.active.delete(name)
let sys=this.systems.get(name)
if(!sys){
this.registerSystem(name)
sys=this.systems.get(name)
}
sys.last=dt
sys.total+=dt
sys.calls++
sys.avg=sys.total/sys.calls
if(dt<sys.min)sys.min=dt
if(dt>sys.max)sys.max=dt
const hist=this.history.get(name)
if(hist){
const idx=sys.calls%this.historySize
hist[idx]=dt
}
}

profile(name,fn){
if(!this.enabled)return fn()
const start=performance.now()
const result=fn()
const dt=performance.now()-start
let sys=this.systems.get(name)
if(!sys){
this.registerSystem(name)
sys=this.systems.get(name)
}
sys.last=dt
sys.total+=dt
sys.calls++
sys.avg=sys.total/sys.calls
if(dt<sys.min)sys.min=dt
if(dt>sys.max)sys.max=dt
return result
}

getSystemStats(name){
return this.systems.get(name)||null
}

getAllStats(){
const out={}
for(const [name,sys] of this.systems){
out[name]={
avg:sys.avg,
min:sys.min,
max:sys.max,
last:sys.last,
calls:sys.calls
}
}
return out
}

getFrameStats(){
return{
fps:this.fps,
frameTime:this.frameTime,
avgFrameTime:this.avgFrameTime,
minFrameTime:this.minFrameTime,
maxFrameTime:this.maxFrameTime,
frameCount:this.frameCount
}
}

getHistory(name){
return this.history.get(name)||null
}

getBottleneck(){
let worst=null
let max=0
for(const sys of this.systems.values()){
if(sys.avg>max){
max=sys.avg
worst=sys
}
}
return worst
}

reset(){
this.systems.clear()
this.history.clear()
this.active.clear()
this.frameStart=0
this.frameTime=0
this.frameCount=0
this.totalTime=0
this.maxFrameTime=0
this.minFrameTime=Infinity
this.avgFrameTime=0
}

log(){
const frame=this.getFrameStats()
console.log(
'[Profiler]',
'FPS:',frame.fps.toFixed(1),
'Frame:',frame.frameTime.toFixed(3)+'ms'
)
for(const [name,sys] of this.systems){
console.log(
name,
'avg:',sys.avg.toFixed(3)+'ms',
'min:',sys.min.toFixed(3),
'max:',sys.max.toFixed(3),
'last:',sys.last.toFixed(3)
)
}
}

setEnabled(v){
this.enabled=v
}

}
