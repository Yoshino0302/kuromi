import * as THREE from 'https://jspm.dev/three'

/*
KUROMI ENGINE — Ω∞Ω∞Ω FINAL ULTIMATE CONFIG AUTHORITY
ABSOLUTE MASTER CONFIG — AAA CINEMATIC HYBRID RENDERER
Fully synchronized authority layer for entire engine runtime
Non-destructive. Immutable. Production-grade. AAA-grade.
*/

/* =========================================================
META AUTHORITY
========================================================= */

export const ENGINE_META=Object.freeze({

NAME:'KUROMI',
VERSION:'Ω∞Ω∞Ω',
BUILD:'FINAL_ULTIMATE_CONFIG',
AUTHOR:'KUROMI_ENGINE_CORE',

ARCHITECTURE:'HYBRID_CINEMATIC_RENDERER',

TARGET_CLASS:'AAA',

})

/* =========================================================
GLOBAL FLAGS AUTHORITY
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

ENABLE_GPU_MARKERS:false,

ENABLE_PROFILING:false,

})

/* =========================================================
GPU AUTHORITY (NEW — CRITICAL)
========================================================= */

export const ENGINE_GPU=Object.freeze({

API:'WEBGL2',

USE_COMPUTE_SHADERS:true,

USE_MULTI_DRAW_INDIRECT:true,

USE_INSTANCING:true,

USE_BINDLESS_TEXTURES:false,

USE_GPU_CULLING:true,

USE_GPU_SKINNING:true,

USE_GPU_PARTICLES:true,

USE_GPU_OCCLUSION:true,

USE_GPU_FRUSTUM_CULLING:true,

MAX_UNIFORM_BUFFERS:1024,

MAX_STORAGE_BUFFERS:1024,

MAX_TEXTURE_UNITS:32,

MAX_RENDER_TARGETS:16,

MAX_VERTEX_ATTRIBUTES:32,

MAX_DRAW_INDIRECT_COUNT:1048576,

PARALLEL_SHADER_COMPILE:true,

ASYNC_SHADER_COMPILE:true,

})

/* =========================================================
PIPELINE AUTHORITY (NEW — CRITICAL)
========================================================= */

export const ENGINE_PIPELINE=Object.freeze({

RENDERING_MODE:'HYBRID',

ENABLE_FORWARD:false,

ENABLE_DEFERRED:true,

ENABLE_CLUSTERED_LIGHTING:true,

ENABLE_TILED_LIGHTING:true,

ENABLE_RENDER_GRAPH:true,

ENABLE_FRAME_GRAPH:true,

ENABLE_ASYNC_COMPUTE:true,

ENABLE_PASS_CULLING:true,

ENABLE_PASS_BATCHING:true,

MAX_RENDER_PASSES:1024,

MAX_FRAME_GRAPH_NODES:2048,

MAX_PIPELINE_STAGES:256,

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

MAX_RENDER_TARGETS:2048,

GC_INTERVAL:300,

RESOURCE_LIFETIME:600,

BUFFER_POOL_SIZE:2048,

ENABLE_MEMORY_TRACKING:true,

ENABLE_MEMORY_DEFRAGMENTATION:true,

})

/* =========================================================
MEMORY POOLS AUTHORITY (NEW — AAA REQUIRED)
========================================================= */

export const ENGINE_MEMORY_POOLS=Object.freeze({

GEOMETRY_POOL:2*1024*1024*1024,

TEXTURE_POOL:4*1024*1024*1024,

RENDER_TARGET_POOL:2*1024*1024*1024,

STAGING_POOL:512*1024*1024,

UNIFORM_POOL:256*1024*1024,

STORAGE_POOL:512*1024*1024,

DESCRIPTOR_POOL:128*1024*1024,

FRAME_TEMP_POOL:512*1024*1024,

})

/* =========================================================
SHADER AUTHORITY (NEW — CRITICAL)
========================================================= */

export const ENGINE_SHADERS=Object.freeze({

CACHE_ENABLED:true,

CACHE_SIZE:1024*1024*1024,

HOT_RELOAD:true,

ENABLE_OPTIMIZATION:true,

ENABLE_DEBUG_SYMBOLS:false,

ENABLE_REFLECTION:true,

MAX_VARIANTS:100000,

MAX_PERMUTATIONS:1000000,

ASYNC_COMPILE:true,

PARALLEL_COMPILE:true,

})

/* =========================================================
FEATURE SWITCHES AUTHORITY
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

STREAMING:true,

ASYNC_COMPUTE:true,

RENDER_GRAPH:true,

})

/* =========================================================
THREADING AUTHORITY
========================================================= */

export const ENGINE_THREADING=Object.freeze({

ENABLED:true,

MAX_WORKERS:typeof navigator!=='undefined'
?navigator.hardwareConcurrency||8
:8,

ENABLE_SHARED_ARRAY_BUFFER:false,

ENABLE_OFFSCREEN_CANVAS:true,

ENABLE_WORKER_RENDERING:false,

WORKER_INIT_TIMEOUT:5000,

ENABLE_JOB_SYSTEM:true,

MAX_JOB_QUEUE:65536,

})

/* =========================================================
FRAME PACING AUTHORITY (NEW)
========================================================= */

export const ENGINE_FRAME_PACING=Object.freeze({

ENABLED:true,

TARGET_FPS:24,

TARGET_FRAME_TIME:1/24,

MAX_FRAME_TIME:1/5,

MIN_FRAME_TIME:1/1000,

JITTER_REDUCTION:true,

FRAME_SMOOTHING:true,

SMOOTHING_FACTOR:0.9,

})

/* =========================================================
RENDER GRAPH AUTHORITY (NEW)
========================================================= */

export const ENGINE_RENDER_GRAPH=Object.freeze({

ENABLED:true,

MAX_NODES:4096,

MAX_RESOURCES:8192,

ENABLE_PASS_CULLING:true,

ENABLE_RESOURCE_ALIASING:true,

ENABLE_TRANSIENT_RESOURCES:true,

})

/* =========================================================
ASYNC COMPUTE AUTHORITY (NEW)
========================================================= */

export const ENGINE_ASYNC=Object.freeze({

ENABLED:true,

MAX_ASYNC_JOBS:1024,

ENABLE_ASYNC_RENDER:true,

ENABLE_ASYNC_COMPUTE:true,

ENABLE_ASYNC_STREAMING:true,

ENABLE_ASYNC_PATH_TRACING:true,

ENABLE_ASYNC_GI:true,

})

/* =========================================================
CLEAR AUTHORITY
========================================================= */

export const ENGINE_CLEAR=Object.freeze({

COLOR:new THREE.Color(0x000000),

ALPHA:1,

DEPTH:1,

STENCIL:0,

})
/* =========================================================
HYBRID RENDERER AUTHORITY (NEW — CRITICAL)
========================================================= */

export const ENGINE_HYBRID_RENDERER=Object.freeze({

ENABLED:true,

ENABLE_RASTER:true,

ENABLE_PATH_TRACING:true,

ENABLE_HYBRID_BLEND:true,

HYBRID_BLEND_MODE:'ENERGY_CONSERVING',

PATH_TRACING_WEIGHT:0.5,

RASTER_WEIGHT:0.5,

ENABLE_TEMPORAL_ACCUMULATION:true,

ACCUMULATION_FRAMES:4096,

RESET_ACCUMULATION_ON_CAMERA_MOVE:true,

RESET_ACCUMULATION_ON_SCENE_CHANGE:true,

RESET_ACCUMULATION_ON_RESIZE:true,

ENABLE_ADAPTIVE_SAMPLING:true,

MIN_SAMPLES:1,

MAX_SAMPLES:8192,

TARGET_NOISE_THRESHOLD:0.001,

ENABLE_DENOISER:true,

DENOISER_TYPE:'TEMPORAL_SPATIAL',

})

/* =========================================================
PATH TRACING AUTHORITY (UPGRADED)
========================================================= */

export const ENGINE_PATH_TRACER=Object.freeze({

ENABLED:true,

MAX_BOUNCES:12,

MAX_DIFFUSE_BOUNCES:8,

MAX_SPECULAR_BOUNCES:12,

MAX_TRANSMISSION_BOUNCES:12,

MAX_VOLUME_BOUNCES:4,

MAX_SAMPLES:8192,

MIN_SAMPLES:1,

TARGET_SAMPLES_PER_FRAME:1,

ADAPTIVE_SAMPLING:true,

NOISE_THRESHOLD:0.001,

ENABLE_RUSSIAN_ROULETTE:true,

RR_MIN_BOUNCE:3,

RR_PROBABILITY:0.8,

ENABLE_NEXT_EVENT_ESTIMATION:true,

ENABLE_MIS:true,

ENABLE_CAUSTICS:true,

ENABLE_PARTICIPATING_MEDIA:true,

ENABLE_VOLUME_SCATTERING:true,

ENABLE_SSS:true,

ENABLE_SPECTRAL:true,

ENABLE_RESTIR:true,

ENABLE_TEMPORAL_REUSE:true,

ENABLE_SPATIAL_REUSE:true,

ENABLE_RESERVOIR_RESAMPLING:true,

})

/* =========================================================
SPECTRAL RENDERING AUTHORITY (UPGRADED)
========================================================= */

export const ENGINE_SPECTRAL=Object.freeze({

ENABLED:true,

WAVELENGTH_COUNT:31,

WAVELENGTH_MIN:380,

WAVELENGTH_MAX:780,

ENABLE_DISPERSION:true,

ENABLE_SPECTRAL_MATERIALS:true,

ENABLE_SPECTRAL_LIGHTS:true,

ENABLE_SPECTRAL_VOLUME:true,

ENABLE_SPECTRAL_SSS:true,

ENABLE_SPECTRAL_PATH_TRACING:true,

ENABLE_WAVELENGTH_IMPORTANCE_SAMPLING:true,

ENABLE_HERO_WAVELENGTH:true,

ENABLE_SPECTRAL_MIS:true,

})

/* =========================================================
RESTIR AUTHORITY (UPGRADED)
========================================================= */

export const ENGINE_RESTIR=Object.freeze({

ENABLED:true,

ENABLE_DIRECT:true,

ENABLE_INDIRECT:true,

ENABLE_GI:true,

ENABLE_CAUSTICS:true,

ENABLE_TEMPORAL_REUSE:true,

ENABLE_SPATIAL_REUSE:true,

ENABLE_BIAS_CORRECTION:true,

ENABLE_RESERVOIR_MERGING:true,

MAX_RESERVOIRS:16777216,

RESERVOIR_M_CLAMP:64,

TARGET_CANDIDATES:32,

MAX_SPATIAL_RADIUS:64,

})

/* =========================================================
GLOBAL ILLUMINATION AUTHORITY
========================================================= */

export const ENGINE_GI=Object.freeze({

ENABLED:true,

TYPE:'PATH_TRACED',

ENABLE_DIFFUSE:true,

ENABLE_SPECULAR:true,

ENABLE_MULTI_BOUNCE:true,

ENABLE_INFINITE_BOUNCE_APPROX:false,

ENABLE_TEMPORAL_REUSE:true,

ENABLE_SPATIAL_REUSE:true,

ENABLE_PROBE_CACHE:false,

})

/* =========================================================
HDR AUTHORITY (UPGRADED)
========================================================= */

export const ENGINE_HDR=Object.freeze({

ENABLED:true,

AUTO_EXPOSURE:true,

EXPOSURE:1.0,

MIN_EXPOSURE:0.01,

MAX_EXPOSURE:100.0,

ADAPTATION_SPEED:0.05,

ENABLE_EYE_ADAPTATION:true,

ENABLE_LOCAL_TONEMAP:true,

ENABLE_BLOOM:true,

ENABLE_GLARE:true,

ENABLE_LENS_DIRT:true,

})

/* =========================================================
CAMERA AUTHORITY (FULL PHYSICAL MODEL)
========================================================= */

export const ENGINE_CAMERA=Object.freeze({

FOV:50,

NEAR:0.01,

FAR:100000,

ENABLE_PHYSICAL_CAMERA:true,

APERTURE:1.4,

SHUTTER_SPEED:1/48,

ISO:100,

APERTURE_SHAPE:'CIRCULAR',

APERTURE_BLADES:9,

ENABLE_BREATHING:true,

BREATHING_FACTOR:0.02,

ENABLE_AUTO_FOCUS:true,

FOCUS_SPEED:0.1,

ENABLE_FOCUS_SMOOTHING:true,

ENABLE_CAMERA_SHAKE:false,

})

/* =========================================================
STREAMING AUTHORITY (NEW)
========================================================= */

export const ENGINE_STREAMING=Object.freeze({

ENABLED:true,

ENABLE_TEXTURE_STREAMING:true,

ENABLE_GEOMETRY_STREAMING:true,

ENABLE_SHADER_STREAMING:true,

MAX_CONCURRENT_REQUESTS:64,

STREAM_BUDGET_MB:512,

TEXTURE_STREAMING_BUDGET_MB:256,

GEOMETRY_STREAMING_BUDGET_MB:256,

ENABLE_ASYNC_UPLOAD:true,

ENABLE_PRIORITY_STREAMING:true,

})
/* =========================================================
TEMPORAL AUTHORITY
========================================================= */

export const ENGINE_TEMPORAL=Object.freeze({

ENABLED:true,

MAX_HISTORY_FRAMES:4096,

MIN_HISTORY_FRAMES:1,

ENABLE_REPROJECTION:true,

ENABLE_MOTION_VECTORS:true,

ENABLE_DISOCCLUSION_DETECTION:true,

ENABLE_HISTORY_CLAMPING:true,

CLAMP_STRENGTH:0.85,

BLEND_FACTOR:0.9,

RESET_ON_CAMERA_CUT:true,

RESET_ON_RESOLUTION_CHANGE:true,

RESET_ON_SCENE_CHANGE:true,

})

/* =========================================================
MOTION BLUR AUTHORITY
========================================================= */

export const ENGINE_MOTION_BLUR=Object.freeze({

ENABLED:true,

MAX_SAMPLES:64,

SHUTTER_SPEED:1/48,

ENABLE_OBJECT_BLUR:true,

ENABLE_CAMERA_BLUR:true,

ENABLE_VELOCITY_CLAMP:true,

VELOCITY_CLAMP:64.0,

})

/* =========================================================
DEPTH OF FIELD AUTHORITY
========================================================= */

export const ENGINE_DOF=Object.freeze({

ENABLED:true,

MODEL:'PHYSICAL',

MAX_BLUR_SIZE:64,

BOKEH_SHAPE:'CIRCULAR',

BOKEH_BLADES:9,

ENABLE_APERTURE_SIMULATION:true,

ENABLE_FOCUS_TRANSITION:true,

FOCUS_SPEED:0.1,

})

/* =========================================================
VOLUMETRIC AUTHORITY
========================================================= */

export const ENGINE_VOLUMETRIC=Object.freeze({

ENABLED:true,

ENABLE_FOG:true,

ENABLE_VOLUMETRIC_LIGHTING:true,

ENABLE_VOLUME_SCATTERING:true,

ENABLE_TEMPORAL_REPROJECTION:true,

GRID_SIZE_X:160,

GRID_SIZE_Y:90,

GRID_SIZE_Z:128,

MAX_STEPS:128,

})

/* =========================================================
COLOR GRADING AUTHORITY
========================================================= */

export const ENGINE_COLOR_GRADING=Object.freeze({

ENABLED:true,

ENABLE_LUT:true,

ENABLE_TONE_MAPPING:true,

TONE_MAPPING:'ACES',

EXPOSURE:1.0,

CONTRAST:1.0,

SATURATION:1.0,

VIBRANCE:0.0,

WHITE_BALANCE:6500,

})

/* =========================================================
LENS AUTHORITY
========================================================= */

export const ENGINE_LENS=Object.freeze({

ENABLED:true,

ENABLE_DISTORTION:true,

ENABLE_CHROMATIC_ABERRATION:true,

ENABLE_VIGNETTE:true,

ENABLE_GLARE:true,

DISTORTION_STRENGTH:0.05,

CHROMATIC_ABERRATION:0.002,

VIGNETTE_STRENGTH:0.2,

})

/* =========================================================
FILM GRAIN AUTHORITY
========================================================= */

export const ENGINE_FILM_GRAIN=Object.freeze({

ENABLED:true,

STRENGTH:0.04,

SIZE:1.0,

ANIMATED:true,

TEMPORAL_VARIATION:true,

})

/* =========================================================
REFLECTION AUTHORITY
========================================================= */

export const ENGINE_REFLECTIONS=Object.freeze({

ENABLED:true,

TYPE:'HYBRID',

ENABLE_SCREEN_SPACE:true,

ENABLE_RAY_TRACED:true,

ENABLE_TEMPORAL_REUSE:true,

MAX_STEPS:128,

})

/* =========================================================
PERFORMANCE SCALING AUTHORITY
========================================================= */

export const ENGINE_SCALING=Object.freeze({

ENABLED:true,

TARGET_FPS:24,

MIN_SCALE:0.25,

MAX_SCALE:1.0,

ADAPTATION_SPEED:0.05,

ENABLE_DYNAMIC_RESOLUTION:true,

ENABLE_DYNAMIC_SAMPLING:true,

})

/* =========================================================
TIMING AUTHORITY
========================================================= */

export const ENGINE_TIMING=Object.freeze({

TARGET_FPS:24,

FIXED_TIMESTEP:1/24,

MAX_DELTA_TIME:1/5,

MIN_DELTA_TIME:1/1000,

CLOCK_AUTO_START:false,

ENABLE_FRAME_SMOOTHING:true,

})

/* =========================================================
VALIDATION AUTHORITY
========================================================= */

export const ENGINE_VALIDATION=Object.freeze({

VALIDATE_CONFIG:true,

VALIDATE_GPU_CAPS:true,

VALIDATE_MEMORY_LIMITS:true,

VALIDATE_SHADER_SUPPORT:true,

STRICT_VALIDATION:false,

})

/* =========================================================
FINAL UNIFIED CONFIG EXPORT (ABSOLUTE AUTHORITY)
========================================================= */

export const ENGINE_CONFIG=Object.freeze({

META:ENGINE_META,

FLAGS:ENGINE_FLAGS,

GPU:ENGINE_GPU,

PIPELINE:ENGINE_PIPELINE,

MEMORY:ENGINE_MEMORY,

MEMORY_POOLS:ENGINE_MEMORY_POOLS,

SHADERS:ENGINE_SHADERS,

FEATURES:ENGINE_FEATURES,

THREADING:ENGINE_THREADING,

FRAME_PACING:ENGINE_FRAME_PACING,

RENDER_GRAPH:ENGINE_RENDER_GRAPH,

ASYNC:ENGINE_ASYNC,

HYBRID_RENDERER:ENGINE_HYBRID_RENDERER,

PATH_TRACER:ENGINE_PATH_TRACER,

SPECTRAL:ENGINE_SPECTRAL,

RESTIR:ENGINE_RESTIR,

GI:ENGINE_GI,

HDR:ENGINE_HDR,

CAMERA:ENGINE_CAMERA,

STREAMING:ENGINE_STREAMING,

TEMPORAL:ENGINE_TEMPORAL,

MOTION_BLUR:ENGINE_MOTION_BLUR,

DOF:ENGINE_DOF,

VOLUMETRIC:ENGINE_VOLUMETRIC,

COLOR_GRADING:ENGINE_COLOR_GRADING,

LENS:ENGINE_LENS,

FILM_GRAIN:ENGINE_FILM_GRAIN,

REFLECTIONS:ENGINE_REFLECTIONS,

SCALING:ENGINE_SCALING,

TIMING:ENGINE_TIMING,

CLEAR:ENGINE_CLEAR,

VALIDATION:ENGINE_VALIDATION,

})
