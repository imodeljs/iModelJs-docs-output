"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Object describing a (contiguous) subset of indices to an IndexedXYZCollection
 * @public
 */
class IndexedCollectionInterval {
    constructor(points, base, limit) {
        this.points = points;
        this.begin = base;
        this.end = limit;
    }
    /** Create an interval which matches a complete indexed collection. */
    static createComplete(points) {
        return new this(points, 0, points.length);
    }
    /** Create an interval which matches a collection from `start <= i < end`. */
    static createBeginEnd(points, begin, end) {
        return new this(points, begin, end);
    }
    /** Create an interval which matches a collection from `start <= i < end`. */
    static createBeginLength(points, begin, length) {
        return new this(points, begin, begin + length);
    }
    /** Add one to this.begin.  Return true if the interval is still live. */
    advanceBegin() {
        this.begin++;
        return this.begin < this.end;
    }
    /** advance this.end (but do not go beyond this.points.length)   return true if the interval is still live. */
    advanceEnd() {
        this.end++;
        if (this.end > this.points.length)
            this.end = this.points.length;
        return this.begin < this.end;
    }
    /** Return (if possible) the parent index corresponding to `localIndex` */
    localIndexToParentIndex(localIndex) {
        if (localIndex >= 0) {
            const parentIndex = this.begin + localIndex;
            if (parentIndex < this.points.length)
                return parentIndex;
        }
        return undefined;
    }
    /** Return true if
     * * the interval is empty (the empty set is a subset of all sets!)
     * * all indices in its range are valid.
     */
    get isValidSubset() {
        return this.length === 0
            || (this.localIndexToParentIndex(0) !== undefined
                && this.localIndexToParentIndex(this.length - 1) !== undefined);
    }
    /** restrict this.end to this.points.length */
    restrictEnd() {
        if (this.end > this.points.length)
            this.end = this.points.length;
    }
    /** Return true if length is 1 or more */
    get isNonEmpty() {
        return this.begin < this.end;
    }
    /** Advance this.begin to (other.end-1), i.e. catch the last member of other. */
    advanceToTail(other) {
        this.begin = other.end - 1;
        return this.isNonEmpty;
    }
    /** Advance this.begin to (other.begin), i.e. catch the first member of other. */
    advanceToHead(other) {
        this.begin = other.begin;
        return this.isNonEmpty;
    }
    /** Set this interval from another, with conditional replacements:
     * * Always reference the same points as other.
     * * use optional begin and end arguments if present; if not take begin and and from other.
     * * cap end at points.length.
     */
    setFrom(other, base, limit) {
        this.points = other.points;
        this.begin = base === undefined ? other.begin : base;
        this.end = limit === undefined ? other.end : limit;
        this.restrictEnd();
    }
    /** Return the number of steps possible with current begin and end */
    get length() {
        return this.end > this.begin ? this.end - this.begin : 0;
    }
    /** Return true if the length is exactly 1 */
    get isSingleton() {
        return this.begin + 1 === this.end;
    }
}
exports.IndexedCollectionInterval = IndexedCollectionInterval;
/**
 * Reference to an interval of the indices of an IndexedXYZCollection.
 * @public
 */
class IndexedXYZCollectionInterval extends IndexedCollectionInterval {
}
exports.IndexedXYZCollectionInterval = IndexedXYZCollectionInterval;
//# sourceMappingURL=IndexedCollectionInterval.js.map