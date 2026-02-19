import * as THREE from 'https://jspm.dev/three'
import { Logger } from '../utils/Logger.js'
export class HeartInstancedSystem{
constructor(config={}){
this.scene=config.scene
this.gpuTracker=config.gpuTracker
this.memoryTracker=config.memoryTracker
this.count=config.count||2000
this.mesh=null
this.transforms=new Float32Array(this.count*4)
this.time=0
this._init()}
_init(){
const shape=new THREE.Shape()
shape.moveTo(0,0.25)
shape.bezierCurveTo(0,0.25,-0.25,0,-0.5,0.25)
shape.bezierCurveTo(-0.5,0.5,0,0.8,0,1)
shape.bezierCurveTo(0,0.8,0.5,0.5,0.5,0.25)
shape.bezierCurveTo(0.25,0,0,0.25,0,0.25)
const geometry=new THREE.ExtrudeGeometry(shape,{depth:0.1,bevelEnabled:true,bevelThickness:0.02,bevelSize:0.02,bevelSegments:2})
const material=new THREE.MeshStandardMaterial({color:0xff3366,emissive:0xff0033,emissiveIntensity:0.5,roughness:0.3,metalness:0.1,transparent:true,opacity:0.95})
this.mesh=new THREE.InstancedMesh(geometry,material,this.count)
this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
if(this.gpuTracker){
this.gpuTracker.track(geometry)
this.gpuTracker.track(material)}
if(this.memoryTracker)this.memoryTracker.track(this.mesh)
const dummy=new THREE.Object3D()
for(let i=0;i<this.count;i++){
const x=(Math.random()-0.5)*20
const y=(Math.random()-0.5)*20
const z=(Math.random()-0.5)*10
const s=0.2+Math.random()*0.4
this.transforms[i*4+0]=x
this.transforms[i*4+1]=y
this.transforms[i*4+2]=z
this.transforms[i*4+3]=s
dummy.position.set(x,y,z)
dummy.scale.setScalar(s)
dummy.updateMatrix()
this.mesh.setMatrixAt(i,dummy.matrix)}
this.mesh.instanceMatrix.needsUpdate=true
this.scene.add(this.mesh)
Logger.info('HeartInstancedSystem initialized '+this.count)}
update(delta){
this.time+=delta
const dummy=new THREE.Object3D()
for(let i=0;i<this.count;i++){
let x=this.transforms[i*4+0]
let y=this.transforms[i*4+1]
let z=this.transforms[i*4+2]
const s=this.transforms[i*4+3]
y+=delta*(0.5+Math.sin(this.time+i)*0.5)
if(y>12)y=-12
this.transforms[i*4+1]=y
dummy.position.set(x,y,z)
dummy.rotation.z=this.time+i
dummy.scale.setScalar(s)
dummy.updateMatrix()
this.mesh.setMatrixAt(i,dummy.matrix)}
this.mesh.instanceMatrix.needsUpdate=true}
destroy(){
if(!this.mesh)return
this.scene.remove(this.mesh)
if(this.mesh.geometry)this.mesh.geometry.dispose()
if(this.mesh.material)this.mesh.material.dispose()
if(this.gpuTracker){
this.gpuTracker.untrack(this.mesh.geometry)
this.gpuTracker.untrack(this.mesh.material)}
if(this.memoryTracker)this.memoryTracker.untrack(this.mesh)
this.mesh=null
Logger.info('HeartInstancedSystem destroyed')}}
