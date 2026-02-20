const DEFAULTS={

version:'1.0.0',

name:'KUROMI_ENGINE',

environment:'web',

debug:false,

autoStart:true,

fixedTimeStep:false,

fixedDelta:1/60,

maxDelta:0.1,

minDelta:1/240,

timeScale:1,

pauseOnHidden:true,

resumeOnVisible:true,

container:null,

canvas:null,

resolution:{
width:0,
height:0,
autoResize:true
},

pixelRatio:{
min:0.5,
max:2,
adaptive:true
},

performance:{
enabled:true,
targetFPS:60,
minFPS:30,
sampleSize:60
},

lifecycle:{
autoInitialize:true,
autoStart:true,
autoDispose:true
},

systems:{
autoUpdate:true,
autoStart:true
},

renderer:{
autoClear:true,
sortObjects:true
},

input:{
enabled:true,
capturePointer:true
},

animation:{
enabled:true,
maxTweens:10000
},

memory:{
trackGPU:true,
trackCPU:true,
autoDispose:true
},

events:{
enabled:true,
maxListeners:1000
},

safety:{
nullGuard:true,
disposeGuard:true
}

}

export class EngineConfig{

constructor(overrides={}){

this._config=_deepMerge(
structuredClone(DEFAULTS),
overrides
)

this._validate()

Object.freeze(this._config)
Object.freeze(this)

}

_validate(){

const c=this._config

if(c.fixedDelta<=0)throw new Error('EngineConfig.fixedDelta must be > 0')

if(c.maxDelta<=0)throw new Error('EngineConfig.maxDelta must be > 0')

if(c.minDelta<=0)throw new Error('EngineConfig.minDelta must be > 0')

if(c.timeScale<=0)throw new Error('EngineConfig.timeScale must be > 0')

if(c.pixelRatio.min<=0)throw new Error('EngineConfig.pixelRatio.min must be > 0')

if(c.pixelRatio.max<=0)throw new Error('EngineConfig.pixelRatio.max must be > 0')

if(c.pixelRatio.max<c.pixelRatio.min)throw new Error('EngineConfig.pixelRatio.max must be >= min')

if(c.performance.targetFPS<=0)throw new Error('EngineConfig.performance.targetFPS must be > 0')

if(c.performance.minFPS<=0)throw new Error('EngineConfig.performance.minFPS must be > 0')

}

get version(){return this._config.version}
get name(){return this._config.name}
get environment(){return this._config.environment}
get debug(){return this._config.debug}
get autoStart(){return this._config.autoStart}
get fixedTimeStep(){return this._config.fixedTimeStep}
get fixedDelta(){return this._config.fixedDelta}
get maxDelta(){return this._config.maxDelta}
get minDelta(){return this._config.minDelta}
get timeScale(){return this._config.timeScale}
get pauseOnHidden(){return this._config.pauseOnHidden}
get resumeOnVisible(){return this._config.resumeOnVisible}
get container(){return this._config.container}
get canvas(){return this._config.canvas}
get resolution(){return this._config.resolution}
get pixelRatio(){return this._config.pixelRatio}
get performance(){return this._config.performance}
get lifecycle(){return this._config.lifecycle}
get systems(){return this._config.systems}
get renderer(){return this._config.renderer}
get input(){return this._config.input}
get animation(){return this._config.animation}
get memory(){return this._config.memory}
get events(){return this._config.events}
get safety(){return this._config.safety}

toJSON(){

return structuredClone(this._config)

}

merge(overrides={}){

return new EngineConfig(
_deepMerge(
structuredClone(this._config),
overrides
)
)

}

static create(overrides={}){

return new EngineConfig(overrides)

}

static getDefaults(){

return structuredClone(DEFAULTS)

}

}

function _deepMerge(target,source){

for(const key in source){

const value=source[key]

if(
value&&
typeof value==='object'&&
!Array.isArray(value)
){

if(!target[key])target[key]={}

_deepMerge(target[key],value)

}else{

target[key]=value

}

}

return target

}
