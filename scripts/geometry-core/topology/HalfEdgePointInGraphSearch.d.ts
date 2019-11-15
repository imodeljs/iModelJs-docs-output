/** @module Topology */
import { HalfEdge } from "./Graph";
import { HalfEdgePositionDetail } from "./HalfEdgePositionDetail";
import { Ray3d } from "../geometry3d/Ray3d";
import { Point3d } from "../geometry3d/Point3dVector3d";
export declare enum RayClassification {
    RC_NoHits = 0,
    RC_TargetOnVertex = 1,
    RC_TargetOnEdge = 2,
    RC_Bracket = 3,
    RC_TargetBefore = 4,
    RC_TargetAfter = 5
}
export declare class PointSearchContext {
    private _tol;
    private constructor();
    static create(tol?: number): PointSearchContext;
    private panic;
    reAimFromEdge(edgeHit: HalfEdgePositionDetail, ray: Ray3d, targetDistance: number): HalfEdgePositionDetail;
    reAimFromVertex(searchBase: HalfEdgePositionDetail, ray: Ray3d, targetDistance: number): HalfEdgePositionDetail;
    reAimAroundFace(faceNode: HalfEdge, ray: Ray3d, targetDistance: number, // !< distance to target point
    lastBefore: HalfEdgePositionDetail, // CALLER CREATED -- reset as first hit on negative side of ray.
    firstAfter: HalfEdgePositionDetail): RayClassification;
    /**
     * Set (replace contents) ray with
     * * `origin` at start
     * * `direction` is unit vector from start towards target
     * * `a` is distance from start to target.
     * @param start existing position
     * @param target target xy coordinates
     * @param ray ray to update
     */
    setSearchRay(start: HalfEdgePositionDetail, target: Point3d, ray: Ray3d): boolean;
}
//# sourceMappingURL=HalfEdgePointInGraphSearch.d.ts.map