import * as THREE from 'https://jspm.dev/three'

export class RenderTargets{

constructor(renderer,{
useHDR=true,
useDepth=true,
multisample=false,
samples=4,
initialWidth=1,
initialHeight=1,
pixelRatio=1,
maxPoolSize=64
}={}){
this.renderer=renderer
this.useHDR=useHDR
this.useDepth=useDepth
this.multisample=multisample
this.samples=samples
this.pixelRatio=pixelRatio
this.width=(initialWidth*pixelRatio)|0
this.height=(initialHeight*pixelRatio)|0
this.maxPoolSize=maxPoolSize
this.pool=new Map()
this.active=new Set()
this.stats={
created:0,
reused:0,
released:0
}
this._format=THREE.RGBAFormat
this._type=useHDR?THREE.HalfFloatType:THREE.UnsignedByteType
}

_acquireKey(desc){
return[
desc.width,
desc.height,
desc.depth?1:0,
desc.samples||0,
desc.hdr?1:0
].join(':')
}

_createTarget(desc){

let rt

if(this.multisample&&desc.samples>0&&this.renderer.capabilities.isWebGL2){

rt=new THREE.WebGLMultisampleRenderTarget(
desc.width,
desc.height,
{
format:this._format,
type:desc.hdr?THREE.HalfFloatType:THREE.UnsignedByteType,
depthBuffer:desc.depth,
stencilBuffer:false
}
)

rt.samples=desc.samples

}else{

rt=new THREE.WebGLRenderTarget(
desc.width,
desc.height,
{
format:this._format,
type:desc.hdr?THREE.HalfFloatType:THREE.UnsignedByteType,
depthBuffer:desc.depth,
stencilBuffer:false,
minFilter:THREE.LinearFilter,
magFilter:THREE.LinearFilter
}
)

}

rt.texture.generateMipmaps=false
rt.texture.name='RT_'+this.stats.created

this.stats.created++

return rt
}

get({
width=this.width,
height=this.height,
depth=this.useDepth,
hdr=this.useHDR,
samples=this.multisample?this.samples:0
}={}){

width=(width*this.pixelRatio)|0
height=(height*this.pixelRatio)|0

const desc={width,height,depth,hdr,samples}

const key=this._acquireKey(desc)

let bucket=this.pool.get(key)

if(bucket&&bucket.length>0){

const rt=bucket.pop()
this.active.add(rt)
this.stats.reused++
return rt

}

const rt=this._createTarget(desc)

this.active.add(rt)

return rt
}

release(rt){

if(!rt)return

if(!this.active.has(rt))return

this.active.delete(rt)

const key=this._acquireKey({
width:rt.width,
height:rt.height,
depth:rt.depthBuffer,
hdr:rt.texture.type===THREE.HalfFloatType,
samples:rt.samples||0
})

let bucket=this.pool.get(key)

if(!bucket){

bucket=[]
this.pool.set(key,bucket)

}

if(bucket.length<this.maxPoolSize){

bucket.push(rt)

}else{

rt.dispose()

}

this.stats.released++

}

releaseAll(){

for(const rt of this.active){

this.release(rt)

}

}

resize(width,height,pixelRatio=1){

this.pixelRatio=pixelRatio
this.width=(width*pixelRatio)|0
this.height=(height*pixelRatio)|0

this._disposeAll()
this.pool.clear()

}

_disposeAll(){

for(const bucket of this.pool.values()){

for(const rt of bucket){

rt.dispose()

}

}

for(const rt of this.active){

rt.dispose()

}

this.active.clear()

}

clear(rt,color=true,depth=true,stencil=false){

this.renderer.setRenderTarget(rt)
this.renderer.clear(color,depth,stencil)

}

blit(src,dst,material,fsQuad,camera,scene){

material.uniforms.tDiffuse.value=src.texture

fsQuad.material=material

this.renderer.setRenderTarget(dst)
this.renderer.render(scene,camera)

}

getStats(){

return{
created:this.stats.created,
reused:this.stats.reused,
released:this.stats.released,
poolSize:this.pool.size,
active:this.active.size
}

}

dispose(){

this._disposeAll()
this.pool.clear()

}

}
