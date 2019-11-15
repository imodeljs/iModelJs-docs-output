"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurveCollection_1 = require("./CurveCollection");
const Loop_1 = require("./Loop");
const ParityRegion_1 = require("./ParityRegion");
/**
 * * A `UnionRegion` is a collection of other planar region types -- `Loop` and `ParityRegion`.
 * * The composite is the union of the contained regions.
 * * A point is "in" the composite if it is "in" one or more of the contained regions.
 * @public
 */
class UnionRegion extends CurveCollection_1.CurveCollection {
    /** Constructor -- initialize with no children */
    constructor() {
        super();
        /** String name for schema properties */
        this.curveCollectionType = "unionRegion";
        this._children = [];
    }
    /** test if `other` is a `UnionRegion` */
    isSameGeometryClass(other) { return other instanceof UnionRegion; }
    /** Return the array of regions */
    get children() { return this._children; }
    /** Create a `UnionRegion` with given region children */
    static create(...data) {
        const result = new UnionRegion();
        for (const child of data) {
            result.tryAddChild(child);
        }
        return result;
    }
    /** Return the boundary type (5) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType() { return 5; }
    /** dispatch to more strongly typed  `processor.announceUnionRegion(this, indexInParent)` */
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceUnionRegion(this, indexInParent);
    }
    /** Return structural clone with stroked primitives. */
    cloneStroked(options) {
        const clone = new UnionRegion();
        let child;
        for (child of this._children) {
            const childStrokes = child.cloneStroked(options);
            if (childStrokes)
                clone.children.push(childStrokes);
        }
        return clone;
    }
    /** Return new empty `UnionRegion` */
    cloneEmptyPeer() { return new UnionRegion(); }
    /** add a child.
     * * Returns false if the `AnyCurve` child is not a region type.
     */
    tryAddChild(child) {
        if (child && child instanceof ParityRegion_1.ParityRegion || child instanceof Loop_1.Loop) {
            this._children.push(child);
            return true;
        }
        return false;
    }
    /** Return a child identified by index. */
    getChild(i) {
        if (i < this._children.length)
            return this._children[i];
        return undefined;
    }
    /** Second step of double dispatch:  call `handler.handleUnionRegion(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleUnionRegion(this);
    }
}
exports.UnionRegion = UnionRegion;
//# sourceMappingURL=UnionRegion.js.map