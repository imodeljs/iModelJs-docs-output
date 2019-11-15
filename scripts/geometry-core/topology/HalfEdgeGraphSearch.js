"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Topology */
const Graph_1 = require("./Graph");
const XYParitySearchContext_1 = require("./XYParitySearchContext");
const SignedDataSummary_1 = require("./SignedDataSummary");
/**
 */
class HalfEdgeMaskTester {
    /**
     *
     * @param mask mask to test in `testEdge` function
     * @param targetValue value to match for true return
     */
    constructor(mask, targetValue = true) {
        this._targetMask = mask;
        this._targetValue = targetValue;
    }
    /** Return true if the value of the targetMask matches the targetValue */
    testEdge(edge) {
        return edge.isMaskSet(this._targetMask) === this._targetValue;
    }
}
exports.HalfEdgeMaskTester = HalfEdgeMaskTester;
// Search services for HalfEdgeGraph
class HalfEdgeGraphSearch {
    /**
     * * for each node of face, set the mask push to allNodesStack
     * * push the faceSeed on onePerFaceStack[]
     */
    static pushAndMaskAllNodesInFace(faceSeed, mask, allNodeStack, onePerFaceStack) {
        onePerFaceStack.push(faceSeed);
        faceSeed.collectAroundFace((node) => {
            node.setMask(mask);
            allNodeStack.push(node);
        });
    }
    /**
     * Search an array of faceSeed nodes for the face with the most negative area.
     * @param oneCandidateNodePerFace array containing one node from each face to be considered.
     */
    static findMinimumAreaFace(oneCandidateNodePerFace) {
        const summary = HalfEdgeGraphSearch.collectFaceAreaSummary(oneCandidateNodePerFace);
        return summary.largestNegativeItem;
    }
    /**
     *
     * Return a summary structure data about face areas.
     */
    static collectFaceAreaSummary(source, collectAllNodes = false) {
        const result = new SignedDataSummary_1.SignedDataSummary(collectAllNodes);
        let allFaces;
        if (source instanceof Graph_1.HalfEdgeGraph)
            allFaces = source.collectFaceLoops();
        else
            allFaces = source;
        for (const node of allFaces) {
            const area = node.signedFaceArea();
            result.announceItem(node, area);
        }
        return result;
    }
    /**
     * Search to all accessible faces from given seed.
     * * The returned array contains one representative node in each face of the connected component.
     * * If (nonnull) parity mask is given, on return:
     *    * It is entirely set or entirely clear around each face
     *    * It is entirely set on all faces that are an even number of face-to-face steps away from the seed.
     *    * It is entirely clear on all faces that are an odd number of face-to-face steps away from the seed.
     * @param seedEdge first edge to search.
     * @param visitMask mask applied to all faces as visited.
     * @param parityMask mask to apply (a) to first face, (b) to faces with alternating parity during the search.
     */
    static parityFloodFromSeed(seedEdge, visitMask, parityEdgeTester, parityMask) {
        const faces = [];
        if (seedEdge.isMaskSet(visitMask))
            return faces; // empty
        const allMasks = parityMask | visitMask;
        const stack = [];
        // arbitrarily call the seed face exterior ... others will alternate as visited.
        HalfEdgeGraphSearch.pushAndMaskAllNodesInFace(seedEdge, allMasks, stack, faces); // Start with exterior as mask
        while (stack.length > 0) {
            const p = stack.pop();
            const mate = p.edgeMate;
            if (!mate)
                continue;
            if (!mate.isMaskSet(visitMask)) {
                let newState = p.isMaskSet(parityMask);
                if (!parityEdgeTester || parityEdgeTester.testEdge(p))
                    newState = !newState;
                HalfEdgeGraphSearch.pushAndMaskAllNodesInFace(mate, newState ? allMasks : visitMask, stack, faces);
            }
        }
        return faces;
    }
    /**
     * * Search the given faces for the one with the minimum area.
     * * If the mask in that face is OFF, toggle it on (all half edges of) all the faces.
     * * In a properly merged planar subdivision there should be only one true negative area face per component.
     * @param graph parent graph
     * @param parityMask mask which was previously set with alternating parity, but with an arbitrary start face.
     * @param faces array of faces to search.
     */
    static correctParityInSingleComponent(_graph, mask, faces) {
        const exteriorHalfEdge = HalfEdgeGraphSearch.findMinimumAreaFace(faces);
        if (exteriorHalfEdge.isMaskSet(mask)) {
            // all should be well .. nothing to do.
        }
        else {
            // TOGGLE around the face (assuming all are consistent with the seed)
            for (const faceSeed of faces) {
                if (faceSeed.isMaskSet(mask)) {
                    faceSeed.clearMaskAroundFace(mask);
                }
                else {
                    faceSeed.setMaskAroundFace(mask);
                }
            }
        }
    }
    /** Apply correctParityInSingleComponent to each array in components. (Quick exit if mask in NULL_MASK) */
    static correctParityInComponentArrays(graph, mask, components) {
        if (mask === Graph_1.HalfEdgeMask.NULL_MASK)
            return;
        for (const facesInComponent of components)
            HalfEdgeGraphSearch.correctParityInSingleComponent(graph, mask, facesInComponent);
    }
    /**
     * Collect arrays gathering faces by connected component.
     * @param graph graph to inspect
     * @param parityEdgeTester (optional) function to test of an edge is a parity change.
     * @param parityMask (optional, along with boundaryTestFunction) mask to apply indicating parity.  If this is Mask.NULL_MASK, there is no record of parity.
     */
    static collectConnectedComponentsWithExteriorParityMasks(graph, parityEdgeTester, parityMask = Graph_1.HalfEdgeMask.NULL_MASK) {
        const components = [];
        const visitMask = Graph_1.HalfEdgeMask.VISITED;
        const allMasks = parityMask | visitMask;
        graph.clearMask(allMasks);
        for (const faceSeed of graph.allHalfEdges) {
            if (!faceSeed.isMaskSet(Graph_1.HalfEdgeMask.VISITED)) {
                const newFaces = HalfEdgeGraphSearch.parityFloodFromSeed(faceSeed, visitMask, parityEdgeTester, parityMask);
                components.push(newFaces);
            }
        }
        HalfEdgeGraphSearch.correctParityInComponentArrays(graph, parityMask, components);
        return components;
    }
    /**
     * Test if (x,y) is inside (1), on an edge (0) or outside (-1) a face.
     * @param seedNode any node on the face loop
     * @param x x coordinate of test point.
     * @param y y coordinate of test point.
     */
    static pointInOrOnFaceXY(seedNode, x, y) {
        const context = new XYParitySearchContext_1.XYParitySearchContext(x, y);
        // walk around looking for an accepted node to start the search (seedNode is usually ok!)
        let nodeA = seedNode;
        let nodeB = seedNode.faceSuccessor;
        for (;; nodeA = nodeB) {
            if (context.tryStartEdge(nodeA.x, nodeA.y, nodeB.x, nodeB.y))
                break;
            if (nodeB === seedNode) {
                // umm.. the face is all on the x axis?
                return context.classifyCounts();
            }
            nodeB = nodeA.faceSuccessor;
        }
        // nodeB is the real start node for search ... emit ends of each edge around the face,
        //   stopping after emitting nodeB as an edge end.
        let node = nodeB.faceSuccessor;
        for (;;) {
            if (!context.advance(node.x, node.y)) {
                return context.classifyCounts();
            }
            if (node === nodeB)
                break;
            node = node.faceSuccessor;
        }
        return context.classifyCounts();
    }
}
exports.HalfEdgeGraphSearch = HalfEdgeGraphSearch;
//# sourceMappingURL=HalfEdgeGraphSearch.js.map