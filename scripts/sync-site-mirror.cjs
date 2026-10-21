// Root files are canonical. Keep existing legacy site/ copies reproducible.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const write=process.argv.includes('--write');
const changed=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const mirror=path.join(dir,entry.name);
    if(entry.isDirectory()){walk(mirror);continue;}
    const relative=path.relative(path.join(root,'site'),mirror);
    const canonical=path.join(root,relative);
    if(!fs.existsSync(canonical))continue;
    if(fs.readFileSync(mirror).equals(fs.readFileSync(canonical)))continue;
    changed.push(relative);
    if(write)fs.copyFileSync(canonical,mirror);
  }
}
walk(path.join(root,'site'));
if(changed.length){console.log(`${write?'Synchronized':'Out-of-date'} site/ copies: ${changed.join(', ')}`);if(!write)process.exitCode=1;}
