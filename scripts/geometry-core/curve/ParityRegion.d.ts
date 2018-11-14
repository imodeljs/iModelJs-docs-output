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
//# sourceMappingURL=ParityRegion.d.ts.map