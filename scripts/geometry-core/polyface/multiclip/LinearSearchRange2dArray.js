"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const Range_1 = require("../../geometry3d/Range");
/**
 * * Array of Range2d
 * * user data tag attached to each range via cast as (any).userTag.
 * * Search operations are simple linear.
 * * This class can be used directly for "smallish" range sets, or as the leaf level of hierarchical structures for larger range sets.
 * *
 * @internal
 */
class LinearSearchRange2dArray {
    constructor() {
        this._rangeArray = [];
        this._isDirty = false;
        this._compositeRange = Range_1.Range2d.createNull();
    }
    // TODO: build search structure
    updateForSearch() {
        this._isDirty = false;
    }
    /** Return the overall range of all member ranges. */
    totalRange(result) {
        result = result ? result : Range_1.Range2d.createNull();
        return this._compositeRange.clone(result);
    }
    /** Add a range to the search set. */
    addRange(range, tag) {
        this._isDirty = true;
        const myRange = Range_1.Range2d.createNull();
        myRange.tag = tag;
        myRange.extendXY(range.low.x, range.low.y);
        myRange.extendXY(range.high.x, range.high.y);
        this._compositeRange.extendRange(myRange);
        this._rangeArray.push(myRange);
    }
    /**
     * * Search for ranges containing testRange
     * * Pass each range and tag to handler
     * * terminate search if handler returns false.
     * @param testRange search range.
     * @param handler function to receive range and tag hits.
     * @return false if search terminated by handler.  Return true if no handler returned false.
     */
    searchXY(x, y, handler) {
        if (this._isDirty)
            this.updateForSearch();
        // NEEDS WORK: Linear search here -- do better!
        for (const candidate of this._rangeArray) {
            if (candidate.containsXY(x, y))
                if (!handler(candidate, candidate.tag))
                    return false;
        }
        return true;
    }
    /**
     * * Search for ranges overlapping testRange
     * * Pass each range and tag to handler
     * * terminate search if handler returns false.
     * @param testRange search range.
     * @param handler function to receive range and tag hits.
     * @return false if search terminated by handler.  Return true if no handler returned false.
     */
    searchRange2d(testRange, handler) {
        if (this._isDirty)
            this.updateForSearch();
        for (const candidate of this._rangeArray) {
            if (candidate.intersectsRange(testRange))
                if (!handler(candidate, candidate.tag))
                    return false;
        }
        return true;
    }
}
exports.LinearSearchRange2dArray = LinearSearchRange2dArray;
//# sourceMappingURL=LinearSearchRange2dArray.js.map