"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const LineString3d_1 = require("./LineString3d");
const CurveCollection_1 = require("./CurveCollection");
/**
 * * A `Path` object is a collection of curves that join head-to-tail to form a path.
 * * A `Path` object does not bound a planar region.
 */
class Path extends CurveCollection_1.CurveChain {
    isSameGeometryClass(other) { return other instanceof Path; }
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announcePath(this, indexInParent);
    }
    constructor() { super(); }
    /**
     * Create a path from a variable length list of curve primtiives
     * @param curves variable length list of individual curve primitives
     */
    static create(...curves) {
        const result = new Path();
        for (const curve of curves) {
            result.children.push(curve);
        }
        return result;
    }
    /**
     * Create a path from a an array of curve primtiives
     * @param curves array of individual curve primitives
     */
    static createArray(curves) {
        const result = new Path();
        for (const curve of curves) {
            result.children.push(curve);
        }
        return result;
    }
    cloneStroked(options) {
        const strokes = LineString3d_1.LineString3d.create();
        for (const curve of this.children)
            curve.emitStrokes(strokes, options);
        return Path.create(strokes);
    }
    dgnBoundaryType() { return 1; }
    cyclicCurvePrimitive(index) {
        if (index >= 0 && index < this.children.length)
            return this.children[index];
        return undefined;
    }
    cloneEmptyPeer() { return new Path(); }
    dispatchToGeometryHandler(handler) {
        return handler.handlePath(this);
    }
}
exports.Path = Path;
//# sourceMappingURL=Path.js.map