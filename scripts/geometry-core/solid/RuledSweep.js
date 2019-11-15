"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurveCollection_1 = require("../curve/CurveCollection");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const Geometry_1 = require("../Geometry");
const SolidPrimitive_1 = require("./SolidPrimitive");
const SweepContour_1 = require("./SweepContour");
const ConstructCurveBetweenCurves_1 = require("../curve/ConstructCurveBetweenCurves");
/**
 * A ruled sweep (surface) is a collection of 2 or more contours.
 * * All contours must have identical number and type of geometry. (paths, loops, parity regions, lines, arcs, other curves)
 * @public
 */
class RuledSweep extends SolidPrimitive_1.SolidPrimitive {
    constructor(contours, capped) {
        super(capped);
        /** String name for schema properties */
        this.solidPrimitiveType = "ruledSweep";
        this._contours = contours;
    }
    /**
     * Create a ruled sweep from an array of contours.
     *  * the contours are CAPTURED (not cloned)
     */
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
    /** Return a reference to the array of SweepContour. */
    sweepContoursRef() { return this._contours; }
    /** Return clones of all the sweep contours
     * * See also cloneContours, which returns the spatial contours without their local coordinate system definitions)
     */
    cloneSweepContours() {
        const result = [];
        for (const sweepable of this._contours) {
            result.push(sweepable.clone());
        }
        return result;
    }
    /** Return clones of all the contours
     * * See also cloneContours, which returns the contours in their local coordinate systems
     */
    cloneContours() {
        const result = [];
        for (const sweepable of this._contours) {
            result.push(sweepable.curves.clone());
        }
        return result;
    }
    /** Return a deep clone */
    clone() {
        return new RuledSweep(this.cloneSweepContours(), this.capped);
    }
    /** Transform all contours in place. */
    tryTransformInPlace(transform) {
        if (transform.matrix.isSingular())
            return false;
        for (const contour of this._contours) {
            contour.tryTransformInPlace(transform);
        }
        return true;
    }
    /** Return a cloned transform. */
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    /** Return a coordinate frame (right handed unit vectors)
     * * origin on base contour
     * * x, y directions from base contour.
     * * z direction perpendicular
     */
    getConstructiveFrame() {
        if (this._contours.length === 0)
            return undefined;
        return this._contours[0].localToWorld.cloneRigid();
    }
    /** Test if `other` is an instance of a `RuledSweep` */
    isSameGeometryClass(other) { return other instanceof RuledSweep; }
    /** test same contour geometry and capping. */
    isAlmostEqual(other) {
        if (other instanceof RuledSweep) {
            if (this.capped !== other.capped)
                return false;
            if (this._contours.length !== other._contours.length)
                return false;
            for (let i = 0; i < this._contours.length; i++) {
                if (!this._contours[i].isAlmostEqual(other._contours[i]))
                    return false;
            }
            return true;
        }
        return false;
    }
    /** dispatch to strongly typed `handler.handleRuledSweep(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleRuledSweep(this);
    }
    /**
     * Return the section curves at a fraction of the sweep
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction) {
        const numSection = this._contours.length;
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
        return RuledSweep.mutatePartners(this._contours[section0].curves, this._contours[section1].curves, (primitive0, primitive1) => {
            const newPrimitive = ConstructCurveBetweenCurves_1.ConstructCurveBetweenCurves.interpolateBetween(primitive0, localFraction, primitive1);
            if (newPrimitive instanceof CurvePrimitive_1.CurvePrimitive)
                return newPrimitive;
            return undefined;
        });
    }
    /** Pass each contour to `extendRange` */
    extendRange(rangeToExtend, transform) {
        for (const contour of this._contours)
            contour.curves.extendRange(rangeToExtend, transform);
    }
    /** Construct a CurveCollection with the same structure as collectionA and collectionB, with primitives constructed by the caller-supplied primitiveMutator function.
     * @returns Returns undefined if there is any type mismatch between the two collections.
     */
    static mutatePartners(collectionA, collectionB, primitiveMutator) {
        if (!collectionA.isSameGeometryClass(collectionB))
            return undefined;
        if (collectionA instanceof CurveCollection_1.CurveChain && collectionB instanceof CurveCollection_1.CurveChain) {
            const chainA = collectionA;
            const chainB = collectionB;
            const chainC = chainA.cloneEmptyPeer();
            const childrenA = chainA.children;
            const childrenB = chainB.children;
            if (childrenA.length !== childrenB.length)
                return undefined;
            for (let i = 0; i < childrenA.length; i++) {
                const newChild = primitiveMutator(childrenA[i], childrenB[i]);
                if (!newChild)
                    return undefined;
                chainC.children.push(newChild);
            }
            return chainC;
        }
        else if (collectionA instanceof CurveCollection_1.CurveCollection && collectionB instanceof CurveCollection_1.CurveCollection) {
            const collectionC = collectionA.cloneEmptyPeer();
            const childrenA = collectionA.children;
            const childrenB = collectionB.children;
            const childrenC = collectionC.children;
            if (childrenA === undefined || childrenB === undefined || childrenC === undefined || childrenA.length !== childrenB.length)
                return undefined;
            for (let i = 0; i < childrenA.length; i++) {
                const childA = childrenA[i];
                const childB = childrenB[i];
                if (childA instanceof CurvePrimitive_1.CurvePrimitive && childB instanceof CurvePrimitive_1.CurvePrimitive) {
                    const newPrimitive = primitiveMutator(childA, childB);
                    if (!newPrimitive)
                        return undefined;
                    childrenC.push(newPrimitive);
                }
                else if (childA instanceof CurveCollection_1.CurveCollection && childB instanceof CurveCollection_1.CurveCollection) {
                    const newChild = this.mutatePartners(childA, childB, primitiveMutator);
                    if (!newChild)
                        return undefined;
                    if (newChild instanceof CurveCollection_1.CurveCollection)
                        childrenC.push(newChild);
                }
            }
            return collectionC;
        }
        return undefined;
    }
    /**
     * Return true if this is a closed volume, as observed by
     * * cap flag
     * identical first and last contours.
     */
    get isClosedVolume() {
        const n = this._contours.length;
        return n > 1 && (this.capped || this._contours[0].isAlmostEqual(this._contours[n - 1]));
    }
}
exports.RuledSweep = RuledSweep;
//# sourceMappingURL=RuledSweep.js.map