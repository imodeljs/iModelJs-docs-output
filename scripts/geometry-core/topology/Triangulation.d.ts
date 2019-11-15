/** @module Topology */
import { HalfEdgeMask, HalfEdge, HalfEdgeGraph } from "./Graph";
import { XAndY, XYAndZ } from "../geometry3d/XYZProps";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
import { IndexedXYZCollection } from "../geometry3d/IndexedXYZCollection";
import { MarkedEdgeSet } from "./HalfEdgeMarkSet";
/**
 * type for use as signature for xyz data of a single linestring appearing in a parameter list.
 * @public
 */
export declare type LineStringDataVariant = IndexedXYZCollection | XYAndZ[] | XAndY[] | number[][];
/**
 * type for use as signature for multiple xyz data of multiple linestrings appearing in a parameter list.
 * @public
 */
export declare type MultiLineStringDataVariant = LineStringDataVariant | LineStringDataVariant[];
/**
 * (static) methods for triangulating polygons
 * * @internal
 */
export declare class Triangulator {
    /** Given the six nodes that make up two bordering triangles, "pinch" and relocate the nodes to flip them
     * * The shared edge mates are a and d.
     * * (abc) are a triangle in CCW order
     * * (dfe) are a triangle in CCW order. (!! node dfe instead of def.)
     */
    private static flipEdgeBetweenTriangles;
    /**
     * * nodeA is a given node
     * * nodeA1 is its nodeA.faceSuccessor
     * * nodeA2 is nodeA1.faceSuccessor, i.e. 3rd node of triangle A
     * * nodeB  is nodeA.edgeMate, i.e. a node in the "other" triangle at nodeA's edge
     * * nodeB1 is nodeB.faceSuccessor
     * * nodeB2 is nodeB1.faceSuccessor, i.e the 3rd node of triangle B
     * Construct (as simple doubles, to avoid object creation) xy vectors from:
     * * (ux,uy): nodeA to nodeA1, i.e. the shared edge
     * * (vx,vy): nodeA to nodeA2,
     * * (wx,wy): nodeA to nodeB2
     * * this determinant is positive if nodeA is "in the circle" of nodeB2, nodeA1, nodeA2
     * * Return true if clearly positive
     * * Return false if clearly negative or almost zero.
     * @param nodeA node on the diagonal edge of candidate for edge flip.
     * @param if true, divide the determinant by the sum of absolute values of the cubic terms of the determinant.
     * @return the determinant as modified per comment (but undefined if the faces are not triangles as expected.)
     */
    static computeInCircleDeterminantIsStrongPositive(nodeA: HalfEdge): boolean;
    /**
     *  *  Visit each node of the graph array
     *  *  If a flip would be possible, test the results of flipping using incircle condition
     *  *  If revealed to be an improvement, conduct the flip, mark involved nodes as unvisited, and repeat until all nodes are visited
     */
    static flipTriangles(graph: HalfEdgeGraph): number;
    /**
     *  *  Visit each node of the graph array
     *  *  If a flip would be possible, test the results of flipping using incircle condition
     *  *  If revealed to be an improvement, conduct the flip, mark involved nodes as unvisited, and repeat until all nodes are visited
     */
    static flipTrianglesInEdgeSet(graph: HalfEdgeGraph, edgeSet: MarkedEdgeSet): number;
    /** Create a graph with a triangulation points.
     * * The outer limit of the graph is the convex hull of the points.
     * * The outside loop is marked `HalfEdgeMask.EXTERIOR`
     */
    static createTriangulatedGraphFromPoints(points: Point3d[]): HalfEdgeGraph | undefined;
    /**
     * * Only one outer loop permitted.
     * * Largest area loop is assumed outer.
     * @param loops an array of loops as GrowableXYZArray or XAndY[]
     * @returns triangulated graph, or undefined if bad data.
     */
    static createTriangulatedGraphFromLoops(loops: GrowableXYZArray[] | XAndY[][]): HalfEdgeGraph | undefined;
    /**
     * Triangulate all positive area faces of a graph.
     */
    static triangulateAllPositiveAreaFaces(graph: HalfEdgeGraph): void;
    /**
     * Triangulate the polygon made up of by a series of points.
     * * The loop may be either CCW or CW -- CCW order will be used for triangles.
     * * To triangulate a polygon with holes, use createTriangulatedGraphFromLoops
     */
    static createTriangulatedGraphFromSingleLoop(data: XAndY[] | GrowableXYZArray): HalfEdgeGraph;
    /**
     * cautiously split the edge starting at baseNode.
     * * If baseNode is null, create a trivial loop with the single vertex at xy
     * * if xy is distinct from the coordinates at both baseNode and its successor, insert xy as a new node within that edge.
     * * also include z coordinate if present.
     */
    private static interiorEdgeSplit;
    /** Create a loop from coordinates.
     * * Return a pointer to any node on the loop.
     * * no masking or other markup is applied.
     */
    static directCreateFaceLoopFromCoordinates(graph: HalfEdgeGraph, data: LineStringDataVariant): HalfEdge | undefined;
    /** Create chains from coordinates.
     * * Return array of pointers to base node of the chains.
     * * no masking or other markup is applied.
     * @param graph New edges are built in this graph
     * @param data coordinate data
     * @param id id to attach to (both side of all) edges
     */
    static directCreateChainsFromCoordinates(graph: HalfEdgeGraph, data: MultiLineStringDataVariant, id?: number): HalfEdge[];
    /**
     * @param graph the containing graph
     * @param base The last node of a newly created loop.  (i.e. its `faceSuccessor` has the start xy)
     * @param returnPositiveAreaLoop if true, return the start node on the side with positive area.  otherwise return the left side as given.
     * @param maskForBothSides mask to apply on both sides.
     * @param maskForOtherSide mask to apply to the "other" side of the loop.
     * @return the loop's start node or its vertex successor, chosen to be the positive or negative loop per request.
     */
    private static maskAndOrientNewFaceLoop;
    /**
     * create a circular doubly linked list of internal and external nodes from polygon points in the specified winding order
     * * This applies the masks used by typical applications:
     *   * HalfEdgeMask.BOUNDARY on both sides
     *   * HalfEdgeMask.PRIMARY_EDGE on both sides.
     * * Use `createFaceLoopFromCoordinatesAndMasks` for detail control of masks.
     */
    static createFaceLoopFromCoordinates(graph: HalfEdgeGraph, data: LineStringDataVariant, returnPositiveAreaLoop: boolean, markExterior: boolean): HalfEdge | undefined;
    /**
     * create a circular doubly linked list of internal and external nodes from polygon points.
     * * Optionally jump to the "other" side so the returned loop has positive area
     * @param graph graph to receive the new edges
     * @param data array with x,y coordinates
     * @param returnPositiveAreaLoop if false, return an edge proceeding around the loop in the order given.  If true, compute the loop area and flip return the side with positive area.
     * @param maskForBothSides mask to apply on both sides.
     * @param maskForOtherSide mask to apply on the "other" side from the returned loop.
     */
    static createFaceLoopFromCoordinatesAndMasks(graph: HalfEdgeGraph, data: LineStringDataVariant, returnPositiveAreaLoop: boolean, maskForBothSides: HalfEdgeMask, maskForOtherSide: HalfEdgeMask): HalfEdge | undefined;
    /** Cut off an ear, forming a new face loop of nodes
     * @param ear the vertex being cut off.
     * *  Form two new nodes, alpha and beta, which have the coordinates one step away from the ear vertex.
     * *  Reassigns the pointers such that beta is left behind with the new face created
     * *  Reassigns the pointers such that alpha becomes the resulting missing node from the remaining polygon
     * * Reassigns prevZ and nextZ pointers
     */
    private static joinNeighborsOfEar;
    private static isInteriorTriangle;
    /**
     * Perform 0, 1, or more edge flips to improve aspect ratio just behind an that was just cut.
     * @param ear the triangle corner which just served as the ear node.
     * @returns the node at the back corner after flipping."appropriately positioned" node for the usual advance to ear.faceSuccessor.edgeMate.faceSuccessor.
     */
    private static doPostCutFlips;
    /**
     * main ear slicing loop which triangulates a polygon (given as a linked list)
     * While there still exists ear nodes that have not yet been triangulated...
     *
     * *  Check if the ear is hashed, and can easily be split off. If so, "join" that ear.
     * *  If not hashed, move on to a separate ear.
     * *  If no ears are currently hashed, attempt to cure self intersections or split the polygon into two before continuing
     */
    private static triangulateSingleFace;
    /** Check whether a polygon node forms a valid ear with adjacent nodes */
    private static isEar;
    /** link holeLoopNodes[1], holeLoopNodes[2] etc into the outer loop, producing a single-ring polygon without holes
     *
     */
    private static spliceLeftMostNodesOfHoles;
    /** For use in sorting -- return (signed) difference (a.x - b.x) */
    private static compareX;
    /** find a bridge between vertices that connects hole with an outer ring and and link it */
    private static eliminateHole;
    /**
     *  David Eberly algorithm for finding a bridge between hole and outer polygon:
     *  https://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf
     */
    private static findHoleBridge;
    private static getLeftmost;
    /** check if a point lies within a convex triangle */
    private static pointInTriangle;
    /** signed area of a triangle */
    private static signedTriangleArea;
    /** check if two points are equal */
    private static equalXAndYXY;
    /** check if a polygon diagonal is locally inside the polygon */
    private static locallyInside;
    /**
     * link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
     * if one belongs to the outer ring and another to a hole, it merges it into a single ring
     * * Returns the base of the new edge at the "a" end.
     * * "a" and "b" still represent the same physical pieces of edges
     * @returns Returns the (base of) the new half edge, at the "a" end.
     */
    private static splitFace;
    /**
     * Triangulate a single face with (linear time) logic applicable only if the lowNode is the lowest node.
     * @returns false if any monotonicity condition is violated.
     */
    static triangulateSingleMonotoneFace(graph: HalfEdgeGraph, start: HalfEdge): boolean;
}
//# sourceMappingURL=Triangulation.d.ts.map