"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurveCollection_1 = require("./CurveCollection");
const Loop_1 = require("./Loop");
/**
 * * A `ParityRegion` is a collection of `Loop` objects.
 * * The loops collectively define a planar region.
 * * A point is "in" the composite region if it is "in" an odd number of the loops.
 * @public
 */
class ParityRegion extends CurveCollection_1.CurveCollection {
    /** Construct parity region with empty loop array */
    constructor() {
        super();
        /** String name for schema properties */
        this.curveCollectionType = "parityRegion";
        this._children = [];
    }
    /** Test if `other` is an instance of `ParityRegion` */
    isSameGeometryClass(other) { return other instanceof ParityRegion; }
    /** Return the array of loops in this parity region. */
    get children() { return this._children; }
    /**
     * Add loops (recursively) to this region's children
     */
    addLoops(data) {
        if (data === undefined) {
        }
        else if (data instanceof Loop_1.Loop)
            this.children.push(data);
        else if (Array.isArray(data)) {
            for (const child of data) {
                if (child instanceof Loop_1.Loop)
                    this.children.push(child);
                else if (Array.isArray(child))
                    this.addLoops(child);
            }
        }
    }
    /** Return a single loop or parity region with given loops.
     * * The returned structure CAPTURES the loops.
     * * The loops are NOT reorganized by hole analysis.
     */
    static createLoops(data) {
        if (data instanceof Loop_1.Loop)
            return data;
        const result = new ParityRegion();
        result.addLoops(data);
        return result;
    }
    /** Create a parity region with given loops */
    static create(...data) {
        const result = new ParityRegion();
        for (const child of data) {
            result.children.push(child);
        }
        return result;
    }
    /** Return the boundary type (4) of a corresponding  MicroStation CurveVector */
    dgnBoundaryType() { return 4; }
    /** invoke `processor.announceParityRegion(this, indexInParent)` */
    announceToCurveProcessor(processor, indexInParent = -1) {
        return processor.announceParityRegion(this, indexInParent);
    }
    /** Return a deep copy. */
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
    /** Stroke these curves into a new ParityRegion. */
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
    /** Create a new empty parity region. */
    cloneEmptyPeer() { return new ParityRegion(); }
    /** Add `child` to this parity region.
     * * any child type other than `Loop` is ignored.
     */
    tryAddChild(child) {
        if (child && child instanceof Loop_1.Loop) {
            this._children.push(child);
            return true;
        }
        return false;
    }
    /** Get child `i` by index. */
    getChild(i) {
        if (i < this._children.length)
            return this._children[i];
        return undefined;
    }
    /** Second step of double dispatch:  call `handler.handleRegion(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleParityRegion(this);
    }
}
exports.ParityRegion = ParityRegion;
//# sourceMappingURL=ParityRegion.js.map