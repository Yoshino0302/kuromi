import * as THREE from 'https://jspm.dev/three'

export class BloomPass{

constructor({
strength=1.0,
radius=0.5,
threshold=0.8,
resolution=256
}={}){
this.name='BloomPass'
this.enabled=true
this.renderToScreen=false
this.strength=strength
this.radius=radius
this.threshold=threshold
this.resolution=resolution
this._scene=new THREE.Scene()
this._camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1)
this._quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null)
this._scene.add(this._quad)
this._brightMaterial=new THREE.ShaderMaterial({
uniforms:{
tDiffuse:{value:null},
threshold:{value:this.threshold}
},
vertexShader:`void main(){gl_Position=vec4(position.xy,0.0,1.0);}`,
fragmentShader:`uniform sampler2D tDiffuse;uniform float threshold;void main(){vec2 uv=gl_FragCoord.xy/vec2(textureSize(tDiffuse,0));vec4 c=texture2D(tDiffuse,uv);float l=max(max(c.r,c.g),c.b);gl_FragColor=l>threshold?c:vec4(0.0);}`,
depthTest:false,
depthWrite:false
})
this._blurMaterial=new THREE.ShaderMaterial({
uniforms:{
tDiffuse:{value:null},
direction:{value:new THREE.Vector2(1,0)},
radius:{value:this.radius}
},
vertexShader:`void main(){gl_Position=vec4(position.xy,0.0,1.0);}`,
fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 direction;uniform float radius;void main(){vec2 uv=gl_FragCoord.xy/vec2(textureSize(tDiffuse,0));vec4 sum=vec4(0.0);sum+=texture2D(tDiffuse,uv)*0.227027;sum+=texture2D(tDiffuse,uv+direction*1.384615*radius)*0.316216;sum+=texture2D(tDiffuse,uv-direction*1.384615*radius)*0.316216;sum+=texture2D(tDiffuse,uv+direction*3.230769*radius)*0.070270;sum+=texture2D(tDiffuse,uv-direction*3.230769*radius)*0.070270;gl_FragColor=sum;}`,
depthTest:false,
depthWrite:false
})
this._combineMaterial=new THREE.ShaderMaterial({
uniforms:{
tDiffuse:{value:null},
tBloom:{value:null},
strength:{value:this.strength}
},
vertexShader:`void main(){gl_Position=vec4(position.xy,0.0,1.0);}`,
fragmentShader:`uniform sampler2D tDiffuse;uniform sampler2D tBloom;uniform float strength;void main(){vec2 uv=gl_FragCoord.xy/vec2(textureSize(tDiffuse,0));vec4 base=texture2D(tDiffuse,uv);vec4 bloom=texture2D(tBloom,uv)*strength;gl_FragColor=base+bloom;}`,
depthTest:false,
depthWrite:false
})
this._rtBright=null
this._rtBlurA=null
this._rtBlurB=null
this._width=1
this._height=1
}

init(width,height,pixelRatio=1){
this.setSize(width,height,pixelRatio)
}

setSize(width,height,pixelRatio=1){
this._width=(width*pixelRatio)|0
this._height=(height*pixelRatio)|0
const w=this.resolution
const h=this.resolution
if(this._rtBright){
this._rtBright.dispose()
this._rtBlurA.dispose()
this._rtBlurB.dispose()
}
this._rtBright=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat})
this._rtBlurA=this._rtBright.clone()
this._rtBlurB=this._rtBright.clone()
}

render(renderer,input,output){

this._brightMaterial.uniforms.tDiffuse.value=input.texture
this._brightMaterial.uniforms.threshold.value=this.threshold
this._quad.material=this._brightMaterial
renderer.setRenderTarget(this._rtBright)
renderer.render(this._scene,this._camera)

this._blurMaterial.uniforms.radius.value=this.radius
this._blurMaterial.uniforms.tDiffuse.value=this._rtBright.texture
this._blurMaterial.uniforms.direction.value.set(1,0)
this._quad.material=this._blurMaterial
renderer.setRenderTarget(this._rtBlurA)
renderer.render(this._scene,this._camera)

this._blurMaterial.uniforms.tDiffuse.value=this._rtBlurA.texture
this._blurMaterial.uniforms.direction.value.set(0,1)
renderer.setRenderTarget(this._rtBlurB)
renderer.render(this._scene,this._camera)

this._combineMaterial.uniforms.tDiffuse.value=input.texture
this._combineMaterial.uniforms.tBloom.value=this._rtBlurB.texture
this._combineMaterial.uniforms.strength.value=this.strength
this._quad.material=this._combineMaterial

renderer.setRenderTarget(output)
renderer.render(this._scene,this._camera)
}

dispose(){
if(this._rtBright)this._rtBright.dispose()
if(this._rtBlurA)this._rtBlurA.dispose()
if(this._rtBlurB)this._rtBlurB.dispose()
this._brightMaterial.dispose()
this._blurMaterial.dispose()
this._combineMaterial.dispose()
}

}
