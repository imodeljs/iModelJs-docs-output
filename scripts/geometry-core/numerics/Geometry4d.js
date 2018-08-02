"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const Geometry_1 = require("../Geometry");
const PointVector_1 = require("../PointVector");
const Transform_1 = require("../Transform");
/** 4 Dimensional point (x,y,z,w) used in perspective calculations.
 * * the coordinates are stored in a Float64Array of length 4.
 * * properties `x`, `y`, `z`, `w` access array members.
 * *
 */
class Point4d {
    /** Set x,y,z,w of this point.  */
    set(x = 0, y = 0, z = 0, w = 0) {
        this.xyzw[0] = x;
        this.xyzw[1] = y;
        this.xyzw[2] = z;
        this.xyzw[3] = w;
        return this;
    }
    /** @returns Return the x component of this point. */
    get x() { return this.xyzw[0]; }
    set x(val) { this.xyzw[0] = val; }
    /** @returns Return the y component of this point. */
    get y() { return this.xyzw[1]; }
    set y(val) { this.xyzw[1] = val; }
    /** @returns Return the z component of this point. */
    get z() { return this.xyzw[2]; }
    set z(val) { this.xyzw[2] = val; }
    /** @returns Return the w component of this point. */
    get w() { return this.xyzw[3]; }
    set w(val) { this.xyzw[3] = val; }
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.xyzw = new Float64Array(4);
        this.xyzw[0] = x;
        this.xyzw[1] = y;
        this.xyzw[2] = z;
        this.xyzw[3] = w;
    }
    /** @returns Return a Point4d with specified x,y,z,w */
    static create(x = 0, y = 0, z = 0, w = 0, result) {
        return result ? result.set(x, y, z, w) : new Point4d(x, y, z, w);
    }
    setFrom(other) {
        this.xyzw[0] = other.xyzw[0];
        this.xyzw[1] = other.xyzw[1];
        this.xyzw[2] = other.xyzw[2];
        this.xyzw[3] = other.xyzw[3];
        return this;
    }
    clone(result) {
        return result ? result.setFrom(this) : new Point4d(this.xyzw[0], this.xyzw[1], this.xyzw[2], this.xyzw[3]);
    }
    setFromJSON(json) {
        if (Geometry_1.Geometry.isNumberArray(json, 4))
            this.set(json[0], json[1], json[2], json[3]);
        else
            this.set(0, 0, 0, 0);
    }
    static fromJSON(json) {
        const result = new Point4d();
        result.setFromJSON(json);
        return result;
    }
    isAlmostEqual(other) {
        return Geometry_1.Geometry.isSameCoordinate(this.x, other.x)
            && Geometry_1.Geometry.isSameCoordinate(this.y, other.y)
            && Geometry_1.Geometry.isSameCoordinate(this.z, other.z)
            && Geometry_1.Geometry.isSameCoordinate(this.w, other.w);
    }
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [[x,y,z,w]
     */
    toJSON() {
        return [this.xyzw[0], this.xyzw[1], this.xyzw[2], this.xyzw[3]];
    }
    /** Return the 4d distance from this point to other, with all 4 components squared into the hypotenuse.
     * * x,y,z,w all participate without normalization.
     */
    distanceXYZW(other) {
        return Geometry_1.Geometry.hypotenuseXYZW(other.xyzw[0] - this.xyzw[0], other.xyzw[1] - this.xyzw[1], other.xyzw[2] - this.xyzw[2], other.xyzw[3] - this.xyzw[3]);
    }
    /** Return the squared 4d distance from this point to other, with all 4 components squared into the hypotenuse.
     * * x,y,z,w all participate without normalization.
     */
    distanceSquaredXYZW(other) {
        return Geometry_1.Geometry.hypotenuseSquaredXYZW(other.xyzw[0] - this.xyzw[0], other.xyzw[1] - this.xyzw[1], other.xyzw[2] - this.xyzw[2], other.xyzw[3] - this.xyzw[3]);
    }
    /** Return the largest absolute distance between corresponding components
     * * x,y,z,w all participate without normalization.
     */
    maxDiff(other) {
        return Math.max(Math.abs(other.xyzw[0] - this.xyzw[0]), Math.abs(other.xyzw[1] - this.xyzw[1]), Math.abs(other.xyzw[2] - this.xyzw[2]), Math.abs(other.xyzw[3] - this.xyzw[3]));
    }
    /** @returns Return the largest absolute entry of all 4 components x,y,z,w */
    maxAbs() {
        return Math.max(Math.abs(this.xyzw[0]), Math.abs(this.xyzw[1]), Math.abs(this.xyzw[2]), Math.abs(this.xyzw[3]));
    }
    /**  @returns Returns the magnitude including all 4 components x,y,z,w */
    magnitudeXYZW() {
        return Geometry_1.Geometry.hypotenuseXYZW(this.xyzw[0], this.xyzw[1], this.xyzw[2], this.xyzw[3]);
    }
    /** @returns Return the difference (this-other) using all 4 components x,y,z,w */
    minus(other, result) {
        return Point4d.create(this.xyzw[0] - other.xyzw[0], this.xyzw[1] - other.xyzw[1], this.xyzw[2] - other.xyzw[2], this.xyzw[3] - other.xyzw[3], result);
    }
    /** @returns Return ((other.w \* this) -  (this.w \* other)) */
    crossWeightedMinus(other, result) {
        const wa = this.xyzw[3];
        const wb = other.xyzw[3];
        return PointVector_1.Vector3d.create(wb * this.xyzw[0] - wa * other.xyzw[0], wb * this.xyzw[1] - wa * other.xyzw[1], wb * this.xyzw[2] - wa * other.xyzw[2], result);
    }
    /** @returns Return the sum of this and other, using all 4 components x,y,z,w */
    plus(other, result) {
        return Point4d.create(this.xyzw[0] + other.xyzw[0], this.xyzw[1] + other.xyzw[1], this.xyzw[2] + other.xyzw[2], this.xyzw[3] + other.xyzw[3], result);
    }
    isAlmostZero() {
        return Geometry_1.Geometry.isSmallMetricDistance(this.maxAbs());
    }
    static createZero() { return new Point4d(0, 0, 0, 0); }
    /**
     * extract 4 consecutive numbers from a Float64Array into a Point4d.
     * @param data buffer of numbers
     * @param xIndex first index for x,y,z,w sequence
     */
    static createFromPackedXYZW(data, xIndex = 0) {
        return new Point4d(data[xIndex], data[xIndex + 1], data[xIndex + 2], data[xIndex + 3]);
    }
    static createFromPointAndWeight(xyz, w) {
        return new Point4d(xyz.x, xyz.y, xyz.z, w);
    }
    /** Return point + vector \* scalar */
    plusScaled(vector, scaleFactor, result) {
        return Point4d.create(this.xyzw[0] + vector.xyzw[0] * scaleFactor, this.xyzw[1] + vector.xyzw[1] * scaleFactor, this.xyzw[2] + vector.xyzw[2] * scaleFactor, this.xyzw[3] + vector.xyzw[3] * scaleFactor, result);
    }
    /** Return point + vectorA \* scalarA + vectorB \* scalarB */
    plus2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        return Point4d.create(this.xyzw[0] + vectorA.xyzw[0] * scalarA + vectorB.xyzw[0] * scalarB, this.xyzw[1] + vectorA.xyzw[1] * scalarA + vectorB.xyzw[1] * scalarB, this.xyzw[2] + vectorA.xyzw[2] * scalarA + vectorB.xyzw[2] * scalarB, this.xyzw[3] + vectorA.xyzw[3] * scalarA + vectorB.xyzw[3] * scalarB, result);
    }
    /** Return point + vectorA \* scalarA + vectorB \* scalarB + vectorC \* scalarC */
    plus3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        return Point4d.create(this.xyzw[0] + vectorA.xyzw[0] * scalarA + vectorB.xyzw[0] * scalarB + vectorC.xyzw[0] * scalarC, this.xyzw[1] + vectorA.xyzw[1] * scalarA + vectorB.xyzw[1] * scalarB + vectorC.xyzw[1] * scalarC, this.xyzw[2] + vectorA.xyzw[2] * scalarA + vectorB.xyzw[2] * scalarB + vectorC.xyzw[2] * scalarC, this.xyzw[3] + vectorA.xyzw[3] * scalarA + vectorB.xyzw[3] * scalarB + vectorC.xyzw[3] * scalarC, result);
    }
    /** Return point + vectorA \* scalarA + vectorB \* scalarB */
    static add2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        return Point4d.create(vectorA.xyzw[0] * scalarA + vectorB.xyzw[0] * scalarB, vectorA.xyzw[1] * scalarA + vectorB.xyzw[1] * scalarB, vectorA.xyzw[2] * scalarA + vectorB.xyzw[2] * scalarB, vectorA.xyzw[3] * scalarA + vectorB.xyzw[3] * scalarB, result);
    }
    /** Return point + vectorA \* scalarA + vectorB \* scalarB + vectorC \* scalarC */
    static add3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        return Point4d.create(vectorA.xyzw[0] * scalarA + vectorB.xyzw[0] * scalarB + vectorC.xyzw[0] * scalarC, vectorA.xyzw[1] * scalarA + vectorB.xyzw[1] * scalarB + vectorC.xyzw[1] * scalarC, vectorA.xyzw[2] * scalarA + vectorB.xyzw[2] * scalarB + vectorC.xyzw[2] * scalarC, vectorA.xyzw[3] * scalarA + vectorB.xyzw[3] * scalarB + vectorC.xyzw[3] * scalarC, result);
    }
    dotVectorsToTargets(targetA, targetB) {
        return (targetA.xyzw[0] - this.xyzw[0]) * (targetB.xyzw[0] - this.xyzw[0]) +
            (targetA.xyzw[1] - this.xyzw[1]) * (targetB.xyzw[1] - this.xyzw[1]) +
            (targetA.xyzw[2] - this.xyzw[2]) * (targetB.xyzw[2] - this.xyzw[2]) +
            (targetA.xyzw[3] - this.xyzw[3]) * (targetB.xyzw[3] - this.xyzw[3]);
    }
    dotProduct(other) {
        return this.xyzw[0] * other.xyzw[0] + this.xyzw[1] * other.xyzw[1] + this.xyzw[2] * other.xyzw[2] + this.xyzw[3] * other.xyzw[3];
    }
    dotProductXYZW(x, y, z, w) {
        return this.xyzw[0] * x + this.xyzw[1] * y + this.xyzw[2] * z + this.xyzw[3] * w;
    }
    /** unit X vector */
    static unitX() { return new Point4d(1, 0, 0, 0); }
    /** unit Y vector */
    static unitY() { return new Point4d(0, 1, 0, 0); }
    /** unit Z vector */
    static unitZ() { return new Point4d(0, 0, 1, 0); }
    /** unit W vector */
    static unitW() { return new Point4d(0, 0, 0, 1); }
    // Divide by denominator, but return undefined if denominator is zero.
    safeDivideOrNull(denominator, result) {
        if (denominator !== 0.0) {
            return this.scale(1.0 / denominator, result);
        }
        return undefined;
    }
    /** scale all components (including w!!) */
    scale(scale, result) {
        result = result ? result : new Point4d();
        result.xyzw[0] = this.xyzw[0] * scale;
        result.xyzw[1] = this.xyzw[1] * scale;
        result.xyzw[2] = this.xyzw[2] * scale;
        result.xyzw[3] = this.xyzw[3] * scale;
        return result;
    }
    /** Negate components (including w!!) */
    negate(result) {
        result = result ? result : new Point4d();
        result.xyzw[0] = -this.xyzw[0];
        result.xyzw[1] = -this.xyzw[1];
        result.xyzw[2] = -this.xyzw[2];
        result.xyzw[3] = -this.xyzw[3];
        return result;
    }
    normalizeWeight(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.xyzw[3]);
        result = result ? result : new Point4d();
        return this.safeDivideOrNull(mag, result);
    }
    realPoint(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.xyzw[3]);
        if (mag === 0.0)
            return undefined;
        result = result ? result : new PointVector_1.Point3d();
        const a = 1.0 / mag;
        result.set(this.xyzw[0] * a, this.xyzw[1] * a, this.xyzw[2] * a);
        return result;
    }
    realPointDefault000(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.xyzw[3]);
        if (mag === 0.0)
            return PointVector_1.Point3d.create(0, 0, 0, result);
        result = result ? result : new PointVector_1.Point3d();
        const a = 1.0 / mag;
        return PointVector_1.Point3d.create(this.xyzw[0] * a, this.xyzw[1] * a, this.xyzw[2] * a, result);
    }
    /** divide all components (x,y,z,w) by the 4d magnitude.
     *
     * * This is appropriate for normalizing a quaternion
     * * Use normalizeWeight to divide by the w component.
     */
    normalizeXYZW(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.magnitudeXYZW());
        result = result ? result : new Point4d();
        return this.safeDivideOrNull(mag, result);
    }
} // DPoint4d
exports.Point4d = Point4d;
class Matrix4d {
    constructor() { this.coffs = new Float64Array(16); }
    setFrom(other) {
        for (let i = 0; i < 16; i++)
            this.coffs[i] = other.coffs[i];
    }
    clone() {
        const result = new Matrix4d();
        for (let i = 0; i < 16; i++)
            result.coffs[i] = this.coffs[i];
        return result;
    }
    /** zero this matrix4d in place. */
    setZero() {
        for (let i = 0; i < 16; i++)
            this.coffs[i] = 0;
    }
    /** set to identity. */
    setIdentity() {
        for (let i = 0; i < 16; i++)
            this.coffs[i] = 0;
        this.coffs[0] = this.coffs[5] = this.coffs[10] = this.coffs[15] = 1.0;
    }
    static is1000(a, b, c, d, tol) {
        return Math.abs(a - 1.0) <= tol
            && Math.abs(b) <= tol
            && Math.abs(c) <= tol
            && Math.abs(d) <= tol;
    }
    /** set to identity. */
    isIdentity(tol = 1.0e-10) {
        return Matrix4d.is1000(this.coffs[0], this.coffs[1], this.coffs[2], this.coffs[3], tol)
            && Matrix4d.is1000(this.coffs[5], this.coffs[6], this.coffs[7], this.coffs[4], tol)
            && Matrix4d.is1000(this.coffs[10], this.coffs[11], this.coffs[8], this.coffs[9], tol)
            && Matrix4d.is1000(this.coffs[15], this.coffs[12], this.coffs[13], this.coffs[14], tol);
    }
    /** create a Matrix4d filled with zeros. */
    static createZero(result) {
        if (result) {
            result.setZero();
            return result;
        }
        return new Matrix4d(); // this is zero.
    }
    /** create a Matrix4d with values supplied "across the rows" */
    static createRowValues(cxx, cxy, cxz, cxw, cyx, cyy, cyz, cyw, czx, czy, czz, czw, cwx, cwy, cwz, cww, result) {
        result = result ? result : new Matrix4d();
        result.coffs[0] = cxx;
        result.coffs[1] = cxy;
        result.coffs[2] = cxz;
        result.coffs[3] = cxw;
        result.coffs[4] = cyx;
        result.coffs[5] = cyy;
        result.coffs[6] = cyz;
        result.coffs[7] = cyw;
        result.coffs[8] = czx;
        result.coffs[9] = czy;
        result.coffs[10] = czz;
        result.coffs[11] = czw;
        result.coffs[12] = cwx;
        result.coffs[13] = cwy;
        result.coffs[14] = cwz;
        result.coffs[15] = cww;
        return result;
    }
    /** directly set columns from typical 3d data:
     *
     * * vectorX, vectorY, vectorZ as columns 0,1,2, with weight0.
     * * origin as column3, with weight 1
     */
    setOriginAndVectors(origin, vectorX, vectorY, vectorZ) {
        this.coffs[0] = vectorX.x;
        this.coffs[1] = vectorY.x;
        this.coffs[2] = vectorZ.x;
        this.coffs[3] = origin.x;
        this.coffs[4] = vectorX.y;
        this.coffs[5] = vectorY.y;
        this.coffs[6] = vectorZ.y;
        this.coffs[7] = origin.y;
        this.coffs[8] = vectorX.z;
        this.coffs[9] = vectorY.z;
        this.coffs[10] = vectorZ.z;
        this.coffs[11] = origin.z;
        this.coffs[12] = 0.0;
        this.coffs[13] = 0.0;
        this.coffs[14] = 0.0;
        this.coffs[15] = 1.0;
    }
    /** promote a transform to full Matrix4d (with 0001 in final row) */
    static createTransform(source, result) {
        const matrix = source.matrix;
        const point = source.origin;
        return Matrix4d.createRowValues(matrix.coffs[0], matrix.coffs[1], matrix.coffs[2], point.x, matrix.coffs[3], matrix.coffs[4], matrix.coffs[5], point.y, matrix.coffs[6], matrix.coffs[7], matrix.coffs[8], point.z, 0, 0, 0, 1, result);
    }
    /** return an identity matrix. */
    static createIdentity(result) {
        result = Matrix4d.createZero(result);
        result.coffs[0] = 1.0;
        result.coffs[5] = 1.0;
        result.coffs[10] = 1.0;
        result.coffs[15] = 1.0;
        return result;
    }
    /** return matrix with translation directly inserted (along with 1 on diagonal) */
    static createTranslationXYZ(x, y, z, result) {
        result = Matrix4d.createZero(result);
        result.coffs[0] = 1.0;
        result.coffs[5] = 1.0;
        result.coffs[10] = 1.0;
        result.coffs[15] = 1.0;
        result.coffs[3] = x;
        result.coffs[7] = y;
        result.coffs[11] = z;
        return result;
    }
    /**
     * Create a Matrix4d with translation and scaling values directly inserted (along with 1 as final diagonal entry)
     * @param tx x entry for translation column
     * @param ty y entry for translation column
     * @param tz z entry for translation column
     * @param scaleX x diagonal entry
     * @param scaleY y diagonal entry
     * @param scaleZ z diagonal entry
     * @param result optional result.
     */
    static createTranslationAndScaleXYZ(tx, ty, tz, scaleX, scaleY, scaleZ, result) {
        return Matrix4d.createRowValues(scaleX, 0, 0, tx, 0, scaleY, 0, ty, 0, 0, scaleZ, tz, 0, 0, 0, 1, result);
    }
    /**
     * Create a mapping the scales and translates (no rotation) from box A to boxB
     * @param lowA low point of box A
     * @param highA high point of box A
     * @param lowB low point of box B
     * @param highB high point of box B
     */
    static createBoxToBox(lowA, highA, lowB, highB, result) {
        const ax = highA.x - lowA.x;
        const ay = highA.y - lowA.y;
        const az = highA.z - lowA.z;
        const bx = highB.x - lowB.x;
        const by = highB.y - lowB.y;
        const bz = highB.z - lowB.z;
        const abx = Geometry_1.Geometry.conditionalDivideFraction(bx, ax);
        const aby = Geometry_1.Geometry.conditionalDivideFraction(by, ay);
        const abz = Geometry_1.Geometry.conditionalDivideFraction(bz, az);
        if (abx !== undefined && aby !== undefined && abz !== undefined) {
            return Matrix4d.createTranslationAndScaleXYZ(lowB.x - abx * lowA.x, lowB.y - aby * lowA.y, lowB.z - abz * lowA.z, abx, aby, abz, result);
        }
        return undefined;
    }
    setFromJSON(json) {
        if (Geometry_1.Geometry.isArrayOfNumberArray(json, 4, 4))
            for (let i = 0; i < 4; ++i) {
                for (let j = 0; j < 4; ++j)
                    this.coffs[i * 4 + j] = json[i][j];
            }
        else
            this.setZero();
    }
    /**
     * Return the largest (absolute) difference between this and other Matrix4d.
     * @param other matrix to compare to
     */
    maxDiff(other) {
        let a = 0.0;
        for (let i = 0; i < 16; i++)
            a = Math.max(a, Math.abs(this.coffs[i] - other.coffs[i]));
        return a;
    }
    /**
     * Return the largest absolute value in the Matrix4d
     */
    maxAbs() {
        let a = 0.0;
        for (let i = 0; i < 16; i++)
            a = Math.max(a, Math.abs(this.coffs[i]));
        return a;
    }
    isAlmostEqual(other) {
        return Geometry_1.Geometry.isSmallMetricDistance(this.maxDiff(other));
    }
    /**
     * Convert an Matrix4d to a Matrix4dProps.
     */
    toJSON() {
        const value = [];
        for (let i = 0; i < 4; ++i) {
            const row = i * 4;
            value.push([this.coffs[row], this.coffs[row + 1], this.coffs[row + 2], this.coffs[row + 3]]);
        }
        return value;
    }
    static fromJSON(json) {
        const result = new Matrix4d();
        result.setFromJSON(json);
        return result;
    }
    getSteppedPoint(i0, step, result) {
        return Point4d.create(this.coffs[i0], this.coffs[i0 + step], this.coffs[i0 + 2 * step], this.coffs[i0 + 3 * step], result);
    }
    /** @returns Return column 0 as Point4d. */
    columnX() { return this.getSteppedPoint(0, 4); }
    /** @returns Return column 1 as Point4d. */
    columnY() { return this.getSteppedPoint(1, 4); }
    /** @returns Return column 2 as Point4d. */
    columnZ() { return this.getSteppedPoint(2, 4); }
    /** @returns Return column 3 as Point4d. */
    columnW() { return this.getSteppedPoint(3, 4); }
    /** @returns Return row 0 as Point4d. */
    rowX() { return this.getSteppedPoint(0, 1); }
    /** @returns Return row 1 as Point4d. */
    rowY() { return this.getSteppedPoint(4, 1); }
    /** @returns Return row 2 as Point4d. */
    rowZ() { return this.getSteppedPoint(8, 1); }
    /** @returns Return row 3 as Point4d. */
    rowW() { return this.getSteppedPoint(12, 1); }
    diagonal() { return this.getSteppedPoint(0, 5); }
    weight() { return this.coffs[15]; }
    matrixPart() {
        return Transform_1.RotMatrix.createRowValues(this.coffs[0], this.coffs[1], this.coffs[2], this.coffs[4], this.coffs[5], this.coffs[6], this.coffs[8], this.coffs[9], this.coffs[10]);
    }
    /** multiply this * other. */
    multiplyMatrixMatrix(other, result) {
        result = (result && result !== this && result !== other) ? result : new Matrix4d();
        for (let i0 = 0; i0 < 16; i0 += 4) {
            for (let k = 0; k < 4; k++)
                result.coffs[i0 + k] =
                    this.coffs[i0] * other.coffs[k] +
                        this.coffs[i0 + 1] * other.coffs[k + 4] +
                        this.coffs[i0 + 2] * other.coffs[k + 8] +
                        this.coffs[i0 + 3] * other.coffs[k + 12];
        }
        return result;
    }
    /** multiply this * transpose(other). */
    multiplyMatrixMatrixTranspose(other, result) {
        result = (result && result !== this && result !== other) ? result : new Matrix4d();
        let j = 0;
        for (let i0 = 0; i0 < 16; i0 += 4) {
            for (let k = 0; k < 16; k += 4)
                result.coffs[j++] =
                    this.coffs[i0] * other.coffs[k] +
                        this.coffs[i0 + 1] * other.coffs[k + 1] +
                        this.coffs[i0 + 2] * other.coffs[k + 2] +
                        this.coffs[i0 + 3] * other.coffs[k + 3];
        }
        return result;
    }
    /** multiply transpose (this) * other. */
    multiplyMatrixTransposeMatrix(other, result) {
        result = (result && result !== this && result !== other) ? result : new Matrix4d();
        let j = 0;
        for (let i0 = 0; i0 < 4; i0 += 1) {
            for (let k0 = 0; k0 < 4; k0 += 1)
                result.coffs[j++] =
                    this.coffs[i0] * other.coffs[k0] +
                        this.coffs[i0 + 4] * other.coffs[k0 + 4] +
                        this.coffs[i0 + 8] * other.coffs[k0 + 8] +
                        this.coffs[i0 + 12] * other.coffs[k0 + 12];
        }
        return result;
    }
    /** Return a transposed matrix. */
    cloneTransposed(result) {
        return Matrix4d.createRowValues(this.coffs[0], this.coffs[4], this.coffs[8], this.coffs[12], this.coffs[1], this.coffs[5], this.coffs[9], this.coffs[13], this.coffs[2], this.coffs[6], this.coffs[10], this.coffs[14], this.coffs[3], this.coffs[7], this.coffs[11], this.coffs[15], result);
    }
    /** multiply matrix times column [x,y,z,w].  return as Point4d.   (And the returned value is NOT normalized down to unit w) */
    multiplyXYZW(x, y, z, w, result) {
        result = result ? result : Point4d.createZero();
        return result.set(this.coffs[0] * x + this.coffs[1] * y + this.coffs[2] * z + this.coffs[3] * w, this.coffs[4] * x + this.coffs[5] * y + this.coffs[6] * z + this.coffs[7] * w, this.coffs[8] * x + this.coffs[9] * y + this.coffs[10] * z + this.coffs[11] * w, this.coffs[12] * x + this.coffs[13] * y + this.coffs[14] * z + this.coffs[15] * w);
    }
    /** multiply matrix times XYAndZ  and w. return as Point4d  (And the returned value is NOT normalized down to unit w) */
    multiplyPoint3d(pt, w, result) {
        return this.multiplyXYZW(pt.x, pt.y, pt.z, w, result);
    }
    /** multiply matrix times and array  of XYAndZ. return as array of Point4d  (And the returned value is NOT normalized down to unit w) */
    multiplyPoint3dArray(pts, results, w = 1.0) {
        pts.forEach((pt, i) => { results[i] = this.multiplyXYZW(pt.x, pt.y, pt.z, w, results[i]); });
    }
    /** multiply [x,y,z,w] times matrix.  return as Point4d.   (And the returned value is NOT normalized down to unit w) */
    multiplyTransposeXYZW(x, y, z, w, result) {
        result = result ? result : Point4d.createZero();
        return result.set(this.coffs[0] * x + this.coffs[4] * y + this.coffs[8] * z + this.coffs[12] * w, this.coffs[1] * x + this.coffs[5] * y + this.coffs[9] * z + this.coffs[13] * w, this.coffs[2] * x + this.coffs[6] * y + this.coffs[10] * z + this.coffs[14] * w, this.coffs[3] * x + this.coffs[7] * y + this.coffs[11] * z + this.coffs[15] * w);
    }
    /** @returns dot product of row rowIndex of this with column columnIndex of other.
     */
    rowDotColumn(rowIndex, other, columnIndex) {
        const i = rowIndex * 4;
        const j = columnIndex;
        return this.coffs[i] * other.coffs[j]
            + this.coffs[i + 1] * other.coffs[j + 4]
            + this.coffs[i + 2] * other.coffs[j + 8]
            + this.coffs[i + 3] * other.coffs[j + 12];
    }
    /** @returns dot product of row rowIndexThis of this with row rowIndexOther of other.
     */
    rowDotRow(rowIndexThis, other, rowIndexOther) {
        const i = rowIndexThis * 4;
        const j = rowIndexOther * 4;
        return this.coffs[i] * other.coffs[j]
            + this.coffs[i + 1] * other.coffs[j + 1]
            + this.coffs[i + 2] * other.coffs[j + 2]
            + this.coffs[i + 3] * other.coffs[j + 3];
    }
    /** @returns dot product of row rowIndexThis of this with row rowIndexOther of other.
     */
    columnDotColumn(columnIndexThis, other, columnIndexOther) {
        const i = columnIndexThis;
        const j = columnIndexOther;
        return this.coffs[i] * other.coffs[j]
            + this.coffs[i + 4] * other.coffs[j + 4]
            + this.coffs[i + 8] * other.coffs[j + 8]
            + this.coffs[i + 12] * other.coffs[j + 12];
    }
    /** @returns dot product of column columnIndexThis of this with row rowIndexOther other.
     */
    columnDotRow(columnIndexThis, other, rowIndexOther) {
        const i = columnIndexThis;
        const j = 4 * rowIndexOther;
        return this.coffs[i] * other.coffs[j]
            + this.coffs[i + 4] * other.coffs[j + 1]
            + this.coffs[i + 8] * other.coffs[j + 2]
            + this.coffs[i + 12] * other.coffs[j + 3];
    }
    /** @returns return a matrix entry by row and column index.
     */
    atIJ(rowIndex, columnIndex) {
        return this.coffs[rowIndex * 4 + columnIndex];
    }
    /** multiply matrix * [x,y,z,w]. immediately renormalize to return in a Point3d.
     * If zero weight appears in the result (i.e. input is on eyeplane) leave the mapped xyz untouched.
     */
    multiplyXYZWQuietRenormalize(x, y, z, w, result) {
        result = result ? result : PointVector_1.Point3d.createZero();
        result.set(this.coffs[0] * x + this.coffs[1] * y + this.coffs[2] * z + this.coffs[3] * w, this.coffs[4] * x + this.coffs[5] * y + this.coffs[6] * z + this.coffs[7] * w, this.coffs[8] * x + this.coffs[9] * y + this.coffs[10] * z + this.coffs[11] * w);
        const w1 = this.coffs[12] * x + this.coffs[13] * y + this.coffs[14] * z + this.coffs[15] * w;
        if (!Geometry_1.Geometry.isSmallMetricDistance(w1)) {
            const a = 1.0 / w1;
            result.x *= a;
            result.y *= a;
            result.z *= a;
        }
        return result;
    }
    /** multiply matrix * an array of Point4d. immediately renormalize to return in an array of Point3d. */
    multiplyPoint4dArrayQuietRenormalize(pts, results) {
        pts.forEach((pt, i) => { results[i] = this.multiplyXYZWQuietRenormalize(pt.x, pt.y, pt.z, pt.w, results[i]); });
    }
    /** multiply a Point4d, return with the optional result convention. */
    multiplyPoint4d(point, result) {
        return this.multiplyXYZW(point.xyzw[0], point.xyzw[1], point.xyzw[2], point.xyzw[3], result);
    }
    /** multiply a Point4d, return with the optional result convention. */
    multiplyTransposePoint4d(point, result) {
        return this.multiplyTransposeXYZW(point.xyzw[0], point.xyzw[1], point.xyzw[2], point.xyzw[3], result);
    }
    /** multiply matrix * point. This produces a weighted xyzw.
     * Immediately renormalize back to xyz and return (with optional result convention).
     * If zero weight appears in the result (i.e. input is on eyeplane)leave the mapped xyz untouched.
     */
    multiplyPoint3dQuietNormalize(point, result) {
        return this.multiplyXYZWQuietRenormalize(point.x, point.y, point.z, 1.0, result);
    }
    /** multiply each matrix * points[i].   This produces a weighted xyzw.
     * Immediately renormalize back to xyz and replace the original point.
     * If zero weight appears in the result (i.e. input is on eyeplane)leave the mapped xyz untouched.
     */
    multiplyPoint3dArrayQuietNormalize(points) {
        points.forEach((point) => this.multiplyXYZWQuietRenormalize(point.x, point.y, point.z, 1.0, point));
    }
    addMomentsInPlace(x, y, z, w) {
        this.coffs[0] += x * x;
        this.coffs[1] += x * y;
        this.coffs[2] += x * z;
        this.coffs[3] += x * w;
        this.coffs[4] += y * x;
        this.coffs[5] += y * y;
        this.coffs[6] += y * z;
        this.coffs[7] += y * w;
        this.coffs[8] += z * x;
        this.coffs[9] += z * y;
        this.coffs[10] += z * z;
        this.coffs[11] += z * w;
        this.coffs[12] += w * x;
        this.coffs[13] += w * y;
        this.coffs[14] += w * z;
        this.coffs[15] += w * w;
    }
    /** accumulate all coefficients of other to this. */
    addScaledInPlace(other, scale = 1.0) {
        for (let i = 0; i < 16; i++)
            this.coffs[i] += scale * other.coffs[i];
    }
    /**
     * Add scale times rowA to rowB.
     * @param rowIndexA row that is not modified
     * @param rowIndexB row that is modified.
     * @param firstColumnIndex first column modified.  All from there to the right are updated
     * @param scale scale
     */
    rowOperation(rowIndexA, rowIndexB, firstColumnIndex, scale) {
        if (scale === 0.0)
            return;
        let iA = rowIndexA * 4 + firstColumnIndex;
        let iB = rowIndexB * 4 + firstColumnIndex;
        for (let i = firstColumnIndex; i < 4; i++, iA++, iB++)
            this.coffs[iB] += scale * this.coffs[iA];
    }
    /** Compute an inverse matrix.
     * * This uses simple Bauss-Jordan elimination -- no pivot.
     * @returns undefined if 1/pivot becomes too large. (i.e. apparent 0 pivot)
     */
    createInverse() {
        const work = this.clone();
        const inverse = Matrix4d.createIdentity();
        // console.log(work.rowArrays());
        // console.log(inverse.rowArrays());
        let pivotIndex;
        let pivotRow;
        let pivotValue;
        let divPivot;
        // Downward gaussian elimination, no pivoting:
        for (pivotRow = 0; pivotRow < 3; pivotRow++) {
            pivotIndex = pivotRow * 5;
            pivotValue = work.coffs[pivotIndex];
            // console.log("** pivot row " + pivotRow + " pivotvalue " + pivotValue);
            divPivot = Geometry_1.Geometry.conditionalDivideFraction(1.0, pivotValue);
            if (divPivot === undefined)
                return undefined;
            let indexB = pivotIndex + 4;
            for (let rowB = pivotRow + 1; rowB < 4; rowB++, indexB += 4) {
                const scale = -work.coffs[indexB] * divPivot;
                work.rowOperation(pivotRow, rowB, pivotRow, scale);
                inverse.rowOperation(pivotRow, rowB, 0, scale);
                // console.log(work.rowArrays());
                // console.log(inverse.rowArrays());
            }
        }
        // console.log("\n**********************Backsub\n");
        // upward gaussian elimination ...
        for (pivotRow = 1; pivotRow < 4; pivotRow++) {
            pivotIndex = pivotRow * 5;
            pivotValue = work.coffs[pivotIndex];
            // console.log("** pivot row " + pivotRow + " pivotvalue " + pivotValue);
            divPivot = Geometry_1.Geometry.conditionalDivideFraction(1.0, pivotValue);
            if (divPivot === undefined)
                return undefined;
            let indexB = pivotRow;
            for (let rowB = 0; rowB < pivotRow; rowB++, indexB += 4) {
                const scale = -work.coffs[indexB] * divPivot;
                work.rowOperation(pivotRow, rowB, pivotRow, scale);
                inverse.rowOperation(pivotRow, rowB, 0, scale);
                // console.log("Eliminate Row " + rowB + " from pivot " + pivotRow);
                // console.log(work.rowArrays());
                // console.log(inverse.rowArrays());
            }
        }
        // divide through by pivots (all have  beeen confirmed nonzero)
        inverse.scaleRowsInPlace(1.0 / work.coffs[0], 1.0 / work.coffs[5], 1.0 / work.coffs[10], 1.0 / work.coffs[15]);
        // console.log("descaled", inverse.rowArrays());
        return inverse;
    }
    /** @returns Restructure the matrix rows as separate arrays. (Useful for printing)
     * @param f optional function to provide alternate values for each entry (e.g. force fuzz to zero.)
     */
    rowArrays(f) {
        if (f)
            return [
                [f(this.coffs[0]), f(this.coffs[1]), f(this.coffs[2]), f(this.coffs[3])],
                [f(this.coffs[4]), f(this.coffs[5]), f(this.coffs[6]), f(this.coffs[7])],
                [f(this.coffs[8]), f(this.coffs[9]), f(this.coffs[10]), f(this.coffs[11])],
                [f(this.coffs[12]), f(this.coffs[13]), f(this.coffs[14]), f(this.coffs[15])]
            ];
        else
            return [
                [this.coffs[0], this.coffs[1], this.coffs[2], this.coffs[3]],
                [this.coffs[4], this.coffs[5], this.coffs[6], this.coffs[7]],
                [this.coffs[8], this.coffs[9], this.coffs[10], this.coffs[11]],
                [this.coffs[12], this.coffs[13], this.coffs[14], this.coffs[15]]
            ];
    }
    scaleRowsInPlace(ax, ay, az, aw) {
        for (let i = 0; i < 4; i++)
            this.coffs[i] *= ax;
        for (let i = 4; i < 8; i++)
            this.coffs[i] *= ay;
        for (let i = 8; i < 12; i++)
            this.coffs[i] *= az;
        for (let i = 12; i < 16; i++)
            this.coffs[i] *= aw;
    }
}
exports.Matrix4d = Matrix4d;
/** Map4 carries two Matrix4d which are inverses of each other.
 */
class Map4d {
    constructor(matrix0, matrix1) {
        this.matrix0 = matrix0;
        this.matrix1 = matrix1;
    }
    /** @returns Return a reference to (not copy of) the "forward" Matrix4d */
    get transform0() { return this.matrix0; }
    /** @returns Return a reference to (not copy of) the "reverse" Matrix4d */
    get transform1() { return this.matrix1; }
    /** Create a Map4d, capturing the references to the two matrices. */
    static createRefs(matrix0, matrix1) {
        return new Map4d(matrix0, matrix1);
    }
    /** Create an identity map. */
    static createIdentity() { return new Map4d(Matrix4d.createIdentity(), Matrix4d.createIdentity()); }
    /** Create a Map4d with given transform pair.
     * @returns undefined if the transforms are not inverses of each other.
     */
    static createTransform(transform0, transform1) {
        const product = transform0.multiplyTransformTransform(transform1);
        if (!product.isIdentity())
            return undefined;
        return new Map4d(Matrix4d.createTransform(transform0), Matrix4d.createTransform(transform1));
    }
    /**
     * Create a mapping the scales and translates (no rotation) between boxes.
     * @param lowA low point of box A
     * @param highA high point of box A
     * @param lowB low point of box B
     * @param highB high point of box B
     */
    static createBoxMap(lowA, highA, lowB, highB, result) {
        const t0 = Matrix4d.createBoxToBox(lowA, highA, lowB, highB, result ? result.transform0 : undefined);
        const t1 = Matrix4d.createBoxToBox(lowB, highB, lowA, highA, result ? result.transform1 : undefined);
        if (t0 && t1) {
            if (result)
                return result;
            return new Map4d(t0, t1);
        }
        return undefined;
    }
    /** Copy contents from another Map4d */
    setFrom(other) { this.matrix0.setFrom(other.matrix0), this.matrix1.setFrom(other.matrix1); }
    /** @returns Return a clone of this Map4d */
    clone() { return new Map4d(this.matrix0.clone(), this.matrix1.clone()); }
    /** Reinitialize this Map4d as an identity. */
    setIdentity() { this.matrix0.setIdentity(); this.matrix1.setIdentity(); }
    /** Set this map4d from a json object that the two Matrix4d values as properties named matrix0 and matrix1 */
    setFromJSON(json) {
        if (json.matrix0 && json.matrix1) {
            this.matrix0.setFromJSON(json.matrix0);
            this.matrix1.setFromJSON(json.matrix1);
        }
        else
            this.setIdentity();
    }
    /** Create a map4d from a json object that the two Matrix4d values as properties named matrix0 and matrix1 */
    static fromJSON(json) {
        const result = new Map4d(Matrix4d.createIdentity(), Matrix4d.createIdentity());
        result.setFromJSON(json);
        return result;
    }
    /** @returns a json object `{matrix0: value0, matrix1: value1}` */
    toJSON() { return { matrix0: this.matrix0.toJSON(), matrix1: this.matrix1.toJSON() }; }
    isAlmostEqual(other) {
        return this.matrix0.isAlmostEqual(other.matrix0) && this.matrix1.isAlmostEqual(other.matrix1);
    }
    /** Create a map between a frustum and world coordinates.
     * @param origin lower left of frustum
     * @param uVector Vector from lower left rear to lower right rear
     * @param vVector Vector from lower left rear to upper left rear
     * @param wVector Vector from lower left rear to lower left front, i.e. lower left rear towards eye.
     * @param fraction front size divided by rear size.
     */
    static createVectorFrustum(origin, uVector, vVector, wVector, fraction) {
        fraction = Math.max(fraction, 1.0e-8);
        const slabToWorld = Transform_1.Transform.createOriginAndMatrix(origin, Transform_1.RotMatrix.createColumns(uVector, vVector, wVector));
        const worldToSlab = slabToWorld.inverse();
        if (!worldToSlab)
            return undefined;
        const worldToSlabMap = Map4d.createTransform(worldToSlab, slabToWorld);
        if (undefined === worldToSlab)
            return undefined;
        const slabToNPCMap = new Map4d(Matrix4d.createRowValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, fraction, 0, 0, 0, fraction - 1.0, 1), Matrix4d.createRowValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1.0 / fraction, 0, 0, 0, (1.0 - fraction) / fraction, 1));
        if (undefined === worldToSlabMap)
            return undefined;
        const result = slabToNPCMap.multiplyMapMap(worldToSlabMap);
        /*
        let numIdentity = 0;
        const productA = worldToSlabMap.matrix0.multiplyMatrixMatrix(worldToSlabMap.matrix1);
        if (productA.isIdentity())
          numIdentity++;
        const productB = slabToNPCMap.matrix0.multiplyMatrixMatrix(slabToNPCMap.matrix1);
        if (productB.isIdentity())
          numIdentity++;
        const product = result.matrix0.multiplyMatrixMatrix(result.matrix1);
        if (product.isIdentity())
          numIdentity++;
        if (numIdentity === 3)
            return result;
          */
        return result;
    }
    multiplyMapMap(other) {
        return new Map4d(this.matrix0.multiplyMatrixMatrix(other.matrix0), other.matrix1.multiplyMatrixMatrix(this.matrix1));
    }
    reverseInPlace() {
        const temp = this.matrix0;
        this.matrix0 = this.matrix1;
        this.matrix1 = temp;
    }
    /** return a Map4d whose transform0 is
     * other.transform0 * this.transform0 * other.transform1
     */
    sandwich0This1(other) {
        return new Map4d(other.matrix0.multiplyMatrixMatrix(this.matrix0.multiplyMatrixMatrix(other.matrix1)), other.matrix0.multiplyMatrixMatrix(this.matrix1.multiplyMatrixMatrix(other.matrix1)));
    }
    /** return a Map4d whose transform0 is
     * other.transform1 * this.transform0 * other.transform0
     */
    sandwich1This0(other) {
        return new Map4d(other.matrix1.multiplyMatrixMatrix(this.matrix0.multiplyMatrixMatrix(other.matrix0)), other.matrix1.multiplyMatrixMatrix(this.matrix1.multiplyMatrixMatrix(other.matrix0)));
    }
} // Map4d
exports.Map4d = Map4d;
/**
 * A Plane4dByOriginAndVectors is a 4d origin and pair of 4d "vectors" defining a 4d plane.
 *
 * * The parameterization of the plane is    `X = A + U*t + V*v`
 * * The unit coefficient of pointA makes this like a Plane3dByOriginAndVectors. Hence it is not a barycentric combination of 4d points.
 */
class Plane4dByOriginAndVectors {
    constructor(origin, vectorU, vectorV) {
        this.origin = origin;
        this.vectorU = vectorU;
        this.vectorV = vectorV;
    }
    /** @returns Return a clone of this plane */
    clone(result) {
        if (result) {
            result.setFrom(this);
            return result;
        }
        return new Plane4dByOriginAndVectors(this.origin.clone(), this.vectorU.clone(), this.vectorV.clone());
    }
    /** copy all content from other plane */
    setFrom(other) {
        this.origin.setFrom(other.origin);
        this.vectorU.setFrom(other.vectorU);
        this.vectorV.setFrom(other.vectorV);
    }
    /** @returns Return true if origin, vectorU, and vectorV pass isAlmostEqual. */
    isAlmostEqual(other) {
        return this.origin.isAlmostEqual(other.origin)
            && this.vectorU.isAlmostEqual(other.vectorU)
            && this.vectorV.isAlmostEqual(other.vectorV);
    }
    /** Create a plane with (copies of) origin, vectorU, vectorV parameters
     */
    static createOriginAndVectors(origin, vectorU, vectorV, result) {
        if (result) {
            result.setOriginAndVectors(origin, vectorU, vectorV);
            return result;
        }
        return new Plane4dByOriginAndVectors(origin.clone(), vectorU.clone(), vectorV.clone());
    }
    /** Set all numeric data from complete list of (x,y,z,w) in origin, vectorU, and vectorV */
    setOriginAndVectorsXYZW(x0, y0, z0, w0, ux, uy, uz, uw, vx, vy, vz, vw) {
        this.origin.set(x0, y0, z0, w0);
        this.vectorU.set(ux, uy, uz, uw);
        this.vectorV.set(vx, vy, vz, vw);
        return this;
    }
    /** Copy the contents of origin, vectorU, vectorV parameters to respective member variables */
    setOriginAndVectors(origin, vectorU, vectorV) {
        this.origin.setFrom(origin);
        this.vectorU.setFrom(vectorU);
        this.vectorV.setFrom(vectorV);
        return this;
    }
    /** Create from complete list of (x,y,z,w) in origin, vectorU, and vectorV */
    static createOriginAndVectorsXYZW(x0, y0, z0, w0, ux, uy, uz, uw, vx, vy, vz, vw, result) {
        if (result)
            return result.setOriginAndVectorsXYZW(x0, y0, z0, w0, ux, uy, uz, uw, vx, vy, vz, vw);
        return new Plane4dByOriginAndVectors(Point4d.create(x0, y0, z0, w0), Point4d.create(ux, uy, uz, uw), Point4d.create(vx, vy, vz, uw));
    }
    static createOriginAndTargets3d(origin, targetU, targetV, result) {
        return Plane4dByOriginAndVectors.createOriginAndVectorsXYZW(origin.x, origin.y, origin.z, 1.0, targetU.x - origin.x, targetU.y - origin.y, targetU.z - origin.z, 0.0, targetV.x - origin.x, targetV.y - origin.y, targetV.z - origin.z, 0.0, result);
    }
    fractionToPoint(u, v, result) {
        return this.origin.plus2Scaled(this.vectorU, u, this.vectorV, v, result);
    }
    static createXYPlane(result) {
        return Plane4dByOriginAndVectors.createOriginAndVectorsXYZW(0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, result);
    }
}
exports.Plane4dByOriginAndVectors = Plane4dByOriginAndVectors;
//# sourceMappingURL=Geometry4d.js.map