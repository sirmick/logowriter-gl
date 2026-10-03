import fs from 'fs';
const html=fs.readFileSync(new URL('../index.html', import.meta.url),'utf8');
const core=html.split('//<core>')[1].split('//</core>')[0];
const exSrc=html.split('// ======================= Examples =======================')[1].split('// ======================= UI wiring')[0];
const ctl=html.split('// ---- controls:')[1].split('const ctrlBox')[0];
const GLstub=`const GL={total:0,seg(){this.total++},clear(){},flush(){}};`;
const X=new Function(GLstub+core+exSrc+'\n'+ctl.slice(ctl.indexOf('\n'))+`
const fmtVal=(c,v)=>c.kind==='bool'?(v?'TRUE':'FALSE'):(+(+v).toFixed(c.dec)).toString();
return {R,GL,EXAMPLES,GROUPS,resetWorld,loadProgram,startTask,step,parseControls,fmtVal};`)();
function run(src){X.resetWorld();X.loadProgram(src);X.startTask('STARTUP');let n=0;
  while(X.R.tasks.length&&n<2e6){for(const t of X.R.tasks){t.wake=0;X.step(t,4096,1e12)}X.R.tasks=X.R.tasks.filter(t=>!t.done);X.R.turtles=X.R.turtles.filter(T=>T.alive);n++}
  return X.GL.total;}
let total=0;
for(const name of Object.values(X.GROUPS).flat()){
  const src=X.EXAMPLES[name];const cs=X.parseControls(src);total+=cs.length;
  const res=[];
  for(const [i,c] of cs.entries()){
    if(c.kind==='range'&&(c.value<c.min||c.value>c.max))res.push(`${c.name} default out of range`);
    // set to min, run
    const v=c.kind==='bool'?!c.value:c.min;
    const txt=X.fmtVal(c,v);const s2=src.slice(0,c.start)+txt+src.slice(c.end);
    const c2=X.parseControls(s2)[i];
    if(!c2||c2.value!==(c.kind==='bool'?v:+txt))res.push(`${c.name} subst failed`);
    try{X.GL.total=0;run(s2)}catch(e){res.push(`${c.name}=${txt}: ${e.message}`)}
  }
  console.log(name.padEnd(38),cs.map(c=>c.name+(c.kind==='bool'?'?':`[${c.min}..${c.max}]`)).join(' '),res.length?'  !! '+res.join('; '):'');
}
console.log('controls total',total);
