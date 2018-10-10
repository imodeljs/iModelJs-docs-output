import { StrokeOptions } from "../curve/StrokeOptions";
import { CurvePrimitive, GeometryQuery } from "./CurvePrimitive";
import { Point3d } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { RecursiveCurveProcessor } from "./CurveProcessor";
import { GrowableXYZArray } from "../GrowableArray";
import { GeometryHandler } from "../GeometryHandler";
export declare type AnyCurve = CurvePrimitive | Path | Loop | ParityRegion | UnionRegion | BagOfCurves | CurveCollection;
export declare type AnyRegion = Loop | ParityRegion | UnionRegion;
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
    /** Construct a CurveCollection with the same structure as collectionA and collectionB, with primitives constructed by the caller-supplied primitiveMutator function.
     * @returns Returns undefined if there is any type mismatch between the two collections.
     */
    static mutatePartners(collectionA: CurveCollection, collectionB: CurveCollection, primitiveMutator: (primitiveA: CurvePrimitive, primitiveB: CurvePrimitive) => CurvePrimitive | undefined): CurveCollection | undefined;
}
/** Shared base class for use by both open and closed paths.
 * A curveChain contains curvePrimitives.
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
}
/**
 * * A `Path` object is a collection of curves that join head-to-tail to form a path.
 * * A `Path` object does not bound a planar region.
 */
export declare class Path extends CurveChain {
    isSameGeometryClass(other: GeometryQuery): boolean;
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    constructor();
    /**
     * Create a path from a variable length list of curve primtiives
     * @param curves variable length list of individual curve primitives
     */
    static create(...curves: CurvePrimitive[]): Path;
    /**
     * Create a path from a an array of curve primtiives
     * @param curves array of individual curve primitives
     */
    static createArray(curves: CurvePrimitive[]): Path;
    cloneStroked(options?: StrokeOptions): AnyCurve;
    dgnBoundaryType(): number;
    cyclicCurvePrimitive(index: number): CurvePrimitive | undefined;
    cloneEmptyPeer(): Path;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
/**
 * A `Loop` is a curve chain that is the boundary of a closed (planar) loop.
 */
export declare class Loop extends CurveChain {
    isInner: boolean;
    isSameGeometryClass(other: GeometryQuery): boolean;
    constructor();
    /**
     * Create a loop from variable length list of CurvePrimtives
     * @param curves array of individual curve primitives
     */
    static create(...curves: CurvePrimitive[]): Loop;
    /**
     * Create a loop from an array of curve primtiives
     * @param curves array of individual curve primitives
     */
    static createArray(curves: CurvePrimitive[]): Loop;
    static createPolygon(points: Point3d[]): Loop;
    cloneStroked(options?: StrokeOptions): AnyCurve;
    dgnBoundaryType(): number;
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    cyclicCurvePrimitive(index: number): CurvePrimitive | undefined;
    cloneEmptyPeer(): Loop;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
/**
 * * A `ParityRegion` is a collection of `Loop` objects.
 * * The loops collectively define a planar region.
 * * A point is "in" the composite region if it is "in" an odd number of the loops.
 */
export declare class ParityRegion extends CurveCollection {
    isSameGeometryClass(other: GeometryQuery): boolean;
    protected _children: Loop[];
    readonly children: Loop[];
    constructor();
    static create(...data: Loop[]): ParityRegion;
    dgnBoundaryType(): number;
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    clone(): ParityRegion;
    cloneStroked(options?: StrokeOptions): ParityRegion;
    cloneEmptyPeer(): ParityRegion;
    tryAddChild(child: AnyCurve): boolean;
    getChild(i: number): Loop | undefined;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
/**
 * * A `UnionRegion` is a collection of other planar region types -- `Loop` and `ParityRegion`.
 * * The composite is the union of the contained regions.
 * * A point is "in" the composite if it is "in" one or more of the contained regions.
 */
export declare class UnionRegion extends CurveCollection {
    isSameGeometryClass(other: GeometryQuery): boolean;
    protected _children: Array<ParityRegion | Loop>;
    readonly children: Array<ParityRegion | Loop>;
    constructor();
    static create(...data: Array<ParityRegion | Loop>): UnionRegion;
    dgnBoundaryType(): number;
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    cloneStroked(options?: StrokeOptions): UnionRegion;
    cloneEmptyPeer(): UnionRegion;
    tryAddChild(child: AnyCurve): boolean;
    getChild(i: number): Loop | ParityRegion | undefined;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
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
//# sourceMappingURL=CurveChain.d.ts.map