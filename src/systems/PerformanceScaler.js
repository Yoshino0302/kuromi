const SCALER_STATE={
ACTIVE:0,
DISABLED:1,
DISPOSED:2
}

export class PerformanceScaler{

constructor(renderer,options={}){

this.renderer=renderer

this.options=options

this.state=SCALER_STATE.ACTIVE

this.enabled=true

this.targetFPS=options.targetFPS||60
this.minFPS=options.minFPS||30

this.maxScale=options.maxScale||1
this.minScale=options.minScale||0.5

this.downscaleSpeed=options.downscaleSpeed||0.12
this.upscaleSpeed=options.upscaleSpeed||0.03

this.hysteresis=options.hysteresis||3

this.requiredStableFrames=options.requiredStableFrames||45

this.currentScale=1
this.targetScale=1

this.pixelRatioBase=Math.min(
window.devicePixelRatio||1,
options.maxPixelRatio||2
)

this.pixelRatioApplied=-1

this.stableFrames=0

this.lastFPS=this.targetFPS

this.trend=0

this.spikeDetected=false

this._lastScaleChangeTime=0

this.scaleChangeCooldown=options.scaleChangeCooldown||0.25

this.time=0

}

update(currentFPS,delta=0){

if(!this.enabled)return

if(this.state!==SCALER_STATE.ACTIVE)return

if(!this.renderer)return

if(currentFPS<=0)return

this.time+=delta||0.016

this.trend=currentFPS-this.lastFPS

this.spikeDetected=currentFPS<this.minFPS*0.8

this.lastFPS=currentFPS

this._computeTargetScale(currentFPS)

this._applyCooldown()

this._smoothScale()

this._applyScale()

}

_computeTargetScale(fps){

if(this.spikeDetected){

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

const adaptiveFactor=0.6+Math.min(Math.abs(this.trend)*0.01,0.2)

const scale=1-deficit*adaptiveFactor

this.targetScale=this._clamp(
scale,
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

if(
Math.abs(this.targetScale-this.currentScale)>0.01
){

if(
now-this._lastScaleChangeTime<
this.scaleChangeCooldown
){

this.targetScale=this.currentScale

}else{

this._lastScaleChangeTime=now

}

}

}

_smoothScale(){

if(this.currentScale>this.targetScale){

this.currentScale-=this.downscaleSpeed

if(this.currentScale<this.targetScale){

this.currentScale=this.targetScale

}

}else if(this.currentScale<this.targetScale){

this.currentScale+=this.upscaleSpeed

if(this.currentScale>this.targetScale){

this.currentScale=this.targetScale

}

}

}

_applyScale(){

if(!this.renderer?.setPixelRatio)return

const finalPixelRatio=
this.pixelRatioBase*this.currentScale

if(
Math.abs(
finalPixelRatio-this.pixelRatioApplied
)<0.01
)return

this.renderer.setPixelRatio(
finalPixelRatio
)

this.pixelRatioApplied=finalPixelRatio

}

_clamp(v,min,max){

return Math.max(min,Math.min(max,v))

}

setEnabled(enabled){

this.enabled=enabled

this.state=enabled
?SCALER_STATE.ACTIVE
:SCALER_STATE.DISABLED

}

setTargetFPS(fps){

this.targetFPS=fps

}

setMinScale(scale){

this.minScale=scale

}

setMaxScale(scale){

this.maxScale=scale

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

isStable(){

return this.stableFrames>=this.requiredStableFrames

}

isThrottling(){

return this.currentScale<0.99

}

isRecovering(){

return this.currentScale<this.targetScale

}

reset(){

this.currentScale=1
this.targetScale=1
this.stableFrames=0
this.time=0

this._applyScale()

}

dispose(){

this.enabled=false

this.state=SCALER_STATE.DISPOSED

this.renderer=null

}

}
