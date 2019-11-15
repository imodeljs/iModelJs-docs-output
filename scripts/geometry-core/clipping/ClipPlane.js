"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Range_1 = require("../geometry3d/Range");
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Point4d_1 = require("../geometry4d/Point4d");
const Plane3dByOriginAndUnitNormal_1 = require("../geometry3d/Plane3dByOriginAndUnitNormal");
const Geometry_1 = require("../Geometry");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
const Polynomials_1 = require("../numerics/Polynomials");
const ClipUtils_1 = require("./ClipUtils");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const PolygonOps_1 = require("../geometry3d/PolygonOps");
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
 * * Given a point and inward normal, the signedDistance is (point DOT normal)
 * @public
 */
class ClipPlane {
    constructor(normal, distance, invisible, interior) {
        this._invisible = invisible;
        this._interior = interior;
        this._inwardNormal = normal;
        this._distanceFromOrigin = distance;
    }
    safeSetXYZDistance(nx, ny, nz, d) {
        this._inwardNormal.set(nx, ny, nz);
        this._distanceFromOrigin = d;
    }
    /**
     * Return true if all members are almostEqual to corresponding members of other.
     * @param other clip plane to compare
     */
    isAlmostEqual(other) {
        return Geometry_1.Geometry.isSameCoordinate(this._distanceFromOrigin, other._distanceFromOrigin)
            && this._inwardNormal.isAlmostEqual(other._inwardNormal)
            && this._interior === other._interior
            && this._invisible === other._invisible;
    }
    /** return a cloned plane */
    clone() {
        const result = new ClipPlane(this._inwardNormal.clone(), this._distanceFromOrigin, this._invisible, this._interior);
        return result;
    }
    /** return Return a cloned plane with coordinate data negated. */
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
     * * "normal" (normalX, normalY, nz) is the inward normal of the plane.
     * * The given (normalX,normalY,normalZ)
     * * "point" is any point of the plane.
     * * The stored distance for the plane is the dot product of the point with the normal (i.e. treat the point's xyz as a vector from the origin.)
     */
    static createNormalAndPointXYZXYZ(normalX, normalY, normalZ, originX, originY, originZ, invisible = false, interior = false, result) {
        const q = Geometry_1.Geometry.hypotenuseXYZ(normalX, normalY, normalZ);
        const r = Geometry_1.Geometry.conditionalDivideFraction(1, q);
        if (r !== undefined) {
            if (result) {
                result._inwardNormal.set(normalX * r, normalY * r, normalZ * r);
                result._distanceFromOrigin = result._inwardNormal.dotProductXYZ(originX, originY, originZ);
                result._invisible = invisible;
                result._interior = interior;
                return result;
            }
            const normal = Point3dVector3d_1.Vector3d.create(normalX * r, normalY * r, normalZ * r);
            return new ClipPlane(normal, normal.dotProductXYZ(originX, originY, originZ), invisible, interior);
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
    /** parse json object to ClipPlane instance */
    static fromJSON(json, result) {
        if (json && json.normal && Number.isFinite(json.dist)) {
            return ClipPlane.createNormalAndDistance(Point3dVector3d_1.Vector3d.fromJSON(json.normal), json.dist, !!json.invisible, !!json.interior);
        }
        return ClipPlane.createNormalAndDistance(Point3dVector3d_1.Vector3d.unitZ(), 0, false, false, result);
    }
    /** Set both the invisible and interior flags. */
    setFlags(invisible, interior) {
        this._invisible = invisible;
        this._interior = interior;
    }
    /**
     * Return the stored distanceFromOrigin property.
     */
    get distance() { return this._distanceFromOrigin; }
    /**
     * Return the stored inward normal property.
     */
    get inwardNormalRef() { return this._inwardNormal; }
    /**
     * Return the "interior" property bit
     */
    get interior() { return this._interior; }
    /**
     * Return the "invisible" property bit.
     */
    get invisible() { return this._invisible; }
    /**
     * Create a plane defined by two points, an up vector, and a tilt angle relative to the up vector.
     * @param point0 start point of the edge
     * @param point1 end point of the edge
     * @param upVector vector perpendicular to the plane
     * @param tiltAngle angle to tilt the plane around the edge in the direction of the up vector.
     * @param result optional preallocated plane
     */
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
    /**
     * Create a plane perpendicular to the edge between the xy parts of point0 and point1
     */
    static createEdgeXY(point0, point1, result) {
        const normal = Point3dVector3d_1.Vector3d.create(point0.y - point1.y, point1.x - point0.x);
        if (normal.normalizeInPlace())
            return ClipPlane.createNormalAndPoint(normal, point0, false, false, result);
        return undefined;
    }
    /**
     * Return the Plane3d form of the plane.
     * * The plane origin is the point `distance * inwardNormal`
     * * The plane normal is the inward normal of the ClipPlane.
     */
    getPlane3d() {
        const d = this._distanceFromOrigin;
        // Normal should be normalized, will not return undefined
        return Plane3dByOriginAndUnitNormal_1.Plane3dByOriginAndUnitNormal.create(Point3dVector3d_1.Point3d.create(this._inwardNormal.x * d, this._inwardNormal.y * d, this._inwardNormal.z * d), this._inwardNormal);
    }
    /**
     * Return the Point4d d form of the plane.
     * * The homogeneous xyz are the inward normal xyz.
     * * The homogeneous weight is the negated ClipPlane distance.
     */
    getPlane4d() {
        return Point4d_1.Point4d.create(this._inwardNormal.x, this._inwardNormal.y, this._inwardNormal.z, -this._distanceFromOrigin);
    }
    /**
     * Set the plane from DPoint4d style plane.
     * * The saved plane has its direction normalized.
     * * This preserves the plane itself as a zero set but make plane evaluations act as true distances (even if the plane coefficients are scaled otherwise)
     * @param plane
     */
    setPlane4d(plane) {
        const a = Math.sqrt(plane.x * plane.x + plane.y * plane.y + plane.z * plane.z);
        const r = a === 0.0 ? 1.0 : 1.0 / a;
        this._inwardNormal.x = r * plane.x;
        this._inwardNormal.y = r * plane.y;
        this._inwardNormal.z = r * plane.z;
        this._distanceFromOrigin = -r * plane.w;
    }
    /**
     * Evaluate the distance from the plane to a point in space, i.e. (dot product with inward normal) minus distance
     * @param point space point to test
     * @deprecated Instead of `clipPlane.evaluatePoint(spacePoint)` use `clipPlane.altitude(spacePoint)` (for compatibility with interface `PlaneAltitudeEvaluator`)
     */
    evaluatePoint(point) {
        return point.x * this._inwardNormal.x + point.y * this._inwardNormal.y + point.z * this._inwardNormal.z - this._distanceFromOrigin;
    }
    /**
     * Evaluate the altitude in weighted space, i.e. (dot product with inward normal) minus distance, with point.w scale applied to distance)
     * @param point space point to test
     */
    weightedAltitude(point) {
        return point.x * this._inwardNormal.x + point.y * this._inwardNormal.y + point.z * this._inwardNormal.z - point.w * this._distanceFromOrigin;
    }
    /**
     * Evaluate the distance from the plane to a point in space, i.e. (dot product with inward normal) minus distance
     * @param point space point to test
     */
    altitude(point) {
        return point.x * this._inwardNormal.x + point.y * this._inwardNormal.y + point.z * this._inwardNormal.z - this._distanceFromOrigin;
    }
    /**
     * Evaluate the distance from the plane to a point in space with point given as x,y,z, i.e. (dot product with inward normal) minus distance
     * @param point space point to test
     */
    altitudeXYZ(x, y, z) {
        return x * this._inwardNormal.x + y * this._inwardNormal.y + z * this._inwardNormal.z - this._distanceFromOrigin;
    }
    /** Return the dot product of the plane normal with the vector (NOT using the plane's distanceFromOrigin).
     * @deprecated Instead of `clipPlane.dotProduct (vector)` use `clipPlane.velocity(vector)` for compatibility with interface `PlaneAltitudeEvaluator`
     */
    dotProductVector(vector) {
        return vector.x * this._inwardNormal.x + vector.y * this._inwardNormal.y + vector.z * this._inwardNormal.z;
    }
    /** Return the dot product of the plane normal with the vector (NOT using the plane's distanceFromOrigin).
     */
    velocity(vector) {
        return vector.x * this._inwardNormal.x + vector.y * this._inwardNormal.y + vector.z * this._inwardNormal.z;
    }
    /** Return the dot product of the plane normal with the x,yz, vector components (NOT using the plane's distanceFromOrigin).
     */
    velocityXYZ(x, y, z) {
        return x * this._inwardNormal.x + y * this._inwardNormal.y + z * this._inwardNormal.z;
    }
    /** Return the dot product of the plane normal with the point (treating the point xyz as a vector, and NOT using the plane's distanceFromOrigin).
     */
    dotProductPlaneNormalPoint(point) {
        return point.x * this._inwardNormal.x + point.y * this._inwardNormal.y + point.z * this._inwardNormal.z;
    }
    /**
     * Return true if spacePoint is inside or on the plane, with tolerance applied to "on".
     * @param spacePoint point to test.
     * @param tolerance tolerance for considering "near plane" to be "on plane"
     */
    isPointOnOrInside(spacePoint, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        let value = this.altitude(spacePoint);
        if (tolerance) {
            value += tolerance;
        }
        return value >= 0.0;
    }
    /**
     * Return true if spacePoint is strictly inside the halfspace, with tolerance applied to "on".
     * @param spacePoint point to test.
     * @param tolerance tolerance for considering "near plane" to be "on plane"
     */
    isPointInside(point, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        let value = this.altitude(point);
        if (tolerance) {
            value -= tolerance;
        }
        return value > 0.0;
    }
    /**
     * Return true if spacePoint is strictly on the plane, within tolerance
     * @param spacePoint point to test.
     * @param tolerance tolerance for considering "near plane" to be "on plane"
     */
    isPointOn(point, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        return Math.abs(this.altitude(point)) <= tolerance;
    }
    /**
     * Compute intersections of an (UNBOUNDED) arc with the plane.  Append them (as radians) to a growing array.
     * @param arc arc to test.  The angle limits of the arc are NOT considered.
     * @param intersectionRadians array to receive results
     */
    appendIntersectionRadians(arc, intersectionRadians) {
        const arcVectors = arc.toVectors();
        const alpha = this.altitude(arc.center);
        const beta = this.velocity(arcVectors.vector0);
        const gamma = this.velocity(arcVectors.vector90);
        Polynomials_1.AnalyticRoots.appendImplicitLineUnitCircleIntersections(alpha, beta, gamma, undefined, undefined, intersectionRadians);
    }
    /** Announce fractional intervals of arc clip.
     * * Each call to `announce(fraction0, fraction1, arc)` announces one interval that is inside the clip plane.
     */
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
        const h0 = this.altitude(pointA);
        const h1 = this.altitude(pointB);
        if (h0 * h1 > 0.0)
            return undefined;
        if (h0 === 0.0 && h1 === 0.0) {
            return undefined;
        }
        return -h0 / (h1 - h0);
    }
    /** Apply transform to the origin.  Apply inverse transpose of the matrix part to th normal vector. */
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
    /** Set the invisible flag.   Interpretation of this is up to the use code algorithms. */
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
    /**
     * Clip a polygon, returning the clip result in the same object.
     * @param xyz input/output polygon
     * @param work scratch object
     * @param tolerance tolerance for on-plane decision.
     * @deprecated Instead of `clipPlane.convexPolygonClipInPlace (xyz, work, tolerance)` use `PolygonOps.clipConvexPoint3dPolygonInPlace (clipPlane, xyz, work, tolerance)`
     */
    convexPolygonClipInPlace(xyz, work, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        return PolygonOps_1.Point3dArrayPolygonOps.convexPolygonClipInPlace(this, xyz, work, tolerance);
    }
    /**
     * Clip a polygon to the inside or outside of the plane.
     * * Results with 2 or fewer points are ignored.
     * * Other than ensuring capacity in the arrays, there are no object allocations during execution of this function.
     * @param xyz input points.
     * @param work work buffer
     * @param tolerance tolerance for "on plane" decision.
     */
    clipConvexPolygonInPlace(xyz, work, inside = true, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        return PolygonOps_1.IndexedXYZCollectionPolygonOps.clipConvexPolygonInPlace(this, xyz, work, inside, tolerance);
    }
    /**
     * Split a (convex) polygon into 2 parts.
     * @param xyz original polygon
     * @param xyzIn array to receive inside part
     * @param xyzOut array to receive outside part
     * @param altitudeRange min and max altitudes encountered.
     * @deprecated instead of `plane.convexPolygonSplitInsideOutside (xyz, xyzIn, xyzOut, altitudeRange)` use `PolygonOops.splitConvexPolygonInsideOutsidePlane(this, xyz, xyzIn, xyzOut, altitudeRange)`
     */
    convexPolygonSplitInsideOutside(xyz, xyzIn, xyzOut, altitudeRange) {
        PolygonOps_1.Point3dArrayPolygonOps.convexPolygonSplitInsideOutsidePlane(this, xyz, xyzIn, xyzOut, altitudeRange);
    }
    /**
     * Split a (convex) polygon into 2 parts.
     * @param xyz original polygon
     * @param xyzIn array to receive inside part
     * @param xyzOut array to receive outside part
     * @param altitudeRange min and max altitudes encountered.
     * @deprecated instead of `plane.convexPolygonSplitInsideOutsideGrowableArrays (xyz, xyzIn, xyzOut, altitudeRange)` use `PolygonOops.splitConvexPoint3dArrayolygonInsideOutsidePlane(this, xyz, xyzIn, xyzOut, altitudeRange)`
     */
    convexPolygonSplitInsideOutsideGrowableArrays(xyz, xyzIn, xyzOut, altitudeRange) {
        PolygonOps_1.IndexedXYZCollectionPolygonOps.splitConvexPolygonInsideOutsidePlane(this, xyz, xyzIn, xyzOut, altitudeRange);
    }
    /**
     * Multiply the ClipPlane's DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     * @return false if unable to invert
     */
    multiplyPlaneByMatrix4d(matrix, invert = true, transpose = true) {
        const plane = this.getPlane4d();
        if (invert) {
            const inverse = matrix.createInverse();
            if (inverse)
                return this.multiplyPlaneByMatrix4d(inverse, false, transpose);
            return false;
        }
        if (transpose)
            matrix.multiplyTransposePoint4d(plane, plane);
        else
            matrix.multiplyPoint4d(plane, plane);
        this.setPlane4d(plane);
        return true;
    }
    /** Return an array containing
     * * All points that are exactly on the plane.
     * * Crossing points between adjacent points that are (strictly) on opposite sides.
     * @deprecated ClipPlane method `clipPlane.polygonCrossings(polygonPoints, crossings)` is deprecated.  Use Point3dArrayPolygonOps.polygonPlaneCrossings (clipPlane, polygonPoints, crossings)`
     */
    polygonCrossings(xyz, crossings) {
        return PolygonOps_1.Point3dArrayPolygonOps.polygonPlaneCrossings(this, xyz, crossings);
    }
    /** announce the interval (if any) where a line is within the clip plane half space. */
    announceClippedSegmentIntervals(f0, f1, pointA, pointB, announce) {
        if (f1 < f0)
            return false;
        const h0 = -this.altitude(pointA);
        const h1 = -this.altitude(pointB);
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
    /**
     * Return a coordinate frame with
     * * origin at closest point to global origin
     * * z axis points in
     * x and y are "in plane"
     */
    getFrame() {
        const d = this._distanceFromOrigin;
        const origin = Point3dVector3d_1.Point3d.create(this._inwardNormal.x * d, this._inwardNormal.y * d, this._inwardNormal.z * d);
        const matrix = Matrix3d_1.Matrix3d.createRigidHeadsUp(this._inwardNormal, Geometry_1.AxisOrder.ZXY);
        return Transform_1.Transform.createOriginAndMatrix(origin, matrix);
    }
    /**
     * Return the intersection of the plane with a range cube.
     * @param range
     * @param xyzOut intersection polygon.  This is convex.
     */
    intersectRange(range, addClosurePoint = false) {
        if (range.isNull)
            return undefined;
        const corners = range.corners();
        const frameOnPlane = this.getFrame();
        frameOnPlane.multiplyInversePoint3dArrayInPlace(corners);
        const localRange = Range_1.Range3d.createArray(corners);
        if (localRange.low.z * localRange.high.z > 0.0)
            return undefined;
        // oversized polygon on local z= 0
        const xyzOut = new GrowableXYZArray_1.GrowableXYZArray();
        xyzOut.pushXYZ(localRange.low.x, localRange.low.y, 0);
        xyzOut.pushXYZ(localRange.high.x, localRange.low.y, 0);
        xyzOut.pushXYZ(localRange.high.x, localRange.high.y, 0);
        xyzOut.pushXYZ(localRange.low.x, localRange.high.y, 0);
        xyzOut.multiplyTransformInPlace(frameOnPlane);
        ClipPlane.intersectRangeConvexPolygonInPlace(range, xyzOut);
        if (xyzOut.length === 0)
            return undefined;
        if (addClosurePoint)
            xyzOut.pushWrap(1);
        return xyzOut;
    }
    /**
     * Return the intersection of the plane with a range cube.
     * @param range
     * @param xyzOut intersection polygon.  This is convex.
     */
    static intersectRangeConvexPolygonInPlace(range, xyz) {
        if (range.isNull)
            return undefined;
        const work = new GrowableXYZArray_1.GrowableXYZArray();
        // clip the polygon to each plane of the cubic ...
        const clipper = ClipPlane.createNormalAndPointXYZXYZ(-1, 0, 0, range.high.x, range.high.y, range.high.z);
        clipper.clipConvexPolygonInPlace(xyz, work);
        if (xyz.length === 0)
            return undefined;
        clipper.safeSetXYZDistance(0, -1, 0, -range.high.y);
        clipper.clipConvexPolygonInPlace(xyz, work);
        if (xyz.length === 0)
            return undefined;
        clipper.safeSetXYZDistance(0, 0, -1, -range.high.z);
        clipper.clipConvexPolygonInPlace(xyz, work);
        if (xyz.length === 0)
            return undefined;
        clipper.safeSetXYZDistance(1, 0, 0, range.low.x);
        clipper.clipConvexPolygonInPlace(xyz, work);
        if (xyz.length === 0)
            return undefined;
        clipper.safeSetXYZDistance(0, 1, 0, range.low.y);
        clipper.clipConvexPolygonInPlace(xyz, work);
        if (xyz.length === 0)
            return undefined;
        clipper.safeSetXYZDistance(0, 0, 1, range.low.z);
        clipper.clipConvexPolygonInPlace(xyz, work);
        if (xyz.length === 0)
            return undefined;
        return xyz;
    }
}
exports.ClipPlane = ClipPlane;
ClipPlane._clipArcFractionArray = new GrowableFloat64Array_1.GrowableFloat64Array();
//# sourceMappingURL=ClipPlane.js.map