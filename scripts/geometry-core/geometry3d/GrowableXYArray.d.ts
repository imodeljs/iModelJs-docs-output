import { XAndY, XYAndZ } from "./XYZProps";
import { Point2d, Vector2d } from "./Point2dVector2d";
import { Range2d } from "./Range";
import { Transform } from "./Transform";
import { Matrix3d } from "./Matrix3d";
import { IndexedXYCollection } from "./IndexedXYCollection";
import { GrowableXYZArray } from "./GrowableXYZArray";
import { Point3d } from "./Point3dVector3d";
import { MultiLineStringDataVariant } from "../topology/Triangulation";
/** `GrowableXYArray` manages a (possibly growing) Float64Array to pack xy coordinates.
 * @public
 */
export declare class GrowableXYArray extends IndexedXYCollection {
    /**
     * array of packed xyz xyz xyz components
     */
    private _data;
    /**
     * Number of xyz triples (not floats) in the array
     */
    private _xyInUse;
    /**
     * capacity in xyz triples. (not floats)
     */
    private _xyzCapacity;
    /** Construct a new GrowablePoint2d array.
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
    clone(): GrowableXYArray;
    /** Create an array populated from
     * * An array of Point2d
     * * An array of Point3d (hidden as XAndY)
     * * An array of objects with keyed values, et `{x:1, y:1}`
     * * A `GrowableXYZArray`
     */
    static create(data: XAndY[] | GrowableXYZArray): GrowableXYArray;
    /** Restructure MultiLineStringDataVariant as array of GrowableXYZArray */
    static createArrayOfGrowableXYZArray(data: MultiLineStringDataVariant): GrowableXYZArray[] | undefined;
    /** push a point to the end of the array */
    push(toPush: XAndY): void;
    /** push all points of an array */
    pushAll(points: XAndY[]): void;
    /** push all points of an array */
    pushAllXYAndZ(points: XYAndZ[] | GrowableXYZArray): void;
    /**
     * Replicate numWrap xyz values from the front of the array as new values at the end.
     * @param numWrap number of xyz values to replicate
     */
    pushWrap(numWrap: number): void;
    /** push a point given by x,y coordinates */
    pushXY(x: number, y: number): void;
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
     * Get a point by index, strongly typed as a Point2d.  This is unchecked.  Use atPoint2dIndex to have validity test.
     * @param pointIndex index to access
     * @param result optional result
     */
    getPoint2dAtUncheckedPointIndex(pointIndex: number, result?: Point2d): Point2d;
    /**
     * Get x coordinate by point index, with no index checking
     * @param pointIndex index to access
     */
    getXAtUncheckedPointIndex(pointIndex: number): number;
    /**
     * Get y coordinate by index, with no index checking
     * @param pointIndex index to access
     */
    getYAtUncheckedPointIndex(pointIndex: number): number;
    /**
     * Gather all points as a Point2d[]
     */
    getPoint2dArray(): Point2d[];
    /** copy xyz into strongly typed Point2d */
    getPoint2dAtCheckedPointIndex(pointIndex: number, result?: Point2d): Point2d | undefined;
    /** copy xyz into strongly typed Vector2d */
    getVector2dAtCheckedVectorIndex(vectorIndex: number, result?: Vector2d): Vector2d | undefined;
    /**
     * Read coordinates from source array, place them at index within this array.
     * @param destIndex point index where coordinates are to be placed in this array
     * @param source source array
     * @param sourceIndex point index in source array
     * @returns true if destIndex and sourceIndex are both valid.
     */
    transferFromGrowableXYArray(destIndex: number, source: GrowableXYArray, sourceIndex: number): boolean;
    /**
     * push coordinates from the source array to the end of this array.
     * @param source source array
     * @param sourceIndex xyz index within the source.  If undefined, push entire contents of source
     * @returns true if sourceIndex is valid.
     */
    pushFromGrowableXYArray(source: GrowableXYArray, sourceIndex?: number): number;
    /**
     * * Compute a point at fractional coordinate between points i and j of source
     * * push onto this array.
     */
    pushInterpolatedFromGrowableXYArray(source: GrowableXYArray, i: number, fraction: number, j: number): void;
    /**
     * push coordinates from the source array to the end of this array.
     * @param source source array
     * @param transform optional transform to apply to points.
     * @param dest optional result.
     */
    static createFromGrowableXYZArray(source: GrowableXYZArray, transform?: Transform, dest?: GrowableXYArray): GrowableXYArray;
    /**
     * Return the first point, or undefined if the array is empty.
     */
    front(result?: Point2d): Point2d | undefined;
    /**
     * Return the last point, or undefined if the array is empty.
     */
    back(result?: Point2d): Point2d | undefined;
    /**
     * Set the coordinates of a single point.
     * @param pointIndex index of point to set
     * @param value coordinates to set
     */
    setAtCheckedPointIndex(pointIndex: number, value: XAndY): boolean;
    /**
     * Set the coordinates of a single point given as coordinates
     * @param pointIndex index of point to set
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     */
    setXYZAtCheckedPointIndex(pointIndex: number, x: number, y: number): boolean;
    /**
     * Copy all points into a simple array of Point3D with given z.
     */
    getPoint3dArray(z?: number): Point3d[];
    /** multiply each point by the transform, replace values. */
    multiplyTransformInPlace(transform: Transform): void;
    /** multiply each xyz (as a vector) by matrix, replace values. */
    multiplyMatrix3dInPlace(matrix: Matrix3d): void;
    /** multiply each point by the transform, replace values. */
    tryTransformInverseInPlace(transform: Transform): boolean;
    /** Extend a `Range2d`, optionally transforming the points. */
    extendRange(rangeToExtend: Range2d, transform?: Transform): void;
    /** sum the lengths of segments between points. */
    sumLengths(): number;
    /**
     * Multiply each x,y,z by the scale factor.
     * @param factor
     */
    scaleInPlace(factor: number): void;
    /** Compute a point at fractional coordinate between points i and j */
    interpolate(i: number, fraction: number, j: number, result?: Point2d): Point2d | undefined;
    /** Sum the signed areas of the projection to xy plane */
    areaXY(): number;
    /** Compute a vector from index origin i to indexed target j  */
    vectorIndexIndex(i: number, j: number, result?: Vector2d): Vector2d | undefined;
    /** Compute a vector from origin to indexed target j */
    vectorXAndYIndex(origin: XAndY, j: number, result?: Vector2d): Vector2d | undefined;
    /** Compute the cross product of vectors from from indexed origin to indexed targets i and j */
    crossProductIndexIndexIndex(originIndex: number, targetAIndex: number, targetBIndex: number): number | undefined;
    /** Compute the cross product of vectors from from origin to indexed targets i and j */
    crossProductXAndYIndexIndex(origin: XAndY, targetAIndex: number, targetBIndex: number): number | undefined;
    /** Return the distance between two points in the array. */
    distance(i: number, j: number): number | undefined;
    /** Return the distance between an array point and the input point. */
    distanceIndexToPoint(i: number, spacePoint: Point2d): number | undefined;
    /** Test for nearly equal arrays. */
    static isAlmostEqual(dataA: GrowableXYArray | undefined, dataB: GrowableXYArray | undefined): boolean;
    /** Return an array of block indices sorted per compareLexicalBlock function */
    sortIndicesLexical(): Uint32Array;
    /** compare two blocks in simple lexical order. */
    compareLexicalBlock(ia: number, ib: number): number;
    /** Access a single double at offset within a block.  This has no index checking. */
    component(pointIndex: number, componentIndex: number): number;
    /** Toleranced equality test */
    isAlmostEqual(other: GrowableXYArray, tolerance?: number): boolean;
}
//# sourceMappingURL=GrowableXYArray.d.ts.map