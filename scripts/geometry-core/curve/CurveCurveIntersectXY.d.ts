/** @module Curve */
import { NullGeometryHandler } from "../geometry3d/GeometryHandler";
import { GeometryQuery } from "./GeometryQuery";
import { CurveLocationDetail, CurveLocationDetailPair } from "./CurveLocationDetail";
import { LineSegment3d } from "./LineSegment3d";
import { LineString3d } from "./LineString3d";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { Arc3d } from "./Arc3d";
import { BSplineCurve3d } from "../bspline/BSplineCurve";
import { BSplineCurve3dH } from "../bspline/BSplineCurve3dH";
/**
 * Data bundle for a pair of arrays of CurveLocationDetail structures such as produced by CurveCurve,IntersectXY and
 * CurveCurve.ClosestApproach
 * @public
 */
export declare class CurveLocationDetailArrayPair {
    /** first array of details ... */
    dataA: CurveLocationDetail[];
    /** second array of details ... */
    dataB: CurveLocationDetail[];
    constructor();
}
/**
 * * Instances are initialized and called from CurveCurve.
 * * Constructor is told two geometry items A and B
 *   * geometryB is saved for later reference
 *   * type-specific handler methods will "see" geometry A repeatedly.
 *   * Hence geometryA is NOT saved by the constructor.
 * @internal
 */
export declare class CurveCurveIntersectXY extends NullGeometryHandler {
    private _extendA;
    private _geometryB;
    private _extendB;
    private _results;
    private _worldToLocalPerspective;
    private _worldToLocalAffine;
    private reinitialize;
    /**
     * @param worldToLocal optional transform (possibly perspective) to project to xy plane for intersection.
     * @param _geometryA first curve for intersection.  This is NOT saved.
     * @param extendA flag to enable using extension of geometryA.
     * @param geometryB second curve for intersection.  Saved for reference by specific handler methods.
     * @param extendB flag for extension of geometryB.
     */
    constructor(worldToLocal: Matrix4d | undefined, _geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean);
    /** Reset the geometry flags, leaving all other parts unchanged (and preserving accumulated intersections) */
    resetGeometry(_geometryA: GeometryQuery, extendA: boolean, geometryB: GeometryQuery, extendB: boolean): void;
    /**
     * * Return the results structure for the intersection calculation, structured as two separate arrays of CurveLocationDetail.
     * @deprecated use `CurveCurveIntersectXY.grabPairedResults` instead of `CurveCurveIntersectXY.grabResults`
     * @param reinitialize if true, a new results structure is created for use by later calls.
     *
     */
    grabResults(reinitialize?: boolean): CurveLocationDetailArrayPair;
    private static _workVector2dA;
    private acceptFraction;
    /**
     * * Return the results structure for the intersection calculation, structured as an array of CurveLocationDetailPair
     * @param reinitialize if true, a new results structure is created for use by later calls.
     *
     */
    grabPairedResults(reinitialize?: boolean): CurveLocationDetailPair[];
    /** compute intersection of two line segments.
     * filter by extension rules.
     * record with fraction mapping.
     */
    private recordPointWithLocalFractions;
    /** compute intersection of two line segments.
     * filter by extension rules.
     * record with fraction mapping.
     */
    private computeSegmentSegment3D;
    private static _workPointA0H;
    private static _workPointA1H;
    private static _workPointB0H;
    private static _workPointB1H;
    private computeSegmentSegment3DH;
    private dispatchSegmentSegment;
    private dispatchSegmentArc;
    private dispatchArcArcThisOrder;
    private dispatchArcArc;
    private dispatchArcBsplineCurve3d;
    /** apply the transformation to bezier curves. optionally construct ranges.
     *
     */
    private transformBeziers;
    private getRanges;
    private _xyzwA0?;
    private _xyzwA1?;
    private _xyzwPlane?;
    private _xyzwB?;
    private dispatchBezierBezierStrokeFirst;
    private dispatchBSplineCurve3dBSplineCurve3d;
    /**
     * Apply the projection transform (if any) to (xyz, w)
     * @param xyz xyz parts of input point.
     * @param w   weight to use for homogeneous effects
     */
    private projectPoint;
    private mapNPCPlaneToWorld;
    private dispatchSegmentBsplineCurve;
    private static _workPointAA0;
    private static _workPointAA1;
    private static _workPointBB0;
    private static _workPointBB1;
    /** low level dispatch of linestring with (beziers of) a bspline curve */
    dispatchLineStringBSplineCurve(lsA: LineString3d, extendA: boolean, curveB: BSplineCurve3d, extendB: boolean, reversed: boolean): any;
    /** Detail computation for segment intersecting linestring. */
    computeSegmentLineString(lsA: LineSegment3d, extendA: boolean, lsB: LineString3d, extendB: boolean, reversed: boolean): any;
    /** Detail computation for arcA intersecting lsB. */
    computeArcLineString(arcA: Arc3d, extendA: boolean, lsB: LineString3d, extendB: boolean, reversed: boolean): any;
    private static _workPointA0;
    private static _workPointA1;
    private static _workPointB0;
    private static _workPointB1;
    private static setTransformedWorkPoints;
    /** double dispatch handler for strongly typed segment.. */
    handleLineSegment3d(segmentA: LineSegment3d): any;
    /** double dispatch handler for strongly typed linestring.. */
    handleLineString3d(lsA: LineString3d): any;
    /** double dispatch handler for strongly typed arc .. */
    handleArc3d(arc0: Arc3d): any;
    /** double dispatch handler for strongly typed bspline curve .. */
    handleBSplineCurve3d(curve: BSplineCurve3d): any;
    /** double dispatch handler for strongly typed homogeneous bspline curve .. */
    handleBSplineCurve3dH(_curve: BSplineCurve3dH): any;
}
//# sourceMappingURL=CurveCurveIntersectXY.d.ts.map