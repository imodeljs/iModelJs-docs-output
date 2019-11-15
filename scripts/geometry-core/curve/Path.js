"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurvePrimitive_1 = require("./CurvePrimitive");
const LineString3d_1 = require("./LineString3d");
const CurveCollection_1 = require("./CurveCollection");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
/**
 * * A `Path` object is a collection of curves that join head-to-tail to form a path.
 * * A `Path` object does not bound a planar region.  Use `Loop` to indicate region bounding.
 * @public
 */
class Path extends CurveCollection_1.CurveChain {
    /** Construct an empty path. */
    constructor() {
        super();
        /** String name for schema properties */
        this.curveCollectionType = "path";
    }
    /** Test if `other` is an instance of `Path` */
    isSameGeometryClass(other) { return other instanceof Path; }
    /** invoke `processor.announcePath(this, indexInParent)` */
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announcePath(this, indexInParent);
    }
    /**
     * Create a path from a variable length list of curve primitives
     * * CurvePrimitive params are captured !!!
     * @param curves variable length list of individual curve primitives or point arrays.
     */
    static create(...curves) {
        const result = new Path();
        for (const curve of curves) {
            if (curve instanceof CurvePrimitive_1.CurvePrimitive)
                result.children.push(curve);
            else if (Array.isArray(curve) && curve.length > 0 && curve[0] instanceof Point3dVector3d_1.Point3d) {
                result.children.push(LineString3d_1.LineString3d.create(curve));
            }
        }
        return result;
    }
    /**
     * Create a path from a an array of curve primitives
     * @param curves array of individual curve primitives
     */
    static createArray(curves) {
        const result = new Path();
        for (const curve of curves) {
            result.children.push(curve);
        }
        return result;
    }
    /** Return a deep copy, with leaf-level curve primitives stroked. */
    cloneStroked(options) {
        const strokes = LineString3d_1.LineString3d.create();
        for (const curve of this.children)
            curve.emitStrokes(strokes, options);
        return Path.create(strokes);
    }
    /** Return the boundary type (1) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType() { return 1; }
    /** Clone as a new `Path` with no primitives */
    cloneEmptyPeer() { return new Path(); }
    /** Second step of double dispatch:  call `handler.handlePath(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handlePath(this);
    }
}
exports.Path = Path;
//# sourceMappingURL=Path.js.map