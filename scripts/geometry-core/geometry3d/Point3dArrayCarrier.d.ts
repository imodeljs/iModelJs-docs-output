import { XYAndZ } from "./XYZProps";
import { Point3d, Vector3d } from "./Point3dVector3d";
import { IndexedReadWriteXYZCollection } from "./IndexedXYZCollection";
/** @module ArraysAndInterfaces */
/**
 * Helper object to access members of a Point3d[] in geometric calculations.
 * * The collection holds only a reference to the actual array.
 * * The actual array may be replaced by the user as needed.
 * * When replaced, there is no cached data to be updated.
 * @public
 */
export declare class Point3dArrayCarrier extends IndexedReadWriteXYZCollection {
    /** reference to array being queried. */
    data: Point3d[];
    /** CAPTURE caller supplied array ... */
    constructor(data: Point3d[]);
    /** test if `index` is a valid index into the array. */
    isValidIndex(index: number): boolean;
    /**
     * Access by index, returning strongly typed Point3d
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getPoint3dAtCheckedPointIndex(index: number, result?: Point3d): Point3d | undefined;
    /**
     * Access by index, returning strongly typed Point3d
     * * This returns the xyz value but NOT reference to the point in the "carried" array.
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getPoint3dAtUncheckedPointIndex(index: number, result?: Point3d): Point3d;
    /**
     * Access by index, returning strongly typed Vector3d
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getVector3dAtCheckedVectorIndex(index: number, result?: Vector3d): Vector3d | undefined;
    /** access x of indexed point */
    getXAtUncheckedPointIndex(pointIndex: number): number;
    /** access y of indexed point */
    getYAtUncheckedPointIndex(pointIndex: number): number;
    /** access z of indexed point */
    getZAtUncheckedPointIndex(pointIndex: number): number;
    /**
     * Return a vector from the point at indexA to the point at indexB
     * @param indexA index of point within the array
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    vectorIndexIndex(indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return a vector from given origin to point at indexB
     * @param origin origin for vector
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if index is out of bounds
     */
    vectorXYAndZIndex(origin: XYAndZ, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return the cross product of vectors from origin to points at indexA and indexB
     * @param origin origin for vector
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    crossProductXYAndZIndexIndex(origin: XYAndZ, indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return the cross product of vectors from point at originIndex to points at indexA and indexB
     * @param originIndex index of origin
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns return true if indexA, indexB both valid
     */
    crossProductIndexIndexIndex(originIndex: number, indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Compute the cross product of vectors from point at originIndex to points at indexA and indexB, and accumulate it to the result.
     * @param origin index of origin
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns return true if indexA, indexB both valid
     */
    accumulateCrossProductIndexIndexIndex(originIndex: number, indexA: number, indexB: number, result: Vector3d): void;
    /**
     * * compute the cross product from indexed origin t indexed targets targetAIndex and targetB index.
     * * accumulate it to the result.
     */
    accumulateScaledXYZ(index: number, scale: number, sum: Point3d): void;
    /**
     * read-only property for number of XYZ in the collection.
     */
    readonly length: number;
    /** push a (clone of) point onto the collection
     * * point itself is not pushed -- xyz data is extracted into the native form of the collection.
     */
    push(data: Point3d): void;
    /**
     * push a new point (given by coordinates) onto the collection
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     */
    pushXYZ(x?: number, y?: number, z?: number): void;
    /** extract (copy) the final point */
    back(result?: Point3d): Point3d | undefined;
    /** extract (copy) the first point */
    front(result?: Point3d): Point3d | undefined;
    /** remove the final point. */
    pop(): void;
    /** remove all points. */
    clear(): void;
    /** Reverse the points in place */
    reverseInPlace(): void;
    /**
     * Return distance squared between indicated points.
     * * Concrete classes may be able to implement this without creating a temporary.
     * @param index0 first point index
     * @param index1 second point index
     * @param defaultDistanceSquared distance squared to return if either point index is invalid.
     *
     */
    distanceSquaredIndexIndex(index0: number, index1: number): number | undefined;
    /**
     * Return distance between indicated points.
     * * Concrete classes may be able to implement this without creating a temporary.
     * @param index0 first point index
     * @param index1 second point index
     * @param defaultDistanceSquared distance squared to return if either point index is invalid.
     */
    distanceIndexIndex(index0: number, index1: number): number | undefined;
    /** Adjust index into range by modulo with the length. */
    cyclicIndex(i: number): number;
}
//# sourceMappingURL=Point3dArrayCarrier.d.ts.map