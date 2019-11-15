"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LinearSearchRange2dArray_1 = require("./LinearSearchRange2dArray");
const GriddedRaggedRange2dSet_1 = require("./GriddedRaggedRange2dSet");
/**
 * Use GriddedRaggedRange2dSetWithOverflow for searching among many ranges for which
 * * Most ranges are of somewhat consistent size.
 * * A modest number of oversizes.
 * * Maintain the smallish ones in a GriddedRaggedRange2dSet.
 * * Maintain the overflows in a LinearSearchRange2dArray
 * @internal
 */
class GriddedRaggedRange2dSetWithOverflow {
    constructor(gridSet, overflowSet) {
        this._gridSet = gridSet;
        this._overflowSet = overflowSet;
    }
    /**
     * Create an (empty) set of ranges.
     * @param range
     * @param numXEdge
     * @param numYEdge
     */
    static create(range, numXEdge, numYEdge) {
        const grids = GriddedRaggedRange2dSet_1.GriddedRaggedRange2dSet.create(range.clone(), numXEdge, numYEdge);
        if (grids)
            return new GriddedRaggedRange2dSetWithOverflow(grids, new LinearSearchRange2dArray_1.LinearSearchRange2dArray());
        return undefined;
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
        return this._gridSet.searchXY(x, y, handler) && this._overflowSet.searchXY(x, y, handler);
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
        return this._gridSet.searchRange2d(testRange, handler) && this._overflowSet.searchRange2d(testRange, handler);
    }
    /** If possible, insert a range into the set.
     * * Decline to insert (and return false) if
     *   * range is null
     *   * range is not completely contained in the overall range of this set.
     *   * range x or y extent is larger than 2 grid blocks.
     */
    addRange(range, tag) {
        if (!range.isNull) {
            if (!this._gridSet.conditionalInsert(range, tag))
                this._overflowSet.addRange(range, tag);
        }
    }
    visitChildren(initialDepth, handler) {
        handler(initialDepth, this._overflowSet);
        this._gridSet.visitChildren(initialDepth + 1, handler);
    }
}
exports.GriddedRaggedRange2dSetWithOverflow = GriddedRaggedRange2dSetWithOverflow;
//# sourceMappingURL=GriddedRaggedRange2dSetWithOverflow.js.map