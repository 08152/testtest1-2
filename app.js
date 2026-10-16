import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

import {createScene, addPrimitive, makeGround, serializeScene, loadSceneData} from './scene.js';
import {setupUI} from './ui.js';
import {importGLB} from './glb.js';
import {setupMaterials, applyTextureToObject} from './materials.js';
import {GrassPainter} from './terrain.js';
import {EngineInput} from './input.js';
import {saveJSON, downloadBlob} from './storage.js';

const viewport=document.getElementById('viewport');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(viewport.clientWidth,viewport.clientHeight);
renderer.shadowMap.enabled=true;
renderer.outputColorSpace=THREE.SRGBColorSpace;
viewport.appendChild(renderer.domElement);

const {scene,camera}=createScene();
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.target.set(0,0,0);

const transform=new TransformControls(camera,renderer.domElement);
transform.addEventListener('dragging-changed',e=>controls.enabled=!e.value);
scene.add(transform);

const loader=new GLTFLoader();
const draco=new DRACOLoader();
draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/');
loader.setDRACOLoader(draco);

const input=new EngineInput(renderer.domElement);
const grass=new GrassPainter(scene);
const assets=new Map();
let selected=null;
let mixers=[];
let clock=new THREE.Clock();
let last=performance.now(),frames=0;

makeGround(scene);

function selectObject(obj){
  selected=obj;
  transform.detach();
  if(obj) transform.attach(obj);
  updateInspector();
  updateAnimations();
  updateTree();
}
function addObject(obj,name='Objekt'){
  obj.name=name;
  obj.userData.engineObject=true;
  scene.add(obj);
  assets.set(name,{type:'object',object:obj});
  selectObject(obj);
  updateTree();
}
function updateInspector(){
  const el=document.getElementById('inspector');
  if(!selected){el.innerHTML='<span class="muted">Kein Objekt ausgewählt.</span>';return}
  const p=selected.position,r=selected.rotation,s=selected.scale;
  el.innerHTML=`
    <div><b>${selected.name||'Objekt'}</b></div>
    <div class="row">X<input id="px" type="number" step=".1" value="${p.x}"></div>
    <div class="row">Y<input id="py" type="number" step=".1" value="${p.y}"></div>
    <div class="row">Z<input id="pz" type="number" step=".1" value="${p.z}"></div>
    <div class="row">Rot X<input id="rx" type="number" step=".05" value="${r.x}"></div>
    <div class="row">Rot Y<input id="ry" type="number" step=".05" value="${r.y}"></div>
    <div class="row">Rot Z<input id="rz" type="number" step=".05" value="${r.z}"></div>
    <div class="row">Scale<input id="sc" type="number" step=".1" value="${s.x}"></div>
    <div class="materialDrop" id="textureDrop">Textur hier hineinziehen</div>
    <button id="deleteObj" style="width:100%;margin-top:8px">Objekt löschen</button>`;
  for(const id of ['px','py','pz']) document.getElementById(id).onchange=e=>selected.position[['px','py','pz'].indexOf(id)]=+e.target.value;
  for(const id of ['rx','ry','rz']) document.getElementById(id).onchange=e=>selected.rotation[['rx','ry','rz'].indexOf(id)]=+e.target.value;
  document.getElementById('sc').onchange=e=>selected.scale.setScalar(+e.target.value);
  document.getElementById('deleteObj').onclick=()=>{selected.removeFromParent();selectObject(null)};
  document.getElementById('textureDrop').ondragover=e=>e.preventDefault();
  document.getElementById('textureDrop').ondrop=e=>{e.preventDefault();const n=e.dataTransfer.getData('text/plain');if(assets.has(n))applyTextureToObject(selected,assets.get(n).image)};
}
function updateAnimations(){
  const el=document.getElementById('animations');
  el.innerHTML='';
  const root=selected?.userData?.gltfRoot;
  const clips=selected?.userData?.animations||[];
  if(!clips.length){el.innerHTML='<span class="muted">Keine Animationen gefunden.</span>';return}
  el.innerHTML='<div class="muted">Animationen des GLB:</div>';
  clips.forEach((clip,i)=>{
    const row=document.createElement('div');row.className='anim';
    const b=document.createElement('button');b.textContent='▶ '+clip.name;
    b.onclick=()=>playAnimation(selected,clip);
    const s=document.createElement('button');s.textContent='■';s.onclick=()=>stopAnimations(selected);
    row.append(b,s);el.append(row);
  });
}
function playAnimation(obj,clip){
  stopAnimations(obj);
  const mixer=new THREE.AnimationMixer(obj.userData.gltfRoot||obj);
  const action=mixer.clipAction(clip);action.reset().play();
  mixers.push({mixer,obj});
  obj.userData.currentAnimation=clip.name;
}
function stopAnimations(obj){
  mixers=mixers.filter(x=>{if(x.obj===obj){x.mixer.stopAllAction();return false}return true});
}
function updateTree(){
  const el=document.getElementById('sceneTree');el.innerHTML='';
  scene.children.filter(x=>x.userData?.engineObject).forEach(o=>{
    const d=document.createElement('div');d.className='treeItem '+(o===selected?'sel':'');
    d.textContent=o.name||'Objekt';d.onclick=()=>selectObject(o);el.appendChild(d);
  });
}
document.querySelectorAll('.tool').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tool').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  const t=b.dataset.tool;
  if(t==='grass'){grass.enabled=true;transform.detach();document.getElementById('grassPanel').classList.remove('hidden')}
  else{grass.enabled=false;document.getElementById('grassPanel').classList.add('hidden');if(t==='move'||t==='rotate'||t==='scale')transform.setMode(t==='move'?'translate':t==='rotate'?'rotate':'scale');else transform.detach()}
});
document.getElementById('addCube').onclick=()=>addObject(addPrimitive('cube'),'Würfel');
document.getElementById('addSphere').onclick=()=>addObject(addPrimitive('sphere'),'Kugel');
document.getElementById('addPlane').onclick=()=>addObject(addPrimitive('plane'),'Ebene');

document.getElementById('glbInput').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    const obj=await importGLB(file,loader);
    addObject(obj,file.name.replace(/\.[^.]+$/,''));
    assets.set(file.name,{type:'model',object:obj});
    updateAssetList();
    document.getElementById('status').textContent=`GLB importiert: ${file.name}`;
  }catch(err){alert('GLB konnte nicht importiert werden: '+err.message)}
};
document.getElementById('textureInput').onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{assets.set(file.name,{type:'texture',image:img});updateAssetList();document.getElementById('status').textContent=`Textur importiert: ${file.name}`};
  img.src=url;
};
function updateAssetList(){
  const el=document.getElementById('assets');el.innerHTML='';
  for(const [name,a] of assets){
    const d=document.createElement('div');d.className='asset';d.textContent=name;
    d.draggable=true;d.ondragstart=e=>e.dataTransfer.setData('text/plain',name);
    if(a.type==='texture')d.onclick=()=>selected&&applyTextureToObject(selected,a.image);
    el.appendChild(d);
  }
}
document.getElementById('clearGrass').onclick=()=>grass.clear();
document.getElementById('brushSize').oninput=e=>grass.size=+e.target.value;
document.getElementById('brushDensity').oninput=e=>grass.density=+e.target.value;
document.getElementById('newScene').onclick=()=>location.reload();
document.getElementById('saveScene').onclick=()=>downloadBlob('scene.json',JSON.stringify(serializeScene(scene),null,2),'application/json');

window.addEventListener('resize',()=>{camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();renderer.setSize(viewport.clientWidth,viewport.clientHeight)});

renderer.domElement.addEventListener('pointerdown',e=>{
  if(grass.enabled){grass.paint(e,camera,renderer);return}
  if(e.button!==0)return;
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(
    (e.offsetX/renderer.domElement.clientWidth)*2-1,
    -(e.offsetY/renderer.domElement.clientHeight)*2+1);
  ray.setFromCamera(mouse,camera);
  const hits=ray.intersectObjects(scene.children.filter(x=>x.userData?.engineObject),true);
  if(hits.length){let o=hits[0].object;while(o.parent&&!o.userData.engineObject)o=o.parent;selectObject(o)}
});
setupUI();
updateTree();

function loop(){
  requestAnimationFrame(loop);
  const dt=clock.getDelta();controls.update();
  input.update(dt);
  mixers.forEach(x=>x.mixer.update(dt));
  renderer.render(scene,camera);
  frames++;
  const now=performance.now();if(now-last>1000){document.getElementById('fps').textContent='FPS: '+frames;frames=0;last=now}
}
loop();
