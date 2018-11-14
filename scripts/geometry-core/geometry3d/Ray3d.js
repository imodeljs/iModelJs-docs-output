"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Point3dVector3d_1 = require("./Point3dVector3d");
const Transform_1 = require("./Transform");
const Matrix3d_1 = require("./Matrix3d");
const Geometry_1 = require("../Geometry");
/** A Ray3d contains
 * * an origin point.
 * * a direction vector.  The vector is NOT required to be normalized.
 *  * an optional weight (number).
 *
 */
class Ray3d {
    // constructor captures references !!!
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
    static _create(x, y, z, u, v, w) {
        return new Ray3d(Point3dVector3d_1.Point3d.create(x, y, z), Point3dVector3d_1.Vector3d.create(u, v, w));
    }
    static createXAxis() { return Ray3d._create(0, 0, 0, 1, 0, 0); }
    static createYAxis() { return Ray3d._create(0, 0, 0, 0, 1, 0); }
    static createZAxis() { return Ray3d._create(0, 0, 0, 0, 0, 1); }
    static createZero(result) {
        if (result) {
            result.origin.setZero();
            result.direction.setZero();
            return result;
        }
        return new Ray3d(Point3dVector3d_1.Point3d.createZero(), Point3dVector3d_1.Vector3d.createZero());
    }
    isAlmostEqual(other) {
        return this.origin.isAlmostEqual(other.origin) && this.direction.isAlmostEqual(other.direction);
    }
    static create(origin, direction, result) {
        if (result) {
            result.set(origin, direction);
            return result;
        }
        return new Ray3d(origin.clone(), direction.clone());
    }
    /**
     * Given a homogeneous point and its derivative components, construct a Ray3d with cartesian coordinates and derivatives.
     * @param weightedPoint `[x,y,z,w]` parts of weighted point.
     * @param weightedDerivative `[x,y,z,w]` derivatives
     * @param result
     */
    static createWeightedDerivative(weightedPoint, weightedDerivative, result) {
        const w = weightedPoint[3];
        const dw = weightedDerivative[3];
        const x = weightedPoint[0];
        const y = weightedPoint[1];
        const z = weightedPoint[2];
        const dx = weightedDerivative[0] * w - weightedPoint[0] * dw;
        const dy = weightedDerivative[1] * w - weightedPoint[1] * dw;
        const dz = weightedDerivative[2] * w - weightedPoint[2] * dw;
        if (Geometry_1.Geometry.isSmallMetricDistance(w))
            return undefined;
        const divW = 1.0 / w;
        const divWW = divW * divW;
        return Ray3d.createXYZUVW(x * divW, y * divW, z * divW, dx * divWW, dy * divWW, dz * divWW, result);
    }
    /** Create from coordinates of the origin and direction. */
    static createXYZUVW(originX, originY, originZ, directionX, directionY, directionZ, result) {
        if (result) {
            result.getOriginRef().set(originX, originY, originZ);
            result.getDirectionRef().set(directionX, directionY, directionZ);
            return result;
        }
        return new Ray3d(Point3dVector3d_1.Point3d.create(originX, originY, originZ), Point3dVector3d_1.Vector3d.create(directionX, directionY, directionZ));
    }
    /** Capture origin and direction in a new Ray3d. */
    static createCapture(origin, direction) {
        return new Ray3d(origin, direction);
    }
    /** Create from (clones of) origin, direction, and numeric weight. */
    static createPointVectorNumber(origin, direction, a, result) {
        if (result) {
            result.origin.setFrom(origin);
            result.direction.setFrom(direction);
            result.a = a;
            return result;
        }
        result = new Ray3d(origin.clone(), direction.clone());
        result.a = a;
        return result;
    }
    /** Create from origin and target.  The direction vector is the full length (non-unit) vector from origin to target. */
    static createStartEnd(origin, target, result) {
        if (result) {
            result.origin.setFrom(origin);
            result.direction.setStartEnd(origin, target);
            return result;
        }
        return new Ray3d(origin, Point3dVector3d_1.Vector3d.createStartEnd(origin, target));
    }
    /** @returns Return a reference to the ray's origin. */
    getOriginRef() { return this.origin; }
    /** @returns Return a reference to the ray's direction vector. */
    getDirectionRef() { return this.direction; }
    /** copy coordinates from origin and direction. */
    set(origin, direction) {
        this.origin.setFrom(origin);
        this.direction.setFrom(direction);
    }
    /** Clone the ray. */
    clone(result) {
        if (result) {
            result.set(this.origin, this.direction);
            return result;
        }
        return new Ray3d(this.origin.clone(), this.direction.clone());
    }
    /** Create a clone and return the transform of the clone. */
    cloneTransformed(transform) {
        return new Ray3d(transform.multiplyPoint3d(this.origin), transform.multiplyVector(this.direction));
    }
    /** Apply a transform in place. */
    transformInPlace(transform) {
        transform.multiplyPoint3d(this.origin, this.origin);
        transform.multiplyVector(this.direction, this.direction);
    }
    /** Copy data from another ray. */
    setFrom(source) { this.set(source.origin, source.direction); }
    /** * fraction 0 is the ray origin.
     * * fraction 1 is at the end of the direction vector when placed at the origin.
     * @returns Return a point at fractional position along the ray.
     */
    fractionToPoint(fraction) { return this.origin.plusScaled(this.direction, fraction); }
    /** @returns Return the dot product of the ray's direction vector with a vector from the ray origin to the space point. */
    dotProductToPoint(spacePoint) { return this.direction.dotProductStartEnd(this.origin, spacePoint); }
    /**
     * @returns Return the fractional coordinate (along the direction vector) of the spacePoint projected to the ray.
     */
    pointToFraction(spacePoint) {
        return Geometry_1.Geometry.safeDivideFraction(this.direction.dotProductStartEnd(this.origin, spacePoint), this.direction.magnitudeSquared(), 0);
    }
    /**
     *
     * @returns Return the spacePoint projected onto the ray.
     */
    projectPointToRay(spacePoint) {
        return this.origin.plusScaled(this.direction, this.pointToFraction(spacePoint));
    }
    /** Return a transform for rigid axes
     * at ray origin with z in ray direction.  If the direction vector is zero, axes default to identity (from createHeadsUpTriad)
     */
    toRigidZFrame() {
        const axes = Matrix3d_1.Matrix3d.createRigidHeadsUp(this.direction, 2 /* ZXY */);
        return Transform_1.Transform.createOriginAndMatrix(this.origin, axes);
    }
    /**
     * Convert {origin:[x,y,z], direction:[u,v,w]} to a Ray3d.
     */
    setFromJSON(json) {
        if (!json) {
            this.origin.set(0, 0, 0);
            this.direction.set(0, 0, 1);
            return;
        }
        this.origin.setFromJSON(json.origin);
        this.direction.setFromJSON(json.direction);
    }
    /**
     * try to scale the direction vector to a given magnitude.
     * @returns Returns false if ray direction is a zero vector.
     */
    trySetDirectionMagnitudeInPlace(magnitude = 1.0) {
        if (this.direction.tryNormalizeInPlace()) {
            this.direction.scaleInPlace(magnitude);
            return true;
        }
        this.direction.setZero();
        this.a = 0.0;
        return false;
    }
    // input a ray and "a" understood as an area.
    // if a is clearly nonzero metric squared and the vector can be normalized, install those and return true.
    // otherwise set ray.z to zero and zero the vector of the ray and return false.
    tryNormalizeInPlaceWithAreaWeight(a) {
        const tolerance = Geometry_1.Geometry.smallMetricDistanceSquared;
        this.a = a;
        if (Math.abs(a) > tolerance && this.direction.tryNormalizeInPlace(tolerance))
            return true;
        this.direction.setZero();
        this.a = 0.0;
        return false;
    }
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON() { return { origin: this.origin.toJSON(), direction: this.direction.toJSON() }; }
    static fromJSON(json) {
        const result = Ray3d.createXAxis();
        result.setFromJSON(json);
        return result;
    }
    /** return distance to point in space */
    distance(spacePoint) {
        const uu = this.direction.magnitudeSquared();
        const uv = this.dotProductToPoint(spacePoint);
        const aa = Geometry_1.Geometry.inverseMetricDistanceSquared(uu);
        if (aa)
            return Math.sqrt(this.origin.distanceSquared(spacePoint) - uv * uv * aa);
        else
            return Math.sqrt(this.origin.distanceSquared(spacePoint));
    }
    /**
     * Return the intersection of the unbounded ray with a plane.
     * Stores the point of intersection in the result point given as a parameter,
     * and returns the parameter along the ray where the intersection occurs.
     * Returns undefined if the ray and plane are parallel.
     */
    intersectionWithPlane(plane, result) {
        const vectorA = Point3dVector3d_1.Vector3d.createStartEnd(plane.getOriginRef(), this.origin);
        const uDotN = this.direction.dotProduct(plane.getNormalRef());
        const aDotN = vectorA.dotProduct(plane.getNormalRef());
        const division = Geometry_1.Geometry.conditionalDivideFraction(-aDotN, uDotN);
        if (undefined === division)
            return undefined;
        if (result) {
            this.origin.plusScaled(this.direction, division, result);
        }
        return division;
    }
}
exports.Ray3d = Ray3d;
//# sourceMappingURL=Ray3d.js.map