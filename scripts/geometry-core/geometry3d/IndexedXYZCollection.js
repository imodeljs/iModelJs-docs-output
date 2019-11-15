"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Point3dVector3d_1 = require("./Point3dVector3d");
const Range_1 = require("./Range");
class PointsIterator {
    constructor(collection) {
        this._curIndex = -1;
        this._collection = collection;
    }
    next() {
        if (++this._curIndex >= this._collection.length) {
            // The ECMAScript spec states that value=undefined is valid if done=true. The TypeScript interface violates the spec hence the cast to any and back below.
            return { done: true };
        }
        return {
            value: this._collection.getPoint3dAtUncheckedPointIndex(this._curIndex),
            done: false,
        };
    }
    [Symbol.iterator]() { return this; }
}
/**
 * abstract base class for read-only access to XYZ data with indexed reference.
 * * This allows algorithms to work with Point3d[] or GrowableXYZ.
 * ** GrowableXYZArray implements these for its data.
 * ** Point3dArrayCarrier carries a (reference to) a Point3d[] and implements the methods with calls on that array reference.
 * * In addition to "point by point" accessors, there abstract members compute commonly useful vector data "between points".
 * * Methods that create vectors among multiple indices allow callers to avoid creating temporaries.
 * @public
 */
class IndexedXYZCollection {
    /** Adjust index into range by modulo with the length. */
    cyclicIndex(i) {
        return (i % this.length);
    }
    /** Return the range of the points. */
    getRange() {
        const range = Range_1.Range3d.createNull();
        const n = this.length;
        const point = Point3dVector3d_1.Point3d.create();
        for (let i = 0; i < n; i++) {
            this.getPoint3dAtUncheckedPointIndex(i, point);
            range.extendPoint(point);
        }
        return range;
    }
    /** Return iterator over the points in this collection. Usage:
     * ```ts
     *  for (const point: Point3d of collection.points) { ... }
     * ```
     */
    get points() {
        return new PointsIterator(this);
    }
}
exports.IndexedXYZCollection = IndexedXYZCollection;
/**
 * abstract base class extends IndexedXYZCollection, adding methods to push, peek, and pop, and rewrite.
 * @public
 */
class IndexedReadWriteXYZCollection extends IndexedXYZCollection {
}
exports.IndexedReadWriteXYZCollection = IndexedReadWriteXYZCollection;
//# sourceMappingURL=IndexedXYZCollection.js.map