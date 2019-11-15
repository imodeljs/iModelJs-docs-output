"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Curve */
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Range_1 = require("../geometry3d/Range");
const GeometryQuery_1 = require("./GeometryQuery");
/** A Coordinate is a Point3d with supporting methods from the GeometryQuery abstraction.
 * @public
 */
class CoordinateXYZ extends GeometryQuery_1.GeometryQuery {
    /**
     * @param xyz point to be CAPTURED.
     */
    constructor(xyz) {
        super();
        /** String name for interface properties */
        this.geometryCategory = "point";
        this._xyz = xyz;
    }
    /** Return a (REFERENCE TO) the coordinate data. */
    get point() { return this._xyz; }
    /** Create a new CoordinateXYZ containing a CLONE of point */
    static create(point) {
        return new CoordinateXYZ(point.clone());
    }
    /** Create a new CoordinateXYZ */
    static createXYZ(x = 0, y = 0, z = 0) {
        return new CoordinateXYZ(Point3dVector3d_1.Point3d.create(x, y, z));
    }
    /** return the range of the point */
    range() { return Range_1.Range3d.create(this._xyz); }
    /** extend `rangeToExtend` to include this point (optionally transformed) */
    extendRange(rangeToExtend, transform) {
        if (transform)
            rangeToExtend.extendTransformedXYZ(transform, this._xyz.x, this._xyz.y, this._xyz.z);
        else
            rangeToExtend.extend(this._xyz);
    }
    /** Apply transform to the Coordinate's point. */
    tryTransformInPlace(transform) {
        transform.multiplyPoint3d(this._xyz, this._xyz);
        return true;
    }
    /** return a transformed clone.
     */
    cloneTransformed(transform) {
        const result = new CoordinateXYZ(this._xyz.clone());
        result.tryTransformInPlace(transform);
        return result;
    }
    /** return a clone */
    clone() {
        return new CoordinateXYZ(this._xyz.clone());
    }
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    /** test if (other instanceof Coordinate).  */
    isSameGeometryClass(other) {
        return other instanceof CoordinateXYZ;
    }
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other) {
        return (other instanceof CoordinateXYZ) && this._xyz.isAlmostEqual(other._xyz);
    }
    /** Second step of double dispatch:  call `handler.handleCoordinateXYZ(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleCoordinateXYZ(this);
    }
}
exports.CoordinateXYZ = CoordinateXYZ;
//# sourceMappingURL=CoordinateXYZ.js.map