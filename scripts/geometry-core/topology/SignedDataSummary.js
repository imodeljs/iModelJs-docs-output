"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Topology */
/**
 * Class to accumulate statistics about a stream of signed numbers with tag items.
 * * All sums, counts, extrema, and item values are initialized to zero in the constructor.
 * * Each call to `announceItem (item, value)` updates the various sums, counts, and extrema.
 */
class SignedDataSummary {
    /** setup with zero sums and optional arrays */
    constructor(createArrays) {
        this.positiveSum = this.negativeSum = 0.0;
        this.numPositive = this.numNegative = this.numZero = 0.0;
        this.largestPositiveValue = this.largestNegativeValue = 0.0;
        if (createArrays) {
            this.negativeItemArray = [];
            this.positiveItemArray = [];
            this.zeroItemArray = [];
        }
    }
    /** update with an item and its data value. */
    announceItem(item, data) {
        if (data < 0) {
            this.numNegative++;
            this.negativeSum += data;
            if (this.negativeItemArray)
                this.negativeItemArray.push(item);
            if (data < this.largestNegativeValue) {
                this.largestNegativeValue = data;
                this.largestNegativeItem = item;
            }
        }
        else if (data > 0) {
            this.numPositive++;
            this.positiveSum += data;
            if (this.positiveItemArray)
                this.positiveItemArray.push(item);
            if (data > this.largestPositiveValue) {
                this.largestPositiveValue = data;
                this.largestPositiveItem = item;
            }
        }
        else {
            this.numZero++;
            if (this.zeroItemArray)
                this.zeroItemArray.push(item);
        }
    }
}
exports.SignedDataSummary = SignedDataSummary;
//# sourceMappingURL=SignedDataSummary.js.map