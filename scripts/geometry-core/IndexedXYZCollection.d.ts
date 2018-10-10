/** @module ArraysAndInterfaces */
import { Point3d, Vector3d, XYAndZ } from "./PointVector";
/**
 * abstract base class for access to XYZ data with indexed reference.
 * * This allows algorithms to work with Point3d[] or GrowableXYZ.
 * ** GrowableXYZArray implements these for its data.
 * ** Point3dArrayCarrier carries a (reference to) a Point3d[] and implements the methods with calls on that array reference.
 * * In addition to "point by point" accessors, there abstract members compute commonly useful vector data "between points".
 * * Methods that create vectors among multiple indices allow callers to avoid creating temporaries.
*/
export declare abstract class IndexedXYZCollection {
    /**
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    abstract atPoint3dIndex(index: number, result?: Point3d): Point3d | undefined;
    /**
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    abstract atVector3dIndex(index: number, result?: Vector3d): Vector3d | undefined;
    /**
     * @param indexA index of point within the array
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    abstract vectorIndexIndex(indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * @param origin origin for vector
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if index is out of bounds
     */
    abstract vectorXYAndZIndex(origin: XYAndZ, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * @param origin origin for vector
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    abstract crossProductXYAndZIndexIndex(origin: XYAndZ, indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
   * @param origin index of origin
   * @param indexA index of first target within the array
   * @param indexB index of second target within the array
   * @param result caller-allocated vector.
   * @returns return true if indexA, indexB both valid
   */
    abstract crossProductIndexIndexIndex(origin: number, indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
   * @param origin index of origin
   * @param indexA index of first target within the array
   * @param indexB index of second target within the array
   * @param result caller-allocated vector.
   * @returns return true if indexA, indexB both valid
   */
    abstract accumulateCrossProductIndexIndexIndex(origin: number, indexA: number, indexB: number, result: Vector3d): void;
    /**
     * read-only property for number of XYZ in the collection.
     */
    abstract readonly length: number;
}
//# sourceMappingURL=IndexedXYZCollection.d.ts.map