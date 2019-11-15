import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
import { Range3d } from "../geometry3d/Range";
import { UsageSums } from "../numerics/UsageSums";
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
export declare class RangeLengthData {
    /** Overall range of all data observed by `accumulate` methods. */
    range: Range3d;
    /** */
    xSums: UsageSums;
    ySums: UsageSums;
    zSums: UsageSums;
    constructor();
    private _workRange;
    /** Extend the range and length sums by the range of points in an array. */
    accumulateGrowableXYZArrayRange(points: GrowableXYZArray): void;
}
//# sourceMappingURL=RangeLengthData.d.ts.map