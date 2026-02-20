import * as THREE from 'https://jspm.dev/three'

const _colorCache=Object.create(null)

function _create(hex){
const c=new THREE.Color(hex)
Object.freeze(c)
return c
}

function _getCached(hex){
let c=_colorCache[hex]
if(c)return c
c=_create(hex)
_colorCache[hex]=c
return c
}

export const ValentineColors=Object.freeze({

primary:Object.freeze({
rose:_getCached(0xff2e63),
pink:_getCached(0xff4f8b),
blush:_getCached(0xff6fa3),
heart:_getCached(0xff1744)
}),

secondary:Object.freeze({
magenta:_getCached(0xd1005b),
fuchsia:_getCached(0xff0080),
violet:_getCached(0xc71585),
lavender:_getCached(0xe6a8d7)
}),

accent:Object.freeze({
gold:_getCached(0xffd166),
peach:_getCached(0xff8fab),
coral:_getCached(0xff6b6b),
ruby:_getCached(0x9b111e)
}),

portal:Object.freeze({
core:_getCached(0xff2e63),
glow:_getCached(0xff6fa3),
edge:_getCached(0xffffff),
distortion:_getCached(0xff0080)
}),

particles:Object.freeze({
heart:_getCached(0xff4f8b),
spark:_getCached(0xffffff),
trail:_getCached(0xff8fab),
energy:_getCached(0xff1744)
}),

lighting:Object.freeze({
ambient:_getCached(0x2a0f18),
fill:_getCached(0x5a1f2e),
rim:_getCached(0xff6fa3),
highlight:_getCached(0xffffff)
}),

background:Object.freeze({
void:_getCached(0x0b0014),
gradientA:_getCached(0x1a0028),
gradientB:_getCached(0x2a003f)
}),

ui:Object.freeze({
text:_getCached(0xffffff),
muted:_getCached(0xffa6c9),
highlight:_getCached(0xff4f8b),
danger:_getCached(0xff1744)
})

})

const _groups=Object.freeze([
ValentineColors.primary,
ValentineColors.secondary,
ValentineColors.accent,
ValentineColors.portal,
ValentineColors.particles,
ValentineColors.lighting,
ValentineColors.background,
ValentineColors.ui
])

const _tmpColor=new THREE.Color()

export function getValentineColor(path){
const parts=path.split('.')
let obj=ValentineColors
for(let i=0;i<parts.length;i++){
obj=obj?.[parts[i]]
if(!obj)return null
}
return obj
}

export function getRandomValentineColor(groupName){
const group=ValentineColors[groupName]
if(!group)return null
const keys=Object.keys(group)
const index=(Math.random()*keys.length)|0
return group[keys[index]]
}

export function lerpValentineColor(a,b,t,target){
target=target||_tmpColor
return target.copy(a).lerp(b,t)
}

export function cloneValentineColor(source,target){
target=target||new THREE.Color()
return target.copy(source)
}

export function getValentinePalette(groupName,targetArray){
const group=ValentineColors[groupName]
if(!group)return null
const keys=Object.keys(group)
targetArray=targetArray||new Array(keys.length)
for(let i=0;i<keys.length;i++){
targetArray[i]=group[keys[i]]
}
return targetArray
}

export function validateValentineColors(){
for(let i=0;i<_groups.length;i++){
const group=_groups[i]
const keys=Object.keys(group)
for(let j=0;j<keys.length;j++){
const c=group[keys[j]]
if(!(c instanceof THREE.Color))return false
}
}
return true
}

Object.freeze(_colorCache)
