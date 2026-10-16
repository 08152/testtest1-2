export function importGLB(file,loader){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file);
    loader.load(url,gltf=>{
      URL.revokeObjectURL(url);
      const root=gltf.scene;
      root.userData.gltfRoot=root;
      root.userData.animations=gltf.animations||[];
      root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
      resolve(root);
    },undefined,err=>{URL.revokeObjectURL(url);reject(err)});
  });
}