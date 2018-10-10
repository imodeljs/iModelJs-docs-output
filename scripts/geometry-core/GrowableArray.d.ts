import { XYAndZ, Point3d, Vector3d } from "./PointVector";
import { Range3d } from "./Range";
import { Transform } from "./Transform";
import { IndexedXYZCollection } from "./IndexedXYZCollection";
import { Plane3dByOriginAndUnitNormal } from "./AnalyticGeometry";
export declare type OptionalGrowableFloat64Array = GrowableFloat64Array | undefined;
export declare type BlockComparisonFunction = (data: Float64Array, blockSize: number, index0: number, index1: number) => number;
export declare class GrowableFloat64Array {
    private _data;
    private _inUse;
    constructor(initialCapacity?: number);
    static compare(a: any, b: any): number;
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
    push(toPush: number): void;
    /** Push a `numToCopy` consecutive values starting at `copyFromIndex` to the end of the array. */
    pushBlockCopy(copyFromIndex: number, numToCopy: number): void;
    /** Clear the array to 0 length.  The underlying memory remains allocated for reuse. */
    clear(): void;
    capacity(): number;
    ensureCapacity(newCapacity: number): void;
    /**
     * * If newLength is less than current (active) length, just set (active) length.
     * * If newLength is greater, ensureCapacity (newSize) and pad with padValue up to newSize;
     * @param newLength new data count
     * @param padValue value to use for padding if the length increases.
     */
    resize(newLength: number, padValue?: number): void;
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
     * * For each index `i0 <= i < i1` overwrite `data[i+1]` by `f0*data[i]+f1*data[i+1]
     * * This is the essential step of a bezier polynomial subdivision step
     * @param i0 first index to update
     * @param i1 one beyond last index to update.
     * @param f0 left scale
     * @param f1 right scale
     */
    overwriteWithScaledCombinations(i0: number, i1: number, f0: number, f1: number): void;
    /**
     * @returns Return the weighted sum `data[i0+i]*weights[i]`.
     * @param i0 first index of data
     * @param weights array of weights.
     * @note The length of the weight array is the number of summed terms.
     */
    weightedSum(i0: number, weights: Float64Array): number;
    /**
     * @returns Return the weighted sum `(data[i0+i] - data[i])*weights[i]`.
     * @param i0 first index of data
     * @param weights array of weights.
     * @note The length of the weight array is the number of summed terms.
     */
    weightedDifferenceSum(i0: number, weights: Float64Array): number;
}
/**
 * Array of contiguous doubles, indexed by block number and index within block.
 * * This is essentially a rectangular matrix, with each block being a row of the matrix.
 */
export declare class GrowableBlockedArray {
    protected _data: Float64Array;
    protected _inUse: number;
    protected _blockSize: number;
    protected constructor(blockSize: number, initialBlocks?: number);
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
/** Use a Float64Array to pack xyz coordinates. */
export declare class GrowableXYZArray extends IndexedXYZCollection {
    private _data;
    private _inUse;
    private _capacity;
    /** Construct a new GrowablePoint3d array.
     * @param numPoints [in] initial capacity.
     */
    constructor(numPoints?: number);
    /** @returns Return the number of points in use. */
    readonly length: number;
    /** @returns Return the number of float64 in use. */
    readonly float64Length: number;
    /** If necessary, increase the capacity to a new pointCount.  Current coordinates and point count (length) are unchnaged. */
    ensureCapacity(pointCapacity: number): void;
    /** Resize the actual point count, preserving excess capacity. */
    resize(pointCount: number): void;
    /**
     * Make a copy of the (active) points in this array.
     * (The clone does NOT get excess capacity)
     */
    clone(): GrowableXYZArray;
    static create(data: XYAndZ[]): GrowableXYZArray;
    /** push a point to the end of the array */
    push(toPush: XYAndZ): void;
    /** push all points of an array */
    pushAll(points: Point3d[]): void;
    /**
     * Replicate numWrap xyz values from the front of the array as new values at the end.
     * @param numWrap number of xyz values to replicate
     */
    pushWrap(numWrap: number): void;
    pushXYZ(x: number, y: number, z: number): void;
    /** Remove one point from the back. */
    pop(): void;
    /**
     * Test if index is valid for an xyz (point or vector) withibn this array
     * @param index xyz index to test.
     */
    isIndexValid(index: number): boolean;
    /**
     * Clear all xyz data, but leave capacity unchanged.
     */
    clear(): void;
    /**
     * Get a point by index, strongly typed as a Point3d.  This is unchecked.  Use atPoint3dIndex to have validity test.
     * @param pointIndex index to access
     * @param result optional result
     */
    getPoint3dAt(pointIndex: number, result?: Point3d): Point3d;
    /** copy xyz into strongly typed Point3d */
    atPoint3dIndex(pointIndex: number, result?: Point3d): Point3d | undefined;
    /** copy xyz into strongly typed Point3d */
    atVector3dIndex(vectorIndex: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Read coordinates from source array, place them at indexe within this array.
     * @param destIndex point index where coordinats are to be placed in this array
     * @param source source array
     * @param sourceIndex point index in source array
     * @returns true if destIndex and sourceIndex are both valid.
     */
    transferFromGrowableXYZArray(destIndex: number, source: GrowableXYZArray, sourceIndex: number): boolean;
    /**
     * push coordinates from the source array to the end of this array.
     * @param source source array
     * @param sourceIndex xyz index within the source
     * @returns true if sourceIndex is valid.
     */
    pushFromGrowableXYZArray(source: GrowableXYZArray, sourceIndex: number): boolean;
    /**
     * @returns Return the first point, or undefined if the array is empty.
     */
    front(result?: Point3d): Point3d | undefined;
    /**
     * @returns Return the last point, or undefined if the array is empty.
     */
    back(result?: Point3d): Point3d | undefined;
    /**
     * Set the coordinates of a single point.
     * @param pointIndex index of point to set
     * @param value coordinates to set
     */
    setAt(pointIndex: number, value: XYAndZ): boolean;
    /**
     * Set the coordinates of a single point given as coordintes
     * @param pointIndex index of point to set
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     */
    setCoordinates(pointIndex: number, x: number, y: number, z: number): boolean;
    /**
     * @returns Copy all points into a simple array of Point3d
     */
    getPoint3dArray(): Point3d[];
    /** multiply each point by the transform, replace values. */
    transformInPlace(transform: Transform): void;
    /** multiply each point by the transform, replace values. */
    tryTransformInverseInPlace(transform: Transform): boolean;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    sumLengths(): number;
    isCloseToPlane(plane: Plane3dByOriginAndUnitNormal, tolerance?: number): boolean;
    /** Compute a point at fractional coordinate between points i and j */
    interpolate(i: number, fraction: number, j: number, result?: Point3d): Point3d | undefined;
    /** Sum the signed areas of the projection to xy plane */
    areaXY(): number;
    /** Compute a vector from index target i to indexed target j  */
    vectorIndexIndex(i: number, j: number, result?: Vector3d): Vector3d | undefined;
    /** Compute a vector from origin to indexed target j */
    vectorXYAndZIndex(origin: XYAndZ, j: number, result?: Vector3d): Vector3d | undefined;
    /** Compute the cross product of vectors from from indexed origin to indexed targets i and j */
    crossProductIndexIndexIndex(originIndex: number, targetAIndex: number, targetBIndex: number, result?: Vector3d): Vector3d | undefined;
    /**
     * * compute the cross product from indexed origin t indexed targets targetAIndex and targetB index.
     * * accumulate it to the result.
     */
    accumulateCrossProductIndexIndexIndex(originIndex: number, targetAIndex: number, targetBIndex: number, result: Vector3d): void;
    /** Compute the cross product of vectors from from origin to indexed targets i and j */
    crossProductXYAndZIndexIndex(origin: XYAndZ, targetAIndex: number, targetBIndex: number, result?: Vector3d): Vector3d | undefined;
    /** Return the distance between two points in the array. */
    distance(i: number, j: number): number;
    static isAlmostEqual(dataA: GrowableXYZArray | undefined, dataB: GrowableXYZArray | undefined): boolean;
    /** Return an array of block indices sorted per compareLexicalBlock function */
    sortIndicesLexical(): Uint32Array;
    /** compare two blocks in simple lexical order. */
    compareLexicalBlock(ia: number, ib: number): number;
    /** Access a single double at offset within a block.  This has no index checking. */
    component(pointIndex: number, componentIndex: number): number;
}
//# sourceMappingURL=GrowableArray.d.ts.map