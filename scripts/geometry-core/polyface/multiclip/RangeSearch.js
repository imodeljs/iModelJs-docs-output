"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const Range_1 = require("../../geometry3d/Range");
const Geometry_1 = require("../../Geometry");
const GriddedRaggedRange2dSetWithOverflow_1 = require("./GriddedRaggedRange2dSetWithOverflow");
const LinearSearchRange2dArray_1 = require("./LinearSearchRange2dArray");
/** Class with static members to work with various range searchers. */
class RangeSearch {
    /** Based on range count and distribution, return an object which can answer 2d range queries */
    static create2dSearcherForRangeLengthData(rangeLengthData, rangesPerBlockEdge = RangeSearch.defaultRangesPerBlockEdge, standardDeviationAdjustment = RangeSearch.defaultStandardDeviationAdjustment) {
        // for smallish sets, just linear search  . . ..
        if (rangeLengthData.xSums.count < RangeSearch.smallCountLimit)
            return new LinearSearchRange2dArray_1.LinearSearchRange2dArray();
        const numXBlock = this.estimateGridBlockCount(rangeLengthData.range.xLength(), rangeLengthData.xSums, rangesPerBlockEdge, standardDeviationAdjustment);
        const numYBlock = this.estimateGridBlockCount(rangeLengthData.range.yLength(), rangeLengthData.ySums, rangesPerBlockEdge, standardDeviationAdjustment);
        if (numXBlock < 2 && numYBlock < 2)
            return new LinearSearchRange2dArray_1.LinearSearchRange2dArray();
        return GriddedRaggedRange2dSetWithOverflow_1.GriddedRaggedRange2dSetWithOverflow.create(Range_1.Range2d.createFrom(rangeLengthData.range), numXBlock, numYBlock);
    }
    /** Return the number of grid bocks (in one direction) for
     * * The total range length in this direction
     * * individual ranges whose count, mean and standard deviation are available in the sums.
     * @param totalRange the total range being searched (in this direction)
     * @param sums source for mean, count, and standard deviation of individual ranges
     * @param rangesPerBlockEdge target ratio of edge length in search blocks divided by representative length of individual range edges
     * @param standardDeviationAdjustment the number of standard deviations above the mean to be applied to convert mean to representative length.  Typically 0 to 1.
     * @returns number of blocks in grid.
     */
    static estimateGridBlockCount(totalLength, sums, rangesPerBlockEdge = RangeSearch.defaultRangesPerBlockEdge, standardDeviationAdjustment = RangeSearch.defaultStandardDeviationAdjustment) {
        if (sums.count < 1)
            return 1;
        const representativeRangeLength = rangesPerBlockEdge * (sums.mean + standardDeviationAdjustment * sums.standardDeviation);
        const gridEdgeLength = Geometry_1.Geometry.conditionalDivideFraction(totalLength, representativeRangeLength);
        if (gridEdgeLength === undefined)
            return 1;
        return Math.ceil(gridEdgeLength);
    }
}
exports.RangeSearch = RangeSearch;
RangeSearch.smallCountLimit = 40;
/** Target size for grid block size divided by representative per-entry range size. */
RangeSearch.defaultRangesPerBlockEdge = 4;
/** the "representative range size"is the mean range size plus this number of standard deviations */
RangeSearch.defaultStandardDeviationAdjustment = 1.0;
//# sourceMappingURL=RangeSearch.js.map