import { Logger } from '../utils/Logger.js'
export class MemoryTracker{
constructor(){
this.objects=new Set()
this.count=0
Logger.info('MemoryTracker created')}
track(object){
if(!object)return object
if(!this.objects.has(object)){
this.objects.add(object)
this.count=this.objects.size}
return object}
untrack(object){
if(!object)return
if(this.objects.has(object)){
this.objects.delete(object)
this.count=this.objects.size}}
trackMany(list){
if(!list)return
for(let i=0;i<list.length;i++)this.track(list[i])}
untrackMany(list){
if(!list)return
for(let i=0;i<list.length;i++)this.untrack(list[i])}
dispose(object){
if(!object)return
if(typeof object.destroy==='function')object.destroy()
this.untrack(object)}
disposeAll(){
for(const object of this.objects){
if(object&&typeof object.destroy==='function')object.destroy()}
this.objects.clear()
this.count=0
Logger.info('Memory disposed')}
getStats(){
return{
tracked:this.count}}
destroy(){
this.disposeAll()
Logger.info('MemoryTracker destroyed')}}
