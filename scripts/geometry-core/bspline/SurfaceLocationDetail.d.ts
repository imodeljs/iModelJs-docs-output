/** @module Curve */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { UVSurface } from "../geometry3d/GeometryHandler";
import { Point2d } from "../geometry3d/Point2dVector2d";
import { CurveLocationDetail } from "../curve/CurveLocationDetail";
/**
 * CurveLocationDetail carries point and paramter data about a point evaluated on a curve.
 * * These are returned by a variety of queries.
 * * Particular contents can vary among the queries.
 * @public
 */
export declare class UVSurfaceLocationDetail {
    /** The surface being evaluated */
    surface?: UVSurface;
    /** uv coordinates in the surface */
    uv: Point2d;
    /** The point on the surface */
    point: Point3d;
    /** A context-specific numeric value.  (E.g. a distance) */
    a: number;
    /** Construct with empty data. */
    constructor(surface?: UVSurface, uv?: Point2d, point?: Point3d);
    /**
     * Create a new detail structure.
     * @param surface
     * @param uv coordinates to copy (not capture) into the `detail.uv`
     * @param point coordinates to copy (not capture) into the `detail.point`
     */
    static createSurfaceUVPoint(surface: UVSurface | undefined, uv: Point2d, point: Point3d): UVSurfaceLocationDetail;
}
/**
 * Carrier for both curve and surface data, e.g. from intersection calculations.
 * @public
 */
export declare class CurveAndSurfaceLocationDetail {
    /** detailed location on the curve */
    curveDetail: CurveLocationDetail;
    /** detailed location on the surface */
    surfaceDetail: UVSurfaceLocationDetail;
    /** CAPTURE both details . . */
    constructor(curveDetail: CurveLocationDetail, surfaceDetail: UVSurfaceLocationDetail);
}
//# sourceMappingURL=SurfaceLocationDetail.d.ts.map