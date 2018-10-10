/** @module Topology */
import { HalfEdge, HalfEdgeGraph, HalfEdgeMask } from "./Graph";
export declare class HalfEdgeGraphSearch {
    /**
     * * for each node of face, set the mask push to allNodesStack
     * * push the faceSeed on onePerFaceStack[]
     */
    private static pushAndMaskAllNodesInFace;
    /**
     * Search an array of faceSeed nodes for the face with the most negative area.
     */
    static findMinimumAreaFace(nodes: HalfEdge[]): HalfEdge;
    /**
     *
     * @param seedEdge first edge to search.
     * @param visitMask mask applied to all faces as visited.
     * @param parityMask mask to apply (a) to first face, (b) to faces with alternating parity during the search.
     */
    private static parityFloodFromSeed;
    /**
     * * Search the given faces for the one with the minimum area.
     * * If the mask in that face is OFF, toggle it on (all half edges of) all the faces.
     * * In a properly merged planar subdivision there should be only one true negative area face per compnent.
     * @param graph parent graph
     * @param parityMask mask which was previously set with alternating parity, but with an arbitrary start face.
     * @param faces array of faces to search.
     */
    private static correctParityInSingleComponent;
    /** Apply correctParityInSingleComponent to each array in components. (Quick exit if mask in NULL_MASK) */
    private static correctParityInComponentArrays;
    /**
     * Collect arrays gathering faces by connected component.
     * @param graph graph to inspect
     * @param parityMask (optional) mask to apply indicating parity.  If this is Mask.NULL_MASK, there is no record of parity.
     */
    static collectConnectedComponents(graph: HalfEdgeGraph, parityMask?: HalfEdgeMask): HalfEdge[][];
}
//# sourceMappingURL=HalfEdgeGraphSearch.d.ts.map