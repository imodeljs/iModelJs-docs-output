"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Geometry_1 = require("../Geometry");
const PointVector_1 = require("../PointVector");
const Transform_1 = require("../Transform");
const Quadrature_1 = require("../numerics/Quadrature");
const CurvePrimitive_1 = require("./CurvePrimitive");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const LineString3d_1 = require("./LineString3d");
// import {} from "./";
/** A transition spiral is a curve defined by its curvature, with the curvature function symmetric about midpoint.
 * * The symmetry condition creates a relationship among the following 4 quantities:
 * ** curvature0 = curvature (i.e. 1/radius) at start
 * ** curvature1 = curvature (i.e. 1/radius) at end
 * ** sweepRadians = signed turning angle from start to end
 * ** arcLength = length of curve
 * * The relationship is the equation
 * ** `sweepRadians = arcLength * average Curvature = arcLength * 0.5 * (curvature0 + curvature1)`
 * * That is, regardless of any curvature properties other than symmetry, specifying any 3 of the quantities fully determines the remaining one.
 */
class TransitionConditionalProperties {
    /**
     * capture numeric or undefined values
     * @param radius0 start radius or undefined
     * @param radius1 end radius or undefined
     * @param bearing0 start bearing or undefined
     * @param bearing1 end bearing or undefined
     * @param arcLength arc length or undefined
     */
    constructor(radius0, radius1, bearing0, bearing1, arcLength) {
        this.radius0 = radius0;
        this.radius1 = radius1;
        this.bearing0 = bearing0;
        this.bearing1 = bearing1;
        this.curveLength = arcLength;
    }
    /** return the number of defined values among the 5 properties. */
    numDefinedProperties() {
        return Geometry_1.Geometry.defined01(this.radius0)
            + Geometry_1.Geometry.defined01(this.radius1)
            + Geometry_1.Geometry.defined01(this.bearing0)
            + Geometry_1.Geometry.defined01(this.bearing1)
            + Geometry_1.Geometry.defined01(this.curveLength);
    }
    /** clone with all properties (i.e. preserve undefined states) */
    clone() {
        return new TransitionConditionalProperties(this.radius0, this.radius1, this.bearing0 === undefined ? undefined : this.bearing0.clone(), this.bearing1 === undefined ? undefined : this.bearing1.clone(), this.curveLength);
    }
    /** Examine which properties are defined and compute the (single) undefined.
     * @returns Return true if the input state had precisely one undefined member.
     */
    tryResolveAnySingleUnknown() {
        if (this.bearing0 && this.bearing1) {
            const sweepRadians = this.bearing1.radians - this.bearing0.radians;
            if (this.curveLength === undefined && this.radius0 !== undefined && this.radius1 !== undefined) {
                this.curveLength = TransitionSpiral3d.radiusRadiusSweepRadiansToArcLength(this.radius0, this.radius1, sweepRadians);
                return true;
            }
            if (this.curveLength !== undefined && this.radius0 === undefined && this.radius1 !== undefined) {
                this.radius0 = TransitionSpiral3d.radius1LengthSweepRadiansToRadius0(this.radius1, this.curveLength, sweepRadians);
                return true;
            }
            if (this.curveLength !== undefined && this.radius0 !== undefined && this.radius1 === undefined) {
                this.radius1 = TransitionSpiral3d.radius0LengthSweepRadiansToRadius1(this.radius0, this.curveLength, sweepRadians);
                return true;
            }
            return false;
        }
        // at least one bearing is undefined ...
        if (this.curveLength === undefined || this.radius0 === undefined || this.radius1 === undefined)
            return false;
        if (this.bearing0) {
            this.bearing1 = Geometry_1.Angle.createRadians(this.bearing0.radians + TransitionSpiral3d.radiusRadiusLengthToSweepRadians(this.radius0, this.radius1, this.curveLength));
            return true;
        }
        if (this.bearing1) {
            this.bearing0 = Geometry_1.Angle.createRadians(this.bearing1.radians - TransitionSpiral3d.radiusRadiusLengthToSweepRadians(this.radius0, this.radius1, this.curveLength));
            return true;
        }
        return false;
    }
    almostEqualCoordinate(a, b) {
        if (a === undefined && b === undefined)
            return true;
        if (a !== undefined && b !== undefined)
            return Geometry_1.Geometry.isSameCoordinate(a, b);
        return false;
    }
    almostEqualBearing(a, b) {
        if (a === undefined && b === undefined)
            return true;
        if (a !== undefined && b !== undefined)
            return a.isAlmostEqualNoPeriodShift(b);
        return false;
    }
    /**
     * Test if this and other have matching numeric and undefined members.
     */
    isAlmostEqual(other) {
        if (!this.almostEqualCoordinate(this.radius0, other.radius0))
            return false;
        if (!this.almostEqualCoordinate(this.radius1, other.radius1))
            return false;
        if (!this.almostEqualBearing(this.bearing0, other.bearing0))
            return false;
        if (!this.almostEqualBearing(this.bearing1, other.bearing1))
            return false;
        if (!this.almostEqualCoordinate(this.curveLength, other.curveLength))
            return false;
        return true;
    }
}
exports.TransitionConditionalProperties = TransitionConditionalProperties;
class TransitionSpiral3d extends CurvePrimitive_1.CurvePrimitive {
    // constructor demands all bearing, radius, and length data -- caller determines usual dependency of "any 4 determine the 5th"
    constructor(spiralType, radius01, bearing01, activeFractionInterval, localToWorld, arcLength, properties) {
        super();
        this.spiralType = spiralType;
        this.localToWorld = localToWorld;
        this.radius01 = radius01;
        this.bearing01 = bearing01;
        this.localToWorld = localToWorld;
        this.activeFractionInterval = activeFractionInterval;
        this.arcLength01 = arcLength;
        this.strokes = LineString3d_1.LineString3d.create();
        // initialize for compiler -- but this will be recomputed in refreshComputeProperties ...
        this.curvature01 = PointVector_1.Segment1d.create(0, 1);
        this.refreshComputedProperties();
        this.properties = properties;
    }
    // return 1/r with convention that if true zero is given as radius it represents infinite radius (0 curvature, straight line)
    static radiusToCurvature(radius) { return (radius === 0.0) ? 0.0 : 1.0 / radius; }
    // return 1/k with convention that if near-zero is given as curvature, its infinite radius is returned as 0
    static curvatureToRadius(curvature) {
        if (Math.abs(curvature) < Geometry_1.Geometry.smallAngleRadians)
            return 0.0;
        return 1.0 / curvature;
    }
    // return the average curvature for two limit values.
    static averageCurvature(radiusLimits) {
        return 0.5 * (TransitionSpiral3d.radiusToCurvature(radiusLimits.x0) + TransitionSpiral3d.radiusToCurvature(radiusLimits.x1));
    }
    /**
     * Given two radii (or zeros for 0 curvature) return the average curvature
     * @param r0 start radius, or 0 for line
     * @param r1 end radius, or 0 for line
     */
    static averageCurvatureR0R1(r0, r1) {
        return 0.5 * (TransitionSpiral3d.radiusToCurvature(r0) + TransitionSpiral3d.radiusToCurvature(r1));
    }
    static radiusRadiusSweepRadiansToArcLength(radius0, radius1, sweepRadians) {
        return Math.abs(sweepRadians / TransitionSpiral3d.averageCurvatureR0R1(radius0, radius1));
    }
    static radiusRadiusLengthToSweepRadians(radius0, radius1, arcLength) {
        return TransitionSpiral3d.averageCurvatureR0R1(radius0, radius1) * arcLength;
    }
    static radius0LengthSweepRadiansToRadius1(radius0, arcLength, sweepRadians) {
        return TransitionSpiral3d.curvatureToRadius((2.0 * sweepRadians / arcLength) - TransitionSpiral3d.radiusToCurvature(radius0));
    }
    static radius1LengthSweepRadiansToRadius0(radius1, arcLength, sweepRadians) {
        return TransitionSpiral3d.curvatureToRadius((2.0 * sweepRadians / arcLength) - TransitionSpiral3d.radiusToCurvature(radius1));
    }
    /** Return the origial defining properties (if any) saved by the constructor. */
    get originalProperties() { return this.properties; }
    /** return the spiral type as a string (undefined resolves to default type "clothoid") */
    getSpiralType() { if (this.spiralType === undefined)
        return TransitionSpiral3d.defaultSpiralType; return this.spiralType; }
    /** Return the bearing at given fraction .... */
    fractionToBearingRadians(fraction) {
        // BUG? active interval?
        return this.bearing01.startRadians + fraction * (this.curvature01.x0 + 0.5 * fraction * (this.curvature01.x1 - this.curvature01.x0));
    }
    /** Return the curvature at given fraction ... */
    fractionToCurvature(fraction) {
        // BUG? active interval
        return this.curvature01.fractionToPoint(fraction);
    }
    static initWorkSpace() {
        TransitionSpiral3d.sGaussFraction = new Float64Array(5);
        TransitionSpiral3d.sGaussWeight = new Float64Array(5);
        TransitionSpiral3d.sGaussMapper = Quadrature_1.Quadrature.setupGauss5;
    }
    /** Evaluate and sum the gauss quadrature formulas to integrate cos(theta), sin(theta) fractional subset of a reference length.
     * (recall that theta is a nonlinear function of the fraction.)
     * * This is a single interval of gaussian integration.
     * * The fraction is on the full spiral (not in the mapped active interval)
     * @param xyz advancing integrated point.
     * @param fractionA fraction at start of interval
     * @param fractionB fraction at end of interval.
     * @param unitArcLength length of curve for 0 to 1 fractional
     */
    fullSpiralIncrementalIntegral(xyz, fractionA, fractionB) {
        const gaussFraction = TransitionSpiral3d.sGaussFraction;
        const gaussWeight = TransitionSpiral3d.sGaussWeight;
        const numEval = TransitionSpiral3d.sGaussMapper(fractionA, fractionB, gaussFraction, gaussWeight);
        const deltaL = this.arcLength01;
        let w = 0;
        for (let k = 0; k < numEval; k++) {
            const radians = this.fractionToBearingRadians(gaussFraction[k]);
            w = gaussWeight[k] * deltaL;
            xyz.x += w * Math.cos(radians);
            xyz.y += w * Math.sin(radians);
        }
    }
    refreshComputedProperties() {
        this.curvature01 = PointVector_1.Segment1d.create(TransitionSpiral3d.radiusToCurvature(this.radius01.x0), TransitionSpiral3d.radiusToCurvature(this.radius01.x1));
        this.strokes.clear();
        const currentPoint = PointVector_1.Point3d.create();
        this.strokes.appendStrokePoint(currentPoint);
        const numInterval = 8;
        const fractionStep = 1.0 / numInterval;
        for (let i = 1; i <= numInterval; i++) {
            const fraction0 = (i - 1) * fractionStep;
            const fraction1 = i * fractionStep;
            this.fullSpiralIncrementalIntegral(currentPoint, fraction0, fraction1);
            this.strokes.appendStrokePoint(currentPoint);
        }
        this.strokes.tryTransformInPlace(this.localToWorld);
    }
    /**
     * Create a transition spiral with radius and bearing conditions.
     * @param radius01 radius (inverse curvature) at start and end. (radius of zero means straight line)
     * @param bearing01 bearing angles at start and end.  bearings are measured from the x axis, positive clockwise towards y axis
     * @param activeFractionInterval fractional limits of the active portion of the spiral.
     * @param localToWorld placement frame.  Fractional coordinate 0 is at the origin.
     */
    static createRadiusRadiusBearingBearing(radius01, bearing01, activeFractionInterval, localToWorld) {
        const arcLength = TransitionSpiral3d.radiusRadiusSweepRadiansToArcLength(radius01.x0, radius01.x1, bearing01.sweepRadians);
        return new TransitionSpiral3d("clothoid", radius01.clone(), bearing01.clone(), activeFractionInterval.clone(), localToWorld.clone(), arcLength, new TransitionConditionalProperties(radius01.x0, radius01.x1, bearing01.startAngle.clone(), bearing01.endAngle.clone(), undefined));
    }
    /**
     * Create a transition spiral.
     * * Inputs must provide exactly 4 of the 5 values `[radius0,radius1,bearing0,bearing1,length`.
     * @param spiralType one of "clothoid", "bloss", "biquadratic", "cosine", "sine".  If undefined, "clothoid" is used.
     * @param radius0 radius (or 0 for tangent to line) at start
     * @param radius1 radius (or 0 for tangent to line) at end
     * @param bearing0 bearing, measured CCW from x axis at start.
     * @param bearing1 bearing, measured CCW from x axis at end.
     * @param fractionInterval optional fractional interval for an "active" portion of the curve.   if omitted, the full [0,1] is used.
     * @param localToWorld placement transform
     */
    static create(spiralType, radius0, radius1, bearing0, bearing1, arcLength, fractionInterval, localToWorld) {
        const data = new TransitionConditionalProperties(radius0, radius1, bearing0, bearing1, arcLength);
        const data1 = data.clone();
        if (!data.tryResolveAnySingleUnknown())
            return undefined;
        if (fractionInterval === undefined)
            fractionInterval = PointVector_1.Segment1d.create(0, 1);
        return new TransitionSpiral3d(spiralType, PointVector_1.Segment1d.create(data.radius0, data.radius1), Geometry_1.AngleSweep.createStartEnd(data.bearing0, data.bearing1), fractionInterval ? fractionInterval.clone() : PointVector_1.Segment1d.create(0, 1), localToWorld, data.curveLength, data1);
    }
    setFrom(other) {
        this.localToWorld.setFrom(other.localToWorld);
        this.radius01.setFrom(other.radius01);
        this.radius01.setFrom(other.radius01);
        this.bearing01.setFrom(other.bearing01);
        this.localToWorld.setFrom(other.localToWorld);
        return this;
    }
    clone() {
        return TransitionSpiral3d.createRadiusRadiusBearingBearing(this.radius01, this.bearing01, this.activeFractionInterval, this.localToWorld);
    }
    tryTransformInPlace(transform) {
        transform.multiplyTransformTransform(this.localToWorld, this.localToWorld);
        return true;
    }
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform); // ok, we're confident it will always work.
        return result;
    }
    startPoint() { return this.strokes.startPoint(); }
    endPoint() { return this.strokes.endPoint(); }
    isInPlane(plane) {
        return plane.isPointInPlane(this.localToWorld.origin)
            && Geometry_1.Geometry.isSameCoordinate(0.0, this.localToWorld.matrix.dotColumnX(plane.getNormalRef()))
            && Geometry_1.Geometry.isSameCoordinate(0.0, this.localToWorld.matrix.dotColumnY(plane.getNormalRef()));
    }
    /** Return length of the spiral.  Because TransitionSpiral is parameterized directly in terms of distance along, this is a simple return value. */
    quickLength() { return this.arcLength01; }
    /** Return length of the spiral.  Because TransitionSpiral is parameterized directly in terms of distance along, this is a simple return value. */
    curveLength() { return this.arcLength01; }
    isSameGeometryClass(other) { return other instanceof TransitionSpiral3d; }
    emitStrokes(dest, options) { this.strokes.emitStrokes(dest, options); }
    emitStrokableParts(dest, options) {
        dest.startParentCurvePrimitive(this);
        this.strokes.emitStrokableParts(dest, options);
        dest.endParentCurvePrimitive(this);
    }
    // hm.. nothing to do but reverse the interval . . . maybe that's cheesy . . .
    reverseInPlace() {
        this.activeFractionInterval.reverseInPlace();
        this.strokes.reverseInPlace();
    }
    fractionToPoint(fraction, result) {
        fraction = Geometry_1.Geometry.clampToStartEnd(fraction, 0, 1);
        const numStrokes = this.strokes.points.length - 1;
        const index0 = Math.trunc(fraction * numStrokes); // This indexes the point to the left of the query
        const fraction0 = index0 / numStrokes;
        result = result ? result : new PointVector_1.Point3d();
        result.setFrom(this.strokes.points[index0]);
        const globalFraction0 = this.activeFractionInterval.fractionToPoint(fraction0);
        const globalFraction1 = this.activeFractionInterval.fractionToPoint(fraction);
        this.fullSpiralIncrementalIntegral(result, globalFraction0, globalFraction1);
        this.localToWorld.multiplyPoint3d(result, result);
        return result;
    }
    fractionToPointAndDerivative(fraction, result) {
        result = result ? result : AnalyticGeometry_1.Ray3d.createZero();
        this.fractionToPoint(fraction, result.origin);
        const radians = this.fractionToBearingRadians(fraction);
        const a = this.arcLength01;
        this.localToWorld.matrix.multiplyXY(a * Math.cos(radians), a * Math.sin(radians), result.direction);
        return result;
    }
    /** Return the frenet frame at fractional position. */
    fractionToFrenetFrame(fraction, result) {
        result = result ? result : Transform_1.Transform.createIdentity();
        result.origin.setFrom(this.fractionToPoint(fraction));
        Transform_1.RotMatrix.createRigidFromRotMatrix(this.localToWorld.matrix, 0 /* XYZ */, result.matrix);
        const radians = this.fractionToBearingRadians(fraction);
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        result.matrix.applyGivensColumnOp(0, 1, c, -s);
        return result;
    }
    /** Return a plane with
     *
     * * origin at fractional position along the curve
     * * vectorU is the first derivative, i.e. tangent vector with length equal to the rate of change with respect to the fraction.
     * * vectorV is the second derivative, i.e.derivative of vectorU.
     */
    fractionToPointAnd2Derivatives(fraction, result) {
        const origin = this.fractionToPoint(fraction);
        const radians = this.fractionToBearingRadians(fraction);
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        const vectorX = this.localToWorld.matrix.multiplyXY(c, s);
        const vectorY = this.localToWorld.matrix.multiplyXY(-s, c);
        vectorY.scaleInPlace(this.fractionToCurvature(fraction));
        return AnalyticGeometry_1.Plane3dByOriginAndVectors.createCapture(origin, vectorX, vectorY, result);
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleTransitionSpiral(this);
    }
    extendRange(rangeToExtend, transform) {
        this.strokes.extendRange(rangeToExtend, transform);
    }
    isAlmostEqual(other) {
        if (other instanceof TransitionSpiral3d) {
            return this.radius01.isAlmostEqual(other.radius01)
                && this.bearing01.isAlmostEqualAllowPeriodShift(other.bearing01)
                && this.localToWorld.isAlmostEqual(other.localToWorld)
                && Geometry_1.Geometry.isSameCoordinate(this.arcLength01, other.arcLength01)
                && this.curvature01.isAlmostEqual(other.curvature01);
        }
        return false;
    }
}
TransitionSpiral3d.defaultSpiralType = "clothoid";
exports.TransitionSpiral3d = TransitionSpiral3d;
// at load time, initialize gauss quadrature workspace
TransitionSpiral3d.initWorkSpace();
//# sourceMappingURL=TransitionSpiral.js.map