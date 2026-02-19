import * as THREE from 'https://jspm.dev/three'

export class CameraSystem{

constructor(){

this.camera=new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
1000
)

this.camera.position.set(0,0,5)

this.target=new THREE.Vector3(0,0,0)

window.addEventListener(
'resize',
()=>this.onResize()
)

}

onResize(){

this.camera.aspect=
window.innerWidth/window.innerHeight

this.camera.updateProjectionMatrix()

}

update(delta){

this.camera.lookAt(this.target)

}

getCamera(){

return this.camera

}

}
