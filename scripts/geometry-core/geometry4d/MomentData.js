"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty no-console*/
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Matrix4d_1 = require("./Matrix4d");
/**
 * A MomentData structrue carries data used in calculation of moments of inertia.
 * * origin = local origin used as moments are summed.
 * * sums = array of summed moments.
 *   * The [i,j] entry of the sums is a summed or integrated moment for product of axis i and j.
 *      * axes 0,1,2 are x,y,z
 *         * e.g. entry [0,1] is summed product xy
 *      * axis 3 is "w", which is 1 in sums.
 *         * e.g. entry 03 is summed x
 */
class MomentData {
    constructor() {
        this.origin = Point3dVector3d_1.Point3d.createZero();
        this.sums = Matrix4d_1.Matrix4d.createZero();
        this.localToWorldMap = Transform_1.Transform.createIdentity();
        this.radiusOfGyration = Point3dVector3d_1.Vector3d.create();
    }
    static momentTensorFromInertiaProducts(products) {
        const rr = products.sumDiagonal();
        const result = Matrix3d_1.Matrix3d.createScale(rr, rr, rr);
        result.addScaledInPlace(products, -1.0);
        return result;
    }
    static sortColumnsForIncreasingMoments(axes, moments) {
        const points = [
            axes.indexedColumnWithWeight(0, moments.x),
            axes.indexedColumnWithWeight(1, moments.y),
            axes.indexedColumnWithWeight(2, moments.z)
        ].sort((dataA, dataB) => {
            if (dataA.w < dataB.w)
                return -1;
            if (dataA.w > dataB.w)
                return 1;
            return 0;
        });
        axes.setColumnsPoint4dXYZ(points[0], points[1], points[2]);
        moments.set(points[0].w, points[1].w, points[2].w);
    }
    static pointsToPrincipalAxes(points) {
        const moments = new MomentData();
        if (points.length === 0)
            return moments;
        moments.clearSums(points[0]);
        moments.accumulatePointMomentsFromOrigin(points);
        if (moments.shiftSumsToCentroid()) {
            const products = moments.sums.matrixPart();
            const tensor = MomentData.momentTensorFromInertiaProducts(products);
            const moment2 = Point3dVector3d_1.Vector3d.create();
            const axisVectors = Matrix3d_1.Matrix3d.createZero();
            tensor.fastSymmetricEigenvalues(axisVectors, moment2);
            MomentData.sortColumnsForIncreasingMoments(axisVectors, moment2);
            moments.localToWorldMap = Transform_1.Transform.createOriginAndMatrix(moments.origin, axisVectors);
            moments.radiusOfGyration.set(Math.sqrt(moment2.x), Math.sqrt(moment2.y), Math.sqrt(moment2.z));
            moments.radiusOfGyration.scaleInPlace(1.0 / Math.sqrt(moments.sums.weight()));
        }
        return moments;
    }
    /**
     * Compute principal axes from inertial products
     * @param origin The origin used for the inertia products.
     * @param inertiaProducts The inertia products -- sums or integrals of [xx,xy,xz,xw; yx,yy, yz,yw; zx,zy,zz,zw; wx,wy,wz,w]
     */
    static inertiaProductsToPrincipalAxes(origin, inertiaProducts) {
        const moments = new MomentData();
        moments.sums.setFrom(inertiaProducts);
        moments.origin.setFrom(origin);
        if (!moments.shiftSumsToCentroid())
            return undefined;
        const products = moments.sums.matrixPart();
        const tensor = MomentData.momentTensorFromInertiaProducts(products);
        const moment2 = Point3dVector3d_1.Vector3d.create();
        const axisVectors = Matrix3d_1.Matrix3d.createZero();
        tensor.fastSymmetricEigenvalues(axisVectors, moment2);
        MomentData.sortColumnsForIncreasingMoments(axisVectors, moment2);
        moments.localToWorldMap = Transform_1.Transform.createOriginAndMatrix(moments.origin, axisVectors);
        moments.radiusOfGyration.set(Math.sqrt(moment2.x), Math.sqrt(moment2.y), Math.sqrt(moment2.z));
        moments.radiusOfGyration.scaleInPlace(1.0 / Math.sqrt(moments.sums.weight()));
        return moments;
    }
    clearSums(origin) {
        this.sums.setZero();
        if (origin)
            this.origin.setFrom(origin);
        else
            this.origin.setZero();
    }
    accumulatePointMomentsFromOrigin(points) {
        for (const p of points) {
            this.sums.addMomentsInPlace(p.x - this.origin.x, p.y - this.origin.y, p.z - this.origin.z, 1.0);
        }
    }
    shiftSumsToCentroid() {
        const xyz = this.sums.columnW().realPoint();
        if (xyz) {
            this.origin.addInPlace(xyz);
            const translation = Matrix4d_1.Matrix4d.createTranslationXYZ(-xyz.x, -xyz.y, -xyz.z);
            const TA = translation.multiplyMatrixMatrix(this.sums);
            TA.multiplyMatrixMatrixTranspose(translation, this.sums);
            return true;
        }
        return false;
    }
}
exports.MomentData = MomentData;
//# sourceMappingURL=MomentData.js.map