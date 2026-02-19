export class RenderGraph{

constructor(){

this.passes=[]

}

addPass(pass){

this.passes.push(pass)

}

execute(context){

for(const pass of this.passes){

pass.run(context)

}

}

}
