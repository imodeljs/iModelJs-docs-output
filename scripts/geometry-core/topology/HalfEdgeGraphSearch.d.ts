/** @module Topology */
import { HalfEdge, HalfEdgeGraph, HalfEdgeMask } from "./Graph";
import { SignedDataSummary } from "./SignedDataSummary";
/**
 * Interface for an object that executes boolean tests on edges.
 */
export interface HalfEdgeTestObject {
    testEdge(h: HalfEdge): boolean;
}
/**
 */
export declare class HalfEdgeMaskTester {
    private _targetMask;
    private _targetValue;
    /**
     *
     * @param mask mask to test in `testEdge` function
     * @param targetValue value to match for true return
     */
    constructor(mask: HalfEdgeMask, targetValue?: boolean);
    /** Return true if the value of the targetMask matches the targetValue */
    testEdge(edge: HalfEdge): boolean;
}
export declare class HalfEdgeGraphSearch {
    /**
     * * for each node of face, set the mask push to allNodesStack
     * * push the faceSeed on onePerFaceStack[]
     */
    private static pushAndMaskAllNodesInFace;
    /**
     * Search an array of faceSeed nodes for the face with the most negative area.
     * @param oneCandidateNodePerFace array containing one node from each face to be considered.
     */
    static findMinimumAreaFace(oneCandidateNodePerFace: HalfEdgeGraph | HalfEdge[]): HalfEdge;
    /**
     *
     * Return a summary structure data about face areas.
     */
    static collectFaceAreaSummary(source: HalfEdgeGraph | HalfEdge[], collectAllNodes?: boolean): SignedDataSummary<HalfEdge>;
    /**
     * Search to all accessible faces from given seed.
     * * The returned array contains one representative node in each face of the connected component.
     * * If (nonnull) parity mask is given, on return:
     *    * It is entirely set or entirely clear around each face
     *    * It is entirely set on all faces that are an even number of face-to-face steps away from the seed.
     *    * It is entirely clear on all faces that are an odd number of face-to-face steps away from the seed.
     * @param seedEdge first edge to search.
     * @param visitMask mask applied to all faces as visited.
     * @param parityMask mask to apply (a) to first face, (b) to faces with alternating parity during the search.
     */
    private static parityFloodFromSeed;
    /**
     * * Search the given faces for the one with the minimum area.
     * * If the mask in that face is OFF, toggle it on (all half edges of) all the faces.
     * * In a properly merged planar subdivision there should be only one true negative area face per component.
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
     * @param parityEdgeTester (optional) function to test of an edge is a parity change.
     * @param parityMask (optional, along with boundaryTestFunction) mask to apply indicating parity.  If this is Mask.NULL_MASK, there is no record of parity.
     */
    static collectConnectedComponentsWithExteriorParityMasks(graph: HalfEdgeGraph, parityEdgeTester: HalfEdgeTestObject | undefined, parityMask?: HalfEdgeMask): HalfEdge[][];
    /**
     * Test if (x,y) is inside (1), on an edge (0) or outside (-1) a face.
     * @param seedNode any node on the face loop
     * @param x x coordinate of test point.
     * @param y y coordinate of test point.
     */
    static pointInOrOnFaceXY(seedNode: HalfEdge, x: number, y: number): number | undefined;
}
//# sourceMappingURL=HalfEdgeGraphSearch.d.ts.map