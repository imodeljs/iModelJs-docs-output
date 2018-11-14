"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
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
/**
 * A Sphere is
 *
 * * A unit sphere (but read on ....)
 * * mapped by an arbitrary (possibly skewed, non-uniform scaled) transform
 * * hence possibly the final geometry is ellipsoidal
 */
class Sphere extends SolidPrimitive_1.SolidPrimitive {
    /** Return the latitude (in radians) all fractional v. */
    vFractionToRadians(v) {
        return this._latitudeSweep.fractionToRadians(v);
    }
    /** Return the longitude (in radians) all fractional u. */
    uFractionToRadians(u) {
        return u * Math.PI * 2.0;
    }
    constructor(localToWorld, latitudeSweep, capped) {
        super(capped);
        this._localToWorld = localToWorld;
        this._latitudeSweep = latitudeSweep ? latitudeSweep : AngleSweep_1.AngleSweep.createFullLatitude();
    }
    clone() {
        return new Sphere(this._localToWorld.clone(), this._latitudeSweep.clone(), this.capped);
    }
    tryTransformInPlace(transform) {
        transform.multiplyTransformTransform(this._localToWorld, this._localToWorld);
        return true;
    }
    cloneTransformed(transform) {
        const sphere1 = this.clone();
        transform.multiplyTransformTransform(sphere1._localToWorld, sphere1._localToWorld);
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
        if (vectorY) {
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
    trueSphereRadius() {
        const factors = this._localToWorld.matrix.factorRigidWithSignedScale();
        if (!factors)
            return undefined;
        if (factors && factors.scale > 0)
            return factors.scale;
        return undefined;
    }
    /**
     * @returns Return a (clone of) the sphere's local to world transformation.
     */
    cloneLocalToWorld() { return this._localToWorld.clone(); }
    isSameGeometryClass(other) { return other instanceof Sphere; }
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
     * @param v fractional position along the cone axis
     * @param strokes stroke count or options.
     */
    strokeConstantVSection(v, strokes) {
        let strokeCount = 16;
        if (strokes === undefined) {
            // accept the default above.
        }
        else if (strokes instanceof Number) {
            strokeCount = strokes;
        }
        else if (strokes instanceof StrokeOptions_1.StrokeOptions) {
            strokeCount = strokes.defaultCircleStrokes; // NEEDS WORK -- get circle stroke count with this.maxRadius !!!
        }
        strokeCount = Geometry_1.Geometry.clampToStartEnd(strokeCount, 4, 64);
        const phi = this.vFractionToRadians(v);
        const c1 = Math.cos(phi);
        const s1 = Math.sin(phi);
        const result = LineString3d_1.LineString3d.create();
        const deltaRadians = Math.PI * 2.0 / strokeCount;
        let radians = 0;
        const transform = this._localToWorld;
        for (let i = 0; i <= strokeCount; i++) {
            if (i * 2 <= strokeCount)
                radians = i * deltaRadians;
            else
                radians = (i - strokeCount) * deltaRadians;
            const xyz = transform.multiplyXYZ(c1 * Math.cos(radians), c1 * Math.sin(radians), s1);
            result.addPoint(xyz);
        }
        return result;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleSphere(this);
    }
    /**
     * @returns Return the Arc3d section at vFraction.  For the sphere, this is a latitude circle.
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
    UVFractionToPoint(uFraction, vFraction, result) {
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
    UVFractionToPointAndTangents(uFraction, vFraction, result) {
        const thetaRadians = this.uFractionToRadians(uFraction);
        const phiRadians = this.vFractionToRadians(vFraction);
        const fTheta = Math.PI * 2.0;
        const fPhi = this._latitudeSweep.sweepRadians;
        const cosTheta = Math.cos(thetaRadians);
        const sinTheta = Math.sin(thetaRadians);
        const sinPhi = Math.sin(phiRadians);
        const cosPhi = Math.cos(phiRadians);
        return Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createOriginAndVectors(this._localToWorld.multiplyXYZ(cosTheta * cosPhi, sinTheta * cosPhi, sinPhi), this._localToWorld.multiplyVectorXYZ(-fTheta * sinTheta * cosPhi, fTheta * cosTheta * cosPhi, 0), this._localToWorld.multiplyVectorXYZ(-fPhi * cosTheta * sinPhi, -fPhi * sinTheta, fPhi * cosPhi), result);
    }
}
exports.Sphere = Sphere;
//# sourceMappingURL=Sphere.js.map