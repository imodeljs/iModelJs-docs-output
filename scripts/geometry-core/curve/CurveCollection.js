"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const GeometryQuery_1 = require("./GeometryQuery");
const CurveProcessor_1 = require("./CurveProcessor");
const CurvePrimitive_1 = require("./CurvePrimitive");
const LineSegment3d_1 = require("./LineSegment3d");
const LineString3d_1 = require("./LineString3d");
const Geometry_1 = require("../Geometry");
const CurveLocationDetail_1 = require("./CurveLocationDetail");
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
    // specialized clone methods override this (and allow announceCurvePrimitive to insert to parent)
    doClone(primitive) {
        if (this._transform)
            return primitive.cloneTransformed(this._transform);
        return primitive.clone();
    }
    announceCurvePrimitive(primitive, _indexInParent) {
        const c = this.doClone(primitive);
        if (c !== undefined && this._stack.length > 0) {
            const parent = this._stack[this._stack.length - 1];
            if (parent instanceof CurveChain || parent instanceof BagOfCurves)
                if (Array.isArray(c)) {
                    for (const c1 of c) {
                        parent.tryAddChild(c1);
                    }
                }
                else {
                    parent.tryAddChild(c);
                }
        }
    }
}
/**
 * Algorithmic class for cloning with linestrings expanded to line segments
 */
class CloneWithExpandedLineStrings extends CloneCurvesContext {
    constructor() {
        // we have no transform ....
        super(undefined);
    }
    // We know we have no transform !!!
    doClone(primitive) {
        if (primitive instanceof LineString3d_1.LineString3d && primitive.numPoints() > 1) {
            const packedPoints = primitive.packedPoints;
            const n = packedPoints.length;
            const segments = [];
            for (let i = 0; i + 1 < n; i++) {
                segments.push(LineSegment3d_1.LineSegment3d.createCapture(packedPoints.getPoint3dAtUncheckedPointIndex(i), packedPoints.getPoint3dAtUncheckedPointIndex(i + 1)));
            }
            return segments;
        }
        return primitive.clone();
    }
    static clone(target) {
        const context = new CloneWithExpandedLineStrings();
        target.announceToCurveProcessor(context);
        return context._result;
    }
}
/**
 * * A `CurveCollection` is an abstract (non-instantiable) class for various sets of curves with particular structures:
 *   * `CurveChain` is a (non-instantiable) intermediate class for a sequence of `CurvePrimitive ` joining head-to-tail.  The two instantiable forms of `CurveChain` are
 *     * `Path` - A chain not required to close, and not enclosing a planar area
 *     * `Loop` - A chain required to close from last to first so that a planar area is enclosed.
 *   * `ParityRegion` -- a collection of coplanar `Loop`s, with "in/out" classification by parity rules
 *   * `UnionRegion` -- a collection of coplanar `Loop`s, with "in/out" classification by union rules
 *   * `BagOfCurves` -- a collection of `AnyCurve` with no implied structure.
 * @public
 */
class CurveCollection extends GeometryQuery_1.GeometryQuery {
    constructor() {
        super(...arguments);
        /** String name for schema properties */
        this.geometryCategory = "curveCollection";
        /* tslint:disable:variable-name no-empty*/
        /**  Flag for inner loop status. Only used by `Loop`. */
        this.isInner = false;
    }
    /** Return the sum of the lengths of all contained curves. */
    sumLengths() { return SumLengthsContext.sumLengths(this); }
    /** return the max gap between adjacent primitives in Path and Loop collections.
     *
     * * In a Path, gaps are computed between consecutive primitives.
     * * In a Loop, gaps are computed between consecutive primitives and between last and first.
     * * gaps are NOT computed between consecutive CurvePrimitives in "unstructured" collections.  The type is "unstructured" so gaps should not be semantically meaningful.
     */
    maxGap() { return GapSearchContext.maxGap(this); }
    /** return true if the curve collection has any primitives other than LineSegment3d and LineString3d  */
    checkForNonLinearPrimitives() { return CountLinearPartsSearchContext.hasNonLinearPrimitives(this); }
    /** Apply transform recursively to children */
    tryTransformInPlace(transform) { return TransformInPlaceContext.tryTransformInPlace(this, transform); }
    /** Return a deep copy. */
    clone() {
        return CloneCurvesContext.clone(this);
    }
    /** Create a deep copy of transformed curves. */
    cloneTransformed(transform) {
        return CloneCurvesContext.clone(this, transform);
    }
    /** Create a deep copy with all linestrings expanded to multiple LineSegment3d. */
    cloneWithExpandedLineStrings() {
        return CloneWithExpandedLineStrings.clone(this);
    }
    /** Recurse through children to collect CurvePrimitive's in flat array. */
    collectCurvePrimitivesGo(results) {
        if (this.children) {
            for (const child of this.children) {
                if (child instanceof CurvePrimitive_1.CurvePrimitive)
                    results.push(child);
                else if (child instanceof CurveCollection)
                    child.collectCurvePrimitivesGo(results);
            }
        }
    }
    /**
     * Return an array containing only the curve primitives.
     * * These are leaf nodes
     * * If there is a CurveChainWithDistanceIndex, that primitive stands as a leaf. (NOT its constituent curves)
     */
    collectCurvePrimitives() {
        const results = [];
        this.collectCurvePrimitivesGo(results);
        return results;
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
    /** Extend (increase) `rangeToExtend` as needed to include these curves (optionally transformed) */
    extendRange(rangeToExtend, transform) {
        const children = this.children;
        if (children) {
            for (const c of children) {
                c.extendRange(rangeToExtend, transform);
            }
        }
    }
    /**
     * * Find any curve primitive in the source.
     * * Evaluate it at a fraction (which by default is an interior fraction)
     * @param source containing `CurvePrimitive` or `CurveCollection`
     * @param fraction fraction to use in `curve.fractionToPoint(fraction)`
     */
    static createCurveLocationDetailOnAnyCurvePrimitive(source, fraction = 0.5) {
        if (!source)
            return undefined;
        if (source instanceof CurvePrimitive_1.CurvePrimitive) {
            return CurveLocationDetail_1.CurveLocationDetail.createCurveEvaluatedFraction(source, fraction);
        }
        else if (source instanceof CurveCollection && source.children !== undefined)
            for (const child of source.children) {
                const detail = this.createCurveLocationDetailOnAnyCurvePrimitive(child, fraction);
                if (detail)
                    return detail;
            }
        return undefined;
    }
}
exports.CurveCollection = CurveCollection;
/** Shared base class for use by both open and closed paths.
 * * A `CurveChain` contains only curvePrimitives.  No other paths, loops, or regions allowed.
 * * A single entry in the chain can in fact contain multiple curve primitives if the entry itself is (for instance) `CurveChainWithDistanceIndex`
 *   which presents itself (through method interface) as a CurvePrimitive with well defined mappings from fraction to xyz, but in fact does all the
 *    calculations over multiple primitives.
 * * The specific derived classes are `Path` and `Loop`
 * * `CurveChain` is an intermediate class.   It is not instantiable on its own.
 * @public
 */
class CurveChain extends CurveCollection {
    constructor() { super(); this._curves = []; }
    /** Return the array of `CurvePrimitive` */
    get children() {
        if (this._curves === undefined)
            this._curves = [];
        return this._curves;
    }
    /**
     * Return curve primitive by index, interpreted cyclically for both Loop and Path
     * @param index index to array
     */
    /**
     * Return the `[index]` curve primitive, using `modulo` to map`index` to the cyclic indexing.
     * * In particular, `-1` is the final curve.
     * @param index cyclic index
     */
    cyclicCurvePrimitive(index) {
        const n = this.children.length;
        if (n === 0)
            return undefined;
        const index2 = Geometry_1.Geometry.modulo(index, n);
        return this.children[index2];
    }
    /** Stroke the chain into a simple xyz array.
     * @param options tolerance parameters controlling the stroking.
     */
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
    /** Return a structural clone, with CurvePrimitive objects stroked. */
    cloneStroked(options) {
        const strokes = LineString3d_1.LineString3d.create();
        for (const curve of this.children)
            curve.emitStrokes(strokes, options);
        return strokes;
    }
    /** add a child curve.
     * * Returns false if the given child is not a CurvePrimitive.
     */
    tryAddChild(child) {
        if (child && child instanceof CurvePrimitive_1.CurvePrimitive) {
            this._curves.push(child);
            return true;
        }
        return false;
    }
    /** Return a child by index */
    getChild(i) {
        if (i < this._curves.length)
            return this._curves[i];
        return undefined;
    }
    /** invoke `curve.extendRange(range, transform)` for each child  */
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
 * * A `BagOfCurves` has no implied properties such as being planar.
 * @public
 */
class BagOfCurves extends CurveCollection {
    /** Construct an empty `BagOfCurves` */
    constructor() {
        super();
        /** String name for schema properties */
        this.curveCollectionType = "bagOfCurves";
        this._children = [];
    }
    /** test if `other` is an instance of `BagOfCurves` */
    isSameGeometryClass(other) { return other instanceof BagOfCurves; }
    /** Return the (reference to) array of children */
    get children() { return this._children; }
    /** create with given curves. */
    static create(...data) {
        const result = new BagOfCurves();
        for (const child of data) {
            result.tryAddChild(child);
        }
        return result;
    }
    /** Return the boundary type (0) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType() { return 0; }
    /** invoke `processor.announceBagOfCurves(this, indexInParent);` */
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceBagOfCurves(this, indexInParent);
    }
    /** Clone all children in stroked form. */
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
    /** Return an empty `BagOfCurves` */
    cloneEmptyPeer() { return new BagOfCurves(); }
    /** Add a child  */
    tryAddChild(child) {
        if (child)
            this._children.push(child);
        return true;
    }
    /** Get a child by index */
    getChild(i) {
        if (i < this._children.length)
            return this._children[i];
        return undefined;
    }
    /** Second step of double dispatch:  call `handler.handleBagOfCurves(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleBagOfCurves(this);
    }
}
exports.BagOfCurves = BagOfCurves;
/**
 * * Options to control method `RegionOps.consolidateAdjacentPrimitives`
 * @public
 */
class ConsolidateAdjacentCurvePrimitivesOptions {
    constructor() {
        /** True to consolidated linear geometry   (e.g. separate LineSegment3d and LineString3d) into LineString3d */
        this.consolidateLinearGeometry = true;
        /** True to consolidate contiguous arcs */
        this.consolidateCompatibleArcs = true;
        /** Tolerance for collapsing identical points */
        this.duplicatePointTolerance = Geometry_1.Geometry.smallMetricDistance;
        /** Tolerance for removing interior colinear points. */
        this.colinearPointTolerance = Geometry_1.Geometry.smallMetricDistance;
    }
}
exports.ConsolidateAdjacentCurvePrimitivesOptions = ConsolidateAdjacentCurvePrimitivesOptions;
//# sourceMappingURL=CurveCollection.js.map