/** @module Curve */
import { AngleSweep, Angle } from "../Geometry";
import { Segment1d, Point3d } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { GeometryHandler } from "../GeometryHandler";
import { StrokeOptions } from "../curve/StrokeOptions";
import { CurvePrimitive, GeometryQuery } from "./CurvePrimitive";
import { Plane3dByOriginAndUnitNormal, Ray3d, Plane3dByOriginAndVectors } from "../AnalyticGeometry";
import { IStrokeHandler } from "../GeometryHandler";
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
 */
export declare class TransitionConditionalProperties {
    radius0: number | undefined;
    radius1: number | undefined;
    bearing0: Angle | undefined;
    bearing1: Angle | undefined;
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
}
export declare class TransitionSpiral3d extends CurvePrimitive {
    static radiusToCurvature(radius: number): number;
    static curvatureToRadius(curvature: number): number;
    static averageCurvature(radiusLimits: Segment1d): number;
    /**
     * Given two radii (or zeros for 0 curvature) return the average curvature
     * @param r0 start radius, or 0 for line
     * @param r1 end radius, or 0 for line
     */
    static averageCurvatureR0R1(r0: number, r1: number): number;
    static radiusRadiusSweepRadiansToArcLength(radius0: number, radius1: number, sweepRadians: number): number;
    static radiusRadiusLengthToSweepRadians(radius0: number, radius1: number, arcLength: number): number;
    static radius0LengthSweepRadiansToRadius1(radius0: number, arcLength: number, sweepRadians: number): number;
    static radius1LengthSweepRadiansToRadius0(radius1: number, arcLength: number, sweepRadians: number): number;
    activeFractionInterval: Segment1d;
    radius01: Segment1d;
    bearing01: AngleSweep;
    localToWorld: Transform;
    private _strokes;
    private _arcLength01;
    private _curvature01;
    private _spiralType;
    private _properties;
    constructor(spiralType: string | undefined, radius01: Segment1d, bearing01: AngleSweep, activeFractionInterval: Segment1d, localToWorld: Transform, arcLength: number, properties: TransitionConditionalProperties | undefined);
    /** Return the origial defining properties (if any) saved by the constructor. */
    readonly originalProperties: TransitionConditionalProperties | undefined;
    static readonly defaultSpiralType: string;
    /** return the spiral type as a string (undefined resolves to default type "clothoid") */
    getSpiralType(): string;
    /** Return the bearing at given fraction .... */
    fractionToBearingRadians(fraction: number): number;
    /** Return the curvature at given fraction ... */
    fractionToCurvature(fraction: number): number;
    private static _gaussFraction;
    private static _gaussWeight;
    private static _gaussMapper;
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
    setFrom(other: TransitionSpiral3d): TransitionSpiral3d;
    clone(): TransitionSpiral3d;
    tryTransformInPlace(transform: Transform): boolean;
    cloneTransformed(transform: Transform): TransitionSpiral3d;
    startPoint(): Point3d;
    endPoint(): Point3d;
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** Return length of the spiral.  Because TransitionSpiral is parameterized directly in terms of distance along, this is a simple return value. */
    quickLength(): number;
    /** Return length of the spiral.  Because TransitionSpiral is parameterized directly in terms of distance along, this is a simple return value. */
    curveLength(): number;
    isSameGeometryClass(other: any): boolean;
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    emitStrokableParts(dest: IStrokeHandler, options?: StrokeOptions): void;
    reverseInPlace(): void;
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Return the frenet frame at fractional position. */
    fractionToFrenetFrame(fraction: number, result?: Transform): Transform;
    /** Return a plane with
     *
     * * origin at fractional position along the curve
     * * vectorU is the first derivative, i.e. tangent vector with length equal to the rate of change with respect to the fraction.
     * * vectorV is the second derivative, i.e.derivative of vectorU.
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors | undefined;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    isAlmostEqual(other: GeometryQuery): boolean;
}
//# sourceMappingURL=TransitionSpiral.d.ts.map