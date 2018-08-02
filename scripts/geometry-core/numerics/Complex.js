"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
/** @module Numerics */
const Geometry_1 = require("../Geometry");
class Complex {
    set x(value) { this.myX = value; }
    get x() { return this.myX; }
    set y(value) { this.myY = value; }
    get y() { return this.myY; }
    constructor(x = 0, y = 0) { this.myX = x; this.myY = y; }
    set(x = 0, y = 0) { this.x = x; this.y = y; }
    setFrom(other) { this.x = other.x; this.y = other.y; }
    clone() { return new Complex(this.x, this.y); }
    isAlmostEqual(other) { return Geometry_1.Geometry.isAlmostEqualNumber(this.x, other.x) && Geometry_1.Geometry.isAlmostEqualNumber(this.x, other.x); }
    static create(x = 0, y = 0, result) {
        if (result) {
            result.x = x;
            result.y = y;
            return result;
        }
        return new Complex(x, y);
    }
    plus(other, result) { return Complex.create(this.x + other.x, this.y + other.y, result); }
    minus(other, result) { return Complex.create(this.x - other.x, this.y - other.y, result); }
    times(other, result) {
        return Complex.create(this.x * other.x - this.y * other.y, this.x * other.y + this.y * other.x, result);
    }
    /** multiply {this * x+i*y}. That is, the second Complex value exists via the args without being formally created as an instance. */
    timesXY(x, y, result) {
        return Complex.create(this.x * x - this.y * y, this.x * y + this.y * x, result);
    }
    magnitude() { return Math.hypot(this.x, this.y); }
    angle() { return Geometry_1.Angle.createAtan2(this.y, this.x); }
    distance(other) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }
    magnitudeSquared() { return this.x * this.x + this.y * this.y; }
    divide(other, result) {
        const bb = other.magnitudeSquared();
        if (bb === 0.0)
            return undefined;
        const divbb = 1.0 / bb;
        return Complex.create((this.x * other.x + this.y * other.y) * divbb, (this.y * other.x - this.x * other.y) * divbb, result);
    }
    sqrt(result) {
        if ((this.x === 0.0) && (this.y === 0.0))
            return Complex.create(0, 0, result);
        const x = Math.abs(this.x);
        const y = Math.abs(this.y);
        let r = 0;
        let w = 0;
        if (x >= y) {
            r = y / x;
            w = Math.sqrt(x) * Math.sqrt(0.5 * (1.0 + Math.sqrt(1.0 + r * r)));
        }
        else {
            r = x / y;
            w = Math.sqrt(y) * Math.sqrt(0.5 * (r + Math.sqrt(1.0 + r * r)));
        }
        if (this.x >= 0.0) {
            return Complex.create(w, this.y / (2.0 * w), result);
        }
        else {
            const y1 = (this.y >= 0) ? w : -w;
            return Complex.create(this.y / (2.0 * y1), y1, result);
        }
    }
    setFromJSON(json) {
        if (Array.isArray(json) && json.length > 1) {
            this.set(json[0], json[1]);
        }
        else if (json && json.x && json.y) {
            this.set(json.x, json.y);
        }
        else {
            this.set(0, 0);
        }
    }
    static fromJSON(json) { const result = new Complex(); result.setFromJSON(json); return result; }
    /**
     * Convert an Complex to a JSON object.
     * @return {*} [x,y]
     */
    toJSON() { return [this.x, this.y]; }
}
exports.Complex = Complex;
//# sourceMappingURL=Complex.js.map