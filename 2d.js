// Grundlage für das spätere 2D-System.
// Hier kommen Sprite-, Canvas-, Text- und UI-Objekte hinein.
export class Sprite2D{
  constructor(image,x=0,y=0){this.image=image;this.x=x;this.y=y;this.scaleX=1;this.scaleY=1}
}
export class UIElement{
  constructor(type='panel'){this.type=type;this.x=0;this.y=0;this.width=100;this.height=40}
}