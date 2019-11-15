"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Geometry_1 = require("../Geometry");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
/** @module Topology */
/**
 * Enumeration of categorization of "where" a HalfEdgePositionDetail is sitting in the graph.
 */
var HalfEdgeTopo;
(function (HalfEdgeTopo) {
    /** No known position */
    HalfEdgeTopo[HalfEdgeTopo["None"] = 0] = "None";
    /**  */
    HalfEdgeTopo[HalfEdgeTopo["Vertex"] = 1] = "Vertex";
    HalfEdgeTopo[HalfEdgeTopo["Edge"] = 2] = "Edge";
    HalfEdgeTopo[HalfEdgeTopo["Face"] = 3] = "Face";
})(HalfEdgeTopo = exports.HalfEdgeTopo || (exports.HalfEdgeTopo = {}));
/**
 * Description of a generalized position within a graph, categorized as:
 * * "at a certain node around a vertex"
 * * "at a fractional position along an edge
 * * "within a face"
 */
class HalfEdgePositionDetail {
    /** Constructor.
     * * The point is CAPTURED.  (static `create` methods normally clone their inputs.)
     */
    constructor(node, x, y, z, topo, edgeFraction, iTag, _dTag) {
        this._node = node;
        this.x = x;
        this.y = y;
        this.z = z;
        this._topo = topo;
        this._edgeFraction = edgeFraction;
        this._iTag = iTag;
        this._dTag = _dTag;
    }
    /** Copy (clones of) all data from other */
    setFrom(other) {
        this._node = other._node;
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        this._topo = other._topo;
        this._edgeFraction = other._edgeFraction;
        this._iTag = other._iTag;
        this._dTag = other._dTag;
    }
    /** reset to null topo state. */
    resetAsUnknown() {
        this._node = undefined;
        this._topo = HalfEdgeTopo.None;
    }
    /**  Create with null data. */
    static create() {
        const detail = new HalfEdgePositionDetail(undefined, 0, 0, 0, HalfEdgeTopo.None);
        return detail;
    }
    getITag() { return this._iTag; }
    setITag(value) { this._iTag = value; }
    getDTag() { return this._dTag; }
    setDTag(value) { this._dTag = value; }
    getTopo() { return this._topo; }
    /** Create with node, fraction along edge, marked as "HalfEdgeTopo.Edge".  Compute interpolated xyz on the edge */
    static createEdgeAtFraction(node, edgeFraction) {
        const node1 = node.faceSuccessor;
        const x = Geometry_1.Geometry.interpolate(node.x, edgeFraction, node1.x);
        const y = Geometry_1.Geometry.interpolate(node.y, edgeFraction, node1.y);
        const z = Geometry_1.Geometry.interpolate(node.z, edgeFraction, node1.z);
        return new HalfEdgePositionDetail(node, x, y, z, HalfEdgeTopo.Edge, edgeFraction);
    }
    /** reassign contents so this instance becomes a face hit.
     * @param node new node value. If missing, current node is left unchanged.
     * @param xyz new coordinates. if missing, current coordinates are left unchanged.
     */
    resetAsFace(node, xyz) {
        this._topo = HalfEdgeTopo.Face;
        if (node)
            this._node = node;
        if (xyz) {
            this.x = xyz.x;
            this.y = xyz.y;
            this.z = xyz.z;
        }
        return this;
    }
    /** reassign contents so this instance has dTag but no node or HalfEdgeTopo
     */
    resetAsUndefinedWithTag(dTag) {
        this._topo = HalfEdgeTopo.None;
        this._dTag = 0;
        this._iTag = 0;
        this._dTag = dTag;
        this._node = undefined;
        return this;
    }
    /** reassign contents so this instance becomes an edge hit
     * @param node new node value.
     * @param edgeFraction new edge fraction.   xyz is recomputed from this edge and its face successor.
     */
    resetAtEdgeAndFraction(node, edgeFraction) {
        this._topo = HalfEdgeTopo.Edge;
        this._node = node;
        const nodeB = node.faceSuccessor;
        this._edgeFraction = edgeFraction;
        this.x = Geometry_1.Geometry.interpolate(node.x, edgeFraction, nodeB.x);
        this.y = Geometry_1.Geometry.interpolate(node.y, edgeFraction, nodeB.y);
        this.z = Geometry_1.Geometry.interpolate(node.z, edgeFraction, nodeB.z);
        return this;
    }
    /** Create at a node.
     * * Take xyz from the node.
     */
    static createVertex(node) {
        return new HalfEdgePositionDetail(node, node.x, node.y, node.z, HalfEdgeTopo.Vertex);
    }
    /** Create with node and (optional) xyz, marked as "HalfEdgeTopo.Vertex"
     * * if the xyz is omitted, take from the node.
     */
    resetAsVertex(node) {
        this._topo = HalfEdgeTopo.Vertex;
        this._node = node;
        this.setXYZFromNode(node);
        return this;
    }
    /** Copy x,y,z from the node to this instance local values. */
    setXYZFromNode(node) {
        this.x = node.x;
        this.y = node.y;
        this.z = node.z;
    }
    /**
     * Return the (possibly undefined) edge fraction.
     */
    get edgeFraction() {
        return this._edgeFraction;
    }
    /** Return true if this detail is marked as being within a face. */
    get isFace() { return this._topo === HalfEdgeTopo.Face; }
    /** Return true if this detail is marked as being within an edge. */
    get isEdge() { return this._topo === HalfEdgeTopo.Edge; }
    /** Return true if this detail is marked as being at a vertex. */
    get isVertex() { return this._topo === HalfEdgeTopo.Vertex; }
    /** Return true if this detail has no vertex, edge, or face qualifier. */
    get isUnclassified() { return this._topo === HalfEdgeTopo.None; }
    /** Return the node reference from this detail */
    get node() { return this._node; }
    /** Return the (clone of, or optional filled in result) coordinates from this detail. */
    clonePoint(result) { return Point3dVector3d_1.Point3d.create(this.x, this.y, this.z, result); }
    /*
      // If candidateKey is less than resultKey, replace resultPos and resultKey
      // by the candidate data.
      public updateMinimizer(
        HalfEdgePositionDetail & resultPos, number & resultKey,
    : HalfEdgePositionDetail & candidatePos, candidateKey: number
      ): boolean {
        if (candidateKey < resultKey) {
          resultKey = candidateKey;
          resultPos = candidatePos;
          return true;
        }
        return false;
      }
    */
    isAtXY(x, y) {
        return this._topo !== HalfEdgeTopo.None && Geometry_1.Geometry.isSameCoordinate(this.x, x) && Geometry_1.Geometry.isSameCoordinate(this.y, y);
    }
}
exports.HalfEdgePositionDetail = HalfEdgePositionDetail;
//# sourceMappingURL=HalfEdgePositionDetail.js.map