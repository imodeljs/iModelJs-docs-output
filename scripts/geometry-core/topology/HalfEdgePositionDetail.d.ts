import { HalfEdge } from "./Graph";
import { XYAndZ } from "../geometry3d/XYZProps";
import { Point3d } from "../geometry3d/Point3dVector3d";
/** @module Topology */
/**
 * Enumeration of categorization of "where" a HalfEdgePositionDetail is sitting in the graph.
 */
export declare enum HalfEdgeTopo {
    /** No known position */
    None = 0,
    /**  */
    Vertex = 1,
    Edge = 2,
    Face = 3
}
/**
 * Description of a generalized position within a graph, categorized as:
 * * "at a certain node around a vertex"
 * * "at a fractional position along an edge
 * * "within a face"
 */
export declare class HalfEdgePositionDetail {
    /** the relevant node */
    private _node?;
    /** The current coordinates */
    x: number;
    y: number;
    z: number;
    /** fractional position along edge.   Only defined if the topo tag is `HalfEdgeTopo.Edge` */
    private _edgeFraction?;
    /** Enumeration of status vertex, edge, or face status. */
    private _topo;
    /** first data tag */
    private _iTag?;
    /** second data tag */
    private _dTag?;
    /** Constructor.
     * * The point is CAPTURED.  (static `create` methods normally clone their inputs.)
     */
    private constructor();
    /** Copy (clones of) all data from other */
    setFrom(other: HalfEdgePositionDetail): void;
    /** reset to null topo state. */
    resetAsUnknown(): void;
    /**  Create with null data. */
    static create(): HalfEdgePositionDetail;
    getITag(): number | undefined;
    setITag(value: number): void;
    getDTag(): number | undefined;
    setDTag(value: number): void;
    getTopo(): HalfEdgeTopo;
    /** Create with node, fraction along edge, marked as "HalfEdgeTopo.Edge".  Compute interpolated xyz on the edge */
    static createEdgeAtFraction(node: HalfEdge, edgeFraction: number): HalfEdgePositionDetail;
    /** reassign contents so this instance becomes a face hit.
     * @param node new node value. If missing, current node is left unchanged.
     * @param xyz new coordinates. if missing, current coordinates are left unchanged.
     */
    resetAsFace(node?: HalfEdge, xyz?: XYAndZ): HalfEdgePositionDetail;
    /** reassign contents so this instance has dTag but no node or HalfEdgeTopo
     */
    resetAsUndefinedWithTag(dTag: number): HalfEdgePositionDetail;
    /** reassign contents so this instance becomes an edge hit
     * @param node new node value.
     * @param edgeFraction new edge fraction.   xyz is recomputed from this edge and its face successor.
     */
    resetAtEdgeAndFraction(node: HalfEdge, edgeFraction: number): HalfEdgePositionDetail;
    /** Create at a node.
     * * Take xyz from the node.
     */
    static createVertex(node: HalfEdge): HalfEdgePositionDetail;
    /** Create with node and (optional) xyz, marked as "HalfEdgeTopo.Vertex"
     * * if the xyz is omitted, take from the node.
     */
    resetAsVertex(node: HalfEdge): HalfEdgePositionDetail;
    /** Copy x,y,z from the node to this instance local values. */
    setXYZFromNode(node: HalfEdge): void;
    /**
     * Return the (possibly undefined) edge fraction.
     */
    readonly edgeFraction: number | undefined;
    /** Return true if this detail is marked as being within a face. */
    readonly isFace: boolean;
    /** Return true if this detail is marked as being within an edge. */
    readonly isEdge: boolean;
    /** Return true if this detail is marked as being at a vertex. */
    readonly isVertex: boolean;
    /** Return true if this detail has no vertex, edge, or face qualifier. */
    readonly isUnclassified: boolean;
    /** Return the node reference from this detail */
    readonly node: HalfEdge | undefined;
    /** Return the (clone of, or optional filled in result) coordinates from this detail. */
    clonePoint(result?: Point3d): Point3d;
    isAtXY(x: number, y: number): boolean;
}
//# sourceMappingURL=HalfEdgePositionDetail.d.ts.map