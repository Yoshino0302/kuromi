import * as THREE from 'https://jspm.dev/three'

export class SceneManager{

constructor(){

this.scene=new THREE.Scene()

this.scene.background=new THREE.Color(0x000000)

this.createTestObject()

this.createLights()

}

createTestObject(){

const geometry=new THREE.BoxGeometry(1,1,1)

const material=new THREE.MeshStandardMaterial({
color:0xff00ff,
emissive:0x220022,
roughness:0.3,
metalness:0.8
})

this.mesh=new THREE.Mesh(
geometry,
material
)

this.scene.add(this.mesh)

}

createLights(){

const light=new THREE.DirectionalLight(
0xffffff,
3
)

light.position.set(5,5,5)

this.scene.add(light)

const ambient=new THREE.AmbientLight(
0xffffff,
0.3
)

this.scene.add(ambient)

}

update(delta){

if(this.mesh){

this.mesh.rotation.x+=delta*0.5

this.mesh.rotation.y+=delta*0.7

}

}

getScene(){

return this.scene

}

}
