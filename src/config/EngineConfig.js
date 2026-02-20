export const EngineConfig={

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

export function createEngineConfig(overrides={}){

const config=structuredClone(EngineConfig)

merge(config,overrides)

return config

}

function merge(target,source){

for(const key in source){

const value=source[key]

if(
value&&
typeof value==='object'&&
!Array.isArray(value)
){

if(!target[key])target[key]={}

merge(target[key],value)

}else{

target[key]=value

}

}

}
