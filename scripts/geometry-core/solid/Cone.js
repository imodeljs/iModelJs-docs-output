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
const Geometry_1 = require("../Geometry");
const SolidPrimitive_1 = require("./SolidPrimitive");
const Loop_1 = require("../curve/Loop");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const Arc3d_1 = require("../curve/Arc3d");
const LineString3d_1 = require("../curve/LineString3d");
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
/**
 * A cone with axis along the z axis of a (possibly skewed) local coordinate system.
 *
 * * In local coordinates, the sections at z=0 and z=1 are circles of radius r0 and r1.
 * * Either one individually  may be zero, but they may not both be zero.
 * * The stored matrix has unit vectors in the xy columns, and full-length z column.
 * @public
 */
class Cone extends SolidPrimitive_1.SolidPrimitive {
    constructor(map, radiusA, radiusB, capped) {
        super(capped);
        /** String name for schema properties */
        this.solidPrimitiveType = "cone";
        this._localToWorld = map;
        this._radiusA = radiusA;
        this._radiusB = radiusB;
        this._maxRadius = Math.max(this._radiusA, this._radiusB); // um... should resolve elliptical sections
    }
    /** Return a clone of this Cone. */
    clone() {
        return new Cone(this._localToWorld.clone(), this._radiusA, this._radiusB, this.capped);
    }
    /** Return a coordinate frame (right handed unit vectors)
     * * origin at center of the base circle.
     * * base circle in the xy plane
     * * z axis by right hand rule.
     */
    getConstructiveFrame() {
        return this._localToWorld.cloneRigid();
    }
    /** Apply the transform to this cone's locla to world coordinates.
     * * Note that the radii are not changed.  Scaling is absorbed into the frame.
     * * This fails if the transformation is singular.
     */
    tryTransformInPlace(transform) {
        if (transform.matrix.isSingular())
            return false;
        transform.multiplyTransformTransform(this._localToWorld, this._localToWorld);
        return true;
    }
    /**
     * Create a clone and immediately transform the clone.
     */
    cloneTransformed(transform) {
        const result = this.clone();
        transform.multiplyTransformTransform(result._localToWorld, result._localToWorld);
        return result;
    }
    /** create a cylinder or cone from two endpoints and their radii.   The circular cross sections are perpendicular to the axis line
     * from start to end point.
     * * both radii must be of the same sign.
     * * negative radius is accepted to create interior surface.    Downstream effects of that combined with capping may be a problem.
     */
    static createAxisPoints(centerA, centerB, radiusA, radiusB, capped) {
        const zDirection = centerA.vectorTo(centerB);
        const a = zDirection.magnitude();
        if (Geometry_1.Geometry.isSmallMetricDistance(a))
            return undefined;
        // force near-zero radii to true zero
        radiusA = Geometry_1.Geometry.correctSmallMetricDistance(radiusA);
        radiusB = Geometry_1.Geometry.correctSmallMetricDistance(radiusB);
        // cone tip may not be "within" the z range.
        if (radiusA * radiusB < 0.0)
            return undefined;
        // at least one must be nonzero.
        if (radiusA + radiusB === 0.0)
            return undefined;
        const matrix = Matrix3d_1.Matrix3d.createRigidHeadsUp(zDirection);
        matrix.scaleColumns(1.0, 1.0, a, matrix);
        const localToWorld = Transform_1.Transform.createOriginAndMatrix(centerA, matrix);
        return new Cone(localToWorld, radiusA, radiusB, capped);
    }
    /** create a cylinder or cone from axis start and end with cross section defined by vectors that do not need to be perpendicular to each other or
     * to the axis.
     */
    static createBaseAndTarget(centerA, centerB, vectorX, vectorY, radiusA, radiusB, capped) {
        radiusA = Math.abs(Geometry_1.Geometry.correctSmallMetricDistance(radiusA));
        radiusB = Math.abs(Geometry_1.Geometry.correctSmallMetricDistance(radiusB));
        const vectorZ = centerA.vectorTo(centerB);
        const localToWorld = Transform_1.Transform.createOriginAndMatrixColumns(centerA, vectorX, vectorY, vectorZ);
        return new Cone(localToWorld, radiusA, radiusB, capped);
    }
    /** (Property accessor) Return the center point at the base plane */
    getCenterA() { return this._localToWorld.multiplyXYZ(0, 0, 0); }
    /** (Property accessor) */
    getCenterB() { return this._localToWorld.multiplyXYZ(0, 0, 1); }
    /** (Property accessor) Return the x vector in the local frame */
    getVectorX() { return this._localToWorld.matrix.columnX(); }
    /** (Property accessor) Return the y vector in the local frame */
    getVectorY() { return this._localToWorld.matrix.columnY(); }
    /** (Property accessor) return the radius at the base plane */
    getRadiusA() { return this._radiusA; }
    /** (Property accessor) return the radius at the top plane */
    getRadiusB() { return this._radiusB; }
    /** (Property accessor) return the larger of the base and top plane radii */
    getMaxRadius() { return this._maxRadius; }
    /** (Property accessor) return the radius at fraction `v` along the axis */
    vFractionToRadius(v) { return Geometry_1.Geometry.interpolate(this._radiusA, v, this._radiusB); }
    /** (Property accessor) test if `other` is an instance of `Cone` */
    isSameGeometryClass(other) { return other instanceof Cone; }
    /** (Property accessor) Test for nearly equal coordinate data. */
    isAlmostEqual(other) {
        if (other instanceof Cone) {
            if (this.capped !== other.capped)
                return false;
            if (!this._localToWorld.isAlmostEqual(other._localToWorld))
                return false;
            return Geometry_1.Geometry.isSameCoordinate(this._radiusA, other._radiusA)
                && Geometry_1.Geometry.isSameCoordinate(this._radiusB, other._radiusB);
        }
        return false;
    }
    /** Second step of double dispatch:   call `handler.handleCone(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleCone(this);
    }
    /**
     *  return strokes for a cross-section (elliptic arc) at specified fraction v along the axis.
     * * fixedStrokeCount takes priority over stroke options.
     * * The linestring is created by LineString3d.createForStrokes (fixedStrokeCount, options), which sets up property according to the options:
     *   * optional fractions member
     *   * optional uvParams.  uvParams are installed as full-scale distance parameters.
     *   * optional derivatives.
     * @param v fractional position along the cone axis
     * @param fixedStrokeCount optional stroke count.
     * @param options optional stroke options.
     */
    strokeConstantVSection(v, fixedStrokeCount, options) {
        let strokeCount = 16;
        if (fixedStrokeCount !== undefined)
            strokeCount = fixedStrokeCount;
        else if (options !== undefined)
            strokeCount = options.defaultCircleStrokes; // NEEDS WORK -- get circle stroke count with this.maxRadius !!!
        else {
            // accept the local default
        }
        strokeCount = Geometry_1.Geometry.clampToStartEnd(strokeCount, 4, 64);
        const r = this.vFractionToRadius(v);
        const result = LineString3d_1.LineString3d.createForStrokes(fixedStrokeCount, options);
        const twoPi = Math.PI * 2.0;
        const deltaRadians = twoPi / strokeCount;
        let radians = 0;
        const fractions = result.fractions; // possibly undefined !!!
        const derivatives = result.packedDerivatives; // possibly undefined !!!
        const uvParams = result.packedUVParams; // possibly undefined !!
        const surfaceNormals = result.packedSurfaceNormals;
        const xyz = Point3dVector3d_1.Point3d.create();
        const dXdu = Point3dVector3d_1.Vector3d.create();
        const dXdv = Point3dVector3d_1.Vector3d.create();
        const normal = Point3dVector3d_1.Vector3d.create();
        const transform = this._localToWorld;
        let rc, rs, cc, ss;
        for (let i = 0; i <= strokeCount; i++) {
            if (i * 2 <= strokeCount)
                radians = i * deltaRadians;
            else
                radians = (i - strokeCount) * deltaRadians;
            cc = Math.cos(radians);
            ss = Math.sin(radians);
            rc = r * cc;
            rs = r * ss;
            transform.multiplyXYZ(rc, rs, v, xyz);
            result.addPoint(xyz);
            if (fractions)
                fractions.push(i / strokeCount);
            if (derivatives) {
                transform.matrix.multiplyXYZ(-rs * twoPi, rc * twoPi, 0.0, dXdu);
                derivatives.push(dXdu);
            }
            if (surfaceNormals) {
                // the along-hoop vector does not need to be scaled by radius -- just need the direction for a cross product.
                transform.matrix.multiplyXYZ(-ss, cc, 0.0, dXdu);
                transform.matrix.multiplyXYZ(0, 0, 1, dXdv);
                dXdu.unitCrossProduct(dXdv, normal);
                surfaceNormals.push(normal);
            }
            if (uvParams) {
                uvParams.pushXY(i / strokeCount, v);
            }
        }
        return result;
    }
    /**
     * Return the Arc3d section at vFraction
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction) {
        const r = this.vFractionToRadius(vFraction);
        const transform = this._localToWorld;
        const center = transform.multiplyXYZ(0, 0, vFraction);
        const vector0 = transform.matrix.multiplyXYZ(r, 0, 0);
        const vector90 = transform.matrix.multiplyXYZ(0, r, 0);
        return Loop_1.Loop.create(Arc3d_1.Arc3d.create(center, vector0, vector90));
    }
    /** Extend `rangeToExtend` so it includes this `Cone` instance. */
    extendRange(rangeToExtend, transform) {
        const arc0 = this.constantVSection(0.0);
        const arc1 = this.constantVSection(1.0);
        arc0.extendRange(rangeToExtend, transform);
        arc1.extendRange(rangeToExtend, transform);
    }
    /** Evaluate a point on the Cone surfaces, with
     * * v = 0 is the base plane.
     * * v = 1 is the top plane
     * * u = 0 to u = 1 wraps the angular range.
     */
    uvFractionToPoint(uFraction, vFraction, result) {
        const theta = uFraction * Math.PI * 2.0;
        const r = Geometry_1.Geometry.interpolate(this._radiusA, vFraction, this._radiusB);
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        return this._localToWorld.multiplyXYZ(r * cosTheta, r * sinTheta, vFraction, result);
    }
    /** Evaluate a point tangent plane on the Cone surfaces, with
     * * v = 0 is the base plane.
     * * v = 1 is the top plane
     * * u = 0 to u = 1 wraps the angular range.
     */
    uvFractionToPointAndTangents(uFraction, vFraction, result) {
        const theta = uFraction * Math.PI * 2.0;
        const r = Geometry_1.Geometry.interpolate(this._radiusA, vFraction, this._radiusB);
        const drdv = this._radiusB - this._radiusA;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const fTheta = 2.0 * Math.PI;
        return Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createOriginAndVectors(this._localToWorld.multiplyXYZ(r * cosTheta, r * sinTheta, vFraction), this._localToWorld.multiplyVectorXYZ(-r * sinTheta * fTheta, r * cosTheta * fTheta, 0), this._localToWorld.multiplyVectorXYZ(drdv * cosTheta, drdv * sinTheta, 1.0), result);
    }
    /**
     * @return true if this is a closed volume.
     */
    get isClosedVolume() {
        return this.capped;
    }
    /**
     * Directional distance query
     * * u direction is around longitude circle at maximum distance from axis.
     * * v direction is on a line of longitude between the latitude limits.
     */
    maxIsoParametricDistance() {
        const vectorX = this._localToWorld.matrix.columnX();
        const vectorY = this._localToWorld.matrix.columnY();
        const columnZ = this._localToWorld.matrix.columnZ();
        const xyNormal = vectorX.unitCrossProduct(vectorY);
        const hZ = xyNormal.dotProduct(columnZ);
        const zSkewVector = columnZ.plusScaled(xyNormal, hZ);
        const zSkewDistance = zSkewVector.magnitudeXY();
        return Point2dVector2d_1.Vector2d.create(Math.PI * 2 * Math.max(this._radiusA, this._radiusB), Geometry_1.Geometry.hypotenuseXY(Math.abs(this._radiusB - this._radiusA) + zSkewDistance, hZ));
    }
}
exports.Cone = Cone;
//# sourceMappingURL=Cone.js.map