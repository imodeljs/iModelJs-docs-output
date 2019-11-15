"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LinearSearchRange2dArray_1 = require("./LinearSearchRange2dArray");
/**
 * A GriddedRaggedRange2dSet is
 * * A doubly dimensioned array of LinearSearchRange2dArray
 * * Each entry represents a block in a uniform grid within the master range of the GriddedRaggedRange2dSet.
 * * Member ranges are noted in the grid block containing the range's lower left corner.
 * * Member ranges larger than twice the grid size are rejected by the insert method.
 * * Hence a search involving a point in grid block (i,j) must examine ranges in grid blocks left and below, i.e. (i-1,j-1), (i-1,j), (i,j-1)
 * @internal
 */
class GriddedRaggedRange2dSet {
    constructor(range, numXEdge, numYEdge) {
        this._range = range;
        this._numXEdge = numXEdge;
        this._numYEdge = numYEdge;
        this._rangesInBlock = [];
        for (let j = 0; j < this._numYEdge; j++) {
            const thisRow = [];
            for (let i = 0; i < this._numXEdge; i++) {
                thisRow.push(undefined);
            }
            this._rangesInBlock.push(thisRow);
        }
    }
    /**
     * Create an (empty) set of ranges.
     * @param range
     * @param numXEdge
     * @param numYEdge
     */
    static create(range, numXEdge, numYEdge) {
        if (numXEdge < 1 || numYEdge < 1 || range.isNull || range.isSinglePoint)
            return undefined;
        return new GriddedRaggedRange2dSet(range.clone(), numXEdge, numYEdge);
    }
    xIndex(x) {
        const fraction = (x - this._range.low.x) / (this._range.high.x - this._range.low.x);
        return Math.floor(fraction * this._numXEdge);
    }
    yIndex(y) {
        const fraction = (y - this._range.low.y) / (this._range.high.y - this._range.low.y);
        return Math.floor(fraction * this._numXEdge);
    }
    getBlock(i, j) {
        if (i >= 0 && i < this._numXEdge && j >= 0 && j < this._numYEdge) {
            if (!this._rangesInBlock[j][i])
                this._rangesInBlock[j][i] = new LinearSearchRange2dArray_1.LinearSearchRange2dArray();
            return this._rangesInBlock[j][i];
        }
        return undefined;
    }
    /** If possible, insert a range into the set.
     * * Decline to insert (and return false) if
     *   * range is null
     *   * range is not completely contained in the overall range of this set.
     *   * range x or y extent is larger than 2 grid blocks.
     */
    conditionalInsert(range, tag) {
        if (range.isNull)
            return false;
        if (!this._range.containsRange(range))
            return false;
        const xIndex0 = this.xIndex(range.low.x);
        const xIndex1 = this.xIndex(range.high.x);
        const yIndex0 = this.yIndex(range.low.y);
        const yIndex1 = this.yIndex(range.high.y);
        if (!(xIndex0 === xIndex1 || xIndex0 + 1 === xIndex1))
            return false;
        if (!(yIndex0 === yIndex1 || yIndex0 + 1 === yIndex1))
            return false;
        const rangesInBlock = this.getBlock(xIndex0, yIndex0);
        if (rangesInBlock) {
            rangesInBlock.addRange(range, tag);
            return true;
        }
        return false;
    }
    /**
     * * Search a single block
     * * Pass each range and tag to handler
     * * and return false if bad cell or if handler returns false.
     * @param testRange search range.
     * @param handler function to receive range and tag hits.
     * @return false if search terminated by handler.  Return true if no handler returned false.
     */
    searchXYInIndexedBlock(i, j, x, y, handler) {
        const rangesInBlock = this.getBlock(i, j);
        if (!rangesInBlock)
            return true;
        return rangesInBlock.searchXY(x, y, handler);
    }
    /**
     * * Search a single block
     * * Pass each range and tag to handler
     * * and return false if bad cell or if handler returns false.
     * @param testRange search range.
     * @param handler function to receive range and tag hits.
     * @return false if search terminated by handler.  Return true if no handler returned false.
     */
    searchRange2dInIndexedBlock(i, j, testRange, handler) {
        const rangesInBlock = this.getBlock(i, j);
        if (!rangesInBlock)
            return true;
        return rangesInBlock.searchRange2d(testRange, handler);
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
        const i = this.xIndex(x);
        const j = this.yIndex(y);
        return this.searchXYInIndexedBlock(i, j, x, y, handler)
            && this.searchXYInIndexedBlock(i - 1, j, x, y, handler)
            && this.searchXYInIndexedBlock(i, j - 1, x, y, handler)
            && this.searchXYInIndexedBlock(i - 1, j - 1, x, y, handler);
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
        const xIndex0 = this.xIndex(testRange.low.x) - 1;
        const xIndex1 = this.xIndex(testRange.high.x);
        const yIndex0 = this.yIndex(testRange.low.y) - 1;
        const yIndex1 = this.yIndex(testRange.high.y);
        for (let i = xIndex0; i <= xIndex1; i++) {
            for (let j = yIndex0; j <= yIndex1; j++) {
                if (!this.searchRange2dInIndexedBlock(i, j, testRange, handler))
                    return false;
            }
        }
        return true;
    }
    visitChildren(initialDepth, handler) {
        for (const row of this._rangesInBlock) {
            for (const block of row) {
                if (block)
                    handler(initialDepth, block);
            }
        }
    }
}
exports.GriddedRaggedRange2dSet = GriddedRaggedRange2dSet;
//# sourceMappingURL=GriddedRaggedRange2dSet.js.map