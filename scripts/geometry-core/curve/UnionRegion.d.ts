/** @module Curve */
import { StrokeOptions } from "./StrokeOptions";
import { GeometryQuery } from "./GeometryQuery";
import { RecursiveCurveProcessor } from "./CurveProcessor";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { CurveCollection } from "./CurveCollection";
import { Loop } from "./Loop";
import { ParityRegion } from "./ParityRegion";
import { AnyCurve } from "./CurveChain";
/**
 * * A `UnionRegion` is a collection of other planar region types -- `Loop` and `ParityRegion`.
 * * The composite is the union of the contained regions.
 * * A point is "in" the composite if it is "in" one or more of the contained regions.
 * @public
 */
export declare class UnionRegion extends CurveCollection {
    /** String name for schema properties */
    readonly curveCollectionType = "unionRegion";
    /** test if `other` is a `UnionRegion` */
    isSameGeometryClass(other: GeometryQuery): boolean;
    /** collection of Loop and ParityRegion children. */
    protected _children: Array<ParityRegion | Loop>;
    /** Return the array of regions */
    readonly children: Array<ParityRegion | Loop>;
    /** Constructor -- initialize with no children */
    constructor();
    /** Create a `UnionRegion` with given region children */
    static create(...data: Array<ParityRegion | Loop>): UnionRegion;
    /** Return the boundary type (5) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType(): number;
    /** dispatch to more strongly typed  `processor.announceUnionRegion(this, indexInParent)` */
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    /** Return structural clone with stroked primitives. */
    cloneStroked(options?: StrokeOptions): UnionRegion;
    /** Return new empty `UnionRegion` */
    cloneEmptyPeer(): UnionRegion;
    /** add a child.
     * * Returns false if the `AnyCurve` child is not a region type.
     */
    tryAddChild(child: AnyCurve): boolean;
    /** Return a child identified by index. */
    getChild(i: number): Loop | ParityRegion | undefined;
    /** Second step of double dispatch:  call `handler.handleUnionRegion(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=UnionRegion.d.ts.map