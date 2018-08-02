/** @module Curve */
import { GeometryQuery } from "./CurvePrimitive";
import { CurveLocationDetail } from "./CurvePrimitive";
/**
 * Data bundle for a pair of arrays of CurveLocationDetail structures such as produced by CurveCurve,IntersectXY and
 * CurveCurve.ClosestApproach
 */
export declare class CurveLocationDetailArrayPair {
    dataA: CurveLocationDetail[];
    dataB: CurveLocationDetail[];
    constructor();
}
export declare class CurveCurve {
    static IntersectionXY(geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair;
}
