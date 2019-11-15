/** @module Curve */
import { StrokeOptions } from "./StrokeOptions";
import { GeometryQuery } from "./GeometryQuery";
import { RecursiveCurveProcessor } from "./CurveProcessor";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { CurveCollection } from "./CurveCollection";
import { Loop } from "./Loop";
import { AnyCurve } from "./CurveChain";
/**
 * * A `ParityRegion` is a collection of `Loop` objects.
 * * The loops collectively define a planar region.
 * * A point is "in" the composite region if it is "in" an odd number of the loops.
 * @public
 */
export declare class ParityRegion extends CurveCollection {
    /** String name for schema properties */
    readonly curveCollectionType = "parityRegion";
    /** Test if `other` is an instance of `ParityRegion` */
    isSameGeometryClass(other: GeometryQuery): boolean;
    /** Array of loops in this parity region. */
    protected _children: Loop[];
    /** Return the array of loops in this parity region. */
    readonly children: Loop[];
    /** Construct parity region with empty loop array */
    constructor();
    /**
     * Add loops (recursively) to this region's children
     */
    addLoops(data?: Loop | Loop[] | Loop[][]): void;
    /** Return a single loop or parity region with given loops.
     * * The returned structure CAPTURES the loops.
     * * The loops are NOT reorganized by hole analysis.
     */
    static createLoops(data?: Loop | Loop[] | Loop[][]): Loop | ParityRegion;
    /** Create a parity region with given loops */
    static create(...data: Loop[]): ParityRegion;
    /** Return the boundary type (4) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType(): number;
    /** invoke `processor.announceParityRegion(this, indexInParent)` */
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    /** Return a deep copy. */
    clone(): ParityRegion;
    /** Stroke these curves into a new ParityRegion. */
    cloneStroked(options?: StrokeOptions): ParityRegion;
    /** Create a new empty parity region. */
    cloneEmptyPeer(): ParityRegion;
    /** Add `child` to this parity region.
     * * any child type other than `Loop` is ignored.
     */
    tryAddChild(child: AnyCurve | undefined): boolean;
    /** Get child `i` by index. */
    getChild(i: number): Loop | undefined;
    /** Second step of double dispatch:  call `handler.handleRegion(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=ParityRegion.d.ts.map