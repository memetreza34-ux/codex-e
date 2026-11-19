import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join,resolve,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const OUT=join(ROOT,'documentaries');
const GATES=['research','script','rights','visual','audio','finalReview','publishApproval'];
const SLUG=/^[a-z][a-z0-9-]{1,55}$/;
const ID=/^[a-z][a-z0-9-]{0,55}$/;
const APPROVAL=new Set(['pending','approved','rejected']);
const ORIGINS=new Set(['external','original','generated']);
const VISUALS=new Set(['archive','footage','photo','document','map','chart','animation','reconstruction']);
const validUrl=(v)=>{try{const a=new URL(v);return ['http:','https:'].includes(a.protocol);}catch{return false;}};
async function json(path){return JSON.parse(await readFile(path,'utf8'));}
async function save(path,data){await writeFile(path,JSON.stringify(data,null,2)+'\n',{flag:'wx'});}
function slugCheck(slug){if(!SLUG.test(slug||''))throw Error('Ungültiger Slug (2–56 Kleinbuchstaben, Ziffern, Bindestriche).');return slug;}
function requireField(errors,ok,message){if(!ok)errors.push(message);}
export async function createProject(slug,title,{root=OUT}={}){
 slugCheck(slug);
 if(typeof title!=='string'||title.trim().length<5)throw Error('Mindestens fünf Zeichen für den Titel erforderlich.');
 const dir=join(root,slug);
 await mkdir(root,{recursive:true});
 await mkdir(dir);
 await save(join(dir,'brief.json'),{schemaVersion:1,slug,title:title.trim(),format:'16:9',resolution:'1920x1080',fps:30,targetMinutes:10,publication:'manual-only'});
 await save(join(dir,'claims.json'),{schemaVersion:1,claims:[]});
 await save(join(dir,'assets.json'),{schemaVersion:1,assets:[]});
 await save(join(dir,'scenes.json'),{schemaVersion:1,scenes:[]});
 await save(join(dir,'release.json'),{schemaVersion:1,...Object.fromEntries(GATES.map(g=>[g,'pending']))});
 await writeFile(join(dir,'script.md'),'# Sprechertext\n\nNoch keine geprüften Aussagen.\n',{flag:'wx'});
 await writeFile(join(dir,'review.md'),'# Review\n\nKeine Video-/Audio-Abnahme durchgeführt.\n',{flag:'wx'});
 return dir;
}
export async function auditProject(dir){
 const errors=[],warnings=[];
 const data={};
 for(const name of ['brief','claims','assets','scenes','release']){
  try{data[name]=await json(join(dir,name+'.json'));}
  catch(error){errors.push(name+'.json: '+error.message);}
 }
 if(errors.length)return {project:basename(dir),publishable:false,errors,warnings};
 const {brief,claims,assets,scenes,release}=data;
 requireField(errors,brief.schemaVersion===1,'brief: Versionsnummer ungültig');
 requireField(errors,SLUG.test(brief.slug||'')&&brief.slug===basename(dir),'brief: falscher Slug');
 requireField(errors,brief.format==='16:9'&&brief.resolution==='1920x1080'&&brief.fps===30,'brief: nur 16:9 1920x1080 30fps');
 requireField(errors,brief.targetMinutes>=8&&brief.targetMinutes<=12,'brief: Ziellänge muss zwischen 8 und 12 Minuten sein');
 requireField(errors,brief.publication==='manual-only','brief: automatische Veröffentlichung untersagt');
 const c=Array.isArray(claims.claims)?claims.claims:[];
 const a=Array.isArray(assets.assets)?assets.assets:[];
 const s=Array.isArray(scenes.scenes)?scenes.scenes:[];
 if(!c.length)errors.push('claims: keine geprüften Aussagen');
 if(!a.length)errors.push('assets: keine Medien');
 if(!s.length)errors.push('scenes: keine Szenen');
 function unique(arr,label){const ids=new Set();for(const x of arr){if(!x||!ID.test(x.id||''))errors.push(label+': ungültige ID');else if(ids.has(x.id))errors.push(label+': doppelte ID '+x.id);else ids.add(x.id);}return ids;}
 const claimIds=unique(c,'claims'),assetIds=unique(a,'assets');unique(s,'scenes');
 for(const x of c){
  if(!x||!ID.test(x.id||''))continue;
  requireField(errors,typeof x.text==='string'&&x.text.trim().length>=10,'claim '+x.id+': Aussage fehlt');
  if(x.verification!=='approved')errors.push('claim '+x.id+': nicht redaktionell freigegeben');
  if(!Array.isArray(x.sources)||!x.sources.length){errors.push('claim '+x.id+': Quellen fehlen');continue;}
  for(const source of x.sources)requireField(errors,source&&validUrl(source.url)&&typeof source.title==='string'&&!!source.title.trim()&&typeof source.publisher==='string'&&!!source.publisher.trim()&&/^\d{4}-\d{2}-\d{2}$/.test(source.accessedAt||''),'claim '+x.id+': URL, Quellentitel, Publisher und Abrufdatum notwendig');
 }
 for(const x of a){
  if(!x||!ID.test(x.id||''))continue;
  requireField(errors,ORIGINS.has(x.origin),'asset '+x.id+': Herkunft external/original/generated');
  requireField(errors,typeof x.kind==='string'&&x.kind.length>0,'asset '+x.id+': Medientyp fehlt');
  requireField(errors,typeof x.author==='string'&&!!x.author.trim(),'asset '+x.id+': Urheber fehlt');
  requireField(errors,typeof x.license==='string'&&!!x.license.trim(),'asset '+x.id+': Rechtsgrundlage fehlt');
  if(x.origin==='external')requireField(errors,validUrl(x.sourceUrl),'asset '+x.id+': Quell-URL fehlt');
  if(x.origin==='generated')requireField(errors,typeof x.provenance==='string'&&!!x.provenance.trim(),'asset '+x.id+': KI-Provenienz fehlt');
  if(x.rightsStatus!=='cleared')errors.push('asset '+x.id+': Rechte ungeklärt');
 }
 let seconds=0;
 for(const x of s){
  if(!x||!ID.test(x.id||''))continue;
  requireField(errors,typeof x.narration==='string'&&!!x.narration.trim(),'scene '+x.id+': Sprechertext fehlt');
  requireField(errors,VISUALS.has(x.visualType),'scene '+x.id+': ungültiger Visualtyp');
  requireField(errors,Number.isFinite(x.durationSeconds)&&x.durationSeconds>0,'scene '+x.id+': Dauer fehlt');
  if(Number.isFinite(x.durationSeconds)&&x.durationSeconds>0)seconds+=x.durationSeconds;
  requireField(errors,Array.isArray(x.claimIds),'scene '+x.id+': claimIds fehlt');
  requireField(errors,Array.isArray(x.assetIds),'scene '+x.id+': assetIds fehlt');
  for(const id of Array.isArray(x.claimIds)?x.claimIds:[])if(!claimIds.has(id))errors.push('scene '+x.id+': unbekannter Claim '+id);
  for(const id of Array.isArray(x.assetIds)?x.assetIds:[])if(!assetIds.has(id))errors.push('scene '+x.id+': unbekanntes Asset '+id);
  if(x.visualType!=='animation'&&(!Array.isArray(x.assetIds)||!x.assetIds.length))errors.push('scene '+x.id+': kein Bild-/Medienbeleg');
 }
 if(s.length&&(seconds<480||seconds>720))errors.push('Szenenlänge '+seconds+' Sekunden außerhalb des Zielbereichs');
 for(const gate of GATES){
  if(!APPROVAL.has(release[gate]))errors.push('release: ungültiger Status '+gate);
  else if(release[gate]!=='approved')errors.push('release: '+gate+' nicht freigegeben');
 }
 warnings.push('Formale Prüfung ist kein Nachweis für tatsächlich geprüfte Rechte, Fakten oder Bild-/Tonqualität.');
 return {project:basename(dir),publishable:errors.length===0,claims:c.length,assets:a.length,scenes:s.length,plannedSeconds:seconds,errors,warnings};
}
async function cli(){
 const command=process.argv[2],slug=process.argv[3];
 if(!['new','check','status'].includes(command))throw Error('Befehle: new SLUG TITEL | check SLUG | status SLUG');
 slugCheck(slug);
 if(command==='new'){console.log('Neu: '+await createProject(slug,process.argv.slice(4).join(' ')));return;}
 const report=await auditProject(join(OUT,slug));
 console.log(JSON.stringify(report,null,2));
 if(command==='check'&&!report.publishable)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))cli().catch(e=>{console.error(e.message);process.exitCode=1;});
