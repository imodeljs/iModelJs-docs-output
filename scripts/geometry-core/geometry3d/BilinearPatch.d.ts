/** @module Solid */
import { Point3d } from "./Point3dVector3d";
import { Range3d } from "./Range";
import { Transform } from "./Transform";
import { UVSurface } from "./GeometryHandler";
import { Plane3dByOriginAndVectors } from "./Plane3dByOriginAndVectors";
import { Ray3d } from "./Ray3d";
import { CurveAndSurfaceLocationDetail } from "../bspline/SurfaceLocationDetail";
/**
 * * A Bilinear patch is defined by its 4 corner points.
 * * the corner points do not have to be coplanar
 *
 * *    v direction (up)
 *      |
 *      |
 *      |
 *  point01---A1-----------point11
 *      |     |             |
 *      B0----X------------B1
 *      |     |             |
 *  point00--A0-----------point10 -----------> u direction
 *
 * * To evaluate aa point at (u,v), the following are equivalent:
 *   * interpolate with u to get both A0 and A1, viz
 *      * A0 = interpolate between point00 and point10 at fraction u
 *      * A1 = interpolate between point01 and point11 at fraction u
 *      * X = interpolate between A0 and A1 at fraction v
 *   * interpolate first with v to get B0 and B1, viz
 *      * B0 = interpolate between point00 and point01 at fraction v
 *      * B1 = interpolate between point10 and point11 at fraction v
 *      * X = interpolate between B0 and B1 at fraction u
 *   * sum all at once as
 *      * X = (1-u)* (1-v) *point00 + (1-u)*v * point01 + u * (1-v) *point10 + u* v * point11
 *
 * @internal
 */
export declare class BilinearPatch implements UVSurface {
    /** corner at parametric coordinate (0,0) */
    point00: Point3d;
    /** corner at parametric coordinate (1,0) */
    point10: Point3d;
    /** corner at parametric coordinate (0,1) */
    point01: Point3d;
    /** corner at parametric coordinate (1,1) */
    point11: Point3d;
    /**
     * Capture (not clone) corner points, in u direction at v=0, then in same direction at v=1
     * @param point00 Point at uv=0,0
     * @param point10 Point at uv=1,0
     * @param point10 Point at uv=0,1
     * @param point11 Point at uv=11
     */
    constructor(point00: Point3d, point10: Point3d, point01: Point3d, point11: Point3d);
    /** clone (not capture) corners to create a new BilinearPatch
     * @param point00 Point at uv=0,0
     * @param point10 Point at uv=1,0
     * @param point10 Point at uv=0,1
     * @param point11 Point at uv=11
     */
    static create(point00: Point3d, point10: Point3d, point01: Point3d, point11: Point3d): BilinearPatch;
    /** create a patch with from xyz values of the 4 corners
     */
    static createXYZ(x00: number, y00: number, z00: number, x10: number, y10: number, z10: number, x01: number, y01: number, z01: number, x11: number, y11: number, z11: number): BilinearPatch;
    /** return a clone with same coordinates */
    clone(): BilinearPatch;
    /** test equality of the 4 points */
    isAlmostEqual(other: BilinearPatch): boolean;
    /** Apply the transform to each point */
    tryTransformInPlace(transform: Transform): boolean;
    /**
     * return a cloned and transformed patch.
     * @param transform
     */
    cloneTransformed(transform: Transform): BilinearPatch | undefined;
    /** Extend a range by the range of the(optionally transformed) patch
     */
    extendRange(range: Range3d, transform?: Transform): void;
    /** Evaluate as a uv surface
     * @param u fractional position in minor (phi)
     * @param v fractional position on major (theta) arc
     */
    uvFractionToPoint(u: number, v: number, result?: Point3d): Point3d;
    /** Evaluate as a uv surface, returning point and two derivative vectors.
     * @param u fractional position
     * @param v fractional position
     */
    uvFractionToPointAndTangents(u: number, v: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** if data[ib][pivotColumn] is larger (abs) than data[ia][pivotColumn] swap the iA and iB arrays */
    private static conditionalPivot;
    /**
     * Compute the (points of) intersection with a ray.
     * @param ray ray in space
     * @returns 1 or 2 points if there are intersections, undefined if no intersections
     */
    intersectRay(ray: Ray3d): CurveAndSurfaceLocationDetail[] | undefined;
    /**
     * Returns the larger of the u-direction edge lengths at v=0 and v=1
     */
    maxUEdgeLength(): number;
    /**
     * Returns the larger of the v-direction edge lengths at u=0 and u=1
     */
    maxVEdgeLength(): number;
}
//# sourceMappingURL=BilinearPatch.d.ts.map