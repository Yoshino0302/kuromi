import * as THREE from 'https://jspm.dev/three'

const __ENGINE_CONFIG_VERSION="KUROMI_ENGINE_OMEGA_ABSOLUTE"
const __ENGINE_CONFIG_SIGNATURE="KUROMI_ENGINE_CONFIG_AUTHORITY"
const __ENGINE_CONFIG_SCHEMA=1

let __CONFIG_LOCKED=false

const __CONFIG_RUNTIME_STATE={
validated:false,
resolved:false,
derivedBuilt:false,
locked:false,
authorityVerified:false,
signatureVerified:false,
versionVerified:false,
schemaVerified:false
}

function __panic(msg){
throw new Error("[ENGINE_CONFIG_AUTHORITY] "+msg)
}

function __assert(condition,msg){
if(!condition)__panic(msg)
}

function __assertObject(v,name){
if(!v||typeof v!=="object")__panic(name+" must be object")
}

function __assertString(v,name){
if(typeof v!=="string")__panic(name+" must be string")
}

function __assertNumber(v,name,min,max){
if(typeof v!=="number"||Number.isNaN(v))__panic(name+" invalid number")
if(min!==undefined&&v<min)__panic(name+" below "+min)
if(max!==undefined&&v>max)__panic(name+" above "+max)
}

function __assertBoolean(v,name){
if(typeof v!=="boolean")__panic(name+" must be boolean")
}

function __deepFreezeInternal(obj,seen){
if(obj===null||typeof obj!=="object")return obj
if(seen.has(obj))return obj
seen.add(obj)
Object.freeze(obj)
const keys=Object.getOwnPropertyNames(obj)
for(let i=0;i<keys.length;i++){
const k=keys[i]
const v=obj[k]
if(v&&typeof v==="object")__deepFreezeInternal(v,seen)
}
return obj
}

export function deepFreeze(obj){
return __deepFreezeInternal(obj,new WeakSet())
}

function __verifyAuthorityBlock(block){
__assertObject(block,"AUTHORITY")
__assertString(block.SIGNATURE,"AUTHORITY.SIGNATURE")
__assertString(block.VERSION,"AUTHORITY.VERSION")
__assertNumber(block.SCHEMA,"AUTHORITY.SCHEMA")
__assert(block.SIGNATURE===__ENGINE_CONFIG_SIGNATURE,"Invalid authority signature")
__assert(block.VERSION===__ENGINE_CONFIG_VERSION,"Invalid config version")
__assert(block.SCHEMA===__ENGINE_CONFIG_SCHEMA,"Invalid schema version")
__CONFIG_RUNTIME_STATE.signatureVerified=true
__CONFIG_RUNTIME_STATE.versionVerified=true
__CONFIG_RUNTIME_STATE.schemaVerified=true
__CONFIG_RUNTIME_STATE.authorityVerified=true
}

export function lockEngineConfig(){
if(__CONFIG_LOCKED)return
__CONFIG_LOCKED=true
__CONFIG_RUNTIME_STATE.locked=true
}

export function isEngineConfigLocked(){
return __CONFIG_LOCKED
}

function __assertUnlocked(){
if(__CONFIG_LOCKED)__panic("Config mutation denied after lock")
}
const ENGINE_AUTHORITY=deepFreeze({
SIGNATURE:__ENGINE_CONFIG_SIGNATURE,
VERSION:__ENGINE_CONFIG_VERSION,
SCHEMA:__ENGINE_CONFIG_SCHEMA,
NAME:"KUROMI_ENGINE_CONFIG",
IMMUTABLE:true,
PERMANENT_VERSION:true,
AUTHORITY_LEVEL:"ABSOLUTE",
COMPATIBILITY:"STRICT"
})

const ENGINE_META=deepFreeze({
NAME:"KUROMI",
ENGINE:"KUROMI_WEB_CINEMATIC_ENGINE",
VERSION:__ENGINE_CONFIG_VERSION,
CONFIG_SIGNATURE:__ENGINE_CONFIG_SIGNATURE,
CONFIG_SCHEMA:__ENGINE_CONFIG_SCHEMA,
BUILD:"ABSOLUTE",
AUTHOR:"KUROMI_ENGINE_CORE",
ARCHITECTURE:"HYBRID_CINEMATIC_RENDERER",
TARGET:"AAA_CINEMATIC",
PLATFORM:"WEB",
IMMUTABLE:true
})

const ENGINE_FLAGS=deepFreeze({
DEBUG:false,
VALIDATION:true,
STRICT_MODE:true,
ENABLE_ASSERTIONS:true,
ENABLE_WARNINGS:true,
ENABLE_ERRORS:true,
ENABLE_LOGS:false,
ENABLE_PROFILING:false,
ENABLE_GPU_MARKERS:false,
ENABLE_PERFORMANCE_TRACKING:true,
ENABLE_RUNTIME_GUARDS:true,
ENABLE_AUTHORITY_CHECKS:true
})

const ENGINE_TIMING=deepFreeze({
CLOCK_AUTO_START:true,
TARGET_FPS:24,
MIN_FPS:5,
MAX_FPS:240,
TARGET_FRAME_TIME:1/24,
MIN_FRAME_TIME:1/1000,
MAX_FRAME_TIME:1/5,
FIXED_TIMESTEP:1/60,
MAX_DELTA:0.25,
SMOOTHING_FACTOR:0.9
})

__verifyAuthorityBlock(ENGINE_AUTHORITY)
const ENGINE_GPU=deepFreeze({
API:"WEBGL2",
PRECISION:"highp",
POWER_PREFERENCE:"high-performance",
ANTIALIAS:true,
ALPHA:false,
DEPTH:true,
STENCIL:false,
PREMULTIPLIED_ALPHA:false,
PRESERVE_DRAWING_BUFFER:false,
FAIL_IF_MAJOR_PERFORMANCE_CAVEAT:false,
DESYNCHRONIZED:true,
MAX_TEXTURE_UNITS:32,
MAX_VERTEX_ATTRIBUTES:32,
MAX_RENDER_TARGETS:16,
MAX_UNIFORM_BUFFERS:1024,
MAX_STORAGE_BUFFERS:1024,
MAX_TEXTURE_SIZE:16384,
MAX_CUBE_MAP_SIZE:16384,
MAX_VERTEX_UNIFORM_VECTORS:4096,
MAX_FRAGMENT_UNIFORM_VECTORS:4096,
SHADER_PARALLEL_COMPILE:true,
ASYNC_SHADER_COMPILE:true,
PIPELINE_CACHE:true
})

const ENGINE_MEMORY=deepFreeze({
MAX_CPU_MEMORY:8*1024*1024*1024,
MAX_GPU_MEMORY:4*1024*1024*1024,
MAX_TEXTURES:65536,
MAX_GEOMETRIES:100000,
MAX_MATERIALS:65536,
MAX_OBJECTS:100000,
MAX_LIGHTS:4096,
MAX_RENDER_TARGETS:1024,
GC_INTERVAL:300,
ENABLE_MEMORY_TRACKING:true,
ENABLE_MEMORY_GUARDS:true,
ENABLE_RESOURCE_LIMITS:true,
ENABLE_POOLING:true,
POOL_BUCKET_COUNT:64
})

const ENGINE_RENDERING=deepFreeze({
COLOR_SPACE:"ACEScg",
OUTPUT_COLOR_SPACE:"sRGB",
TONE_MAPPING:"ACES",
TONE_MAPPING_EXPOSURE:1.0,
USE_HDR:true,
HDR_PRECISION:"float32",
ENABLE_TEMPORAL:true,
ENABLE_ACCUMULATION:true,
ENABLE_ADAPTIVE_SAMPLING:true,
ENABLE_PATH_TRACING:true,
ENABLE_SPECTRAL_RENDERING:true,
ENABLE_GLOBAL_ILLUMINATION:true,
ENABLE_REFLECTIONS:true,
ENABLE_REFRACTIONS:true,
ENABLE_CAUSTICS:true,
ENABLE_VOLUME:true,
ENABLE_SUBSURFACE:true,
ENABLE_MOTION_BLUR:true,
ENABLE_DEPTH_OF_FIELD:true,
ENABLE_FILM_GRAIN:true,
ENABLE_LENS_EFFECTS:true,
ENABLE_COLOR_GRADING:true,
MAX_BOUNCES:12,
MAX_SAMPLES_PER_PIXEL:65536,
MIN_SAMPLES_PER_PIXEL:1,
ADAPTIVE_THRESHOLD:0.0005,
RENDER_SCALE:1.0,
PIXEL_RATIO:Math.min(window.devicePixelRatio||1,2)
})

const ENGINE_SCALING=deepFreeze({
ENABLED:true,
TARGET_FPS:24,
MIN_SCALE:0.25,
MAX_SCALE:1.0,
SCALE_STEP:0.05,
UP_SCALE_FILTER:"CATMULL_ROM",
DOWN_SCALE_FILTER:"LANCZOS",
ADAPTIVE_SCALING:true,
DYNAMIC_RESOLUTION:true,
FRAME_TIME_BUDGET:1/24
})
const ENGINE_FEATURES=deepFreeze({
TEMPORAL:true,
ADAPTIVE_SAMPLING:true,
PATH_TRACING:true,
SPECTRAL_RENDERING:true,
GLOBAL_ILLUMINATION:true,
RESTIR:true,
VOLUMETRIC_LIGHTING:true,
SUBSURFACE_SCATTERING:true,
SCREEN_SPACE_REFLECTIONS:true,
HYBRID_REFLECTIONS:true,
CAUSTICS:true,
REFRACTIONS:true,
HDR:true,
COLOR_GRADING:true,
TONE_MAPPING:true,
MOTION_BLUR:true,
DEPTH_OF_FIELD:true,
FILM_GRAIN:true,
LENS_DISTORTION:true,
CHROMATIC_ABERRATION:true,
BLOOM:true,
AUTO_EXPOSURE:true,
TEMPORAL_ACCUMULATION:true,
DYNAMIC_RESOLUTION:true,
ASYNC_COMPUTE:true,
RENDER_GRAPH:true,
STREAMING:true,
MEMORY_TRACKING:true,
PERFORMANCE_MONITORING:true
})

const ENGINE_PIPELINE=deepFreeze({
TYPE:"CINEMATIC_HYBRID",
RENDERER:"PATH_TRACER_HYBRID",
INTEGRATOR:"SPECTRAL_GI",
ACCUMULATION:"FLOAT32_HDR",
TEMPORAL_MODE:"ACCUMULATION",
RESOLVE:"FILMIC_ACES",
COLOR_PIPELINE:"ACEScg_TO_sRGB",
EXPOSURE_MODE:"PHYSICAL_CAMERA",
SAMPLING_MODE:"ADAPTIVE_VARIANCE",
RENDER_GRAPH_ENABLED:true,
FRAME_GRAPH_ENABLED:true,
MULTI_PASS:true,
MAX_PIPELINE_STAGES:256,
MAX_RENDER_PASSES:512
})

const ENGINE_STREAMING=deepFreeze({
ENABLED:true,
MAX_CONCURRENT_REQUESTS:64,
MAX_PENDING_REQUESTS:256,
STREAM_BUDGET_MB:512,
TEXTURE_STREAMING:true,
GEOMETRY_STREAMING:true,
SHADER_STREAMING:true,
ENVIRONMENT_STREAMING:true,
CACHE_SIZE_MB:1024,
CACHE_EVICTION_POLICY:"LRU",
ENABLE_BACKGROUND_STREAMING:true,
ENABLE_PRIORITY_STREAMING:true
})

const ENGINE_ASYNC=deepFreeze({
ENABLED:true,
MAX_WORKERS:16,
MAX_ASYNC_JOBS:2048,
JOB_QUEUE_SIZE:8192,
ENABLE_ASYNC_RENDER:true,
ENABLE_ASYNC_COMPUTE:true,
ENABLE_ASYNC_STREAMING:true,
ENABLE_PARALLEL_INIT:true,
ENABLE_BACKGROUND_COMPILATION:true,
ENABLE_NON_BLOCKING_PIPELINE:true
})
const __GPU_CAPS_STATE={
resolved:false,
maxTextureUnits:0,
maxVertexAttribs:0,
maxRenderTargets:0,
maxTextureSize:0,
precision:"highp"
}

const __DERIVED_CONFIG_STATE={
built:false,
values:null
}

function resolveGPUCapabilities(renderer,config){
__assertObject(config,"config")
if(!renderer){
__GPU_CAPS_STATE.resolved=false
return
}
const gl=renderer.getContext?.()
if(!gl){
__GPU_CAPS_STATE.resolved=false
return
}
__GPU_CAPS_STATE.maxTextureUnits=
gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)||config.GPU.MAX_TEXTURE_UNITS
__GPU_CAPS_STATE.maxVertexAttribs=
gl.getParameter(gl.MAX_VERTEX_ATTRIBS)||config.GPU.MAX_VERTEX_ATTRIBUTES
__GPU_CAPS_STATE.maxRenderTargets=
gl.getParameter(gl.MAX_DRAW_BUFFERS)||config.GPU.MAX_RENDER_TARGETS
__GPU_CAPS_STATE.maxTextureSize=
gl.getParameter(gl.MAX_TEXTURE_SIZE)||config.GPU.MAX_TEXTURE_SIZE
__GPU_CAPS_STATE.precision=
gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT)?.precision>0
?"highp":"mediump"
__GPU_CAPS_STATE.resolved=true
__CONFIG_RUNTIME_STATE.resolved=true
}

function buildDerivedConfig(config){
__assertObject(config,"config")
const derived={
GPU:{
textureUnits:Math.min(
config.GPU.MAX_TEXTURE_UNITS,
__GPU_CAPS_STATE.maxTextureUnits||config.GPU.MAX_TEXTURE_UNITS
),
renderTargets:Math.min(
config.GPU.MAX_RENDER_TARGETS,
__GPU_CAPS_STATE.maxRenderTargets||config.GPU.MAX_RENDER_TARGETS
),
precision:__GPU_CAPS_STATE.precision
},
RENDERING:{
pixelRatio:config.RENDERING.PIXEL_RATIO,
hdr:config.RENDERING.USE_HDR,
spectral:config.RENDERING.ENABLE_SPECTRAL_RENDERING,
pathTracing:config.RENDERING.ENABLE_PATH_TRACING
},
MEMORY:{
maxTextures:config.MEMORY.MAX_TEXTURES,
maxMaterials:config.MEMORY.MAX_MATERIALS
},
PIPELINE:{
maxPasses:config.PIPELINE.MAX_RENDER_PASSES,
maxStages:config.PIPELINE.MAX_PIPELINE_STAGES
}
}
__DERIVED_CONFIG_STATE.values=deepFreeze(derived)
__DERIVED_CONFIG_STATE.built=true
__CONFIG_RUNTIME_STATE.derivedBuilt=true
}

function validateEngineConfig(config){
__assertObject(config,"ENGINE_CONFIG")
__assertObject(config.AUTHORITY,"AUTHORITY")
__assertObject(config.META,"META")
__assertObject(config.FLAGS,"FLAGS")
__assertObject(config.TIMING,"TIMING")
__assertObject(config.GPU,"GPU")
__assertObject(config.MEMORY,"MEMORY")
__assertObject(config.RENDERING,"RENDERING")
__assertObject(config.PIPELINE,"PIPELINE")
__assertObject(config.FEATURES,"FEATURES")
__assertObject(config.ASYNC,"ASYNC")
__assertObject(config.STREAMING,"STREAMING")
__CONFIG_RUNTIME_STATE.validated=true
return true
}

export function initializeEngineConfig(renderer){
__assertUnlocked()
validateEngineConfig(ENGINE_CONFIG)
resolveGPUCapabilities(renderer,ENGINE_CONFIG)
buildDerivedConfig(ENGINE_CONFIG)
lockEngineConfig()
return ENGINE_CONFIG
}

export function getEngineConfig(){
return ENGINE_CONFIG
}

export function getDerivedConfig(){
return __DERIVED_CONFIG_STATE.values
}

export function getGPUCapabilities(){
return deepFreeze(__GPU_CAPS_STATE)
}

export function getEngineConfigRuntimeState(){
return deepFreeze(__CONFIG_RUNTIME_STATE)
}

export function assertEngineConfigReady(){
__assert(__CONFIG_RUNTIME_STATE.validated,"Config not validated")
__assert(__CONFIG_RUNTIME_STATE.resolved,"GPU not resolved")
__assert(__CONFIG_RUNTIME_STATE.derivedBuilt,"Derived config not built")
__assert(__CONFIG_RUNTIME_STATE.locked,"Config not locked")
__assert(__CONFIG_RUNTIME_STATE.authorityVerified,"Authority not verified")
return true
}
const __ENGINE_CONFIG_INTERNAL={
AUTHORITY:ENGINE_AUTHORITY,
META:ENGINE_META,
FLAGS:ENGINE_FLAGS,
TIMING:ENGINE_TIMING,
GPU:ENGINE_GPU,
MEMORY:ENGINE_MEMORY,
RENDERING:ENGINE_RENDERING,
SCALING:ENGINE_SCALING,
FEATURES:ENGINE_FEATURES,
PIPELINE:ENGINE_PIPELINE,
STREAMING:ENGINE_STREAMING,
ASYNC:ENGINE_ASYNC,
DERIVED:{
STATE:__DERIVED_CONFIG_STATE
},
RUNTIME:{
STATE:__CONFIG_RUNTIME_STATE
}
}

export const ENGINE_CONFIG=deepFreeze(__ENGINE_CONFIG_INTERNAL)

export const ENGINE_CONFIG_VERSION=__ENGINE_CONFIG_VERSION

export const ENGINE_CONFIG_SIGNATURE=__ENGINE_CONFIG_SIGNATURE

export const ENGINE_CONFIG_SCHEMA_VERSION=__ENGINE_CONFIG_SCHEMA

export function verifyEngineConfigAuthority(){
__verifyAuthorityBlock(ENGINE_CONFIG.AUTHORITY)
return true
}

export function isEngineConfigReady(){
return(
__CONFIG_RUNTIME_STATE.validated&&
__CONFIG_RUNTIME_STATE.resolved&&
__CONFIG_RUNTIME_STATE.derivedBuilt&&
__CONFIG_RUNTIME_STATE.locked&&
__CONFIG_RUNTIME_STATE.authorityVerified
)
}

export function assertEngineConfigAuthority(){
if(!isEngineConfigReady()){
__panic("ENGINE_CONFIG authority not ready")
}
return true
}

verifyEngineConfigAuthority()
deepFreeze(ENGINE_CONFIG)
