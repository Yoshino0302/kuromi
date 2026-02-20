import {EventEmitter} from '../utils/EventEmitter.js'
export class AppState extends EventEmitter{
constructor(initialState={}){
super()
this._state=Object.create(null)
this._previous=Object.create(null)
this._changed=new Set()
this._version=0
this._frozen=false
this._schemas=new Map()
this._validators=new Map()
this._computed=new Map()
this._computedCache=new Map()
this._computedDirty=new Set()
this._batchDepth=0
this._batchChanges=new Set()
if(initialState&&typeof initialState==='object'){
this.merge(initialState)
this.clearChanges()
}
}
get version(){
return this._version
}
has(key){
return key in this._state||this._computed.has(key)
}
get(key){
if(this._computed.has(key)){
if(this._computedDirty.has(key)||!this._computedCache.has(key)){
const fn=this._computed.get(key)
const value=fn(this)
this._computedCache.set(key,value)
this._computedDirty.delete(key)
}
return this._computedCache.get(key)
}
return this._state[key]
}
set(key,value){
if(this._frozen)throw new Error('AppState is frozen')
const old=this._state[key]
if(old===value)return false
this._previous[key]=old
this._state[key]=value
this._changed.add(key)
this._computedDirty.forEach(k=>{})
this._version++
if(this._batchDepth>0){
this._batchChanges.add(key)
}else{
this.emit('change',{key,value,previous:old,version:this._version})
this.emit(`change:${key}`,value,old,this._version)
}
return true
}
merge(object){
if(this._frozen)throw new Error('AppState is frozen')
this.beginBatch()
for(const key in object){
this.set(key,object[key])
}
this.endBatch()
}
remove(key){
if(this._frozen)throw new Error('AppState is frozen')
if(!(key in this._state))return false
const old=this._state[key]
delete this._state[key]
this._previous[key]=old
this._changed.add(key)
this._version++
this.emit('remove',{key,previous:old,version:this._version})
this.emit(`remove:${key}`,old,this._version)
return true
}
clear(){
if(this._frozen)throw new Error('AppState is frozen')
this.beginBatch()
for(const key in this._state){
this.remove(key)
}
this.endBatch()
}
keys(){
return Object.keys(this._state)
}
values(){
return Object.values(this._state)
}
entries(){
return Object.entries(this._state)
}
snapshot(){
return Object.freeze({...this._state})
}
previous(key){
return this._previous[key]
}
changed(key){
if(key)return this._changed.has(key)
return this._changed.size>0
}
clearChanges(){
this._changed.clear()
this._previous=Object.create(null)
}
beginBatch(){
this._batchDepth++
}
endBatch(){
if(this._batchDepth===0)return
this._batchDepth--
if(this._batchDepth===0&&this._batchChanges.size>0){
const keys=[...this._batchChanges]
this._batchChanges.clear()
this.emit('batchChange',{keys,version:this._version})
}
}
freeze(){
this._frozen=true
this.emit('freeze')
}
unfreeze(){
this._frozen=false
this.emit('unfreeze')
}
defineSchema(key,validator){
this._schemas.set(key,validator)
}
defineValidator(key,validator){
this._validators.set(key,validator)
}
validate(key,value){
if(this._validators.has(key)){
return this._validators.get(key)(value,this)
}
if(this._schemas.has(key)){
return this._schemas.get(key)(value,this)
}
return true
}
compute(key,fn){
if(typeof fn!=='function')throw new Error('Computed must be function')
this._computed.set(key,fn)
this._computedDirty.add(key)
}
invalidate(key){
if(this._computed.has(key)){
this._computedDirty.add(key)
}
}
toJSON(){
return this.snapshot()
}
destroy(){
this.removeAllListeners()
this._state=Object.create(null)
this._previous=Object.create(null)
this._changed.clear()
this._computed.clear()
this._computedCache.clear()
this._computedDirty.clear()
this._schemas.clear()
this._validators.clear()
}
}
