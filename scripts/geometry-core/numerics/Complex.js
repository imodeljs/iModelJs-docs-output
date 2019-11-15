"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Numerics */
const Geometry_1 = require("../Geometry");
const Angle_1 = require("../geometry3d/Angle");
/**
 * OPerations on a "complex number" class with real part `x` and complex part `y`
 * @internal
 */
class Complex {
    constructor(x = 0, y = 0) { this._x = x; this._y = y; }
    /** (propety set) Real part */
    set x(value) { this._x = value; }
    /** (propety get) Real part */
    get x() { return this._x; }
    /** (propety set) Imaginary part */
    set y(value) { this._y = value; }
    /** (propety get) Imaginary part */
    get y() { return this._y; }
    /** set x and y parts from args. */
    set(x = 0, y = 0) { this.x = x; this.y = y; }
    /** set `this.x` and `this.y` from `other.x` and `other.y` */
    setFrom(other) { this.x = other.x; this.y = other.y; }
    /** clone the complex x,y */
    clone() { return new Complex(this.x, this.y); }
    /** test for near equality using coordinate tolerances */
    isAlmostEqual(other) { return Geometry_1.Geometry.isAlmostEqualNumber(this.x, other.x) && Geometry_1.Geometry.isAlmostEqualNumber(this.x, other.x); }
    /** Create a new Complex instance from given x and y. */
    static create(x = 0, y = 0, result) {
        if (result) {
            result.x = x;
            result.y = y;
            return result;
        }
        return new Complex(x, y);
    }
    /** Return the complex sum `this+other` */
    plus(other, result) { return Complex.create(this.x + other.x, this.y + other.y, result); }
    /** Return the complex difference  `this-other` */
    minus(other, result) { return Complex.create(this.x - other.x, this.y - other.y, result); }
    /** Return the complex product  `this * other` */
    times(other, result) {
        return Complex.create(this.x * other.x - this.y * other.y, this.x * other.y + this.y * other.x, result);
    }
    /** Return the complex product `this * x+i*y`. That is, the second Complex value exists via the args without being formally created as an instance. */
    timesXY(x, y, result) {
        return Complex.create(this.x * x - this.y * y, this.x * y + this.y * x, result);
    }
    /** Return the mangitude of the complex number */
    magnitude() { return Geometry_1.Geometry.hypotenuseXY(this.x, this.y); }
    /** Return the angle from x axis to the vector (x,y) */
    angle() { return Angle_1.Angle.createAtan2(this.y, this.x); }
    /** Return the xy plane distance between this and other */
    distance(other) {
        return Geometry_1.Geometry.hypotenuseXY(this.x - other.x, this.y - other.y);
    }
    /** Return the squared xy plane distance between this and other. */
    magnitudeSquared() { return this.x * this.x + this.y * this.y; }
    /** Return the complex division `this / other` */
    divide(other, result) {
        const bb = other.magnitudeSquared();
        if (bb === 0.0)
            return undefined;
        const divbb = 1.0 / bb;
        return Complex.create((this.x * other.x + this.y * other.y) * divbb, (this.y * other.x - this.x * other.y) * divbb, result);
    }
    /** Return the complex square root of this. */
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
    /** set the complex x,y from a json object of the form like
     * * x,y key value pairs:   `{x:1,y:2}`
     * * array of numbers:  `[1,2]`
     */
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
    /** Create a `Complex` instance from a json object. */
    static fromJSON(json) { const result = new Complex(); result.setFromJSON(json); return result; }
    /**
     * Convert an Complex to a JSON object.
     * @return {*} [x,y]
     */
    toJSON() { return [this.x, this.y]; }
}
exports.Complex = Complex;
//# sourceMappingURL=Complex.js.map