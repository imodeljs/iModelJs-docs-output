import { HalfEdgeGraph } from "./Graph";
import { HalfEdgePositionDetail } from "./HalfEdgePositionDetail";
import { Point3d } from "../geometry3d/Point3dVector3d";
/** @module Topology */
/**
 * Context for repeated insertion of new points in a graph.
 * * Initial graph should have clean outer boundary. (e.g. as typically marked with HalfEdgeMask.EXTERIOR)
 * * After each insertion, the current "position" within the graph is remembered so that each subsequent insertion
 *     can reuse that position as start for walking to the new point.
 */
export declare class InsertAndRetriangulateContext {
    private _graph;
    private _edgeSet;
    private _searcher;
    private constructor();
    /** Create a new context referencing the graph. */
    static create(graph: HalfEdgeGraph): InsertAndRetriangulateContext;
    /** Query the (pointer to) the graph in the context. */
    readonly graph: HalfEdgeGraph;
    private retriangulateFromBaseVertex;
    /** Reset the "current" position to unknown state. */
    reset(): void;
    /** Return a (reference to!) the current position in the graph */
    readonly currentPosition: HalfEdgePositionDetail;
    /**
     * Linear search through the graph
     * * Returns a HalfEdgePositionDetail for the nearest edge or vertex.
     * @param xyz
     */
    searchForNearestEdgeOrVertex(xyz: Point3d): HalfEdgePositionDetail;
    searchForNearestVertex(xyz: Point3d): HalfEdgePositionDetail;
    resetSearch(xyz: Point3d, maxDim: number): void;
    insertAndRetriangulate(xyz: Point3d, newZWins: boolean): boolean;
    moveToPoint(movingPosition: HalfEdgePositionDetail, xyz: Point3d, announcer?: (position: HalfEdgePositionDetail) => boolean): boolean;
}
//# sourceMappingURL=InsertAndRetriangulateContext.d.ts.map