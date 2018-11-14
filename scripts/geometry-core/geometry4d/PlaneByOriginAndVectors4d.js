"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Point4d_1 = require("./Point4d");
/**
 * A Plane4dByOriginAndVectors is a 4d origin and pair of 4d "vectors" defining a 4d plane.
 *
 * * The parameterization of the plane is    `X = A + U*t + V*v`
 * * The unit coefficient of pointA makes this like a Plane3dByOriginAndVectors. Hence it is not a barycentric combination of 4d points.
 */
class PlaneByOriginAndVectors4d {
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
        return new PlaneByOriginAndVectors4d(this.origin.clone(), this.vectorU.clone(), this.vectorV.clone());
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
        return new PlaneByOriginAndVectors4d(origin.clone(), vectorU.clone(), vectorV.clone());
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
        return new PlaneByOriginAndVectors4d(Point4d_1.Point4d.create(x0, y0, z0, w0), Point4d_1.Point4d.create(ux, uy, uz, uw), Point4d_1.Point4d.create(vx, vy, vz, uw));
    }
    static createOriginAndTargets3d(origin, targetU, targetV, result) {
        return PlaneByOriginAndVectors4d.createOriginAndVectorsXYZW(origin.x, origin.y, origin.z, 1.0, targetU.x - origin.x, targetU.y - origin.y, targetU.z - origin.z, 0.0, targetV.x - origin.x, targetV.y - origin.y, targetV.z - origin.z, 0.0, result);
    }
    fractionToPoint(u, v, result) {
        return this.origin.plus2Scaled(this.vectorU, u, this.vectorV, v, result);
    }
    static createXYPlane(result) {
        return PlaneByOriginAndVectors4d.createOriginAndVectorsXYZW(0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, result);
    }
}
exports.PlaneByOriginAndVectors4d = PlaneByOriginAndVectors4d;
//# sourceMappingURL=PlaneByOriginAndVectors4d.js.map