"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const MomentData_1 = require("../geometry4d/MomentData");
const RegionMomentsXY_1 = require("./RegionMomentsXY");
const Graph_1 = require("../topology/Graph");
const Triangulation_1 = require("../topology/Triangulation");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const IndexedXYZCollection_1 = require("../geometry3d/IndexedXYZCollection");
const RegularizeFace_1 = require("../topology/RegularizeFace");
const Merging_1 = require("../topology/Merging");
const HalfEdgeGraphSearch_1 = require("../topology/HalfEdgeGraphSearch");
const PolyfaceBuilder_1 = require("../polyface/PolyfaceBuilder");
const PolygonOffsetContext_1 = require("./PolygonOffsetContext");
const CurveCollection_1 = require("./CurveCollection");
const CurveWireMomentsXYZ_1 = require("./CurveWireMomentsXYZ");
const Geometry_1 = require("../Geometry");
const CurvePrimitive_1 = require("./CurvePrimitive");
const Loop_1 = require("./Loop");
const Path_1 = require("./Path");
const InOutTests_1 = require("./Query/InOutTests");
const CurveSplitContext_1 = require("./Query/CurveSplitContext");
const ChainCollectorContext_1 = require("./ChainCollectorContext");
const LineString3d_1 = require("./LineString3d");
const Transform_1 = require("../geometry3d/Transform");
const Point3dArrayCarrier_1 = require("../geometry3d/Point3dArrayCarrier");
const PolylineCompressionByEdgeOffset_1 = require("../geometry3d/PolylineCompressionByEdgeOffset");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const ConsolidateAdjacentPrimitivesContext_1 = require("./Query/ConsolidateAdjacentPrimitivesContext");
/**
 * base class for callbacks during region sweeps.
 * * At start of a component, `startComponent(node)` is called announcing a representative node on the outermost face.
 *   * A Component in this usage is a component that is edge connected when ignoring "exterior bridge edges".
 * * As each face is entered, `enterFace(facePathStack, newFaceNode)` is called
 *   * facePathStack[0] is the outermost node of the path from the outer face.
 *   * facePathStack[1] is its inside mate.
 *   * facePathStack[2k] is the outside node at crossing to face at depth k.
 *   * facePathStack[2k+1] is the node where face at depth k was entered.
 *   * newFaceNode is the entry node (redundant of stack tip)
 *  * On retreat from a face, `leaveFace(facePathStack, faceNode)` is called.
 *  * At end of component, `finishComponent (node)` is called.
 * * The base class is fully implemented to do nothing during the sweep.
 */
class RegionOpsFaceToFaceSearchCallbacks {
    /** Announce a representative node on the outer face of a component */
    startComponent(_node) { return true; }
    /** Announce return to outer face */
    finishComponent(_node) { return true; }
    /** Announce face entry */
    enterFace(_facePathStack, _newFaceNode) { return true; }
    /** Announce face exit */
    leaveFace(_facePathStack, _newFaceNode) { return true; }
}
/**
 * Implementations of `RegionOpsFaceToFaceSearchCallbacks` for binary boolean sweep.
 * * This assumes the each node in the graph has edgeTag set to:
 *   * `edgeTag === undefined` if the edge crossing the edge does not change classification.
 *     * for example, an edge added by regularization
 *   * `edgeTag === 1` if this is a boundary for the first of the boolean input regions
 *   * `edgeTag === 2` if this is a boundary for the first of the boolean input regions
 * * constructor
 *    * takes caller-supplied function to decide whether to accept a face given its state relative to the two boolean terms.
 *    * sets the in/out status of both terms to false.
 * * `startComponent` marks the entire outer face as `EXTERIOR`
 * * `enterFace`
 *    * if this is a bounding edge (according to `node.faceTag`) toggle the in/out status if this boolean term.
 *    * ask the faceAcceptFunction if the current term states combine to in/out for the result
 *    * if out, set the `EXTERIOR` mask around the face.
 * * `leaveFace`
 *    * if this is a bounding edge (according to `node.faceTag`) toggle the in/out status if this boolean term.
 * * `finishComponent` is not reimplemented.
 */
class RegionOpsBooleanSweepCallbacks extends RegionOpsFaceToFaceSearchCallbacks {
    constructor(acceptFaceFunction, exteriorMask) {
        super();
        this._inComponent = [false, false, false]; // entry 0 is never reused.
        this._exteriorMask = exteriorMask;
        this._faceSelectFunction = acceptFaceFunction;
    }
    /** Mark this face as exterior */
    startComponent(node) { node.setMaskAroundFace(this._exteriorMask); return true; }
    /**
     * * If necessary, toggle a term state.
     * * if indicated, mark this face exterior.
     */
    enterFace(_facePathStack, node) {
        const thisFaceIndex = node.edgeTag;
        if (node.edgeTag === 1 || node.edgeTag === 2)
            this._inComponent[thisFaceIndex] = !this._inComponent[thisFaceIndex];
        if (!this._faceSelectFunction(this._inComponent[1], this._inComponent[2]))
            node.setMaskAroundFace(this._exteriorMask);
        return true;
    }
    /**
     * * If necessary, toggle a term state.
     */
    leaveFace(_facePathStack, node) {
        const thisFaceIndex = node.edgeTag;
        if (node.edgeTag === 1 || node.edgeTag === 2)
            this._inComponent[thisFaceIndex] = !this._inComponent[thisFaceIndex];
        return true;
    }
}
/**
 * run a DFS with face-to-face step announcements.
 * * false return from any function terminates search immediately.
 * * all reachable nodes assumed to have both visit masks clear.
 * @param graph containing graph.
 * @param seed first node to visit.
 * @param faceHasBeenVisited mask marking faces that have been seen.
 * @param nodeHasBeenVisited mask marking node-to-node step around face.
 *
 */
function faceToFaceSearchFromOuterLoop(_graph, seed, faceHasBeenVisited, nodeHasBeenVisited, callbacks) {
    if (seed.isMaskSet(faceHasBeenVisited))
        return;
    if (!callbacks.startComponent(seed))
        return;
    const facePathStack = [];
    seed.setMaskAroundFace(faceHasBeenVisited);
    let faceWalker = seed;
    do {
        let entryNode = faceWalker;
        let mate = faceWalker.edgeMate;
        if (!mate.isMaskSet(faceHasBeenVisited)) {
            // the faceWalker seed is always on the base of the stack.
            // the stack then contains even-odd pairs of (entryNode, currentNode)
            // * entryNode is the node where a face was entered.
            // * faceNode is another node around that face.
            facePathStack.push(faceWalker);
            facePathStack.push(mate);
            let faceNode = mate.faceSuccessor;
            mate.setMaskAroundFace(faceHasBeenVisited);
            if (callbacks.enterFace(facePathStack, mate)) {
                for (;;) {
                    mate = faceNode.edgeMate;
                    if (!mate.isMaskSet(faceHasBeenVisited)) {
                        mate.setMaskAroundFace(faceHasBeenVisited);
                        if (!callbacks.enterFace(facePathStack, mate))
                            return;
                        facePathStack.push(faceNode);
                        facePathStack.push(mate);
                        faceNode = mate;
                        entryNode = mate;
                    }
                    faceNode.setMask(nodeHasBeenVisited);
                    faceNode = faceNode.faceSuccessor;
                    if (faceNode === entryNode) {
                        callbacks.leaveFace(facePathStack, faceNode);
                        if (facePathStack.length <= 2) {
                            break;
                        }
                        facePathStack.pop();
                        faceNode = facePathStack[facePathStack.length - 1];
                        facePathStack.pop();
                        entryNode = facePathStack[facePathStack.length - 1];
                    }
                    if (faceNode.isMaskSet(nodeHasBeenVisited)) {
                        // this is disaster !!!
                        return;
                    }
                }
            }
        }
        // continue at outermost level .....
        faceWalker = faceWalker.faceSuccessor;
    } while (faceWalker !== seed);
    callbacks.finishComponent(seed);
}
/** Complete multi-step process for polygon binary booleans starting with arrays of coordinates.
 * * Each of the binary input terms is a collection of loops
 *   * Within the binary term, in/out is determined by edge-crossing parity rules.
 * * Processing steps are
 *   * Build the loops for each set.
 *      * Each edge labeled with 1 or 2 as binary term identifier.
 *   * find crossings among the edges.
 *      * Edges are split as needed, but split preserves the edgeTag
 *   * sort edges around vertices
 *   * add regularization edges so holes are connected to their parent.
 */
function doPolygonBoolean(loopsA, loopsB, faceSelectFunction, graphCheckPoint) {
    const graph = new Graph_1.HalfEdgeGraph();
    const baseMask = Graph_1.HalfEdgeMask.BOUNDARY_EDGE | Graph_1.HalfEdgeMask.PRIMARY_EDGE;
    const seedA = RegionOps.addLoopsWithEdgeTagToGraph(graph, loopsA, baseMask, 1);
    const seedB = RegionOps.addLoopsWithEdgeTagToGraph(graph, loopsB, baseMask, 2);
    if (graphCheckPoint)
        graphCheckPoint("unmerged loops", graph, "U");
    if (seedA && seedB) {
        // split edges where they cross . . .
        Merging_1.HalfEdgeGraphMerge.splitIntersectingEdges(graph);
        if (graphCheckPoint)
            graphCheckPoint("After splitIntersectingEdges", graph, "U");
        // sort radially around vertices.
        Merging_1.HalfEdgeGraphMerge.clusterAndMergeXYTheta(graph);
        if (graphCheckPoint)
            graphCheckPoint("After clusterAndMergeXYTheta", graph, "M");
        // add edges to connect various components  (e.g. holes!!!)
        const context = new RegularizeFace_1.RegularizationContext(graph);
        context.regularizeGraph(true, true);
        if (graphCheckPoint)
            graphCheckPoint("After regularize", graph, "MR");
        const exteriorHalfEdge = HalfEdgeGraphSearch_1.HalfEdgeGraphSearch.findMinimumAreaFace(graph);
        const exteriorMask = Graph_1.HalfEdgeMask.EXTERIOR;
        const faceVisitedMask = graph.grabMask();
        const nodeVisitedMask = graph.grabMask();
        const allMasksToClear = exteriorMask | faceVisitedMask | nodeVisitedMask;
        graph.clearMask(allMasksToClear);
        const callbacks = new RegionOpsBooleanSweepCallbacks(faceSelectFunction, exteriorMask);
        faceToFaceSearchFromOuterLoop(graph, exteriorHalfEdge, faceVisitedMask, nodeVisitedMask, callbacks);
        if (graphCheckPoint)
            graphCheckPoint("After faceToFaceSearchFromOuterLoop", graph, "MRX");
        graph.dropMask(faceVisitedMask);
        graph.dropMask(nodeVisitedMask);
        return PolyfaceBuilder_1.PolyfaceBuilder.graphToPolyface(graph);
    }
    return undefined;
}
/**
 * class `RegionOps` has static members for calculations on regions (areas).
 * * Regions are represented by these `CurveCollection` subclasses:
 * * `Loop` -- a single loop
 * * `ParityRegion` -- a collection of loops, interpreted by parity rules.
 *    * The common "One outer loop and many Inner loops" is a parity region.
 * * `UnionRegion` -- a collection of `Loop` and `ParityRegion` objects understood as a (probably disjoint) union.
 * @beta
 */
class RegionOps {
    /**
     * Return moment sums for a loop, parity region, or union region.
     * * If `rawMomentData` is the MomentData returned by computeXYAreaMoments, convert to principal axes and moments with
     *    call `principalMomentData = MomentData.inertiaProductsToPrincipalAxes (rawMomentData.origin, rawMomentData.sums);`
     * @param root any Loop, ParityRegion, or UnionRegion.
     */
    static computeXYAreaMoments(root) {
        const handler = new RegionMomentsXY_1.RegionMomentsXY();
        const result = root.dispatchToGeometryHandler(handler);
        if (result instanceof MomentData_1.MomentData) {
            result.shiftOriginAndSumsToCentroidOfSums();
            return result;
        }
        return undefined;
    }
    /** Return MomentData with the sums of wire moments.
     * * If `rawMomentData` is the MomentData returned by computeXYAreaMoments, convert to principal axes and moments with
     *    call `principalMomentData = MomentData.inertiaProductsToPrincipalAxes (rawMomentData.origin, rawMomentData.sums);`
     */
    static computeXYZWireMomentSums(root) {
        const handler = new CurveWireMomentsXYZ_1.CurveWireMomentsXYZ();
        handler.visitLeaves(root);
        const result = handler.momentData;
        result.shiftOriginAndSumsToCentroidOfSums();
        return result;
    }
    /**
     * * create loops in the graph.
     * @internal
     */
    static addLoopsToGraph(graph, data, announceIsolatedLoop) {
        if (data instanceof IndexedXYZCollection_1.IndexedXYZCollection) {
            const loopSeed = Triangulation_1.Triangulator.directCreateFaceLoopFromCoordinates(graph, data);
            if (loopSeed !== undefined)
                announceIsolatedLoop(graph, loopSeed);
        }
        else if (Array.isArray(data)) {
            if (data.length > 0) {
                if (Point3dVector3d_1.Point3d.isXAndY(data[0])) {
                    const loopSeed = Triangulation_1.Triangulator.directCreateFaceLoopFromCoordinates(graph, data);
                    if (loopSeed !== undefined)
                        announceIsolatedLoop(graph, loopSeed);
                }
                else if (data[0] instanceof IndexedXYZCollection_1.IndexedXYZCollection) {
                    for (const loop of data) {
                        const loopSeed = Triangulation_1.Triangulator.directCreateFaceLoopFromCoordinates(graph, loop);
                        if (loopSeed !== undefined)
                            announceIsolatedLoop(graph, loopSeed);
                    }
                }
            }
        }
    }
    /** Add multiple loops to a graph.
     * * Apply edgeTag and mask to each edge.
     * @internal
     */
    static addLoopsWithEdgeTagToGraph(graph, data, mask, edgeTag) {
        const loopSeeds = [];
        this.addLoopsToGraph(graph, data, (_graph, seed) => {
            if (seed) {
                loopSeeds.push(seed);
                seed.setMaskAndEdgeTagAroundFace(mask, edgeTag, true);
            }
        });
        if (loopSeeds.length > 0)
            return loopSeeds;
        return undefined;
    }
    /**
     * return a polyface containing the area union of two XY regions.
     * * Within each region, in and out is determined by parity rules.
     *   * Any face that is an odd number of crossings from the far outside is IN
     *   * Any face that is an even number of crossings from the far outside is OUT
     * @param loopsA first set of loops
     * @param loopsB second set of loops
     */
    static polygonXYAreaIntersectLoopsToPolyface(loopsA, loopsB) {
        return doPolygonBoolean(loopsA, loopsB, (inA, inB) => (inA && inB), this._graphCheckPointFunction);
    }
    /**
     * return a polyface containing the area intersection of two XY regions.
     * * Within each region, in and out is determined by parity rules.
     *   * Any face that is an odd number of crossings from the far outside is IN
     *   * Any face that is an even number of crossings from the far outside is OUT
     * @param loopsA first set of loops
     * @param loopsB second set of loops
     */
    static polygonXYAreaUnionLoopsToPolyface(loopsA, loopsB) {
        return doPolygonBoolean(loopsA, loopsB, (inA, inB) => (inA || inB), this._graphCheckPointFunction);
    }
    /**
     * return a polyface containing the area difference of two XY regions.
     * * Within each region, in and out is determined by parity rules.
     *   * Any face that is an odd number of crossings from the far outside is IN
     *   * Any face that is an even number of crossings from the far outside is OUT
     * @param loopsA first set of loops
     * @param loopsB second set of loops
     */
    static polygonXYAreaDifferenceLoopsToPolyface(loopsA, loopsB) {
        return doPolygonBoolean(loopsA, loopsB, (inA, inB) => (inA && !inB), this._graphCheckPointFunction);
    }
    /** Construct a wire (not area!!) that is offset from given polyline or polygon.
     * * This is a simple wire offset, not an area.
     * * The construction algorithm attempts to eliminate some self-intersections within the offsets, but does not guarantee a simple area offset.
     * * The construction algorithm is subject to being changed, resulting in different (hopefully better) self-intersection behavior on the future.
     * @param points a single loop or path
     * @param wrap true to include wraparound
     * @param offsetDistance distance of offset from wire.  Positive is left.
     * @beta
     */
    static constructPolygonWireXYOffset(points, wrap, offsetDistance) {
        const context = new PolygonOffsetContext_1.PolygonWireOffsetContext();
        return context.constructPolygonWireXYOffset(points, wrap, offsetDistance);
    }
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
    static constructCurveXYOffset(curves, offsetDistanceOrOptions) {
        const options = PolygonOffsetContext_1.JointOptions.create(offsetDistanceOrOptions);
        return PolygonOffsetContext_1.CurveChainWireOffsetContext.constructCurveXYOffset(curves, options);
    }
    /**
     * Test if point (x,y) is IN, OUT or ON a polygon.
     * @return (1) for in, (-1) for OUT, (0) for ON
     * @param x x coordinate
     * @param y y coordinate
     * @param points array of xy coordinates.
     */
    static testPointInOnOutRegionXY(curves, x, y) {
        return InOutTests_1.PointInOnOutContext.testPointInOnOutRegionXY(curves, x, y);
    }
    /** Create curve collection of subtype determined by gaps between the input curves.
     * * If (a) wrap is requested and (b) all curves connect head-to-tail (including wraparound), assemble as a `loop`.
     * * If all curves connect head-to-tail except for closure, return a `Path`.
     * * If there are internal gaps, return a `BagOfCurves`
     * * If input array has zero length, return undefined.
     */
    static createLoopPathOrBagOfCurves(curves, wrap = true) {
        const n = curves.length;
        if (n === 0)
            return undefined;
        let maxGap = 0.0;
        if (wrap)
            maxGap = Geometry_1.Geometry.maxXY(maxGap, curves[0].startPoint().distance(curves[n - 1].endPoint()));
        for (let i = 0; i + 1 < n; i++)
            maxGap = Geometry_1.Geometry.maxXY(maxGap, curves[i].endPoint().distance(curves[i + 1].startPoint()));
        let collection;
        if (Geometry_1.Geometry.isSmallMetricDistance(maxGap)) {
            collection = wrap ? Loop_1.Loop.create() : Path_1.Path.create();
        }
        else {
            collection = CurveCollection_1.BagOfCurves.create();
        }
        for (const c of curves)
            collection.tryAddChild(c);
        return collection;
    }
    /**
     * Announce Checkpoint function for use during booleans
     * @internal
     */
    static setCheckPointFunction(f) { this._graphCheckPointFunction = f; }
    /**
     * * Find all intersections among curves in `curvesToCut` and `cutterCurves`
     * * Return fragments of `curvesToCut`.
     * * For a  `Loop`, `ParityRegion`, or `UnionRegion` in `curvesToCut`
     *    * if it is never cut by any `cutter` curve, it will be left unchanged.
     *    * if cut, the input is downgraded to a set of `Path` curves joining at the cut points.
     * * All cutting is "as viewed in the xy plane"
     */
    static cloneCurvesWithXYSplitFlags(curvesToCut, cutterCurves) {
        return CurveSplitContext_1.CurveSplitContext.cloneCurvesWithXYSplitFlags(curvesToCut, cutterCurves);
    }
    /**
     * Create paths assembled from many curves.
     * * Assemble consecutive curves NOT separated by either end flags or gaps into paths.
     * * Return simplest form -- single primitive, single path, or bag of curves.
     * @param curves
     */
    static splitToPathsBetweenFlagBreaks(source, makeClones) {
        if (source === undefined)
            return undefined;
        if (source instanceof CurvePrimitive_1.CurvePrimitive)
            return source;
        // source is a collection .  ..
        const primitives = source.collectCurvePrimitives();
        const chainCollector = new ChainCollectorContext_1.ChainCollectorContext(makeClones);
        for (const primitive of primitives) {
            chainCollector.announceCurvePrimitive(primitive);
        }
        return chainCollector.grabResult();
    }
    /**
     * * Find intersections of `curvesToCut` with boundaries of `region`.
     * * Break `curvesToCut` into parts inside, outside, and coincident.
     * * Return all fragments, split among `insideParts`, `outsideParts`, and `coincidentParts` in the output object.
     */
    static splitPathsByRegionInOnOutXY(curvesToCut, region) {
        const result = { insideParts: [], outsideParts: [], coincidentParts: [] };
        const pathWithIntersectionMarkup = RegionOps.cloneCurvesWithXYSplitFlags(curvesToCut, region);
        const splitPaths = RegionOps.splitToPathsBetweenFlagBreaks(pathWithIntersectionMarkup, true);
        if (splitPaths instanceof CurveCollection_1.CurveCollection) {
            for (const child of splitPaths.children) {
                const pointOnChild = CurveCollection_1.CurveCollection.createCurveLocationDetailOnAnyCurvePrimitive(child);
                if (pointOnChild) {
                    const inOnOut = RegionOps.testPointInOnOutRegionXY(region, pointOnChild.point.x, pointOnChild.point.y);
                    pushToInOnOutArrays(child, inOnOut, result.outsideParts, result.coincidentParts, result.insideParts);
                }
            }
        }
        else if (splitPaths instanceof CurvePrimitive_1.CurvePrimitive) {
            const pointOnChild = CurveCollection_1.CurveCollection.createCurveLocationDetailOnAnyCurvePrimitive(splitPaths);
            if (pointOnChild) {
                const inOnOut = RegionOps.testPointInOnOutRegionXY(region, pointOnChild.point.x, pointOnChild.point.y);
                pushToInOnOutArrays(splitPaths, inOnOut, result.outsideParts, result.coincidentParts, result.insideParts);
            }
        }
        return result;
    }
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
    static rectangleEdgeTransform(data, requireClosurePoint = true) {
        if (data instanceof LineString3d_1.LineString3d) {
            return this.rectangleEdgeTransform(data.packedPoints);
        }
        else if (data instanceof IndexedXYZCollection_1.IndexedXYZCollection) {
            let dataToUse;
            if (requireClosurePoint && data.length === 5) {
                if (!Geometry_1.Geometry.isSmallMetricDistance(data.distanceIndexIndex(0, 4)))
                    return undefined;
                dataToUse = data;
            }
            else if (!requireClosurePoint && data.length === 4)
                dataToUse = data;
            else if (data.length < (requireClosurePoint ? 5 : 4)) {
                return undefined;
            }
            else {
                dataToUse = GrowableXYZArray_1.GrowableXYZArray.create(data);
                PolylineCompressionByEdgeOffset_1.PolylineCompressionContext.compressInPlaceByShortEdgeLength(dataToUse, Geometry_1.Geometry.smallMetricDistance);
            }
            const vector01 = dataToUse.vectorIndexIndex(0, 1);
            const vector03 = dataToUse.vectorIndexIndex(0, 3);
            const vector12 = dataToUse.vectorIndexIndex(1, 2);
            const normalVector = vector01.crossProduct(vector03);
            if (normalVector.normalizeInPlace()
                && vector12.isAlmostEqual(vector03)
                && vector01.isPerpendicularTo(vector03)) {
                return Transform_1.Transform.createOriginAndMatrixColumns(dataToUse.getPoint3dAtUncheckedPointIndex(0), vector01, vector03, normalVector);
            }
        }
        else if (Array.isArray(data)) {
            return this.rectangleEdgeTransform(new Point3dArrayCarrier_1.Point3dArrayCarrier(data), requireClosurePoint);
        }
        else if (data instanceof Loop_1.Loop && data.children.length === 1 && data.children[0] instanceof LineString3d_1.LineString3d) {
            return this.rectangleEdgeTransform(data.children[0].packedPoints, true);
        }
        else if (data instanceof Path_1.Path && data.children.length === 1 && data.children[0] instanceof LineString3d_1.LineString3d) {
            return this.rectangleEdgeTransform(data.children[0].packedPoints, requireClosurePoint);
        }
        else if (data instanceof CurveCollection_1.CurveChain) {
            if (!data.checkForNonLinearPrimitives()) {
                // const linestring = LineString3d.create();
                const strokes = data.getPackedStrokes();
                if (strokes) {
                    return this.rectangleEdgeTransform(strokes);
                }
            }
        }
        return undefined;
    }
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
    static consolidateAdjacentPrimitives(curves, options) {
        const context = new ConsolidateAdjacentPrimitivesContext_1.ConsolidateAdjacentCurvePrimitivesContext(options);
        curves.dispatchToGeometryHandler(context);
    }
}
exports.RegionOps = RegionOps;
function pushToInOnOutArrays(curve, select, arrayNegative, array0, arrayPositive) {
    if (select > 0)
        arrayPositive.push(curve);
    else if (select < 0)
        arrayNegative.push(curve);
    else
        array0.push(curve);
}
//# sourceMappingURL=RegionOps.js.map