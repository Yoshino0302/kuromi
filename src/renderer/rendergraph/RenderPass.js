export class RenderPass{

constructor(name,execute){

this.name=name

this.execute=execute

this.enabled=true

}

run(context){

if(!this.enabled)return

this.execute(context)

}

}
