"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const FrameBuilder_1 = require("../geometry3d/FrameBuilder");
const PolyfaceBuilder_1 = require("../polyface/PolyfaceBuilder");
const Triangulation_1 = require("../topology/Triangulation");
const LineString3d_1 = require("../curve/LineString3d");
const ParityRegion_1 = require("../curve/ParityRegion");
const Loop_1 = require("../curve/Loop");
const PolygonOps_1 = require("../geometry3d/PolygonOps");
/**
 * Sweepable contour with Transform for local to world interaction.
 * * The surface/solid classes `LinearSweep`, `RotationalSweep`, `RuledSweep` use this for their swept contours.
 * @public
 */
class SweepContour {
    constructor(contour, map, axis) {
        this.curves = contour;
        this.localToWorld = map;
        this.axis = axis;
    }
    /** Create for linear sweep.
     * * The optional default normal may be useful for guiding coordinate frame setup.
     * * the contour is CAPTURED.
     */
    static createForLinearSweep(contour, defaultNormal) {
        const localToWorld = FrameBuilder_1.FrameBuilder.createRightHandedFrame(defaultNormal, contour);
        if (localToWorld) {
            return new SweepContour(contour, localToWorld, undefined);
        }
        return undefined;
    }
    /** Create for linear sweep.
     * * The optional default normal may be useful for guiding coordinate frame setup.
     * * the points are captured into linestrings and Loops as needed.
     */
    static createForPolygon(points, defaultNormal) {
        const localToWorld = FrameBuilder_1.FrameBuilder.createRightHandedFrame(defaultNormal, points);
        if (localToWorld) {
            if (defaultNormal !== undefined) {
                if (localToWorld.matrix.dotColumnZ(defaultNormal))
                    localToWorld.matrix.scaleColumnsInPlace(1.0, -1.0, -1.0);
            }
            const linestrings = LineString3d_1.LineString3d.createArrayOfLineString3dFromVariantData(points);
            const loops = [];
            for (const ls of linestrings) {
                ls.addClosurePoint();
                loops.push(Loop_1.Loop.create(ls));
            }
            if (loops.length === 1) {
                return new SweepContour(loops[0], localToWorld, undefined);
            }
            else if (loops.length > 1) {
                return new SweepContour(ParityRegion_1.ParityRegion.createLoops(loops), localToWorld, undefined);
            }
        }
        return undefined;
    }
    /** Create for rotational sweep.
     * * The axis ray is retained.
     * * the contour is CAPTURED.
     */
    static createForRotation(contour, axis) {
        // createRightHandedFrame -- the axis is a last-gasp resolver for in-plane vectors.
        const localToWorld = FrameBuilder_1.FrameBuilder.createRightHandedFrame(undefined, contour, axis);
        if (localToWorld) {
            return new SweepContour(contour, localToWorld, axis.clone());
        }
        return undefined;
    }
    /** Return (Reference to) the curves */
    getCurves() { return this.curves; }
    /** Apply `transform` to the curves, axis.
     * * The local to world frame is reconstructed for the transformed curves.
     */
    tryTransformInPlace(transform) {
        if (this.curves.tryTransformInPlace(transform)) {
            if (this.axis)
                this.axis.transformInPlace(transform);
            const localToWorld = this.axis !== undefined
                ? FrameBuilder_1.FrameBuilder.createRightHandedFrame(undefined, this.curves, this.axis)
                : FrameBuilder_1.FrameBuilder.createRightHandedFrame(undefined, this.curves);
            if (localToWorld) {
                this.localToWorld.setFrom(localToWorld);
                return true;
            }
        }
        return false;
    }
    /** Return a deep clone. */
    clone() {
        return new SweepContour(this.curves.clone(), this.localToWorld.clone(), this.axis);
    }
    /** Return a transformed clone. */
    cloneTransformed(transform) {
        const newContour = this.clone();
        if (newContour.tryTransformInPlace(transform))
            return newContour;
        return undefined;
    }
    /** Test for near equality of cures and local frame. */
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
            if (this.curves instanceof Loop_1.Loop) {
                this._xyStrokes = this.curves.cloneStroked(options);
                if (this._xyStrokes instanceof Loop_1.Loop && this._xyStrokes.children.length === 1) {
                    const children = this._xyStrokes.children;
                    const linestring = children[0];
                    const points = linestring.points;
                    this.localToWorld.multiplyInversePoint3dArrayInPlace(points);
                    if (PolygonOps_1.PolygonOps.sumTriangleAreasXY(points) < 0)
                        points.reverse();
                    const graph = Triangulation_1.Triangulator.createTriangulatedGraphFromSingleLoop(points);
                    if (graph) {
                        Triangulation_1.Triangulator.flipTriangles(graph);
                        const unflippedPoly = PolyfaceBuilder_1.PolyfaceBuilder.graphToPolyface(graph, options);
                        this._facets = unflippedPoly;
                        this._facets.tryTransformInPlace(this.localToWorld);
                    }
                }
            }
            else if (this.curves instanceof ParityRegion_1.ParityRegion) {
                this._xyStrokes = this.curves.cloneStroked(options);
                if (this._xyStrokes instanceof (ParityRegion_1.ParityRegion)) {
                    const worldToLocal = this.localToWorld.inverse();
                    this._xyStrokes.tryTransformInPlace(worldToLocal);
                    const strokes = [];
                    for (const childLoop of this._xyStrokes.children) {
                        const loopCurves = childLoop.children;
                        if (loopCurves.length === 1) {
                            const c = loopCurves[0];
                            if (c instanceof LineString3d_1.LineString3d)
                                strokes.push(c.packedPoints);
                        }
                    }
                    const graph = Triangulation_1.Triangulator.createTriangulatedGraphFromLoops(strokes);
                    if (graph) {
                        Triangulation_1.Triangulator.flipTriangles(graph);
                        const unflippedPoly = PolyfaceBuilder_1.PolyfaceBuilder.graphToPolyface(graph, options);
                        this._facets = unflippedPoly;
                        this._facets.tryTransformInPlace(this.localToWorld);
                    }
                }
            }
        }
    }
    /** delete existing facets.
     * * This protects against PolyfaceBuilder reusing facets constructed with different options settings.
     */
    purgeFacets() {
        this._facets = undefined;
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