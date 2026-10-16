import * as THREE from 'three';

export function setupMaterials(){}
export function applyTextureToObject(object,image){
  if(!object)return;
  const texture=new THREE.Texture(image);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.needsUpdate=true;
  object.traverse(o=>{
    if(!o.isMesh)return;
    const old=o.material;
    const mat=old.clone ? old.clone() : new THREE.MeshStandardMaterial();
    mat.map=texture;mat.needsUpdate=true;o.material=mat;
  });
}