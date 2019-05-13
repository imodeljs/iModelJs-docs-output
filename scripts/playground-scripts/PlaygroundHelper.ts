/** @module PlaygroudHelper */


export function print(x:any):void{
	var text = document.body.innerText;
	document.body.innerHTML += x + "<br />";
}

export function background(color: string): void{
	document.body.style.backgroundColor = color;
}

export function fontColor(color: string): void{
	document.body.style.color = color;
}