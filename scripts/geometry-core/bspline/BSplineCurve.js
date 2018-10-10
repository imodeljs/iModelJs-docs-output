"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Bspline */
// import { Point2d } from "../Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty no-console*/
const PointVector_1 = require("../PointVector");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const Geometry_1 = require("../Geometry");
const KnotVector_1 = require("./KnotVector");
const PointHelpers_1 = require("../PointHelpers");
const BezierCurve_1 = require("./BezierCurve");
const BSpline1dNd_1 = require("./BSpline1dNd");
/**
 * Base class for BSplineCurve3d and BSplineCurve3dH.
 * * The weighted variant has the problem that CurvePrimitive 3d typing does not allow undefined result where Point4d has zero weight.
 * * The convention for these is to return 000 in such places.
 */
class BSplineCurve3dBase extends CurvePrimitive_1.CurvePrimitive {
    constructor(poleDimension, numPoles, order, knots) {
        super();
        this._bcurve = BSpline1dNd_1.BSpline1dNd.create(numPoles, poleDimension, order, knots);
    }
    get degree() { return this._bcurve.degree; }
    get order() { return this._bcurve.order; }
    get numSpan() { return this._bcurve.numSpan; }
    get numPoles() { return this._bcurve.numPoles; }
    /**
   * return a simple array form of the knots.  optionally replicate the first and last
   * in classic over-clamped manner
   */
    copyKnots(includeExtraEndKnot) { return this._bcurve.knots.copyKnots(includeExtraEndKnot); }
    /**
   * Set the flag indicating the bspline might be suitable for having wrapped "closed" interpretation.
   */
    setWrappable(value) {
        this._bcurve.knots.wrappable = value;
    }
    fractionToPoint(fraction, result) {
        return this.knotToPoint(this._bcurve.knots.fractionToKnot(fraction), result);
    }
    /** Construct a ray with
     * * origin at the fractional position along the arc
     * * direction is the first derivative, i.e. tangent along the curve
     */
    fractionToPointAndDerivative(fraction, result) {
        const knot = this._bcurve.knots.fractionToKnot(fraction);
        result = this.knotToPointAndDerivative(knot, result);
        result.direction.scaleInPlace(this._bcurve.knots.knotLength01);
        return result;
    }
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the curve
     * * y axis is the second derivative
     */
    fractionToPointAnd2Derivatives(fraction, result) {
        const knot = this._bcurve.knots.fractionToKnot(fraction);
        result = this.knotToPointAnd2Derivatives(knot, result);
        const a = this._bcurve.knots.knotLength01;
        result.vectorU.scaleInPlace(a);
        result.vectorV.scaleInPlace(a * a);
        return result;
    }
    startPoint() { return this.evaluatePointInSpan(0, 0.0); }
    endPoint() { return this.evaluatePointInSpan(this.numSpan - 1, 1.0); }
    reverseInPlace() { this._bcurve.reverseInPlace(); }
    /**
     * Return an array with this curve's bezier fragments.
     */
    collectBezierSpans(prefer3dH) {
        const result = [];
        const numSpans = this.numSpan;
        for (let i = 0; i < numSpans; i++) {
            const span = this.getSaturatedBezierSpan3dOr3dH(i, prefer3dH);
            if (span)
                result.push(span);
        }
        return result;
    }
    /** Search for the curve point that is closest to the spacePoint.
     *
     * * If the space point is exactly on the curve, this is the reverse of fractionToPoint.
     * * Since CurvePrimitive should always have start and end available as candidate points, this method should always succeed
     * @param spacePoint point in space
     * @param extend true to extend the curve (if possible)
     * @returns Returns a CurveLocationDetail structure that holds the details of the close point.
     */
    closestPoint(spacePoint, _extend) {
        const point = this.fractionToPoint(0);
        const result = CurvePrimitive_1.CurveLocationDetail.createCurveFractionPointDistance(this, 0.0, point, point.distance(spacePoint));
        this.fractionToPoint(1.0, point);
        result.updateIfCloserCurveFractionPointDistance(this, 1.0, spacePoint, spacePoint.distance(point));
        let span;
        const numSpans = this.numSpan;
        for (let i = 0; i < numSpans; i++) {
            span = this.getSaturatedBezierSpan3dOr3dH(i, true, span);
            if (span) {
                if (span.updateClosestPointByTruePerpendicular(spacePoint, result)) {
                    // the detail records the span bezier -- promote it to the parent curve . ..
                    result.curve = this;
                    result.fraction = span.fractionToParentFraction(result.fraction);
                }
            }
        }
        return result;
    }
}
exports.BSplineCurve3dBase = BSplineCurve3dBase;
class BSplineCurve3d extends BSplineCurve3dBase {
    isSameGeometryClass(other) { return other instanceof BSplineCurve3d; }
    tryTransformInPlace(transform) { PointHelpers_1.Point3dArray.multiplyInPlace(transform, this._bcurve.packedData); return true; }
    getPole(i, result) { return this._bcurve.getPoint3dPole(i, result); }
    spanFractionToKnot(span, localFraction) {
        return this._bcurve.spanFractionToKnot(span, localFraction);
    }
    constructor(numPoles, order, knots) {
        super(3, numPoles, order, knots);
    }
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPoints() { return PointHelpers_1.Point3dArray.unpackNumbersToNestedArrays(this._bcurve.packedData, 3); }
    /** Return a simple array of the control points coordinates */
    copyPointsFloat64Array() { return this._bcurve.packedData.slice(); }
    /**
     * return a simple array form of the knots.  optionally replicate the first and last
     * in classic over-clamped manner
     */
    copyKnots(includeExtraEndKnot) { return this._bcurve.knots.copyKnots(includeExtraEndKnot); }
    /** Create a bspline with uniform knots. */
    static createUniformKnots(poles, order) {
        const numPoles = poles.length;
        if (order < 1 || numPoles < order)
            return undefined;
        const knots = KnotVector_1.KnotVector.createUniformClamped(poles.length, order - 1, 0.0, 1.0);
        const curve = new BSplineCurve3d(poles.length, order, knots);
        let i = 0;
        for (const p of poles) {
            curve._bcurve.packedData[i++] = p.x;
            curve._bcurve.packedData[i++] = p.y;
            curve._bcurve.packedData[i++] = p.z;
        }
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
            numPoles /= 3; // blocked as xyz
        }
        const numKnots = knotArray.length;
        // shift knots-of-interest limits for overclampled case ...
        const skipFirstAndLast = (numPoles + order === numKnots);
        if (order < 1 || numPoles < order)
            return undefined;
        const knots = KnotVector_1.KnotVector.create(knotArray, order - 1, skipFirstAndLast);
        const curve = new BSplineCurve3d(numPoles, order, knots);
        if (poleArray instanceof Float64Array) {
            let i = 0;
            for (const coordinate of poleArray) {
                curve._bcurve.packedData[i++] = coordinate;
            }
        }
        else {
            let i = 0;
            for (const p of poleArray) {
                curve._bcurve.packedData[i++] = p.x;
                curve._bcurve.packedData[i++] = p.y;
                curve._bcurve.packedData[i++] = p.z;
            }
        }
        return curve;
    }
    clone() {
        const knotVector1 = this._bcurve.knots.clone();
        const curve1 = new BSplineCurve3d(this.numPoles, this.order, knotVector1);
        curve1._bcurve.packedData = this._bcurve.packedData.slice();
        return curve1;
    }
    cloneTransformed(transform) {
        const curve1 = this.clone();
        curve1.tryTransformInPlace(transform);
        return curve1;
    }
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointInSpan(spanIndex, spanFraction) {
        this._bcurve.evaluateBuffersInSpan(spanIndex, spanFraction);
        return PointVector_1.Point3d.createFrom(this._bcurve.poleBuffer);
    }
    evaluatePointAndTangentInSpan(spanIndex, spanFraction) {
        this._bcurve.evaluateBuffersInSpan1(spanIndex, spanFraction);
        return AnalyticGeometry_1.Ray3d.createCapture(PointVector_1.Point3d.createFrom(this._bcurve.poleBuffer), PointVector_1.Vector3d.createFrom(this._bcurve.poleBuffer1));
    }
    /** Evaluate at a positioni given by a knot value.  */
    knotToPoint(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u);
        return PointVector_1.Point3d.createFrom(this._bcurve.poleBuffer, result);
    }
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivative(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u, 1);
        if (!result)
            return AnalyticGeometry_1.Ray3d.createCapture(PointVector_1.Point3d.createFrom(this._bcurve.poleBuffer), PointVector_1.Vector3d.createFrom(this._bcurve.poleBuffer1));
        result.origin.setFrom(this._bcurve.poleBuffer);
        result.direction.setFrom(this._bcurve.poleBuffer1);
        return result;
    }
    /** Evaluate at a position given by a knot value.  Return point with 2 derivatives. */
    knotToPointAnd2Derivatives(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u, 2);
        return AnalyticGeometry_1.Plane3dByOriginAndVectors.createOriginAndVectorsXYZ(this._bcurve.poleBuffer[0], this._bcurve.poleBuffer[1], this._bcurve.poleBuffer[2], this._bcurve.poleBuffer1[0], this._bcurve.poleBuffer1[1], this._bcurve.poleBuffer1[2], this._bcurve.poleBuffer2[0], this._bcurve.poleBuffer2[1], this._bcurve.poleBuffer2[2], result);
    }
    fractionToPoint(fraction, result) {
        return this.knotToPoint(this._bcurve.knots.fractionToKnot(fraction), result);
    }
    fractionToPointAndDerivative(fraction, result) {
        const knot = this._bcurve.knots.fractionToKnot(fraction);
        result = this.knotToPointAndDerivative(knot, result);
        result.direction.scaleInPlace(this._bcurve.knots.knotLength01);
        return result;
    }
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction, result) {
        const knot = this._bcurve.knots.fractionToKnot(fraction);
        result = this.knotToPointAnd2Derivatives(knot, result);
        const a = this._bcurve.knots.knotLength01;
        result.vectorU.scaleInPlace(a);
        result.vectorV.scaleInPlace(a * a);
        return result;
    }
    isAlmostEqual(other) {
        if (other instanceof BSplineCurve3d) {
            return this._bcurve.knots.isAlmostEqual(other._bcurve.knots)
                && PointHelpers_1.Point3dArray.isAlmostEqual(this._bcurve.packedData, other._bcurve.packedData);
        }
        return false;
    }
    isInPlane(plane) {
        return PointHelpers_1.Point3dArray.isCloseToPlane(this._bcurve.packedData, plane);
    }
    quickLength() { return PointHelpers_1.Point3dArray.sumLengths(this._bcurve.packedData); }
    emitStrokableParts(handler, _options) {
        const numSpan = this.numSpan;
        const numPerSpan = 5; // NEEDS WORK -- apply stroke options to get better count !!!
        for (let spanIndex = 0; spanIndex < numSpan; spanIndex++) {
            handler.announceIntervalForUniformStepStrokes(this, numPerSpan, this._bcurve.knots.spanFractionToFraction(spanIndex, 0.0), this._bcurve.knots.spanFractionToFraction(spanIndex, 1.0));
        }
    }
    emitStrokes(dest, _options) {
        const numSpan = this.numSpan;
        const numPerSpan = 5; // NEEDS WORK -- apply stroke options to get better count !!!
        const fractionStep = 1.0 / numPerSpan;
        for (let spanIndex = 0; spanIndex < numSpan; spanIndex++) {
            for (let i = 0; i <= numPerSpan; i++) {
                const spanFraction = i * fractionStep;
                const point = this.evaluatePointInSpan(spanIndex, spanFraction);
                dest.appendStrokePoint(point);
            }
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
            if (!Geometry_1.Geometry.isSamePoint3d(this.getPole(p0), this.getPole(p1)))
                return false;
        }
        return true;
    }
    /**
     * Return a BezierCurveBase for this curve.  The concrete return type may be BezierCuve3d or BezierCurve3dH according to this type.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3dOr3dH(spanIndex, prefer3dH, result) {
        if (prefer3dH)
            return this.getSaturatedBezierSpan3dH(spanIndex, result);
        return this.getSaturatedBezierSpan3d(spanIndex, result);
    }
    /**
     * Return a CurvePrimitive (which is a BezierCurve3d) for a specified span of this curve.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3d(spanIndex, result) {
        if (spanIndex < 0 || spanIndex >= this.numSpan)
            return undefined;
        const order = this.order;
        if (result === undefined || !(result instanceof BezierCurve_1.BezierCurve3d) || result.order !== order)
            result = BezierCurve_1.BezierCurve3d.createOrder(order);
        const bezier = result;
        bezier.loadSpanPoles(this._bcurve.packedData, spanIndex);
        bezier.saturateInPlace(this._bcurve.knots, spanIndex);
        return result;
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
        if (result === undefined || !(result instanceof BezierCurve_1.BezierCurve3dH) || result.order !== order)
            result = BezierCurve_1.BezierCurve3dH.createOrder(order);
        const bezier = result;
        bezier.loadSpan3dPolesWithWeight(this._bcurve.packedData, spanIndex, 1.0);
        bezier.saturateInPlace(this._bcurve.knots, spanIndex);
        return bezier;
    }
    /**
     * Set the flag indicating the bspline might be suitable for having wrapped "closed" interpretation.
     */
    setWrappable(value) {
        this._bcurve.knots.wrappable = value;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleBSplineCurve3d(this);
    }
    extendRange(rangeToExtend, transform) {
        const buffer = this._bcurve.packedData;
        const n = buffer.length - 2;
        if (transform) {
            for (let i0 = 0; i0 < n; i0 += 3)
                rangeToExtend.extendTransformedXYZ(transform, buffer[i0], buffer[i0 + 1], buffer[i0 + 2]);
        }
        else {
            for (let i0 = 0; i0 < n; i0 += 3)
                rangeToExtend.extendXYZ(buffer[i0], buffer[i0 + 1], buffer[i0 + 2]);
        }
    }
}
exports.BSplineCurve3d = BSplineCurve3d;
//# sourceMappingURL=BSplineCurve.js.map