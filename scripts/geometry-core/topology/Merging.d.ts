import { LineSegment3d } from "../curve/LineSegment3d";
import { HalfEdge, HalfEdgeGraph, HalfEdgeMask } from "./Graph";
import { Range3d } from "../geometry3d/Range";
import { MultiLineStringDataVariant } from "./Triangulation";
export declare class GraphSplitData {
    numUpEdge: number;
    numIntersectionTest: number;
    numSplit: number;
    numPopOut: number;
    numA0B0: number;
    numA0B1: number;
    constructor();
}
/**
 * * Assorted methods used in algorithms on HalfEdgeGraph.
 * @internal
 */
export declare class HalfEdgeGraphOps {
    /** Compare function for sorting with primary y compare, secondary  x compare. */
    static compareNodesYXUp(a: HalfEdge, b: HalfEdge): 1 | 0 | -1;
    /** Return true if nodeB (a) is lower than both its neighbors and (b) inflects as a downward peak (rather than an upward trough) */
    static isDownPeak(nodeB: HalfEdge): boolean;
    /** return the cross product of vectors from base to targetA and base to targetB
     * @param base base vertex of both vectors.
     * @param targetA target vertex of first vector
     * @param targetB target vertex of second vector
     */
    static crossProductToTargets(base: HalfEdge, targetA: HalfEdge, targetB: HalfEdge): number;
    static graphRange(graph: HalfEdgeGraph): Range3d;
    /** Returns an array of a all nodes (both ends) of edges created from segments. */
    static segmentArrayToGraphEdges(segments: LineSegment3d[], returnGraph: HalfEdgeGraph, mask: HalfEdgeMask): HalfEdge[];
    /**
     * * For each face with positive area . . . add edges as needed so that each face has one definitely lower node and one definite upper node.
     * * Hence tracing edges from the low node, there is a sequence of upward edges, reaching the upper,  then a sequence of downward edges reaching the low node.
     * * This is an essential step for subsequent triangulation.
     *
     * @param graph
     */
    static formMonotoneFaces(graph: HalfEdgeGraph): void;
    /**
     * * Visit all nodes in `graph`.
     * * invoke `pinch(node, vertexPredecessor)`
     * * this leaves the graph as isolated edges.
     * @param graph graph to modify
     */
    static isolateAllEdges(graph: HalfEdgeGraph): void;
}
/**
 * @internal
 */
export declare class HalfEdgeGraphMerge {
    /** Simplest merge algorithm:
     * * collect array of (x,y,theta) at all nodes
     * * lexical sort of the array.
     * * twist all vertices together.
     * * This effectively creates valid face loops for a planar subdivision if there are no edge crossings.
     * * If there are edge crossings, the graph can be a (highly complicated) Klein bottle topology.
     * * Mask.NULL_FACE is cleared throughout and applied within null faces.
     */
    static clusterAndMergeXYTheta(graph: HalfEdgeGraph): void;
    private static buildVerticalSweepPriorityQueue;
    private static computeIntersectionFractionsOnEdges;
    /**
     * Split edges at intersections.
     * * This is a large operation.
     * @param graph
     */
    static splitIntersectingEdges(graph: HalfEdgeGraph): GraphSplitData;
    /**
     * Returns a graph structure formed from the given LineSegment array
     *
     * *  Find all intersections among segments, and split them if necessary
     * *  Record endpoints of every segment in the form X, Y, Theta; This information is stored as a new node and sorted to match up
     *      vertices.
     * *  For vertices that match up, pinch the nodes to create vertex loops, which in closed objects, will also eventually form face
     *      loops
     */
    static formGraphFromSegments(lineSegments: LineSegment3d[]): HalfEdgeGraph;
    /**
     * * Input is random linestrings, not necessarily loops
     * * Graph gets full splitEdges, regularize, and triangulate.
     * @returns triangulated graph, or undefined if bad data.
     */
    static formGraphFromChains(chains: MultiLineStringDataVariant, regularize?: boolean, mask?: HalfEdgeMask): HalfEdgeGraph | undefined;
}
//# sourceMappingURL=Merging.d.ts.map