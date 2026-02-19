export class CinematicSequencer{

constructor(camera){

this.camera=camera

this.track=null

this.time=0

this.playing=false

this.loop=true

}

setTrack(track){

this.track=track

}

play(){

this.time=0

this.playing=true

}

stop(){

this.playing=false

}

update(delta){

if(!this.playing)return

if(!this.track)return

this.time+=delta

if(this.time>this.track.duration){

if(this.loop){

this.time=0

}else{

this.stop()

return

}

}

const sample=
this.track.sample(this.time)

if(sample){

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

}

}
