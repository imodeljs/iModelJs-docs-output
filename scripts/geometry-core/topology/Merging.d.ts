import { LineSegment3d } from "../curve/LineSegment3d";
import { HalfEdgeGraph } from "./Graph";
export declare class Merger {
    /** Compare function for sorting X, Y, and theta componenets stored in a Point3d, useful for forming a graph from an array of segments */
    private static XYThetaCompare(a, b);
    /** Compare function for sorting the "event queue" when searching for crossings of line segments in an array of segments (x increasing) */
    private static eventCompareCrossings(a, b);
    /** Compare function for sorting the "event queue" when sweeping a polygon forming trapezoid sections (y increasing) */
    private static eventCompareTrapezoidation(a, b);
    /** Returns the greatest y-value of a segment */
    private static getHighValueOfSegment(seg);
    /** Returns the lowest y-value of a segment */
    private static getLowValueOfSegment(seg);
    /** Returns the lowest x-value of a segment */
    private static getLeftValueOfSegment(seg);
    /** Returns the greatest x-value of a segment */
    private static getRightValueOfSegment(seg);
    /** Returns a reference to the point of a segment that lies farther left along the x-axis (if same x, use smaller y value) */
    private static getLeftmostPointOfSegment(seg);
    /** Returns a reference to the point of a segment that lies farther right along the x-axis (if same x, use greater y value) */
    private static getRightmostPointOfSegment(seg);
    /** Returns an array of a Point3d holding x, y, and theta values for a point, and a corresponding node. Useful for organizing/sorting nodes */
    private static segmentsToXYThetaNode(segments, returnGraph);
    /** Given two segments, uses the equations of the two representative lines and the determinant to give a point of intersection;
     *  Note that when point is found, it may fall outside bounds of segments. Therefore, extra check for in bounds is necessary.
     */
    private static getIntersectionOfSegments(seg1, seg2, checkInBounds);
    /**
     * sorts a number array and filters out 0's, 1's, and duplicates...
     * useful when trying to simplify the found intersections of each segment in an array
     */
    private static sortAndFilterCrossings(arr);
    /**
     * Returns an array for each index of the segments array given, which holds the fractional moments of intersection along that segment
     *
     * *  Creates a queue array of left-most segment points, paired with a link back to its original index into the segment array given
     * *  For each 'event' in the queue, check its corresponding segment for intersections with segments whose left-most points
     *      appear before this event's right-most point
     */
    private static findCrossings(segments);
    /**
     * Returns a graph structure formed from the given LineSegment array
     *
     * *  Find all intersections of each segment, and split them if necessary
     * *  Record endpoints of every segment in the form X, Y, Theta; This information is stored as a new node and sorted to match up
     *      vertices.
     * *  For vertices that match up, pinch the nodes to create vertex loops, which in closed objects, will also eventually form face
     *      loops
     */
    static formGraphFromSegments(lineSegments: LineSegment3d[]): HalfEdgeGraph;
    /** For every event, pair it with other events of the closest segments that this event's horizontal would hit on the left and right */
    private static setQueuePairings(queue);
    /**
     * Form a new connection between two nodes, patching up pointers in the creation of new face loops
     * * !! mark both new half edges visited!!! (This is strange)
     */
    private static join(node0, node1, graph);
    private static getNodeToJoin(eventNode, toCheckNode);
    /** Check a variety of cases by which adding a diagonal is allowed. If one is found, link nodes and return. */
    private static checkAndAddDiagonal(event, toCheck, graph);
    /** Sweep over an event queue, adding new diagonal segments where possible in the formation of monotone faces */
    private static sweepDownUp(queue, graph);
    static formMonotoneFaces(graph: HalfEdgeGraph): void;
}
export declare class GraphMerge {
    /** Simplest merge algorithm:
     * * collect array of (x,y,theta) at all nodes
     * * lexical sort of the array.
     * * twist all vertices together.
     * * This effectively creates valid face loops for a planar subdivision if there are no edge crossings.
     * * If there are edge crossings, the graph can be a (highly complicated) Klein bottle topoogy.
     */
    static clusterAndMergeXYTheta(graph: HalfEdgeGraph): void;
}
