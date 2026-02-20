export class RendererConfig{
constructor(options={}){
this.api=options.api??'webgl2'
this.alpha=options.alpha??false
this.depth=options.depth??true
this.stencil=options.stencil??false
this.antialias=options.antialias??true
this.powerPreference=options.powerPreference??'high-performance'
this.premultipliedAlpha=options.premultipliedAlpha??false
this.preserveDrawingBuffer=options.preserveDrawingBuffer??false
this.failIfMajorPerformanceCaveat=options.failIfMajorPerformanceCaveat??false
this.logarithmicDepthBuffer=options.logarithmicDepthBuffer??false
this.precision=options.precision??'highp'
this.outputColorSpace=options.outputColorSpace??'srgb'
this.toneMapping=options.toneMapping??'ACESFilmic'
this.toneMappingExposure=options.toneMappingExposure??1
this.useLegacyLights=options.useLegacyLights??false
this.physicallyCorrectLights=options.physicallyCorrectLights??true
this.sortObjects=options.sortObjects??true
this.xrCompatible=options.xrCompatible??false
this.shadowMapEnabled=options.shadowMapEnabled??true
this.shadowMapType=options.shadowMapType??'PCFSoft'
this.shadowMapAutoUpdate=options.shadowMapAutoUpdate??true
this.shadowMapNeedsUpdate=false
this.maxTextures=options.maxTextures??4096
this.maxVertexTextures=options.maxVertexTextures??16
this.maxTextureSize=options.maxTextureSize??16384
this.maxCubemapSize=options.maxCubemapSize??16384
this.maxRenderbufferSize=options.maxRenderbufferSize??16384
this.maxSamples=options.maxSamples??4
this.maxAnisotropy=options.maxAnisotropy??16
this.maxPixelRatio=options.maxPixelRatio??2
this.minPixelRatio=options.minPixelRatio??0.5
this.adaptivePixelRatio=options.adaptivePixelRatio??true
this.pixelRatioScaleFactor=options.pixelRatioScaleFactor??1
this.clearColor=options.clearColor??0x000000
this.clearAlpha=options.clearAlpha??1
this.autoClear=options.autoClear??true
this.autoClearColor=options.autoClearColor??true
this.autoClearDepth=options.autoClearDepth??true
this.autoClearStencil=options.autoClearStencil??true
this.backgroundColor=options.backgroundColor??0x000000
this.backgroundAlpha=options.backgroundAlpha??1
this.width=options.width??0
this.height=options.height??0
this.devicePixelRatio=options.devicePixelRatio??(typeof window!=='undefined'?window.devicePixelRatio||1:1)
this.canvas=options.canvas??null
this.context=options.context??null
this.highPerformanceGPU=options.highPerformanceGPU??true
this.lowLatency=options.lowLatency??false
this.desynchronized=options.desynchronized??false
this.depthBuffer=options.depthBuffer??true
this.stencilBuffer=options.stencilBuffer??false
this.powerHint=options.powerHint??'default'
this.multiview=options.multiview??false
this.foveatedRendering=options.foveatedRendering??false
this.dynamicResolution=options.dynamicResolution??true
this.dynamicResolutionMinScale=options.dynamicResolutionMinScale??0.5
this.dynamicResolutionMaxScale=options.dynamicResolutionMaxScale??1
this.dynamicResolutionStep=options.dynamicResolutionStep??0.05
this.validate()
Object.freeze(this)
}
validate(){
if(this.maxPixelRatio<=0)throw new Error('RendererConfig.maxPixelRatio must be > 0')
if(this.minPixelRatio<=0)throw new Error('RendererConfig.minPixelRatio must be > 0')
if(this.maxTextureSize<=0)throw new Error('RendererConfig.maxTextureSize must be > 0')
if(this.maxCubemapSize<=0)throw new Error('RendererConfig.maxCubemapSize must be > 0')
if(this.maxRenderbufferSize<=0)throw new Error('RendererConfig.maxRenderbufferSize must be > 0')
}
static create(options){
return new RendererConfig(options)
}
static getDefault(){
return new RendererConfig({})
}
merge(overrides={}){
return new RendererConfig({...this,...overrides})
}
toJSON(){
return {...this}
}
}
