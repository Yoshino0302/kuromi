import * as THREE from 'https://jspm.dev/three'

import { CinematicCamera } from './CinematicCamera.js'
import { CameraShake } from './CameraShake.js'
import { CameraController } from './CameraController.js'

import { CinematicSequencer } from './sequencer/CinematicSequencer.js'
import { CameraKeyframeTrack } from './sequencer/CameraKeyframeTrack.js'

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

this.sequencer=
new CinematicSequencer(
this.cinematicCamera
)

this.createDemoSequence()

}

createDemoSequence(){

const track=
new CameraKeyframeTrack()

track.addKeyframe(
0,
new THREE.Vector3(0,2,6),
new THREE.Vector3(0,0,0)
)

track.addKeyframe(
4,
new THREE.Vector3(6,3,6),
new THREE.Vector3(3,0,0)
)

track.addKeyframe(
8,
new THREE.Vector3(0,4,10),
new THREE.Vector3(0,0,0)
)

track.addKeyframe(
12,
new THREE.Vector3(-6,3,6),
new THREE.Vector3(-3,0,0)
)

this.sequencer.setTrack(track)

this.sequencer.play()

}

update(delta){

this.controller.update(delta)

this.sequencer.update(delta)

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
