import * as THREE from 'https://jspm.dev/three'
import { CinematicCamera } from './CinematicCamera.js'
import { CameraShake } from './CameraShake.js'
import { CameraController } from './CameraController.js'
import { CinematicSequencer } from './sequencer/CinematicSequencer.js'
import { CameraKeyframeTrack } from './sequencer/CameraKeyframeTrack.js'

const CAMERA_STATE={
CONSTRUCTED:0,
INITIALIZING:1,
INITIALIZED:2,
ACTIVE:3,
DISPOSING:4,
DISPOSED:5
}

export class CameraSystem{

constructor(options={}){

this.options=options
this.engine=options.engine||null
this.debug=options.debug===true

this.state=CAMERA_STATE.CONSTRUCTED

this.initialized=false
this.disposed=false

this.clock=new THREE.Clock(false)

this.cameras=new Set()

this.activeCamera=null

this.cinematicCamera=null

this.controller=null
this.shake=null
this.sequencer=null

this._initPromise=null

this._initialize()

}

_initialize(){

this.state=CAMERA_STATE.INITIALIZING

this.cinematicCamera=new CinematicCamera(this.options)

this.controller=new CameraController(
this.cinematicCamera.position,
this.options
)

this.shake=new CameraShake(this.options)

this.sequencer=new CinematicSequencer(
this.cinematicCamera,
this.options
)

this._registerCamera(this.cinematicCamera)

this.activeCamera=this.cinematicCamera

this._installDefaultSequence()

this.clock.start()

this.initialized=true

this.state=CAMERA_STATE.INITIALIZED

}

_installDefaultSequence(){

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

_registerCamera(camera){

if(!camera)return

this.cameras.add(camera)

}

_unregisterCamera(camera){

if(!camera)return

this.cameras.delete(camera)

}

update(delta){

if(this.disposed)return

if(!this.initialized)return

if(delta===undefined){

delta=this.clock.getDelta()

}

this._updateController(delta)

this._updateSequencer(delta)

this._updateShake(delta)

this._updateActiveCamera(delta)

}

_updateController(delta){

try{

this.controller?.update?.(delta)

}catch(e){

this._debug('Controller update failed',e)

}

}

_updateSequencer(delta){

try{

this.sequencer?.update?.(delta)

}catch(e){

this._debug('Sequencer update failed',e)

}

}

_updateShake(delta){

try{

this.shake?.update?.(delta)

const offset=this.shake?.getOffset?.()

if(offset){

this.cinematicCamera?.addShake?.(offset)

}

}catch(e){

this._debug('Shake update failed',e)

}

}

_updateActiveCamera(delta){

try{

this.activeCamera?.update?.(delta)

}catch(e){

this._debug('Camera update failed',e)

}

}

resize(width,height){

if(this.disposed)return

const cam=this.getCamera()

if(!cam)return

cam.aspect=width/height

cam.updateProjectionMatrix()

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

if(!camera)return

this._registerCamera(camera)

this.activeCamera=camera

this.state=CAMERA_STATE.ACTIVE

}

addCamera(camera){

this._registerCamera(camera)

}

removeCamera(camera){

if(camera===this.activeCamera){

this._debug('Cannot remove active camera')

return

}

this._unregisterCamera(camera)

}

getPosition(){

return this.cinematicCamera?.position||null

}

setPosition(vec3){

if(!vec3)return

this.cinematicCamera?.position?.copy(vec3)

}

lookAt(vec3){

if(!vec3)return

this.cinematicCamera?.lookAt?.(vec3)

}

shakeCamera(intensity=1){

if(this.disposed)return

this.shake?.trigger?.(intensity)

}

playSequence(track){

if(this.disposed)return

this.sequencer?.setTrack?.(track)

this.sequencer?.play?.()

}

stopSequence(){

this.sequencer?.stop?.()

}

pauseSequence(){

this.sequencer?.pause?.()

}

resumeSequence(){

this.sequencer?.play?.()

}

dispose(){

if(this.disposed)return

this.state=CAMERA_STATE.DISPOSING

for(const cam of this.cameras){

try{

cam?.dispose?.()

}catch(e){

this._debug('Camera dispose failed',e)

}

}

this.cameras.clear()

this.sequencer?.dispose?.()

this.controller?.dispose?.()

this.shake?.dispose?.()

this.activeCamera=null
this.sequencer=null
this.controller=null
this.shake=null
this.cinematicCamera=null

this.disposed=true
this.initialized=false

this.state=CAMERA_STATE.DISPOSED

}

_debug(...args){

if(this.debug){

console.warn(
'[KUROMI CAMERA]',
...args
)

}

}

}
