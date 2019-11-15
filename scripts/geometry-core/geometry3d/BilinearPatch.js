"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Solid */
const Point3dVector3d_1 = require("./Point3dVector3d");
const Plane3dByOriginAndVectors_1 = require("./Plane3dByOriginAndVectors");
const Geometry_1 = require("../Geometry");
const Polynomials_1 = require("../numerics/Polynomials");
const CurveLocationDetail_1 = require("../curve/CurveLocationDetail");
const SurfaceLocationDetail_1 = require("../bspline/SurfaceLocationDetail");
/**
 * * A Bilinear patch is defined by its 4 corner points.
 * * the corner points do not have to be coplanar
 *
 * *    v direction (up)
 *      |
 *      |
 *      |
 *  point01---A1-----------point11
 *      |     |             |
 *      B0----X------------B1
 *      |     |             |
 *  point00--A0-----------point10 -----------> u direction
 *
 * * To evaluate aa point at (u,v), the following are equivalent:
 *   * interpolate with u to get both A0 and A1, viz
 *      * A0 = interpolate between point00 and point10 at fraction u
 *      * A1 = interpolate between point01 and point11 at fraction u
 *      * X = interpolate between A0 and A1 at fraction v
 *   * interpolate first with v to get B0 and B1, viz
 *      * B0 = interpolate between point00 and point01 at fraction v
 *      * B1 = interpolate between point10 and point11 at fraction v
 *      * X = interpolate between B0 and B1 at fraction u
 *   * sum all at once as
 *      * X = (1-u)* (1-v) *point00 + (1-u)*v * point01 + u * (1-v) *point10 + u* v * point11
 *
 * @internal
 */
class BilinearPatch {
    /**
     * Capture (not clone) corner points, in u direction at v=0, then in same direction at v=1
     * @param point00 Point at uv=0,0
     * @param point10 Point at uv=1,0
     * @param point10 Point at uv=0,1
     * @param point11 Point at uv=11
     */
    constructor(point00, point10, point01, point11) {
        this.point00 = point00;
        this.point10 = point10;
        this.point01 = point01;
        this.point11 = point11;
    }
    /** clone (not capture) corners to create a new BilinearPatch
     * @param point00 Point at uv=0,0
     * @param point10 Point at uv=1,0
     * @param point10 Point at uv=0,1
     * @param point11 Point at uv=11
     */
    static create(point00, point10, point01, point11) {
        return new BilinearPatch(point00.clone(), point10.clone(), point01.clone(), point11.clone());
    }
    /** create a patch with from xyz values of the 4 corners
     */
    static createXYZ(x00, y00, z00, x10, y10, z10, x01, y01, z01, x11, y11, z11) {
        return new BilinearPatch(Point3dVector3d_1.Point3d.create(x00, y00, z00), Point3dVector3d_1.Point3d.create(x10, y10, z10), Point3dVector3d_1.Point3d.create(x01, y01, z01), Point3dVector3d_1.Point3d.create(x11, y11, z11));
    }
    /** return a clone with same coordinates */
    clone() {
        return new BilinearPatch(this.point00.clone(), this.point10.clone(), this.point01.clone(), this.point11.clone());
    }
    /** test equality of the 4 points */
    isAlmostEqual(other) {
        return this.point00.isAlmostEqual(other.point00)
            && this.point10.isAlmostEqual(other.point10)
            && this.point01.isAlmostEqual(other.point01)
            && this.point11.isAlmostEqual(other.point11);
    }
    /** Apply the transform to each point */
    tryTransformInPlace(transform) {
        transform.multiplyPoint3d(this.point00, this.point00);
        transform.multiplyPoint3d(this.point10, this.point10);
        transform.multiplyPoint3d(this.point01, this.point01);
        transform.multiplyPoint3d(this.point11, this.point11);
        return true;
    }
    /**
     * return a cloned and transformed patch.
     * @param transform
     */
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    /** Extend a range by the range of the(optionally transformed) patch
     */
    extendRange(range, transform) {
        if (transform) {
            range.extendTransformedPoint(transform, this.point00);
            range.extendTransformedPoint(transform, this.point10);
            range.extendTransformedPoint(transform, this.point01);
            range.extendTransformedPoint(transform, this.point11);
        }
        else {
            range.extendPoint(this.point00);
            range.extendPoint(this.point10);
            range.extendPoint(this.point01);
            range.extendPoint(this.point11);
        }
    }
    /** Evaluate as a uv surface
     * @param u fractional position in minor (phi)
     * @param v fractional position on major (theta) arc
     */
    uvFractionToPoint(u, v, result) {
        const f00 = (1.0 - u) * (1.0 - v);
        const f10 = u * (1.0 - v);
        const f01 = (1.0 - u) * v;
        const f11 = u * v;
        return Point3dVector3d_1.Point3d.create(f00 * this.point00.x + f10 * this.point10.x + f01 * this.point01.x + f11 * this.point11.x, f00 * this.point00.y + f10 * this.point10.y + f01 * this.point01.y + f11 * this.point11.y, f00 * this.point00.z + f10 * this.point10.z + f01 * this.point01.z + f11 * this.point11.z, result);
    }
    /** Evaluate as a uv surface, returning point and two derivative vectors.
     * @param u fractional position
     * @param v fractional position
     */
    uvFractionToPointAndTangents(u, v, result) {
        const u0 = 1.0 - u;
        const v0 = 1.0 - v;
        const f00 = u0 * v0;
        const f10 = u * v0;
        const f01 = u0 * v;
        const f11 = u * v;
        return Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createOriginAndVectorsXYZ(f00 * this.point00.x + f10 * this.point10.x + f01 * this.point01.x + f11 * this.point11.x, f00 * this.point00.y + f10 * this.point10.y + f01 * this.point01.y + f11 * this.point11.y, f00 * this.point00.z + f10 * this.point10.z + f01 * this.point01.z + f11 * this.point11.z, 
        // u derivative ..
        v0 * (this.point10.x - this.point00.x) + v * (this.point11.x - this.point01.x), v0 * (this.point10.y - this.point00.y) + v * (this.point11.y - this.point01.y), v0 * (this.point10.z - this.point00.z) + v * (this.point11.z - this.point01.z), 
        // v derivative ..
        u0 * (this.point01.x - this.point00.x) + u * (this.point11.x - this.point10.x), u0 * (this.point01.y - this.point00.y) + u * (this.point11.y - this.point10.y), u0 * (this.point01.z - this.point00.z) + u * (this.point11.z - this.point10.z), result);
    }
    /** if data[ib][pivotColumn] is larger (abs) than data[ia][pivotColumn] swap the iA and iB arrays */
    static conditionalPivot(pivotColumn, data, iA, iB) {
        if (Math.abs(data[iB][pivotColumn]) > Math.abs(data[iA][pivotColumn])) {
            const q = data[iA];
            data[iA] = data[iB];
            data[iB] = q;
        }
    }
    /**
     * Compute the (points of) intersection with a ray.
     * @param ray ray in space
     * @returns 1 or 2 points if there are intersections, undefined if no intersections
     */
    intersectRay(ray) {
        const vectorU = this.point10.minus(this.point00);
        const vectorV = this.point01.minus(this.point00);
        const vectorW = this.point11.minus(this.point10);
        vectorW.subtractInPlace(vectorV);
        // coefficients of (each component of)
        //    `ray.origin + t * ray.direction = point00 + u * vectorU + v * vectorV + u*v*vectorW`
        // for x as typical direction as x, the scalar equation with coefficient order for arrays is
        //    `0 = -ray.origin.x * t + (point00.x - ray.origin.x) + u * vectorU.x + v * vectorV.x + u * v * vectorW.x`
        // (and that particular equation is invoked to isolate t when uv is known)
        const coffs = [
            new Float64Array([-ray.direction.x, this.point00.x - ray.origin.x, vectorU.x, vectorV.x, vectorW.x]),
            new Float64Array([-ray.direction.y, this.point00.y - ray.origin.y, vectorU.y, vectorV.y, vectorW.y]),
            new Float64Array([-ray.direction.z, this.point00.z - ray.origin.z, vectorU.z, vectorV.z, vectorW.z])
        ];
        // bring the largest ray.direction coefficient to the 0 equation.
        BilinearPatch.conditionalPivot(0, coffs, 0, 1);
        BilinearPatch.conditionalPivot(0, coffs, 0, 2);
        Polynomials_1.SmallSystem.eliminateFromPivot(coffs[0], 0, coffs[1], -1.0);
        Polynomials_1.SmallSystem.eliminateFromPivot(coffs[0], 0, coffs[2], -1.0);
        const uvArray = Polynomials_1.SmallSystem.solveBilinearPair(coffs[1][1], coffs[1][2], coffs[1][3], coffs[1][4], coffs[2][1], coffs[2][2], coffs[2][3], coffs[2][4]);
        if (uvArray) {
            const result = [];
            for (const uv of uvArray) {
                const t = -(coffs[0][1] + coffs[0][2] * uv.x + (coffs[0][3] + coffs[0][4] * uv.x) * uv.y) / coffs[0][0];
                const point = ray.fractionToPoint(t);
                result.push(new SurfaceLocationDetail_1.CurveAndSurfaceLocationDetail(CurveLocationDetail_1.CurveLocationDetail.createRayFractionPoint(ray, t, point), SurfaceLocationDetail_1.UVSurfaceLocationDetail.createSurfaceUVPoint(this, uv, point)));
            }
            return result;
        }
        return undefined;
    }
    /**
     * Returns the larger of the u-direction edge lengths at v=0 and v=1
     */
    maxUEdgeLength() {
        return Geometry_1.Geometry.maxXY(this.point00.distance(this.point10), this.point01.distance(this.point11));
    }
    /**
     * Returns the larger of the v-direction edge lengths at u=0 and u=1
     */
    maxVEdgeLength() {
        return Geometry_1.Geometry.maxXY(this.point00.distance(this.point01), this.point10.distance(this.point11));
    }
}
exports.BilinearPatch = BilinearPatch;
//# sourceMappingURL=BilinearPatch.js.map