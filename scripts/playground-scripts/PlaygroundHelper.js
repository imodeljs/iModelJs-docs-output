"use strict";
/** @module PlaygroudHelper */
exports.__esModule = true;
function print(x) {
    var text = document.body.innerText;
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
