import { ConsolidateAdjacentCurvePrimitivesOptions, CurveChain } from "../CurveCollection";
import { NullGeometryHandler } from "../../geometry3d/GeometryHandler";
import { Loop } from "../Loop";
import { Path } from "../Path";
/** @module Curve */
/**
 * * Implementation class for ConsolidateAdjacentCurvePrimitives.
 *
 * @internal
 */
export declare class ConsolidateAdjacentCurvePrimitivesContext extends NullGeometryHandler {
    private _options;
    constructor(options?: ConsolidateAdjacentCurvePrimitivesOptions);
    /** look for adjacent compatible primitives in a path or loop. */
    handleCurveChain(g: CurveChain): void;
    handlePath(g: Path): any;
    handleLoop(g: Loop): any;
}
//# sourceMappingURL=ConsolidateAdjacentPrimitivesContext.d.ts.map