"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
// cspell:word JSONXY
// cspell:word CWXY
const Geometry_1 = require("../Geometry");
const Angle_1 = require("./Angle");
/** Minimal object containing x,y and operations that are meaningful without change in both point and vector.
 *  * `XY` is not instantiable.
 *  * The derived (instantiable) classes are
 *    * `Point2d`
 *    * `Vector2d`
 * @public
 */
class XY {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    /** Set both x and y. */
    set(x = 0, y = 0) { this.x = x; this.y = y; }
    /** Set both x and y to zero */
    setZero() { this.x = 0; this.y = 0; }
    /** Set both x and y from other. */
    setFrom(other) {
        if (other) {
            this.x = other.x;
            this.y = other.y;
        }
        else {
            this.x = 0;
            this.y = 0;
        }
    }
    /** Freeze this instance (and its deep content) so it can be considered read-only */
    freeze() { Object.freeze(this); }
    /** Returns true if this and other have equal x,y parts within Geometry.smallMetricDistance. */
    isAlmostEqual(other, tol) { return Geometry_1.Geometry.isSameCoordinate(this.x, other.x, tol) && Geometry_1.Geometry.isSameCoordinate(this.y, other.y, tol); }
    /** Returns true if this and other have equal x,y parts within Geometry.smallMetricDistance. */
    isAlmostEqualXY(x, y, tol) { return Geometry_1.Geometry.isSameCoordinate(this.x, x, tol) && Geometry_1.Geometry.isSameCoordinate(this.y, y, tol); }
    /** return a json array  `[x,y]`   */
    toJSON() { return [this.x, this.y]; }
    /** return a json object `{x: 1, y:2}`  */
    toJSONXY() { return { x: this.x, y: this.y }; }
    /** Set x and y from a JSON source such as `[1,2]` or `{x:1, y:2}` */
    setFromJSON(json) {
        if (Array.isArray(json)) {
            this.set(json[0] || 0, json[1] || 0);
            return;
        }
        if (json) {
            this.set(json.x || 0, json.y || 0);
            return;
        }
        this.set(0, 0);
    }
    /** Return the distance from this point to other */
    distance(other) {
        const xDist = other.x - this.x;
        const yDist = other.y - this.y;
        return (Math.sqrt(xDist * xDist + yDist * yDist));
    }
    /** Return squared distance from this point to other */
    distanceSquared(other) {
        const xDist = other.x - this.x;
        const yDist = other.y - this.y;
        return (xDist * xDist + yDist * yDist);
    }
    /** Return the largest absolute distance between corresponding components */
    maxDiff(other) {
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
    }
    /** returns true if the x,y components are both small by metric metric tolerance */
    get isAlmostZero() {
        return Geometry_1.Geometry.isSmallMetricDistance(this.x) && Geometry_1.Geometry.isSmallMetricDistance(this.y);
    }
    /** Return the largest absolute value of any component */
    maxAbs() { return Math.max(Math.abs(this.x), Math.abs(this.y)); }
    /** Return the magnitude of the vector */
    magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    /** Return the squared magnitude of the vector.  */
    magnitudeSquared() { return this.x * this.x + this.y * this.y; }
    /** returns true if the x,y components are exactly equal. */
    isExactEqual(other) { return this.x === other.x && this.y === other.y; }
    /** returns true if x,y match `other` within metric tolerance */
    isAlmostEqualMetric(other) { return this.maxDiff(other) <= Geometry_1.Geometry.smallMetricDistance; }
    /** Return a (full length) vector from this point to other */
    vectorTo(other, result) {
        return Vector2d.create(other.x - this.x, other.y - this.y, result);
    }
    /** Return a unit vector from this point to other */
    unitVectorTo(target, result) {
        return this.vectorTo(target, result).normalize(result);
    }
    /** cross product of vectors from origin to targets */
    static crossProductToPoints(origin, targetA, targetB) {
        return Geometry_1.Geometry.crossProductXYXY(targetA.x - origin.x, targetA.y - origin.y, targetB.x - origin.x, targetB.y - origin.y);
    }
}
exports.XY = XY;
/** 2D point with `x`,`y` as properties
 * @public
 */
class Point2d extends XY {
    /** Constructor for Point2d */
    constructor(x = 0, y = 0) { super(x, y); }
    /** return a new Point2d with x,y coordinates from this. */
    clone() { return new Point2d(this.x, this.y); }
    /**
     * Return a point (newly created unless result provided) with given x,y coordinates
     * @param x x coordinate
     * @param y y coordinate
     * @param result optional result
     */
    static create(x = 0, y = 0, result) {
        if (result) {
            result.x = x;
            result.y = y;
            return result;
        }
        return new Point2d(x, y);
    }
    /** Convert JSON `[1,2]` or `{x:1, y:2}` to a Point2d instance */
    static fromJSON(json) { const val = new Point2d(); val.setFromJSON(json); return val; }
    /** Create (or optionally reuse) a Point2d from another object with fields x and y */
    static createFrom(xy, result) {
        if (xy)
            return Point2d.create(xy.x, xy.y, result);
        return Point2d.create(0, 0, result);
    }
    /** Create a Point2d with both coordinates zero. */
    static createZero(result) { return Point2d.create(0, 0, result); }
    /** Starting at this point, move along vector by tangentFraction of the vector length, and to the left by leftFraction of
     * the perpendicular vector length.
     * @param tangentFraction distance to move along the vector, as a fraction of vector
     * @param leftFraction distance to move perpendicular to the vector, as a fraction of the rotated vector
     */
    addForwardLeft(tangentFraction, leftFraction, vector) {
        const dx = vector.x;
        const dy = vector.y;
        return Point2d.create(this.x + tangentFraction * dx - leftFraction * dy, this.y + tangentFraction * dy + leftFraction * dx);
    }
    /** Interpolate at tangentFraction between this instance and point.   Move by leftFraction along the xy perpendicular
     * of the vector between the points.
     */
    forwardLeftInterpolate(tangentFraction, leftFraction, point) {
        const dx = point.x - this.x;
        const dy = point.y - this.y;
        return Point2d.create(this.x + tangentFraction * dx - leftFraction * dy, this.y + tangentFraction * dy + leftFraction * dx);
    }
    /** Return a point interpolated between this point and the right param. */
    interpolate(fraction, other, result) {
        if (fraction <= 0.5)
            return Point2d.create(this.x + fraction * (other.x - this.x), this.y + fraction * (other.y - this.y), result);
        const t = fraction - 1.0;
        return Point2d.create(other.x + t * (other.x - this.x), other.y + t * (other.y - this.y), result);
    }
    /** Return a point with independent x,y fractional interpolation. */
    interpolateXY(fractionX, fractionY, other, result) {
        return Point2d.create(Geometry_1.Geometry.interpolate(this.x, fractionX, other.x), Geometry_1.Geometry.interpolate(this.y, fractionY, other.y), result);
    }
    /** Return this point minus vector */
    minus(vector, result) {
        return Point2d.create(this.x - vector.x, this.y - vector.y, result);
    }
    /** Return point plus vector */
    plus(vector, result) {
        return Point2d.create(this.x + vector.x, this.y + vector.y, result);
    }
    /** Return point plus vector */
    plusXY(dx = 0, dy = 0, result) {
        return Point2d.create(this.x + dx, this.y + dy, result);
    }
    /** Return point + vector * scalar */
    plusScaled(vector, scaleFactor, result) {
        return Point2d.create(this.x + vector.x * scaleFactor, this.y + vector.y * scaleFactor, result);
    }
    /** Return point + vectorA * scalarA + vectorB * scalarB */
    plus2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        return Point2d.create(this.x + vectorA.x * scalarA + vectorB.x * scalarB, this.y + vectorA.y * scalarA + vectorB.y * scalarB, result);
    }
    /** Return point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC */
    plus3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        return Point2d.create(this.x + vectorA.x * scalarA + vectorB.x * scalarB + vectorC.x * scalarC, this.y + vectorA.y * scalarA + vectorB.y * scalarB + vectorC.y * scalarC, result);
    }
    /**
     * Return the dot product of vector from this to targetA and vector from this to targetB
     * @param targetA target of first vector
     * @param targetB target of second vector
     */
    dotVectorsToTargets(targetA, targetB) {
        return (targetA.x - this.x) * (targetB.x - this.x) +
            (targetA.y - this.y) * (targetB.y - this.y);
    }
    /** Returns the (scalar) cross product of two points/vectors, computed from origin to target1 and target2 */
    crossProductToPoints(target1, target2) {
        const x1 = target1.x - this.x;
        const y1 = target1.y - this.y;
        const x2 = target2.x - this.x;
        const y2 = target2.y - this.y;
        return x1 * y2 - y1 * x2;
    }
    /** Return the fractional coordinate of the projection of this instance x,y onto the line from startPoint to endPoint.
     * @param startPoint start point of line
     * @param endPoint end point of line
     * @param defaultFraction fraction to return if startPoint and endPoint are equal.
     */
    fractionOfProjectionToLine(startPoint, endPoint, defaultFraction) {
        const denominator = startPoint.distanceSquared(endPoint);
        if (denominator < Geometry_1.Geometry.smallMetricDistanceSquared)
            return defaultFraction ? defaultFraction : 0;
        return startPoint.dotVectorsToTargets(endPoint, this) / denominator;
    }
}
exports.Point2d = Point2d;
/** 2D vector with `x`,`y` as properties
 * @public
 */
class Vector2d extends XY {
    constructor(x = 0, y = 0) { super(x, y); }
    /** Return a new Vector2d with the same x,y */
    clone() { return new Vector2d(this.x, this.y); }
    /** Return a new Vector2d with given x and y */
    static create(x = 0, y = 0, result) {
        if (result) {
            result.x = x;
            result.y = y;
            return result;
        }
        return new Vector2d(x, y);
    }
    /** Return a (new) Vector2d with components 1,0 */
    static unitX(scale = 1) { return new Vector2d(scale, 0); }
    /** Return a (new) Vector2d with components 0,1 */
    static unitY(scale = 1) { return new Vector2d(0, scale); }
    /** Return a Vector2d with components 0,0 */
    static createZero(result) { return Vector2d.create(0, 0, result); }
    /** copy contents from another Point3d, Point2d, Vector2d, or Vector3d, or leading entries of Float64Array */
    static createFrom(data, result) {
        if (data instanceof Float64Array) {
            if (data.length >= 2)
                return Vector2d.create(data[0], data[1]);
            if (data.length >= 1)
                return Vector2d.create(data[0], 0);
            return Vector2d.create(0, 0);
        }
        return Vector2d.create(data.x, data.y, result);
    }
    /** Return a new Vector2d from json structured as `[1,2]` or `{x:1,y:2}` */
    static fromJSON(json) { const val = new Vector2d(); val.setFromJSON(json); return val; }
    /** Return a new Vector2d from polar coordinates for radius and Angle from x axis */
    static createPolar(r, theta) {
        return Vector2d.create(r * theta.cos(), r * theta.sin());
    }
    /** Return a new Vector2d extending from point0 to point1 */
    static createStartEnd(point0, point1, result) {
        return Vector2d.create(point1.x - point0.x, point1.y - point0.y, result);
    }
    /**
     * Return a vector that bisects the angle between two normals and extends to the intersection of two offset lines
     * @param unitPerpA unit perpendicular to incoming direction
     * @param unitPerpB  unit perpendicular to outgoing direction
     * @param offset offset distance
     */
    static createOffsetBisector(unitPerpA, unitPerpB, offset) {
        let bisector = unitPerpA.plus(unitPerpB);
        bisector = bisector.normalize();
        if (bisector) {
            const c = offset * bisector.dotProduct(unitPerpA);
            return bisector.safeDivideOrNull(c);
        }
        return undefined;
    }
    /** Return a (new or optionally reused) vector which is `this` divided by denominator
     * * return undefined if denominator is zero.
     */
    safeDivideOrNull(denominator, result) {
        if (denominator !== 0.0) {
            return this.scale(1.0 / denominator, result);
        }
        return undefined;
    }
    /** Return a unit vector in direction of this instance (undefined if this instance has near zero length) */
    normalize(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.magnitude());
        result = result ? result : new Vector2d();
        return this.safeDivideOrNull(mag, result);
    }
    /** return the fractional projection of spaceVector onto this */
    fractionOfProjectionToVector(target, defaultFraction) {
        const numerator = this.dotProduct(target);
        const denominator = target.magnitudeSquared();
        if (denominator < Geometry_1.Geometry.smallMetricDistanceSquared)
            return defaultFraction ? defaultFraction : 0;
        return numerator / denominator;
    }
    /** Return a new vector with components negated from this instance. */
    negate(result) {
        result = result ? result : new Vector2d();
        result.x = -this.x;
        result.y = -this.y;
        return result;
    }
    /** Return a vector same length as this but rotated 90 degrees counter clockwise */
    rotate90CCWXY(result) {
        result = result ? result : new Vector2d();
        // save x,y to allow aliasing ..
        const xx = this.x;
        const yy = this.y;
        result.x = -yy;
        result.y = xx;
        return result;
    }
    /** Return a vector same length as this but rotated 90 degrees clockwise */
    rotate90CWXY(result) {
        result = result ? result : new Vector2d();
        // save x,y to allow aliasing ..
        const xx = this.x;
        const yy = this.y;
        result.x = yy;
        result.y = -xx;
        return result;
    }
    /** Return a unit vector perpendicular to this instance. */
    unitPerpendicularXY(result) {
        result = result ? result : new Vector2d();
        const xx = this.x;
        const yy = this.y;
        result.x = -yy;
        result.y = xx;
        const d2 = xx * xx + yy * yy;
        if (d2 !== 0.0) {
            const a = 1.0 / Math.sqrt(d2);
            result.x *= a;
            result.y *= a;
        }
        return result;
    }
    /** return a new Vector2d rotated CCW by given angle */
    rotateXY(angle, result) {
        const s = angle.sin();
        const c = angle.cos();
        const xx = this.x;
        const yy = this.y;
        result = result ? result : new Vector2d();
        result.x = xx * c - yy * s;
        result.y = xx * s + yy * c;
        return result;
    }
    /** return the interpolation {this + fraction * (right - this)} */
    interpolate(fraction, right, result) {
        result = result ? result : new Vector2d();
        /* For best last-bit behavior, if fraction is below 0.5, use this as base point.   If above 0.5, use right as base point.   */
        if (fraction <= 0.5) {
            result.x = this.x + fraction * (right.x - this.x);
            result.y = this.y + fraction * (right.y - this.y);
        }
        else {
            const t = fraction - 1.0;
            result.x = right.x + t * (right.x - this.x);
            result.y = right.y + t * (right.y - this.y);
        }
        return result;
    }
    /** return {this + vector}. */
    plus(vector, result) {
        result = result ? result : new Vector2d();
        result.x = this.x + vector.x;
        result.y = this.y + vector.y;
        return result;
    }
    /** return {this - vector}. */
    minus(vector, result) {
        result = result ? result : new Vector2d();
        result.x = this.x - vector.x;
        result.y = this.y - vector.y;
        return result;
    }
    /** Return {point + vector \* scalar} */
    plusScaled(vector, scaleFactor, result) {
        result = result ? result : new Vector2d();
        result.x = this.x + vector.x * scaleFactor;
        result.y = this.y + vector.y * scaleFactor;
        return result;
    }
    /** Return {point + vectorA \* scalarA + vectorB \* scalarB} */
    plus2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        result = result ? result : new Vector2d();
        result.x = this.x + vectorA.x * scalarA + vectorB.x * scalarB;
        result.y = this.y + vectorA.y * scalarA + vectorB.y * scalarB;
        return result;
    }
    /** Return {this + vectorA \* scalarA + vectorB \* scalarB + vectorC \* scalarC} */
    plus3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        result = result ? result : new Vector2d();
        result.x = this.x + vectorA.x * scalarA + vectorB.x * scalarB + vectorC.x * scalarC;
        result.y = this.y + vectorA.y * scalarA + vectorB.y * scalarB + vectorC.y * scalarC;
        return result;
    }
    /** Return {this * scale} */
    scale(scale, result) {
        result = result ? result : new Vector2d();
        result.x = this.x * scale;
        result.y = this.y * scale;
        return result;
    }
    /** return a vector parallel to this but with specified length */
    scaleToLength(length, result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.magnitude());
        if (mag === 0)
            return undefined;
        return this.scale(length / mag, result);
    }
    /** return the dot product of this with vectorB */
    dotProduct(vectorB) { return this.x * vectorB.x + this.y * vectorB.y; }
    /** dot product with vector from pointA to pointB */
    dotProductStartEnd(pointA, pointB) {
        return this.x * (pointB.x - pointA.x)
            + this.y * (pointB.y - pointA.y);
    }
    /** vector cross product {this CROSS vectorB} */
    crossProduct(vectorB) { return this.x * vectorB.y - this.y * vectorB.x; }
    /** return the (signed) angle from this to vectorB.   This is positive if the shortest turn is counterclockwise, negative if clockwise. */
    angleTo(vectorB) {
        return Angle_1.Angle.createAtan2(this.crossProduct(vectorB), this.dotProduct(vectorB));
    }
    /*  smallerUnorientedAngleTo(vectorB: Vector2d): Angle { }
      signedAngleTo(vectorB: Vector2d, upVector: Vector2d): Angle { }
      planarAngleTo(vectorB: Vector2d, planeNormal: Vector2d): Angle { }
      // sectors
      isInSmallerSector(vectorA: Vector2d, vectorB: Vector2d): boolean { }
      isInCCWSector(vectorA: Vector2d, vectorB: Vector2d, upVector: Vector2d): boolean { }
      */
    /**
     * Test if `this` and `other` area parallel, with angle tolerance `Geometry.smallAngleRadiansSquared`.
     * @param other second vector for comparison.
     * @param oppositeIsParallel if true, treat vectors 180 opposite as parallel.  If false, treat those as non-parallel.
     */
    isParallelTo(other, oppositeIsParallel = false) {
        const a2 = this.magnitudeSquared();
        const b2 = other.magnitudeSquared();
        // we know both are 0 or positive -- no need for
        if (a2 < Geometry_1.Geometry.smallMetricDistanceSquared || b2 < Geometry_1.Geometry.smallMetricDistanceSquared)
            return false;
        const dot = this.dotProduct(other);
        if (dot < 0.0 && !oppositeIsParallel)
            return false;
        const cross = this.crossProduct(other);
        /* a2,b2,cross2 are squared lengths of respective vectors */
        /* cross2 = sin^2(theta) * a2 * b2 */
        /* For small theta, sin^2(theta)~~theta^2 */
        return cross * cross <= Geometry_1.Geometry.smallAngleRadiansSquared * a2 * b2;
    }
    /**
     * Returns `true` if `this` vector is perpendicular to `other`.
     * @param other second vector.
     */
    isPerpendicularTo(other) {
        return Angle_1.Angle.isPerpendicularDotSet(this.magnitudeSquared(), other.magnitudeSquared(), this.dotProduct(other));
    }
}
exports.Vector2d = Vector2d;
//# sourceMappingURL=Point2dVector2d.js.map