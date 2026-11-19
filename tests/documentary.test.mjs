import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createProject,auditProject} from '../scripts/documentary.mjs';
async function temporary(){return mkdtemp(join(tmpdir(),'doku-test-'));}
async function patch(dir,name,mutate){const file=join(dir,name+'.json');const value=JSON.parse(await readFile(file,'utf8'));mutate(value);await writeFile(file,JSON.stringify(value,null,2)+'\n');}
test('neues Doku-Projekt ist unvollständig und kann nicht überschrieben werden',async()=>{
 const root=await temporary();
 try{
  const dir=await createProject('mein-film','Eine Geschichte',{root});
  const report=await auditProject(dir);
  assert.equal(report.publishable,false);
  assert.ok(report.errors.some(e=>e.includes('keine geprüften Aussagen')));
  await assert.rejects(createProject('mein-film','Neuer Titel',{root}),{code:'EEXIST'});
 }finally{await rm(root,{recursive:true,force:true});}
});
test('unsichere Projektpfade sind gesperrt',async()=>{
 const root=await temporary();
 try{
  await assert.rejects(createProject('../geheim','Neuer Titel',{root}));
  await assert.rejects(createProject('Groß','Neuer Titel',{root}));
 }finally{await rm(root,{recursive:true,force:true});}
});
test('Quellen, Rechte und verknüpfte Assets müssen wirklich freigegeben sein',async()=>{
 const root=await temporary();
 try{
  const dir=await createProject('rechte-test','Eine längere Doku',{root});
  await patch(dir,'claims',v=>v.claims.push({id:'claim-1',text:'Ein ausreichend genauer Beispiel-Claim',verification:'approved',sources:[{url:'https://example.org/source',title:'Quelle',publisher:'Archiv',accessedAt:'2026-11-19'}]}));
  await patch(dir,'assets',v=>v.assets.push({id:'asset-1',origin:'external',kind:'photo',author:'Archiv',license:'Beispiel-Lizenz, struktureller Test',sourceUrl:'https://example.org/photo',rightsStatus:'pending'}));
  await patch(dir,'scenes',v=>v.scenes.push({id:'scene-1',narration:'Erster belegter Sprechertext',claimIds:['claim-1'],assetIds:['wrong'],visualType:'photo',durationSeconds:600}));
  const result=await auditProject(dir);
  assert.equal(result.publishable,false);
  assert.ok(result.errors.some(e=>e.includes('unbekanntes Asset')));
  assert.ok(result.errors.some(e=>e.includes('Rechte ungeklärt')));
  await patch(dir,'scenes',v=>v.scenes[0].assetIds=['asset-1']);
  await patch(dir,'assets',v=>v.assets[0].rightsStatus='cleared');
  const next=await auditProject(dir);
  assert.equal(next.publishable,false);
  assert.ok(next.errors.some(e=>e.includes('release:')));
 }finally{await rm(root,{recursive:true,force:true});}
});
