"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Angle_1 = require("./Angle");
const Geometry_1 = require("../Geometry");
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
class AngleSweep {
    /** Read-property for degrees at the start of this AngleSweep. */
    get startDegrees() { return Angle_1.Angle.radiansToDegrees(this._radians0); }
    /** Read-property for degrees at the end of this AngleSweep. */
    get endDegrees() { return Angle_1.Angle.radiansToDegrees(this._radians1); }
    /** Read-property for signed start-to-end sweep in degrees. */
    get sweepDegrees() { return Angle_1.Angle.radiansToDegrees(this._radians1 - this._radians0); }
    /** Read-property for degrees at the start of this AngleSweep. */
    get startRadians() { return this._radians0; }
    /** Read-property for degrees at the end of this AngleSweep. */
    get endRadians() { return this._radians1; }
    /** Read-property for signed start-to-end sweep in radians. */
    get sweepRadians() { return this._radians1 - this._radians0; }
    /** Return the (strongly typed) start angle */
    get startAngle() { return Angle_1.Angle.createRadians(this._radians0); }
    /** Return the (strongly typed) end angle */
    get endAngle() { return Angle_1.Angle.createRadians(this._radians1); }
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
    constructor(startRadians = 0, endRadians = 0) { this._radians0 = startRadians; this._radians1 = endRadians; }
    /** create an AngleSweep from start and end angles given in radians. */
    static createStartEndRadians(startRadians = 0, endRadians = 2.0 * Math.PI, result) {
        result = result ? result : new AngleSweep();
        result.setStartEndRadians(startRadians, endRadians);
        return result;
    }
    /** Return the angle obtained by subtracting radians from this angle. */
    cloneMinusRadians(radians) { return new AngleSweep(this._radians0 - radians, this._radians1 - radians); }
    /** create an AngleSweep from start and end angles given in degrees. */
    static createStartEndDegrees(startDegrees = 0, endDegrees = 360, result) {
        return AngleSweep.createStartEndRadians(Angle_1.Angle.degreesToRadians(startDegrees), Angle_1.Angle.degreesToRadians(endDegrees), result);
    }
    /** create an angle sweep from strongly typed start and end angles */
    static createStartEnd(startAngle, endAngle, result) {
        result = result ? result : new AngleSweep();
        result.setStartEndRadians(startAngle.radians, endAngle.radians);
        return result;
    }
    /** Create an angle sweep with limits given as (strongly typed) angles for start and sweep */
    static createStartSweep(startAngle, sweepAngle, result) {
        return AngleSweep.createStartSweepRadians(startAngle.radians, sweepAngle.radians, result);
    }
    /** @returns Return a sweep with limits interpolated between this and other. */
    interpolate(fraction, other) {
        return new AngleSweep(Geometry_1.Geometry.interpolate(this._radians0, fraction, other._radians0), Geometry_1.Geometry.interpolate(this._radians1, fraction, other._radians1));
    }
    /** create an AngleSweep from start and end angles given in radians. */
    static createStartSweepRadians(startRadians = 0, sweepRadians = Math.PI, result) {
        result = result ? result : new AngleSweep();
        result.setStartEndRadians(startRadians, startRadians + sweepRadians);
        return result;
    }
    /** create an AngleSweep from start and sweep given in degrees.  */
    static createStartSweepDegrees(startDegrees = 0, sweepDegrees = 360, result) {
        return AngleSweep.createStartEndRadians(Angle_1.Angle.degreesToRadians(startDegrees), Angle_1.Angle.degreesToRadians(startDegrees + sweepDegrees), result);
    }
    /** directly set the start and end angles in radians */
    setStartEndRadians(startRadians = 0, endRadians = 2.0 * Math.PI) {
        const delta = endRadians - startRadians;
        if (Angle_1.Angle.isFullCircleRadians(delta)) {
            endRadians = startRadians + (delta > 0 ? 2.0 : -2.0) * Math.PI;
        }
        this._radians0 = startRadians;
        this._radians1 = endRadians;
    }
    /** directly set the start and end angles in degrees */
    setStartEndDegrees(startDegrees = 0, endDegrees = 360.0) {
        this.setStartEndRadians(Angle_1.Angle.degreesToRadians(startDegrees), Angle_1.Angle.degreesToRadians(endDegrees));
    }
    /** copy from other AngleSweep. */
    setFrom(other) { this._radians0 = other._radians0; this._radians1 = other._radians1; }
    /** create a full circle sweep (CCW). startRadians defaults to 0 */
    static create360(startRadians) {
        startRadians = startRadians ? startRadians : 0.0;
        return new AngleSweep(startRadians, startRadians + 2.0 * Math.PI);
    }
    /** create a sweep from the south pole to the north pole. */
    static createFullLatitude() { return AngleSweep.createStartEndRadians(-0.5 * Math.PI, 0.5 * Math.PI); }
    /** Reverse the start and end angle in place. */
    reverseInPlace() { const a = this._radians0; this._radians0 = this._radians1; this._radians1 = a; }
    /** Restrict start and end angles into the range (-90,+90) in degrees. */
    capLatitudeInPlace() {
        const limit = 0.5 * Math.PI;
        this._radians0 = Geometry_1.Geometry.clampToStartEnd(this._radians0, -limit, limit);
        this._radians1 = Geometry_1.Geometry.clampToStartEnd(this._radians1, -limit, limit);
    }
    /** Ask if the sweep is counterclockwise, i.e. positive sweep */
    get isCCW() { return this._radians1 >= this._radians0; }
    /** Ask if the sweep is a full circle. */
    get isFullCircle() { return Angle_1.Angle.isFullCircleRadians(this.sweepRadians); }
    /** Ask if the sweep is a full sweep from south pole to north pole. */
    get isFullLatitudeSweep() {
        const a = Math.PI * 0.5;
        return Angle_1.Angle.isAlmostEqualRadiansNoPeriodShift(this._radians0, -a)
            && Angle_1.Angle.isAlmostEqualRadiansNoPeriodShift(this._radians1, a);
    }
    /** return a clone of this sweep. */
    clone() { return new AngleSweep(this._radians0, this._radians1); }
    /** Convert fractional position in the sweep to radians. */
    fractionToRadians(fraction) {
        return fraction < 0.5 ?
            this._radians0 + fraction * (this._radians1 - this._radians0)
            : this._radians1 + (fraction - 1.0) * (this._radians1 - this._radians0);
    }
    /** Convert fractional position in the sweep to strongly typed Angle object. */
    fractionToAngle(fraction) {
        return Angle_1.Angle.createRadians(this.fractionToRadians(fraction));
    }
    /** return 2PI divided by the sweep radians (i.e. 360 degrees divided by sweep angle).
     * This is the number of fractional intervals required to cover a whole circle.
     */
    fractionPeriod() {
        return Geometry_1.Geometry.safeDivideFraction(Math.PI * 2.0, Math.abs(this._radians1 - this._radians0), 1.0);
    }
    /** return the fractional ized position of the angle,
     * computed without consideration of 2PI period.
     * That is, an angle that is numerically much beyond than the end angle
     * will produce a large fraction and an angle much beyond the start angle
     * will produce a large negative fraction.
     *
     */
    angleToUnboundedFraction(theta) {
        return Geometry_1.Geometry.safeDivideFraction(theta.radians - this._radians0, this._radians1 - this._radians0, 1.0);
    }
    /** map an angle to a fractional coordinate which is:
     *
     * *  the start angle is at fraction 0
     * *  the end angle is at fraction 1
     * *  interior angles are between 0 and 1
     * *  all exterior angles are at fractions greater than 1
     * *  the periodic jump is at full wraparound to the start angle
     */
    angleToPositivePeriodicFraction(theta) { return this.radiansToPositivePeriodicFraction(theta.radians); }
    /**
     * Convert each value in an array from radians to fraction.
     * @param data array that is input as radians, output as fractions
     */
    radiansArraytoPositivePeriodicFractions(data) {
        const n = data.length;
        for (let i = 0; i < n; i++) {
            data.reassign(i, this.radiansToPositivePeriodicFraction(data.at(i)));
        }
    }
    radiansToPositivePeriodicFraction(radians) {
        if (Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._radians0))
            return 0.0;
        if (Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._radians1))
            return 1.0;
        const sweep = this._radians1 - this._radians0;
        const delta = radians - this._radians0;
        if (sweep > 0) {
            const delta1 = Angle_1.Angle.adjustRadians0To2Pi(delta);
            const fraction1 = Geometry_1.Geometry.safeDivideFraction(delta1, sweep, 0.0);
            return fraction1;
        }
        const delta2 = Angle_1.Angle.adjustRadians0To2Pi(-delta);
        const fraction2 = Geometry_1.Geometry.safeDivideFraction(delta2, -sweep, 0.0);
        return fraction2;
    }
    /** map an angle to a fractional coordinate which is:
     *
     * *  the start angle is at fraction 0
     * *  the end angle is at fraction 1
     * *  interior angles are between 0 and 1
     * *  small negative for angles just "before" the start angle
     * *  more than one for angles just "after" the end angle
     * *  the periodic jump is at the middle of the "outside" interval
     */
    angleToSignedPeriodicFraction(theta) {
        return this.radiansToSignedPeriodicFraction(theta.radians);
    }
    radiansToSignedPeriodicFraction(radians) {
        if (Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._radians0))
            return 0.0;
        if (Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(radians, this._radians1))
            return 1.0;
        const sweep = this._radians1 - this._radians0;
        // measure from middle of interval ...
        const delta = radians - this._radians0 - 0.5 * sweep;
        if (sweep > 0) {
            const delta1 = Angle_1.Angle.adjustRadiansMinusPiPlusPi(delta);
            const fraction1 = 0.5 + Geometry_1.Geometry.safeDivideFraction(delta1, sweep, 0.0);
            return fraction1;
        }
        const delta2 = Angle_1.Angle.adjustRadiansMinusPiPlusPi(-delta);
        const fraction = 0.5 + Geometry_1.Geometry.safeDivideFraction(delta2, -sweep, 0.0);
        return fraction;
    }
    /** test if an angle is within the sweep */
    isAngleInSweep(angle) { return this.isRadiansInSweep(angle.radians); }
    /** test if radians are within sweep  */
    isRadiansInSweep(radians) {
        // quick out for simple inside ...
        const delta0 = radians - this._radians0;
        const delta1 = radians - this._radians1;
        if (delta0 * delta1 <= 0.0)
            return true;
        return this.radiansToPositivePeriodicFraction(radians) <= 1.0;
    }
    /** set this AngleSweep from various sources:
     *
     * * if json is undefined, a full-circle sweep is returned.
     * * If json is an AngleSweep object it is is cloned
     * * If json is an array of 2 numbers, those numbers are start and end angles in degrees.
     * * If `json.degrees` is an array of 2 numbers, those numbers are start and end angles in degrees.
     * * If `json.radians` is an array of 2 numbers, those numbers are start and end angles in radians.
     */
    setFromJSON(json) {
        if (!json)
            this.setStartEndRadians(); // default full circle
        else if (json instanceof AngleSweep)
            this.setFrom(json);
        else if (Geometry_1.Geometry.isNumberArray(json.degrees, 2))
            this.setStartEndDegrees(json.degrees[0], json.degrees[1]);
        else if (Geometry_1.Geometry.isNumberArray(json.radians, 2))
            this.setStartEndRadians(json.radians[0], json.radians[1]);
        else if (Geometry_1.Geometry.isNumberArray(json, 2))
            this.setStartEndDegrees(json[0], json[1]);
    }
    /** create an AngleSweep from a json object. */
    static fromJSON(json) {
        const result = AngleSweep.create360();
        result.setFromJSON(json);
        return result;
    }
    /**
     * Convert an AngleSweep to a JSON object.
     * @return {*} {degrees: [startAngleInDegrees, endAngleInDegrees}
     */
    toJSON() {
        // return { degrees: [this.startDegrees, this.endDegrees] };
        return [this.startDegrees, this.endDegrees];
    }
    /** test if start and end angles match, with explicit name to clarify that there is no test for 360-degree shifts. */
    isAlmostEqualAllowPeriodShift(other) {
        return Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(this._radians0, other._radians0)
            && Angle_1.Angle.isAlmostEqualRadiansNoPeriodShift(this._radians1 - this._radians0, other._radians1 - other._radians0);
    }
    /** test if start and end angles match, explicit name to clarify that 360-degree shifts are allowed. */
    isAlmostEqualNoPeriodShift(other) {
        return Angle_1.Angle.isAlmostEqualRadiansNoPeriodShift(this._radians0, other._radians0)
            && Angle_1.Angle.isAlmostEqualRadiansNoPeriodShift(this._radians1 - this._radians0, other._radians1 - other._radians0);
    }
    /** test if start and end angles match with radians tolerance.
     * * This is equivalent to isAlmostEqualNoPeriodShift.
     * * it is present for consistency with other classes
     * * It is recommended that all callers use one of he longer names to be clear of their intentions:
     * * * isAlmostEqualAllowPeriodShift
     * * * isAlmostEqualRadiansNoPeriodShift
     */
    isAlmostEqual(other) { return this.isAlmostEqualNoPeriodShift(other); }
}
exports.AngleSweep = AngleSweep;
//# sourceMappingURL=AngleSweep.js.map