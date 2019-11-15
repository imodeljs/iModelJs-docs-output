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
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Segment1d_1 = require("../geometry3d/Segment1d");
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Quadrature_1 = require("../numerics/Quadrature");
const StrokeOptions_1 = require("./StrokeOptions");
const CurvePrimitive_1 = require("./CurvePrimitive");
const Ray3d_1 = require("../geometry3d/Ray3d");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
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
 * @alpha
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
        if (this.bearing0) { // bearing 1 is undefined
            this.bearing1 = Angle_1.Angle.createRadians(this.bearing0.radians + TransitionSpiral3d.radiusRadiusLengthToSweepRadians(this.radius0, this.radius1, this.curveLength));
            return true;
        }
        if (this.bearing1) { // bearing 0 is undefined
            this.bearing0 = Angle_1.Angle.createRadians(this.bearing1.radians - TransitionSpiral3d.radiusRadiusLengthToSweepRadians(this.radius0, this.radius1, this.curveLength));
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
    /** Apply a NONZERO scale factor to all distances. */
    applyScaleFactor(a) {
        if (this.radius0 !== undefined)
            this.radius0 *= a;
        if (this.radius1 !== undefined)
            this.radius1 *= a;
        if (this.curveLength !== undefined)
            this.curveLength *= a;
    }
}
exports.TransitionConditionalProperties = TransitionConditionalProperties;
/**
 * A transition spiral is a curve defined by its curvature, with the curvature function symmetric about midpoint.
 * * `TransitionConditionalProperties` implements the computations of the interrelationship of radii, bearing, and length.
 * @alpha
 */
class TransitionSpiral3d extends CurvePrimitive_1.CurvePrimitive {
    // constructor demands all bearing, radius, and length data -- caller determines usual dependency of "any 4 determine the 5th"
    constructor(spiralType, radius01, bearing01, activeFractionInterval, localToWorld, arcLength, properties) {
        super();
        /** String name for schema properties */
        this.curvePrimitiveType = "transitionSpiral";
        this._spiralType = spiralType;
        this.localToWorld = localToWorld;
        this.radius01 = radius01;
        this.bearing01 = bearing01;
        this.localToWorld = localToWorld;
        this.activeFractionInterval = activeFractionInterval;
        this._arcLength01 = arcLength;
        this._globalStrokes = LineString3d_1.LineString3d.create();
        // initialize for compiler -- but this will be recomputed in refreshComputeProperties ...
        this._curvature01 = Segment1d_1.Segment1d.create(0, 1);
        this.refreshComputedProperties();
        this._properties = properties;
    }
    /** Return 1/r with convention that if true zero is given as radius it represents infinite radius (0 curvature, straight line) */
    static radiusToCurvature(radius) { return (radius === 0.0) ? 0.0 : 1.0 / radius; }
    /** Return 1/k with convention that if near-zero is given as curvature, its infinite radius is returned as 0 */
    static curvatureToRadius(curvature) {
        if (Math.abs(curvature) < Geometry_1.Geometry.smallAngleRadians)
            return 0.0;
        return 1.0 / curvature;
    }
    /** Return the average of the start and end curvatures. */
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
    /** Return the arc length of a transition spiral with given sweep and radius pair. */
    static radiusRadiusSweepRadiansToArcLength(radius0, radius1, sweepRadians) {
        return Math.abs(sweepRadians / TransitionSpiral3d.averageCurvatureR0R1(radius0, radius1));
    }
    /** Return the turn angle for spiral of given length between two radii */
    static radiusRadiusLengthToSweepRadians(radius0, radius1, arcLength) {
        return TransitionSpiral3d.averageCurvatureR0R1(radius0, radius1) * arcLength;
    }
    /** Return the end radius for spiral of given start radius, length, and turn angle. */
    static radius0LengthSweepRadiansToRadius1(radius0, arcLength, sweepRadians) {
        return TransitionSpiral3d.curvatureToRadius((2.0 * sweepRadians / arcLength) - TransitionSpiral3d.radiusToCurvature(radius0));
    }
    /** Return the start radius for spiral of given end radius, length, and turn angle. */
    static radius1LengthSweepRadiansToRadius0(radius1, arcLength, sweepRadians) {
        return TransitionSpiral3d.curvatureToRadius((2.0 * sweepRadians / arcLength) - TransitionSpiral3d.radiusToCurvature(radius1));
    }
    /** Return the internal stroked form of the (possibly partial) spiral   */
    get activeStrokes() { return this._activeStrokes !== undefined ? this._activeStrokes : this._globalStrokes; }
    /** Return the original defining properties (if any) saved by the constructor. */
    get originalProperties() { return this._properties; }
    /** return the spiral type as a string (undefined resolves to default type "clothoid") */
    getSpiralType() { if (this._spiralType === undefined)
        return TransitionSpiral3d.defaultSpiralType; return this._spiralType; }
    /** Return the bearing at given fraction .... */
    globalFractionToBearingRadians(fraction) {
        return this.bearing01.startRadians + fraction * this._arcLength01 * (this._curvature01.x0 + 0.5 * fraction * (this._curvature01.x1 - this._curvature01.x0));
    }
    /** Return the curvature at given fraction ... */
    globalFractionToCurvature(fraction) {
        // BUG? active interval
        return this._curvature01.fractionToPoint(fraction);
    }
    /** Return the bearing at given fraction of the active interval .... */
    fractionToBearingRadians(activeFraction) {
        const fraction = this.activeFractionInterval.fractionToPoint(activeFraction);
        return this.bearing01.startRadians + fraction * this._arcLength01 * (this._curvature01.x0 + 0.5 * fraction * (this._curvature01.x1 - this._curvature01.x0));
    }
    /** Return the curvature at given fraction of the active interval ... */
    fractionToCurvature(activeFraction) {
        // BUG? active interval
        return this._curvature01.fractionToPoint(this.activeFractionInterval.fractionToPoint(activeFraction));
    }
    /** Initialize class level work arrays. */
    static initWorkSpace() {
        TransitionSpiral3d._gaussFraction = new Float64Array(5);
        TransitionSpiral3d._gaussWeight = new Float64Array(5);
        TransitionSpiral3d._gaussMapper = Quadrature_1.Quadrature.setupGauss5;
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
    fullSpiralIncrementalIntegral(xyz, fractionA, fractionB, applyMatrix) {
        const gaussFraction = TransitionSpiral3d._gaussFraction;
        const gaussWeight = TransitionSpiral3d._gaussWeight;
        const numEval = TransitionSpiral3d._gaussMapper(fractionA, fractionB, gaussFraction, gaussWeight);
        const deltaL = this._arcLength01;
        let w = 0;
        let dx = 0.0;
        let dy = 0.0;
        for (let k = 0; k < numEval; k++) {
            const radians = this.globalFractionToBearingRadians(gaussFraction[k]);
            w = gaussWeight[k] * deltaL;
            dx += w * Math.cos(radians);
            dy += w * Math.sin(radians);
        }
        if (applyMatrix)
            Matrix3d_1.Matrix3d.xyzPlusMatrixTimesXYZ(xyz, this.localToWorld.matrix, { x: dx, y: dy, z: 0.0 }, xyz);
        else
            xyz.addXYZInPlace(dx, dy, 0.0);
    }
    /** Recompute strokes */
    refreshComputedProperties() {
        this._curvature01 = Segment1d_1.Segment1d.create(TransitionSpiral3d.radiusToCurvature(this.radius01.x0), TransitionSpiral3d.radiusToCurvature(this.radius01.x1));
        this._globalStrokes.clear();
        const currentPoint = Point3dVector3d_1.Point3d.create();
        this._globalStrokes.appendStrokePoint(currentPoint);
        const numInterval = 16;
        const fractionStep = 1.0 / numInterval;
        for (let i = 1; i <= numInterval; i++) {
            const fraction0 = (i - 1) * fractionStep;
            const fraction1 = i * fractionStep;
            this.fullSpiralIncrementalIntegral(currentPoint, fraction0, fraction1, false);
            this._globalStrokes.appendStrokePoint(currentPoint);
        }
        this._globalStrokes.tryTransformInPlace(this.localToWorld);
        if (!this.activeFractionInterval.isExact01) {
            if (this._activeStrokes === undefined)
                this._activeStrokes = LineString3d_1.LineString3d.create();
            this._activeStrokes.clear();
            // finer strokes in the active interval ... same fraction step, but mapped
            // This assumes factionToPoint acts normally within refreshComputedProperties -- that depends on the global strokes we just computed, but not on the active strokes
            for (let i = 0; i <= numInterval; i++) {
                const localFraction = i * fractionStep;
                this._activeStrokes.addPoint(this.fractionToPoint(localFraction));
            }
        }
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
            fractionInterval = Segment1d_1.Segment1d.create(0, 1);
        return new TransitionSpiral3d(spiralType, Segment1d_1.Segment1d.create(data.radius0, data.radius1), AngleSweep_1.AngleSweep.createStartEnd(data.bearing0, data.bearing1), fractionInterval ? fractionInterval.clone() : Segment1d_1.Segment1d.create(0, 1), localToWorld, data.curveLength, data1);
    }
    /** Copy all defining data from another spiral. */
    setFrom(other) {
        this.localToWorld.setFrom(other.localToWorld);
        this.radius01.setFrom(other.radius01);
        this._curvature01.setFrom(other._curvature01);
        this.bearing01.setFrom(other.bearing01);
        this.localToWorld.setFrom(other.localToWorld);
        this.activeFractionInterval.setFrom(other.activeFractionInterval);
        this._arcLength01 = other._arcLength01;
        return this;
    }
    /** Deep clone of this spiral */
    clone() {
        return TransitionSpiral3d.createRadiusRadiusBearingBearing(this.radius01, this.bearing01, this.activeFractionInterval, this.localToWorld);
    }
    /** apply `transform` to this spiral's local to world transform. */
    tryTransformInPlace(transformA) {
        const rigidData = transformA.matrix.factorRigidWithSignedScale();
        if (rigidData !== undefined) {
            // [sQ a][R b] = [sQ*R sQb+a]
            // but we save it as [Q*R sQb+a] with spiral data scaled by s.
            const transformC0 = transformA.multiplyTransformTransform(this.localToWorld);
            // BUT pull the scale part out of the matrix ...
            const matrixC = rigidData.rigidAxes.multiplyMatrixMatrix(this.localToWorld.matrix);
            this.localToWorld = Transform_1.Transform.createOriginAndMatrix(transformC0.origin, matrixC);
            this._curvature01.x0 /= rigidData.scale;
            this._curvature01.x1 /= rigidData.scale;
            this.radius01.x0 *= rigidData.scale;
            this.radius01.x1 *= rigidData.scale;
            this._arcLength01 *= rigidData.scale;
            if (this.originalProperties)
                this.originalProperties.applyScaleFactor(rigidData.scale);
        }
        this.refreshComputedProperties();
        return true;
    }
    /** Clone with a transform applied  */
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform); // ok, we're confident it will always work.
        return result;
    }
    /** Return the spiral start point. */
    startPoint() { return this.activeStrokes.startPoint(); }
    /** return the spiral end point. */
    endPoint() { return this.activeStrokes.endPoint(); }
    /** test if the local to world transform places the spiral xy plane into `plane` */
    isInPlane(plane) {
        return plane.isPointInPlane(this.localToWorld.origin)
            && Geometry_1.Geometry.isSameCoordinate(0.0, this.localToWorld.matrix.dotColumnX(plane.getNormalRef()))
            && Geometry_1.Geometry.isSameCoordinate(0.0, this.localToWorld.matrix.dotColumnY(plane.getNormalRef()));
    }
    /** Return length of the spiral.  Because TransitionSpiral is parameterized directly in terms of distance along, this is a simple return value. */
    quickLength() { return this._arcLength01; }
    /** Return length of the spiral.  Because TransitionSpiral is parameterized directly in terms of distance along, this is a simple return value. */
    curveLength() { return this._arcLength01; }
    /** Test if `other` is an instance of `TransitionSpiral3d` */
    isSameGeometryClass(other) { return other instanceof TransitionSpiral3d; }
    /** Add strokes from this spiral to `dest`.
     * * Linestrings will usually stroke as just their points.
     * * If maxEdgeLength is given, this will sub-stroke within the linestring -- not what we want.
     */
    emitStrokes(dest, options) { this.activeStrokes.emitStrokes(dest, options); }
    /** emit stroke fragments to `dest` handler. */
    emitStrokableParts(dest, options) {
        const n = this.computeStrokeCountForOptions(options);
        const activeStrokes = this.activeStrokes;
        dest.startParentCurvePrimitive(this);
        if (n <= activeStrokes.numPoints()) {
            this.activeStrokes.emitStrokableParts(dest, options);
        }
        else {
            dest.announceIntervalForUniformStepStrokes(this, n, 0.0, 1.0);
        }
        dest.endParentCurvePrimitive(this);
    }
    /**
     * return the stroke count required for given options.
     * @param options StrokeOptions that determine count
     */
    computeStrokeCountForOptions(options) {
        let numStroke = 1;
        if (options) {
            const rMin = Math.min(Math.abs(this.radius01.x0), Math.abs(this.radius01.x1));
            numStroke = options.applyTolerancesToArc(rMin, this.bearing01.sweepRadians);
            numStroke = options.applyMaxEdgeLength(numStroke, this.curveLength());
            numStroke = options.applyMinStrokesPerPrimitive(numStroke);
        }
        else {
            numStroke = StrokeOptions_1.StrokeOptions.applyAngleTol(undefined, 4, this.bearing01.sweepRadians);
        }
        return numStroke;
    }
    /** Reverse the active interval and active strokes.
     * * Primary defining data remains unchanged !!!
     */
    reverseInPlace() {
        this.activeFractionInterval.reverseInPlace();
        if (this._activeStrokes === undefined)
            this._activeStrokes = this._globalStrokes.clone();
        this._activeStrokes.reverseInPlace();
    }
    /** Evaluate curve point with respect to fraction. */
    fractionToPoint(activeFraction, result) {
        let globalFraction = this.activeFractionInterval.fractionToPoint(activeFraction);
        globalFraction = Geometry_1.Geometry.clampToStartEnd(globalFraction, 0, 1);
        const numStrokes = this._globalStrokes.packedPoints.length - 1;
        const index0 = Math.trunc(globalFraction * numStrokes); // This indexes the point to the left of the query
        const globalFraction0 = index0 / numStrokes;
        result = this._globalStrokes.packedPoints.getPoint3dAtUncheckedPointIndex(index0, result);
        this.fullSpiralIncrementalIntegral(result, globalFraction0, globalFraction, true);
        return result;
    }
    /** Evaluate curve point and derivative with respect to fraction. */
    fractionToPointAndDerivative(activeFraction, result) {
        const globalFraction = this.activeFractionInterval.fractionToPoint(activeFraction);
        result = result ? result : Ray3d_1.Ray3d.createZero();
        this.fractionToPoint(activeFraction, result.origin);
        const radians = this.globalFractionToBearingRadians(globalFraction);
        const a = this._arcLength01 * this.activeFractionInterval.signedDelta();
        this.localToWorld.matrix.multiplyXY(a * Math.cos(radians), a * Math.sin(radians), result.direction);
        return result;
    }
    /** Return the frenet frame at fractional position. */
    fractionToFrenetFrame(activeFraction, result) {
        const globalFraction = this.activeFractionInterval.fractionToPoint(activeFraction);
        result = result ? result : Transform_1.Transform.createIdentity();
        result.origin.setFrom(this.fractionToPoint(activeFraction));
        Matrix3d_1.Matrix3d.createRigidFromMatrix3d(this.localToWorld.matrix, Geometry_1.AxisOrder.XYZ, result.matrix);
        const radians = this.globalFractionToBearingRadians(globalFraction);
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
    fractionToPointAnd2Derivatives(activeFraction, result) {
        const globalFraction = this.activeFractionInterval.fractionToPoint(activeFraction);
        const origin = this.fractionToPoint(activeFraction);
        const radians = this.globalFractionToBearingRadians(globalFraction);
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        const delta = this.activeFractionInterval.signedDelta();
        const a = this._arcLength01 * delta;
        const b = a * delta;
        const vectorX = this.localToWorld.matrix.multiplyXY(a * c, a * s);
        const vectorY = this.localToWorld.matrix.multiplyXY(-b * s, b * c);
        vectorY.scaleInPlace(this.globalFractionToCurvature(globalFraction));
        return Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createCapture(origin, vectorX, vectorY, result);
    }
    /** Second step of double dispatch:  call `handler.handleTransitionSpiral(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleTransitionSpiral(this);
    }
    /** extend the range by the strokes of the spiral */
    extendRange(rangeToExtend, transform) {
        this.activeStrokes.extendRange(rangeToExtend, transform);
    }
    /** compare various coordinate quantities */
    isAlmostEqual(other) {
        if (other instanceof TransitionSpiral3d) {
            return this.radius01.isAlmostEqual(other.radius01)
                && this.bearing01.isAlmostEqualAllowPeriodShift(other.bearing01)
                && this.localToWorld.isAlmostEqual(other.localToWorld)
                && Geometry_1.Geometry.isSameCoordinate(this._arcLength01, other._arcLength01)
                && this.activeFractionInterval.isAlmostEqual(other.activeFractionInterval)
                && this._curvature01.isAlmostEqual(other._curvature01);
        }
        return false;
    }
}
exports.TransitionSpiral3d = TransitionSpiral3d;
/** default spiral type name. (clothoid) */
TransitionSpiral3d.defaultSpiralType = "clothoid";
// at load time, initialize gauss quadrature workspace
TransitionSpiral3d.initWorkSpace();
//# sourceMappingURL=TransitionSpiral.js.map