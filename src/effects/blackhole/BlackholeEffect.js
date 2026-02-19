import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../../config/ValentineColors.js'

export class BlackholeEffect{

constructor({scene,camera,colors}){

this.scene=scene
this.camera=camera
this.colors=colors||ValentineColors

this.group=new THREE.Group()

this.mesh=null

this._create()

scene.add(this.group)

}

_create(){

const geometry=new THREE.TorusGeometry(
1.5,
0.4,
64,
200
)

const material=new THREE.MeshStandardMaterial({
color:this.colors.primary,
emissive:this.colors.glow,
emissiveIntensity:4,
metalness:0,
roughness:0,
transparent:true,
opacity:0.9
})

this.mesh=new THREE.Mesh(
geometry,
material
)

this.group.add(this.mesh)

}

setPosition(x,y,z){

this.group.position.set(x,y,z)

}

update(delta,elapsed){

this.group.rotation.x+=delta*0.2
this.group.rotation.y+=delta*0.4

const pulse=1+Math.sin(elapsed*2)*0.08

this.group.scale.set(
pulse,
pulse,
pulse
)

}

dispose(){

this.scene.remove(this.group)

this.mesh.geometry.dispose()
this.mesh.material.dispose()

}

}
