import * as THREE from 'https://jspm.dev/three'

export class EventEmitter{

constructor(){
this._events=new Map()
this._counts=new Map()
this._onceWrappers=new Map()
this._emptyArray=[]
}

on(event,listener){
if(!event||!listener)return listener
let list=this._events.get(event)
if(!list){
list=[]
this._events.set(event,list)
this._counts.set(event,0)
}
list[this._counts.get(event)]=listener
this._counts.set(event,this._counts.get(event)+1)
return listener
}

once(event,listener){
if(!event||!listener)return listener
const wrapper=(...args)=>{
this.off(event,wrapper)
listener(...args)
}
this._onceWrappers.set(listener,wrapper)
return this.on(event,wrapper)
}

off(event,listener){
const list=this._events.get(event)
if(!list)return
const count=this._counts.get(event)
for(let i=0;i<count;i++){
if(list[i]===listener){
for(let j=i;j<count-1;j++){
list[j]=list[j+1]
}
list[count-1]=null
this._counts.set(event,count-1)
break
}
}
if(this._counts.get(event)===0){
this._events.delete(event)
this._counts.delete(event)
}
}

emit(event,a,b,c,d,e){
const list=this._events.get(event)
if(!list)return false
const count=this._counts.get(event)
for(let i=0;i<count;i++){
try{
list[i](a,b,c,d,e)
}catch(err){
console.error('EventEmitter listener error:',event,err)
}
}
return true
}

removeAll(event){
if(event){
this._events.delete(event)
this._counts.delete(event)
}else{
this._events.clear()
this._counts.clear()
}
}

listenerCount(event){
return this._counts.get(event)||0
}

has(event){
return this._events.has(event)
}

events(){
return this._events.keys()
}

clear(){
this._events.clear()
this._counts.clear()
this._onceWrappers.clear()
}

}
