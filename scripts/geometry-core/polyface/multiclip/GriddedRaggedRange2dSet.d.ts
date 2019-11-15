import { Range2d, Range3d } from "../../geometry3d/Range";
import { LowAndHighXY } from "../../geometry3d/XYZProps";
import { LinearSearchRange2dArray } from "./LinearSearchRange2dArray";
export declare type OptionalLinearSearchRange2dArray<T> = LinearSearchRange2dArray<T> | undefined;
/**
 * A GriddedRaggedRange2dSet is
 * * A doubly dimensioned array of LinearSearchRange2dArray
 * * Each entry represents a block in a uniform grid within the master range of the GriddedRaggedRange2dSet.
 * * Member ranges are noted in the grid block containing the range's lower left corner.
 * * Member ranges larger than twice the grid size are rejected by the insert method.
 * * Hence a search involving a point in grid block (i,j) must examine ranges in grid blocks left and below, i.e. (i-1,j-1), (i-1,j), (i,j-1)
 * @internal
 */
export declare class GriddedRaggedRange2dSet<T> {
    private _range;
    private _numXEdge;
    private _numYEdge;
    /** Each grid block is a simple linear search set
     *
     */
    private _rangesInBlock;
    private constructor();
    /**
     * Create an (empty) set of ranges.
     * @param range
     * @param numXEdge
     * @param numYEdge
     */
    static create<T>(range: Range2d, numXEdge: number, numYEdge: number): GriddedRaggedRange2dSet<T> | undefined;
    private xIndex;
    private yIndex;
    private getBlock;
    /** If possible, insert a range into the set.
     * * Decline to insert (and return false) if
     *   * range is null
     *   * range is not completely contained in the overall range of this set.
     *   * range x or y extent is larger than 2 grid blocks.
     */
    conditionalInsert(range: Range2d | Range3d, tag: T): boolean;
    /**
     * * Search a single block
     * * Pass each range and tag to handler
     * * and return false if bad cell or if handler returns false.
     * @param testRange search range.
     * @param handler function to receive range and tag hits.
     * @return false if search terminated by handler.  Return true if no handler returned false.
     */
    private searchXYInIndexedBlock;
    /**
     * * Search a single block
     * * Pass each range and tag to handler
     * * and return false if bad cell or if handler returns false.
     * @param testRange search range.
     * @param handler function to receive range and tag hits.
     * @return false if search terminated by handler.  Return true if no handler returned false.
     */
    private searchRange2dInIndexedBlock;
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
    visitChildren(initialDepth: number, handler: (depth: number, child: LinearSearchRange2dArray<T>) => void): void;
}
//# sourceMappingURL=GriddedRaggedRange2dSet.d.ts.map