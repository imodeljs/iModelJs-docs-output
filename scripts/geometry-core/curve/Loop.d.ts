/** @module Curve */
import { StrokeOptions } from "./StrokeOptions";
import { CurvePrimitive } from "./CurvePrimitive";
import { GeometryQuery } from "./GeometryQuery";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { RecursiveCurveProcessor } from "./CurveProcessor";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { CurveChain } from "./CurveCollection";
import { AnyCurve } from "./CurveChain";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
/**
 * A `Loop` is a curve chain that is the boundary of a closed (planar) loop.
 * @public
 */
export declare class Loop extends CurveChain {
    /** String name for schema properties */
    readonly curveCollectionType = "loop";
    /** tag value that can be set to true for user code to mark inner and outer loops. */
    isInner: boolean;
    /** test if `other` is a `Loop` */
    isSameGeometryClass(other: GeometryQuery): boolean;
    /** Test if `other` is an instance of `Loop` */
    constructor();
    /**
     * Create a loop from variable length list of CurvePrimitives
     * @param curves array of individual curve primitives
     */
    static create(...curves: CurvePrimitive[]): Loop;
    /**
     * Create a loop from an array of curve primitives
     * @param curves array of individual curve primitives
     */
    static createArray(curves: CurvePrimitive[]): Loop;
    /** Create a loop from an array of points */
    static createPolygon(points: GrowableXYZArray | Point3d[]): Loop;
    /** Create a loop with the stroked form of this loop. */
    cloneStroked(options?: StrokeOptions): AnyCurve;
    /** Return the boundary type (2) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType(): number;
    /** invoke `processor.announceLoop(this, indexInParent)` */
    announceToCurveProcessor(processor: RecursiveCurveProcessor, indexInParent?: number): void;
    /** Create a new `Loop` with no children */
    cloneEmptyPeer(): Loop;
    /** Second step of double dispatch:  call `handler.handleLoop(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=Loop.d.ts.map