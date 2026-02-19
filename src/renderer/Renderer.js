import * as THREE from 'https://jspm.dev/three'

export class Renderer{

constructor(){

this.renderer=new THREE.WebGLRenderer({
antialias:true,
alpha:false,
powerPreference:'high-performance'
})

this.renderer.setSize(
window.innerWidth,
window.innerHeight
)

this.renderer.setPixelRatio(
Math.min(window.devicePixelRatio,2)
)

this.renderer.outputColorSpace=THREE.SRGBColorSpace

this.renderer.toneMapping=THREE.ACESFilmicToneMapping

this.renderer.toneMappingExposure=1.0

this.renderer.shadowMap.enabled=true

document.body.appendChild(this.renderer.domElement)

window.addEventListener(
'resize',
()=>this.onResize()
)

}

onResize(){

this.renderer.setSize(
window.innerWidth,
window.innerHeight
)

}

render(scene,camera){

this.renderer.render(scene,camera)

}

getRenderer(){

return this.renderer

}

}
