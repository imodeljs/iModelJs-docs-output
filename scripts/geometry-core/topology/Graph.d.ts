/** @module Topology */
import { Vector2d, Vector3d } from "../PointVector";
import { LineSegment3d } from "../curve/LineSegment3d";
export declare type NodeFunction = (node: HalfEdge) => any;
export declare type NodeToNumberFunction = (node: HalfEdge) => number;
export declare type HalfEdgeToBooleanFunction = (node: HalfEdge) => boolean;
export declare type HalfEdgeAndMaskToBooleanFunction = (node: HalfEdge, mask: HalfEdgeMask) => boolean;
export declare type GraphNodeFunction = (graph: HalfEdgeGraph, node: HalfEdge) => boolean;
/**
 *
 * * A HalfEdge is "one side of an edge" in a structure of faces, edges and vertices.  From a node there are navigational links to:
 * ** "faceSuccessor" -- the next half edge in a loop around a face.
 * ** "facePredecessor" -- the previous half edge in a loop around a face.
 * ** "edgeMate"  -- the node's partner on the other side of the edge.
 * * The next, prev, and mate are the essential connectivity.  Additional node content is for application-specific
 *     uses.  The most useful ones are:
 * ** x,y -- coordinates in the xy plane
 * ** z -- z coordinate.  This is normally ignored during planar setup, but used for output.
 * ** buffer -- a integer value manipulated as individual bits.
 * * In properly connected planar graph, interior face loops are counterclockwise.  But that property (along with
 *      expected masking) is a result of extensive validation of inputs, and is not true in intermediate phases
 *      of graph manipulation.
 */
export declare class HalfEdge {
    i: number;
    maskBits: number;
    x: number;
    y: number;
    z: number;
    private _id;
    readonly id: any;
    private _facePredecessor;
    private _faceSuccessor;
    private _edgeMate;
    /** previous half edge "around the face"
     */
    readonly facePredecessor: HalfEdge;
    /** next half edge "around the face" */
    readonly faceSuccessor: HalfEdge;
    /** Half edge on the other side of this edge.
     */
    readonly edgeMate: HalfEdge;
    /**
     * * Create 2 half edges.
     * * The two edges are joined as edgeMate pair.
     * * The two edges are a 2-half-edge face loop in both the faceSuccessor and facePredecessor directions.
     * @returns Returns the reference to the first half edge created
     */
    static createHalfEdgePair(heArray: HalfEdge[] | undefined): HalfEdge;
    /**
     * * Create 2 half edges.
     * * The two edges are joined as edgeMate pair.
     * * The two edges are a 2-half-edge face loop in both the faceSuccessor and facePredecessor directions.
     * * Properties x,y,z,i are inserted in each
     * @returns Returns the reference to the first half edge created
     */
    static createHalfEdgePairWithCoordinates(xA: number | undefined, yA: number | undefined, zA: number | undefined, iA: number | undefined, xB: number | undefined, yB: number | undefined, zB: number | undefined, iB: number | undefined, heArray: HalfEdge[] | undefined): HalfEdge;
    /**
     * * set heA <==> heB pointer relation through heA._faceSuccessor and heB._facePredecessor
     * * This changes heA._faceSuccessor and heB._facePredecessor, but not heA._facePredecessor and heB._faceSuccessor.
     * * this must always be done with another call to restablish the entire double-linked list.
     */
    private static setFaceLinks(heA, heB);
    /**
     * * set heA <==> heB pointer relation edgeMate
     */
    private static setEdgeMates(heA, heB);
    /**
     * * Create a new vertex within the edge from base.
     * * Insert it "within" the base edge.
     * * This requires two new half edges.
     * * if the base is undefined, create a single-edge loop.
     * * This (unlike pinch) breaks the edgeMate pairing of the base edge.
     * * This preserves xyzi properties at all existing vertices.
     * @returns Returns the reference to the half edge created.
     */
    static splitEdge(base: undefined | HalfEdge, xA: number | undefined, yA: number | undefined, zA: number | undefined, iA: number | undefined, heArray: HalfEdge[] | undefined): HalfEdge;
    prevZ: HalfEdge;
    nextZ: HalfEdge;
    steiner: boolean;
    zOrder: number;
    private static totalNodesCreated;
    constructor(x?: number, y?: number, z?: number, i?: number);
    /**
     * @returns Return the next outbound half edge around this vertex in the CCW direction
     */
    readonly vertexSuccessor: HalfEdge;
    /**
     * @returns Return the next outbound half edge around this vertex in the CW direction
     */
    readonly vertexPredecessor: HalfEdge;
    /**
     * Set mask bits on this HalfEdge
     * @param mask mask to apply
     */
    setMask(mask: HalfEdgeMask): void;
    /**
     * Get mask bits from this HalfEdge
     * @param mask mask to query
     */
    getMask(mask: HalfEdgeMask): number;
    /**
     * Clear mask bits from this HalfEdge
     * @param mask mask to clear
     */
    clearMask(mask: HalfEdgeMask): void;
    /**
     *
     * @param mask mask to apply to the half edges around this HalfEdge's vertex loop
     */
    setMaskAroundVertex(mask: HalfEdgeMask): void;
    /**
     *
     * @param mask mask to apply to the half edges around this HalfEdge's face loop
     */
    setMaskAroundFace(mask: HalfEdgeMask): void;
    /**
     * @returns Returns the number of edges around this face.
     */
    countEdgesAroundFace(): number;
    /**
     * @returns Returns the number of edges around vertex.
     */
    countEdgesAroundVertex(): number;
    /**
     * @returns Returns the number of nodes found with the given mask value around this vertex loop.
     */
    countMaskAroundFace(mask: HalfEdgeMask, value?: boolean): number;
    /**
     * @returns Returns the number of nodes found with the given mask value around this vertex loop.
     */
    countMaskAroundVertex(mask: HalfEdgeMask, value?: boolean): number;
    /**
     * @returns the mask value prior to the call to this method.
     * @param mask mask to apply
     */
    testAndSetMask(mask: HalfEdgeMask): number;
    /**
     * Test if mask bits are set in the node's bitMask.
     * @return Return true (as a simple boolean, not a mask) if any bits of the mask parameter match bits of the node's bitMask
     */
    isMaskSet(mask: HalfEdgeMask): boolean;
    /** (static!) method to test if a mask is set on a node.
     * This is used as filter in searches.
     * @returns true iff `node.isMaskSet (mask)`
     */
    static filterIsMaskOn(node: HalfEdge, mask: HalfEdgeMask): boolean;
    /** (static!) method to test if a mask is set on a node.
     * This is used as filter in searches.
     * @returns true iff `!node.isMaskSet (mask)`
     */
    static filterIsMaskOff(node: HalfEdge, mask: HalfEdgeMask): boolean;
    /**
     * @param id0 id for first node
     * @param x0  x coordinate for first node
     * @param y0  y coordinate for first node
     * @param id1 id for second node
     * @param x1 x coordinate for second node
     * @param y1 y coordinate for second node
     */
    static createEdgeXYXY(id0: any, x0: number, y0: number, id1: any, x1: number, y1: number): HalfEdge;
    /** "pinch" ...
     *
     * * is the universal manipulator for manipulating a node's next and prev pointers
     * * swaps face precessors of nodeA and nodeB.
     * *  is its own inverse.
     * *  does nothing if either node does not have a predecessor (this is obviously a logic error in the caller algorithm)
     * *  if nodeA, nodeB are in different face loops, the loops join to one loop.
     * *  if nodeA, nodeB are in the same face loop, the loop splits into two loops.
     */
    static pinch(nodeA: HalfEdge, nodeB: HalfEdge): void;
    /** Turn all pointers to undefined so garbage collector can reuse the object.
     *  This is to be called only by a Graph object that is being decomissioned.
     */
    decomission(): void;
    /** @returns Return the node. This identity function is useful as the NodeFunction in collector methods. */
    static nodeToSelf(node: HalfEdge): any;
    /** @returns Return the id of a node.  Useful for collector methods. */
    static nodeToId(node: HalfEdge): any;
    /** @returns Return the id of a node.Useful for collector methods. */
    static nodeToIdString(node: HalfEdge): any;
    /** @returns Return the [id, [x,y]] of a node.  Useful for collector methods. */
    static nodeToIdMaskXY(node: HalfEdge): {
        id: any;
        mask: any;
        xy: number[];
    };
    /** @returns Return the [id, [x,y]] of a node.  Useful for collector methods. */
    static nodeToIdXYString(node: HalfEdge): string;
    /**  */
    static nodeToMaskString(node: HalfEdge): string;
    /** @returns Return [x,y] with coordinates of node */
    static nodeToXY(node: HalfEdge): number[];
    /** @returns Return Vector2d to face successor, with only xy coordinates */
    vectorToFaceSuccessorXY(result?: Vector2d): Vector2d;
    /** @returns Return Vector3d to face successor */
    vectorToFaceSuccessor(result?: Vector3d): Vector3d;
    /** @returns Returns true if the node does NOT have Mask.EXTERIOR_MASK set. */
    static testNodeMaskNotExterior(node: HalfEdge): boolean;
    /** @return Return true if x and y coordinates of this and other are exactly equal */
    isEqualXY(other: HalfEdge): boolean;
    /** @return Return true if x and y coordinates of this and other are exactly equal */
    distanceXY(other: HalfEdge): number;
    /**
     *
     * * Evaluate f(node) at each node around a face loop.
     * * Collect the function values.
     * @returns Return the array of function values.
     */
    collectAroundFace(f?: NodeFunction): any[];
    /**
     *
     * * Evaluate f(node) at each outbound node around this node's vertex loop.
     * * Collect the function values.
     * @returns Return the array of function values.
     */
    collectAroundVertex(f?: NodeFunction): any[];
    /**
     *
     * * Evaluate f(node) at each node around a face loop.
     * * Sum the function values
     * @returns Return the sum
     */
    sumAroundFace(f: NodeToNumberFunction): number;
    /**
     *
     * * Evaluate f(node) at each outbound node around this node's vertex loop.
     * * Sum the function values
     * @returns Return the sum
     */
    sumAroundVertex(f: NodeToNumberFunction): number;
    /** For all the nodes in the face loop of the given node, clear out the mask given */
    clearMaskAroundFace(mask: HalfEdgeMask): void;
    /** For all the nodes in the vertex loop of the given node, clear out the mask given */
    clearMaskAroundVertex(mask: HalfEdgeMask): void;
    /** Returns the signed sum of a loop of nodes.
     *
     * * A positive area is counterclockwise.
     * * A negative area is clockwise.
     */
    signedFaceArea(): number;
}
/**
 * A HalfEdgeGraph has:
 * * An array of (pointers to ) HalfEdge objects.
 */
export declare class HalfEdgeGraph {
    allHalfEdges: HalfEdge[];
    private _numNodesCreated;
    constructor();
    /**
     * * Create 2 half edges forming 2 vertices, 1 edge, and 1 face
     * * The two edges are joined as edgeMate pair.
     * * The two edges are a 2-half-edge face loop in both the faceSuccessor and facePredecessor directions.
     * * The two edges are added to the graph's HalfEdge set
     * @returns Return pointer to the first half edge created.
     */
    createEdgeXYZXYZ(xA?: number, yA?: number, zA?: number, iA?: number, xB?: number, yB?: number, zB?: number, iB?: number): HalfEdge;
    /**
     * * Insert a vertex in the edge begining at base.
     * * this creates two half edges.
     * * The base of the new edge is 'after' the (possibly undefined) start node in its face loop.
     * * The existing mate retains its base xyzi properties but is no longer the mate of base.
     * * The base and existing mate each become mates with a new half edge.
     * @returns Returns the reference to the half edge created.
     */
    splitEdge(base: undefined | HalfEdge, xA?: number, yA?: number, zA?: number, iA?: number): HalfEdge;
    /** This is a destructor-like action that elminates all interconnection among the graph's nodes.
     * After this is called the graph is unusable.
     */
    decommission(): void;
    /** create two nodes of a new edge.
     * @returns Return one of the two nodes, which the caller may consider as the start of the edge.
     */
    addEdgeXY(x0: number, y0: number, x1: number, y1: number): HalfEdge;
    /** Clear selected bits in all nodes of the graph. */
    clearMask(mask: HalfEdgeMask): void;
    /** Set selected bits in all nodes of the graph. */
    setMask(mask: HalfEdgeMask): void;
    /** toggle selected bits in all nodes of the graph. */
    reverseMask(mask: HalfEdgeMask): void;
    /**
     * @returns Return the number of nodes that have a specified mask bit set.
     * @param mask mask to count
     */
    countMask(mask: HalfEdgeMask): number;
    /** Return an array LineSegment3d.
     * * The array has one segment per edge
     * * The coordinates are taken from a node and its face successor.
     * * On each edge, the line segment start at the HalfEdge with lower id than its edgeMate.
     */
    collectSegments(): LineSegment3d[];
    /** Returns the number of vertex loops in a graph structure */
    countVertexLoops(): number;
    /** @returns Returns the number of face loops */
    countFaceLoops(): number;
    /**
     * @returns Returns the number of face loops satisfying a filter function with mask argument.
     *
     */
    countFaceLoopsWithMaskFilter(filter: HalfEdgeAndMaskToBooleanFunction, mask: HalfEdgeMask): number;
    /** @returns Returns an array of nodes, where each node represents a starting point of a face loop.
     */
    collectFaceLoops(): HalfEdge[];
    /** @returns Returns an array of nodes, where each node represents a starting point of a vertex loop.
     */
    collectVertexLoops(): HalfEdge[];
    /**
     * * Visit each facet of the graph once.
     * * Call the announceFace function
     * * continue search if announceFace(graph, node) returns true
     * * terminate search if announceface (graph, node) returns false
     * @param  annonceFace function to apply at one node of each face.
     */
    announceFaceLoops(announceFace: GraphNodeFunction): void;
    /**
     * * Visit each vertex loop of the graph once.
     * * Call the announceVertex function
     * * continue search if announceFace(graph, node) returns true
     * * terminate search if announceface (graph, node) returns false
     * @param  annonceFace function to apply at one node of each face.
     */
    announceVertexLoops(announceVertex: GraphNodeFunction): void;
    /** @returns Return the number of nodes in the graph */
    countNodes(): number;
}
export declare const enum HalfEdgeMask {
    EXTERIOR = 1,
    BOUNDARY = 2,
    CONSTU_MASK = 4,
    CONSTV_MASK = 8,
    USEAM_MASK = 16,
    VSEAM_MASK = 32,
    BOUNDARY_VERTEX_MASK = 64,
    PRIMARY_VERTEX_MASK = 128,
    DIRECTED_EDGE_MASK = 256,
    PRIMARY_EDGE = 512,
    HULL_MASK = 1024,
    SECTION_EDGE_MASK = 2048,
    POLAR_LOOP_MASK = 4096,
    VISITED = 8192,
    TRIANGULATED_NODE_MASK = 16384,
    NULL_MASK = 0,
    ALL_MASK = 4294967295,
}
