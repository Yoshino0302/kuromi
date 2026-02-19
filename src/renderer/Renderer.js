
import * as THREE from 'https://jspm.dev/three'
export class Renderer{
constructor(canvas,gpu){
this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false})
this.renderer.physicallyCorrectLights=true
this.renderer.outputColorSpace=THREE.SRGBColorSpace
this.renderer.toneMapping=THREE.ACESFilmicToneMapping
this.renderer.toneMappingExposure=1
this.renderer.setPixelRatio(window.devicePixelRatio)
this.renderer.setSize(window.innerWidth,window.innerHeight)
gpu.track(this.renderer)
window.addEventListener("resize",()=>this.resize())
}
resize(){
this.renderer.setSize(window.innerWidth,window.innerHeight)
}
render(scene,camera){
this.renderer.render(scene,camera)
}
dispose(){
this.renderer.dispose()
}
}
