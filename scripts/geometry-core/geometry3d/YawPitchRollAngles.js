"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Geometry_1 = require("../Geometry");
const Angle_1 = require("./Angle");
const Matrix3d_1 = require("./Matrix3d");
const Point3dVector3d_1 = require("./Point3dVector3d");
// cspell:word Tait
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
class YawPitchRollAngles {
    constructor(yaw = Angle_1.Angle.zero(), pitch = Angle_1.Angle.zero(), roll = Angle_1.Angle.zero()) {
        this.yaw = yaw;
        this.pitch = pitch;
        this.roll = roll;
    }
    /** Freeze this YawPitchRollAngles */
    freeze() { Object.freeze(this.yaw); Object.freeze(this.pitch); Object.freeze(this.roll); }
    /** constructor for YawPitchRollAngles with angles in degrees. */
    static createDegrees(yawDegrees, pitchDegrees, rollDegrees) {
        return new YawPitchRollAngles(Angle_1.Angle.createDegrees(yawDegrees), Angle_1.Angle.createDegrees(pitchDegrees), Angle_1.Angle.createDegrees(rollDegrees));
    }
    /** constructor for YawPitchRollAngles with angles in radians. */
    static createRadians(yawRadians, pitchRadians, rollRadians) {
        return new YawPitchRollAngles(Angle_1.Angle.createRadians(yawRadians), Angle_1.Angle.createRadians(pitchRadians), Angle_1.Angle.createRadians(rollRadians));
    }
    /** construct a `YawPitchRoll` object from an object with 3 named angles */
    static fromJSON(json) {
        json = json ? json : {};
        return new YawPitchRollAngles(Angle_1.Angle.fromJSON(json.yaw), Angle_1.Angle.fromJSON(json.pitch), Angle_1.Angle.fromJSON(json.roll));
    }
    /** populate yaw, pitch and roll fields using `Angle.fromJSON` */
    setFromJSON(json) {
        json = json ? json : {};
        this.yaw = Angle_1.Angle.fromJSON(json.yaw);
        this.pitch = Angle_1.Angle.fromJSON(json.pitch);
        this.roll = Angle_1.Angle.fromJSON(json.roll);
    }
    /** Convert to a JSON object of form { pitch: 20 , roll: 29.999999999999996 , yaw: 10 }. Any values that are exactly zero (with tolerance `Geometry.smallAngleRadians`) are omitted. */
    toJSON() {
        const val = {};
        if (!this.pitch.isAlmostZero)
            val.pitch = this.pitch.toJSON();
        if (!this.roll.isAlmostZero)
            val.roll = this.roll.toJSON();
        if (!this.yaw.isAlmostZero)
            val.yaw = this.yaw.toJSON();
        return val;
    }
    /**
     * Install all rotations from `other` into `this`.
     * @param other YawPitchRollAngles source
     */
    setFrom(other) {
        this.yaw.setFrom(other.yaw);
        this.pitch.setFrom(other.pitch);
        this.roll.setFrom(other.roll);
    }
    /**
     * * Compare angles between `this` and `other`.
     * * Comparisons are via `isAlmostEqualAllowPeriodShift`.
     * @param other YawPitchRollAngles source
     */
    isAlmostEqual(other) {
        return this.yaw.isAlmostEqualAllowPeriodShift(other.yaw)
            && this.pitch.isAlmostEqualAllowPeriodShift(other.pitch)
            && this.roll.isAlmostEqualAllowPeriodShift(other.roll);
    }
    /**
     * Make a copy of this YawPitchRollAngles.
     */
    clone() { return new YawPitchRollAngles(this.yaw.clone(), this.pitch.clone(), this.roll.clone()); }
    /**
     * Expand the angles into a (rigid rotation) matrix.
     *
     * * The returned matrix is "rigid" -- unit length rows and columns, and its transpose is its inverse.
     * * The "rigid" matrix is always a right handed coordinate system.
     * @param result optional pre-allocated `Matrix3d`
     */
    toMatrix3d(result) {
        const c0 = Math.cos(this.yaw.radians);
        const s0 = Math.sin(this.yaw.radians);
        const c1 = Math.cos(this.pitch.radians);
        const s1 = Math.sin(this.pitch.radians);
        const c2 = Math.cos(this.roll.radians);
        const s2 = Math.sin(this.roll.radians);
        return Matrix3d_1.Matrix3d.createRowValues(c0 * c1, -(s0 * c2 + c0 * s1 * s2), (s0 * s2 - c0 * s1 * c2), s0 * c1, (c0 * c2 - s0 * s1 * s2), -(c0 * s2 + s0 * s1 * c2), s1, c1 * s2, c1 * c2, result);
    }
    /** Return the largest angle in radians */
    maxAbsRadians() {
        return Geometry_1.Geometry.maxAbsXYZ(this.yaw.radians, this.pitch.radians, this.roll.radians);
    }
    /** Return the sum of the angles in squared radians */
    sumSquaredRadians() {
        return Geometry_1.Geometry.hypotenuseSquaredXYZ(this.yaw.radians, this.pitch.radians, this.roll.radians);
    }
    /** Returns true if this rotation does nothing.
     * * If allowPeriodShift is false, any nonzero angle is considered a non-identity
     * * If allowPeriodShift is true, all angles are individually allowed to be any multiple of 360 degrees.
     */
    isIdentity(allowPeriodShift = true) {
        if (allowPeriodShift)
            return Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(0.0, this.yaw.radians)
                && Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(0.0, this.pitch.radians)
                && Angle_1.Angle.isAlmostEqualRadiansAllowPeriodShift(0.0, this.roll.radians);
        else
            return Angle_1.Angle.isAlmostEqualRadiansNoPeriodShift(0.0, this.yaw.radians)
                && Angle_1.Angle.isAlmostEqualRadiansNoPeriodShift(0.0, this.pitch.radians)
                && Angle_1.Angle.isAlmostEqualRadiansNoPeriodShift(0.0, this.roll.radians);
    }
    /** Return the largest difference of angles (in radians) between this and other */
    maxDiffRadians(other) {
        return Math.max(this.yaw.radians - other.yaw.radians, this.pitch.radians - other.pitch.radians, this.roll.radians - other.roll.radians);
    }
    /** Return the largest angle in degrees. */
    maxAbsDegrees() { return Geometry_1.Geometry.maxAbsXYZ(this.yaw.degrees, this.pitch.degrees, this.roll.degrees); }
    /** Return the sum of squared angles in degrees. */
    sumSquaredDegrees() { return Geometry_1.Geometry.hypotenuseSquaredXYZ(this.yaw.degrees, this.pitch.degrees, this.roll.degrees); }
    /** Return an object from a Transform as an origin and YawPitchRollAngles. */
    static tryFromTransform(transform) {
        // bundle up the transform's origin with the angle data extracted from the transform
        return {
            angles: YawPitchRollAngles.createFromMatrix3d(transform.matrix),
            origin: Point3dVector3d_1.Point3d.createFrom(transform.origin),
        };
    }
    /** Attempts to create a YawPitchRollAngles object from an Matrix3d
     * * This conversion fails if the matrix is not rigid (unit rows and columns, transpose is inverse)
     * * In the failure case the method's return value is `undefined`.
     * * In the failure case, if the optional result was supplied, that result will nonetheless be filled with a set of angles.
     */
    static createFromMatrix3d(matrix, result) {
        const s1 = matrix.at(2, 0);
        const c1 = Math.sqrt(matrix.at(2, 1) * matrix.at(2, 1) + matrix.at(2, 2) * matrix.at(2, 2));
        const pitchA = Angle_1.Angle.createAtan2(s1, c1); // with positive cosine
        const pitchB = Angle_1.Angle.createAtan2(s1, -c1); // with negative cosine
        const angles = result ? result : new YawPitchRollAngles(); // default undefined . . .
        if (c1 < Geometry_1.Geometry.smallAngleRadians) { // This is a radians test !!!
            angles.yaw = Angle_1.Angle.createAtan2(-matrix.at(0, 1), matrix.at(1, 1));
            angles.pitch = pitchA;
            angles.roll = Angle_1.Angle.createRadians(0.0);
        }
        else {
            const yawA = Angle_1.Angle.createAtan2(matrix.at(1, 0), matrix.at(0, 0));
            const rollA = Angle_1.Angle.createAtan2(matrix.at(2, 1), matrix.at(2, 2));
            const yawB = Angle_1.Angle.createAtan2(-matrix.at(1, 0), -matrix.at(0, 0));
            const rollB = Angle_1.Angle.createAtan2(-matrix.at(2, 1), -matrix.at(2, 2));
            const yprA = new YawPitchRollAngles(yawA, pitchA, rollA);
            const yprB = new YawPitchRollAngles(yawB, pitchB, rollB);
            const absFactor = 0.95;
            const radiansA = yprA.maxAbsRadians();
            const radiansB = yprB.maxAbsRadians();
            if (radiansA < absFactor * radiansB) {
                angles.setFrom(yprA);
            }
            else if (radiansB < absFactor * radiansA) {
                angles.setFrom(yprB);
            }
            else {
                const sumA = yprA.sumSquaredRadians();
                const sumB = yprB.sumSquaredRadians();
                if (sumA <= sumB) {
                    angles.setFrom(yprA);
                }
                else {
                    angles.setFrom(yprB);
                }
            }
        }
        const matrix1 = angles.toMatrix3d();
        return matrix.maxDiff(matrix1) < Geometry_1.Geometry.smallAngleRadians ? angles : undefined;
    }
}
exports.YawPitchRollAngles = YawPitchRollAngles;
//# sourceMappingURL=YawPitchRollAngles.js.map