/** @module CartesianGeometry */
import { AngleProps } from "../Geometry";
import { Angle } from "./Angle";
import { Transform } from "./Transform";
import { Matrix3d } from "./Matrix3d";
import { Point3d } from "./Point3dVector3d";
/** The properties that define [[YawPitchRollAngles]]. */
export interface YawPitchRollProps {
    yaw?: AngleProps;
    pitch?: AngleProps;
    roll?: AngleProps;
}
/** Three angles that determine the orientation of an object in space. Sometimes referred to as [Tait–Bryan angles](https://en.wikipedia.org/wiki/Euler_angles). */
export declare class YawPitchRollAngles {
    yaw: Angle;
    pitch: Angle;
    roll: Angle;
    constructor(yaw?: Angle, pitch?: Angle, roll?: Angle);
    /** Freeze this YawPitchRollAngles */
    freeze(): void;
    /** constructor for YawPitchRollAngles with angles in degrees. */
    static createDegrees(yawDegrees: number, pitchDegrees: number, rollDegrees: number): YawPitchRollAngles;
    /** constructor for YawPitchRollAngles with angles in radians. */
    static createRadians(yawRadians: number, pitchRadians: number, rollRadians: number): YawPitchRollAngles;
    static fromJSON(json?: YawPitchRollProps): YawPitchRollAngles;
    setFromJSON(json?: YawPitchRollProps): void;
    /** Convert to a JSON object of form { pitch: 20 , roll: 29.999999999999996 , yaw: 10 }. Any values that are exactly zero (with tolerance `Geometry.smallAngleRadians`) are omitted. */
    toJSON(): YawPitchRollProps;
    /**
     * Install all rotations from `other` into `this`.
     * @param other YawPitchRollAngles source
     */
    setFrom(other: YawPitchRollAngles): void;
    /**
     * * Compare angles between `this` and `other`.
     * * Comparisons are via `isAlmostEqualAllowPeriodShift`.
     * @param other YawPitchRollAngles source
     */
    isAlmostEqual(other: YawPitchRollAngles): boolean;
    /**
     * Make a copy of this YawPitchRollAngles.
     */
    clone(): YawPitchRollAngles;
    /**
     * Expand the angles into a (rigid rotation) matrix.
     *
     * * The returned matrix is "rigid" -- unit length rows and columns, and its transpose is its inverse.
     * * The "rigid" matrix is always a right handed coordinate system.
     * @param result optional pre-allocated `Matrix3d`
     */
    toMatrix3d(result?: Matrix3d): Matrix3d;
    /** @returns Return the largest angle in radians */
    maxAbsRadians(): number;
    /** Return the sum of the angles in squared radians */
    sumSquaredRadians(): number;
    /** @returns true if the rotation is 0 */
    isIdentity(allowPeriodShift?: boolean): boolean;
    /** Return the largest difference of angles (in radians) between this and other */
    maxDiffRadians(other: YawPitchRollAngles): number;
    /** Return the largest angle in degrees. */
    maxAbsDegrees(): number;
    /** Return the sum of squared angles in degrees. */
    sumSquaredDegrees(): number;
    /** Return an object from a Transform as an origin and YawPitchRollAngles. */
    static tryFromTransform(transform: Transform): {
        origin: Point3d;
        angles: YawPitchRollAngles | undefined;
    };
    /** Attempts to create a YawPitchRollAngles object from an Matrix3d
     * * This conversion fails if the matrix is not rigid (unit rows and columns, transpose is inverse)
     * * In the failure case the method's return value is `undefined`.
     * * In the failure case, if the optional result was supplied, that result will nonetheless be filled with a set of angles.
     */
    static createFromMatrix3d(matrix: Matrix3d, result?: YawPitchRollAngles): YawPitchRollAngles | undefined;
}
//# sourceMappingURL=YawPitchRollAngles.d.ts.map