import * as THREE from 'https://jspm.dev/three'

export class Renderer{

constructor(){

this.canvas=document.getElementById('engine-canvas')

this.renderer=new THREE.WebGLRenderer({
canvas:this.canvas,
antialias:true,
alpha:false,
powerPreference:'high-performance',
stencil:false,
depth:true
})

this.configureRenderer()

this.resize()

}

configureRenderer(){

this.renderer.outputColorSpace=
THREE.SRGBColorSpace

this.renderer.toneMapping=
THREE.ACESFilmicToneMapping

this.renderer.toneMappingExposure=1.0

this.renderer.physicallyCorrectLights=true

this.renderer.shadowMap.enabled=true

this.renderer.shadowMap.type=
THREE.PCFSoftShadowMap

this.renderer.useLegacyLights=false

this.renderer.sortObjects=true

this.renderer.setClearColor(0x000000,1)

}

resize(){

const width=window.innerWidth
const height=window.innerHeight

this.renderer.setSize(width,height,false)

}

render(scene,camera){

this.renderer.render(scene,camera)

}

getRenderer(){

return this.renderer

}

}
