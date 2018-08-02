"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty*/
const PointVector_1 = require("./PointVector");
class Geometry {
    /** Points and vectors can be emitted in two forms:
      *
      * *  preferJSONArray === true :       [x,y,z]
      * *  preferJSONArray === false :      {x: 1, y: 2, z: 3}
      */
    // possible names for this class: Geometry, Distance, Units
    static correctSmallMetricDistance(distance, replacement = 0.0) {
        if (Math.abs(distance) < Geometry.smallMetricDistance) {
            return replacement;
        }
        return distance;
    }
    /**
   * @returns If `a` is large enough, return `1/a`, using Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
   * @param a denominator of division
   */
    static inverseMetricDistance(a) { return (Math.abs(a) <= Geometry.smallMetricDistance) ? undefined : 1.0 / a; }
    /**
     * @returns If `a` is large enough, return `1/a`, using the square of Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
     * @param a denominator of division
     */
    static inverseMetricDistanceSquared(a) {
        return (Math.abs(a) <= Geometry.smallMetricDistanceSquared) ? undefined : 1.0 / a;
    }
    static isSameCoordinate(x, y, tol) {
        if (tol)
            return Math.abs(x - y) < Math.abs(tol);
        return Math.abs(x - y) < Geometry.smallMetricDistance;
    }
    static isSameCoordinateSquared(x, y) {
        return Math.abs(Math.sqrt(x) - Math.sqrt(y)) < Geometry.smallMetricDistance;
    }
    static isSamePoint3d(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    static isSameXYZ(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    static isSamePoint3dXY(dataA, dataB) { return dataA.distanceXY(dataB) < Geometry.smallMetricDistance; }
    static isSameVector3d(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    static isSamePoint2d(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    static isSameVector2d(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with x as first test, y second.
     */
    static lexicalXYLessThan(a, b) {
        if (a.x < b.x)
            return -1;
        else if (a.x > b.x)
            return 1;
        if (a.y < b.y)
            return -1;
        else if (a.y > b.y)
            return 1;
        return 0;
    }
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with y as first test, x second.
     */
    static lexicalYXLessThan(a, b) {
        if (a.y < b.y)
            return -1;
        else if (a.y > b.y)
            return 1;
        if (a.x < b.x)
            return -1;
        else if (a.x > b.x)
            return 1;
        return 0;
    }
    static lexicalXYZLessThan(a, b) {
        if (a.x < b.x)
            return -1;
        else if (a.x > b.x)
            return 1;
        if (a.y < b.y)
            return -1;
        else if (a.y > b.y)
            return 1;
        if (a.z < b.z)
            return -1;
        else if (a.z > b.z)
            return 1;
        return 0;
    }
    static isSmallRelative(value) { return Math.abs(value) < Geometry.smallAngleRadians; }
    static isSmallAngleRadians(value) { return Math.abs(value) < Geometry.smallAngleRadians; }
    static isAlmostEqualNumber(a, b) {
        return Math.abs(a - b) < Geometry.smallAngleRadians * Math.max(a, b);
    }
    static isDistanceWithinTol(distance, tol) {
        return Math.abs(distance) <= Math.abs(tol);
    }
    static isSmallMetricDistance(distance) {
        return Math.abs(distance) <= Geometry.smallMetricDistance;
    }
    static isSmallMetricDistanceSquared(distanceSquared) {
        return Math.abs(distanceSquared) <= Geometry.smallMetricDistanceSquared;
    }
    static cyclic3dAxis(axis) {
        /* Direct test for the most common cases, avoid modulo */
        if (axis >= 0) {
            if (axis < 3)
                return axis;
            if (axis < 6)
                return axis - 3;
            return axis % 3;
        }
        const j = axis + 3;
        if (j >= 0)
            return j;
        return 2 - ((-axis - 1) % 3);
    }
    /** Return the AxisOrder for which axisIndex is the first named axis.
     * * `axisIndex===0`returns AxisOrder.XYZ
     * * `axisIndex===1`returns AxisOrder.YZX
     * * `axisIndex===2`returns AxisOrder.ZXY
     */
    static axisIndexToRightHandedAxisOrder(axisIndex) {
        if (axisIndex === 0)
            return 0 /* XYZ */;
        if (axisIndex === 1)
            return 1 /* YZX */;
        if (axisIndex === 2)
            return 2 /* ZXY */;
        return Geometry.axisIndexToRightHandedAxisOrder(Geometry.cyclic3dAxis(axisIndex));
    }
    /** @returns the largest absolute distance from a to either of b0 or b1 */
    static maxAbsDiff(a, b0, b1) { return Math.max(Math.abs(a - b0), Math.abs(a - b1)); }
    /** @returns the largest absolute absolute value among x,y,z */
    static maxAbsXYZ(x, y, z) {
        return Geometry.maxXYZ(Math.abs(x), Math.abs(y), Math.abs(z));
    }
    /** @returns the largest signed value among a, b, c */
    static maxXYZ(a, b, c) {
        let q = a;
        if (b > q)
            q = b;
        if (c > q)
            q = c;
        return q;
    }
    /** @returns Return the hypotenuse sqrt(x\*x + y\*y). This is much faster than Math.hypot(x,y).*/
    static hypotenuseXY(x, y) { return Math.sqrt(x * x + y * y); }
    /** @returns Return the squared hypotenuse (x\*x + y\*y). */
    static hypotenuseSquaredXY(x, y) { return x * x + y * y; }
    /** @returns Return the square of x */
    static square(x) { return x * x; }
    /** @returns Return the hypotenuse sqrt(x\*x + y\*y). This is much faster than Math.hypot(x,y, z).*/
    static hypotenuseXYZ(x, y, z) { return Math.sqrt(x * x + y * y + z * z); }
    static hypotenuseSquaredXYZ(x, y, z) { return x * x + y * y + z * z; }
    static hypotenuseXYZW(x, y, z, w) { return Math.sqrt(x * x + y * y + z * z + w * w); }
    static hypotenuseSquaredXYZW(x, y, z, w) { return x * x + y * y + z * z + w * w; }
    /**
     * Return the distance between xy points given as numbers.
     * @param x0 x coordinate of point 0
     * @param y0 y coordinate of point 0
     * @param x1 x coordinate of point 1
     * @param y1 y coordinate of point 1
     */
    static distanceXYXY(x0, y0, x1, y1) {
        return Geometry.hypotenuseXY(x1 - x0, y1 - y0);
    }
    /**
     * Return the distance between xyz points given as numbers.
     * @param x0 x coordinate of point 0
     * @param y0 y coordinate of point 0
     * @param z0 z coordinate of point 0
     * @param x1 x coordinate of point 1
     * @param y1 y coordinate of point 1
     * @param z1 z coordinate of point 1
     */
    static distanceXYZXYZ(x0, y0, z0, x1, y1, z1) {
        return Geometry.hypotenuseXYZ(x1 - x0, y1 - y0, z1 - z0);
    }
    /** @returns Returns the triple product of 3 vectors provided as x,y,z number sequences.
     *
     * * The triple product is the determinant of the 3x3 matrix with the 9 numbers placed in either row or column order.
     * * The triple product is positive if the 3 vectors form a right handed coordinate system.
     * * The triple product is negative if the 3 vectors form a left handed coordinate system.
     * * Treating the 9 numbers as 3 vectors U, V, W, any of these formulas gives the same result:
     *
     * ** U dot (V cross W)
     * ** V dot (W cross U)
     * ** W dot (U cross V)
     * **  (-U dot (W cross V))  -- (note the negative -- reversing cross product order changes the sign)
     * ** (-V dot (U cross W)) -- (note the negative -- reversing cross product order changes the sign)
     * ** (-W dot (V cross U)) -- (note the negative -- reversing cross product order changes the sign)
     * * the triple product is 6 times the (signed) volume of the tetrahedron with the three vectors as edges from a common vertex.
     */
    static tripleProduct(ux, uy, uz, vx, vy, vz, wx, wy, wz) {
        return ux * (vy * wz - vz * wy)
            + uy * (vz * wx - vx * wz)
            + uz * (vx * wy - vy * wx);
    }
    /**  2D cross product of vectors layed out as scalars. */
    static crossProductXYXY(ux, uy, vx, vy) {
        return ux * vy - uy * vx;
    }
    /**  3D cross product of vectors layed out as scalars. */
    static crossProductXYZXYZ(ux, uy, uz, vx, vy, vz, result) {
        return PointVector_1.Vector3d.create(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx, result);
    }
    /**  3D dot product of vectors layed out as scalars. */
    static dotProductXYZXYZ(ux, uy, uz, vx, vy, vz) {
        return ux * vx + uy * vy + uz * vz;
    }
    static clampToStartEnd(x, a, b) {
        if (a > b)
            return Geometry.clampToStartEnd(x, b, a);
        if (x < a)
            return a;
        if (b < x)
            return b;
        return x;
    }
    /** simple interpolation between values, but choosing (based on fraction) a or b as starting point for maximum accuracy. */
    static interpolate(a, f, b) {
        return f <= 0.5 ? a + f * (b - a) : b - (1.0 - f) * (b - a);
    }
    /** given an axisOrder (e.g. XYZ, YZX, ZXY, XZYLeftHanded etc) and an (integer) offset, resolve to an axis index. */
    static axisOrderToAxis(order, index) {
        const axis = order <= 2 /* ZXY */ ? order + index : (order - 4 /* XZY */) - index;
        return Geometry.cyclic3dAxis(axis);
    }
    /** Return (a modulo period), e.g. for use as a cyclid index.  Both a and period may be negative. */
    static modulo(a, period) {
        if (period <= 0) {
            if (period === 0)
                return a;
            return -Geometry.modulo(-a, -period);
        }
        if (a >= 0) {
            if (a < period)
                return a;
            if (a < 2 * period)
                return a - period;
        }
        else {
            a += period; // hopefully move into primary period without division and floor
            if (a > 0)
                return a;
        }
        const m = Math.floor(a / period);
        return a - m * period;
    }
    /** return 0 if the value is undefined, 1 if defined. */
    static defined01(value) { return value === undefined ? 0 : 1; }
    /** normally, return numerator/denominator.
     * but if the ratio would exceed Geometry.largeFractionResult, return undefined.
     */
    static conditionalDivideFraction(numerator, denominator) {
        if (Math.abs(denominator) * Geometry.largeFractionResult > Math.abs(numerator))
            return numerator / denominator;
        return undefined;
    }
    /** return the 0, 1, or 2 pairs of (c,s) values that solve
     * {constCoff + cosCoff * c + sinCoff * s = }
     * with the constraint {c*c+s*s = 1}
     */
    static solveTrigForm(constCoff, cosCoff, sinCoff) {
        {
            const delta2 = cosCoff * cosCoff + sinCoff * sinCoff;
            const constCoff2 = constCoff * constCoff;
            // let nSolution = 0;
            let result;
            if (delta2 > 0.0) {
                const lambda = -constCoff / delta2;
                const a2 = constCoff2 / delta2;
                const D2 = 1.0 - a2;
                if (D2 >= 0.0) {
                    const mu = Math.sqrt(D2 / delta2);
                    /* c0,s0 = closest approach of line to origin */
                    const c0 = lambda * cosCoff;
                    const s0 = lambda * sinCoff;
                    // nSolution = 2;
                    result = [PointVector_1.Vector2d.create(c0 - mu * sinCoff, s0 + mu * cosCoff), PointVector_1.Vector2d.create(c0 + mu * sinCoff, s0 - mu * cosCoff)];
                }
            }
            return result;
        }
    }
    /** normally,  return the number result of conditionalDivideFraction.
     * but if conditionalDivideFraction fails return specified default number.
     */
    static safeDivideFraction(numerator, denominator, defaultResult) {
        const a = Geometry.conditionalDivideFraction(numerator, denominator);
        if (a !== undefined)
            return a;
        return defaultResult;
    }
    /** For a line f(x) whose function values at x0 and x1 are f0 and f1, return the x value at which f(x)=fTarget;
     */
    static inverseInterpolate(x0, f0, x1, f1, targetF = 0) {
        const g = Geometry.conditionalDivideFraction(targetF - f0, f1 - f0);
        if (g)
            return Geometry.interpolate(x0, g, x1);
        return undefined;
    }
    /** For a line f(x) whose function values at x=0 and x=1 are f0 and f1, return the x value at which f(x)=fTarget;
     */
    static inverseInterpolate01(f0, f1, targetF = 0) {
        return Geometry.conditionalDivideFraction(targetF - f0, f1 - f0);
    }
    /** Return true if json is an array with at least minEntries, and all entries are numbers (including those beyond minEntries) */
    static isNumberArray(json, minEntries = 0) {
        if (Array.isArray(json) && json.length >= minEntries) {
            let entry;
            for (entry of json) {
                //        if (!(entry as number) && entry !== 0.0)
                if (!Number.isFinite(entry))
                    return false;
            }
            return true;
        }
        return false;
    }
    /** Return true if json is an array of at least numNumberArrays, with at least minEntries in each number array.
     */
    static isArrayOfNumberArray(json, numNumberArray, minEntries = 0) {
        if (Array.isArray(json) && json.length >= numNumberArray) {
            let entry;
            for (entry of json)
                if (!Geometry.isNumberArray(entry, minEntries))
                    return false;
            return true;
        }
        return false;
    }
    /** return the number of steps to take so that numSteps * stepSize >= total.
     * minCount is returned for both (a) setSize 0 or less and (b) stepSize > total.
     * A small tolerance is applied for almost
    */
    static stepCount(stepSize, total, minCount = 1, maxCount = 101) {
        if (stepSize <= 0)
            return minCount;
        if (stepSize >= total)
            return minCount;
        const stepCount = Math.floor((total + 0.999999 * stepSize) / stepSize);
        if (stepCount < minCount)
            return minCount;
        if (stepCount > maxCount)
            return maxCount;
        return stepCount;
    }
    /** Test if x is in simple 0..1 interval.  But optionally skip the test.  (this odd behavior is very convenient for code that sometimes does not do the filtering.)
     * @param x value to test.
     * @param apply01 if false, accept all x.
     */
    static isIn01(x, apply01 = true) { return apply01 ? x >= 0.0 && x <= 1.0 : true; }
}
Geometry.smallMetricDistance = 1.0e-6;
Geometry.smallMetricDistanceSquared = 1.0e-12;
Geometry.smallAngleRadians = 1.0e-12;
Geometry.smallAngleRadiansSquared = 1.0e-24;
Geometry.largeFractionResult = 1.0e10;
Geometry.fullCircleRadiansMinusSmallAngle = 2.0 * Math.PI - 1.0e-12; // smallAngleRadians less than 360degrees
exports.Geometry = Geometry;
/**
 * Carries the numeric value of an angle.
 * * The numeric value is private, and callers should not know or care whether it is in degrees or radians.
 * * The various access method are named so that callers can specify whether untyped numbers passed in or out are degrees or radians.
 */
class Angle {
    constructor(radians = 0, degrees) { this._radians = radians; this._degrees = degrees; }
    clone() { return new Angle(this._radians, this._degrees); }
    /**
     * Return a new Angle object for angle given in degrees.
     * @param degrees angle in degrees
     */
    static createDegrees(degrees) { return new Angle(Angle.degreesToRadians(degrees), degrees); }
    /**
     * Return a (new) Angle object for a value given in radians.
     * @param radians angle in radians
     */
    static createRadians(radians) { return new Angle(radians); }
    /**
     * Set this angle to a value given in radians.
     * @param radians angle given in radians
     */
    setRadians(radians) { this._radians = radians; this._degrees = undefined; }
    /**
     * Set this angle to a value given in degrees.
     * @param degrees angle given in degrees.
     */
    setDegrees(degrees) { this._radians = Angle.degreesToRadians(degrees); this._degrees = degrees; }
    /** Create an angle for a full circle. */
    static create360() { return new Angle(Math.PI * 2.0, 360.0); }
    /**
     * @return a (strongly typed) Angle whose tangent is `numerator/denominator`, using the signs of both in determining the (otherwise ambiguous)
     * quadrant.
     * @param numerator numerator for tangent
     * @param denominator denominator for tangent
     */
    static createAtan2(numerator, denominator) { return new Angle(Math.atan2(numerator, denominator)); }
    /**
     * Copy all contents of `other` to this Angle.
     * @param other source data
     */
    setFrom(other) { this._radians = other._radians; this._degrees = other._degrees; }
    /**
     * Create an Angle from a JSON object
     * @param json object from JSON.parse. If a number, value is in *DEGREES*
     * @param defaultValRadians if json is undefined, default value in radians.
     * @return a new Angle
     */
    static fromJSON(json, defaultValRadians) {
        const val = new Angle();
        val.setFromJSON(json, defaultValRadians);
        return val;
    }
    /**
     * set an Angle from a JSON object
     * * A simple number is degrees.
     * * specified `json.degrees` or `json._degrees` is degree value.
     * * specified `son.radians` or `json._radians` is radians value.
     * @param json object from JSON.parse. If a number, value is in *DEGREES*
     * @param defaultValRadians if json is undefined, default value in radians.
     */
    setFromJSON(json, defaultValRadians) {
        this._radians = defaultValRadians ? defaultValRadians : 0;
        if (!json)
            return;
        if (typeof json === "number") {
            this.setDegrees(json);
        }
        else if (typeof json.degrees === "number") {
            this.setDegrees(json.degrees);
        }
        else if (typeof json._degrees === "number") {
            this.setDegrees(json._degrees);
        }
        else if (typeof json.radians === "number") {
            this.setRadians(json.radians);
        }
        else if (typeof json._radians === "number") {
            this.setRadians(json._radians);
        }
    }
    /** Convert an Angle to a JSON object as a number in degrees */
    toJSON() { return this.degrees; }
    toJSONRadians() { return { radians: this.radians }; }
    /** @returns Return the angle measured in radians. */
    get radians() { return this._radians; }
    /** @returns Return the angle measured in degrees. */
    get degrees() { return this._degrees !== undefined ? this._degrees : Angle.radiansToDegrees(this._radians); }
    /**
     * Convert an angle in degrees to radians.
     * @param degrees angle in degrees
     */
    static degreesToRadians(degrees) { return degrees * Math.PI / 180; }
    /**
     * Convert an angle in radians to degrees.
     * @param degrees angle in radians
     */
    static radiansToDegrees(radians) {
        if (radians < 0)
            return -Angle.radiansToDegrees(-radians);
        // Now radians is positive ...
        const pi = Math.PI;
        const factor = 180.0 / pi;
        if (radians <= 0.25 * pi)
            return factor * radians;
        if (radians < 0.75 * pi)
            return 90.0 + 180 * ((radians - 0.5 * pi) / pi);
        if (radians <= 1.25 * pi)
            return 180.0 + 180 * ((radians - pi) / pi);
        if (radians <= 1.75 * pi)
            return 270.0 + 180 * ((radians - 1.5 * pi) / pi);
        // all larger radians reference from 360 degrees (2PI)
        return 360.0 + 180 * ((radians - 2.0 * pi) / pi);
    }
    /**
     * @returns Return the cosine of this Angle object's angle.
     */
    cos() { return Math.cos(this._radians); }
    /**
     * @returns Return the sine of this Angle object's angle.
     */
    sin() { return Math.sin(this._radians); }
    /**
     * @returns Return the tangent of this Angle object's angle.
     */
    tan() { return Math.tan(this._radians); }
    static isFullCircleRadians(radians) { return Math.abs(radians) >= Geometry.fullCircleRadiansMinusSmallAngle; }
    isFullCircle() { return Angle.isFullCircleRadians(this._radians); }
    /** Adjust a radians value so it is positive in 0..360 */
    static adjustDegrees0To360(degrees) {
        if (degrees >= 0) {
            const period = 360.0;
            if (degrees < period)
                return degrees;
            const numPeriods = Math.floor(degrees / period);
            return degrees - numPeriods * period;
        }
        // negative angle ...
        const radians1 = Angle.adjustDegrees0To360(-degrees);
        return 360.0 - radians1;
    }
    /** Adjust a radians value so it is positive in -180..180 */
    static adjustDegreesSigned180(degrees) {
        if (Math.abs(degrees) <= 180.0)
            return degrees;
        if (degrees >= 0) {
            const period = 360.0;
            const numPeriods = 1 + Math.floor((degrees - 180.0) / period);
            return degrees - numPeriods * period;
        }
        // negative angle ...
        return -Angle.adjustDegreesSigned180(-degrees);
    }
    /** Adjust a radians value so it is positive in 0..2Pi */
    static adjustRadians0To2Pi(radians) {
        if (radians >= 0) {
            const period = Math.PI * 2.0;
            if (radians < period)
                return radians;
            const numPeriods = Math.floor(radians / period);
            return radians - numPeriods * period;
        }
        // negative angle ...
        const radians1 = Angle.adjustRadians0To2Pi(-radians);
        return Math.PI * 2.0 - radians1;
    }
    /** Adjust a radians value so it is positive in -PI..PI */
    static adjustRadiansMinusPiPlusPi(radians) {
        if (Math.abs(radians) <= Math.PI)
            return radians;
        if (radians >= 0) {
            const period = Math.PI * 2.0;
            const numPeriods = 1 + Math.floor((radians - Math.PI) / period);
            return radians - numPeriods * period;
        }
        // negative angle ...
        return -Angle.adjustRadiansMinusPiPlusPi(-radians);
    }
    static zero() { return new Angle(0); }
    isExactZero() { return this.radians === 0; }
    isAlmostZero() { return Math.abs(this.radians) < Geometry.smallAngleRadians; }
    /** Create an angle object with degrees adjusted into 0..360. */
    static createDegreesAdjustPositive(degrees) { return Angle.createDegrees(Angle.adjustDegrees0To360(degrees)); }
    /** Create an angle object with degrees adjusted into -180..180. */
    static createDegreesAdjustSigned180(degrees) { return Angle.createDegrees(Angle.adjustDegreesSigned180(degrees)); }
    /**
     * Test if two radians values are equivalent, allowing shift by full circle (i.e. by a multiple of `2*PI`)
     * @param radiansA first radians value
     * @param radiansB second radians value
     */
    static isAlmostEqualRadiansAllowPeriodShift(radiansA, radiansB) {
        // try to get simple conclusions with un-shifted radians ...
        const delta = Math.abs(radiansA - radiansB);
        if (delta <= Geometry.smallAngleRadians)
            return true;
        const period = Math.PI * 2.0;
        if (Math.abs(delta - period) <= Geometry.smallAngleRadians)
            return true;
        const numPeriod = Math.round(delta / period);
        const delta1 = delta - numPeriod * period;
        return Math.abs(delta1) <= Geometry.smallAngleRadians;
    }
    /**
     * Test if this angle and other are equivalent, allowing shift by full circle (i.e. by a multiple of 360 degrees)
     */
    isAlmostEqualAllowPeriodShift(other) {
        return Angle.isAlmostEqualRadiansAllowPeriodShift(this._radians, other._radians);
    }
    /**
     * Test if two this angle and other are almost equal, NOT allowing shift by full circle multiples of 360 degrees.
     */
    isAlmostEqualNoPeriodShift(other) { return Math.abs(this._radians - other._radians) < Geometry.smallAngleRadians; }
    /**
     * Test if two angle (in radians)  almost equal, NOT allowing shift by full circle multiples of `2 * PI`.
     */
    static isAlmostEqualRadiansNoPeriodShift(radiansA, radiansB) { return Math.abs(radiansA - radiansB) < Geometry.smallAngleRadians; }
    /**
     * Test if dot product values indicate non-zero length perpendicular vectors.
     * @param dotUU dot product of vectorU with itself
     * @param dotVV dot product of vectorV with itself
     * @param dotUV dot product of vectorU with vectorV
     */
    static isPerpendicularDotSet(dotUU, dotVV, dotUV) {
        return dotUU > Geometry.smallMetricDistanceSquared
            && dotVV > Geometry.smallMetricDistanceSquared
            && dotUV * dotUV <= Geometry.smallAngleRadiansSquared * dotUU * dotVV;
    }
    /**
     * Return cosine, sine, and radians for the half angle of a cosine,sine pair.
     * @param rCos2A cosine value (scaled by radius) for initial angle.
     * @param rSin2A sine value (scaled by radius) for final angle.
     */
    static trigValuesToHalfAngleTrigValues(rCos2A, rSin2A) {
        const r = Geometry.hypotenuseXY(rCos2A, rSin2A);
        if (r < Geometry.smallMetricDistance) {
            return { c: 1.0, s: 0.0, radians: 0.0 };
        }
        else {
            /* If the caller really gave you sine and cosine values, r should be 1.  However,*/
            /* to allow scaled values -- e.g. the x and y components of any vector -- we normalize*/
            /* right here.  This adds an extra sqrt and 2 divides to the whole process, but improves*/
            /* both the usefulness and robustness of the computation.*/
            let cosA = 1.0;
            let sinA = 0.0;
            const cos2A = rCos2A / r;
            const sin2A = rSin2A / r;
            if (cos2A >= 0.0) {
                /* Original angle in NE and SE quadrants.  Half angle in same quadrant */
                cosA = Math.sqrt(0.5 * (1.0 + cos2A));
                sinA = sin2A / (2.0 * (cosA));
            }
            else {
                if (sin2A > 0.0) {
                    /* Original angle in NW quadrant. Half angle in NE quadrant */
                    sinA = Math.sqrt(0.5 * (1.0 - cos2A));
                }
                else {
                    /* Original angle in SW quadrant. Half angle in SE quadrant*/
                    /* cosA comes out positive because both sines are negative. */
                    sinA = -Math.sqrt(0.5 * (1.0 - cos2A));
                }
                cosA = sin2A / (2.0 * (sinA));
            }
            return { c: cosA, s: sinA, radians: Math.atan2(sinA, cosA) };
        }
    }
    /**
       * Return the half angle of angle between vectors U, V with given vector dots.
       * @param dotUU dot product of vectorU with itself
       * @param dotVV dot product of vectorV with itself
       * @param dotUV dot product of vectorU with vectorV
       */
    static dotProductsToHalfAngleTrigValues(dotUU, dotVV, dotUV, favorZero = true) {
        const rcos = dotUU - dotVV;
        const rsin = 2.0 * dotUV;
        if (favorZero && Math.abs(rsin) < Geometry.smallAngleRadians * (Math.abs(dotUU) + Math.abs(dotVV)))
            return { c: 1.0, s: 0.0, radians: 0.0 };
        return Angle.trigValuesToHalfAngleTrigValues(rcos, rsin);
    }
}
Angle.piOver4Radians = 7.85398163397448280000e-001;
Angle.piOver2Radians = 1.57079632679489660000e+000;
Angle.piRadians = 3.14159265358979310000e+000;
Angle.pi2Radians = 6.28318530717958620000e+000;
Angle.degreesPerRadian = (45.0 / Angle.piOver4Radians);
Angle.radiansPerDegree = (Angle.piOver4Radians / 45.0);
Angle.piOver12Radians = 0.26179938779914943653855361527329;
exports.Angle = Angle;
/**
 * An AngleSweep is a pair of angles at start and end of an interval.
 *
 * *  For stroking purposes, the "included interval" is all angles numerically reached by theta = start + f*(end-start), where f is between 0 and 1.
 * *  This stroking formula is simple numbers -- 2PI shifts are not involved.
 * *  2PI shifts do become important in the reverse mapping of an angle to a fraction.
 * *  If (start < end) the angle proceeds CCW around the unit circle.
 * *  If (end < start) the angle proceeds CW around the unit circle.
 * *  Angles beyond 360 are fine as endpoints.
 *
 * **  (350,370) covers the same unit angles as (-10,10).
 * **  (370,350) covers the same unit angles as (10,-10).
 */
class AngleSweep {
    /** Read-property for degrees at the start of this AngleSweep. */
    get startDegrees() { return Angle.radiansToDegrees(this._radians0); }
    /** Read-property for degrees at the end of this AngleSweep. */
    get endDegrees() { return Angle.radiansToDegrees(this._radians1); }
    /** Read-property for signed start-to-end sweep in degrees. */
    get sweepDegrees() { return Angle.radiansToDegrees(this._radians1 - this._radians0); }
    /** Read-property for degrees at the start of this AngleSweep. */
    get startRadians() { return this._radians0; }
    /** Read-property for degrees at the end of this AngleSweep. */
    get endRadians() { return this._radians1; }
    /** Read-property for signed start-to-end sweep in radians. */
    get sweepRadians() { return this._radians1 - this._radians0; }
    /** Return the (strongly typed) start angle */
    get startAngle() { return Angle.createRadians(this._radians0); }
    /** Return the (strongly typed) end angle */
    get endAngle() { return Angle.createRadians(this._radians1); }
    /** (private) constructor with start and end angles in radians.
     *  * Use explicitly named static methods to clarify intent and units of inputs:
     *
     * * createStartEndRadians (startRadians:number, endRadians:number)
     * * createStartEndDegrees (startDegrees:number, endDegrees:number)
     * * createStartEnd (startAngle:Angle, endAngle:Angle)
     * * createStartSweepRadians (startRadians:number, sweepRadians:number)
     * * createStartSweepDegrees (startDegrees:number, sweepDegrees:number)
     * * createStartSweep (startAngle:Angle, sweepAngle:Angle)
    */
    constructor(startRadians = 0, endRadians = 0) { this._radians0 = startRadians; this._radians1 = endRadians; }
    /** create an AngleSweep from start and end angles given in radians. */
    static createStartEndRadians(startRadians = 0, endRadians = 2.0 * Math.PI, result) {
        result = result ? result : new AngleSweep();
        result.setStartEndRadians(startRadians, endRadians);
        return result;
    }
    /** Return the angle obtained by subtracting radians from this angle. */
    cloneMinusRadians(radians) { return new AngleSweep(this._radians0 - radians, this._radians1 - radians); }
    /** create an AngleSweep from start and end angles given in degrees. */
    static createStartEndDegrees(startDegrees = 0, endDegrees = 360, result) {
        return AngleSweep.createStartEndRadians(Angle.degreesToRadians(startDegrees), Angle.degreesToRadians(endDegrees), result);
    }
    /** create an angle sweep from strongly typed start and end angles */
    static createStartEnd(startAngle, endAngle, result) {
        result = result ? result : new AngleSweep();
        result.setStartEndRadians(startAngle.radians, endAngle.radians);
        return result;
    }
    /** Create an angle sweep with limits given as (strongly typed) angles for start and sweep */
    static createStartSweep(startAngle, sweepAngle, result) {
        return AngleSweep.createStartSweepRadians(startAngle.radians, sweepAngle.radians, result);
    }
    /** @returns Return a sweep with limits interpolated between this and other. */
    interpolate(fraction, other) {
        return new AngleSweep(Geometry.interpolate(this._radians0, fraction, other._radians0), Geometry.interpolate(this._radians1, fraction, other._radians1));
    }
    /** create an AngleSweep from start and end angles given in radians. */
    static createStartSweepRadians(startRadians = 0, sweepRadians = Math.PI, result) {
        result = result ? result : new AngleSweep();
        result.setStartEndRadians(startRadians, startRadians + sweepRadians);
        return result;
    }
    /** create an AngleSweep from start and sweep given in degrees.  */
    static createStartSweepDegrees(startDegrees = 0, sweepDegrees = 360, result) {
        return AngleSweep.createStartEndRadians(Angle.degreesToRadians(startDegrees), Angle.degreesToRadians(startDegrees + sweepDegrees), result);
    }
    /** directly set the start and end angles in radians */
    setStartEndRadians(startRadians = 0, endRadians = 2.0 * Math.PI) {
        const delta = endRadians - startRadians;
        if (Angle.isFullCircleRadians(delta)) {
            endRadians = startRadians + (delta > 0 ? 2.0 : -2.0) * Math.PI;
        }
        this._radians0 = startRadians;
        this._radians1 = endRadians;
    }
    /** directly set the start and end angles in degrees */
    setStartEndDegrees(startDegrees = 0, endDegrees = 360.0) {
        this.setStartEndRadians(Angle.degreesToRadians(startDegrees), Angle.degreesToRadians(endDegrees));
    }
    /** copy from other AngleSweep. */
    setFrom(other) { this._radians0 = other._radians0; this._radians1 = other._radians1; }
    /** create a full circle sweep (CCW). startRadians defaults to 0 */
    static create360(startRadians) {
        startRadians = startRadians ? startRadians : 0.0;
        return new AngleSweep(startRadians, startRadians + 2.0 * Math.PI);
    }
    /** create a sweep from the south pole to the north pole. */
    static createFullLatitude() { return AngleSweep.createStartEndRadians(-0.5 * Math.PI, 0.5 * Math.PI); }
    /** Reverse the start and end angle in place. */
    reverseInPlace() { const a = this._radians0; this._radians0 = this._radians1; this._radians1 = a; }
    /** Restrict start and end angles into the range (-90,+90) in degrees. */
    capLatitudeInPlace() {
        const limit = 0.5 * Math.PI;
        this._radians0 = Geometry.clampToStartEnd(this._radians0, -limit, limit);
        this._radians1 = Geometry.clampToStartEnd(this._radians1, -limit, limit);
    }
    /** Ask if the sweep is counterclockwise, i.e. positive sweep */
    isCCW() { return this._radians1 >= this._radians0; }
    /** Ask if the sweep is a full circle. */
    isFullCircle() { return Angle.isFullCircleRadians(this.sweepRadians); }
    /** Ask if the sweep is a full sweep from south pole to north pole. */
    isFullLatitudeSweep() {
        const a = Math.PI * 0.5;
        return Angle.isAlmostEqualRadiansNoPeriodShift(this._radians0, -a)
            && Angle.isAlmostEqualRadiansNoPeriodShift(this._radians1, a);
    }
    /** return a clone of this sweep. */
    clone() { return new AngleSweep(this._radians0, this._radians1); }
    /** Convert fractional position in the sweep to radians. */
    fractionToRadians(fraction) {
        return fraction < 0.5 ?
            this._radians0 + fraction * (this._radians1 - this._radians0)
            : this._radians1 + (fraction - 1.0) * (this._radians1 - this._radians0);
    }
    /** Convert fractional position in the sweep to strongly typed Angle object. */
    fractionToAngle(fraction) {
        return Angle.createRadians(this.fractionToRadians(fraction));
    }
    /** return 2PI divided by the sweep radians (i.e. 360 degrees divided by sweep angle).
     * This is the number of fractional intervals required to cover a whole circle.
     */
    fractionPeriod() {
        return Geometry.safeDivideFraction(Math.PI * 2.0, Math.abs(this._radians1 - this._radians0), 1.0);
    }
    /** return the fractional ized position of the angle,
     * computed without consideration of 2PI period.
     * That is, an angle that is numerically much beyond than the end angle
     * will produce a large fraction and an angle much beyond the start angle
     * will produce a large negative fraction.
     *
     */
    angleToUnboundedFraction(theta) {
        return Geometry.safeDivideFraction(theta.radians - this._radians0, this._radians1 - this._radians0, 1.0);
    }
    /** map an angle to a fractional coordinate which is:
    *
    * *  the start angle is at fraction 0
    * *  the end angle is at fraction 1
    * *  interior angles are between 0 and 1
    * *  all exterior angles are at fractions greater than 1
    * *  the periodic jump is at full wraparound to the start angle
     */
    angleToPositivePeriodicFraction(theta) { return this.radiansToPositivePeriodicFraction(theta.radians); }
    /**
     * Convert each value in an array from radians to fraction.
     * @param data array that is input as radians, output as fractions
     */
    radiansArraytoPositivePeriodicFractions(data) {
        const n = data.length;
        for (let i = 0; i < n; i++) {
            data.reassign(i, this.radiansToPositivePeriodicFraction(data.at(i)));
        }
    }
    radiansToPositivePeriodicFraction(radians) {
        if (Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._radians0))
            return 0.0;
        if (Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._radians1))
            return 1.0;
        const sweep = this._radians1 - this._radians0;
        const delta = radians - this._radians0;
        if (sweep > 0) {
            const delta1 = Angle.adjustRadians0To2Pi(delta);
            const fraction1 = Geometry.safeDivideFraction(delta1, sweep, 0.0);
            return fraction1;
        }
        const delta2 = Angle.adjustRadians0To2Pi(-delta);
        const fraction2 = Geometry.safeDivideFraction(delta2, -sweep, 0.0);
        return fraction2;
    }
    /** map an angle to a fractional coordinate which is:
    *
    * *  the start angle is at fraction 0
    * *  the end angle is at fraction 1
    * *  interior angles are between 0 and 1
    * *  small negative for angles just "before" the start angle
    * *  more than one for angles just "after" the end angle
    * *  the periodic jump is at the middle of the "outside" interval
    */
    angleToSignedPeriodicFraction(theta) {
        return this.radiansToSignedPeriodicFraction(theta.radians);
    }
    radiansToSignedPeriodicFraction(radians) {
        if (Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._radians0))
            return 0.0;
        if (Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._radians1))
            return 1.0;
        const sweep = this._radians1 - this._radians0;
        // measure from middle of interval ...
        const delta = radians - this._radians0 - 0.5 * sweep;
        if (sweep > 0) {
            const delta1 = Angle.adjustRadiansMinusPiPlusPi(delta);
            const fraction1 = 0.5 + Geometry.safeDivideFraction(delta1, sweep, 0.0);
            return fraction1;
        }
        const delta2 = Angle.adjustRadiansMinusPiPlusPi(-delta);
        const fraction = 0.5 + Geometry.safeDivideFraction(delta2, -sweep, 0.0);
        return fraction;
    }
    /** test if an angle is within the sweep */
    isAngleInSweep(angle) { return this.isRadiansInSweep(angle.radians); }
    /** test if radians are within sweep  */
    isRadiansInSweep(radians) {
        // quick out for simple inside ...
        const delta0 = radians - this._radians0;
        const delta1 = radians - this._radians1;
        if (delta0 * delta1 <= 0.0)
            return true;
        return this.radiansToPositivePeriodicFraction(radians) <= 1.0;
    }
    /** set this AngleSweep from various sources:
     *
     * * if json is undefined, a full-circle sweep is returned.
     * * If json is an AngleSweep object it is is cloned
     * * If json is an array of 2 numbers, those numbers are start and end angles in degrees.
     * * If `json.degrees` is an array of 2 numbers, those numbers are start and end angles in degrees.
     * * If `json.radians` is an array of 2 numbers, those numbers are start and end angles in radians.
     */
    setFromJSON(json) {
        if (!json)
            this.setStartEndRadians(); // default full circle
        else if (json instanceof AngleSweep)
            this.setFrom(json);
        else if (Geometry.isNumberArray(json.degrees, 2))
            this.setStartEndDegrees(json.degrees[0], json.degrees[1]);
        else if (Geometry.isNumberArray(json.radians, 2))
            this.setStartEndRadians(json.radians[0], json.radians[1]);
        else if (Geometry.isNumberArray(json, 2))
            this.setStartEndDegrees(json[0], json[1]);
    }
    /** create an AngleSweep from a json object. */
    static fromJSON(json) {
        const result = AngleSweep.create360();
        result.setFromJSON(json);
        return result;
    }
    /**
     * Convert an AngleSweep to a JSON object.
     * @return {*} {degrees: [startAngleInDegrees, endAngleInDegrees}
     */
    toJSON() {
        // return { degrees: [this.startDegrees, this.endDegrees] };
        return [this.startDegrees, this.endDegrees];
    }
    /** test if start and end angles match, with no test for 360-degree shifts. */
    isAlmostEqualAllowPeriodShift(other) {
        return Angle.isAlmostEqualRadiansAllowPeriodShift(this._radians0, other._radians0)
            && Angle.isAlmostEqualRadiansNoPeriodShift(this._radians1 - this._radians0, other._radians1 - other._radians0);
    }
    /** test if start and end angles match, allowing for 360-degree shifts. */
    isAlmostEqualNoPeriodShift(other) {
        return Angle.isAlmostEqualRadiansNoPeriodShift(this._radians0, other._radians0)
            && Angle.isAlmostEqualRadiansNoPeriodShift(this._radians1 - this._radians0, other._radians1 - other._radians0);
    }
}
exports.AngleSweep = AngleSweep;
//# sourceMappingURL=Geometry.js.map