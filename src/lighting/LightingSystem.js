import * as THREE from 'https://jspm.dev/three'
import { ValentineColors } from '../config/ValentineColors.js'

export class LightingSystem{

constructor(scene,camera,colors){

this.scene=scene
this.camera=camera
this.colors=colors||ValentineColors

this.lights=[]

this._create()

}

_create(){

const ambient=new THREE.AmbientLight(
this.colors.primary,
0.35
)

this.scene.add(ambient)

this.lights.push(ambient)

const main=new THREE.PointLight(
this.colors.glow,
25,
100,
2
)

main.position.set(0,0,5)

this.scene.add(main)

this.lights.push(main)

const rim=new THREE.PointLight(
this.colors.secondary,
18,
100,
2
)

rim.position.set(0,2,-6)

this.scene.add(rim)

this.lights.push(rim)

}

update(delta,elapsed){

for(let i=0;i<this.lights.length;i++){

const light=this.lights[i]

if(light.isPointLight){

light.intensity=
15+
Math.sin(elapsed*2+i)*4

}

}

}

dispose(){

for(let light of this.lights){

this.scene.remove(light)

}

this.lights.length=0

}

}
