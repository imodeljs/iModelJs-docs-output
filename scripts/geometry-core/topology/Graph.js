"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Topology */
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const LineSegment3d_1 = require("../curve/LineSegment3d");
const Geometry_1 = require("../Geometry");
const Polynomials_1 = require("../numerics/Polynomials");
const MaskManager_1 = require("./MaskManager");
/**
 *
 * * A HalfEdge is "one side of an edge" in a structure of faces, edges and vertices.  From a node there are navigational links to:
 * ** "faceSuccessor" -- the next half edge in a loop around a face.
 * ** "facePredecessor" -- the previous half edge in a loop around a face.
 * ** "edgeMate"  -- the node's partner on the other side of the edge.
 * * The next, prev, and mate are the essential connectivity.  Additional node content is for application-specific
 *     uses.  The most useful ones are:
 * ** x,y -- coordinates in the xy plane
 * ** z -- z coordinate.  This is normally ignored during planar setup, but used for output.
 * ** buffer -- a integer value manipulated as individual bits.
 * * In properly connected planar graph, interior face loops are counterclockwise.  But that property (along with
 *      expected masking) is a result of extensive validation of inputs, and is not true in intermediate phases
 *      of graph manipulation.
 * @internal
 */
class HalfEdge {
    constructor(x = 0, y = 0, z = 0, i = 0) {
        this._id = HalfEdge._totalNodesCreated++;
        this.i = i;
        this.maskBits = 0x00000000;
        this.x = x;
        this.y = y;
        this.z = z;
        // Explicit init to undefined is important for performance here
        this.sortAngle = undefined;
        this.sortData = undefined;
        this.edgeTag = undefined;
        // Always created in pairs, init here to make TS compiler and JS runtime happy
        this._facePredecessor = this;
        this._faceSuccessor = this;
        this._edgeMate = this;
    }
    /** id assigned sequentially during construction --- useful for debugging. */
    get id() { return this._id; }
    /** previous half edge "around the face"
     */
    get facePredecessor() { return this._facePredecessor; }
    /** next half edge "around the face" */
    get faceSuccessor() { return this._faceSuccessor; }
    /** Half edge on the other side of this edge.
     */
    get edgeMate() { return this._edgeMate; }
    /** Take numStep face steps and return y coordinate
     * * positive steps are through faceSuccessor
     * * negative steps are through facePredecessor
     */
    faceStepY(numStep) {
        let node = this;
        if (numStep > 0)
            for (let i = 0; i < numStep; i++)
                node = node.faceSuccessor;
        else if (numStep < 0)
            for (let i = 0; i > numStep; i--)
                node = node.facePredecessor;
        return node.y;
    }
    /**
     * * Create 2 half edges.
     * * The two edges are joined as edgeMate pair.
     * * The two edges are a 2-half-edge face loop in both the faceSuccessor and facePredecessor directions.
     * @returns Returns the reference to the first half edge created
     */
    static createHalfEdgePair(heArray) {
        const a = new HalfEdge();
        const b = new HalfEdge();
        if (heArray) {
            heArray.push(a);
            heArray.push(b);
        }
        HalfEdge.setFaceLinks(a, b);
        HalfEdge.setFaceLinks(b, a);
        HalfEdge.setEdgeMates(a, b);
        return a;
    }
    /**
     * * Create 2 half edges.
     * * The two edges are joined as edgeMate pair.
     * * The two edges are a 2-half-edge face loop in both the faceSuccessor and facePredecessor directions.
     * * Properties x,y,z,i are inserted in each
     * @returns Returns the reference to the first half edge created
     */
    static createHalfEdgePairWithCoordinates(xA = 0, yA = 0, zA = 0, iA = 0, xB = 0, yB = 0, zB = 0, iB = 0, heArray) {
        const a = HalfEdge.createHalfEdgePair(heArray);
        const b = a._edgeMate;
        a.x = xA;
        a.y = yA;
        a.z = zA;
        a.i = iA;
        b.x = xB;
        b.y = yB;
        b.z = zB;
        b.i = iB;
        return a;
    }
    /**
     * * set heA <==> heB pointer relation through heA._faceSuccessor and heB._facePredecessor
     * * This changes heA._faceSuccessor and heB._facePredecessor, but not heA._facePredecessor and heB._faceSuccessor.
     * * this must always be done with another call to reestablish the entire double-linked list.
     */
    static setFaceLinks(heA, heB) {
        heA._faceSuccessor = heB;
        heB._facePredecessor = heA;
    }
    /**
     * * set heA <==> heB pointer relation edgeMate
     */
    static setEdgeMates(heA, heB) {
        heA._edgeMate = heB;
        heB._edgeMate = heA;
    }
    /**
     * * Create a new vertex within the edge from base.
     * * Insert it "within" the base edge.
     * * This requires two new half edges.
     * * if the base is undefined, create a single-edge loop.
     * * This (unlike pinch) breaks the edgeMate pairing of the base edge.
     * * This preserves xyz and i properties at all existing vertices.
     * * on each side, if edgeTag is present it is copied to the new edge.
     * @returns Returns the reference to the half edge created.
     */
    static splitEdge(baseA, xA = 0, yA = 0, zA = 0, iA = 0, heArray) {
        const newA = new HalfEdge(xA, yA, zA, iA);
        const newB = new HalfEdge(xA, yA, zA, iA);
        if (heArray) {
            heArray.push(newA);
            heArray.push(newB);
        }
        if (baseA === undefined) {
            newA._faceSuccessor = newA._facePredecessor = newA;
            newB._faceSuccessor = newB._facePredecessor = newB;
            HalfEdge.setEdgeMates(newA, newB);
        }
        else {
            const nextA = baseA._faceSuccessor;
            const mateA = baseA._edgeMate;
            const vPredA = mateA._faceSuccessor;
            HalfEdge.setFaceLinks(newA, nextA);
            HalfEdge.setFaceLinks(baseA, newA);
            HalfEdge.setFaceLinks(mateA, newB);
            HalfEdge.setFaceLinks(newB, vPredA);
            HalfEdge.setEdgeMates(newA, mateA);
            HalfEdge.setEdgeMates(newB, baseA);
            newA.edgeTag = baseA.edgeTag;
            newB.edgeTag = mateA.edgeTag;
        }
        return newA;
    }
    /**
     * Return the next outbound half edge around this vertex in the CCW direction
     */
    get vertexSuccessor() { return this.facePredecessor.edgeMate; }
    /**
     * Return the next outbound half edge around this vertex in the CW direction
     */
    get vertexPredecessor() { return this.edgeMate.faceSuccessor; }
    /**
     * Set mask bits on this HalfEdge
     * @param mask mask to apply
     */
    setMask(mask) { this.maskBits |= mask; }
    /**
     * Get mask bits from this HalfEdge
     * @param mask mask to query
     */
    getMask(mask) { return (this.maskBits & mask); }
    /**
     * Clear mask bits from this HalfEdge
     * @param mask mask to clear
     */
    clearMask(mask) { this.maskBits &= ~mask; }
    /**
     * Set a mask at all nodes around a vertex.
     * @param mask mask to apply to the half edges around this HalfEdge's vertex loop
     */
    setMaskAroundVertex(mask) {
        let node = this;
        do {
            node.setMask(mask);
            node = node.vertexSuccessor;
        } while (node !== this);
    }
    /**
     * Set x,y,z at all nodes around a vertex.
     * @param mask mask to apply to the half edges around this HalfEdge's vertex loop
     */
    setXYZAroundVertex(x, y, z) {
        let node = this;
        do {
            node.x = x;
            node.y = y;
            node.z = z;
            node = node.vertexSuccessor;
        } while (node !== this);
    }
    /**
     * Apply a mask to all edges around a face.
     * @param mask mask to apply to the half edges around this HalfEdge's face loop
     */
    setMaskAroundFace(mask) {
        let node = this;
        do {
            node.setMask(mask);
            node = node.faceSuccessor;
        } while (node !== this);
    }
    /**
     * Apply a mask to both sides of an edge.
     * @param mask mask to apply to this edge and its `edgeMate`
     */
    setMaskAroundEdge(mask) {
        this.setMask(mask);
        this.edgeMate.setMask(mask);
    }
    /**
     * Apply a mask to both sides of an edge.
     * @param mask mask to apply to this edge and its `edgeMate`
     */
    clearMaskAroundEdge(mask) {
        this.clearMask(mask);
        this.edgeMate.clearMask(mask);
    }
    /** Returns the number of edges around this face. */
    countEdgesAroundFace() {
        let count = 0;
        let node = this;
        do {
            count++;
            node = node.faceSuccessor;
        } while (node !== this);
        return count;
    }
    /**
     * Apply a edgeTag and mask to all edges around a face.
     * optionally apply it to all edge mates.
     * @param edgeTag tag to apply
     * @param bothSides If true, also apply the tag to the mates around the face.
     */
    setMaskAndEdgeTagAroundFace(mask, tag, applyToMate = false) {
        let node = this;
        do {
            node.setMask(mask);
            node.edgeTag = tag;
            if (applyToMate) {
                const mate = node.edgeMate;
                mate.edgeTag = tag;
                mate.setMask(mask);
            }
            node = node.faceSuccessor;
        } while (node !== this);
    }
    /** Returns the number of edges around vertex. */
    countEdgesAroundVertex() {
        let count = 0;
        let node = this;
        do {
            count++;
            node = node.vertexSuccessor;
        } while (node !== this);
        return count;
    }
    /** Returns the number of nodes found with the given mask value around this vertex loop. */
    countMaskAroundFace(mask, value = true) {
        let count = 0;
        let node = this;
        if (value) {
            do {
                if (node.isMaskSet(mask))
                    count++;
                node = node.faceSuccessor;
            } while (node !== this);
        }
        else {
            do {
                if (!node.isMaskSet(mask))
                    count++;
                node = node.faceSuccessor;
            } while (node !== this);
        }
        return count;
    }
    /** Returns the number of nodes found with the given mask value around this vertex loop.   */
    countMaskAroundVertex(mask, value = true) {
        let count = 0;
        let node = this;
        if (value) {
            do {
                if (node.isMaskSet(mask))
                    count++;
                node = node.vertexSuccessor;
            } while (node !== this);
        }
        else {
            do {
                if (!node.isMaskSet(mask))
                    count++;
                node = node.vertexSuccessor;
            } while (node !== this);
        }
        return count;
    }
    /** Set a mask, and return prior value.
     * @param mask mask to apply
     */
    testAndSetMask(mask) {
        const oldMask = this.maskBits & mask;
        this.maskBits |= mask;
        return oldMask;
    }
    /**
     * Set (copy) the this.x, this.y, this.z from node.x, node.y, node.z
     * @param node node containing xyz
     */
    setXYZFrom(node) {
        this.x = node.x;
        this.y = node.y;
        this.z = node.z;
    }
    /**
     * Test if mask bits are set in the node's bitMask.
     * @return Return true (as a simple boolean, not a mask) if any bits of the mask parameter match bits of the node's bitMask
     */
    isMaskSet(mask) { return (this.maskBits & mask) !== 0; }
    /** (static!) method to test if a mask is set on a node.
     * This is used as filter in searches.
     * @returns true iff `node.isMaskSet (mask)`
     */
    static filterIsMaskOn(node, mask) {
        return node.isMaskSet(mask);
    }
    /** (static!) method to test if a mask is set on a node.
     * This is used as filter in searches.
     * @returns true iff `!node.isMaskSet (mask)`
     */
    static filterIsMaskOff(node, mask) {
        return !node.isMaskSet(mask);
    }
    /**
     * Create an edge with initial id,x,y at each end.
     * @param id0 id for first node
     * @param x0  x coordinate for first node
     * @param y0  y coordinate for first node
     * @param id1 id for second node
     * @param x1 x coordinate for second node
     * @param y1 y coordinate for second node
     */
    static createEdgeXYXY(id0, x0, y0, id1, x1, y1) {
        const node0 = new HalfEdge(x0, y0);
        const node1 = new HalfEdge(x1, y1);
        node0._faceSuccessor = node0._facePredecessor = node0._edgeMate = node1;
        node1._faceSuccessor = node1._facePredecessor = node1._edgeMate = node0;
        node0._id = id0;
        node1._id = id1;
        return node0;
    }
    /** "pinch" ...
     *
     * * is the universal manipulator for manipulating a node's next and prev pointers
     * * swaps face predecessors of nodeA and nodeB.
     * *  is its own inverse.
     * *  if nodeA, nodeB are in different face loops, the loops join to one loop.
     * *  if nodeA, nodeB are in the same face loop, the loop splits into two loops.
     */
    static pinch(nodeA, nodeB) {
        if (nodeA !== nodeB) {
            const predA = nodeA._facePredecessor;
            const predB = nodeB._facePredecessor;
            nodeB._facePredecessor = predA;
            nodeA._facePredecessor = predB;
            predB._faceSuccessor = nodeA;
            predA._faceSuccessor = nodeB;
        }
    }
    /** Turn all pointers to undefined so garbage collector can reuse the object.
     *  This is to be called only by a Graph object that is being decommissioned.
     */
    decommission() {
        this._facePredecessor = undefined;
        this._faceSuccessor = undefined;
        this._edgeMate = undefined;
    }
    /** Return the node. This identity function is useful as the NodeFunction in collector methods. */
    static nodeToSelf(node) { return node; }
    /** Return the id of a node.  Useful for collector methods. */
    static nodeToId(node) { return node.id; }
    /** Return the id of a node.Useful for collector methods. */
    static nodeToIdString(node) { return node.id.toString(); }
    /** Return the [id, [x,y]] of a node.  Useful for collector methods. */
    static nodeToIdMaskXY(node) {
        return { id: node.id, mask: HalfEdge.nodeToMaskString(node), xy: [node.x, node.y] };
    }
    /** Return the [id, [x,y]] of a node.  Useful for collector methods. */
    static nodeToIdXYString(node) {
        const s = node.id.toString() + " " +
            HalfEdge.nodeToMaskString(node) + " [" + node.x + "," + node.y + "]";
        return s;
    }
    /** Create a string representation of the mask
     * * Null mask is empty string.
     * * Appended characters B,P,X for Boundary, Primary, Exterior mask bits.
     */
    static nodeToMaskString(node) {
        let s = "";
        if (node.isMaskSet(HalfEdgeMask.BOUNDARY_EDGE))
            s += "B";
        if (node.isMaskSet(HalfEdgeMask.PRIMARY_EDGE))
            s += "P";
        if (node.isMaskSet(HalfEdgeMask.EXTERIOR))
            s += "X";
        if (node.isMaskSet(HalfEdgeMask.NULL_FACE))
            s += "N";
        return s;
    }
    /** Return [x,y] with coordinates of node */
    static nodeToXY(node) { return [node.x, node.y]; }
    /** Return Vector2d to face successor, with only xy coordinates */
    vectorToFaceSuccessorXY(result) {
        return Point2dVector2d_1.Vector2d.create(this.faceSuccessor.x - this.x, this.faceSuccessor.y - this.y, result);
    }
    /** Return Vector3d to face successor */
    vectorToFaceSuccessor(result) {
        return Point3dVector3d_1.Vector3d.create(this.faceSuccessor.x - this.x, this.faceSuccessor.y - this.y, this.faceSuccessor.z - this.z, result);
    }
    /** Returns Return cross product (2d) of vectors from base to target1 and this to target2 */
    static crossProductXYToTargets(base, targetA, targetB) {
        return Geometry_1.Geometry.crossProductXYXY(targetA.x - base.x, targetA.y - base.y, targetB.x - base.x, targetB.y - base.y);
    }
    /** Return cross product (2d) of vectors from nodeA to nodeB and nodeB to nodeC
     */
    static crossProductXYAlongChain(nodeA, nodeB, nodeC) {
        return Geometry_1.Geometry.crossProductXYXY(nodeB.x - nodeA.x, nodeB.y - nodeA.y, nodeC.x - nodeB.x, nodeC.y - nodeB.y);
    }
    /** Return true if `this` is lexically below `other`, comparing y first then x. */
    belowYX(other) {
        // Check y's
        // if (!Geometry.isSameCoordinate(a.y, b.y))
        if (this.y < other.y)
            return true;
        if (this.y > other.y)
            return false;
        // same y.
        // Check x's
        if (this.x < other.x)
            return true;
        return false;
    }
    /** Returns Returns true if the node does NOT have Mask.EXTERIOR_MASK set. */
    static testNodeMaskNotExterior(node) { return !node.isMaskSet(HalfEdgeMask.EXTERIOR); }
    /** Returns Returns true if the face has positive area in xy parts. */
    static testFacePositiveAreaXY(node) {
        return node.countEdgesAroundFace() > 2 && node.signedFaceArea() > 0.0;
    }
    /** Return true if x and y coordinates of this and other are exactly equal */
    isEqualXY(other) {
        return this.x === other.x && this.y === other.y;
    }
    /** Return true if x and y coordinates of this and other are exactly equal */
    distanceXY(other) {
        return Geometry_1.Geometry.distanceXYXY(this.x, this.y, other.x, other.y);
    }
    /** Return true if x and y coordinates of this and other are exactly equal */
    distanceXYZ(other) {
        return Geometry_1.Geometry.distanceXYZXYZ(this.x, this.y, this.z, other.x, other.y, other.z);
    }
    /**
     *
     * * Evaluate f(node) at each node around a face loop.
     * * Collect the function values.
     * @returns Return the array of function values.
     */
    collectAroundFace(f) {
        const nodes = [];
        let node = this;
        do {
            nodes.push(f ? f(node) : node);
            node = node.faceSuccessor;
        } while (node !== this);
        return nodes;
    }
    /**
     *
     * * Evaluate f(node) at each outbound node around this node's vertex loop.
     * * Collect the function values.
     * @returns Return the array of function values.
     */
    collectAroundVertex(f) {
        const nodes = [];
        let node = this;
        do {
            nodes.push(f ? f(node) : node);
            node = node.vertexSuccessor;
        } while (node !== this);
        return nodes;
    }
    /**
     *
     * * Evaluate f(node) at each node around a face loop.
     * * Sum the function values
     * @returns Return the sum
     */
    sumAroundFace(f) {
        let node = this;
        let sum = 0;
        do {
            sum += f(node);
            node = node.faceSuccessor;
        } while (node !== this);
        return sum;
    }
    /**
     *
     * * Evaluate f(node) at each outbound node around this node's vertex loop.
     * * Sum the function values
     * @returns Return the sum
     */
    sumAroundVertex(f) {
        let node = this;
        let sum = 0;
        do {
            sum += f(node);
            node = node.vertexSuccessor;
        } while (node !== this);
        return sum;
    }
    /** For all the nodes in the face loop of the given node, clear out the mask given */
    clearMaskAroundFace(mask) {
        let node = this;
        do {
            node.clearMask(mask);
            node = node.faceSuccessor;
        } while (node !== this);
    }
    /** For all the nodes in the vertex loop of the given node, clear out the mask given */
    clearMaskAroundVertex(mask) {
        let node = this;
        do {
            node.clearMask(mask);
            node = node.vertexSuccessor;
        } while (node !== this);
    }
    /** Returns the signed sum of xy areas of triangles from first node to edges.
     *
     * * A positive area is counterclockwise.
     * * A negative area is clockwise.
     */
    signedFaceArea() {
        let sum = 0;
        // sum area of trapezoids.
        // * the formula in the loop gives twice the area (because it does nto average the y values).
        // * this is fixed up at the end by a single multiply by 0.5
        // * individual trapezoid heights are measured from y at the start node to keep area values numerical smaller.
        const y0 = this.y;
        let dy0 = 0.0;
        let dy1 = 0.0;
        let x0 = this.x;
        let x1 = x0;
        let node1 = this; // just to initialize -- reassigned in each loop pass.
        let node0 = this;
        do {
            node1 = node0.faceSuccessor;
            x1 = node1.x;
            dy1 = node1.y - y0;
            sum += (x0 - x1) * (dy0 + dy1);
            x0 = x1;
            dy0 = dy1;
            node0 = node1;
            node0 = node1;
        } while (node0 !== this);
        return 0.5 * sum;
    }
    /**
     * interpolate xy coordinates between this node and its face successor.
     * @param fraction fractional position along this edge.
     * @param result xy coordinates
     */
    fractionToPoint2d(fraction, result) {
        const node1 = this.faceSuccessor;
        return Point2dVector2d_1.Point2d.create(this.x + (node1.x - this.x) * fraction, this.y + (node1.y - this.y) * fraction, result);
    }
    /**
     * interpolate xy coordinates between this node and its face successor.
     * @param fraction fractional position along this edge.
     * @param result xy coordinates
     */
    fractionToPoint3d(fraction, result) {
        const node1 = this.faceSuccessor;
        return Point3dVector3d_1.Point3d.create(this.x + (node1.x - this.x) * fraction, this.y + (node1.y - this.y) * fraction, this.z + (node1.z - this.z) * fraction, result);
    }
    /**
     * * interpolate xy coordinates at fractionAlong between this node and its face successor.
     * * shift to left by fractionPerpendicular
     * @param fraction fractional position along this edge.
     * @param result xy coordinates
     */
    fractionAlongAndPerpendicularToPoint2d(fractionAlong, fractionPerpendicular, result) {
        const node1 = this.faceSuccessor;
        const dx = node1.x - this.x;
        const dy = node1.y - this.y;
        return Point2dVector2d_1.Point2d.create(this.x + dx * fractionAlong - dy * fractionPerpendicular, this.y + dy * fractionAlong + dx * fractionPerpendicular, result);
    }
    /**
     * Return the interpolated x coordinate between this node and its face successor.
     * @param fraction fractional position along this edge.
     */
    fractionToX(fraction) {
        const node1 = this.faceSuccessor;
        return this.x + (node1.x - this.x) * fraction;
    }
    /**
     * Return the interpolated y coordinate between this node and its face successor.
     * @param fraction fractional position along this edge.
     */
    fractionToY(fraction) {
        const node1 = this.faceSuccessor;
        return this.y + (node1.y - this.y) * fraction;
    }
    /**
     * Return the interpolated z coordinate between this node and its face successor.
     * @param fraction fractional position along this edge.
     */
    fractionToZ(fraction) {
        const node1 = this.faceSuccessor;
        return this.z + (node1.z - this.z) * fraction;
    }
    /**
     * * Compute fractional coordinates of the intersection of edges from given base nodes
     * * If parallel or colinear, return undefined.
     * * If (possibly extended) lines intersect, return the fractions of intersection as x,y in the result.
     * @param nodeA0 Base node of edge A
     * @param nodeB0 Base node of edge B
     * @param result optional preallocated result
     */
    static transverseIntersectionFractions(nodeA0, nodeB0, result) {
        const nodeA1 = nodeA0.faceSuccessor;
        const nodeB1 = nodeB0.faceSuccessor;
        if (!result)
            result = Point2dVector2d_1.Vector2d.create();
        if (Polynomials_1.SmallSystem.linearSystem2d(nodeA1.x - nodeA0.x, nodeB0.x - nodeB1.x, nodeA1.y - nodeA0.y, nodeB0.y - nodeB1.y, nodeB0.x - nodeA0.x, nodeB0.y - nodeA0.y, result))
            return result;
        return undefined;
    }
    /**
     * * Compute fractional coordinates of the intersection of a horizontal line with an edge.
     * * If the edge is horizontal with (approximate) identical y, return the node.
     * * If the edge is horizontal with different y, return undefined.
     * * If the edge is not horizontal, return the fractional position (possibly outside 0..1) of the intersection.
     * @param nodeA Base node of edge
     * @param result optional preallocated result
     */
    static horizontalScanFraction(node0, y) {
        const node1 = node0.faceSuccessor;
        const dy = node1.y - node0.y;
        if (Geometry_1.Geometry.isSameCoordinate(y, node0.y) && Geometry_1.Geometry.isSameCoordinate(y, node1.y))
            return node0;
        if (Geometry_1.Geometry.isSameCoordinate(dy, 0.0))
            return undefined;
        return Geometry_1.Geometry.conditionalDivideFraction(y - node0.y, dy);
    }
    /**
     * * Compute fractional coordinates of the intersection of a horizontal line with an edge.
     * * If the edge is horizontal return undefined (no test for horizontal at y!!!)
     * * If the edge is not horizontal and y is between its end y's, return the fraction
     * @param nodeA Base node of edge
     * @param result optional preallocated result
     */
    static horizontalScanFraction01(node0, y) {
        const node1 = node0.faceSuccessor;
        const dy = node1.y - node0.y;
        if (Geometry_1.Geometry.isSameCoordinate(y, node0.y) && Geometry_1.Geometry.isSameCoordinate(y, node1.y))
            return undefined;
        if (Geometry_1.Geometry.isSameCoordinate(dy, 0.0))
            return undefined;
        const fraction = Geometry_1.Geometry.conditionalDivideFraction(y - node0.y, dy);
        if (fraction !== undefined && fraction >= 0.0 && fraction <= 1.0)
            return fraction;
        return undefined;
    }
}
exports.HalfEdge = HalfEdge;
HalfEdge._totalNodesCreated = 0;
/**
 * A HalfEdgeGraph has:
 * * An array of (pointers to ) HalfEdge objects.
 * * A pool of masks for grab/drop use by algorithms.
 * @internal
 */
class HalfEdgeGraph {
    constructor() {
        this._numNodesCreated = 0;
        this.allHalfEdges = [];
        this._maskManager = MaskManager_1.MaskManager.create(HalfEdgeMask.ALL_GRAB_DROP_MASKS);
    }
    /** Ask for a mask (from the graph's free pool.) for caller's use.
     * * Optionally clear the mask throughout the graph.
     */
    grabMask(clearInAllHalfEdges = true) {
        const mask = this._maskManager.grabMask();
        if (clearInAllHalfEdges) {
            this.clearMask(mask);
        }
        return mask;
    }
    /**
     * Return `mask` to the free pool.
     */
    dropMask(mask) { this._maskManager.dropMask(mask); }
    /**
     * * Create 2 half edges forming 2 vertices, 1 edge, and 1 face
     * * The two edges are joined as edgeMate pair.
     * * The two edges are a 2-half-edge face loop in both the faceSuccessor and facePredecessor directions.
     * * The two edges are added to the graph's HalfEdge set
     * @returns Return pointer to the first half edge created.
     */
    createEdgeXYZXYZ(xA = 0, yA = 0, zA = 0, iA = 0, xB = 0, yB = 0, zB = 0, iB = 0) {
        const a = HalfEdge.createHalfEdgePairWithCoordinates(xA, yA, zA, iA, xB, yB, zB, iB, this.allHalfEdges);
        return a;
    }
    /**
     * * create an edge from coordinates x,y,z to (the tail of) an existing half edge.
     * @returns Return pointer to the half edge with tail at x,y,z
     */
    createEdgeXYZHalfEdge(xA = 0, yA = 0, zA = 0, iA = 0, node, iB = 0) {
        const a = HalfEdge.createHalfEdgePairWithCoordinates(xA, yA, zA, iA, node.x, node.y, node.z, iB, this.allHalfEdges);
        const b = a.faceSuccessor;
        HalfEdge.pinch(node, b);
        return a;
    }
    /**
     * * create an edge from coordinates x,y,z to (the tail of) an existing half edge.
     * @returns Return pointer to the half edge with tail at x,y,z
     */
    createEdgeHalfEdgeHalfEdge(nodeA, idA, nodeB, idB = 0) {
        const a = HalfEdge.createHalfEdgePairWithCoordinates(nodeA.x, nodeA.y, nodeA.z, idA, nodeB.x, nodeB.y, nodeB.z, idB, this.allHalfEdges);
        const b = a.faceSuccessor;
        HalfEdge.pinch(nodeA, a);
        HalfEdge.pinch(nodeB, b);
        return a;
    }
    /**
     * * Create 2 half edges forming 2 vertices, 1 edge, and 1 face
     * * The two edges are joined as edgeMate pair.
     * * The two edges are a 2-half-edge face loop in both the faceSuccessor and facePredecessor directions.
     * * The two edges are added to the graph's HalfEdge set
     * @returns Return pointer to the first half edge created.
     */
    createEdgeXYAndZ(xyz0, id0, xyz1, id1) {
        const a = HalfEdge.createHalfEdgePairWithCoordinates(xyz0.x, xyz0.y, xyz0.z, id0, xyz1.x, xyz1.y, xyz1.z, id1, this.allHalfEdges);
        return a;
    }
    /**
     * * Insert a vertex in the edge beginning at base.
     * * this creates two half edges.
     * * The base of the new edge is 'after' the (possibly undefined) start node in its face loop.
     * * The existing mate retains its base xyz and i properties but is no longer the mate of base.
     * * The base and existing mate each become mates with a new half edge.
     * @returns Returns the reference to the half edge created.
     */
    splitEdge(base, xA = 0, yA = 0, zA = 0, iA = 0) {
        const he = HalfEdge.splitEdge(base, xA, yA, zA, iA, this.allHalfEdges);
        return he;
    }
    /**
     * * Insert a vertex in the edge beginning at base, with coordinates specified as a fraction along the existing edge.
     * * this creates two half edges.
     * * The base of the new edge is 'after' the (possibly undefined) start node in its face loop.
     * * The existing mate retains its base xyz and i properties but is no longer the mate of base.
     * * The base and existing mate each become mates with a new half edge.
     * @returns Returns the reference to the half edge created.
     */
    splitEdgeAtFraction(base, fraction) {
        const he = HalfEdge.splitEdge(base, base.fractionToX(fraction), base.fractionToY(fraction), base.fractionToZ(fraction), 0, this.allHalfEdges);
        return he;
    }
    /** This is a destructor-like action that eliminates all interconnection among the graph's nodes.
     * After this is called the graph is unusable.
     */
    decommission() {
        for (const node of this.allHalfEdges) {
            node.decommission();
        }
        this.allHalfEdges.length = 0;
        this.allHalfEdges = undefined;
    }
    /** create two nodes of a new edge.
     * @returns Return one of the two nodes, which the caller may consider as the start of the edge.
     */
    addEdgeXY(x0, y0, x1, y1) {
        const baseNode = HalfEdge.createEdgeXYXY(this._numNodesCreated, x0, y0, this._numNodesCreated + 1, x1, y1);
        this._numNodesCreated += 2;
        this.allHalfEdges.push(baseNode);
        this.allHalfEdges.push(baseNode.faceSuccessor);
        return baseNode;
    }
    /** Clear selected bits in all nodes of the graph. */
    clearMask(mask) {
        for (const node of this.allHalfEdges)
            node.maskBits &= ~mask;
    }
    /** Set selected bits in all nodes of the graph. */
    setMask(mask) {
        for (const node of this.allHalfEdges)
            node.maskBits |= mask;
    }
    /** toggle selected bits in all nodes of the graph. */
    reverseMask(mask) {
        for (const node of this.allHalfEdges) {
            node.maskBits ^= mask;
        }
    }
    /**
     * Return the number of nodes that have a specified mask bit set.
     * @param mask mask to count
     */
    countMask(mask) {
        let n = 0;
        for (const node of this.allHalfEdges)
            if (node.isMaskSet(mask))
                n++;
        return n;
    }
    /** Return an array LineSegment3d.
     * * The array has one segment per edge
     * * The coordinates are taken from a node and its face successor.
     * * On each edge, the line segment start at the HalfEdge with lower id than its edgeMate.
     */
    collectSegments() {
        const segments = [];
        for (const node of this.allHalfEdges) {
            if (node.id < node.edgeMate.id)
                segments.push(LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(node.x, node.y), Point3dVector3d_1.Point3d.create(node.faceSuccessor.x, node.faceSuccessor.y)));
        }
        return segments;
    }
    /** Returns the number of vertex loops in a graph structure */
    countVertexLoops() {
        this.clearMask(HalfEdgeMask.VISITED);
        let count = 0;
        this.announceVertexLoops((_graph, _seed) => { count++; return true; });
        return count;
    }
    /** Returns the number of face loops */
    countFaceLoops() {
        this.clearMask(HalfEdgeMask.VISITED);
        let count = 0;
        this.announceFaceLoops((_graph, _seed) => { count++; return true; });
        return count;
    }
    /**
     * Returns the number of face loops satisfying a filter function with mask argument.
     *
     */
    countFaceLoopsWithMaskFilter(filter, mask) {
        this.clearMask(HalfEdgeMask.VISITED);
        let count = 0;
        this.announceFaceLoops((_graph, seed) => {
            if (filter(seed, mask))
                count++;
            return true;
        });
        return count;
    }
    /** Returns an array of nodes, where each node represents a starting point of a face loop.
     */
    collectFaceLoops() {
        const returnArray = [];
        this.announceFaceLoops((_graph, node) => { returnArray.push(node); return true; });
        return returnArray;
    }
    /** Returns an array of nodes, where each node represents a starting point of a vertex loop.
     */
    collectVertexLoops() {
        this.clearMask(HalfEdgeMask.VISITED);
        const returnArray = [];
        for (const node of this.allHalfEdges) {
            if (node.getMask(HalfEdgeMask.VISITED))
                continue;
            returnArray.push(node);
            node.setMaskAroundVertex(HalfEdgeMask.VISITED);
        }
        return returnArray;
    }
    /**
     * * Visit each facet of the graph once.
     * * Call the announceFace function
     * * continue search if announceFace(graph, node) returns true
     * * terminate search if announce face (graph, node) returns false
     * @param  announceFace function to apply at one node of each face.
     */
    announceFaceLoops(announceFace) {
        this.clearMask(HalfEdgeMask.VISITED);
        for (const node of this.allHalfEdges) {
            if (node.getMask(HalfEdgeMask.VISITED))
                continue;
            node.setMaskAroundFace(HalfEdgeMask.VISITED);
            if (!announceFace(this, node))
                break;
        }
    }
    /**
     * * Visit each vertex loop of the graph once.
     * * Call the announceVertex function
     * * continue search if announceFace(graph, node) returns true
     * * terminate search if announce face (graph, node) returns false
     * @param  announceVertex function to apply at one node of each face.
     */
    announceVertexLoops(announceVertex) {
        this.clearMask(HalfEdgeMask.VISITED);
        for (const node of this.allHalfEdges) {
            if (node.getMask(HalfEdgeMask.VISITED))
                continue;
            node.setMaskAroundVertex(HalfEdgeMask.VISITED);
            if (!announceVertex(this, node))
                break;
        }
    }
    /** Return the number of nodes in the graph */
    countNodes() { return this.allHalfEdges.length; }
    /** Apply transform to the xyz coordinates in the graph. */
    transformInPlace(transform) {
        for (const node of this.allHalfEdges) {
            transform.multiplyXYAndZInPlace(node);
        }
    }
}
exports.HalfEdgeGraph = HalfEdgeGraph;
// cspell:word CONSTU
// cspell:word CONSTV
// cspell:word USEAM
// cspell:word VSEAM
/**
 * * Each node of the graph has a mask member.
 * * The mask member is a number which is used as set of single bit boolean values.
 * * Particular meanings of the various bits are HIGHLY application dependent.
 *   * The EXTERIOR mask bit is widely used to mark nodes that are "outside" the active areas
 *   * The PRIMARY_EDGE bit is widely used to indicate linework created directly from input data, hence protected from triangle edge flipping.
 *   * The BOUNDARY bit is widely used to indicate that crossing this edge is a transition from outside to inside.
 *   * VISITED is used locally in many searches.
 *      * Never use VISITED unless the search logic is highly self contained.
 * @internal
 */
var HalfEdgeMask;
(function (HalfEdgeMask) {
    /**  Mask commonly set consistently around exterior faces.
     * * A boundary edge with interior to one side, exterior to the other will have EXTERIOR only on the outside.
     * * An an edge inserted "within a purely exterior face" can have EXTERIOR on both MediaStreamAudioDestinationNode[Symbol]
     * * An interior edges (such as added during triangulation) will have no EXTERIOR bits.
     */
    HalfEdgeMask[HalfEdgeMask["EXTERIOR"] = 1] = "EXTERIOR";
    /** Mask commonly set (on both sides) of original geometry edges that are transition from outside from to inside.
     * * At the moment of creating an edge from primary user boundary loop coordinates, the fact that an edge is BOUNDARY is often clear even though
     *  there is uncertainty about which side should be EXTERIOR.
     */
    HalfEdgeMask[HalfEdgeMask["BOUNDARY_EDGE"] = 2] = "BOUNDARY_EDGE";
    // REMARK: Various mask names are COMMENTED here for reference to native legacy code.
    // CONSTU_MASK = 0x00000004,
    // CONSTV_MASK = 0x00000008,
    // USEAM_MASK = 0x00000010,
    // VSEAM_MASK = 0x00000020,
    // BOUNDARY_VERTEX_MASK = 0x00000040,
    // PRIMARY_VERTEX_MASK = 0x00000080,
    // DIRECTED_EDGE_MASK = 0x00000100,
    /** Mask commonly set (on both sides) of original geometry edges, but NOT indicating that the edge is certainly a boundary between outside and inside.
     * * For instance, if geometry is provided as stray sticks (not loops), it can be marked PRIMARY_EDGE but neither BOUNDARY_EDGE nor EXTERIOR_EDGE
     */
    HalfEdgeMask[HalfEdgeMask["PRIMARY_EDGE"] = 4] = "PRIMARY_EDGE";
    /** Mask used for low level searches to identify previously-visited nodes */
    HalfEdgeMask[HalfEdgeMask["VISITED"] = 16] = "VISITED";
    /** Mask applied to triangles by earcut triangulator */
    HalfEdgeMask[HalfEdgeMask["TRIANGULATED_FACE"] = 256] = "TRIANGULATED_FACE";
    /** mask applied in a face with 2 edges. */
    HalfEdgeMask[HalfEdgeMask["NULL_FACE"] = 512] = "NULL_FACE";
    /** no mask bits */
    HalfEdgeMask[HalfEdgeMask["NULL_MASK"] = 0] = "NULL_MASK";
    /** The "upper 12 " bits of 32 bit integer. */
    HalfEdgeMask[HalfEdgeMask["ALL_GRAB_DROP_MASKS"] = 4293918720] = "ALL_GRAB_DROP_MASKS";
    /** all mask bits */
    HalfEdgeMask[HalfEdgeMask["ALL_MASK"] = 4294967295] = "ALL_MASK";
    // informal convention on preassigned mask bit numbers:
    // byte0 (EXTERIOR, BOUNDARY_EDGE, PRIMARY_EDGE) -- edge properties
    // byte1 (VISITED, VISIT_A, WORK_MASK0, WORK_MASK1) -- temp masks for algorithms.
    // byte2 (TRIANGULATED_FACE, NULL_FACE) -- face properties.
})(HalfEdgeMask = exports.HalfEdgeMask || (exports.HalfEdgeMask = {}));
//# sourceMappingURL=Graph.js.map