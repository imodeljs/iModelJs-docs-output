/** @module Curve */
import { StrokeOptions } from "./StrokeOptions";
import { CurvePrimitive } from "./CurvePrimitive";
import { GeometryQuery } from "./GeometryQuery";
import { RecursiveCurveProcessor } from "./CurveProcessor";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { AnyCurve } from "./CurveChain";
import { CurveChain } from "./CurveCollection";
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
//# sourceMappingURL=Path.d.ts.map