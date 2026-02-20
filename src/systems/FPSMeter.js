export class FPSMeter{
constructor(options={}){
this.sampleSize=options.sampleSize||120
this.samples=new Float32Array(this.sampleSize)
this.index=0
this.count=0
this.sum=0
this.lastTime=performance.now()*0.001
this.delta=0
this.fps=0
this.minFPS=Infinity
this.maxFPS=0
this.avgFPS=0
this.smoothedFPS=0
this.smoothing=options.smoothing||0.9
this.frameCount=0
this.elapsed=0
this.updateInterval=options.updateInterval||0.25
this._accumTime=0
}
update(){
const now=performance.now()*0.001
this.delta=now-this.lastTime
this.lastTime=now
if(this.delta<=0)return this.fps
const instantFPS=1/this.delta
this.fps=instantFPS
this._accumulateSample(instantFPS)
this._updateStats(instantFPS)
this._updateSmoothed(instantFPS)
return this.smoothedFPS
}
_accumulateSample(fps){
if(this.count<this.sampleSize){
this.samples[this.index]=fps
this.sum+=fps
this.count++
}else{
this.sum-=this.samples[this.index]
this.samples[this.index]=fps
this.sum+=fps
}
this.index=(this.index+1)%this.sampleSize
this.avgFPS=this.sum/this.count
}
_updateStats(fps){
if(fps<this.minFPS)this.minFPS=fps
if(fps>this.maxFPS)this.maxFPS=fps
}
_updateSmoothed(fps){
this.smoothedFPS=
this.smoothedFPS===0
?fps
:this.smoothedFPS*this.smoothing+
fps*(1-this.smoothing)
}
tick(delta){
this.frameCount++
this.elapsed+=delta
this._accumTime+=delta
if(this._accumTime>=this.updateInterval){
this._accumTime=0
return true
}
return false
}
getFPS(){
return this.smoothedFPS||this.fps||0
}
getRawFPS(){
return this.fps||0
}
getAverageFPS(){
return this.avgFPS||0
}
getMinFPS(){
return this.minFPS===Infinity?0:this.minFPS
}
getMaxFPS(){
return this.maxFPS||0
}
getDelta(){
return this.delta||0
}
getFrameTime(){
return this.delta*1000
}
getStats(){
return{
fps:this.getFPS(),
raw:this.getRawFPS(),
avg:this.getAverageFPS(),
min:this.getMinFPS(),
max:this.getMaxFPS(),
delta:this.getDelta(),
frameTime:this.getFrameTime()
}
}
reset(){
this.index=0
this.count=0
this.sum=0
this.minFPS=Infinity
this.maxFPS=0
this.avgFPS=0
this.smoothedFPS=0
this.frameCount=0
this.elapsed=0
this._accumTime=0
}
}
