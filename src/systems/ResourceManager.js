import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class ResourceManager{
constructor(config={}){
this.textureLoader=new THREE.TextureLoader()
this.cache=new Map()
this.loading=new Map()
this.gpuTracker=config.gpuTracker||null
this.destroyed=false
Logger.info('ResourceManager constructed')}
async loadTexture(url){
if(this.destroyed)throw new Error('ResourceManager destroyed')
if(this.cache.has(url))return this.cache.get(url)
if(this.loading.has(url))return this.loading.get(url)
const promise=new Promise((resolve,reject)=>{
this.textureLoader.load(url,(texture)=>{
if(this.destroyed){
texture.dispose()
reject(new Error('ResourceManager destroyed during load'))
return}
texture.wrapS=THREE.RepeatWrapping
texture.wrapT=THREE.RepeatWrapping
texture.colorSpace=THREE.SRGBColorSpace
this.cache.set(url,texture)
this.loading.delete(url)
if(this.gpuTracker)this.gpuTracker.track(texture)
resolve(texture)},undefined,(err)=>{
this.loading.delete(url)
Logger.error('Texture load failed: '+url,err)
reject(err)})})
this.loading.set(url,promise)
return promise}
getTexture(url){
return this.cache.get(url)||null}
hasTexture(url){
return this.cache.has(url)}
unloadTexture(url){
if(!this.cache.has(url))return
const texture=this.cache.get(url)
if(this.gpuTracker)this.gpuTracker.untrack(texture)
texture.dispose()
this.cache.delete(url)}
async destroy(){
if(this.destroyed)return
for(const texture of this.cache.values()){
if(this.gpuTracker)this.gpuTracker.untrack(texture)
texture.dispose()}
this.cache.clear()
this.loading.clear()
this.destroyed=true
Logger.info('ResourceManager destroyed')}}
