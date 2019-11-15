"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const Geometry_1 = require("../Geometry");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Ray3d_1 = require("../geometry3d/Ray3d");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const Plane3dByOriginAndUnitNormal_1 = require("../geometry3d/Plane3dByOriginAndUnitNormal");
/**
 *
 * @param ddg numerator second derivative
 * @param dh denominator derivative
 * @param ddh denominator second derivative
 * @param f primary function (g/h)
 * @param df derivative of (g/h)
 * @param divH = (1/h)
 * @internal
 */
function quotientDerivative2(ddg, dh, ddh, f, df, divH) {
    return divH * (ddg - 2.0 * df * dh - f * ddh);
}
/** 4 Dimensional point (x,y,z,w) used in perspective calculations.
 * * the coordinates are stored in a Float64Array of length 4.
 * * properties `x`, `y`, `z`, `w` access array members.
 * *
 * * The coordinates are physically stored as a single Float64Array with 4 entries. (w last)
 * *
 * @public
 */
class Point4d {
    /** Construct from coordinates. */
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.xyzw = new Float64Array(4);
        this.xyzw[0] = x;
        this.xyzw[1] = y;
        this.xyzw[2] = z;
        this.xyzw[3] = w;
    }
    /** Set x,y,z,w of this point.  */
    set(x = 0, y = 0, z = 0, w = 0) {
        this.xyzw[0] = x;
        this.xyzw[1] = y;
        this.xyzw[2] = z;
        this.xyzw[3] = w;
        return this;
    }
    /** Set a component by index.
     * * No change if index is out of range.
     */
    setComponent(index, value) {
        if (index >= 0 && index < 4) {
            this.xyzw[index] = value;
        }
    }
    /** Return the x component. */
    get x() { return this.xyzw[0]; }
    /** Set the x component. */
    set x(val) { this.xyzw[0] = val; }
    /** Return the y component. */
    get y() { return this.xyzw[1]; }
    /** Set the y component. */
    set y(val) { this.xyzw[1] = val; }
    /** Return the z component. */
    get z() { return this.xyzw[2]; }
    /** Set the z component. */
    set z(val) { this.xyzw[2] = val; }
    /** Return the w component of this point. */
    get w() { return this.xyzw[3]; }
    /** Set the w component. */
    set w(val) { this.xyzw[3] = val; }
    /** Return a Point4d with specified x,y,z,w */
    static create(x = 0, y = 0, z = 0, w = 0, result) {
        return result ? result.set(x, y, z, w) : new Point4d(x, y, z, w);
    }
    /** Copy coordinates from `other`. */
    setFrom(other) {
        this.xyzw[0] = other.xyzw[0];
        this.xyzw[1] = other.xyzw[1];
        this.xyzw[2] = other.xyzw[2];
        this.xyzw[3] = other.xyzw[3];
        return this;
    }
    /** Clone this point */
    clone(result) {
        return result ? result.setFrom(this) : new Point4d(this.xyzw[0], this.xyzw[1], this.xyzw[2], this.xyzw[3]);
    }
    /** Set this point's xyzw from a json array `[x,y,z,w]` */
    setFromJSON(json) {
        if (Geometry_1.Geometry.isNumberArray(json, 4))
            this.set(json[0], json[1], json[2], json[3]);
        else
            this.set(0, 0, 0, 0);
    }
    /** Create a new point with coordinates from a json array `[x,y,z,w]` */
    static fromJSON(json) {
        const result = new Point4d();
        result.setFromJSON(json);
        return result;
    }
    /** Near-equality test, using `Geometry.isSameCoordinate` on all 4 x,y,z,w */
    isAlmostEqual(other) {
        return Geometry_1.Geometry.isSameCoordinate(this.x, other.x)
            && Geometry_1.Geometry.isSameCoordinate(this.y, other.y)
            && Geometry_1.Geometry.isSameCoordinate(this.z, other.z)
            && Geometry_1.Geometry.isSameCoordinate(this.w, other.w);
    }
    /**
     * Test for same coordinate by direct x,y,z,w args
     * @param x x to test
     * @param y y to test
     * @param z z to test
     * @param w w to test
     */
    isAlmostEqualXYZW(x, y, z, w) {
        return Geometry_1.Geometry.isSameCoordinate(this.x, x)
            && Geometry_1.Geometry.isSameCoordinate(this.y, y)
            && Geometry_1.Geometry.isSameCoordinate(this.z, z)
            && Geometry_1.Geometry.isSameCoordinate(this.w, w);
    }
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [x,y,z,w]
     */
    toJSON() {
        return [this.xyzw[0], this.xyzw[1], this.xyzw[2], this.xyzw[3]];
    }
    /** Return the 4d distance from this point to other, with all 4 components squared into the hypotenuse.
     * * x,y,z,w all participate without normalization.
     */
    distanceXYZW(other) {
        return Geometry_1.Geometry.hypotenuseXYZW(other.xyzw[0] - this.xyzw[0], other.xyzw[1] - this.xyzw[1], other.xyzw[2] - this.xyzw[2], other.xyzw[3] - this.xyzw[3]);
    }
    /** Return the squared 4d distance from this point to other, with all 4 components squared into the hypotenuse.
     * * x,y,z,w all participate without normalization.
     */
    distanceSquaredXYZW(other) {
        return Geometry_1.Geometry.hypotenuseSquaredXYZW(other.xyzw[0] - this.xyzw[0], other.xyzw[1] - this.xyzw[1], other.xyzw[2] - this.xyzw[2], other.xyzw[3] - this.xyzw[3]);
    }
    /** Return the distance between the instance and other after normalizing by weights
     */
    realDistanceXY(other) {
        const wA = this.w;
        const wB = other.w;
        if (Geometry_1.Geometry.isSmallMetricDistance(wA) || Geometry_1.Geometry.isSmallMetricDistance(wB))
            return undefined;
        return Geometry_1.Geometry.hypotenuseXY(other.xyzw[0] / wB - this.xyzw[0] / wA, other.xyzw[1] / wB - this.xyzw[1] / wA);
    }
    /** Return the largest absolute distance between corresponding components
     * * x,y,z,w all participate without normalization.
     */
    maxDiff(other) {
        return Math.max(Math.abs(other.xyzw[0] - this.xyzw[0]), Math.abs(other.xyzw[1] - this.xyzw[1]), Math.abs(other.xyzw[2] - this.xyzw[2]), Math.abs(other.xyzw[3] - this.xyzw[3]));
    }
    /** Return the largest absolute entry of all 4 components x,y,z,w */
    maxAbs() {
        return Math.max(Math.abs(this.xyzw[0]), Math.abs(this.xyzw[1]), Math.abs(this.xyzw[2]), Math.abs(this.xyzw[3]));
    }
    /** Returns the magnitude including all 4 components x,y,z,w */
    magnitudeXYZW() {
        return Geometry_1.Geometry.hypotenuseXYZW(this.xyzw[0], this.xyzw[1], this.xyzw[2], this.xyzw[3]);
    }
    /** Returns the magnitude of the leading xyz components.  w is ignored.  (i.e. the leading xyz are NOT divided by w.) */
    magnitudeSquaredXYZ() {
        return Geometry_1.Geometry.hypotenuseSquaredXYZ(this.xyzw[0], this.xyzw[1], this.xyzw[2]);
    }
    /** Return the difference (this-other) using all 4 components x,y,z,w */
    minus(other, result) {
        return Point4d.create(this.xyzw[0] - other.xyzw[0], this.xyzw[1] - other.xyzw[1], this.xyzw[2] - other.xyzw[2], this.xyzw[3] - other.xyzw[3], result);
    }
    /** Return `((other.w * this) -  (this.w * other))` */
    crossWeightedMinus(other, result) {
        const wa = this.xyzw[3];
        const wb = other.xyzw[3];
        return Point3dVector3d_1.Vector3d.create(wb * this.xyzw[0] - wa * other.xyzw[0], wb * this.xyzw[1] - wa * other.xyzw[1], wb * this.xyzw[2] - wa * other.xyzw[2], result);
    }
    /** Return the sum of this and other, using all 4 components x,y,z,w */
    plus(other, result) {
        return Point4d.create(this.xyzw[0] + other.xyzw[0], this.xyzw[1] + other.xyzw[1], this.xyzw[2] + other.xyzw[2], this.xyzw[3] + other.xyzw[3], result);
    }
    /** Test if all components are nearly zero. */
    get isAlmostZero() {
        return Geometry_1.Geometry.isSmallMetricDistance(this.maxAbs());
    }
    /** Create a point with zero in all coordinates. */
    static createZero() { return new Point4d(0, 0, 0, 0); }
    /**
     * Create plane coefficients for the plane containing pointA, pointB, and 0010.
     * @param pointA first point
     * @param pointB second point
     */
    static createPlanePointPointZ(pointA, pointB, result) {
        return Point4d.create(pointA.y * pointB.w - pointA.w * pointB.y, pointA.w * pointB.x - pointA.x * pointB.w, 0.0, pointA.x * pointB.y - pointA.y * pointB.x, result);
    }
    /**
     * extract 4 consecutive numbers from a Float64Array into a Point4d.
     * @param data buffer of numbers
     * @param xIndex first index for x,y,z,w sequence
     */
    static createFromPackedXYZW(data, xIndex = 0, result) {
        return Point4d.create(data[xIndex], data[xIndex + 1], data[xIndex + 2], data[xIndex + 3], result);
    }
    /** Create a `Point4d` with x,y,z from an `XYAndZ` input, and w from a separate number. */
    static createFromPointAndWeight(xyz, w) {
        return new Point4d(xyz.x, xyz.y, xyz.z, w);
    }
    /** Return `point + vector * scalar` */
    plusScaled(vector, scaleFactor, result) {
        return Point4d.create(this.xyzw[0] + vector.xyzw[0] * scaleFactor, this.xyzw[1] + vector.xyzw[1] * scaleFactor, this.xyzw[2] + vector.xyzw[2] * scaleFactor, this.xyzw[3] + vector.xyzw[3] * scaleFactor, result);
    }
    /** Return interpolation between instance and pointB at fraction
     */
    interpolate(fraction, pointB, result) {
        const v = 1.0 - fraction;
        return Point4d.create(this.xyzw[0] * v + pointB.xyzw[0] * fraction, this.xyzw[1] * v + pointB.xyzw[1] * fraction, this.xyzw[2] * v + pointB.xyzw[2] * fraction, this.xyzw[3] * v + pointB.xyzw[3] * fraction, result);
    }
    /** Return `point + vectorA * scalarA + vectorB * scalarB` */
    plus2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        return Point4d.create(this.xyzw[0] + vectorA.xyzw[0] * scalarA + vectorB.xyzw[0] * scalarB, this.xyzw[1] + vectorA.xyzw[1] * scalarA + vectorB.xyzw[1] * scalarB, this.xyzw[2] + vectorA.xyzw[2] * scalarA + vectorB.xyzw[2] * scalarB, this.xyzw[3] + vectorA.xyzw[3] * scalarA + vectorB.xyzw[3] * scalarB, result);
    }
    /** Return `point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC` */
    plus3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        return Point4d.create(this.xyzw[0] + vectorA.xyzw[0] * scalarA + vectorB.xyzw[0] * scalarB + vectorC.xyzw[0] * scalarC, this.xyzw[1] + vectorA.xyzw[1] * scalarA + vectorB.xyzw[1] * scalarB + vectorC.xyzw[1] * scalarC, this.xyzw[2] + vectorA.xyzw[2] * scalarA + vectorB.xyzw[2] * scalarB + vectorC.xyzw[2] * scalarC, this.xyzw[3] + vectorA.xyzw[3] * scalarA + vectorB.xyzw[3] * scalarB + vectorC.xyzw[3] * scalarC, result);
    }
    /** Return `point + vectorA * scalarA + vectorB * scalarB` */
    static createAdd2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        return Point4d.create(vectorA.xyzw[0] * scalarA + vectorB.xyzw[0] * scalarB, vectorA.xyzw[1] * scalarA + vectorB.xyzw[1] * scalarB, vectorA.xyzw[2] * scalarA + vectorB.xyzw[2] * scalarB, vectorA.xyzw[3] * scalarA + vectorB.xyzw[3] * scalarB, result);
    }
    /** Return `point + vectorA \ scalarA + vectorB * scalarB + vectorC * scalarC` */
    static createAdd3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        return Point4d.create(vectorA.xyzw[0] * scalarA + vectorB.xyzw[0] * scalarB + vectorC.xyzw[0] * scalarC, vectorA.xyzw[1] * scalarA + vectorB.xyzw[1] * scalarB + vectorC.xyzw[1] * scalarC, vectorA.xyzw[2] * scalarA + vectorB.xyzw[2] * scalarB + vectorC.xyzw[2] * scalarC, vectorA.xyzw[3] * scalarA + vectorB.xyzw[3] * scalarB + vectorC.xyzw[3] * scalarC, result);
    }
    /** Return dot product of (4d) vectors from the instance to targetA and targetB */
    dotVectorsToTargets(targetA, targetB) {
        return (targetA.xyzw[0] - this.xyzw[0]) * (targetB.xyzw[0] - this.xyzw[0]) +
            (targetA.xyzw[1] - this.xyzw[1]) * (targetB.xyzw[1] - this.xyzw[1]) +
            (targetA.xyzw[2] - this.xyzw[2]) * (targetB.xyzw[2] - this.xyzw[2]) +
            (targetA.xyzw[3] - this.xyzw[3]) * (targetB.xyzw[3] - this.xyzw[3]);
    }
    /** return (4d) dot product of the instance and other point. */
    dotProduct(other) {
        return this.xyzw[0] * other.xyzw[0] + this.xyzw[1] * other.xyzw[1] + this.xyzw[2] * other.xyzw[2] + this.xyzw[3] * other.xyzw[3];
    }
    /** return (4d) dot product of the instance with xyzw */
    dotProductXYZW(x, y, z, w) {
        return this.xyzw[0] * x + this.xyzw[1] * y + this.xyzw[2] * z + this.xyzw[3] * w;
    }
    /** dotProduct with (point.x, point.y, point.z, 1) Used in PlaneAltitudeEvaluator interface */
    altitude(point) {
        return this.xyzw[0] * point.x + this.xyzw[1] * point.y + this.xyzw[2] * point.z + this.xyzw[3];
    }
    /** dotProduct with (x, y, z, 1) Used in PlaneAltitudeEvaluator interface */
    altitudeXYZ(x, y, z) {
        return this.xyzw[0] * x + this.xyzw[1] * y + this.xyzw[2] * z + this.xyzw[3];
    }
    /** dotProduct with (point.x, point.y, point.z, point.w) Used in PlaneAltitudeEvaluator interface */
    weightedAltitude(point) {
        return this.xyzw[0] * point.x + this.xyzw[1] * point.y + this.xyzw[2] * point.z + this.xyzw[3] * point.w;
    }
    /** dotProduct with (vector.x, vector.y, vector.z, 0).  Used in PlaneAltitudeEvaluator interface */
    velocity(vector) {
        return this.xyzw[0] * vector.x + this.xyzw[1] * vector.y + this.xyzw[2] * vector.z;
    }
    /** dotProduct with (x,y,z, 0).  Used in PlaneAltitudeEvaluator interface */
    velocityXYZ(x, y, z) {
        return this.xyzw[0] * x + this.xyzw[1] * y + this.xyzw[2] * z;
    }
    /** unit X vector */
    static unitX() { return new Point4d(1, 0, 0, 0); }
    /** unit Y vector */
    static unitY() { return new Point4d(0, 1, 0, 0); }
    /** unit Z vector */
    static unitZ() { return new Point4d(0, 0, 1, 0); }
    /** unit W vector */
    static unitW() { return new Point4d(0, 0, 0, 1); }
    /** Divide by denominator, but return undefined if denominator is zero. */
    safeDivideOrNull(denominator, result) {
        if (denominator !== 0.0) {
            return this.scale(1.0 / denominator, result);
        }
        return undefined;
    }
    /** scale all components (including w!!) */
    scale(scale, result) {
        result = result ? result : new Point4d();
        result.xyzw[0] = this.xyzw[0] * scale;
        result.xyzw[1] = this.xyzw[1] * scale;
        result.xyzw[2] = this.xyzw[2] * scale;
        result.xyzw[3] = this.xyzw[3] * scale;
        return result;
    }
    /** Negate components (including w!!) */
    negate(result) {
        result = result ? result : new Point4d();
        result.xyzw[0] = -this.xyzw[0];
        result.xyzw[1] = -this.xyzw[1];
        result.xyzw[2] = -this.xyzw[2];
        result.xyzw[3] = -this.xyzw[3];
        return result;
    }
    /**
     * If `this.w` is nonzero, return a 4d point `(x/w,y/w,z/w, 1)`
     * If `this.w` is zero, return undefined.
     * @param result optional result
     */
    normalizeWeight(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.xyzw[3]);
        result = result ? result : new Point4d();
        return this.safeDivideOrNull(mag, result);
    }
    /**
     * If `this.w` is nonzero, return a 3d point `(x/w,y/w,z/w)`
     * If `this.w` is zero, return undefined.
     * @param result optional result
     */
    realPoint(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.xyzw[3]);
        if (mag === 0.0)
            return undefined;
        const a = 1.0 / mag; // in zero case everything multiplies right back to true zero.
        return Point3dVector3d_1.Point3d.create(this.xyzw[0] * a, this.xyzw[1] * a, this.xyzw[2] * a, result);
    }
    /**
     * * If w is nonzero, return Point3d with x/w,y/w,z/w.
     * * If w is zero, return 000
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param w w coordinate
     * @param result optional result
     */
    static createRealPoint3dDefault000(x, y, z, w, result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(w);
        const a = mag === 0 ? 0.0 : (1.0 / mag); // in zero case everything multiplies right back to true zero.
        return Point3dVector3d_1.Point3d.create(x * a, y * a, z * a, result);
    }
    /**
     * * If w is nonzero, return Vector3d which is the derivative of the projected xyz with given w and 4d derivatives.
     * * If w is zero, return 000
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param w w coordinate
     * @param dx x coordinate of derivative
     * @param dy y coordinate of derivative
     * @param dz z coordinate of derivative
     * @param dw w coordinate of derivative
     * @param result optional result
     */
    static createRealDerivativeRay3dDefault000(x, y, z, w, dx, dy, dz, dw, result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(w);
        // real point is X/w.
        // real derivative is (X' * w - X *w) / ww, and weight is always 0 by cross products.
        const a = mag === 0 ? 0.0 : (1.0 / mag); // in zero case everything multiplies right back to true zero.
        const aa = a * a;
        return Ray3d_1.Ray3d.createXYZUVW(x * a, y * a, z * a, (dx * w - dw * x) * aa, (dy * w - dw * y) * aa, (dz * w - dw * z) * aa, result);
    }
    /**
     * * If w is nonzero, return Vector3d which is the derivative of the projected xyz with given w and 4d derivatives.
     * * If w is zero, return 000
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param w w coordinate
     * @param dx x coordinate of derivative
     * @param dy y coordinate of derivative
     * @param dz z coordinate of derivative
     * @param dw w coordinate of derivative
     * @param result optional result
     */
    static createRealDerivativePlane3dByOriginAndVectorsDefault000(x, y, z, w, dx, dy, dz, dw, ddx, ddy, ddz, ddw, result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(w);
        // real point is X/w.
        // real derivative is (X' * w - X *w) / ww, and weight is always 0 by cross products.
        const a = mag === 0 ? 0.0 : (1.0 / mag); // in zero case everything multiplies right back to true zero.
        const aa = a * a;
        const fx = x * a;
        const fy = y * a;
        const fz = z * a;
        const dfx = (dx * w - dw * x) * aa;
        const dfy = (dy * w - dw * y) * aa;
        const dfz = (dz * w - dw * z) * aa;
        return Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createOriginAndVectorsXYZ(fx, fy, fz, dfx, dfy, dfz, quotientDerivative2(ddx, dw, ddw, fx, dfx, a), quotientDerivative2(ddy, dw, ddw, fy, dfy, a), quotientDerivative2(ddz, dw, ddw, fz, dfz, a), result);
    }
    /**
     * * If this.w is nonzero, return Point3d with x/w,y/w,z/w.
     * * If this.w is zero, return 000
     */
    realPointDefault000(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.xyzw[3]);
        if (mag === 0.0)
            return Point3dVector3d_1.Point3d.create(0, 0, 0, result);
        result = result ? result : new Point3dVector3d_1.Point3d();
        const a = 1.0 / mag;
        return Point3dVector3d_1.Point3d.create(this.xyzw[0] * a, this.xyzw[1] * a, this.xyzw[2] * a, result);
    }
    /** divide all components (x,y,z,w) by the 4d magnitude.
     *
     * * This is appropriate for normalizing a quaternion
     * * Use normalizeWeight to divide by the w component.
     */
    normalizeXYZW(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.magnitudeXYZW());
        result = result ? result : new Point4d();
        return this.safeDivideOrNull(mag, result);
    }
    /**
     * Return the determinant of the 3x3 matrix using components i,j,k of the 3 inputs.
     */
    static determinantIndexed3X3(pointA, pointB, pointC, i, j, k) {
        return Geometry_1.Geometry.tripleProduct(pointA.xyzw[i], pointA.xyzw[j], pointA.xyzw[k], pointB.xyzw[i], pointB.xyzw[j], pointB.xyzw[k], pointC.xyzw[i], pointC.xyzw[j], pointC.xyzw[k]);
    }
    /**
     * Return a Point4d perpendicular to all 3 inputs. (A higher level cross product concept)
     * @param pointA first point
     * @param pointB second point
     * @param pointC third point
     */
    static perpendicularPoint4dPlane(pointA, pointB, pointC) {
        return Point4d.create(Point4d.determinantIndexed3X3(pointA, pointB, pointC, 1, 2, 3), -Point4d.determinantIndexed3X3(pointA, pointB, pointC, 2, 3, 0), Point4d.determinantIndexed3X3(pointA, pointB, pointC, 3, 0, 1), -Point4d.determinantIndexed3X3(pointA, pointB, pointC, 0, 1, 2));
    }
    /** Treating this Point4d as plane coefficients, convert to origin and normal form. */
    toPlane3dByOriginAndUnitNormal(result) {
        const aa = this.magnitudeSquaredXYZ();
        const direction = Point3dVector3d_1.Vector3d.create(this.x, this.y, this.z);
        const w = this.w;
        const divW = Geometry_1.Geometry.conditionalDivideFraction(1.0, w);
        if (divW !== undefined) {
            const b = -w / aa;
            direction.scaleInPlace(1.0 / Math.sqrt(aa));
            return Plane3dByOriginAndUnitNormal_1.Plane3dByOriginAndUnitNormal.create(Point3dVector3d_1.Point3d.create(this.x * b, this.y * b, this.z * b), direction, result);
        }
        return undefined;
    }
    /** Normalize so sum of squares of all 4 coordinates is 1. */
    normalizeQuaternion() {
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        if (magnitude > 0.0) {
            const f = 1.0 / magnitude;
            this.x *= f;
            this.y *= f;
            this.z *= f;
            this.w *= f;
        }
        return magnitude;
    }
    /** Return a (normalized) quaternion interpolated between two quaternions. */
    static interpolateQuaternions(quaternion0, fractionParameter, quaternion1, result) {
        if (!result)
            result = new Point4d();
        const maxSafeCosine = 0.9995;
        // return exact quaternions for special values
        if (0.0 === fractionParameter) {
            result = quaternion0;
            return result;
        }
        if (1.0 === fractionParameter) {
            result = quaternion1;
            return result;
        }
        if (0.5 === fractionParameter) {
            quaternion0.plus(quaternion1, result);
            result.normalizeQuaternion();
            return result;
        }
        const q0 = quaternion0.clone();
        const q1 = quaternion1.clone();
        let dot = quaternion0.dotProduct(quaternion1);
        // prevent interpolation through the longer great arc
        if (dot < 0.0) {
            q1.negate(q1);
            dot = -dot;
        }
        // if nearly parallel, use interpolate and renormalize .
        if (dot > maxSafeCosine) {
            q0.interpolate(fractionParameter, q1, result);
            result.normalizeQuaternion();
            return result;
        }
        // safety check
        if (dot < -1.0)
            dot = -1.0;
        else if (dot > 1.0)
            dot = 1.0;
        // create orthonormal basis {q0, q2}
        const q2 = new Point4d();
        q1.plusScaled(q0, -dot, q2); //  bsiDPoint4d_addScaledDPoint4d(& q2, & q1, & q0, -dot);
        q2.normalizeQuaternion();
        const angle = Math.acos(dot);
        const angleOfInterpolation = angle * fractionParameter;
        result = Point4d.createAdd2Scaled(q0, Math.cos(angleOfInterpolation), q2, Math.sin(angleOfInterpolation));
        return result;
    }
    /** Measure the "angle" between two points, using all 4 components in the dot product that
     * gives the cosine of the angle.
     */
    radiansToPoint4dXYZW(other) {
        const magA = this.magnitudeXYZW();
        const magB = other.magnitudeXYZW();
        const dot = this.dotProduct(other); // == cos (theta) * magA * magB
        const cos = Geometry_1.Geometry.conditionalDivideFraction(dot, magA * magB);
        if (cos === undefined)
            return undefined;
        return Math.acos(cos);
    }
}
exports.Point4d = Point4d;
//# sourceMappingURL=Point4d.js.map