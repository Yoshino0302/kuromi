import { Logger } from '../utils/Logger.js'
export class EffectManager{
constructor(config={}){
this.scheduler=config.scheduler||null
this.effects=new Set()
this.enabled=true
Logger.info('EffectManager created')}
add(effect){
if(!effect)return
if(typeof effect.update!=='function')throw new Error('Effect must implement update(delta)')
this.effects.add(effect)
if(this.scheduler)this.scheduler.add(effect)
Logger.info('Effect added: '+effect.constructor.name)}
remove(effect){
if(!effect)return
if(this.effects.has(effect)){
this.effects.delete(effect)
if(this.scheduler)this.scheduler.remove(effect)
if(typeof effect.destroy==='function')effect.destroy()
Logger.info('Effect removed: '+effect.constructor.name)}}
update(delta){
if(!this.enabled)return
for(const effect of this.effects){
effect.update(delta)}}
setEnabled(state){
this.enabled=state===true}
clear(){
for(const effect of this.effects){
if(this.scheduler)this.scheduler.remove(effect)
if(typeof effect.destroy==='function')effect.destroy()}
this.effects.clear()}
destroy(){
this.clear()
this.enabled=false
Logger.info('EffectManager destroyed')}}
