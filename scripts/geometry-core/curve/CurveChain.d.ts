/** @module Curve */
import { CurvePrimitive } from "./CurvePrimitive";
import { CurveCollection } from "./CurveCollection";
import { Loop } from "./Loop";
import { ParityRegion } from "./ParityRegion";
import { UnionRegion } from "./UnionRegion";
/** Union type for `GeometryQuery` classes that have contain curves, either as individual parameter space or as collections
 * @public
 */
export declare type AnyCurve = CurvePrimitive | CurveCollection;
/** Union type for `GeometryQuery` classes that bound (planar) regions.
 * @public
 */
export declare type AnyRegion = Loop | ParityRegion | UnionRegion;
//# sourceMappingURL=CurveChain.d.ts.map