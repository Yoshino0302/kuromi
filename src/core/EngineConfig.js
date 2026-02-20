export class EngineConfig{
constructor(options={}){
this.version='KUROMI_ENGINE_vΩ.FINAL'
this.name='KUROMI ENGINE'
this.environment='browser'
this.executionMode='esmodule'
this.debug=options.debug??false
this.autoStart=options.autoStart??true
this.fixedTimeStep=options.fixedTimeStep??(1/60)
this.maxDeltaTime=options.maxDeltaTime??0.25
this.timeScale=options.timeScale??1
this.enableProfiling=options.enableProfiling??false
this.enableMemoryTracking=options.enableMemoryTracking??true
this.enablePerformanceMonitoring=options.enablePerformanceMonitoring??true
this.enableAutoResize=options.enableAutoResize??true
this.enableVisibilityPause=options.enableVisibilityPause??true
this.enableContextLossRecovery=options.enableContextLossRecovery??true
this.enableHiDPI=options.enableHiDPI??true
this.enableOffscreenCanvas=options.enableOffscreenCanvas??false
this.enableWebGL2=options.enableWebGL2??true
this.powerPreference=options.powerPreference??'high-performance'
this.antialias=options.antialias??true
this.alpha=options.alpha??false
this.depth=options.depth??true
this.stencil=options.stencil??false
this.premultipliedAlpha=options.premultipliedAlpha??false
this.preserveDrawingBuffer=options.preserveDrawingBuffer??false
this.failIfMajorPerformanceCaveat=options.failIfMajorPerformanceCaveat??false
this.xrCompatible=options.xrCompatible??false
this.container=options.container??null
this.canvas=options.canvas??null
this.width=options.width??0
this.height=options.height??0
this.devicePixelRatio=options.devicePixelRatio??(typeof window!=='undefined'?window.devicePixelRatio||1:1)
this.maxPixelRatio=options.maxPixelRatio??2
this.minPixelRatio=options.minPixelRatio??0.5
this.adaptivePixelRatio=options.adaptivePixelRatio??true
this.pixelRatioScaleFactor=options.pixelRatioScaleFactor??1
this.targetFPS=options.targetFPS??60
this.minFPS=options.minFPS??30
this.maxFPS=options.maxFPS??240
this.backgroundColor=options.backgroundColor??0x000000
this.backgroundAlpha=options.backgroundAlpha??1
this.pauseOnBlur=options.pauseOnBlur??true
this.resumeOnFocus=options.resumeOnFocus??true
this.stopOnDestroy=options.stopOnDestroy??true
this.clearStateOnStop=options.clearStateOnStop??false
this.eventBufferSize=options.eventBufferSize??1024
this.systemBufferSize=options.systemBufferSize??1024
this.taskQueueSize=options.taskQueueSize??2048
this.memoryLimitMB=options.memoryLimitMB??1024
this.gpuMemoryLimitMB=options.gpuMemoryLimitMB??512
this.autoGarbageCollect=options.autoGarbageCollect??true
this.gcInterval=options.gcInterval??30000
this.resourceLifetime=options.resourceLifetime??0
this.enableHotReload=options.enableHotReload??false
this.enableStateSnapshots=options.enableStateSnapshots??false
this.snapshotInterval=options.snapshotInterval??0
this.validate()
Object.freeze(this)
}
validate(){
if(this.fixedTimeStep<=0)throw new Error('EngineConfig.fixedTimeStep must be > 0')
if(this.maxDeltaTime<=0)throw new Error('EngineConfig.maxDeltaTime must be > 0')
if(this.targetFPS<=0)throw new Error('EngineConfig.targetFPS must be > 0')
if(this.maxPixelRatio<=0)throw new Error('EngineConfig.maxPixelRatio must be > 0')
if(this.minPixelRatio<=0)throw new Error('EngineConfig.minPixelRatio must be > 0')
if(this.memoryLimitMB<=0)throw new Error('EngineConfig.memoryLimitMB must be > 0')
if(this.gpuMemoryLimitMB<=0)throw new Error('EngineConfig.gpuMemoryLimitMB must be > 0')
}
static create(options){
return new EngineConfig(options)
}
static getDefault(){
return new EngineConfig({})
}
merge(overrides={}){
return new EngineConfig({...this,...overrides})
}
toJSON(){
return {...this}
}
}
