"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Geometry_1 = require("../Geometry");
const Angle_1 = require("../geometry3d/Angle");
const SweepContour_1 = require("./SweepContour");
const SolidPrimitive_1 = require("./SolidPrimitive");
class RotationalSweep extends SolidPrimitive_1.SolidPrimitive {
    constructor(contour, normalizedAxis, sweepAngle, capped) {
        super(capped);
        this._contour = contour;
        this._normalizedAxis = normalizedAxis;
        this.capped = capped;
        this._sweepAngle = sweepAngle;
    }
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
        const axes = Matrix3d_1.Matrix3d.createRigidFromColumns(contourPerpendicular, this._normalizedAxis.direction, 1 /* YZX */);
        if (axes) {
            return Transform_1.Transform.createOriginAndMatrix(this._normalizedAxis.origin, axes);
        }
        return undefined;
    }
    cloneAxisRay() { return this._normalizedAxis.clone(); }
    getCurves() { return this._contour.curves; }
    getSweepContourRef() { return this._contour; }
    getSweep() { return this._sweepAngle.clone(); }
    isSameGeometryClass(other) { return other instanceof RotationalSweep; }
    isAlmostEqual(other) {
        if (other instanceof RotationalSweep) {
            return this._contour.isAlmostEqual(other._contour)
                && this._normalizedAxis.isAlmostEqual(other._normalizedAxis)
                && this.capped === other.capped;
        }
        return false;
    }
    clone() {
        return new RotationalSweep(this._contour.clone(), this._normalizedAxis.clone(), this._sweepAngle.clone(), this.capped);
    }
    tryTransformInPlace(transform) {
        if (this._contour.tryTransformInPlace(transform)) {
            this._normalizedAxis.transformInPlace(transform);
            return this._normalizedAxis.direction.normalizeInPlace();
        }
        return false;
    }
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleRotationalSweep(this);
    }
    getFractionalRotationTransform(vFraction, result) {
        const radians = this._sweepAngle.radians * vFraction;
        const rotation = Transform_1.Transform.createOriginAndMatrix(this._normalizedAxis.origin, Matrix3d_1.Matrix3d.createRotationAroundVector(this._normalizedAxis.direction, Angle_1.Angle.createRadians(radians), result ? result.matrix : undefined));
        return rotation;
    }
    /**
     * @returns Return the curves of a constant-v section of the solid.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction) {
        const section = this._contour.curves.clone();
        if (section) {
            section.tryTransformInPlace(this.getFractionalRotationTransform(vFraction));
        }
        return section;
    }
    extendRange(range) {
        const strokes = this._contour.curves.cloneStroked();
        const numStep = Geometry_1.Geometry.stepCount(22.5, this._sweepAngle.degrees, 4, 16);
        for (let i = 0; i <= numStep; i++)
            strokes.extendRange(range, this.getFractionalRotationTransform(i / numStep));
    }
}
exports.RotationalSweep = RotationalSweep;
//# sourceMappingURL=RotationalSweep.js.map