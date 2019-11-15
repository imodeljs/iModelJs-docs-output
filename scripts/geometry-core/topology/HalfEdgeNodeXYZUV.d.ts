import { Point3d } from "../geometry3d/Point3dVector3d";
import { HalfEdge } from "./Graph";
import { Ray3d } from "../geometry3d/Ray3d";
import { Point2d } from "../geometry3d/Point2dVector2d";
/** @module Topology */
/**
 * Reference to a HalfEdge node with extra XYZ and UV data.
 * @internal
 */
export declare class NodeXYZUV {
    private _node;
    private _x;
    private _y;
    private _z;
    private _u;
    private _v;
    private constructor();
    /** Set all content directly from args.
     * @returns `this` reference
     */
    set(node: HalfEdge, x: number, y: number, z: number, u: number, v: number): NodeXYZUV;
    setFrom(other: NodeXYZUV): void;
    /** Create a `NodeXYZUV` with
     * * x,y,z at ray origin
     * * u,v as dotXY and crossXY for the ray direction with x,y distances from the ray origin.
     */
    static createNodeAndRayOrigin(node: HalfEdge, ray: Ray3d, result?: NodeXYZUV): NodeXYZUV;
    /** Access the node. */
    readonly node: HalfEdge;
    /** Access the x coordinate */
    readonly x: number;
    /** Access the y coordinate */
    readonly y: number;
    /** Access the z coordinate */
    readonly z: number;
    /** Access the u coordinate */
    readonly u: number;
    /** Access the v coordinate */
    readonly v: number;
    /** Access the x,y,z coordinates as Point3d with optional caller-supplied result. */
    getXYZAsPoint3d(result?: Point3d): Point3d;
    /** Access the uv coordinates as Point2d with optional caller-supplied result. */
    getUVAsPoint2d(result?: Point2d): Point2d;
    /** Toleranced comparison function for u coordinate */
    classifyU(target: number, tol: number): number;
    /** Toleranced comparison function for v coordinate */
    classifyV(target: number, tol: number): number;
}
//# sourceMappingURL=HalfEdgeNodeXYZUV.d.ts.map