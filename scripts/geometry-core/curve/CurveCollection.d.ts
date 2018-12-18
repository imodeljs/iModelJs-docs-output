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
/**
 * * A `CurveCollection` is an abstract (non-instantiable) class for various sets of curves with particular structures:
 * * * `Path` - a sequence of `CurvePrimitive` joining head-to-tail (but not required to close, and not enclosing a planar area)
 * * * `Loop` - a sequence of coplanar `CurvePrimitive` joining head-to-tail, and closing from last to first so that they enclose a planar area.
 * * * `ParityRegion` -- a colletion of coplanar `Loop`s, with "in/out" classification by parity rules
 * * * `UnionRegion` -- a colletion of coplanar `Loop`s, with "in/out" classification by union rules
 * * * `BagOfCurves` -- a collection of `AnyCurve` with no implied structure.
 */
export declare abstract class CurveCollection extends GeometryQuery {
    isInner: boolean;
    /** Return the sum of the lengths of all contained curves. */
    sumLengths(): number;
    /** return the max gap between adjacent primitives in Path and Loop collctions.
     *
     * * In a Path, gaps are computed between consecutive primitives.
     * * In a Loop, gaps are comptued between consecutvie primtives and between last and first.
     * * gaps are NOT computed between consecutive CurvePrimitives in "unstructured" collections.  The type is "unstructured" so gaps should not be semantically meaningful.
     */
    maxGap(): number;
    /** return true if the curve collection has any primitives other than LineSegment3d and LineString3d  */
    checkForNonLinearPrimitives(): boolean;
    tryTransformInPlace(transform: Transform): boolean;
    clone(): CurveCollection | undefined;
    cloneTransformed(transform: Transform): CurveCollection | undefined;
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
    /** Support method for ICurvePrimtive ... one line call to specific announce method . . */
    abstract announceToCurveProcessor(processor: RecursiveCurveProcessor): void;
    /** clone an empty collection. */
    abstract cloneEmptyPeer(): CurveCollection;
    abstract dgnBoundaryType(): number;
    /**
     * Try to add a child.
     * @param child child to add.
     * @return true if child is an acceptable type for this collection.
     */
    abstract tryAddChild(child: AnyCurve): boolean;
    abstract getChild(i: number): AnyCurve | undefined;
    /** Extend (increase) `rangeToExtend` as needed to include these curves (optionally transformed)
     */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
/** Shared base class for use by both open and closed paths.
 * A curveChain contains only curvePrimitives.  No other paths, loops, or regions allowed.
 */
export declare abstract class CurveChain extends CurveCollection {
    protected _curves: CurvePrimitive[];
    protected constructor();
    readonly children: CurvePrimitive[];
    /**
     * Return curve primitive by index, interpreted cyclically if the Chain is a Loop.
     *
     * *  For a path, return undefined for any out-of-bounds index
     * *  For a loop, an out-of-bounds index is mapped cyclically into bounds.
     * @param index index to array
     */
    abstract cyclicCurvePrimitive(index: number): CurvePrimitive | undefined;
    getPackedStrokes(options?: StrokeOptions): GrowableXYZArray | undefined;
    cloneStroked(options?: StrokeOptions): AnyCurve;
    tryAddChild(child: AnyCurve): boolean;
    getChild(i: number): CurvePrimitive | undefined;
    extendRange(range: Range3d, transform?: Transform): void;
    /**
     * Reverse each child curve (in place)
     * Reverse the order of the children in the CurveChain array.
     */
    reverseChildrenInPlace(): void;
}
/**
 * * A `BagOfCurves` object is a collection of `AnyCurve` objects.
 * * A `BagOfCurves` is not a planar region.
 */
export declare class BagOfCurves extends CurveCollection {
    isSameGeometryClass(other: GeometryQuery): boolean;
    protected _children: AnyCurve[];
    constructor();
    readonly children: AnyCurve[];
    static create(...data: AnyCurve[]): BagOfCurves;
    dgnBoundaryType(): number;
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    cloneStroked(options?: StrokeOptions): BagOfCurves;
    cloneEmptyPeer(): BagOfCurves;
    tryAddChild(child: AnyCurve): boolean;
    getChild(i: number): AnyCurve | undefined;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=CurveCollection.d.ts.map