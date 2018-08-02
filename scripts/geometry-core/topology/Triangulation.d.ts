/** @module Topology */
import { HalfEdge, HalfEdgeGraph } from "./Graph";
import { Point3d } from "../PointVector";
import { GrowableXYZArray } from "../GrowableArray";
export declare class Triangulator {
    private static returnGraph;
    /** Given the six nodes that make up two bordering triangles, "pinch" and relocate the nodes to flip them */
    private static flipTriangles(a, b, c, d, e, f);
    /**
     *  *  Visit each node of the graph array
     *  *  If a flip would be possible, test the results of flipping using an RotMatrix
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
     * Triangulate the polygon made up of by a series of points
     *
     * *  Outer-edge points must be passed in counter-clockwise order
     * *  Inner-edge (hole) indices must be passed in clockwise order (following the outer edge points)
     * *  Optional holeIndices array specifies which indices of points array given are the starts of holes
     */
    static earcutFromPoints(data: Point3d[], holeIndices?: number[]): HalfEdgeGraph;
    private static directcreateFaceLoopFromGrowableXYZ(graph, data);
    private static directCreateFaceLoopFromPointArraySubset(graph, data, start, end);
    /**
     * @param graph the containing graph
     * @praam base base node of newly created loop.
     * @param returnPositiveAreaLoop if true, return the start node on the side with positive area.  otherwise return the left side as given.
     * @param markExterior
     */
    private static assignMasksToNewFaceLoop(_graph, base, returnPositiveAreaLoop, markExterior);
    /**
     * create a circular doubly linked list of internal and external nodes from polygon points in the specified winding order
     */
    private static createFaceLoop(data, start, end, returnPositiveAreaLoop, markExterior);
    /**
     * create a circular doubly linked list of internal and external nodes from polygon points in the specified winding order
     */
    static createFaceLoopFromGrowableXYZArray(data: GrowableXYZArray, returnPositiveAreaLoop: boolean, markExterior: boolean): HalfEdge | undefined;
    /** eliminate colinear or duplicate points using starting and ending nodes */
    private static filterPoints(start?, end?);
    /** Cut off an ear, forming a new face loop of nodes
     * @param ear the vertex being cut off.
     * *  Form two new nodes, alpha and beta, which have the coordinates one step away from the ear vertex.
     * *  Reassigns the pointers such that beta is left behind with the new face created
     * *  Reassigns the pointers such that alpha becomes the resulting missing node from the remaining polygon
     * * Reassigns prevZ and nextZ pointers
     */
    private static join(ear);
    /**
     * main ear slicing loop which triangulates a polygon (given as a linked list)
     * While there still exists ear nodes that have not yet been triangulated...
     *
     * *  Check if the ear is hashed, and can easily be split off. If so, "join" that ear.
     * *  If not hashed, move on to a seperate ear.
     * *  If no ears are currently hashed, attempt to cure self intersections or split the polygon into two before continuing
     */
    private static earcutLinked(ear?, minX?, minY?, size?, pass?);
    /** Check whether a polygon node forms a valid ear with adjacent nodes */
    private static isEar(ear);
    /** Check whether a polygon node forms a valid ear with adjacent nodes using bounded boxes of z-ordering of this and adjacent nodes */
    private static isEarHashed(ear, minX?, minY?, size?);
    /** Go through all polygon nodes and cure small local self-intersections */
    private static cureLocalIntersections(start);
    /** try splitting polygon into two and triangulate them independently */
    private static splitEarcut(start, minX?, minY?, size?);
    /** link every hole into the outer loop, producing a single-ring polygon without holes */
    private static eliminateHoles(data, outerNode, holeIndices);
    private static compareX(a, b);
    /** find a bridge between vertices that connects hole with an outer ring and and link it */
    private static eliminateHole(hole, outerNode?);
    /**
     *  David Eberly's algorithm for finding a bridge between hole and outer polygon:
     *  https://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf
     */
    private static findHoleBridge(hole, outerNode?);
    /** interlink polygon nodes in z-order */
    private static indexCurve(start, minX?, minY?, size?);
    /**
     * Simon Tatham's linked list merge sort algorithm
     * http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
     */
    private static sortLinked(list);
    /**
     * z-order of a point given coords and size of the data bounding box
     */
    private static zOrder(x, y, minX, minY, size);
    private static getLeftmost(start);
    /** check if a point lies within a convex triangle */
    private static pointInTriangle(ax, ay, bx, by, cx, cy, px, py);
    /** check if a diagonal between two polygon nodes is valid (lies in polygon interior) */
    private static isValidDiagonal(a, b);
    /** signed area of a triangle */
    private static area(p, q, r);
    /** check if two points are equal */
    private static equals(p1, p2);
    /** check if two segments intersect */
    private static intersects(p1, q1, p2, q2);
    /** check if a polygon diagonal intersects any polygon segments */
    private static intersectsPolygon(a, b);
    /** check if a polygon diagonal is locally inside the polygon */
    private static locallyInside(a, b);
    /** check if the middle point of a polygon diagonal is inside the polygon */
    private static middleInside(a, b);
    /**
     * link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
     * if one belongs to the outer ring and another to a hole, it merges it into a single ring
     * * Returns the base of the new edge at the "a" end.
     * * "a" and "b" still represent the same physical pieces of edges
     * @returns Returns the (base of) the new half edge, at the "a" end.
     */
    private static splitPolygon(a, b);
}
