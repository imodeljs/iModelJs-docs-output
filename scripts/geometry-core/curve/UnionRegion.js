"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
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
 */
class UnionRegion extends CurveCollection_1.CurveCollection {
    isSameGeometryClass(other) { return other instanceof UnionRegion; }
    get children() { return this._children; }
    constructor() { super(); this._children = []; }
    static create(...data) {
        const result = new UnionRegion();
        for (const child of data) {
            result.tryAddChild(child);
        }
        return result;
    }
    dgnBoundaryType() { return 5; }
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceUnionRegion(this, indexInParent);
    }
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
    cloneEmptyPeer() { return new UnionRegion(); }
    tryAddChild(child) {
        if (child instanceof ParityRegion_1.ParityRegion || child instanceof Loop_1.Loop) {
            this._children.push(child);
            return true;
        }
        return false;
    }
    getChild(i) {
        if (i < this._children.length)
            return this._children[i];
        return undefined;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleUnionRegion(this);
    }
}
exports.UnionRegion = UnionRegion;
//# sourceMappingURL=UnionRegion.js.map