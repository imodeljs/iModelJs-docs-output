"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Topology */
const PointVector_1 = require("../PointVector");
const LineSegment3d_1 = require("../curve/LineSegment3d");
const Geometry_1 = require("../Geometry");
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
 */
class HalfEdge {
    constructor(x = 0, y = 0, z = 0, i = 0) {
        this._id = HalfEdge._totalNodesCreated++;
        this.i = i;
        this.maskBits = 0x00000000;
        this.x = x;
        this.y = y;
        this.z = z;
        this.steiner = false;
        // Other variables are by default undefined
    }
    get id() { return this._id; }
    /** previous half edge "around the face"
     */
    get facePredecessor() { return this._facePredecessor; }
    /** next half edge "around the face" */
    get faceSuccessor() { return this._faceSuccessor; }
    /** Half edge on the other side of this edge.
     */
    get edgeMate() { return this._edgeMate; }
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
     * * this must always be done with another call to restablish the entire double-linked list.
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
     * * This preserves xyzi properties at all existing vertices.
     * @returns Returns the reference to the half edge created.
     */
    static splitEdge(base, xA = 0, yA = 0, zA = 0, iA = 0, heArray) {
        const newA = new HalfEdge(xA, yA, zA, iA);
        const newB = new HalfEdge(xA, yA, zA, iA);
        if (heArray) {
            heArray.push(newA);
            heArray.push(newB);
        }
        if (base === undefined) {
            newA._faceSuccessor = newA._facePredecessor = newA;
            newB._faceSuccessor = newB._facePredecessor = newB;
            HalfEdge.setEdgeMates(newA, newB);
        }
        else {
            const nextA = base._faceSuccessor;
            const mateA = base._edgeMate;
            const vpredA = mateA._faceSuccessor;
            HalfEdge.setFaceLinks(newA, nextA);
            HalfEdge.setFaceLinks(base, newA);
            HalfEdge.setFaceLinks(mateA, newB);
            HalfEdge.setFaceLinks(newB, vpredA);
            HalfEdge.setEdgeMates(newA, mateA);
            HalfEdge.setEdgeMates(newB, base);
        }
        return newA;
    }
    /**
     * @returns Return the next outbound half edge around this vertex in the CCW direction
     */
    get vertexSuccessor() { return this.facePredecessor.edgeMate; }
    /**
     * @returns Return the next outbound half edge around this vertex in the CW direction
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
     *
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
     *
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
     * @returns Returns the number of edges around this face.
     */
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
     * @returns Returns the number of edges around vertex.
     */
    countEdgesAroundVertex() {
        let count = 0;
        let node = this;
        do {
            count++;
            node = node.vertexSuccessor;
        } while (node !== this);
        return count;
    }
    /**
     * @returns Returns the number of nodes found with the given mask value around this vertex loop.
     */
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
    /**
     * @returns Returns the number of nodes found with the given mask value around this vertex loop.
     */
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
    /**
     * @returns the mask value prior to the call to this method.
     * @param mask mask to apply
     */
    testAndSetMask(mask) {
        const oldMask = this.maskBits & mask;
        this.maskBits |= mask;
        return oldMask;
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
     * * swaps face precessors of nodeA and nodeB.
     * *  is its own inverse.
     * *  does nothing if either node does not have a predecessor (this is obviously a logic error in the caller algorithm)
     * *  if nodeA, nodeB are in different face loops, the loops join to one loop.
     * *  if nodeA, nodeB are in the same face loop, the loop splits into two loops.
     */
    static pinch(nodeA, nodeB) {
        const predA = nodeA._facePredecessor;
        const predB = nodeB._facePredecessor;
        if (predA && predB) {
            nodeB._facePredecessor = predA;
            nodeA._facePredecessor = predB;
            predB._faceSuccessor = nodeA;
            predA._faceSuccessor = nodeB;
        }
    }
    /** Turn all pointers to undefined so garbage collector can reuse the object.
     *  This is to be called only by a Graph object that is being decomissioned.
     */
    decomission() {
        this._facePredecessor = undefined;
        this._faceSuccessor = undefined;
        this._edgeMate = undefined;
        this.nextZ = undefined;
        this.prevZ = undefined;
    }
    /** @returns Return the node. This identity function is useful as the NodeFunction in collector methods. */
    static nodeToSelf(node) { return node; }
    /** @returns Return the id of a node.  Useful for collector methods. */
    static nodeToId(node) { return node.id; }
    /** @returns Return the id of a node.Useful for collector methods. */
    static nodeToIdString(node) { return node.id.toString(); }
    /** @returns Return the [id, [x,y]] of a node.  Useful for collector methods. */
    static nodeToIdMaskXY(node) {
        return { id: node.id, mask: HalfEdge.nodeToMaskString(node), xy: [node.x, node.y] };
    }
    /** @returns Return the [id, [x,y]] of a node.  Useful for collector methods. */
    static nodeToIdXYString(node) {
        const s = node.id.toString() + " " +
            HalfEdge.nodeToMaskString(node) + " [" + node.x + "," + node.y + "]";
        return s;
    }
    /**  */
    static nodeToMaskString(node) {
        let s = "";
        if (node.isMaskSet(2 /* BOUNDARY */))
            s += "B";
        if (node.isMaskSet(512 /* PRIMARY_EDGE */))
            s += "P";
        if (node.isMaskSet(1 /* EXTERIOR */))
            s += "X";
        return s;
    }
    /** @returns Return [x,y] with coordinates of node */
    static nodeToXY(node) { return [node.x, node.y]; }
    /** @returns Return Vector2d to face successor, with only xy coordinates */
    vectorToFaceSuccessorXY(result) {
        return PointVector_1.Vector2d.create(this.faceSuccessor.x - this.x, this.faceSuccessor.y - this.y, result);
    }
    /** @returns Return Vector3d to face successor */
    vectorToFaceSuccessor(result) {
        return PointVector_1.Vector3d.create(this.faceSuccessor.x - this.x, this.faceSuccessor.y - this.y, this.faceSuccessor.z - this.z, result);
    }
    /** @returns Returns true if the node does NOT have Mask.EXTERIOR_MASK set. */
    static testNodeMaskNotExterior(node) { return !node.isMaskSet(1 /* EXTERIOR */); }
    /** @return Return true if x and y coordinates of this and other are exactly equal */
    isEqualXY(other) {
        return this.x === other.x && this.y === other.y;
    }
    /** @return Return true if x and y coordinates of this and other are exactly equal */
    distanceXY(other) {
        return Geometry_1.Geometry.distanceXYXY(this.x, this.y, other.x, other.y);
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
    /** Returns the signed sum of a loop of nodes.
     *
     * * A positive area is counterclockwise.
     * * A negative area is clockwise.
     */
    signedFaceArea() {
        let sum = 0;
        // sum area of trapezoids.
        // * the formula in the loop gives twice the area (because it does nto average the y values).
        // * this is fixed up at the end by a single multiply by 0.5
        // * indidual trapezoid heights are measured from y at the start node to keep area values numericall smaller.
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
}
HalfEdge._totalNodesCreated = 0;
exports.HalfEdge = HalfEdge;
/**
 * A HalfEdgeGraph has:
 * * An array of (pointers to ) HalfEdge objects.
 */
class HalfEdgeGraph {
    constructor() {
        this._numNodesCreated = 0;
        this.allHalfEdges = [];
    }
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
     * * Insert a vertex in the edge begining at base.
     * * this creates two half edges.
     * * The base of the new edge is 'after' the (possibly undefined) start node in its face loop.
     * * The existing mate retains its base xyzi properties but is no longer the mate of base.
     * * The base and existing mate each become mates with a new half edge.
     * @returns Returns the reference to the half edge created.
     */
    splitEdge(base, xA = 0, yA = 0, zA = 0, iA = 0) {
        const he = HalfEdge.splitEdge(base, xA, yA, zA, iA, this.allHalfEdges);
        return he;
    }
    /** This is a destructor-like action that elminates all interconnection among the graph's nodes.
     * After this is called the graph is unusable.
     */
    decommission() {
        for (const node of this.allHalfEdges) {
            node.decomission();
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
     * @returns Return the number of nodes that have a specified mask bit set.
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
                segments.push(LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(node.x, node.y), PointVector_1.Point3d.create(node.faceSuccessor.x, node.faceSuccessor.y)));
        }
        return segments;
    }
    /** Returns the number of vertex loops in a graph structure */
    countVertexLoops() {
        this.clearMask(8192 /* VISITED */);
        let count = 0;
        this.announceVertexLoops((_graph, _seed) => { count++; return true; });
        return count;
    }
    /** @returns Returns the number of face loops */
    countFaceLoops() {
        this.clearMask(8192 /* VISITED */);
        let count = 0;
        this.announceFaceLoops((_graph, _seed) => { count++; return true; });
        return count;
    }
    /**
     * @returns Returns the number of face loops satisfying a filter function with mask argument.
     *
     */
    countFaceLoopsWithMaskFilter(filter, mask) {
        this.clearMask(8192 /* VISITED */);
        let count = 0;
        this.announceFaceLoops((_graph, seed) => {
            if (filter(seed, mask))
                count++;
            return true;
        });
        return count;
    }
    /** @returns Returns an array of nodes, where each node represents a starting point of a face loop.
     */
    collectFaceLoops() {
        const returnArray = [];
        this.announceFaceLoops((_graph, node) => { returnArray.push(node); return true; });
        return returnArray;
    }
    /** @returns Returns an array of nodes, where each node represents a starting point of a vertex loop.
     */
    collectVertexLoops() {
        this.clearMask(8192 /* VISITED */);
        const returnArray = [];
        for (const node of this.allHalfEdges) {
            if (node.getMask(8192 /* VISITED */))
                continue;
            returnArray.push(node);
            node.setMaskAroundVertex(8192 /* VISITED */);
        }
        return returnArray;
    }
    /**
     * * Visit each facet of the graph once.
     * * Call the announceFace function
     * * continue search if announceFace(graph, node) returns true
     * * terminate search if announceface (graph, node) returns false
     * @param  announceFace function to apply at one node of each face.
     */
    announceFaceLoops(announceFace) {
        this.clearMask(8192 /* VISITED */);
        for (const node of this.allHalfEdges) {
            if (node.getMask(8192 /* VISITED */))
                continue;
            node.setMaskAroundFace(8192 /* VISITED */);
            if (!announceFace(this, node))
                break;
        }
    }
    /**
     * * Visit each vertex loop of the graph once.
     * * Call the announceVertex function
     * * continue search if announceFace(graph, node) returns true
     * * terminate search if announceface (graph, node) returns false
     * @param  annonceFace function to apply at one node of each face.
     */
    announceVertexLoops(announceVertex) {
        this.clearMask(8192 /* VISITED */);
        for (const node of this.allHalfEdges) {
            if (node.getMask(8192 /* VISITED */))
                continue;
            node.setMaskAroundVertex(8192 /* VISITED */);
            if (!announceVertex(this, node))
                break;
        }
    }
    /** @returns Return the number of nodes in the graph */
    countNodes() { return this.allHalfEdges.length; }
}
exports.HalfEdgeGraph = HalfEdgeGraph;
//# sourceMappingURL=Graph.js.map