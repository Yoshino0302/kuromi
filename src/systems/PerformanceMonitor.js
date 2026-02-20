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

this.targetFPS=options.targetFPS??60

this.sampleInterval=options.sampleInterval??0.25

this.maxSamples=options.maxSamples??240

this.spikeThreshold=options.spikeThreshold??0.05

this.smoothingFactor=options.smoothingFactor??0.08

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

this.sampleSum=0

this.spike=false

this.load=0

this.trend=0

this.stability=1

this.onSample=null
this.onSpike=null
this.onDrop=null

this._lastFps=0
this._trendVelocity=0

this._emaFrameTime=0

this._initialized=false

}

update(delta){

if(!this.enabled)return this.smoothedFps
if(this.state!==PERF_STATE.ACTIVE)return this.smoothedFps
if(delta<=0)return this.smoothedFps

this.delta=delta
this.frameTime=delta

this.time+=delta
this.frames++
this.accumulator+=delta

this._detectSpike(delta)

this._storeSample(delta)

this._updateEMA(delta)

if(this.accumulator>=this.sampleInterval){

this._compute()

this.frames=0
this.accumulator=0

this._emitSample()

}

return this.smoothedFps

}

_storeSample(delta){

if(this.sampleCount<this.maxSamples){

this.samples[this.sampleIndex]=delta

this.sampleSum+=delta

this.sampleCount++

}else{

const old=this.samples[this.sampleIndex]

this.sampleSum-=old

this.samples[this.sampleIndex]=delta

this.sampleSum+=delta

}

this.sampleIndex++

if(this.sampleIndex>=this.maxSamples){

this.sampleIndex=0

}

}

_updateEMA(delta){

if(!this._initialized){

this._emaFrameTime=delta
this._initialized=true

}else{

this._emaFrameTime+=
(delta-this._emaFrameTime)*this.smoothingFactor

}

}

_compute(){

if(this.sampleCount===0)return

const avgDelta=this.sampleSum/this.sampleCount

this.avgFrameTime=avgDelta

const rawFps=avgDelta>0?1/avgDelta:0

this.fps=rawFps

this.smoothedFps=this._emaFrameTime>0
?1/this._emaFrameTime
:0

this._updateMinMax()

this._computeLoad()

this._computeTrend()

this._computeStability()

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

this._trendVelocity+=
(diff-this._trendVelocity)*0.15

this.trend=this._trendVelocity

}

_computeStability(){

if(this.sampleCount<=1){

this.stability=1
return

}

let variance=0

const mean=this.avgFrameTime

for(let i=0;i<this.sampleCount;i++){

const d=this.samples[i]-mean

variance+=d*d

}

variance/=this.sampleCount

const stdDev=Math.sqrt(variance)

const normalized=stdDev/(mean||1)

this.stability=Math.max(
0,
1-normalized*4
)

}

_detectSpike(delta){

const spike=delta>this.spikeThreshold

if(spike&&!this.spike){

this.onSpike?.(this.getMetrics())

}

this.spike=spike

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

getStability(){

return this.stability

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
stability:this.stability,
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

this.sampleSum=0

this.time=0

this.load=0
this.trend=0
this.stability=1

this._lastFps=0
this._trendVelocity=0

this._initialized=false

}

setEnabled(enabled){

this.enabled=enabled

this.state=enabled
?PERF_STATE.ACTIVE
:PERF_STATE.DISABLED

}

dispose(){

if(this.state===PERF_STATE.DISPOSED)return

this.enabled=false

this.state=PERF_STATE.DISPOSED

this.samples=null

this.onSample=null
this.onSpike=null
this.onDrop=null

}

}
