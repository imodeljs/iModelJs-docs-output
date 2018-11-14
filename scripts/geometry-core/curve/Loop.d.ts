import { StrokeOptions } from "./StrokeOptions";
import { CurvePrimitive } from "./CurvePrimitive";
import { GeometryQuery } from "./GeometryQuery";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { RecursiveCurveProcessor } from "./CurveProcessor";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { CurveChain } from "./CurveCollection";
import { AnyCurve } from "./CurveChain";
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
//# sourceMappingURL=Loop.d.ts.map