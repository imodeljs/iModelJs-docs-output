"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const Range_1 = require("../geometry3d/Range");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
/**
 * A Range1d array is a set of intervals, such as occur when a line is clipped to a (nonconvex) polygon
 */
class Range1dArray {
    /** Internal step: Caller supplies rangeA = interval from left operand of set difference {A - B}
     *  ib = lowest possible index of overlapping interval of {B}
     *  Output live parts of rangeA, advancing B over intervals that do not extend beyond {rangeA}
     *  iB is advanced to the first interval whose high is to the right of {rangeA.high}
     */
    static advanceIntervalDifference(rangeA, dataB, iB, retVal) {
        const nB = dataB.length;
        let low = rangeA.low;
        let high = rangeA.high;
        while (iB < nB) {
            const rangeB = dataB[iB];
            if (rangeB.high < low) {
                iB++;
            }
            else if (rangeB.high <= high) {
                if (rangeB.low > low)
                    retVal.push(Range_1.Range1d.createXX(low, rangeB.low));
                low = rangeB.high;
                iB++;
            }
            else {
                // B ends beyond rangeA...
                if (rangeB.low < high)
                    high = rangeB.low;
                break;
            }
        }
        if (low < high)
            retVal.push(Range_1.Range1d.createXX(low, high));
        return retVal;
    }
    /** Intersect intervals in two pre-sorted sets. Output may NOT be the same as either input. */
    static differenceSorted(dataA, dataB) {
        const nA = dataA.length;
        const iB = 0;
        const retVal = [];
        for (let iA = 0; iA < nA; iA++) {
            Range1dArray.advanceIntervalDifference(dataA[iA], dataB, iB, retVal);
        }
        return retVal;
    }
    /** Internal step: Caller ensures rangeA is the "lower" interval.
     *  Look rangeB to decide (a) what output interval to create and (b) which read index to advance.
     *  Returns true or false to indicate whether the value associated with rangeA or rangeB should be incremented after this function returns
     */
    static advanceIntervalIntersection(rangeA, rangeB, retVal) {
        if (rangeB.low > rangeA.high) {
            return true;
        }
        else if (rangeB.high >= rangeA.high) {
            retVal.push(Range_1.Range1d.createXX(rangeB.low, rangeA.high));
            return true;
        }
        else {
            retVal.push(Range_1.Range1d.createXX(rangeB.low, rangeB.high));
            return false;
        }
    }
    static intersectSorted(dataA, dataB) {
        let iA = 0;
        let iB = 0;
        const nA = dataA.length;
        const nB = dataB.length;
        const retVal = [];
        while (iA < nA && iB < nB) {
            const rangeA = dataA[iA];
            const rangeB = dataB[iB];
            if (rangeA.low <= rangeB.low) {
                if (Range1dArray.advanceIntervalIntersection(rangeA, rangeB, retVal))
                    iA++;
                else
                    iB++;
            }
            else {
                if (Range1dArray.advanceIntervalIntersection(rangeB, rangeA, retVal))
                    iB++;
                else
                    iA++;
            }
        }
        return retVal;
    }
    /** Internal step: Read an interval from the array.
     *  If it overlaps the work interval, advance the work interval, and return true to notify caller to increment readindex.
     */
    static advanceIntervalUnion(workRange, source, readIndex) {
        if (readIndex >= source.length)
            return false;
        const candidate = source[readIndex];
        if (candidate.low > workRange.high)
            return false;
        if (candidate.high > workRange.high)
            workRange.high = candidate.high;
        return true;
    }
    static unionSorted(dataA, dataB) {
        const nA = dataA.length;
        const nB = dataB.length;
        let iA = 0;
        let iB = 0;
        const retVal = [];
        while (iA < nA && iB < nB) {
            const rangeA = dataA[iA];
            const rangeB = dataB[iB];
            let workRange;
            // Pull from the lower of rangeA and rangeB. This always advances exactly one of the indices -- progress towards getting out.
            if (rangeA.low <= rangeB.low) {
                workRange = rangeA.clone();
                iA++;
            }
            else {
                workRange = rangeB.clone();
                iB++;
            }
            let toLoop = true;
            do {
                const resultA = Range1dArray.advanceIntervalUnion(workRange, dataA, iA);
                const resultB = Range1dArray.advanceIntervalUnion(workRange, dataB, iB);
                if (resultA)
                    iA++;
                if (resultB)
                    iB++;
                if (!(resultA || resultB))
                    toLoop = false;
            } while (toLoop);
            retVal.push(workRange);
        }
        while (iA < nA)
            retVal.push(dataA[iA++]);
        while (iB < nB)
            retVal.push(dataB[iB++]);
        return retVal;
    }
    static paritySorted(dataA, dataB) {
        // Combine the two arrays, and then perform a simplification using simplifySortParity function
        const retVal = [];
        for (const range of dataA)
            retVal.push(range.clone());
        for (const range of dataB)
            retVal.push(range.clone());
        // Sort the array
        retVal.sort(compareRange1dLexicalLowHigh);
        Range1dArray.simplifySortParity(retVal, true);
        return retVal;
    }
    /** Uses the Range1d specific compare function for sorting the array of ranges */
    static sort(data) {
        data.sort(compareRange1dLexicalLowHigh);
    }
    /** Cleans up the array, compressing any overlapping ranges. If removeZeroLengthRanges is set to true, will also remove any Ranges in the form (x, x) */
    static simplifySortUnion(data, removeZeroLengthRanges = false) {
        if (data.length < 2)
            return;
        data.sort(compareRange1dLexicalLowHigh);
        let currIdx = 0;
        let toInsert = false;
        for (let i = 0; i < data.length; i++) {
            if (i === data.length - 1) {
                if (toInsert) {
                    if (!removeZeroLengthRanges || data[i].low !== data[i].high)
                        data[currIdx++] = data[i];
                }
                break;
            }
            if (data[i + 1].low > data[i].high) {
                if (!removeZeroLengthRanges || data[i].low !== data[i].high)
                    data[currIdx++] = data[i];
                continue;
            }
            else {
                data[i + 1].low = data[i].low;
                data[i + 1].high = Math.max(data[i].high, data[i + 1].high);
                toInsert = true;
            }
        }
        data.length = currIdx;
    }
    static simplifySortParity(data, removeZeroLengthRanges = false) {
        const numData = [];
        for (const range of data) {
            if (range.low !== range.high) {
                numData.push(range.low);
                numData.push(range.high);
            }
        }
        const n = numData.length;
        numData.sort((a, b) => {
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        });
        let currIdx = 0;
        let x0;
        let x1;
        for (let i = 0; i < n; i += 2) {
            x0 = numData[i];
            x1 = numData[i + 1];
            if (!removeZeroLengthRanges) {
                Range_1.Range1d.createXX(x0, x1, data[currIdx++]);
            }
            else {
                // coalesce intervals that share end and start:
                while (i + 2 < n && numData[i + 2] === x1) {
                    i += 2;
                    x1 = numData[i + 1];
                }
                if (x1 > x0)
                    Range_1.Range1d.createXX(x0, x1, data[currIdx++]);
            }
        }
        data.length = currIdx;
    }
    /** test if value is "in" by union rules.
     * * This considers all intervals-- i.e. does not expect or take advantage of sorting.
     */
    static testUnion(data, value) {
        return this.countContainingRanges(data, value) > 0;
    }
    /** test if value is "in" by parity rules.
     * * This considers all intervals-- i.e. does not expect or take advantage of sorting.
     */
    static testParity(data, value) {
        let inside = false;
        for (const range of data) {
            if (range.containsX(value))
                inside = !inside;
        }
        return inside;
    }
    /** linear search to count number of intervals which contain `value`.
     */
    static countContainingRanges(data, value) {
        let n = 0;
        for (const range of data) {
            if (range.containsX(value))
                n++;
        }
        return n;
    }
    /** return an array with all the low and high values of all the ranges.
     * @param data array of ranges.
     * @param sort optionally request immediate sort.
     * @param compress optionally request removal of duplicates.
     */
    static getBreaks(data, result, sort = false, compress = false) {
        if (!result)
            result = new GrowableFloat64Array_1.GrowableFloat64Array(2 * data.length);
        result.clear();
        for (const range of data) {
            result.push(range.low);
            result.push(range.high);
        }
        if (sort)
            result.sort();
        if (compress)
            result.compressAdjcentDuplicates();
        return result;
    }
    /** sum the lengths of all ranges */
    static sumLengths(data) {
        let sum = 0.0;
        for (const range of data) {
            sum += range.length();
        }
        return sum;
    }
    /**
     * Test if the low,high values are sorted with no overlap.
     * @param data array of ranges.
     * @param strict if true, consider exact high-to-low match as overlap.
     */
    static isSorted(data, strict = true) {
        const n = data.length;
        if (strict) {
            for (let i = 0; i + 1 < n; i++) {
                if (data[i].high >= data[i + 1].low)
                    return false;
            }
        }
        else {
            for (let i = 0; i + 1 < n; i++) {
                if (data[i].high > data[i + 1].low)
                    return false;
            }
        }
        return true;
    }
}
exports.Range1dArray = Range1dArray;
/** Checks low's first, then high's */
function compareRange1dLexicalLowHigh(a, b) {
    if (a.low < b.low)
        return -1;
    if (a.low > b.low)
        return 1;
    if (a.high < b.high)
        return -1;
    if (a.high > b.high)
        return 1;
    return 0;
}
exports.compareRange1dLexicalLowHigh = compareRange1dLexicalLowHigh;
//# sourceMappingURL=Range1dArray.js.map