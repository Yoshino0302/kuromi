import * as THREE from 'https://jspm.dev/three'
import { BaseScene } from './BaseScene.js'
import { Logger } from '../utils/Logger.js'
export class DarkScene extends BaseScene{
constructor(config={}){
super(config)
this.mesh=null
this.time=0}
async init(){
await super.init()
this.scene.background=new THREE.Color(0x000000)
this.camera.position.set(0,0,6)
const geometry=new THREE.SphereGeometry(1,64,64)
const material=new THREE.MeshStandardMaterial({color:0x111111,roughness:0.4,metalness:0.8,transparent:true,opacity:0.9})
this.mesh=new THREE.Mesh(geometry,material)
this.add(this.mesh)
const light=new THREE.PointLight(0xffffff,2,10)
light.position.set(2,2,2)
this.add(light)
const ambient=new THREE.AmbientLight(0x404040,0.5)
this.add(ambient)
Logger.info('DarkScene initialized')}
update(delta){
this.time+=delta
if(this.mesh){
this.mesh.rotation.y+=delta*0.5
this.mesh.rotation.x+=delta*0.2}}
async destroy(){
await super.destroy()
this.mesh=null}}
