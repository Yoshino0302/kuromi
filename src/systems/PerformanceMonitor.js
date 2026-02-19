export class PerformanceMonitor{

constructor(){

this.frames=0

this.accumulator=0

this.fps=0

}

update(delta){

this.frames++

this.accumulator+=delta

if(this.accumulator>=1){

this.fps=this.frames

this.frames=0

this.accumulator=0

console.log(
'[Kuromi Engine] FPS:',
this.fps
)

}

}

}
