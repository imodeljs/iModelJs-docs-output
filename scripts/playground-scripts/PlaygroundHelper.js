"use strict";
/** @module PlaygroudHelper */
exports.__esModule = true;
function print(x) {
    //$(document.body).append(x + "<br>");
    var text = document.body.innerText;
    console.log(text);
    document.body.innerHTML += x + "<br />";
}
exports.print = print;
function background(color) {
    document.body.style.backgroundColor = color;
}
exports.background = background;
function fontColor(color) {
    document.body.style.color = color;
}
exports.fontColor = fontColor;
