import { XYAndZ } from "./XYZProps";
import { Point3d, Vector3d } from "./Point3dVector3d";
import { Range3d } from "./Range";
import { Transform } from "./Transform";
import { IndexedXYZCollection } from "./IndexedXYZCollection";
import { Plane3dByOriginAndUnitNormal } from "./Plane3dByOriginAndUnitNormal";
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
    /** copy xyz into strongly typed Vector3d */
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
    /** Compute a vector from index origin i to indexed target j  */
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
    distance(i: number, j: number): number | undefined;
    /** Return the distance between an array point and the input point. */
    distanceIndexToPoint(i: number, spacePoint: Point3d): number | undefined;
    static isAlmostEqual(dataA: GrowableXYZArray | undefined, dataB: GrowableXYZArray | undefined): boolean;
    /** Return an array of block indices sorted per compareLexicalBlock function */
    sortIndicesLexical(): Uint32Array;
    /** compare two blocks in simple lexical order. */
    compareLexicalBlock(ia: number, ib: number): number;
    /** Access a single double at offset within a block.  This has no index checking. */
    component(pointIndex: number, componentIndex: number): number;
}
//# sourceMappingURL=GrowableXYZArray.d.ts.map