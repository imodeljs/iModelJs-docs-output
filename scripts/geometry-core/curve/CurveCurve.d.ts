import { GeometryQuery } from "./GeometryQuery";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { CurveLocationDetailArrayPair } from "./CurveCurveIntersectXY";
import { CurveLocationDetailPair } from "./CurveLocationDetail";
/** @module Curve */
/**
 * `CurveCurve` has static method for various computations that work on a pair of curves or curve collections.
 * @public
 */
export declare class CurveCurve {
    /**
     * Return xy intersections of 2 curves.
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     * @deprecated Use CurveCurve.intersectionXYPairs (..) to get results in preferred directly paired form.
     */
    static intersectionXY(geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair;
    /**
     * Return xy intersections of 2 curves.
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static intersectionXYPairs(geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailPair[];
    /**
     * Return xy intersections of 2 projected curves
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static intersectionProjectedXY(worldToLocal: Matrix4d, geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair;
    /**
     * Return full 3d xyz intersections of 2 curves.
     *  * Implemented for combinations of LineSegment3d, LineString3d, Arc3d.
     *  * Not Implemented for bspline and bezier curves.
     * @beta
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static intersectionXYZ(geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): CurveLocationDetailArrayPair;
}
//# sourceMappingURL=CurveCurve.d.ts.map