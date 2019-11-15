"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Curve */
const CurvePrimitive_1 = require("./CurvePrimitive");
/* tslint:disable:variable-name no-empty*/
/** base class for detailed traversal of curve artifacts.
 * * This recurses to children in the quickest way (no records of path)
 * * Use the RecursiveCurveProcessorWithStack to record the path along the visit.
 * @public
 */
class RecursiveCurveProcessor {
    constructor() {
    }
    /** process error content */
    announceUnexpected(_data, _indexInParent) { }
    /** process a leaf primitive. */
    announceCurvePrimitive(_data, _indexInParent = -1) { }
    /** announce a path (recurse to children) */
    announcePath(data, _indexInParent = -1) {
        let i = 0;
        for (const curve of data.children)
            this.announceCurvePrimitive(curve, i++);
    }
    /** announce a loop (recurse to children) */
    announceLoop(data, _indexInParent = -1) {
        let i = 0;
        for (const curve of data.children)
            this.announceCurvePrimitive(curve, i++);
    }
    /** announce beginning or end of loops in a parity region */
    announceParityRegion(data, _indexInParent = -1) {
        let i = 0;
        for (const loop of data.children)
            this.announceLoop(loop, i++);
    }
    /** announce beginning or end of a parity region */
    announceUnionRegion(data, _indexInParent = -1) {
        let i = 0;
        for (const child of data.children) {
            child.announceToCurveProcessor(this, i++);
        }
    }
    /** announce a bag of curves.
     * * The default implementation visits each child and calls the appropriate dispatch to
     * * `this.announceCurvePrimitive(child)`
     * * `child.announceToCurveProcessor(this)`
     */
    announceBagOfCurves(data, _indexInParent = -1) {
        for (const child of data.children) {
            if (child instanceof CurvePrimitive_1.CurvePrimitive)
                this.announceCurvePrimitive(child);
            else
                child.announceToCurveProcessor(this);
        }
    }
}
exports.RecursiveCurveProcessor = RecursiveCurveProcessor;
/** base class for detailed traversal of curve artifacts
 * * During recursion,  maintains a stack that shows complete path to each artifact.
 * * Use the QuickRecursiveCurveProcessor to visit without recording the path.
 * @public
 */
class RecursiveCurveProcessorWithStack extends RecursiveCurveProcessor {
    constructor() {
        super();
        this._stack = [];
    }
    /** Push `data` onto the stack so its status is available during processing of children.
     * * Called when `data` is coming into scope.
     */
    enter(data) { this._stack.push(data); }
    /** Pop the stack
     * * called when the top of the stack goes out of scope
     */
    leave() { return this._stack.pop(); }
    /** process error content */
    announceUnexpected(_data, _indexInParent) { }
    /** process a leaf primitive. */
    announceCurvePrimitive(_data, _indexInParent = -1) { }
    /** announce a path (recurse to children) */
    announcePath(data, indexInParent = -1) {
        this.enter(data);
        super.announcePath(data, indexInParent);
        this.leave();
    }
    /** announce a loop (recurse to children) */
    announceLoop(data, indexInParent = -1) {
        this.enter(data);
        super.announceLoop(data, indexInParent);
        this.leave();
    }
    /** announce beginning or end of loops in a parity region */
    announceParityRegion(data, _indexInParent = -1) {
        this.enter(data);
        let i = 0;
        for (const loop of data.children)
            this.announceLoop(loop, i++);
        this.leave();
    }
    /** announce beginning or end of a parity region */
    announceUnionRegion(data, indexInParent = -1) {
        this.enter(data);
        super.announceUnionRegion(data, indexInParent);
        this.leave();
    }
    /**
     * Announce members of an unstructured collection.
     * * push the collection reference on the stack
     * * announce children
     * * pop the stack
     * @param data the collection
     * @param _indexInParent index where the collection appears in its parent.
     */
    announceBagOfCurves(data, _indexInParent = -1) {
        this.enter(data);
        let i = 0;
        for (const child of data.children) {
            if (child instanceof CurvePrimitive_1.CurvePrimitive)
                this.announceCurvePrimitive(child, i++);
            else
                child.announceToCurveProcessor(this);
        }
        this.leave();
    }
}
exports.RecursiveCurveProcessorWithStack = RecursiveCurveProcessorWithStack;
//# sourceMappingURL=CurveProcessor.js.map