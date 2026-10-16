import * as THREE from 'three';

export class GrassPainter{
  constructor(scene){
    this.scene=scene;this.enabled=false;this.size=5;this.density=8;this.grass=[];
    this.ray=new THREE.Raycaster();this.mouse=new THREE.Vector2();
    this.grassMat=new THREE.MeshStandardMaterial({color:0x4f9b42,roughness:1});
  }
  paint(e,camera,renderer){
    const r=renderer.domElement.getBoundingClientRect();
    this.mouse.x=((e.clientX-r.left)/r.width)*2-1;
    this.mouse.y=-((e.clientY-r.top)/r.height)*2+1;
    this.ray.setFromCamera(this.mouse,camera);
    const ground=this.scene.children.find(x=>x.userData?.engineGround && x.isMesh);
    if(!ground)return;
    const hit=this.ray.intersectObject(ground)[0];if(!hit)return;
    for(let i=0;i<this.density;i++){
      const a=Math.random()*Math.PI*2,rad=Math.random()*this.size;
      const x=hit.point.x+Math.cos(a)*rad,z=hit.point.z+Math.sin(a)*rad;
      const h=.25+Math.random()*.5;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(.12,h),this.grassMat.clone());
      m.position.set(x,h/2,z);m.rotation.y=Math.random()*Math.PI;m.rotation.x=-Math.PI/2;
      m.userData.grass=true;this.scene.add(m);this.grass.push(m);
    }
  }
  clear(){this.grass.forEach(x=>x.removeFromParent());this.grass=[]}
}