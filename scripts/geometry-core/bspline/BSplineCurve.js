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
const Range_1 = require("../geometry3d/Range");
const Ray3d_1 = require("../geometry3d/Ray3d");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const CurveLocationDetail_1 = require("../curve/CurveLocationDetail");
const Geometry_1 = require("../Geometry");
const KnotVector_1 = require("./KnotVector");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
const BezierCurve3dH_1 = require("./BezierCurve3dH");
const BezierCurve3d_1 = require("./BezierCurve3d");
const BSpline1dNd_1 = require("./BSpline1dNd");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
const Bezier1dNd_1 = require("./Bezier1dNd");
const Point4d_1 = require("../geometry4d/Point4d");
/**
 * Base class for BSplineCurve3d and BSplineCurve3dH.
 * * A bspline curve consists of a set of knots and a set of poles.
 * * The bspline curve is a function of the independent "knot axis" variable
 * * The curve "follows" the poles loosely.
 * * The is a set of polynomial spans.
 * * The polynomial spans all have same `degree`.
 * * Within each span, the polynomial of that `degree` is controlled by `order = degree + 1` contiguous points called poles.
 * * The is a strict relationship between knot and poles counts:  `numPoles + order = numKnots + 2'
 * * The number of spans is `numSpan = numPoles - degree`
 * * For a given `spanIndex`:
 * * * The `order` poles begin at index `spanIndex`.
 * * * The `2*order` knots begin as span index
 * * * The knot interval for this span is from `knot[degree+span-1] to knot[degree+span]`
 * * The active part of the knot axis is `knot[degree-1] < knot < knot[degree-1 + numSpan]` i.e. `knot[degree-1] < knot < knot[numPoles]
 *
 * Nearly all bsplines are "clamped ".
 * * Clamping make the curve pass through its first and last poles, with tangents directed along the first and last edges of the control polygon.
 * * The knots for a clampled bspline have `degree` copies of the lowest knot value and `degree` copies of the highest knot value.
 * * For instance, the knot vector `[0,0,0,1,2,3,3,3]
 * * * can be evaluated from `0<=knot<=3`
 * * * has 3 spans: 0 to 1, 1 to 2, 2 to 3
 * * * has 6 poles
 * * * passes through its first and last poles.
 * * `create` methods may allow classic convention that has an extra knot at the beginning and end of the knot vector.
 * * * The extra knots (first and last) were never referenced by the bspline recurrance relations.
 * * * When the `ceate` methods recognize the classic setup (`numPoles + order = numKnots`), the extra knot is not saved with the BSplineCurve3dBase knots.
 *
 * * The weighted variant has the problem that CurvePrimitive 3d typing does not allow undefined result where Point4d has zero weight.
 * * The convention for these is to return 000 in such places.
 *
 * * Note the class relationships:
 * * * BSpline1dNd knows the bspline reucurrance relations for control points (poles) with no physical meaning.
 * * * BsplineCurve3dBase owns a protected BSpline1dNd
 * * * BsplineCurve3dBase is derived from CurvePrimitive, which creates obligation to act as a 3D curve, such as
 * * * * evaluate fraction to point and derivatives wrt fraction
 * * * * compute intersection with plane
 * * * BSplineCurve3d and BSplineCurve3dH have variant logic driven by whether or not there are "weights" on the poles.
 * * * * For `BSplineCurve3d`, the xyz value of pole calculations are "final" values for 3d evaluation
 * * * * For `BSplineCurve3dH`, various `BSpline1dNd` results with xyzw have to be normalized back to xyz.
 *
 * * These classes do not support "periodic" variants.
 * * * Periodic curves need to have certain leading knots and poles replicated at the end
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
    /**
     * Return the start point of hte curve.
     */
    startPoint() { return this.evaluatePointInSpan(0, 0.0); }
    /**
     * Return the end point of the curve
     */
    endPoint() { return this.evaluatePointInSpan(this.numSpan - 1, 1.0); }
    /** Reverse the curve in place.
     * * Poles are reversed
     * * knot values are mirrored around the middle of the
     */
    reverseInPlace() { this._bcurve.reverseInPlace(); }
    /**
     * Return an array with this curve's bezier fragments.
     */
    collectBezierSpans(prefer3dH) {
        const result = [];
        const numSpans = this.numSpan;
        for (let i = 0; i < numSpans; i++) {
            if (this._bcurve.knots.isIndexOfRealSpan(i)) {
                const span = this.getSaturatedBezierSpan3dOr3dH(i, prefer3dH);
                if (span)
                    result.push(span);
            }
        }
        return result;
    }
    /** Given a pole index, return the starting index for the contiguous array. */
    poleIndexToDataIndex(poleIndex) {
        if (poleIndex >= 0 && poleIndex < this.numPoles)
            return poleIndex * this._bcurve.poleLength;
        return undefined;
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
        const result = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPointDistance(this, 0.0, point, point.distance(spacePoint));
        this.fractionToPoint(1.0, point);
        result.updateIfCloserCurveFractionPointDistance(this, 1.0, spacePoint, spacePoint.distance(point));
        let span;
        const numSpans = this.numSpan;
        for (let i = 0; i < numSpans; i++) {
            if (this._bcurve.knots.isIndexOfRealSpan(i)) {
                span = this.getSaturatedBezierSpan3dOr3dH(i, true, span);
                if (span) {
                    if (span.updateClosestPointByTruePerpendicular(spacePoint, result)) {
                        // the detail records the span bezier -- promote it to the parent curve . ..
                        result.curve = this;
                        result.fraction = span.fractionToParentFraction(result.fraction);
                    }
                }
            }
        }
        return result;
    }
    /** Implement `CurvePrimitive.appendPlaneIntersections`
     * @param plane A plane (e.g. specific type Plane3dByOriginAndUnitNormal or Point4d)
     * @param result growing array of plane intersections
     * @return number of intersections appended to the array.
    */
    appendPlaneIntersectionPoints(plane, result) {
        const numPole = this.numPoles;
        const order = this.order;
        const allCoffs = new Float64Array(numPole);
        const numSpan = this.numSpan;
        const point4d = Point4d_1.Point4d.create();
        // compute all pole altitudes from the plane
        const minMax = Range_1.Range1d.createNull();
        // Put the altitudes of all the bspline poles in one array.
        for (let i = 0; i < numPole; i++) {
            allCoffs[i] = plane.weightedAltitude(this.getPolePoint4d(i, point4d));
            minMax.extendX(allCoffs[i]);
        }
        // A univaraite bspline throught the altitude poles gives altitude as function of the bspline knot.
        // The (bspline) altitude function for each span is `order` consecutive altitudes.
        // If those altitutdes bracket zero, the span may potentially have a crossing.
        // When that occurs,
        let univariateBezier;
        let numFound = 0;
        let previousFraction = -1000.0;
        if (minMax.containsX(0.0)) {
            for (let spanIndex = 0; spanIndex < numSpan; spanIndex++) {
                if (this._bcurve.knots.isIndexOfRealSpan(spanIndex)) { // ignore trivial knot intervals.
                    // outer range test ...
                    minMax.setNull();
                    minMax.extendArraySubset(allCoffs, spanIndex, order);
                    if (minMax.containsX(0.0)) {
                        // pack the bspline support into a univariate bezier ...
                        univariateBezier = BezierPolynomials_1.UnivariateBezier.createArraySubset(allCoffs, spanIndex, order, univariateBezier);
                        // saturate and solve the bezier
                        Bezier1dNd_1.Bezier1dNd.saturate1dInPlace(univariateBezier.coffs, this._bcurve.knots, spanIndex);
                        const roots = univariateBezier.roots(0.0, true);
                        if (roots) {
                            for (const spanFraction of roots) {
                                // promote each local bezier fraction to global fraction.
                                // savet the curve evaluation at that fraction.
                                numFound++;
                                const fraction = this._bcurve.knots.spanFractionToFraction(spanIndex, spanFraction);
                                if (!Geometry_1.Geometry.isAlmostEqualNumber(fraction, previousFraction)) {
                                    const detail = CurveLocationDetail_1.CurveLocationDetail.createCurveEvaluatedFraction(this, fraction);
                                    result.push(detail);
                                    previousFraction = fraction;
                                }
                            }
                        }
                    }
                }
            }
        }
        return numFound;
    }
}
exports.BSplineCurve3dBase = BSplineCurve3dBase;
/**
 * A BSplineCurve3d is a bspline curve whose poles are Point3d.
 * See BSplineCurve3dBase for description of knots, order, degree.
 */
class BSplineCurve3d extends BSplineCurve3dBase {
    initializeWorkBezier() {
        if (this._workBezier === undefined)
            this._workBezier = BezierCurve3dH_1.BezierCurve3dH.createOrder(this.order);
        return this._workBezier;
    }
    isSameGeometryClass(other) { return other instanceof BSplineCurve3d; }
    tryTransformInPlace(transform) { PointHelpers_1.Point3dArray.multiplyInPlace(transform, this._bcurve.packedData); return true; }
    getPolePoint3d(poleIndex, result) {
        const k = this.poleIndexToDataIndex(poleIndex);
        if (k !== undefined) {
            const data = this._bcurve.packedData;
            return Point3dVector3d_1.Point3d.create(data[k], data[k + 1], data[k + 2], result);
        }
        return undefined;
    }
    getPolePoint4d(poleIndex, result) {
        const k = this.poleIndexToDataIndex(poleIndex);
        if (k !== undefined) {
            const data = this._bcurve.packedData;
            return Point4d_1.Point4d.create(data[k], data[k + 1], data[k + 2], 1.0, result);
        }
        return undefined;
    }
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
        const numPoles = poles instanceof Float64Array ? poles.length / 3 : poles.length;
        if (order < 1 || numPoles < order)
            return undefined;
        const knots = KnotVector_1.KnotVector.createUniformClamped(poles.length, order - 1, 0.0, 1.0);
        const curve = new BSplineCurve3d(numPoles, order, knots);
        if (poles instanceof Float64Array) {
            for (let i = 0; i < 3 * numPoles; i++)
                curve._bcurve.packedData[i] = poles[i];
        }
        else {
            let i = 0;
            for (const p of poles) {
                curve._bcurve.packedData[i++] = p.x;
                curve._bcurve.packedData[i++] = p.y;
                curve._bcurve.packedData[i++] = p.z;
            }
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
        return Point3dVector3d_1.Point3d.createFrom(this._bcurve.poleBuffer);
    }
    evaluatePointAndTangentInSpan(spanIndex, spanFraction) {
        this._bcurve.evaluateBuffersInSpan1(spanIndex, spanFraction);
        return Ray3d_1.Ray3d.createCapture(Point3dVector3d_1.Point3d.createFrom(this._bcurve.poleBuffer), Point3dVector3d_1.Vector3d.createFrom(this._bcurve.poleBuffer1));
    }
    /** Evaluate at a positioni given by a knot value.  */
    knotToPoint(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u);
        return Point3dVector3d_1.Point3d.createFrom(this._bcurve.poleBuffer, result);
    }
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivative(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u, 1);
        if (!result)
            return Ray3d_1.Ray3d.createCapture(Point3dVector3d_1.Point3d.createFrom(this._bcurve.poleBuffer), Point3dVector3d_1.Vector3d.createFrom(this._bcurve.poleBuffer1));
        result.origin.setFrom(this._bcurve.poleBuffer);
        result.direction.setFrom(this._bcurve.poleBuffer1);
        return result;
    }
    /** Evaluate at a position given by a knot value.  Return point with 2 derivatives. */
    knotToPointAnd2Derivatives(u, result) {
        this._bcurve.evaluateBuffersAtKnot(u, 2);
        return Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createOriginAndVectorsXYZ(this._bcurve.poleBuffer[0], this._bcurve.poleBuffer[1], this._bcurve.poleBuffer[2], this._bcurve.poleBuffer1[0], this._bcurve.poleBuffer1[1], this._bcurve.poleBuffer1[2], this._bcurve.poleBuffer2[0], this._bcurve.poleBuffer2[1], this._bcurve.poleBuffer2[2], result);
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
    quickLength() { return PointHelpers_1.Point3dArray.sumEdgeLengths(this._bcurve.packedData); }
    emitStrokableParts(handler, options) {
        const needBeziers = handler.announceBezierCurve !== undefined;
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
        if (!this._bcurve.knots.testClosable())
            return false;
        if (!this._bcurve.testCloseablePolygon())
            return false;
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
        if (result === undefined || !(result instanceof BezierCurve3d_1.BezierCurve3d) || result.order !== order)
            result = BezierCurve3d_1.BezierCurve3d.createOrder(order);
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
        if (result === undefined || !(result instanceof BezierCurve3dH_1.BezierCurve3dH) || result.order !== order)
            result = BezierCurve3dH_1.BezierCurve3dH.createOrder(order);
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