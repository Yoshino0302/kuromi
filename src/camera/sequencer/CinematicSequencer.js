export class CinematicSequencer{

constructor(camera,options={}){

this.camera=camera

this.options=options

this.track=null

this.time=0
this.duration=0

this.playing=false
this.paused=false

this.loop=options.loop??true
this.pingPong=options.pingPong??false

this.direction=1

this.timeScale=options.timeScale??1

this.state='idle'

this.disposed=false

this._lastSample=null

}

setTrack(track){

if(this.disposed)return

this.track=track

if(track){

this.duration=track.duration||0

}else{

this.duration=0

}

this.time=0

this._lastSample=null

this.state='ready'

}

clearTrack(){

this.track=null

this.duration=0

this.time=0

this._lastSample=null

this.state='idle'

}

play(){

if(this.disposed)return

if(!this.track)return

this.playing=true
this.paused=false

this.state='playing'

}

pause(){

if(this.disposed)return

if(!this.playing)return

this.paused=true

this.state='paused'

}

resume(){

if(this.disposed)return

if(!this.track)return

this.playing=true
this.paused=false

this.state='playing'

}

stop(){

if(this.disposed)return

this.playing=false
this.paused=false

this.time=0

this.state='stopped'

}

seek(time){

if(this.disposed)return

if(!this.track)return

this.time=this._clampTime(time)

this._applySample()

}

setLoop(enabled){

this.loop=enabled

}

setTimeScale(scale){

this.timeScale=scale

}

update(delta){

if(this.disposed)return

if(!this.playing)return

if(this.paused)return

if(!this.track)return

if(this.duration<=0)return

this._advanceTime(delta)

this._applySample()

}

_advanceTime(delta){

const scaledDelta=delta*this.timeScale*this.direction

this.time+=scaledDelta

if(this.time>this.duration){

if(this.pingPong){

this.time=this.duration
this.direction=-1

}else if(this.loop){

this.time=this.time%this.duration

}else{

this.time=this.duration
this.stop()
return

}

}

if(this.time<0){

if(this.pingPong){

this.time=0
this.direction=1

}else if(this.loop){

this.time=this.duration

}else{

this.time=0
this.stop()
return

}

}

}

_applySample(){

const sample=this.track.sample(this.time)

if(!sample)return

this._lastSample=sample

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

}

_clampTime(time){

if(time<0)return 0

if(time>this.duration)return this.duration

return time

}

getTime(){

return this.time

}

getDuration(){

return this.duration

}

isPlaying(){

return this.playing&&!this.paused

}

isPaused(){

return this.paused

}

dispose(){

if(this.disposed)return

this.track=null

this.camera=null

this._lastSample=null

this.disposed=true

this.state='disposed'

}

}
