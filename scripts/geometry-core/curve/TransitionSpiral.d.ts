import { AngleSweep } from "../geometry3d/AngleSweep";
import { Angle } from "../geometry3d/Angle";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Segment1d } from "../geometry3d/Segment1d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryHandler, IStrokeHandler } from "../geometry3d/GeometryHandler";
import { StrokeOptions } from "./StrokeOptions";
import { CurvePrimitive } from "./CurvePrimitive";
import { GeometryQuery } from "./GeometryQuery";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { LineString3d } from "./LineString3d";
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
export declare class TransitionConditionalProperties {
    /** radius (or 0 at start) */
    radius0: number | undefined;
    /** radius (or 0) at end */
    radius1: number | undefined;
    /** bearing at start, measured from x towards y */
    bearing0: Angle | undefined;
    /** bearing at end, measured from x towards y */
    bearing1: Angle | undefined;
    /** curve length */
    curveLength: number | undefined;
    /**
     * capture numeric or undefined values
     * @param radius0 start radius or undefined
     * @param radius1 end radius or undefined
     * @param bearing0 start bearing or undefined
     * @param bearing1 end bearing or undefined
     * @param arcLength arc length or undefined
     */
    constructor(radius0: number | undefined, radius1: number | undefined, bearing0: Angle | undefined, bearing1: Angle | undefined, arcLength: number | undefined);
    /** return the number of defined values among the 5 properties. */
    numDefinedProperties(): number;
    /** clone with all properties (i.e. preserve undefined states) */
    clone(): TransitionConditionalProperties;
    /** Examine which properties are defined and compute the (single) undefined.
     * @returns Return true if the input state had precisely one undefined member.
     */
    tryResolveAnySingleUnknown(): boolean;
    private almostEqualCoordinate;
    private almostEqualBearing;
    /**
     * Test if this and other have matching numeric and undefined members.
     */
    isAlmostEqual(other: TransitionConditionalProperties): boolean;
    /** Apply a NONZERO scale factor to all distances. */
    applyScaleFactor(a: number): void;
}
/**
 * A transition spiral is a curve defined by its curvature, with the curvature function symmetric about midpoint.
 * * `TransitionConditionalProperties` implements the computations of the interrelationship of radii, bearing, and length.
 * @alpha
 */
export declare class TransitionSpiral3d extends CurvePrimitive {
    /** String name for schema properties */
    readonly curvePrimitiveType = "transitionSpiral";
    /** Return 1/r with convention that if true zero is given as radius it represents infinite radius (0 curvature, straight line) */
    static radiusToCurvature(radius: number): number;
    /** Return 1/k with convention that if near-zero is given as curvature, its infinite radius is returned as 0 */
    static curvatureToRadius(curvature: number): number;
    /** Return the average of the start and end curvatures. */
    static averageCurvature(radiusLimits: Segment1d): number;
    /**
     * Given two radii (or zeros for 0 curvature) return the average curvature
     * @param r0 start radius, or 0 for line
     * @param r1 end radius, or 0 for line
     */
    static averageCurvatureR0R1(r0: number, r1: number): number;
    /** Return the arc length of a transition spiral with given sweep and radius pair. */
    static radiusRadiusSweepRadiansToArcLength(radius0: number, radius1: number, sweepRadians: number): number;
    /** Return the turn angle for spiral of given length between two radii */
    static radiusRadiusLengthToSweepRadians(radius0: number, radius1: number, arcLength: number): number;
    /** Return the end radius for spiral of given start radius, length, and turn angle. */
    static radius0LengthSweepRadiansToRadius1(radius0: number, arcLength: number, sweepRadians: number): number;
    /** Return the start radius for spiral of given end radius, length, and turn angle. */
    static radius1LengthSweepRadiansToRadius0(radius1: number, arcLength: number, sweepRadians: number): number;
    /** Fractional interval for the "active" part of a containing spiral.
     * (The radius, angle, and length conditions define a complete spiral, and some portion of it is "active")
     */
    activeFractionInterval: Segment1d;
    /** start and end radii as a Segment1d */
    radius01: Segment1d;
    /** start and end bearings as an AngleSweep */
    bearing01: AngleSweep;
    /** Placement transform */
    localToWorld: Transform;
    /** stroked approximation of entire spiral. */
    private _globalStrokes;
    /** stroked approximation of active spiral.
     * * Same count as global -- possibly overly fine, but it gives some consistency between same clothoid constructed as partial versus complete.
     * * If no trimming, this points to the same place as the _globalStrokes !!!  Don't double transform!!!
     */
    private _activeStrokes?;
    /** Return the internal stroked form of the (possibly partial) spiral   */
    readonly activeStrokes: LineString3d;
    /** Total curve arc length (computed) */
    private _arcLength01;
    /** Curvatures (inverse radii) at start and end */
    private _curvature01;
    /** string name of spiral type */
    private _spiralType;
    /** Original defining properties. */
    private _properties;
    constructor(spiralType: string | undefined, radius01: Segment1d, bearing01: AngleSweep, activeFractionInterval: Segment1d, localToWorld: Transform, arcLength: number, properties: TransitionConditionalProperties | undefined);
    /** Return the original defining properties (if any) saved by the constructor. */
    readonly originalProperties: TransitionConditionalProperties | undefined;
    /** default spiral type name. (clothoid) */
    static readonly defaultSpiralType = "clothoid";
    /** return the spiral type as a string (undefined resolves to default type "clothoid") */
    getSpiralType(): string;
    /** Return the bearing at given fraction .... */
    globalFractionToBearingRadians(fraction: number): number;
    /** Return the curvature at given fraction ... */
    globalFractionToCurvature(fraction: number): number;
    /** Return the bearing at given fraction of the active interval .... */
    fractionToBearingRadians(activeFraction: number): number;
    /** Return the curvature at given fraction of the active interval ... */
    fractionToCurvature(activeFraction: number): number;
    private static _gaussFraction;
    private static _gaussWeight;
    private static _gaussMapper;
    /** Initialize class level work arrays. */
    static initWorkSpace(): void;
    /** Evaluate and sum the gauss quadrature formulas to integrate cos(theta), sin(theta) fractional subset of a reference length.
     * (recall that theta is a nonlinear function of the fraction.)
     * * This is a single interval of gaussian integration.
     * * The fraction is on the full spiral (not in the mapped active interval)
     * @param xyz advancing integrated point.
     * @param fractionA fraction at start of interval
     * @param fractionB fraction at end of interval.
     * @param unitArcLength length of curve for 0 to 1 fractional
     */
    private fullSpiralIncrementalIntegral;
    /** Recompute strokes */
    refreshComputedProperties(): void;
    /**
     * Create a transition spiral with radius and bearing conditions.
     * @param radius01 radius (inverse curvature) at start and end. (radius of zero means straight line)
     * @param bearing01 bearing angles at start and end.  bearings are measured from the x axis, positive clockwise towards y axis
     * @param activeFractionInterval fractional limits of the active portion of the spiral.
     * @param localToWorld placement frame.  Fractional coordinate 0 is at the origin.
     */
    static createRadiusRadiusBearingBearing(radius01: Segment1d, bearing01: AngleSweep, activeFractionInterval: Segment1d, localToWorld: Transform): TransitionSpiral3d;
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
    static create(spiralType: string | undefined, radius0: number | undefined, radius1: number | undefined, bearing0: Angle | undefined, bearing1: Angle | undefined, arcLength: number | undefined, fractionInterval: undefined | Segment1d, localToWorld: Transform): TransitionSpiral3d | undefined;
    /** Copy all defining data from another spiral. */
    setFrom(other: TransitionSpiral3d): TransitionSpiral3d;
    /** Deep clone of this spiral */
    clone(): TransitionSpiral3d;
    /** apply `transform` to this spiral's local to world transform. */
    tryTransformInPlace(transformA: Transform): boolean;
    /** Clone with a transform applied  */
    cloneTransformed(transform: Transform): TransitionSpiral3d;
    /** Return the spiral start point. */
    startPoint(): Point3d;
    /** return the spiral end point. */
    endPoint(): Point3d;
    /** test if the local to world transform places the spiral xy plane into `plane` */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** Return length of the spiral.  Because TransitionSpiral is parameterized directly in terms of distance along, this is a simple return value. */
    quickLength(): number;
    /** Return length of the spiral.  Because TransitionSpiral is parameterized directly in terms of distance along, this is a simple return value. */
    curveLength(): number;
    /** Test if `other` is an instance of `TransitionSpiral3d` */
    isSameGeometryClass(other: any): boolean;
    /** Add strokes from this spiral to `dest`.
     * * Linestrings will usually stroke as just their points.
     * * If maxEdgeLength is given, this will sub-stroke within the linestring -- not what we want.
     */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** emit stroke fragments to `dest` handler. */
    emitStrokableParts(dest: IStrokeHandler, options?: StrokeOptions): void;
    /**
     * return the stroke count required for given options.
     * @param options StrokeOptions that determine count
     */
    computeStrokeCountForOptions(options?: StrokeOptions): number;
    /** Reverse the active interval and active strokes.
     * * Primary defining data remains unchanged !!!
     */
    reverseInPlace(): void;
    /** Evaluate curve point with respect to fraction. */
    fractionToPoint(activeFraction: number, result?: Point3d): Point3d;
    /** Evaluate curve point and derivative with respect to fraction. */
    fractionToPointAndDerivative(activeFraction: number, result?: Ray3d): Ray3d;
    /** Return the frenet frame at fractional position. */
    fractionToFrenetFrame(activeFraction: number, result?: Transform): Transform;
    /** Return a plane with
     *
     * * origin at fractional position along the curve
     * * vectorU is the first derivative, i.e. tangent vector with length equal to the rate of change with respect to the fraction.
     * * vectorV is the second derivative, i.e.derivative of vectorU.
     */
    fractionToPointAnd2Derivatives(activeFraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors | undefined;
    /** Second step of double dispatch:  call `handler.handleTransitionSpiral(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /** extend the range by the strokes of the spiral */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** compare various coordinate quantities */
    isAlmostEqual(other: GeometryQuery): boolean;
}
//# sourceMappingURL=TransitionSpiral.d.ts.map