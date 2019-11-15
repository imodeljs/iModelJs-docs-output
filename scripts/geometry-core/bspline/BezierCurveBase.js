"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Bspline */
// import { Point2d } from "../Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty no-console*/
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const StrokeOptions_1 = require("../curve/StrokeOptions");
const Bezier1dNd_1 = require("./Bezier1dNd");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
const Geometry_1 = require("../Geometry");
const Angle_1 = require("../geometry3d/Angle");
/**
 * Base class for CurvePrimitive (necessarily 3D) with _polygon.
 * * This has a Bezier1dNd polygon as a member, and implements dimension-independent methods
 * * This exists to support
 *    * BezierCurve3d -- 3 coordinates x,y,z per block in the Bezier1dNd poles
 *    * BezierCurve3dH -- 4 coordinates x,y,z,w per block in the Bezier1dNd poles
 * * The implementations of "pure 3d" queries is based on calling `getPolePoint3d`.
 * * This has the subtle failure difference that `getPolePoint3d` call with a valid index on on a 3d curve always succeeds, but on 3dH curve fails when weight is zero.
 * @public
 */
class BezierCurveBase extends CurvePrimitive_1.CurvePrimitive {
    constructor(blockSize, data) {
        super();
        /** String name for schema properties */
        this.curvePrimitiveType = "bezierCurve";
        this._polygon = new Bezier1dNd_1.Bezier1dNd(blockSize, data);
        this._workPoint0 = Point3dVector3d_1.Point3d.create();
        this._workPoint1 = Point3dVector3d_1.Point3d.create();
        this._workData0 = new Float64Array(blockSize);
        this._workData1 = new Float64Array(blockSize);
    }
    /** reverse the poles in place */
    reverseInPlace() { this._polygon.reverseInPlace(); }
    /** saturate the pole in place, using knot intervals from `spanIndex` of the `knotVector` */
    saturateInPlace(knotVector, spanIndex) {
        const boolStat = this._polygon.saturateInPlace(knotVector, spanIndex);
        if (boolStat) {
            this.setInterval(knotVector.spanFractionToFraction(spanIndex, 0.0), knotVector.spanFractionToFraction(spanIndex, 1.0));
        }
        return boolStat;
    }
    /** (property accessor) Return the polynomial degree (one less than order) */
    get degree() {
        return this._polygon.order - 1;
    }
    /** (property accessor) Return the polynomial order */
    get order() { return this._polygon.order; }
    /** (property accessor) Return the number of poles (aka control points) */
    get numPoles() { return this._polygon.order; }
    /** Set mapping to parent curve (e.g. if this bezier is a span extracted from a bspline, this is the knot interval of the span) */
    setInterval(a, b) { this._polygon.setInterval(a, b); }
    /** map `fraction` from this Bezier curves inherent 0..1 range to the (a,b) range of parent
     * * ( The parent range should have been previously defined with `setInterval`)
     */
    fractionToParentFraction(fraction) { return this._polygon.fractionToParentFraction(fraction); }
    /** append stroke points to a linestring, based on `strokeCount` and `fractionToPoint` from derived class*/
    emitStrokes(dest, options) {
        const numPerSpan = this.computeStrokeCountForOptions(options);
        const fractionStep = 1.0 / numPerSpan;
        for (let i = 0; i <= numPerSpan; i++) {
            const fraction = i * fractionStep;
            this.fractionToPoint(fraction, this._workPoint0);
            dest.appendStrokePoint(this._workPoint0);
        }
    }
    /** announce intervals with stroke counts */
    emitStrokableParts(handler, _options) {
        const numPerSpan = this.computeStrokeCountForOptions(_options);
        handler.announceIntervalForUniformStepStrokes(this, numPerSpan, 0.0, 1.0);
    }
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPolesAsJsonArray() { return this._polygon.unpackToJsonArrays(); }
    /** return true if all poles are on a plane. */
    isInPlane(plane) {
        let point = this._workPoint0;
        for (let i = 0;; i++) {
            point = this.getPolePoint3d(i, point);
            if (!point)
                return true;
            if (!plane.isPointInPlane(point))
                break; // which gets to return false, which is otherwise unreachable . . .
        }
        return false;
    }
    /** Return the length of the control polygon. */
    polygonLength() {
        if (!this.getPolePoint3d(0, this._workPoint0))
            return 0.0;
        let i = 0;
        let sum = 0.0;
        while (this.getPolePoint3d(++i, this._workPoint1)) {
            sum += this._workPoint0.distance(this._workPoint1);
            this._workPoint0.setFrom(this._workPoint1);
        }
        return sum;
    }
    /** Return the start point.  (first control point) */
    startPoint() {
        const result = this.getPolePoint3d(0); // ASSUME non-trivial pole set -- if null comes back, it bubbles out
        return result;
    }
    /** Return the end point.  (last control point) */
    endPoint() {
        const result = this.getPolePoint3d(this.order - 1); // ASSUME non-trivial pole set
        return result;
    }
    /** Return the control polygon length as a quick length estimate. */
    quickLength() { return this.polygonLength(); }
    /**
     * set up the _workBezier members with specific order.
     * * Try to reuse existing members if their sizes match.
     * * Ignore members corresponding to args that are 0 or negative.
     * @param primaryBezierOrder order of expected bezier
     * @param orderA length of _workCoffsA (simple array)
     * @param orderB length of _workCoffsB (simple array)
     */
    allocateAndZeroBezierWorkData(primaryBezierOrder, orderA, orderB) {
        if (primaryBezierOrder > 0) {
            if (this._workBezier !== undefined && this._workBezier.order === primaryBezierOrder) {
                this._workBezier.zero();
            }
            else
                this._workBezier = new BezierPolynomials_1.UnivariateBezier(primaryBezierOrder);
        }
        if (orderA > 0) {
            if (this._workCoffsA !== undefined && this._workCoffsA.length === orderA)
                this._workCoffsA.fill(0);
            else
                this._workCoffsA = new Float64Array(orderA);
        }
        if (orderB > 0) {
            if (this._workCoffsB !== undefined && this._workCoffsB.length === orderB)
                this._workCoffsB.fill(0);
            else
                this._workCoffsB = new Float64Array(orderB);
        }
    }
    /**
     * Assess length and turn to determine a stroke count.
     * * this method is used by both BSplineCurve3d and BSplineCurve3dH.
     * * points are accessed via getPolePoint3d.
     *   * Hence a zero-weight pole will be a problem
     * @param options stroke options structure.
     */
    computeStrokeCountForOptions(options) {
        this.getPolePoint3d(0, this._workPoint0);
        this.getPolePoint3d(1, this._workPoint1);
        let numStrokes = 1;
        if (this._workPoint0 && this._workPoint1) {
            let dx0 = this._workPoint1.x - this._workPoint0.x;
            let dy0 = this._workPoint1.y - this._workPoint0.y;
            let dz0 = this._workPoint1.z - this._workPoint0.z;
            let dx1, dy1, dz1; // first differences of leading edge
            let sumRadians = 0.0;
            let thisLength = Geometry_1.Geometry.hypotenuseXYZ(dx0, dy0, dz0);
            this._workPoint1.setFromPoint3d(this._workPoint0);
            let sumLength = thisLength;
            let maxLength = thisLength;
            let maxRadians = 0.0;
            let thisRadians;
            for (let i = 2; this.getPolePoint3d(i, this._workPoint1); i++) {
                dx1 = this._workPoint1.x - this._workPoint0.x;
                dy1 = this._workPoint1.y - this._workPoint0.y;
                dz1 = this._workPoint1.z - this._workPoint0.z;
                thisRadians = Angle_1.Angle.radiansBetweenVectorsXYZ(dx0, dy0, dz0, dx1, dy1, dz1);
                sumRadians += thisRadians;
                maxRadians = Geometry_1.Geometry.maxAbsXY(thisRadians, maxRadians);
                thisLength = Geometry_1.Geometry.hypotenuseXYZ(dx1, dy1, dz1);
                sumLength += thisLength;
                maxLength = Geometry_1.Geometry.maxXY(maxLength, thisLength);
                dx0 = dx1;
                dy0 = dy1;
                dz0 = dz1;
                this._workPoint0.setFrom(this._workPoint1);
            }
            const length1 = maxLength * this.degree; // This may be larger than sumLength
            const length2 = Math.sqrt(length1 * sumLength); // This is in between
            let radians1 = maxRadians * (this.degree - 1); // As if worst case keeps happening.
            if (this.degree < 3)
                radians1 *= 3; // so quadratics aren't under-stroked
            const radians2 = Math.sqrt(radians1 * sumRadians);
            numStrokes = StrokeOptions_1.StrokeOptions.applyAngleTol(options, StrokeOptions_1.StrokeOptions.applyMaxEdgeLength(options, this.degree, length2), radians2, 0.1);
            if (options) {
                numStrokes = options.applyChordTolToLengthAndRadians(numStrokes, sumLength, radians1);
            }
        }
        return numStrokes;
    }
}
exports.BezierCurveBase = BezierCurveBase;
//# sourceMappingURL=BezierCurveBase.js.map