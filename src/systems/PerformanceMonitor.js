const PERF_STATE={
ACTIVE:0,
DISABLED:1,
DISPOSED:2
}

export class PerformanceMonitor{

constructor(options={}){

this.options=options

this.state=PERF_STATE.ACTIVE

this.enabled=true

this.targetFPS=options.targetFPS||60

this.sampleInterval=options.sampleInterval||0.5

this.maxSamples=options.maxSamples||240

this.spikeThreshold=options.spikeThreshold||0.05

this.smoothingFactor=options.smoothingFactor||0.08

this.frames=0
this.accumulator=0

this.time=0

this.delta=0

this.fps=0
this.smoothedFps=0

this.minFps=Infinity
this.maxFps=0

this.frameTime=0
this.avgFrameTime=0

this.samples=new Float32Array(this.maxSamples)

this.sampleIndex=0
this.sampleCount=0

this.spike=false

this.load=0

this.trend=0

this.onSample=null

this.onSpike=null

this.onDrop=null

this._lastFps=0

this._trendAccumulator=0

}

update(delta){

if(!this.enabled)return this.smoothedFps

if(this.state!==PERF_STATE.ACTIVE)return this.smoothedFps

if(delta<=0)return this.smoothedFps

this.delta=delta

this.time+=delta

this.frames++

this.accumulator+=delta

this.frameTime=delta

this._detectSpike(delta)

this._storeSample(delta)

if(this.accumulator>=this.sampleInterval){

this._compute()

this.frames=0
this.accumulator=0

this._emitSample()

}

return this.smoothedFps

}

_detectSpike(delta){

const spike=delta>this.spikeThreshold

if(spike&&!this.spike){

this.onSpike?.(this.getMetrics())

}

this.spike=spike

}

_storeSample(delta){

this.samples[this.sampleIndex]=delta

this.sampleIndex++

if(this.sampleIndex>=this.maxSamples){

this.sampleIndex=0

}

if(this.sampleCount<this.maxSamples){

this.sampleCount++

}

}

_compute(){

if(this.sampleCount===0)return

let total=0

for(let i=0;i<this.sampleCount;i++){

total+=this.samples[i]

}

const avgDelta=total/this.sampleCount

this.avgFrameTime=avgDelta

const fps=avgDelta>0?1/avgDelta:0

this.fps=fps

this.smoothedFps=this._smooth(
this.smoothedFps,
fps,
this.smoothingFactor
)

this._updateMinMax()

this._computeLoad()

this._computeTrend()

this._detectDrop()

this._lastFps=this.smoothedFps

}

_updateMinMax(){

if(this.fps<this.minFps){

this.minFps=this.fps

}

if(this.fps>this.maxFps){

this.maxFps=this.fps

}

}

_computeLoad(){

if(this.smoothedFps<=0){

this.load=0

return

}

this.load=Math.min(
1,
this.targetFPS/this.smoothedFps
)

}

_computeTrend(){

const diff=this.smoothedFps-this._lastFps

this.trend=this._smooth(
this.trend,
diff,
0.2
)

}

_detectDrop(){

if(
this._lastFps>0 &&
this.smoothedFps<this._lastFps*0.7
){

this.onDrop?.(this.getMetrics())

}

}

_emitSample(){

this.onSample?.(this.getMetrics())

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

return this.load

}

getTrend(){

return this.trend

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
load:this.load,
trend:this.trend,
spike:this.spike,
time:this.time
}

}

reset(){

this.frames=0
this.accumulator=0

this.fps=0
this.smoothedFps=0

this.minFps=Infinity
this.maxFps=0

this.sampleIndex=0
this.sampleCount=0

this.time=0

this.load=0

this.trend=0

this._lastFps=0

}

setEnabled(enabled){

this.enabled=enabled

this.state=enabled
?PERF_STATE.ACTIVE
:PERF_STATE.DISABLED

}

dispose(){

this.enabled=false

this.state=PERF_STATE.DISPOSED

this.samples=null

this.onSample=null
this.onSpike=null
this.onDrop=null

}

}
