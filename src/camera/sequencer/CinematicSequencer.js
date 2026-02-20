const SEQUENCER_STATE={
IDLE:0,
PLAYING:1,
PAUSED:2,
STOPPED:3,
DISPOSED:4
}

export class CinematicSequencer{

constructor(camera){

this.camera=camera||null

this.track=null

this.time=0
this.duration=0

this.playing=false
this.loop=false
this.playbackRate=1

this.state=SEQUENCER_STATE.IDLE

this.weight=1

this._disposed=false

this._lastSample=null

this._onComplete=null
this._onLoop=null

}

setTrack(track){

if(this._disposed)return

this.track=track||null

this.time=0

this.duration=track?.duration||0

this._lastSample=null

}

setLoop(enabled){

this.loop=enabled===true

}

setPlaybackRate(rate){

if(!Number.isFinite(rate))return

this.playbackRate=Math.max(0,rate)

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

if(reset)this.time=0

this.playing=true

this.state=SEQUENCER_STATE.PLAYING

}

pause(){

if(this._disposed)return

if(!this.playing)return

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

this._applySample(this.track.sample(this.time),1)

}

update(delta){

if(this._disposed)return

if(!this.playing)return

if(!this.track)return

if(this.duration<=0)return

delta=Math.max(0,delta)

this.time+=delta*this.playbackRate

if(this.time>=this.duration){

if(this.loop){

this.time=this.time%this.duration

if(this._onLoop)this._onLoop()

}else{

this.time=this.duration

this.playing=false

this.state=SEQUENCER_STATE.STOPPED

if(this._onComplete)this._onComplete()

}

}

const sample=this.track.sample(this.time)

if(sample){

this._applySample(sample,this.weight)

this._lastSample=sample

}

}

_applySample(sample,weight){

if(!this.camera)return

if(!sample)return

if(weight<=0)return

if(weight>=1){

this.camera.setPosition(
sample.position.x,
sample.position.y,
sample.position.z
)

this.camera.setTarget(
sample.target.x,
sample.target.y,
sample.target.z
)

return

}

const currentPos=this.camera.getPosition?.()
const currentTarget=this.camera.getTarget?.()

if(currentPos){

this.camera.setPosition(
currentPos.x+(sample.position.x-currentPos.x)*weight,
currentPos.y+(sample.position.y-currentPos.y)*weight,
currentPos.z+(sample.position.z-currentPos.z)*weight
)

}

if(currentTarget){

this.camera.setTarget(
currentTarget.x+(sample.target.x-currentTarget.x)*weight,
currentTarget.y+(sample.target.y-currentTarget.y)*weight,
currentTarget.z+(sample.target.z-currentTarget.z)*weight
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

if(this.duration<=0)return 0

return this.time/this.duration

}

dispose(){

if(this._disposed)return

this.stop()

this.track=null
this.camera=null

this._lastSample=null

this._onComplete=null
this._onLoop=null

this._disposed=true

this.state=SEQUENCER_STATE.DISPOSED

}

}
