/** @module CartesianGeometry */
import { Point3d, Vector3d, Point2d, Vector2d, XY, XYZ } from "./PointVector";
import { GrowableFloat64Array } from "./GrowableArray";
/** Enumeration of the 6 possible orderings of XYZ axis order */
export declare const enum AxisOrder {
    /** Right handed system, X then Y then Z */
    XYZ = 0,
    /** Right handed system, Y then Z then X */
    YZX = 1,
    /** Right handed system, Z then X then Y */
    ZXY = 2,
    /** Left handed system, X then Z then Y */
    XZY = 4,
    /** Left handed system, Y then X then Z */
    YXZ = 5,
    /** Left handed system, Z then Y then X */
    ZYX = 6,
}
export declare const enum AxisIndex {
    X = 0,
    Y = 1,
    Z = 2,
}
/** Enumeration among choice for how a coordinate transformation should incorporate scaling. */
export declare const enum AxisScaleSelect {
    /** All axes of unit length. */
    Unit = 0,
    /** On each axis, the vector length matches the longest side of the range of the data. */
    LongestRangeDirection = 1,
    /** On each axis, the vector length matches he length of the corresponding edge of the range. */
    NonUniformRangeContainment = 2,
}
export interface TrigValues {
    c: number;
    s: number;
    radians: number;
}
export interface BeJSONFunctions {
    /**
     * Set content from a JSON object.
     * If the json object is undefined or unrecognized, always set a default value.
     */
    setFromJSON(json: any): void;
    toJSON(): any;
}
/** The Properties for a JSON representation of an Angle.
 * If value is a number, it is in *degrees*.
 * If value is an object, it can have either degrees or radians.
 */
export declare type AngleProps = {
    degrees: number;
} | {
    radians: number;
} | number;
/** The Properties for a JSON representation of an AngleSweep.
 * * The json data is always start and end angles as a pair in an array.
 * If AngleProps data is an array of two numbers, it is an angle in degrees.
 * If the AngleProps is an object with key degrees, the degrees value must be an array with the two degrees angles as numbers
 * If the AngleProps is an object with key radians, the radians value must be an array with the two radians angles as numbers
 */
export declare type AngleSweepProps = {
    degrees: [number, number];
} | {
    radians: [number, number];
} | [number, number];
export declare class Geometry {
    static readonly smallMetricDistance: number;
    static readonly smallMetricDistanceSquared: number;
    static readonly smallAngleRadians: number;
    static readonly smallAngleRadiansSquared: number;
    static readonly largeFractionResult: number;
    static readonly fullCircleRadiansMinusSmallAngle: number;
    /** Points and vectors can be emitted in two forms:
      *
      * *  preferJSONArray === true :       [x,y,z]
      * *  preferJSONArray === false :      {x: 1, y: 2, z: 3}
      */
    static correctSmallMetricDistance(distance: number, replacement?: number): number;
    /**
   * @returns If `a` is large enough, return `1/a`, using Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
   * @param a denominator of division
   */
    static inverseMetricDistance(a: number): number | undefined;
    /**
     * @returns If `a` is large enough, return `1/a`, using the square of Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
     * @param a denominator of division
     */
    static inverseMetricDistanceSquared(a: number): number | undefined;
    static isSameCoordinate(x: number, y: number, tol?: number): boolean;
    static isSameCoordinateSquared(x: number, y: number): boolean;
    static isSamePoint3d(dataA: Point3d, dataB: Point3d): boolean;
    static isSameXYZ(dataA: XYZ, dataB: XYZ): boolean;
    static isSamePoint3dXY(dataA: Point3d, dataB: Point3d): boolean;
    static isSameVector3d(dataA: Vector3d, dataB: Vector3d): boolean;
    static isSamePoint2d(dataA: Point2d, dataB: Point2d): boolean;
    static isSameVector2d(dataA: Vector2d, dataB: Vector2d): boolean;
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with x as first test, y second.
     */
    static lexicalXYLessThan(a: XY | XYZ, b: XY | XYZ): 0 | 1 | -1;
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with y as first test, x second.
     */
    static lexicalYXLessThan(a: XY | XYZ, b: XY | XYZ): 0 | 1 | -1;
    static lexicalXYZLessThan(a: XYZ, b: XYZ): 0 | 1 | -1;
    static isSmallRelative(value: number): boolean;
    static isSmallAngleRadians(value: number): boolean;
    static isAlmostEqualNumber(a: number, b: number): boolean;
    static isDistanceWithinTol(distance: number, tol: number): boolean;
    static isSmallMetricDistance(distance: number): boolean;
    static isSmallMetricDistanceSquared(distanceSquared: number): boolean;
    static cyclic3dAxis(axis: number): number;
    /** Return the AxisOrder for which axisIndex is the first named axis.
     * * `axisIndex===0`returns AxisOrder.XYZ
     * * `axisIndex===1`returns AxisOrder.YZX
     * * `axisIndex===2`returns AxisOrder.ZXY
     */
    static axisIndexToRightHandedAxisOrder(axisIndex: AxisIndex): AxisOrder;
    /** @returns the largest absolute distance from a to either of b0 or b1 */
    static maxAbsDiff(a: number, b0: number, b1: number): number;
    /** @returns the largest absolute absolute value among x,y,z */
    static maxAbsXYZ(x: number, y: number, z: number): number;
    /** @returns the largest signed value among a, b, c */
    static maxXYZ(a: number, b: number, c: number): number;
    /** @returns Return the hypotenuse sqrt(x\*x + y\*y). This is much faster than Math.hypot(x,y).*/
    static hypotenuseXY(x: number, y: number): number;
    /** @returns Return the squared hypotenuse (x\*x + y\*y). */
    static hypotenuseSquaredXY(x: number, y: number): number;
    /** @returns Return the square of x */
    static square(x: number): number;
    /** @returns Return the hypotenuse sqrt(x\*x + y\*y). This is much faster than Math.hypot(x,y, z).*/
    static hypotenuseXYZ(x: number, y: number, z: number): number;
    static hypotenuseSquaredXYZ(x: number, y: number, z: number): number;
    static hypotenuseXYZW(x: number, y: number, z: number, w: number): number;
    static hypotenuseSquaredXYZW(x: number, y: number, z: number, w: number): number;
    /**
     * Return the distance between xy points given as numbers.
     * @param x0 x coordinate of point 0
     * @param y0 y coordinate of point 0
     * @param x1 x coordinate of point 1
     * @param y1 y coordinate of point 1
     */
    static distanceXYXY(x0: number, y0: number, x1: number, y1: number): number;
    /**
     * Return the distance between xyz points given as numbers.
     * @param x0 x coordinate of point 0
     * @param y0 y coordinate of point 0
     * @param z0 z coordinate of point 0
     * @param x1 x coordinate of point 1
     * @param y1 y coordinate of point 1
     * @param z1 z coordinate of point 1
     */
    static distanceXYZXYZ(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): number;
    /** @returns Returns the triple product of 3 vectors provided as x,y,z number sequences.
     *
     * * The triple product is the determinant of the 3x3 matrix with the 9 numbers placed in either row or column order.
     * * The triple product is positive if the 3 vectors form a right handed coordinate system.
     * * The triple product is negative if the 3 vectors form a left handed coordinate system.
     * * Treating the 9 numbers as 3 vectors U, V, W, any of these formulas gives the same result:
     *
     * ** U dot (V cross W)
     * ** V dot (W cross U)
     * ** W dot (U cross V)
     * **  (-U dot (W cross V))  -- (note the negative -- reversing cross product order changes the sign)
     * ** (-V dot (U cross W)) -- (note the negative -- reversing cross product order changes the sign)
     * ** (-W dot (V cross U)) -- (note the negative -- reversing cross product order changes the sign)
     * * the triple product is 6 times the (signed) volume of the tetrahedron with the three vectors as edges from a common vertex.
     */
    static tripleProduct(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, wx: number, wy: number, wz: number): number;
    /**  2D cross product of vectors layed out as scalars. */
    static crossProductXYXY(ux: number, uy: number, vx: number, vy: number): number;
    /**  3D cross product of vectors layed out as scalars. */
    static crossProductXYZXYZ(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, result?: Vector3d): Vector3d;
    /**  3D dot product of vectors layed out as scalars. */
    static dotProductXYZXYZ(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number): number;
    static clampToStartEnd(x: number, a: number, b: number): number;
    /** simple interpolation between values, but choosing (based on fraction) a or b as starting point for maximum accuracy. */
    static interpolate(a: number, f: number, b: number): number;
    /** given an axisOrder (e.g. XYZ, YZX, ZXY, XZYLeftHanded etc) and an (integer) offset, resolve to an axis index. */
    static axisOrderToAxis(order: AxisOrder, index: number): number;
    /** Return (a modulo period), e.g. for use as a cyclid index.  Both a and period may be negative. */
    static modulo(a: number, period: number): number;
    /** return 0 if the value is undefined, 1 if defined. */
    static defined01(value: any): number;
    /** normally, return numerator/denominator.
     * but if the ratio would exceed Geometry.largeFractionResult, return undefined.
     */
    static conditionalDivideFraction(numerator: number, denominator: number): number | undefined;
    /** return the 0, 1, or 2 pairs of (c,s) values that solve
     * {constCoff + cosCoff * c + sinCoff * s = }
     * with the constraint {c*c+s*s = 1}
     */
    static solveTrigForm(constCoff: number, cosCoff: number, sinCoff: number): Vector2d[] | undefined;
    /** normally,  return the number result of conditionalDivideFraction.
     * but if conditionalDivideFraction fails return specified default number.
     */
    static safeDivideFraction(numerator: number, denominator: number, defaultResult: number): number;
    /** For a line f(x) whose function values at x0 and x1 are f0 and f1, return the x value at which f(x)=fTarget;
     */
    static inverseInterpolate(x0: number, f0: number, x1: number, f1: number, targetF?: number): number | undefined;
    /** For a line f(x) whose function values at x=0 and x=1 are f0 and f1, return the x value at which f(x)=fTarget;
     */
    static inverseInterpolate01(f0: number, f1: number, targetF?: number): number | undefined;
    /** Return true if json is an array with at least minEntries, and all entries are numbers (including those beyond minEntries) */
    static isNumberArray(json: any, minEntries?: number): boolean;
    /** Return true if json is an array of at least numNumberArrays, with at least minEntries in each number array.
     */
    static isArrayOfNumberArray(json: any, numNumberArray: number, minEntries?: number): boolean;
    /** return the number of steps to take so that numSteps * stepSize >= total.
     * minCount is returned for both (a) setSize 0 or less and (b) stepSize > total.
     * A small tolerance is applied for almost
    */
    static stepCount(stepSize: number, total: number, minCount?: number, maxCount?: number): number;
    /** Test if x is in simple 0..1 interval.  But optionally skip the test.  (this odd behavior is very convenient for code that sometimes does not do the filtering.)
     * @param x value to test.
     * @param apply01 if false, accept all x.
     */
    static isIn01(x: number, apply01?: boolean): boolean;
}
/**
 * Carries the numeric value of an angle.
 * * The numeric value is private, and callers should not know or care whether it is in degrees or radians.
 * * The various access method are named so that callers can specify whether untyped numbers passed in or out are degrees or radians.
 */
export declare class Angle implements BeJSONFunctions {
    static readonly piOver4Radians: number;
    static readonly piOver2Radians: number;
    static readonly piRadians: number;
    static readonly pi2Radians: number;
    static readonly degreesPerRadian: number;
    static readonly radiansPerDegree: number;
    static readonly piOver12Radians: number;
    private _radians;
    private _degrees?;
    private constructor();
    clone(): Angle;
    /**
     * Return a new Angle object for angle given in degrees.
     * @param degrees angle in degrees
     */
    static createDegrees(degrees: number): Angle;
    /**
     * Return a (new) Angle object for a value given in radians.
     * @param radians angle in radians
     */
    static createRadians(radians: number): Angle;
    /**
     * Set this angle to a value given in radians.
     * @param radians angle given in radians
     */
    setRadians(radians: number): void;
    /**
     * Set this angle to a value given in degrees.
     * @param degrees angle given in degrees.
     */
    setDegrees(degrees: number): void;
    /** Create an angle for a full circle. */
    static create360(): Angle;
    /**
     * @return a (strongly typed) Angle whose tangent is `numerator/denominator`, using the signs of both in determining the (otherwise ambiguous)
     * quadrant.
     * @param numerator numerator for tangent
     * @param denominator denominator for tangent
     */
    static createAtan2(numerator: number, denominator: number): Angle;
    /**
     * Copy all contents of `other` to this Angle.
     * @param other source data
     */
    setFrom(other: Angle): void;
    /**
     * Create an Angle from a JSON object
     * @param json object from JSON.parse. If a number, value is in *DEGREES*
     * @param defaultValRadians if json is undefined, default value in radians.
     * @return a new Angle
     */
    static fromJSON(json?: AngleProps, defaultValRadians?: number): Angle;
    /**
     * set an Angle from a JSON object
     * * A simple number is degrees.
     * * specified `json.degrees` or `json._degrees` is degree value.
     * * specified `son.radians` or `json._radians` is radians value.
     * @param json object from JSON.parse. If a number, value is in *DEGREES*
     * @param defaultValRadians if json is undefined, default value in radians.
     */
    setFromJSON(json?: AngleProps, defaultValRadians?: number): void;
    /** Convert an Angle to a JSON object as a number in degrees */
    toJSON(): AngleProps;
    toJSONRadians(): AngleProps;
    /** @returns Return the angle measured in radians. */
    readonly radians: number;
    /** @returns Return the angle measured in degrees. */
    readonly degrees: number;
    /**
     * Convert an angle in degrees to radians.
     * @param degrees angle in degrees
     */
    static degreesToRadians(degrees: number): number;
    /**
     * Convert an angle in radians to degrees.
     * @param degrees angle in radians
     */
    static radiansToDegrees(radians: number): number;
    /**
     * @returns Return the cosine of this Angle object's angle.
     */
    cos(): number;
    /**
     * @returns Return the sine of this Angle object's angle.
     */
    sin(): number;
    /**
     * @returns Return the tangent of this Angle object's angle.
     */
    tan(): number;
    static isFullCircleRadians(radians: number): boolean;
    isFullCircle(): boolean;
    /** Adjust a radians value so it is positive in 0..360 */
    static adjustDegrees0To360(degrees: number): number;
    /** Adjust a radians value so it is positive in -180..180 */
    static adjustDegreesSigned180(degrees: number): number;
    /** Adjust a radians value so it is positive in 0..2Pi */
    static adjustRadians0To2Pi(radians: number): number;
    /** Adjust a radians value so it is positive in -PI..PI */
    static adjustRadiansMinusPiPlusPi(radians: number): number;
    static zero(): Angle;
    isExactZero(): boolean;
    isAlmostZero(): boolean;
    /** Create an angle object with degrees adjusted into 0..360. */
    static createDegreesAdjustPositive(degrees: number): Angle;
    /** Create an angle object with degrees adjusted into -180..180. */
    static createDegreesAdjustSigned180(degrees: number): Angle;
    /**
     * Test if two radians values are equivalent, allowing shift by full circle (i.e. by a multiple of `2*PI`)
     * @param radiansA first radians value
     * @param radiansB second radians value
     */
    static isAlmostEqualRadiansAllowPeriodShift(radiansA: number, radiansB: number): boolean;
    /**
     * Test if this angle and other are equivalent, allowing shift by full circle (i.e. by a multiple of 360 degrees)
     */
    isAlmostEqualAllowPeriodShift(other: Angle): boolean;
    /**
     * Test if two this angle and other are almost equal, NOT allowing shift by full circle multiples of 360 degrees.
     */
    isAlmostEqualNoPeriodShift(other: Angle): boolean;
    /**
     * Test if two angle (in radians)  almost equal, NOT allowing shift by full circle multiples of `2 * PI`.
     */
    static isAlmostEqualRadiansNoPeriodShift(radiansA: number, radiansB: number): boolean;
    /**
     * Test if dot product values indicate non-zero length perpendicular vectors.
     * @param dotUU dot product of vectorU with itself
     * @param dotVV dot product of vectorV with itself
     * @param dotUV dot product of vectorU with vectorV
     */
    static isPerpendicularDotSet(dotUU: number, dotVV: number, dotUV: number): boolean;
    /**
     * Return cosine, sine, and radians for the half angle of a cosine,sine pair.
     * @param rCos2A cosine value (scaled by radius) for initial angle.
     * @param rSin2A sine value (scaled by radius) for final angle.
     */
    static trigValuesToHalfAngleTrigValues(rCos2A: number, rSin2A: number): TrigValues;
    /**
       * Return the half angle of angle between vectors U, V with given vector dots.
       * @param dotUU dot product of vectorU with itself
       * @param dotVV dot product of vectorV with itself
       * @param dotUV dot product of vectorU with vectorV
       */
    static dotProductsToHalfAngleTrigValues(dotUU: number, dotVV: number, dotUV: number, favorZero?: boolean): TrigValues;
}
/**
 * An AngleSweep is a pair of angles at start and end of an interval.
 *
 * *  For stroking purposes, the "included interval" is all angles numerically reached by theta = start + f*(end-start), where f is between 0 and 1.
 * *  This stroking formula is simple numbers -- 2PI shifts are not involved.
 * *  2PI shifts do become important in the reverse mapping of an angle to a fraction.
 * *  If (start < end) the angle proceeds CCW around the unit circle.
 * *  If (end < start) the angle proceeds CW around the unit circle.
 * *  Angles beyond 360 are fine as endpoints.
 *
 * **  (350,370) covers the same unit angles as (-10,10).
 * **  (370,350) covers the same unit angles as (10,-10).
 */
export declare class AngleSweep implements BeJSONFunctions {
    private _radians0;
    private _radians1;
    /** Read-property for degrees at the start of this AngleSweep. */
    readonly startDegrees: number;
    /** Read-property for degrees at the end of this AngleSweep. */
    readonly endDegrees: number;
    /** Read-property for signed start-to-end sweep in degrees. */
    readonly sweepDegrees: number;
    /** Read-property for degrees at the start of this AngleSweep. */
    readonly startRadians: number;
    /** Read-property for degrees at the end of this AngleSweep. */
    readonly endRadians: number;
    /** Read-property for signed start-to-end sweep in radians. */
    readonly sweepRadians: number;
    /** Return the (strongly typed) start angle */
    readonly startAngle: Angle;
    /** Return the (strongly typed) end angle */
    readonly endAngle: Angle;
    /** (private) constructor with start and end angles in radians.
     *  * Use explicitly named static methods to clarify intent and units of inputs:
     *
     * * createStartEndRadians (startRadians:number, endRadians:number)
     * * createStartEndDegrees (startDegrees:number, endDegrees:number)
     * * createStartEnd (startAngle:Angle, endAngle:Angle)
     * * createStartSweepRadians (startRadians:number, sweepRadians:number)
     * * createStartSweepDegrees (startDegrees:number, sweepDegrees:number)
     * * createStartSweep (startAngle:Angle, sweepAngle:Angle)
    */
    private constructor();
    /** create an AngleSweep from start and end angles given in radians. */
    static createStartEndRadians(startRadians?: number, endRadians?: number, result?: AngleSweep): AngleSweep;
    /** Return the angle obtained by subtracting radians from this angle. */
    cloneMinusRadians(radians: number): AngleSweep;
    /** create an AngleSweep from start and end angles given in degrees. */
    static createStartEndDegrees(startDegrees?: number, endDegrees?: number, result?: AngleSweep): AngleSweep;
    /** create an angle sweep from strongly typed start and end angles */
    static createStartEnd(startAngle: Angle, endAngle: Angle, result?: AngleSweep): AngleSweep;
    /** Create an angle sweep with limits given as (strongly typed) angles for start and sweep */
    static createStartSweep(startAngle: Angle, sweepAngle: Angle, result?: AngleSweep): AngleSweep;
    /** @returns Return a sweep with limits interpolated between this and other. */
    interpolate(fraction: number, other: AngleSweep): AngleSweep;
    /** create an AngleSweep from start and end angles given in radians. */
    static createStartSweepRadians(startRadians?: number, sweepRadians?: number, result?: AngleSweep): AngleSweep;
    /** create an AngleSweep from start and sweep given in degrees.  */
    static createStartSweepDegrees(startDegrees?: number, sweepDegrees?: number, result?: AngleSweep): AngleSweep;
    /** directly set the start and end angles in radians */
    setStartEndRadians(startRadians?: number, endRadians?: number): void;
    /** directly set the start and end angles in degrees */
    setStartEndDegrees(startDegrees?: number, endDegrees?: number): void;
    /** copy from other AngleSweep. */
    setFrom(other: AngleSweep): void;
    /** create a full circle sweep (CCW). startRadians defaults to 0 */
    static create360(startRadians?: number): AngleSweep;
    /** create a sweep from the south pole to the north pole. */
    static createFullLatitude(): AngleSweep;
    /** Reverse the start and end angle in place. */
    reverseInPlace(): void;
    /** Restrict start and end angles into the range (-90,+90) in degrees. */
    capLatitudeInPlace(): void;
    /** Ask if the sweep is counterclockwise, i.e. positive sweep */
    isCCW(): boolean;
    /** Ask if the sweep is a full circle. */
    isFullCircle(): boolean;
    /** Ask if the sweep is a full sweep from south pole to north pole. */
    isFullLatitudeSweep(): boolean;
    /** return a clone of this sweep. */
    clone(): AngleSweep;
    /** Convert fractional position in the sweep to radians. */
    fractionToRadians(fraction: number): number;
    /** Convert fractional position in the sweep to strongly typed Angle object. */
    fractionToAngle(fraction: number): Angle;
    /** return 2PI divided by the sweep radians (i.e. 360 degrees divided by sweep angle).
     * This is the number of fractional intervals required to cover a whole circle.
     */
    fractionPeriod(): number;
    /** return the fractional ized position of the angle,
     * computed without consideration of 2PI period.
     * That is, an angle that is numerically much beyond than the end angle
     * will produce a large fraction and an angle much beyond the start angle
     * will produce a large negative fraction.
     *
     */
    angleToUnboundedFraction(theta: Angle): number;
    /** map an angle to a fractional coordinate which is:
    *
    * *  the start angle is at fraction 0
    * *  the end angle is at fraction 1
    * *  interior angles are between 0 and 1
    * *  all exterior angles are at fractions greater than 1
    * *  the periodic jump is at full wraparound to the start angle
     */
    angleToPositivePeriodicFraction(theta: Angle): number;
    /**
     * Convert each value in an array from radians to fraction.
     * @param data array that is input as radians, output as fractions
     */
    radiansArraytoPositivePeriodicFractions(data: GrowableFloat64Array): void;
    radiansToPositivePeriodicFraction(radians: number): number;
    /** map an angle to a fractional coordinate which is:
    *
    * *  the start angle is at fraction 0
    * *  the end angle is at fraction 1
    * *  interior angles are between 0 and 1
    * *  small negative for angles just "before" the start angle
    * *  more than one for angles just "after" the end angle
    * *  the periodic jump is at the middle of the "outside" interval
    */
    angleToSignedPeriodicFraction(theta: Angle): number;
    radiansToSignedPeriodicFraction(radians: number): number;
    /** test if an angle is within the sweep */
    isAngleInSweep(angle: Angle): boolean;
    /** test if radians are within sweep  */
    isRadiansInSweep(radians: number): boolean;
    /** set this AngleSweep from various sources:
     *
     * * if json is undefined, a full-circle sweep is returned.
     * * If json is an AngleSweep object it is is cloned
     * * If json is an array of 2 numbers, those numbers are start and end angles in degrees.
     * * If `json.degrees` is an array of 2 numbers, those numbers are start and end angles in degrees.
     * * If `json.radians` is an array of 2 numbers, those numbers are start and end angles in radians.
     */
    setFromJSON(json?: any): void;
    /** create an AngleSweep from a json object. */
    static fromJSON(json?: AngleSweepProps): AngleSweep;
    /**
     * Convert an AngleSweep to a JSON object.
     * @return {*} {degrees: [startAngleInDegrees, endAngleInDegrees}
     */
    toJSON(): any;
    /** test if start and end angles match, with no test for 360-degree shifts. */
    isAlmostEqualAllowPeriodShift(other: AngleSweep): boolean;
    /** test if start and end angles match, allowing for 360-degree shifts. */
    isAlmostEqualNoPeriodShift(other: AngleSweep): boolean;
}
