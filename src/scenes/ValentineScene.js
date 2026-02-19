import * as THREE from 'https://jspm.dev/three'
import { BaseScene } from './BaseScene.js'
import { Logger } from '../utils/Logger.js'
export class ValentineScene extends BaseScene{
constructor(config={}){
super(config)
this.hearts=[]
this.time=0}
async init(){
await super.init()
this.scene.background=new THREE.Color(0x1a001a)
this.camera.position.set(0,0,8)
const light=new THREE.PointLight(0xff99cc,3,20)
light.position.set(0,2,4)
this.add(light)
const ambient=new THREE.AmbientLight(0xff6699,0.8)
this.add(ambient)
const geometry=new THREE.PlaneGeometry(0.5,0.5)
const material=new THREE.MeshBasicMaterial({color:0xff3366,transparent:true,opacity:0.9,side:THREE.DoubleSide})
for(let i=0;i<40;i++){
const mesh=new THREE.Mesh(geometry,material.clone())
mesh.position.x=(Math.random()-0.5)*10
mesh.position.y=(Math.random()-0.5)*10
mesh.position.z=(Math.random()-0.5)*5
mesh.rotation.z=Math.random()*Math.PI
this.add(mesh)
this.hearts.push(mesh)}
Logger.info('ValentineScene initialized')}
update(delta){
this.time+=delta
for(let i=0;i<this.hearts.length;i++){
const h=this.hearts[i]
h.position.y+=delta*0.5
h.rotation.z+=delta
h.material.opacity=0.5+Math.sin(this.time+i)*0.5
if(h.position.y>6)h.position.y=-6}}
async destroy(){
await super.destroy()
this.hearts.length=0}}
