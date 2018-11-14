"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Bspline */
// import { Point2d } from "../Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty no-console*/
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Point4d_1 = require("../geometry4d/Point4d");
const Geometry_1 = require("../Geometry");
const KnotVector_1 = require("./KnotVector");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
const BezierCurve3dH_1 = require("./BezierCurve3dH");
const BSplineCurve_1 = require("./BSplineCurve");
/**
 * Weighted (Homogeneous) BSplineCurve in 3d
 */
class BSplineCurve3dH extends BSplineCurve_1.BSplineCurve3dBase {
    initializeWorkBezier() {
        if (this._workBezier === undefined)
            this._workBezier = BezierCurve3dH_1.BezierCurve3dH.createOrder(this.order);
        return this._workBezier;
    }
    isSameGeometryClass(other) { return other instanceof BSplineCurve3dH; }
    tryTransformInPlace(transform) { PointHelpers_1.Point4dArray.multiplyInPlace(transform, this._bcurve.packedData); return true; }
    getPolePoint3d(poleIndex, result) {
        const k = this.poleIndexToDataIndex(poleIndex);
        if (k !== undefined) {
            const data = this._bcurve.packedData;
            const divw = Geometry_1.Geometry.conditionalDivideFraction(1.0, data[k + 3]);
            if (divw !== undefined)
                return Point3dVector3d_1.Point3d.create(data[k] * divw, data[k + 1] * divw, data[k + 2] * divw, result);
        }
        return undefined;
    }
    getPolePoint4d(poleIndex, result) {
        const k = this.poleIndexToDataIndex(poleIndex);
        if (k !== undefined) {
            const data = this._bcurve.packedData;
            return Point4d_1.Point4d.create(data[k], data[k + 1], data[k + 2], data[k + 3], result);
        }
        return undefined;
    }
    spanFractionToKnot(span, localFraction) {
        return this._bcurve.spanFractionToKnot(span, localFraction);
    }
    constructor(numPoles, order, knots) {
        super(4, numPoles, order, knots);
    }
    /** Return a simple array of arrays with the control points as `[[x,y,z,w],[x,y,z,w],..]` */
    copyPoints() { return PointHelpers_1.Point3dArray.unpackNumbersToNestedArrays(this._bcurve.packedData, 4); }
    /** Return a simple array of the control points coordinates */
    copyPointsFloat64Array() { return this._bcurve.packedData.slice(); }
    /** Create a bspline with uniform knots. */
    static createUniformKnots(poles, order) {
        const numPoles = poles.length;
        if (order < 1 || numPoles < order)
            return undefined;
        const knots = KnotVector_1.KnotVector.createUniformClamped(poles.length, order - 1, 0.0, 1.0);
        const curve = new BSplineCurve3dH(poles.length, order, knots);
        let i = 0;
        if (poles[0] instanceof Point3dVector3d_1.Point3d)
            for (const p of poles) {
                curve._bcurve.packedData[i++] = p.x;
                curve._bcurve.packedData[i++] = p.y;
                curve._bcurve.packedData[i++] = p.z;
                curve._bcurve.packedData[i++] = 1.0;
            }
        else if (poles[0] instanceof Point4d_1.Point4d)
            for (const p of poles) {
                curve._bcurve.packedData[i++] = p.x;
                curve._bcurve.packedData[i++] = p.y;
                curve._bcurve.packedData[i++] = p.z;
                curve._bcurve.packedData[i++] = p.w;
            }
        else
            return undefined;
        return curve;
    }
    /** Create a bspline with given knots.
     *
     * *  Two count conditions are recognized:
     *
     * ** If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * ** If poleArray.length + order == knotArray.length + 2, the knots are in modern form.
     *
     */
    static create(poleArray, knotArray, order) {
        let numPoles = poleArray.length;
        if (poleArray instanceof Float64Array) {
            numPoles /= 4; // blocked as xyz
        }
        const numKnots = knotArray.length;
        // shift knots-of-interest limits for overclampled case ...
        const skipFirstAndLast = (numPoles + order === numKnots);
        if (order < 1 || numPoles < order)
            return undefined;
        const knots = KnotVector_1.KnotVector.create(knotArray, order - 1, skipFirstAndLast);
        const curve = new BSplineCurve3dH(numPoles, order, knots);
        if (poleArray instanceof Float64Array) {
            let i = 0;
            for (const coordinate of poleArray) {
                curve._bcurve.packedData[i++] = coordinate;
            }
        }
        else if (poleArray[0] instanceof Point4d_1.Point4d) {
            let i = 0;
            for (const p of poleArray) {
                curve._bcurve.packedData[i++] = p.x;
                curve._bcurve.packedData[i++] = p.y;
                curve._bcurve.packedData[i++] = p.z;
                curve._bcurve.packedData[i++] = p.w;
            }
        }
        else if (poleArray[0] instanceof Point3dVector3d_1.Point3d) {
            let i = 0;
            for (const p of poleArray) {
                curve._bcurve.packedData[i++] = p.x;
                curve._bcurve.packedData[i++] = p.y;
                curve._bcurve.packedData[i++] = p.z;
                curve._bcurve.packedData[i++] = 1.0;
            }
        }
        return curve;
    }
    clone() {
        const knotVector1 = this._bcurve.knots.clone();
        const curve1 = new BSplineCurve3dH(this.numPoles, this.order, knotVector1);
        curve1._bcurve.packedData = this._bcurve.packedData.slice();
        return curve1;
    }
    cloneTransformed(transform) {
        const curve1 = this.clone();
        curve1.tryTransformInPlace(transform);
        return curve1;
    }
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointInSpan(spanIndex, spanFraction, result) {
        this._bcurve.evaluateBuffersInSpan(spanIndex, spanFraction);
        const xyzw = this._bcurve.poleBuffer;
        return Point4d_1.Point4d.createRealPoint3dDefault000(xyzw[0], xyzw[1], xyzw[2], xyzw[3], result);
    }
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointAndTangentInSpan(spanIndex, spanFraction, result) {
        this._bcurve.evaluateBuffersInSpan1(spanIndex, spanFraction);
        const xyzw = this._bcurve.poleBuffer;
        const dxyzw = this._bcurve.poleBuffer1;
        return Point4d_1.Point4d.createRealDerivativeRay3dDefault000(xyzw[0], xyzw[1], xyzw[2], xyzw[3], dxyzw[0], dxyzw[1], dxyzw[2], dxyzw[3], result);
    }
    /** Evaluate at a positioni given by a knot value. */
    knotToPoint(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u);
        const xyzw = this._bcurve.poleBuffer;
        return Point4d_1.Point4d.createRealPoint3dDefault000(xyzw[0], xyzw[1], xyzw[2], xyzw[3], result);
    }
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivative(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u, 1);
        const xyzw = this._bcurve.poleBuffer;
        const dxyzw = this._bcurve.poleBuffer1;
        return Point4d_1.Point4d.createRealDerivativeRay3dDefault000(xyzw[0], xyzw[1], xyzw[2], xyzw[3], dxyzw[0], dxyzw[1], dxyzw[2], dxyzw[3], result);
    }
    /** Evaluate at a position given by a knot value.  Return point with 2 derivatives. */
    knotToPointAnd2Derivatives(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u, 2);
        const xyzw = this._bcurve.poleBuffer;
        const dxyzw = this._bcurve.poleBuffer1;
        const ddxyzw = this._bcurve.poleBuffer2;
        return Point4d_1.Point4d.createRealDerivativePlane3dByOriginAndVectorsDefault000(xyzw[0], xyzw[1], xyzw[2], xyzw[3], dxyzw[0], dxyzw[1], dxyzw[2], dxyzw[3], ddxyzw[0], ddxyzw[1], ddxyzw[2], ddxyzw[3], result);
    }
    isAlmostEqual(other) {
        if (other instanceof BSplineCurve3dH) {
            return this._bcurve.knots.isAlmostEqual(other._bcurve.knots)
                && PointHelpers_1.Point4dArray.isAlmostEqual(this._bcurve.packedData, other._bcurve.packedData);
        }
        return false;
    }
    isInPlane(plane) {
        return PointHelpers_1.Point4dArray.isCloseToPlane(this._bcurve.packedData, plane);
    }
    quickLength() { return PointHelpers_1.Point3dArray.sumLengths(this._bcurve.packedData); }
    emitStrokableParts(handler, options) {
        const needBeziers = handler.announceBezierCurve;
        const workBezier = this.initializeWorkBezier();
        const numSpan = this.numSpan;
        let numStrokes;
        for (let spanIndex = 0; spanIndex < numSpan; spanIndex++) {
            const bezier = this.getSaturatedBezierSpan3dOr3dH(spanIndex, false, workBezier);
            if (bezier) {
                numStrokes = bezier.strokeCount(options);
                if (needBeziers) {
                    handler.announceBezierCurve(bezier, numStrokes, this, spanIndex, this._bcurve.knots.spanFractionToFraction(spanIndex, 0.0), this._bcurve.knots.spanFractionToFraction(spanIndex, 1.0));
                }
                else {
                    handler.announceIntervalForUniformStepStrokes(this, numStrokes, this._bcurve.knots.spanFractionToFraction(spanIndex, 0.0), this._bcurve.knots.spanFractionToFraction(spanIndex, 1.0));
                }
            }
        }
    }
    emitStrokes(dest, options) {
        const workBezier = this.initializeWorkBezier();
        const numSpan = this.numSpan;
        for (let spanIndex = 0; spanIndex < numSpan; spanIndex++) {
            const bezier = this.getSaturatedBezierSpan3dH(spanIndex, workBezier);
            if (bezier)
                bezier.emitStrokes(dest, options);
        }
    }
    /**
     * return true if the spline is (a) unclamped with (degree-1) matching knot intervals,
     * (b) (degree-1) wrapped points,
     * (c) marked wrappable from construction time.
     */
    get isClosable() {
        if (!this._bcurve.knots.wrappable)
            return false;
        const degree = this.degree;
        const leftKnotIndex = this._bcurve.knots.leftKnotIndex;
        const rightKnotIndex = this._bcurve.knots.rightKnotIndex;
        const period = this._bcurve.knots.rightKnot - this._bcurve.knots.leftKnot;
        const indexDelta = rightKnotIndex - leftKnotIndex;
        for (let k0 = leftKnotIndex - degree + 1; k0 < leftKnotIndex + degree - 1; k0++) {
            const k1 = k0 + indexDelta;
            if (!Geometry_1.Geometry.isSameCoordinate(this._bcurve.knots.knots[k0] + period, this._bcurve.knots.knots[k1]))
                return false;
        }
        const poleIndexDelta = this.numPoles - this.degree;
        for (let p0 = 0; p0 + 1 < degree; p0++) {
            const p1 = p0 + poleIndexDelta;
            if (!Geometry_1.Geometry.isSamePoint3d(this.getPolePoint3d(p0), this.getPolePoint3d(p1)))
                return false;
        }
        return true;
    }
    /**
     * Return a CurvePrimitive (which is a BezierCurve3dH) for a specified span of this curve.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3dH(spanIndex, result) {
        if (spanIndex < 0 || spanIndex >= this.numSpan)
            return undefined;
        const order = this.order;
        if (result === undefined || !(result instanceof BezierCurve3dH_1.BezierCurve3dH) || result.order !== order)
            result = BezierCurve3dH_1.BezierCurve3dH.createOrder(order);
        const bezier = result;
        bezier.loadSpan4dPoles(this._bcurve.packedData, spanIndex);
        bezier.saturateInPlace(this._bcurve.knots, spanIndex);
        return result;
    }
    /**
     * Return a BezierCurveBase for this curve.  Because BSplineCurve3dH is homogeneous, the returned BezierCurveBase is always homogeneous.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3dH with matching order.
     */
    getSaturatedBezierSpan3dOr3dH(spanIndex, _prefer3dH, result) {
        return this.getSaturatedBezierSpan3dH(spanIndex, result);
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleBSplineCurve3dH(this);
    }
    extendRange(rangeToExtend, transform) {
        const buffer = this._bcurve.packedData;
        const n = buffer.length - 3;
        if (transform) {
            for (let i0 = 0; i0 < n; i0 += 4)
                rangeToExtend.extendTransformedXYZW(transform, buffer[i0], buffer[i0 + 1], buffer[i0 + 2], buffer[i0 + 3]);
        }
        else {
            for (let i0 = 0; i0 < n; i0 += 4)
                rangeToExtend.extendXYZW(buffer[i0], buffer[i0 + 1], buffer[i0 + 2], buffer[i0 + 3]);
        }
    }
}
exports.BSplineCurve3dH = BSplineCurve3dH;
//# sourceMappingURL=BSplineCurve3dH.js.map