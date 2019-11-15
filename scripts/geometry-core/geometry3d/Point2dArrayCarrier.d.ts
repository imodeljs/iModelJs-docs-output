/** @module CartesianGeometry */
import { Point2d, Vector2d } from "./Point2dVector2d";
import { XAndY } from "./XYZProps";
import { IndexedXYCollection } from "./IndexedXYCollection";
/**
 * Helper object to access members of a Point2d[] in geometric calculations.
 * * The collection holds only a reference to the actual array.
 * * The actual array may be replaced by the user as needed.
 * * When replaced, there is no cached data to be updated.
 * @public
*/
export declare class Point2dArrayCarrier extends IndexedXYCollection {
    /** reference to array being queried. */
    data: Point2d[];
    /** CAPTURE caller supplied array ... */
    constructor(data: Point2d[]);
    /** test if index is valid  */
    isValidIndex(index: number): boolean;
    /**
     * Access by index, returning strongly typed Point2d
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getPoint2dAtCheckedPointIndex(index: number, result?: Point2d): Point2d | undefined;
    /**
     * Access by index, returning strongly typed Vector2d
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getVector2dAtCheckedVectorIndex(index: number, result?: Vector2d): Vector2d | undefined;
    /**
     * Return a vector from the point at indexA to the point at indexB
     * @param indexA index of point within the array
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    vectorIndexIndex(indexA: number, indexB: number, result?: Vector2d): Vector2d | undefined;
    /**
     * Return a vector from given origin to point at indexB
     * @param origin origin for vector
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if index is out of bounds
     */
    vectorXAndYIndex(origin: XAndY, indexB: number, result?: Vector2d): Vector2d | undefined;
    /**
     * Return the cross product of vectors from origin to points at indexA and indexB
     * @param origin origin for vector
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    crossProductXAndYIndexIndex(origin: XAndY, indexA: number, indexB: number): number | undefined;
    /**
   * Return the cross product of vectors from point at originIndex to points at indexA and indexB
   * @param originIndex index of origin
   * @param indexA index of first target within the array
   * @param indexB index of second target within the array
   * @param result caller-allocated vector.
   * @returns return true if indexA, indexB both valid
   */
    crossProductIndexIndexIndex(originIndex: number, indexA: number, indexB: number): number | undefined;
    /**
     * read-only property for number of XYZ in the collection.
     */
    readonly length: number;
}
//# sourceMappingURL=Point2dArrayCarrier.d.ts.map