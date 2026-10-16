export class GameMenu{
  constructor(name='Main Menu'){this.name=name;this.elements=[]}
  addButton(text,action){this.elements.push({type:'button',text,action})}
  addText(text){this.elements.push({type:'text',text})}
}