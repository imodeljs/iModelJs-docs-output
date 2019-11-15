/** @module CartesianGeometry */
import { AngleProps } from "../Geometry";
import { Angle } from "./Angle";
import { Transform } from "./Transform";
import { Matrix3d } from "./Matrix3d";
import { Point3d } from "./Point3dVector3d";
/** The properties that define [[YawPitchRollAngles]]. */
/**
 * angle properties of a `YawPitchRoll` orientation
 * @public
 */
export interface YawPitchRollProps {
    /** yaw field */
    yaw?: AngleProps;
    /** pitch field */
    pitch?: AngleProps;
    /** roll field */
    roll?: AngleProps;
}
/** Three angles that determine the orientation of an object in space. Sometimes referred to as [Tait–Bryan angles](https://en.wikipedia.org/wiki/Euler_angles).
 * * The matrix construction can be replicated by this logic:
 * * xyz coordinates have
 *   * x forward
 *   * y to left
 *   * z up
 *   * Note that this is a right handed coordinate system.
 *   * yaw is a rotation of x towards y, i.e. around positive z:
 *     * `yawMatrix = Matrix3d.createRotationAroundAxisIndex(2, Angle.createDegrees(yawDegrees));`
 *   * pitch is a rotation that raises x towards z, i.e. rotation around negative y:
 *     * `pitchMatrix = Matrix3d.createRotationAroundAxisIndex(1, Angle.createDegrees(-pitchDegrees));`
 *   * roll is rotation of y towards z, i.e. rotation around positive x:
 *     * `rollMatrix = Matrix3d.createRotationAroundAxisIndex(0, Angle.createDegrees(rollDegrees));`
 *   * The YPR matrix is the product
 *     * `result = yawMatrix.multiplyMatrixMatrix(pitchMatrix.multiplyMatrixMatrix(rollMatrix));`
 *   * Note that this is for "column based" matrix, with vectors appearing to the right
 *     * Hence a vector is first rotated by roll, then the pitch, finally yaw.
 * @public
 */
export declare class YawPitchRollAngles {
    /** The yaw angle. */
    yaw: Angle;
    /** The pitch angle. */
    pitch: Angle;
    /** The roll angle. */
    roll: Angle;
    constructor(yaw?: Angle, pitch?: Angle, roll?: Angle);
    /** Freeze this YawPitchRollAngles */
    freeze(): void;
    /** constructor for YawPitchRollAngles with angles in degrees. */
    static createDegrees(yawDegrees: number, pitchDegrees: number, rollDegrees: number): YawPitchRollAngles;
    /** constructor for YawPitchRollAngles with angles in radians. */
    static createRadians(yawRadians: number, pitchRadians: number, rollRadians: number): YawPitchRollAngles;
    /** construct a `YawPitchRoll` object from an object with 3 named angles */
    static fromJSON(json?: YawPitchRollProps): YawPitchRollAngles;
    /** populate yaw, pitch and roll fields using `Angle.fromJSON` */
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
    /** Return the largest angle in radians */
    maxAbsRadians(): number;
    /** Return the sum of the angles in squared radians */
    sumSquaredRadians(): number;
    /** Returns true if this rotation does nothing.
     * * If allowPeriodShift is false, any nonzero angle is considered a non-identity
     * * If allowPeriodShift is true, all angles are individually allowed to be any multiple of 360 degrees.
     */
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