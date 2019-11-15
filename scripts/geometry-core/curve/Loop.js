"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const LineString3d_1 = require("./LineString3d");
const CurveCollection_1 = require("./CurveCollection");
/**
 * A `Loop` is a curve chain that is the boundary of a closed (planar) loop.
 * @public
 */
class Loop extends CurveCollection_1.CurveChain {
    /** Test if `other` is an instance of `Loop` */
    constructor() {
        super();
        /** String name for schema properties */
        this.curveCollectionType = "loop";
        /** tag value that can be set to true for user code to mark inner and outer loops. */
        this.isInner = false;
    }
    /** test if `other` is a `Loop` */
    isSameGeometryClass(other) { return other instanceof Loop; }
    /**
     * Create a loop from variable length list of CurvePrimitives
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
     * Create a loop from an array of curve primitives
     * @param curves array of individual curve primitives
     */
    static createArray(curves) {
        const result = new Loop();
        for (const curve of curves) {
            result.children.push(curve);
        }
        return result;
    }
    /** Create a loop from an array of points */
    static createPolygon(points) {
        const linestring = LineString3d_1.LineString3d.create(points);
        linestring.addClosurePoint();
        return Loop.create(linestring);
    }
    /** Create a loop with the stroked form of this loop. */
    cloneStroked(options) {
        const strokes = LineString3d_1.LineString3d.create();
        for (const curve of this.children)
            curve.emitStrokes(strokes, options);
        return Loop.create(strokes);
    }
    /** Return the boundary type (2) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType() { return 2; } // (2) all "Loop" become "outer"
    /** invoke `processor.announceLoop(this, indexInParent)` */
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceLoop(this, indexInParent);
    }
    /** Create a new `Loop` with no children */
    cloneEmptyPeer() { return new Loop(); }
    /** Second step of double dispatch:  call `handler.handleLoop(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleLoop(this);
    }
}
exports.Loop = Loop;
//# sourceMappingURL=Loop.js.map