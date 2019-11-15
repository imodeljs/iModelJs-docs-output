"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Topology */
const Geometry_1 = require("../Geometry");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Graph_1 = require("./Graph");
const Merging_1 = require("./Merging");
const LineString3d_1 = require("../curve/LineString3d");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
/** Internal form of ChainMergeContextOptions -- same field names, but required to have contents. */
class ChainMergeContextValidatedOptions {
    /**
     * PRIVATE constructor -- assumes all inputs are validated in public create method !!!!
     * @param tolerance
     * @param unitVectorForPrimarySort
     */
    constructor(tolerance, unitVectorForPrimarySort) {
        /**
         * Tolerance for declaring points equal.
         */
        this.tolerance = Geometry_1.Geometry.smallMetricDistance;
        this.tolerance = tolerance;
        this.primarySortDirection = unitVectorForPrimarySort;
    }
    /** return a unit vector aligned with optional direction.
     * * Default return is into the first quadrant at a quirky angle so any perpendicular plane is unlikely to hit many points
     */
    static createPrimarySortVector(vector) {
        if (vector === undefined) {
            vector = this._defaultPrimarySortDirection.clone();
        }
        return vector.normalizeWithDefault(ChainMergeContextValidatedOptions._defaultPrimarySortDirection.x, ChainMergeContextValidatedOptions._defaultPrimarySortDirection.y, ChainMergeContextValidatedOptions._defaultPrimarySortDirection.z);
    }
    /** return the default option set. */
    static createFromUnValidated(options) {
        const result = new ChainMergeContextValidatedOptions(Geometry_1.Geometry.smallMetricDistance, ChainMergeContextValidatedOptions.createPrimarySortVector());
        if (options !== undefined) {
            if (options.tolerance !== undefined)
                result.tolerance = options.tolerance;
            if (options.primarySortDirection !== undefined)
                result.primarySortDirection = ChainMergeContextValidatedOptions.createPrimarySortVector();
        }
        return result;
    }
    /** Clone this context. */
    clone() {
        return new ChainMergeContextValidatedOptions(this.tolerance, this.primarySortDirection);
    }
}
/** UNNORMALIZED base vector for sorting.
 * * Actual vector hoisted into an instance is normalized.
 */
ChainMergeContextValidatedOptions._defaultPrimarySortDirection = Point3dVector3d_1.Vector3d.create(0.294234298, 0.72391399, 0.45234328798);
/**
 * * Context for assembling line segments into chains.
 * * Use the context in phases:
 *   * Create the context:   `context = ChainMergeContext.create ()`
 *   * Add line with any combination of:
 *      * `context.addSegment(pointA, pointB)`
 *      * `context.addLineSegment3dArray (segments)`
 *   * Scan all coordinate data for common coordinates.  Twist nodes together to form chains:
 *      * `context.clusterAndMergeVerticesXYZ ()`
 *   * Collect the chains:
 *      * myLinestringArray = context.collectMaximalChains();
 *
 * @internal
 */
class ChainMergeContext {
    constructor(options) {
        this._graph = new Graph_1.HalfEdgeGraph();
        this._options = options;
    }
    /**
     * * Construct an empty chain merge graph.
     * * The options parameter may contain any combination of the options values.
     *   * tolerance = absolute tolerance for declaring points equal.
     *     * Default is `Geometry.smallMetricDistance`
     *   * primarySortDirection = direction for first sort.
     *     * To minimize clash among points on primary sort, this should NOT be perpendicular to any principal plane.
     *     * The default points into the first octant with inobvious components.
     */
    static create(options) {
        const validatedOptions = ChainMergeContextValidatedOptions.createFromUnValidated(options);
        return new ChainMergeContext(validatedOptions);
    }
    /** Add a segment to the evolving graph. */
    addSegment(pointA, pointB) {
        this._graph.createEdgeXYZXYZ(pointA.x, pointA.y, pointA.z, 0, pointB.x, pointB.y, pointB.z, 0);
    }
    /** Add all segments from an array to the graph. */
    addLineSegment3dArray(data) {
        for (const segment of data) {
            this.addSegment(segment.point0Ref, segment.point1Ref);
        }
    }
    /**
     * Return a numeric value to be used for sorting, with little chance widely separated nodes will have identical key.
     * * Any single x,y,z component is a poor choice because horizontal and vertical alignment is common.
     * * Hence take dot product of x,y,z with non-trivial fraction values.
     * @param node node with x,y,z coordinates
     */
    primarySortKey(node) {
        return this._options.primarySortDirection.dotProductXYZ(node.x, node.y, node.z);
    }
    /** Return difference of sortData members as sort comparison */
    static nodeCompareSortData(nodeA, nodeB) {
        return nodeA.sortData - nodeB.sortData;
    }
    /** test if nodeA is a dangling edge end (i.e. edges around vertex equal 1, but detect it without walking all the way around. */
    static isIsolatedEnd(nodeA) {
        return nodeA.vertexSuccessor === nodeA;
    }
    /** test if nodeA is at a vertex with exactly 2 edges (i.e. edges around vertex equal w, but detect it without walking all the way around. */
    static isChainInteriorVertex(nodeA) {
        const nodeB = nodeA.vertexSuccessor;
        return nodeB !== nodeA && nodeB.vertexSuccessor === nodeA;
    }
    /**
     * * isolate all edge ends.
     * * perform cluster analysis to determine nearly coincident points.
     * * pinch all edges together at each vertex.
     */
    clusterAndMergeVerticesXYZ() {
        Merging_1.HalfEdgeGraphOps.isolateAllEdges(this._graph);
        for (const p of this._graph.allHalfEdges) {
            p.sortData = this.primarySortKey(p);
        }
        const sortArray = this._graph.allHalfEdges.slice();
        sortArray.sort(ChainMergeContext.nodeCompareSortData);
        const xyzTolerance = this._options.tolerance;
        // A node is unvisited if it is its own vertex successor !!!
        // otherwise the node has already been twisted into a base vertex.
        const n = sortArray.length;
        for (let i0 = 0; i0 < n; i0++) {
            const node0 = sortArray[i0];
            const qMin = node0.sortData;
            const qMax = qMin + xyzTolerance;
            if (ChainMergeContext.isIsolatedEnd(node0)) {
                for (let i1 = i0 + 1; i1 < n; i1++) {
                    const node1 = sortArray[i1];
                    if (ChainMergeContext.isIsolatedEnd(node1)) {
                        if (node1.sortData > qMax)
                            break;
                        if (node0.distanceXYZ(node1) <= xyzTolerance) {
                            Graph_1.HalfEdge.pinch(node0, node1);
                            node1.setXYZFrom(node0); // force true equal coordinates.
                        }
                    }
                }
            }
        }
    }
    /**
     * If node0 is not visited, creating a linestring with that starting edge and all successive edges along a chain.
     * @param chains growing array of chains.
     * @param node0 start node for search.
     */
    collectMaximalLineString3dFromStartNode(chains, node0, visitMask) {
        if (!node0.isMaskSet(visitMask)) {
            const ls = LineString3d_1.LineString3d.create();
            ls.addPointXYZ(node0.x, node0.y, node0.z);
            for (;;) {
                node0.setMask(visitMask);
                node0.edgeMate.setMask(visitMask);
                node0 = node0.faceSuccessor;
                ls.addPointXYZ(node0.x, node0.y, node0.z);
                if (node0.isMaskSet(visitMask) || !ChainMergeContext.isChainInteriorVertex(node0))
                    break;
            }
            chains.push(ls);
        }
    }
    /**
     * If node0 is not visited, creating a linestring with that starting edge and all successive edges along a chain.
     * @param chains growing array of chains.
     * @param node0 start node for search.
     */
    collectMaximalGrowableXYXArrayFromStartNode(result, node0, visitMask) {
        if (!node0.isMaskSet(visitMask)) {
            const points = new GrowableXYZArray_1.GrowableXYZArray();
            points.pushXYZ(node0.x, node0.y, node0.z);
            for (;;) {
                node0.setMask(visitMask);
                node0.edgeMate.setMask(visitMask);
                node0 = node0.faceSuccessor;
                points.pushXYZ(node0.x, node0.y, node0.z);
                if (node0.isMaskSet(visitMask) || !ChainMergeContext.isChainInteriorVertex(node0))
                    break;
            }
            if (points.length > 0)
                result.push(points);
        }
    }
    /**
     * * find edges with start, end in same vertex loop.
     * * pinch them away from the loop
     * * set mask on both sides.
     * * Return the number of excisions.
     */
    exciseAndMarkSlingEdges(mask) {
        let n = 0;
        for (const p of this._graph.allHalfEdges) {
            if (p.distanceXYZ(p.edgeMate) < this._options.tolerance
                && !p.isMaskSet(mask)) {
                const q = p.edgeMate;
                Graph_1.HalfEdge.pinch(p, p.vertexPredecessor);
                Graph_1.HalfEdge.pinch(q, q.vertexPredecessor);
                p.setMask(mask);
                q.setMask(mask);
                n++;
            }
        }
        return n;
    }
    /** Collect chains which have maximum edge count, broken at an vertex with other than 2 edges.
     * * This is assumed to be preceded by a call to a vertex-cluster step such as `clusterAndMergeVerticesYXZ`
     */
    collectMaximalChains() {
        const result = [];
        const visitMask = Graph_1.HalfEdgeMask.VISITED;
        // Pass 0: excise and mark zero-length edges.
        this.exciseAndMarkSlingEdges(visitMask);
        this._graph.clearMask(visitMask);
        // Pass 1: only start at non-interior edges -- vertices with one edge or more than 2 edges.
        // (Note that collectMaximalChain checks the visit mask.)
        for (const node0 of this._graph.allHalfEdges) {
            if (!ChainMergeContext.isChainInteriorVertex(node0)) {
                this.collectMaximalLineString3dFromStartNode(result, node0, visitMask);
            }
        }
        // Pass 2: start anywhere in an unvisited loop.
        for (const node0 of this._graph.allHalfEdges) {
            this.collectMaximalLineString3dFromStartNode(result, node0, visitMask);
        }
        return result;
    }
    collectMaximalGrowableXYZArrays() {
        const result = [];
        const visitMask = Graph_1.HalfEdgeMask.VISITED;
        // Pass 0: excise and mark zero-length edges.
        this.exciseAndMarkSlingEdges(visitMask);
        this._graph.clearMask(visitMask);
        // Pass 1: only start at non-interior edges -- vertices with one edge or more than 2 edges.
        // (Note that collectMaximalChain checks the visit mask.)
        for (const node0 of this._graph.allHalfEdges) {
            if (!ChainMergeContext.isChainInteriorVertex(node0)) {
                this.collectMaximalGrowableXYXArrayFromStartNode(result, node0, visitMask);
            }
        }
        // Pass 2: start anywhere in an unvisited loop.
        for (const node0 of this._graph.allHalfEdges) {
            this.collectMaximalGrowableXYXArrayFromStartNode(result, node0, visitMask);
        }
        return result;
    }
}
exports.ChainMergeContext = ChainMergeContext;
//# sourceMappingURL=ChainMerge.js.map