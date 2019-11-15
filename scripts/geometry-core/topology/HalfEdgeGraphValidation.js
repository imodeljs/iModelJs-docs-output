"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// Search services for HalfEdgeGraph
/** HalfEdgePointerInspector has methods to check HalfEdge objects for pointer errors.
 * * For a one-step test of the whole graph,
 */
class HalfEdgePointerInspector {
    constructor() {
        this.numUndefinedEdgeMate = 0;
        this.numUndefinedFS = 0;
        this.numUndefinedFP = 0;
        this.numFSFPError = 0;
        this.numMatePairError = 0;
        this.numTested = 0;
        this.numWithMatchedEdgeMate = 0;
    }
    /** Clear all counts */
    clearCounts() {
        this.numUndefinedEdgeMate = 0;
        this.numUndefinedFP = 0;
        this.numUndefinedFS = 0;
        this.numFSFPError = 0;
        this.numMatePairError = 0;
        this.numWithMatchedEdgeMate = 0;
        this.numTested = 0;
    }
    /** Inspect a single half edge.   Increment counters according to the half edge's pointers. */
    inspectHalfEdge(he) {
        this.numTested++;
        if (he.facePredecessor === undefined)
            this.numUndefinedFP++;
        else if (he.facePredecessor.faceSuccessor !== he)
            this.numFSFPError++;
        if (he.faceSuccessor === undefined)
            this.numUndefinedFS++;
        else if (he.faceSuccessor.facePredecessor !== he)
            this.numFSFPError++;
        if (he.edgeMate === undefined)
            this.numUndefinedEdgeMate++;
        else if (he.edgeMate.edgeMate === he)
            this.numWithMatchedEdgeMate++;
        else
            this.numMatePairError++;
    }
    /** Return true if all pointer pairings are correct for a complete half edge graph:
     * * For each he:  `he.edgeMate.edgeMate === he`
     * * For each he:  `he.faceSuccessor.facePredecessor !== he`
     * * For each he:  `he.facePredecessor.faceSuccessor !== he`
     */
    get isValidClosedHalfEdgeGraph() {
        return this.numWithMatchedEdgeMate === this.numTested
            && this.numUndefinedFS === 0
            && this.numUndefinedFP === 0
            && this.numFSFPError === 0
            && this.numMatePairError === 0;
    }
    /** Return true if all counts are correct for a half edge graph that has complete pairings:
     * * For each he:  `he.edgeMate.edgeMate === he`
     * * For each he:  `he.faceSuccessor.facePredecessor !== he`
     * * For each he:  `he.facePredecessor.faceSuccessor !== he`
     */
    get isValidHalfEdgeGraphAllowRaggedBoundary() {
        return this.numWithMatchedEdgeMate + this.numUndefinedEdgeMate === this.numTested
            && this.numUndefinedFS === 0
            && this.numUndefinedFP === 0
            && this.numFSFPError === 0
            && this.numMatePairError === 0;
    }
    /** inspect all half edges of graph.
     * All pointer counts are left in member vars for later inspection.
     */
    inspectHalfEdges(graph) {
        this.clearCounts();
        for (const he of graph.allHalfEdges)
            this.inspectHalfEdge(he);
    }
    /** Inspect a graph's pointer properties.
     * @param expectAllMates [in] true for "complete" graph with
     * @returns true if all pointers are valid
     */
    static inspectGraph(graph, expectAllMates) {
        const inspector = new HalfEdgePointerInspector();
        inspector.inspectHalfEdges(graph);
        if (expectAllMates)
            return inspector.isValidClosedHalfEdgeGraph;
        return inspector.isValidHalfEdgeGraphAllowRaggedBoundary;
    }
}
exports.HalfEdgePointerInspector = HalfEdgePointerInspector;
/** static methods to inspect mask consistency properties in HalfEdgeGraph. */
class HalfEdgeMaskValidation {
    /**
     * Test if a mask is used consistently around faces.
     * * At the low level, there is no actual traversal around faces.  It is only necessary to verify that the mask matches for each HalfEdge and its faceSuccessor.
     * @returns Return true if mask is "all or nothing around all faces"
     *
     */
    static isMaskConsistentAroundAllFaces(graph, mask) {
        for (const he of graph.allHalfEdges) {
            if (he.faceSuccessor.getMask(mask) !== he.getMask(mask))
                return false;
        }
        return true;
    }
}
exports.HalfEdgeMaskValidation = HalfEdgeMaskValidation;
//# sourceMappingURL=HalfEdgeGraphValidation.js.map