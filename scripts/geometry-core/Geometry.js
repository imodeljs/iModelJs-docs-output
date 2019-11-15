"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty*/
const Point2dVector2d_1 = require("./geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("./geometry3d/Point3dVector3d");
/** Enumeration of the 6 possible orderings of XYZ axis order
 * @public
 */
var AxisOrder;
(function (AxisOrder) {
    /** Right handed system, X then Y then Z */
    AxisOrder[AxisOrder["XYZ"] = 0] = "XYZ";
    /** Right handed system, Y then Z then X */
    AxisOrder[AxisOrder["YZX"] = 1] = "YZX";
    /** Right handed system, Z then X then Y */
    AxisOrder[AxisOrder["ZXY"] = 2] = "ZXY";
    /** Left handed system, X then Z then Y */
    AxisOrder[AxisOrder["XZY"] = 4] = "XZY";
    /** Left handed system, Y then X then Z */
    AxisOrder[AxisOrder["YXZ"] = 5] = "YXZ";
    /** Left handed system, Z then Y then X */
    AxisOrder[AxisOrder["ZYX"] = 6] = "ZYX";
})(AxisOrder = exports.AxisOrder || (exports.AxisOrder = {}));
/** Enumeration of numeric indices of 3 axes AxisIndex.X, AxisIndex.Y, AxisIndex.Z
 * @public
 */
var AxisIndex;
(function (AxisIndex) {
    /** x axis is index 0 */
    AxisIndex[AxisIndex["X"] = 0] = "X";
    /** y axis is index 1 */
    AxisIndex[AxisIndex["Y"] = 1] = "Y";
    /** 2 axis is index 2 */
    AxisIndex[AxisIndex["Z"] = 2] = "Z";
})(AxisIndex = exports.AxisIndex || (exports.AxisIndex = {}));
/** Standard views.   Used in `Matrix3d.createStandardViewAxes (index: StandardViewIndex, worldToView :boolean)`
 * @public
 */
var StandardViewIndex;
(function (StandardViewIndex) {
    /** X to right, Y up */
    StandardViewIndex[StandardViewIndex["Top"] = 1] = "Top";
    /** X to right, negative Y up */
    StandardViewIndex[StandardViewIndex["Bottom"] = 2] = "Bottom";
    /** negative Y to right, Z up */
    StandardViewIndex[StandardViewIndex["Left"] = 3] = "Left";
    /**  Y to right, Z up */
    StandardViewIndex[StandardViewIndex["Right"] = 4] = "Right";
    /** X to right, Z up */
    StandardViewIndex[StandardViewIndex["Front"] = 5] = "Front";
    /** negative X to right, Z up */
    StandardViewIndex[StandardViewIndex["Back"] = 6] = "Back";
    /** View towards origin from (-1,-1,1) */
    StandardViewIndex[StandardViewIndex["Iso"] = 7] = "Iso";
    /** View towards origin from (1,-1,1) */
    StandardViewIndex[StandardViewIndex["RightIso"] = 8] = "RightIso";
})(StandardViewIndex = exports.StandardViewIndex || (exports.StandardViewIndex = {}));
/** Enumeration among choice for how a coordinate transformation should incorporate scaling.
 * @public
 */
var AxisScaleSelect;
(function (AxisScaleSelect) {
    /** All axes of unit length. */
    AxisScaleSelect[AxisScaleSelect["Unit"] = 0] = "Unit";
    /** On each axis, the vector length matches the longest side of the range of the data. */
    AxisScaleSelect[AxisScaleSelect["LongestRangeDirection"] = 1] = "LongestRangeDirection";
    /** On each axis, the vector length matches he length of the corresponding edge of the range. */
    AxisScaleSelect[AxisScaleSelect["NonUniformRangeContainment"] = 2] = "NonUniformRangeContainment";
})(AxisScaleSelect = exports.AxisScaleSelect || (exports.AxisScaleSelect = {}));
/**
 * Class containing static methods for typical numeric operations.
 * * Experimentally, methods like Geometry.hypotenuse are observed to be faster than the system intrinsics.
 * * This is probably due to
 *    * Fixed length arg lists
 *    * strongly typed parameters
 * @public
 */
class Geometry {
    /** Test if absolute value of x is huge.
     * * See `Geometry.hugeCoordinate`
     */
    static isHugeCoordinate(x) {
        return x > this.hugeCoordinate || x < -this.hugeCoordinate;
    }
    /** Test if a number is odd.
     */
    static isOdd(x) {
        return (x & (0x01)) === 1;
    }
    /** Correct `distance` to zero if smaller than metric tolerance.   Otherwise return it unchanged. */
    static correctSmallMetricDistance(distance, replacement = 0.0) {
        if (Math.abs(distance) < Geometry.smallMetricDistance) {
            return replacement;
        }
        return distance;
    }
    /**
   * If `a` is large enough for safe division, return `1/a`, using Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
   * @param a denominator of division
   */
    static inverseMetricDistance(a) { return (Math.abs(a) <= Geometry.smallMetricDistance) ? undefined : 1.0 / a; }
    /**
     * If `a` is large enough, return `1/a`, using the square of Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
     * @param a denominator of division
     */
    static inverseMetricDistanceSquared(a) {
        return (Math.abs(a) <= Geometry.smallMetricDistanceSquared) ? undefined : 1.0 / a;
    }
    /** Boolean test for metric coordinate near-equality */
    static isSameCoordinate(x, y, tol) {
        if (tol)
            return Math.abs(x - y) < Math.abs(tol);
        return Math.abs(x - y) < Geometry.smallMetricDistance;
    }
    /** Boolean test for metric coordinate near-equality, with toleranceFactor applied to the usual smallMetricDistance */
    static isSameCoordinateWithToleranceFactor(x, y, toleranceFactor) {
        return Geometry.isSameCoordinate(x, y, toleranceFactor * Geometry.smallMetricDistance);
    }
    /** Boolean test for metric coordinate near-equality of x, y pair */
    static isSameCoordinateXY(x0, y0, x1, y1, tol = Geometry.smallMetricDistance) {
        let d = x1 - x0;
        if (d < 0)
            d = -d;
        if (d > tol)
            return false;
        d = y1 - y0;
        if (d < 0)
            d = -d;
        return d < tol;
    }
    /** Boolean test for squared metric coordinate near-equality */
    static isSameCoordinateSquared(x, y) {
        return Math.abs(Math.sqrt(x) - Math.sqrt(y)) < Geometry.smallMetricDistance;
    }
    /** boolean test for small `dataA.distance (dataB)`  within `smallMetricDistance` */
    static isSamePoint3d(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    /** boolean test for distance between `XYZ` objects within `smallMetricDistance`
     *  * Note that Point3d and Vector3d are both derived from XYZ, so this method tolerates mixed types.
     */
    static isSameXYZ(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    /** boolean test for small `dataA.distanceXY (dataB)`  within `smallMetricDistance` */
    static isSamePoint3dXY(dataA, dataB) { return dataA.distanceXY(dataB) < Geometry.smallMetricDistance; }
    /** boolean test for small `dataA.distanceXY (dataB)`  within `smallMetricDistance` */
    static isSameVector3d(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    /** boolean test for small `dataA.distanceXY (dataB)`  within `smallMetricDistance` */
    static isSamePoint2d(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    /** boolean test for small `dataA.distanceXY (dataB)`  within `smallMetricDistance` */
    static isSameVector2d(dataA, dataB) { return dataA.distance(dataB) < Geometry.smallMetricDistance; }
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with x as first test, y second.
     * * This is appropriate for a horizontal sweep in the plane.
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
     * * This is appropriate for a vertical sweep in the plane.
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
    /**
     * Lexical test, based on x first, y second, z third.
     */
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
    /** Test if `value` is small compared to `smallAngleRadians`.
     * * This is appropriate if `value` is know to be a typical 0..1 fraction.
     */
    static isSmallRelative(value) { return Math.abs(value) < Geometry.smallAngleRadians; }
    /** Test if `value` is small compared to `smallAngleRadians` */
    static isSmallAngleRadians(value) { return Math.abs(value) < Geometry.smallAngleRadians; }
    /** Toleranced equality test, using tolerance `smallAngleRadians * ( 1 + abs(a) + (abs(b)))`
     * * Effectively an absolute tolerance of `smallAngleRadians`, with tolerance increasing for larger values of a and b.
    */
    static isAlmostEqualNumber(a, b) {
        const sumAbs = 1.0 + Math.abs(a) + Math.abs(b);
        return Math.abs(a - b) <= Geometry.smallAngleRadians * sumAbs;
    }
    /** Toleranced equality test, using caller-supplied tolerance. */
    static isDistanceWithinTol(distance, tol) {
        return Math.abs(distance) <= Math.abs(tol);
    }
    /** Toleranced equality test, using `smallMetricDistance` tolerance. */
    static isSmallMetricDistance(distance) {
        return Math.abs(distance) <= Geometry.smallMetricDistance;
    }
    /** Toleranced equality, using `smallMetricDistanceSquared` tolerance. */
    static isSmallMetricDistanceSquared(distanceSquared) {
        return Math.abs(distanceSquared) <= Geometry.smallMetricDistanceSquared;
    }
    /** Return `axis modulo 3` with proper handling of negative indices (-1 is z), -2 is y, -3 is x etc) */
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
            return AxisOrder.XYZ;
        if (axisIndex === 1)
            return AxisOrder.YZX;
        if (axisIndex === 2)
            return AxisOrder.ZXY;
        return Geometry.axisIndexToRightHandedAxisOrder(Geometry.cyclic3dAxis(axisIndex));
    }
    /** Return the largest absolute distance from a to either of b0 or b1 */
    static maxAbsDiff(a, b0, b1) { return Math.max(Math.abs(a - b0), Math.abs(a - b1)); }
    /** Return the largest absolute absolute value among x,y,z */
    static maxAbsXYZ(x, y, z) {
        return Geometry.maxXYZ(Math.abs(x), Math.abs(y), Math.abs(z));
    }
    /** Return the largest absolute absolute value among x,y */
    static maxAbsXY(x, y) {
        return Geometry.maxXY(Math.abs(x), Math.abs(y));
    }
    /** Return the largest signed value among a, b, c */
    static maxXYZ(a, b, c) {
        let q = a;
        if (b > q)
            q = b;
        if (c > q)
            q = c;
        return q;
    }
    /** Examine the value (particularly sign) of x.
     * * If x is negative, return outNegative.
     * * If x is true zero, return outZero
     * * If x is positive, return outPositive
     */
    static split3WaySign(x, outNegative, outZero, outPositive) {
        if (x < 0)
            return outNegative;
        if (x > 0.0)
            return outPositive;
        return outZero;
    }
    /** Return the largest signed value among a, b */
    static maxXY(a, b) {
        let q = a;
        if (b > q)
            q = b;
        return q;
    }
    /** Return the smallest signed value among a, b */
    static minXY(a, b) {
        let q = a;
        if (b < q)
            q = b;
        return q;
    }
    /** Return the hypotenuse `sqrt(x*x + y*y)`. This is much faster than `Math.hypot(x,y)`. */
    static hypotenuseXY(x, y) { return Math.sqrt(x * x + y * y); }
    /** Return the squared `hypotenuse (x*x + y*y)`. */
    static hypotenuseSquaredXY(x, y) { return x * x + y * y; }
    /** Return the square of x */
    static square(x) { return x * x; }
    /** Return the hypotenuse `sqrt(x*x + y*y + z*z)`. This is much faster than `Math.hypot(x,y,z)`. */
    static hypotenuseXYZ(x, y, z) { return Math.sqrt(x * x + y * y + z * z); }
    /** Return the squared hypotenuse `(x*x + y*y + z*z)`. This is much faster than `Math.hypot(x,y,z)`. */
    static hypotenuseSquaredXYZ(x, y, z) { return x * x + y * y + z * z; }
    /** Return the (full 4d) hypotenuse `sqrt(x*x + y*y + z*z + w*w)`. This is much faster than `Math.hypot(x,y,z,w)`. */
    static hypotenuseXYZW(x, y, z, w) { return Math.sqrt(x * x + y * y + z * z + w * w); }
    /** Return the squared hypotenuse `(x*x + y*y + z*z+w*w)`. This is much faster than `Math.hypot(x,y,z)`. */
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
    /** Returns Returns the triple product of 3 vectors provided as x,y,z number sequences.
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
    /** Returns the determinant of the 4x4 matrix unrolled as the 16 parameters.
     */
    static determinant4x4(xx, xy, xz, xw, yx, yy, yz, yw, zx, zy, zz, zw, wx, wy, wz, ww) {
        return xx * this.tripleProduct(yy, yz, yw, zy, zz, zw, wy, wz, ww)
            - yx * this.tripleProduct(xy, xz, xw, zy, zz, zw, wy, wz, ww)
            + zx * this.tripleProduct(xy, xz, xw, yy, yz, yw, wy, wz, ww)
            - wx * this.tripleProduct(xy, xz, xw, yy, yz, yw, zy, zz, zw);
    }
    /**
   * Returns curvature magnitude from a first and second derivative vector.
   * @param ux  first derivative x component
   * @param uy first derivative y component
   * @param uz first derivative z component
   * @param vx second derivative x component
   * @param vy second derivative y component
   * @param vz second derivative z component
   */
    static curvatureMagnitude(ux, uy, uz, vx, vy, vz) {
        let q = uy * vz - uz * vy;
        let sum = q * q;
        q = uz * vx - ux * vz;
        sum += q * q;
        q = ux * vy - uy * vx;
        sum += q * q;
        const a = Math.sqrt(ux * ux + uy * uy + uz * uz);
        const b = Math.sqrt(sum);
        // (sum and a are both nonnegative)
        const aaa = a * a * a;
        // radius of curvature = aaa / b;
        // curvature = b/aaa
        const tol = Geometry.smallAngleRadians;
        if (aaa > tol * b)
            return b / aaa;
        return 0; // hm.. maybe should be infinite?
    }
    /** Returns the determinant of 3x3 matrix with x and y rows taken from 3 points, third row from corresponding numbers.
     *
     */
    static tripleProductXYW(columnA, weightA, columnB, weightB, columnC, weightC) {
        return Geometry.tripleProduct(columnA.x, columnB.x, columnC.x, columnA.y, columnB.y, columnC.y, weightA, weightB, weightC);
    }
    /** Returns the determinant of 3x3 matrix with x and y rows taken from 3 points, third row from corresponding numbers.
     *
     */
    static tripleProductPoint4dXYW(columnA, columnB, columnC) {
        return Geometry.tripleProduct(columnA.x, columnB.x, columnC.x, columnA.y, columnB.y, columnC.y, columnA.w, columnB.w, columnC.w);
    }
    /** 2D cross product of vectors layed out as scalars. */
    static crossProductXYXY(ux, uy, vx, vy) {
        return ux * vy - uy * vx;
    }
    /** 3D cross product of vectors layed out as scalars. */
    static crossProductXYZXYZ(ux, uy, uz, vx, vy, vz, result) {
        return Point3dVector3d_1.Vector3d.create(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx, result);
    }
    /** magnitude of 3D cross product of vectors, with the vectors presented as */
    static crossProductMagnitude(ux, uy, uz, vx, vy, vz) {
        return Geometry.hypotenuseXYZ(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
    }
    /** 3D dot product of vectors layed out as scalars. */
    static dotProductXYZXYZ(ux, uy, uz, vx, vy, vz) {
        return ux * vx + uy * vy + uz * vz;
    }
    /** 2D dot product of vectors layed out as scalars. */
    static dotProductXYXY(ux, uy, vx, vy) {
        return ux * vx + uy * vy;
    }
    /**
     * Clamp to (min(a,b), max(a,b))
     * @param x
     * @param a
     * @param b
     */
    static clampToStartEnd(x, a, b) {
        if (a > b)
            return Geometry.clampToStartEnd(x, b, a);
        if (x < a)
            return a;
        if (b < x)
            return b;
        return x;
    }
    /**
     * Clamp value to (min,max) with no test for order of (min,max)
     * @param value value to clamp
     * @param min smallest allowed output
     * @param max largest allowed result.
     */
    static clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
    /** If given a number, return it.   If given undefined, return `defaultValue`. */
    static resolveNumber(value, defaultValue = 0) {
        return value !== undefined ? value : defaultValue;
    }
    /** simple interpolation between values, but choosing (based on fraction) a or b as starting point for maximum accuracy. */
    static interpolate(a, f, b) {
        return f <= 0.5 ? a + f * (b - a) : b - (1.0 - f) * (b - a);
    }
    /** given an axisOrder (e.g. XYZ, YZX, ZXY, XZYLeftHanded etc) and an (integer) offset, resolve to an axis index. */
    static axisOrderToAxis(order, index) {
        const axis = order <= AxisOrder.ZXY ? order + index : (order - AxisOrder.XZY) - index;
        return Geometry.cyclic3dAxis(axis);
    }
    /** Return (a modulo period), e.g. for use as a cyclic index.  Both a and period may be negative. */
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
    /** normally, return numerator/denominator.
     * but if the ratio would exceed Geometry.largestResult, return undefined.
     */
    static conditionalDivideCoordinate(numerator, denominator, largestResult = Geometry.largeCoordinateResult) {
        if (Math.abs(denominator * largestResult) > Math.abs(numerator))
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
                    result = [Point2dVector2d_1.Vector2d.create(c0 - mu * sinCoff, s0 + mu * cosCoff), Point2dVector2d_1.Vector2d.create(c0 + mu * sinCoff, s0 - mu * cosCoff)];
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
    static inverseInterpolate(x0, f0, x1, f1, targetF = 0, defaultResult) {
        const g = Geometry.conditionalDivideFraction(targetF - f0, f1 - f0);
        if (g)
            return Geometry.interpolate(x0, g, x1);
        return defaultResult;
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
    /** Test if x is in simple 0..1 interval.  But optionally skip the test.  (this odd behavior is very convenient for code that sometimes does not do the filtering.)
     * @param x value to test.
     * @param apply01 if false, accept all x.
     */
    static isIn01WithTolerance(x, tolerance) { return x + tolerance >= 0.0 && x - tolerance <= 1.0; }
    /**
     * restrict x so it is in the interval `[a,b]`, allowing a,b to be in either order.
     * @param x
     * @param a (usually the lower) interval limit
     * @param b (usually the upper) interval limit
     */
    static restrictToInterval(x, a, b) {
        if (a <= b) {
            if (x < a)
                return a;
            if (x > b)
                return b;
            return x;
        }
        // reversed interval ....
        if (x < b)
            return b;
        if (x > a)
            return a;
        return x;
    }
}
exports.Geometry = Geometry;
/** Tolerance for small distances in metric coordinates */
Geometry.smallMetricDistance = 1.0e-6;
/** Square of `smallMetricTolerance` */
Geometry.smallMetricDistanceSquared = 1.0e-12;
/** tolerance for small angle measured in radians. */
Geometry.smallAngleRadians = 1.0e-12;
/** square of `smallAngleRadians` */
Geometry.smallAngleRadiansSquared = 1.0e-24;
/** numeric value that may considered huge for numbers expected to be 0..1 fractions.
 * * But note that the "allowed" result value is vastly larger than 1.
 */
Geometry.largeFractionResult = 1.0e10;
/** numeric value that may considered huge for numbers expected to be coordinates.
 * * This allows larger results than `largeFractionResult`.
 */
Geometry.largeCoordinateResult = 1.0e13;
/** numeric value that may considered infinite for metric coordinates.
 * * This coordinate should be used only as a placeholder indicating "at infinity" -- computing actual points at this coordinate invites numerical problems.
 */
Geometry.hugeCoordinate = 1.0e12;
/** Radians value for full circle 2PI radians minus `smallAngleRadians` */
Geometry.fullCircleRadiansMinusSmallAngle = 2.0 * Math.PI - 1.0e-12; // smallAngleRadians less than 360degrees
//# sourceMappingURL=Geometry.js.map