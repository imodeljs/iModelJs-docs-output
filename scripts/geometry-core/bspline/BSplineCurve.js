"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
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
/** Bspline knots and poles for 1d-to-Nd. */
class BSpline1dNd {
    get degree() { return this.knots.degree; }
    get order() { return this.knots.degree + 1; }
    get numSpan() { return this.numPoles - this.knots.degree; }
    get numPoles() { return this.packedData.length / this.poleLength; }
    getPoint3dPole(i, result) { return PointVector_1.Point3d.createFromPacked(this.packedData, i, result); }
    /**
     * initialize arrays for given spline dimensions.
     * @param numPoles number of poles
     * @param poleLength number of coordinates per pole (e.g.. 3 for 3D unweighted, 4 for 3d weighted, 2 for 2d unweighted, 3 for 2d weigthed)
     * @param order number of poles in support for a section of the bspline
     */
    constructor(numPoles, poleLength, order, knots) {
        this.knots = knots;
        this.packedData = new Float64Array(numPoles * poleLength);
        this.poleLength = poleLength;
        this.basisBuffer = new Float64Array(order);
        this.poleBuffer = new Float64Array(poleLength);
        this.basisBuffer1 = new Float64Array(order);
        this.basisBuffer2 = new Float64Array(order);
        this.poleBuffer1 = new Float64Array(poleLength);
        this.poleBuffer2 = new Float64Array(poleLength);
    }
    extendRange(rangeToExtend, transform) {
        const buffer = this.poleBuffer;
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
    static create(numPoles, poleLength, order, knots) {
        return new BSpline1dNd(numPoles, poleLength, order, knots);
    }
    spanFractionToKnot(span, localFraction) {
        return this.knots.spanFractionToKnot(span, localFraction);
    }
    // ASSUME f is sized for {order} basis funtions !!!
    evaluateBasisFunctionsInSpan(spanIndex, spanFraction, f, df, ddf) {
        if (spanIndex < 0)
            spanIndex = 0;
        if (spanIndex >= this.numSpan)
            spanIndex = this.numSpan - 1;
        const knotIndex0 = spanIndex + this.degree - 1;
        const globalKnot = this.knots.baseKnotFractionToKnot(knotIndex0, spanFraction);
        return df ?
            this.knots.evaluateBasisFunctions1(knotIndex0, globalKnot, f, df, ddf) :
            this.knots.evaluateBasisFunctions(knotIndex0, globalKnot, f);
    }
    evaluateBuffersInSpan(spanIndex, spanFraction) {
        this.evaluateBasisFunctionsInSpan(spanIndex, spanFraction, this.basisBuffer);
        this.sumPoleBufferForSpan(spanIndex);
    }
    evaluateBuffersInSpan1(spanIndex, spanFraction) {
        this.evaluateBasisFunctionsInSpan(spanIndex, spanFraction, this.basisBuffer, this.basisBuffer1);
        this.sumPoleBufferForSpan(spanIndex);
        this.sumPoleBuffer1ForSpan(spanIndex);
    }
    /** sum poles by the weights in the basisBuffer, using poles for given span */
    sumPoleBufferForSpan(spanIndex) {
        this.poleBuffer.fill(0);
        let k = spanIndex * this.poleLength;
        for (const f of this.basisBuffer) {
            for (let j = 0; j < this.poleLength; j++) {
                this.poleBuffer[j] += f * this.packedData[k++];
            }
        }
    }
    /** sum poles by the weights in the basisBuffer, using poles for given span */
    sumPoleBuffer1ForSpan(spanIndex) {
        this.poleBuffer1.fill(0);
        let k = spanIndex * this.poleLength;
        for (const f of this.basisBuffer1) {
            for (let j = 0; j < this.poleLength; j++) {
                this.poleBuffer1[j] += f * this.packedData[k++];
            }
        }
    }
    /** sum poles by the weights in the basisBuffer, using poles for given span */
    sumPoleBuffer2ForSpan(spanIndex) {
        this.poleBuffer2.fill(0);
        let k = spanIndex * this.poleLength;
        for (const f of this.basisBuffer2) {
            for (let j = 0; j < this.poleLength; j++) {
                this.poleBuffer2[j] += f * this.packedData[k++];
            }
        }
    }
    evaluateBuffersAtKnot(u, numDerivative = 0) {
        const knotIndex0 = this.knots.knotToLeftKnotIndex(u);
        if (numDerivative < 1) {
            this.knots.evaluateBasisFunctions(knotIndex0, u, this.basisBuffer);
            this.sumPoleBufferForSpan(knotIndex0 - this.degree + 1);
        }
        else if (numDerivative === 1) {
            this.knots.evaluateBasisFunctions1(knotIndex0, u, this.basisBuffer, this.basisBuffer1);
            this.sumPoleBufferForSpan(knotIndex0 - this.degree + 1);
            this.sumPoleBuffer1ForSpan(knotIndex0 - this.degree + 1);
        }
        else {
            this.knots.evaluateBasisFunctions1(knotIndex0, u, this.basisBuffer, this.basisBuffer1, this.basisBuffer2);
            this.sumPoleBufferForSpan(knotIndex0 - this.degree + 1);
            this.sumPoleBuffer1ForSpan(knotIndex0 - this.degree + 1);
            this.sumPoleBuffer2ForSpan(knotIndex0 - this.degree + 1);
        }
    }
    reverseInPlace() {
        // reverse poles in blocks ...
        const b = this.poleLength;
        const data = this.packedData;
        for (let i0 = 0, j0 = b * (this.numPoles - 1); i0 < j0; i0 += b, j0 -= b) {
            let t = 0;
            for (let i = 0; i < b; i++) {
                t = data[i0 + i];
                data[i0 + i] = data[j0 + i];
                data[j0 + i] = t;
            }
        }
        this.knots.reflectKnots();
    }
}
exports.BSpline1dNd = BSpline1dNd;
/**
 * Base class for BSplineCurve3d and BSplineCurve3dH.
 * * The weighted variant has the problem that CurvePrimitive 3d typing does not allow undefined result where Point4d has zero weight.
 * * The convention for these is to return 000 in such places.
 */
class BSplineCurve3dBase extends CurvePrimitive_1.CurvePrimitive {
    constructor(poleDimension, numPoles, order, knots) {
        super();
        this._bcurve = BSpline1dNd.create(numPoles, poleDimension, order, knots);
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
        this._bcurve.extendRange(rangeToExtend, transform);
    }
}
exports.BSplineCurve3d = BSplineCurve3d;
//# sourceMappingURL=BSplineCurve.js.map