"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
// import { Geometry, Angle, AngleSweep } from "../Geometry";
// import { Point3d, Vector3d, RotMatrix } from "../PointVector";
const Geometry_1 = require("../Geometry");
const CurvePrimitive_1 = require("./CurvePrimitive");
const CurveSearches_1 = require("./CurveSearches");
const LineString3d_1 = require("./LineString3d");
/**
 * * A `CurveCollection` is an abstract (non-instantiable) class for various sets of curves with particular structures:
 * * * `Path` - a sequence of `CurvePrimitive` joining head-to-tail (but not required to close, and not enclosing a planar area)
 * * * `Loop` - a sequence of coplanar `CurvePrimitive` joining head-to-tail, and closing from last to first so that they enclose a planar area.
 * * * `ParityRegion` -- a colletion of coplanar `Loop`s, with "in/out" classification by parity rules
 * * * `UnionRegion` -- a colletion of coplanar `Loop`s, with "in/out" classification by union rules
 * * * `BagOfCurves` -- a collection of `AnyCurve` with no implied structure.
 */
class CurveCollection extends CurvePrimitive_1.GeometryQuery {
    constructor() {
        super(...arguments);
        /* tslint:disable:variable-name no-empty*/
        // Only used by the Loop class, which is needed during a check in DGNJS writing
        this.isInner = false;
    }
    /** Return the sum of the lengths of all contained curves. */
    sumLengths() { return CurveSearches_1.SumLengthsContext.sumLengths(this); }
    /** return the max gap between adjacent primitives in Path and Loop collctions.
     *
     * * In a Path, gaps are computed between consecutive primitives.
     * * In a Loop, gaps are comptued between consecutvie primtives and between last and first.
     * * gaps are NOT computed between consecutive CurvePrimitives in "unstructured" collections.  The type is "unstructured" so gaps should not be semantically meaningful.
     */
    maxGap() { return CurveSearches_1.GapSearchContext.maxGap(this); }
    /** return true if the curve collection has any primitives other than LineSegment3d and LineString3d  */
    hasNonLinearPrimitives() { return CurveSearches_1.CountLinearPartsSearchContext.hasNonLinearPrimitives(this); }
    tryTransformInPlace(transform) { return CurveSearches_1.TransformInPlaceContext.tryTransformInPlace(this, transform); }
    clone() {
        return CurveSearches_1.CloneCurvesContext.clone(this);
    }
    cloneTransformed(transform) {
        return CurveSearches_1.CloneCurvesContext.clone(this, transform);
    }
    /** Return true for planar region types:
     * * `Loop`
     * * `ParityRegion`
     * * `UnionRegion`
     */
    isAnyRegionType() {
        return this.dgnBoundaryType() === 2 || this.dgnBoundaryType() === 5 || this.dgnBoundaryType() === 4;
    }
    /** Return true for a `Path`, i.e. a chain of curves joined head-to-tail
     */
    isOpenPath() {
        return this.dgnBoundaryType() === 1;
    }
    /** Return true for a single-loop planar region type, i.e. `Loop`.
     * * This is _not- a test for physical closure of a `Path`
     */
    isClosedPath() {
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
    /** Construct a CurveCollection with the same structure as collectionA and collectionB, with primitives constructed by the caller-supplied primitiveMutator function.
     * @returns Returns undefined if there is any type mismatch between the two collections.
     */
    static mutatePartners(collectionA, collectionB, primitiveMutator) {
        if (!collectionA.isSameGeometryClass(collectionB))
            return undefined;
        if (collectionA instanceof CurveChain && collectionB instanceof CurveChain) {
            const chainA = collectionA;
            const chainB = collectionB;
            const chainC = chainA.cloneEmptyPeer();
            const childrenA = chainA.children;
            const childrenB = chainB.children;
            if (childrenA.length !== childrenA.length)
                return undefined;
            for (let i = 0; i < childrenA.length; i++) {
                const newChild = primitiveMutator(childrenA[i], childrenB[i]);
                if (!newChild)
                    return undefined;
                chainC.children.push(newChild);
            }
            return chainC;
        }
        else if (collectionA instanceof CurveCollection && collectionB instanceof CurveCollection) {
            const collectionC = collectionA.cloneEmptyPeer();
            const childrenA = collectionA.children;
            const childrenB = collectionB.children;
            const childrenC = collectionC.children;
            if (!childrenA || !childrenB || !childrenC)
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
                else if (childA instanceof CurveCollection && childB instanceof CurveCollection) {
                    const newChild = this.mutatePartners(childA, childB, primitiveMutator);
                    if (!newChild)
                        return undefined;
                    if (newChild instanceof CurveCollection)
                        childrenC.push(newChild);
                }
            }
            return collectionC;
        }
        return undefined;
    }
}
exports.CurveCollection = CurveCollection;
/** Shared base class for use by both open and closed paths.
 * A curveChain contains curvePrimitives.
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
}
exports.CurveChain = CurveChain;
/**
 * * A `Path` object is a collection of curves that join head-to-tail to form a path.
 * * A `Path` object does not bound a planar region.
 */
class Path extends CurveChain {
    isSameGeometryClass(other) { return other instanceof Path; }
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announcePath(this, indexInParent);
    }
    constructor() { super(); }
    static create(...curves) {
        const result = new Path();
        for (const curve of curves) {
            result.children.push(curve);
        }
        return result;
    }
    cloneStroked(options) {
        const strokes = LineString3d_1.LineString3d.create();
        for (const curve of this.children)
            curve.emitStrokes(strokes, options);
        return Path.create(strokes);
    }
    dgnBoundaryType() { return 1; }
    cyclicCurvePrimitive(index) {
        if (index >= 0 && index < this.children.length)
            return this.children[index];
        return undefined;
    }
    cloneEmptyPeer() { return new Path(); }
    dispatchToGeometryHandler(handler) {
        return handler.handlePath(this);
    }
}
exports.Path = Path;
/**
 * A `Loop` is a curve chain that is the boundary of a closed (planar) loop.
 */
class Loop extends CurveChain {
    constructor() {
        super();
        this.isInner = false;
    }
    isSameGeometryClass(other) { return other instanceof Loop; }
    static create(...curves) {
        const result = new Loop();
        for (const curve of curves) {
            result.children.push(curve);
        }
        return result;
    }
    static createPolygon(points) {
        const linestring = LineString3d_1.LineString3d.create(points);
        linestring.addClosurePoint();
        return Loop.create(linestring);
    }
    cloneStroked(options) {
        const strokes = LineString3d_1.LineString3d.create();
        for (const curve of this.children)
            curve.emitStrokes(strokes, options);
        return Loop.create(strokes);
    }
    dgnBoundaryType() { return 2; } // (2) all "Loop" become "outer"
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceLoop(this, indexInParent);
    }
    cyclicCurvePrimitive(index) {
        const n = this.children.length;
        if (n >= 1) {
            index = Geometry_1.Geometry.modulo(index, this.children.length);
            return this.children[index];
        }
        return undefined;
    }
    cloneEmptyPeer() { return new Loop(); }
    dispatchToGeometryHandler(handler) {
        return handler.handleLoop(this);
    }
}
exports.Loop = Loop;
/**
 * * A `ParityRegion` is a collection of `Loop` objects.
 * * The loops collectively define a planar region.
 * * A point is "in" the composite region if it is "in" an odd number of the loops.
 */
class ParityRegion extends CurveCollection {
    isSameGeometryClass(other) { return other instanceof ParityRegion; }
    get children() { return this._children; }
    constructor() { super(); this._children = []; }
    static create(...data) {
        const result = new ParityRegion();
        for (const child of data) {
            result.children.push(child);
        }
        return result;
    }
    dgnBoundaryType() { return 4; }
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceParityRegion(this, indexInParent);
    }
    clone() {
        const clone = new ParityRegion();
        let child;
        for (child of this.children) {
            const childClone = child.clone();
            if (childClone instanceof Loop)
                clone.children.push(childClone);
        }
        return clone;
    }
    cloneStroked(options) {
        const clone = new ParityRegion();
        let child;
        for (child of this.children) {
            const childStrokes = child.cloneStroked(options);
            if (childStrokes)
                clone.children.push(childStrokes);
        }
        return clone;
    }
    cloneEmptyPeer() { return new ParityRegion(); }
    tryAddChild(child) {
        if (child instanceof Loop) {
            this._children.push(child);
            return true;
        }
        return false;
    }
    getChild(i) {
        if (i < this._children.length)
            return this._children[i];
        return undefined;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleParityRegion(this);
    }
}
exports.ParityRegion = ParityRegion;
/**
 * * A `UnionRegion` is a collection of other planar region types -- `Loop` and `ParityRegion`.
 * * The composite is the union of the contained regions.
 * * A point is "in" the composite if it is "in" one or more of the contained regions.
 */
class UnionRegion extends CurveCollection {
    isSameGeometryClass(other) { return other instanceof UnionRegion; }
    get children() { return this._children; }
    constructor() { super(); this._children = []; }
    static create(...data) {
        const result = new UnionRegion();
        for (const child of data) {
            result.tryAddChild(child);
        }
        return result;
    }
    dgnBoundaryType() { return 5; }
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceUnionRegion(this, indexInParent);
    }
    cloneStroked(options) {
        const clone = new UnionRegion();
        let child;
        for (child of this._children) {
            const childStrokes = child.cloneStroked(options);
            if (childStrokes)
                clone.children.push(childStrokes);
        }
        return clone;
    }
    cloneEmptyPeer() { return new UnionRegion(); }
    tryAddChild(child) {
        if (child instanceof ParityRegion || child instanceof Loop) {
            this._children.push(child);
            return true;
        }
        return false;
    }
    getChild(i) {
        if (i < this._children.length)
            return this._children[i];
        return undefined;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleUnionRegion(this);
    }
}
exports.UnionRegion = UnionRegion;
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
//# sourceMappingURL=CurveChain.js.map