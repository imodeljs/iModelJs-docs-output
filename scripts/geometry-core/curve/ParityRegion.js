"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurveCollection_1 = require("./CurveCollection");
const Loop_1 = require("./Loop");
/**
 * * A `ParityRegion` is a collection of `Loop` objects.
 * * The loops collectively define a planar region.
 * * A point is "in" the composite region if it is "in" an odd number of the loops.
 */
class ParityRegion extends CurveCollection_1.CurveCollection {
    isSameGeometryClass(other) { return other instanceof ParityRegion; }
    get children() { return this._children; }
    constructor() { super(); this._children = []; }
    static create(...data) {
        const result = new ParityRegion();
        for (const child of data) {
            result.children.push(child);
        }
        return result;
    }
    dgnBoundaryType() { return 4; }
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceParityRegion(this, indexInParent);
    }
    clone() {
        const clone = new ParityRegion();
        let child;
        for (child of this.children) {
            const childClone = child.clone();
            if (childClone instanceof Loop_1.Loop)
                clone.children.push(childClone);
        }
        return clone;
    }
    cloneStroked(options) {
        const clone = new ParityRegion();
        let child;
        for (child of this.children) {
            const childStrokes = child.cloneStroked(options);
            if (childStrokes)
                clone.children.push(childStrokes);
        }
        return clone;
    }
    cloneEmptyPeer() { return new ParityRegion(); }
    tryAddChild(child) {
        if (child instanceof Loop_1.Loop) {
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
        return handler.handleParityRegion(this);
    }
}
exports.ParityRegion = ParityRegion;
//# sourceMappingURL=ParityRegion.js.map