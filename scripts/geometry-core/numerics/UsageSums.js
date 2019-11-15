"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Range_1 = require("../geometry3d/Range");
const Geometry_1 = require("../Geometry");
/**
 * Accumulator for computing average and standard deviations.
 * * Usual usage pattern:
 *   * create with `sums = new UsageSums ()`
 *   * announce data values with any combination of
 *      * `sums.accumulate (x: number)`
 *      * `sums.accumulateArray (data: numberArray)`
 *   * query properties at any time:
 *      * `sums.mean`
 *      * `sums.count`
 *      * `sums.meanSquare`
 *      * `sums.standardDeviation`
 *      * `sums.minMax`
 * * Optional `origin`
 *   * if `origin` is nonzero:
 *      * when a value `x` is announced to the `accumulate(x)` method, the value used for sums is `(x-origin)`
 *   * All queries (mean, minMax, meanSquare, standardDeviation) return values relative to the origin.
 *   * The origin can be reset in two different ways:
 *     * `setOrigin(a)` sets the saved origin value to `a`, but leaves sums unchanged.
 *       * This affects subsequence how sums are changed by `announce(x)`
 *     * `shiftOriginAndSums` sets the origin (like `sums.setOrigin (a))` and also corrects all sums and minMax so they appear that the new origin had been in effect during all prior `accumulate(x)` calls.
 * @internal
 */
class UsageSums {
    /** Constructor:
     * * All sums 0
     * * min and max set to extreme values.
     * * origin assigned.
     */
    constructor(origin = 0) {
        this._minMax = Range_1.Range1d.createNull();
        this._count = this._sumX = this._sumXX = 0;
        this._origin = origin;
    }
    /** Return the number of samples seen */
    get count() { return this._count; }
    /** return the mean of all samples.
     * * Return 0 if no samples
     */
    get mean() { return this._count > 0 ? this._sumX / this._count : 0.0; }
    /** Return the mean of  squared samples.
     * * Return 0 if no samples.
     */
    get meanSquare() { return this._count > 0 ? this._sumXX / this._count : 0.0; }
    get minMax() { return this._minMax.clone(); }
    /**
     * Return the "biased standard deviation" (https://en.wikipedia.org/wiki/Standard_deviation)
     * * This is zero if count is zero.
     */
    get standardDeviation() {
        if (this._count < 1)
            return 0.0;
        const xBar = this.mean;
        const sumXX = this._sumXX;
        const sumX = this._sumX;
        return Math.sqrt((sumXX - 2 * xBar * sumX + this._count * xBar * xBar) / this._count);
    }
    /** Reinitialize all sums.
     * * origin is unchanged
     */
    clearSums() {
        this._count = this._sumX = this._sumXX = 0;
        this._minMax.setNull();
    }
    /**
     * return the origin being used in the `accumulate(x)` method.
     */
    get origin() { return this._origin; }
    /**
     * Reset the origin.
     * * Former sums are unchanged !!
     * @param origin new origin
     */
    setOrigin(origin) {
        this._origin = origin;
    }
    /**
     * * reset the origin
     * * adjust all sums to what they would be if the new origin had been in effect.
     */
    shiftOriginAndSums(origin) {
        const delta = origin - this._origin;
        this._origin = origin;
        // adjust sumXX first to get old sumX value before it is modified.
        this._sumXX = this._sumXX - 2 * delta * this._sumX + this._count * delta * delta;
        this._sumX = this._sumX - this._count * delta;
        this._minMax.cloneTranslated(-delta, this._minMax);
    }
    /** Accumulate a single value */
    accumulate(x) {
        x = x - this._origin;
        this._count += 1;
        this._sumX += x;
        this._sumXX += x * x;
        this._minMax.extendX(x);
    }
    /** Accumulate a single value */
    accumulateArray(xArray) {
        for (const x of xArray)
            this.accumulate(x);
    }
    /** Clone all content (origin, count, sums, minMax) */
    clone(result) {
        if (!result)
            result = new UsageSums();
        this._minMax.clone(result._minMax);
        result._count = this._count;
        result._origin = this._origin;
        result._sumX = this._sumX;
        result._sumXX = this._sumXX;
        return result;
    }
    /** Compare all content. */
    isAlmostEqual(other) {
        return Geometry_1.Geometry.isAlmostEqualNumber(this._sumX, other._sumX)
            && Geometry_1.Geometry.isAlmostEqualNumber(this._sumXX, other._sumXX)
            && Geometry_1.Geometry.isAlmostEqualNumber(this._origin, other._origin)
            && this._count === other._count
            && this._minMax.isAlmostEqual(other._minMax);
    }
}
exports.UsageSums = UsageSums;
//# sourceMappingURL=UsageSums.js.map