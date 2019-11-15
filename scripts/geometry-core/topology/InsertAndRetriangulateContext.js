"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const Graph_1 = require("./Graph");
const HalfEdgePositionDetail_1 = require("./HalfEdgePositionDetail");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Polynomials_1 = require("../numerics/Polynomials");
const HalfEdgePointInGraphSearch_1 = require("./HalfEdgePointInGraphSearch");
const Ray3d_1 = require("../geometry3d/Ray3d");
const HalfEdgeMarkSet_1 = require("./HalfEdgeMarkSet");
const Triangulation_1 = require("./Triangulation");
/** @module Topology */
/**
 * Context for repeated insertion of new points in a graph.
 * * Initial graph should have clean outer boundary. (e.g. as typically marked with HalfEdgeMask.EXTERIOR)
 * * After each insertion, the current "position" within the graph is remembered so that each subsequent insertion
 *     can reuse that position as start for walking to the new point.
 */
class InsertAndRetriangulateContext {
    // Temporaries used in reAimFromFace
    // private _lastBefore: HalfEdgePositionDetail;
    // private _firstAfter: HalfEdgePositionDetail;
    constructor(graph) {
        this._graph = graph;
        this._edgeSet = HalfEdgeMarkSet_1.MarkedEdgeSet.create(graph);
        this._searcher = HalfEdgePositionDetail_1.HalfEdgePositionDetail.create();
        // this._lastBefore = HalfEdgePositionDetail.create();
        // this._firstAfter = HalfEdgePositionDetail.create();
    }
    /** Create a new context referencing the graph. */
    static create(graph) {
        return new InsertAndRetriangulateContext(graph);
    }
    /** Query the (pointer to) the graph in the context. */
    get graph() { return this._graph; }
    // Walk face from edgeNode;  insert new edges back to start node from all except
    //   immediate successor and predecessor.
    // insert all new nodes, and nodes of the existing face, in edgeSet.
    retriangulateFromBaseVertex(centralNode) {
        const numNode = centralNode.countEdgesAroundFace();
        this._edgeSet.addAroundFace(centralNode);
        if (numNode < 4 || centralNode.signedFaceArea() <= 0.0)
            return;
        const numEdge = numNode - 3;
        let farNode = centralNode.faceSuccessor;
        let nearNode = centralNode;
        for (let i = 0; i < numEdge; i++) {
            farNode = farNode.faceSuccessor;
            nearNode = this._graph.createEdgeHalfEdgeHalfEdge(nearNode, 0, farNode, 0);
            farNode = nearNode.faceSuccessor;
            this._edgeSet.addToSet(nearNode);
        }
    }
    /** Reset the "current" position to unknown state. */
    reset() {
        this._searcher = HalfEdgePositionDetail_1.HalfEdgePositionDetail.create();
    }
    /** Return a (reference to!) the current position in the graph */
    get currentPosition() { return this._searcher; }
    /**
     * Linear search through the graph
     * * Returns a HalfEdgePositionDetail for the nearest edge or vertex.
     * @param xyz
     */
    searchForNearestEdgeOrVertex(xyz) {
        const position = HalfEdgePositionDetail_1.HalfEdgePositionDetail.create();
        position.setDTag(Number.MAX_VALUE);
        const xyzC = Point3dVector3d_1.Point3d.create();
        let fractionC;
        let distanceC;
        for (const nodeA of this._graph.allHalfEdges) {
            const nodeB = nodeA.faceSuccessor;
            fractionC = Polynomials_1.SmallSystem.lineSegment3dXYClosestPointUnbounded(nodeA, nodeB, xyz);
            if (fractionC !== undefined) {
                if (fractionC > 1.0) {
                    distanceC = xyz.distanceXY(nodeB);
                    if (distanceC < position.getDTag()) {
                        position.resetAsVertex(nodeB);
                        position.setDTag(distanceC);
                    }
                }
                else if (fractionC < 0.0) {
                    distanceC = xyz.distanceXY(nodeA);
                    if (distanceC < position.getDTag()) {
                        position.resetAsVertex(nodeA);
                        position.setDTag(distanceC);
                    }
                }
                else {
                    nodeA.fractionToPoint3d(fractionC, xyzC);
                    distanceC = xyz.distanceXY(xyzC);
                    if (distanceC < position.getDTag()) {
                        position.resetAtEdgeAndFraction(nodeA, fractionC);
                    }
                }
            }
        }
        return position;
    }
    searchForNearestVertex(xyz) {
        const position = HalfEdgePositionDetail_1.HalfEdgePositionDetail.create();
        position.setDTag(Number.MAX_VALUE);
        let distanceA;
        for (const nodeA of this._graph.allHalfEdges) {
            distanceA = xyz.distanceXY(nodeA);
            if (distanceA < position.getDTag()) {
                position.resetAsVertex(nodeA);
                position.setDTag(distanceA);
            }
        }
        return position;
    }
    resetSearch(xyz, maxDim) {
        if (maxDim > 0)
            this._searcher = this.searchForNearestEdgeOrVertex(xyz);
        else
            this._searcher = this.searchForNearestVertex(xyz);
    }
    insertAndRetriangulate(xyz, newZWins) {
        this.moveToPoint(this._searcher, xyz);
        const seedNode = this._searcher.node;
        let stat = false;
        if (seedNode === undefined) {
        }
        else if (this._searcher.isFace) {
            if (!seedNode.isMaskSet(Graph_1.HalfEdgeMask.EXTERIOR)) {
                const newInteriorNode = this._graph.createEdgeXYZHalfEdge(xyz.x, xyz.y, xyz.z, 0, seedNode, 0);
                this.retriangulateFromBaseVertex(newInteriorNode);
                Triangulation_1.Triangulator.flipTrianglesInEdgeSet(this._graph, this._edgeSet);
                this._searcher.resetAsVertex(newInteriorNode);
            }
            stat = true;
        }
        else if (this._searcher.isEdge) {
            const newA = this._graph.splitEdgeAtFraction(seedNode, this._searcher.edgeFraction);
            const newB = newA.vertexPredecessor;
            this.retriangulateFromBaseVertex(newA);
            this.retriangulateFromBaseVertex(newB);
            Triangulation_1.Triangulator.flipTrianglesInEdgeSet(this._graph, this._edgeSet);
            this._searcher.resetAsVertex(newA);
            stat = true;
        }
        else if (this._searcher.isVertex) {
            // There's already a vertex there.  Maybe the z is different.
            if (newZWins)
                seedNode.setXYZAroundVertex(xyz.x, xyz.y, xyz.z);
            stat = true;
        }
        else {
            stat = false;
        }
        return stat;
    }
    // Advance movingPosition to a face, edge, or vertex position detail that contains xyz.
    // Prior content in movingPosition is used as seed.
    // Return true if successful.
    moveToPoint(movingPosition, xyz, announcer) {
        const psc = HalfEdgePointInGraphSearch_1.PointSearchContext.create();
        movingPosition.setITag(0);
        if (movingPosition.isUnclassified) {
            moveToAnyUnmaskedEdge(this.graph, movingPosition, 0.5, 0);
            if (movingPosition.isUnclassified)
                return false;
        }
        // double tol = vu_getMergeTol (pGraph);
        const ray = Ray3d_1.Ray3d.createXAxis();
        for (; movingPosition.getITag() === 0;) {
            if (announcer !== undefined) {
                const continueSearch = announcer(movingPosition);
                if (!continueSearch)
                    break;
            }
            if (!psc.setSearchRay(movingPosition, xyz, ray)) {
                return false;
            }
            else if (movingPosition.isFace) {
                const lastBefore = HalfEdgePositionDetail_1.HalfEdgePositionDetail.create();
                const firstAfter = HalfEdgePositionDetail_1.HalfEdgePositionDetail.create();
                const rc = psc.reAimAroundFace(movingPosition.node, ray, ray.a, lastBefore, firstAfter);
                // reAimAroundFace returns lots of cases in `lastBefore` !!
                switch (rc) {
                    case HalfEdgePointInGraphSearch_1.RayClassification.RC_NoHits: {
                        movingPosition.resetAsUnknown();
                        break;
                    }
                    case HalfEdgePointInGraphSearch_1.RayClassification.RC_TargetOnVertex: {
                        movingPosition.setFrom(lastBefore);
                        movingPosition.setITag(1);
                        break;
                    }
                    case HalfEdgePointInGraphSearch_1.RayClassification.RC_TargetOnEdge: {
                        movingPosition.setFrom(lastBefore);
                        movingPosition.setITag(1);
                        break;
                    }
                    case HalfEdgePointInGraphSearch_1.RayClassification.RC_Bracket: {
                        movingPosition.resetAsFace(lastBefore.node, xyz);
                        movingPosition.setITag(1);
                        break;
                    }
                    case HalfEdgePointInGraphSearch_1.RayClassification.RC_TargetBefore: {
                        movingPosition.resetAsFace(movingPosition.node, xyz);
                        movingPosition.setITag(1);
                        break;
                    }
                    case HalfEdgePointInGraphSearch_1.RayClassification.RC_TargetAfter: {
                        movingPosition.setFrom(lastBefore);
                        break;
                    }
                }
            }
            else if (movingPosition.isEdge) {
                psc.reAimFromEdge(movingPosition, ray, ray.a);
                if (movingPosition.isUnclassified)
                    break;
            }
            else if (movingPosition.isVertex) {
                psc.reAimFromVertex(movingPosition, ray, ray.a);
                if (movingPosition.isUnclassified)
                    break;
            }
        }
        return movingPosition.isAtXY(xyz.x, xyz.y);
    }
}
exports.InsertAndRetriangulateContext = InsertAndRetriangulateContext;
// Create a VuPositionDetail for specified fraction along any unmasked edge.
function moveToAnyUnmaskedEdge(graph, position, edgeFraction, skipMask) {
    for (const candidate of graph.allHalfEdges) {
        if (!candidate.isMaskSet(skipMask)) {
            position.resetAtEdgeAndFraction(candidate, edgeFraction);
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=InsertAndRetriangulateContext.js.map