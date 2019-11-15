/** @module Curve */
import { AnyRegion, AnyCurve } from "./CurveChain";
import { MomentData } from "../geometry4d/MomentData";
import { HalfEdgeGraph, HalfEdge, HalfEdgeMask } from "../topology/Graph";
import { MultiLineStringDataVariant } from "../topology/Triangulation";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { IndexedXYZCollection } from "../geometry3d/IndexedXYZCollection";
import { Polyface } from "../polyface/Polyface";
import { JointOptions } from "./PolygonOffsetContext";
import { CurveCollection, BagOfCurves, ConsolidateAdjacentCurvePrimitivesOptions } from "./CurveCollection";
import { CurvePrimitive } from "./CurvePrimitive";
import { Loop } from "./Loop";
import { Path } from "./Path";
import { Transform } from "../geometry3d/Transform";
/**
 * * `properties` is a string with special characters indicating
 *   * "U" -- contains unmerged stick data
 *   * "M" -- merged
 *   * "R" -- regularized
 *   * "X" -- has exterior markup
 * @internal
 */
export declare type GraphCheckPointFunction = (name: string, graph: HalfEdgeGraph, properties: string, extraData?: any) => any;
/**
 * class `RegionOps` has static members for calculations on regions (areas).
 * * Regions are represented by these `CurveCollection` subclasses:
 * * `Loop` -- a single loop
 * * `ParityRegion` -- a collection of loops, interpreted by parity rules.
 *    * The common "One outer loop and many Inner loops" is a parity region.
 * * `UnionRegion` -- a collection of `Loop` and `ParityRegion` objects understood as a (probably disjoint) union.
 * @beta
 */
export declare class RegionOps {
    /**
     * Return moment sums for a loop, parity region, or union region.
     * * If `rawMomentData` is the MomentData returned by computeXYAreaMoments, convert to principal axes and moments with
     *    call `principalMomentData = MomentData.inertiaProductsToPrincipalAxes (rawMomentData.origin, rawMomentData.sums);`
     * @param root any Loop, ParityRegion, or UnionRegion.
     */
    static computeXYAreaMoments(root: AnyRegion): MomentData | undefined;
    /** Return MomentData with the sums of wire moments.
     * * If `rawMomentData` is the MomentData returned by computeXYAreaMoments, convert to principal axes and moments with
     *    call `principalMomentData = MomentData.inertiaProductsToPrincipalAxes (rawMomentData.origin, rawMomentData.sums);`
     */
    static computeXYZWireMomentSums(root: AnyCurve): MomentData | undefined;
    /**
     * * create loops in the graph.
     * @internal
     */
    static addLoopsToGraph(graph: HalfEdgeGraph, data: MultiLineStringDataVariant, announceIsolatedLoop: (graph: HalfEdgeGraph, seed: HalfEdge) => void): void;
    /** Add multiple loops to a graph.
     * * Apply edgeTag and mask to each edge.
     * @internal
     */
    static addLoopsWithEdgeTagToGraph(graph: HalfEdgeGraph, data: MultiLineStringDataVariant, mask: HalfEdgeMask, edgeTag: any): HalfEdge[] | undefined;
    /**
     * return a polyface containing the area union of two XY regions.
     * * Within each region, in and out is determined by parity rules.
     *   * Any face that is an odd number of crossings from the far outside is IN
     *   * Any face that is an even number of crossings from the far outside is OUT
     * @param loopsA first set of loops
     * @param loopsB second set of loops
     */
    static polygonXYAreaIntersectLoopsToPolyface(loopsA: MultiLineStringDataVariant, loopsB: MultiLineStringDataVariant): Polyface | undefined;
    /**
     * return a polyface containing the area intersection of two XY regions.
     * * Within each region, in and out is determined by parity rules.
     *   * Any face that is an odd number of crossings from the far outside is IN
     *   * Any face that is an even number of crossings from the far outside is OUT
     * @param loopsA first set of loops
     * @param loopsB second set of loops
     */
    static polygonXYAreaUnionLoopsToPolyface(loopsA: MultiLineStringDataVariant, loopsB: MultiLineStringDataVariant): Polyface | undefined;
    /**
     * return a polyface containing the area difference of two XY regions.
     * * Within each region, in and out is determined by parity rules.
     *   * Any face that is an odd number of crossings from the far outside is IN
     *   * Any face that is an even number of crossings from the far outside is OUT
     * @param loopsA first set of loops
     * @param loopsB second set of loops
     */
    static polygonXYAreaDifferenceLoopsToPolyface(loopsA: MultiLineStringDataVariant, loopsB: MultiLineStringDataVariant): Polyface | undefined;
    /** Construct a wire (not area!!) that is offset from given polyline or polygon.
     * * This is a simple wire offset, not an area.
     * * The construction algorithm attempts to eliminate some self-intersections within the offsets, but does not guarantee a simple area offset.
     * * The construction algorithm is subject to being changed, resulting in different (hopefully better) self-intersection behavior on the future.
     * @param points a single loop or path
     * @param wrap true to include wraparound
     * @param offsetDistance distance of offset from wire.  Positive is left.
     * @beta
     */
    static constructPolygonWireXYOffset(points: Point3d[], wrap: boolean, offsetDistance: number): CurveCollection | undefined;
    /**
     * Construct curves that are offset from a Path or Loop
     * * The construction will remove "some" local effects of features smaller than the offset distance, but will not detect self intersection among widely separated edges.
     * * Offset distance is defined as positive to the left.
     * * If offsetDistanceOrOptions is given as a number, default options are applied.
     * * When the offset needs to do an "outside" turn, the first applicable construction is applied:
     *   * If the turn is larger than `options.minArcDegrees`, a circular arc is constructed.
     *   * if the turn is larger than `options.maxChamferDegrees`, the turn is constructed as a sequence of straight lines that are
     *      * outside the arc
     *      * have uniform turn angle less than `options.maxChamferDegrees`
     *      * each line segment (except first and last) touches the arc at its midpoint.
     *   * Otherwise the prior and successor curves are extended to simple intersection.
     * @param curves input curves
     * @param offsetDistanceOrOptions offset controls.
     */
    static constructCurveXYOffset(curves: Path | Loop, offsetDistanceOrOptions: number | JointOptions): CurveCollection | undefined;
    /**
     * Test if point (x,y) is IN, OUT or ON a polygon.
     * @return (1) for in, (-1) for OUT, (0) for ON
     * @param x x coordinate
     * @param y y coordinate
     * @param points array of xy coordinates.
     */
    static testPointInOnOutRegionXY(curves: AnyRegion, x: number, y: number): number;
    /** Create curve collection of subtype determined by gaps between the input curves.
     * * If (a) wrap is requested and (b) all curves connect head-to-tail (including wraparound), assemble as a `loop`.
     * * If all curves connect head-to-tail except for closure, return a `Path`.
     * * If there are internal gaps, return a `BagOfCurves`
     * * If input array has zero length, return undefined.
     */
    static createLoopPathOrBagOfCurves(curves: CurvePrimitive[], wrap?: boolean): CurveCollection | undefined;
    private static _graphCheckPointFunction?;
    /**
     * Announce Checkpoint function for use during booleans
     * @internal
     */
    static setCheckPointFunction(f?: GraphCheckPointFunction): void;
    /**
     * * Find all intersections among curves in `curvesToCut` and `cutterCurves`
     * * Return fragments of `curvesToCut`.
     * * For a  `Loop`, `ParityRegion`, or `UnionRegion` in `curvesToCut`
     *    * if it is never cut by any `cutter` curve, it will be left unchanged.
     *    * if cut, the input is downgraded to a set of `Path` curves joining at the cut points.
     * * All cutting is "as viewed in the xy plane"
     */
    static cloneCurvesWithXYSplitFlags(curvesToCut: CurvePrimitive | CurveCollection | undefined, cutterCurves: CurveCollection): CurveCollection | CurvePrimitive | undefined;
    /**
     * Create paths assembled from many curves.
     * * Assemble consecutive curves NOT separated by either end flags or gaps into paths.
     * * Return simplest form -- single primitive, single path, or bag of curves.
     * @param curves
     */
    static splitToPathsBetweenFlagBreaks(source: CurveCollection | CurvePrimitive | undefined, makeClones: boolean): BagOfCurves | Path | CurvePrimitive | undefined;
    /**
     * * Find intersections of `curvesToCut` with boundaries of `region`.
     * * Break `curvesToCut` into parts inside, outside, and coincident.
     * * Return all fragments, split among `insideParts`, `outsideParts`, and `coincidentParts` in the output object.
     */
    static splitPathsByRegionInOnOutXY(curvesToCut: CurveCollection | CurvePrimitive | undefined, region: AnyRegion): {
        insideParts: AnyCurve[];
        outsideParts: AnyCurve[];
        coincidentParts: AnyCurve[];
    };
    /** Test if `data` is one of several forms of a rectangle.
     * * If so, return transform with
     *   * origin at one corner
     *   * x and y columns extend along two adjacent sides
     *   * z column is unit normal.
     * * The recognized data forms for simple analysis of points are:
     *   * LineString
     *   * Loop containing rectangle content
     *   * Path containing rectangle content
     *   * Array of Point3d[]
     *   * IndexedXYZCollection
     * * Points are considered a rectangle if
     *   * Within the first 4 points
     *     * vectors from 0 to 1 and 0 to 3 are perpendicular and have a non-zero cross product
     *     * vectors from 0 to 3 and 1 to 2 are the same
     *  * optionally require a 5th point that closes back to point0
     *  * If there are other than the basic number of points (4 or 5) the data
     */
    static rectangleEdgeTransform(data: AnyCurve | Point3d[] | IndexedXYZCollection, requireClosurePoint?: boolean): Transform | undefined;
    /**
     * Look for and simplify:
     * * Contiguous `LineSegment3d` and `LineString3d` objects.
     *   * collect all points
     *   * eliminate duplicated points
     *   * eliminate points colinear with surrounding points.
     *  * Contigous concentric circular or elliptic arcs
     *   * combine angular ranges
     * @param curves Path or loop (or larger collection containing paths and loops) to be simplified
     * @param options options for tolerance and selective simplification.
     */
    static consolidateAdjacentPrimitives(curves: CurveCollection, options?: ConsolidateAdjacentCurvePrimitivesOptions): void;
}
//# sourceMappingURL=RegionOps.d.ts.map