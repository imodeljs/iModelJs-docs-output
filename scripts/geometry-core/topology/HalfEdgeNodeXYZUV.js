"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Geometry_1 = require("../Geometry");
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
/** @module Topology */
/**
 * Reference to a HalfEdge node with extra XYZ and UV data.
 * @internal
 */
class NodeXYZUV {
    constructor(node, x, y, z, u, v) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._u = u;
        this._v = v;
        this._node = node;
    }
    /** Set all content directly from args.
     * @returns `this` reference
     */
    set(node, x, y, z, u, v) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._u = u;
        this._v = v;
        this._node = node;
        return this;
    }
    setFrom(other) {
        this._x = other.x;
        this._y = other.y;
        this._z = other.z;
        this._u = other.u;
        this._v = other.v;
        this._node = other.node;
    }
    /** Create a `NodeXYZUV` with
     * * x,y,z at ray origin
     * * u,v as dotXY and crossXY for the ray direction with x,y distances from the ray origin.
     */
    static createNodeAndRayOrigin(node, ray, result) {
        const x = node.x;
        const y = node.y;
        const z = node.z;
        const dx = x - ray.origin.x;
        const dy = y - ray.origin.y;
        const u = Geometry_1.Geometry.dotProductXYXY(dx, dy, ray.direction.x, ray.direction.y);
        const v = Geometry_1.Geometry.crossProductXYXY(ray.direction.x, ray.direction.y, dx, dy);
        if (result)
            return result.set(node, x, y, z, u, v);
        return new NodeXYZUV(node, x, y, z, u, v);
    }
    /** Access the node. */
    get node() { return this._node; }
    /** Access the x coordinate */
    get x() { return this._x; }
    /** Access the y coordinate */
    get y() { return this._y; }
    /** Access the z coordinate */
    get z() { return this._z; }
    /** Access the u coordinate */
    get u() { return this._u; }
    /** Access the v coordinate */
    get v() { return this._v; }
    /** Access the x,y,z coordinates as Point3d with optional caller-supplied result. */
    getXYZAsPoint3d(result) {
        return Point3dVector3d_1.Point3d.create(this._x, this._y, this._z, result);
    }
    /** Access the uv coordinates as Point2d with optional caller-supplied result. */
    getUVAsPoint2d(result) { return Point2dVector2d_1.Point2d.create(this._u, this._v, result); }
    /** Toleranced comparison function for u coordinate */
    classifyU(target, tol) {
        const delta = this.u - target;
        if (Math.abs(delta) <= tol)
            return 0;
        return delta >= 0 ? 1 : -1;
    }
    /** Toleranced comparison function for v coordinate */
    classifyV(target, tol) {
        const delta = target - this._v;
        if (Math.abs(delta) <= tol)
            return 0;
        return delta >= 0 ? 1 : -1;
    }
}
exports.NodeXYZUV = NodeXYZUV;
//# sourceMappingURL=HalfEdgeNodeXYZUV.js.map