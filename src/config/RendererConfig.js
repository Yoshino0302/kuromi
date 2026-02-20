import * as THREE from 'https://jspm.dev/three'

const ToneMappingMap={
None:THREE.NoToneMapping,
Linear:THREE.LinearToneMapping,
Reinhard:THREE.ReinhardToneMapping,
Cineon:THREE.CineonToneMapping,
ACESFilmic:THREE.ACESFilmicToneMapping
}

const ShadowMapTypeMap={
Basic:THREE.BasicShadowMap,
PCF:THREE.PCFShadowMap,
PCFSoft:THREE.PCFSoftShadowMap,
VSM:THREE.VSMShadowMap
}

const ColorSpaceMap={
srgb:THREE.SRGBColorSpace,
linear:THREE.LinearSRGBColorSpace
}

export class RendererConfig{

constructor(options={}){

this.api=options.api??'webgl2'

this.canvas=options.canvas??null
this.context=options.context??null

this.alpha=options.alpha??false
this.depth=options.depth??true
this.stencil=options.stencil??false
this.antialias=options.antialias??true

this.powerPreference=options.powerPreference??'high-performance'

this.premultipliedAlpha=options.premultipliedAlpha??false
this.preserveDrawingBuffer=options.preserveDrawingBuffer??false
this.failIfMajorPerformanceCaveat=options.failIfMajorPerformanceCaveat??false

this.precision=options.precision??'highp'

this.logarithmicDepthBuffer=options.logarithmicDepthBuffer??false

this.outputColorSpace=this.resolveColorSpace(options.outputColorSpace??'srgb')

this.toneMapping=this.resolveToneMapping(options.toneMapping??'ACESFilmic')

this.toneMappingExposure=options.toneMappingExposure??1

this.useLegacyLights=options.useLegacyLights??false

this.physicallyCorrectLights=options.physicallyCorrectLights??true

this.sortObjects=options.sortObjects??true

this.xrCompatible=options.xrCompatible??false

this.shadowMapEnabled=options.shadowMapEnabled??true

this.shadowMapType=this.resolveShadowMapType(options.shadowMapType??'PCFSoft')

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

this.devicePixelRatio=this.resolveDevicePixelRatio(options.devicePixelRatio)

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

resolveDevicePixelRatio(value){

if(value!==undefined)return value

if(typeof window!=='undefined'){

return window.devicePixelRatio||1

}

return 1

}

resolveToneMapping(name){

return ToneMappingMap[name]??THREE.ACESFilmicToneMapping

}

resolveShadowMapType(name){

return ShadowMapTypeMap[name]??THREE.PCFSoftShadowMap

}

resolveColorSpace(name){

return ColorSpaceMap[name]??THREE.SRGBColorSpace

}

createRenderer(){

const renderer=new THREE.WebGLRenderer({

canvas:this.canvas,

context:this.context,

alpha:this.alpha,

depth:this.depth,

stencil:this.stencil,

antialias:this.antialias,

powerPreference:this.powerPreference,

premultipliedAlpha:this.premultipliedAlpha,

preserveDrawingBuffer:this.preserveDrawingBuffer,

failIfMajorPerformanceCaveat:this.failIfMajorPerformanceCaveat,

logarithmicDepthBuffer:this.logarithmicDepthBuffer,

precision:this.precision,

desynchronized:this.desynchronized

})

renderer.outputColorSpace=this.outputColorSpace

renderer.toneMapping=this.toneMapping

renderer.toneMappingExposure=this.toneMappingExposure

renderer.sortObjects=this.sortObjects

renderer.autoClear=this.autoClear
renderer.autoClearColor=this.autoClearColor
renderer.autoClearDepth=this.autoClearDepth
renderer.autoClearStencil=this.autoClearStencil

renderer.setClearColor(this.clearColor,this.clearAlpha)

renderer.shadowMap.enabled=this.shadowMapEnabled

renderer.shadowMap.type=this.shadowMapType

renderer.shadowMap.autoUpdate=this.shadowMapAutoUpdate

renderer.setPixelRatio(

Math.min(

this.maxPixelRatio,

Math.max(

this.minPixelRatio,

this.devicePixelRatio*this.pixelRatioScaleFactor

)

)

)

if(this.width&&this.height){

renderer.setSize(this.width,this.height,false)

}

return renderer

}

validate(){

if(this.maxPixelRatio<=0)throw new Error('maxPixelRatio must be > 0')

if(this.minPixelRatio<=0)throw new Error('minPixelRatio must be > 0')

if(this.maxPixelRatio<this.minPixelRatio)throw new Error('maxPixelRatio must be >= minPixelRatio')

if(this.dynamicResolutionMinScale<=0)throw new Error('dynamicResolutionMinScale must be > 0')

if(this.dynamicResolutionMaxScale<=0)throw new Error('dynamicResolutionMaxScale must be > 0')

if(this.dynamicResolutionMaxScale<this.dynamicResolutionMinScale){

throw new Error('dynamicResolutionMaxScale must be >= dynamicResolutionMinScale')

}

}

merge(overrides={}){

return new RendererConfig({

...this,

...overrides

})

}

toJSON(){

return {...this}

}

static create(options){

return new RendererConfig(options)

}

static getDefault(){

return new RendererConfig()

}

}
