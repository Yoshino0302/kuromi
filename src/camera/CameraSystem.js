import { CinematicCamera } from './CinematicCamera.js'
import { CameraShake } from './CameraShake.js'
import { CameraController } from './CameraController.js'

export class CameraSystem{

constructor(){

this.cinematicCamera=
new CinematicCamera()

this.shake=
new CameraShake()

this.controller=
new CameraController(
this.cinematicCamera.position
)

}

update(delta){

this.controller.update(delta)

this.shake.update(delta)

this.cinematicCamera.addShake(
this.shake.getOffset()
)

this.cinematicCamera.update(delta)

}

getCamera(){

return this.cinematicCamera.getCamera()

}

shakeCamera(intensity){

this.shake.trigger(intensity)

}

}
