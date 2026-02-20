const SEQUENCER_STATE={
IDLE:0,
PLAYING:1,
PAUSED:2,
STOPPED:3,
DISPOSED:4
}

const PLAYBACK_MODE={
FORWARD:0,
REVERSE:1,
PINGPONG:2
}

const BLEND_MODE={
OVERRIDE:0,
MIX:1
}

export class CinematicSequencer{

constructor(camera,options={}){

this.camera=camera||null

this.track=null

this.time=0
this.duration=0

this.playing=false
this.loop=false

this.playbackRate=options.playbackRate??1

this.playbackMode=PLAYBACK_MODE.FORWARD
this.blendMode=BLEND_MODE.MIX

this.weight=1

this.state=SEQUENCER_STATE.IDLE

this._disposed=false

this._direction=1

this._lastSample=null

this._onComplete=null
this._onLoop=null

this._sampleCache=null

}

setTrack(track){

if(this._disposed)return

this.track=track||null

this.time=0

this.duration=track?.getDuration?.()??track?.duration??0

this._sampleCache=null

this.state=SEQUENCER_STATE.IDLE

}

setLoop(enabled){

this.loop=enabled===true

}

setPlaybackRate(rate){

if(!Number.isFinite(rate))return

this.playbackRate=Math.max(0,rate)

}

setPlaybackMode(mode){

this.playbackMode=mode

}

setBlendMode(mode){

this.blendMode=mode

}

setWeight(weight){

this.weight=Math.max(0,Math.min(1,weight))

}

onComplete(callback){

this._onComplete=callback

}

onLoop(callback){

this._onLoop=callback

}

play(reset=true){

if(this._disposed)return
if(!this.track)return

if(reset){

this.time=this.playbackMode===PLAYBACK_MODE.REVERSE
?this.duration
:0

}

this._direction=this.playbackMode===PLAYBACK_MODE.REVERSE?-1:1

this.playing=true

this.state=SEQUENCER_STATE.PLAYING

}

pause(){

if(this._disposed)return

this.playing=false

this.state=SEQUENCER_STATE.PAUSED

}

resume(){

if(this._disposed)return
if(!this.track)return

this.playing=true

this.state=SEQUENCER_STATE.PLAYING

}

stop(){

if(this._disposed)return

this.playing=false

this.time=0

this.state=SEQUENCER_STATE.STOPPED

}

seek(time){

if(this._disposed)return
if(!this.track)return

this.time=Math.max(0,Math.min(time,this.duration))

this._sampleCache=null

this._applyCurrentSample()

}

update(delta){

if(this._disposed)return
if(!this.playing)return
if(!this.track)return
if(this.duration<=0)return

delta=Math.max(0,delta)

const dt=delta*this.playbackRate*this._direction

let newTime=this.time+dt

let completed=false
let looped=false

if(this.playbackMode===PLAYBACK_MODE.PINGPONG){

if(newTime>=this.duration){

newTime=this.duration
this._direction=-1
looped=true

}else if(newTime<=0){

newTime=0
this._direction=1
looped=true

}

}else{

if(newTime>=this.duration){

if(this.loop){

newTime=newTime%this.duration
looped=true

}else{

newTime=this.duration
completed=true

}

}

if(newTime<=0){

if(this.loop){

newTime=this.duration+(newTime%this.duration)
looped=true

}else{

newTime=0
completed=true

}

}

}

this.time=newTime

this._applyCurrentSample()

if(looped&&this._onLoop){

this._onLoop()

}

if(completed){

this.playing=false

this.state=SEQUENCER_STATE.STOPPED

if(this._onComplete){

this._onComplete()

}

}

}

_applyCurrentSample(){

const sample=this.track.sample(this.time)

if(!sample)return

this._applySample(sample,this.weight)

this._lastSample=sample

}

_applySample(sample,weight){

const camera=this.camera

if(!camera)return
if(!sample)return

if(this.blendMode===BLEND_MODE.OVERRIDE||weight>=1){

camera.setPosition(
sample.position.x,
sample.position.y,
sample.position.z
)

camera.setTarget(
sample.target.x,
sample.target.y,
sample.target.z
)

return

}

if(weight<=0)return

const pos=camera.getPosition?.()
const target=camera.getTarget?.()

if(pos){

camera.setPosition(
pos.x+(sample.position.x-pos.x)*weight,
pos.y+(sample.position.y-pos.y)*weight,
pos.z+(sample.position.z-pos.z)*weight
)

}

if(target){

camera.setTarget(
target.x+(sample.target.x-target.x)*weight,
target.y+(sample.target.y-target.y)*weight,
target.z+(sample.target.z-target.z)*weight
)

}

}

isPlaying(){

return this.playing

}

getTime(){

return this.time

}

getDuration(){

return this.duration

}

getProgress(){

return this.duration>0
?this.time/this.duration
:0

}

dispose(){

if(this._disposed)return

this.stop()

this.track=null
this.camera=null

this._sampleCache=null
this._lastSample=null

this._onComplete=null
this._onLoop=null

this._disposed=true

this.state=SEQUENCER_STATE.DISPOSED

}

}

CinematicSequencer.STATE=SEQUENCER_STATE
CinematicSequencer.PLAYBACK_MODE=PLAYBACK_MODE
CinematicSequencer.BLEND_MODE=BLEND_MODE
