import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../../config/ValentineColors.js'

export class EnergyParticles{

constructor(scene){

this.scene=scene

this.count=400

this.createParticles()

}

createParticles(){

const geometry=new THREE.BufferGeometry()

const positions=new Float32Array(this.count*3)

for(let i=0;i<this.count;i++){

positions[i*3+0]=(Math.random()-0.5)*15
positions[i*3+1]=(Math.random()-0.5)*10
positions[i*3+2]=(Math.random()-0.5)*15

}

geometry.setAttribute(
'position',
new THREE.BufferAttribute(positions,3)
)

const material=new THREE.PointsMaterial({

color:new THREE.Color(
ValentineColors.particle
),

size:0.08,

transparent:true,

opacity:0.95

})

this.points=new THREE.Points(
geometry,
material
)

this.scene.add(this.points)

}

update(delta){

this.points.rotation.y+=delta*0.15

}

}
