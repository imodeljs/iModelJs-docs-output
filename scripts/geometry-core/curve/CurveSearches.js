"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurveProcessor_1 = require("./CurveProcessor");
const CurveChain_1 = require("./CurveChain");
const LineString3d_1 = require("./LineString3d");
const LineSegment3d_1 = require("./LineSegment3d");
/** Algorithmic class: Accumulate maximum gap between adjacent primitives of CurveChain.
 */
class GapSearchContext extends CurveProcessor_1.RecursiveCurveProcessorWithStack {
    constructor() { super(); this.maxGap = 0.0; }
    static maxGap(target) {
        const context = new GapSearchContext();
        target.announceToCurveProcessor(context);
        return context.maxGap;
    }
    announceCurvePrimitive(curve, _indexInParent) {
        if (this._stack.length > 0) {
            const parent = this._stack[this._stack.length - 1];
            if (parent instanceof CurveChain_1.CurveChain) {
                const chain = parent;
                const nextCurve = chain.cyclicCurvePrimitive(_indexInParent + 1);
                if (curve !== undefined && nextCurve !== undefined) {
                    this.maxGap = Math.max(this.maxGap, curve.endPoint().distance(nextCurve.startPoint()));
                }
            }
        }
    }
}
exports.GapSearchContext = GapSearchContext;
/** Algorithmic class: Count LineSegment3d and LineString3d primitives.
 */
class CountLinearPartsSearchContext extends CurveProcessor_1.RecursiveCurveProcessorWithStack {
    constructor() {
        super();
        this.numLineSegment = 0;
        this.numLineString = 0;
        this.numOther = 0;
    }
    static hasNonLinearPrimitives(target) {
        const context = new CountLinearPartsSearchContext();
        target.announceToCurveProcessor(context);
        return context.numOther > 0;
    }
    announceCurvePrimitive(curve, _indexInParent) {
        if (curve instanceof LineSegment3d_1.LineSegment3d)
            this.numLineSegment++;
        else if (curve instanceof LineString3d_1.LineString3d)
            this.numLineString++;
        else
            this.numOther++;
    }
}
exports.CountLinearPartsSearchContext = CountLinearPartsSearchContext;
/** Algorithmic class: Transform curves in place.
 */
class TransformInPlaceContext extends CurveProcessor_1.RecursiveCurveProcessor {
    constructor(transform) { super(); this.numFail = 0; this.numOK = 0; this.transform = transform; }
    static tryTransformInPlace(target, transform) {
        const context = new TransformInPlaceContext(transform);
        target.announceToCurveProcessor(context);
        return context.numFail === 0;
    }
    announceCurvePrimitive(curvePrimitive, _indexInParent) {
        if (!curvePrimitive.tryTransformInPlace(this.transform))
            this.numFail++;
        else
            this.numOK++;
    }
}
exports.TransformInPlaceContext = TransformInPlaceContext;
/** Algorithmic class: Sum lengths of curves */
class SumLengthsContext extends CurveProcessor_1.RecursiveCurveProcessor {
    constructor() { super(); this._sum = 0.0; }
    static sumLengths(target) {
        const context = new SumLengthsContext();
        target.announceToCurveProcessor(context);
        return context._sum;
    }
    announceCurvePrimitive(curvePrimitive, _indexInParent) {
        this._sum += curvePrimitive.curveLength();
    }
}
exports.SumLengthsContext = SumLengthsContext;
/**
 * Algorithmic class for cloning curve collections.
 * * recurse through collection nodes, building image nodes as needed and inserting clones of children.
 * * for individual primitive, invoke doClone (protected) for direct clone; insert into parent
 */
class CloneCurvesContext extends CurveProcessor_1.RecursiveCurveProcessorWithStack {
    constructor(transform) {
        super();
        this._transform = transform;
        this._result = undefined;
    }
    static clone(target, transform) {
        const context = new CloneCurvesContext(transform);
        target.announceToCurveProcessor(context);
        return context._result;
    }
    enter(c) {
        if (c instanceof CurveChain_1.CurveCollection)
            super.enter(c.cloneEmptyPeer());
    }
    leave() {
        const result = super.leave();
        if (result) {
            if (this._stack.length === 0) // this should only happen once !!!
                this._result = result;
            else // push this result to top of stack.
                this._stack[this._stack.length - 1].tryAddChild(result);
        }
        return result;
    }
    // specialized cloners override this (and allow announceCurvePrimitive to insert to parent)
    doClone(primitive) {
        if (this._transform)
            return primitive.cloneTransformed(this._transform);
        return primitive.clone();
    }
    announceCurvePrimitive(primitive, _indexInParent) {
        const c = this.doClone(primitive);
        if (c && this._stack.length > 0) {
            const parent = this._stack[this._stack.length - 1];
            if (parent instanceof CurveChain_1.CurveChain) {
                parent.tryAddChild(c);
            }
            else if (parent instanceof CurveChain_1.BagOfCurves) {
                parent.tryAddChild(c);
            }
        }
    }
}
exports.CloneCurvesContext = CloneCurvesContext;
//# sourceMappingURL=CurveSearches.js.map