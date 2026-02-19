export class PerformanceScaler{

constructor(renderer,options={}){

this.renderer=renderer

this.options=options

this.enabled=true

this.targetFPS=options.targetFPS||60
this.minFPS=options.minFPS||30

this.maxScale=options.maxScale||1
this.minScale=options.minScale||0.5

this.downscaleSpeed=options.downscaleSpeed||0.08
this.upscaleSpeed=options.upscaleSpeed||0.02

this.hysteresis=options.hysteresis||3

this.currentScale=1
this.targetScale=1

this.lastFPS=this.targetFPS

this.stableFrames=0
this.requiredStableFrames=options.requiredStableFrames||30

this.pixelRatio=window.devicePixelRatio||1

this._lastAppliedScale=-1

}

update(currentFPS){

if(!this.enabled)return

if(!this.renderer)return

this.lastFPS=currentFPS

this._computeTargetScale(currentFPS)

this._smoothScale()

this._applyScale()

}

_computeTargetScale(fps){

if(fps<=0)return

if(fps<this.minFPS){

this.targetScale=this.minScale

this.stableFrames=0

return

}

if(fps<this.targetFPS-this.hysteresis){

const deficit=(this.targetFPS-fps)/this.targetFPS

const scale=1-deficit*0.5

this.targetScale=Math.max(this.minScale,Math.min(this.maxScale,scale))

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

if(!this.renderer.setPixelRatio)return

const finalScale=this.pixelRatio*this.currentScale

if(Math.abs(finalScale-this._lastAppliedScale)<0.01)return

this.renderer.setPixelRatio(finalScale)

this._lastAppliedScale=finalScale

}

setEnabled(enabled){

this.enabled=enabled

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

return this.pixelRatio*this.currentScale

}

getPerformanceLevel(){

if(this.currentScale>=0.95)return 'ultra'
if(this.currentScale>=0.8)return 'high'
if(this.currentScale>=0.65)return 'medium'
if(this.currentScale>=0.5)return 'low'
return 'very_low'

}

reset(){

this.currentScale=1
this.targetScale=1
this.stableFrames=0

this._applyScale()

}

dispose(){

this.enabled=false
this.renderer=null

}

}
