"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const FrameBuilder_1 = require("../FrameBuilder");
const PolyfaceBuilder_1 = require("../polyface/PolyfaceBuilder");
const Triangulation_1 = require("../topology/Triangulation");
const LineString3d_1 = require("../curve/LineString3d");
const CurveChain_1 = require("../curve/CurveChain");
const PointHelpers_1 = require("../PointHelpers");
/**
 * Sweepable contour with Transform for local to world interaction.
 */
class SweepContour {
    constructor(contour, map) {
        this.curves = contour;
        this.localToWorld = map;
    }
    static createForLinearSweep(contour, defaultNormal) {
        const localToWorld = FrameBuilder_1.FrameBuilder.createRightHandedFrame(defaultNormal, contour);
        if (localToWorld) {
            return new SweepContour(contour, localToWorld);
        }
        return undefined;
    }
    static createForRotation(contour, axis) {
        // createRightHandedFrame -- the axis is a last-gasp resolver for in-plane vectors.
        const localToWorld = FrameBuilder_1.FrameBuilder.createRightHandedFrame(undefined, contour, axis);
        if (localToWorld) {
            return new SweepContour(contour, localToWorld);
        }
        return undefined;
    }
    getCurves() { return this.curves; }
    tryTransformInPlace(transform) {
        transform.multiplyTransformTransform(this.localToWorld, this.localToWorld);
        return true;
    }
    clone() {
        return new SweepContour(this.curves.clone(), this.localToWorld.clone());
    }
    cloneTransformed(transform) {
        const newContour = this.clone();
        if (newContour.tryTransformInPlace(transform))
            return newContour;
        return undefined;
    }
    isAlmostEqual(other) {
        if (other instanceof SweepContour) {
            return this.curves.isAlmostEqual(other.curves) && this.localToWorld.isAlmostEqual(other.localToWorld);
        }
        return false;
    }
    /**
     * build the (cached) internal facets.
     * @param _builder (NOT USED -- an internal builder is constructed for the triangulation)
     * @param options options for stroking the curves.
     */
    buildFacets(_builder, options) {
        if (!this._facets) {
            if (this.curves instanceof CurveChain_1.Loop) {
                this._xyStrokes = this.curves.cloneStroked(options);
                if (this._xyStrokes instanceof CurveChain_1.Loop && this._xyStrokes.children.length === 1) {
                    const children = this._xyStrokes.children;
                    const linestring = children[0];
                    const points = linestring.points;
                    this.localToWorld.multiplyInversePoint3dArrayInPlace(points);
                    if (PointHelpers_1.PolygonOps.sumTriangleAreasXY(points) < 0)
                        points.reverse();
                    const graph = Triangulation_1.Triangulator.earcutSingleLoop(points);
                    const unflippedPoly = PolyfaceBuilder_1.PolyfaceBuilder.graphToPolyface(graph, options);
                    this._facets = unflippedPoly;
                    this._facets.tryTransformInPlace(this.localToWorld);
                }
            }
            else if (this.curves instanceof CurveChain_1.ParityRegion) {
                this._xyStrokes = this.curves.cloneStroked(options);
                if (this._xyStrokes instanceof (CurveChain_1.ParityRegion)) {
                    this._xyStrokes.tryTransformInPlace(this.localToWorld);
                    const strokes = [];
                    for (const childLoop of this._xyStrokes.children) {
                        const loopCurves = childLoop.children;
                        if (loopCurves.length === 1) {
                            const c = loopCurves[0];
                            if (c instanceof LineString3d_1.LineString3d)
                                strokes.push(c.packedPoints);
                        }
                    }
                    const graph = Triangulation_1.Triangulator.triangulateStrokedLoops(strokes);
                    if (graph) {
                        const unflippedPoly = PolyfaceBuilder_1.PolyfaceBuilder.graphToPolyface(graph, options);
                        this._facets = unflippedPoly;
                        this._facets.tryTransformInPlace(this.localToWorld);
                    }
                }
            }
        }
    }
    /** Emit facets to a builder.
     * This method may cache and reuse facets over multiple calls.
     */
    emitFacets(builder, reverse, transform) {
        this.buildFacets(builder, builder.options);
        if (this._facets)
            builder.addIndexedPolyface(this._facets, reverse, transform);
    }
}
exports.SweepContour = SweepContour;
//# sourceMappingURL=SweepContour.js.map