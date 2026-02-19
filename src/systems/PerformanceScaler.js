export class PerformanceScaler{

constructor(renderer){

this.renderer=renderer

this.targetFPS=60

this.scale=1

}

update(currentFPS){

if(currentFPS<50){

this.scale=0.8

}else{

this.scale=1

}

this.renderer.setPixelRatio(
window.devicePixelRatio*this.scale
)

}

}
