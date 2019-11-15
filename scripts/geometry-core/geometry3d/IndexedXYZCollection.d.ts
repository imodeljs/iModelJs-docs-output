/** @module ArraysAndInterfaces */
import { XYAndZ } from "./XYZProps";
import { Point3d, Vector3d } from "./Point3dVector3d";
import { Range3d } from "./Range";
/**
 * abstract base class for read-only access to XYZ data with indexed reference.
 * * This allows algorithms to work with Point3d[] or GrowableXYZ.
 * ** GrowableXYZArray implements these for its data.
 * ** Point3dArrayCarrier carries a (reference to) a Point3d[] and implements the methods with calls on that array reference.
 * * In addition to "point by point" accessors, there abstract members compute commonly useful vector data "between points".
 * * Methods that create vectors among multiple indices allow callers to avoid creating temporaries.
 * @public
 */
export declare abstract class IndexedXYZCollection {
    /**
     * Return the point at `index` as a strongly typed Point3d.
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    abstract getPoint3dAtCheckedPointIndex(index: number, result?: Point3d): Point3d | undefined;
    /**
     * Return the point at `index` as a strongly typed Point3d, without checking the point index validity.
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    abstract getPoint3dAtUncheckedPointIndex(index: number, result?: Point3d): Point3d;
    /**
     * Get from `index` as a strongly typed Vector3d.
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    abstract getVector3dAtCheckedVectorIndex(index: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return a vector from the point at `indexA` to the point at `indexB`
     * @param indexA index of point within the array
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    abstract vectorIndexIndex(indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return a vector from `origin` to the point at `indexB`
     * @param origin origin for vector
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if index is out of bounds
     */
    abstract vectorXYAndZIndex(origin: XYAndZ, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return the cross product of the vectors from `origin` to points at `indexA` and `indexB`
     * @param origin origin for vector
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    abstract crossProductXYAndZIndexIndex(origin: XYAndZ, indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return the cross product of vectors from `origin` to points at `indexA` and `indexB`
     * @param origin origin for vector
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result optional caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    abstract crossProductIndexIndexIndex(origin: number, indexA: number, indexB: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return the cross product of vectors from origin point at `indexA` to target points at `indexB` and `indexC`
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
    /**
     * Return distance squared between indicated points.
     * @param index0 first point index
     * @param index1 second point index
     */
    abstract distanceSquaredIndexIndex(index0: number, index1: number): number | undefined;
    /**
     * Return distance between indicated points.
     * @param index0 first point index
     * @param index1 second point index
     */
    abstract distanceIndexIndex(index0: number, index1: number): number | undefined;
    /** Adjust index into range by modulo with the length. */
    cyclicIndex(i: number): number;
    /** Return the range of the points. */
    getRange(): Range3d;
    /** Accumulate scale times the x,y,z values at index.
     * * No action if index is out of bounds.
     */
    abstract accumulateScaledXYZ(index: number, scale: number, sum: Point3d): void;
    /** access x of indexed point */
    abstract getXAtUncheckedPointIndex(pointIndex: number): number;
    /** access y of indexed point */
    abstract getYAtUncheckedPointIndex(pointIndex: number): number;
    /** access z of indexed point */
    abstract getZAtUncheckedPointIndex(pointIndex: number): number;
    /** Return iterator over the points in this collection. Usage:
     * ```ts
     *  for (const point: Point3d of collection.points) { ... }
     * ```
     */
    readonly points: Iterable<Point3d>;
}
/**
 * abstract base class extends IndexedXYZCollection, adding methods to push, peek, and pop, and rewrite.
 * @public
 */
export declare abstract class IndexedReadWriteXYZCollection extends IndexedXYZCollection {
    /** push a (clone of) point onto the collection
     * * point itself is not pushed -- xyz data is extracted into the native form of the collection.
     */
    abstract push(data: XYAndZ): void;
    /**
     * push a new point (given by coordinates) onto the collection
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     */
    abstract pushXYZ(x?: number, y?: number, z?: number): void;
    /** extract the final point */
    abstract back(result?: Point3d): Point3d | undefined;
    /** extract the first point */
    abstract front(result?: Point3d): Point3d | undefined;
    /** remove the final point. */
    abstract pop(): void;
    /**  clear all entries */
    abstract clear(): void;
    /** reverse the points in place. */
    abstract reverseInPlace(): void;
}
//# sourceMappingURL=IndexedXYZCollection.d.ts.map