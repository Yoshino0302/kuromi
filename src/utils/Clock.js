export class Clock{
constructor(){
this.startTime=0
this.oldTime=0
this.elapsedTime=0
this.running=false}
start(){
const now=performance.now()
this.startTime=now
this.oldTime=now
this.elapsedTime=0
this.running=true}
stop(){
this.running=false}
getDelta(){
if(!this.running)return 0
const now=performance.now()
let delta=(now-this.oldTime)/1000
this.oldTime=now
if(delta>0.1)delta=0.1
this.elapsedTime+=delta
return delta}
getElapsedTime(){
return this.elapsedTime}
reset(){
this.start()}}
