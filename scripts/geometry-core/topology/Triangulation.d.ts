/** @module Topology */
import { HalfEdge, HalfEdgeGraph } from "./Graph";
import { XAndY } from "../geometry3d/XYZProps";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
export declare class Triangulator {
    private static _returnGraph;
    /** Given the six nodes that make up two bordering triangles, "pinch" and relocate the nodes to flip them */
    private static flipTriangles;
    /**
     * * nodeA is a given node
     * * nodeA1 is its nodeA.faceSuccessor
     * * nodeA2 is nodeA1.faceSuccessor, i.e. 3rd node of triangle A
     * * nodeB  is nodeA.edgeMate, i.e. a node in the "other" triangle at nodeA's edge
     * * nodeB1 is nodeB.faceSucessor
     * * nodeB2 is nodeB1.faceSuccessor, i.e the 3rd node of triangle B
     * Construct (as simple doubles, to avoid object creation) xy vectors from:
     * * (ux,uy): nodeA to nodeA1, i.e. the shared edge
     * * (vx,vy): nodeA to ndoeA2,
     * * (wx,wy): nodeA to nodeB2
     * * this determinant is positive if nodeA is "in the circle" of nodeB2, nodeA1, nodeA2
     * @param nodeA node on the diagonal edge of candidate for edge flip.
     * @return the determinant (but undefined if the faces are not triangles as expected.)
     */
    private static computeInCircleDeterminant;
    /**
     *  *  Visit each node of the graph array
     *  *  If a flip would be possible, test the results of flipping using incircle condition
     *  *  If revealed to be an improvement, conduct the flip, mark involved nodes as unvisited, and repeat until all nodes are visited
     */
    static cleanupTriangulation(graph: HalfEdgeGraph): void;
    /**
     *
     * @param strokedLoops an array of loops as GrowableXYZArray.
     * @returns triangulated graph, or undefined if bad data.
     */
    static triangulateStrokedLoops(strokedLoops: GrowableXYZArray[]): HalfEdgeGraph | undefined;
    /**
     * Triangulate the polygon made up of by a series of points.
     * * To triangulate a polygon with holes, use earcutFromOuterAndInnerLoops
     * * The loop may be either CCW or CW -- CCW order will be used for triangles.
     */
    static earcutSingleLoop(data: XAndY[]): HalfEdgeGraph;
    /**
     * Triangulate the polygon made up of multiple loops.
     * * only xy parts are considered.
     * * First loop is assumed outer -- will be reordered as CCW
     * * Additional loops assumed inner -- will be reordered as CW
     */
    static earcutOuterAndInnerLoops(loops: XAndY[][]): HalfEdgeGraph;
    /**
     * cautiously split the edge starting at baseNode.
     * * If baseNode is null, create a trivial loop with the single vertex at xy
     * * if xy is distinct from the coordinates at both baseNode and its successor, insert xy as a new node within that edge.
     * * also include z coordinate if present.
     */
    private static interiorEdgeSplit;
    private static directcreateFaceLoopFromIndexedXYZCollection;
    private static directCreateFaceLoopFromXAndYArray;
    /**
     * @param graph the containing graph
     * @param base The last node of a newly created loop.  (i.e. its `faceSuccessor` has the start xy)
     * @param returnPositiveAreaLoop if true, return the start node on the side with positive area.  otherwise return the left side as given.
     * @param markExterior
     * @return the loop's start node or its vertex sucessor, chosen to be the positive or negative loop per request.
     */
    private static assignMasksToNewFaceLoop;
    /**
     * create a circular doubly linked list of internal and external nodes from polygon points in the specified winding order
     * * If start and end are both zero, use the whole array.
     */
    private static createFaceLoopFromXAndYArray;
    /**
     * create a circular doubly linked list of internal and external nodes from polygon points in the specified winding order
     */
    static createFaceLoopFromIndexedXYZCollection(data: GrowableXYZArray, returnPositiveAreaLoop: boolean, markExterior: boolean): HalfEdge | undefined;
    /** eliminate colinear or duplicate points using starting and ending nodes */
    private static filterPoints;
    /** Cut off an ear, forming a new face loop of nodes
     * @param ear the vertex being cut off.
     * *  Form two new nodes, alpha and beta, which have the coordinates one step away from the ear vertex.
     * *  Reassigns the pointers such that beta is left behind with the new face created
     * *  Reassigns the pointers such that alpha becomes the resulting missing node from the remaining polygon
     * * Reassigns prevZ and nextZ pointers
     */
    private static joinNeighborsOfEar;
    /**
     * main ear slicing loop which triangulates a polygon (given as a linked list)
     * While there still exists ear nodes that have not yet been triangulated...
     *
     * *  Check if the ear is hashed, and can easily be split off. If so, "join" that ear.
     * *  If not hashed, move on to a seperate ear.
     * *  If no ears are currently hashed, attempt to cure self intersections or split the polygon into two before continuing
     */
    private static earcutLinked;
    /** Check whether a polygon node forms a valid ear with adjacent nodes */
    private static isEar;
    /** Check whether a polygon node forms a valid ear with adjacent nodes using bounded boxes of z-ordering of this and adjacent nodes */
    private static isEarHashed;
    /** Go through all polygon nodes and cure small local self-intersections */
    private static cureLocalIntersections;
    /** try splitting polygon into two and triangulate them independently */
    private static splitEarcut;
    /** link loops[1], loops[2] etc into the outer loop, producing a single-ring polygon without holes
     *
     */
    private static constructAndSpliceHoles;
    /** link holeLoopNodes[1], holeLoopNodes[2] etc into the outer loop, producing a single-ring polygon without holes
     *
     */
    private static spliceLeftMostNodesOfHoles;
    /** For use in sorting -- return (signed) difference (a.x - b.x) */
    private static compareX;
    /** find a bridge between vertices that connects hole with an outer ring and and link it */
    private static eliminateHole;
    /**
     *  David Eberly's algorithm for finding a bridge between hole and outer polygon:
     *  https://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf
     */
    private static findHoleBridge;
    /** interlink polygon nodes in z-order */
    private static indexCurve;
    /**
     * Simon Tatham's linked list merge sort algorithm
     * http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
     */
    private static sortLinked;
    /**
     * z-order of a point given coords and size of the data bounding box
     */
    private static zOrder;
    private static getLeftmost;
    /** check if a point lies within a convex triangle */
    private static pointInTriangle;
    /** check if a diagonal between two polygon nodes is valid (lies in polygon interior) */
    private static isValidDiagonal;
    /** signed area of a triangle */
    private static signedTriangleArea;
    /** check if two points are equal */
    private static equalXAndY;
    /** check if two segments intersect */
    private static intersects;
    /** check if a polygon diagonal intersects any polygon segments */
    private static intersectsPolygon;
    /** check if a polygon diagonal is locally inside the polygon */
    private static locallyInside;
    /** check if the middle point of a polygon diagonal is inside the polygon */
    private static middleInside;
    /**
     * link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
     * if one belongs to the outer ring and another to a hole, it merges it into a single ring
     * * Returns the base of the new edge at the "a" end.
     * * "a" and "b" still represent the same physical pieces of edges
     * @returns Returns the (base of) the new half edge, at the "a" end.
     */
    private static splitPolygon;
}
//# sourceMappingURL=Triangulation.d.ts.map