"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Curve */
const CurvePrimitive_1 = require("./CurvePrimitive");
/* tslint:disable:variable-name no-empty*/
/** base class for detailed traversal of curve artifacts.  This recurses to children in the quickest way (no records of path)
 * Use the RecursiveCurveProcessorWithStack to record the path along the visit.
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
    /** annouce beginning or end of loops in a parity region */
    announceParityRegion(data, _indexInParent = -1) {
        let i = 0;
        for (const loop of data.children)
            this.announceLoop(loop, i++);
    }
    /** annouce beginning or end of a parity region */
    announceUnionRegion(data, _indexInParent = -1) {
        let i = 0;
        for (const child of data.children) {
            child.announceToCurveProcessor(this, i++);
        }
    }
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
/** base class for detailed traversal of curve artifacts, maintaining a stack that shows complete path to each artifact.
 * Use the QuickRecursiveCurveProcessor to visit without recording the path.
 */
class RecursiveCurveProcessorWithStack extends RecursiveCurveProcessor {
    constructor() {
        super();
        this._stack = [];
    }
    enter(data) { this._stack.push(data); }
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
    /** annouce beginning or end of loops in a parity region */
    announceParityRegion(data, _indexInParent = -1) {
        this.enter(data);
        let i = 0;
        for (const loop of data.children)
            this.announceLoop(loop, i++);
        this.leave();
    }
    /** annouce beginning or end of a parity region */
    announceUnionRegion(data, indexInParent = -1) {
        this.enter(data);
        super.announceUnionRegion(data, indexInParent);
        this.leave();
    }
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