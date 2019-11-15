"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Geometry_1 = require("../Geometry");
const AngleSweep_1 = require("../geometry3d/AngleSweep");
const Angle_1 = require("../geometry3d/Angle");
const Polynomials_1 = require("../numerics/Polynomials");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Ray3d_1 = require("../geometry3d/Ray3d");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const CurvePrimitive_1 = require("./CurvePrimitive");
const CurveExtendMode_1 = require("./CurveExtendMode");
const CurveLocationDetail_1 = require("./CurveLocationDetail");
const StrokeOptions_1 = require("./StrokeOptions");
const LineString3d_1 = require("./LineString3d");
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
 * ** vector0 is the vector from the center to the major axis extreme.
 * ** vector90 is the vector from the center to the minor axis extreme.
 * ** note the constructing the vectors to the extreme points makes them perpendicular.
 * *  The method toScaledMatrix3d () can be called to convert the unrestricted vector0,vector90 to perpendicular form.
 * * The unrestricted form is much easier to work with for common calculations -- stroking, projection to 2d, intersection with plane.
 * @public
 */
class Arc3d extends CurvePrimitive_1.CurvePrimitive {
    // constructor copies the pointers !!!
    constructor(center, matrix, sweep) {
        super();
        /** String name for schema properties */
        this.curvePrimitiveType = "arc";
        this._center = center;
        this._matrix = matrix;
        this._sweep = sweep;
    }
    /**
     * Test if this and other are both instances of Arc3d.
     */
    isSameGeometryClass(other) { return other instanceof Arc3d; }
    /**
     * read property for (clone of) center
     */
    get center() { return this._center.clone(); }
    /**
     * read property for (clone of) vector0
     */
    get vector0() { return this._matrix.columnX(); }
    /**
     * read property for (clone of) vector90
     */
    get vector90() { return this._matrix.columnY(); }
    /**
     * read property for (clone of) plane normal, with arbitrary length.
     */
    get perpendicularVector() { return this._matrix.columnZ(); }
    /**
     * read property for (clone of!) matrix of vector0, vector90, unit normal
     */
    get matrix() { return this._matrix.clone(); }
    /**
     * read property for (reference to !!) matrix of vector0, vector90, unit normal
     */
    get matrixRef() { return this._matrix; }
    /** property getter for the angle sweep */
    get sweep() { return this._sweep; }
    /** property setter for angle sweep */
    set sweep(value) { this._sweep.setFrom(value); }
    /**
     * An Arc3d extends along its complete elliptic arc
     */
    get isExtensibleFractionSpace() { return true; }
    /**
     *  Return a clone of the arc, with transform applied
     * @param transform
     */
    cloneTransformed(transform) {
        const c = this.clone();
        c.tryTransformInPlace(transform);
        return c;
    }
    /**
     * Redefine the arc with (captured references to) given data.
     * @param center arc center
     * @param matrix matrix with columns vector0, vector 90, and their unit cross product
     * @param sweep angle sweep
     */
    setRefs(center, matrix, sweep) {
        this._center = center;
        this._matrix = matrix;
        this._sweep = sweep;
    }
    /**
     * Redefine the arc with (clones of) given data.
     * @param center arc center
     * @param matrix matrix with columns vector0, vector 90, and their unit cross product
     * @param sweep angle sweep
     */
    set(center, matrix, sweep) {
        this.setRefs(center.clone(), matrix.clone(), sweep ? sweep.clone() : AngleSweep_1.AngleSweep.create360());
    }
    /**
     * Copy center, matrix, and sweep from other Arc3d.
     */
    setFrom(other) {
        this._center.setFrom(other._center);
        this._matrix.setFrom(other._matrix);
        this._sweep.setFrom(other._sweep);
    }
    /** Return a clone of this arc. */
    clone() {
        return new Arc3d(this._center.clone(), this._matrix.clone(), this._sweep.clone());
    }
    /**
     * Create an arc, capturing references to center, matrix and sweep.
     * @param center center point
     * @param matrix matrix with columns vector0, vector90, and unit cross product
     * @param sweep sweep limits
     * @param result optional preallocated result.
     */
    static createRefs(center, matrix, sweep, result) {
        if (result) {
            result.setRefs(center, matrix, sweep);
            return result;
        }
        return new Arc3d(center, matrix, sweep);
    }
    /**
     * Create an arc from center, x column to be scaled, and y column to be scaled.
     * @param center center of ellipse
     * @param matrix matrix whose x and y columns are unit vectors to be scaled by radius0 and radius90
     * @param radius0 radius in x direction.
     * @param radius90 radius in y direction.
     * @param sweep sweep limits
     * @param result optional preallocated result.
     */
    static createScaledXYColumns(center, matrix, radius0, radius90, sweep, result) {
        const vector0 = matrix.columnX();
        const vector90 = matrix.columnY();
        return Arc3d.create(center, vector0.scale(radius0, vector0), vector90.scale(radius90, vector90), sweep, result);
    }
    /**
     * Create a (full circular) arc from center, normal and radius
     * @param center center of ellipse
     * @param normal normal vector
     * @param radius radius in x direction.
     * @param result optional preallocated result.
     */
    static createCenterNormalRadius(center, normal, radius, result) {
        const frame = Matrix3d_1.Matrix3d.createRigidHeadsUp(normal, Geometry_1.AxisOrder.ZYX);
        return Arc3d.createScaledXYColumns(center, frame, radius, radius, undefined, result);
    }
    /**
     * Creat an arc by center with vectors to points at 0 and 90 degrees in parameter space.
     * @param center arc center
     * @param vector0 vector to 0 degrees (commonly major axis)
     * @param vector90 vector to 90 degree point (commonly minor axis)
     * @param sweep sweep limits
     * @param result optional preallocated result
     */
    static create(center, vector0, vector90, sweep, result) {
        const normal = vector0.unitCrossProductWithDefault(vector90, 0, 0, 0); // normal will be 000 for degenerate case ! !!
        const matrix = Matrix3d_1.Matrix3d.createColumns(vector0, vector90, normal);
        return Arc3d.createRefs(center.clone(), matrix, sweep ? sweep.clone() : AngleSweep_1.AngleSweep.create360(), result);
    }
    /** Return a clone of this arc, projected to given z value.
     * * If `z` is omitted, the clone is at the z of the center.
     * * Note that projection to fixed z can change circle into ellipse (and (rarely) ellipse to circle)
     */
    cloneAtZ(z) {
        if (z === undefined)
            z = this._center.z;
        return Arc3d.createXYZXYZXYZ(this._center.x, this._center.y, this._center.z, this._matrix.coffs[0], this._matrix.coffs[3], z, this._matrix.coffs[1], this._matrix.coffs[4], z, this._sweep);
    }
    /**
     * Create an arc by center (cx,cy,xz) with vectors (ux,uy,uz) and (vx,vy,vz) to points at 0 and 90 degrees in parameter space.
     * @param result optional preallocated result
     */
    static createXYZXYZXYZ(cx, cy, cz, ux, uy, uz, vx, vy, vz, sweep, result) {
        return Arc3d.create(Point3dVector3d_1.Point3d.create(cx, cy, cz), Point3dVector3d_1.Vector3d.create(ux, uy, uz), Point3dVector3d_1.Vector3d.create(vx, vy, vz), sweep, result);
    }
    /**
     * Return a quick estimate of the eccentricity of the ellipse.
     * * The estimator is the cross magnitude of the product of vectors U and V, divided by square of the larger magnitude
     * * for typical Arc3d with perpendicular UV, this is exactly the small axis divided by large.
     * * note that the eccentricity is AT MOST ONE.
     */
    quickEccentricity() {
        const magX = this._matrix.columnXMagnitude();
        const magY = this._matrix.columnYMagnitude();
        const jacobian = this._matrix.columnXYCrossProductMagnitude();
        const largeAxis = Geometry_1.Geometry.maxXY(magX, magY);
        return jacobian / (largeAxis * largeAxis);
    }
    /** Create a circular arc defined by start point, any intermediate point, and end point.
     * If the points are colinear, assemble them into a linestring.
     */
    static createCircularStartMiddleEnd(pointA, pointB, pointC, result) {
        const vectorAB = Point3dVector3d_1.Vector3d.createStartEnd(pointA, pointB);
        const vectorAC = Point3dVector3d_1.Vector3d.createStartEnd(pointA, pointC);
        const ab = vectorAB.magnitude();
        const bc = vectorAC.magnitude();
        const normal = vectorAB.sizedCrossProduct(vectorAC, Math.sqrt(ab * bc));
        if (normal) {
            const vectorToCenter = Polynomials_1.SmallSystem.linearSystem3d(normal.x, normal.y, normal.z, vectorAB.x, vectorAB.y, vectorAB.z, vectorAC.x, vectorAC.y, vectorAC.z, 0, // vectorToCenter DOT normal = 0
            0.5 * ab * ab, // vectorToCenter DOT vectorBA = 0.5 * vectorBA DOT vectorBA  (Rayleigh quotient)
            0.5 * bc * bc); // vectorToCenter DOT vectorBC = 0.5 * vectorBC DOT vectorBC  (Rayleigh quotient)
            if (vectorToCenter) {
                const center = Point3dVector3d_1.Point3d.create(pointA.x, pointA.y, pointA.z).plus(vectorToCenter);
                const vectorX = Point3dVector3d_1.Vector3d.createStartEnd(center, pointA);
                const vectorY = Point3dVector3d_1.Vector3d.createRotateVectorAroundVector(vectorX, normal, Angle_1.Angle.createDegrees(90));
                if (vectorY) {
                    const vectorCenterToC = Point3dVector3d_1.Vector3d.createStartEnd(center, pointC);
                    const sweepAngle = vectorX.signedAngleTo(vectorCenterToC, normal);
                    if (sweepAngle.radians < 0.0)
                        sweepAngle.addMultipleOf2PiInPlace(1.0);
                    return Arc3d.create(center, vectorX, vectorY, AngleSweep_1.AngleSweep.createStartEndRadians(0.0, sweepAngle.radians), result);
                }
            }
        }
        return LineString3d_1.LineString3d.create(pointA, pointB, pointC);
    }
    /** The arc has simple proportional arc length if and only if it is a circular arc. */
    getFractionToDistanceScale() {
        const radius = this.circularRadius();
        if (radius !== undefined)
            return Math.abs(radius * this._sweep.sweepRadians);
        return undefined;
    }
    /**
     * Convert a fractional position to xyz coordinates
     * @param fraction fractional position on arc
     * @param result optional preallocated result
     */
    fractionToPoint(fraction, result) {
        const radians = this._sweep.fractionToRadians(fraction);
        return this._matrix.originPlusMatrixTimesXY(this._center, Math.cos(radians), Math.sin(radians), result);
    }
    /**
     * Convert fractional arc and radial positions to xyz coordinates
     * @param fraction fractional position on arc
     * @param result optional preallocated result
     */
    fractionAndRadialFractionToPoint(arcFraction, radialFraction, result) {
        const radians = this._sweep.fractionToRadians(arcFraction);
        return this._matrix.originPlusMatrixTimesXY(this._center, radialFraction * Math.cos(radians), radialFraction * Math.sin(radians), result);
    }
    /**
     * Convert a fractional position to xyz coordinates and derivative with respect to fraction.
     * @param fraction fractional position on arc
     * @param result optional preallocated result
     */
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
            result = Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createXYPlane();
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        this._matrix.originPlusMatrixTimesXY(this._center, c, s, result.origin);
        const a = this._sweep.sweepRadians;
        this._matrix.multiplyXY(-a * s, a * c, result.vectorU);
        const aa = a * a;
        this._matrix.multiplyXY(-aa * c, -aa * s, result.vectorV);
        return result;
    }
    /**
     * Evaluate the point and derivative with respect to the angle (in radians)
     * @param radians angular position
     * @param result optional preallocated ray.
     */
    radiansToPointAndDerivative(radians, result) {
        result = result ? result : Ray3d_1.Ray3d.createZero();
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        this._matrix.originPlusMatrixTimesXY(this._center, c, s, result.origin);
        this._matrix.multiplyXY(-s, c, result.direction);
        return result;
    }
    /**
     * Return a parametric plane with
     * * origin at arc center
     * * vectorU from center to arc at angle (in radians)
     * * vectorV from center to arc at 90 degrees past the angle.
     * @param radians angular position
     * @param result optional preallocated plane
     */
    radiansToRotatedBasis(radians, result) {
        result = result ? result : Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createXYPlane();
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        result.origin.setFromPoint3d(this.center);
        this._matrix.multiplyXY(c, s, result.vectorU);
        this._matrix.multiplyXY(-s, c, result.vectorV);
        return result;
    }
    /**
     * Evaluate the point and derivative with respect to the angle (in radians)
     * @param theta angular position
     * @param result optional preallocated ray.
     */
    angleToPointAndDerivative(theta, result) {
        result = result ? result : Ray3d_1.Ray3d.createZero();
        const c = theta.cos();
        const s = theta.sin();
        this._matrix.originPlusMatrixTimesXY(this._center, c, s, result.origin);
        this._matrix.multiplyXY(-s, c, result.direction);
        return result;
    }
    /**
     * Return the start point tof the arc.
     * @param result optional preallocated result
     */
    startPoint(result) { return this.fractionToPoint(0.0, result); }
    /**
     * Return the end point tof the arc.
     * @param result optional preallocated result
     */
    endPoint(result) { return this.fractionToPoint(1.0, result); }
    /** * If this is a circular arc, return the simple length derived from radius and sweep.
     * * Otherwise (i.e. if this elliptical) fall through to CurvePrimitive base implementation which
     *     Uses quadrature.
     */
    curveLength() {
        return this.curveLengthBetweenFractions(0, 1);
    }
    /** * If this is a circular arc, return the simple length derived from radius and sweep.
     * * Otherwise (i.e. if this elliptical) fall through CurvePrimitive integrator.
     */
    curveLengthBetweenFractions(fraction0, fraction1) {
        const simpleLength = this.getFractionToDistanceScale();
        if (simpleLength !== undefined)
            return simpleLength * Math.abs(fraction1 - fraction0);
        // fall through for true ellipse . .. stroke and accumulate quadrature with typical count .  ..
        let f0 = fraction0;
        let f1 = fraction1;
        if (fraction0 > fraction1) {
            f0 = fraction1;
            f1 = fraction0;
        }
        const sweepDegrees = (f1 - f0) * this._sweep.sweepDegrees;
        let eccentricity = this.quickEccentricity();
        if (eccentricity < 0.00001)
            eccentricity = 0.00001;
        let numInterval = Math.ceil(sweepDegrees / (eccentricity * Arc3d.quadratureIntervalAngleDegrees));
        if (numInterval > 400)
            numInterval = 400;
        if (numInterval < 1)
            numInterval = 1;
        return super.curveLengthWithFixedIntervalCountQuadrature(f0, f1, numInterval, Arc3d.quadratureGuassCount);
    }
    /**
     * Return an approximate (but easy to compute) arc length.
     * The estimate is:
     * * Form 8 chords on full circle, proportionally fewer for partials.  (But 2 extras if less than half circle.)
     * * sum the chord lengths
     * * For a circle, we know this crude approximation has to be increased by a factor (theta/(2 sin (theta/2)))
     * * Apply that factor.
     * * Experiments confirm that this is within 3 percent for a variety of eccentricities and arc sweeps.
     */
    quickLength() {
        const totalSweep = Math.abs(this._sweep.sweepRadians);
        let numInterval = Math.ceil(4 * totalSweep / Math.PI);
        if (numInterval < 1)
            numInterval = 1;
        if (numInterval < 4)
            numInterval += 3;
        else if (numInterval < 6)
            numInterval += 2; // force extras for short arcs
        const pointA = Arc3d._workPointA;
        const pointB = Arc3d._workPointB;
        let chordSum = 0.0;
        this.fractionToPoint(0.0, pointA);
        for (let i = 1; i <= numInterval; i++) {
            this.fractionToPoint(i / numInterval, pointB);
            chordSum += pointA.distance(pointB);
            pointA.setFromPoint3d(pointB);
        }
        // The chord sum is always shorter.
        // if it is a true circular arc, the ratio of correct over sum is easy ...
        const dTheta = totalSweep / numInterval;
        const factor = dTheta / (2.0 * Math.sin(0.5 * dTheta));
        return chordSum * factor;
    }
    /**
     * * See extended comments on `CurvePrimitive.moveSignedDistanceFromFraction`
     * * A zero length line generates `CurveSearchStatus.error`
     * * Nonzero length line generates `CurveSearchStatus.success` or `CurveSearchStatus.stoppedAtBoundary`
     */
    moveSignedDistanceFromFraction(startFraction, signedDistance, allowExtension, result) {
        if (!this.isCircular) // suppress extension !!!
            return super.moveSignedDistanceFromFractionGeneric(startFraction, signedDistance, allowExtension, result);
        const totalLength = this.curveLength();
        const signedFractionMove = Geometry_1.Geometry.conditionalDivideFraction(signedDistance, totalLength);
        if (signedFractionMove === undefined) {
            return CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPointDistanceCurveSearchStatus(this, startFraction, this.fractionToPoint(startFraction), 0.0, CurveLocationDetail_1.CurveSearchStatus.error);
        }
        return CurveLocationDetail_1.CurveLocationDetail.createConditionalMoveSignedDistance(allowExtension, this, startFraction, startFraction + signedFractionMove, signedDistance, result);
    }
    /**
     * Return all angles (in radians) where the ellipse tangent is perpendicular to the vector to a spacePoint.
     * @param spacePoint point of origin of vectors to the ellipse
     * @param _extend (NOT SUPPORTED -- ALWAYS ACTS AS "true")
     * @param _endpoints if true, force the end radians into the result.
     */
    allPerpendicularAngles(spacePoint, _extend = true, _endpoints = false) {
        const radians = [];
        const vectorQ = spacePoint.vectorTo(this.center);
        const uu = this._matrix.columnXMagnitudeSquared();
        const uv = this._matrix.columnXDotColumnY();
        const vv = this._matrix.columnYMagnitudeSquared();
        Polynomials_1.TrigPolynomial.solveUnitCircleImplicitQuadricIntersection(uv, vv - uu, -uv, this._matrix.dotColumnY(vectorQ), -this._matrix.dotColumnX(vectorQ), 0.0, radians);
        if (_endpoints) {
            radians.push(this.sweep.startRadians);
            radians.push(this.sweep.endRadians);
        }
        return radians;
    }
    /**
     * Return details of the closest point on the arc, optionally extending to full ellipse.
     * @param spacePoint search for point closest to this point.
     * @param extend if true, consider projections to the complete ellipse.   If false, consider only endpoints and projections within the arc sweep.
     * @param result optional preallocated result.
     */
    closestPoint(spacePoint, extend, result) {
        result = CurveLocationDetail_1.CurveLocationDetail.create(this, result);
        const allRadians = this.allPerpendicularAngles(spacePoint, true, true);
        if (!extend && !this._sweep.isFullCircle) {
            allRadians.push(this._sweep.startRadians);
            allRadians.push(this._sweep.endRadians);
        }
        // hm... logically there must at least two angles there ...  but if it happens return the start point ...
        const workRay = Ray3d_1.Ray3d.createZero();
        if (allRadians.length === 0) {
            result.setFR(0.0, this.radiansToPointAndDerivative(this._sweep.startRadians, workRay));
            result.a = spacePoint.distance(result.point);
        }
        else {
            let dMin = Number.MAX_VALUE;
            let d = 0;
            for (const radians of allRadians) {
                const fraction = CurveExtendMode_1.CurveExtendOptions.resolveRadiansToSweepFraction(extend, radians, this.sweep);
                if (fraction !== undefined) {
                    this.fractionToPointAndDerivative(fraction, workRay);
                    d = spacePoint.distance(workRay.origin);
                    if (d < dMin) {
                        dMin = d;
                        result.setFR(fraction, workRay);
                        result.a = d;
                    }
                }
            }
        }
        return result;
    }
    /** Reverse the sweep  of the arc. */
    reverseInPlace() { this._sweep.reverseInPlace(); }
    /** apply a transform to the arc basis vectors.
     * * nonuniform (i.e. skewing) transforms are allowed.
     * * The transformed vector0 and vector90 are NOT squared up as major minor axes.  (This is a good feature!!)
     */
    tryTransformInPlace(transform) {
        this._center = transform.multiplyPoint3d(this._center, this._center);
        this._matrix = transform.matrix.multiplyMatrixMatrix(this._matrix, this._matrix);
        // force re-normalization of columnZ.
        this.setVector0Vector90(this._matrix.columnX(), this._matrix.columnY());
        return true;
    }
    /**
     * Return true if the ellipse center and basis vectors are in the plane
     * @param plane
     */
    isInPlane(plane) {
        const normal = plane.getNormalRef();
        // The ellipse vectors are full-length  -- true distance comparisons say things.
        return Geometry_1.Geometry.isSmallMetricDistance(plane.altitude(this._center))
            && Geometry_1.Geometry.isSmallMetricDistance(this._matrix.dotColumnX(normal))
            && Geometry_1.Geometry.isSmallMetricDistance(this._matrix.dotColumnY(normal));
    }
    /**
     * Return true if the vector0 and vector90 are of equal length and perpendicular.
     */
    get isCircular() {
        const axx = this._matrix.columnXMagnitudeSquared();
        const ayy = this._matrix.columnYMagnitudeSquared();
        const axy = this._matrix.columnXDotColumnY();
        return Angle_1.Angle.isPerpendicularDotSet(axx, ayy, axy) && Geometry_1.Geometry.isSameCoordinateSquared(axx, ayy);
    }
    /** If the arc is circular, return its radius.  Otherwise return undefined */
    circularRadius() {
        return this.isCircular ? this._matrix.columnXMagnitude() : undefined;
    }
    /** Return the larger of the two defining vectors. */
    maxVectorLength() { return Math.max(this._matrix.columnXMagnitude(), this._matrix.columnYMagnitude()); }
    /**
     * compute intersections with a plane.
     * @param plane plane to intersect
     * @param result array of locations on the curve.
     */
    appendPlaneIntersectionPoints(plane, result) {
        const constCoff = plane.altitude(this._center);
        const coffs = this._matrix.coffs;
        const cosCoff = plane.velocityXYZ(coffs[0], coffs[3], coffs[6]);
        const sinCoff = plane.velocityXYZ(coffs[1], coffs[4], coffs[7]);
        const trigPoints = Geometry_1.Geometry.solveTrigForm(constCoff, cosCoff, sinCoff);
        let numIntersection = 0;
        if (trigPoints !== undefined) {
            numIntersection = trigPoints.length;
            let xy;
            for (xy of trigPoints) {
                const radians = Math.atan2(xy.y, xy.x);
                const fraction = this._sweep.radiansToPositivePeriodicFraction(radians);
                const detail = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(this, fraction, this.fractionToPoint(fraction));
                detail.intervalRole = CurveLocationDetail_1.CurveIntervalRole.isolated;
                if (Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._sweep.startRadians))
                    detail.intervalRole = CurveLocationDetail_1.CurveIntervalRole.isolatedAtVertex;
                else if (Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._sweep.startRadians))
                    detail.intervalRole = CurveLocationDetail_1.CurveIntervalRole.isolatedAtVertex;
                result.push(detail);
            }
        }
        return numIntersection;
    }
    /**
     * Extend a range to include the range of the arc.
     * @param range range being extended.
     * @param transform optional transform to apply to the arc.
     */
    extendRange(range, transform) {
        const df = 1.0 / 32;
        // KLUDGE --- evaluate lots of points ...
        let point = Point3dVector3d_1.Point3d.create();
        for (let fraction = 0; fraction <= 1.001; fraction += df) {
            point = this.fractionToPoint(fraction, point);
            if (transform)
                range.extendTransformedPoint(transform, point);
            else
                range.extendPoint(point);
        }
    }
    /**
     * Create a new arc which is a unit circle centered at the origin.
     */
    static createUnitCircle() {
        return Arc3d.createRefs(Point3dVector3d_1.Point3d.create(0, 0, 0), Matrix3d_1.Matrix3d.createIdentity(), AngleSweep_1.AngleSweep.create360());
    }
    /**
     * Create a new arc which is parallel to the xy plane, with given center and radius and optional angle sweep.
     * @param center center of arc
     * @param radius radius of arc
     * @param sweep sweep limits.  defaults to full circle.
     */
    static createXY(center, radius, sweep = AngleSweep_1.AngleSweep.create360()) {
        return new Arc3d(center.clone(), Matrix3d_1.Matrix3d.createScale(radius, radius, 1.0), sweep);
    }
    /**
     * Create a new arc which is parallel to the xy plane, with given center and x,y radii, and optional angle sweep
     * @param center center of ellipse
     * @param radiusA x axis radius
     * @param radiusB y axis radius
     * @param sweep angle sweep
     */
    static createXYEllipse(center, radiusA, radiusB, sweep = AngleSweep_1.AngleSweep.create360()) {
        return new Arc3d(center.clone(), Matrix3d_1.Matrix3d.createScale(radiusA, radiusB, 1.0), sweep);
    }
    /**
     * Replace the arc's 0 and 90 degree vectors.
     * @param vector0 vector from center to ellipse point at 0 degrees in parameter space
     * @param vector90 vector from center to ellipse point at 90 degrees in parameter space
     */
    setVector0Vector90(vector0, vector90) {
        this._matrix.setColumns(vector0, vector90, vector0.unitCrossProductWithDefault(vector90, 0, 0, 0));
    }
    /** Return the arc definition with rigid matrix form with axis radii.
     */
    toScaledMatrix3d() {
        const angleData = Angle_1.Angle.dotProductsToHalfAngleTrigValues(this._matrix.columnXMagnitudeSquared(), this._matrix.columnYMagnitudeSquared(), this._matrix.columnXDotColumnY(), true);
        const vector0A = this._matrix.multiplyXY(angleData.c, angleData.s);
        const vector90A = this._matrix.multiplyXY(-angleData.s, angleData.c);
        const axes = Matrix3d_1.Matrix3d.createRigidFromColumns(vector0A, vector90A, Geometry_1.AxisOrder.XYZ);
        return {
            axes: (axes ? axes : Matrix3d_1.Matrix3d.createIdentity()),
            center: this._center,
            r0: vector0A.magnitude(),
            r90: vector90A.magnitude(),
            sweep: this.sweep.cloneMinusRadians(angleData.radians),
        };
    }
    /** Return the arc definition with center, two vectors, and angle sweep;
     */
    toVectors() {
        return {
            center: this.center,
            vector0: this._matrix.columnX(),
            vector90: this._matrix.columnY(),
            sweep: this.sweep,
        };
    }
    /** Return the arc definition with center, two vectors, and angle sweep, optionally transformed.
     */
    toTransformedVectors(transform) {
        return transform ? {
            center: transform.multiplyPoint3d(this._center),
            vector0: transform.multiplyVector(this._matrix.columnX()),
            vector90: transform.multiplyVector(this._matrix.columnY()),
            sweep: this.sweep,
        }
            : {
                center: this._center.clone(),
                vector0: this._matrix.columnX(),
                vector90: this._matrix.columnY(),
                sweep: this.sweep,
            };
    }
    /** Return the arc definition with center, two vectors, and angle sweep, transformed to 4d points.
     */
    toTransformedPoint4d(matrix) {
        return {
            center: matrix.multiplyPoint3d(this._center, 1.0),
            vector0: matrix.multiplyPoint3d(this._matrix.columnX(), 0.0),
            vector90: matrix.multiplyPoint3d(this._matrix.columnY(), 0.0),
            sweep: this.sweep,
        };
    }
    /**
     * Set this arc from a json object with these values:
     * * center center point
     * * vector0 vector from center to 0 degree point in parameter space (commonly but not always the major axis vector)
     * * vector90 vector from center to 90 degree point in parameter space (commonly but not always the minor axis vector)
     * @param json
     */
    setFromJSON(json) {
        if (json && json.center && json.vector0 && json.vector90 && json.sweep) {
            this._center.setFromJSON(json.center);
            const vector0 = Point3dVector3d_1.Vector3d.create();
            const vector90 = Point3dVector3d_1.Vector3d.create();
            vector0.setFromJSON(json.vector0);
            vector90.setFromJSON(json.vector90);
            this.setVector0Vector90(vector0, vector90);
            this._sweep.setFromJSON(json.sweep);
        }
        else {
            this._center.set(0, 0, 0);
            this._matrix.setFrom(Matrix3d_1.Matrix3d.identity);
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
    /**
     * Test if this arc is almost equal to another GeometryQuery object
     */
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
        const numStrokes = this.computeStrokeCountForOptions(options);
        dest.appendFractionalStrokePoints(this, numStrokes, 0.0, 1.0, true);
    }
    /** Emit strokes to caller-supplied handler */
    emitStrokableParts(handler, options) {
        const numStrokes = this.computeStrokeCountForOptions(options);
        handler.startCurvePrimitive(this);
        handler.announceIntervalForUniformStepStrokes(this, numStrokes, 0.0, 1.0);
        handler.endCurvePrimitive(this);
    }
    /**
     * return the stroke count required for given options.
     * @param options StrokeOptions that determine count
     */
    computeStrokeCountForOptions(options) {
        let numStroke = 1;
        if (options) {
            const rMax = this.maxVectorLength();
            numStroke = options.applyTolerancesToArc(rMax, this._sweep.sweepRadians);
        }
        else {
            numStroke = StrokeOptions_1.StrokeOptions.applyAngleTol(undefined, 1, this._sweep.sweepRadians);
        }
        return numStroke;
    }
    /** Second step of double dispatch:  call `handler.handleArc3d(this)` */
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
    /** Return an arc whose basis vectors are rotated by given angle within the current basis space.
     * * the result arc will have its zero-degree point (new `vector0`) at the current `vector0 * cos(theta) + vector90 * sin(theta)`
     * * the result sweep is adjusted so all fractional coordinates (e.g. start and end) evaluate to the same xyz.
     *   * Specifically, theta is subtracted from the original start and end angles.
     * @param theta the angle (in the input arc space) which is to become the 0-degree point in the new arc.
     */
    cloneInRotatedBasis(theta) {
        const c = theta.cos();
        const s = theta.sin();
        const vector0 = this._matrix.multiplyXY(c, s);
        const vector90 = this.matrix.multiplyXY(-s, c);
        const newSweep = AngleSweep_1.AngleSweep.createStartEndRadians(this._sweep.startRadians - theta.radians, this._sweep.endRadians - theta.radians);
        const arcB = Arc3d.create(this._center.clone(), vector0, vector90, newSweep);
        return arcB;
    }
    /**
     * Find intervals of this CurvePrimitive that are interior to a clipper
     * @param clipper clip structure (e.g.clip planes)
     * @param announce(optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(clipper, announce) {
        return clipper.announceClippedArcIntervals(this, announce);
    }
    /** Compute the center and vectors of another arc as local coordinates within this arc's frame. */
    otherArcAsLocalVectors(other) {
        const otherOrigin = this._matrix.multiplyInverseXYZAsPoint3d(other.center.x - this.center.x, other.center.y - this.center.y, other.center.z - this.center.z);
        const otherVector0 = this._matrix.multiplyInverse(other.vector0);
        const otherVector90 = this._matrix.multiplyInverse(other.vector90);
        if (otherOrigin && otherVector0 && otherVector90) {
            return { center: otherOrigin, vector0: otherVector0, vector90: otherVector90, sweep: this.sweep.clone() };
        }
        return undefined;
    }
    /**
     * Determine an arc "at a point of inflection" of a point sequence.
     * * Return the arc along with the fractional positions of the tangency points.
     * * In the returned object:
     *   * `arc` is the (bounded) arc
     *   * `fraction10` is the tangency point's position as an interpolating fraction of the line segment from `point1` (backwards) to `point0`
     *   * `fraction12` is the tangency point's position as an interpolating fraction of the line segment from `point1` (forward) to `point2`
     *   * `point1` is the `point1` input.
     * * If unable to construct the arc:
     *   * `point` is the `point` input.
     *   * both fractions are zero
     *   * `arc` is undefined.
     * @param point0 first point of path. (the point before the point of inflection)
     * @param point1 second point of path (the point of inflection)
     * @param point2 third point of path (the point after the point of inflection)
     * @param radius arc radius
     *
     */
    static createFilletArc(point0, point1, point2, radius) {
        const vector10 = Point3dVector3d_1.Vector3d.createStartEnd(point1, point0);
        const vector12 = Point3dVector3d_1.Vector3d.createStartEnd(point1, point2);
        const d10 = vector10.magnitude();
        const d12 = vector12.magnitude();
        if (vector10.normalizeInPlace() && vector12.normalizeInPlace()) {
            const bisector = vector10.plus(vector12);
            if (bisector.normalizeInPlace()) {
                // const theta = vector12.angleTo(bisector);
                // vector10, vector12, and bisector are UNIT vectors
                // bisector splits the angle between vector10 and vector12
                const perpendicular = vector12.minus(vector10);
                const perpendicularMagnitude = perpendicular.magnitude(); // == 2 * sin(theta)
                const sinTheta = 0.5 * perpendicularMagnitude;
                if (!Geometry_1.Geometry.isSmallAngleRadians(sinTheta)) { // (for small theta, sinTheta is almost equal to theta)
                    const cosTheta = Math.sqrt(1 - sinTheta * sinTheta);
                    const tanTheta = sinTheta / cosTheta;
                    const alphaRadians = Math.acos(sinTheta);
                    const distanceToCenter = radius / sinTheta;
                    const distanceToTangency = radius / tanTheta;
                    const f10 = distanceToTangency / d10;
                    const f12 = distanceToTangency / d12;
                    const center = point1.plusScaled(bisector, distanceToCenter);
                    bisector.scaleInPlace(-radius);
                    perpendicular.scaleInPlace(radius / perpendicularMagnitude);
                    const arc02 = Arc3d.create(center, bisector, perpendicular, AngleSweep_1.AngleSweep.createStartEndRadians(-alphaRadians, alphaRadians));
                    return { arc: arc02, fraction10: f10, fraction12: f12, point: point1.clone() };
                }
            }
        }
        return { fraction10: 0.0, fraction12: 0.0, point: point1.clone() };
    }
}
exports.Arc3d = Arc3d;
Arc3d._workPointA = Point3dVector3d_1.Point3d.create();
Arc3d._workPointB = Point3dVector3d_1.Point3d.create();
// !! misspelled Gauss in the published static !!!   Declare it ok.
// cspell::word Guass
/** Gauss point quadrature count for evaluating curve length.   (The number of intervals is adjusted to the arc sweep) */
Arc3d.quadratureGuassCount = 5;
/** In quadrature for arc length, use this interval (divided by quickEccentricity) */
Arc3d.quadratureIntervalAngleDegrees = 10.0;
//# sourceMappingURL=Arc3d.js.map