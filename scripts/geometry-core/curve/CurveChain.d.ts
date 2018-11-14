/** @module Curve */
import { CurvePrimitive } from "./CurvePrimitive";
import { CurveCollection } from "./CurveCollection";
import { Path } from "./Path";
import { Loop } from "./Loop";
import { ParityRegion } from "./ParityRegion";
import { BagOfCurves } from "./CurveCollection";
import { UnionRegion } from "./UnionRegion";
export declare type AnyCurve = CurvePrimitive | Path | Loop | ParityRegion | UnionRegion | BagOfCurves | CurveCollection;
export declare type AnyRegion = Loop | ParityRegion | UnionRegion;
//# sourceMappingURL=CurveChain.d.ts.map