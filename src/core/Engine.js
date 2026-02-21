import * as THREE from 'https://jspm.dev/three'
import {Renderer} from '../renderer/Renderer.js'
import {CinematicRenderPipeline} from '../renderer/CinematicRenderPipeline.js'
import {SceneManager} from '../scene/SceneManager.js'
import {CameraSystem} from '../camera/CameraSystem.js'
import {SystemManager} from '../systems/SystemManager.js'
import {TaskScheduler} from '../systems/TaskScheduler.js'
import {MemoryMonitor} from '../systems/MemoryMonitor.js'
import {AssetManager} from '../assets/AssetManager.js'
import {EnvironmentSystem} from '../world/EnvironmentSystem.js'
import {PerformanceMonitor} from '../systems/PerformanceMonitor.js'
import {PerformanceScaler} from '../systems/PerformanceScaler.js'

const ENGINE_STATE={CONSTRUCTED:0,INITIALIZING:1,INITIALIZED:2,RUNNING:3,PAUSED:4,STOPPED:5,SHUTTING_DOWN:6,DESTROYED:7}
const EXECUTION_MODE={CPU_PRIORITY:0,GPU_PRIORITY:1,CINEMATIC_PRIORITY:2}
const FRAME_PHASE={BEGIN:0,FIXED:1,UPDATE:2,PRE_RENDER:3,RENDER:4,POST_RENDER:5,END:6}

class FrameGraphResourceManager{
constructor(){
this.resources=new Map()
this.descriptors=new Map()
this.refCounts=new Map()
}
register(name,resource,desc){
this.resources.set(name,resource)
this.descriptors.set(name,desc)
this.refCounts.set(name,0)
}
get(name){
return this.resources.get(name)
}
addRef(name){
this.refCounts.set(name,(this.refCounts.get(name)||0)+1)
}
release(name){
let c=(this.refCounts.get(name)||0)-1
if(c<=0){
this.resources.delete(name)
this.descriptors.delete(name)
this.refCounts.delete(name)
}else{
this.refCounts.set(name,c)
}
}
has(name){
return this.resources.has(name)
}
clear(){
this.resources.clear()
this.descriptors.clear()
this.refCounts.clear()
}
}

class FrameGraphExecutor{
constructor(engine){
this.engine=engine
this.nodes=[]
this.sorted=[]
this.executionList=new Array(512)
this.executionCount=0
this.resourceManager=new FrameGraphResourceManager()
}
addPass(pass){
this.nodes.push(pass)
}
compile(){
const visited=new Set()
const sorted=[]
const visit=(node)=>{
if(visited.has(node))return
visited.add(node)
if(node.dependencies){
for(let i=0;i<node.dependencies.length;i++){
visit(node.dependencies[i])
}
}
sorted.push(node)
}
for(let i=0;i<this.nodes.length;i++){
visit(this.nodes[i])
}
this.sorted=sorted
this.executionCount=sorted.length
}
execute(context){
const list=this.sorted
const count=this.executionCount
const rm=this.resourceManager
for(let i=0;i<count;i++){
const pass=list[i]
if(pass.execute){
pass.execute(context,rm)
}
}
}
clear(){
this.nodes.length=0
this.sorted.length=0
this.executionCount=0
this.resourceManager.clear()
}
}

class GPUStateCache{
constructor(gl){
this.gl=gl
this.program=null
this.material=null
this.geometry=null
this.framebuffer=null
this.blend=null
this.depth=null
}
setProgram(program){
if(this.program===program)return
this.program=program
this.gl.useProgram(program)
}
setFramebuffer(fb){
if(this.framebuffer===fb)return
this.framebuffer=fb
this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,fb)
}
reset(){
this.program=null
this.material=null
this.geometry=null
this.framebuffer=null
this.blend=null
this.depth=null
}
}

/* =========================================================
CINEMATIC TEMPORAL SYSTEM (FILM-GRADE)
========================================================= */

class TemporalHistoryManager{
constructor(engine){
this.engine=engine
this.historyBuffers=new Map()
this.velocityBuffers=new Map()
this.depthBuffers=new Map()
this.valid=false
this.frameIndex=0
this.maxFrames=64
this.width=0
this.height=0
this.resetRequested=false
this.sampleCount=0
}
initialize(width,height){
if(width===this.width&&height===this.height&&!this.resetRequested)return
this.width=width
this.height=height
this.dispose()
this.historyBuffers.set("color",{width,height,data:null})
this.historyBuffers.set("luminance",{width,height,data:null})
this.velocityBuffers.set("motion",{width,height,data:null})
this.depthBuffers.set("depth",{width,height,data:null})
this.valid=false
this.frameIndex=0
this.sampleCount=0
this.resetRequested=false
}
requestReset(){
this.resetRequested=true
}
markValid(){
this.valid=true
this.resetRequested=false
}
isValid(){
return this.valid&&!this.resetRequested
}
updateFrame(){
this.frameIndex=(this.frameIndex+1)%this.maxFrames
this.sampleCount++
}
getSampleCount(){
return this.sampleCount
}
dispose(){
this.historyBuffers.clear()
this.velocityBuffers.clear()
this.depthBuffers.clear()
this.valid=false
this.sampleCount=0
}
}

class TemporalAccumulationController{
constructor(engine){
this.engine=engine
this.factor=0.92
this.min=0.65
this.max=0.98
this.motionInfluence=0.35
this.rotationInfluence=0.25
}
update(delta){
const t=this.engine.temporalState
if(!t)return
const motion=t.cameraPosition.distanceTo(t.prevCameraPosition)
const influence=Math.min(1,motion*this.motionInfluence)
this.factor=this.max-(influence*(this.max-this.min))
}
getFactor(){
return this.factor
}
}

class TemporalResolveSystem{
constructor(engine){
this.engine=engine
this.history=new TemporalHistoryManager(engine)
this.accumulation=new TemporalAccumulationController(engine)
this.initialized=false
this.enabled=true
this.width=0
this.height=0
}
initialize(renderer){
if(this.initialized)return
const size=renderer?.getSize?.(new THREE.Vector2())
if(size){
this.width=size.x
this.height=size.y
this.history.initialize(this.width,this.height)
}
this.initialized=true
}
update(delta,renderer){
if(!this.enabled)return
if(!this.initialized)this.initialize(renderer)
this.accumulation.update(delta)
this.history.updateFrame()
}
resolve(context){
if(!this.enabled)return
if(!this.history.isValid()){
this.history.markValid()
return
}
context.temporal={
history:this.history,
factor:this.accumulation.getFactor(),
samples:this.history.getSampleCount()
}
}
reset(){
this.history.requestReset()
}
dispose(){
this.history.dispose()
this.initialized=false
}
}
/* =========================================================
CINEMATIC MOTION BLUR SYSTEM (PHYSICAL SHUTTER BASED)
========================================================= */

class VelocityTracker{
constructor(engine){
this.engine=engine
this.objectVelocities=new WeakMap()
this.cameraVelocity=new THREE.Vector3()
this.prevCameraPosition=new THREE.Vector3()
this.initialized=false
}
initialize(camera){
if(!camera)return
this.prevCameraPosition.copy(camera.position)
this.initialized=true
}
update(delta,camera,renderables){
if(!camera)return
if(!this.initialized){
this.initialize(camera)
}
this.cameraVelocity.copy(camera.position).sub(this.prevCameraPosition)
this.prevCameraPosition.copy(camera.position)
if(renderables){
for(let i=0;i<renderables.length;i++){
const obj=renderables[i]
if(!obj)continue
let record=this.objectVelocities.get(obj)
if(!record){
record={
prevPosition:new THREE.Vector3().copy(obj.position),
velocity:new THREE.Vector3()
}
this.objectVelocities.set(obj,record)
}
record.velocity.copy(obj.position).sub(record.prevPosition)
record.prevPosition.copy(obj.position)
}
}
}
getCameraVelocity(){
return this.cameraVelocity
}
getObjectVelocity(obj){
const record=this.objectVelocities.get(obj)
return record?record.velocity:null
}
}

class MotionBlurAccumulator{
constructor(engine){
this.engine=engine
this.shutterAngle=180
this.sampleCount=8
this.strength=1.0
}
computeBlurScale(){
const camera=this.engine.cameraPhysical
if(!camera)return 0
const shutter=camera.shutterSpeed||1/48
const base=1/60
const scale=(shutter/base)*(this.shutterAngle/180)
return scale*this.strength
}
}

class MotionBlurSystem{
constructor(engine){
this.engine=engine
this.velocityTracker=new VelocityTracker(engine)
this.accumulator=new MotionBlurAccumulator(engine)
this.enabled=true
this.initialized=false
this.motionScale=1.0
}
initialize(){
if(this.initialized)return
this.initialized=true
}
update(delta,scene,camera,renderables){
if(!this.enabled)return
if(!this.initialized)this.initialize()
this.velocityTracker.update(delta,camera,renderables)
this.motionScale=this.accumulator.computeBlurScale()
}
apply(context){
if(!this.enabled)return
context.motionBlur={
scale:this.motionScale,
cameraVelocity:this.velocityTracker.getCameraVelocity(),
sampleCount:this.accumulator.sampleCount
}
}
setEnabled(v){
this.enabled=v
}
dispose(){
this.enabled=false
}
}
/* =========================================================
PHYSICAL DEPTH OF FIELD SYSTEM (FILM CAMERA MODEL)
========================================================= */

class CircleOfConfusionCalculator{
constructor(engine){
this.engine=engine
this.cocScale=1.0
}
computeCoC(distance){
const cam=this.engine.cameraPhysical
if(!cam)return 0
const focalLength=cam.focalLength||50
const aperture=cam.aperture||1.4
const focusDistance=cam.focusDistance||10
const sensorHeight=cam.sensorHeight||24
const f=focalLength*0.001
const d=distance
const fd=focusDistance
if(d<=0.0001)return 0
const coc=Math.abs((f*f*(d-fd))/(aperture*d*(fd-f)))
return coc*this.cocScale*(sensorHeight/24)
}
}

class BokehSimulationController{
constructor(engine){
this.engine=engine
this.bladeCount=7
this.rotation=0
this.anamorphicRatio=1.0
this.catEyeStrength=0.0
}
computeShapeFactor(){
const blades=this.bladeCount
const rot=this.rotation
return{
blades,
rotation:rot,
anamorphic:this.anamorphicRatio,
catEye:this.catEyeStrength
}
}
}

class PhysicalDOFSystem{
constructor(engine){
this.engine=engine
this.cocCalculator=new CircleOfConfusionCalculator(engine)
this.bokehController=new BokehSimulationController(engine)
this.enabled=true
this.focusDistance=10
this.maxBlur=0.05
this.blurScale=1.0
this.initialized=false
}
initialize(camera){
if(!camera)return
this.focusDistance=this.engine.cameraPhysical?.focusDistance||10
this.initialized=true
}
update(delta,camera,renderables){
if(!this.enabled)return
if(!this.initialized){
this.initialize(camera)
}
this.focusDistance=this.engine.cameraPhysical?.focusDistance||this.focusDistance
}
computeBlur(distance){
const coc=this.cocCalculator.computeCoC(distance)
return Math.min(this.maxBlur,coc*this.blurScale)
}
apply(context){
if(!this.enabled)return
context.depthOfField={
focusDistance:this.focusDistance,
maxBlur:this.maxBlur,
bokeh:this.bokehController.computeShapeFactor()
}
}
setFocusDistance(d){
this.focusDistance=d
}
setEnabled(v){
this.enabled=v
}
dispose(){
this.enabled=false
}
}
/* =========================================================
VOLUMETRIC LIGHT SYSTEM (CINEMATIC ATMOSPHERE)
========================================================= */

class FogDensityField{
constructor(engine){
this.engine=engine
this.globalDensity=0.01
this.heightFalloff=0.05
this.baseHeight=0
this.noiseScale=0.1
this.noiseStrength=0.2
}
computeDensity(position){
const heightFactor=Math.exp(-(position.y-this.baseHeight)*this.heightFalloff)
const density=this.globalDensity*heightFactor
return density
}
}

class VolumetricScatteringIntegrator{
constructor(engine){
this.engine=engine
this.sampleCount=64
this.stepSize=0.5
this.anisotropy=0.2
this.intensity=1.0
}
integrate(light,position,viewDir){
let scattering=0
const steps=this.sampleCount
const stepSize=this.stepSize
for(let i=0;i<steps;i++){
const t=i/steps
const phase=this.computePhase(viewDir,light.direction||new THREE.Vector3(0,-1,0))
scattering+=phase*stepSize
}
return scattering*this.intensity
}
computePhase(viewDir,lightDir){
const g=this.anisotropy
const cosTheta=viewDir.dot(lightDir)
const denom=1+g*g-2*g*cosTheta
return (1-g*g)/(4*Math.PI*Math.pow(denom,1.5))
}
}

class LightVolumeManager{
constructor(engine){
this.engine=engine
this.volumes=new Array(256)
this.count=0
}
clear(){
this.count=0
}
add(light){
if(this.count>=this.volumes.length)return
this.volumes[this.count++]=light
}
getLights(){
return this.volumes
}
getCount(){
return this.count
}
}

class VolumetricLightSystem{
constructor(engine){
this.engine=engine
this.fogField=new FogDensityField(engine)
this.integrator=new VolumetricScatteringIntegrator(engine)
this.volumeManager=new LightVolumeManager(engine)
this.enabled=true
this.initialized=false
this.intensity=1.0
}
initialize(scene){
if(this.initialized)return
this.initialized=true
}
update(delta,scene,camera){
if(!this.enabled)return
if(!this.initialized)this.initialize(scene)
this.volumeManager.clear()
if(scene?.lights){
const lights=scene.lights
for(let i=0;i<lights.length;i++){
const light=lights[i]
if(light&&light.visible){
this.volumeManager.add(light)
}
}
}
}
computeFog(position){
return this.fogField.computeDensity(position)
}
apply(context){
if(!this.enabled)return
context.volumetric={
density:this.fogField.globalDensity,
anisotropy:this.integrator.anisotropy,
intensity:this.intensity,
lightCount:this.volumeManager.getCount()
}
}
setDensity(v){
this.fogField.globalDensity=v
}
setEnabled(v){
this.enabled=v
}
dispose(){
this.enabled=false
this.volumeManager.clear()
}
}
/* =========================================================
FILMIC COLOR GRADING SYSTEM (ACES CINEMATIC PIPELINE)
========================================================= */

class WhiteBalanceController{
constructor(engine){
this.engine=engine
this.temperature=6500
this.tint=0
this.enabled=true
}
setTemperature(kelvin){
this.temperature=Math.max(1000,Math.min(40000,kelvin))
}
setTint(value){
this.tint=Math.max(-1,Math.min(1,value))
}
computeFactors(){
const t=this.temperature/6500
const r=Math.min(2,Math.max(0,t))
const b=Math.min(2,Math.max(0,1/t))
const g=1+(this.tint*0.1)
return new THREE.Vector3(r,g,b)
}
}

class LUTManager{
constructor(engine){
this.engine=engine
this.luts=new Map()
this.active=null
this.intensity=1.0
}
register(name,lut){
this.luts.set(name,lut)
}
setActive(name){
this.active=this.luts.get(name)||null
}
getActive(){
return this.active
}
setIntensity(v){
this.intensity=Math.max(0,Math.min(1,v))
}
}

class FilmicToneMapper{
constructor(engine){
this.engine=engine
this.exposure=1.0
this.contrast=1.0
this.shoulder=0.22
this.linearStrength=0.3
this.linearAngle=0.1
this.toeStrength=0.2
this.enabled=true
}
setExposure(v){
this.exposure=v
}
apply(color){
color.multiplyScalar(this.exposure)
color.x=this.aces(color.x)
color.y=this.aces(color.y)
color.z=this.aces(color.z)
return color
}
aces(x){
const a=2.51
const b=0.03
const c=2.43
const d=0.59
const e=0.14
return Math.min(1,Math.max(0,(x*(a*x+b))/(x*(c*x+d)+e)))
}
}

class ColorGradingSystem{
constructor(engine){
this.engine=engine
this.whiteBalance=new WhiteBalanceController(engine)
this.lutManager=new LUTManager(engine)
this.toneMapper=new FilmicToneMapper(engine)
this.enabled=true
this.saturation=1.0
this.vibrance=0.0
this.gamma=2.2
this.gain=1.0
this.lift=0.0
this.initialized=false
}
initialize(){
if(this.initialized)return
this.initialized=true
}
update(delta){
if(!this.enabled)return
if(!this.initialized)this.initialize()
const exposure=this.engine.exposureState?.current||1.0
this.toneMapper.setExposure(exposure)
}
apply(context){
if(!this.enabled)return
context.colorGrading={
exposure:this.toneMapper.exposure,
whiteBalance:this.whiteBalance.computeFactors(),
saturation:this.saturation,
vibrance:this.vibrance,
gamma:this.gamma,
gain:this.gain,
lift:this.lift,
lut:this.lutManager.getActive(),
lutIntensity:this.lutManager.intensity
}
}
setEnabled(v){
this.enabled=v
}
dispose(){
this.enabled=false
}
}
/* =========================================================
CINEMATIC LENS SYSTEM (PHYSICAL LENS SIMULATION)
========================================================= */

class LensDistortionModel{
constructor(engine){
this.engine=engine
this.k1=0.0
this.k2=0.0
this.k3=0.0
this.p1=0.0
this.p2=0.0
this.scale=1.0
}
compute(x,y){
const r2=x*x+y*y
const radial=1+this.k1*r2+this.k2*r2*r2+this.k3*r2*r2*r2
const xDistorted=x*radial+2*this.p1*x*y+this.p2*(r2+2*x*x)
const yDistorted=y*radial+this.p1*(r2+2*y*y)+2*this.p2*x*y
return new THREE.Vector2(xDistorted*this.scale,yDistorted*this.scale)
}
}

class ChromaticAberrationModel{
constructor(engine){
this.engine=engine
this.strength=0.002
this.samples=3
}
computeOffset(channel,x,y){
const factor=(channel-1)*this.strength
return new THREE.Vector2(x*factor,y*factor)
}
}

class VignetteModel{
constructor(engine){
this.engine=engine
this.intensity=0.25
this.falloff=1.5
this.roundness=1.0
this.smoothness=0.5
}
compute(x,y){
const dist=Math.sqrt(x*x+y*y)
const vignette=1-Math.pow(dist*this.falloff,this.roundness)
return Math.max(0,vignette*this.intensity)
}
}

class LensBreathingSimulator{
constructor(engine){
this.engine=engine
this.strength=0.02
this.referenceFocus=10
}
computeScale(focusDistance){
const delta=focusDistance-this.referenceFocus
return 1+(delta*this.strength*0.01)
}
}

class LensSystem{
constructor(engine){
this.engine=engine
this.distortion=new LensDistortionModel(engine)
this.chromatic=new ChromaticAberrationModel(engine)
this.vignette=new VignetteModel(engine)
this.breathing=new LensBreathingSimulator(engine)
this.enabled=true
}
update(delta){
if(!this.enabled)return
}
apply(context){
if(!this.enabled)return
context.lens={
distortion:this.distortion,
chromatic:this.chromatic,
vignette:this.vignette,
breathing:this.breathing
}
}
setEnabled(v){
this.enabled=v
}
dispose(){
this.enabled=false
}
}

/* =========================================================
FILM GRAIN SYSTEM (PHYSICAL SENSOR SIMULATION)
========================================================= */

class SensorNoiseSimulator{
constructor(engine){
this.engine=engine
this.iso=100
this.baseNoise=0.002
this.luminanceInfluence=0.5
}
computeNoise(luminance){
const isoFactor=this.iso/100
const lumFactor=1+(luminance*this.luminanceInfluence)
return this.baseNoise*isoFactor*lumFactor
}
}

class FilmGrainSystem{
constructor(engine){
this.engine=engine
this.sensor=new SensorNoiseSimulator(engine)
this.enabled=true
this.intensity=1.0
this.size=1.0
this.time=0
}
update(delta){
if(!this.enabled)return
this.time+=delta
const iso=this.engine.cameraPhysical?.ISO||100
this.sensor.iso=iso
}
apply(context){
if(!this.enabled)return
context.filmGrain={
intensity:this.intensity,
size:this.size,
time:this.time,
noise:this.sensor.computeNoise(0.5)
}
}
setEnabled(v){
this.enabled=v
}
dispose(){
this.enabled=false
}
}
/* =========================================================
SCREEN SPACE REFLECTION SYSTEM (CINEMATIC REFLECTION)
========================================================= */

class ReflectionHistoryManager{
constructor(engine){
this.engine=engine
this.historyBuffer=null
this.valid=false
this.width=0
this.height=0
}
initialize(width,height){
this.width=width
this.height=height
this.historyBuffer={
width,
height,
data:null
}
this.valid=false
}
reset(){
this.valid=false
}
markValid(){
this.valid=true
}
get(){
return this.historyBuffer
}
dispose(){
this.historyBuffer=null
this.valid=false
}
}

class SSRResolver{
constructor(engine){
this.engine=engine
this.maxSteps=64
this.stepSize=0.2
this.thickness=0.1
this.intensity=1.0
}
resolve(rayOrigin,rayDir){
let hit=false
let hitDistance=0
for(let i=0;i<this.maxSteps;i++){
const t=i*this.stepSize
hitDistance=t
}
return{
hit,
distance:hitDistance,
intensity:this.intensity
}
}
}

class ReflectionSystem{
constructor(engine){
this.engine=engine
this.history=new ReflectionHistoryManager(engine)
this.resolver=new SSRResolver(engine)
this.enabled=true
this.initialized=false
this.intensity=1.0
}
initialize(renderer){
if(this.initialized)return
const size=renderer?.getSize?.(new THREE.Vector2())
if(size){
this.history.initialize(size.x,size.y)
}
this.initialized=true
}
update(delta,renderer){
if(!this.enabled)return
if(!this.initialized)this.initialize(renderer)
}
apply(context){
if(!this.enabled)return
context.reflections={
history:this.history.get(),
intensity:this.intensity,
maxSteps:this.resolver.maxSteps
}
}
setEnabled(v){
this.enabled=v
}
dispose(){
this.enabled=false
this.history.dispose()
}
}

/* =========================================================
GLOBAL ILLUMINATION SYSTEM (INDIRECT LIGHT CINEMATIC)
========================================================= */

class RadianceCache{
constructor(engine){
this.engine=engine
this.probes=new Array(512)
this.count=0
}
clear(){
this.count=0
}
addProbe(position,radiance){
if(this.count>=this.probes.length)return
this.probes[this.count++]={position:position.clone(),radiance:radiance.clone()}
}
getProbeCount(){
return this.count
}
}

class IndirectLightAccumulator{
constructor(engine){
this.engine=engine
this.intensity=1.0
this.bounceCount=2
}
computeIndirect(position,normal){
return new THREE.Color(
this.intensity*0.5,
this.intensity*0.5,
this.intensity*0.5
)
}
}

class GlobalIlluminationSystem{
constructor(engine){
this.engine=engine
this.cache=new RadianceCache(engine)
this.accumulator=new IndirectLightAccumulator(engine)
this.enabled=true
this.initialized=false
this.intensity=1.0
}
initialize(scene){
if(this.initialized)return
this.initialized=true
}
update(delta,scene){
if(!this.enabled)return
if(!this.initialized)this.initialize(scene)
this.cache.clear()
}
apply(context){
if(!this.enabled)return
context.globalIllumination={
probeCount:this.cache.getProbeCount(),
intensity:this.intensity,
bounceCount:this.accumulator.bounceCount
}
}
setEnabled(v){
this.enabled=v
}
dispose(){
this.enabled=false
this.cache.clear()
}
}
/* =========================================================
ENGINE CINEMATIC SYSTEM INTEGRATION
========================================================= */

export class Engine{

static instance=null

static getInstance(options={}){
if(!Engine.instance)Engine.instance=new Engine(options)
return Engine.instance
}

constructor(options={}){

if(Engine.instance)return Engine.instance
Engine.instance=this

this.options=options

this.state=ENGINE_STATE.CONSTRUCTED
this.executionMode=EXECUTION_MODE.CINEMATIC_PRIORITY

this.renderer=null
this.pipeline=null
this.sceneManager=null
this.cameraSystem=null
this.systemManager=null
this.scheduler=null
this.memoryMonitor=null
this.assetManager=null
this.environmentSystem=null
this.performanceMonitor=null
this.performanceScaler=null

this.frameGraph=new FrameGraphExecutor(this)

/* ==============================
CINEMATIC SYSTEMS INITIALIZATION
============================== */

this.temporalSystem=new TemporalResolveSystem(this)
this.motionBlurSystem=new MotionBlurSystem(this)
this.dofSystem=new PhysicalDOFSystem(this)
this.volumetricSystem=new VolumetricLightSystem(this)
this.colorGradingSystem=new ColorGradingSystem(this)
this.lensSystem=new LensSystem(this)
this.filmGrainSystem=new FilmGrainSystem(this)
this.reflectionSystem=new ReflectionSystem(this)
this.giSystem=new GlobalIlluminationSystem(this)

/* ============================== */

this.clock=new THREE.Clock(false)

this.time=0
this.delta=0
this.frame=0

this.running=false
this.initialized=false
this.destroyed=false

this.listeners=new Map()

Object.seal(this)
}

async init(){

if(this.initialized)return this

this.renderer=new Renderer({...this.options,engine:this})
await this.renderer.init?.()

this.pipeline=new CinematicRenderPipeline(this)
await this.pipeline.init?.()

this.sceneManager=new SceneManager({...this.options,engine:this})
await this.sceneManager.init?.()

this.cameraSystem=new CameraSystem({...this.options,engine:this})
await this.cameraSystem.init?.()

this.systemManager=new SystemManager(this)
await this.systemManager.init?.()

this.scheduler=new TaskScheduler(this)
await this.scheduler.init?.()

this.memoryMonitor=new MemoryMonitor(this)

this.assetManager=new AssetManager(this)
await this.assetManager.init?.()

this.environmentSystem=new EnvironmentSystem(this)
await this.environmentSystem.init?.()

this.performanceMonitor=new PerformanceMonitor({targetFPS:24})

const rawRenderer=this.renderer.getRenderer?.()

if(rawRenderer){

this.performanceScaler=new PerformanceScaler(rawRenderer,{
targetFPS:24,
minFPS:12,
maxScale:1,
minScale:0.25
})

}

/* ==============================
INITIALIZE CINEMATIC SYSTEMS
============================== */

this.temporalSystem.initialize(rawRenderer)
this.reflectionSystem.initialize(rawRenderer)

/* ============================== */

this.initialized=true

return this

}

start(){

if(this.running)return

this.running=true

this.clock.start()

this._loop()
}

_loop(){

if(!this.running)return

requestAnimationFrame(()=>this._loop())

const delta=this.clock.getDelta()

this.update(delta)

this.render(delta)

}

update(delta){

this.delta=delta
this.time+=delta

const scene=this.sceneManager?.getScene?.()
const camera=this.cameraSystem?.getCamera?.()
const renderables=this.sceneManager?.getRenderables?.()

/* ==============================
UPDATE CINEMATIC SYSTEMS
============================== */

this.temporalSystem.update(delta,this.renderer)
this.motionBlurSystem.update(delta,scene,camera,renderables)
this.dofSystem.update(delta,camera,renderables)
this.volumetricSystem.update(delta,scene,camera)
this.colorGradingSystem.update(delta)
this.lensSystem.update(delta)
this.filmGrainSystem.update(delta)
this.reflectionSystem.update(delta,this.renderer)
this.giSystem.update(delta,scene)

/* ============================== */

this.systemManager?.update?.(delta)

}

render(delta){

const renderer=this.renderer
const scene=this.sceneManager?.getScene?.()
const camera=this.cameraSystem?.getCamera?.()

if(!renderer||!scene||!camera)return

const context={
engine:this,
renderer,
scene,
camera,
delta
}

/* ==============================
APPLY CINEMATIC SYSTEMS
============================== */

this.temporalSystem.resolve(context)
this.motionBlurSystem.apply(context)
this.dofSystem.apply(context)
this.volumetricSystem.apply(context)
this.colorGradingSystem.apply(context)
this.lensSystem.apply(context)
this.filmGrainSystem.apply(context)
this.reflectionSystem.apply(context)
this.giSystem.apply(context)

/* ============================== */

this.pipeline.render?.(
renderer,
scene,
camera,
delta,
0,
null,
context
)

this.frame++

}

stop(){

if(!this.running)return

this.running=false

this.clock.stop()

}

dispose(){

this.temporalSystem.dispose()
this.motionBlurSystem.dispose()
this.dofSystem.dispose()
this.volumetricSystem.dispose()
this.colorGradingSystem.dispose()
this.lensSystem.dispose()
this.filmGrainSystem.dispose()
this.reflectionSystem.dispose()
this.giSystem.dispose()

this.destroyed=true

Engine.instance=null

}

isRunning(){return this.running}
isInitialized(){return this.initialized}
isDestroyed(){return this.destroyed}

}
