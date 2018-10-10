/** @module CartesianGeometry */
import { Point3d } from "../PointVector";
import { ClipPlane } from "./ClipPlane";
import { ConvexClipPlaneSet } from "./ConvexClipPlaneSet";
import { CurvePrimitive, CurveLocationDetailPair } from "../curve/CurvePrimitive";
import { CurveCollection } from "../curve/CurveChain";
/**
 * An AlternatingConvexClipTreeNode is a node in a tree structure in which
 *   <ul>
 *   <li>Each node contains a ConvexClipPlaneSet
 *   <li>Each node contains an array of children which are also AlternativingConvexClipTreeNode.
 *   <li>The rule for an in/out decision is that a point is IN the subtree under a node if
 *   <ul>
 *   <li>It is IN the node's ConvexClipPlaneSet.
 *   <li>It is NOT IN any of the children.
 *   </ul>
 *   <li>Applying "NOT IN any of the children" locally to children at each level means that the ConvexClipPlaneSet
 *       at adjacent levels flip between being positive areas and holes.
 *   <li>Use an AlternatingConvexClipTreeNodeBuilder to construct the tree from a polygon.
 *   <li>It is possible for the root clip plane set to be empty.  An empty clip plane set returns "true"
 *         for all point tests, so the meaning is just that holes are to be subtracted from the rest
 *         of space.
 *   <li>Althogh the interpretation of in/out alternates with tree levels, the ConvexClipPlaneSets
 *         at each level are all "enclosing" planes in the usual way.
 *   </ul>
 */
export declare class AlternatingCCTreeNode {
    points: Point3d[];
    planes: ConvexClipPlaneSet;
    children: AlternatingCCTreeNode[];
    startIdx: number;
    numPoints: number;
    private constructor();
    /** Initialize this node with index data referencing the parent polygon. */
    static createWithIndices(index0: number, numPoints: number, result?: AlternatingCCTreeNode): AlternatingCCTreeNode;
    /**
     * <ul>
     * <li>Build the tree for a polygon.
     * <li>Caller creates the root node with empty constructor AlternatingConvexClipTreeNode.
     * </ul>
     */
    static createTreeForPolygon(points: Point3d[], result?: AlternatingCCTreeNode): AlternatingCCTreeNode;
    /** Resets this AlternatingConvexClipTreeNode to a newly-created state */
    empty(): void;
    /** Creates a deep copy of this node (expensive - copies Geometry, and is recursive for children array). */
    clone(result?: AlternatingCCTreeNode): AlternatingCCTreeNode;
    /** Add a new child that has an empty plane set and given indices. */
    addEmptyChild(index0: number, numPoints: number): void;
    /** Add a plane to the ConvexClipPlaneSet */
    addPlane(plane: ClipPlane): void;
    /** Search with alternating in and out semantics. */
    isPointOnOrInside(point: Point3d): boolean;
    /** Add an AlternatingConvexClipTreeNode as a child of this one -- i.e. a hole.
     * * The child pointer is pushed directly to the tree -- not cloned.
     */
    captureConvexClipPlaneSetAsVoid(child: AlternatingCCTreeNode): void;
    /** Append start-end positions for curve intervals classified as inside or outside. */
    appendCurvePrimitiveClipIntervals(curve: CurvePrimitive, insideIntervals: CurveLocationDetailPair[], outsideIntervals: CurveLocationDetailPair[]): void;
    /** Append start-end positions for curve intervals classified as inside or outside. */
    appendCurveCollectionClipIntervals(curves: CurveCollection, insideIntervals: CurveLocationDetailPair[], outsideIntervals: CurveLocationDetailPair[]): void;
}
/**
 *  Context structure for building an AlternatingConvexClipTreeNode from a polygon.
 *  <ul>
 *  <li> The polygon is copied to the local m_points structure.
 *  <li> During construction, m_stack contains indices of a sequence of points with uniform concavity.
 *  </ul>
 */
export declare class AlternatingCCTreeBuilder {
    private _points;
    private _stack;
    private constructor();
    static createPointsRef(points: Point3d[], result?: AlternatingCCTreeBuilder): AlternatingCCTreeBuilder;
    readonly period: number;
    indexAfter(i: number): number;
    indexBefore(i: number): number;
    pushIndex(primaryPointIndex: number): void;
    private static cross;
    cyclicStackPoint(cyclicIndex: number): Point3d;
    signFromStackTip(pointIndex: number, sign: number): 1 | -1;
    readonly indexOfMaxX: number;
    /** Pop from the stack until the sign condition is satisfied */
    extendHullChain(k: number, sign: number, pushAfterPops: boolean): void;
    collectHullChain(kStart: number, numK: number, sign: number): void;
    private buildHullTreeGo;
    /**
     * <ul>
     * <li> Input a ClipTreeRoot that has start and count data
     * <li> Build the hull for that data range
     * <li> Store the hull points in the root
     * <li> Add children with start and count data
     * <li> Recursivly move to children
     * </ul>
     */
    buildHullTree(root: AlternatingCCTreeNode): boolean;
}
export declare class AlternatingCCTreeNodeCurveClipper {
    private _curve;
    private _intervalStack;
    private _stackDepth;
    constructor();
    private setCurveRef;
    private popSegmentFrame;
    private clearSegmentStack;
    private pushEmptySegmentFrame;
    private _topOfStack;
    /** Access entry [topOfStack() - numSkip] */
    private stackEntry;
    private isTopOfStackEmpty;
    private static _fractionIntervals;
    private appendSingleClipToStack;
    /**
     * Run one level of recursion. On return, the stack is one level deeper than at entry and the new top of the stack has clip for this node
     * (expensive -- must clone items of arrays during "swaps")
     */
    private recurse;
    /**
     * Modifies the insideIntervvals array given in place.
     * Note: curve given is passed by reference and stored.
     */
    appendSingleClipPrimitive(root: AlternatingCCTreeNode, curve: CurvePrimitive, insideIntervals: CurveLocationDetailPair[], _outsideIntervals: CurveLocationDetailPair[]): void;
    /**
     * Modifies the insideIntervvals array given in place.
     * Note: curve given is passed by reference and stored.
     */
    appendCurveCollectionClip(root: AlternatingCCTreeNode, curve: CurveCollection, insideIntervals: CurveLocationDetailPair[], outsideIntervals: CurveLocationDetailPair[]): void;
}
//# sourceMappingURL=AlternatingConvexClipTree.d.ts.map