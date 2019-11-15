/** @module Curve */
import { GeometryQuery } from "../GeometryQuery";
import { RecurseToCurvesGeometryHandler } from "../../geometry3d/GeometryHandler";
import { LineSegment3d } from "../LineSegment3d";
import { Vector3d } from "../../geometry3d/Point3dVector3d";
import { LineString3d } from "../LineString3d";
import { Arc3d } from "../Arc3d";
import { Ray3d } from "../../geometry3d/Ray3d";
import { AnyCurve } from "../CurveChain";
/**
 * Context for computing geometry range around an axis.
 * * The publicly called method is `computeZRRange (ray, geometry)
 */
export declare class CylindricalRangeQuery extends RecurseToCurvesGeometryHandler {
    private _perpVector;
    private _maxDistance;
    private _localToWorld;
    /** capture ray and initialize evolving ranges. */
    private constructor();
    private _localPoint;
    private _worldPoint;
    private announcePoint;
    handleLineSegment3d(segment0: LineSegment3d): void;
    handleLineString3d(ls0: LineString3d): void;
    handleArc3d(arc0: Arc3d): any;
    /**
     * Compute the largest vector perpendicular to a ray and ending on the geometry.
     * @param geometry0 geometry to search
     * @returns vector from ray to geometry.
     */
    static computeMaxVectorFromRay(ray: Ray3d, geometry: GeometryQuery): Vector3d;
    /**
     * Recurse through geometry.children to find linestrings.
     * In each linestring, compute the surface normal annotation from
     *  * the curve tangent stored in the linestring
     *  * the axis of rotation
     *  * a default V vector to be used when the linestring point is close to the axis.
     * @param geometry
     * @param axis
     * @param defaultVectorV
     */
    static buildRotationalNormalsInLineStrings(geometry: AnyCurve, axis: Ray3d, defaultVectorFromAxis: Vector3d): void;
}
//# sourceMappingURL=CylindricalRange.d.ts.map