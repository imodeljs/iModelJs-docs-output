import { Range2d } from "../../geometry3d/Range";
import { LowAndHighXY } from "../../geometry3d/XYZProps";
import { Range2dSearchInterface } from "./Range2dSearchInterface";
/**
 * * Array of Range2d
 * * user data tag attached to each range via cast as (any).userTag.
 * * Search operations are simple linear.
 * * This class can be used directly for "smallish" range sets, or as the leaf level of hierarchical structures for larger range sets.
 * *
 * @internal
 */
export declare class LinearSearchRange2dArray<T> implements Range2dSearchInterface<T> {
    private _rangeArray;
    private _isDirty;
    private _compositeRange;
    constructor();
    private updateForSearch;
    /** Return the overall range of all member ranges. */
    totalRange(result?: Range2d): Range2d;
    /** Add a range to the search set. */
    addRange(range: LowAndHighXY, tag: T): void;
    /**
     * * Search for ranges containing testRange
     * * Pass each range and tag to handler
     * * terminate search if handler returns false.
     * @param testRange search range.
     * @param handler function to receive range and tag hits.
     * @return false if search terminated by handler.  Return true if no handler returned false.
     */
    searchXY(x: number, y: number, handler: (range: Range2d, tag: T) => boolean): boolean;
    /**
     * * Search for ranges overlapping testRange
     * * Pass each range and tag to handler
     * * terminate search if handler returns false.
     * @param testRange search range.
     * @param handler function to receive range and tag hits.
     * @return false if search terminated by handler.  Return true if no handler returned false.
     */
    searchRange2d(testRange: LowAndHighXY, handler: (range: Range2d, tag: T) => boolean): boolean;
}
//# sourceMappingURL=LinearSearchRange2dArray.d.ts.map