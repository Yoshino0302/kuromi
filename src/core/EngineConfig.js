import * as THREE from 'https://jspm.dev/three'

/*
KUROMI ENGINE — Ω∞Ω∞Ω ABSOLUTE CONFIG AUTHORITY
Single source of truth for entire cinematic engine runtime
Non-destructive. Immutable. Production-grade.
*/

export const ENGINE_META=Object.freeze({

NAME:'KUROMI',
VERSION:'Ω∞Ω∞Ω',
BUILD:'CINEMATIC_FINAL',
AUTHOR:'KUROMI_ENGINE_CORE',

})

/* =========================================================
ENGINE GLOBAL FLAGS
========================================================= */

export const ENGINE_FLAGS=Object.freeze({

DEBUG:false,

VALIDATION:false,

GPU_VALIDATION:false,

LOG_LEVEL:0,

ENABLE_LOGS:false,
ENABLE_WARNINGS:true,
ENABLE_ERRORS:true,

STRICT_MODE:true,

SAFE_MODE:false,

ENABLE_ASSERTIONS:false,

})

/* =========================================================
ENGINE FEATURE SWITCHES
========================================================= */

export const ENGINE_FEATURES=Object.freeze({

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

SSS:true,

HDR:true,

PERFORMANCE_SCALING:true,

THREADING:true,

})

/* =========================================================
TIMING AUTHORITY
========================================================= */

export const ENGINE_TIMING=Object.freeze({

TARGET_FPS:24,

MIN_FPS:12,

MAX_FPS:240,

FIXED_TIMESTEP:1/60,

MAX_DELTA:0.25,

MIN_DELTA:1/1000,

CLOCK_AUTO_START:false,

TIME_SCALE:1.0,

FRAME_SMOOTHING:0.9,

})

/* =========================================================
RENDERER AUTHORITY
========================================================= */

export const ENGINE_RENDERER=Object.freeze({

PRECISION:'highp',

POWER_PREFERENCE:'high-performance',

ANTIALIAS:false,

ALPHA:false,

DEPTH:true,

STENCIL:false,

PREMULTIPLIED_ALPHA:false,

PRESERVE_DRAWING_BUFFER:false,

FAIL_IF_MAJOR_PERFORMANCE_CAVEAT:false,

LOGARITHMIC_DEPTH_BUFFER:true,

COLOR_SPACE:THREE.SRGBColorSpace,

TONE_MAPPING:THREE.NoToneMapping,

EXPOSURE:1.0,

USE_PHYSICALLY_CORRECT_LIGHTS:true,

SHADOW_MAP_ENABLED:true,

SHADOW_MAP_TYPE:THREE.PCFSoftShadowMap,

MAX_TEXTURE_SIZE:16384,

MAX_CUBE_MAP_SIZE:16384,

MAX_RENDERBUFFER_SIZE:16384,

})

/* =========================================================
RESOLUTION SCALING
========================================================= */

export const ENGINE_SCALING=Object.freeze({

ENABLED:true,

TARGET_FPS:24,

MIN_SCALE:0.25,

MAX_SCALE:1.0,

ADAPT_RATE:0.05,

INCREASE_RATE:0.01,

DECREASE_RATE:0.05,

STABILITY_FRAMES:30,

})

/* =========================================================
MEMORY AUTHORITY
========================================================= */

export const ENGINE_MEMORY=Object.freeze({

MAX_CPU_MEMORY:8*1024*1024*1024,

MAX_GPU_MEMORY:4*1024*1024*1024,

MAX_TEXTURES:65536,

MAX_MESHES:100000,

MAX_MATERIALS:65536,

MAX_RENDER_TARGETS:512,

GC_INTERVAL:300,

RESOURCE_LIFETIME:600,

BUFFER_POOL_SIZE:512,

})

/* =========================================================
THREADING AUTHORITY
========================================================= */

export const ENGINE_THREADING=Object.freeze({

ENABLED:true,

MAX_WORKERS:typeof navigator!=='undefined'
?navigator.hardwareConcurrency||4
:4,

ENABLE_OFFSCREEN_CANVAS:true,

ENABLE_SHARED_ARRAY_BUFFER:false,

WORKER_INIT_TIMEOUT:5000,

})

/* =========================================================
SCENE LIMITS
========================================================= */

export const ENGINE_LIMITS=Object.freeze({

MAX_OBJECTS:200000,

MAX_LIGHTS:4096,

MAX_CAMERAS:64,

MAX_BONES:1024,

MAX_INSTANCES:1000000,

MAX_DRAW_CALLS:200000,

MAX_VERTICES:200000000,

})

/* =========================================================
DEFAULT CAMERA AUTHORITY
========================================================= */

export const ENGINE_CAMERA=Object.freeze({

FOV:50,

NEAR:0.01,

FAR:100000,

FOCAL_LENGTH:50,

APERTURE:1.4,

SHUTTER_SPEED:1/48,

ISO:100,

SENSOR_HEIGHT:24,

FOCUS_DISTANCE:10,

})

/* =========================================================
CLEAR AUTHORITY
========================================================= */

export const ENGINE_CLEAR=Object.freeze({

COLOR:new THREE.Color(0x000000),

ALPHA:1.0,

DEPTH:1,

STENCIL:0,

})
/* =========================================================
TEMPORAL RESOLVE AUTHORITY
========================================================= */

export const ENGINE_TEMPORAL=Object.freeze({

ENABLED:true,

MAX_HISTORY_FRAMES:64,

MIN_HISTORY_FRAMES:4,

BLEND_MIN:0.65,

BLEND_MAX:0.98,

CLAMP_STRENGTH:0.85,

REJECTION_THRESHOLD:0.15,

MOTION_INFLUENCE:0.35,

ROTATION_INFLUENCE:0.25,

DEPTH_REJECTION:true,

COLOR_CLAMP:true,

VARIANCE_CLAMP:true,

RESET_ON_CAMERA_CUT:true,

RESET_ON_RESOLUTION_CHANGE:true,

JITTER_ENABLED:true,

JITTER_SEQUENCE_LENGTH:1024,

SUBPIXEL_OFFSET:true,

})

/* =========================================================
MOTION BLUR AUTHORITY
========================================================= */

export const ENGINE_MOTION_BLUR=Object.freeze({

ENABLED:true,

SHUTTER_ANGLE:180,

SHUTTER_SPEED:1/48,

SAMPLES:8,

MAX_SAMPLES:32,

STRENGTH:1.0,

MAX_VELOCITY:200,

VELOCITY_SCALE:1.0,

CAMERA_INFLUENCE:1.0,

OBJECT_INFLUENCE:1.0,

ROTATION_BLUR:true,

TRANSLATION_BLUR:true,

})

/* =========================================================
DEPTH OF FIELD AUTHORITY
========================================================= */

export const ENGINE_DOF=Object.freeze({

ENABLED:true,

PHYSICAL:true,

MAX_BLUR:0.05,

SAMPLES:16,

MAX_SAMPLES:64,

APERTURE_BLADES:7,

APERTURE_ROTATION:0,

ANAMORPHIC_RATIO:1.0,

CAT_EYE_STRENGTH:0.0,

FOCUS_SPEED:5.0,

AUTO_FOCUS:false,

})

/* =========================================================
VOLUMETRIC LIGHT AUTHORITY
========================================================= */

export const ENGINE_VOLUMETRIC=Object.freeze({

ENABLED:true,

FOG_ENABLED:true,

FOG_DENSITY:0.01,

FOG_HEIGHT_FALLOFF:0.05,

FOG_START:0,

FOG_END:10000,

SCATTERING_ENABLED:true,

SCATTERING_STRENGTH:1.0,

ANISOTROPY:0.2,

SAMPLE_COUNT:64,

MAX_SAMPLE_COUNT:256,

TEMPORAL_REPROJECTION:true,

NOISE_ENABLED:true,

NOISE_SCALE:0.1,

NOISE_STRENGTH:0.2,

LIGHT_SHAFTS:true,

})

/* =========================================================
COLOR GRADING AUTHORITY
========================================================= */

export const ENGINE_COLOR_GRADING=Object.freeze({

ENABLED:true,

EXPOSURE:1.0,

GAMMA:2.2,

CONTRAST:1.0,

SATURATION:1.0,

VIBRANCE:0.0,

GAIN:1.0,

LIFT:0.0,

OFFSET:0.0,

WHITE_BALANCE:6500,

TEMPERATURE:0,

TINT:0,

ACES_ENABLED:true,

FILMIC_CURVE:true,

})

/* =========================================================
LENS SIMULATION AUTHORITY
========================================================= */

export const ENGINE_LENS=Object.freeze({

ENABLED:true,

DISTORTION_ENABLED:true,

DISTORTION_K1:0.0,

DISTORTION_K2:0.0,

DISTORTION_K3:0.0,

CHROMATIC_ABERRATION:true,

CHROMATIC_STRENGTH:0.002,

VIGNETTE_ENABLED:true,

VIGNETTE_INTENSITY:0.25,

VIGNETTE_FALLOFF:0.5,

BREATHING_ENABLED:true,

BREATHING_STRENGTH:0.02,

DIRT_TEXTURE_ENABLED:false,

FLARE_ENABLED:false,

})

/* =========================================================
FILM GRAIN AUTHORITY
========================================================= */

export const ENGINE_FILM_GRAIN=Object.freeze({

ENABLED:true,

PHYSICAL:true,

ISO:100,

INTENSITY:1.0,

SIZE:1.0,

COLORED:true,

TEMPORAL:true,

ANIMATED:true,

LUMINANCE_INFLUENCE:1.0,

SHADOW_INFLUENCE:1.5,

MIDTONE_INFLUENCE:1.0,

HIGHLIGHT_INFLUENCE:0.5,

})
/* =========================================================
REFLECTION AUTHORITY
========================================================= */

export const ENGINE_REFLECTIONS=Object.freeze({

ENABLED:true,

MODE:'HYBRID',

SSR_ENABLED:true,

SSR_MAX_STEPS:64,

SSR_STEP_SIZE:0.2,

SSR_THICKNESS:0.1,

SSR_BINARY_SEARCH_STEPS:8,

SSR_MAX_DISTANCE:1000,

SSR_FADE_START:100,

SSR_FADE_END:1000,

SSR_TEMPORAL:true,

SSR_SPATIAL:true,

REFLECTION_PROBE_ENABLED:true,

PROBE_RESOLUTION:256,

PROBE_UPDATE_RATE:30,

INTENSITY:1.0,

ROUGHNESS_ATTENUATION:true,

})

/* =========================================================
GLOBAL ILLUMINATION AUTHORITY
========================================================= */

export const ENGINE_GI=Object.freeze({

ENABLED:true,

MODE:'HYBRID',

INTENSITY:1.0,

BOUNCES:2,

MAX_BOUNCES:8,

DIFFUSE_ENABLED:true,

SPECULAR_ENABLED:true,

PROBE_ENABLED:true,

PROBE_GRID_RESOLUTION:12,

PROBE_UPDATE_RATE:60,

PROBE_RAYS:128,

PROBE_IRRADIANCE_RESOLUTION:16,

PROBE_DISTANCE:10,

TEMPORAL_ACCUMULATION:true,

SPATIAL_FILTER:true,

DENOISER_ENABLED:true,

})

/* =========================================================
PATH TRACER AUTHORITY
========================================================= */

export const ENGINE_PATH_TRACER=Object.freeze({

ENABLED:true,

MAX_BOUNCES:12,

MIN_BOUNCES:2,

MAX_SAMPLES:4096,

SAMPLES_PER_FRAME:1,

MAX_RAYS_PER_FRAME:1000000,

RUSSIAN_ROULETTE:true,

RR_DEPTH:4,

RR_PROBABILITY:0.8,

MIS_ENABLED:true,

NEXT_EVENT_ESTIMATION:true,

DIRECT_LIGHT_SAMPLING:true,

INDIRECT_LIGHT_SAMPLING:true,

ENVIRONMENT_SAMPLING:true,

CAUSTICS_ENABLED:true,

FIRELY_REDUCTION:true,

CLAMP_DIRECT:10,

CLAMP_INDIRECT:5,

EPSILON:1e-6,

BVH_ENABLED:true,

BVH_MAX_DEPTH:64,

BVH_LEAF_SIZE:4,

})

/* =========================================================
SPECTRAL RENDERING AUTHORITY
========================================================= */

export const ENGINE_SPECTRAL=Object.freeze({

ENABLED:true,

MODE:'HERO_WAVELENGTH',

LAMBDA_MIN:380,

LAMBDA_MAX:780,

BANDS:31,

SAMPLES_PER_PIXEL:1,

DISPERSION_ENABLED:true,

DISPERSION_STRENGTH:0.02,

WAVELENGTH_JITTER:true,

TEMPORAL_ACCUMULATION:true,

})

/* =========================================================
ReSTIR AUTHORITY
========================================================= */

export const ENGINE_RESTIR=Object.freeze({

ENABLED:true,

TEMPORAL_REUSE:true,

SPATIAL_REUSE:true,

MAX_RESERVOIRS:1048576,

CANDIDATES_PER_PIXEL:32,

SPATIAL_RADIUS:30,

TEMPORAL_CONFIDENCE:0.9,

BIAS_CORRECTION:true,

VISIBILITY_REUSE:true,

DIRECT_LIGHTING:true,

INDIRECT_LIGHTING:true,

})

/* =========================================================
SUBSURFACE SCATTERING AUTHORITY
========================================================= */

export const ENGINE_SSS=Object.freeze({

ENABLED:true,

MODE:'RANDOM_WALK',

MAX_STEPS:32,

STEP_SIZE:0.001,

MAX_DISTANCE:0.1,

SCATTERING_COEFFICIENT:1.0,

ABSORPTION_COEFFICIENT:0.1,

ANISOTROPY:0.0,

TEMPORAL_ACCUMULATION:true,

SPATIAL_FILTER:true,

})

/* =========================================================
HDR AUTHORITY
========================================================= */

export const ENGINE_HDR=Object.freeze({

ENABLED:true,

AUTO_EXPOSURE:true,

KEY_VALUE:0.18,

MIN_LUMINANCE:0.001,

MAX_LUMINANCE:100000,

MIN_EXPOSURE:0.0001,

MAX_EXPOSURE:10000,

ADAPTATION_RATE:0.05,

TEMPORAL_SMOOTHING:true,

HISTOGRAM_ENABLED:true,

HISTOGRAM_BINS:256,

BLOOM_ENABLED:false,

})
/* =========================================================
VALIDATION
========================================================= */

function validateNumber(value,min,max,fallback){

if(typeof value!=='number')return fallback

if(value<min)return min

if(value>max)return max

return value

}

function validateBoolean(value,fallback){

if(typeof value!=='boolean')return fallback

return value

}

function validateObject(value,fallback){

if(typeof value!=='object'||value===null)return fallback

return value

}

/* =========================================================
DEEP FREEZE
========================================================= */

function deepFreeze(object){

Object.freeze(object)

for(const key of Object.getOwnPropertyNames(object)){

const value=object[key]

if(
value!==null &&
(typeof value==='object'||typeof value==='function') &&
!Object.isFrozen(value)
){

deepFreeze(value)

}

}

return object

}

/* =========================================================
MASTER CONFIG OBJECT
========================================================= */

const EngineConfigRaw={

META:ENGINE_META,

FLAGS:ENGINE_FLAGS,

FEATURES:ENGINE_FEATURES,

TIMING:ENGINE_TIMING,

RENDERER:ENGINE_RENDERER,

SCALING:ENGINE_SCALING,

MEMORY:ENGINE_MEMORY,

THREADING:ENGINE_THREADING,

LIMITS:ENGINE_LIMITS,

CAMERA:ENGINE_CAMERA,

CLEAR:ENGINE_CLEAR,

TEMPORAL:ENGINE_TEMPORAL,

MOTION_BLUR:ENGINE_MOTION_BLUR,

DOF:ENGINE_DOF,

VOLUMETRIC:ENGINE_VOLUMETRIC,

COLOR_GRADING:ENGINE_COLOR_GRADING,

LENS:ENGINE_LENS,

FILM_GRAIN:ENGINE_FILM_GRAIN,

REFLECTIONS:ENGINE_REFLECTIONS,

GI:ENGINE_GI,

PATH_TRACER:ENGINE_PATH_TRACER,

SPECTRAL:ENGINE_SPECTRAL,

RESTIR:ENGINE_RESTIR,

SSS:ENGINE_SSS,

HDR:ENGINE_HDR,

}

/* =========================================================
RUNTIME ACCESS API
========================================================= */

export function getEngineConfig(){

return EngineConfig

}

export function getEngineFeature(name){

if(!EngineConfig.FEATURES[name])return false

return true

}

export function getEngineLimit(name){

return EngineConfig.LIMITS[name]

}

export function getEngineRendererConfig(){

return EngineConfig.RENDERER

}

export function getEngineTimingConfig(){

return EngineConfig.TIMING

}

/* =========================================================
RUNTIME VALIDATION PASS
========================================================= */

function validateConfig(config){

config.TIMING.TARGET_FPS=
validateNumber(
config.TIMING.TARGET_FPS,
1,
1000,
24
)

config.SCALING.MIN_SCALE=
validateNumber(
config.SCALING.MIN_SCALE,
0.1,
1,
0.25
)

config.SCALING.MAX_SCALE=
validateNumber(
config.SCALING.MAX_SCALE,
0.1,
2,
1
)

config.PATH_TRACER.MAX_BOUNCES=
validateNumber(
config.PATH_TRACER.MAX_BOUNCES,
1,
128,
12
)

config.MEMORY.MAX_TEXTURES=
validateNumber(
config.MEMORY.MAX_TEXTURES,
1,
1000000,
65536
)

return config

}

/* =========================================================
FINAL CONFIG BUILD
========================================================= */

const EngineConfigValidated=validateConfig(
EngineConfigRaw
)

export const EngineConfig=deepFreeze(
EngineConfigValidated
)

/* =========================================================
RUNTIME LOCK
========================================================= */

Object.defineProperty(
EngineConfig,
'__LOCKED__',
{
value:true,
writable:false,
enumerable:false,
configurable:false
}
)

/* =========================================================
EXPORT DEFAULT
========================================================= */

export default EngineConfig
