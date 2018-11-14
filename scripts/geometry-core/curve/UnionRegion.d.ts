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
//# sourceMappingURL=UnionRegion.d.ts.map