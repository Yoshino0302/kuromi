import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../../config/ValentineColors.js'

export class GlassPortalEffect{

constructor(scene){

this.scene=scene

this.group=new THREE.Group()

this.createPortal()

scene.add(this.group)

}

createPortal(){

const geometry=new THREE.TorusGeometry(
2,
0.35,
64,
256
)

const material=new THREE.MeshPhysicalMaterial({
color:ValentineColors.primary,
emissive:ValentineColors.glow,
emissiveIntensity:3,
metalness:0,
roughness:0,
transmission:1,
thickness:1.5,
transparent:true,
opacity:0.95
})

this.mesh=new THREE.Mesh(
geometry,
material
)

this.group.add(this.mesh)

}

update(delta){

this.group.rotation.z+=delta*0.5

}

}
