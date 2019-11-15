"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Geometry_1 = require("../Geometry");
const HalfEdgePositionDetail_1 = require("./HalfEdgePositionDetail");
const HalfEdgeNodeXYZUV_1 = require("./HalfEdgeNodeXYZUV");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
var RayClassification;
(function (RayClassification) {
    RayClassification[RayClassification["RC_NoHits"] = 0] = "RC_NoHits";
    RayClassification[RayClassification["RC_TargetOnVertex"] = 1] = "RC_TargetOnVertex";
    RayClassification[RayClassification["RC_TargetOnEdge"] = 2] = "RC_TargetOnEdge";
    RayClassification[RayClassification["RC_Bracket"] = 3] = "RC_Bracket";
    RayClassification[RayClassification["RC_TargetBefore"] = 4] = "RC_TargetBefore";
    RayClassification[RayClassification["RC_TargetAfter"] = 5] = "RC_TargetAfter";
})(RayClassification = exports.RayClassification || (exports.RayClassification = {}));
class PointSearchContext {
    constructor(tol) {
        this._tol = tol;
    }
    static create(tol = Geometry_1.Geometry.smallMetricDistance) {
        return new PointSearchContext(tol);
    }
    panic() {
        return HalfEdgePositionDetail_1.HalfEdgePositionDetail.create();
    }
    // From given edge start point
    // The edgeHit is reused as the result.
    reAimFromEdge(edgeHit, ray, targetDistance) {
        const nodeA = edgeHit.node;
        const dataA = HalfEdgeNodeXYZUV_1.NodeXYZUV.createNodeAndRayOrigin(nodeA, ray);
        const dataB = HalfEdgeNodeXYZUV_1.NodeXYZUV.createNodeAndRayOrigin(nodeA.edgeMate, ray);
        const sideA = -dataA.classifyV(0.0, this._tol);
        const sideB = -dataB.classifyV(0.0, this._tol);
        let result;
        if (sideA * sideB < 0) {
            // Simple crossing -- just aim into a face
            if (sideA > 0) {
                result = edgeHit.resetAsFace(dataA.node);
            }
            else {
                result = edgeHit.resetAsFace(dataB.node);
            }
        }
        else if (sideA === 0 || sideB === 0) {
            // The usual case is both 0 i.e. ray is clearly along the edge.
            const alongA = dataA.classifyU(targetDistance, this._tol);
            const alongB = dataB.classifyU(targetDistance, this._tol);
            if (alongA === 0 && sideA === 0) {
                result = edgeHit.resetAsVertex(dataA.node);
                result.setITag(1);
            }
            else if (alongB === 0 && sideB === 0) {
                result = edgeHit.resetAsVertex(dataB.node);
                result.setITag(1);
            }
            else if (alongA * alongB < 0) {
                // target is within edge
                // (.. This is written for the case where both sideA and sideB are zero.
                //    If only one is zero, this computes a close edge point but the strong "on" conclusion might be wrong)
                const edgeFraction = (targetDistance - dataA.u) / (dataB.u - dataA.u);
                result = edgeHit.resetAtEdgeAndFraction(dataA.node, edgeFraction);
                result.setITag(1);
            }
            else if (alongA < 0 && alongB < 0) {
                // target is beyond the edge -- move towards it.
                if (dataA.u > dataB.u)
                    result = edgeHit.resetAsVertex(dataA.node);
                else
                    result = edgeHit.resetAsVertex(dataB.node);
            }
            else {
                // This shouldn't happen -- maybe as if the initial edge point was not within the edge???
                if (Math.abs(dataA.u) < this._tol
                    && Math.abs(dataA.v) < this._tol) {
                    result = edgeHit.resetAsVertex(dataA.node); // , dataA);
                }
                else if (Math.abs(dataB.u) < this._tol
                    && Math.abs(dataB.v) < this._tol) {
                    result = edgeHit.resetAsVertex(dataB.node);
                }
                else {
                    edgeHit.resetAsUnknown();
                    result = this.panic();
                }
            }
        }
        else {
            // Both vertices are to same side of the line.   This can't happen for edge point between nodes.
            edgeHit.resetAsUnknown();
            result = this.panic();
        }
        return result;
    }
    // From given edge start point, pick vertex or edge side for proceeding along ray.
    // RAY IS ASSUMED TO START AT THE VERTEX PRECISELY !!!!
    reAimFromVertex(searchBase, ray, targetDistance) {
        const vertexNode = searchBase.node;
        let result;
        let outboundEdge = vertexNode;
        do {
            // DPoint3d xyzBase;
            // vu_getDPoint3d(& xyzBase, outboundEdge);
            const data0 = HalfEdgeNodeXYZUV_1.NodeXYZUV.createNodeAndRayOrigin(outboundEdge.faceSuccessor, ray);
            const data1 = HalfEdgeNodeXYZUV_1.NodeXYZUV.createNodeAndRayOrigin(outboundEdge.facePredecessor, ray);
            const u0 = data0.u;
            // double u1 = data1.GetU ();
            const v0 = data0.v;
            const v1 = data1.v;
            if (Math.abs(v0) < this._tol) {
                if (Math.abs(u0 - targetDistance) < this._tol) {
                    // Direct hit at far end
                    result = searchBase.resetAsVertex(data0.node);
                    result.setITag(1);
                    return result;
                }
                else if (u0 > targetDistance) {
                    // Direct hig within edge
                    const edgeFraction = targetDistance / u0;
                    result = searchBase.resetAtEdgeAndFraction(outboundEdge, edgeFraction);
                    return result;
                }
                else if (Math.abs(u0) <= this._tol) {
                    // Unexpected direct hit on the base of the search, but call it a hit....
                    result = searchBase.resetAsVertex(outboundEdge);
                    result.setITag(1);
                    return result;
                }
                else if (u0 > this._tol) {
                    // Advance to vertex  ...
                    // double edgeFraction = targetDistance / u0;
                    result = searchBase.resetAsVertex(data0.node);
                    return result;
                }
                else {
                    // Search direction is exactly opposite this edge.
                    // See if the other side of the sector is turned even beyond that ...
                    if (v1 > this._tol) {
                        result = searchBase.resetAsFace(outboundEdge, outboundEdge);
                        return result;
                    }
                }
            }
            else if (v0 < -this._tol) {
                if (v1 > this._tol) {
                    // The usual simple entry into an angle < 180
                    result = searchBase.resetAsFace(outboundEdge, outboundEdge);
                    return result;
                }
            }
            // NEEDS WORK: angle >= 180 cases !!!!
            outboundEdge = outboundEdge.vertexSuccessor;
        } while (outboundEdge !== vertexNode);
        return this.panic();
    }
    // Visit all edges around face.
    // reset lastBefore and firstAfter describing progress towards target distance on ray.
    reAimAroundFace(faceNode, ray, targetDistance, // !< distance to target point
    lastBefore, // CALLER CREATED -- reset as first hit on negative side of ray.
    firstAfter) {
        lastBefore.resetAsUndefinedWithTag(-Number.MAX_VALUE);
        firstAfter.resetAsUndefinedWithTag(Number.MAX_VALUE);
        const data0 = HalfEdgeNodeXYZUV_1.NodeXYZUV.createNodeAndRayOrigin(faceNode, ray);
        let data1;
        let node0 = faceNode;
        do {
            const node1 = node0.faceSuccessor;
            data1 = HalfEdgeNodeXYZUV_1.NodeXYZUV.createNodeAndRayOrigin(node1, ray, data1);
            const u0 = data0.u;
            const u1 = data1.u;
            const v0 = data0.v;
            const v1 = data1.v;
            if (Math.abs(v1) < this._tol) {
                // Vertex hit ...
                const vertexHit = HalfEdgePositionDetail_1.HalfEdgePositionDetail.createVertex(node1);
                vertexHit.setDTag(u1);
                if (Math.abs(u1 - targetDistance) < this._tol) {
                    firstAfter.setFrom(vertexHit);
                    lastBefore.setFrom(vertexHit);
                    return RayClassification.RC_TargetOnVertex;
                }
                if (u1 > targetDistance && u1 < firstAfter.getDTag())
                    firstAfter.setFrom(vertexHit);
                if (u1 < targetDistance && u1 > lastBefore.getDTag())
                    lastBefore.setFrom(vertexHit);
            }
            else if (v0 * v1 < 0.0) {
                // Edge Crossing ...
                const edgeFraction = -v0 / (v1 - v0);
                const uEdge = Geometry_1.Geometry.interpolate(u0, edgeFraction, u1);
                const edgeHit = HalfEdgePositionDetail_1.HalfEdgePositionDetail.createEdgeAtFraction(data0.node, edgeFraction);
                edgeHit.setDTag(uEdge);
                if (Math.abs(uEdge - targetDistance) <= this._tol) {
                    firstAfter.setFrom(edgeHit);
                    lastBefore.setFrom(edgeHit);
                    return RayClassification.RC_TargetOnEdge;
                }
                if (uEdge > targetDistance && uEdge < firstAfter.getDTag()) {
                    firstAfter.setFrom(edgeHit);
                    firstAfter.setITag(v0 > 0.0 ? -1 : 1);
                }
                if (uEdge < targetDistance && uEdge > lastBefore.getDTag()) {
                    lastBefore.setFrom(edgeHit);
                    lastBefore.setDTag(uEdge);
                }
            }
            data0.setFrom(data1);
            node0 = node0.faceSuccessor;
        } while (node0 !== faceNode);
        const afterTag = firstAfter.getITag();
        firstAfter.setITag(0);
        lastBefore.setITag(0);
        if (lastBefore.isUnclassified) {
            if (firstAfter.isUnclassified)
                return RayClassification.RC_NoHits;
            return RayClassification.RC_TargetBefore;
        }
        if (firstAfter.isUnclassified
            || (firstAfter.isEdge && afterTag && afterTag < 0)) {
            return RayClassification.RC_TargetAfter;
        }
        else {
            return RayClassification.RC_Bracket;
        }
    }
    // Return false if target is reached !!!!
    /**
     * Set (replace contents) ray with
     * * `origin` at start
     * * `direction` is unit vector from start towards target
     * * `a` is distance from start to target.
     * @param start existing position
     * @param target target xy coordinates
     * @param ray ray to update
     */
    setSearchRay(start, target, ray) {
        ray.origin.setFromPoint3d(start);
        Point3dVector3d_1.Vector3d.createStartEnd(ray.origin, target, ray.direction);
        ray.direction.z = 0.0;
        const distanceToTarget = ray.direction.magnitudeXY();
        ray.a = ray.direction.magnitude();
        ray.direction.scaleInPlace(1 / ray.a);
        return distanceToTarget >= this._tol;
    }
}
exports.PointSearchContext = PointSearchContext;
//# sourceMappingURL=HalfEdgePointInGraphSearch.js.map