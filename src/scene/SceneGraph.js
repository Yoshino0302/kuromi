import * as THREE from 'https://jspm.dev/three'
import {EventEmitter} from '../utils/EventEmitter.js'
export class SceneGraph extends EventEmitter{
constructor(){
super()
this.scene=new THREE.Scene()
this.root=this.scene
this.nodes=new Map()
this.parents=new Map()
this.children=new Map()
this.components=new Map()
this.tags=new Map()
this.layers=new Map()
this.visible=new Map()
this.staticNodes=new Set()
this.dynamicNodes=new Set()
this._tempVec3=new THREE.Vector3()
this._tempQuat=new THREE.Quaternion()
this._tempScale=new THREE.Vector3()
this._tempMatrix=new THREE.Matrix4()
this._version=0
}
createNode(object=null,options={}){
const node=object||new THREE.Object3D()
const id=node.uuid
this.nodes.set(id,node)
this.children.set(id,new Set())
this.components.set(id,new Map())
this.tags.set(id,new Set())
this.layers.set(id,options.layer??0)
this.visible.set(id,true)
if(options.static)this.staticNodes.add(id)
else this.dynamicNodes.add(id)
this.emit('nodeCreated',node)
this._version++
return node
}
add(node,parent=null){
if(!node)return
const id=node.uuid
if(!this.nodes.has(id))this.createNode(node)
if(parent){
parent.add(node)
this.parents.set(id,parent.uuid)
this.children.get(parent.uuid)?.add(id)
}else{
this.scene.add(node)
}
this.emit('nodeAdded',node,parent)
this._version++
}
remove(node){
if(!node)return
const id=node.uuid
const parent=node.parent
if(parent)parent.remove(node)
const parentId=this.parents.get(id)
if(parentId){
this.children.get(parentId)?.delete(id)
this.parents.delete(id)
}
this.nodes.delete(id)
this.children.delete(id)
this.components.delete(id)
this.tags.delete(id)
this.layers.delete(id)
this.visible.delete(id)
this.staticNodes.delete(id)
this.dynamicNodes.delete(id)
this.emit('nodeRemoved',node)
this._version++
}
setParent(node,parent){
if(!node)return
const id=node.uuid
const oldParent=node.parent
if(oldParent)oldParent.remove(node)
if(parent){
parent.add(node)
this.parents.set(id,parent.uuid)
this.children.get(parent.uuid)?.add(id)
}else{
this.scene.add(node)
this.parents.delete(id)
}
this.emit('parentChanged',node,parent,oldParent)
this._version++
}
addComponent(node,type,component){
const id=node.uuid
if(!this.components.has(id))this.components.set(id,new Map())
this.components.get(id).set(type,component)
this.emit('componentAdded',node,type,component)
}
removeComponent(node,type){
const id=node.uuid
const map=this.components.get(id)
if(map&&map.has(type)){
const comp=map.get(type)
map.delete(type)
this.emit('componentRemoved',node,type,comp)
}
}
getComponent(node,type){
return this.components.get(node.uuid)?.get(type)
}
hasComponent(node,type){
return this.components.get(node.uuid)?.has(type)??false
}
addTag(node,tag){
this.tags.get(node.uuid)?.add(tag)
}
removeTag(node,tag){
this.tags.get(node.uuid)?.delete(tag)
}
hasTag(node,tag){
return this.tags.get(node.uuid)?.has(tag)??false
}
findByTag(tag){
const result=[]
for(const [id,tags]of this.tags){
if(tags.has(tag))result.push(this.nodes.get(id))
}
return result
}
setLayer(node,layer){
this.layers.set(node.uuid,layer)
}
getLayer(node){
return this.layers.get(node.uuid)??0
}
setVisible(node,visible){
node.visible=visible
this.visible.set(node.uuid,visible)
}
isVisible(node){
return this.visible.get(node.uuid)??true
}
traverse(callback){
this.scene.traverse(callback)
}
traverseVisible(callback){
this.scene.traverseVisible(callback)
}
traverseAncestors(node,callback){
let parent=node.parent
while(parent){
callback(parent)
parent=parent.parent
}
}
setPosition(node,x,y,z){
node.position.set(x,y,z)
this._version++
}
setRotation(node,x,y,z){
node.rotation.set(x,y,z)
this._version++
}
setScale(node,x,y,z){
node.scale.set(x,y,z)
this._version++
}
setMatrix(node,matrix){
node.matrix.copy(matrix)
node.matrix.decompose(node.position,node.quaternion,node.scale)
this._version++
}
getWorldPosition(node,target=new THREE.Vector3()){
return node.getWorldPosition(target)
}
getWorldQuaternion(node,target=new THREE.Quaternion()){
return node.getWorldQuaternion(target)
}
getWorldScale(node,target=new THREE.Vector3()){
return node.getWorldScale(target)
}
updateMatrixWorld(force=false){
this.scene.updateMatrixWorld(force)
}
clear(){
for(const node of this.nodes.values()){
if(node.parent)node.parent.remove(node)
}
this.nodes.clear()
this.parents.clear()
this.children.clear()
this.components.clear()
this.tags.clear()
this.layers.clear()
this.visible.clear()
this.staticNodes.clear()
this.dynamicNodes.clear()
this.emit('cleared')
this._version++
}
getNodeById(id){
return this.nodes.get(id)||null
}
getAllNodes(){
return Array.from(this.nodes.values())
}
get version(){
return this._version
}
destroy(){
this.clear()
this.removeAllListeners()
}
}
