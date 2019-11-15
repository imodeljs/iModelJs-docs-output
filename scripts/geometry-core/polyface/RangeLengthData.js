"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Range_1 = require("../geometry3d/Range");
const UsageSums_1 = require("../numerics/UsageSums");
/**
 * Accumulated data for x,y,z length statistics in ranges.
 * * Usage pattern:
 *   * create a enw RangeLengthData:
 *      * `myData = new RangeLengthData ();`
 *   * announce ranges to be accumulated:
 *     * (many times)  `myData.accumulateRowableXYZArrayRange (points);
 *   * access data in public members:
 *     * `myData.range` -- the composite range.
 *     * `myData.xLength`, `myData.yLength`, `myData.zLength` -- mean, minMax, count, and standardDeviation of range lengths in x,y,z directions.
 * @public
 */
class RangeLengthData {
    constructor() {
        this.range = Range_1.Range3d.createNull();
        this.xSums = new UsageSums_1.UsageSums();
        this.ySums = new UsageSums_1.UsageSums();
        this.zSums = new UsageSums_1.UsageSums();
        this._workRange = Range_1.Range3d.createNull();
    }
    /** Extend the range and length sums by the range of points in an array. */
    accumulateGrowableXYZArrayRange(points) {
        points.setRange(this._workRange);
        this.range.extendRange(this._workRange);
        this.xSums.accumulate(this._workRange.xLength());
        this.ySums.accumulate(this._workRange.yLength());
        this.zSums.accumulate(this._workRange.zLength());
    }
}
exports.RangeLengthData = RangeLengthData;
//# sourceMappingURL=RangeLengthData.js.map