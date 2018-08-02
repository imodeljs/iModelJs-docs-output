"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Solid */
const PointVector_1 = require("../PointVector");
const Transform_1 = require("../Transform");
const CurveChain_1 = require("../curve/CurveChain");
const LineString3d_1 = require("../curve/LineString3d");
const PointHelpers_1 = require("../PointHelpers");
const SweepContour_1 = require("./SweepContour");
const SolidPrimitive_1 = require("./SolidPrimitive");
/**
 * A LinearSweep is
 *
 * * A planar contour (any Loop, Path, or parityRegion)
 * * A sweep vector
 */
class LinearSweep extends SolidPrimitive_1.SolidPrimitive {
    constructor(contour, direction, capped) {
        super(capped);
        this.contour = contour;
        this.direction = direction;
    }
    static create(contour, direction, capped) {
        const sweepable = SweepContour_1.SweepContour.createForLinearSweep(contour, direction);
        if (!sweepable)
            return undefined;
        return new LinearSweep(sweepable, direction, capped);
    }
    /** Create a z-direction sweep of the polyline or polygon given as xy linestring values.
     * * If not capped, the xyPoints array is always used unchanged.
     * * If capped but the xyPoints array does not close, exact closure will be enforced by one of these:
     * * * If the final point is almost equal to the first, it is replaced by the exact first point.
     * * * if the final point is not close to the first an extra point is added.
     * * If capped, the point order will be reversed if necessary to produce positive volume.
     * @param xyPoints array of xy coordinates
     * @param z z value to be used for all coordinates
     * @param zSweep the sweep distance in the z direction.
     * @param capped true if caps are to be added.
     */
    static createZSweep(xyPoints, z, zSweep, capped) {
        const xyz = LineString3d_1.LineString3d.createXY(xyPoints, z, capped);
        if (capped) {
            const area = PointHelpers_1.PolygonOps.areaXY(xyz.points);
            if (area * zSweep < 0.0)
                xyz.points.reverse();
        }
        const contour = capped ? CurveChain_1.Loop.create(xyz) : CurveChain_1.Path.create(xyz);
        return LinearSweep.create(contour, PointVector_1.Vector3d.create(0, 0, zSweep), capped);
    }
    getCurvesRef() { return this.contour.curves; }
    getSweepContourRef() { return this.contour; }
    cloneSweepVector() { return this.direction.clone(); }
    isSameGeometryClass(other) { return other instanceof LinearSweep; }
    clone() {
        return new LinearSweep(this.contour.clone(), this.direction.clone(), this.capped);
    }
    tryTransformInPlace(transform) {
        if (this.contour.tryTransformInPlace(transform)) {
            transform.multiplyVector(this.direction, this.direction);
        }
        return false;
    }
    /** Return a coordinate frame (right handed unit vectors)
     * * origin on base contour
     * * x, y directions from base contour.
     * * z direction perpenedicular
     */
    getConstructiveFrame() {
        return this.contour.localToWorld.cloneRigid();
    }
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    isAlmostEqual(other) {
        if (other instanceof LinearSweep) {
            return this.contour.isAlmostEqual(other.contour)
                && this.direction.isAlmostEqual(other.direction)
                && this.capped === other.capped;
        }
        return false;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleLinearSweep(this);
    }
    /**
     * @returns Return the curves of a constant-v section of the solid.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction) {
        const section = this.contour.curves.clone();
        if (section && vFraction !== 0.0)
            section.tryTransformInPlace(Transform_1.Transform.createTranslation(this.direction.scale(vFraction)));
        return section;
    }
    extendRange(range, transform) {
        const contourRange = this.contour.curves.range(transform);
        range.extendRange(contourRange);
        if (transform) {
            const transformedDirection = transform.multiplyVector(this.direction);
            contourRange.low.addInPlace(transformedDirection);
            contourRange.high.addInPlace(transformedDirection);
        }
        else {
            contourRange.low.addInPlace(this.direction);
            contourRange.high.addInPlace(this.direction);
        }
        range.extendRange(contourRange);
    }
}
exports.LinearSweep = LinearSweep;
//# sourceMappingURL=LinearSweep.js.map