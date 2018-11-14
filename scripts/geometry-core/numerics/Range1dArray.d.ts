/** @module Numerics */
import { Range1d } from "../geometry3d/Range";
import { GrowableFloat64Array } from "../geometry3d/GrowableArray";
/**
 * A Range1d array is a set of intervals, such as occur when a line is clipped to a (nonconvex) polygon
 */
export declare class Range1dArray {
    /** Internal step: Caller supplies rangeA = interval from left operand of set difference {A - B}
     *  ib = lowest possible index of overlapping interval of {B}
     *  Output live parts of rangeA, advancing B over intervals that do not extend beyond {rangeA}
     *  iB is advanced to the first interval whose high is to the right of {rangeA.high}
     */
    private static advanceIntervalDifference;
    /** Intersect intervals in two pre-sorted sets. Output may NOT be the same as either input. */
    static differenceSorted(dataA: Range1d[], dataB: Range1d[]): Range1d[];
    /** Internal step: Caller ensures rangeA is the "lower" interval.
     *  Look rangeB to decide (a) what output interval to create and (b) which read index to advance.
     *  Returns true or false to indicate whether the value associated with rangeA or rangeB should be incremented after this function returns
     */
    private static advanceIntervalIntersection;
    static intersectSorted(dataA: Range1d[], dataB: Range1d[]): Range1d[];
    /** Internal step: Read an interval from the array.
     *  If it overlaps the work interval, advance the work interval, and return true to notify caller to increment readindex.
     */
    private static advanceIntervalUnion;
    static unionSorted(dataA: Range1d[], dataB: Range1d[]): Range1d[];
    static paritySorted(dataA: Range1d[], dataB: Range1d[]): Range1d[];
    /** Uses the Range1d specific compare function for sorting the array of ranges */
    static sort(data: Range1d[]): void;
    /** Cleans up the array, compressing any overlapping ranges. If removeZeroLengthRanges is set to true, will also remove any Ranges in the form (x, x) */
    static simplifySortUnion(data: Range1d[], removeZeroLengthRanges?: boolean): void;
    static simplifySortParity(data: Range1d[], removeZeroLengthRanges?: boolean): void;
    /** test if value is "in" by union rules.
     * * This considers all intervals-- i.e. does not expect or take advantage of sorting.
     */
    static testUnion(data: Range1d[], value: number): boolean;
    /** test if value is "in" by parity rules.
     * * This considers all intervals-- i.e. does not expect or take advantage of sorting.
     */
    static testParity(data: Range1d[], value: number): boolean;
    /** return an array with all the low and high values of all the ranges.
     * * the coordinates are not sorted.
     */
    static getBreaks(data: Range1d[], result?: GrowableFloat64Array): GrowableFloat64Array;
    /** sum the lengths of all ranges */
    static sumLengths(data: Range1d[]): number;
    /**
     * Test if the low,high values are sorted with no overlap.
     * @param data array of ranges.
     * @param strict if true, consider exact high-to-low match as overlap.
     */
    static isSorted(data: Range1d[], strict?: boolean): boolean;
}
//# sourceMappingURL=Range1dArray.d.ts.map