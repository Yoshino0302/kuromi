import * as THREE from 'https://jspm.dev/three'
import { CinematicCamera } from './CinematicCamera.js'
import { CameraShake } from './CameraShake.js'
import { CameraController } from './CameraController.js'
import { CinematicSequencer } from './sequencer/CinematicSequencer.js'
import { CameraKeyframeTrack } from './sequencer/CameraKeyframeTrack.js'

export class CameraSystem{

constructor(options={}){

this.options=options
this.engine=options.engine||null
this.debug=options.debug===true

this.state='constructed'
this.initialized=false
this.disposed=false

this.clock=new THREE.Clock()

this.cinematicCamera=new CinematicCamera(options)

this.shake=new CameraShake(options)

this.controller=new CameraController(
this.cinematicCamera.position,
options
)

this.sequencer=new CinematicSequencer(
this.cinematicCamera,
options
)

this.activeCamera=this.cinematicCamera

this._resizeHandler=null

this._initDefaultSequence()

this.initialized=true
this.state='initialized'

}

_initDefaultSequence(){

if(this.options.disableDefaultSequence)return

const track=new CameraKeyframeTrack()

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

if(this.options.autoplay!==false){
this.sequencer.play()
}

}

update(delta){

if(this.disposed)return

if(delta===undefined){
delta=this.clock.getDelta()
}

this._updateController(delta)

this._updateSequencer(delta)

this._updateShake(delta)

this._updateCamera(delta)

}

_updateController(delta){

if(this.controller?.update){
this.controller.update(delta)
}

}

_updateSequencer(delta){

if(this.sequencer?.update){
this.sequencer.update(delta)
}

}

_updateShake(delta){

if(!this.shake)return

this.shake.update(delta)

const offset=this.shake.getOffset?.()

if(offset){
this.cinematicCamera.addShake(offset)
}

}

_updateCamera(delta){

if(this.cinematicCamera?.update){
this.cinematicCamera.update(delta)
}

}

resize(width,height){

if(this.disposed)return

const camera=this.getCamera()

if(!camera)return

camera.aspect=width/height

camera.updateProjectionMatrix()

}

getCamera(){

if(this.disposed)return null

return this.activeCamera?.getCamera?.()

}

getCameraObject(){

return this.activeCamera

}

setActiveCamera(camera){

if(this.disposed)return

this.activeCamera=camera

}

getPosition(){

return this.cinematicCamera.position

}

setPosition(vec3){

this.cinematicCamera.position.copy(vec3)

}

lookAt(vec3){

this.cinematicCamera.lookAt(vec3)

}

shakeCamera(intensity=1){

if(this.disposed)return

this.shake?.trigger(intensity)

}

playSequence(track){

if(this.disposed)return

this.sequencer.setTrack(track)

this.sequencer.play()

}

stopSequence(){

if(this.disposed)return

this.sequencer.stop()

}

pauseSequence(){

if(this.disposed)return

this.sequencer.pause()

}

resumeSequence(){

if(this.disposed)return

this.sequencer.play()

}

dispose(){

if(this.disposed)return

this.state='disposing'

if(this.sequencer?.dispose){
this.sequencer.dispose()
}

if(this.controller?.dispose){
this.controller.dispose()
}

if(this.shake?.dispose){
this.shake.dispose()
}

if(this.cinematicCamera?.dispose){
this.cinematicCamera.dispose()
}

this.activeCamera=null
this.sequencer=null
this.controller=null
this.shake=null
this.cinematicCamera=null

this.disposed=true
this.initialized=false
this.state='disposed'

}

}
