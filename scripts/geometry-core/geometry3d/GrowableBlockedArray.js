"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module ArraysAndInterfaces */
/**
 * Array of contiguous doubles, indexed by block number and index within block.
 * * This is essentially a rectangular matrix, with each block being a row of the matrix.
 */
class GrowableBlockedArray {
    constructor(blockSize, initialBlocks = 8) {
        this._data = new Float64Array(initialBlocks * blockSize);
        this._inUse = 0;
        this._blockSize = blockSize;
    }
    /** computed property: length (in blocks, not doubles) */
    get numBlocks() { return this._inUse; }
    /** property: number of data values per block */
    get numPerBlock() { return this._blockSize; }
    /**
     * Return a single value indexed within a blcok
     * @param blockIndex index of block to read
     * @param indexInBlock  offset within the block
     */
    getWithinBlock(blockIndex, indexWithinBlock) {
        return this._data[blockIndex * this._blockSize + indexWithinBlock];
    }
    /** clear the block count to zero, but maintain the allocated memory */
    clear() { this._inUse = 0; }
    /** Return the capacity in blocks (not doubles) */
    blockCapacity() {
        return this._data.length / this._blockSize;
    }
    /** ensure capacity (in blocks, not doubles) */
    ensureBlockCapacity(blockCapacity) {
        if (blockCapacity > this.blockCapacity()) {
            const newData = new Float64Array(blockCapacity * this._blockSize);
            for (let i = 0; i < this._data.length; i++) {
                newData[i] = this._data[i];
            }
            this._data = newData;
        }
    }
    /** Add a new block of data.
     * * If newData has fewer than numPerBlock entries, the remaining part of the new block is zeros.
     * * If newData has more entries, only the first numPerBlock are taken.
     */
    addBlock(newData) {
        const k0 = this.newBlockIndex();
        let numValue = newData.length;
        if (numValue > this._blockSize)
            numValue = this._blockSize;
        for (let i = 0; i < numValue; i++)
            this._data[k0 + i] = newData[i];
    }
    /**
     * Return the starting index of a block of (zero-initialized) doubles at the end.
     *
     * * this.data is reallocated if needed to include the new block.
     * * The inUse count is incremented to include the new block.
     * * The returned block is an index to the Float64Array (not a block index)
     */
    newBlockIndex() {
        const index = this._blockSize * this._inUse;
        if ((index + 1) > this._data.length)
            this.ensureBlockCapacity(2 * this._inUse);
        this._inUse++;
        for (let i = index; i < index + this._blockSize; i++)
            this._data[i] = 0.0;
        return index;
    }
    /** reduce the block count by one. */
    popBlock() {
        if (this._inUse > 0)
            this._inUse--;
    }
    /** convert a block index to the simple index to the underlying Float64Array. */
    blockIndexToDoubleIndex(blockIndex) { return this._blockSize * blockIndex; }
    /** Access a single double at offset within a block, with index checking and return undefined if indexing is invalid. */
    checkedComponent(blockIndex, componentIndex) {
        if (blockIndex >= this._inUse || blockIndex < 0 || componentIndex < 0 || componentIndex >= this._blockSize)
            return undefined;
        return this._data[this._blockSize * blockIndex + componentIndex];
    }
    /** Access a single double at offset within a block.  This has no index checking. */
    component(blockIndex, componentIndex) {
        return this._data[this._blockSize * blockIndex + componentIndex];
    }
    /** compre two blocks in simple lexical order.
     * @param data data array
     * @param blockSize number of items to compare
     * @param ia raw index (not block index) of first block
     * @param ib raw index (not block index) of second block
     */
    static compareLexicalBlock(data, blockSize, ia, ib) {
        let ax = 0;
        let bx = 0;
        for (let i = 0; i < blockSize; i++) {
            ax = data[ia + i];
            bx = data[ib + i];
            if (ax > bx)
                return 1;
            if (ax < bx)
                return -1;
        }
        return ia - ib; // so original order is maintained among duplicates !!!!
    }
    /** Return an array of block indices sorted per compareLexicalBlock function */
    sortIndicesLexical(compareBlocks = GrowableBlockedArray.compareLexicalBlock) {
        const n = this._inUse;
        // let numCompare = 0;
        const result = new Uint32Array(n);
        const data = this._data;
        const blockSize = this._blockSize;
        for (let i = 0; i < n; i++)
            result[i] = i;
        result.sort((blockIndexA, blockIndexB) => {
            // numCompare++;
            return compareBlocks(data, blockSize, blockIndexA * blockSize, blockIndexB * blockSize);
        });
        // console.log (n, numCompare);
        return result;
    }
    distanceBetweenBlocks(blockIndexA, blockIndexB) {
        let dd = 0.0;
        let iA = this.blockIndexToDoubleIndex(blockIndexA);
        let iB = this.blockIndexToDoubleIndex(blockIndexB);
        let a = 0;
        const data = this._data;
        for (let i = 0; i < this._blockSize; i++) {
            a = data[iA++] - data[iB++];
            dd += a * a;
        }
        return Math.sqrt(dd);
    }
    distanceBetweenSubBlocks(blockIndexA, blockIndexB, iBegin, iEnd) {
        let dd = 0.0;
        const iA = this.blockIndexToDoubleIndex(blockIndexA);
        const iB = this.blockIndexToDoubleIndex(blockIndexB);
        let a = 0;
        const data = this._data;
        for (let i = iBegin; i < iEnd; i++) {
            a = data[iA + i] - data[iB + i];
            dd += a * a;
        }
        return Math.sqrt(dd);
    }
}
exports.GrowableBlockedArray = GrowableBlockedArray;
//# sourceMappingURL=GrowableBlockedArray.js.map