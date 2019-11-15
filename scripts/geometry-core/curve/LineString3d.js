"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Curve */
const Geometry_1 = require("../Geometry");
const Angle_1 = require("../geometry3d/Angle");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Ray3d_1 = require("../geometry3d/Ray3d");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const GrowableXYArray_1 = require("../geometry3d/GrowableXYArray");
const CurvePrimitive_1 = require("./CurvePrimitive");
const StrokeCountMap_1 = require("./Query/StrokeCountMap");
const CurveLocationDetail_1 = require("./CurveLocationDetail");
const LineSegment3d_1 = require("./LineSegment3d");
const PointStreaming_1 = require("../geometry3d/PointStreaming");
/* tslint:disable:variable-name no-empty*/
/* Starting with baseIndex and moving index by stepDirection:
If the vector from baseIndex to baseIndex +1 crossed with vectorA can be normalized, accumulate it (scaled) to normal.
Return when successful.
(Do nothing if everything is parallel through limits of the array)
*/
function accumulateGoodUnitPerpendicular(points, vectorA, baseIndex, stepDirection, weight, normal, workVector) {
    const n = points.length;
    if (stepDirection > 0) {
        for (let i = baseIndex; i + 1 < n; i++) {
            points.vectorIndexIndex(i, i + 1, workVector);
            vectorA.crossProduct(workVector, workVector);
            if (workVector.normalizeInPlace()) {
                normal.addScaledInPlace(workVector, weight);
                return true;
            }
        }
    }
    else {
        if (baseIndex + 1 >= n)
            baseIndex = n - 2;
        for (let i = baseIndex; i >= 0; i--) {
            points.vectorIndexIndex(i, i + 1, workVector);
            workVector.crossProduct(vectorA, workVector);
            if (workVector.normalizeInPlace()) {
                normal.addScaledInPlace(workVector, weight);
                return true;
            }
        }
    }
    return false;
}
/**
 * * A LineString3d (sometimes called a PolyLine) is a sequence of xyz coordinates that are to be joined by line segments.
 * * The point coordinates are stored in a GrowableXYZArray, not as full point objects
 * * The parameterization of "fraction along" is
 *    * In a linestring with `N` segments (i.e. `N+1` points), each segment (regardless of physical length) occupies the same fraction (1/N) of the 0-to-1 fraction space.
 *    * Within segment `i`, the fraction interval `i/N` to `(i+1)/N` is mapped proportionally to the segment
 *    * Note that this `fraction` is therefore NOT fraction of true distance along.
 *       * Use `moveSignedDistanceFromFraction` to do true-length evaluations.
 * @public
 */
class LineString3d extends CurvePrimitive_1.CurvePrimitive {
    constructor(points) {
        super();
        /** String name for schema properties */
        this.curvePrimitiveType = "lineString";
        if (points)
            this._points = points;
        else
            this._points = new GrowableXYZArray_1.GrowableXYZArray();
    }
    /** test if `other` is an instance of `LineString3d` */
    isSameGeometryClass(other) { return other instanceof LineString3d; }
    /**
     * A LineString3d extends along its first and final segments.
     */
    get isExtensibleFractionSpace() { return true; }
    /** return the points array (cloned). */
    get points() { return this._points.getPoint3dArray(); }
    /** Return (reference to) point data in packed GrowableXYZArray. */
    get packedPoints() { return this._points; }
    /** Return array of fraction parameters.
     * * These Are only present during certain constructions such as faceting.
     * * When present, these fractions are fractions of some other curve being stroked, and are NOT related to the linestring fraction parameters.
     */
    get fractions() { return this._fractions; }
    /** Return the (optional) array of derivatives. These Are only present during certain constructions such as faceting. */
    get packedDerivatives() { return this._derivatives; }
    /** Return the (optional) array of uv params. These Are only present during certain constructions such as faceting. */
    get packedUVParams() { return this._uvParams; }
    /** Return the (optional) array of surface normals. These Are only present during certain constructions such as faceting. */
    get packedSurfaceNormals() { return this._surfaceNormals; }
    /** Return the (optional) array of normal indices. These Are only present during certain constructions such as faceting. */
    get normalIndices() { return this._normalIndices; }
    /** Return the (optional) array of param indices. These Are only present during certain constructions such as faceting. */
    get paramIndices() { return this._uvIndices; }
    /** Return the (optional) array of point indices. These Are only present during certain constructions such as faceting. */
    get pointIndices() { return this._pointIndices; }
    /** Clone this linestring and apply the transform to the clone points. */
    cloneTransformed(transform) {
        const c = this.clone();
        c.tryTransformInPlace(transform);
        return c;
    }
    /** Create a linestring, using flex length arg list and any typical combination of points such as
     * Point3d, Point2d, `[1,2,3]', array of any of those, or GrowableXYZArray
     */
    static create(...points) {
        const result = new LineString3d();
        result.addPoints(points);
        return result;
    }
    /** Create a linestring, capturing the given GrowableXYZArray as the points.
     * Point3d, Point2d, `[1,2,3]', array of any of those, or GrowableXYZArray
     */
    static createCapture(points) {
        return new LineString3d(points);
    }
    /** Create a linestring from `XAndY` points, with a specified z applied to all. */
    static createXY(points, z, enforceClosure = false) {
        const result = new LineString3d();
        const xyz = result._points;
        for (const xy of points) {
            xyz.pushXYZ(xy.x, xy.y, z);
        }
        if (enforceClosure && points.length > 1) {
            const distance = xyz.distanceIndexIndex(0, xyz.length - 1);
            if (distance !== undefined && distance !== 0.0) {
                if (Geometry_1.Geometry.isSameCoordinate(0, distance)) {
                    xyz.pop(); // nonzero but small distance -- to be replaced by point 0 exactly.
                    const xyzA = xyz.front();
                    xyz.push(xyzA);
                }
            }
        }
        return result;
    }
    /** Add points to the linestring.
     * Valid inputs are:
     * * a Point2d
     * * a point3d
     * * An array of 2 doubles
     * * An array of 3 doubles
     * * A GrowableXYZArray
     * * An array of any of the above
     */
    addPoints(...points) {
        this._points.pushFrom(points);
    }
    /** Add points accessed by index in a GrowableXYZArray, with a specified index step. */
    addSteppedPoints(source, pointIndex0, step, numAdd) {
        this._points.addSteppedPoints(source, pointIndex0, step, numAdd);
    }
    /**
     * Add a point to the linestring.
     * @param point
     */
    addPoint(point) {
        this._points.push(point);
    }
    /**
     * Add a point to the linestring.
     * @param point
     */
    addPointXYZ(x, y, z = 0) {
        this._points.pushXYZ(x, y, z);
    }
    /**
     * Append a fraction to the fractions array.
     * @param fraction
     */
    addFraction(fraction) {
        if (!this._fractions)
            this._fractions = new GrowableFloat64Array_1.GrowableFloat64Array();
        this._fractions.push(fraction);
    }
    /** Ensure that the fraction array exists with no fractions but at least the capacity of the point array. */
    ensureEmptyFractions() {
        const n = this.numPoints();
        if (!this._fractions) {
            this._fractions = new GrowableFloat64Array_1.GrowableFloat64Array(n);
            return this._fractions;
        }
        this._fractions.clear();
        this._fractions.ensureCapacity(n);
        return this._fractions;
    }
    /** Ensure that the parameter array exists with no points but at least the capacity of the point array. */
    ensureEmptyUVParams() {
        const n = this.numPoints();
        if (!this._uvParams) {
            this._uvParams = new GrowableXYArray_1.GrowableXYArray(n);
            return this._uvParams;
        }
        this._uvParams.clear();
        this._uvParams.ensureCapacity(n);
        return this._uvParams;
    }
    /** Ensure that the surfaceNormals array exists with no points but at least the capacity of the point array. */
    ensureEmptySurfaceNormals() {
        const n = this.numPoints();
        if (!this._surfaceNormals) {
            this._surfaceNormals = new GrowableXYZArray_1.GrowableXYZArray(n);
            return this._surfaceNormals;
        }
        this._surfaceNormals.clear();
        this._surfaceNormals.ensureCapacity(n);
        return this._surfaceNormals;
    }
    /** Ensure that the surfaceNormals array exists with no points but at least the capacity of the point array. */
    ensureEmptyDerivatives() {
        const n = this.numPoints();
        if (!this._derivatives) {
            this._derivatives = new GrowableXYZArray_1.GrowableXYZArray(n);
            return this._derivatives;
        }
        this._derivatives.clear();
        this._derivatives.ensureCapacity(n);
        return this._derivatives;
    }
    /** Ensure that the surfaceNormals array exists with no points but at least the capacity of the point array. */
    ensureEmptyNormalIndices() {
        const n = this.numPoints();
        if (!this._normalIndices) {
            this._normalIndices = new GrowableFloat64Array_1.GrowableFloat64Array(n);
            return this._normalIndices;
        }
        this._normalIndices.clear();
        this._normalIndices.ensureCapacity(n);
        return this._normalIndices;
    }
    /** Ensure that the surfaceNormals array exists with no points but at least the capacity of the point array. */
    ensureEmptyUVIndices() {
        const n = this.numPoints();
        if (!this._uvIndices) {
            this._uvIndices = new GrowableFloat64Array_1.GrowableFloat64Array(n);
            return this._uvIndices;
        }
        this._uvIndices.clear();
        this._uvIndices.ensureCapacity(n);
        return this._uvIndices;
    }
    /** Ensure that the surfaceNormals array exists with no points but at least the capacity of the point array. */
    ensureEmptyPointIndices() {
        const n = this.numPoints();
        if (!this._pointIndices) {
            this._pointIndices = new GrowableFloat64Array_1.GrowableFloat64Array(n);
            return this._pointIndices;
        }
        this._pointIndices.clear();
        this._pointIndices.ensureCapacity(n);
        return this._pointIndices;
    }
    /**
     * Append a uv coordinate to the uvParams array
     * @param uv
     */
    addUVParam(uvParam) {
        if (!this._uvParams)
            this._uvParams = new GrowableXYArray_1.GrowableXYArray();
        this._uvParams.pushXY(uvParam.x, uvParam.y);
    }
    /**
     * Append a uv coordinate to the uvParams array
     * @param uv
     */
    addUVParamAsUV(u, v) {
        if (!this._uvParams)
            this._uvParams = new GrowableXYArray_1.GrowableXYArray();
        this._uvParams.pushXY(u, v);
    }
    /**
     * Append a derivative to the derivative array
     * @param vector
     */
    addDerivative(vector) {
        if (!this._derivatives)
            this._derivatives = new GrowableXYZArray_1.GrowableXYZArray();
        this._derivatives.push(vector);
    }
    /**
     * Append a surface normal to the surface normal array.
     * @param vector
     */
    addSurfaceNormal(vector) {
        if (!this._surfaceNormals)
            this._surfaceNormals = new GrowableXYZArray_1.GrowableXYZArray();
        this._surfaceNormals.push(vector);
    }
    /**
     * If the linestring is not already closed, add a closure point.
     */
    addClosurePoint() {
        const distance = this._points.distanceIndexIndex(0, this._points.length - 1);
        if (distance !== undefined && !Geometry_1.Geometry.isSameCoordinate(distance, 0))
            this._points.pushWrap(1);
    }
    /** Eliminate (but do not return!!) the final point of the linestring */
    popPoint() {
        this._points.pop();
    }
    /** Compute `uvParams` array as (xy parts of) a linear transform of the xyz coordinates */
    computeUVFromXYZTransform(transform) {
        this._uvParams = GrowableXYArray_1.GrowableXYArray.createFromGrowableXYZArray(this._points, transform);
    }
    /** Create the linestring for a rectangle parallel to the xy plane.
     * * The z coordinate from `point0` is used for all points.
     * * `ax` and `ay` are signed.
     * * The point sequence is:
     *    * Start at `point0`
     *    * move by (signed !) `ax` in the x direction.
     *    * move by (signed !) `ay` in the y direction.
     *    * move by (signed !) negative `ax` in the x direction.
     *    * move by (signed !) negative `ay` in the y direction.
     *    * (this returns to `point0`)
     */
    static createRectangleXY(point0, ax, ay, closed = true) {
        const ls = LineString3d.create();
        const x0 = point0.x;
        const x1 = point0.x + ax;
        const y0 = point0.y;
        const y1 = point0.y + ay;
        const z = point0.z;
        ls.addPointXYZ(x0, y0, z);
        ls.addPointXYZ(x1, y0, z);
        ls.addPointXYZ(x1, y1, z);
        ls.addPointXYZ(x0, y1, z);
        if (closed)
            ls.addClosurePoint();
        return ls;
    }
    /**
     * Create a regular polygon centered
     * @param center center of the polygon.
     * @param edgeCount number of edges.
     * @param radius distance to vertex or edge (see `radiusToVertices`)
     * @param radiusToVertices true if polygon is inscribed in circle (radius measured to vertices); false if polygon is outside circle (radius to edges)
     */
    static createRegularPolygonXY(center, edgeCount, radius, radiusToVertices = true) {
        if (edgeCount < 3)
            edgeCount = 3;
        const ls = LineString3d.create();
        const i0 = radiusToVertices ? 0 : -1; // offset to make first vector (radius,0,0)
        const radiansStep = Math.PI / edgeCount;
        let c;
        let s;
        let radians;
        if (!radiusToVertices)
            radius = radius / Math.cos(radiansStep);
        for (let i = 0; i < edgeCount; i++) {
            radians = (i0 + 2 * i) * radiansStep;
            c = Angle_1.Angle.cleanupTrigValue(Math.cos(radians));
            s = Angle_1.Angle.cleanupTrigValue(Math.sin(radians));
            ls.addPointXYZ(center.x + radius * c, center.y + radius * s, center.z);
        }
        ls.addClosurePoint();
        return ls;
    }
    /**
     * Copy coordinate data from another linestring.
     *  * The copied content is:
     *    * points
     *    * derivatives (if present)
     *    * fractions (if present)
     *    * surfaceNormals (if present)
     *    * uvParams (if present)
     * @param other
     */
    setFrom(other) {
        // ugly -- "clone" methods are inconsistent about 'reuse' and 'result' parameter . . .
        this._points = other._points.clone(this._points);
        if (other._derivatives)
            this._derivatives = other._derivatives.clone(this._derivatives);
        else
            this._derivatives = undefined;
        if (other._fractions)
            this._fractions = other._fractions.clone(false);
        else
            this._fractions = undefined;
        if (other._surfaceNormals)
            this._surfaceNormals = other._surfaceNormals.clone(this._surfaceNormals);
        else
            this._surfaceNormals = undefined;
        if (other._uvParams)
            this._uvParams = other._uvParams.clone();
        else
            this._uvParams = undefined;
    }
    /** Create a linestring from an array of points. */
    static createPoints(points) {
        const ls = new LineString3d();
        let point;
        for (point of points)
            ls._points.push(point);
        return ls;
    }
    /** Create a linestring, taking points at specified indices from an array of points. */
    static createIndexedPoints(points, index, addClosure = false) {
        const ls = new LineString3d();
        for (const i of index)
            ls._points.push(points[i]); // no clone needed -- we know this reformats to packed array.
        if (addClosure && index.length > 1)
            ls._points.push(points[index[0]]);
        return ls;
    }
    /** Create a LineString3d from xyz coordinates packed in a Float64Array */
    static createFloat64Array(xyzData) {
        const ls = new LineString3d();
        for (let i = 0; i + 3 <= xyzData.length; i += 3)
            ls._points.push(Point3dVector3d_1.Point3d.create(xyzData[i], xyzData[i + 1], xyzData[i + 2]));
        return ls;
    }
    /** Return a clone of this linestring. */
    clone() {
        const retVal = new LineString3d();
        retVal.setFrom(this);
        return retVal;
    }
    /** Set point coordinates from a json array, e.g. `[[1,2,3],[4,5,6] . . .]`
     * * The `json` parameter must be an array.
     * * Each member `i` of the array is converted to a point with `Point3d.fromJSON(json[i]`)
     */
    setFromJSON(json) {
        this._points.clear();
        if (Array.isArray(json)) {
            let xyz;
            for (xyz of json)
                this._points.push(Point3dVector3d_1.Point3d.fromJSON(xyz));
        }
    }
    /**
     * Convert an LineString3d to a JSON object.
     * * The returned object is an array of arrays of x,y,z coordinates, `[[x,y,z],...[x,y,z]]`
     */
    toJSON() {
        const value = [];
        let i = 0;
        while (this._points.isIndexValid(i)) {
            value.push(this._points.getPoint3dAtUncheckedPointIndex(i).toJSON());
            i++;
        }
        return value;
    }
    /** construct a new linestring.
     * * See `LineString3d.setFromJSON ()` for remarks on `json` structure.
     */
    static fromJSON(json) {
        const ls = new LineString3d();
        ls.setFromJSON(json);
        return ls;
    }
    /**
     * Evaluate a point a fractional position along this linestring.
     * * See `LineString3d` class comments for description of how fraction relates to the linestring points.
     * @param fraction fractional position
     * @param result optional result
     */
    fractionToPoint(fraction, result) {
        const n = this._points.length;
        if (n === 0)
            return Point3dVector3d_1.Point3d.createZero();
        if (n === 1)
            return Point3dVector3d_1.Point3d.createFrom(this._points.getPoint3dAtUncheckedPointIndex(0), result);
        const df = 1.0 / (n - 1);
        if (fraction <= df)
            return this._points.interpolate(0, fraction / df, 1, result);
        if (fraction + df >= 1.0)
            return this._points.interpolate(n - 1, (1.0 - fraction) / df, n - 2, result);
        const index0 = Math.floor(fraction / df);
        return this._points.interpolate(index0, (fraction - index0 * df) / df, index0 + 1, result);
    }
    /**
     * Evaluate a point a fractional position and derivative with respect to fraction along this linestring.
     * * See `LineString3d` class comments for description of how fraction relates to the linestring points.
     * @param fraction fractional position
     * @param result optional result
     */
    fractionToPointAndDerivative(fraction, result) {
        result = result ? result : Ray3d_1.Ray3d.createZero();
        const n = this._points.length;
        if (n <= 1) {
            result.direction.setZero();
            if (n === 1)
                result.origin.setFrom(this._points.getPoint3dAtUncheckedPointIndex(0));
            else
                result.origin.setZero();
            return result;
        }
        const numSegment = n - 1;
        const df = 1.0 / numSegment;
        if (fraction <= df) {
            result = result ? result : Ray3d_1.Ray3d.createZero();
            this._points.interpolate(0, fraction / df, 1, result.origin);
            this._points.vectorIndexIndex(0, 1, result.direction);
            result.direction.scaleInPlace(1.0 / df);
            return result;
        }
        if (fraction + df >= 1.0) {
            result = result ? result : Ray3d_1.Ray3d.createZero();
            this._points.interpolate(n - 2, 1.0 - (1.0 - fraction) / df, n - 1, result.origin);
            this._points.vectorIndexIndex(n - 2, n - 1, result.direction);
            result.direction.scaleInPlace(1.0 / df);
            return result;
        }
        /* true interior point */
        result = result ? result : Ray3d_1.Ray3d.createZero();
        const index0 = Math.floor(fraction / df);
        const localFraction = (fraction - index0 * df) / df;
        this._points.interpolate(index0, localFraction, index0 + 1, result.origin);
        this._points.vectorIndexIndex(index0, index0 + 1, result.direction);
        result.direction.scaleInPlace(1.0 / df);
        return result;
    }
    /** Return point and derivative at fraction, with 000 second derivative. */
    fractionToPointAnd2Derivatives(fraction, result) {
        const ray = this.fractionToPointAndDerivative(fraction);
        result = Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createCapture(ray.origin, ray.direction, Point3dVector3d_1.Vector3d.createZero(), result);
        return result;
    }
    /**
     * Convert a segment index and local fraction to a global fraction.
     * @param index index of segment being evaluated
     * @param localFraction local fraction within that segment
     */
    segmentIndexAndLocalFractionToGlobalFraction(index, localFraction) {
        const numSegment = this._points.length - 1;
        if (numSegment < 1)
            return 0.0;
        return (index + localFraction) / numSegment;
    }
    /** Return a frenet frame, using nearby points to estimate a plane. */
    fractionToFrenetFrame(fraction, result) {
        const n = this._points.length;
        if (n <= 1) {
            if (n === 1)
                return Transform_1.Transform.createTranslation(this._points.getPoint3dAtUncheckedPointIndex(0), result);
            return Transform_1.Transform.createIdentity(result);
        }
        if (n === 2)
            return Transform_1.Transform.createRefs(this._points.interpolate(0, fraction, 1), Matrix3d_1.Matrix3d.createRigidHeadsUp(this._points.vectorIndexIndex(0, 1), Geometry_1.AxisOrder.XYZ));
        /** 3 or more points. */
        const numSegment = n - 1;
        const df = 1.0 / numSegment;
        let baseIndex = 0;
        let localFraction = 0;
        if (fraction <= df) {
            localFraction = fraction / df;
            baseIndex = 0;
        }
        else if (fraction + df >= 1.0) {
            baseIndex = n - 2;
            localFraction = 1.0 - (1.0 - fraction) / df;
        }
        else {
            baseIndex = Math.floor(fraction / df);
            localFraction = fraction * numSegment - baseIndex;
        }
        const origin = this._points.interpolate(baseIndex, localFraction, baseIndex + 1);
        const vectorA = this._points.vectorIndexIndex(baseIndex, baseIndex + 1);
        // tricky stuff to handle colinear points.   But if vectorA is zero it is still a mess . ..
        const normal = Point3dVector3d_1.Vector3d.create();
        const workVector = Point3dVector3d_1.Vector3d.create();
        if (baseIndex === 0) { // only look forward
            accumulateGoodUnitPerpendicular(this._points, vectorA, baseIndex + 1, 1, 1.0, normal, workVector);
        }
        else if (baseIndex + 2 >= n) { // only look back
            accumulateGoodUnitPerpendicular(this._points, vectorA, baseIndex - 1, -1, 1.0, normal, workVector);
        }
        else {
            accumulateGoodUnitPerpendicular(this._points, vectorA, baseIndex - 1, -1, (1.0 - localFraction), normal, workVector);
            accumulateGoodUnitPerpendicular(this._points, vectorA, baseIndex + 1, 1, (localFraction), normal, workVector);
        }
        const matrix = Matrix3d_1.Matrix3d.createRigidFromColumns(normal, vectorA, Geometry_1.AxisOrder.ZXY);
        if (matrix)
            return Transform_1.Transform.createOriginAndMatrix(origin, matrix, result);
        return Transform_1.Transform.createTranslation(origin, result);
    }
    /** evaluate the start point of the linestring. */
    startPoint() {
        if (this._points.length === 0)
            return Point3dVector3d_1.Point3d.createZero();
        return this._points.getPoint3dAtUncheckedPointIndex(0);
    }
    /** If i is a valid index, return that point. */
    pointAt(i, result) {
        if (this._points.isIndexValid(i))
            return this._points.getPoint3dAtUncheckedPointIndex(i, result);
        return undefined;
    }
    /** If i and j are both valid indices, return the vector from point i to point j
     */
    vectorBetween(i, j, result) {
        return this._points.vectorIndexIndex(i, j, result);
    }
    /** If i is a valid index, return that stored derivative vector. */
    derivativeAt(i, result) {
        if (this._derivatives && this._derivatives.isIndexValid(i))
            return this._derivatives.getVector3dAtCheckedVectorIndex(i, result);
        return undefined;
    }
    /** If i is a valid index, return that stored surfaceNormal vector. */
    surfaceNormalAt(i, result) {
        if (this._surfaceNormals && this._surfaceNormals.isIndexValid(i))
            return this._surfaceNormals.getVector3dAtCheckedVectorIndex(i, result);
        return undefined;
    }
    /** Return the number of points in this linestring. */
    numPoints() { return this._points.length; }
    /** evaluate the end point of the linestring. */
    endPoint() {
        if (this._points.length === 0)
            return Point3dVector3d_1.Point3d.createZero();
        return this._points.getPoint3dAtUncheckedPointIndex(this._points.length - 1);
    }
    /** Reverse the points within the linestring. */
    reverseInPlace() {
        if (this._points.length >= 2) {
            let i0 = 0;
            let i1 = this._points.length - 1;
            let a = this._points.getPoint3dAtUncheckedPointIndex(0);
            while (i0 < i1) {
                a = this._points.getPoint3dAtUncheckedPointIndex(i0);
                this._points.setAtCheckedPointIndex(i0, this._points.getPoint3dAtUncheckedPointIndex(i1));
                this._points.setAtCheckedPointIndex(i1, a);
                i0++;
                i1--;
            }
        }
    }
    /** Apply `transform` to each point of this linestring. */
    tryTransformInPlace(transform) {
        this._points.multiplyTransformInPlace(transform);
        if (this._derivatives)
            this._derivatives.multiplyMatrix3dInPlace(transform.matrix);
        if (this._surfaceNormals)
            this._surfaceNormals.multiplyAndRenormalizeMatrix3dInverseTransposeInPlace(transform.matrix);
        return true;
    }
    /** Sum the lengths of segments within the linestring */
    curveLength() { return this._points.sumLengths(); }
    /** Sum the lengths of segments between fractional positions on a linestring. */
    curveLengthBetweenFractions(fraction0, fraction1) {
        const numSegments = this._points.length - 1;
        if (fraction1 === fraction0 || numSegments < 1)
            return 0.0;
        if (fraction1 < fraction0)
            return this.curveLengthBetweenFractions(fraction1, fraction0);
        const scaledFraction0 = fraction0 * numSegments;
        const scaledFraction1 = fraction1 * numSegments;
        const index0 = Math.max(1, Math.ceil(scaledFraction0));
        const index1 = Math.min(Math.floor(scaledFraction1), numSegments - 1);
        const localFraction0 = index0 - scaledFraction0;
        const localFraction1 = scaledFraction1 - index1;
        if (index0 > index1) {
            // the interval is entirely within a single segment
            return Math.abs(scaledFraction1 - scaledFraction0) * this._points.distanceIndexIndex(index0 - 1, index0);
        }
        else {
            // there is leading partial interval, 0 or more complete segments, and a trailing partial interval.
            // (either or both partial may be zero length)
            let sum = localFraction0 * this._points.distanceIndexIndex(index0 - 1, index0)
                + localFraction1 * (this._points.distanceIndexIndex(index1, index1 + 1));
            for (let i = index0; i < index1; i++)
                sum += this._points.distanceIndexIndex(i, i + 1);
            return sum;
        }
    }
    /**
     * * Implementation of `CurvePrimitive.moveSignedDistanceFromFraction`.  (see comments there!)
     * * Find the segment that contains the start fraction
     * * Move point-by-point from that position to the start or end (respectively for negative or positive signedDistance)
     * * Optionally extrapolate
     * @param startFraction
     * @param signedDistance
     * @param allowExtension
     * @param result
     */
    moveSignedDistanceFromFraction(startFraction, signedDistance, allowExtension, result) {
        const numSegments = this._points.length - 1;
        const scaledFraction = startFraction * numSegments;
        let leftPointIndex = Geometry_1.Geometry.restrictToInterval(Math.floor(scaledFraction), 0, numSegments - 1); // lower point index on active segment.
        const localFraction = scaledFraction - leftPointIndex;
        const point0 = this._points.interpolate(leftPointIndex, localFraction, leftPointIndex + 1, LineString3d._workPointA);
        const point1 = LineString3d._workPointB;
        const context = new MoveByDistanceContext(point0, startFraction, signedDistance);
        if (signedDistance > 0.0) {
            for (; leftPointIndex <= numSegments;) {
                leftPointIndex++;
                this._points.getPoint3dAtCheckedPointIndex(leftPointIndex, point1);
                if (context.announcePoint(point1, leftPointIndex / numSegments))
                    return CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPointDistanceCurveSearchStatus(this, context.fraction0, context.point0, signedDistance, CurveLocationDetail_1.CurveSearchStatus.success, result);
            }
            // fall through for extrapolation from final segment
            if (allowExtension)
                context.announceExtrapolation(this._points, numSegments - 1, numSegments, (numSegments - 1) / numSegments, 1.0);
            return CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPointDistanceCurveSearchStatus(this, context.fraction0, context.point0, signedDistance, context.distanceStatus(), result);
        }
        else { // (moving backwards)
            if (localFraction <= 0.0)
                leftPointIndex--;
            for (; leftPointIndex >= 0; leftPointIndex--) {
                this._points.getPoint3dAtCheckedPointIndex(leftPointIndex, point1);
                if (context.announcePoint(point1, leftPointIndex / numSegments))
                    return CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPointDistanceCurveSearchStatus(this, context.fraction0, context.point0, signedDistance, CurveLocationDetail_1.CurveSearchStatus.success, result);
            }
            // fall through for backward extrapolation from initial segment
            if (allowExtension)
                context.announceExtrapolation(this._points, 1, 0, 1.0 / numSegments, 0.0);
            return CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPointDistanceCurveSearchStatus(this, context.fraction0, context.point0, -context.distance0, context.distanceStatus(), result);
        }
    }
    /** sum lengths of segments in the linestring.  (This is a true length.) */
    quickLength() { return this.curveLength(); }
    /**
     * compute and normalize cross product among 3 points on the linestring.
     * * "any" 3 points are acceptable -- no test for positive overall sense.
     * * This is appropriate for polygon known to be convex.
     * * use points spread at index step n/3, hopefully avoiding colinear points.
     * * If that fails, try points 012
     * @param result computed normal.
     */
    quickUnitNormal(result) {
        let step = Math.floor(this._points.length / 3);
        if (step < 1)
            step = 1;
        result = this._points.crossProductIndexIndexIndex(0, step, step + step);
        if (result && result.normalizeInPlace())
            return result;
        return undefined;
    }
    /** Find the point on the linestring (including its segment interiors) that is closest to spacePoint. */
    closestPoint(spacePoint, extend, result) {
        result = CurveLocationDetail_1.CurveLocationDetail.create(this, result);
        const numPoints = this._points.length;
        if (numPoints > 0) {
            const lastIndex = numPoints - 1;
            result.setFP(1.0, this._points.getPoint3dAtUncheckedPointIndex(lastIndex), undefined);
            result.setDistanceTo(spacePoint);
            if (numPoints > 1) {
                let segmentFraction = 0;
                let d = 0;
                const df = 1.0 / lastIndex;
                for (let i = 1; i < numPoints; i++) {
                    segmentFraction = spacePoint.fractionOfProjectionToLine(this._points.getPoint3dAtUncheckedPointIndex(i - 1), this._points.getPoint3dAtUncheckedPointIndex(i));
                    if (segmentFraction < 0) {
                        if (!extend || i > 1)
                            segmentFraction = 0.0;
                    }
                    else if (segmentFraction > 1.0) {
                        if (!extend || i < lastIndex)
                            segmentFraction = 1.0;
                    }
                    this._points.getPoint3dAtUncheckedPointIndex(i - 1).interpolate(segmentFraction, this._points.getPoint3dAtUncheckedPointIndex(i), result.pointQ);
                    d = result.pointQ.distance(spacePoint);
                    if (d < result.a) {
                        result.setFP((i - 1 + segmentFraction) * df, result.pointQ, undefined, d);
                    }
                }
            }
        }
        return result;
    }
    /** Test if all points of the linestring are in a plane. */
    isInPlane(plane) {
        return this._points.isCloseToPlane(plane, Geometry_1.Geometry.smallMetricDistance);
    }
    /** push a hit, fixing up the prior entry if needed.
     * return the incremented counter.
     */
    static pushVertexHit(result, counter, cp, fraction, point) {
        const detail = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(cp, fraction, point);
        result.push(detail);
        if (counter === 0) {
            detail.setIntervalRole(CurveLocationDetail_1.CurveIntervalRole.isolatedAtVertex);
        }
        else if (counter === 1) { // last entry must be isolatedAtVertex !!!
            result[result.length - 2].setIntervalRole(CurveLocationDetail_1.CurveIntervalRole.intervalStart);
            detail.setIntervalRole(CurveLocationDetail_1.CurveIntervalRole.intervalEnd);
        }
        else {
            result[result.length - 2].setIntervalRole(CurveLocationDetail_1.CurveIntervalRole.intervalInterior);
            detail.setIntervalRole(CurveLocationDetail_1.CurveIntervalRole.intervalEnd);
        }
    }
    /** find intersections with a plane.
     *  Intersections within segments are recorded as CurveIntervalRole.isolated
     *   Intersections at isolated "on" vertex are recoded as CurveIntervalRole.isolatedAtVertex.
     */
    appendPlaneIntersectionPoints(plane, result) {
        if (this._points.length < 1)
            return 0;
        const initialLength = result.length;
        const n = this._points.length;
        const divisor = n === 1 ? 1.0 : n - 1;
        const pointA = LineString3d._workPointA;
        const pointB = LineString3d._workPointB;
        const pointC = LineString3d._workPointC;
        this._points.getPoint3dAtUncheckedPointIndex(0, pointA);
        let hB = 0;
        let numConsecutiveZero = 0;
        let hA = 0;
        let segmentFraction = 0;
        for (let i = 0; i < this._points.length; i++, pointA.setFrom(pointB), hA = hB) {
            this._points.getPoint3dAtUncheckedPointIndex(i, pointB);
            hB = Geometry_1.Geometry.correctSmallMetricDistance(plane.altitude(pointB));
            if (hB === 0.0)
                LineString3d.pushVertexHit(result, numConsecutiveZero++, this, i / divisor, pointB);
            else {
                if (hA * hB < 0.0) { // at point0, hA=0 will keep us out of here . ..
                    segmentFraction = hA / (hA - hB); // this division is safe because the signs are different.
                    pointA.interpolate(segmentFraction, pointB, pointC);
                    const detail = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(this, (i - 1 + segmentFraction) / divisor, pointC);
                    detail.setIntervalRole(CurveLocationDetail_1.CurveIntervalRole.isolated);
                    result.push(detail);
                    numConsecutiveZero = 0;
                }
            }
        }
        return result.length - initialLength;
    }
    /** Extend `rangeToExtend` to include all points of this linestring. */
    extendRange(rangeToExtend, transform) { this._points.extendRange(rangeToExtend, transform); }
    /** Test if each point of this linestring isAlmostEqual with corresponding point in `other`. */
    isAlmostEqual(other) {
        if (!(other instanceof LineString3d))
            return false;
        if (!GrowableXYZArray_1.GrowableXYZArray.isAlmostEqual(this._points, other._points))
            return false;
        return true;
    }
    /** Append (clone of) one point.
     * * BUT ... skip if duplicates the tail of prior points.
     * * if fraction is given, "duplicate" considers both point and fraction.
     */
    appendStrokePoint(point, fraction) {
        const n = this._points.length;
        let add = true;
        const addFraction = fraction !== undefined && this._fractions !== undefined;
        if (n > 0) {
            if (addFraction && Geometry_1.Geometry.isSameCoordinate(fraction, this._fractions.back()))
                add = false;
            if (point.isAlmostEqual(this._points.getPoint3dAtUncheckedPointIndex(n - 1)))
                add = false;
        }
        if (add) {
            this._points.push(point);
            if (addFraction)
                this.addFraction(fraction);
        }
    }
    /** Append a suitable evaluation of a curve ..
     * * always append the curve point
     * * if fraction array is present, append the fraction
     * * if derivative array is present, append the derivative
     * BUT ... skip if duplicates the tail of prior points.
     */
    appendFractionToPoint(curve, fraction) {
        if (this._derivatives) {
            const ray = curve.fractionToPointAndDerivative(fraction, LineString3d._workRay);
            if (this._fractions)
                this._fractions.push(fraction);
            this._points.push(ray.origin);
            if (this._derivatives)
                this._derivatives.push(ray.direction);
        }
        else {
            const point = curve.fractionToPoint(fraction, LineString3d._workPointA);
            if (this._fractions)
                this._fractions.push(fraction);
            this._points.push(point);
        }
    }
    /**
     * clear all array data:
     * * points
     * * optional fractions.
     * * optional derivatives.
     */
    clear() {
        this._points.clear();
        if (this._fractions)
            this._fractions.clear();
        if (this._derivatives)
            this._derivatives.clear();
    }
    /**
     * * options.needParams triggers creation of fraction array and uvParams array.
     * * options.needNormals triggers creation of derivatives array
     * @param capacity if positive, initial capacity of arrays
     * @param options  optional, to indicate if fraction and derivative arrays are required.
     */
    static createForStrokes(capacity = 0, options) {
        const ls = LineString3d.create();
        if (capacity > 0)
            ls._points.ensureCapacity(capacity);
        if (options) {
            if (options.needParams) {
                ls._fractions = new GrowableFloat64Array_1.GrowableFloat64Array(capacity);
                ls._uvParams = new GrowableXYArray_1.GrowableXYArray(capacity);
            }
            if (options.needNormals) {
                ls._derivatives = new GrowableXYZArray_1.GrowableXYZArray(capacity);
                ls._surfaceNormals = new GrowableXYZArray_1.GrowableXYZArray(capacity);
            }
        }
        return ls;
    }
    /** Evaluate a curve at uniform fractions.  Append the evaluations to this linestring.
     * @param curve primitive to evaluate.
     * @param numStrokes number of strokes (edges).
     * @param fraction0 starting fraction coordinate
     * @param fraction1 end fraction coordinate
     * @param include01 if false, points at fraction0 and fraction1 are omitted.
     */
    appendFractionalStrokePoints(curve, numStrokes, fraction0 = 0, fraction1 = 1, include01 = true) {
        let i0 = 1;
        let i1 = numStrokes - 1;
        if (include01) {
            i0 = 0;
            i1 = numStrokes;
        }
        if (numStrokes >= 1) {
            const df = (fraction1 - fraction0) / numStrokes;
            for (let i = i0; i <= i1; i++)
                this.appendFractionToPoint(curve, fraction0 + i * df);
        }
    }
    /** Append points constructed as interpolation between two points.
     * @param numStrokes number of strokes.
     * @param point0 first point
     * @param point1 last point
     * @param include01 if false, OMIT both start and end points (i.e. only compute and add true interior points)
     */
    appendInterpolatedStrokePoints(numStrokes, point0, point1, include01) {
        if (include01)
            this.appendStrokePoint(point0, 0.0);
        if (numStrokes > 1) {
            const df = 1.0 / numStrokes;
            for (let i = 1; i < numStrokes; i++) {
                const f = i * df;
                this.appendStrokePoint(point0.interpolate(f, point1), f);
            }
        }
        if (include01)
            this.appendStrokePoint(point1, 1.0);
    }
    /** Emit strokes to caller-supplied linestring */
    emitStrokes(dest, options) {
        const n = this._points.length;
        const pointA = LineString3d._workPointA;
        const pointB = LineString3d._workPointB;
        if (n > 0) {
            // This is a linestring.
            // There is no need for chordTol and angleTol within a segment.
            // Do NOT apply min strokes per primitive.
            if (options && options.hasMaxEdgeLength) {
                dest.appendStrokePoint(this._points.getPoint3dAtUncheckedPointIndex(0));
                for (let i = 1; i < n; i++) {
                    this._points.getPoint3dAtUncheckedPointIndex(i - 1, pointA);
                    this._points.getPoint3dAtUncheckedPointIndex(i, pointB);
                    const numStroke = options.applyMaxEdgeLength(1, pointA.distance(pointB));
                    if (numStroke > 1)
                        dest.appendInterpolatedStrokePoints(numStroke, pointA, pointB, false);
                    dest.appendStrokePoint(pointB);
                }
            }
            else {
                for (let i = 0; i < n; i++) {
                    dest.appendStrokePoint(this._points.getPoint3dAtUncheckedPointIndex(i));
                }
            }
        }
    }
    /** Emit strokable parts of the curve to a caller-supplied handler.
     * If the stroke options does not have a maxEdgeLength, one stroke is emitted for each segment of the linestring.
     * If the stroke options has a maxEdgeLength, smaller segments are emitted as needed.
     */
    emitStrokableParts(handler, options) {
        const n = this._points.length;
        handler.startCurvePrimitive(this);
        if (n > 1) {
            const df = 1.0 / (n - 1);
            // This is a linestring.
            // There is no need for chordTol and angleTol within a segment.
            // Do NOT apply min strokes per primitive.
            if (options && options.hasMaxEdgeLength) {
                for (let i = 1; i < n; i++) {
                    const numStroke = options.applyMaxEdgeLength(1, this._points.getPoint3dAtUncheckedPointIndex(i - 1).distance(this._points.getPoint3dAtUncheckedPointIndex(i)));
                    handler.announceSegmentInterval(this, this._points.getPoint3dAtUncheckedPointIndex(i - 1), this._points.getPoint3dAtUncheckedPointIndex(i), numStroke, (i - 1) * df, i * df);
                }
            }
            else {
                for (let i = 1; i < n; i++) {
                    handler.announceSegmentInterval(this, this._points.getPoint3dAtUncheckedPointIndex(i - 1), this._points.getPoint3dAtUncheckedPointIndex(i), 1, (i - 1) * df, i * df);
                }
            }
        }
        handler.endCurvePrimitive(this);
    }
    /**
     * return the stroke count required for given options.
     * @param options StrokeOptions that determine count
     */
    computeStrokeCountForOptions(options) {
        const numPoints = this._points.length;
        let numStroke = numPoints - 1;
        if (options && options.hasMaxEdgeLength) {
            numStroke = 0;
            for (let i = 1; i < numPoints; i++) {
                numStroke += options.applyMaxEdgeLength(1, this._points.distanceIndexIndex(i - 1, i));
            }
        }
        return numStroke;
    }
    /**
     * Compute individual segment stroke counts.  Attach in a StrokeCountMap.
     * @param options StrokeOptions that determine count
     * @param parentStrokeMap evolving parent map.
     */
    computeAndAttachRecursiveStrokeCounts(options, parentStrokeMap) {
        const numPoints = this._points.length;
        const applyOptions = options !== undefined && options.hasMaxEdgeLength;
        const myData = StrokeCountMap_1.StrokeCountMap.createWithCurvePrimitiveAndOptionalParent(this, parentStrokeMap, []);
        for (let i = 1; i < numPoints; i++) {
            const segmentLength = this._points.distanceIndexIndex(i - 1, i);
            const numStrokeOnSegment = applyOptions ? options.applyMaxEdgeLength(1, segmentLength) : 1;
            myData.addToCountAndLength(numStrokeOnSegment, segmentLength);
        }
        CurvePrimitive_1.CurvePrimitive.installStrokeCountMap(this, myData, parentStrokeMap);
    }
    /** Second step of double dispatch:  call `handler.handleLineString3d(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleLineString3d(this);
    }
    // HARD TO TEST -- tests that get to announceClipInterval for arc, bspline do NOT get here with
    // linestring because the controller has special case loops through segments?
    /**
     * Find intervals of this CurvePrimitive that are interior to a clipper
     * @param clipper clip structure (e.g. clip planes)
     * @param announce (optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(clipper, announce) {
        const n = this._points.length;
        if (n < 2)
            return false;
        let globalFractionA = 0.0;
        let globalFractionB = 1.0;
        const capture = (localFraction0, localFraction1) => {
            if (announce)
                announce(Geometry_1.Geometry.interpolate(globalFractionA, localFraction0, globalFractionB), Geometry_1.Geometry.interpolate(globalFractionA, localFraction1, globalFractionB), this);
        };
        const pointA = LineString3d._workPointA;
        const pointB = LineString3d._workPointB;
        this._points.getPoint3dAtUncheckedPointIndex(0, pointA);
        let status = false;
        for (let i = 1; i < n; i++, pointA.setFrom(pointB), globalFractionA = globalFractionB) {
            this._points.getPoint3dAtUncheckedPointIndex(i, pointB);
            globalFractionB = i / (n - 1);
            if (clipper.announceClippedSegmentIntervals(0.0, 1.0, pointA, pointB, capture))
                status = true;
        }
        return status;
    }
    addResolvedPoint(index, fraction, dest) {
        const n = this._points.length;
        if (n === 0)
            return;
        if (n === 1) {
            this._points.getPoint3dAtUncheckedPointIndex(0, LineString3d._indexPoint);
            dest.push(LineString3d._indexPoint);
            return;
        }
        if (index < 0)
            index = 0;
        if (index >= n) {
            index = n - 1;
            fraction += 1;
        }
        this._points.interpolate(index, fraction, index + 1, LineString3d._indexPoint);
        dest.push(LineString3d._indexPoint);
    }
    /** Return (if possible) a LineString which is a portion of this curve.
     * * This implementation does NOT extrapolate the linestring -- fractions are capped at 0 and 1.
     * @param fractionA [in] start fraction
     * @param fractionB [in] end fraction
     */
    clonePartialCurve(fractionA, fractionB) {
        if (fractionB < fractionA) {
            const linestringA = this.clonePartialCurve(fractionB, fractionA);
            if (linestringA)
                linestringA.reverseInPlace();
            return linestringA;
        }
        const n = this._points.length;
        const numEdge = n - 1;
        if (n < 2 || fractionA >= 1.0 || fractionB <= 0.0)
            return undefined;
        if (fractionA < 0)
            fractionA = 0;
        if (fractionB > 1)
            fractionB = 1;
        const gA = fractionA * numEdge;
        const gB = fractionB * numEdge;
        const indexA = Math.floor(gA);
        const indexB = Math.floor(gB);
        const localFractionA = gA - indexA;
        const localFractionB = gB - indexB;
        const result = LineString3d.create();
        this.addResolvedPoint(indexA, localFractionA, result._points);
        for (let index = indexA + 1; index <= indexB; index++) {
            this._points.getPoint3dAtUncheckedPointIndex(index, LineString3d._workPointA);
            result._points.push(LineString3d._workPointA);
        }
        if (!Geometry_1.Geometry.isSmallRelative(localFractionB)) {
            this.addResolvedPoint(indexB, localFractionB, result._points);
        }
        return result;
    }
    /** Return (if possible) a specific segment of the linestring */
    getIndexedSegment(index) {
        if (index >= 0 && index + 1 < this._points.length)
            return LineSegment3d_1.LineSegment3d.create(this._points.getPoint3dAtCheckedPointIndex(index), this._points.getPoint3dAtCheckedPointIndex(index + 1));
        return undefined;
    }
    /**
     * Returns true if first and last points are within metric tolerance.
     */
    get isPhysicallyClosed() {
        return this._points.length > 0 && Geometry_1.Geometry.isSmallMetricDistance(this._points.distanceIndexIndex(0, this._points.length - 1));
    }
    /**
     * evaluate strokes at fractions indicated in a StrokeCountMap.
     * * The map must have an array of component counts corresponding to the segment of this linestring.
     * * "fractions" in the output are mapped within a0,a1 of the map.componentData
     * @param map = stroke count data.
     * @param destLinestring = receiver linestring.
     * @return number of strokes added.  0 if `map.componentData` does not match the linestring
     */
    addMappedStrokesToLineString3D(map, destLinestring) {
        const numPoint0 = destLinestring.numPoints();
        const needFractions = destLinestring._fractions !== undefined;
        const needDerivatives = destLinestring._derivatives !== undefined;
        const points = this._points;
        const pointA = LineString3d._workPointA;
        const pointB = LineString3d._workPointB;
        const pointC = LineString3d._workPointC;
        const numParentPoint = points.length;
        if (map.primitive && map.primitive === this && map.componentData && map.componentData.length + 1 === numParentPoint) {
            points.getPoint3dAtUncheckedPointIndex(0, pointA);
            for (let k = 0; k + 1 < numParentPoint; k++, pointA.setFromPoint3d(pointB)) {
                points.getPoint3dAtUncheckedPointIndex(k + 1, pointB);
                const segmentMap = map.componentData[k];
                const m = segmentMap.numStroke;
                const vectorAB = pointA.vectorTo(pointB);
                vectorAB.scale(m);
                for (let i = 0; i <= m; i++) {
                    const fraction = i / m;
                    const outputFraction = segmentMap.fractionToA(fraction);
                    destLinestring.addPoint(pointA.interpolate(fraction, pointB, pointC));
                    if (needFractions)
                        destLinestring._fractions.push((outputFraction));
                    if (needDerivatives)
                        destLinestring._derivatives.push(vectorAB);
                }
            }
        }
        return destLinestring.numPoints() - numPoint0;
    }
    /** convert variant point data to a single level array of linestrings.
     * * The result is always an array of LineString3d.
     *   * Single linestring is NOT bubbled out as a special case.
     *   * data with no point is an empty array.
     *   * "deep" data is flattened to a single array of linestrings, losing structure.
     */
    static createArrayOfLineString3dFromVariantData(data) {
        const collector = new PointStreaming_1.PointStreamGrowableXYZArrayCollector();
        PointStreaming_1.VariantPointDataStream.streamXYZ(data, collector);
        const growableArrays = collector.claimArrayOfGrowableXYZArray();
        const result = [];
        if (growableArrays !== undefined) {
            for (const points of growableArrays)
                result.push(LineString3d.createCapture(points));
        }
        return result;
    }
    /**
     * This method name is deprecated. Use `LineString3d.createArrayOfLineString3dFromVariantData`
     * @deprecated use LineString3d.createArrayOfLineString3dFromVariantData
     */
    static createArrayOfLineString3d(data) {
        return this.createArrayOfLineString3dFromVariantData(data);
    }
}
exports.LineString3d = LineString3d;
LineString3d._workPointA = Point3dVector3d_1.Point3d.create();
LineString3d._workPointB = Point3dVector3d_1.Point3d.create();
LineString3d._workPointC = Point3dVector3d_1.Point3d.create();
LineString3d._workRay = Ray3d_1.Ray3d.createXAxis();
LineString3d._indexPoint = Point3dVector3d_1.Point3d.create(); // private point for indexAndFractionToPoint.
/** An AnnotatedLineString3d is a linestring with additional surface-related data attached to each point
 * * This is useful in facet construction.
 * @internal
 */
class AnnotatedLineString3d {
}
exports.AnnotatedLineString3d = AnnotatedLineString3d;
/**
 * context to be called to incrementally accumulate distance along line segments.
 */
class MoveByDistanceContext {
    /** CAPTURE point0, fraction0, targetDistance */
    constructor(point0, fraction0, targetDistance) {
        this.point0 = point0;
        this.distance0 = 0.0;
        this.targetDistance = Math.abs(targetDistance);
        this.fraction0 = fraction0;
    }
    // Return CurveSearchStatus indicating whether the accumulated distance has reached the target.
    distanceStatus() {
        return Geometry_1.Geometry.isSameCoordinate(this.distance0, this.targetDistance) ?
            CurveLocationDetail_1.CurveSearchStatus.success : CurveLocationDetail_1.CurveSearchStatus.stoppedAtBoundary;
    }
    /**
     * Announce next point on the polyline.
     * * if the additional segment does NOT reach the target:
     *   * accumulate the segment length
     *   * update point0 and fraction0
     *   * return false
     *  * if the additional segment DOES reach the target:
     *    * update point0 and fraction0 to the (possibly interpolated) final point and fraction
     *    * return true
     * @param point1 new point
     * @param fraction1 fraction at point1
     * @return true if targetDistance reached.
     */
    announcePoint(point1, fraction1) {
        const a = this.point0.distance(point1);
        const distance1 = this.distance0 + a;
        if (distance1 < this.targetDistance && !Geometry_1.Geometry.isSameCoordinate(distance1, this.targetDistance)) {
            this.point0.setFromPoint3d(point1);
            this.distance0 = distance1;
            this.fraction0 = fraction1;
            return false;
        }
        const b = this.targetDistance - this.distance0;
        const intervalFraction = Geometry_1.Geometry.safeDivideFraction(b, a, 0.0);
        this.point0.interpolate(intervalFraction, point1, this.point0);
        this.fraction0 = Geometry_1.Geometry.interpolate(this.fraction0, intervalFraction, fraction1);
        this.distance0 = this.targetDistance;
        return true;
    }
    /**
     * Update point0, fraction0, and distance0 based on extrapolation of a segment between indices of a point array.
     * @returns true if extrapolation succeeded.  (False if indexed points are coincident)
     * @param points
     * @param index0
     * @param index1
     * @param fraction0
     * @param fraction1
     * @param result
     * @param CurveLocationDetail
     */
    announceExtrapolation(points, index0, index1, fraction0, fraction1) {
        const residual = this.targetDistance - this.distance0;
        const d01 = points.distanceIndexIndex(index0, index1);
        if (!d01)
            return false;
        const extensionFraction = Geometry_1.Geometry.conditionalDivideFraction(residual, d01);
        if (extensionFraction === undefined)
            return false;
        // (Remark: indices are swapped and extensionFraction negated to prevent incidental precision
        // loss with the alternative call with (index0, 1 + extensionFraction, index1);
        points.interpolate(index1, -extensionFraction, index0, this.point0);
        this.distance0 = this.targetDistance;
        this.fraction0 = Geometry_1.Geometry.interpolate(fraction1, -extensionFraction, fraction0);
        return true;
    }
}
//# sourceMappingURL=LineString3d.js.map