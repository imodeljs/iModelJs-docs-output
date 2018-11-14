import { GeometryQuery } from "./GeometryQuery";
import { CurveLocationDetail } from "./CurveLocationDetail";
import { Matrix4d } from "../geometry4d/Matrix4d";
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
    /**
     * Return xy intersections of 2 curves.
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static IntersectionXY(geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair;
    /**
     * Return xy intersections of 2 projected curves
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static IntersectionProjectedXY(worldToLocal: Matrix4d, geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair;
}
//# sourceMappingURL=CurveCurveIntersectXY.d.ts.map