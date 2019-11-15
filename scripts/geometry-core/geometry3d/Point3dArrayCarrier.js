"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Point3dVector3d_1 = require("./Point3dVector3d");
const IndexedXYZCollection_1 = require("./IndexedXYZCollection");
/** @module ArraysAndInterfaces */
/**
 * Helper object to access members of a Point3d[] in geometric calculations.
 * * The collection holds only a reference to the actual array.
 * * The actual array may be replaced by the user as needed.
 * * When replaced, there is no cached data to be updated.
 * @public
 */
class Point3dArrayCarrier extends IndexedXYZCollection_1.IndexedReadWriteXYZCollection {
    /** CAPTURE caller supplied array ... */
    constructor(data) {
        super();
        this.data = data;
    }
    /** test if `index` is a valid index into the array. */
    isValidIndex(index) {
        return index >= 0 && index < this.data.length;
    }
    /**
     * Access by index, returning strongly typed Point3d
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getPoint3dAtCheckedPointIndex(index, result) {
        if (this.isValidIndex(index)) {
            const source = this.data[index];
            return Point3dVector3d_1.Point3d.create(source.x, source.y, source.z, result);
        }
        return undefined;
    }
    /**
     * Access by index, returning strongly typed Point3d
     * * This returns the xyz value but NOT reference to the point in the "carried" array.
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getPoint3dAtUncheckedPointIndex(index, result) {
        const source = this.data[index];
        return Point3dVector3d_1.Point3d.create(source.x, source.y, source.z, result);
    }
    /**
     * Access by index, returning strongly typed Vector3d
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getVector3dAtCheckedVectorIndex(index, result) {
        if (this.isValidIndex(index)) {
            const source = this.data[index];
            return Point3dVector3d_1.Vector3d.create(source.x, source.y, source.z, result);
        }
        return undefined;
    }
    /** access x of indexed point */
    getXAtUncheckedPointIndex(pointIndex) {
        return this.data[pointIndex].x;
    }
    /** access y of indexed point */
    getYAtUncheckedPointIndex(pointIndex) {
        return this.data[pointIndex].y;
    }
    /** access z of indexed point */
    getZAtUncheckedPointIndex(pointIndex) {
        return this.data[pointIndex].z;
    }
    /**
     * Return a vector from the point at indexA to the point at indexB
     * @param indexA index of point within the array
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    vectorIndexIndex(indexA, indexB, result) {
        if (this.isValidIndex(indexA) && this.isValidIndex(indexB))
            return Point3dVector3d_1.Vector3d.createStartEnd(this.data[indexA], this.data[indexB], result);
        return undefined;
    }
    /**
     * Return a vector from given origin to point at indexB
     * @param origin origin for vector
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if index is out of bounds
     */
    vectorXYAndZIndex(origin, indexB, result) {
        if (this.isValidIndex(indexB))
            return Point3dVector3d_1.Vector3d.createStartEnd(origin, this.data[indexB], result);
        return undefined;
    }
    /**
     * Return the cross product of vectors from origin to points at indexA and indexB
     * @param origin origin for vector
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    crossProductXYAndZIndexIndex(origin, indexA, indexB, result) {
        if (this.isValidIndex(indexA) && this.isValidIndex(indexB))
            return Point3dVector3d_1.Vector3d.createCrossProductToPoints(origin, this.data[indexA], this.data[indexB], result);
        return undefined;
    }
    /**
     * Return the cross product of vectors from point at originIndex to points at indexA and indexB
     * @param originIndex index of origin
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns return true if indexA, indexB both valid
     */
    crossProductIndexIndexIndex(originIndex, indexA, indexB, result) {
        if (this.isValidIndex(originIndex) && this.isValidIndex(indexA) && this.isValidIndex(indexB))
            return Point3dVector3d_1.Vector3d.createCrossProductToPoints(this.data[originIndex], this.data[indexA], this.data[indexB], result);
        return undefined;
    }
    /**
     * Compute the cross product of vectors from point at originIndex to points at indexA and indexB, and accumulate it to the result.
     * @param origin index of origin
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns return true if indexA, indexB both valid
     */
    accumulateCrossProductIndexIndexIndex(originIndex, indexA, indexB, result) {
        const data = this.data;
        if (this.isValidIndex(originIndex) && this.isValidIndex(indexA) && this.isValidIndex(indexB))
            result.addCrossProductToTargetsInPlace(data[originIndex].x, data[originIndex].y, data[originIndex].z, data[indexA].x, data[indexA].y, data[indexA].z, data[indexB].x, data[indexB].y, data[indexB].z);
    }
    /**
     * * compute the cross product from indexed origin t indexed targets targetAIndex and targetB index.
     * * accumulate it to the result.
     */
    accumulateScaledXYZ(index, scale, sum) {
        if (this.isValidIndex(index)) {
            const point = this.data[index];
            sum.x += scale * point.x;
            sum.y += scale * point.y;
            sum.z += scale * point.z;
        }
    }
    /**
     * read-only property for number of XYZ in the collection.
     */
    get length() {
        return this.data.length;
    }
    /** push a (clone of) point onto the collection
     * * point itself is not pushed -- xyz data is extracted into the native form of the collection.
     */
    push(data) {
        this.data.push(data.clone());
    }
    /**
     * push a new point (given by coordinates) onto the collection
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     */
    pushXYZ(x, y, z) {
        this.data.push(Point3dVector3d_1.Point3d.create(x === undefined ? 0.0 : x, y === undefined ? 0.0 : y, z === undefined ? 0.0 : z));
    }
    /** extract (copy) the final point */
    back(result) {
        if (this.data.length > 0) {
            return this.data[this.data.length - 1].clone(result);
        }
        return undefined;
    }
    /** extract (copy) the first point */
    front(result) {
        if (this.data.length > 0) {
            return this.data[0].clone(result);
        }
        return undefined;
    }
    /** remove the final point. */
    pop() {
        if (this.data.length > 0)
            this.data.pop();
    }
    /** remove all points. */
    clear() {
        this.data.length = 0;
    }
    /** Reverse the points in place */
    reverseInPlace() {
        this.data.reverse();
    }
    /**
     * Return distance squared between indicated points.
     * * Concrete classes may be able to implement this without creating a temporary.
     * @param index0 first point index
     * @param index1 second point index
     * @param defaultDistanceSquared distance squared to return if either point index is invalid.
     *
     */
    distanceSquaredIndexIndex(index0, index1) {
        const n = this.data.length;
        if (index0 >= 0 && index0 < n && index1 >= 0 && index1 < n) {
            return this.data[index0].distanceSquared(this.data[index1]);
        }
        return undefined;
    }
    /**
     * Return distance between indicated points.
     * * Concrete classes may be able to implement this without creating a temporary.
     * @param index0 first point index
     * @param index1 second point index
     * @param defaultDistanceSquared distance squared to return if either point index is invalid.
     */
    distanceIndexIndex(index0, index1) {
        const n = this.data.length;
        if (index0 >= 0 && index0 < n && index1 >= 0 && index1 < n) {
            return this.data[index0].distance(this.data[index1]);
        }
        return undefined;
    }
    /** Adjust index into range by modulo with the length. */
    cyclicIndex(i) {
        return (i % this.length);
    }
}
exports.Point3dArrayCarrier = Point3dArrayCarrier;
//# sourceMappingURL=Point3dArrayCarrier.js.map