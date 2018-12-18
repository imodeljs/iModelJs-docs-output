"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Geometry_1 = require("../Geometry");
const Point4d_1 = require("../geometry4d/Point4d");
const Range_1 = require("./Range");
const Point2dVector2d_1 = require("./Point2dVector2d");
const Point3dVector3d_1 = require("./Point3dVector3d");
const Matrix3d_1 = require("./Matrix3d");
/** A transform is an origin and a Matrix3d.
 *
 * * This describes a coordinate frame with
 * this origin, with the columns of the Matrix3d being the
 * local x,y,z axis directions.
 * *  Beware that for common transformations (e.g. scale about point,
 * rotate around line, mirror across a plane) the "fixed point" that is used
 * when describing the transform is NOT the "origin" stored in the transform.
 * Setup methods (e.g createFixedPointAndMatrix, createScaleAboutPoint)
 * take care of determining the appropriate origin coordinates.
 */
class Transform {
    // Constructor accepts and uses POINTER to content .. no copy here.
    constructor(origin, matrix) { this._origin = origin; this._matrix = matrix; }
    /** The identity Transform. Value is frozen and cannot be modified. */
    static get identity() {
        if (undefined === this._identity) {
            this._identity = Transform.createIdentity();
            this._identity.freeze();
        }
        return this._identity;
    }
    freeze() { Object.freeze(this); Object.freeze(this._origin); this._matrix.freeze(); }
    setFrom(other) { this._origin.setFrom(other._origin), this._matrix.setFrom(other._matrix); }
    /** Set this Transform to be an identity. */
    setIdentity() { this._origin.setZero(); this._matrix.setIdentity(); }
    setFromJSON(json) {
        if (json) {
            if (json instanceof Object && json.origin && json.matrix) {
                this._origin.setFromJSON(json.origin);
                this._matrix.setFromJSON(json.matrix);
                return;
            }
            if (Geometry_1.Geometry.isArrayOfNumberArray(json, 3, 4)) {
                const data = json;
                this._matrix.setRowValues(data[0][0], data[0][1], data[0][2], data[1][0], data[1][1], data[1][2], data[2][0], data[2][1], data[2][2]);
                this._origin.set(data[0][3], data[1][3], data[2][3]);
                return;
            }
        }
        this.setIdentity();
    }
    /**
     * Test for near equality with other Transform.  Comparison uses the isAlmostEqual methods on
     * the origin and matrix parts.
     * @param other Transform to compare to.
     */
    isAlmostEqual(other) { return this._origin.isAlmostEqual(other._origin) && this._matrix.isAlmostEqual(other._matrix); }
    toJSON() {
        // return { origin: this._origin.toJSON(), matrix: this._matrix.toJSON() };
        return [
            [this._matrix.coffs[0], this._matrix.coffs[1], this._matrix.coffs[2], this._origin.x],
            [this._matrix.coffs[3], this._matrix.coffs[4], this._matrix.coffs[5], this._origin.y],
            [this._matrix.coffs[6], this._matrix.coffs[7], this._matrix.coffs[8], this._origin.z],
        ];
    }
    static fromJSON(json) {
        const result = Transform.createIdentity();
        result.setFromJSON(json);
        return result;
    }
    /** Copy the contents of this transform into a new Transform (or to the result, if specified). */
    clone(result) {
        if (result) {
            result._matrix.setFrom(this._matrix);
            result._origin.setFrom(this._origin);
            return result;
        }
        return new Transform(Point3dVector3d_1.Point3d.createFrom(this._origin), this._matrix.clone());
    }
    /** @returns Return a copy of this Transform, modified so that its axes are rigid
     */
    cloneRigid(axisOrder = 0 /* XYZ */) {
        const axes0 = Matrix3d_1.Matrix3d.createRigidFromMatrix3d(this.matrix, axisOrder);
        if (!axes0)
            return undefined;
        return new Transform(this.origin.cloneAsPoint3d(), axes0);
    }
    /** Create a copy with the given origin and matrix captured as the Transform origin and Matrix3d. */
    static createRefs(origin, matrix, result) {
        if (result) {
            result._origin = origin;
            result._matrix = matrix;
            return result;
        }
        return new Transform(origin, matrix);
    }
    /** Create a transform with complete contents given */
    static createRowValues(qxx, qxy, qxz, ax, qyx, qyy, qyz, ay, qzx, qzy, qzz, az, result) {
        if (result) {
            result._origin.set(ax, ay, az);
            result._matrix.setRowValues(qxx, qxy, qxz, qyx, qyy, qyz, qzx, qzy, qzz);
            return result;
        }
        return new Transform(Point3dVector3d_1.Point3d.create(ax, ay, az), Matrix3d_1.Matrix3d.createRowValues(qxx, qxy, qxz, qyx, qyy, qyz, qzx, qzy, qzz));
    }
    /**
     * create a Transform with translation provided by x,y,z parts.
     * @param x x part of translation
     * @param y y part of translation
     * @param z z part of translation
     * @param result optional result
     * @returns new or updated transform.
     */
    static createTranslationXYZ(x = 0, y = 0, z = 0, result) {
        return Transform.createRefs(Point3dVector3d_1.Vector3d.create(x, y, z), Matrix3d_1.Matrix3d.createIdentity(), result);
    }
    /** Create a matrix with specified translation part.
     * @param XYZ x,y,z parts of the translation.
     * @returns new or updated transform.
     */
    static createTranslation(translation, result) {
        return Transform.createRefs(translation, Matrix3d_1.Matrix3d.createIdentity(), result);
    }
    /** Return a reference to the matrix within the transform.  (NOT a copy) */
    get matrix() { return this._matrix; }
    /** Return a reference to the origin within the transform.  (NOT a copy) */
    get origin() { return this._origin; }
    /** return a (clone of) the origin part of the transform, as a Point3d */
    getOrigin() { return Point3dVector3d_1.Point3d.createFrom(this._origin); }
    /** return a (clone of) the origin part of the transform, as a Vector3d */
    getTranslation() { return Point3dVector3d_1.Vector3d.createFrom(this._origin); }
    /** test if the transform has 000 origin and identity Matrix3d */
    get isIdentity() {
        return this._matrix.isIdentity && this._origin.isAlmostZero;
    }
    /** Return an identity transform, optionally filling existing transform.  */
    static createIdentity(result) {
        if (result) {
            result._origin.setZero();
            result._matrix.setIdentity();
            return result;
        }
        return Transform.createRefs(Point3dVector3d_1.Point3d.createZero(), Matrix3d_1.Matrix3d.createIdentity());
    }
    /** Create by directly installing origin and matrix
     * this is a the appropriate construction when the columns of the matrix are coordinate axes of a local-to-global mapping
     * Note there is a closely related createFixedPointAndMatrix whose point input is the fixed point of the global-to-global transformation.
     */
    static createOriginAndMatrix(origin, matrix, result) {
        return Transform.createRefs(origin ? origin.cloneAsPoint3d() : Point3dVector3d_1.Point3d.createZero(), matrix === undefined ? Matrix3d_1.Matrix3d.createIdentity() : matrix.clone(), result);
    }
    /** Create by directly installing origin and columns of the matrix
     */
    static createOriginAndMatrixColumns(origin, vectorX, vectorY, vectorZ, result) {
        if (result)
            result.setOriginAndMatrixColumns(origin, vectorX, vectorY, vectorZ);
        else
            result = Transform.createRefs(Point3dVector3d_1.Vector3d.createFrom(origin), Matrix3d_1.Matrix3d.createColumns(vectorX, vectorY, vectorZ));
        return result;
    }
    /** Reinitialize by directly installing origin and columns of the matrix
     */
    setOriginAndMatrixColumns(origin, vectorX, vectorY, vectorZ) {
        this._origin.setFrom(origin);
        this._matrix.setColumns(vectorX, vectorY, vectorZ);
    }
    /** Create a transform with the specified matrix. Compute an origin (different from the given fixedPoint)
     * so that the fixedPoint maps back to itself.
     */
    static createFixedPointAndMatrix(fixedPoint, matrix, result) {
        const origin = Matrix3d_1.Matrix3d.XYZMinusMatrixTimesXYZ(fixedPoint, matrix, fixedPoint);
        return Transform.createRefs(origin, matrix.clone(), result);
    }
    /** Create a Transform which leaves the fixedPoint unchanged and
     * scales everything else around it by a single scale factor.
     */
    static createScaleAboutPoint(fixedPoint, scale, result) {
        const matrix = Matrix3d_1.Matrix3d.createScale(scale, scale, scale);
        const origin = Matrix3d_1.Matrix3d.XYZMinusMatrixTimesXYZ(fixedPoint, matrix, fixedPoint);
        return Transform.createRefs(origin, matrix, result);
    }
    /** Transform the input 2d point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyPoint2d(source, result) {
        return Matrix3d_1.Matrix3d.XYPlusMatrixTimesXY(this._origin, this._matrix, source, result);
    }
    /** Transform the input 3d point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyPoint3d(point, result) {
        return Matrix3d_1.Matrix3d.XYZPlusMatrixTimesXYZ(this._origin, this._matrix, point, result);
    }
    /** Transform the input point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZ(x, y, z, result) {
        return Matrix3d_1.Matrix3d.XYZPlusMatrixTimesCoordinates(this._origin, this._matrix, x, y, z, result);
    }
    /** Multiply a specific row of the transform times xyz. Return the (number). */
    multiplyComponentXYZ(componentIndex, x, y, z) {
        const coffs = this._matrix.coffs;
        const i0 = 3 * componentIndex;
        return this.origin.at(componentIndex) + coffs[i0] * x + coffs[i0 + 1] * y + coffs[i0 + 2] * z;
    }
    /** Multiply a specific row of the transform times (weighted!) xyzw. Return the (number). */
    multiplyComponentXYZW(componentIndex, x, y, z, w) {
        const coffs = this._matrix.coffs;
        const i0 = 3 * componentIndex;
        return this.origin.at(componentIndex) * w +
            coffs[i0] * x + coffs[i0 + 1] * y + coffs[i0 + 2] * z;
    }
    /** Transform the input homogeneous point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZW(x, y, z, w, result) {
        return Matrix3d_1.Matrix3d.XYZPlusMatrixTimesWeightedCoordinates(this._origin, this._matrix, x, y, z, w, result);
    }
    /** Transform the input homogeneous point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZWToFloat64Array(x, y, z, w, result) {
        return Matrix3d_1.Matrix3d.XYZPlusMatrixTimesWeightedCoordinatesToFloat64Array(this._origin, this._matrix, x, y, z, w, result);
    }
    /** Transform the input homogeneous point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZToFloat64Array(x, y, z, result) {
        return Matrix3d_1.Matrix3d.XYZPlusMatrixTimesCoordinatesToFloat64Array(this._origin, this._matrix, x, y, z, result);
    }
    /** Multiply the tranposed transform (as 4x4 with 0001 row) by Point4d given as xyzw..  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyTransposeXYZW(x, y, z, w, result) {
        const coffs = this._matrix.coffs;
        const origin = this._origin;
        return Point4d_1.Point4d.create(x * coffs[0] + y * coffs[3] + z * coffs[6], x * coffs[1] + y * coffs[4] + z * coffs[7], x * coffs[2] + y * coffs[5] + z * coffs[8], x * origin.x + y * origin.y + z * origin.z + w, result);
    }
    /** for each point:  replace point by Transform*point */
    multiplyPoint3dArrayInPlace(points) {
        let point;
        for (point of points)
            Matrix3d_1.Matrix3d.XYZPlusMatrixTimesXYZ(this._origin, this._matrix, point, point);
    }
    /** @returns Return product of the transform's inverse times a point. */
    multiplyInversePoint3d(point, result) {
        return this._matrix.multiplyInverseXYZAsPoint3d(point.x - this._origin.x, point.y - this._origin.y, point.z - this._origin.z, result);
    }
    /**
     * *  for each point:   multiply    transform * point
     * *  if result is given, resize to match source and replace each corresponding pi
     * *  if result is not given, return a new array.
     */
    multiplyInversePoint3dArray(source, result) {
        if (!this._matrix.computeCachedInverse(true))
            return undefined;
        const originX = this.origin.x;
        const originY = this.origin.y;
        const originZ = this.origin.z;
        if (result) {
            const n = Transform.matchArrayLengths(source, result, Point3dVector3d_1.Point3d.createZero);
            for (let i = 0; i < n; i++)
                this._matrix.multiplyInverseXYZAsPoint3d(source[i].x - originX, source[i].y - originY, source[i].z - originZ, result[i]);
        }
        result = [];
        for (const p of source)
            result.push(this._matrix.multiplyInverseXYZAsPoint3d(p.x - originX, p.y - originY, p.z - originZ));
        return result;
    }
    /**
     * *  for each point in source:   multiply    transformInverse * point  in place inthe point.
     * * return false if not invertible.
     */
    multiplyInversePoint3dArrayInPlace(source) {
        if (!this._matrix.computeCachedInverse(true))
            return false;
        const originX = this.origin.x;
        const originY = this.origin.y;
        const originZ = this.origin.z;
        const n = source.length;
        for (let i = 0; i < n; i++)
            this._matrix.multiplyInverseXYZAsPoint3d(source[i].x - originX, source[i].y - originY, source[i].z - originZ, source[i]);
        return true;
    }
    // modify destination so it has non-null points for the same length as the source.
    // (ASSUME existing elements of dest are non-null, and that parameters are given as either Point2d or Point3d arrays)
    static matchArrayLengths(source, dest, constructionFunction) {
        const numSource = source.length;
        const numDest = dest.length;
        if (numSource > numDest) {
            for (let i = numDest; i < numSource; i++) {
                dest.push(constructionFunction());
            }
        }
        else if (numDest > numSource) {
            dest.length = numSource;
        }
        return numSource;
    }
    /**
     * *  for each point:   multiply    transform * point
     * *  if result is given, resize to match source and replace each corresponding pi
     * *  if result is not given, return a new array.
     */
    multiplyPoint2dArray(source, result) {
        if (result) {
            const n = Transform.matchArrayLengths(source, result, Point2dVector2d_1.Point2d.createZero);
            for (let i = 0; i < n; i++)
                Matrix3d_1.Matrix3d.XYPlusMatrixTimesXY(this._origin, this._matrix, source[i], result[i]);
            return result;
        }
        result = [];
        for (const p of source)
            result.push(Matrix3d_1.Matrix3d.XYPlusMatrixTimesXY(this._origin, this._matrix, p));
        return result;
    }
    /**
     * *  for each point:   multiply    transform * point
     * *  if result is given, resize to match source and replace each corresponding pi
     * *  if result is not given, return a new array.
     */
    multiplyPoint3dArray(source, result) {
        if (result) {
            const n = Transform.matchArrayLengths(source, result, Point3dVector3d_1.Point3d.createZero);
            for (let i = 0; i < n; i++)
                Matrix3d_1.Matrix3d.XYZPlusMatrixTimesXYZ(this._origin, this._matrix, source[i], result[i]);
            return result;
        }
        result = [];
        for (const p of source)
            result.push(Matrix3d_1.Matrix3d.XYZPlusMatrixTimesXYZ(this._origin, this._matrix, p));
        return result;
    }
    /** Multiply the vector by the Matrix3d part of the transform.
     *
     * *  The transform's origin is not used.
     * *  Return as new or result by usual optional result convention
     */
    multiplyVector(vector, result) {
        return this._matrix.multiplyVector(vector, result);
    }
    /** Multiply the vector (x,y,z) by the Matrix3d part of the transform.
     *
     * *  The transform's origin is not used.
     * *  Return as new or result by usual optional result convention
     */
    multiplyVectorXYZ(x, y, z, result) {
        return this._matrix.multiplyXYZ(x, y, z, result);
    }
    /** multiply this Transform times other Transform.
     * @param other right hand transform for multiplication.
     * @param result optional preallocated result to reuse.
     */
    multiplyTransformTransform(other, result) {
        if (!result)
            return Transform.createRefs(Matrix3d_1.Matrix3d.XYZPlusMatrixTimesXYZ(this._origin, this._matrix, other._origin), this._matrix.multiplyMatrixMatrix(other._matrix));
        result.setMultiplyTransformTransform(this, other);
        return result;
    }
    /**
     * multiply transformA * transformB, store to calling instance.
     * @param transformA left operand
     * @param transformB right operand
     */
    setMultiplyTransformTransform(transformA, transformB) {
        if (Transform._scratchPoint === undefined)
            Transform._scratchPoint = Point3dVector3d_1.Point3d.create();
        Matrix3d_1.Matrix3d.XYZPlusMatrixTimesXYZ(transformA._origin, transformA._matrix, transformB._origin, Transform._scratchPoint);
        this._origin.setFrom(Transform._scratchPoint);
        transformA._matrix.multiplyMatrixMatrix(transformB._matrix, this._matrix);
    }
    //   [Q A][R 0] = [QR A]
    //   [0 1][0 1]   [0  1]
    /** multiply this Transform times other Matrix3d, with other considered to be a Transform with 0 translation.
     * @param other right hand Matrix3d for multiplication.
     * @param result optional preallocated result to reuse.
     */
    multiplyTransformMatrix3d(other, result) {
        if (!result)
            return Transform.createRefs(this._origin.cloneAsPoint3d(), this._matrix.multiplyMatrixMatrix(other));
        this._matrix.multiplyMatrixMatrix(other, result._matrix);
        result._origin.setFrom(this._origin);
        return result;
    }
    /** transform each of the 8 corners of a range. Return the range of the transformed corers */
    multiplyRange(range, result) {
        // snag current values to allow aliasing.
        const lowx = range.low.x;
        const lowy = range.low.y;
        const lowz = range.low.z;
        const highx = range.high.x;
        const highy = range.high.y;
        const highz = range.high.z;
        result = Range_1.Range3d.createNull(result);
        result.extendTransformedXYZ(this, lowx, lowy, lowz);
        result.extendTransformedXYZ(this, highx, lowy, lowz);
        result.extendTransformedXYZ(this, lowx, highy, lowz);
        result.extendTransformedXYZ(this, highx, highy, lowz);
        result.extendTransformedXYZ(this, lowx, lowy, highz);
        result.extendTransformedXYZ(this, highx, lowy, highz);
        result.extendTransformedXYZ(this, lowx, highy, highz);
        result.extendTransformedXYZ(this, highx, highy, highz);
        return result;
    }
    /**
     * @returns Return a Transform which is the inverse of this transform. Return undefined if this Transform's matrix is singular.
     */
    inverse() {
        const matrixInverse = this._matrix.inverse();
        if (!matrixInverse)
            return undefined;
        return Transform.createRefs(matrixInverse.multiplyXYZ(-this._origin.x, -this._origin.y, -this._origin.z), matrixInverse);
    }
    /** Initialize transforms that map each direction of a box (axis aligned) to `[0,1]`.
     * @param min the "000" corner of the box
     * @param max the "111" corner of the box
     * @param npcToGlobal (object created by caller, re-initialized) transform that carries 01 coordinates into the min,max box.
     * @param globalToNpc (object created by caller, re-initialized) transform that carries world coordinates into 01
     */
    static initFromRange(min, max, npcToGlobal, globalToNpc) {
        const diag = max.minus(min);
        if (diag.x === 0.0)
            diag.x = 1.0;
        if (diag.y === 0.0)
            diag.y = 1.0;
        if (diag.z === 0.0)
            diag.z = 1.0;
        const rMatrix = new Matrix3d_1.Matrix3d();
        if (npcToGlobal) {
            Matrix3d_1.Matrix3d.createScale(diag.x, diag.y, diag.z, rMatrix);
            Transform.createOriginAndMatrix(min, rMatrix, npcToGlobal);
        }
        if (globalToNpc) {
            const origin = new Point3dVector3d_1.Point3d(-min.x / diag.x, -min.y / diag.y, -min.z / diag.z);
            Matrix3d_1.Matrix3d.createScale(1.0 / diag.x, 1.0 / diag.y, 1.0 / diag.z, rMatrix);
            Transform.createOriginAndMatrix(origin, rMatrix, globalToNpc);
        }
    }
}
exports.Transform = Transform;
//# sourceMappingURL=Transform.js.map