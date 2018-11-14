"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Geometry_1 = require("../Geometry");
const LineString3d_1 = require("./LineString3d");
const CurveCollection_1 = require("./CurveCollection");
/**
 * A `Loop` is a curve chain that is the boundary of a closed (planar) loop.
 */
class Loop extends CurveCollection_1.CurveChain {
    constructor() {
        super();
        this.isInner = false;
    }
    isSameGeometryClass(other) { return other instanceof Loop; }
    /**
     * Create a loop from variable length list of CurvePrimtives
     * @param curves array of individual curve primitives
     */
    static create(...curves) {
        const result = new Loop();
        for (const curve of curves) {
            result.children.push(curve);
        }
        return result;
    }
    /**
     * Create a loop from an array of curve primtiives
     * @param curves array of individual curve primitives
     */
    static createArray(curves) {
        const result = new Loop();
        for (const curve of curves) {
            result.children.push(curve);
        }
        return result;
    }
    static createPolygon(points) {
        const linestring = LineString3d_1.LineString3d.create(points);
        linestring.addClosurePoint();
        return Loop.create(linestring);
    }
    cloneStroked(options) {
        const strokes = LineString3d_1.LineString3d.create();
        for (const curve of this.children)
            curve.emitStrokes(strokes, options);
        return Loop.create(strokes);
    }
    dgnBoundaryType() { return 2; } // (2) all "Loop" become "outer"
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceLoop(this, indexInParent);
    }
    cyclicCurvePrimitive(index) {
        const n = this.children.length;
        if (n >= 1) {
            index = Geometry_1.Geometry.modulo(index, this.children.length);
            return this.children[index];
        }
        return undefined;
    }
    cloneEmptyPeer() { return new Loop(); }
    dispatchToGeometryHandler(handler) {
        return handler.handleLoop(this);
    }
}
exports.Loop = Loop;
//# sourceMappingURL=Loop.js.map