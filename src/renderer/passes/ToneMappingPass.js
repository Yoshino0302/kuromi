import * as THREE from 'https://jspm.dev/three'

export class ToneMappingPass{

static LINEAR=0
static REINHARD=1
static ACES=2
static CINEON=3

constructor({
mode=ToneMappingPass.ACES,
exposure=1.0
}={}){
this.name='ToneMappingPass'
this.enabled=true
this.renderToScreen=true
this.mode=mode
this.exposure=exposure
this._scene=new THREE.Scene()
this._camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1)
this._quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null)
this._scene.add(this._quad)
this._material=new THREE.ShaderMaterial({
uniforms:{
tDiffuse:{value:null},
exposure:{value:this.exposure},
mode:{value:this.mode}
},
vertexShader:`void main(){gl_Position=vec4(position.xy,0.0,1.0);}`,
fragmentShader:`
uniform sampler2D tDiffuse;
uniform float exposure;
uniform int mode;

vec3 LinearToneMapping(vec3 color){
return exposure*color;
}

vec3 ReinhardToneMapping(vec3 color){
color*=exposure;
return color/(vec3(1.0)+color);
}

vec3 ACESFilm(vec3 x){
float a=2.51;
float b=0.03;
float c=2.43;
float d=0.59;
float e=0.14;
return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0);
}

vec3 ACESToneMapping(vec3 color){
color*=exposure;
return ACESFilm(color);
}

vec3 CineonToneMapping(vec3 color){
color*=exposure;
color=max(vec3(0.0),color-0.004);
return pow((color*(6.2*color+0.5))/(color*(6.2*color+1.7)+0.06),vec3(2.2));
}

void main(){
vec2 uv=gl_FragCoord.xy/vec2(textureSize(tDiffuse,0));
vec4 tex=texture2D(tDiffuse,uv);
vec3 color=tex.rgb;

if(mode==0)color=LinearToneMapping(color);
else if(mode==1)color=ReinhardToneMapping(color);
else if(mode==2)color=ACESToneMapping(color);
else if(mode==3)color=CineonToneMapping(color);

gl_FragColor=vec4(color,tex.a);
}
`,
depthTest:false,
depthWrite:false
})
}

init(width,height,pixelRatio=1){}

setSize(width,height,pixelRatio=1){}

render(renderer,input,output){
this._material.uniforms.tDiffuse.value=input.texture
this._material.uniforms.exposure.value=this.exposure
this._material.uniforms.mode.value=this.mode
this._quad.material=this._material
renderer.setRenderTarget(output)
renderer.render(this._scene,this._camera)
}

setExposure(v){
this.exposure=v
}

setMode(mode){
this.mode=mode
}

dispose(){
this._material.dispose()
this._quad.geometry.dispose()
}

}
