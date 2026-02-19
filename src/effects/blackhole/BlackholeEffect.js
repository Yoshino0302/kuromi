import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../../config/ValentineColors.js'

export class BlackholeEffect{

constructor(scene){

this.scene=scene

this.createBlackhole()

}

createBlackhole(){

const geometry=new THREE.SphereGeometry(
1.5,
64,
64
)

const material=new THREE.MeshStandardMaterial({

color:new THREE.Color(
ValentineColors.blackholeEdge
),

emissive:new THREE.Color(
ValentineColors.deep
),

emissiveIntensity:2.5,

metalness:1.0,

roughness:0.2

})

this.mesh=new THREE.Mesh(
geometry,
material
)

this.mesh.position.x=3

this.scene.add(this.mesh)

}

update(delta){

this.mesh.rotation.y+=delta*0.3

}

}
