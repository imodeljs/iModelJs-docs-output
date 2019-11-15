import { GrowableFloat64Array } from "./GrowableFloat64Array";
import { Angle } from "./Angle";
import { BeJSONFunctions, AngleSweepProps } from "../Geometry";
/** @module CartesianGeometry */
/**
 * An `AngleSweep` is a pair of angles at start and end of an interval.
 *
 * *  For stroking purposes, the "included interval" is all angles numerically reached by theta = start + f*(end-start), where f is between 0 and 1.
 * *  This stroking formula is simple numbers -- 2PI shifts are not involved.
 * *  2PI shifts do become important in the reverse mapping of an angle to a fraction.
 * *  If (start < end) the angle proceeds CCW around the unit circle.
 * *  If (end < start) the angle proceeds CW around the unit circle.
 * *  Angles beyond 360 are fine as endpoints.
 *   *  (350,370) covers the same unit angles as (-10,10).
 *   *  (370,350) covers the same unit angles as (10,-10).
 * @public
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
    /** Return a sweep with limits interpolated between this and other. */
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
    readonly isCCW: boolean;
    /** Ask if the sweep is a full circle. */
    readonly isFullCircle: boolean;
    /** Ask if the sweep is a full sweep from south pole to north pole. */
    readonly isFullLatitudeSweep: boolean;
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
    /** return the fractionalized position of the angle,
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
    /**
     * Convert a radians value to a fraction that is always positive and can wrap.  See `angleToPositivePeriodicFraction` for detailed description.
     * @param radians
     */
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
    /**
     * Convert a radians value to a fraction, allowing wraparound.  See `angleToSignedPeriodicFraction` for detailed description.
     */
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
    /** test if start and end angles match, with explicit name to clarify that there is no test for 360-degree shifts. */
    isAlmostEqualAllowPeriodShift(other: AngleSweep): boolean;
    /** test if start and end angles match, explicit name to clarify that 360-degree shifts are allowed. */
    isAlmostEqualNoPeriodShift(other: AngleSweep): boolean;
    /** test if start and end angles match with radians tolerance.
     * * This is equivalent to isAlmostEqualNoPeriodShift.
     * * it is present for consistency with other classes
     * * It is recommended that all callers use one of he longer names to be clear of their intentions:
     * * * isAlmostEqualAllowPeriodShift
     * * * isAlmostEqualRadiansNoPeriodShift
     */
    isAlmostEqual(other: AngleSweep): boolean;
}
//# sourceMappingURL=AngleSweep.d.ts.map