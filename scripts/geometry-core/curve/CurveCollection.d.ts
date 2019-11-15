/** @module Curve */
import { StrokeOptions } from "./StrokeOptions";
import { GeometryQuery } from "./GeometryQuery";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { RecursiveCurveProcessor } from "./CurveProcessor";
import { AnyCurve } from "./CurveChain";
import { CurvePrimitive } from "./CurvePrimitive";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { CurveLocationDetail } from "./CurveLocationDetail";
/** Describes the concrete type of a [[CurveCollection]]. Each type name maps to a specific subclass and can be used in conditional statements for type-switching.
 *    - "loop" => [[Loop]]
 *    - "path" => [[Path]]
 *    - "unionRegion" => [[UnionRegion]]
 *    - "parityRegion" => [[ParityRegion]]
 *    - "bagOfCurves" => [[BagOfCurves]]
 * @public
 */
export declare type CurveCollectionType = "loop" | "path" | "unionRegion" | "parityRegion" | "bagOfCurves";
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
export declare abstract class CurveCollection extends GeometryQuery {
    /** String name for schema properties */
    readonly geometryCategory = "curveCollection";
    /** Type discriminator. */
    abstract readonly curveCollectionType: CurveCollectionType;
    /**  Flag for inner loop status. Only used by `Loop`. */
    isInner: boolean;
    /** Return the sum of the lengths of all contained curves. */
    sumLengths(): number;
    /** return the max gap between adjacent primitives in Path and Loop collections.
     *
     * * In a Path, gaps are computed between consecutive primitives.
     * * In a Loop, gaps are computed between consecutive primitives and between last and first.
     * * gaps are NOT computed between consecutive CurvePrimitives in "unstructured" collections.  The type is "unstructured" so gaps should not be semantically meaningful.
     */
    maxGap(): number;
    /** return true if the curve collection has any primitives other than LineSegment3d and LineString3d  */
    checkForNonLinearPrimitives(): boolean;
    /** Apply transform recursively to children */
    tryTransformInPlace(transform: Transform): boolean;
    /** Return a deep copy. */
    clone(): CurveCollection | undefined;
    /** Create a deep copy of transformed curves. */
    cloneTransformed(transform: Transform): CurveCollection | undefined;
    /** Create a deep copy with all linestrings expanded to multiple LineSegment3d. */
    cloneWithExpandedLineStrings(): CurveCollection | undefined;
    /** Recurse through children to collect CurvePrimitive's in flat array. */
    private collectCurvePrimitivesGo;
    /**
     * Return an array containing only the curve primitives.
     * * These are leaf nodes
     * * If there is a CurveChainWithDistanceIndex, that primitive stands as a leaf. (NOT its constituent curves)
     */
    collectCurvePrimitives(): CurvePrimitive[];
    /** Return true for planar region types:
     * * `Loop`
     * * `ParityRegion`
     * * `UnionRegion`
     */
    readonly isAnyRegionType: boolean;
    /** Return true for a `Path`, i.e. a chain of curves joined head-to-tail
     */
    readonly isOpenPath: boolean;
    /** Return true for a single-loop planar region type, i.e. `Loop`.
     * * This is _not- a test for physical closure of a `Path`
     */
    readonly isClosedPath: boolean;
    /** Return a CurveCollection with the same structure but all curves replaced by strokes. */
    abstract cloneStroked(options?: StrokeOptions): AnyCurve;
    /** Support method for ICurvePrimitive ... one line call to specific announce method . . */
    abstract announceToCurveProcessor(processor: RecursiveCurveProcessor): void;
    /** clone an empty collection. */
    abstract cloneEmptyPeer(): CurveCollection;
    /** Return the boundary type of a corresponding  MicroStation CurveVector.
     * * Derived class must implement.
     */
    abstract dgnBoundaryType(): number;
    /**
     * Try to add a child.
     * @param child child to add.
     * @return true if child is an acceptable type for this collection.
     */
    abstract tryAddChild(child: AnyCurve | undefined): boolean;
    /** Return a child identified by by index */
    abstract getChild(i: number): AnyCurve | undefined;
    /** Extend (increase) `rangeToExtend` as needed to include these curves (optionally transformed) */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /**
     * * Find any curve primitive in the source.
     * * Evaluate it at a fraction (which by default is an interior fraction)
     * @param source containing `CurvePrimitive` or `CurveCollection`
     * @param fraction fraction to use in `curve.fractionToPoint(fraction)`
     */
    static createCurveLocationDetailOnAnyCurvePrimitive(source: GeometryQuery | undefined, fraction?: number): CurveLocationDetail | undefined;
}
/** Shared base class for use by both open and closed paths.
 * * A `CurveChain` contains only curvePrimitives.  No other paths, loops, or regions allowed.
 * * A single entry in the chain can in fact contain multiple curve primitives if the entry itself is (for instance) `CurveChainWithDistanceIndex`
 *   which presents itself (through method interface) as a CurvePrimitive with well defined mappings from fraction to xyz, but in fact does all the
 *    calculations over multiple primitives.
 * * The specific derived classes are `Path` and `Loop`
 * * `CurveChain` is an intermediate class.   It is not instantiable on its own.
 * @public
 */
export declare abstract class CurveChain extends CurveCollection {
    /** The curve primitives in the chain. */
    protected _curves: CurvePrimitive[];
    protected constructor();
    /** Return the array of `CurvePrimitive` */
    readonly children: CurvePrimitive[];
    /**
     * Return curve primitive by index, interpreted cyclically for both Loop and Path
     * @param index index to array
     */
    /**
     * Return the `[index]` curve primitive, using `modulo` to map`index` to the cyclic indexing.
     * * In particular, `-1` is the final curve.
     * @param index cyclic index
     */
    cyclicCurvePrimitive(index: number): CurvePrimitive | undefined;
    /** Stroke the chain into a simple xyz array.
     * @param options tolerance parameters controlling the stroking.
     */
    getPackedStrokes(options?: StrokeOptions): GrowableXYZArray | undefined;
    /** Return a structural clone, with CurvePrimitive objects stroked. */
    cloneStroked(options?: StrokeOptions): AnyCurve;
    /** add a child curve.
     * * Returns false if the given child is not a CurvePrimitive.
     */
    tryAddChild(child: AnyCurve | undefined): boolean;
    /** Return a child by index */
    getChild(i: number): CurvePrimitive | undefined;
    /** invoke `curve.extendRange(range, transform)` for each child  */
    extendRange(range: Range3d, transform?: Transform): void;
    /**
     * Reverse each child curve (in place)
     * Reverse the order of the children in the CurveChain array.
     */
    reverseChildrenInPlace(): void;
}
/**
 * * A `BagOfCurves` object is a collection of `AnyCurve` objects.
 * * A `BagOfCurves` has no implied properties such as being planar.
 * @public
 */
export declare class BagOfCurves extends CurveCollection {
    /** String name for schema properties */
    readonly curveCollectionType = "bagOfCurves";
    /** test if `other` is an instance of `BagOfCurves` */
    isSameGeometryClass(other: GeometryQuery): boolean;
    /** Array of children.
     * * No restrictions on type.
     */
    protected _children: AnyCurve[];
    /** Construct an empty `BagOfCurves` */
    constructor();
    /** Return the (reference to) array of children */
    readonly children: AnyCurve[];
    /** create with given curves. */
    static create(...data: AnyCurve[]): BagOfCurves;
    /** Return the boundary type (0) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType(): number;
    /** invoke `processor.announceBagOfCurves(this, indexInParent);` */
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    /** Clone all children in stroked form. */
    cloneStroked(options?: StrokeOptions): BagOfCurves;
    /** Return an empty `BagOfCurves` */
    cloneEmptyPeer(): BagOfCurves;
    /** Add a child  */
    tryAddChild(child: AnyCurve | undefined): boolean;
    /** Get a child by index */
    getChild(i: number): AnyCurve | undefined;
    /** Second step of double dispatch:  call `handler.handleBagOfCurves(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
/**
 * * Options to control method `RegionOps.consolidateAdjacentPrimitives`
 * @public
 */
export declare class ConsolidateAdjacentCurvePrimitivesOptions {
    /** True to consolidated linear geometry   (e.g. separate LineSegment3d and LineString3d) into LineString3d */
    consolidateLinearGeometry: boolean;
    /** True to consolidate contiguous arcs */
    consolidateCompatibleArcs: boolean;
    /** Tolerance for collapsing identical points */
    duplicatePointTolerance: number;
    /** Tolerance for removing interior colinear points. */
    colinearPointTolerance: number;
}
//# sourceMappingURL=CurveCollection.d.ts.map