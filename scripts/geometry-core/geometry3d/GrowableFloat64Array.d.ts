/** @module ArraysAndInterfaces */
export declare type OptionalGrowableFloat64Array = GrowableFloat64Array | undefined;
export declare type BlockComparisonFunction = (data: Float64Array, blockSize: number, index0: number, index1: number) => number;
/**
 * A `GrowableFloat64Array` is Float64Array accompanied by a count of how many of the array's entries are considered in use.
 * * In C++ terms, this is like an std::vector
 * * As entries are added to the array, the buffer is reallocated as needed to accomodate.
 * * The reallocations leave unused space to accept further additional entries without reallocation.
 * * The `length` property returns the number of entries in use.
 * * the `capacity` property returns the (usually larger) length of the (overallocated) Float64Array.
 *
 */
export declare class GrowableFloat64Array {
    private _data;
    private _inUse;
    constructor(initialCapacity?: number);
    /**
     * Create a GrowableFloat64Array with given contents.
     * @param contents data to copy into the array
     */
    static create(contents: Float64Array | number[]): GrowableFloat64Array;
    static compare(a: any, b: any): number;
    /** Return a new array with
     * * All active entries copied from this instance
     * * optionally trimmed capacity to the active length or replicate the capacity and unused space.
     */
    clone(maintainExcessCapacity?: boolean): GrowableFloat64Array;
    /**
     * @returns the number of entries in use.
     */
    readonly length: number;
    /**
     * Set the value at specified index.
     * @param index index of entry to set
     * @param value value to set
     */
    setAt(index: number, value: number): void;
    /**
     * Move the value at index i to index j.
     * @param i source index
     * @param j destination index.
     */
    move(i: number, j: number): void;
    /**
     * swap the values at indices i and j
     * @param i first index
     * @param j second index
     */
    swap(i: number, j: number): void;
    /**
     * append a single value to the array.
     * @param toPush value to append to the active array.
     */
    push(toPush: number): void;
    /** Push a `numToCopy` consecutive values starting at `copyFromIndex` to the end of the array. */
    pushBlockCopy(copyFromIndex: number, numToCopy: number): void;
    /** Clear the array to 0 length.  The underlying memory remains allocated for reuse. */
    clear(): void;
    /**
     * @returns the number of entries in the supporting Float64Array buffer.   This number is always at least as large as the `length` property.
     */
    capacity(): number;
    /**
     * * If the capacity (Float64Array length) is less than or equal to the requested newCapacity, do nothing
     * * If the requested newCapacity is larger than the existing capacity, reallocate (and copy existing values) with the larger capacity.
     * @param newCapacity
     */
    ensureCapacity(newCapacity: number): void;
    /**
     * * If newLength is less than current (active) length, just set (active) length.
     * * If newLength is greater, ensureCapacity (newSize) and pad with padValue up to newSize;
     * @param newLength new data count
     * @param padValue value to use for padding if the length increases.
     */
    resize(newLength: number, padValue?: number): void;
    /**
     * * Reduce the length by one.
     * * Note that there is no method return value -- use `back` to get that value before `pop()`
     * * (As with std::vector, seprating the `pop` from the value access elmiinates error testing from `pop` call)
     */
    pop(): void;
    at(index: number): number;
    front(): number;
    back(): number;
    reassign(index: number, value: number): void;
    /**
     * * Sort the array entries.
     * * Uses insertion sort -- fine for small arrays (less than 30), slow for larger arrays
     * @param compareMethod comparison method
     */
    sort(compareMethod?: (a: any, b: any) => number): void;
    /**
     * * compress out values not within the [a,b] interval.
     * * Note that if a is greater than b all values are rejected.
     * @param a low value for accepted interval
     * @param b high value for accepted interval
     */
    restrictToInterval(a: number, b: number): void;
    /**
     * * compress out multiple copies of values.
     * * this is done in the current order of the array.
     */
    compressAdjcentDuplicates(tolerance?: number): void;
}
//# sourceMappingURL=GrowableFloat64Array.d.ts.map