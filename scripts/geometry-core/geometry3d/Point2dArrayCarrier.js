"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module CartesianGeometry */
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:variable-name jsdoc-format no-empty */
const Point2dVector2d_1 = require("./Point2dVector2d");
const IndexedXYCollection_1 = require("./IndexedXYCollection");
/**
 * Helper object to access members of a Point2d[] in geometric calculations.
 * * The collection holds only a reference to the actual array.
 * * The actual array may be replaced by the user as needed.
 * * When replaced, there is no cached data to be updated.
 * @public
*/
class Point2dArrayCarrier extends IndexedXYCollection_1.IndexedXYCollection {
    /** CAPTURE caller supplied array ... */
    constructor(data) {
        super();
        this.data = data;
    }
    /** test if index is valid  */
    isValidIndex(index) {
        return index >= 0 && index < this.data.length;
    }
    /**
     * Access by index, returning strongly typed Point2d
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getPoint2dAtCheckedPointIndex(index, result) {
        if (this.isValidIndex(index)) {
            const source = this.data[index];
            return Point2dVector2d_1.Point2d.create(source.x, source.y, result);
        }
        return undefined;
    }
    /**
     * Access by index, returning strongly typed Vector2d
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    getVector2dAtCheckedVectorIndex(index, result) {
        if (this.isValidIndex(index)) {
            const source = this.data[index];
            return Point2dVector2d_1.Vector2d.create(source.x, source.y, result);
        }
        return undefined;
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
            return Point2dVector2d_1.Vector2d.createStartEnd(this.data[indexA], this.data[indexB], result);
        return undefined;
    }
    /**
     * Return a vector from given origin to point at indexB
     * @param origin origin for vector
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if index is out of bounds
     */
    vectorXAndYIndex(origin, indexB, result) {
        if (this.isValidIndex(indexB))
            return Point2dVector2d_1.Vector2d.createStartEnd(origin, this.data[indexB], result);
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
    crossProductXAndYIndexIndex(origin, indexA, indexB) {
        if (this.isValidIndex(indexA) && this.isValidIndex(indexB))
            return Point2dVector2d_1.XY.crossProductToPoints(origin, this.data[indexA], this.data[indexB]);
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
    crossProductIndexIndexIndex(originIndex, indexA, indexB) {
        if (this.isValidIndex(originIndex) && this.isValidIndex(indexA) && this.isValidIndex(indexB))
            return Point2dVector2d_1.XY.crossProductToPoints(this.data[originIndex], this.data[indexA], this.data[indexB]);
        return undefined;
    }
    /**
     * read-only property for number of XYZ in the collection.
     */
    get length() {
        return this.data.length;
    }
}
exports.Point2dArrayCarrier = Point2dArrayCarrier;
//# sourceMappingURL=Point2dArrayCarrier.js.map