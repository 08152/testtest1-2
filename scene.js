import * as THREE from 'three';

export function createScene(){
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x101722);
  const camera=new THREE.PerspectiveCamera(60,1,.1,2000);
  camera.position.set(8,6,10);
  const hemi=new THREE.HemisphereLight(0xbfd7ff,0x303030,2);
  scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffffff,3);
  sun.position.set(8,12,6);sun.castShadow=true;scene.add(sun);
  return {scene,camera};
}
export function makeGround(scene){
  const g=new THREE.GridHelper(100,100,0x455365,0x29313c);
  g.userData.engineGround=true;scene.add(g);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x303b30,roughness:1}));
  p.rotation.x=-Math.PI/2;p.position.y=-.02;p.receiveShadow=true;p.name='Terrain';
  p.userData.engineGround=true;scene.add(p);
}
export function addPrimitive(type){
  let geo,mat=new THREE.MeshStandardMaterial({color:0x6aa7d8,roughness:.65});
  if(type==='cube')geo=new THREE.BoxGeometry(1,1,1);
  if(type==='sphere')geo=new THREE.SphereGeometry(.6,32,20);
  if(type==='plane')geo=new THREE.PlaneGeometry(3,3);
  const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;
  if(type==='plane')m.rotation.x=-Math.PI/2;
  return m;
}
export function serializeScene(scene){
  return scene.children.filter(x=>x.userData?.engineObject).map(o=>({
    name:o.name,position:o.position.toArray(),rotation:o.rotation.toArray(),scale:o.scale.toArray()
  }));
}
export function loadSceneData(scene,data){return data}
