"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Geometry_1 = require("../Geometry");
/**
 * * A Segment1d is an interval of an axis named x.
 * * The interval is defined by two values x0 and x1.
 * * The x0 and x1 values can be in either order.
 * * * if `x0 < x1` fractional coordinates within the segment move from left to right.
 * * * if `x0 > x1` fractional coordinatesw within the segment move from right to left.
 * * This differs from a Range1d in that:
 * * For a Range1d the reversed ordering of its limit values means "empty interval".
 * * For a Segment1d the reversed ordering is a real interval but fractional positions mvoe backwards.
 * * The segment is parameterized with a fraction
 * * * Fraction 0 is the start (`x0`)
 * * * Fraction 1 is the end (`x1`)
 * * * The fraction equation is `x = x0 + fraction * (x1-x0)` or (equivalently) `x = (1-fraction) * x0 + fraction * x1`
 */
class Segment1d {
    constructor(x0, x1) {
        this.x0 = x0;
        this.x1 = x1;
    }
    set(x0, x1) { this.x0 = x0, this.x1 = x1; }
    /**
     * create segment1d with given end values
     * @param x0 start value
     * @param x1 end value
     * @param result optional pre-existing result to be reinitialized.
     */
    static create(x0 = 0, x1 = 1, result) {
        if (!result)
            return new Segment1d(x0, x1);
        result.set(x0, x1);
        return result;
    }
    /**
     * Copy both end values from other Segment1d
     * @param other source Segment1d
     */
    setFrom(other) { this.x0 = other.x0; this.x1 = other.x1; }
    /**
     * clone this Segment1d, return as a separate object.
     */
    clone() { return new Segment1d(this.x0, this.x1); }
    /**
     * @returns true if both coordinates (`x0` and `x1`) are in the 0..1 range.
     */
    get isIn01() {
        return Geometry_1.Geometry.isIn01(this.x0) && Geometry_1.Geometry.isIn01(this.x1);
    }
    /**
     * Evalauate the segment at fractional position
     * @returns position within the segment
     * @param fraction fractional position within this segment
     */
    fractionToPoint(fraction) { return Geometry_1.Geometry.interpolate(this.x0, fraction, this.x1); }
    /**
     * * swap the x0 and x1 member values.
     * * This makes the fractionToPoint evaluates reverse direction.
     */
    reverseInPlace() { const x = this.x0; this.x0 = this.x1; this.x1 = x; }
    /**
     * Near equality test, using Geometry.isSameCoordinate for tolerances.
     */
    isAlmostEqual(other) {
        return Geometry_1.Geometry.isSameCoordinate(this.x0, other.x0) && Geometry_1.Geometry.isSameCoordinate(this.x1, other.x1);
    }
    /**
     * Return true if the segment limits are (exactly) 0 and 1
     */
    get isExact01() { return this.x0 === 0.0 && this.x1 === 1.0; }
}
exports.Segment1d = Segment1d;
//# sourceMappingURL=Segment1d.js.map