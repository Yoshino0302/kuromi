import * as THREE from 'https://jspm.dev/three'

export class PostProcessing{

constructor(engine,renderer){
this.engine=engine
this.renderer=renderer
this.name='PostProcessing'
this.enabled=true
this.initialized=false
this.width=1
this.height=1
this.pixelRatio=1
this._readTarget=null
this._writeTarget=null
this._passes=[]
this._passCount=0
this._fsScene=new THREE.Scene()
this._fsCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1)
this._fsQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null)
this._fsScene.add(this._fsQuad)
this._copyMaterial=new THREE.ShaderMaterial({
uniforms:{tDiffuse:{value:null}},
vertexShader:`void main(){gl_Position=vec4(position.xy,0.0,1.0);}`,
fragmentShader:`uniform sampler2D tDiffuse;void main(){gl_FragColor=texture2D(tDiffuse,gl_FragCoord.xy/vec2(textureSize(tDiffuse,0)));}`,
depthTest:false,
depthWrite:false
})
this._tempPass=null
}

init(width,height,pixelRatio=1){
this.pixelRatio=pixelRatio
this.setSize(width,height)
this.initialized=true
}

setSize(width,height){
this.width=Math.max(1,width|0)
this.height=Math.max(1,height|0)
const w=(this.width*this.pixelRatio)|0
const h=(this.height*this.pixelRatio)|0
if(this._readTarget){
this._readTarget.dispose()
this._writeTarget.dispose()
}
this._readTarget=new THREE.WebGLRenderTarget(w,h,{
minFilter:THREE.LinearFilter,
magFilter:THREE.LinearFilter,
format:THREE.RGBAFormat,
type:THREE.UnsignedByteType,
depthBuffer:true,
stencilBuffer:false
})
this._writeTarget=this._readTarget.clone()
for(let i=0;i<this._passCount;i++){
const pass=this._passes[i]
if(pass.setSize)pass.setSize(w,h)
}
}

addPass(pass){
if(!pass)return
this._passes[this._passCount++]=pass
if(pass.init)pass.init(this.width,this.height,this.pixelRatio)
}

removePass(pass){
for(let i=0;i<this._passCount;i++){
if(this._passes[i]===pass){
for(let j=i;j<this._passCount-1;j++){
this._passes[j]=this._passes[j+1]
}
this._passCount--
this._passes[this._passCount]=null
return true
}
}
return false
}

swap(){
const temp=this._readTarget
this._readTarget=this._writeTarget
this._writeTarget=temp
}

render(scene,camera){
if(!this.enabled||!this.initialized){
this.renderer.setRenderTarget(null)
this.renderer.render(scene,camera)
return
}
this.renderer.setRenderTarget(this._readTarget)
this.renderer.clear()
this.renderer.render(scene,camera)
let input=this._readTarget
let output=this._writeTarget
for(let i=0;i<this._passCount;i++){
const pass=this._passes[i]
if(!pass.enabled)continue
this.renderer.setRenderTarget(pass.renderToScreen?null:output)
pass.render(this.renderer,input,pass.renderToScreen?null:output)
if(!pass.renderToScreen){
this.swap()
input=this._readTarget
output=this._writeTarget
}
}
if(this._passCount===0){
this._fsQuad.material=this._copyMaterial
this._copyMaterial.uniforms.tDiffuse.value=input.texture
this.renderer.setRenderTarget(null)
this.renderer.render(this._fsScene,this._fsCamera)
}
}

clear(){
this.renderer.setRenderTarget(this._readTarget)
this.renderer.clear()
this.renderer.setRenderTarget(this._writeTarget)
this.renderer.clear()
this.renderer.setRenderTarget(null)
}

dispose(){
if(this._readTarget)this._readTarget.dispose()
if(this._writeTarget)this._writeTarget.dispose()
for(let i=0;i<this._passCount;i++){
const pass=this._passes[i]
if(pass.dispose)pass.dispose()
this._passes[i]=null
}
this._passCount=0
this.initialized=false
}

setEnabled(v){
this.enabled=v===true
}

isEnabled(){
return this.enabled
}

getReadTarget(){
return this._readTarget
}

getWriteTarget(){
return this._writeTarget
}

}
