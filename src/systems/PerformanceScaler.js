export const SCALER_STATE=Object.freeze({
ACTIVE:0,
DISABLED:1,
DISPOSED:2
})

export class PerformanceScaler{

constructor(renderer,options={}){

if(!renderer)throw new Error('PerformanceScaler requires renderer')

this.renderer=renderer
this.pipeline=null
this.onScaleChange=null

this.options=options

this.state=SCALER_STATE.ACTIVE
this.enabled=true

this.targetFPS=options.targetFPS??60
this.minFPS=options.minFPS??30

this.maxScale=options.maxScale??1
this.minScale=options.minScale??0.5

this.upscaleSpeed=options.upscaleSpeed??0.04
this.downscaleSpeed=options.downscaleSpeed??0.14

this.hysteresis=options.hysteresis??3
this.requiredStableFrames=options.requiredStableFrames??45

this.scaleChangeCooldown=options.scaleChangeCooldown??0.25

this.currentScale=1
this.targetScale=1

this.pixelRatioBase=1
this.pixelRatioApplied=-1

this.width=1
this.height=1

this.stableFrames=0
this.lastFPS=this.targetFPS
this.trend=0
this.spike=false

this.time=0
this._lastScaleChangeTime=0

this._boundContextLost=e=>this._onContextLost(e)
this._boundContextRestored=e=>this._onContextRestored(e)

this._attachRendererEvents()

this._detectBasePixelRatio()

}

_attachRendererEvents(){

const canvas=this._getCanvas()

if(!canvas)return

canvas.addEventListener(
'webglcontextlost',
this._boundContextLost,
false
)

canvas.addEventListener(
'webglcontextrestored',
this._boundContextRestored,
false
)

}

_detachRendererEvents(){

const canvas=this._getCanvas()

if(!canvas)return

canvas.removeEventListener(
'webglcontextlost',
this._boundContextLost
)

canvas.removeEventListener(
'webglcontextrestored',
this._boundContextRestored
)

}

_getCanvas(){

return this.renderer.domElement
??this.renderer.getCanvas?.()
??null

}

_detectBasePixelRatio(){

const dpr=
typeof window!=='undefined'
?window.devicePixelRatio||1
:1

const max=this.options.maxPixelRatio??2

this.pixelRatioBase=Math.min(dpr,max)

}

_onContextLost(){

this.enabled=false

}

_onContextRestored(){

this._detectBasePixelRatio()

this.reset()

this.enabled=true

}

attachPipeline(pipeline){

this.pipeline=pipeline

if(pipeline){

pipeline.setSize(
this.width,
this.height,
this.getPixelRatio()
)

}

}

setSize(width,height){

this.width=Math.max(1,width|0)
this.height=Math.max(1,height|0)

if(this.pipeline){

this.pipeline.setSize(
this.width,
this.height,
this.getPixelRatio()
)

}

}

update(fps,delta=0.016){

if(!this.enabled)return
if(this.state!==SCALER_STATE.ACTIVE)return
if(!this.renderer)return
if(!Number.isFinite(fps))return

this.time+=delta

this.trend=fps-this.lastFPS
this.lastFPS=fps

this.spike=fps<this.minFPS*0.75

this._computeTargetScale(fps)

this._applyCooldown()

this._smoothScale(delta)

this._applyScale()

}

_computeTargetScale(fps){

if(this.spike){

this.targetScale=this.minScale
this.stableFrames=0
return

}

if(fps<this.minFPS){

this.targetScale=this.minScale
this.stableFrames=0
return

}

if(fps<this.targetFPS-this.hysteresis){

const deficit=(this.targetFPS-fps)/this.targetFPS

const trendFactor=Math.min(
Math.abs(this.trend)*0.015,
0.25
)

const adaptive=0.6+trendFactor

this.targetScale=this._clamp(
1-deficit*adaptive,
this.minScale,
this.maxScale
)

this.stableFrames=0

return

}

if(fps>=this.targetFPS){

this.stableFrames++

if(this.stableFrames>=this.requiredStableFrames){

this.targetScale=this.maxScale

}

}

}

_applyCooldown(){

const now=this.time

if(Math.abs(this.targetScale-this.currentScale)<0.01)return

if(now-this._lastScaleChangeTime<this.scaleChangeCooldown){

this.targetScale=this.currentScale
return

}

this._lastScaleChangeTime=now

}

_smoothScale(delta){

const up=this.upscaleSpeed*delta*60
const down=this.downscaleSpeed*delta*60

if(this.currentScale<this.targetScale){

this.currentScale+=up

}else if(this.currentScale>this.targetScale){

this.currentScale-=down

}

this.currentScale=this._clamp(
this.currentScale,
this.minScale,
this.maxScale
)

}

_applyScale(){

const pixelRatio=this.pixelRatioBase*this.currentScale

if(Math.abs(pixelRatio-this.pixelRatioApplied)<0.001)return

if(this.renderer.setPixelRatio){

this.renderer.setPixelRatio(pixelRatio)

}

if(this.pipeline){

this.pipeline.setSize(
this.width,
this.height,
pixelRatio
)

}

this.pixelRatioApplied=pixelRatio

if(this.onScaleChange){

this.onScaleChange(
this.currentScale,
pixelRatio
)

}

}

_clamp(v,min,max){

return Math.max(min,Math.min(max,v))

}

setEnabled(enabled){

this.enabled=!!enabled

this.state=this.enabled
?SCALER_STATE.ACTIVE
:SCALER_STATE.DISABLED

}

forceScale(scale){

this.currentScale=this._clamp(
scale,
this.minScale,
this.maxScale
)

this.targetScale=this.currentScale

this._applyScale()

}

getScale(){

return this.currentScale

}

getPixelRatio(){

return this.pixelRatioBase*this.currentScale

}

getPerformanceLevel(){

const s=this.currentScale

if(s>=0.95)return'ultra'
if(s>=0.85)return'high'
if(s>=0.7)return'medium'
if(s>=0.55)return'low'
return'very_low'

}

reset(){

this.currentScale=1
this.targetScale=1

this.stableFrames=0
this.time=0

this._lastScaleChangeTime=0

this._applyScale()

}

dispose(){

if(this.state===SCALER_STATE.DISPOSED)return

this._detachRendererEvents()

this.enabled=false
this.state=SCALER_STATE.DISPOSED

this.renderer=null
this.pipeline=null
this.onScaleChange=null

}

}
