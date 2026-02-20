export class CameraConfig{
constructor(options={}){
this.type=options.type??'perspective'
this.fov=options.fov??60
this.near=options.near??0.1
this.far=options.far??10000
this.aspect=options.aspect??1
this.zoom=options.zoom??1
this.position={
x:options.position?.x??0,
y:options.position?.y??0,
z:options.position?.z??5
}
this.rotation={
x:options.rotation?.x??0,
y:options.rotation?.y??0,
z:options.rotation?.z??0
}
this.lookAt={
x:options.lookAt?.x??0,
y:options.lookAt?.y??0,
z:options.lookAt?.z??0
}
this.up={
x:options.up?.x??0,
y:options.up?.y??1,
z:options.up?.z??0
}
this.enableDamping=options.enableDamping??true
this.dampingFactor=options.dampingFactor??0.1
this.enableSmoothFollow=options.enableSmoothFollow??false
this.followTarget=options.followTarget??null
this.followOffset={
x:options.followOffset?.x??0,
y:options.followOffset?.y??0,
z:options.followOffset?.z??5
}
this.followLerp=options.followLerp??0.1
this.enableShake=options.enableShake??true
this.shakeIntensity=options.shakeIntensity??0
this.shakeDecay=options.shakeDecay??1.5
this.enableFrustumCulling=options.enableFrustumCulling??true
this.enableAutoAspect=options.enableAutoAspect??true
this.enableAutoResize=options.enableAutoResize??true
this.minFov=options.minFov??20
this.maxFov=options.maxFov??120
this.minZoom=options.minZoom??0.1
this.maxZoom=options.maxZoom??10
this.enableControls=options.enableControls??true
this.controlType=options.controlType??'orbit'
this.controlSensitivity=options.controlSensitivity??1
this.controlSmoothness=options.controlSmoothness??0.1
this.enableCollision=options.enableCollision??false
this.collisionRadius=options.collisionRadius??0.5
this.enableConstraints=options.enableConstraints??false
this.constraints={
minX:options.constraints?.minX??-Infinity,
maxX:options.constraints?.maxX??Infinity,
minY:options.constraints?.minY??-Infinity,
maxY:options.constraints?.maxY??Infinity,
minZ:options.constraints?.minZ??-Infinity,
maxZ:options.constraints?.maxZ??Infinity
}
this.enableCinematic=options.enableCinematic??true
this.cinematicSmoothness=options.cinematicSmoothness??0.05
this.enableDOF=options.enableDOF??false
this.dofFocusDistance=options.dofFocusDistance??10
this.dofAperture=options.dofAperture??0.025
this.dofMaxBlur=options.dofMaxBlur??0.01
this.enableAutoFocus=options.enableAutoFocus??false
this.autoFocusSpeed=options.autoFocusSpeed??1
this.enableLODScaling=options.enableLODScaling??true
this.lodBias=options.lodBias??0
this.validate()
Object.freeze(this)
}
validate(){
if(this.near<=0)throw new Error('CameraConfig.near must be > 0')
if(this.far<=this.near)throw new Error('CameraConfig.far must be > near')
if(this.fov<=0||this.fov>=180)throw new Error('CameraConfig.fov must be between 0 and 180')
if(this.zoom<=0)throw new Error('CameraConfig.zoom must be > 0')
if(this.minFov<=0)throw new Error('CameraConfig.minFov must be > 0')
if(this.maxFov<=this.minFov)throw new Error('CameraConfig.maxFov must be > minFov')
}
static create(options){
return new CameraConfig(options)
}
static getDefault(){
return new CameraConfig({})
}
merge(overrides={}){
return new CameraConfig({...this,...overrides})
}
toJSON(){
return {...this}
}
}
