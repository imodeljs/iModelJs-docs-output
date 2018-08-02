"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Transform_1 = require("../Transform");
const Geometry_1 = require("../Geometry");
const SweepContour_1 = require("./SweepContour");
const SolidPrimitive_1 = require("./SolidPrimitive");
class RotationalSweep extends SolidPrimitive_1.SolidPrimitive {
    constructor(contour, normalizedAxis, sweepAngle, capped) {
        super(capped);
        this.contour = contour;
        this.normalizedAxis = normalizedAxis;
        this.capped = capped;
        this.sweepAngle = sweepAngle;
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
        const contourPerpendicular = this.contour.localToWorld.matrix.columnZ();
        const axes = Transform_1.RotMatrix.createRigidFromColumns(contourPerpendicular, this.normalizedAxis.direction, 1 /* YZX */);
        if (axes) {
            return Transform_1.Transform.createOriginAndMatrix(this.normalizedAxis.origin, axes);
        }
        return undefined;
    }
    cloneAxisRay() { return this.normalizedAxis.clone(); }
    getCurves() { return this.contour.curves; }
    getSweepContourRef() { return this.contour; }
    getSweep() { return this.sweepAngle.clone(); }
    isSameGeometryClass(other) { return other instanceof RotationalSweep; }
    isAlmostEqual(other) {
        if (other instanceof RotationalSweep) {
            return this.contour.isAlmostEqual(other.contour)
                && this.normalizedAxis.isAlmostEqual(other.normalizedAxis)
                && this.capped === other.capped;
        }
        return false;
    }
    clone() {
        return new RotationalSweep(this.contour.clone(), this.normalizedAxis.clone(), this.sweepAngle.clone(), this.capped);
    }
    tryTransformInPlace(transform) {
        if (this.contour.tryTransformInPlace(transform)) {
            this.normalizedAxis.transformInPlace(transform);
            return this.normalizedAxis.direction.normalizeInPlace();
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
        const radians = this.sweepAngle.radians * vFraction;
        const rotation = Transform_1.Transform.createOriginAndMatrix(this.normalizedAxis.origin, Transform_1.RotMatrix.createRotationAroundVector(this.normalizedAxis.direction, Geometry_1.Angle.createRadians(radians), result ? result.matrix : undefined));
        return rotation;
    }
    /**
     * @returns Return the curves of a constant-v section of the solid.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction) {
        const section = this.contour.curves.clone();
        if (section) {
            section.tryTransformInPlace(this.getFractionalRotationTransform(vFraction));
        }
        return section;
    }
    extendRange(range) {
        const strokes = this.contour.curves.cloneStroked();
        const numStep = Geometry_1.Geometry.stepCount(22.5, this.sweepAngle.degrees, 4, 16);
        for (let i = 0; i <= numStep; i++)
            strokes.extendRange(range, this.getFractionalRotationTransform(i / numStep));
    }
}
exports.RotationalSweep = RotationalSweep;
//# sourceMappingURL=RotationalSweep.js.map