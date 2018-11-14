"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Geometry_1 = require("../Geometry");
const SolidPrimitive_1 = require("./SolidPrimitive");
const StrokeOptions_1 = require("../curve/StrokeOptions");
const Loop_1 = require("../curve/Loop");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const Arc3d_1 = require("../curve/Arc3d");
const LineString3d_1 = require("../curve/LineString3d");
/**
 * A cone with axis along the z axis of a (possibly skewed) local coordinate system.
 *
 * * In local coordinates, the sections at z=0 and z=1 are circles of radius r0 and r1.
 * * Either one individually  may be zero, but they may not both be zero.
 * * The stored matrix has unit vectors in the xy columns, and full-length z column.
 * *
 */
class Cone extends SolidPrimitive_1.SolidPrimitive {
    constructor(map, radiusA, radiusB, capped) {
        super(capped);
        this._localToWorld = map;
        this._radiusA = radiusA;
        this._radiusB = radiusB;
        this._maxRadius = Math.max(this._radiusA, this._radiusB); // um... should resolve elliptical sections
    }
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
    tryTransformInPlace(transform) {
        transform.multiplyTransformTransform(this._localToWorld, this._localToWorld);
        return true;
    }
    cloneTransformed(transform) {
        const result = this.clone();
        transform.multiplyTransformTransform(result._localToWorld, result._localToWorld);
        return result;
    }
    /** create a cylinder or cone from two endpoints and their radii.   The circular cross sections are perpendicular to the axis line
     * from start to end point.
     */
    static createAxisPoints(centerA, centerB, radiusA, radiusB, capped) {
        const zDirection = centerA.vectorTo(centerB);
        const a = zDirection.magnitude();
        if (Geometry_1.Geometry.isSmallMetricDistance(a))
            return undefined;
        // force near-zero radii to true zero
        radiusA = Math.abs(Geometry_1.Geometry.correctSmallMetricDistance(radiusA));
        radiusB = Math.abs(Geometry_1.Geometry.correctSmallMetricDistance(radiusB));
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
    getCenterA() { return this._localToWorld.multiplyXYZ(0, 0, 0); }
    getCenterB() { return this._localToWorld.multiplyXYZ(0, 0, 1); }
    getVectorX() { return this._localToWorld.matrix.columnX(); }
    getVectorY() { return this._localToWorld.matrix.columnY(); }
    getRadiusA() { return this._radiusA; }
    getRadiusB() { return this._radiusB; }
    getMaxRadius() { return this._maxRadius; }
    vFractionToRadius(v) { return Geometry_1.Geometry.interpolate(this._radiusA, v, this._radiusB); }
    isSameGeometryClass(other) { return other instanceof Cone; }
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
    dispatchToGeometryHandler(handler) {
        return handler.handleCone(this);
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
        const r = this.vFractionToRadius(v);
        const result = LineString3d_1.LineString3d.create();
        const deltaRadians = Math.PI * 2.0 / strokeCount;
        let radians = 0;
        const transform = this._localToWorld;
        for (let i = 0; i <= strokeCount; i++) {
            if (i * 2 <= strokeCount)
                radians = i * deltaRadians;
            else
                radians = (i - strokeCount) * deltaRadians;
            const xyz = transform.multiplyXYZ(r * Math.cos(radians), r * Math.sin(radians), v);
            result.addPoint(xyz);
        }
        return result;
    }
    /**
     * @returns Return the Arc3d section at vFraction
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
    extendRange(range, transform) {
        const arc0 = this.constantVSection(0.0);
        const arc1 = this.constantVSection(1.0);
        arc0.extendRange(range, transform);
        arc1.extendRange(range, transform);
    }
    UVFractionToPoint(uFraction, vFraction, result) {
        const theta = uFraction * Math.PI * 2.0;
        const r = Geometry_1.Geometry.interpolate(this._radiusA, vFraction, this._radiusB);
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        return this._localToWorld.multiplyXYZ(r * cosTheta, r * sinTheta, vFraction, result);
    }
    UVFractionToPointAndTangents(uFraction, vFraction, result) {
        const theta = uFraction * Math.PI * 2.0;
        const r = Geometry_1.Geometry.interpolate(this._radiusA, vFraction, this._radiusB);
        const drdv = this._radiusB - this._radiusA;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const fTheta = 2.0 * Math.PI;
        return Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createOriginAndVectors(this._localToWorld.multiplyXYZ(r * cosTheta, r * sinTheta, vFraction), this._localToWorld.multiplyVectorXYZ(-r * sinTheta * fTheta, r * cosTheta * fTheta, 0), this._localToWorld.multiplyVectorXYZ(drdv * cosTheta, drdv * sinTheta, 1.0), result);
    }
}
exports.Cone = Cone;
//# sourceMappingURL=Cone.js.map