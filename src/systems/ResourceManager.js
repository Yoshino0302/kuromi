import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class ResourceManager{
constructor(config={}){
this.gpuTracker=config.gpuTracker||null
this.memoryTracker=config.memoryTracker||null
this.textureLoader=new THREE.TextureLoader()
this.cache=new Map()
this.loading=new Map()
Logger.info('ResourceManager created')}
async loadTexture(url){
if(this.cache.has(url))return this.cache.get(url)
if(this.loading.has(url))return this.loading.get(url)
const promise=new Promise((resolve,reject)=>{
this.textureLoader.load(url,(texture)=>{
texture.colorSpace=THREE.SRGBColorSpace
texture.generateMipmaps=true
texture.minFilter=THREE.LinearMipmapLinearFilter
texture.magFilter=THREE.LinearFilter
texture.wrapS=THREE.ClampToEdgeWrapping
texture.wrapT=THREE.ClampToEdgeWrapping
this.cache.set(url,texture)
this.loading.delete(url)
if(this.gpuTracker)this.gpuTracker.track(texture)
if(this.memoryTracker)this.memoryTracker.track(texture)
Logger.info('Texture loaded: '+url)
resolve(texture)},undefined,(err)=>{
this.loading.delete(url)
Logger.error('Texture failed: '+url)
reject(err)})})
this.loading.set(url,promise)
return promise}
get(url){
return this.cache.get(url)||null}
has(url){
return this.cache.has(url)}
unload(url){
if(!this.cache.has(url))return
const resource=this.cache.get(url)
if(resource.dispose)resource.dispose()
if(this.gpuTracker)this.gpuTracker.untrack(resource)
if(this.memoryTracker)this.memoryTracker.untrack(resource)
this.cache.delete(url)
Logger.info('Resource unloaded: '+url)}
unloadAll(){
for(const [url,resource]of this.cache){
if(resource.dispose)resource.dispose()
if(this.gpuTracker)this.gpuTracker.untrack(resource)
if(this.memoryTracker)this.memoryTracker.untrack(resource)
Logger.info('Resource unloaded: '+url)}
this.cache.clear()
this.loading.clear()}
destroy(){
this.unloadAll()
Logger.info('ResourceManager destroyed')}}
