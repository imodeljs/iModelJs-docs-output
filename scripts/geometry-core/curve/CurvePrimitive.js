"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Curve */
const Geometry_1 = require("../Geometry");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Ray3d_1 = require("../geometry3d/Ray3d");
const Newton_1 = require("../numerics/Newton");
const Quadrature_1 = require("../numerics/Quadrature");
const CurveLocationDetail_1 = require("./CurveLocationDetail");
const GeometryQuery_1 = require("./GeometryQuery");
const StrokeCountMap_1 = require("../curve/Query/StrokeCountMap");
const CurveExtendMode_1 = require("./CurveExtendMode");
/**
 * A curve primitive is bounded
 * A curve primitive maps fractions in 0..1 to points in space.
 * As the fraction proceeds from 0 towards 1, the point moves "forward" along the curve.
 * True distance along the curve is not always strictly proportional to fraction.
 * * LineSegment3d always has proportional fraction and distance
 * * an Arc3d which is true circular has proportional fraction and distance
 * *  A LineString3d is not proportional (except for special case of all segments of equal length)
 * * A Spiral3d is proportional
 * * A BsplineCurve3d is only proportional for special cases.
 *
 * For fractions outside 0..1, the curve primitive class may either (a) return the near endpoint or (b) evaluate an extended curve.
 * @public
 */
class CurvePrimitive extends GeometryQuery_1.GeometryQuery {
    constructor() {
        super();
        /** String name for schema properties */
        this.geometryCategory = "curvePrimitive";
    }
    /**
     * Returns a ray whose origin is the curve point and direction is the unit tangent.
     * @param fraction fractional position on the curve
     * @param result optional preallocated ray.
     */
    fractionToPointAndUnitTangent(fraction, result) {
        const ray = this.fractionToPointAndDerivative(fraction, result);
        ray.trySetDirectionMagnitudeInPlace(1.0);
        return ray;
    }
    /** Construct a frenet frame:
     * * origin at the point on the curve
     * * x axis is unit vector along the curve (tangent)
     * * y axis is perpendicular and in the plane of the osculating circle.
     * * z axis perpendicular to those.
     */
    fractionToFrenetFrame(fraction, result) {
        const plane = this.fractionToPointAnd2Derivatives(fraction);
        if (!plane)
            return undefined;
        let axes = Matrix3d_1.Matrix3d.createRigidFromColumns(plane.vectorU, plane.vectorV, Geometry_1.AxisOrder.XYZ);
        if (axes)
            return Transform_1.Transform.createRefs(plane.origin, axes, result);
        // 2nd derivative not distinct -- do arbitrary headsUP ...
        const perpVector = Matrix3d_1.Matrix3d.createPerpendicularVectorFavorXYPlane(plane.vectorU, plane.vectorV);
        axes = Matrix3d_1.Matrix3d.createRigidFromColumns(plane.vectorU, perpVector, Geometry_1.AxisOrder.XYZ);
        if (axes)
            return Transform_1.Transform.createRefs(plane.origin, axes, result);
        return undefined;
    }
    /**
     * Construct a point extrapolated along tangent at fraction.
     * @param fraction fractional position on the primitive
     * @param distance (signed) distance to move on the tangent.
     */
    fractionAndDistanceToPointOnTangent(fraction, distance) {
        const ray = this.fractionToPointAndUnitTangent(fraction);
        return ray.fractionToPoint(distance);
    }
    /**
     * return the length of the curve.
     * * Curve length is always positive.
     */
    curveLength() {
        const context = new CurveLengthContext();
        this.emitStrokableParts(context);
        return context.getSum();
    }
    /**
     * Returns a (high accuracy) length of the curve between fractional positions
     * * Curve length is always positive.
     * * Default implementation applies a generic gaussian integration.
     * * Most curve classes (certainly LineSegment, LineString, Arc) are expected to provide efficient implementations.
     */
    curveLengthBetweenFractions(fraction0, fraction1) {
        if (fraction0 === fraction1)
            return 0.0;
        const scale = this.getFractionToDistanceScale();
        if (scale !== undefined) {
            // We are in luck! simple proportions determine it all  !!!
            // (for example, a LineSegment3d or a circular arc)
            const totalLength = this.curveLength();
            return Math.abs((fraction1 - fraction0) * totalLength);
        }
        const context = new CurveLengthContext(fraction0, fraction1);
        this.emitStrokableParts(context);
        return Math.abs(context.getSum());
    }
    /**
     *
     * * Run an integration (with a default gaussian quadrature) with a fixed fractional step
     * * This is typically called by specific curve type implementations of curveLengthBetweenFractions.
     *   * For example, in Arc3d implementation of curveLengthBetweenFractions:
     *     * If the Arc3d is true circular, it the arc is true circular, use the direct `arcLength = radius * sweepRadians`
     *     * If the Arc3d is not true circular, call this method with an interval count appropriate to eccentricity and sweepRadians.
     * @returns Returns an integral estimated by numerical quadrature between the fractional positions.
     * @param fraction0 start fraction for integration
     * @param fraction1 end fraction for integration
     * @param numInterval number of quadrature intervals
     */
    curveLengthWithFixedIntervalCountQuadrature(fraction0, fraction1, numInterval, numGauss = 5) {
        if (fraction0 > fraction1) {
            const fSave = fraction0;
            fraction0 = fraction1;
            fraction1 = fSave;
        }
        const context = new CurveLengthContext(fraction0, fraction1, numGauss);
        context.announceIntervalForUniformStepStrokes(this, numInterval, fraction0, fraction1);
        return Math.abs(context.getSum());
    }
    /**
     *
     * * (Attempt to) find a position on the curve at a signed distance from start fraction.
     * * Return the position as a CurveLocationDetail.
     * * In the `CurveLocationDetail`, record:
     *   * `fractional` position
     *   * `fraction` = coordinates of the point
     *   * `search
     *   * `a` = (signed!) distance moved.   If `allowExtension` is false and the move reached the start or end of the curve, this distance is smaller than the requested signedDistance.
     *   * `curveSearchStatus` indicates one of:
     *     * `error` (unusual) computation failed not supported for this curve.
     *     * `success` full movement completed
     *     * `stoppedAtBoundary` partial movement completed. This can be due to either
     *        * `allowExtension` parameter sent as `false`
     *        * the curve type (e.g. bspline) does not support extended range.
     * * if `allowExtension` is true, movement may still end at the startPoint or end point for curves that do not support extended geometry (specifically bsplines)
     * * if the curve returns a value (i.e. not `undefined`) for `curve.getFractionToDistanceScale()`, the base class carries out the computation
     *    and returns a final location.
     *   * LineSegment3d relies on this.
     * * If the curve does not implement the computation or the curve has zero length, the returned `CurveLocationDetail` has
     *    * `fraction` = the value of `startFraction`
     *    * `point` = result of `curve.fractionToPoint(startFraction)`
     *    * `a` = 0
     *    * `curveStartState` = `CurveSearchStatus.error`
     * @param startFraction fractional position where the move starts
     * @param signedDistance distance to move.   Negative distance is backwards in the fraction space
     * @param allowExtension if true, all the move to go beyond the startPoint or endpoint of the curve.  If false, do not allow movement beyond the startPoint or endpoint
     * @param result optional result.
     * @returns A CurveLocationDetail annotated as above.  Note that if the curve does not support the calculation, there is still a result which contains the point at the input startFraction, with failure indicated in the `curveStartState` member
     */
    moveSignedDistanceFromFraction(startFraction, signedDistance, allowExtension, result) {
        const scale = this.getFractionToDistanceScale();
        if (scale !== undefined) {
            // We are in luck! simple proportions determine it all  !!!
            // (for example, a LineSegment3d or a circular arc)
            const totalLength = this.curveLength();
            const signedFractionMove = Geometry_1.Geometry.conditionalDivideFraction(signedDistance, totalLength);
            if (signedFractionMove === undefined) {
                return CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPointDistanceCurveSearchStatus(this, startFraction, this.fractionToPoint(startFraction), 0.0, CurveLocationDetail_1.CurveSearchStatus.error);
            }
            return CurveLocationDetail_1.CurveLocationDetail.createConditionalMoveSignedDistance(allowExtension, this, startFraction, startFraction + signedFractionMove, signedDistance, result);
        }
        return this.moveSignedDistanceFromFractionGeneric(startFraction, signedDistance, allowExtension, result);
    }
    /**
     * Generic algorithm to search for point at signed distance from a fractional startPoint.
     * * This will work for well for smooth curves.
     * * Curves with tangent or other low-order-derivative discontinuities may need to implement specialized algorithms.
     * * We need to find an endFraction which is the end-of-interval (usually upper) limit of integration of the tangent magnitude from startFraction to endFraction
     * * That integral is a function of endFraction.
     * * The derivative of that integral with respect to end fraction is the tangent magnitude at end fraction.
     * * Use that function and (easily evaluated!) derivative for a Newton iteration
     * * TO ALL WHO HAVE FUZZY MEMORIES OF CALCULUS CLASS: "The derivative of the integral wrt upper limit is the value of the integrand there" is the
     *       fundamental theorem of integral calculus !!! The fundamental theorem is not just an abstraction !!! It is being used
     *       here in its barest possible form !!!
     * * See https://en.wikipedia.org/wiki/Fundamental_theorem_of_calculus
     * @param startFraction
     * @param signedDistance
     * @param _allowExtension
     * @param result
     */
    moveSignedDistanceFromFractionGeneric(startFraction, signedDistance, allowExtension, result) {
        const limitFraction = signedDistance > 0.0 ? 1.0 : 0.0;
        const absDistance = Math.abs(signedDistance);
        const directionFactor = signedDistance < 0.0 ? -1.0 : 1.0;
        const availableLength = this.curveLengthBetweenFractions(startFraction, limitFraction); // that is always positive
        if (availableLength < absDistance && !allowExtension)
            return CurveLocationDetail_1.CurveLocationDetail.createConditionalMoveSignedDistance(allowExtension, this, startFraction, limitFraction, signedDistance, result);
        const fractionStep = absDistance / availableLength;
        let fractionB = Geometry_1.Geometry.interpolate(startFraction, fractionStep, limitFraction);
        let fractionA = startFraction;
        let distanceA = 0.0;
        const tol = 1.0e-12 * availableLength;
        let numConverged = 0;
        const tangent = Ray3d_1.Ray3d.createXAxis();
        // on each loop entry:
        // fractionA is the most recent endOfInterval.  (It may have been reached by a mixture of forward and backward step.)
        // distanceA is the distance to (the point at) fractionA
        // fractionB is the next end fraction
        for (let iterations = 0; iterations < 10; iterations++) {
            const distanceAB = this.curveLengthBetweenFractions(fractionA, fractionB);
            const directionAB = fractionB > fractionA ? directionFactor : -directionFactor;
            const distance0B = distanceA + directionAB * distanceAB;
            const distanceError = absDistance - distance0B;
            if (Math.abs(distanceError) < tol) {
                numConverged++;
                if (numConverged > 1)
                    break;
            }
            else {
                numConverged = 0;
            }
            this.fractionToPointAndDerivative(fractionB, tangent);
            const tangentMagnitude = tangent.direction.magnitude();
            fractionA = fractionB;
            fractionB = fractionA + directionFactor * distanceError / tangentMagnitude;
            if (fractionA === fractionB) { // YES -- that is an exact equality test.   When it happens, there's no need for confirming with another iteration.
                numConverged = 100;
                break;
            }
            distanceA = distance0B;
        }
        if (numConverged > 1)
            return CurveLocationDetail_1.CurveLocationDetail.createConditionalMoveSignedDistance(false, this, startFraction, fractionB, signedDistance, result);
        result = CurveLocationDetail_1.CurveLocationDetail.createCurveEvaluatedFraction(this, startFraction, result);
        result.a = 0.0;
        result.curveSearchStatus = CurveLocationDetail_1.CurveSearchStatus.error;
        return result;
    }
    /**
     * * Returns true if the curve's fraction queries extend beyond 0..1.
     * * Base class default implementation returns false.
     * * These class (and perhaps others in the future) will return true:
     *   * LineSegment3d
     *   * LineString3d
     *   * Arc3d
     */
    get isExtensibleFractionSpace() { return false; }
    /** Search for the curve point that is closest to the spacePoint.
     *
     * * If the space point is exactly on the curve, this is the reverse of fractionToPoint.
     * * Since CurvePrimitive should always have start and end available as candidate points, this method should always succeed
     * @param spacePoint point in space
     * @param extend true to extend the curve (if possible), false for no extend, single CurveExtendOptions (for both directions), or array of distinct CurveExtendOptions for start and end.
     * @returns Returns a CurveLocationDetail structure that holds the details of the close point.
     */
    closestPoint(spacePoint, extend) {
        const strokeHandler = new ClosestPointStrokeHandler(spacePoint, extend);
        this.emitStrokableParts(strokeHandler);
        return strokeHandler.claimResult();
    }
    /**
     * Find intervals of this curvePrimitive that are interior to a clipper
     * @param clipper clip structure (e.g. clip planes)
     * @param announce (optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(_clipper, _announce) {
        // DEFAULT IMPLEMENTATION -- no interior parts
        return false;
    }
    /** Return (if possible) a curve primitive which is a portion of this curve.
     * @param _fractionA [in] start fraction
     * @param _fractionB [in] end fraction
     */
    clonePartialCurve(_fractionA, _fractionB) {
        return undefined;
    }
    /**
     * * If the curve primitive has distance-along-curve strictly proportional to curve fraction, return true
     * * If distance-along-the-curve is not proportional, return undefined.
     * * When defined, the scale factor is always the length of the curve.
     * * This scale factor is typically available for these curve types:
     * * * All `LineSegment3d`
     * * * Arc3d which is a true circular arc (axes perpendicular and of equal length).
     * * * CurveChainWithDistanceIndex
     * * This scale factor is undefined for these curve types:
     * * * Arc3d which is a true ellipse, i.e. unequal lengths of defining vectors or non-perpendicular defining vectors.
     * * * bspline and bezier curves
     * @returns scale factor or undefined
     */
    getFractionToDistanceScale() { return undefined; }
    /**
     * Compute intersections with a plane.
     * * The intersections are appended to the result array.
     * * The base class implementation emits strokes to an AppendPlaneIntersectionStrokeHandler object, which uses a Newton iteration to get
     *     high-accuracy intersection points within strokes.
     * * Derived classes should override this default implementation if there are easy analytic solutions.
     * * Derived classes are free to implement extended intersections (e.g. arc!!!)
     * @param plane The plane to be intersected.
     * @param result Array to receive intersections
     * @returns Return the number of CurveLocationDetail's added to the result array.
     */
    appendPlaneIntersectionPoints(plane, result) {
        const strokeHandler = new AppendPlaneIntersectionStrokeHandler(plane, result);
        const n0 = result.length;
        this.emitStrokableParts(strokeHandler);
        return result.length - n0;
    }
    /**
     * Examine contents of an array of CurveLocationDetail.
     * Filter the intersections according to the parameters.
     * @param allowExtend if false, remove points on the extension.
     * @param applySnappedCoordinates if true, change the stored fractions and coordinates to exact end values.  Otherwise
     *     use the exact values only for purpose of updating the curveIntervalRole.
     * @param startEndFractionTolerance if nonzero, adjust fraction to 0 or 1 with this tolerance.
     * @param startEndXYZTolerance if nonzero, adjust to endpoint with this tolerance.
     * @internal
     */
    static snapAndRestrictDetails(details, allowExtend = true, applySnappedCoordinates = false, startEndFractionTolerance = Geometry_1.Geometry.smallAngleRadians, startEndXYZTolerance = Geometry_1.Geometry.smallMetricDistance) {
        const n0 = details.length;
        let acceptIndex = 0;
        const point0 = Point3dVector3d_1.Point3d.create();
        const point1 = Point3dVector3d_1.Point3d.create();
        let snappedCoordinates;
        for (let candidateIndex = 0; candidateIndex < n0; candidateIndex++) {
            snappedCoordinates = undefined;
            const detail = details[candidateIndex];
            let fraction = detail.fraction;
            let accept = allowExtend || Geometry_1.Geometry.isIn01(fraction);
            if (detail.curve) {
                detail.curve.startPoint(point0);
                detail.curve.endPoint(point1);
            }
            if (startEndFractionTolerance > 0) {
                if (Math.abs(fraction) < startEndFractionTolerance) {
                    fraction = 0.0;
                    accept = true;
                    detail.intervalRole = CurveLocationDetail_1.CurveIntervalRole.isolatedAtVertex;
                    snappedCoordinates = point0;
                }
                if (Math.abs(fraction - 1.0) < startEndFractionTolerance) {
                    fraction = 1.0;
                    accept = true;
                    detail.intervalRole = CurveLocationDetail_1.CurveIntervalRole.isolatedAtVertex;
                    snappedCoordinates = point1;
                    if (detail.curve)
                        snappedCoordinates = detail.curve.startPoint(point1);
                }
            }
            if (startEndXYZTolerance > 0 && detail.curve !== undefined) {
                // REMARK: always test both endpoints.   If there is a cyclic fraction space, an intersection marked as "after" the end might have wrapped all the way to the beginning.
                if (detail.point.distance(point0) <= startEndXYZTolerance) {
                    fraction = 0.0;
                    detail.intervalRole = CurveLocationDetail_1.CurveIntervalRole.isolatedAtVertex;
                    snappedCoordinates = point0;
                }
                else if (detail.point.distance(point1) <= startEndXYZTolerance) {
                    fraction = 1.0;
                    detail.intervalRole = CurveLocationDetail_1.CurveIntervalRole.isolatedAtVertex;
                    snappedCoordinates = point1;
                }
            }
            if (accept) {
                if (applySnappedCoordinates) {
                    detail.fraction = fraction;
                    if (snappedCoordinates !== undefined)
                        detail.point.setFrom(snappedCoordinates);
                }
                if (acceptIndex < candidateIndex)
                    details[acceptIndex] = detail;
                acceptIndex++;
            }
        }
        if (acceptIndex < n0)
            details.length = acceptIndex;
    }
    /** return the startPoint of the primitive.  The default implementation returns fractionToPoint (0.0) */
    startPoint(result) { return this.fractionToPoint(0.0, result); }
    /** return the end point of the primitive. The default implementation returns fractionToPoint(1.0) */
    endPoint(result) { return this.fractionToPoint(1.0, result); }
    /**
     * attach StrokeCountMap structure to this primitive (and recursively to any children)
     * * Base class implementation (here) gets the simple count from computeStrokeCountForOptions and attaches it.
     * * LineString3d, arc3d, BezierCurve3d, BezierCurve3dH accept that default.
     * * Subdivided primitives (linestring, bspline curve) implement themselves and attach a StrokeCountMap containing the
     *       total count, and also containing an array of StrokeCountMap per component.
     * * For CurvePrimitiveWithDistanceIndex, the top level gets (only) a total count, and each child gets
     *       its own StrokeCountMap with appropriate structure.
     * @param options StrokeOptions that determine count
     * @param parentStrokeMap optional map from parent.  Its count, curveLength, and a1 values are increased with count and distance from this primitive.
     * @return sum of `a0+this.curveLength()`, for use as `a0` of successor in chain.
     */
    computeAndAttachRecursiveStrokeCounts(options, parentMap) {
        const n = this.computeStrokeCountForOptions(options);
        const a = this.curveLength();
        CurvePrimitive.installStrokeCountMap(this, StrokeCountMap_1.StrokeCountMap.createWithCurvePrimitive(this, n, a, 0, a), parentMap);
    }
    /**
     * * evaluate strokes at fractions indicated in a StrokeCountMap.
     *   * Base class implementation (here) gets the simple count from computeStrokeCountForOptions and strokes at uniform fractions.
     *   * LineString3d, arc3d, BezierCurve3d, BezierCurve3dH accept that default.
     *   * Subdivided primitives (linestring, bspline curve) implement themselves and evaluate within components.
     *   * CurvePrimitiveWithDistanceIndex recurses to its children.
     * * if packedFraction and packedDerivative arrays are present in the LineString3d, fill them.
     * @param map = stroke count data.
     * @param linestring = receiver linestring.
     * @return number of strokes added.  0 if any errors matching the map to the curve primitive.
     */
    addMappedStrokesToLineString3D(map, linestring) {
        const numPoint0 = linestring.numPoints();
        if (map.primitive && map.primitive === this && map.numStroke > 0) {
            for (let i = 0; i <= map.numStroke; i++) {
                const fraction = i / map.numStroke;
                linestring.appendFractionToPoint(this, fraction);
            }
        }
        return linestring.numPoints() - numPoint0;
    }
    /**
     * final install step to save curveMap in curve.  If parentMap is given, update its length, count, and a1 fields
     * @param curve curve to receive the annotation
     * @param map
     * @param parentMap
     */
    static installStrokeCountMap(curve, curveMap, parentMap) {
        if (parentMap)
            parentMap.addToCountAndLength(curveMap.numStroke, curveMap.curveLength);
        curve.strokeData = curveMap;
    }
}
exports.CurvePrimitive = CurvePrimitive;
/** Intermediate class for managing the parentCurve announcements from an IStrokeHandler */
class NewtonRotRStrokeHandler extends Newton_1.NewtonEvaluatorRtoR {
    constructor() {
        super();
        this._parentCurvePrimitive = undefined;
    }
    /** retain the parentCurvePrimitive.
     * * Calling this method tells the handler that the parent curve is to be used for detail searches.
     * * Example: Transition spiral search is based on linestring first, then the exact spiral.
     * * Example: CurveChainWithDistanceIndex does NOT do this announcement -- the constituents act independently.
     */
    startParentCurvePrimitive(curve) { this._parentCurvePrimitive = curve; }
    /** Forget the parentCurvePrimitive */
    endParentCurvePrimitive(_curve) { this._parentCurvePrimitive = undefined; }
}
class AppendPlaneIntersectionStrokeHandler extends NewtonRotRStrokeHandler {
    constructor(plane, intersections) {
        super();
        this._fractionA = 0;
        this._functionA = 0;
        // private derivativeA: number;   <---- Not currently used
        this._functionB = 0;
        this._fractionB = 0;
        this._derivativeB = 0;
        this._numThisCurve = 0;
        this._plane = plane;
        this._intersections = intersections;
        this.startCurvePrimitive(undefined);
        this._ray = Ray3d_1.Ray3d.createZero();
        this._newtonSolver = new Newton_1.Newton1dUnboundedApproximateDerivative(this);
    }
    // Return the first defined curve among: this.parentCurvePrimitive, this.curve;
    effectiveCurve() {
        if (this._parentCurvePrimitive)
            return this._parentCurvePrimitive;
        return this._curve;
    }
    get getDerivativeB() { return this._derivativeB; } // <--- DerivativeB is not currently used anywhere. Provided getter to suppress tslint error
    startCurvePrimitive(curve) {
        this._curve = curve;
        this._fractionA = 0.0;
        this._numThisCurve = 0;
        this._functionA = 0.0;
        // this.derivativeA = 0.0;
    }
    endCurvePrimitive() { }
    announceIntervalForUniformStepStrokes(cp, numStrokes, fraction0, fraction1) {
        this.startCurvePrimitive(cp);
        if (numStrokes < 1)
            numStrokes = 1;
        const df = 1.0 / numStrokes;
        for (let i = 0; i <= numStrokes; i++) {
            const fraction = Geometry_1.Geometry.interpolate(fraction0, i * df, fraction1);
            cp.fractionToPointAndDerivative(fraction, this._ray);
            this.announcePointTangent(this._ray.origin, fraction, this._ray.direction);
        }
    }
    announceSegmentInterval(_cp, point0, point1, _numStrokes, fraction0, fraction1) {
        const h0 = this._plane.altitude(point0);
        const h1 = this._plane.altitude(point1);
        if (h0 * h1 > 0.0)
            return;
        const fraction01 = BezierPolynomials_1.Order2Bezier.solveCoffs(h0, h1);
        // let numIntersection = 0;
        if (fraction01 !== undefined) {
            // numIntersection++;
            const fraction = Geometry_1.Geometry.interpolate(fraction0, fraction01, fraction1);
            this._newtonSolver.setX(fraction);
            if (this._newtonSolver.runIterations()) {
                this.announceSolutionFraction(this._newtonSolver.getX());
            }
            // this.intersections.push(CurveLocationDetail.createCurveFractionPoint(cp, fraction, cp.fractionToPoint(fraction)));
        }
    }
    announceSolutionFraction(fraction) {
        const curve = this.effectiveCurve();
        if (curve) {
            this._ray = curve.fractionToPointAndDerivative(fraction, this._ray);
            this._intersections.push(CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(curve, fraction, this._ray.origin));
        }
    }
    evaluate(fraction) {
        const curve = this.effectiveCurve();
        if (!curve)
            return false;
        this.currentF = this._plane.altitude(curve.fractionToPoint(fraction));
        return true;
    }
    /**
     * * ASSUME both the "A" and "B"  evaluations (fraction, function, and derivative) are known.
     * * If function value changed sign between, interpolate an approximate root and improve it with
     *     the newton solver.
     */
    searchInterval() {
        if (this._functionA * this._functionB > 0)
            return;
        if (this._functionA === 0)
            this.announceSolutionFraction(this._fractionA);
        if (this._functionB === 0)
            this.announceSolutionFraction(this._fractionB);
        if (this._functionA * this._functionB < 0) {
            const fraction = Geometry_1.Geometry.inverseInterpolate(this._fractionA, this._functionA, this._fractionB, this._functionB);
            if (fraction) {
                this._newtonSolver.setX(fraction);
                if (this._newtonSolver.runIterations())
                    this.announceSolutionFraction(this._newtonSolver.getX());
            }
        }
    }
    /** Evaluate and save _functionB, _derivativeB, and _fractionB. */
    evaluateB(xyz, fraction, tangent) {
        this._functionB = this._plane.altitude(xyz);
        this._derivativeB = this._plane.velocity(tangent);
        this._fractionB = fraction;
    }
    /**
     * Announce point and tangent for evaluations.
     * * The function evaluation is saved as the "B" function point.
     * * The function point count is incremented
     * * If function point count is greater than 1, the current interval is searched.
     * * The just-evaluated point ("B") is saved as the "old" ("A") evaluation point.
     * @param xyz
     * @param fraction
     * @param tangent
     */
    announcePointTangent(xyz, fraction, tangent) {
        this.evaluateB(xyz, fraction, tangent);
        if (this._numThisCurve++ > 0)
            this.searchInterval();
        this._functionA = this._functionB;
        this._fractionA = this._fractionB;
        this._fractionA = this._fractionB;
    }
}
class CurveLengthContext {
    constructor(fraction0 = 0.0, fraction1 = 1.0, numGaussPoints = 5) {
        this.startCurvePrimitive(undefined);
        this._summedLength = 0.0;
        this._ray = Ray3d_1.Ray3d.createZero();
        if (fraction0 < fraction1) {
            this._fraction0 = fraction0;
            this._fraction1 = fraction1;
        }
        else {
            this._fraction0 = fraction1;
            this._fraction1 = fraction0;
        }
        this._gaussMapper = new Quadrature_1.GaussMapper(numGaussPoints);
    }
    tangentMagnitude(fraction) {
        this._ray = this._curve.fractionToPointAndDerivative(fraction, this._ray);
        return this._ray.direction.magnitude();
    }
    getSum() { return this._summedLength; }
    startCurvePrimitive(curve) {
        this._curve = curve;
    }
    startParentCurvePrimitive(_curve) { }
    endParentCurvePrimitive(_curve) { }
    endCurvePrimitive() { }
    announceIntervalForUniformStepStrokes(cp, numStrokes, fraction0, fraction1) {
        if (fraction0 < this._fraction0)
            fraction0 = this._fraction0;
        if (fraction1 > this._fraction1)
            fraction1 = this._fraction1;
        if (fraction1 > fraction0) {
            this.startCurvePrimitive(cp);
            if (numStrokes < 1)
                numStrokes = 1;
            const df = 1.0 / numStrokes;
            for (let i = 1; i <= numStrokes; i++) {
                const fractionA = Geometry_1.Geometry.interpolate(fraction0, (i - 1) * df, fraction1);
                const fractionB = i === numStrokes ? fraction1 : Geometry_1.Geometry.interpolate(fraction0, (i) * df, fraction1);
                const numGauss = this._gaussMapper.mapXAndW(fractionA, fractionB);
                for (let k = 0; k < numGauss; k++) {
                    this._summedLength += this._gaussMapper.gaussW[k] * this.tangentMagnitude(this._gaussMapper.gaussX[k]);
                }
            }
        }
    }
    announceSegmentInterval(_cp, point0, point1, _numStrokes, fraction0, fraction1) {
        const segmentLength = point0.distance(point1);
        if (this._fraction0 <= fraction0 && fraction1 <= this._fraction1)
            this._summedLength += segmentLength;
        else {
            let g0 = fraction0;
            let g1 = fraction1;
            if (g0 < this._fraction0)
                g0 = this._fraction0;
            if (g1 > this._fraction1)
                g1 = this._fraction1;
            if (g1 > g0) {
                this._summedLength += segmentLength * (g1 - g0) / (fraction1 - fraction0);
            }
        }
    }
    announcePointTangent(_xyz, _fraction, _tangent) {
        // uh oh -- need to retain point for next interval
    }
}
// context for searching for closest point .. .
class ClosestPointStrokeHandler extends NewtonRotRStrokeHandler {
    constructor(spacePoint, extend) {
        super();
        this._fractionA = 0;
        this._functionA = 0;
        this._functionB = 0;
        this._fractionB = 0;
        this._numThisCurve = 0;
        this._spacePoint = spacePoint;
        this._workPoint = Point3dVector3d_1.Point3d.create();
        this._workRay = Ray3d_1.Ray3d.createZero();
        this._closestPoint = undefined;
        this._extend = extend;
        this.startCurvePrimitive(undefined);
        this._newtonSolver = new Newton_1.Newton1dUnboundedApproximateDerivative(this);
    }
    claimResult() {
        if (this._closestPoint) {
            this._newtonSolver.setX(this._closestPoint.fraction);
            this._curve = this._closestPoint.curve;
            if (this._newtonSolver.runIterations()) {
                let fraction = this._newtonSolver.getX();
                fraction = CurveExtendMode_1.CurveExtendOptions.correctFraction(this._extend, fraction);
                this.announceSolutionFraction(fraction);
            }
        }
        return this._closestPoint;
    }
    startCurvePrimitive(curve) {
        this._curve = curve;
        this._fractionA = 0.0;
        this._numThisCurve = 0;
        this._functionA = 0.0;
    }
    endCurvePrimitive() { }
    announceIntervalForUniformStepStrokes(cp, numStrokes, fraction0, fraction1) {
        this.startCurvePrimitive(cp);
        if (numStrokes < 1)
            numStrokes = 1;
        const df = 1.0 / numStrokes;
        for (let i = 0; i <= numStrokes; i++) {
            const fraction = Geometry_1.Geometry.interpolate(fraction0, i * df, fraction1);
            cp.fractionToPointAndDerivative(fraction, this._workRay);
            this.announceRay(fraction, this._workRay);
        }
    }
    announceCandidate(cp, fraction, point) {
        const distance = this._spacePoint.distance(point);
        if (this._closestPoint && distance > this._closestPoint.a)
            return;
        this._closestPoint = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(cp, fraction, point, this._closestPoint);
        this._closestPoint.a = distance;
        if (this._parentCurvePrimitive !== undefined)
            this._closestPoint.curve = this._parentCurvePrimitive;
    }
    announceSegmentInterval(cp, point0, point1, _numStrokes, fraction0, fraction1) {
        let localFraction = this._spacePoint.fractionOfProjectionToLine(point0, point1, 0.0);
        // only consider extending the segment if the immediate caller says we are at endpoints ...
        if (!this._extend)
            localFraction = Geometry_1.Geometry.clampToStartEnd(localFraction, 0.0, 1.0);
        else {
            if (fraction0 !== 0.0)
                localFraction = Math.max(localFraction, 0.0);
            if (fraction1 !== 1.0)
                localFraction = Math.min(localFraction, 1.0);
        }
        this._workPoint = point0.interpolate(localFraction, point1);
        const globalFraction = Geometry_1.Geometry.interpolate(fraction0, localFraction, fraction1);
        this.announceCandidate(cp, globalFraction, this._workPoint);
    }
    searchInterval() {
        if (this._functionA * this._functionB > 0)
            return;
        if (this._functionA === 0)
            this.announceSolutionFraction(this._fractionA);
        if (this._functionB === 0)
            this.announceSolutionFraction(this._fractionB);
        if (this._functionA * this._functionB < 0) {
            const fraction = Geometry_1.Geometry.inverseInterpolate(this._fractionA, this._functionA, this._fractionB, this._functionB);
            if (fraction) {
                this._newtonSolver.setX(fraction);
                if (this._newtonSolver.runIterations())
                    this.announceSolutionFraction(this._newtonSolver.getX());
            }
        }
    }
    evaluateB(fractionB, dataB) {
        this._functionB = dataB.dotProductToPoint(this._spacePoint);
        this._fractionB = fractionB;
    }
    announceSolutionFraction(fraction) {
        if (this._curve)
            this.announceCandidate(this._curve, fraction, this._curve.fractionToPoint(fraction));
    }
    evaluate(fraction) {
        let curve = this._curve;
        if (this._parentCurvePrimitive)
            curve = this._parentCurvePrimitive;
        if (curve) {
            this._workRay = curve.fractionToPointAndDerivative(fraction, this._workRay);
            this.currentF = this._workRay.dotProductToPoint(this._spacePoint);
            return true;
        }
        return false;
    }
    announceRay(fraction, data) {
        this.evaluateB(fraction, data);
        if (this._numThisCurve++ > 0)
            this.searchInterval();
        this._functionA = this._functionB;
        this._fractionA = this._fractionB;
        this._fractionA = this._fractionB;
    }
    announcePointTangent(point, fraction, tangent) {
        this._workRay.set(point, tangent);
        this.announceRay(fraction, this._workRay);
    }
}
//# sourceMappingURL=CurvePrimitive.js.map