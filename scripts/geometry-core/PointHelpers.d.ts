import { Point2d, Point3d, Vector3d, XYZ, XYAndZ, XAndY } from "./PointVector";
import { Transform } from "./Transform";
import { Point4d, Matrix4d } from "./numerics/Geometry4d";
import { Ray3d, Plane3dByOriginAndUnitNormal } from "./AnalyticGeometry";
import { IndexedXYZCollection } from "./IndexedXYZCollection";
export declare class NumberArray {
    /** return the sum of values in an array,   The summation is done with correction terms which
     * improves last-bit numeric accuracy.
     */
    static PreciseSum(data: number[]): number;
    /** Return true if arrays have identical counts and equal entries (using `!==` comparison) */
    static isExactEqual(dataA: any[] | Float64Array | undefined, dataB: any[] | Float64Array | undefined): boolean;
    /** Return true if arrays have identical counts and entries equal within tolerance */
    static isAlmostEqual(dataA: number[] | Float64Array | undefined, dataB: number[] | Float64Array | undefined, tolerance: number): boolean;
    /** return the sum of numbers in an array.  Note that "PreciseSum" may be more accurate. */
    static sum(data: number[] | Float64Array): number;
    static isCoordinateInArray(x: number, data: number[] | undefined): boolean;
    static MaxAbsArray(values: number[]): number;
    static MaxAbsTwo(a1: number, a2: number): number;
    static maxAbsDiff(dataA: number[], dataB: number[]): number;
    static maxAbsDiffFloat64(dataA: Float64Array, dataB: Float64Array): number;
}
export declare class Point2dArray {
    static isAlmostEqual(dataA: undefined | Point2d[], dataB: undefined | Point2d[]): boolean;
    /**
     * @returns return an array containing clones of the Point3d data[]
     * @param data source data
     */
    static clonePoint2dArray(data: Point2d[]): Point2d[];
    static lengthWithoutWraparound(data: XAndY[]): number;
}
export declare class Vector3dArray {
    static isAlmostEqual(dataA: undefined | Vector3d[], dataB: undefined | Vector3d[]): boolean;
    /**
     * @returns return an array containing clones of the Vector3d data[]
     * @param data source data
     */
    static cloneVector3dArray(data: XYAndZ[]): Vector3d[];
}
export declare class Point4dArray {
    /** pack each point and its corresponding weight into a buffer of xyzwxyzw... */
    static packPointsAndWeightsToFloat64Array(points: Point3d[], weights: number[], result?: Float64Array): Float64Array;
    static packToFloat64Array(data: Point4d[], result?: Float64Array): Float64Array;
    /** unpack from xyzwxyzw... to array of Point4d */
    static unpackToPoint4dArray(data: Float64Array): Point4d[];
    /** unpack from xyzwxyzw... array to array of Point3d and array of weight.
     */
    static unpackFloat64ArrayToPointsAndWeights(data: Float64Array, points: Point3d[], weights: number[], pointFormatter?: (x: number, y: number, z: number) => any): void;
    private static _workPoint4d;
    /**
     * Multiply (and replace) each block of 4 values as a Point4d.
     * @param transform transform to apply
     * @param xyzw array of x,y,z,w points.
     */
    static multiplyInPlace(transform: Transform, xyzw: Float64Array): void;
    static isAlmostEqual(dataA: Point4d[] | Float64Array | undefined, dataB: Point4d[] | Float64Array | undefined): boolean;
    /** return true iff all xyzw points' altitudes are within tolerance of the plane.*/
    static isCloseToPlane(data: Point4d[] | Float64Array, plane: Plane3dByOriginAndUnitNormal, tolerance?: number): boolean;
}
export declare class Point3dArray {
    static packToFloat64Array(data: Point3d[]): Float64Array;
    static unpackNumbersToPoint3dArray(data: Float64Array | number[]): Point3d[];
    /**
     * return an 2-dimensional array containing all the values of `data` in arrays of numPerBlock
     * @param data simple array of numbers
     * @param numPerBlock number of values in each block at first level down
     */
    static unpackNumbersToNestedArrays(data: Float64Array, numPerBlock: number): any[];
    /**
     * return an 3-dimensional array containing all the values of `data` in arrays numPerRow blocks of numPerBlock
     * @param data simple array of numbers
     * @param numPerBlock number of values in each block at first level down
     */
    static unpackNumbersToNestedArraysIJK(data: Float64Array, numPerBlock: number, numPerRow: number): any[];
    static multiplyInPlace(transform: Transform, xyz: Float64Array): void;
    static isAlmostEqual(dataA: Point3d[] | Float64Array | undefined, dataB: Point3d[] | Float64Array | undefined): boolean;
    /** return simple average of all coordinates.   (000 if empty array) */
    static centroid(points: IndexedXYZCollection, result?: Point3d): Point3d;
    /** Return the index of the point most distant from spacePoint */
    static vectorToMostDistantPoint(points: Point3d[], spacePoint: XYZ, farVector: Vector3d): number;
    /** return the index of the point whose vector from space point has the largest magnitude of cross product with given vector. */
    static vectorToPointWithMaxCrossProductMangitude(points: Point3d[], spacePoint: Point3d, vector: Vector3d, farVector: Vector3d): number;
    /** Return the index of the closest point in the array (full xyz) */
    static closestPointIndex(data: XYAndZ[], spacePoint: XYAndZ): number;
    /** return true iff all points' altitudes are within tolerance of the plane.*/
    static isCloseToPlane(data: Point3d[] | Float64Array, plane: Plane3dByOriginAndUnitNormal, tolerance?: number): boolean;
    static sumLengths(data: Point3d[] | Float64Array): number;
    /**
     * @returns return an array containing clones of the Point3d data[]
     * @param data source data
     */
    static clonePoint3dArray(data: XYAndZ[]): Point3d[];
    /**
     * @returns return an array containing Point2d with xy parts of each Point3d
     * @param data source data
     */
    static clonePoint2dArray(data: XYAndZ[]): Point2d[];
}
/** Static class for operations that treat an array of points as a polygon (with area!) */
export declare class PolygonOps {
    /** Sum areas of triangles from points[0] to each far edge.
    * * Consider triangles from points[0] to each edge.
    * * Sum the areas(absolute, without regard to orientation) all these triangles.
    * @returns sum of absolute triangle areas.
    */
    static sumTriangleAreas(points: Point3d[]): number;
    /** Sum areas of triangles from points[0] to each far edge.
    * * Consider triangles from points[0] to each edge.
    * * Sum the areas(absolute, without regard to orientation) all these triangles.
    * @returns sum of absolute triangle areas.
    */
    static sumTriangleAreasXY(points: Point3d[]): number;
    /** These values are the integrated area moment products [xx,xy,xz, x]
     * for a right triangle in the first quadrant at the origin -- (0,0),(1,0),(0,1)
     */
    private static readonly _triangleMomentWeights;
    private static _vector0;
    private static _vector1;
    private static _vectorOrigin;
    private static _normal;
    private static _matrixA;
    private static _matrixB;
    private static _matrixC;
    /** return a vector which is perpendicular to the polygon and has magnitude equal to the polygon area. */
    static areaNormalGo(points: IndexedXYZCollection, result?: Vector3d): Vector3d | undefined;
    static areaNormal(points: Point3d[], result?: Vector3d): Vector3d;
    /** return the area of the polygon (assuming planar) */
    static area(points: Point3d[]): number;
    /** return the projected XY area of the polygon (assuming planar) */
    static areaXY(points: Point3d[]): number;
    static centroidAreaNormal(points: Point3d[]): Ray3d | undefined;
    static centroidAndArea(points: Point2d[], centroid: Point2d): number | undefined;
    /**
     *
     * @param points array of points around the polygon.  This is assumed to NOT have closure edge.
     * @param result caller-allocated result vector.
     */
    static unitNormal(points: IndexedXYZCollection, result: Vector3d): boolean;
    /** Return the matrix of area products of a polygon with respect to an origin.
     * The polygon is assumed to be planar and non-self-intersecting.
     */
    static addSecondMomentAreaProducts(points: IndexedXYZCollection, origin: Point3d, moments: Matrix4d): void;
    /** Test the direction of turn at the vertices of the polygon, ignoring z-coordinates.
     *
     * *  For a polygon without self intersections, this is a convexity and orientation test: all positive is convex and counterclockwise,
     * all negative is convex and clockwise
     * *  Beware that a polygon which turns through more than a full turn can cross itself and close, but is not convex
     * *  Returns 1 if all turns are to the left, -1 if all to the right, and 0 if there are any zero turns
     */
    static testXYPolygonTurningDirections(pPointArray: Point2d[] | Point3d[]): number;
    /**
     * Classify a point with respect to a polygon.
     * Returns 1 if point is "in" by parity, 0 if "on", -1 if "out", -2 if nothing worked.
     */
    static parity(pPoint: Point2d, pPointArray: Point2d[] | Point3d[], tol?: number): number;
    /**
     * Classify a point with respect to a polygon defined by the xy parts of the points, using only the y
     * coordinate for the tests.
     *
     * *  Return undefined (failure, could not determine answer) if any polygon point has the same y-coord as test point
     * *  Goal is to execute the simplest cases as fast as possible, and fail promptly for others
     */
    static parityYTest(pPoint: Point2d, pPointArray: Point2d[] | Point3d[], tol: number): number | undefined;
    /**
     * Classify a point with respect to a polygon defined by the xy parts of the points, using only the x
     * coordinate for the tests.
     *
     * *  Return undefined (failure, could not determine answer) if any polygon point has the same x coordinate as the test point
     * *  Goal is to execute the simplest cases as fast as possible, and fail promptly for others
     */
    static parityXTest(pPoint: Point2d, pPointArray: Point2d[] | Point3d[], tol: number): number | undefined;
    /**
     * Classify a point with respect to a polygon defined by the xy parts of the points, using a given ray cast
     * direction.
     *
     * *  Return false (failure, could not determine answer) if any polygon point is on the ray
     */
    static parityVectorTest(pPoint: Point2d, theta: number, pPointArray: Point2d[] | Point3d[], tol: number): number | undefined;
}
/**
 * Helper object to access members of a Point3d[] in geometric calculations.
 * * The collection holds only a reference to the actual array.
 * * The actual array may be replaced by the user as needed.
 * * When replaced, there is no cached data to be updated.
*/
export declare class Point3dArrayCarrier extends IndexedXYZCollection {
    data: Point3d[];
    /** CAPTURE caller supplied array ... */
    constructor(data: Point3d[]);
    isValidIndex(index: number): boolean;
    /**
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    atPoint3dIndex(index: number, result?: Point3d): Point3d | undefined;
    /**
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    atVector3dIndex(index: number, result?: Vector3d): Vector3d | undefined;
    /**
     * @param indexA index of point within the array
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    vectorIndexIndex(indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * @param origin origin for vector
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if index is out of bounds
     */
    vectorXYAndZIndex(origin: XYAndZ, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * @param origin origin for vector
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    crossProductXYAndZIndexIndex(origin: XYAndZ, indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
   * @param originIndex index of origin
   * @param indexA index of first target within the array
   * @param indexB index of second target within the array
   * @param result caller-allocated vector.
   * @returns return true if indexA, indexB both valid
   */
    crossProductIndexIndexIndex(originIndex: number, indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * @param origin index of origin
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns return true if indexA, indexB both valid
     */
    accumulateCrossProductIndexIndexIndex(originIndex: number, indexA: number, indexB: number, result: Vector3d): void;
    /**
     * read-only property for number of XYZ in the collection.
     */
    readonly length: number;
}
//# sourceMappingURL=PointHelpers.d.ts.map