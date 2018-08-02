"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Geometry_1 = require("../Geometry");
const Polynomials_1 = require("../numerics/Polynomials");
const PointVector_1 = require("../PointVector");
const Transform_1 = require("../Transform");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const CurvePrimitive_1 = require("./CurvePrimitive");
const StrokeOptions_1 = require("../curve/StrokeOptions");
const LineString3d_1 = require("./LineString3d");
/* tslint:disable:variable-name no-empty*/
/**
 * Circular or elliptic arc.
 *
 * * The angle to point equation is:
 *
 * **  `X = center + cos(theta) * vector0 + sin(theta) * vector90`
 * * When the two vectors are perpendicular and have equal length, it is a true circle.
 * * Non-perpendicular vectors are always elliptic.
 * *  vectors of unequal length are always elliptic.
 * * To create an ellipse in the common "major and minor axis" form of an ellipse:
 *
 * ** vector0 is the vector from the center to the major axis extreme.
 * ** vector90 is the vector from the center to the minor axis extreme.
 * ** note the constructing the vectors to the extreme points makes them perpendicular.
 * *  The method toScaledRotMatrix () can be called to convert the unrestricted vector0,vector90 to perpendicular form.
 * * The unrestricted form is much easier to work with for common calculations -- stroking, projection to 2d, intersection with plane.
 */
class Arc3d extends CurvePrimitive_1.CurvePrimitive {
    isSameGeometryClass(other) { return other instanceof Arc3d; }
    get center() { return this._center; }
    get vector0() { return this._matrix.columnX(); }
    get vector90() { return this._matrix.columnY(); }
    get matrix() { return this._matrix; }
    get sweep() { return this._sweep; }
    // constructor copies the pointers !!!
    constructor(center, matrix, sweep) {
        super();
        this._center = center;
        this._matrix = matrix;
        this._sweep = sweep;
    }
    cloneTransformed(transform) {
        const c = this.clone();
        c.tryTransformInPlace(transform);
        return c;
    }
    setRefs(center, matrix, sweep) {
        this._center = center;
        this._matrix = matrix;
        this._sweep = sweep;
    }
    set(center, matrix, sweep) {
        this.setRefs(center.clone(), matrix.clone(), sweep ? sweep.clone() : Geometry_1.AngleSweep.create360());
    }
    setFrom(other) {
        this._center.setFrom(other._center);
        this._matrix.setFrom(other._matrix);
        this._sweep.setFrom(other._sweep);
    }
    clone() {
        return new Arc3d(this._center.clone(), this._matrix.clone(), this._sweep.clone());
    }
    static createRefs(center, matrix, sweep, result) {
        if (result) {
            result.setRefs(center, matrix, sweep);
            return result;
        }
        return new Arc3d(center, matrix, sweep);
    }
    static createScaledXYColumns(center, matrix, radius0, radius90, sweep, result) {
        const vector0 = matrix.columnX();
        const vector90 = matrix.columnY();
        return Arc3d.create(center, vector0.scale(radius0, vector0), vector90.scale(radius90, vector90), sweep, result);
    }
    static create(center, vector0, vector90, sweep, result) {
        const normal = vector0.unitCrossProductWithDefault(vector90, 0, 0, 0); // normal will be 000 for degenerate case ! !!
        const matrix = Transform_1.RotMatrix.createColumns(vector0, vector90, normal);
        if (result) {
            result.setRefs(center.clone(), matrix, sweep ? sweep.clone() : Geometry_1.AngleSweep.create360());
            return result;
        }
        return new Arc3d(center.clone(), matrix, sweep ? sweep.clone() : Geometry_1.AngleSweep.create360());
    }
    /** Create a circular arc defined by start point, any intermediate point, and end point.
     * If the points are colinear, assemble them into a linestring.
     */
    static createCircularStartMiddleEnd(pointA, pointB, pointC, result) {
        const vectorAB = PointVector_1.Vector3d.createStartEnd(pointA, pointB);
        const vectorAC = PointVector_1.Vector3d.createStartEnd(pointA, pointC);
        const ab = vectorAB.magnitude();
        const bc = vectorAC.magnitude();
        const normal = vectorAB.sizedCrossProduct(vectorAC, Math.sqrt(ab * bc));
        const vectorToCenter = Polynomials_1.SmallSystem.linearSystem3d(normal.x, normal.y, normal.z, vectorAB.x, vectorAB.y, vectorAB.z, vectorAC.x, vectorAC.y, vectorAC.z, 0, // vectorToCenter DOT normal = 0
        0.5 * ab * ab, // vectorToCenter DOT vectorBA = 0.5 * vectorBA DOT vectorBA  (Rayleigh quotient)
        0.5 * bc * bc); // vectorToCenter DOT vectorBC = 0.5 * vectorBC DOT vectorBC  (Rayleigh quotient)
        if (vectorToCenter) {
            const center = PointVector_1.Point3d.create(pointA.x, pointA.y, pointA.z).plus(vectorToCenter);
            const vectorX = PointVector_1.Vector3d.createStartEnd(center, pointA);
            const vectorY = PointVector_1.Vector3d.createRotateVectorAroundVector(vectorX, normal);
            if (vectorY) {
                const vectorCenterToC = PointVector_1.Vector3d.createStartEnd(center, pointC);
                const sweepAngle = vectorX.signedAngleTo(vectorCenterToC, normal);
                return Arc3d.create(center, vectorX, vectorY, Geometry_1.AngleSweep.createStartEndRadians(0.0, sweepAngle.radians), result);
            }
        }
        return LineString3d_1.LineString3d.create(pointA, pointB, pointC);
    }
    fractionToPoint(fraction, result) {
        const radians = this._sweep.fractionToRadians(fraction);
        return this._matrix.originPlusMatrixTimesXY(this._center, Math.cos(radians), Math.sin(radians), result);
    }
    fractionToPointAndDerivative(fraction, result) {
        result = this.radiansToPointAndDerivative(this._sweep.fractionToRadians(fraction), result);
        result.direction.scaleInPlace(this._sweep.sweepRadians);
        return result;
    }
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction, result) {
        const radians = this._sweep.fractionToRadians(fraction);
        if (!result)
            result = AnalyticGeometry_1.Plane3dByOriginAndVectors.createXYPlane();
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        this._matrix.originPlusMatrixTimesXY(this._center, c, s, result.origin);
        const a = this._sweep.sweepRadians;
        this._matrix.multiplyXY(-a * s, a * c, result.vectorU);
        const aa = a * a;
        this._matrix.multiplyXY(-aa * c, -aa * s, result.vectorV);
        return result;
    }
    radiansToPointAndDerivative(radians, result) {
        result = result ? result : AnalyticGeometry_1.Ray3d.createZero();
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        this._matrix.originPlusMatrixTimesXY(this._center, c, s, result.origin);
        this._matrix.multiplyXY(-s, c, result.direction);
        return result;
    }
    angleToPointAndDerivative(theta, result) {
        result = result ? result : AnalyticGeometry_1.Ray3d.createZero();
        const c = theta.cos();
        const s = theta.sin();
        this._matrix.originPlusMatrixTimesXY(this._center, c, s, result.origin);
        this._matrix.multiplyXY(-s, c, result.direction);
        return result;
    }
    startPoint(result) { return this.fractionToPoint(0.0, result); }
    endPoint(result) { return this.fractionToPoint(1.0, result); }
    curveLength() {
        const r = this.circularRadius();
        if (r !== undefined) {
            return Math.abs(this._sweep.sweepRadians * r);
        }
        // fall through for true ellipse . .. stroke and accumulate quadrature ...
        return super.curveLength();
    }
    quickLength() { return this._sweep.sweepRadians * Math.sqrt(this._matrix.columnXMagnitude() * this._matrix.columnYMagnitude()); }
    allPerpendicularAngles(spacePoint, _extend = false, _endpoints = false) {
        const radians = [];
        const vectorQ = spacePoint.vectorTo(this.center);
        const uu = this.matrix.columnXMagnitudeSquared();
        const uv = this._matrix.columnXDotColumnY();
        const vv = this._matrix.columnYMagnitudeSquared();
        Polynomials_1.TrigPolynomial.SolveUnitCircleImplicitQuadricIntersection(uv, vv - uu, -uv, this.matrix.dotColumnY(vectorQ), -this.matrix.dotColumnX(vectorQ), 0.0, radians);
        return radians;
    }
    closestPoint(spacePoint, extend, result) {
        result = CurvePrimitive_1.CurveLocationDetail.create(this, result);
        const allRadians = this.allPerpendicularAngles(spacePoint);
        if (!extend && !this._sweep.isFullCircle()) {
            allRadians.push(this._sweep.startRadians);
            allRadians.push(this._sweep.endRadians);
        }
        // hm... logically there must at least two angles there ...  but if it happens return the start point ...
        const workRay = AnalyticGeometry_1.Ray3d.createZero();
        if (allRadians.length === 0) {
            result.setFR(0.0, this.radiansToPointAndDerivative(this._sweep.startRadians, workRay));
            result.a = spacePoint.distance(result.point);
        }
        else {
            let dMin = Number.MAX_VALUE;
            let d = 0;
            for (const radians of allRadians) {
                if (extend || this._sweep.isRadiansInSweep(radians)) {
                    this.radiansToPointAndDerivative(radians, workRay);
                    d = spacePoint.distance(workRay.origin);
                    if (d < dMin) {
                        dMin = d;
                        result.setFR(this._sweep.radiansToSignedPeriodicFraction(radians), workRay);
                        result.a = d;
                    }
                }
            }
        }
        return result;
    }
    reverseInPlace() { this._sweep.reverseInPlace(); }
    tryTransformInPlace(transform) {
        this._center = transform.multiplyPoint3d(this._center, this._center);
        this._matrix = transform.matrix.multiplyMatrixMatrix(this._matrix, this._matrix);
        // force re-normalization of columnZ.
        this.setVector0Vector90(this._matrix.columnX(), this._matrix.columnY());
        return true;
    }
    isInPlane(plane) {
        const normal = plane.getNormalRef();
        // The ellipse vectors are full-length  -- true distance comparisons say things.
        return Geometry_1.Geometry.isSmallMetricDistance(plane.altitude(this._center))
            && Geometry_1.Geometry.isSmallMetricDistance(this._matrix.dotColumnX(normal))
            && Geometry_1.Geometry.isSmallMetricDistance(this._matrix.dotColumnY(normal));
    }
    isCircular() {
        const axx = this._matrix.columnXMagnitudeSquared();
        const ayy = this._matrix.columnYMagnitudeSquared();
        const axy = this._matrix.columnXDotColumnY();
        return Geometry_1.Angle.isPerpendicularDotSet(axx, ayy, axy) && Geometry_1.Geometry.isSameCoordinateSquared(axx, ayy);
    }
    /** If the arc is circular, return its radius.  Otherwise return undefined */
    circularRadius() {
        return this.isCircular() ? this._matrix.columnXMagnitude() : undefined;
    }
    /** Return the larger of the two defining vectors. */
    maxVectorLength() { return Math.max(this._matrix.columnXMagnitude(), this._matrix.columnYMagnitude()); }
    appendPlaneIntersectionPoints(plane, result) {
        const normal = plane.getNormalRef();
        const constCoff = normal.dotProductStartEnd(plane.getOriginRef(), this._center);
        const cosCoff = this._matrix.dotColumnX(normal);
        const sinCoff = this._matrix.dotColumnY(normal);
        const trigPoints = Geometry_1.Geometry.solveTrigForm(constCoff, cosCoff, sinCoff);
        let numIntersection = 0;
        if (trigPoints !== undefined) {
            numIntersection = trigPoints.length;
            let xy;
            for (xy of trigPoints) {
                const radians = Math.atan2(xy.y, xy.x);
                const fraction = this._sweep.radiansToPositivePeriodicFraction(radians);
                result.push(CurvePrimitive_1.CurveLocationDetail.createCurveFractionPoint(this, fraction, this.fractionToPoint(fraction)));
            }
        }
        return numIntersection;
    }
    extendRange(range) {
        const df = 1.0 / 32;
        // KLUDGE --- evaluate lots of points ...
        let point = PointVector_1.Point3d.create();
        for (let fraction = 0; fraction <= 1.001; fraction += df) {
            point = this.fractionToPoint(fraction, point);
            range.extendPoint(point);
        }
    }
    static createUnitCircle() {
        return Arc3d.createRefs(PointVector_1.Point3d.create(0, 0, 0), Transform_1.RotMatrix.createIdentity(), Geometry_1.AngleSweep.create360());
    }
    /**
     * @param center center of arc
     * @param radius radius of arc
     * @param sweep sweep limits.  defaults to full circle.
     */
    static createXY(center, radius, sweep = Geometry_1.AngleSweep.create360()) {
        return new Arc3d(center.clone(), Transform_1.RotMatrix.createScale(radius, radius, 1.0), sweep);
    }
    static createXYEllipse(center, radiusA, radiusB, sweep = Geometry_1.AngleSweep.create360()) {
        return new Arc3d(center.clone(), Transform_1.RotMatrix.createScale(radiusA, radiusB, 1.0), sweep);
    }
    setVector0Vector90(vector0, vector90) {
        this._matrix.setColumns(vector0, vector90, vector0.unitCrossProductWithDefault(vector90, 0, 0, 0));
    }
    toScaledRotMatrix() {
        const angleData = Geometry_1.Angle.dotProductsToHalfAngleTrigValues(this._matrix.columnXMagnitudeSquared(), this._matrix.columnYMagnitudeSquared(), this._matrix.columnXDotColumnY(), true);
        const vector0A = this._matrix.multiplyXY(angleData.c, angleData.s);
        const vector90A = this._matrix.multiplyXY(-angleData.s, angleData.c);
        const axes = Transform_1.RotMatrix.createRigidFromColumns(vector0A, vector90A, 0 /* XYZ */);
        return {
            axes: (axes ? axes : Transform_1.RotMatrix.createIdentity()),
            center: this._center,
            r0: vector0A.magnitude(),
            r90: vector90A.magnitude(),
            sweep: this.sweep.cloneMinusRadians(angleData.radians),
        };
    }
    /** Return the arc definition with center, two vectors, and angle sweep;
     * The center and AngleSweep are references to inside the Arc3d.
     */
    toVectors() {
        return {
            center: this.center,
            vector0: this.matrix.columnX(),
            vector90: this.matrix.columnY(),
            sweep: this.sweep,
        };
    }
    setFromJSON(json) {
        if (json && json.center && json.vector0 && json.vector90 && json.sweep) {
            this._center.setFromJSON(json.center);
            const vector0 = PointVector_1.Vector3d.create();
            const vector90 = PointVector_1.Vector3d.create();
            vector0.setFromJSON(json.vector0);
            vector90.setFromJSON(json.vector90);
            this.setVector0Vector90(vector0, vector90);
            this._sweep.setFromJSON(json.sweep);
        }
        else {
            this._center.set(0, 0, 0);
            this._matrix.setFrom(Transform_1.RotMatrix.identity);
            this._sweep.setStartEndRadians();
        }
    }
    /**
     * Convert to a JSON object.
     * @return {*} [center:  [], vector0:[], vector90:[], sweep []}
     */
    toJSON() {
        return {
            center: this._center.toJSON(),
            sweep: this._sweep.toJSON(),
            vector0: this._matrix.columnX().toJSON(),
            vector90: this._matrix.columnY().toJSON(),
        };
    }
    isAlmostEqual(otherGeometry) {
        if (otherGeometry instanceof Arc3d) {
            const other = otherGeometry;
            return this._center.isAlmostEqual(other._center)
                && this._matrix.isAlmostEqual(other._matrix)
                && this._sweep.isAlmostEqualAllowPeriodShift(other._sweep);
        }
        return false;
    }
    /** Emit strokes to caller-supplied linestring */
    emitStrokes(dest, options) {
        let numStrokes = 1;
        if (options) {
            const rMax = this.maxVectorLength();
            numStrokes = options.applyTolerancesToArc(rMax, this._sweep.sweepRadians);
        }
        else {
            numStrokes = StrokeOptions_1.StrokeOptions.applyAngleTol(undefined, 1, this._sweep.sweepRadians);
        }
        dest.appendFractionalStrokePoints(this, numStrokes, 0.0, 1.0, true);
    }
    /** Emit strokes to caller-supplied handler */
    emitStrokableParts(handler, options) {
        let numStrokes = 1;
        if (options) {
            const rMax = this.maxVectorLength();
            numStrokes = options.applyTolerancesToArc(rMax, this._sweep.sweepRadians);
        }
        else {
            numStrokes = StrokeOptions_1.StrokeOptions.applyAngleTol(undefined, 1, this._sweep.sweepRadians);
        }
        handler.startCurvePrimitive(this);
        handler.announceIntervalForUniformStepStrokes(this, numStrokes, 0.0, 1.0);
        handler.endCurvePrimitive(this);
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleArc3d(this);
    }
    /** Return (if possible) an arc which is a portion of this curve.
     * @param fractionA [in] start fraction
     * @param fractionB [in] end fraction
     */
    clonePartialCurve(fractionA, fractionB) {
        if (fractionB < fractionA) {
            const arcA = this.clonePartialCurve(fractionB, fractionA);
            if (arcA)
                arcA.reverseInPlace();
            return arcA;
        }
        const arcB = this.clone();
        arcB.sweep.setStartEndRadians(this.sweep.fractionToRadians(fractionA), this.sweep.fractionToRadians(fractionB));
        return arcB;
    }
    /**
     * Find intervals of this curveprimitve that are interior to a clipper
     * @param clipper clip structure (e.g.clip planes)
     * @param announce(optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(clipper, announce) {
        return clipper.announceClippedArcIntervals(this, announce);
    }
}
exports.Arc3d = Arc3d;
//# sourceMappingURL=Arc3d.js.map