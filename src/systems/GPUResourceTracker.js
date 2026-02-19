import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class GPUResourceTracker{
constructor(){
this.resources=new Set()
this.geometries=new Set()
this.materials=new Set()
this.textures=new Set()
Logger.info('GPUResourceTracker created')}
track(resource){
if(!resource)return resource
this.resources.add(resource)
if(resource instanceof THREE.BufferGeometry)this.geometries.add(resource)
else if(resource instanceof THREE.Material)this.materials.add(resource)
else if(resource instanceof THREE.Texture)this.textures.add(resource)
return resource}
untrack(resource){
if(!resource)return
this.resources.delete(resource)
if(resource instanceof THREE.BufferGeometry)this.geometries.delete(resource)
else if(resource instanceof THREE.Material)this.materials.delete(resource)
else if(resource instanceof THREE.Texture)this.textures.delete(resource)}
dispose(resource){
if(!resource)return
if(resource.dispose)resource.dispose()
this.untrack(resource)}
disposeAll(){
for(const resource of this.resources){
if(resource.dispose)resource.dispose()}
this.resources.clear()
this.geometries.clear()
this.materials.clear()
this.textures.clear()
Logger.info('GPU resources disposed')}
getStats(){
return{
total:this.resources.size,
geometries:this.geometries.size,
materials:this.materials.size,
textures:this.textures.size}}
destroy(){
this.disposeAll()
Logger.info('GPUResourceTracker destroyed')}}
