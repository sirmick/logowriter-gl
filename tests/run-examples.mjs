import fs from 'fs';
const html=fs.readFileSync(new URL('../index.html', import.meta.url),'utf8');
const core=html.split('//<core>')[1].split('//</core>')[0];
const exSrc=html.split('// ======================= Examples =======================')[1].split('// ======================= UI wiring')[0];
const GLstub=`const GL={total:0,bb:[1e9,1e9,-1e9,-1e9],seg(x0,y0,x1,y1){this.total++;const b=this.bb;for(const [x,y] of [[x0,y0],[x1,y1]]){if(x<b[0])b[0]=x;if(y<b[1])b[1]=y;if(x>b[2])b[2]=x;if(y>b[3])b[3]=y}},clear(){},flush(){}};`;
const {R,GL,EXAMPLES,GROUPS,resetWorld,loadProgram,startTask,step}=new Function(GLstub+core+exSrc+`return {R,GL,EXAMPLES,GROUPS,resetWorld,loadProgram,startTask,step};`)();
const all=Object.values(GROUPS).flat();
console.log('examples',Object.keys(EXAMPLES).length,'in groups',all.length, 'missing',Object.keys(EXAMPLES).filter(k=>!all.includes(k)), all.filter(k=>!EXAMPLES[k]));
for(const name of all){
  resetWorld();GL.bb=[1e9,1e9,-1e9,-1e9];R.lines=[];
  let maxT=0,rounds=0;
  try{
    loadProgram(EXAMPLES[name]);startTask('STARTUP');
    const t0=performance.now();
    while(R.tasks.length&&rounds<500000){
      R.k=0;const t=performance.now()+1e9; // ignore WAIT
      for(const task of R.tasks){task.wake=0;step(task,1024,t)}
      R.tasks=R.tasks.filter(t=>!t.done);R.turtles=R.turtles.filter(T=>T.alive);
      maxT=Math.max(maxT,R.turtles.length);rounds++;
    }
    const b=GL.bb.map(v=>Math.round(v));
    const warn=(b[0]<-480||b[2]>480||b[1]<-320||b[3]>320)?'  <-- OUT':'';
    console.log(name.padEnd(38),'segs',String(GL.total).padStart(8),'maxT',String(maxT).padStart(4),'ms',(performance.now()-t0).toFixed(0).padStart(5),'bb',b.join(','),warn,R.lines.map(l=>l[0]).join('|'));
  }catch(e){console.log(name,'ERROR line',e.line,e.message)}
}
