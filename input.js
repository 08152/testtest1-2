export class EngineInput{
  constructor(dom){this.dom=dom;this.keys={};window.addEventListener('keydown',e=>this.keys[e.code]=true);window.addEventListener('keyup',e=>this.keys[e.code]=false)}
  update(){}
}