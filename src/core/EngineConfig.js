import * as THREE from 'https://jspm.dev/three'

let __CONFIG_LOCKED=false

const __CONFIG_RUNTIME_STATE={
validated:false,
resolved:false,
derivedBuilt:false,
locked:false
}

function __deepFreezeInternal(obj,seen)
{
if(obj===null||typeof obj!=='object')return obj
if(seen.has(obj))return obj
seen.add(obj)
Object.freeze(obj)
const keys=Object.getOwnPropertyNames(obj)
for(let i=0;i<keys.length;i++)
{
const key=keys[i]
const value=obj[key]
if(value&&typeof value==='object')
__deepFreezeInternal(value,seen)
}
return obj
}

export function deepFreeze(obj)
{
return __deepFreezeInternal(obj,new WeakSet())
}

export function lockEngineConfig()
{
if(__CONFIG_LOCKED)return
__CONFIG_LOCKED=true
__CONFIG_RUNTIME_STATE.locked=true
}

export function unlockEngineConfig()
{
throw new Error('EngineConfig cannot be unlocked in production')
}

export function isEngineConfigLocked()
{
return __CONFIG_LOCKED
}

function __assertUnlocked()
{
if(__CONFIG_LOCKED)
throw new Error('EngineConfig mutation attempted after lock')
}

function __assertNumber(value,name,min,max)
{
if(typeof value!=='number'||Number.isNaN(value))
throw new Error(name+' must be a valid number')
if(min!==undefined&&value<min)
throw new Error(name+' below minimum '+min)
if(max!==undefined&&value>max)
throw new Error(name+' above maximum '+max)
}

function __assertBoolean(value,name)
{
if(typeof value!=='boolean')
throw new Error(name+' must be boolean')
}

function __assertObject(value,name)
{
if(!value||typeof value!=='object')
throw new Error(name+' must be object')
}

function __assertString(value,name)
{
if(typeof value!=='string')
throw new Error(name+' must be string')
}

export const ENGINE_META=deepFreeze({

NAME:'KUROMI',

VERSION:'Ω∞Ω∞Ω',

BUILD:'FINAL_ULTIMATE',

AUTHOR:'KUROMI_ENGINE_CORE',

ARCHITECTURE:'HYBRID_CINEMATIC_RENDERER',

TARGET_CLASS:'AAA',

})

export const ENGINE_FLAGS=deepFreeze({

DEBUG:false,

VALIDATION:true,

GPU_VALIDATION:true,

STRICT_MODE:true,

ENABLE_LOGS:false,

ENABLE_WARNINGS:true,

ENABLE_ERRORS:true,

ENABLE_ASSERTIONS:true,

ENABLE_GPU_MARKERS:false,

ENABLE_PROFILING:false,

})

export const ENGINE_GPU=deepFreeze({

API:'WEBGL2',

USE_COMPUTE_SHADERS:true,

USE_INSTANCING:true,

USE_GPU_CULLING:true,

USE_GPU_SKINNING:true,

USE_GPU_PARTICLES:true,

USE_GPU_OCCLUSION:true,

MAX_UNIFORM_BUFFERS:1024,

MAX_STORAGE_BUFFERS:1024,

MAX_TEXTURE_UNITS:32,

MAX_RENDER_TARGETS:16,

MAX_VERTEX_ATTRIBUTES:32,

ASYNC_SHADER_COMPILE:true,

PARALLEL_SHADER_COMPILE:true,

})

export const ENGINE_MEMORY=deepFreeze({

MAX_CPU_MEMORY:8*1024*1024*1024,

MAX_GPU_MEMORY:4*1024*1024*1024,

MAX_TEXTURES:65536,

MAX_MESHES:100000,

MAX_MATERIALS:65536,

GC_INTERVAL:300,

ENABLE_MEMORY_TRACKING:true,

})

export const ENGINE_FEATURES=deepFreeze({

TEMPORAL:true,

MOTION_BLUR:true,

DOF:true,

VOLUMETRIC:true,

COLOR_GRADING:true,

LENS:true,

FILM_GRAIN:true,

REFLECTIONS:true,

GLOBAL_ILLUMINATION:true,

PATH_TRACING:true,

SPECTRAL:true,

RESTIR:true,

HDR:true,

STREAMING:true,

ASYNC_COMPUTE:true,

RENDER_GRAPH:true,

})
const __GPU_CAPS_STATE={
resolved:false,
maxTextures:0,
maxUniforms:0,
maxAttributes:0,
maxRenderTargets:0,
precision:'highp'
}

const __DERIVED_CONFIG_STATE={
built:false,
values:null
}

export function validateEngineConfig(config)
{
__assertObject(config,'ENGINE_CONFIG')
validateMeta(config.META)
validateFlags(config.FLAGS)
validateGPU(config.GPU)
validateMemory(config.MEMORY)
validateFeatures(config.FEATURES)
__CONFIG_RUNTIME_STATE.validated=true
return true
}

function validateMeta(meta)
{
__assertObject(meta,'META')
__assertString(meta.NAME,'META.NAME')
__assertString(meta.VERSION,'META.VERSION')
__assertString(meta.ARCHITECTURE,'META.ARCHITECTURE')
}

function validateFlags(flags)
{
__assertObject(flags,'FLAGS')
__assertBoolean(flags.DEBUG,'FLAGS.DEBUG')
__assertBoolean(flags.STRICT_MODE,'FLAGS.STRICT_MODE')
__assertBoolean(flags.ENABLE_ASSERTIONS,'FLAGS.ENABLE_ASSERTIONS')
}

function validateGPU(gpu)
{
__assertObject(gpu,'GPU')
__assertNumber(gpu.MAX_TEXTURE_UNITS,'GPU.MAX_TEXTURE_UNITS',1,1048576)
__assertNumber(gpu.MAX_UNIFORM_BUFFERS,'GPU.MAX_UNIFORM_BUFFERS',1,1048576)
__assertNumber(gpu.MAX_VERTEX_ATTRIBUTES,'GPU.MAX_VERTEX_ATTRIBUTES',1,1024)
}

function validateMemory(memory)
{
__assertObject(memory,'MEMORY')
__assertNumber(memory.MAX_CPU_MEMORY,'MEMORY.MAX_CPU_MEMORY',1024,Number.MAX_SAFE_INTEGER)
__assertNumber(memory.MAX_GPU_MEMORY,'MEMORY.MAX_GPU_MEMORY',1024,Number.MAX_SAFE_INTEGER)
__assertNumber(memory.MAX_TEXTURES,'MEMORY.MAX_TEXTURES',1,Number.MAX_SAFE_INTEGER)
}

function validateFeatures(features)
{
__assertObject(features,'FEATURES')
__assertBoolean(features.TEMPORAL,'FEATURES.TEMPORAL')
__assertBoolean(features.PATH_TRACING,'FEATURES.PATH_TRACING')
__assertBoolean(features.SPECTRAL,'FEATURES.SPECTRAL')
__assertBoolean(features.RESTIR,'FEATURES.RESTIR')
}

export function resolveGPUCapabilities(renderer,config)
{
__assertObject(renderer,'renderer')
__assertObject(config,'config')
const caps=renderer.capabilities||{}
__GPU_CAPS_STATE.maxTextures=caps.maxTextures||config.GPU.MAX_TEXTURE_UNITS
__GPU_CAPS_STATE.maxUniforms=caps.maxUniforms||config.GPU.MAX_UNIFORM_BUFFERS
__GPU_CAPS_STATE.maxAttributes=caps.maxAttributes||config.GPU.MAX_VERTEX_ATTRIBUTES
__GPU_CAPS_STATE.maxRenderTargets=caps.maxDrawBuffers||config.GPU.MAX_RENDER_TARGETS
__GPU_CAPS_STATE.precision=caps.precision||'highp'
__GPU_CAPS_STATE.resolved=true
__CONFIG_RUNTIME_STATE.resolved=true
return __GPU_CAPS_STATE
}

export function getGPUCapabilities()
{
return __GPU_CAPS_STATE
}

export function buildDerivedConfig(config)
{
__assertObject(config,'config')
const derived={
IS_TEMPORAL_ENABLED:
config.FEATURES.TEMPORAL===true,
IS_PATH_TRACING_ENABLED:
config.FEATURES.PATH_TRACING===true,
IS_SPECTRAL_ENABLED:
config.FEATURES.SPECTRAL===true,
IS_RESTIR_ENABLED:
config.FEATURES.RESTIR===true,
IS_HDR_ENABLED:
config.FEATURES.HDR===true,
IS_STREAMING_ENABLED:
config.FEATURES.STREAMING===true,
IS_ASYNC_ENABLED:
config.FEATURES.ASYNC_COMPUTE===true,
IS_RENDER_GRAPH_ENABLED:
config.FEATURES.RENDER_GRAPH===true,
GPU_TEXTURE_LIMIT:
Math.min(
config.GPU.MAX_TEXTURE_UNITS,
__GPU_CAPS_STATE.maxTextures||config.GPU.MAX_TEXTURE_UNITS
),
GPU_UNIFORM_LIMIT:
Math.min(
config.GPU.MAX_UNIFORM_BUFFERS,
__GPU_CAPS_STATE.maxUniforms||config.GPU.MAX_UNIFORM_BUFFERS
),
GPU_ATTRIBUTE_LIMIT:
Math.min(
config.GPU.MAX_VERTEX_ATTRIBUTES,
__GPU_CAPS_STATE.maxAttributes||config.GPU.MAX_VERTEX_ATTRIBUTES
),
PRECISION:
__GPU_CAPS_STATE.precision||'highp'
}
__DERIVED_CONFIG_STATE.values=deepFreeze(derived)
__DERIVED_CONFIG_STATE.built=true
__CONFIG_RUNTIME_STATE.derivedBuilt=true
return __DERIVED_CONFIG_STATE.values
}

export function getDerivedConfig()
{
return __DERIVED_CONFIG_STATE.values
}

export function isDerivedConfigBuilt()
{
return __DERIVED_CONFIG_STATE.built
}
export const ENGINE_PIPELINE=deepFreeze({

RENDERING_MODE:'HYBRID',

ENABLE_FORWARD:false,

ENABLE_DEFERRED:true,

ENABLE_RENDER_GRAPH:true,

ENABLE_ASYNC_COMPUTE:true,

MAX_RENDER_PASSES:1024,

MAX_FRAME_GRAPH_NODES:4096,

})

export const ENGINE_MEMORY_POOLS=deepFreeze({

GEOMETRY_POOL:2147483648,

TEXTURE_POOL:4294967296,

RENDER_TARGET_POOL:2147483648,

STAGING_POOL:536870912,

UNIFORM_POOL:268435456,

STORAGE_POOL:536870912,

})

export const ENGINE_SHADERS=deepFreeze({

CACHE_ENABLED:true,

CACHE_SIZE:1073741824,

HOT_RELOAD:true,

ASYNC_COMPILE:true,

PARALLEL_COMPILE:true,

MAX_VARIANTS:100000,

})

export const ENGINE_STREAMING=deepFreeze({

ENABLED:true,

MAX_CONCURRENT_REQUESTS:64,

STREAM_BUDGET_MB:512,

ENABLE_TEXTURE_STREAMING:true,

ENABLE_GEOMETRY_STREAMING:true,

ENABLE_SHADER_STREAMING:true,

})

export const ENGINE_FRAME_PACING=deepFreeze({

ENABLED:true,

TARGET_FPS:24,

TARGET_FRAME_TIME:0.041666666666666664,

MIN_FRAME_TIME:0.001,

MAX_FRAME_TIME:0.2,

})

export const ENGINE_RENDER_GRAPH=deepFreeze({

ENABLED:true,

MAX_NODES:4096,

MAX_RESOURCES:8192,

})

export const ENGINE_ASYNC=deepFreeze({

ENABLED:true,

MAX_ASYNC_JOBS:1024,

ENABLE_ASYNC_RENDER:true,

ENABLE_ASYNC_COMPUTE:true,

})

export const ENGINE_DERIVED=deepFreeze({

STATE:__DERIVED_CONFIG_STATE,

GPU:__GPU_CAPS_STATE,

})

const __ENGINE_CONFIG_INTERNAL={

META:ENGINE_META,

FLAGS:ENGINE_FLAGS,

GPU:ENGINE_GPU,

MEMORY:ENGINE_MEMORY,

FEATURES:ENGINE_FEATURES,

PIPELINE:ENGINE_PIPELINE,

MEMORY_POOLS:ENGINE_MEMORY_POOLS,

SHADERS:ENGINE_SHADERS,

STREAMING:ENGINE_STREAMING,

FRAME_PACING:ENGINE_FRAME_PACING,

RENDER_GRAPH:ENGINE_RENDER_GRAPH,

ASYNC:ENGINE_ASYNC,

DERIVED:ENGINE_DERIVED,

}

export const ENGINE_CONFIG=deepFreeze(__ENGINE_CONFIG_INTERNAL)

export function initializeEngineConfig(renderer)
{
__assertUnlocked()
validateEngineConfig(ENGINE_CONFIG)
resolveGPUCapabilities(renderer,ENGINE_CONFIG)
buildDerivedConfig(ENGINE_CONFIG)
lockEngineConfig()
return ENGINE_CONFIG
}

export function getEngineConfig()
{
return ENGINE_CONFIG
}

export function getEngineRuntimeState()
{
return deepFreeze(__CONFIG_RUNTIME_STATE)
}

export function assertEngineConfigReady()
{
if(!__CONFIG_RUNTIME_STATE.validated)
throw new Error('EngineConfig not validated')
if(!__CONFIG_RUNTIME_STATE.resolved)
throw new Error('GPU capabilities not resolved')
if(!__CONFIG_RUNTIME_STATE.derivedBuilt)
throw new Error('Derived config not built')
if(!__CONFIG_RUNTIME_STATE.locked)
throw new Error('EngineConfig not locked')
return true
}
