/** @module Curve */
import { StrokeOptions } from "./StrokeOptions";
import { CurvePrimitive } from "./CurvePrimitive";
import { GeometryQuery } from "./GeometryQuery";
import { RecursiveCurveProcessor } from "./CurveProcessor";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { AnyCurve } from "./CurveChain";
import { CurveChain } from "./CurveCollection";
import { Point3d } from "../geometry3d/Point3dVector3d";
/**
 * * A `Path` object is a collection of curves that join head-to-tail to form a path.
 * * A `Path` object does not bound a planar region.  Use `Loop` to indicate region bounding.
 * @public
 */
export declare class Path extends CurveChain {
    /** String name for schema properties */
    readonly curveCollectionType = "path";
    /** Test if `other` is an instance of `Path` */
    isSameGeometryClass(other: GeometryQuery): boolean;
    /** invoke `processor.announcePath(this, indexInParent)` */
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    /** Construct an empty path. */
    constructor();
    /**
     * Create a path from a variable length list of curve primitives
     * * CurvePrimitive params are captured !!!
     * @param curves variable length list of individual curve primitives or point arrays.
     */
    static create(...curves: Array<CurvePrimitive | Point3d[]>): Path;
    /**
     * Create a path from a an array of curve primitives
     * @param curves array of individual curve primitives
     */
    static createArray(curves: CurvePrimitive[]): Path;
    /** Return a deep copy, with leaf-level curve primitives stroked. */
    cloneStroked(options?: StrokeOptions): AnyCurve;
    /** Return the boundary type (1) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType(): number;
    /** Clone as a new `Path` with no primitives */
    cloneEmptyPeer(): Path;
    /** Second step of double dispatch:  call `handler.handlePath(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=Path.d.ts.map