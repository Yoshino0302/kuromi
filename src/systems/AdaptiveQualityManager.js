import {FPSMeter} from './FPSMeter.js'
import {PerformanceScaler} from './PerformanceScaler.js'

const QUALITY_LEVELS={
ULTRA:0,
HIGH:1,
MEDIUM:2,
LOW:3,
VERY_LOW:4
}

export class AdaptiveQualityManager{

constructor(renderer,pipeline,options={}){

this.renderer=renderer
this.pipeline=pipeline

this.options=options

this.enabled=true

this.fpsMeter=new FPSMeter(options.fps||{})

this.scaler=new PerformanceScaler(renderer,options.scaler||{})

this.scaler.attachPipeline(pipeline)

this.currentQuality=QUALITY_LEVELS.ULTRA
this.targetQuality=QUALITY_LEVELS.ULTRA

this.qualityChangeCooldown=options.qualityChangeCooldown||0.5
this._lastQualityChangeTime=0

this.time=0

this.onQualityChange=null

this.features={
shadows:true,
postprocessing:true,
bloom:true,
ssao:true,
ssr:true,
volumetric:true,
antialias:true
}

this.qualityProfiles=this._createProfiles()

}

_createProfiles(){

return{

[QUALITY_LEVELS.ULTRA]:{
shadows:true,
postprocessing:true,
bloom:true,
ssao:true,
ssr:true,
volumetric:true,
antialias:true
},

[QUALITY_LEVELS.HIGH]:{
shadows:true,
postprocessing:true,
bloom:true,
ssao:true,
ssr:false,
volumetric:false,
antialias:true
},

[QUALITY_LEVELS.MEDIUM]:{
shadows:true,
postprocessing:true,
bloom:false,
ssao:false,
ssr:false,
volumetric:false,
antialias:true
},

[QUALITY_LEVELS.LOW]:{
shadows:false,
postprocessing:true,
bloom:false,
ssao:false,
ssr:false,
volumetric:false,
antialias:false
},

[QUALITY_LEVELS.VERY_LOW]:{
shadows:false,
postprocessing:false,
bloom:false,
ssao:false,
ssr:false,
volumetric:false,
antialias:false
}

}

}

update(delta){

if(!this.enabled)return

this.time+=delta

const fps=this.fpsMeter.update()

this.scaler.update(fps,delta)

this._updateQualityLevel(fps)

}

_updateQualityLevel(fps){

const level=this._computeQualityFromScale()

if(level===this.currentQuality)return

if(this.time-this._lastQualityChangeTime<this.qualityChangeCooldown)return

this.currentQuality=level

this._applyQualityProfile(level)

this._lastQualityChangeTime=this.time

if(this.onQualityChange){

this.onQualityChange(level,this.getQualityName())

}

}

_computeQualityFromScale(){

const s=this.scaler.getScale()

if(s>=0.95)return QUALITY_LEVELS.ULTRA
if(s>=0.85)return QUALITY_LEVELS.HIGH
if(s>=0.7)return QUALITY_LEVELS.MEDIUM
if(s>=0.55)return QUALITY_LEVELS.LOW
return QUALITY_LEVELS.VERY_LOW

}

_applyQualityProfile(level){

const profile=this.qualityProfiles[level]

if(!profile)return

Object.assign(this.features,profile)

if(this.pipeline){

if(this.pipeline.setFeatureEnabled){

for(const key in profile){

this.pipeline.setFeatureEnabled(key,profile[key])

}

}

}

}

setEnabled(enabled){

this.enabled=enabled

this.scaler.setEnabled(enabled)

}

setSize(width,height){

this.scaler.setSize(width,height)

}

getFPS(){

return this.fpsMeter.getFPS()

}

getScale(){

return this.scaler.getScale()

}

getQualityLevel(){

return this.currentQuality

}

getQualityName(){

switch(this.currentQuality){

case QUALITY_LEVELS.ULTRA:return'ultra'
case QUALITY_LEVELS.HIGH:return'high'
case QUALITY_LEVELS.MEDIUM:return'medium'
case QUALITY_LEVELS.LOW:return'low'
default:return'very_low'

}

}

getStats(){

return{

fps:this.getFPS(),
scale:this.getScale(),
quality:this.getQualityName(),
pixelRatio:this.scaler.getPixelRatio(),
features:{...this.features}

}

}

reset(){

this.fpsMeter.reset()

this.scaler.reset()

this.currentQuality=QUALITY_LEVELS.ULTRA

this._applyQualityProfile(this.currentQuality)

}

dispose(){

this.enabled=false

this.scaler.dispose()

this.renderer=null
this.pipeline=null

}

}
