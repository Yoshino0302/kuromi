export class PerformanceMonitor{

constructor(options={}){

this.options=options

this.sampleInterval=options.sampleInterval||0.5
this.maxSamples=options.maxSamples||120
this.spikeThreshold=options.spikeThreshold||0.05

this.frames=0
this.accumulator=0

this.fps=0
this.minFps=Infinity
this.maxFps=0

this.frameTime=0
this.avgFrameTime=0

this.samples=new Float32Array(this.maxSamples)
this.sampleIndex=0
this.sampleCount=0

this.smoothedFps=0

this.lastDelta=0
this.spike=false

this.time=0

this.enabled=true

this.onSample=null

}

update(delta){

if(!this.enabled)return this.fps

this.lastDelta=delta

this.frames++
this.accumulator+=delta
this.time+=delta

this.frameTime=delta

this._detectSpike(delta)

this._storeSample(delta)

if(this.accumulator>=this.sampleInterval){

this._computeFps()

this.frames=0
this.accumulator=0

if(this.onSample){
this.onSample(this.getMetrics())
}

}

return this.smoothedFps

}

_detectSpike(delta){

this.spike=delta>this.spikeThreshold

}

_storeSample(delta){

this.samples[this.sampleIndex]=delta

this.sampleIndex=(this.sampleIndex+1)%this.maxSamples

if(this.sampleCount<this.maxSamples){
this.sampleCount++
}

}

_computeFps(){

if(this.sampleCount===0)return

let total=0

for(let i=0;i<this.sampleCount;i++){
total+=this.samples[i]
}

const avgDelta=total/this.sampleCount

this.avgFrameTime=avgDelta

const fps=avgDelta>0?1/avgDelta:0

this.fps=fps

if(fps<this.minFps)this.minFps=fps
if(fps>this.maxFps)this.maxFps=fps

this.smoothedFps=this._smooth(this.smoothedFps,fps,0.1)

}

_smooth(current,target,factor){

return current+(target-current)*factor

}

getFPS(){

return this.smoothedFps

}

getRawFPS(){

return this.fps

}

getFrameTime(){

return this.frameTime

}

getAverageFrameTime(){

return this.avgFrameTime

}

getMinFPS(){

return this.minFps===Infinity?0:this.minFps

}

getMaxFPS(){

return this.maxFps

}

getLoad(){

if(this.smoothedFps<=0)return 0

const target=this.options.targetFPS||60

return Math.min(1,target/this.smoothedFps)

}

isSpiking(){

return this.spike

}

getMetrics(){

return{
fps:this.smoothedFps,
rawFps:this.fps,
minFps:this.getMinFPS(),
maxFps:this.maxFps,
frameTime:this.frameTime,
avgFrameTime:this.avgFrameTime,
load:this.getLoad(),
spike:this.spike,
time:this.time
}

}

reset(){

this.frames=0
this.accumulator=0

this.fps=0
this.minFps=Infinity
this.maxFps=0

this.sampleIndex=0
this.sampleCount=0

this.smoothedFps=0

this.time=0

}

setEnabled(enabled){

this.enabled=enabled

}

dispose(){

this.enabled=false

this.samples=null

this.onSample=null

}

}
