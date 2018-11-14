"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const GeometryQuery_1 = require("./GeometryQuery");
const CurveProcessor_1 = require("./CurveProcessor");
const CurvePrimitive_1 = require("./CurvePrimitive");
const LineSegment3d_1 = require("./LineSegment3d");
const LineString3d_1 = require("./LineString3d");
// import { SumLengthsContext, GapSearchContext, CountLinearPartsSearchContext, CloneCurvesContext, TransformInPlaceContext } from "./CurveSearches";
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
            if (parent instanceof CurveChain) {
                const chain = parent;
                const nextCurve = chain.cyclicCurvePrimitive(_indexInParent + 1);
                if (curve !== undefined && nextCurve !== undefined) {
                    this.maxGap = Math.max(this.maxGap, curve.endPoint().distance(nextCurve.startPoint()));
                }
            }
        }
    }
}
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
        if (c instanceof CurveCollection)
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
            if (parent instanceof CurveChain) {
                parent.tryAddChild(c);
            }
            else if (parent instanceof BagOfCurves) {
                parent.tryAddChild(c);
            }
        }
    }
}
/**
 * * A `CurveCollection` is an abstract (non-instantiable) class for various sets of curves with particular structures:
 * * * `Path` - a sequence of `CurvePrimitive` joining head-to-tail (but not required to close, and not enclosing a planar area)
 * * * `Loop` - a sequence of coplanar `CurvePrimitive` joining head-to-tail, and closing from last to first so that they enclose a planar area.
 * * * `ParityRegion` -- a colletion of coplanar `Loop`s, with "in/out" classification by parity rules
 * * * `UnionRegion` -- a colletion of coplanar `Loop`s, with "in/out" classification by union rules
 * * * `BagOfCurves` -- a collection of `AnyCurve` with no implied structure.
 */
class CurveCollection extends GeometryQuery_1.GeometryQuery {
    constructor() {
        super(...arguments);
        /* tslint:disable:variable-name no-empty*/
        // Only used by the Loop class, which is needed during a check in DGNJS writing
        this.isInner = false;
    }
    /** Return the sum of the lengths of all contained curves. */
    sumLengths() { return SumLengthsContext.sumLengths(this); }
    /** return the max gap between adjacent primitives in Path and Loop collctions.
     *
     * * In a Path, gaps are computed between consecutive primitives.
     * * In a Loop, gaps are comptued between consecutvie primtives and between last and first.
     * * gaps are NOT computed between consecutive CurvePrimitives in "unstructured" collections.  The type is "unstructured" so gaps should not be semantically meaningful.
     */
    maxGap() { return GapSearchContext.maxGap(this); }
    /** return true if the curve collection has any primitives other than LineSegment3d and LineString3d  */
    checkForNonLinearPrimitives() { return CountLinearPartsSearchContext.hasNonLinearPrimitives(this); }
    tryTransformInPlace(transform) { return TransformInPlaceContext.tryTransformInPlace(this, transform); }
    clone() {
        return CloneCurvesContext.clone(this);
    }
    cloneTransformed(transform) {
        return CloneCurvesContext.clone(this, transform);
    }
    /** Return true for planar region types:
     * * `Loop`
     * * `ParityRegion`
     * * `UnionRegion`
     */
    get isAnyRegionType() {
        return this.dgnBoundaryType() === 2 || this.dgnBoundaryType() === 5 || this.dgnBoundaryType() === 4;
    }
    /** Return true for a `Path`, i.e. a chain of curves joined head-to-tail
     */
    get isOpenPath() {
        return this.dgnBoundaryType() === 1;
    }
    /** Return true for a single-loop planar region type, i.e. `Loop`.
     * * This is _not- a test for physical closure of a `Path`
     */
    get isClosedPath() {
        return this.dgnBoundaryType() === 2;
    }
    /** Extend (increase) `rangeToExtend` as needed to include these curves (optionally transformed)
     */
    extendRange(rangeToExtend, transform) {
        const children = this.children;
        if (children) {
            for (const c of children) {
                c.extendRange(rangeToExtend, transform);
            }
        }
    }
}
exports.CurveCollection = CurveCollection;
/** Shared base class for use by both open and closed paths.
 * A curveChain contains only curvePrimitives.  No other paths, loops, or regions allowed.
 */
class CurveChain extends CurveCollection {
    constructor() { super(); this._curves = []; }
    // _curves should be initialized in ctor.  But it doesn't happen.
    get children() {
        if (this._curves === undefined)
            this._curves = [];
        return this._curves;
    }
    getPackedStrokes(options) {
        const tree = this.cloneStroked(options);
        if (tree instanceof CurveChain) {
            const children = tree.children;
            if (children.length === 1) {
                const ls = children[0];
                if (ls instanceof LineString3d_1.LineString3d)
                    return ls.packedPoints;
            }
        }
        return undefined;
    }
    cloneStroked(options) {
        const strokes = LineString3d_1.LineString3d.create();
        for (const curve of this.children)
            curve.emitStrokes(strokes, options);
        return strokes;
    }
    tryAddChild(child) {
        if (child instanceof CurvePrimitive_1.CurvePrimitive) {
            this._curves.push(child);
            return true;
        }
        return false;
    }
    getChild(i) {
        if (i < this._curves.length)
            return this._curves[i];
        return undefined;
    }
    extendRange(range, transform) {
        for (const curve of this._curves)
            curve.extendRange(range, transform);
    }
    /**
     * Reverse each child curve (in place)
     * Reverse the order of the children in the CurveChain array.
     */
    reverseChildrenInPlace() {
        for (const curve of this._curves)
            curve.reverseInPlace();
        this._curves.reverse();
    }
}
exports.CurveChain = CurveChain;
/**
 * * A `BagOfCurves` object is a collection of `AnyCurve` objects.
 * * A `BagOfCurves` is not a planar region.
 */
class BagOfCurves extends CurveCollection {
    isSameGeometryClass(other) { return other instanceof BagOfCurves; }
    constructor() { super(); this._children = []; }
    get children() { return this._children; }
    static create(...data) {
        const result = new BagOfCurves();
        for (const child of data) {
            result.tryAddChild(child);
        }
        return result;
    }
    dgnBoundaryType() { return 0; }
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceBagOfCurves(this, indexInParent);
    }
    cloneStroked(options) {
        const clone = new BagOfCurves();
        let child;
        for (child of this.children) {
            if (child instanceof CurvePrimitive_1.CurvePrimitive) {
                const ls = LineString3d_1.LineString3d.create();
                child.emitStrokes(ls, options);
                if (ls)
                    clone.children.push(ls);
            }
            else if (child instanceof CurveCollection) {
                const childStrokes = child.cloneStroked(options);
                if (childStrokes)
                    clone.children.push(childStrokes);
            }
        }
        return clone;
    }
    cloneEmptyPeer() { return new BagOfCurves(); }
    tryAddChild(child) {
        this._children.push(child);
        return true;
    }
    getChild(i) {
        if (i < this._children.length)
            return this._children[i];
        return undefined;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleBagOfCurves(this);
    }
}
exports.BagOfCurves = BagOfCurves;
//# sourceMappingURL=CurveCollection.js.map