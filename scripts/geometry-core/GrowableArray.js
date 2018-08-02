"use strict";
/** @module ArraysAndInterfaces */
Object.defineProperty(exports, "__esModule", { value: true });
const Geometry_1 = require("./Geometry");
const PointVector_1 = require("./PointVector");
const IndexedXYZCollection_1 = require("./IndexedXYZCollection");
class GrowableFloat64Array {
    constructor(initialCapacity = 8) {
        this.data = new Float64Array(initialCapacity);
        this.inUse = 0;
    }
    static compare(a, b) {
        return a - b;
    }
    get length() {
        return this.inUse;
    }
    /**
     * Set the value at specified index.
     * @param index index of entry to set
     * @param value value to set
     */
    setAt(index, value) {
        this.data[index] = value;
    }
    /**
     * Move the value at index i to index j.
     * @param i source index
     * @param j destination index.
     */
    move(i, j) {
        this.data[j] = this.data[i];
    }
    push(toPush) {
        if (this.inUse + 1 < this.data.length) {
            this.data[this.inUse] = toPush;
            this.inUse++;
        }
        else {
            // Make new array (double size), copy values, then push toPush
            const newData = new Float64Array(this.inUse * 2);
            for (let i = 0; i < this.inUse; i++) {
                newData[i] = this.data[i];
            }
            this.data = newData;
            this.data[this.inUse] = toPush;
            this.inUse++;
        }
    }
    /** Push a `numToCopy` consecutive values starting at `copyFromIndex` to the end of the array. */
    pushBlockCopy(copyFromIndex, numToCopy) {
        const newLength = this.inUse + numToCopy;
        this.ensureCapacity(newLength);
        const limit = copyFromIndex + numToCopy;
        for (let i = copyFromIndex; i < limit; i++)
            this.data[this.inUse++] = this.data[i];
    }
    /** Clear the array to 0 length.  The underlying memory remains allocated for reuse. */
    clear() {
        while (this.inUse > 0)
            this.pop();
    }
    capacity() {
        return this.data.length;
    }
    ensureCapacity(newCapacity) {
        if (newCapacity > this.capacity()) {
            const oldInUse = this.inUse;
            const newData = new Float64Array(newCapacity);
            for (let i = 0; i < oldInUse; i++)
                newData[i] = this.data[i];
            this.data = newData;
        }
    }
    /**
     * * If newLength is less than current (active) length, just set (active) length.
     * * If newLength is greater, ensureCapacity (newSize) and pad with padValue up to newSize;
     * @param newLength new data count
     * @param padValue value to use for padding if the length increases.
     */
    resize(newLength, padValue = 0) {
        // quick out for easy case ...
        if (newLength <= this.inUse) {
            this.inUse = newLength;
            return;
        }
        const oldLength = this.inUse;
        this.ensureCapacity(newLength);
        for (let i = oldLength; i < newLength; i++)
            this.data[i] = padValue;
        this.inUse = newLength;
    }
    pop() {
        // Could technically access outside of array, if filled and then reduced using pop (similar to C
        // and accessing out of bounds), but with adjusted inUse counter, that data will eventually be overwritten
        if (this.inUse > 0) {
            this.inUse--;
        }
    }
    at(index) {
        return this.data[index];
    }
    front() {
        return this.data[0];
    }
    back() {
        return this.data[this.inUse - 1];
    }
    reassign(index, value) {
        this.data[index] = value;
    }
    /**
     * * Sort the array entries.
     * * Uses insertion sort -- fine for small arrays (less than 30), slow for larger arrays
     * @param compareMethod comparison method
     */
    sort(compareMethod = GrowableFloat64Array.compare) {
        for (let i = 0; i < this.inUse; i++) {
            for (let j = i + 1; j < this.inUse; j++) {
                const tempI = this.data[i];
                const tempJ = this.data[j];
                if (compareMethod(tempI, tempJ) > 0) {
                    this.data[i] = tempJ;
                    this.data[j] = tempI;
                }
            }
        }
    }
    /**
     * * compress out values not within the [a,b] interval.
     * * Note that if a is greater than b all values are rejected.
     * @param a low value for accepted interval
     * @param b high value for accepted interval
     */
    restrictToInterval(a, b) {
        const data = this.data;
        const n = data.length;
        let numAccept = 0;
        let q = 0;
        for (let i = 0; i < n; i++) {
            q = data[i];
            if (q >= a && q <= b)
                data[numAccept++] = q;
        }
        this.inUse = numAccept;
    }
    /**
     * * For each index `i0 <= i < i1` overwrite `data[i+1]` by `f0*data[i]+f1*data[i+1]
     * * This is the essential step of a bezier polynomial subdivision step
     * @param i0 first index to update
     * @param i1 one beyond last index to update.
     * @param f0 left scale
     * @param f1 right scale
     */
    overwriteWithScaledCombinations(i0, i1, f0, f1) {
        // work right to left for simplest overwrite
        for (let i = i1; i > i0; i--) {
            this.data[i] = f0 * this.data[i - 1] + f1 * this.data[i];
        }
    }
    /**
     * @returns Return the weighted sum `data[i0+i]*weights[i]`.
     * @param i0 first index of data
     * @param weights array of weights.
     * @note The length of the weight array is the number of summed terms.
     */
    weightedSum(i0, weights) {
        let i = i0;
        let sum = 0.0;
        const data = this.data;
        for (const w of weights)
            sum += w * data[i++];
        return sum;
    }
    /**
     * @returns Return the weighted sum `(data[i0+i] - data[i])*weights[i]`.
     * @param i0 first index of data
     * @param weights array of weights.
     * @note The length of the weight array is the number of summed terms.
     */
    weightedDifferenceSum(i0, weights) {
        let i = i0;
        let sum = 0.0;
        const data = this.data;
        for (const w of weights) {
            sum += w * (data[i + 1] - data[i]);
            i++;
        }
        return sum;
    }
}
exports.GrowableFloat64Array = GrowableFloat64Array;
/**
 * Array of contiguous doubles, indexed by block number and index within block.
 * * This is essentially a rectangular matrix, with each block being a row of the matrix.
 */
class GrowableBlockedArray {
    constructor(blockSize, initialBlocks = 8) {
        this.data = new Float64Array(initialBlocks * blockSize);
        this.inUse = 0;
        this.blockSize = blockSize;
    }
    /** computed property: length (in blocks, not doubles) */
    get numBlocks() { return this.inUse; }
    /** property: number of data values per block */
    get numPerBlock() { return this.blockSize; }
    /**
     * Return a single value indexed within a blcok
     * @param blockIndex index of block to read
     * @param indexInBlock  offset within the block
     */
    getWithinBlock(blockIndex, indexWithinBlock) {
        return this.data[blockIndex * this.blockSize + indexWithinBlock];
    }
    /** clear the block count to zero, but maintain the allocated memory */
    clear() { this.inUse = 0; }
    /** Return the capacity in blocks (not doubles) */
    blockCapacity() {
        return this.data.length / this.blockSize;
    }
    /** ensure capacity (in blocks, not doubles) */
    ensureBlockCapacity(blockCapacity) {
        if (blockCapacity > this.blockCapacity()) {
            const newData = new Float64Array(blockCapacity * this.blockSize);
            for (let i = 0; i < this.data.length; i++) {
                newData[i] = this.data[i];
            }
            this.data = newData;
        }
    }
    /**
     * Return the starting index of a block of (zero-initialized) doubles at the end.
     *
     * * this.data is reallocated if needed to include the new block.
     * * The inUse count is incremented to include the new block.
     * * The returned block is an index to the Float64Array (not a block index)
     */
    newBlockIndex() {
        const index = this.blockSize * this.inUse;
        if (this.blockSize * (index + 1) > this.data.length)
            this.ensureBlockCapacity(2 * this.inUse);
        this.inUse++;
        for (let i = index; i < index + this.blockSize; i++)
            this.data[i] = 0.0;
        return index;
    }
    /** reduce the block count by one. */
    popBlock() {
        if (this.inUse > 0)
            this.inUse--;
    }
    /** convert a block index to the simple index to the underlying Float64Array. */
    blockIndexToDoubleIndex(blockIndex) { return this.blockSize * blockIndex; }
    /** Access a single double at offset within a block, with index checking and return undefined if indexing is invalid. */
    checkedComponent(blockIndex, componentIndex) {
        if (blockIndex >= this.inUse || blockIndex < 0 || componentIndex < 0 || componentIndex >= this.blockSize)
            return undefined;
        return this.data[this.blockSize * blockIndex + componentIndex];
    }
    /** Access a single double at offset within a block.  This has no index checking. */
    component(blockIndex, componentIndex) {
        return this.data[this.blockSize * blockIndex + componentIndex];
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
        const n = this.inUse;
        // let numCompare = 0;
        const result = new Uint32Array(n);
        const data = this.data;
        const blockSize = this.blockSize;
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
        const data = this.data;
        for (let i = 0; i < this.blockSize; i++) {
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
        const data = this.data;
        for (let i = iBegin; i < iEnd; i++) {
            a = data[iA + i] - data[iB + i];
            dd += a * a;
        }
        return Math.sqrt(dd);
    }
}
exports.GrowableBlockedArray = GrowableBlockedArray;
/** Use a Float64Array to pack xyz coordinates. */
class GrowableXYZArray extends IndexedXYZCollection_1.IndexedXYZCollection {
    /** Construct a new GrowablePoint3d array.
     * @param numPoints [in] initial capacity.
     */
    constructor(numPoints = 8) {
        super();
        this.data = new Float64Array(numPoints * 3); // 8 Points to start (3 values each)
        this.inUse = 0;
        this.capacity = numPoints;
    }
    /** @returns Return the number of points in use. */
    get length() { return this.inUse; }
    /** @returns Return the number of float64 in use. */
    get float64Length() { return this.inUse * 3; }
    /** If necessary, increase the capacity to a new pointCount.  Current coordinates and point count (length) are unchnaged. */
    ensureCapacity(pointCapacity) {
        if (pointCapacity > this.capacity) {
            const newData = new Float64Array(pointCapacity * 3);
            const numCopy = this.length * 3;
            for (let i = 0; i < numCopy; i++)
                newData[i] = this.data[i];
            this.data = newData;
            this.capacity = pointCapacity;
        }
    }
    /** Resize the actual point count, preserving excess capacity. */
    resize(pointCount) {
        if (pointCount < this.length) {
            this.inUse = pointCount >= 0 ? pointCount : 0;
        }
        else if (pointCount > this.capacity) {
            const newArray = new Float64Array(pointCount * 3);
            // Copy contents
            for (let i = 0; i < this.data.length; i += 3) {
                newArray[i] = this.data[i];
                newArray[i + 1] = this.data[i + 1];
                newArray[i + 2] = this.data[i + 2];
            }
            this.data = newArray;
            this.capacity = pointCount;
        }
    }
    /**
     * Make a copy of the (active) points in this array.
     * (The clone does NOT get excess capacity)
     */
    clone() {
        const newPoints = new GrowableXYZArray(this.length);
        const numValue = this.length * 3;
        const newData = newPoints.data;
        const data = this.data;
        for (let i = 0; i < numValue; i++)
            newData[i] = data[i];
        newPoints.inUse = this.length;
        return newPoints;
    }
    static create(data) {
        const newPoints = new GrowableXYZArray(data.length);
        for (const p of data)
            newPoints.push(p);
        return newPoints;
    }
    /** push a point to the end of the array */
    push(toPush) {
        this.pushXYZ(toPush.x, toPush.y, toPush.z);
    }
    /** push all points of an array */
    pushAll(points) {
        for (const p of points)
            this.push(p);
    }
    /**
     * Replicate numWrap xyz values from the front of the array as new values at the end.
     * @param numWrap number of xyz values to replicate
     */
    pushWrap(numWrap) {
        if (this.inUse > 0) {
            let k;
            for (let i = 0; i < numWrap; i++) {
                k = 3 * i;
                this.pushXYZ(this.data[k], this.data[k + 1], this.data[k + 2]);
            }
        }
    }
    pushXYZ(x, y, z) {
        const index = this.inUse * 3;
        if (index >= this.data.length)
            this.ensureCapacity(this.length * 2);
        this.data[index] = x;
        this.data[index + 1] = y;
        this.data[index + 2] = z;
        this.inUse++;
    }
    /** Remove one point from the back. */
    pop() {
        if (this.inUse > 0)
            this.inUse--;
    }
    /**
     * Test if index is valid for an xyz (point or vector) withibn this array
     * @param index xyz index to test.
     */
    isIndexValid(index) {
        if (index >= this.inUse || index < 0)
            return false;
        return true;
    }
    /**
     * Clear all xyz data, but leave capacity unchanged.
     */
    clear() {
        this.inUse = 0;
    }
    /**
     * Get a point by index, strongly typed as a Point3d.  This is unchecked.  Use atPoint3dIndex to have validity test.
     * @param pointIndex index to access
     * @param result optional result
     */
    getPoint3dAt(pointIndex, result) {
        const index = 3 * pointIndex;
        return PointVector_1.Point3d.create(this.data[index], this.data[index + 1], this.data[index + 2], result);
    }
    /** copy xyz into strongly typed Point3d */
    atPoint3dIndex(pointIndex, result) {
        const index = 3 * pointIndex;
        if (pointIndex >= 0 && pointIndex < this.inUse) {
            if (!result)
                result = PointVector_1.Point3d.create();
            result.x = this.data[index];
            result.y = this.data[index + 1];
            result.z = this.data[index + 2];
            return result;
        }
        return undefined;
    }
    /** copy xyz into strongly typed Point3d */
    atVector3dIndex(vectorIndex, result) {
        const index = 3 * vectorIndex;
        if (vectorIndex >= 0 && vectorIndex < this.inUse) {
            if (!result)
                result = PointVector_1.Vector3d.create();
            result.x = this.data[index];
            result.y = this.data[index + 1];
            result.z = this.data[index + 2];
            return result;
        }
        return undefined;
    }
    /**
     * Read coordinates from source array, place them at indexe within this array.
     * @param destIndex point index where coordinats are to be placed in this array
     * @param source source array
     * @param sourceIndex point index in source array
     * @returns true if destIndex and sourceIndex are both valid.
     */
    transferFromGrowableXYZArray(destIndex, source, sourceIndex) {
        if (destIndex < this.length && sourceIndex < source.length) {
            const i = destIndex * 3;
            const j = sourceIndex * 3;
            this.data[i] = source.data[j];
            this.data[i + 1] = source.data[j + 1];
            this.data[i + 2] = source.data[j + 2];
            return true;
        }
        return false;
    }
    /**
     * push coordinates from the source array to the end of this array.
     * @param source source array
     * @param sourceIndex xyz index within the source
     * @returns true if sourceIndex is valid.
     */
    pushFromGrowableXYZArray(source, sourceIndex) {
        if (sourceIndex < source.length) {
            const j = sourceIndex * 3;
            this.pushXYZ(source.data[j], source.data[j + 1], source.data[j + 2]);
            return true;
        }
        return false;
    }
    /**
     * @returns Return the first point, or undefined if the array is empty.
     */
    front(result) {
        if (this.inUse === 0)
            return undefined;
        return this.getPoint3dAt(0, result);
    }
    /**
     * @returns Return the last point, or undefined if the array is empty.
     */
    back(result) {
        if (this.inUse - 1 < 0)
            return undefined;
        return this.getPoint3dAt(this.inUse - 1, result);
    }
    /**
     * Set the coordinates of a single point.
     * @param pointIndex index of point to set
     * @param value coordinates to set
     */
    setAt(pointIndex, value) {
        if (pointIndex < 0 || pointIndex >= this.inUse)
            return false;
        let index = pointIndex * 3;
        this.data[index++] = value.x;
        this.data[index++] = value.y;
        this.data[index] = value.z;
        return true;
    }
    /**
     * Set the coordinates of a single point given as coordintes
     * @param pointIndex index of point to set
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     */
    setCoordinates(pointIndex, x, y, z) {
        if (pointIndex < 0 || pointIndex >= this.inUse)
            return false;
        let index = pointIndex * 3;
        this.data[index++] = x;
        this.data[index++] = y;
        this.data[index] = z;
        return true;
    }
    /**
     * @returns Copy all points into a simple array of Point3d
     */
    getPoint3dArray() {
        const result = [];
        const data = this.data;
        const n = this.length;
        for (let i = 0; i < n; i++) {
            result.push(PointVector_1.Point3d.create(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]));
        }
        return result;
    }
    /** multiply each point by the transform, replace values. */
    transformInPlace(transform) {
        const data = this.data;
        const nDouble = this.float64Length;
        const coffs = transform.matrix.coffs;
        const origin = transform.origin;
        const x0 = origin.x;
        const y0 = origin.y;
        const z0 = origin.z;
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i + 3 <= nDouble; i += 3) {
            x = data[i];
            y = data[i + 1];
            z = data[i + 2];
            data[i] = coffs[0] * x + coffs[1] * y + coffs[2] * z + x0;
            data[i + 1] = coffs[3] * x + coffs[4] * y + coffs[5] * z + y0;
            data[i + 2] = coffs[6] * x + coffs[7] * y + coffs[8] * z + z0;
        }
    }
    /** multiply each point by the transform, replace values. */
    tryTransformInverseInPlace(transform) {
        const data = this.data;
        const nDouble = this.float64Length;
        const matrix = transform.matrix;
        matrix.computeCachedInverse(true);
        const coffs = matrix.inverseCoffs;
        if (!coffs)
            return false;
        const origin = transform.origin;
        const x0 = origin.x;
        const y0 = origin.y;
        const z0 = origin.z;
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i + 3 <= nDouble; i += 3) {
            x = data[i] - x0;
            y = data[i + 1] - y0;
            z = data[i + 2] - z0;
            data[i] = coffs[0] * x + coffs[1] * y + coffs[2] * z;
            data[i + 1] = coffs[3] * x + coffs[4] * y + coffs[5] * z;
            data[i + 2] = coffs[6] * x + coffs[7] * y + coffs[8] * z;
        }
        return true;
    }
    extendRange(rangeToExtend, transform) {
        const numDouble = this.float64Length;
        const data = this.data;
        if (transform) {
            for (let i = 0; i + 3 <= numDouble; i += 3)
                rangeToExtend.extendTransformedXYZ(transform, data[i], data[i + 1], data[i + 2]);
        }
        else {
            for (let i = 0; i + 3 <= numDouble; i += 3)
                rangeToExtend.extendXYZ(data[i], data[i + 1], data[i + 2]);
        }
    }
    sumLengths() {
        let sum = 0.0;
        const n = 3 * (this.inUse - 1); // Length already takes into account what specifically is in use
        const data = this.data;
        for (let i = 0; i < n; i += 3)
            sum += Geometry_1.Geometry.hypotenuseXYZ(data[i + 3] - data[i], data[i + 4] - data[i + 1], data[i + 5] - data[i + 2]);
        return sum;
    }
    isCloseToPlane(plane, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        const numCoordinate = 3 * this.inUse;
        const data = this.data;
        for (let i = 0; i < numCoordinate; i += 3)
            if (Math.abs(plane.altitudeXYZ(data[i], data[i + 1], data[i + 2])) > tolerance)
                return false;
        return true;
    }
    /** Compute a point at fractional coordinate between points i and j */
    interpolate(i, fraction, j, result) {
        if (i >= 0 && i < this.inUse) {
            const fraction0 = 1.0 - fraction;
            const data = this.data;
            i = 3 * i;
            j = 3 * j;
            return PointVector_1.Point3d.create(fraction0 * data[i] + fraction * data[j], fraction0 * data[i + 1] + fraction * data[j + 1], fraction0 * data[i + 2] + fraction * data[j + 2], result);
        }
        return undefined;
    }
    /** Sum the signed areas of the projection to xy plane */
    areaXY() {
        let area = 0.0;
        const n = this.data.length - 6; // at least two points needed !!!!
        if (n > 2) {
            const x0 = this.data[0];
            const y0 = this.data[1];
            let dx1 = this.data[3] - x0;
            let dy1 = this.data[4] - y0;
            let dx2 = 0;
            let dy2 = 0;
            for (let i = 6; i < n; i += 3, dx1 = dx2, dy1 = dy2) {
                dx2 = this.data[i] - x0;
                dy2 = this.data[i + 1] - y0;
                area += Geometry_1.Geometry.crossProductXYXY(dx1, dy1, dx2, dy2);
            }
        }
        return 0.5 * area;
    }
    /** Compute a vector from index target i to indexed target j  */
    vectorIndexIndex(i, j, result) {
        const n = this.inUse;
        if (i < 0 || i >= n)
            return undefined;
        if (j < 0 || j >= n)
            return undefined;
        if (!result)
            result = PointVector_1.Vector3d.create();
        const data = this.data;
        i = 3 * i;
        j = 3 * j;
        result.x = data[j] - data[i];
        result.y = data[j + 1] - data[i + 1];
        result.z = data[j + 2] - data[i + 2];
        return result;
    }
    /** Compute a vector from origin to indexed target j */
    vectorXYAndZIndex(origin, j, result) {
        if (j >= 0 && j < this.inUse) {
            const data = this.data;
            j = 3 * j;
            return PointVector_1.Vector3d.create(data[j] - origin.x, data[j + 1] - origin.y, data[j + 2] - origin.z, result);
        }
        return undefined;
    }
    /** Compute the cross product of vectors from from indexed origin to indexed targets i and j */
    crossProductIndexIndexIndex(originIndex, targetAIndex, targetBIndex, result) {
        const i = originIndex * 3;
        const j = targetAIndex * 3;
        const k = targetBIndex * 3;
        const data = this.data;
        if (this.isIndexValid(originIndex) && this.isIndexValid(targetAIndex) && this.isIndexValid(targetBIndex))
            return Geometry_1.Geometry.crossProductXYZXYZ(data[j] - data[i], data[j + 1] - data[i + 1], data[j + 2] - data[i + 2], data[k] - data[i], data[k + 1] - data[i + 1], data[k + 2] - data[i + 2], result);
        return undefined;
    }
    /**
     * * compute the cross product from indexed origin t indexed targets targetAIndex and targetB index.
     * * accumulate it to the result.
     */
    accumulateCrossProductIndexIndexIndex(originIndex, targetAIndex, targetBIndex, result) {
        const i = originIndex * 3;
        const j = targetAIndex * 3;
        const k = targetBIndex * 3;
        const data = this.data;
        if (this.isIndexValid(originIndex) && this.isIndexValid(targetAIndex) && this.isIndexValid(targetBIndex))
            result.addCrossProductToTargetsInPlace(data[i], data[i + 1], data[i + 2], data[j], data[j + 1], data[j + 2], data[k], data[k + 1], data[k + 2]);
        return undefined;
    }
    /** Compute the cross product of vectors from from origin to indexed targets i and j */
    crossProductXYAndZIndexIndex(origin, targetAIndex, targetBIndex, result) {
        const j = targetAIndex * 3;
        const k = targetBIndex * 3;
        const data = this.data;
        if (this.isIndexValid(targetAIndex) && this.isIndexValid(targetBIndex))
            return Geometry_1.Geometry.crossProductXYZXYZ(data[j] - origin.x, data[j + 1] - origin.y, data[j + 2] - origin.z, data[k] - origin.x, data[k + 1] - origin.y, data[k + 2] - origin.z, result);
        return undefined;
    }
    /** Return the distance between two points in the array. */
    distance(i, j) {
        if (i >= 0 && i < this.inUse && j >= 0 && j <= this.inUse) {
            const i0 = 3 * i;
            const j0 = 3 * j;
            return Geometry_1.Geometry.hypotenuseXYZ(this.data[j0] - this.data[i0], this.data[j0 + 1] - this.data[i0 + 1], this.data[j0 + 2] - this.data[i0 + 2]);
        }
        return 0.0;
    }
    static isAlmostEqual(dataA, dataB) {
        if (dataA && dataB) {
            if (dataA.length !== dataB.length)
                return false;
            for (let i = 0; i < dataA.length; i++)
                if (!dataA.getPoint3dAt(i).isAlmostEqual(dataB.getPoint3dAt(i)))
                    return false;
            return true;
        }
        // if both are null it is equal, otherwise unequal
        return (!dataA && !dataB);
    }
    /** Return an array of block indices sorted per compareLexicalBlock function */
    sortIndicesLexical() {
        const n = this.inUse;
        // let numCompare = 0;
        const result = new Uint32Array(n);
        for (let i = 0; i < n; i++)
            result[i] = i;
        result.sort((blockIndexA, blockIndexB) => {
            // numCompare++;
            return this.compareLexicalBlock(blockIndexA, blockIndexB);
        });
        // console.log (n, numCompare);
        return result;
    }
    /** compare two blocks in simple lexical order. */
    compareLexicalBlock(ia, ib) {
        let ax = 0;
        let bx = 0;
        for (let i = 0; i < 3; i++) {
            ax = this.data[ia * 3 + i];
            bx = this.data[ib * 3 + i];
            if (ax > bx)
                return 1;
            if (ax < bx)
                return -1;
        }
        return ia - ib; // so original order is maintained among duplicates !!!!
    }
    /** Access a single double at offset within a block.  This has no index checking. */
    component(pointIndex, componentIndex) {
        return this.data[3 * pointIndex + componentIndex];
    }
}
exports.GrowableXYZArray = GrowableXYZArray;
//# sourceMappingURL=GrowableArray.js.map