"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
/** @module Curve */
const Geometry_1 = require("../Geometry");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
const PointVector_1 = require("../PointVector");
const Range_1 = require("../Range");
const Transform_1 = require("../Transform");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const Newton_1 = require("../numerics/Newton");
const Quadrature_1 = require("../numerics/Quadrature");
/**
 * An enumeration of special conditions being described by a CurveLocationDetail.
 */
var CurveIntervalRole;
(function (CurveIntervalRole) {
    /** This point is an isolated point NOT at a primary vertex. */
    CurveIntervalRole[CurveIntervalRole["isolated"] = 0] = "isolated";
    /**  This point is an isolated vertex hit */
    CurveIntervalRole[CurveIntervalRole["isolatedAtVertex"] = 1] = "isolatedAtVertex";
    /** This is the beginning of an interval */
    CurveIntervalRole[CurveIntervalRole["intervalStart"] = 10] = "intervalStart";
    /** This is an interior point of an interval. */
    CurveIntervalRole[CurveIntervalRole["intervalInterior"] = 11] = "intervalInterior";
    /** This is the end of an interval */
    CurveIntervalRole[CurveIntervalRole["intervalEnd"] = 12] = "intervalEnd";
})(CurveIntervalRole = exports.CurveIntervalRole || (exports.CurveIntervalRole = {}));
/**
 * CurveLocationDetail carries point and paramter data about a point evaluated on a curve.
 */
class CurveLocationDetail {
    constructor() {
        this.pointQ = PointVector_1.Point3d.createZero();
        this.fraction = 0;
        this.point = PointVector_1.Point3d.createZero();
        this.vector = PointVector_1.Vector3d.unitX();
        this.a = 0.0;
    }
    /** Set the (optional) intervalRole field */
    setIntervalRole(value) {
        this.intervalRole = value;
    }
    /** test if this is an isolated point. This is true if intervalRole is any of (undefined, isolated, isolatedAtVertex) */
    isIsolated() {
        return this.intervalRole === undefined
            || this.intervalRole === CurveIntervalRole.isolated
            || this.intervalRole === CurveIntervalRole.isolatedAtVertex;
    }
    /** @returns Return a complete copy */
    clone(result) {
        if (result === this)
            return result;
        result = result ? result : new CurveLocationDetail();
        result.curve = this.curve;
        result.fraction = this.fraction;
        result.point = this.point;
        result.vector = this.vector;
        result.a = this.a;
        return result;
    }
    // Set the fraction, point, with optional vector and number.
    // (curve is unchanged)
    setFP(fraction, point, vector, a) {
        this.fraction = fraction;
        this.point.setFrom(point);
        if (vector)
            this.vector.setFrom(vector);
        else
            this.vector.set(0, 0, 0);
        this.a = a ? a : 0;
    }
    // Set the fraction, point, and vector
    setFR(fraction, ray, a) {
        this.fraction = fraction;
        this.point.setFrom(ray.origin);
        this.vector.setFrom(ray.direction);
        this.a = a ? a : 0;
    }
    /** Set the CurvePrimitive pointer, leaving all other properties untouched.
     */
    setCurve(curve) { this.curve = curve; }
    /** record the distance from the CurveLocationDetail's point to the parameter point. */
    setDistanceTo(point) {
        this.a = this.point.distance(point);
    }
    /** create with a CurvePrimitive pointer but no coordinate data.
     */
    static create(curve, result) {
        result = result ? result : new CurveLocationDetail();
        result.curve = curve;
        return result;
    }
    /** create with CurvePrimitive pointer, fraction, and point coordinates.
     */
    static createCurveFractionPoint(curve, fraction, point, result) {
        result = result ? result : new CurveLocationDetail();
        result.curve = curve;
        result.fraction = fraction;
        result.point = point.clone();
        result.vector.set(0, 0, 0);
        result.a = 0.0;
        return result;
    }
}
exports.CurveLocationDetail = CurveLocationDetail;
/** A pair of CurveLocationDetail. */
class CurveLocationDetailPair {
    constructor() {
        this.detailA = new CurveLocationDetail();
        this.detailB = new CurveLocationDetail();
    }
    /** Create a curve detail pair using references to two CurveLocationDetails */
    static createDetailRef(detailA, detailB, result) {
        result = result ? result : new CurveLocationDetailPair();
        result.detailA = detailA;
        result.detailB = detailB;
        return result;
    }
    /** Make a deep copy of this CurveLocationDetailPair */
    clone(result) {
        result = result ? result : new CurveLocationDetailPair();
        result.detailA = this.detailA.clone();
        result.detailB = this.detailB.clone();
        return result;
    }
}
exports.CurveLocationDetailPair = CurveLocationDetailPair;
/** Queries to be supported by Curve, Surface, and Solid objects */
class GeometryQuery {
    /** return the range of the entire (tree) GeometryQuery */
    range(transform, result) {
        if (result)
            result.setNull();
        const range = result ? result : Range_1.Range3d.createNull();
        this.extendRange(range, transform);
        return range;
    }
    /** try to move the geometry by dx,dy,dz */
    tryTranslateInPlace(dx, dy = 0.0, dz = 0.0) {
        return this.tryTransformInPlace(Transform_1.Transform.createTranslationXYZ(dx, dy, dz));
    }
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    get children() { return undefined; }
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other) {
        if (this.isSameGeometryClass(other)) {
            const childrenA = this.children;
            const childrenB = other.children;
            if (childrenA && childrenB) {
                if (childrenA.length !== childrenB.length)
                    return false;
                for (let i = 0; i < childrenA.length; i++) {
                    if (!childrenA[i].isAlmostEqual(childrenB[i]))
                        return false;
                }
                return true;
            }
            else if (childrenA || childrenB) {
                return false; // plainly different .
            }
            else {
                // both children null. call it equal?   This class should probably have implemented.
                return true;
            }
        }
        return false;
    }
}
exports.GeometryQuery = GeometryQuery;
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
 */
class CurvePrimitive extends GeometryQuery {
    constructor() { super(); }
    /**
     *
     * @param fraction fractional position on the curve
     * @param result optional receiver for the result.
     * @returns Returns a ray whose origin is the curve point and direction is the unit tangent.
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
        let axes = Transform_1.RotMatrix.createRigidFromColumns(plane.vectorU, plane.vectorV, 0 /* XYZ */);
        if (axes)
            return Transform_1.Transform.createRefs(plane.origin, axes, result);
        // 2nd derivative not distinct -- do arbitrary headsup ...
        const perpVector = Transform_1.RotMatrix.createRigidHeadsUpFavorXYPlane(plane.vectorU, plane.vectorV);
        axes = Transform_1.RotMatrix.createRigidFromColumns(plane.vectorU, perpVector, 0 /* XYZ */);
        if (axes)
            return Transform_1.Transform.createRefs(plane.origin, axes, result);
        return undefined;
    }
    /**
     *
     * * Curve length is always positive.
     * @returns Returns a (high accuracy) length of the curve.
     * @returns Returns the length of the curve.
     */
    curveLength() {
        const context = new CurveLengthContext();
        this.emitStrokableParts(context);
        return context.getSum();
    }
    /** Search for the curve point that is closest to the spacePoint.
     *
     * * If the space point is exactly on the curve, this is the reverse of fractionToPoint.
     * * Since CurvePrimitive should always have start and end available as candidate points, this method should always succeed
     * @param spacePoint point in space
     * @param extend true to extend the curve (if possible)
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
     * Compute intersections with a plane.
     * The intersections are appended to the result array.
     * The base class implementation emits strokes to an AppendPlaneIntersectionStrokeHandler object, which uses a Newton iteration to get
     * high-accuracy intersection points within strokes.
     * Derived classes should override this default implementation if there are easy analytic solutions.
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
    /** return the start point of the primitive.  The default implementation returns fractionToPoint (0.0) */
    startPoint(result) { return this.fractionToPoint(0.0, result); }
    /** @returns return the end point of the primitive. The default implementation returns fractionToPoint(1.0) */
    endPoint(result) { return this.fractionToPoint(1.0, result); }
}
exports.CurvePrimitive = CurvePrimitive;
/** Intermediate class for managing the parentCurve announcements from an IStrokeHandler */
class NewtonRotRStrokeHandler extends Newton_1.NewtonEvaluatorRtoR {
    constructor() {
        super();
        this.parentCurvePrimitive = undefined;
    }
    /** retain the parentCurvePrimitive */
    startParentCurvePrimitive(curve) { this.parentCurvePrimitive = curve; }
    /** Forget the parentCurvePrimitive */
    endParentCurvePrimitive(_curve) { this.parentCurvePrimitive = undefined; }
}
class AppendPlaneIntersectionStrokeHandler extends NewtonRotRStrokeHandler {
    constructor(plane, intersections) {
        super();
        this.fractionA = 0;
        this.functionA = 0;
        // private derivativeA: number;   <---- Not currently used
        this.functionB = 0;
        this.fractionB = 0;
        this.derivativeB = 0;
        this.numThisCurve = 0;
        this.plane = plane;
        this.intersections = intersections;
        this.startCurvePrimitive(undefined);
        this.ray = AnalyticGeometry_1.Ray3d.createZero();
        this.newtonSolver = new Newton_1.Newton1dUnboundedApproximateDerivative(this);
    }
    // Return the first defined curve among: this.parentCurvePrimitive, this.curve;
    effectiveCurve() {
        if (this.parentCurvePrimitive)
            return this.parentCurvePrimitive;
        return this.curve;
    }
    get getDerivativeB() { return this.derivativeB; } // <--- DerivativeB is not currently used anywhere. Provided getter to suppress tslint error
    startCurvePrimitive(curve) {
        this.curve = curve;
        this.fractionA = 0.0;
        this.numThisCurve = 0;
        this.functionA = 0.0;
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
            cp.fractionToPointAndDerivative(fraction, this.ray);
            this.announcePointTangent(this.ray.origin, fraction, this.ray.direction);
        }
    }
    announceSegmentInterval(_cp, point0, point1, _numStrokes, fraction0, fraction1) {
        const h0 = this.plane.altitude(point0);
        const h1 = this.plane.altitude(point1);
        if (h0 * h1 > 0.0)
            return;
        const fraction01 = BezierPolynomials_1.Order2Bezier.solveCoffs(h0, h1);
        // let numIntersection = 0;
        if (fraction01 !== undefined) {
            // numIntersection++;
            const fraction = Geometry_1.Geometry.interpolate(fraction0, fraction01, fraction1);
            this.newtonSolver.setX(fraction);
            if (this.newtonSolver.runIterations()) {
                this.announceSolutionFraction(this.newtonSolver.getX());
            }
            // this.intersections.push(CurveLocationDetail.createCurveFractionPoint(cp, fraction, cp.fractionToPoint(fraction)));
        }
    }
    announceSolutionFraction(fraction) {
        if (this.curve) {
            this.ray = this.curve.fractionToPointAndDerivative(fraction, this.ray);
            this.intersections.push(CurveLocationDetail.createCurveFractionPoint(this.curve, fraction, this.ray.origin));
        }
    }
    evaluate(fraction) {
        const curve = this.effectiveCurve();
        if (!curve)
            return false;
        this.currentF = this.plane.altitude(curve.fractionToPoint(fraction));
        return true;
    }
    searchInterval() {
        if (this.functionA * this.functionB > 0)
            return;
        if (this.functionA === 0)
            this.announceSolutionFraction(this.fractionA);
        if (this.functionB === 0)
            this.announceSolutionFraction(this.fractionB);
        if (this.functionA * this.functionB > 0) {
            const fraction = Geometry_1.Geometry.inverseInterpolate(this.fractionA, this.functionA, this.fractionB, this.functionB);
            if (fraction) {
                this.newtonSolver.setX(fraction);
                if (this.newtonSolver.runIterations())
                    this.announceSolutionFraction(this.newtonSolver.getX());
            }
        }
    }
    evaluateB(xyz, fraction, tangent) {
        this.functionB = this.plane.altitude(xyz);
        this.derivativeB = this.plane.velocity(tangent);
        this.fractionB = fraction;
    }
    announcePointTangent(xyz, fraction, tangent) {
        this.evaluateB(xyz, fraction, tangent);
        if (this.numThisCurve++ > 0)
            this.searchInterval();
        this.functionA = this.functionB;
        this.fractionA = this.fractionB;
        this.fractionA = this.fractionB;
    }
}
class CurveLengthContext {
    tangentMagnitude(fraction) {
        this.ray = this.curve.fractionToPointAndDerivative(fraction, this.ray);
        return this.ray.direction.magnitude();
    }
    getSum() { return this.summedLength; }
    constructor() {
        this.startCurvePrimitive(undefined);
        this.summedLength = 0.0;
        this.ray = AnalyticGeometry_1.Ray3d.createZero();
        const maxGauss = 7;
        this.gaussX = new Float64Array(maxGauss);
        this.gaussW = new Float64Array(maxGauss);
        this.gaussMapper = Quadrature_1.Quadrature.setupGauss5;
    }
    startCurvePrimitive(curve) {
        this.curve = curve;
    }
    startParentCurvePrimitive(_curve) { }
    endParentCurvePrimitive(_curve) { }
    endCurvePrimitive() { }
    announceIntervalForUniformStepStrokes(cp, numStrokes, fraction0, fraction1) {
        this.startCurvePrimitive(cp);
        if (numStrokes < 1)
            numStrokes = 1;
        const df = 1.0 / numStrokes;
        for (let i = 1; i <= numStrokes; i++) {
            const fractionA = Geometry_1.Geometry.interpolate(fraction0, (i - 1) * df, fraction1);
            const fractionB = i === numStrokes ? fraction1 : Geometry_1.Geometry.interpolate(fraction0, (i) * df, fraction1);
            const numGauss = this.gaussMapper(fractionA, fractionB, this.gaussX, this.gaussW);
            for (let k = 0; k < numGauss; k++) {
                this.summedLength += this.gaussW[k] * this.tangentMagnitude(this.gaussX[k]);
            }
        }
    }
    announceSegmentInterval(_cp, point0, point1, _numStrokes, _fraction0, _fraction1) {
        this.summedLength += point0.distance(point1);
    }
    announcePointTangent(_xyz, _fraction, _tangent) {
        // uh oh -- need to retain point for next interval
    }
}
// context for searching for closest point .. .
class ClosestPointStrokeHandler extends NewtonRotRStrokeHandler {
    constructor(spacePoint, extend) {
        super();
        this.fractionA = 0;
        this.functionA = 0;
        this.functionB = 0;
        this.fractionB = 0;
        this.numThisCurve = 0;
        this.spacePoint = spacePoint;
        this.workPoint = PointVector_1.Point3d.create();
        this.workRay = AnalyticGeometry_1.Ray3d.createZero();
        this.closestPoint = undefined;
        this.extend = extend;
        this.startCurvePrimitive(undefined);
        this.newtonSolver = new Newton_1.Newton1dUnboundedApproximateDerivative(this);
    }
    claimResult() {
        if (this.closestPoint) {
            this.newtonSolver.setX(this.closestPoint.fraction);
            this.curve = this.closestPoint.curve;
            if (this.newtonSolver.runIterations())
                this.announceSolutionFraction(this.newtonSolver.getX());
        }
        return this.closestPoint;
    }
    startCurvePrimitive(curve) {
        this.curve = curve;
        this.fractionA = 0.0;
        this.numThisCurve = 0;
        this.functionA = 0.0;
    }
    endCurvePrimitive() { }
    announceIntervalForUniformStepStrokes(cp, numStrokes, fraction0, fraction1) {
        this.startCurvePrimitive(cp);
        if (numStrokes < 1)
            numStrokes = 1;
        const df = 1.0 / numStrokes;
        for (let i = 0; i <= numStrokes; i++) {
            const fraction = Geometry_1.Geometry.interpolate(fraction0, i * df, fraction1);
            cp.fractionToPointAndDerivative(fraction, this.workRay);
            this.announceRay(fraction, this.workRay);
        }
    }
    announceCandidate(cp, fraction, point) {
        const distance = this.spacePoint.distance(point);
        if (this.closestPoint && distance > this.closestPoint.a)
            return;
        this.closestPoint = CurveLocationDetail.createCurveFractionPoint(cp, fraction, point, this.closestPoint);
        this.closestPoint.a = distance;
        if (this.parentCurvePrimitive !== undefined)
            this.closestPoint.curve = this.parentCurvePrimitive;
    }
    announceSegmentInterval(cp, point0, point1, _numStrokes, fraction0, fraction1) {
        let localFraction = this.spacePoint.fractionOfProjectionToLine(point0, point1, 0.0);
        // only consider extending the segment if the immediate caller says we are at endpoints ...
        if (!this.extend)
            localFraction = Geometry_1.Geometry.clampToStartEnd(localFraction, 0.0, 1.0);
        else {
            if (fraction0 !== 0.0)
                localFraction = Math.max(localFraction, 0.0);
            if (fraction1 !== 1.0)
                localFraction = Math.min(localFraction, 1.0);
        }
        this.workPoint = point0.interpolate(localFraction, point1);
        const globalFraction = Geometry_1.Geometry.interpolate(fraction0, localFraction, fraction1);
        this.announceCandidate(cp, globalFraction, this.workPoint);
    }
    searchInterval() {
        if (this.functionA * this.functionB > 0)
            return;
        if (this.functionA === 0)
            this.announceSolutionFraction(this.fractionA);
        if (this.functionB === 0)
            this.announceSolutionFraction(this.fractionB);
        if (this.functionA * this.functionB < 0) {
            const fraction = Geometry_1.Geometry.inverseInterpolate(this.fractionA, this.functionA, this.fractionB, this.functionB);
            if (fraction) {
                this.newtonSolver.setX(fraction);
                if (this.newtonSolver.runIterations())
                    this.announceSolutionFraction(this.newtonSolver.getX());
            }
        }
    }
    evaluateB(fractionB, dataB) {
        this.functionB = dataB.dotProductToPoint(this.spacePoint);
        this.fractionB = fractionB;
    }
    announceSolutionFraction(fraction) {
        if (this.curve)
            this.announceCandidate(this.curve, fraction, this.curve.fractionToPoint(fraction));
    }
    evaluate(fraction) {
        let curve = this.curve;
        if (this.parentCurvePrimitive)
            curve = this.parentCurvePrimitive;
        if (curve) {
            this.workRay = curve.fractionToPointAndDerivative(fraction, this.workRay);
            this.currentF = this.workRay.dotProductToPoint(this.spacePoint);
            return true;
        }
        return false;
    }
    announceRay(fraction, data) {
        this.evaluateB(fraction, data);
        if (this.numThisCurve++ > 0)
            this.searchInterval();
        this.functionA = this.functionB;
        this.fractionA = this.fractionB;
        this.fractionA = this.fractionB;
    }
    announcePointTangent(point, fraction, tangent) {
        this.workRay.set(point, tangent);
        this.announceRay(fraction, this.workRay);
    }
}
/** A Coordinate is a persistable Point3d */
class CoordinateXYZ extends GeometryQuery {
    get point() { return this.xyz; }
    /**
     * @param xyz point to be CAPTURED.
     */
    constructor(xyz) {
        super();
        this.xyz = xyz;
    }
    static create(point) {
        return new CoordinateXYZ(point.clone());
    }
    /** return the range of the point */
    range() { return Range_1.Range3d.create(this.xyz); }
    extendRange(rangeToExtend, transform) {
        if (transform)
            rangeToExtend.extendTransformedXYZ(transform, this.xyz.x, this.xyz.y, this.xyz.z);
        else
            rangeToExtend.extend(this.xyz);
    }
    /** Apply transform to the Coordinate's point. */
    tryTransformInPlace(transform) {
        transform.multiplyPoint3d(this.xyz, this.xyz);
        return true;
    }
    /** return a transformed clone.
     */
    cloneTransformed(transform) {
        const result = new CoordinateXYZ(this.xyz.clone());
        result.tryTransformInPlace(transform);
        return result;
    }
    /** return a clone */
    clone() {
        return new CoordinateXYZ(this.xyz.clone());
    }
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    /** test if (other instanceof Coordinate).  */
    isSameGeometryClass(other) {
        return other instanceof CoordinateXYZ;
    }
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other) {
        return (other instanceof CoordinateXYZ) && this.xyz.isAlmostEqual(other.xyz);
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleCoordinateXYZ(this);
    }
}
exports.CoordinateXYZ = CoordinateXYZ;
//# sourceMappingURL=CurvePrimitive.js.map