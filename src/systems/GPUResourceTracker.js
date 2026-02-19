import { Logger } from '../utils/Logger.js'
export class GPUResourceTracker{
constructor(){
this.resources=new Set()
this.destroyed=false
Logger.info('GPUResourceTracker constructed')}
track(resource){
if(this.destroyed)return
if(!resource)return
if(this.resources.has(resource))return
this.resources.add(resource)}
untrack(resource){
if(this.destroyed)return
if(!resource)return
if(!this.resources.has(resource))return
this.resources.delete(resource)}
getTrackedCount(){
return this.resources.size}
release(resource){
if(this.destroyed)return
if(!resource)return
if(this.resources.has(resource)){
if(typeof resource.dispose==='function')resource.dispose()
this.resources.delete(resource)}}
releaseAll(){
if(this.destroyed)return
for(const resource of this.resources){
if(resource&&typeof resource.dispose==='function')resource.dispose()}
this.resources.clear()}
async destroy(){
if(this.destroyed)return
this.releaseAll()
this.destroyed=true
Logger.info('GPUResourceTracker destroyed')}}
