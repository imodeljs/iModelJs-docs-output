/** @module PlaygroudHelper */


export function print(x:any):void{
	//$(document.body).append(x + "<br>");
	var text = document.body.innerText;
	console.log(text);
	document.body.innerHTML += x + "<br />";
}

export function background(color: string): void{
	document.body.style.backgroundColor = color;
}

export function fontColor(color: string): void{
	document.body.style.color = color;
}