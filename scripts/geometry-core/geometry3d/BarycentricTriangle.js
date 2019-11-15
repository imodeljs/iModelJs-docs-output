"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Point3dVector3d_1 = require("./Point3dVector3d");
const Geometry_1 = require("../Geometry");
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module CartesianGeometry */
/**
 * 3 points defining a triangle to be evaluated with Barycentric coordinates.
 * @public
 */
class BarycentricTriangle {
    /** Constructor.
     * * Point references are CAPTURED
     */
    constructor(point0, point1, point2) {
        this.points = [];
        this.points.push(point0);
        this.points.push(point1);
        this.points.push(point2);
    }
    /**
     * Return a `BarycentricTriangle` with coordinates given by enumerated x,y,z of the 3 points.
     * @param result optional pre-allocated triangle.
     */
    static createXYZXYZXYZ(x0, y0, z0, x1, y1, z1, x2, y2, z2, result) {
        if (!result)
            return new this(Point3dVector3d_1.Point3d.create(x0, y0, z0), Point3dVector3d_1.Point3d.create(x1, y1, z1), Point3dVector3d_1.Point3d.create(x2, y2, z2));
        result.points[0].set(x0, y0, z0);
        result.points[1].set(x1, y1, z1);
        result.points[2].set(x2, y2, z2);
        return result;
    }
    /** create a triangle with coordinates cloned from given points. */
    static create(point0, point1, point2, result) {
        if (!result)
            return new this(point0.clone(), point1.clone(), point2.clone());
        result.set(point0, point1, point2);
        return result;
    }
    /** Return a new `BarycentricTriangle` with the same coordinates. */
    clone(result) {
        return BarycentricTriangle.create(this.points[0], this.points[1], this.points[2], result);
    }
    /** Return area divided by sum of squared lengths. */
    get aspectRatio() {
        return Geometry_1.Geometry.safeDivideFraction(0.5 * this.points[0].crossProductToPointsMagnitude(this.points[1], this.points[2]), (this.points[0].distanceSquared(this.points[1]) + this.points[1].distanceSquared(this.points[2]) + this.points[2].distanceSquared(this.points[0])), 0);
    }
    /** Return the area of the triangle. */
    get area() {
        return 0.5 * this.points[0].crossProductToPointsMagnitude(this.points[1], this.points[2]);
    }
    /** Sum the points with given scales.
     * * In normal use, the scales will add to 1 and the result point is in the plane of the triangle.
     * * If scales do not add to 1, the point is in the triangle scaled (by the scale sum) from the origin.
     */
    fractionToPoint(a0, a1, a2, result) {
        return Point3dVector3d_1.Point3d.createAdd3Scaled(this.points[0], a0, this.points[1], a1, this.points[2], a2, result);
    }
    /** Copy all values from `other`
     */
    setFrom(other) {
        this.points[0].setFromPoint3d(other.points[0]);
        this.points[1].setFromPoint3d(other.points[1]);
        this.points[2].setFromPoint3d(other.points[2]);
    }
    /** copy contents of (not pointers to) the given points. */
    set(point0, point1, point2) {
        this.points[0].setFromPoint3d(point0);
        this.points[1].setFromPoint3d(point1);
        this.points[2].setFromPoint3d(point2);
    }
    /**
     * * For `this` and `other` BarycentricTriangles, compute cross products of vectors from point0 to point1 and from point0 to point2.
     * * return the dot product of those two
     */
    dotProductOfCrossProductsFromOrigin(other) {
        BarycentricTriangle._workVector0 = this.points[0].crossProductToPoints(this.points[1], this.points[2], BarycentricTriangle._workVector0);
        BarycentricTriangle._workVector1 = other.points[0].crossProductToPoints(other.points[1], other.points[2], BarycentricTriangle._workVector1);
        return BarycentricTriangle._workVector0.dotProduct(BarycentricTriangle._workVector1);
    }
    /** Return the centroid of the 3 points. */
    centroid(result) {
        // write it out to get single scale application.
        // Do the scale as true division (rather than multiply by precomputed 1/3).  This might protect one bit of result.
        return Point3dVector3d_1.Point3d.create((this.points[0].x + this.points[1].x + this.points[2].x) / 3.0, (this.points[0].y + this.points[1].y + this.points[2].y) / 3.0, (this.points[0].z + this.points[1].z + this.points[2].z) / 3.0, result);
    }
    /** test for point-by-point `isAlmostEqual` relationship. */
    isAlmostEqual(other) {
        return this.points[0].isAlmostEqual(other.points[0])
            && this.points[1].isAlmostEqual(other.points[1])
            && this.points[2].isAlmostEqual(other.points[2]);
    }
}
exports.BarycentricTriangle = BarycentricTriangle;
//# sourceMappingURL=BarycentricTriangle.js.map