import * as THREE from 'https://jspm.dev/three'

export class RenderGraph{

constructor(renderer){
this.renderer=renderer
this.nodes=new Map()
this.edges=new Map()
this.executionOrder=[]
this.renderTargets=new Map()
this.sharedTargets=new Map()
this._compiled=false
this._width=1
this._height=1
this._pixelRatio=1
}

addNode(name,pass,options={}){
if(this.nodes.has(name))throw new Error('RenderGraph node exists: '+name)
const node={name,pass,enabled:true,inputs:[],outputs:[],options}
this.nodes.set(name,node)
this.edges.set(name,new Set())
this._compiled=false
return this
}

removeNode(name){
if(!this.nodes.has(name))return
this.nodes.delete(name)
this.edges.delete(name)
for(const set of this.edges.values())set.delete(name)
this.renderTargets.delete(name)
this._compiled=false
}

connect(from,to){
if(!this.nodes.has(from)||!this.nodes.has(to))throw new Error('RenderGraph connect invalid nodes')
this.edges.get(from).add(to)
this.nodes.get(to).inputs.push(from)
this.nodes.get(from).outputs.push(to)
this._compiled=false
return this
}

disconnect(from,to){
if(!this.edges.has(from))return
this.edges.get(from).delete(to)
const toNode=this.nodes.get(to)
const fromNode=this.nodes.get(from)
if(toNode)toNode.inputs=toNode.inputs.filter(n=>n!==from)
if(fromNode)fromNode.outputs=fromNode.outputs.filter(n=>n!==to)
this._compiled=false
}

setNodeEnabled(name,enabled){
const node=this.nodes.get(name)
if(node)node.enabled=enabled
}

compile(){
this.executionOrder.length=0
const visited=new Set()
const temp=new Set()
const visit=(name)=>{
if(temp.has(name))throw new Error('RenderGraph cycle detected at '+name)
if(visited.has(name))return
temp.add(name)
const deps=this.nodes.get(name).inputs
for(let i=0;i<deps.length;i++)visit(deps[i])
temp.delete(name)
visited.add(name)
this.executionOrder.push(name)
}
for(const name of this.nodes.keys())visit(name)
this._compiled=true
}

_createRenderTarget(name){
let rt=this.renderTargets.get(name)
if(rt)return rt
rt=new THREE.WebGLRenderTarget(this._width,this._height,{
minFilter:THREE.LinearFilter,
magFilter:THREE.LinearFilter,
format:THREE.RGBAFormat,
type:THREE.HalfFloatType,
depthBuffer:false,
stencilBuffer:false
})
this.renderTargets.set(name,rt)
return rt
}

getRenderTarget(name){
return this.renderTargets.get(name)||this._createRenderTarget(name)
}

execute(scene,camera){
if(!this._compiled)this.compile()
let inputTarget=null
for(let i=0;i<this.executionOrder.length;i++){
const name=this.executionOrder[i]
const node=this.nodes.get(name)
if(!node.enabled)continue
const pass=node.pass
if(!pass||!pass.enabled)continue
const outputTarget=node.outputs.length===0?null:this.getRenderTarget(name)
if(pass.render){
pass.render(this.renderer,inputTarget,outputTarget,scene,camera)
}else if(typeof pass==='function'){
pass(this.renderer,inputTarget,outputTarget,scene,camera)
}
inputTarget=outputTarget
}
}

setSize(width,height,pixelRatio=1){
this._width=Math.max(1,(width*pixelRatio)|0)
this._height=Math.max(1,(height*pixelRatio)|0)
this._pixelRatio=pixelRatio
for(const rt of this.renderTargets.values()){
rt.setSize(this._width,this._height)
}
for(const node of this.nodes.values()){
if(node.pass&&node.pass.setSize)node.pass.setSize(width,height,pixelRatio)
}
}

clearRenderTargets(){
for(const rt of this.renderTargets.values()){
this.renderer.setRenderTarget(rt)
this.renderer.clear(true,true,true)
}
this.renderer.setRenderTarget(null)
}

dispose(){
for(const rt of this.renderTargets.values())rt.dispose()
this.renderTargets.clear()
for(const node of this.nodes.values()){
if(node.pass&&node.pass.dispose)node.pass.dispose()
}
this.nodes.clear()
this.edges.clear()
this.executionOrder.length=0
this._compiled=false
}

getNode(name){
return this.nodes.get(name)
}

hasNode(name){
return this.nodes.has(name)
}

getExecutionOrder(){
return this.executionOrder.slice()
}

}
