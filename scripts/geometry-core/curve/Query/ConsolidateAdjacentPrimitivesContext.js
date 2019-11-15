"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const CurveCollection_1 = require("../CurveCollection");
const GeometryHandler_1 = require("../../geometry3d/GeometryHandler");
const LineSegment3d_1 = require("../LineSegment3d");
const LineString3d_1 = require("../LineString3d");
const PolylineOps_1 = require("../../geometry3d/PolylineOps");
const Arc3d_1 = require("../Arc3d");
const CurveFactory_1 = require("../CurveFactory");
/** @module Curve */
/**
 * * Implementation class for ConsolidateAdjacentCurvePrimitives.
 *
 * @internal
 */
class ConsolidateAdjacentCurvePrimitivesContext extends GeometryHandler_1.NullGeometryHandler {
    constructor(options) {
        super();
        this._options = options ? options : new CurveCollection_1.ConsolidateAdjacentCurvePrimitivesOptions();
    }
    /** look for adjacent compatible primitives in a path or loop. */
    handleCurveChain(g) {
        const children = g.children;
        const numOriginal = children.length;
        const points = [];
        let numAccept = 0;
        // i0 <=i < i1 is a range of child indices.
        // numAccept is the number of children accepted (contiguously at front of children)
        for (let i0 = 0; i0 < numOriginal;) {
            const basePrimitive = g.children[i0];
            if (this._options.consolidateLinearGeometry && (basePrimitive instanceof LineSegment3d_1.LineSegment3d || basePrimitive instanceof LineString3d_1.LineString3d)) {
                points.length = 0;
                let i1 = i0;
                // on exit, i1 is beyond the block of linear primitives  . ..
                for (; i1 < g.children.length; i1++) {
                    const nextPrimitive = g.children[i1];
                    if (nextPrimitive instanceof LineSegment3d_1.LineSegment3d) {
                        points.push(nextPrimitive.startPoint());
                        points.push(nextPrimitive.endPoint());
                    }
                    else if (nextPrimitive instanceof LineString3d_1.LineString3d) {
                        const source = nextPrimitive.packedPoints;
                        for (let k = 0; k < source.length; k++) {
                            points.push(source.getPoint3dAtUncheckedPointIndex(k));
                        }
                    }
                    else {
                        break;
                    }
                }
                if (points.length > 1) {
                    const compressedPointsA = PolylineOps_1.PolylineOps.compressShortEdges(points, this._options.colinearPointTolerance);
                    const compressedPointsB = PolylineOps_1.PolylineOps.compressByPerpendicularDistance(compressedPointsA, this._options.colinearPointTolerance);
                    if (compressedPointsB.length < 2) {
                        // Collapsed to a point?  Make a single point linestring
                        g.children[numAccept++] = LineString3d_1.LineString3d.create(compressedPointsB[0]);
                    }
                    else if (compressedPointsB.length === 2) {
                        g.children[numAccept++] = LineSegment3d_1.LineSegment3d.create(compressedPointsB[0], compressedPointsB[1]);
                    }
                    else {
                        g.children[numAccept++] = LineString3d_1.LineString3d.createPoints(compressedPointsB);
                    }
                }
                else {
                    g.children[numAccept++] = basePrimitive;
                }
                i0 = i1;
            }
            else if (this._options.consolidateCompatibleArcs && basePrimitive instanceof Arc3d_1.Arc3d) {
                // subsume subsequent arcs into basePrimitive.
                // always accept base primitive.
                for (; ++i0 < g.children.length;) {
                    const nextPrimitive = g.children[i0];
                    if (!(nextPrimitive instanceof Arc3d_1.Arc3d))
                        break;
                    if (!CurveFactory_1.CurveFactory.appendToArcInPlace(basePrimitive, nextPrimitive))
                        break;
                }
                // i0 has already advanced
                g.children[numAccept++] = basePrimitive; // which has been extended 0 or more times.
            }
            else {
                g.children[numAccept++] = basePrimitive;
                i0++;
            }
        }
        g.children.length = numAccept;
    }
    handlePath(g) { return this.handleCurveChain(g); }
    handleLoop(g) { return this.handleCurveChain(g); }
}
exports.ConsolidateAdjacentCurvePrimitivesContext = ConsolidateAdjacentCurvePrimitivesContext;
//# sourceMappingURL=ConsolidateAdjacentPrimitivesContext.js.map