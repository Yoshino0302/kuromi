const MACHINE_STATE={
IDLE:0,
RUNNING:1,
PAUSED:2,
DISPOSED:3
}

export class StateMachine{

constructor(initialState=null){

this.currentState=initialState
this.previousState=null

this.states=new Map()
this.transitions=new Map()

this.state=MACHINE_STATE.IDLE

this.timeInState=0
this.totalTime=0

this.enabled=true

this.onStateChange=null

}

addState(name,config={}){

this.states.set(name,{
name,
onEnter:config.onEnter||null,
onUpdate:config.onUpdate||null,
onExit:config.onExit||null
})

return this

}

removeState(name){

this.states.delete(name)

}

addTransition(from,to,condition){

let list=this.transitions.get(from)

if(!list){

list=[]
this.transitions.set(from,list)

}

list.push({
to,
condition
})

return this

}

setState(name,force=false){

if(!force&&this.currentState===name)return false

const next=this.states.get(name)

if(!next)return false

const prev=this.states.get(this.currentState)

if(prev&&prev.onExit){

prev.onExit(this,name)

}

this.previousState=this.currentState
this.currentState=name

this.timeInState=0

if(next.onEnter){

next.onEnter(this,this.previousState)

}

if(this.onStateChange){

this.onStateChange(name,this.previousState)

}

return true

}

update(delta){

if(!this.enabled)return

if(this.state===MACHINE_STATE.DISPOSED)return

this.totalTime+=delta
this.timeInState+=delta

if(this.currentState===null)return

const state=this.states.get(this.currentState)

if(state&&state.onUpdate){

state.onUpdate(this,delta)

}

const transitions=this.transitions.get(this.currentState)

if(transitions){

for(let i=0;i<transitions.length;i++){

const t=transitions[i]

if(t.condition(this)){

this.setState(t.to)

break

}

}

}

}

start(){

this.state=MACHINE_STATE.RUNNING

}

pause(){

this.state=MACHINE_STATE.PAUSED

}

resume(){

if(this.state===MACHINE_STATE.PAUSED){

this.state=MACHINE_STATE.RUNNING

}

}

stop(){

this.state=MACHINE_STATE.IDLE

}

is(stateName){

return this.currentState===stateName

}

getTimeInState(){

return this.timeInState

}

getTotalTime(){

return this.totalTime

}

reset(){

this.previousState=null
this.timeInState=0
this.totalTime=0

}

dispose(){

this.state=MACHINE_STATE.DISPOSED

this.states.clear()
this.transitions.clear()

this.currentState=null
this.previousState=null

this.onStateChange=null

}

}
