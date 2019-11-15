"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Point3dVector3d_1 = require("./Point3dVector3d");
const Transform_1 = require("./Transform");
const Geometry_1 = require("../Geometry");
const Matrix3d_1 = require("./Matrix3d");
/**
 * A plane defined by
 *
 * * Any point on the plane.
 * * a unit normal.
 * @public
 */
class Plane3dByOriginAndUnitNormal {
    // constructor captures references !!!
    constructor(origin, normal) {
        this._origin = origin;
        this._normal = normal;
    }
    // This is private because it does not check validity of the unit vector.
    static _create(x, y, z, u, v, w) {
        return new Plane3dByOriginAndUnitNormal(Point3dVector3d_1.Point3d.create(x, y, z), Point3dVector3d_1.Vector3d.create(u, v, w));
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
    /** create a new  Plane3dByOriginAndUnitNormal with given origin and normal.
     * * The inputs are NOT captured.
     * * Returns undefined if the normal vector is all zeros.
     */
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
    /** create a new  Plane3dByOriginAndUnitNormal with direct coordinates of origin and normal.
     * * Returns undefined if the normal vector is all zeros.
     * * If unable to normalize return undefined. (And if result is given it is left unchanged)
     */
    static createXYZUVW(ax, ay, az, ux, uy, uz, result) {
        const magU = Geometry_1.Geometry.hypotenuseXYZ(ux, uy, uz);
        if (magU < Geometry_1.Geometry.smallMetricDistance)
            return undefined;
        if (result) {
            result._origin.set(ax, ay, az);
            result._normal.set(ux / magU, uy / magU, uz / magU);
            return result;
        }
        return new Plane3dByOriginAndUnitNormal(Point3dVector3d_1.Point3d.create(ax, ay, az), Point3dVector3d_1.Vector3d.create(ux / magU, uy / magU, uz / magU));
    }
    /** create a new  Plane3dByOriginAndUnitNormal with xy origin (at z=0) and normal angle in xy plane.
     * * Returns undefined if the normal vector is all zeros.
     */
    static createXYAngle(x, y, normalAngleFromX, result) {
        if (result) {
            result._origin.set(x, y, 0.0);
            result._normal.set(normalAngleFromX.cos(), normalAngleFromX.sin(), 0.0);
            return result;
        }
        return new Plane3dByOriginAndUnitNormal(Point3dVector3d_1.Point3d.create(x, y, 0), Point3dVector3d_1.Vector3d.create(normalAngleFromX.cos(), normalAngleFromX.sin()));
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
    /** test for (toleranced) equality with `other` */
    isAlmostEqual(other) {
        return this._origin.isAlmostEqual(other._origin) && this._normal.isAlmostEqual(other._normal);
    }
    /** Parse a json fragment `{origin: [x,y,z], normal: [ux,uy,uz]}`  */
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
    /**  create a new Plane3dByOriginAndUnitNormal from json fragment.
     * * See `Plane3dByOriginAndUnitNormal.setFromJSON`
     */
    static fromJSON(json) {
        const result = Plane3dByOriginAndUnitNormal.createXYPlane();
        result.setFromJSON(json);
        return result;
    }
    /** Return a reference to the origin. */
    getOriginRef() { return this._origin; }
    /** Return a reference to the unit normal. */
    getNormalRef() { return this._normal; }
    /** Return coordinate axes (as a transform) with
     * * origin at plane origin
     * * z axis in direction of plane normal.
     * * x,y axes in plane.
     */
    getLocalToWorld() {
        const axes = Matrix3d_1.Matrix3d.createRigidHeadsUp(this._normal, Geometry_1.AxisOrder.ZXY);
        return Transform_1.Transform.createRefs(this._origin.clone(), axes);
    }
    /** Return a (singular) transform which projects points to this plane.
     */
    getProjectionToPlane() {
        const axes = Matrix3d_1.Matrix3d.createIdentity();
        axes.addScaledOuterProductInPlace(this._normal, this._normal, -1.0);
        axes.markSingular();
        return Transform_1.Transform.createFixedPointAndMatrix(this._origin, axes);
    }
    /** Copy coordinates from the given origin and normal. */
    set(origin, normal) {
        this._origin.setFrom(origin);
        this._normal.setFrom(normal);
    }
    /** return a deep clone (point and normal cloned) */
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
        if (transform.matrix.multiplyInverseTranspose(result._normal, result._normal) !== undefined
            && result._normal.normalizeInPlace())
            return result;
        return undefined;
    }
    /** Copy data from the given plane. */
    setFrom(source) {
        this.set(source._origin, source._normal);
    }
    /** Return the altitude of spacePoint above or below the plane.  (Below is negative) */
    altitude(spacePoint) { return this._normal.dotProductStartEnd(this._origin, spacePoint); }
    /** Return the altitude of weighted spacePoint above or below the plane.  (Below is negative) */
    weightedAltitude(spacePoint) {
        return this._normal.dotProductStart3dEnd4d(this._origin, spacePoint);
    }
    /** return a point at specified (signed) altitude */
    altitudeToPoint(altitude, result) {
        return this._origin.plusScaled(this._normal, altitude, result);
    }
    /** Return the dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocityXYZ(x, y, z) { return this._normal.dotProductXYZ(x, y, z); }
    /** Return the dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocity(spaceVector) { return this._normal.dotProduct(spaceVector); }
    /** Return the altitude of a point given as separate x,y,z components. */
    altitudeXYZ(x, y, z) {
        return this._normal.dotProductStartEndXYZ(this._origin, x, y, z);
    }
    /** Return the altitude of a point given as separate x,y,z,w components. */
    altitudeXYZW(x, y, z, w) {
        return this._normal.dotProductStartEndXYZW(this._origin, x, y, z, w);
    }
    /** Return the projection of spacePoint onto the plane. */
    projectPointToPlane(spacePoint, result) {
        return spacePoint.plusScaled(this._normal, -this._normal.dotProductStartEnd(this._origin, spacePoint), result);
    }
    /** Returns true of spacePoint is within distance tolerance of the plane. */
    isPointInPlane(spacePoint) { return Geometry_1.Geometry.isSmallMetricDistance(this.altitude(spacePoint)); }
}
exports.Plane3dByOriginAndUnitNormal = Plane3dByOriginAndUnitNormal;
//# sourceMappingURL=Plane3dByOriginAndUnitNormal.js.map