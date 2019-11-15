/** @module ArraysAndInterfaces */
import { PlaneAltitudeEvaluator } from "../Geometry";
import { XYAndZ } from "./XYZProps";
import { Point3d, Vector3d } from "./Point3dVector3d";
import { Range3d, Range1d } from "./Range";
import { Transform } from "./Transform";
import { Matrix3d } from "./Matrix3d";
import { IndexedReadWriteXYZCollection } from "./IndexedXYZCollection";
import { Plane3dByOriginAndUnitNormal } from "./Plane3dByOriginAndUnitNormal";
import { Point2d } from "./Point2dVector2d";
/** `GrowableXYArray` manages a (possibly growing) Float64Array to pack xy coordinates.
 * @public
 */
export declare class GrowableXYZArray extends IndexedReadWriteXYZCollection {
    /**
     * array of packed xyz xyz xyz components
     */
    private _data;
    /**
     * Number of xyz triples (not floats) in the array
     */
    private _xyzInUse;
    /**
     * capacity in xyz triples. (not floats)
     */
    private _xyzCapacity;
    /** Construct a new GrowablePoint3d array.
     * @param numPoints [in] initial capacity.
     */
    constructor(numPoints?: number);
    /** Return the number of points in use. */
    /** Set number of points.
    * Pad zeros if length grows.
    */
    length: number;
    /** Return the number of float64 in use. */
    readonly float64Length: number;
    /** Return the raw packed data.
     * * Note that the length of the returned Float64Array is a count of doubles, and includes the excess capacity
     */
    float64Data(): Float64Array;
    /** If necessary, increase the capacity to a new pointCount.  Current coordinates and point count (length) are unchanged. */
    ensureCapacity(pointCapacity: number): void;
    /** Resize the actual point count, preserving excess capacity. */
    resize(pointCount: number): void;
    /**
     * Make a copy of the (active) points in this array.
     * (The clone does NOT get excess capacity)
     */
    clone(result?: GrowableXYZArray): GrowableXYZArray;
    /** Create an array from various point data formats.
     * Valid inputs are:
     * * Point2d
     * * point3d
     * * An array of 2 doubles
     * * An array of 3 doubles
     * * A GrowableXYZArray
     * * Any json object satisfying Point3d.isXYAndZ
     * * Any json object satisfying Point3d.isXAndY
     * * A Float64Array of doubles, interpreted as xyzxyz
     * * An array of any of the above
     * @param data source points.
     * @param result optional pre-allocated GrowableXYZArray to clear and fill.
     */
    static create(data: any, result?: GrowableXYZArray): GrowableXYZArray;
    /** push a point to the end of the array */
    push(toPush: XYAndZ): void;
    /** push all points of an array */
    pushAll(points: Point3d[]): void;
    /** Push points from variant sources.
     * Valid inputs are:
     * * Point2d
     * * point3d
     * * An array of 2 doubles
     * * An array of 3 doubles
     * * A GrowableXYZArray
     * * Any json object satisfying Point3d.isXYAndZ
     * * Any json object satisfying Point3d.isXAndY
     * * A Float64Array of doubles, interpreted as xyzxyz
     * * An array of any of the above
     * @returns the number of points added.
     */
    pushFrom(p: any): void;
    /**
     * Replicate numWrap xyz values from the front of the array as new values at the end.
     * @param numWrap number of xyz values to replicate
     */
    pushWrap(numWrap: number): void;
    /** append a new point with given x,y,z */
    pushXYZ(x: number, y: number, z: number): void;
    /** move the coordinates at fromIndex to toIndex.
     * * No action if either index is invalid.
     */
    moveIndexToIndex(fromIndex: number, toIndex: number): void;
    /** Remove one point from the back.
     * * NOTE that (in the manner of std::vector native) this is "just" removing the point -- no point is NOT returned.
     * * Use `back ()` to get the last x,y,z assembled into a `Point3d `
     */
    pop(): void;
    /**
     * Test if index is valid for an xyz (point or vector) within this array
     * @param index xyz index to test.
     */
    isIndexValid(index: number): boolean;
    /**
     * Clear all xyz data, but leave capacity unchanged.
     */
    clear(): void;
    /**
     * Get a point by index, strongly typed as a Point3d.  This is unchecked.  Use getPoint3dAtCheckedPointIndex to have validity test.
     * @param pointIndex index to access
     * @param result optional result
     */
    getPoint3dAtUncheckedPointIndex(pointIndex: number, result?: Point3d): Point3d;
    /**
     * Get a point by index, strongly typed as a Point2d.  This is unchecked.  Use getPoint2dAtCheckedPointIndex to have validity test.
     * @param pointIndex index to access
     * @param result optional result
     */
    getPoint2dAtUncheckedPointIndex(pointIndex: number, result?: Point2d): Point2d;
    /** copy xyz into strongly typed Point3d */
    getPoint3dAtCheckedPointIndex(pointIndex: number, result?: Point3d): Point3d | undefined;
    /** access x of indexed point */
    getXAtUncheckedPointIndex(pointIndex: number): number;
    /** access y of indexed point */
    getYAtUncheckedPointIndex(pointIndex: number): number;
    /** access y of indexed point */
    getZAtUncheckedPointIndex(pointIndex: number): number;
    /** copy xy into strongly typed Point2d */
    getPoint2dAtCheckedPointIndex(pointIndex: number, result?: Point2d): Point2d | undefined;
    /** copy xyz into strongly typed Vector3d */
    getVector3dAtCheckedVectorIndex(vectorIndex: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Read coordinates from source array, place them at index within this array.
     * @param destIndex point index where coordinates are to be placed in this array
     * @param source source array
     * @param sourceIndex point index in source array
     * @returns true if destIndex and sourceIndex are both valid.
     */
    transferFromGrowableXYZArray(destIndex: number, source: GrowableXYZArray, sourceIndex: number): boolean;
    /**
     * push coordinates from the source array to the end of this array.
     * @param source source array
     * @param sourceIndex xyz index within the source.  If undefined, entire source is pushed.
     * @returns number of points pushed.
     */
    pushFromGrowableXYZArray(source: GrowableXYZArray, sourceIndex?: number): number;
    /**
     * Return the first point, or undefined if the array is empty.
     */
    front(result?: Point3d): Point3d | undefined;
    /**
     * Return the last point, or undefined if the array is empty.
     */
    back(result?: Point3d): Point3d | undefined;
    /**
     * Set the coordinates of a single point.
     * @param pointIndex index of point to set
     * @param value coordinates to set
     */
    setAtCheckedPointIndex(pointIndex: number, value: XYAndZ): boolean;
    /**
     * Set the coordinates of a single point given as coordinates
     * @param pointIndex index of point to set
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     */
    setXYZAtCheckedPointIndex(pointIndex: number, x: number, y: number, z: number): boolean;
    /**
     * Copy all points into a simple array of Point3d
     */
    getPoint3dArray(): Point3d[];
    /** multiply each point by the transform, replace values. */
    multiplyTransformInPlace(transform: Transform): void;
    /** reverse the order of points. */
    reverseInPlace(): void;
    /** multiply each xyz (as a vector) by matrix, replace values. */
    multiplyMatrix3dInPlace(matrix: Matrix3d): void;
    /** multiply each xyz (as a vector) by matrix inverse transpose, renormalize the vector, replace values.
     * * This is the way to apply a matrix (possibly with skew and scale) to a surface normal, and
     *      have it end up perpendicular to the transformed in-surface vectors.
     * * Return false if matrix is not invertible or if any normalization fails.
     */
    multiplyAndRenormalizeMatrix3dInverseTransposeInPlace(matrix: Matrix3d): boolean;
    /** multiply each point by the transform, replace values. */
    tryTransformInverseInPlace(transform: Transform): boolean;
    /** Extend `range` to extend by all points. */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** get range of points. */
    getRange(transform?: Transform): Range3d;
    /** Initialize `range` with coordinates in this array. */
    setRange(range: Range3d, transform?: Transform): void;
    /** Sum the lengths of segments between points. */
    sumLengths(): number;
    /**
     * Multiply each x,y,z by the scale factor.
     * @param factor
     */
    scaleInPlace(factor: number): void;
    /** test if all points are within tolerance of a plane. */
    isCloseToPlane(plane: Plane3dByOriginAndUnitNormal, tolerance?: number): boolean;
    /** Compute a point at fractional coordinate between points i and j */
    interpolate(i: number, fraction: number, j: number, result?: Point3d): Point3d | undefined;
    /**
     * * Compute a point at fractional coordinate between points i and j of source
     * * push onto this array.
     */
    pushInterpolatedFromGrowableXYZArray(source: GrowableXYZArray, i: number, fraction: number, j: number): void;
    /** Sum the signed areas of the projection to xy plane */
    areaXY(): number;
    /** Compute a vector from index origin i to indexed target j  */
    vectorIndexIndex(i: number, j: number, result?: Vector3d): Vector3d | undefined;
    /** Compute a vector from origin to indexed target j */
    vectorXYAndZIndex(origin: XYAndZ, j: number, result?: Vector3d): Vector3d | undefined;
    /** Compute the cross product of vectors from from indexed origin to indexed targets i and j */
    crossProductIndexIndexIndex(originIndex: number, targetAIndex: number, targetBIndex: number, result?: Vector3d): Vector3d | undefined;
    /** Compute the dot product of pointIndex with [x,y,z] */
    evaluateUncheckedIndexDotProductXYZ(pointIndex: number, x: number, y: number, z: number): number;
    /** Compute the dot product of pointIndex with [x,y,z] */
    evaluateUncheckedIndexPlaneAltitude(pointIndex: number, plane: PlaneAltitudeEvaluator): number;
    /**
     * * compute the cross product from indexed origin t indexed targets targetAIndex and targetB index.
     * * accumulate it to the result.
     */
    accumulateCrossProductIndexIndexIndex(originIndex: number, targetAIndex: number, targetBIndex: number, result: Vector3d): void;
    /**
     * * compute the cross product from indexed origin t indexed targets targetAIndex and targetB index.
     * * accumulate it to the result.
     */
    accumulateScaledXYZ(index: number, scale: number, sum: Point3d): void;
    /** Compute the cross product of vectors from from origin to indexed targets i and j */
    crossProductXYAndZIndexIndex(origin: XYAndZ, targetAIndex: number, targetBIndex: number, result?: Vector3d): Vector3d | undefined;
    /** Return the distance between two points in the array.
     * @deprecated use distanceIndexIndex
     */
    distance(i: number, j: number): number | undefined;
    /** Return the distance between an array point and the input point. */
    distanceIndexToPoint(i: number, spacePoint: XYAndZ): number | undefined;
    /**
     * Return distance squared between indicated points.
     * * Concrete classes may be able to implement this without creating a temporary.
     * @param index0 first point index
     * @param index1 second point index
     * @param defaultDistanceSquared distance squared to return if either point index is invalid.
     *
     */
    distanceSquaredIndexIndex(i: number, j: number): number | undefined;
    /**
     * Return distance between indicated points.
     * * Concrete classes may be able to implement this without creating a temporary.
     * @param index0 first point index
     * @param index1 second point index
     * @param defaultDistanceSquared distance squared to return if either point index is invalid.
     */
    distanceIndexIndex(i: number, j: number): number | undefined;
    /** Return the distance between points in distinct arrays. */
    static distanceBetweenPointsIn2Arrays(arrayA: GrowableXYZArray, i: number, arrayB: GrowableXYZArray, j: number): number | undefined;
    /** test for near equality between two `GrowableXYZArray`. */
    static isAlmostEqual(dataA: GrowableXYZArray | undefined, dataB: GrowableXYZArray | undefined): boolean;
    /** Return an array of block indices sorted per compareLexicalBlock function */
    sortIndicesLexical(): Uint32Array;
    /** compare two blocks in simple lexical order. */
    compareLexicalBlock(ia: number, ib: number): number;
    /** Access a single double at offset within a block.  This has no index checking. */
    component(pointIndex: number, componentIndex: number): number;
    /**
     * add points at regular steps from `other`
     * @param source
     * @param pointIndex0
     * @param step
     * @param numAdd
     */
    addSteppedPoints(other: GrowableXYZArray, pointIndex0: number, step: number, numAdd: number): void;
    /**
     * find the min and max distance between corresponding indexed points.   Excess points are ignored.
     * @param arrayA first array
     * @param arrayB second array
     */
    static distanceRangeBetweenCorrespondingPoints(arrayA: GrowableXYZArray, arrayB: GrowableXYZArray): Range1d;
    /**
     * * Triangle for (unchecked!) for three points identified by index
     * * z direction of frame is 001.
     * * Transform axes from origin to targetX and targetY
     * * in local coordinates (u,v,w) the xy interior of the triangle is `u>=0, v>= 0, w>= 0, u+v+w<1`
     * * Return undefined if transform is invertible (i.e. points are not in a vertical plane.)
     */
    fillLocalXYTriangleFrame(originIndex: number, targetAIndex: number, targetBIndex: number, result?: Transform): Transform | undefined;
    /**
     * Pass the (x,y,z) of each point to a function which returns a replacement for of of the 3 components.
     * @param componentIndex Index (0,1,2) of component to be replaced.
     * @param func function to be called as `func(x,y,z)`, returning a replacement value for componentIndex
     */
    mapComponent(componentIndex: 0 | 1 | 2, func: (x: number, y: number, z: number) => number): void;
}
//# sourceMappingURL=GrowableXYZArray.d.ts.map