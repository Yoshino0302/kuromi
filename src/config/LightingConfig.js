export class LightingConfig{
constructor(options={}){
this.enabled=options.enabled??true
this.physicallyCorrect=options.physicallyCorrect??true
this.globalIntensity=options.globalIntensity??1
this.exposure=options.exposure??1
this.gamma=options.gamma??2.2
this.useLegacyLights=options.useLegacyLights??false
this.mainLight={
type:options.mainLight?.type??'directional',
color:options.mainLight?.color??0xffffff,
intensity:options.mainLight?.intensity??3,
position:{
x:options.mainLight?.position?.x??5,
y:options.mainLight?.position?.y??10,
z:options.mainLight?.position?.z??5
},
castShadow:options.mainLight?.castShadow??true,
shadow:{
mapSize:options.mainLight?.shadow?.mapSize??2048,
bias:options.mainLight?.shadow?.bias??-0.0001,
normalBias:options.mainLight?.shadow?.normalBias??0.02,
radius:options.mainLight?.shadow?.radius??4
}
}
this.ambientLight={
enabled:options.ambientLight?.enabled??true,
color:options.ambientLight?.color??0xffffff,
intensity:options.ambientLight?.intensity??0.5
}
this.hemisphereLight={
enabled:options.hemisphereLight?.enabled??false,
skyColor:options.hemisphereLight?.skyColor??0xffffff,
groundColor:options.hemisphereLight?.groundColor??0x444444,
intensity:options.hemisphereLight?.intensity??0.6
}
this.environment={
enabled:options.environment?.enabled??false,
intensity:options.environment?.intensity??1,
rotation:{
x:options.environment?.rotation?.x??0,
y:options.environment?.rotation?.y??0,
z:options.environment?.rotation?.z??0
},
blur:options.environment?.blur??0
}
this.shadows={
enabled:options.shadows?.enabled??true,
type:options.shadows?.type??'PCFSoft',
autoUpdate:options.shadows?.autoUpdate??true,
needsUpdate:false,
maxDistance:options.shadows?.maxDistance??100,
cascade:{
enabled:options.shadows?.cascade?.enabled??false,
count:options.shadows?.cascade?.count??4,
lambda:options.shadows?.cascade?.lambda??0.5,
fade:options.shadows?.cascade?.fade??0.1
}
}
this.fog={
enabled:options.fog?.enabled??false,
type:options.fog?.type??'exp2',
color:options.fog?.color??0x000000,
density:options.fog?.density??0.01,
near:options.fog?.near??1,
far:options.fog?.far??1000
}
this.volumetric={
enabled:options.volumetric?.enabled??false,
intensity:options.volumetric?.intensity??1,
scattering:options.volumetric?.scattering??0.5,
anisotropy:options.volumetric?.anisotropy??0.5,
samples:options.volumetric?.samples??64
}
this.bloom={
enabled:options.bloom?.enabled??false,
strength:options.bloom?.strength??0.5,
radius:options.bloom?.radius??0.4,
threshold:options.bloom?.threshold??0.85
}
this.autoExposure={
enabled:options.autoExposure?.enabled??false,
min:options.autoExposure?.min??0.5,
max:options.autoExposure?.max??2,
speed:options.autoExposure?.speed??1
}
this.validate()
Object.freeze(this)
}
validate(){
if(this.globalIntensity<0)throw new Error('LightingConfig.globalIntensity must be >= 0')
if(this.exposure<=0)throw new Error('LightingConfig.exposure must be > 0')
if(this.gamma<=0)throw new Error('LightingConfig.gamma must be > 0')
if(this.mainLight.intensity<0)throw new Error('LightingConfig.mainLight.intensity must be >= 0')
if(this.ambientLight.intensity<0)throw new Error('LightingConfig.ambientLight.intensity must be >= 0')
if(this.hemisphereLight.intensity<0)throw new Error('LightingConfig.hemisphereLight.intensity must be >= 0')
}
static create(options){
return new LightingConfig(options)
}
static getDefault(){
return new LightingConfig({})
}
merge(overrides={}){
return new LightingConfig({...this,...overrides})
}
toJSON(){
return {...this}
}
}
