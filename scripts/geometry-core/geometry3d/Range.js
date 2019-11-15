"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Geometry_1 = require("../Geometry");
const Matrix3d_1 = require("./Matrix3d");
const Point2dVector2d_1 = require("./Point2dVector2d");
const Point3dVector3d_1 = require("./Point3dVector3d");
const Transform_1 = require("./Transform");
const PointStreaming_1 = require("./PointStreaming");
/**
 * Base class for Range1d, Range2d, Range3d.
 * @public
 */
class RangeBase {
    /** Return 0 if high<= low, otherwise `1/(high-low)` for use in fractionalizing */
    static npcScaleFactor(low, high) { return (high <= low) ? 0.0 : 1.0 / (high - low); }
    /** Return true if x is outside the range `[_EXTREME_NEGATIVE, _EXTREME_POSITIVE]' */
    static isExtremeValue(x) { return Math.abs(x) >= RangeBase._EXTREME_POSITIVE; }
    /** Return true if any x or y or z is outside the range `[_EXTREME_NEGATIVE, _EXTREME_POSITIVE]' */
    static isExtremePoint3d(xyz) { return RangeBase.isExtremeValue(xyz.x) || RangeBase.isExtremeValue(xyz.y) || RangeBase.isExtremeValue(xyz.z); }
    /** Return true if either of x,y is outside the range `[_EXTREME_NEGATIVE, _EXTREME_POSITIVE]' */
    static isExtremePoint2d(xy) { return RangeBase.isExtremeValue(xy.x) || RangeBase.isExtremeValue(xy.y); }
    /**
     * Return the min absolute distance from any point of `[lowA,highA]' to any point of `[lowB,highB]'.
     * * Both low,high pairs have order expectations:  The condition `high < low` means null interval.
     * * If there is interval overlap, the distance is zero.
     * @param lowA low of interval A
     * @param highA high of interval A
     * @param lowB low of interval B
     * @param highB high of interval B
     */
    static rangeToRangeAbsoluteDistance(lowA, highA, lowB, highB) {
        if (highA < lowA)
            return RangeBase._EXTREME_POSITIVE;
        if (highB < lowB)
            return RangeBase._EXTREME_POSITIVE;
        if (highB < lowA)
            return lowA - highB;
        if (highB <= highA)
            return 0.0;
        if (lowB <= highA)
            return 0.0;
        return lowB - highA;
    }
    /** Given a coordinate and pair of range limits, return the smallest distance to the range.
     * * This is zero for any point inside the range
     * * This is _EXTREME_POSITIVE if the range limits are inverted
     * * Otherwise (i.e. x is outside a finite range) the distance to the near endpoint.
     */
    static coordinateToRangeAbsoluteDistance(x, low, high) {
        if (high < low)
            return RangeBase._EXTREME_POSITIVE;
        if (x < low)
            return low - x;
        if (x > high)
            return x - high;
        return 0.0;
    }
}
exports.RangeBase = RangeBase;
/** Number considered impossibly large possibly for a coordinate in a range. */
RangeBase._EXTREME_POSITIVE = 1.0e200;
/** Number considered to be impossibly negative for a coordinate in a range. */
RangeBase._EXTREME_NEGATIVE = -1.0e200;
/**
 * Axis aligned range in 3D.
 * * member `low` contains minimum coordinate of range box
 * * member  `high` contains maximum coordinate of range box
 * * The range is considered null (empty) if any low member is larger than its high counterpart.
 * @public
 */
class Range3d extends RangeBase {
    // explicit ctor - no enforcement of value relationships
    constructor(lowX = RangeBase._EXTREME_POSITIVE, lowY = RangeBase._EXTREME_POSITIVE, lowZ = RangeBase._EXTREME_POSITIVE, highX = RangeBase._EXTREME_NEGATIVE, highY = RangeBase._EXTREME_NEGATIVE, highZ = RangeBase._EXTREME_NEGATIVE) {
        super();
        this.low = Point3dVector3d_1.Point3d.create(lowX, lowY, lowZ);
        this.high = Point3dVector3d_1.Point3d.create(highX, highY, highZ);
    }
    /** Set this transform to values that indicate it has no geometric contents. */
    setNull() {
        this.low.x = RangeBase._EXTREME_POSITIVE;
        this.low.y = RangeBase._EXTREME_POSITIVE;
        this.low.z = RangeBase._EXTREME_POSITIVE;
        this.high.x = RangeBase._EXTREME_NEGATIVE;
        this.high.y = RangeBase._EXTREME_NEGATIVE;
        this.high.z = RangeBase._EXTREME_NEGATIVE;
    }
    /** Freeze this instance (and its deep content) so it can be considered read-only */
    freeze() { Object.freeze(this); Object.freeze(this.low); Object.freeze(this.high); }
    /** Flatten the low and high coordinates of any json object with low.x .. high.z into an array of 6 doubles */
    static toFloat64Array(val) { return Float64Array.of(val.low.x, val.low.y, val.low.z, val.high.x, val.high.y, val.high.z); }
    /** Flatten the low and high coordinates of this into an array of 6 doubles */
    toFloat64Array() { return Range3d.toFloat64Array(this); }
    /**
     * Construct a Range3d from an array of double-precision values
     * @param f64 the array, which should contain exactly 6 values in this order: lowX, lowY, lowZ, highX, highY, highZ
     * @return a new Range3d object
     */
    static fromFloat64Array(f64) {
        if (f64.length !== 6)
            throw new Error("invalid array");
        return new this(f64[0], f64[1], f64[2], f64[3], f64[4], f64[5]);
    }
    /**
     * Construct a Range3d from an un-typed array. This mostly useful when interpreting ECSQL query results of the 'blob' type, where you know that that result is a Range3d.
     * @param buffer untyped array
     * @return a new Range3d object
     */
    static fromArrayBuffer(buffer) { return this.fromFloat64Array(new Float64Array(buffer)); }
    /** Returns true if this and other have equal low and high parts, or both are null ranges. */
    isAlmostEqual(other) {
        return (this.low.isAlmostEqual(other.low) && this.high.isAlmostEqual(other.high))
            || (this.isNull && other.isNull);
    }
    /** copy low and high values from other. */
    setFrom(other) { this.low.setFrom(other.low); this.high.setFrom(other.high); }
    /** Return a new Range3d copied from a range or derived type */
    static createFrom(other, result) {
        if (result) {
            result.setFrom(other);
            return result;
        }
        return this.createXYZXYZOrCorrectToNull(other.low.x, other.low.y, other.low.z, other.high.x, other.high.y, other.high.z, result);
    }
    /** set this range (in place) from json such as
     * * key-value pairs: `{low:[1,2,3], high:[4,5,6]}`
     * * array of points: `[[1,2,3],[9,3,4],[-2,1,3] ...]`
     * * Lowest level points can be `[1,2,3]` or `{x:1,y:2,z:3}`
     */
    setFromJSON(json) {
        if (!json)
            return;
        this.setNull();
        if (Array.isArray(json)) {
            const point = Point3dVector3d_1.Point3d.create();
            for (const value of json) {
                point.setFromJSON(value);
                this.extendPoint(point);
            }
            return;
        }
        const low = Point3dVector3d_1.Point3d.fromJSON(json.low);
        const high = Point3dVector3d_1.Point3d.fromJSON(json.high);
        if (!RangeBase.isExtremePoint3d(low) && !RangeBase.isExtremePoint3d(high)) {
            this.extendPoint(low);
            this.extendPoint(high);
        }
    }
    /** Return a JSON object `{low: ... , high: ...}`
     * with points formatted by `Point3d.toJSON()`
     */
    toJSON() { return { low: this.low.toJSON(), high: this.high.toJSON() }; }
    /** Use `setFromJSON` to parse `json` into a new Range3d instance. */
    static fromJSON(json) {
        const result = new this();
        result.setFromJSON(json);
        return result;
    }
    // internal use only -- directly set all coordinates, test only if directed.
    setDirect(xA, yA, zA, xB, yB, zB, correctToNull) {
        this.low.x = xA;
        this.low.y = yA;
        this.low.z = zA;
        this.high.x = xB;
        this.high.y = yB;
        this.high.z = zB;
        if (correctToNull) {
            if (this.low.x > this.high.x
                || this.low.y > this.high.y
                || this.low.z > this.high.z)
                this.setNull();
        }
    }
    /** Return a copy */
    clone(result) {
        result = result ? result : new this.constructor();
        result.setDirect(this.low.x, this.low.y, this.low.z, this.high.x, this.high.y, this.high.z, false);
        return result;
    }
    /** Return a range initialized to have no content. */
    static createNull(result) {
        result = result ? result : new this();
        result.setNull();
        return result;
    }
    /** Extend (modify in place) so that the range is large enough to include the supplied points. */
    extend(...point) {
        let p;
        for (p of point)
            this.extendPoint(p);
    }
    /** Return a range large enough to include the supplied points. If no points are given, the range is a null range */
    static create(...point) {
        const result = Range3d.createNull();
        let p;
        for (p of point)
            result.extendPoint(p);
        return result;
    }
    /** Create a range from freely structured MultiLineStringDataVariant. */
    static createFromVariantData(data) {
        const collector = new PointStreaming_1.PointStreamRangeCollector();
        PointStreaming_1.VariantPointDataStream.streamXYZ(data, collector);
        return collector.claimResult();
    }
    /** create a Range3d enclosing the transformed points. */
    static createTransformed(transform, ...point) {
        const result = this.createNull();
        let p;
        for (p of point)
            result.extendTransformedXYZ(transform, p.x, p.y, p.z);
        return result;
    }
    /** create a Range3d enclosing the transformed points. */
    static createTransformedArray(transform, points) {
        const result = this.createNull();
        result.extendArray(points, transform);
        return result;
    }
    /** create a Range3d enclosing the points after inverse transform. */
    static createInverseTransformedArray(transform, points) {
        const result = this.createNull();
        result.extendInverseTransformedArray(points, transform);
        return result;
    }
    /** Set the range to be a single point supplied as x,y,z values */
    setXYZ(x, y, z) {
        this.low.x = this.high.x = x;
        this.low.y = this.high.y = y;
        this.low.z = this.high.z = z;
    }
    /** Create a single point range */
    static createXYZ(x, y, z, result) {
        result = result ? result : new this();
        result.setDirect(x, y, z, x, y, z, false);
        return result;
    }
    /** Create a box with 2 pairs of xyz candidates. Theses are compared and shuffled as needed for the box. */
    static createXYZXYZ(xA, yA, zA, xB, yB, zB, result) {
        result = result ? result : new this();
        result.setDirect(Math.min(xA, xB), Math.min(yA, yB), Math.min(zA, zB), Math.max(xA, xB), Math.max(yA, yB), Math.max(zA, zB), false);
        return result;
    }
    /** Create a box with 2 pairs of xyz candidates. If any direction has order flip, create null. */
    static createXYZXYZOrCorrectToNull(xA, yA, zA, xB, yB, zB, result) {
        result = result ? result : new this();
        result.setDirect(Math.min(xA, xB), Math.min(yA, yB), Math.min(zA, zB), Math.max(xA, xB), Math.max(yA, yB), Math.max(zA, zB), true);
        return result;
    }
    /** Creates a 3d range from a 2d range's low and high members, setting the corresponding z values to the value given. */
    static createRange2d(range, z = 0, result) {
        const retVal = result ? result : new this();
        retVal.setNull();
        retVal.extendXYZ(range.low.x, range.low.y, z);
        retVal.extendXYZ(range.high.x, range.high.y, z);
        return retVal;
    }
    /** Create a range around an array of points. */
    static createArray(points, result) {
        result = result ? result : new this();
        result.setNull();
        let point;
        for (point of points)
            result.extendPoint(point);
        return result;
    }
    /** extend a range around an array of points (optionally transformed) */
    extendArray(points, transform) {
        if (Array.isArray(points))
            if (transform)
                for (const point of points)
                    this.extendTransformedXYZ(transform, point.x, point.y, point.z);
            else
                for (const point of points)
                    this.extendXYZ(point.x, point.y, point.z);
        else // growable array -- this should be implemented without point extraction !!!
         if (transform)
            for (let i = 0; i < points.length; i++)
                this.extendTransformedXYZ(transform, points.getXAtUncheckedPointIndex(i), points.getYAtUncheckedPointIndex(i), points.getZAtUncheckedPointIndex(i));
        else
            for (let i = 0; i < points.length; i++)
                this.extendXYZ(points.getXAtUncheckedPointIndex(i), points.getYAtUncheckedPointIndex(i), points.getZAtUncheckedPointIndex(i));
    }
    /** extend a range around an array of points (optionally transformed) */
    extendInverseTransformedArray(points, transform) {
        if (Array.isArray(points))
            for (const point of points)
                this.extendInverseTransformedXYZ(transform, point.x, point.y, point.z);
        else // growable array -- this should be implemented without point extraction !!!
            for (let i = 0; i < points.length; i++)
                this.extendInverseTransformedXYZ(transform, points.getXAtUncheckedPointIndex(i), points.getYAtUncheckedPointIndex(i), points.getZAtUncheckedPointIndex(i));
    }
    /** multiply the point x,y,z by transform and use the coordinate to extend this range.
     */
    extendTransformedXYZ(transform, x, y, z) {
        const origin = transform.origin;
        const coffs = transform.matrix.coffs;
        this.extendXYZ(origin.x + coffs[0] * x + coffs[1] * y + coffs[2] * z, origin.y + coffs[3] * x + coffs[4] * y + coffs[5] * z, origin.z + coffs[6] * x + coffs[7] * y + coffs[8] * z);
    }
    /** multiply the point x,y,z,w by transform and use the coordinate to extend this range.
     */
    extendTransformedXYZW(transform, x, y, z, w) {
        const origin = transform.origin;
        const coffs = transform.matrix.coffs;
        this.extendXYZW(origin.x * w + coffs[0] * x + coffs[1] * y + coffs[2] * z, origin.y * w + coffs[3] * x + coffs[4] * y + coffs[5] * z, origin.z * w + coffs[6] * x + coffs[7] * y + coffs[8] * z, w);
    }
    /** multiply the point x,y,z by transform and use the coordinate to extend this range.
     */
    extendInverseTransformedXYZ(transform, x, y, z) {
        const origin = transform.origin;
        if (!transform.matrix.computeCachedInverse(true))
            return false;
        const coffs = transform.matrix.inverseCoffs;
        const xx = x - origin.x;
        const yy = y - origin.y;
        const zz = z - origin.z;
        this.extendXYZ(coffs[0] * xx + coffs[1] * yy + coffs[2] * zz, coffs[3] * xx + coffs[4] * yy + coffs[5] * zz, coffs[6] * xx + coffs[7] * yy + coffs[8] * zz);
        return true;
    }
    /** Extend the range by the two transforms applied to xyz */
    extendTransformTransformedXYZ(transformA, transformB, x, y, z) {
        const origin = transformB.origin;
        const coffs = transformB.matrix.coffs;
        this.extendTransformedXYZ(transformA, origin.x + coffs[0] * x + coffs[1] * y + coffs[2] * z, origin.y + coffs[3] * x + coffs[4] * y + coffs[5] * z, origin.z + coffs[6] * x + coffs[7] * y + coffs[8] * z);
    }
    /** Test if the box has high<low for any of x,y,z, condition. Note that a range around a single point is NOT null. */
    get isNull() {
        return this.high.x < this.low.x
            || this.high.y < this.low.y
            || this.high.z < this.low.z;
    }
    /** Test if  data has high<low for any of x,y,z, condition. Note that a range around a single point is NOT null. */
    static isNull(data) {
        return data.high.x < data.low.x
            || data.high.y < data.low.y
            || data.high.z < data.low.z;
    }
    /** Test of the range contains a single point. */
    get isSinglePoint() {
        return this.high.x === this.low.x
            && this.high.y === this.low.y
            && this.high.z === this.low.z;
    }
    /** Return the midpoint of the diagonal.  No test for null range. */
    get center() { return this.low.interpolate(.5, this.high); }
    /** return the low x coordinate */
    get xLow() { return this.low.x; }
    /** return the low y coordinate */
    get yLow() { return this.low.y; }
    /** return the low z coordinate */
    get zLow() { return this.low.z; }
    /** return the high x coordinate */
    get xHigh() { return this.high.x; }
    /** return the high y coordinate */
    get yHigh() { return this.high.y; }
    /** return the high z coordinate */
    get zHigh() { return this.high.z; }
    /**  Return the length of the box in the x direction */
    xLength() { const a = this.high.x - this.low.x; return a > 0.0 ? a : 0.0; }
    /**  Return the length of the box in the y direction */
    yLength() { const a = this.high.y - this.low.y; return a > 0.0 ? a : 0.0; }
    /**  Return the length of the box in the z direction */
    zLength() { const a = this.high.z - this.low.z; return a > 0.0 ? a : 0.0; }
    /**  Return the largest of the x,y, z lengths of the range. */
    maxLength() { return Math.max(this.xLength(), this.yLength(), this.zLength()); }
    /** return the diagonal vector. There is no check for isNull -- if the range isNull(), the vector will have very large negative coordinates. */
    diagonal(result) { return this.low.vectorTo(this.high, result); }
    /**  Return the diagonal vector. There is no check for isNull -- if the range isNull(), the vector will have very large negative coordinates. */
    diagonalFractionToPoint(fraction, result) { return this.low.interpolate(fraction, this.high, result); }
    /**  Return a point given by fractional positions on the XYZ axes. This is done with no check for isNull !!! */
    fractionToPoint(fractionX, fractionY, fractionZ, result) {
        return this.low.interpolateXYZ(fractionX, fractionY, fractionZ, this.high, result);
    }
    /**  Return a point given by fractional positions on the XYZ axes.
     *  Returns undefined if the range is null.
     */
    localXYZToWorld(fractionX, fractionY, fractionZ, result) {
        if (this.isNull)
            return undefined;
        return this.low.interpolateXYZ(fractionX, fractionY, fractionZ, this.high, result);
    }
    /** Return a point given by fractional positions on the XYZ axes.
     * * Returns undefined if the range is null.
     */
    localToWorld(xyz, result) {
        return this.localXYZToWorld(xyz.x, xyz.y, xyz.z, result);
    }
    /** Replace fractional coordinates by world coordinates.
     * @returns false if null range.
     */
    localToWorldArrayInPlace(points) {
        if (this.isNull)
            return false;
        for (const p of points)
            this.low.interpolateXYZ(p.x, p.y, p.z, this.high, p);
        return false;
    }
    /** Return fractional coordinates of point within the range.
     * * returns undefined if the range is null.
     * * returns undefined if any direction (x,y,z) has zero length
     */
    worldToLocal(point, result) {
        const ax = RangeBase.npcScaleFactor(this.low.x, this.high.x);
        const ay = RangeBase.npcScaleFactor(this.low.y, this.high.y);
        const az = RangeBase.npcScaleFactor(this.low.z, this.high.z);
        if (ax === 0.0 || ay === 0.0 || az === 0.0)
            return undefined;
        return Point3dVector3d_1.Point3d.create((point.x - this.low.x) * ax, (point.y - this.low.y) * ay, (point.z - this.low.z) * az, result);
    }
    /** Return fractional coordinates of point within the range.
     * * returns undefined if the range is null.
     * * returns undefined if any direction (x,y,z) has zero length
     */
    worldToLocalArrayInPlace(point) {
        const ax = RangeBase.npcScaleFactor(this.low.x, this.high.x);
        const ay = RangeBase.npcScaleFactor(this.low.y, this.high.y);
        const az = RangeBase.npcScaleFactor(this.low.z, this.high.z);
        if (ax === 0.0 || ay === 0.0 || az === 0.0)
            return false;
        for (const p of point)
            Point3dVector3d_1.Point3d.create((p.x - this.low.x) * ax, (p.y - this.low.y) * ay, (p.z - this.low.z) * az, p);
        return true;
    }
    /** Return an array with the 8 corners on order wth "x varies fastest, then y, then z" */
    corners() {
        return [
            Point3dVector3d_1.Point3d.create(this.low.x, this.low.y, this.low.z),
            Point3dVector3d_1.Point3d.create(this.high.x, this.low.y, this.low.z),
            Point3dVector3d_1.Point3d.create(this.low.x, this.high.y, this.low.z),
            Point3dVector3d_1.Point3d.create(this.high.x, this.high.y, this.low.z),
            Point3dVector3d_1.Point3d.create(this.low.x, this.low.y, this.high.z),
            Point3dVector3d_1.Point3d.create(this.high.x, this.low.y, this.high.z),
            Point3dVector3d_1.Point3d.create(this.low.x, this.high.y, this.high.z),
            Point3dVector3d_1.Point3d.create(this.high.x, this.high.y, this.high.z)
        ];
    }
    /** Return an array with indices of the corners of a face
     * * face 0 has negative x normal
     * * face 1 has positive x normal
     * * face 2 has negative y normal
     * * face 3 has positive y normal
     * * face 4 has negative z normal
     * * face 5 has positive z normal
     * * Any other value returns face 5
     * * faces are CCW as viewed from outside.
     */
    static faceCornerIndices(index) {
        if (index === 0)
            return [0, 4, 6, 2];
        if (index === 1)
            return [1, 3, 7, 5];
        if (index === 2)
            return [0, 1, 5, 4];
        if (index === 3)
            return [3, 2, 6, 7];
        if (index === 4)
            return [0, 2, 3, 1];
        return [4, 5, 7, 6];
    }
    /** Return the largest absolute value among any coordinates in the box corners. */
    maxAbs() {
        if (this.isNull)
            return 0.0;
        return Math.max(this.low.maxAbs(), this.high.maxAbs());
    }
    /** returns true if the x direction size is nearly zero */
    get isAlmostZeroX() { return Geometry_1.Geometry.isSmallMetricDistance(this.xLength()); }
    /** returns true if the y direction size is nearly zero */
    get isAlmostZeroY() { return Geometry_1.Geometry.isSmallMetricDistance(this.yLength()); }
    /** returns true if the z direction size is nearly zero */
    get isAlmostZeroZ() { return Geometry_1.Geometry.isSmallMetricDistance(this.zLength()); }
    /** Test if a point given as x,y,z is within the range. */
    containsXYZ(x, y, z) {
        return x >= this.low.x
            && y >= this.low.y
            && z >= this.low.z
            && x <= this.high.x
            && y <= this.high.y
            && z <= this.high.z;
    }
    /** Test if a point given as x,y is within the range.  (Ignoring z of range) */
    containsXY(x, y) {
        return x >= this.low.x
            && y >= this.low.y
            && x <= this.high.x
            && y <= this.high.y;
    }
    /** Test if a point is within the range. */
    containsPoint(point) { return this.containsXYZ(point.x, point.y, point.z); }
    /** Test if the x,y coordinates of a point are within the range. */
    containsPointXY(point) {
        return point.x >= this.low.x
            && point.y >= this.low.y
            && point.x <= this.high.x
            && point.y <= this.high.y;
    }
    /** Test of other range is within this range */
    containsRange(other) {
        return other.low.x >= this.low.x
            && other.low.y >= this.low.y
            && other.low.z >= this.low.z
            && other.high.x <= this.high.x
            && other.high.y <= this.high.y
            && other.high.z <= this.high.z;
    }
    /** Test if there is any intersection with other range */
    intersectsRange(other) {
        return !(this.low.x > other.high.x
            || this.low.y > other.high.y
            || this.low.z > other.high.z
            || other.low.x > this.high.x
            || other.low.y > this.high.y
            || other.low.z > this.high.z);
    }
    /** Test if there is any intersection with other range */
    intersectsRangeXY(other) {
        return !(this.low.x > other.high.x
            || this.low.y > other.high.y
            || other.low.x > this.high.x
            || other.low.y > this.high.y);
    }
    /** Return 0 if the point is within the range, otherwise the distance to the closest face or corner */
    distanceToPoint(point) {
        if (this.isNull)
            return RangeBase._EXTREME_POSITIVE;
        return Math.min(Geometry_1.Geometry.hypotenuseXYZ(RangeBase.coordinateToRangeAbsoluteDistance(point.x, this.low.x, this.high.x), RangeBase.coordinateToRangeAbsoluteDistance(point.y, this.low.y, this.high.y), RangeBase.coordinateToRangeAbsoluteDistance(point.z, this.low.z, this.high.z)), RangeBase._EXTREME_POSITIVE);
    }
    /** returns 0 if the ranges have any overlap, otherwise the shortest absolute distance from one to the other. */
    distanceToRange(other) {
        return Math.min(Geometry_1.Geometry.hypotenuseXYZ(RangeBase.rangeToRangeAbsoluteDistance(this.low.x, this.high.x, other.low.x, other.high.x), RangeBase.rangeToRangeAbsoluteDistance(this.low.y, this.high.y, other.low.y, other.high.y), RangeBase.rangeToRangeAbsoluteDistance(this.low.z, this.high.z, other.low.z, other.high.z)), RangeBase._EXTREME_POSITIVE);
    }
    /** Expand this range by distances a (possibly signed) in all directions */
    extendXYZ(x, y, z) {
        if (x < this.low.x)
            this.low.x = x;
        if (x > this.high.x)
            this.high.x = x;
        if (y < this.low.y)
            this.low.y = y;
        if (y > this.high.y)
            this.high.y = y;
        if (z < this.low.z)
            this.low.z = z;
        if (z > this.high.z)
            this.high.z = z;
    }
    /** Expand this range by distances a (weighted and possibly signed) in all directions */
    extendXYZW(x, y, z, w) {
        if (!Geometry_1.Geometry.isSmallMetricDistance(w))
            this.extendXYZ(x / w, y / w, z / w);
    }
    /** Expand this range to include a point. */
    extendPoint(point) { this.extendXYZ(point.x, point.y, point.z); }
    /** Expand this range to include a transformed point. */
    extendTransformedPoint(transform, point) {
        this.extendTransformedXYZ(transform, point.x, point.y, point.z);
    }
    /** Expand this range to include a range. */
    extendRange(other) {
        if (!Range3d.isNull(other)) {
            this.extendXYZ(other.low.x, other.low.y, other.low.z);
            this.extendXYZ(other.high.x, other.high.y, other.high.z);
        }
    }
    /** Return the intersection of ranges. */
    intersect(other, result) {
        if (!this.intersectsRange(other))
            return Range3d.createNull(result);
        return Range3d.createXYZXYZOrCorrectToNull(Math.max(this.low.x, other.low.x), Math.max(this.low.y, other.low.y), Math.max(this.low.z, other.low.z), Math.min(this.high.x, other.high.x), Math.min(this.high.y, other.high.y), Math.min(this.high.z, other.high.z), result);
    }
    /** Return the union of ranges. */
    union(other, result) {
        if (this.isNull)
            return other.clone(result);
        if (other.isNull)
            return this.clone(result);
        // we trust null ranges have EXTREME values, so a null in either input leads to expected results.
        return Range3d.createXYZXYZOrCorrectToNull(Math.min(this.low.x, other.low.x), Math.min(this.low.y, other.low.y), Math.min(this.low.z, other.low.z), Math.max(this.high.x, other.high.x), Math.max(this.high.y, other.high.y), Math.max(this.high.z, other.high.z), result);
    }
    /**
     * move low and high points by scaleFactor around the center point.
     * @param scaleFactor scale factor applied to low, high distance from center.
     */
    scaleAboutCenterInPlace(scaleFactor) {
        if (!this.isNull) {
            scaleFactor = Math.abs(scaleFactor);
            // do the scalar stuff to avoid making a temporary object ....
            const xMid = 0.5 * (this.low.x + this.high.x);
            const yMid = 0.5 * (this.low.y + this.high.y);
            const zMid = 0.5 * (this.low.z + this.high.z);
            this.high.x = Geometry_1.Geometry.interpolate(xMid, scaleFactor, this.high.x);
            this.high.y = Geometry_1.Geometry.interpolate(yMid, scaleFactor, this.high.y);
            this.high.z = Geometry_1.Geometry.interpolate(zMid, scaleFactor, this.high.z);
            this.low.x = Geometry_1.Geometry.interpolate(xMid, scaleFactor, this.low.x);
            this.low.y = Geometry_1.Geometry.interpolate(yMid, scaleFactor, this.low.y);
            this.low.z = Geometry_1.Geometry.interpolate(zMid, scaleFactor, this.low.z);
        }
    }
    /**
     * move all limits by a fixed amount.
     * * positive delta expands the range size
     * * negative delta reduces the range size
     * * if any dimension reduces below zero size, the whole range becomes null
     * @param delta shift to apply.
     */
    expandInPlace(delta) {
        this.setDirect(this.low.x - delta, this.low.y - delta, this.low.z - delta, this.high.x + delta, this.high.y + delta, this.high.z + delta, true);
    }
    /** Create a local to world transform from this range. */
    getLocalToWorldTransform(result) {
        return Transform_1.Transform.createOriginAndMatrix(Point3dVector3d_1.Point3d.create(this.low.x, this.low.y, this.low.z), Matrix3d_1.Matrix3d.createRowValues(this.high.x - this.low.x, 0, 0, 0, this.high.y - this.low.y, 0, 0, 0, this.high.z - this.low.z), result);
    }
    /**
     * Creates an NPC to world transformation to go from 000...111 to the globally aligned cube with diagonally opposite corners that are the
     * min and max of this range. The diagonal component for any degenerate direction is 1.
     */
    getNpcToWorldRangeTransform(result) {
        const transform = this.getLocalToWorldTransform(result);
        const matrix = transform.matrix;
        if (matrix.coffs[0] === 0)
            matrix.coffs[0] = 1;
        if (matrix.coffs[4] === 0)
            matrix.coffs[4] = 1;
        if (matrix.coffs[8] === 0)
            matrix.coffs[8] = 1;
        return transform;
    }
    /** Ensure that the length of each dimension of this AxisAlignedBox3d is at least a minimum size. If not, expand to minimum about the center.
     * @param min The minimum length for each dimension.
     */
    ensureMinLengths(min = .001) {
        let size = (min - this.xLength()) / 2.0;
        if (size > 0) {
            this.low.x -= size;
            this.high.x += size;
        }
        size = (min - this.yLength()) / 2.0;
        if (size > 0) {
            this.low.y -= size;
            this.high.y += size;
        }
        size = (min - this.zLength()) / 2.0;
        if (size > 0) {
            this.low.z -= size;
            this.high.z += size;
        }
    }
}
exports.Range3d = Range3d;
/**
 * Range on a 1d axis
 * * `low` and `high` members are always non-null objects
 * * having `low > high` indicates an empty range.
 * * the range contains x values for which `low <= x <= high`
 * @public
 */
class Range1d extends RangeBase {
    // explicit ctor - no enforcement of value relationships
    constructor(low = RangeBase._EXTREME_POSITIVE, high = RangeBase._EXTREME_NEGATIVE) {
        super();
        this.low = low;
        this.high = high; // duplicates set_direct, but compiler is not convinced they are set.
        this.setDirect(low, high);
    }
    /** reset the low and high to null range state. */
    setNull() {
        this.low = RangeBase._EXTREME_POSITIVE;
        this.high = RangeBase._EXTREME_NEGATIVE;
    }
    // internal use only -- directly set all coordinates, test only if directed.
    setDirect(low, high, correctToNull = false) {
        this.low = low;
        this.high = high;
        if (correctToNull && low > high)
            this.setNull();
    }
    /** Returns true if this and other have equal low and high parts, or both are null ranges. */
    isAlmostEqual(other) {
        return (Geometry_1.Geometry.isSameCoordinate(this.low, other.low) && Geometry_1.Geometry.isSameCoordinate(this.high, other.high))
            || (this.isNull && other.isNull);
    }
    /** copy contents from other Range1d. */
    setFrom(other) { this.low = other.low; this.high = other.high; }
    /** Convert from a JSON object of one of these forms:
     *
     * *  Any array of numbers: `[value,value, value]`
     * *  An object with low and high as properties: `{low:lowValue, high: highValue}`
     */
    setFromJSON(json) {
        this.setNull();
        if (Array.isArray(json)) {
            let value;
            for (value of json) {
                if (Number.isFinite(value))
                    this.extendX(value);
            }
        }
        else if (json.low !== undefined && Number.isFinite(json.low) && json.high !== undefined && Number.isFinite(json.high)) {
            this.extendX(json.low);
            this.extendX(json.high);
        }
    }
    /** Use `setFromJSON` to parse `json` into a new Range1d instance. */
    static fromJSON(json) {
        const result = new this();
        if (json)
            result.setFromJSON(json);
        return result;
    }
    /** Convert to a JSON object of form
     * ```
     *    [lowValue,highValue]
     * ```
     */
    toJSON() { if (this.isNull)
        return new Array();
    else
        return [this.low, this.high]; }
    /** return a new Range1d with contents of this.
     * @param result optional result.
     */
    clone(result) {
        result = result ? result : new this.constructor();
        result.setDirect(this.low, this.high);
        return result;
    }
    /** return a new Range1d with contents of this.
     * @param result optional result.
     */
    static createFrom(other, result) {
        result = result ? result : new this();
        result.setDirect(other.low, other.high);
        return result;
    }
    /** Create a range with no content.
     * @param result optional result.
     */
    static createNull(result) {
        result = result ? result : new this();
        result.setNull();
        return result;
    }
    /** create a range with `delta` added to low and high
     * * If `this` is a null range, return a null range.
     */
    cloneTranslated(delta, result) {
        result = result ? result : this.clone();
        if (!result.isNull) {
            result.low += delta;
            result.high += delta;
        }
        return result;
    }
    /**
     * Set this range to be a single value.
     * @param x value to use as both low and high.
     */
    setX(x) { this.low = this.high = x; }
    /** Create a single point box */
    static createX(x, result) {
        result = result ? result : new this();
        result.setDirect(x, x);
        return result;
    }
    /** Create a box from two values. Values are reversed if needed
     * @param xA first value
     * @param xB second value
     */
    static createXX(xA, xB, result) {
        result = result ? result : new this();
        result.setDirect(Math.min(xA, xB), Math.max(xA, xB));
        return result;
    }
    /** Create a box from two values, but null range if the values are reversed
     * @param xA first value
     * @param xB second value
     */
    static createXXOrCorrectToNull(xA, xB, result) {
        if (xB < xA)
            return Range1d.createNull(result);
        result = result ? result : new this();
        result.setDirect(Math.min(xA, xB), Math.max(xA, xB));
        return result;
    }
    /** Create a range containing all the values in an array.
     * @param values array of points to be contained in the range.
     * @param result optional result.
     */
    static createArray(values, result) {
        result = result ? result : new this();
        let x;
        for (x of values)
            result.extendX(x);
        return result;
    }
    /** extend to include an array of values */
    extendArray(values) {
        let x;
        for (x of values)
            this.extendX(x);
    }
    /** extend to include `values` at indices `beginIndex <= i < endIndex]`
     * @param values array of values
     * @param beginIndex first index to include
     * @param numValue number of values to access
     */
    extendArraySubset(values, beginIndex, numValue) {
        const endIndex = beginIndex + numValue;
        for (let i = beginIndex; i < endIndex; i++)
            this.extendX(values[i]);
    }
    /** Test if the box has high<low Note that a range around a single point is NOT null. */
    get isNull() {
        return this.high < this.low;
    }
    /** Test of the range contains a single point. */
    get isSinglePoint() {
        return this.high === this.low;
    }
    /** Return the length of the range in the x direction */
    length() { const a = this.high - this.low; return a > 0.0 ? a : 0.0; }
    /** return a point given by fractional positions within the range. This is done with no check for isNull !!! */
    fractionToPoint(fraction) {
        return Geometry_1.Geometry.interpolate(this.low, fraction, this.high);
    }
    /** Return the largest absolute value among the box limits. */
    maxAbs() {
        if (this.isNull)
            return 0.0;
        return Math.max(Math.abs(this.low), Math.abs(this.high));
    }
    /** Test if the x direction size is nearly zero */
    get isAlmostZeroLength() { return Geometry_1.Geometry.isSmallMetricDistance(this.length()); }
    /** Test if a number is within the range. */
    containsX(x) {
        return x >= this.low
            && x <= this.high;
    }
    /** Test of other range is within this range */
    containsRange(other) {
        return other.low >= this.low
            && other.high <= this.high;
    }
    /** Test if there is any intersection with other range */
    intersectsRange(other) {
        return !(this.low > other.high || other.low > this.high);
    }
    /** returns 0 if the ranges have any overlap, otherwise the shortest absolute distance from one to the other. */
    distanceToRange(other) {
        return RangeBase.rangeToRangeAbsoluteDistance(this.low, this.high, other.low, other.high);
    }
    /** Return 0 if the point is within the range, otherwise the (unsigned) distance to the closest face or corner */
    distanceToX(x) {
        if (this.isNull)
            return RangeBase._EXTREME_POSITIVE;
        return RangeBase.coordinateToRangeAbsoluteDistance(x, this.low, this.high);
    }
    /** Expand this range by a single coordinate */
    extendX(x) {
        if (x < this.low)
            this.low = x;
        if (x > this.high)
            this.high = x;
    }
    /** Expand this range to include a range. */
    extendRange(other) {
        if (!other.isNull) {
            this.extendX(other.low);
            this.extendX(other.high);
        }
    }
    /** Return the intersection of ranges. */
    intersect(other, result) {
        if (!this.intersectsRange(other))
            return Range1d.createNull(result);
        return Range1d.createXXOrCorrectToNull(Math.max(this.low, other.low), Math.min(this.high, other.high), result);
    }
    /** Return the union of ranges. */
    /** Return the intersection of ranges. */
    union(other, result) {
        // we trust null ranges have EXTREME values, so a null in either input leads to expected results.
        return Range1d.createXX(Math.min(this.low, other.low), Math.max(this.high, other.high), result);
    }
    /**
     * move low and high points by scaleFactor around the center point.
     * @param scaleFactor scale factor applied to low, high distance from center.
     */
    scaleAboutCenterInPlace(scaleFactor) {
        if (!this.isNull) {
            scaleFactor = Math.abs(scaleFactor);
            // do the scalar stuff to avoid making a temporary object ....
            const xMid = 0.5 * (this.low + this.high);
            this.high = Geometry_1.Geometry.interpolate(xMid, scaleFactor, this.high);
            this.low = Geometry_1.Geometry.interpolate(xMid, scaleFactor, this.low);
        }
    }
    /**
     * move all limits by a fixed amount.
     * * positive delta expands the range size
     * * negative delta reduces the range size
     * * if any dimension reduces below zero size, the whole range becomes null
     * @param delta shift to apply.
     */
    expandInPlace(delta) {
        this.setDirect(this.low - delta, this.high + delta, true);
    }
    /**
     * clip this range to a linear half space condition
     * * if `limitA > limitB` the limit space is empty
     *   * make this range null
     *   * return false;
     * * otherwise (i.e `limitA <= limitB`)
     *   * solve `a + u * f = limitA' and `a + u * f = limitA`
     *   * if unable to solve (i.e. u near zero), `a` alone determines whether to (a) leave this interval unchanged or (b) reduce to nothing.
     *   * the `f` values are an interval in the space of this `Range1d`
     *   * restrict the range to that interval (i.e intersect existing (low,high) with the fraction interval.
     *   * return true if the range is non-null after the clip.
     * @param a constant of linear map
     * @param u coefficient of linear map
     * @param limitA crossing value, assumed in range relation with limitB
     * @param limitB crossing value, assumed in range relation with limitB
     * @param limitIsHigh true if the limit is an upper limit on mapped values.
     *
     */
    clipLinearMapToInterval(a, u, limitA, limitB) {
        // f = (limit - a) / u
        if (limitB < limitA || this.high < this.low)
            return false;
        const fractionA = Geometry_1.Geometry.conditionalDivideFraction(limitA - a, u);
        const fractionB = Geometry_1.Geometry.conditionalDivideFraction(limitB - a, u);
        // single point case
        if (fractionA === undefined || fractionB === undefined) {
            if (limitA <= a && a <= limitB)
                return true;
            this.setNull();
            return false;
        }
        if (fractionA < fractionB) {
            if (fractionA > this.low)
                this.low = fractionA;
            if (fractionB < this.high)
                this.high = fractionB;
        }
        else {
            if (fractionA < this.high)
                this.high = fractionA;
            if (fractionB > this.low)
                this.low = fractionB;
        }
        if (this.high < this.low) {
            this.setNull();
            return false;
        }
        return true;
    }
}
exports.Range1d = Range1d;
/**
 * Range box in xy plane
 * @public
 */
class Range2d extends RangeBase {
    // explicit ctor - no enforcement of value relationships
    constructor(lowX = Range2d._EXTREME_POSITIVE, lowY = Range2d._EXTREME_POSITIVE, highX = Range2d._EXTREME_NEGATIVE, highY = Range2d._EXTREME_NEGATIVE) {
        super();
        this.low = Point2dVector2d_1.Point2d.create(lowX, lowY);
        this.high = Point2dVector2d_1.Point2d.create(highX, highY);
    }
    /** reset the low and high to null range state. */
    setNull() {
        this.low.x = RangeBase._EXTREME_POSITIVE;
        this.low.y = RangeBase._EXTREME_POSITIVE;
        this.high.x = RangeBase._EXTREME_NEGATIVE;
        this.high.y = RangeBase._EXTREME_NEGATIVE;
    }
    /** Flatten the low and high coordinates of any json object with low.x .. high.y into an array of 4 doubles */
    static toFloat64Array(val) { return Float64Array.of(val.low.x, val.low.y, val.high.x, val.high.y); }
    /** Flatten the low and high coordinates of this instance into an array of 4 doubles */
    toFloat64Array() { return Range2d.toFloat64Array(this); }
    /**
     * Construct a Range2d from an array of double-precision values
     * @param f64 the array, which should contain exactly 4 values in this order: lowX, lowY, highX, highY
     * @return a new Range2d object
     */
    static fromFloat64Array(f64) {
        if (f64.length !== 4)
            throw new Error("invalid array");
        return new this(f64[0], f64[1], f64[2], f64[3]);
    }
    /**
     * Construct a Range2d from an un-typed array. This mostly useful when interpreting ECSQL query results of the 'blob' type, where you know that that result is a Range3d.
     * @param buffer untyped array
     * @return a new Range2d object
     */
    static fromArrayBuffer(buffer) { return this.fromFloat64Array(new Float64Array(buffer)); }
    /** Returns true if this and other have equal low and high parts, or both are null ranges. */
    isAlmostEqual(other) {
        return (this.low.isAlmostEqual(other.low) && this.high.isAlmostEqual(other.high))
            || (this.isNull && other.isNull);
    }
    /** copy all content from any `other` that has low and high xy data. */
    setFrom(other) {
        this.low.set(other.low.x, other.low.y);
        this.high.set(other.high.x, other.high.y);
    }
    /** create a new Range2d from any `other` that has low and high xy data. */
    static createFrom(other, result) {
        if (result) {
            result.setFrom(other);
            return result;
        }
        return this.createXYXYOrCorrectToNull(other.low.x, other.low.y, other.high.x, other.high.y, result);
    }
    /** treat any array of numbers as numbers to be inserted !!! */
    setFromJSON(json) {
        this.setNull();
        if (Array.isArray(json)) {
            const point = Point2dVector2d_1.Point2d.create();
            for (const value of json) {
                point.setFromJSON(value);
                this.extendPoint(point);
            }
            return;
        }
        const low = Point2dVector2d_1.Point2d.fromJSON(json.low);
        const high = Point2dVector2d_1.Point2d.fromJSON(json.high);
        if (!RangeBase.isExtremePoint2d(low) && !RangeBase.isExtremePoint2d(high)) {
            this.extendPoint(low);
            this.extendPoint(high);
        }
    }
    /** Freeze this instance (and its deep content) so it can be considered read-only */
    freeze() { Object.freeze(this.low); Object.freeze(this.high); }
    /** return json array with two points as produced by `Point2d.toJSON` */
    toJSON() { return this.isNull ? [] : [this.low.toJSON(), this.high.toJSON()]; }
    /** Use `setFromJSON` to parse `json` into a new Range2d instance. */
    static fromJSON(json) {
        const result = new this();
        if (json)
            result.setFromJSON(json);
        return result;
    }
    // internal use only -- directly set all coordinates, without tests.
    setDirect(xA, yA, xB, yB, correctToNull) {
        this.low.x = xA;
        this.low.y = yA;
        this.high.x = xB;
        this.high.y = yB;
        if (correctToNull) {
            if (this.low.x > this.high.x || this.low.y > this.high.y)
                this.setNull();
        }
    }
    /** return a clone of this range (or copy to optional result) */
    clone(result) {
        result = result ? result : new this.constructor();
        result.setDirect(this.low.x, this.low.y, this.high.x, this.high.y, false);
        return result;
    }
    /** create a range with no content. */
    static createNull(result) {
        result = result ? result : new this();
        result.setNull();
        return result;
    }
    /** Set low and hight to a single xy value. */
    setXY(x, y) {
        this.low.x = this.high.x = x;
        this.low.y = this.high.y = y;
    }
    /** Create a single point box */
    static createXY(x, y, result) {
        result = result ? result : new this();
        result.setDirect(x, y, x, y, false);
        return result;
    }
    /** Create a box with 2 pairs of xy candidates. Theses are compared and shuffled as needed for the box. */
    static createXYXY(xA, yA, xB, yB, result) {
        result = result ? result : new this();
        result.setDirect(Math.min(xA, xB), Math.min(yA, yB), Math.max(xA, xB), Math.max(yA, yB), false);
        return result;
    }
    /** Create a box with 2 pairs of xy candidates. If any direction has order flip, create null. */
    static createXYXYOrCorrectToNull(xA, yA, xB, yB, result) {
        if (xA > xB || yA > yB)
            return this.createNull(result);
        result = result ? result : new this();
        result.setDirect(Math.min(xA, xB), Math.min(yA, yB), Math.max(xA, xB), Math.max(yA, yB), true);
        return result;
    }
    /** Create a range around an array of points. */
    static createArray(points, result) {
        result = result ? result : new this();
        let point;
        for (point of points)
            result.extendPoint(point);
        return result;
    }
    /** Test if the box has high<low for any of x,y, condition. Note that a range around a single point is NOT null. */
    get isNull() {
        return this.high.x < this.low.x
            || this.high.y < this.low.y;
    }
    /** Test if the box has high strictly less than low for any of x,y, condition. Note that a range around a single point is NOT null. */
    static isNull(range) {
        return range.high.x < range.low.x
            || range.high.y < range.low.y;
    }
    /** Test of the range contains a single point. */
    get isSinglePoint() {
        return this.high.x === this.low.x
            && this.high.y === this.low.y;
    }
    /** Return the midpoint of the diagonal.  No test for null range. */
    get center() { return this.low.interpolate(.5, this.high); }
    /** return the low x coordinate */
    get xLow() { return this.low.x; }
    /** return the low y coordinate */
    get yLow() { return this.low.y; }
    /** return the high x coordinate */
    get xHigh() { return this.high.x; }
    /** return the high y coordinate */
    get yHigh() { return this.high.y; }
    /** Length of the box in the x direction */
    xLength() { const a = this.high.x - this.low.x; return a > 0.0 ? a : 0.0; }
    /** Length of the box in the y direction */
    yLength() { const a = this.high.y - this.low.y; return a > 0.0 ? a : 0.0; }
    /** return the diagonal vector. There is no check for isNull -- if the range isNull(), the vector will have very large negative coordinates. */
    diagonal(result) { return this.low.vectorTo(this.high, result); }
    /** return the diagonal vector. There is no check for isNull -- if the range isNull(), the vector will have very large negative coordinates. */
    diagonalFractionToPoint(fraction, result) { return this.low.interpolate(fraction, this.high, result); }
    /** return a point given by fractional positions on the XY axes. This is done with no check for isNull !!! */
    fractionToPoint(fractionX, fractionY, result) {
        return this.low.interpolateXY(fractionX, fractionY, this.high, result);
    }
    /** Return an array with the 4 corners.
     * * if asLoop is false, 4 corners are "x varies fastest, then y"
     * * if asLoop is true, 5 corners are in CCW order WITH CLOSURE
     */
    corners3d(asLoop = false, z = 0) {
        if (asLoop)
            return [
                Point3dVector3d_1.Point3d.create(this.low.x, this.low.y, z),
                Point3dVector3d_1.Point3d.create(this.high.x, this.low.y, z),
                Point3dVector3d_1.Point3d.create(this.high.x, this.high.y, z),
                Point3dVector3d_1.Point3d.create(this.low.x, this.high.y, z),
                Point3dVector3d_1.Point3d.create(this.low.x, this.low.y, z)
            ];
        return [
            Point3dVector3d_1.Point3d.create(this.low.x, this.low.y, z),
            Point3dVector3d_1.Point3d.create(this.high.x, this.low.y, z),
            Point3dVector3d_1.Point3d.create(this.low.x, this.high.y, z),
            Point3dVector3d_1.Point3d.create(this.high.x, this.high.y, z)
        ];
    }
    /** Largest absolute value among any coordinates in the box corners. */
    maxAbs() {
        if (this.isNull)
            return 0.0;
        return Math.max(this.low.maxAbs(), this.high.maxAbs());
    }
    /** Test if the x direction size is nearly zero */
    get isAlmostZeroX() { return Geometry_1.Geometry.isSmallMetricDistance(this.xLength()); }
    /** Test if the y direction size is nearly zero */
    get isAlmostZeroY() { return Geometry_1.Geometry.isSmallMetricDistance(this.yLength()); }
    /** Test if a point given as x,y is within the range. */
    containsXY(x, y) {
        return x >= this.low.x
            && y >= this.low.y
            && x <= this.high.x
            && y <= this.high.y;
    }
    /** Test if a point is within the range. */
    containsPoint(point) { return this.containsXY(point.x, point.y); }
    /** Test of other range is within this range */
    containsRange(other) {
        return other.low.x >= this.low.x
            && other.low.y >= this.low.y
            && other.high.x <= this.high.x
            && other.high.y <= this.high.y;
    }
    /** Test if there is any intersection with other range */
    intersectsRange(other) {
        return !(this.low.x > other.high.x
            || this.low.y > other.high.y
            || other.low.x > this.high.x
            || other.low.y > this.high.y);
    }
    /** Return 0 if the point is within the range, otherwise the distance to the closest face or corner */
    distanceToPoint(point) {
        if (this.isNull)
            return Range2d._EXTREME_POSITIVE;
        return Math.min(Geometry_1.Geometry.hypotenuseXY(RangeBase.coordinateToRangeAbsoluteDistance(point.x, this.low.x, this.high.x), RangeBase.coordinateToRangeAbsoluteDistance(point.y, this.low.y, this.high.y)), Range2d._EXTREME_POSITIVE);
    }
    /** Return 0 if the point is within the range, otherwise the distance to the closest face or corner */
    distanceToRange(other) {
        return Math.min(Geometry_1.Geometry.hypotenuseXY(RangeBase.rangeToRangeAbsoluteDistance(this.low.x, this.high.x, other.low.x, other.high.x), RangeBase.rangeToRangeAbsoluteDistance(this.low.y, this.high.y, other.low.y, other.high.y)), Range2d._EXTREME_POSITIVE);
    }
    /** Expand this range to include a point given by x,y */
    extendXY(x, y) {
        if (x < this.low.x)
            this.low.x = x;
        if (x > this.high.x)
            this.high.x = x;
        if (y < this.low.y)
            this.low.y = y;
        if (y > this.high.y)
            this.high.y = y;
    }
    /** Expand this range to include a point given by x,y */
    extendTransformedXY(transform, x, y) {
        const x1 = transform.multiplyComponentXYZ(0, x, y, 0);
        const y1 = transform.multiplyComponentXYZ(1, x, y, 0);
        this.extendXY(x1, y1);
    }
    /** Expand this range to include a point. */
    extendPoint(point) { this.extendXY(point.x, point.y); }
    /** Expand this range to include a range. */
    extendRange(other) {
        if (!Range2d.isNull(other)) {
            this.extendXY(other.low.x, other.low.y);
            this.extendXY(other.high.x, other.high.y);
        }
    }
    /** Return the intersection of ranges. */
    intersect(other, result) {
        if (!this.intersectsRange(other))
            return Range2d.createNull(result);
        return Range2d.createXYXY(Math.max(this.low.x, other.low.x), Math.max(this.low.y, other.low.y), Math.min(this.high.x, other.high.x), Math.min(this.high.y, other.high.y), result);
    }
    /** Return the union of ranges. */
    union(other, result) {
        if (this.isNull)
            return Range2d.createFrom(other, result);
        if (Range2d.isNull(other))
            return this.clone(result);
        // we trust null ranges have EXTREME values, so a null in either input leads to expected results.
        return Range2d.createXYXY(Math.min(this.low.x, other.low.x), Math.min(this.low.y, other.low.y), Math.max(this.high.x, other.high.x), Math.max(this.high.y, other.high.y), result);
    }
    /**
     * move low and high points by scaleFactor around the center point.
     * @param scaleFactor scale factor applied to low, high distance from center.
     */
    scaleAboutCenterInPlace(scaleFactor) {
        if (!this.isNull) {
            scaleFactor = Math.abs(scaleFactor);
            // do the scalar stuff to avoid making a temporary object ....
            const xMid = 0.5 * (this.low.x + this.high.x);
            const yMid = 0.5 * (this.low.y + this.high.y);
            this.high.x = Geometry_1.Geometry.interpolate(xMid, scaleFactor, this.high.x);
            this.high.y = Geometry_1.Geometry.interpolate(yMid, scaleFactor, this.high.y);
            this.low.x = Geometry_1.Geometry.interpolate(xMid, scaleFactor, this.low.x);
            this.low.y = Geometry_1.Geometry.interpolate(yMid, scaleFactor, this.low.y);
        }
    }
    /**
     * move all limits by a fixed amount.
     * * positive delta expands the range size
     * * negative delta reduces the range size
     * * if any dimension reduces below zero size, the whole range becomes null
     * @param delta shift to apply.
     */
    expandInPlace(delta) {
        this.setDirect(this.low.x - delta, this.low.y - delta, this.high.x + delta, this.high.y + delta, true);
    }
}
exports.Range2d = Range2d;
//# sourceMappingURL=Range.js.map