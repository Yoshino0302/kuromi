import * as THREE from 'https://jspm.dev/three'

export class MemoryMonitor{

constructor(engine){
this.engine=engine
this.name='MemoryMonitor'
this.priority=5

this.enabled=true
this.initialized=false

this._renderer=null

this._frame=0
this._lastSampleTime=0
this._sampleInterval=500

this._jsHeapUsed=0
this._jsHeapTotal=0
this._jsHeapLimit=0

this._gpuGeometries=0
this._gpuTextures=0
this._gpuPrograms=0

this._renderCalls=0
this._triangles=0
this._points=0
this._lines=0

this._historySize=120

this._heapHistory=new Float32Array(this._historySize)
this._gpuTexHistory=new Float32Array(this._historySize)
this._gpuGeoHistory=new Float32Array(this._historySize)

this._historyIndex=0

this._warnThresholdMB=512
this._criticalThresholdMB=1024

this._warningIssued=false
this._criticalIssued=false

this._tempMB=0
}

init(engine){
this._renderer=engine.renderer?.renderer||engine.renderer||null
this.initialized=true
}

start(){
this._lastSampleTime=performance.now()
}

update(delta){

if(!this.enabled)return

this._frame++

const now=performance.now()

if(now-this._lastSampleTime<this._sampleInterval)return

this._lastSampleTime=now

this._sampleJSHeap()

this._sampleGPU()

this._recordHistory()

this._checkThresholds()
}

_sampleJSHeap(){

const perf=performance

if(perf&&perf.memory){

this._jsHeapUsed=perf.memory.usedJSHeapSize
this._jsHeapTotal=perf.memory.totalJSHeapSize
this._jsHeapLimit=perf.memory.jsHeapSizeLimit

}else{

this._jsHeapUsed=0
this._jsHeapTotal=0
this._jsHeapLimit=0

}
}

_sampleGPU(){

if(!this._renderer)return

const info=this._renderer.info

this._gpuGeometries=info.memory.geometries
this._gpuTextures=info.memory.textures
this._gpuPrograms=info.programs?info.programs.length:0

this._renderCalls=info.render.calls
this._triangles=info.render.triangles
this._points=info.render.points
this._lines=info.render.lines
}

_recordHistory(){

const i=this._historyIndex

this._heapHistory[i]=this._jsHeapUsed
this._gpuTexHistory[i]=this._gpuTextures
this._gpuGeoHistory[i]=this._gpuGeometries

this._historyIndex=(i+1)%this._historySize
}

_checkThresholds(){

this._tempMB=this._jsHeapUsed/1048576

if(this._tempMB>this._criticalThresholdMB){

if(!this._criticalIssued){

console.error('MemoryMonitor CRITICAL:',this._tempMB.toFixed(2),'MB')

this._criticalIssued=true

this.engine?.events?.emit('memory:critical',this._tempMB)

}

}else if(this._tempMB>this._warnThresholdMB){

if(!this._warningIssued){

console.warn('MemoryMonitor WARNING:',this._tempMB.toFixed(2),'MB')

this._warningIssued=true

this.engine?.events?.emit('memory:warning',this._tempMB)

}

}else{

this._warningIssued=false
this._criticalIssued=false

}
}

getJSHeapUsed(){
return this._jsHeapUsed
}

getJSHeapTotal(){
return this._jsHeapTotal
}

getJSHeapLimit(){
return this._jsHeapLimit
}

getGPUTextureCount(){
return this._gpuTextures
}

getGPUGeometryCount(){
return this._gpuGeometries
}

getGPUProgramCount(){
return this._gpuPrograms
}

getRenderCalls(){
return this._renderCalls
}

getTriangles(){
return this._triangles
}

getPoints(){
return this._points
}

getLines(){
return this._lines
}

getHeapUsageMB(){
return this._jsHeapUsed/1048576
}

getHeapUsagePercent(){
if(this._jsHeapLimit===0)return 0
return this._jsHeapUsed/this._jsHeapLimit
}

getHistory(){
return{
heap:this._heapHistory,
textures:this._gpuTexHistory,
geometries:this._gpuGeoHistory
}
}

forceSample(){
this._sampleJSHeap()
this._sampleGPU()
this._recordHistory()
}

resetWarnings(){
this._warningIssued=false
this._criticalIssued=false
}

shutdown(){
this.enabled=false
this.initialized=false
}

}
