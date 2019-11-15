/** @module Curve */
import { NullGeometryHandler } from "../geometry3d/GeometryHandler";
import { GeometryQuery } from "./GeometryQuery";
import { LineSegment3d } from "./LineSegment3d";
import { LineString3d } from "./LineString3d";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Arc3d } from "./Arc3d";
import { BSplineCurve3d } from "../bspline/BSplineCurve";
import { BSplineCurve3dH } from "../bspline/BSplineCurve3dH";
import { CurveLocationDetailArrayPair } from "./CurveCurveIntersectXY";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
/**
 * * Handler class for XYZ intersections.
 * * Instances are initialized and called from CurveCurve.
 * * Constructor is told two geometry items A and B
 *   * geometryB is saved for later reference
 *   * type-specific handler methods will "see" geometry A repeatedly.
 *   * Hence geometryA is NOT saved by the constructor.
 * @internal
 */
export declare class CurveCurveIntersectXYZ extends NullGeometryHandler {
    private _extendA;
    private _geometryB;
    private _extendB;
    private _results;
    private reinitialize;
    /**
     *
     * @param _geometryA first curve for intersection.  This is NOT saved.
     * @param extendA flag to enable using extension of geometryA.
     * @param geometryB second curve for intersection.  Saved for reference by specific handler methods.
     * @param extendB flag for extension of geometryB.
     */
    constructor(_geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean);
    /**
     * * Return the results structure for the intersection calculation.
     * @param reinitialize if true, a new results structure is created for use by later calls.
     *
     */
    grabResults(reinitialize?: boolean): CurveLocationDetailArrayPair;
    private static _workVector2dA;
    private acceptFraction;
    /** compute intersection of two line segments.
     * filter by extension rules.
     * reject if evaluated points do not match coordinates (e.g. close approach point)
     * record with fraction mapping.
     */
    private recordPointWithLocalFractions;
    /** compute intersection of two line segments.
     * filter by extension rules.
     * record with fraction mapping.
     */
    private computeSegmentSegment3D;
    private dispatchSegmentSegment;
    /**
     * Create a plane whose normal is a "better" cross product as a choice of `vectorA cross vectorB` or `vectorA cross vectorC`
     * * The heuristic for "better" is:
     *   * first choice is cross product with `vectorB`.  Use it if the cosine of the angel from vectorA to vectorB is less than cosineValue.
     *   * otherwise use vectorC
     * @param origin plane origin
     * @param vectorA vector which must be in the plane.
     * @param cosineValue typically cosine of something near 90 degrees.
     * @param vectorB first candidate for additional in-plane vector
     * @param vectorC second candidate for additional in-plane vector
     */
    createPlaneWithPreferredPerpendicular(origin: Point3d, vectorA: Vector3d, cosineValue: number, vectorB: Vector3d, vectorC: Vector3d): Plane3dByOriginAndUnitNormal | undefined;
    private dispatchSegmentArc;
    private dispatchArcArcInPlane;
    private dispatchArcArc;
    private dispatchArcBsplineCurve3d;
    private dispatchBSplineCurve3dBSplineCurve3d;
    /**
     * Apply the projection transform (if any) to (xyz, w)
     * @param xyz xyz parts of input point.
     * @param w   weight to use for homogeneous effects
     */
    private dispatchSegmentBsplineCurve;
    private static _workPointAA0;
    private static _workPointAA1;
    private static _workPointBB0;
    private static _workPointBB1;
    /** low lever bspline curve -- STUB  .. */
    dispatchLineStringBSplineCurve(_lsA: LineString3d, _extendA: boolean, _curveB: BSplineCurve3d, _extendB: boolean, _reversed: boolean): any;
    /** low lever segment intersect linestring .. */
    computeSegmentLineString(lsA: LineSegment3d, extendA: boolean, lsB: LineString3d, extendB: boolean, reversed: boolean): any;
    /** low lever arc intersect linestring .. */
    computeArcLineString(arcA: Arc3d, extendA: boolean, lsB: LineString3d, extendB: boolean, reversed: boolean): any;
    /** double dispatch handler for strongly typed segment.. */
    handleLineSegment3d(segmentA: LineSegment3d): any;
    /** double dispatch handler for strongly typed linestring .. */
    handleLineString3d(lsA: LineString3d): any;
    /** double dispatch handler for strongly typed arc .. */
    handleArc3d(arc0: Arc3d): any;
    /** double dispatch handler for strongly typed bspline curve.. */
    handleBSplineCurve3d(curve: BSplineCurve3d): any;
    /** double dispatch handler for strongly typed homogeneous bspline curve. */
    handleBSplineCurve3dH(_curve: BSplineCurve3dH): any;
}
//# sourceMappingURL=CurveCurveIntersectXYZ.d.ts.map