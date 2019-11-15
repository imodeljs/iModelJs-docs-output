"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Geometry_1 = require("../Geometry");
const Angle_1 = require("../geometry3d/Angle");
const SweepContour_1 = require("./SweepContour");
const SolidPrimitive_1 = require("./SolidPrimitive");
const StrokeOptions_1 = require("../curve/StrokeOptions");
/**
 * A LinearSweep is
 * * A planar contour (any Loop, Path, or parityRegion)
 * * An axis vector.
 *   * The planar contour is expected to be in the plane of the axis vector
 *   * The contour may have points and/or lines that are on the axis, but otherwise is entirely on one side of the axis.
 * * A sweep angle.
 * @public
 */
class RotationalSweep extends SolidPrimitive_1.SolidPrimitive {
    constructor(contour, normalizedAxis, sweepAngle, capped) {
        super(capped);
        /** String name for schema properties */
        this.solidPrimitiveType = "rotationalSweep";
        this._contour = contour;
        this._normalizedAxis = normalizedAxis;
        this.capped = capped;
        this._sweepAngle = sweepAngle;
    }
    /** Create a rotational sweep. */
    static create(contour, axis, sweepAngle, capped) {
        if (!axis.direction.normalizeInPlace())
            return undefined;
        const sweepable = SweepContour_1.SweepContour.createForRotation(contour, axis);
        if (!sweepable)
            return undefined;
        return new RotationalSweep(sweepable, axis, sweepAngle.clone(), capped);
    }
    /** Return a coordinate frame (right handed unit vectors)
     * * origin at origin of rotation ray
     * * z direction along the rotation ray.
     * * y direction perpendicular to the base contour plane
     */
    getConstructiveFrame() {
        const contourPerpendicular = this._contour.localToWorld.matrix.columnZ();
        const axes = Matrix3d_1.Matrix3d.createRigidFromColumns(contourPerpendicular, this._normalizedAxis.direction, Geometry_1.AxisOrder.YZX);
        if (axes) {
            return Transform_1.Transform.createOriginAndMatrix(this._normalizedAxis.origin, axes);
        }
        return undefined;
    }
    /** return clone of (not reference to) the axis vector. */
    cloneAxisRay() { return this._normalizedAxis.clone(); }
    /** Return (REFERENCE TO) the swept curves. */
    getCurves() { return this._contour.curves; }
    /** Return (REFERENCE TO) the swept curves with containing plane markup. */
    getSweepContourRef() { return this._contour; }
    /** Return the sweep angle. */
    getSweep() { return this._sweepAngle.clone(); }
    /** Test if `other` is a `RotationalSweep` */
    isSameGeometryClass(other) { return other instanceof RotationalSweep; }
    /** Test for same axis, capping, and swept geometry. */
    isAlmostEqual(other) {
        if (other instanceof RotationalSweep) {
            return this._contour.isAlmostEqual(other._contour)
                && this._normalizedAxis.isAlmostEqual(other._normalizedAxis)
                && this.capped === other.capped;
        }
        return false;
    }
    /** return a deep clone */
    clone() {
        return new RotationalSweep(this._contour.clone(), this._normalizedAxis.clone(), this._sweepAngle.clone(), this.capped);
    }
    /** Transform the contour and axis */
    tryTransformInPlace(transform) {
        if (!transform.matrix.isSingular()
            && this._contour.tryTransformInPlace(transform)) {
            this._normalizedAxis.transformInPlace(transform);
            return this._normalizedAxis.direction.normalizeInPlace();
        }
        return false;
    }
    /** return a cloned transform. */
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    /** Dispatch to strongly typed handler  `handler.handleRotationalSweep(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleRotationalSweep(this);
    }
    /** Return a transform that rotates around the rotational axis by a fraction of the total sweep. */
    getFractionalRotationTransform(vFraction, result) {
        const radians = this._sweepAngle.radians * vFraction;
        const rotation = Transform_1.Transform.createFixedPointAndMatrix(this._normalizedAxis.origin, Matrix3d_1.Matrix3d.createRotationAroundVector(this._normalizedAxis.direction, Angle_1.Angle.createRadians(radians), result ? result.matrix : undefined));
        return rotation;
    }
    /**
     * Return the curves of a constant-v section of the solid.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction) {
        const section = this._contour.curves.clone();
        if (section) {
            section.tryTransformInPlace(this.getFractionalRotationTransform(vFraction));
        }
        return section;
    }
    /** Extend range using sampled points on the surface. */
    extendRange(range, transform) {
        const degreeStep = 360 / 32;
        const options = StrokeOptions_1.StrokeOptions.createForCurves();
        options.angleTol = Angle_1.Angle.createDegrees(degreeStep);
        const strokes = this._contour.curves.cloneStroked(options);
        const numStep = Geometry_1.Geometry.stepCount(degreeStep, this._sweepAngle.degrees, 4, 32);
        const stepTransform = Transform_1.Transform.createIdentity();
        if (transform) {
            const compositeTransform = Transform_1.Transform.createIdentity();
            for (let i = 0; i <= numStep; i++) {
                transform.multiplyTransformTransform(this.getFractionalRotationTransform(i / numStep, stepTransform), compositeTransform);
                strokes.extendRange(range, compositeTransform);
            }
        }
        else {
            for (let i = 0; i <= numStep; i++)
                strokes.extendRange(range, this.getFractionalRotationTransform(i / numStep, stepTransform));
        }
    }
    /**
     * @return true if this is a closed volume.
     */
    get isClosedVolume() {
        return this.capped || this._sweepAngle.isFullCircle;
    }
}
exports.RotationalSweep = RotationalSweep;
//# sourceMappingURL=RotationalSweep.js.map