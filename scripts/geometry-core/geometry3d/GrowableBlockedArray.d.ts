import { BlockComparisonFunction } from "./GrowableFloat64Array";
/** @module ArraysAndInterfaces */
/**
 * Array of contiguous doubles, indexed by block number and index within block.
 * * This is essentially a rectangular matrix, with each block being a row of the matrix.
 */
export declare class GrowableBlockedArray {
    protected _data: Float64Array;
    protected _inUse: number;
    protected _blockSize: number;
    constructor(blockSize: number, initialBlocks?: number);
    /** computed property: length (in blocks, not doubles) */
    readonly numBlocks: number;
    /** property: number of data values per block */
    readonly numPerBlock: number;
    /**
     * Return a single value indexed within a blcok
     * @param blockIndex index of block to read
     * @param indexInBlock  offset within the block
     */
    getWithinBlock(blockIndex: number, indexWithinBlock: number): number;
    /** clear the block count to zero, but maintain the allocated memory */
    clear(): void;
    /** Return the capacity in blocks (not doubles) */
    blockCapacity(): number;
    /** ensure capacity (in blocks, not doubles) */
    ensureBlockCapacity(blockCapacity: number): void;
    /** Add a new block of data.
     * * If newData has fewer than numPerBlock entries, the remaining part of the new block is zeros.
     * * If newData has more entries, only the first numPerBlock are taken.
     */
    addBlock(newData: number[]): void;
    /**
     * Return the starting index of a block of (zero-initialized) doubles at the end.
     *
     * * this.data is reallocated if needed to include the new block.
     * * The inUse count is incremented to include the new block.
     * * The returned block is an index to the Float64Array (not a block index)
     */
    protected newBlockIndex(): number;
    /** reduce the block count by one. */
    popBlock(): void;
    /** convert a block index to the simple index to the underlying Float64Array. */
    protected blockIndexToDoubleIndex(blockIndex: number): number;
    /** Access a single double at offset within a block, with index checking and return undefined if indexing is invalid. */
    checkedComponent(blockIndex: number, componentIndex: number): number | undefined;
    /** Access a single double at offset within a block.  This has no index checking. */
    component(blockIndex: number, componentIndex: number): number;
    /** compre two blocks in simple lexical order.
     * @param data data array
     * @param blockSize number of items to compare
     * @param ia raw index (not block index) of first block
     * @param ib raw index (not block index) of second block
     */
    static compareLexicalBlock(data: Float64Array, blockSize: number, ia: number, ib: number): number;
    /** Return an array of block indices sorted per compareLexicalBlock function */
    sortIndicesLexical(compareBlocks?: BlockComparisonFunction): Uint32Array;
    distanceBetweenBlocks(blockIndexA: number, blockIndexB: number): number;
    distanceBetweenSubBlocks(blockIndexA: number, blockIndexB: number, iBegin: number, iEnd: number): number;
}
//# sourceMappingURL=GrowableBlockedArray.d.ts.map