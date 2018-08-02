"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurveChain_1 = require("../curve/CurveChain");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const Geometry_1 = require("../Geometry");
const SolidPrimitive_1 = require("./SolidPrimitive");
const SweepContour_1 = require("./SweepContour");
const ConstructCurveBetweenCurves_1 = require("../curve/ConstructCurveBetweenCurves");
class RuledSweep extends SolidPrimitive_1.SolidPrimitive {
    constructor(contours, capped) {
        super(capped);
        this.contours = contours;
    }
    static create(contours, capped) {
        const sweepContours = [];
        for (const contour of contours) {
            const sweepable = SweepContour_1.SweepContour.createForLinearSweep(contour);
            if (sweepable === undefined)
                return undefined;
            sweepContours.push(sweepable);
        }
        return new RuledSweep(sweepContours, capped);
    }
    /** @returns Return a reference to the array of sweep contours. */
    sweepContoursRef() { return this.contours; }
    cloneSweepContours() {
        const result = [];
        for (const sweepable of this.contours) {
            result.push(sweepable.clone());
        }
        return result;
    }
    cloneContours() {
        const result = [];
        for (const sweepable of this.contours) {
            result.push(sweepable.curves.clone());
        }
        return result;
    }
    clone() {
        return new RuledSweep(this.cloneSweepContours(), this.capped);
    }
    tryTransformInPlace(transform) {
        for (const contour of this.contours) {
            contour.tryTransformInPlace(transform);
        }
        return true;
    }
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    /** Return a coordinate frame (right handed unit vectors)
     * * origin on base contour
     * * x, y directions from base contour.
     * * z direction perpenedicular
     */
    getConstructiveFrame() {
        if (this.contours.length === 0)
            return undefined;
        return this.contours[0].localToWorld.cloneRigid();
    }
    isSameGeometryClass(other) { return other instanceof RuledSweep; }
    isAlmostEqual(other) {
        if (other instanceof RuledSweep) {
            if (this.capped !== other.capped)
                return false;
            if (this.contours.length !== other.contours.length)
                return false;
            for (let i = 0; i < this.contours.length; i++) {
                if (!this.contours[i].isAlmostEqual(other.contours[i]))
                    return false;
            }
            return true;
        }
        return false;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleRuledSweep(this);
    }
    /**
     * @returns Return the section curves at a fraction of the sweep
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction) {
        const numSection = this.contours.length;
        if (numSection < 2)
            return undefined;
        const q = vFraction * numSection;
        let section0 = 0;
        if (vFraction >= 1.0)
            section0 = numSection - 1;
        else
            section0 = Math.floor(q);
        if (section0 + 1 >= numSection)
            section0 = numSection - 2;
        const section1 = section0 + 1;
        const localFraction = Geometry_1.Geometry.clampToStartEnd(q - section0, 0, 1);
        return CurveChain_1.CurveCollection.mutatePartners(this.contours[section0].curves, this.contours[section1].curves, (primitive0, primitive1) => {
            const newPrimitive = ConstructCurveBetweenCurves_1.ConstructCurveBetweenCurves.InterpolateBetween(primitive0, localFraction, primitive1);
            if (newPrimitive instanceof CurvePrimitive_1.CurvePrimitive)
                return newPrimitive;
            return undefined;
        });
    }
    extendRange(rangeToExtend, transform) {
        for (const contour of this.contours)
            contour.curves.extendRange(rangeToExtend, transform);
    }
}
exports.RuledSweep = RuledSweep;
//# sourceMappingURL=RuledSweep.js.map