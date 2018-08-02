/** @module Topology */
import { HalfEdge, HalfEdgeGraph, HalfEdgeMask } from "./Graph";
/** HalfEdgePointerInspector has methods to check HalfEdge objects for pointer errors.
 * * For a one-step test of the whole grpah,
 */
export declare class HalfEdgePointerInspector {
    numUndefinedEdgeMate: number;
    numUndefinedFS: number;
    numUndefinedFP: number;
    numFSFPError: number;
    numMatePairError: number;
    numTested: number;
    numWithMatchedEdgeMate: number;
    /** Clear all counts */
    clearCounts(): void;
    /** Inspect a single half edge.   Increment counters according to the half edge's pointers. */
    inspectHalfEdge(he: HalfEdge): void;
    /** Return true if all pointer pairings are correct for a complete half edge graph:
     * * For each he:  `he.edgeMate.edgeMate === he`
     * * For each he:  `he.faceSuccessor.facePredecessor !== he`
     * * For each he:  `he.facePredecessor.faceSuccessor !== he`
     */
    isValidClosedHalfEdgeGraph(): boolean;
    /** Return true if all counts are correct for a half edge graph that is complete except for unmated boundaries:
     * * For each he:  `he.edgeMate.edgeMate === he` except where `he.edgeMate === undefined`
     * * For each he:  `he.faceSuccessor.facePredecessor !== he`
     * * For each he:  `he.facePredecessor.faceSuccessor !== he`
     */
    isValidHalfEdgeGraphAllowRaggedBoundary(): boolean;
    /** inspect all half edges of graph.
     * All pointer counts are left in member vars for later inspection.
     */
    inspectHalfEdges(graph: HalfEdgeGraph): void;
    /** Inspect a graph's pointer properties.
     * @param expectAllMates [in] true for "complete" graph with
     * @returns true if all pointers are valid
     */
    static inspectGraph(graph: HalfEdgeGraph, expectAllMates: boolean): boolean;
}
/** static methods to inpsect mask consistency properties in HalfEdgeGraph. */
export declare class HalfEdgeMaskValidation {
    /**
     * Test if a mask is used consistently around faces.
     * * At the low level, there is no actual traversal around faces.  It is only necessary to verify that the mask matches for each HalfEdge and its faceSuccessor.
     * @returns Return true if mask is "all or nothing around all faces"
     *
     */
    static isMaskConsistentAroundAllFaces(graph: HalfEdgeGraph, mask: HalfEdgeMask): boolean;
}
