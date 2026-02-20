import * as THREE from 'https://jspm.dev/three'

export class ObjectPool{

constructor(createFn,resetFn,initialSize=0,maxSize=Infinity){
if(typeof createFn!=='function')throw new Error('ObjectPool requires createFn')
this._create=createFn
this._reset=resetFn||null
this._pool=new Array(initialSize)
this._active=new Set()
this._count=0
this._capacity=initialSize
this._max=maxSize
this._totalCreated=0
this._totalAcquired=0
this._totalReleased=0
for(let i=0;i<initialSize;i++){
const obj=this._create()
this._pool[i]=obj
this._count++
this._totalCreated++
}
}

acquire(){
let obj
if(this._count>0){
this._count--
obj=this._pool[this._count]
this._pool[this._count]=null
}else{
if(this._totalCreated>=this._max)return null
obj=this._create()
this._totalCreated++
}
this._active.add(obj)
this._totalAcquired++
return obj
}

release(obj){
if(obj==null)return
if(!this._active.has(obj))return
this._active.delete(obj)
if(this._reset)this._reset(obj)
if(this._count<this._max){
this._pool[this._count]=obj
this._count++
}
this._totalReleased++
}

releaseAll(){
const active=this._active
for(const obj of active){
if(this._reset)this._reset(obj)
if(this._count<this._max){
this._pool[this._count]=obj
this._count++
}
}
active.clear()
}

prewarm(count){
if(count<=0)return
const target=this._count+count
if(target>this._max)count=this._max-this._count
for(let i=0;i<count;i++){
const obj=this._create()
this._pool[this._count]=obj
this._count++
this._totalCreated++
}
}

clear(){
this._pool.length=0
this._active.clear()
this._count=0
this._capacity=0
}

forEachActive(fn){
if(!fn)return
for(const obj of this._active){
fn(obj)
}
}

get activeCount(){
return this._active.size
}

get pooledCount(){
return this._count
}

get totalCreated(){
return this._totalCreated
}

get totalAcquired(){
return this._totalAcquired
}

get totalReleased(){
return this._totalReleased
}

get maxSize(){
return this._max
}

set maxSize(v){
this._max=v
if(this._count>v)this._count=v
}

}
