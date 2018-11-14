"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Point4d_1 = require("../geometry4d/Point4d");
const Plane3dByOriginAndUnitNormal_1 = require("../geometry3d/Plane3dByOriginAndUnitNormal");
const Geometry_1 = require("../Geometry");
const GrowableArray_1 = require("../geometry3d/GrowableArray");
const Polynomials_1 = require("../numerics/Polynomials");
const ClipUtils_1 = require("./ClipUtils");
/** A ClipPlane is a single plane represented as
 * * An inward unit normal (u,v,w)
 * * A signedDistance
 *
 * Hence
 * * The halfspace function evaluation for "point" [x,y,z,] is: ([x,y,z] DOT (u,v,w)l - signedDistance)
 * * POSITIVE values of the halfspace function are "inside"
 * * ZERO value of the halfspace function is "on"
 * * NEGATIVE value of the halfspace function is "outside"
 * * A representative point on the plane is (signedDistance*u, signedDistance * v, signedDistance *w)
 */
class ClipPlane {
    constructor(normal, distance, invisible, interior) {
        this._invisible = invisible;
        this._interior = interior;
        this._inwardNormal = normal;
        this._distanceFromOrigin = distance;
    }
    /**
     * @returns Return true if all members are almostEqual to corresponding members of other.
     * @param other clip plane to compare
     */
    isAlmostEqual(other) {
        return Geometry_1.Geometry.isSameCoordinate(this._distanceFromOrigin, other._distanceFromOrigin)
            && this._inwardNormal.isAlmostEqual(other._inwardNormal)
            && this._interior === other._interior
            && this._invisible === other._invisible;
    }
    /** @return a cloned plane */
    clone() {
        const result = new ClipPlane(this._inwardNormal.clone(), this._distanceFromOrigin, this._invisible, this._interior);
        return result;
    }
    /** @return Return a cloned plane with coordinate data negated. */
    cloneNegated() {
        const plane = new ClipPlane(this._inwardNormal.clone(), this._distanceFromOrigin, this._invisible, this._interior);
        plane.negateInPlace();
        return plane;
    }
    /** Create a ClipPlane from Plane3dByOriginAndUnitNormal. */
    static createPlane(plane, invisible = false, interior = false, result) {
        const distance = plane.getNormalRef().dotProduct(plane.getOriginRef());
        if (result) {
            result._invisible = invisible;
            result._interior = interior;
            result._inwardNormal = plane.getNormalRef().clone();
            result._distanceFromOrigin = distance;
            return result;
        }
        return new ClipPlane(plane.getNormalRef().clone(), distance, invisible, interior);
    }
    /**
     * * Create a ClipPlane with direct normal and signedDistance.
     * * The vector is normalized for storage.
     */
    static createNormalAndDistance(normal, distance, invisible = false, interior = false, result) {
        const normalized = normal.normalize();
        if (normalized) {
            if (result) {
                result._invisible = invisible;
                result._interior = interior;
                result._inwardNormal = normalized;
                result._distanceFromOrigin = distance;
            }
            return new ClipPlane(normalized, distance, invisible, interior);
        }
        return undefined;
    }
    /** Create a ClipPlane
     * * "normal" is the inward normal of the plane. (It is internally normalized)
     * * "point" is any point of the plane.
     * * The stored distance for the plane is the dot product of the point with the normal (i.e. treat the point's xyz as a vector from the origin.)
     */
    static createNormalAndPoint(normal, point, invisible = false, interior = false, result) {
        const normalized = normal.normalize();
        if (normalized) {
            const distance = normalized.dotProduct(point);
            if (result) {
                result._invisible = invisible;
                result._interior = interior;
                result._inwardNormal = normalized;
                result._distanceFromOrigin = distance;
            }
            return new ClipPlane(normalized, distance, invisible, interior);
        }
        return undefined;
    }
    /** Create a ClipPlane
     * * "normal" is the inward normal of the plane. (It is internally normalized)
     * * "point" is any point of the plane.
     * * The stored distance for the plane is the dot product of the point with the normal (i.e. treat the point's xyz as a vector from the origin.)
     */
    static createNormalAndPointXYZXYZ(normalX, normalY, normalZ, originX, originY, originZ, invisible = false, interior = false) {
        const normal = Point3dVector3d_1.Vector3d.create(normalX, normalY, normalZ);
        const normalized = normal.normalizeInPlace();
        if (normalized) {
            const distance = normal.dotProductXYZ(originX, originY, originZ);
            return new ClipPlane(normal, distance, invisible, interior);
        }
        return undefined;
    }
    /**
     * return a json object of the form
     * `{"normal":[u,v,w],"dist":signedDistanceValue,"interior":true,"invisible":true}`
     */
    toJSON() {
        const val = {};
        val.normal = this.inwardNormalRef.toJSON();
        val.dist = this.distance;
        if (this.interior)
            val.interior = true;
        if (this.invisible)
            val.invisible = true;
        return val;
    }
    static fromJSON(json, result) {
        if (json && json.normal && Number.isFinite(json.dist)) {
            return ClipPlane.createNormalAndDistance(Point3dVector3d_1.Vector3d.fromJSON(json.normal), json.dist, !!json.invisible, !!json.interior);
        }
        return ClipPlane.createNormalAndDistance(Point3dVector3d_1.Vector3d.unitZ(), 0, false, false, result);
    }
    setFlags(invisible, interior) {
        this._invisible = invisible;
        this._interior = interior;
    }
    // Getters
    get distance() { return this._distanceFromOrigin; }
    get inwardNormalRef() { return this._inwardNormal; }
    get interior() { return this._interior; }
    get invisible() { return this._invisible; }
    static createEdgeAndUpVector(point0, point1, upVector, tiltAngle, result) {
        const edgeVector = Point3dVector3d_1.Vector3d.createFrom(point1.minus(point0));
        let normal = (upVector.crossProduct(edgeVector)).normalize();
        if (normal) {
            if (!tiltAngle.isAlmostZero) {
                const tiltNormal = Point3dVector3d_1.Vector3d.createRotateVectorAroundVector(normal, edgeVector, tiltAngle);
                if (tiltNormal) {
                    normal = tiltNormal.clone();
                }
            }
            normal.negate(normal);
            return ClipPlane.createNormalAndPoint(normal, point0, false, false, result);
        }
        return undefined;
    }
    static createEdgeXY(point0, point1, result) {
        const normal = Point3dVector3d_1.Vector3d.create(point0.y - point1.y, point1.x - point0.x);
        if (normal.normalizeInPlace())
            return ClipPlane.createNormalAndPoint(normal, point0, false, false, result);
        return undefined;
    }
    getPlane3d() {
        const d = this._distanceFromOrigin;
        // Normal should be normalized, will not return undefined
        return Plane3dByOriginAndUnitNormal_1.Plane3dByOriginAndUnitNormal.create(Point3dVector3d_1.Point3d.create(this._inwardNormal.x * d, this._inwardNormal.y * d, this._inwardNormal.z * d), this._inwardNormal);
    }
    getPlane4d() {
        return Point4d_1.Point4d.create(this._inwardNormal.x, this._inwardNormal.y, this._inwardNormal.z, -this._distanceFromOrigin);
    }
    setPlane4d(plane) {
        const a = Math.sqrt(plane.x * plane.x + plane.y * plane.y + plane.z * plane.z);
        const r = a === 0.0 ? 1.0 : 1.0 / a;
        this._inwardNormal.x = r * plane.x;
        this._inwardNormal.y = r * plane.y;
        this._inwardNormal.z = r * plane.z;
        this._distanceFromOrigin = -r * plane.w;
    }
    evaluatePoint(point) {
        return point.x * this._inwardNormal.x + point.y * this._inwardNormal.y + point.z * this._inwardNormal.z - this._distanceFromOrigin;
    }
    /** @returns return the dot product of the plane normal with the vector (NOT using the plane's distanceFromOrigin).
     */
    dotProductVector(vector) {
        return vector.x * this._inwardNormal.x + vector.y * this._inwardNormal.y + vector.z * this._inwardNormal.z;
    }
    /** @returns return the dot product of the plane normal with the point (treating the point xyz as a vector, and NOT using the plane's distanceFromOrigin).
     */
    dotProductPlaneNormalPoint(point) {
        return point.x * this._inwardNormal.x + point.y * this._inwardNormal.y + point.z * this._inwardNormal.z;
    }
    isPointOnOrInside(point, tolerance) {
        let value = this.evaluatePoint(point);
        if (tolerance) {
            value += tolerance;
        }
        return value >= 0.0;
    }
    isPointInside(point, tolerance) {
        let value = this.evaluatePoint(point);
        if (tolerance) {
            value += tolerance;
        }
        return value > 0.0;
    }
    isPointOn(point, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        return Math.abs(this.evaluatePoint(point)) <= tolerance;
    }
    appendIntersectionRadians(arc, intersectionRadians) {
        const arcVectors = arc.toVectors();
        const alpha = this.evaluatePoint(arc.center);
        const beta = this.dotProductVector(arcVectors.vector0);
        const gamma = this.dotProductVector(arcVectors.vector90);
        Polynomials_1.AnalyticRoots.appendImplicitLineUnitCircleIntersections(alpha, beta, gamma, undefined, undefined, intersectionRadians);
    }
    announceClippedArcIntervals(arc, announce) {
        const breaks = ClipPlane._clipArcFractionArray;
        breaks.clear();
        this.appendIntersectionRadians(arc, breaks);
        arc.sweep.radiansArraytoPositivePeriodicFractions(breaks);
        return ClipUtils_1.ClipUtilities.selectIntervals01(arc, breaks, this, announce);
    }
    /**
     * * Compute intersection of (unbounded) segment with the plane.
     * * If the ends are on the same side of the plane, return undefined.
     * * If the intersection is an endpoint or interior to the segment return the fraction.
     * * If both ends are on, return undefined.
     */
    getBoundedSegmentSimpleIntersection(pointA, pointB) {
        const h0 = this.evaluatePoint(pointA);
        const h1 = this.evaluatePoint(pointB);
        if (h0 * h1 > 0.0)
            return undefined;
        if (h0 === 0.0 && h1 === 0.0) {
            return undefined;
        }
        return -h0 / (h1 - h0);
    }
    // Returns true if successful
    transformInPlace(transform) {
        const plane = this.getPlane3d();
        const matrix = transform.matrix;
        const newPoint = transform.multiplyPoint3d(plane.getOriginRef());
        // Normal transforms as the inverse transpose of the matrix part
        // BTW: If the matrix is orthogonal, this is a long way to multiply by the matrix part (mumble grumble)
        const newNormal = matrix.multiplyInverseTranspose(plane.getNormalRef());
        if (!newNormal)
            return false;
        plane.set(newPoint, newNormal);
        const normalized = (plane.getNormalRef()).normalize();
        if (!normalized)
            return false;
        this._inwardNormal = normalized;
        this._distanceFromOrigin = this._inwardNormal.dotProduct(plane.getOriginRef());
        return true;
    }
    setInvisible(invisible) {
        this._invisible = invisible;
    }
    /**  reverse the sign of all coefficients, so outside and inside reverse */
    negateInPlace() {
        this._inwardNormal = this._inwardNormal.negate();
        this._distanceFromOrigin = -this._distanceFromOrigin;
    }
    /**
     * Move the plane INWARD by given distance
     * @param offset distance of shift inwards
     */
    offsetDistance(offset) {
        this._distanceFromOrigin += offset;
    }
    convexPolygonClipInPlace(xyz, work) {
        work.length = 0;
        let numNegative = 0;
        ClipPlane.fractionTol = 1.0e-8;
        if (xyz.length > 2) {
            let xyz0 = xyz[xyz.length - 1];
            let a0 = this.evaluatePoint(xyz0);
            //    if (a0 >= 0.0)
            //      work.push_back (xyz0);
            for (const xyz1 of xyz) {
                const a1 = this.evaluatePoint(xyz1);
                if (a1 < 0)
                    numNegative++;
                if (a0 * a1 < 0.0) {
                    // simple crossing . . .
                    const f = -a0 / (a1 - a0);
                    if (f > 1.0 - ClipPlane.fractionTol && a1 >= 0.0) {
                        // the endpoint will be saved -- avoid the duplicate
                    }
                    else {
                        work.push(xyz0.interpolate(f, xyz1));
                    }
                }
                if (a1 >= 0.0)
                    work.push(xyz1);
                xyz0 = Point3dVector3d_1.Point3d.createFrom(xyz1);
                a0 = a1;
            }
        }
        if (work.length <= 2) {
            xyz.length = 0;
        }
        else if (numNegative > 0) {
            xyz.length = 0;
            for (const xyzi of work) {
                xyz.push(xyzi);
            }
            work.length = 0;
        }
    }
    polygonCrossings(xyz, crossings) {
        crossings.length = 0;
        if (xyz.length >= 2) {
            let xyz0 = xyz[xyz.length - 1];
            let a0 = this.evaluatePoint(xyz0);
            for (const xyz1 of xyz) {
                const a1 = this.evaluatePoint(xyz1);
                if (a0 * a1 < 0.0) {
                    // simple crossing. . .
                    const f = -a0 / (a1 - a0);
                    crossings.push(xyz0.interpolate(f, xyz1));
                }
                if (a1 === 0.0) { // IMPORTANT -- every point is directly tested here
                    crossings.push(xyz1);
                }
                xyz0 = Point3dVector3d_1.Point3d.createFrom(xyz1);
                a0 = a1;
            }
        }
    }
    convexPolygonSplitInsideOutside(xyz, xyzIn, xyzOut, altitudeRange) {
        xyzOut.length = 0;
        xyzIn.length = 0;
        // let numSplit = 0;
        ClipPlane.fractionTol = 1.0e-8;
        if (xyz.length > 2) {
            let xyz0 = xyz[xyz.length - 1];
            altitudeRange.setNull();
            let a0 = this.evaluatePoint(xyz0);
            altitudeRange.extendX(a0);
            //    if (a0 >= 0.0)
            //      work.push_back (xyz0);
            for (const xyz1 of xyz) {
                const a1 = this.evaluatePoint(xyz1);
                altitudeRange.extendX(a1);
                let nearZero = false;
                if (a0 * a1 < 0.0) {
                    // simple crossing. . .
                    const f = -a0 / (a1 - a0);
                    if (f > 1.0 - ClipPlane.fractionTol && a1 >= 0.0) {
                        // the endpoint will be saved -- avoid the duplicate
                        nearZero = true;
                    }
                    else {
                        const xyzA = xyz0.interpolate(f, xyz1);
                        xyzIn.push(xyzA);
                        xyzOut.push(xyzA);
                    }
                    // numSplit++;
                }
                if (a1 >= 0.0 || nearZero)
                    xyzIn.push(xyz1);
                if (a1 <= 0.0 || nearZero)
                    xyzOut.push(xyz1);
                xyz0 = Point3dVector3d_1.Point3d.createFrom(xyz1);
                a0 = a1;
            }
        }
    }
    multiplyPlaneByMatrix(matrix) {
        const plane = this.getPlane4d();
        matrix.multiplyTransposePoint4d(plane, plane);
        this.setPlane4d(plane);
    }
    /** announce the interval (if any) where a line is within the clip plane half space. */
    announceClippedSegmentIntervals(f0, f1, pointA, pointB, announce) {
        if (f1 < f0)
            return false;
        const h0 = -this.evaluatePoint(pointA);
        const h1 = -this.evaluatePoint(pointB);
        const delta = h1 - h0;
        const f = Geometry_1.Geometry.conditionalDivideFraction(-h0, delta);
        if (f === undefined) { // The segment is parallel to the plane.
            if (h0 <= 0.0) {
                if (announce)
                    announce(f0, f1);
                return true;
            }
            return false;
        }
        if (delta > 0) { // segment aims OUT
            if (f < f1)
                f1 = f;
        }
        else {
            // segment aims IN
            if (f > f0)
                f0 = f;
        }
        if (f1 < f0)
            return false;
        if (announce)
            announce(f0, f1);
        return true;
    }
}
// Static variable from original native c++ function ConvexPolygonClipInPlace
ClipPlane.fractionTol = 1.0e-8;
ClipPlane._clipArcFractionArray = new GrowableArray_1.GrowableFloat64Array();
exports.ClipPlane = ClipPlane;
//# sourceMappingURL=ClipPlane.js.map