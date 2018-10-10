/** @module Solid */
import { CurveCollection } from "../curve/CurveChain";
import { GeometryQuery } from "../curve/CurvePrimitive";
import { Transform } from "../Transform";
/**
 * Base class for SolidPrimitve variants.
 *
 * * Base class holds capped flag for all derived classes.
 */
export declare abstract class SolidPrimitive extends GeometryQuery {
    protected _capped: boolean;
    protected constructor(capped: boolean);
    /** Ask if this is a capped solid */
    /** Set the capped flag */
    capped: boolean;
    /** Return a cross section at specified vFraction */
    abstract constantVSection(_vFraction: number): CurveCollection | undefined;
    /** Return a Transform from the local system of the solid to world.
     * * The particulars of origin and orientation are specific to each SolidPrimitive type.
     */
    abstract getConstructiveFrame(): Transform | undefined;
}
//# sourceMappingURL=SolidPrimitive.d.ts.map