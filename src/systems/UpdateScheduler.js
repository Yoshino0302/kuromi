import { Logger } from '../utils/Logger.js'
export class UpdateScheduler{
constructor(){
this.handlers=new Set()
this.enabled=true
Logger.info('UpdateScheduler created')}
add(handler){
if(!handler)return
if(typeof handler.update!=='function')throw new Error('Handler must implement update(delta)')
this.handlers.add(handler)}
remove(handler){
if(!handler)return
this.handlers.delete(handler)}
update(delta){
if(!this.enabled)return
for(const handler of this.handlers){
handler.update(delta)}}
clear(){
this.handlers.clear()}
setEnabled(state){
this.enabled=state===true}
destroy(){
this.clear()
this.enabled=false
Logger.info('UpdateScheduler destroyed')}}
