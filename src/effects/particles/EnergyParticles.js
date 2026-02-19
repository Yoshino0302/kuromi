import * as THREE from 'https://jspm.dev/three'

export class EnergyParticles{

constructor(scene){

this.scene=scene

this.count=200

this.createParticles()

}

createParticles(){

const geometry=new THREE.BufferGeometry()

const positions=new Float32Array(this.count*3)

for(let i=0;i<this.count;i++){

positions[i*3+0]=(Math.random()-0.5)*10
positions[i*3+1]=(Math.random()-0.5)*6
positions[i*3+2]=(Math.random()-0.5)*10

}

geometry.setAttribute(
'position',
new THREE.BufferAttribute(positions,3)
)

const material=new THREE.PointsMaterial({
color:0x66ccff,
size:0.05,
transparent:true,
opacity:0.8
})

this.points=new THREE.Points(
geometry,
material
)

this.scene.add(this.points)

}

update(delta){

this.points.rotation.y+=delta*0.2

}

}
