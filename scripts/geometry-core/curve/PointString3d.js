"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Geometry_1 = require("../Geometry");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
const GeometryQuery_1 = require("./GeometryQuery");
/* tslint:disable:variable-name no-empty*/
/**
 * A PointString3d is an array of points.
 * * PointString3D is first class (displayable) geometry derived from the GeometryQuery base class.
 * * The varous points in the PointString3d are NOT connected by line segments for display or other calculations.
 */
class PointString3d extends GeometryQuery_1.GeometryQuery {
    isSameGeometryClass(other) { return other instanceof PointString3d; }
    /** return the points array (cloned). */
    get points() { return this._points; }
    constructor() {
        super();
        this._points = [];
    }
    cloneTransformed(transform) {
        const c = this.clone();
        c.tryTransformInPlace(transform);
        return c;
    }
    static flattenArray(arr) {
        return arr.reduce((flat, toFlatten) => {
            return flat.concat(Array.isArray(toFlatten) ? PointString3d.flattenArray(toFlatten) : toFlatten);
        }, []);
    }
    /** Create a PointString3d from points. */
    static create(...points) {
        const result = new PointString3d();
        result.addPoints(points);
        return result;
    }
    /** Add multiple points to the PointString3d */
    addPoints(...points) {
        const toAdd = PointString3d.flattenArray(points);
        for (const p of toAdd) {
            if (p instanceof Point3dVector3d_1.Point3d)
                this._points.push(p);
        }
    }
    /** Add a single point to the PoinstString3d */
    addPoint(point) {
        this._points.push(point);
    }
    /** Remove the last point added to the PointString3d */
    popPoint() {
        this._points.pop();
    }
    setFrom(other) {
        this._points = PointHelpers_1.Point3dArray.clonePoint3dArray(other._points);
    }
    /** Create from an array of Point3d */
    static createPoints(points) {
        const ps = new PointString3d();
        ps._points = PointHelpers_1.Point3dArray.clonePoint3dArray(points);
        return ps;
    }
    /** Create a PointString3d from xyz coordinates packed in a Float64Array */
    static createFloat64Array(xyzData) {
        const ps = new PointString3d();
        for (let i = 0; i + 3 <= xyzData.length; i += 3)
            ps._points.push(Point3dVector3d_1.Point3d.create(xyzData[i], xyzData[i + 1], xyzData[i + 2]));
        return ps;
    }
    clone() {
        const retVal = new PointString3d();
        retVal.setFrom(this);
        return retVal;
    }
    setFromJSON(json) {
        this._points.length = 0;
        if (Array.isArray(json)) {
            let xyz;
            for (xyz of json)
                this._points.push(Point3dVector3d_1.Point3d.fromJSON(xyz));
        }
    }
    /**
     * Convert an PointString3d to a JSON object.
     * @return {*} [[x,y,z],...[x,y,z]]
     */
    toJSON() {
        const value = [];
        for (const p of this._points)
            value.push(p.toJSON());
        return value;
    }
    static fromJSON(json) {
        const ps = new PointString3d();
        ps.setFromJSON(json);
        return ps;
    }
    /** Access a single point by index. */
    pointAt(i, result) {
        if (i >= 0 && i < this._points.length) {
            if (result) {
                result.setFrom(this._points[i]);
                return result;
            }
            return this._points[i].clone();
        }
        return undefined;
    }
    /** Return the number of points. */
    numPoints() { return this._points.length; }
    /** Reverse the point order */
    reverseInPlace() {
        if (this._points.length >= 2) {
            let i0 = 0;
            let i1 = this._points.length - 1;
            while (i0 < i1) {
                const a = this._points[i0];
                this._points[i1] = this._points[i0];
                this._points[i0] = a;
                i0++;
                i1--;
            }
        }
    }
    /** Return the number of points. */
    tryTransformInPlace(transform) {
        transform.multiplyPoint3dArrayInPlace(this._points);
        return true;
    }
    /** Return the index and coordinates of the closest point to spacepoint. */
    closestPoint(spacePoint) {
        const result = { index: -1, xyz: Point3dVector3d_1.Point3d.create() };
        const index = PointHelpers_1.Point3dArray.closestPointIndex(this._points, spacePoint);
        if (index >= 0) {
            result.index = index;
            result.xyz.setFrom(this._points[index]);
        }
        return result;
    }
    /** Return true if all points are in the given plane. */
    isInPlane(plane) {
        return PointHelpers_1.Point3dArray.isCloseToPlane(this._points, plane, Geometry_1.Geometry.smallMetricDistance);
    }
    /** Extend a range to include the points in this PointString3d. */
    extendRange(rangeToExtend, transform) {
        rangeToExtend.extendArray(this._points, transform);
    }
    /** Return true if corresponding points are almost equal. */
    isAlmostEqual(other) {
        if (!(other instanceof PointString3d))
            return false;
        return PointHelpers_1.Point3dArray.isAlmostEqual(this._points, other._points);
    }
    /** Reduce to empty set of points. */
    clear() { this._points.length = 0; }
    /** Pass this PointString3d to the handler's `handlePointString` method. */
    dispatchToGeometryHandler(handler) {
        return handler.handlePointString3d(this);
    }
}
exports.PointString3d = PointString3d;
//# sourceMappingURL=PointString3d.js.map