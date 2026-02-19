import * as THREE from 'https://jspm.dev/three'
import { BaseScene } from './BaseScene.js'
import { Logger } from '../utils/Logger.js'
export class IntroScene extends BaseScene{
constructor(config={}){
super(config)
this.mesh=null
this.time=0}
async init(){
await super.init()
this.camera.position.set(0,0,5)
const geometry=new THREE.PlaneGeometry(2,2)
const material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0})
this.mesh=new THREE.Mesh(geometry,material)
this.add(this.mesh)
Logger.info('IntroScene initialized')}
update(delta){
this.time+=delta
if(this.mesh){
const fade=Math.min(this.time,1)
this.mesh.material.opacity=fade
this.mesh.rotation.z+=delta*0.2}}
async destroy(){
await super.destroy()
this.mesh=null}}
