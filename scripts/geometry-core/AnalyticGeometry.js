"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const PointVector_1 = require("./PointVector");
const Transform_1 = require("./Transform");
const Geometry_1 = require("./Geometry");
/**
 * A plane defined by
 *
 * * Any point on the plane.
 * * a unit normal.
 */
class Plane3dByOriginAndUnitNormal {
    // constructor captures references !!!
    constructor(origin, normal) {
        this._origin = origin;
        this._normal = normal;
    }
    // This is private because it does not check validity of the unit vector.
    static _create(x, y, z, u, v, w) {
        return new Plane3dByOriginAndUnitNormal(PointVector_1.Point3d.create(x, y, z), PointVector_1.Vector3d.create(u, v, w));
    }
    /**
     * Create a plane parallel to the XY plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createXYPlane(origin) {
        if (origin)
            return Plane3dByOriginAndUnitNormal._create(origin.x, origin.y, origin.z, 0, 0, 1);
        return Plane3dByOriginAndUnitNormal._create(0, 0, 0, 0, 0, 1);
    }
    /**
     * Create a plane parallel to the YZ plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createYZPlane(origin) {
        if (origin)
            return Plane3dByOriginAndUnitNormal._create(origin.x, origin.y, origin.z, 1, 0, 0);
        return Plane3dByOriginAndUnitNormal._create(0, 0, 0, 1, 0, 0);
    }
    /**
     * Create a plane parallel to the ZX plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createZXPlane(origin) {
        if (origin)
            return Plane3dByOriginAndUnitNormal._create(origin.x, origin.y, origin.z, 0, 1, 0);
        return Plane3dByOriginAndUnitNormal._create(0, 0, 0, 0, 1, 0);
    }
    static create(origin, normal, result) {
        const normalized = normal.normalize();
        if (!normalized)
            return undefined;
        if (result) {
            result.set(origin, normalized);
            return result;
        }
        return new Plane3dByOriginAndUnitNormal(origin.clone(), normalized);
    }
    /** Create a plane defined by two points and an in-plane vector.
     * @param pointA any point in the plane
     * @param pointB any other point in the plane
     * @param vector any vector in the plane but not parallel to the vector from pointA to pointB
     */
    static createPointPointVectorInPlane(pointA, pointB, vector) {
        const cross = vector.crossProductStartEnd(pointA, pointB);
        if (cross.tryNormalizeInPlace())
            return new Plane3dByOriginAndUnitNormal(pointA, cross);
        return undefined;
    }
    isAlmostEqual(other) {
        return this._origin.isAlmostEqual(other._origin) && this._normal.isAlmostEqual(other._normal);
    }
    setFromJSON(json) {
        if (!json) {
            this._origin.set(0, 0, 0);
            this._normal.set(0, 0, 1);
        }
        else {
            this._origin.setFromJSON(json.origin);
            this._normal.setFromJSON(json.normal);
        }
    }
    /**
     * Convert to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON() { return { origin: this._origin.toJSON(), normal: this._normal.toJSON() }; }
    static fromJSON(json) {
        const result = Plane3dByOriginAndUnitNormal.createXYPlane();
        result.setFromJSON(json);
        return result;
    }
    /** @returns a reference to the origin. */
    getOriginRef() { return this._origin; }
    /** @returns a reference to the unit normal. */
    getNormalRef() { return this._normal; }
    /** Copy coordinates from the given origin and normal. */
    set(origin, normal) {
        this._origin.setFrom(origin);
        this._normal.setFrom(normal);
    }
    clone(result) {
        if (result) {
            result.set(this._origin, this._normal);
            return result;
        }
        return new Plane3dByOriginAndUnitNormal(this._origin.clone(), this._normal.clone());
    }
    /** Create a clone and return the transform of the clone. */
    cloneTransformed(transform) {
        const result = this.clone();
        transform.multiplyPoint3d(result._origin, result._origin);
        transform.matrix.multiplyInverseTranspose(result._normal, result._normal);
        if (result._normal.normalizeInPlace())
            return result;
        return undefined;
    }
    /** Copy data from the given plane. */
    setFrom(source) {
        this.set(source._origin, source._normal);
    }
    /** @returns Return the altitude of spacePoint above or below the plane.  (Below is negative) */
    altitude(spacePoint) { return this._normal.dotProductStartEnd(this._origin, spacePoint); }
    /** @returns return a point at specified (signed) altitude */
    altitudeToPoint(altitude, result) {
        return this._origin.plusScaled(this._normal, altitude, result);
    }
    /** @returns The dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocityXYZ(x, y, z) { return this._normal.dotProductXYZ(x, y, z); }
    /** @returns The dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocity(spaceVector) { return this._normal.dotProduct(spaceVector); }
    /** @returns the altitude of a point given as separate x,y,z components. */
    altitudeXYZ(x, y, z) {
        return this._normal.dotProductStartEndXYZ(this._origin, x, y, z);
    }
    /** @returns the altitude of a point given as separate x,y,z,w components. */
    altitudeXYZW(x, y, z, w) {
        return this._normal.dotProductStartEndXYZW(this._origin, x, y, z, w);
    }
    /** @returns Return the projection of spacePoint onto the plane. */
    projectPointToPlane(spacePoint, result) {
        return spacePoint.plusScaled(this._normal, -this._normal.dotProductStartEnd(this._origin, spacePoint), result);
    }
    /** @return Returns true of spacePoint is within distance tolerance of the plane. */
    isPointInPlane(spacePoint) { return Geometry_1.Geometry.isSmallMetricDistance(this.altitude(spacePoint)); }
}
exports.Plane3dByOriginAndUnitNormal = Plane3dByOriginAndUnitNormal;
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
        return new Ray3d(PointVector_1.Point3d.create(x, y, z), PointVector_1.Vector3d.create(u, v, w));
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
        return new Ray3d(PointVector_1.Point3d.createZero(), PointVector_1.Vector3d.createZero());
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
        return new Ray3d(PointVector_1.Point3d.create(originX, originY, originZ), PointVector_1.Vector3d.create(directionX, directionY, directionZ));
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
        return new Ray3d(origin, PointVector_1.Vector3d.createStartEnd(origin, target));
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
        const axes = Transform_1.Matrix3d.createRigidHeadsUp(this.direction, 2 /* ZXY */);
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
        const vectorA = PointVector_1.Vector3d.createStartEnd(plane.getOriginRef(), this.origin);
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
/**
 * A Point3dVector3dVector3d is an origin and a pair of vectors.
 * This defines a plane with (possibly skewed) uv coordinates
 */
class Plane3dByOriginAndVectors {
    constructor(origin, vectorU, vectorV) {
        this.origin = origin;
        this.vectorU = vectorU;
        this.vectorV = vectorV;
    }
    static createOriginAndVectors(origin, vectorU, vectorV, result) {
        if (result) {
            result.origin.setFrom(origin);
            result.vectorU.setFrom(vectorU);
            result.vectorV.setFrom(vectorV);
            return result;
        }
        return new Plane3dByOriginAndVectors(origin.clone(), vectorU.clone(), vectorV.clone());
    }
    /** Capture origin and directions in a new planed. */
    static createCapture(origin, vectorU, vectorV, result) {
        if (!result)
            return new Plane3dByOriginAndVectors(origin, vectorU, vectorV);
        result.origin = origin;
        result.vectorU = vectorU;
        result.vectorV = vectorV;
        return result;
    }
    setOriginAndVectorsXYZ(x0, y0, z0, ux, uy, uz, vx, vy, vz) {
        this.origin.set(x0, y0, z0);
        this.vectorU.set(ux, uy, uz);
        this.vectorV.set(vx, vy, vz);
        return this;
    }
    setOriginAndVectors(origin, vectorU, vectorV) {
        this.origin.setFrom(origin);
        this.vectorU.setFrom(vectorU);
        this.vectorV.setFrom(vectorV);
        return this;
    }
    static createOriginAndVectorsXYZ(x0, y0, z0, ux, uy, uz, vx, vy, vz, result) {
        if (result)
            return result.setOriginAndVectorsXYZ(x0, y0, z0, ux, uy, uz, vx, vy, vz);
        return new Plane3dByOriginAndVectors(PointVector_1.Point3d.create(x0, y0, z0), PointVector_1.Vector3d.create(ux, uy, uz), PointVector_1.Vector3d.create(vx, vy, vz));
    }
    /** Define a plane by three points in the plane.
     * @param origin origin for the parameterization.
     * @param targetU target point for the vectorU starting at the origin.
     * @param targetV target point for the vectorV originating at the origin.
     * @param result optional result.
     */
    static createOriginAndTargets(origin, targetU, targetV, result) {
        return Plane3dByOriginAndVectors.createOriginAndVectorsXYZ(origin.x, origin.y, origin.z, targetU.x - origin.x, targetU.y - origin.y, targetU.z - origin.z, targetV.x - origin.x, targetV.y - origin.y, targetV.z - origin.z, result);
    }
    /** Create a plane with origin at 000, unit vectorU in x direction, and unit vectorV in the y direction.
     */
    static createXYPlane(result) {
        return Plane3dByOriginAndVectors.createOriginAndVectorsXYZ(0, 0, 0, 1, 0, 0, 0, 1, 0, result);
    }
    /** create a plane from data presented as Float64Arrays.
     * @param origin x,y,z of origin.
     * @param vectorU x,y,z of vectorU
     * @param vectorV x,y,z of vectorV
     */
    static createOriginAndVectorsArrays(origin, vectorU, vectorV, result) {
        return Plane3dByOriginAndVectors.createOriginAndVectorsXYZ(origin[0], origin[1], origin[2], vectorU[0], vectorU[1], vectorU[2], vectorV[0], vectorV[1], vectorV[2], result);
    }
    /** create a plane from data presented as Float64Array with weights
     * @param origin x,y,z,w of origin.
     * @param vectorU x,y,z,w of vectorU
     * @param vectorV x,y,z,w of vectorV
     */
    static createOriginAndVectorsWeightedArrays(originw, vectorUw, vectorVw, result) {
        const w = originw[3];
        result = Plane3dByOriginAndVectors.createXYPlane(result);
        if (Geometry_1.Geometry.isSmallMetricDistance(w))
            return result;
        const dw = 1.0 / w;
        const au = vectorUw[3] * dw * dw;
        const av = vectorVw[3] * dw * dw;
        // for homogeneous function X, with w its weight:
        // (X/w) is the cartesian point.
        // (X/w)' = (X' w - X w')/(w*w)
        //        = X'/w  - (X/w)(w'/w)
        //        = X'/w  - X w'/w^2)
        // The w parts of the formal xyzw sums are identically 0.
        // Here the X' and its w' are taken from each vectorUw and vectorVw
        result.origin.set(originw[0] * dw, originw[1] * dw, originw[2] * dw);
        PointVector_1.Vector3d.createAdd2ScaledXYZ(vectorUw[0], vectorUw[1], vectorUw[2], dw, originw[0], originw[1], originw[2], -au, result.vectorU);
        PointVector_1.Vector3d.createAdd2ScaledXYZ(vectorVw[0], vectorVw[1], vectorVw[2], dw, originw[0], originw[1], originw[2], -av, result.vectorV);
        return result;
    }
    /**
     * Evaluate a point a grid coordinates on the plane.
     * * The computed point is `origin + vectorU * u + vectorV * v`
     * @param u coordinate along vectorU
     * @param v coordinate along vectorV
     * @param result optional result destination.
     * @returns Return the computed coordinate.
     */
    fractionToPoint(u, v, result) {
        return this.origin.plus2Scaled(this.vectorU, u, this.vectorV, v, result);
    }
    fractionToVector(u, v, result) {
        return PointVector_1.Vector3d.createAdd2Scaled(this.vectorU, u, this.vectorV, v, result);
    }
    setFromJSON(json) {
        if (!json || !json.origin || !json.vectorV) {
            this.origin.set(0, 0, 0);
            this.vectorU.set(1, 0, 0);
            this.vectorV.set(0, 1, 0);
        }
        else {
            this.origin.setFromJSON(json.origin);
            this.vectorU.setFromJSON(json.vectorU);
            this.vectorV.setFromJSON(json.vectorV);
        }
    }
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON() {
        return {
            origin: this.origin.toJSON(),
            vectorU: this.vectorU.toJSON(),
            vectorV: this.vectorV.toJSON(),
        };
    }
    static fromJSON(json) {
        const result = Plane3dByOriginAndVectors.createXYPlane();
        result.setFromJSON(json);
        return result;
    }
    isAlmostEqual(other) {
        return this.origin.isAlmostEqual(other.origin)
            && this.vectorU.isAlmostEqual(other.vectorU)
            && this.vectorV.isAlmostEqual(other.vectorV);
    }
}
exports.Plane3dByOriginAndVectors = Plane3dByOriginAndVectors;
//# sourceMappingURL=AnalyticGeometry.js.map