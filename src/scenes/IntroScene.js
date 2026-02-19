
import * as THREE from 'https://jspm.dev/three'
import {BaseScene} from './BaseScene.js'
export class IntroScene extends BaseScene{
init(){
this.scene=new THREE.Scene()
this.camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000)
this.camera.position.z=5
const g=new THREE.SphereGeometry(1,64,64)
const m=new THREE.MeshStandardMaterial({color:0xff66aa,emissive:0x220011})
this.mesh=new THREE.Mesh(g,m)
this.scene.add(this.mesh)
const light=new THREE.DirectionalLight(0xffffff,2)
light.position.set(5,5,5)
this.scene.add(light)
}
update(dt){
this.mesh.rotation.y+=dt
this.engine.renderer.render(this.scene,this.camera)
}
dispose(){}
}
