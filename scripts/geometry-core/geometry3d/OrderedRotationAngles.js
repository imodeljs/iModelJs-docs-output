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
/**
 * * OrderedRotationAngles represents a non-trivial rotation using three simple axis rotation angles, and an order in which to apply them.
 * * This class accommodates application-specific interpretation of "Multiplying 3 rotation matrices" with regard to
 *   * Whether a "vector" is a "row" or a "column"
 *   * The order in which the X,Y, Z rotations are applied.
 * * Within the imodel geometry library, the preferred rotation order is encapsulated in `YawPitchRollAngles`.
 * @alpha
 */
class OrderedRotationAngles {
    constructor(x, y, z, axisOrder) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = axisOrder;
    }
    /** (Property accessor) Return the `AxisOrder` controlling matrix multiplication order. */
    get order() { return this._order; }
    /** (Property accessor) Return the strongly typed angle of rotation around x. */
    get xAngle() { return this._x.clone(); }
    /** (Property accessor) Return the strongly typed angle of rotation around y. */
    get yAngle() { return this._y.clone(); }
    /** (Property accessor) Return the strongly typed angle of rotation around z. */
    get zAngle() { return this._z.clone(); }
    /** (Property accessor) Return the angle of rotation around x, in degrees */
    get xDegrees() { return this._x.degrees; }
    /** (Property accessor) Return the angle of rotation around y, in degrees */
    get xRadians() { return this._x.radians; }
    /** (Property accessor) Return the angle of rotation around z, in degrees */
    get yDegrees() { return this._y.degrees; }
    /** (Property accessor) Return the angle of rotation around x, in radians */
    get yRadians() { return this._y.radians; }
    /** (Property accessor) Return the angle of rotation around y, in radians */
    get zDegrees() { return this._z.degrees; }
    /** (Property accessor) Return the angle of rotation around z, in radians */
    get zRadians() { return this._z.radians; }
    /** (Property accessor) flag controlling whether vectors are treated as rows or as columns */
    static get treatVectorsAsColumns() { return OrderedRotationAngles._sTreatVectorsAsColumns; }
    /** (Property set) flag controlling whether vectors are treated as rows or as columns */
    static set treatVectorsAsColumns(value) { OrderedRotationAngles._sTreatVectorsAsColumns = value; }
    /** Create an OrderedRotationAngles from three angles and an ordering in which to apply them when rotating.
     * @param xRotation rotation around x
     * @param yRotation rotation around y
     * @param zRotation rotation around z
     * @param axisOrder right to left order of axis names identifies the order that rotations are applied to xyz data.
     */
    static createAngles(xRotation, yRotation, zRotation, order, result) {
        if (result) {
            result._x.setFrom(xRotation);
            result._y.setFrom(yRotation);
            result._z.setFrom(zRotation);
            result._order = order;
            return result;
        }
        return new OrderedRotationAngles(xRotation.clone(), yRotation.clone(), zRotation.clone(), order);
    }
    /** Create an OrderedRotationAngles from three angles (in radians) and an ordering in which to apply them when rotating. */
    static createRadians(xRadians, yRadians, zRadians, order, result) {
        if (result) {
            result._x.setRadians(xRadians);
            result._y.setRadians(yRadians);
            result._z.setRadians(zRadians);
            result._order = order;
            return result;
        }
        return new OrderedRotationAngles(Angle_1.Angle.createRadians(xRadians), Angle_1.Angle.createRadians(yRadians), Angle_1.Angle.createRadians(zRadians), order);
    }
    /** Create an OrderedRotationAngles from three angles (in degrees) and an ordering in which to apply them when rotating. */
    static createDegrees(xDegrees, yDegrees, zDegrees, order, result) {
        if (result) {
            result._x.setDegrees(xDegrees);
            result._y.setDegrees(yDegrees);
            result._z.setDegrees(zDegrees);
            result._order = order;
            return result;
        }
        return new OrderedRotationAngles(Angle_1.Angle.createDegrees(xDegrees), Angle_1.Angle.createDegrees(yDegrees), Angle_1.Angle.createDegrees(zDegrees), order);
    }
    /** Create an OrderedRotationAngles from a 3x3 rotational matrix, given the ordering of axis rotations that the matrix derives from. */
    static createFromMatrix3d(matrix, order, result) {
        let m11 = matrix.coffs[0], m12 = matrix.coffs[3], m13 = matrix.coffs[6];
        let m21 = matrix.coffs[1], m22 = matrix.coffs[4], m23 = matrix.coffs[7];
        let m31 = matrix.coffs[2], m32 = matrix.coffs[5], m33 = matrix.coffs[8];
        if (OrderedRotationAngles.treatVectorsAsColumns) {
            // the formulas are from row order .. flip the mIJ
            m11 = matrix.coffs[0], m12 = matrix.coffs[1], m13 = matrix.coffs[2];
            m21 = matrix.coffs[3], m22 = matrix.coffs[4], m23 = matrix.coffs[5];
            m31 = matrix.coffs[6], m32 = matrix.coffs[7], m33 = matrix.coffs[8];
        }
        let xRad;
        let yRad;
        let zRad;
        switch (order) {
            case Geometry_1.AxisOrder.XYZ: {
                yRad = Math.asin(Math.max(-1, Math.min(1, m13)));
                if (Math.abs(m13) < 0.99999) {
                    xRad = Math.atan2(-m23, m33);
                    zRad = Math.atan2(-m12, m11);
                }
                else {
                    xRad = Math.atan2(m32, m22);
                    zRad = 0;
                }
                break;
            }
            case Geometry_1.AxisOrder.YXZ: {
                xRad = Math.asin(-Math.max(-1, Math.min(1, m23)));
                if (Math.abs(m23) < 0.99999) {
                    yRad = Math.atan2(m13, m33);
                    zRad = Math.atan2(m21, m22);
                }
                else {
                    yRad = Math.atan2(-m31, m11);
                    zRad = 0;
                }
                break;
            }
            case Geometry_1.AxisOrder.ZXY: {
                xRad = Math.asin(Math.max(-1, Math.min(1, m32)));
                if (Math.abs(m32) < 0.99999) {
                    yRad = Math.atan2(-m31, m33);
                    zRad = Math.atan2(-m12, m22);
                }
                else {
                    yRad = 0;
                    zRad = Math.atan2(m21, m11);
                }
                break;
            }
            case Geometry_1.AxisOrder.ZYX: {
                yRad = -Math.asin(Math.max(-1, Math.min(1, m31)));
                if (Math.abs(m31) < 0.99999) {
                    xRad = Math.atan2(m32, m33);
                    zRad = Math.atan2(m21, m11);
                }
                else {
                    xRad = 0;
                    zRad = Math.atan2(-m12, m22);
                }
                break;
            }
            case Geometry_1.AxisOrder.YZX: {
                zRad = Math.asin(Math.max(-1, Math.min(1, m21)));
                if (Math.abs(m21) < 0.99999) {
                    xRad = Math.atan2(-m23, m22);
                    yRad = Math.atan2(-m31, m11);
                }
                else {
                    xRad = 0;
                    yRad = Math.atan2(m13, m33);
                }
                break;
            }
            case Geometry_1.AxisOrder.XZY: {
                zRad = -Math.asin(Math.max(-1, Math.min(1, m12)));
                if (Math.abs(m12) < 0.99999) {
                    xRad = Math.atan2(m32, m22);
                    yRad = Math.atan2(m13, m11);
                }
                else {
                    xRad = Math.atan2(-m23, m33);
                    yRad = 0;
                }
                break;
            }
            default: {
                xRad = yRad = zRad = 0;
            }
        }
        if (OrderedRotationAngles.treatVectorsAsColumns)
            return OrderedRotationAngles.createRadians(-xRad, -yRad, -zRad, order, result);
        return OrderedRotationAngles.createRadians(xRad, yRad, zRad, order, result);
    }
    /** Create a 3x3 rotational matrix from this OrderedRotationAngles. */
    toMatrix3d(result) {
        const rot = result !== undefined ? result : new Matrix3d_1.Matrix3d();
        const axisOrder = this.order;
        const x = this.xAngle, y = this.yAngle, z = this.zAngle;
        const a = x.cos();
        let b = x.sin();
        const c = y.cos();
        let d = y.sin();
        const e = z.cos();
        let f = z.sin();
        if (OrderedRotationAngles.treatVectorsAsColumns) {
            b = -b;
            d = -d;
            f = -f;
        }
        if (axisOrder === Geometry_1.AxisOrder.XYZ) {
            const ae = a * e, af = a * f, be = b * e, bf = b * f;
            rot.setRowValues(c * e, af + be * d, bf - ae * d, -c * f, ae - bf * d, be + af * d, d, -b * c, a * c);
        }
        else if (axisOrder === Geometry_1.AxisOrder.YXZ) {
            const ce = c * e, cf = c * f, de = d * e, df = d * f;
            rot.setRowValues(ce + df * b, a * f, cf * b - de, de * b - cf, a * e, df + ce * b, a * d, -b, a * c);
        }
        else if (axisOrder === Geometry_1.AxisOrder.ZXY) {
            const ce = c * e, cf = c * f, de = d * e, df = d * f;
            rot.setRowValues(ce - df * b, cf + de * b, -a * d, -a * f, a * e, b, de + cf * b, df - ce * b, a * c);
        }
        else if (axisOrder === Geometry_1.AxisOrder.ZYX) {
            const ae = a * e, af = a * f, be = b * e, bf = b * f;
            rot.setRowValues(c * e, c * f, -d, be * d - af, bf * d + ae, b * c, ae * d + bf, af * d - be, a * c);
        }
        else if (axisOrder === Geometry_1.AxisOrder.YZX) {
            const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
            rot.setRowValues(c * e, f, -d * e, bd - ac * f, a * e, ad * f + bc, bc * f + ad, -b * e, ac - bd * f);
        }
        else if (axisOrder === Geometry_1.AxisOrder.XZY) {
            const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
            rot.setRowValues(c * e, ac * f + bd, bc * f - ad, -f, a * e, b * e, d * e, ad * f - bc, bd * f + ac);
        }
        if (OrderedRotationAngles.treatVectorsAsColumns)
            rot.transposeInPlace();
        return rot;
    }
}
exports.OrderedRotationAngles = OrderedRotationAngles;
OrderedRotationAngles._sTreatVectorsAsColumns = false;
//# sourceMappingURL=OrderedRotationAngles.js.map