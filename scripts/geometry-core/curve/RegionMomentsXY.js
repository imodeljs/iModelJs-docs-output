"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
// import { Geometry, Angle, AngleSweep } from "../Geometry";
const MomentData_1 = require("../geometry4d/MomentData");
const GeometryHandler_1 = require("../geometry3d/GeometryHandler");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Angle_1 = require("../geometry3d/Angle");
const LineString3d_1 = require("./LineString3d");
const Loop_1 = require("./Loop");
const StrokeOptions_1 = require("./StrokeOptions");
/**
 * Implementation class for computing XY area moments.
 * @internal
 */
class RegionMomentsXY extends GeometryHandler_1.NullGeometryHandler {
    constructor() {
        super(...arguments);
        this._point0 = Point3dVector3d_1.Point3d.create();
        this._point1 = Point3dVector3d_1.Point3d.create();
    }
    /** Accumulate (independent) integrations over
     * * origin to chord of the arc.
     * * origin to the "cap" between the chord and arc.
     */
    handleArc3d(arc) {
        const momentData = this._activeMomentData;
        const sweepRadians = arc.sweep.sweepRadians;
        const alphaRadians = sweepRadians * 0.5;
        // from https://apps.dtic.mil/dtic/tr/fulltext/u2/274936.pdf page 71  for radius = 1
        let s = Math.sin(alphaRadians);
        let c = Math.cos(alphaRadians);
        let s1 = Math.sin(sweepRadians);
        if (Angle_1.Angle.isFullCircleRadians(sweepRadians)) {
            s = 0.0;
            c = -1.0;
            s1 = 0.0;
        }
        const q = 2 * s * s * s * c / (alphaRadians - s * c);
        const s3 = s * s * s;
        const s6 = s3 * s3;
        const area = 0.5 * (sweepRadians - s1);
        const inertiaXX = 0.25 * area * (1.0 - q / 3.0);
        const inertiaYY1 = 0.25 * area * (1.0 + q);
        const inertiaYY = inertiaYY1 - 4.0 * s6 / (9.0 * area);
        const productXX = inertiaYY;
        const productYY = inertiaXX;
        const centerToCentroid = 4.0 * s * s * s / (3.0 * (sweepRadians - s1));
        const midRadians = arc.sweep.fractionToRadians(0.5);
        const centralPlane = arc.radiansToRotatedBasis(midRadians);
        const centroid = centralPlane.origin.plusScaled(centralPlane.vectorU, centerToCentroid);
        momentData.accumulateXYProductsInCentroidalFrame(productXX, 0.0, productYY, area, centroid, centralPlane.vectorU, centralPlane.vectorV);
        const pointB = arc.fractionToPoint(0.0);
        const pointC = arc.fractionToPoint(1.0);
        momentData.accumulateTriangleMomentsXY(undefined, pointB, pointC);
    }
    /** Accumulate integrals over the (triangular) areas from the origin to each line segment */
    handleLineString3d(ls) {
        const momentData = this._activeMomentData;
        momentData.accumulateTriangleToLineStringMomentsXY(undefined, ls.packedPoints);
    }
    /** Accumulate integrals over the (triangular) area from the origin to this line segment */
    handleLineSegment3d(segment) {
        const momentData = this._activeMomentData;
        segment.startPoint(this._point0);
        segment.endPoint(this._point1);
        momentData.accumulateTriangleMomentsXY(undefined, this._point0, this._point1);
    }
    /** Accumulate integrals from origin to all primitives in the chain. */
    handleLoop(loop) {
        const momentData = this._activeMomentData = MomentData_1.MomentData.create();
        momentData.needOrigin = false;
        for (const child of loop.children)
            child.dispatchToGeometryHandler(this);
        this._activeMomentData = undefined;
        return momentData;
    }
    /**
     * ASSUMPTIONS FOR ORIENTATION AND CONTAINMENT ISSUES
     * * Largest area is outer
     * * All others are interior (and not overlapping)
     * Hence
     * * Outer area sign must be positive -- negate all integrations as needed
     * * Outer area signs must be positive -- negate all integrations as needed
     * @param region
     */
    handleParityRegion(region) {
        const allChildMoments = [];
        let maxAbsArea = 0.0;
        let largestChildMoments;
        for (const child of region.children) {
            if (child instanceof Loop_1.Loop) {
                const childMoments = this.handleLoop(child);
                if (childMoments) {
                    allChildMoments.push(childMoments);
                    const q = Math.abs(childMoments.quantitySum);
                    if (q > maxAbsArea) {
                        maxAbsArea = q;
                        largestChildMoments = childMoments;
                    }
                }
            }
        }
        if (largestChildMoments) {
            const summedMoments = MomentData_1.MomentData.create();
            const sign0 = largestChildMoments.signFactor(1.0);
            summedMoments.accumulateProducts(largestChildMoments, sign0);
            for (const childMoments of allChildMoments) {
                if (childMoments !== largestChildMoments) {
                    const sign1 = childMoments.signFactor(-1.0);
                    summedMoments.accumulateProducts(childMoments, sign1);
                }
            }
            return summedMoments;
        }
        return undefined;
    }
    /** Accumulate (as simple addition) products over each component of the union region. */
    handleUnionRegion(region) {
        const summedMoments = MomentData_1.MomentData.create();
        for (const child of region.children) {
            const childMoments = child.dispatchToGeometryHandler(this);
            if (childMoments) {
                const sign0 = childMoments.signFactor(1.0);
                summedMoments.accumulateProducts(childMoments, sign0);
            }
        }
        return summedMoments;
    }
    getStrokeOptions() {
        if (this._strokeOptions)
            return this._strokeOptions;
        const options = StrokeOptions_1.StrokeOptions.createForCurves();
        // this is unusually fine for stroking, but appropriate for sum.
        options.angleTol = Angle_1.Angle.createDegrees(5.0);
        this._strokeOptions = options;
        return options;
    }
    /** Single curve primitive (not loop . . .).
     * * stroke the curve
     * * accumulate stroke array.
     */
    handleCurvePrimitive(cp) {
        const strokes = LineString3d_1.LineString3d.create();
        const options = this.getStrokeOptions();
        cp.emitStrokes(strokes, options);
        this.handleLineString3d(strokes);
    }
    /** handle strongly typed  BSplineCurve3d  as generic curve primitive */
    handleBSplineCurve3d(g) { return this.handleCurvePrimitive(g); }
    /** handle strongly typed  BSplineCurve3dH  as generic curve primitive */
    handleBSplineCurve3dH(g) { return this.handleCurvePrimitive(g); }
    /** handle strongly typed  TransitionSpiral as generic curve primitive  */
    handleTransitionSpiral(g) { return this.handleCurvePrimitive(g); }
}
exports.RegionMomentsXY = RegionMomentsXY;
//# sourceMappingURL=RegionMomentsXY.js.map