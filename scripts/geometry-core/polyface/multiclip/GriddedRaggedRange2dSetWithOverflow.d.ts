import { Range2d, Range3d } from "../../geometry3d/Range";
import { LowAndHighXY } from "../../geometry3d/XYZProps";
import { LinearSearchRange2dArray } from "./LinearSearchRange2dArray";
/**
 * Use GriddedRaggedRange2dSetWithOverflow for searching among many ranges for which
 * * Most ranges are of somewhat consistent size.
 * * A modest number of oversizes.
 * * Maintain the smallish ones in a GriddedRaggedRange2dSet.
 * * Maintain the overflows in a LinearSearchRange2dArray
 * @internal
 */
export declare class GriddedRaggedRange2dSetWithOverflow<T> {
    private _gridSet;
    private _overflowSet;
    private constructor();
    /**
     * Create an (empty) set of ranges.
     * @param range
     * @param numXEdge
     * @param numYEdge
     */
    static create<T>(range: Range2d, numXEdge: number, numYEdge: number): GriddedRaggedRange2dSetWithOverflow<T> | undefined;
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
    /** If possible, insert a range into the set.
     * * Decline to insert (and return false) if
     *   * range is null
     *   * range is not completely contained in the overall range of this set.
     *   * range x or y extent is larger than 2 grid blocks.
     */
    addRange(range: Range2d | Range3d, tag: T): void;
    visitChildren(initialDepth: number, handler: (depth: number, child: LinearSearchRange2dArray<T>) => void): void;
}
//# sourceMappingURL=GriddedRaggedRange2dSetWithOverflow.d.ts.map