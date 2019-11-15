"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Solid */
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const StrokeOptions_1 = require("../curve/StrokeOptions");
const Geometry_1 = require("../Geometry");
const AngleSweep_1 = require("../geometry3d/AngleSweep");
const SolidPrimitive_1 = require("./SolidPrimitive");
const Loop_1 = require("../curve/Loop");
const Arc3d_1 = require("../curve/Arc3d");
const LineString3d_1 = require("../curve/LineString3d");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
/**
 * A Sphere is
 *
 * * A unit sphere (but read on ....)
 * * mapped by an arbitrary (possibly skewed, non-uniform scaled) transform
 * * hence possibly the final geometry is ellipsoidal
 * @public
 */
class Sphere extends SolidPrimitive_1.SolidPrimitive {
    constructor(localToWorld, latitudeSweep, capped) {
        super(capped);
        /** String name for schema properties */
        this.solidPrimitiveType = "sphere";
        this._localToWorld = localToWorld;
        this._latitudeSweep = latitudeSweep ? latitudeSweep : AngleSweep_1.AngleSweep.createFullLatitude();
    }
    /** Return the latitude (in radians) all fractional v. */
    vFractionToRadians(v) {
        return this._latitudeSweep.fractionToRadians(v);
    }
    /** Return the longitude (in radians) all fractional u. */
    uFractionToRadians(u) {
        return u * Math.PI * 2.0;
    }
    /** return a deep clone */
    clone() {
        return new Sphere(this._localToWorld.clone(), this._latitudeSweep.clone(), this.capped);
    }
    /** Transform the sphere in place.
     * * Fails if the transform is singular.
     */
    tryTransformInPlace(transform) {
        if (transform.matrix.isSingular())
            return false;
        transform.multiplyTransformTransform(this._localToWorld, this._localToWorld);
        return true;
    }
    /** Return a transformed clone. */
    cloneTransformed(transform) {
        const sphere1 = this.clone();
        transform.multiplyTransformTransform(sphere1._localToWorld, sphere1._localToWorld);
        if (transform.matrix.determinant() < 0.0) {
            if (sphere1._latitudeSweep !== undefined) {
                sphere1._latitudeSweep.reverseInPlace();
            }
        }
        return sphere1;
    }
    /** Return a coordinate frame (right handed, unit axes)
     * * origin at sphere center
     * * equator in xy plane
     * * z axis perpendicular
     */
    getConstructiveFrame() {
        return this._localToWorld.cloneRigid();
    }
    /** Return the latitude sweep as fraction of south pole to north pole. */
    get latitudeSweepFraction() { return this._latitudeSweep.sweepRadians / Math.PI; }
    /** Create from center and radius, with optional restricted latitudes. */
    static createCenterRadius(center, radius, latitudeSweep) {
        const localToWorld = Transform_1.Transform.createOriginAndMatrix(center, Matrix3d_1.Matrix3d.createUniformScale(radius));
        return new Sphere(localToWorld, latitudeSweep ? latitudeSweep : AngleSweep_1.AngleSweep.createFullLatitude(), false);
    }
    /** Create an ellipsoid which is a unit sphere mapped to position by an (arbitrary, possibly skewed and scaled) transform. */
    static createEllipsoid(localToWorld, latitudeSweep, capped) {
        return new Sphere(localToWorld, latitudeSweep, capped);
    }
    /** Create a sphere from the typical parameters of the Dgn file */
    static createDgnSphere(center, vectorX, vectorZ, radiusXY, radiusZ, latitudeSweep, capped) {
        const vectorY = vectorX.rotate90Around(vectorZ);
        if (vectorY && !vectorX.isParallelTo(vectorZ)) {
            const matrix = Matrix3d_1.Matrix3d.createColumns(vectorX, vectorY, vectorZ);
            matrix.scaleColumns(radiusXY, radiusXY, radiusZ, matrix);
            const frame = Transform_1.Transform.createOriginAndMatrix(center, matrix);
            return new Sphere(frame, latitudeSweep.clone(), capped);
        }
        return undefined;
    }
    /** Create a sphere from the typical parameters of the Dgn file */
    static createFromAxesAndScales(center, axes, radiusX, radiusY, radiusZ, latitudeSweep, capped) {
        const localToWorld = Transform_1.Transform.createOriginAndMatrix(center, axes);
        localToWorld.matrix.scaleColumnsInPlace(radiusX, radiusY, radiusZ);
        return new Sphere(localToWorld, latitudeSweep ? latitudeSweep.clone() : AngleSweep_1.AngleSweep.createFullLatitude(), capped);
    }
    /** return (copy of) sphere center */
    cloneCenter() { return this._localToWorld.getOrigin(); }
    /** return the (full length, i.e. scaled by radius) X vector from the sphere transform */
    cloneVectorX() { return this._localToWorld.matrix.columnX(); }
    /** return the (full length, i.e. scaled by radius) Y vector from the sphere transform */
    cloneVectorY() { return this._localToWorld.matrix.columnY(); }
    /** return the (full length, i.e. scaled by radius) Z vector from the sphere transform */
    cloneVectorZ() { return this._localToWorld.matrix.columnZ(); }
    /** return (a copy of) the sphere's angle sweep. */
    cloneLatitudeSweep() { return this._latitudeSweep.clone(); }
    /** Test if the geometry is a true sphere taking the transform (which might have nonuniform scaling) is applied. */
    trueSphereRadius() {
        const factors = this._localToWorld.matrix.factorRigidWithSignedScale();
        if (!factors)
            return undefined;
        if (factors && factors.scale > 0)
            return factors.scale;
        return undefined;
    }
    /**
     * Return a (clone of) the sphere's local to world transformation.
     */
    cloneLocalToWorld() { return this._localToWorld.clone(); }
    /** Test if `other` is a `Sphere` */
    isSameGeometryClass(other) { return other instanceof Sphere; }
    /** Test for same geometry in `other` */
    isAlmostEqual(other) {
        if (other instanceof Sphere) {
            if (this.capped !== other.capped)
                return false;
            if (!this._localToWorld.isAlmostEqual(other._localToWorld))
                return false;
            return true;
        }
        return false;
    }
    /**
     *  return strokes for a cross-section (elliptic arc) at specified fraction v along the axis.
     * * if strokeOptions is supplied, it is applied to the equator radii.
     * @param v fractional position along the cone axis
     * @param strokes stroke count or options.
     */
    strokeConstantVSection(v, fixedStrokeCount, options) {
        let strokeCount = 16;
        if (fixedStrokeCount !== undefined && Number.isFinite(fixedStrokeCount)) {
            strokeCount = fixedStrokeCount;
        }
        else if (options instanceof StrokeOptions_1.StrokeOptions) {
            strokeCount = options.applyTolerancesToArc(Geometry_1.Geometry.maxXY(this._localToWorld.matrix.columnXMagnitude(), this._localToWorld.matrix.columnYMagnitude()));
        }
        strokeCount = Geometry_1.Geometry.clampToStartEnd(strokeCount, 4, 64);
        const transform = this._localToWorld;
        const phi = this.vFractionToRadians(v);
        const c1 = Math.cos(phi);
        const s1 = Math.sin(phi);
        let c0, s0;
        const result = LineString3d_1.LineString3d.createForStrokes(fixedStrokeCount, options);
        const deltaRadians = Math.PI * 2.0 / strokeCount;
        const fractions = result.fractions; // possibly undefined !!!
        const derivatives = result.packedDerivatives; // possibly undefined !!!
        const uvParams = result.packedUVParams; // possibly undefined !!
        const surfaceNormals = result.packedSurfaceNormals;
        const dXdu = Point3dVector3d_1.Vector3d.create();
        const dXdv = Point3dVector3d_1.Vector3d.create();
        const normal = Point3dVector3d_1.Vector3d.create();
        let radians = 0;
        for (let i = 0; i <= strokeCount; i++) {
            if (i * 2 <= strokeCount)
                radians = i * deltaRadians;
            else
                radians = (i - strokeCount) * deltaRadians;
            c0 = Math.cos(radians);
            s0 = Math.sin(radians);
            const xyz = transform.multiplyXYZ(c1 * c0, c1 * s0, s1);
            result.addPoint(xyz);
            if (fractions)
                fractions.push(i / strokeCount);
            if (derivatives) {
                transform.matrix.multiplyXYZ(-c1 * s0, c1 * c0, 0.0, dXdu);
                derivatives.push(dXdu);
            }
            if (uvParams) {
                uvParams.pushXY(i / strokeCount, v);
            }
            if (surfaceNormals) {
                transform.matrix.multiplyXYZ(-s0, c0, 0, dXdu);
                transform.matrix.multiplyXYZ(-s1 * c0, -s1 * s0, c1, dXdv);
                dXdu.unitCrossProduct(dXdv, normal);
                surfaceNormals.push(normal);
            }
        }
        return result;
    }
    /** Second step of double dispatch:  call `handler.handleSphere(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleSphere(this);
    }
    /**
     * Return the Arc3d section at vFraction.  For the sphere, this is a latitude circle.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction) {
        const phi = this._latitudeSweep.fractionToRadians(vFraction);
        const s1 = Math.sin(phi);
        const c1 = Math.cos(phi);
        const transform = this._localToWorld;
        const center = transform.multiplyXYZ(0, 0, s1);
        const vector0 = transform.matrix.multiplyXYZ(c1, 0, 0);
        const vector90 = transform.matrix.multiplyXYZ(0, c1, 0);
        return Loop_1.Loop.create(Arc3d_1.Arc3d.create(center, vector0, vector90));
    }
    /** Extend a range to contain this sphere. */
    extendRange(range, transform) {
        let placement = this._localToWorld;
        if (transform) {
            placement = transform.multiplyTransformTransform(placement);
        }
        range.extendTransformedXYZ(placement, -1, -1, -1);
        range.extendTransformedXYZ(placement, 1, -1, -1);
        range.extendTransformedXYZ(placement, -1, 1, -1);
        range.extendTransformedXYZ(placement, 1, 1, -1);
        range.extendTransformedXYZ(placement, -1, -1, 1);
        range.extendTransformedXYZ(placement, 1, -1, 1);
        range.extendTransformedXYZ(placement, -1, 1, 1);
        range.extendTransformedXYZ(placement, 1, 1, 1);
    }
    /** Evaluate as a uv surface
     * @param uFraction fractional position in minor (phi)
     * @param vFraction fractional position on major (theta) arc
     */
    uvFractionToPoint(uFraction, vFraction, result) {
        // sphere with radius 1 . . .
        const thetaRadians = this.uFractionToRadians(uFraction);
        const phiRadians = this.vFractionToRadians(vFraction);
        const cosTheta = Math.cos(thetaRadians);
        const sinTheta = Math.sin(thetaRadians);
        const sinPhi = Math.sin(phiRadians);
        const cosPhi = Math.cos(phiRadians);
        return this._localToWorld.multiplyXYZ(cosTheta * cosPhi, sinTheta * cosPhi, sinPhi, result);
    }
    /** Evaluate as a uv surface, returning point and two vectors.
     * @param u fractional position in minor (phi)
     * @param v fractional position on major (theta) arc
     */
    uvFractionToPointAndTangents(uFraction, vFraction, result) {
        const thetaRadians = this.uFractionToRadians(uFraction);
        const phiRadians = this.vFractionToRadians(vFraction);
        const fTheta = Math.PI * 2.0;
        const fPhi = this._latitudeSweep.sweepRadians;
        const cosTheta = Math.cos(thetaRadians);
        const sinTheta = Math.sin(thetaRadians);
        const sinPhi = Math.sin(phiRadians);
        const cosPhi = Math.cos(phiRadians);
        return Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createOriginAndVectors(this._localToWorld.multiplyXYZ(cosTheta * cosPhi, sinTheta * cosPhi, sinPhi), this._localToWorld.matrix.multiplyXYZ(-fTheta * sinTheta, fTheta * cosTheta, 0), // !!! note cosTheta term is omitted -- scale is wrong, but remains non-zero at poles.
        this._localToWorld.matrix.multiplyXYZ(-fPhi * cosTheta * sinPhi, -fPhi * sinTheta * sinPhi, fPhi * cosPhi), result);
    }
    /**
     * * A sphere is can be closed two ways:
     *   * full sphere (no caps needed for closure)
     *   * incomplete but with caps
     * @return true if this is a closed volume.
     */
    get isClosedVolume() {
        return this.capped || this._latitudeSweep.isFullLatitudeSweep;
    }
    /**
     * Directional distance query
     * * u direction is around longitude circle at maximum distance from axis.
     * * v direction is on a line of longitude between the latitude limits.
     */
    maxIsoParametricDistance() {
        // approximate radius at equator .. if elliptic, this is not exact . . .
        const rX = this._localToWorld.matrix.columnXMagnitude();
        const rY = this._localToWorld.matrix.columnYMagnitude();
        const rZ = this._localToWorld.matrix.columnZMagnitude();
        const rMaxU = Math.max(rX, rY);
        let dMaxU = Math.PI * 2.0 * rMaxU;
        if (!this._latitudeSweep.isRadiansInSweep(0.0))
            dMaxU *= Math.max(Math.cos(Math.abs(this._latitudeSweep.startRadians)), Math.cos(Math.abs(this._latitudeSweep.endRadians)));
        const dMaxV = Math.max(rMaxU, rZ) * Math.abs(this._latitudeSweep.sweepRadians);
        return Point2dVector2d_1.Vector2d.create(dMaxU, dMaxV);
    }
}
exports.Sphere = Sphere;
//# sourceMappingURL=Sphere.js.map