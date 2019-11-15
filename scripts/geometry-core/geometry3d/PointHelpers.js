"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
/* tslint:disable:variable-name jsdoc-format no-empty */
const Geometry_1 = require("../Geometry");
const Point2dVector2d_1 = require("./Point2dVector2d");
const Point3dVector3d_1 = require("./Point3dVector3d");
const Transform_1 = require("./Transform");
const Point4d_1 = require("../geometry4d/Point4d");
const IndexedXYZCollection_1 = require("./IndexedXYZCollection");
const PointStreaming_1 = require("./PointStreaming");
const Range_1 = require("./Range");
/**
 * The `NumberArray` class contains static methods that act on arrays of numbers.
 * @public
 */
class NumberArray {
    /** return the sum of values in an array,   The summation is done with correction terms which
     * improves last-bit numeric accuracy.
     */
    static preciseSum(data) {
        const n = data.length;
        if (n === 0)
            return 0.0;
        let sum = data[0];
        let c = 0.0;
        let y;
        let t;
        for (let i = 1; i < n; i++) {
            y = data[i] - c;
            t = sum + y;
            c = (t - sum) - y;
            sum = t;
        }
        return sum;
    }
    /** Return true if arrays have identical counts and equal entries (using `!==` comparison) */
    static isExactEqual(dataA, dataB) {
        if (dataA && dataB) {
            if (dataA.length !== dataB.length)
                return false;
            for (let i = 0; i < dataA.length; i++)
                if (dataA[i] !== dataB[i])
                    return false;
            return true;
        }
        return (dataA === undefined && dataB === undefined);
    }
    /** Return true if arrays have identical counts and entries equal within tolerance */
    static isAlmostEqual(dataA, dataB, tolerance) {
        if (dataA && dataB) {
            if (dataA.length !== dataB.length)
                return false;
            for (let i = 0; i < dataA.length; i++)
                if (Math.abs(dataA[i] - dataB[i]) >= tolerance)
                    return false;
            return true;
        }
        return (dataA === undefined && dataB === undefined);
    }
    /** return the sum of numbers in an array.  Note that "PreciseSum" may be more accurate. */
    static sum(data) {
        let sum = 0;
        for (const x of data) {
            sum += x;
        }
        return sum;
    }
    /** test if coordinate x appears (to tolerance by `Geometry.isSameCoordinate`) in this array of numbers */
    static isCoordinateInArray(x, data) {
        if (data) {
            for (const y of data) {
                if (Geometry_1.Geometry.isSameCoordinate(x, y))
                    return true;
            }
        }
        return false;
    }
    /** Return the max absolute value in a array of numbers. */
    static maxAbsArray(values) {
        const arrLen = values.length;
        if (arrLen === 0) {
            return 0.0;
        }
        let a = Math.abs(values[0]);
        for (let i = 1; i < arrLen; i++) {
            const b = Math.abs(values[i]);
            if (a < b) {
                a = b;
            }
        }
        return a;
    }
    /** return the max absolute value of a pair of numbers */
    static maxAbsTwo(a1, a2) {
        a1 = Math.abs(a1);
        a2 = Math.abs(a2);
        return (a1 > a2) ? a1 : a2;
    }
    /** Return the max absolute difference between corresponding entries in two arrays of numbers
     * * If sizes are mismatched, only the smaller length is tested.
     */
    static maxAbsDiff(dataA, dataB) {
        let a = 0.0;
        const n = Math.min(dataA.length, dataB.length);
        for (let i = 0; i < n; i++) {
            a = Math.max(a, Math.abs(dataA[i] - dataB[i]));
        }
        return a;
    }
    /** Return the max absolute difference between corresponding entries in two Float64Array
     * * If sizes are mismatched, only the smaller length is tested.
     */
    static maxAbsDiffFloat64(dataA, dataB) {
        let a = 0.0;
        const n = Math.min(dataA.length, dataB.length);
        for (let i = 0; i < n; i++) {
            a = Math.max(a, Math.abs(dataA[i] - dataB[i]));
        }
        return a;
    }
}
exports.NumberArray = NumberArray;
/**
 * The `Point2dArray` class contains static methods that act on arrays of 2d points.
 * @public
 */
class Point2dArray {
    /** Return true if arrays have same length and matching coordinates. */
    static isAlmostEqual(dataA, dataB) {
        if (dataA && dataB) {
            if (dataA.length !== dataB.length)
                return false;
            for (let i = 0; i < dataA.length; i++) {
                if (!dataA[i].isAlmostEqual(dataB[i]))
                    return false;
            }
            return true;
        }
        return (dataA === undefined && dataB === undefined);
    }
    /**
     * Return an array containing clones of the Point3d data[]
     * @param data source data
     */
    static clonePoint2dArray(data) {
        return data.map((p) => p.clone());
    }
    /**
     * Return the number of points when trailing points that match point 0 are excluded.
     * @param data array of XAndY points.
     */
    static pointCountExcludingTrailingWraparound(data) {
        let n = data.length;
        if (n < 2)
            return n;
        const x0 = data[0].x;
        const y0 = data[0].y;
        while (n > 1) {
            if (!Geometry_1.Geometry.isSameCoordinate(data[n - 1].x, x0) || !Geometry_1.Geometry.isSameCoordinate(data[n - 1].y, y0))
                return n;
            n--;
        }
        return n;
    }
}
exports.Point2dArray = Point2dArray;
/**
 * The `Vector3ddArray` class contains static methods that act on arrays of 2d vectors.
 * @public
 */
class Vector3dArray {
    /** Return true if arrays have same length and matching coordinates. */
    static isAlmostEqual(dataA, dataB) {
        if (dataA && dataB) {
            if (dataA.length !== dataB.length)
                return false;
            for (let i = 0; i < dataA.length; i++)
                if (!dataA[i].isAlmostEqual(dataB[i]))
                    return false;
            return true;
        }
        return (dataA === undefined && dataB === undefined);
    }
    /**
     * Return an array containing clones of the Vector3d data[]
     * @param data source data
     */
    static cloneVector3dArray(data) {
        return data.map((p) => Point3dVector3d_1.Vector3d.create(p.x, p.y, p.z));
    }
}
exports.Vector3dArray = Vector3dArray;
/**
 * The `Point4dArray` class contains static methods that act on arrays of 4d points.
 * @public
 */
class Point4dArray {
    /** pack each point and its corresponding weight into a buffer of xyzw xyzw ... */
    static packPointsAndWeightsToFloat64Array(points, weights, result) {
        result = result ? result : new Float64Array(4 * points.length);
        let i = 0;
        let k = 0;
        for (k = 0; k < points.length; k++) {
            result[i++] = points[k].x;
            result[i++] = points[k].y;
            result[i++] = points[k].z;
            result[i++] = weights[k];
        }
        return result;
    }
    /** pack x,y,z,w in Float64Array. */
    static packToFloat64Array(data, result) {
        result = result ? result : new Float64Array(4 * data.length);
        let i = 0;
        for (const p of data) {
            result[i++] = p.x;
            result[i++] = p.y;
            result[i++] = p.z;
            result[i++] = p.w;
        }
        return result;
    }
    /** unpack from  ... to array of Point4d */
    static unpackToPoint4dArray(data) {
        const result = [];
        for (let i = 0; i + 3 < data.length; i += 4) {
            result.push(Point4d_1.Point4d.create(data[i], data[i + 1], data[i + 2], data[i + 3]));
        }
        return result;
    }
    /** unpack from xyzw xyzw... array to array of Point3d and array of weight.
     */
    static unpackFloat64ArrayToPointsAndWeights(data, points, weights, pointFormatter = Point3dVector3d_1.Point3d.create) {
        points.length = 0;
        weights.length = 0;
        for (let i = 0; i + 3 < data.length; i += 4) {
            points.push(pointFormatter(data[i], data[i + 1], data[i + 2]));
            weights.push(data[i + 3]);
        }
    }
    /**
     * Multiply (and replace) each block of 4 values as a Point4d.
     * @param transform transform to apply
     * @param xyzw array of x,y,z,w points.
     */
    static multiplyInPlace(transform, xyzw) {
        const numXYZW = xyzw.length;
        const xyzw1 = Point4dArray._workPoint4d;
        for (let i = 0; i + 3 < numXYZW; i += 4) {
            transform.multiplyXYZW(xyzw[i], xyzw[i + 1], xyzw[i + 2], xyzw[i + 3], xyzw1);
            xyzw[i] = xyzw1.x;
            xyzw[i + 1] = xyzw1.y;
            xyzw[i + 2] = xyzw1.z;
            xyzw[i + 3] = xyzw1.w;
        }
    }
    /** test for near equality of all corresponding numeric values, treated as coordinates. */
    static isAlmostEqual(dataA, dataB) {
        if (dataA && dataB) {
            if (dataA.length !== dataB.length)
                return false;
            if (dataA instanceof Float64Array && dataB instanceof Float64Array) {
                for (let i = 0; i < dataA.length; i++)
                    if (!Geometry_1.Geometry.isSameCoordinate(dataA[i], dataB[i]))
                        return false;
            }
            else if (Array.isArray(dataA) && Array.isArray(dataB)) {
                for (let i = 0; i < dataA.length; i++)
                    if (!dataA[i].isAlmostEqual(dataB[i]))
                        return false;
            }
            return true;
        }
        // if both are null it is equal, otherwise unequal
        return (dataA === undefined && dataB === undefined);
    }
    /** return true iff all xyzw points' altitudes are within tolerance of the plane.*/
    static isCloseToPlane(data, plane, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        if (Array.isArray(data)) {
            for (const xyzw of data) {
                if (Math.abs(plane.altitudeXYZW(xyzw.x, xyzw.y, xyzw.z, xyzw.w)) > tolerance)
                    return false;
            }
        }
        else if (data instanceof Float64Array) {
            const numXYZ = data.length;
            for (let i = 0; i + 2 < numXYZ; i += 4) {
                if (Math.abs(plane.altitudeXYZW(data[i], data[i + 1], data[i + 2], data[i + 3])) > tolerance)
                    return false;
            }
        }
        return true;
    }
}
exports.Point4dArray = Point4dArray;
Point4dArray._workPoint4d = Point4d_1.Point4d.create();
/**
 * The `Point3dArray` class contains static methods that act on arrays of 3d points.
 * @public
 */
class Point3dArray {
    /** pack x,y,z to `Float64Array` */
    static packToFloat64Array(data) {
        const result = new Float64Array(3 * data.length);
        let i = 0;
        for (const p of data) {
            result[i++] = p.x;
            result[i++] = p.y;
            result[i++] = p.z;
        }
        return result;
    }
    /**
     * Compute the 8 weights of trilinear mapping
     * By appropriate choice of weights, this can be used for both point and derivative mappings.
     * @param weights preallocated array to receive weights.
     * @param u0 low u weight
     * @param u1 high u weight
     * @param v0 low v weight
     * @param v1 high v weight
     * @param w0 low w weight
     * @param w1 high w weight
     */
    static evaluateTrilinearWeights(weights, u0, u1, v0, v1, w0, w1) {
        weights[0] = u0 * v0 * w0;
        weights[1] = u1 * v0 * w0;
        weights[2] = u0 * v1 * w0;
        weights[3] = u1 * v1 * w0;
        weights[4] = u0 * v0 * w1;
        weights[5] = u1 * v0 * w1;
        weights[6] = u0 * v1 * w1;
        weights[7] = u1 * v1 * w1;
    }
    /**
     * sum the weighted x components from a point array.
     * * weights.length is the number of summed terms
     * * points must have at least that length
     * @param weights
     * @param points
     */
    static sumWeightedX(weights, points) {
        let sum = 0.0;
        const n = weights.length;
        for (let i = 0; i < n; i++)
            sum += weights[i] * points[i].x;
        return sum;
    }
    /**
     * sum the weighted x components from a point array.
     * * weights.length is the number of summed terms
     * * points must have at least that length
     * @param weights
     * @param points
     */
    static sumWeightedY(weights, points) {
        let sum = 0.0;
        const n = weights.length;
        for (let i = 0; i < n; i++)
            sum += weights[i] * points[i].y;
        return sum;
    }
    /**
     * sum the weighted x components from a point array.
     * * weights.length is the number of summed terms
     * * points must have at least that length
     * @param weights
     * @param points
     */
    static sumWeightedZ(weights, points) {
        let sum = 0.0;
        const n = weights.length;
        for (let i = 0; i < n; i++)
            sum += weights[i] * points[i].z;
        return sum;
    }
    /**
     * Compute a point by trilinear mapping.
     * @param points array of 8 points at corners, with x index varying fastest.
     * @param result optional result point
     */
    static evaluateTrilinearPoint(points, u, v, w, result) {
        if (!result)
            result = Point3dVector3d_1.Point3d.create(0, 0, 0);
        this.evaluateTrilinearWeights(this._weightUVW, 1 - u, u, 1 - v, v, 1 - w, w);
        let a;
        for (let i = 0; i < 8; i++) {
            a = this._weightUVW[i];
            result.x += a * points[i].x;
            result.y += a * points[i].y;
            result.z += a * points[i].z;
        }
        return result;
    }
    /**
     * Compute a point and derivatives wrt uvw by trilinear mapping.
     * * evaluated point is the point part of the transform
     * * u,v,w derivatives are the respective columns of the matrix part of the transform.
     * @param points array of 8 points at corners, with x index varying fastest.
     * @param result optional result transform
     */
    static evaluateTrilinearDerivativeTransform(points, u, v, w, result) {
        this.evaluateTrilinearWeights(this._weightUVW, 1 - u, u, 1 - v, v, 1 - w, w);
        this.evaluateTrilinearWeights(this._weightDU, -1, 1, 1 - v, v, 1 - w, w);
        this.evaluateTrilinearWeights(this._weightDV, 1 - u, u, -1, 1, 1 - w, w);
        this.evaluateTrilinearWeights(this._weightDW, 1 - u, u, 1 - v, v, -1, 1);
        return Transform_1.Transform.createRowValues(this.sumWeightedX(this._weightDU, points), this.sumWeightedX(this._weightDV, points), this.sumWeightedX(this._weightDW, points), this.sumWeightedX(this._weightUVW, points), this.sumWeightedY(this._weightDU, points), this.sumWeightedY(this._weightDV, points), this.sumWeightedY(this._weightDW, points), this.sumWeightedY(this._weightUVW, points), this.sumWeightedZ(this._weightDU, points), this.sumWeightedZ(this._weightDV, points), this.sumWeightedZ(this._weightDW, points), this.sumWeightedZ(this._weightUVW, points), result);
    }
    /** unpack from a number array or Float64Array to an array of `Point3d` */
    static unpackNumbersToPoint3dArray(data) {
        const result = [];
        for (let i = 0; i + 2 < data.length; i += 3) {
            result.push(Point3dVector3d_1.Point3d.create(data[i], data[i + 1], data[i + 2]));
        }
        return result;
    }
    /**
     * return an 2-dimensional array containing all the values of `data` in arrays of numPerBlock
     * @param data simple array of numbers
     * @param numPerBlock number of values in each block at first level down
     */
    static unpackNumbersToNestedArrays(data, numPerBlock) {
        const result = [];
        const n = data.length;
        let i = 0;
        let i1 = 0;
        while (i < n) {
            // there is at least one more value for a block
            const row = [];
            i1 = i + numPerBlock;
            if (i1 > n)
                i1 = n;
            for (; i < i1; i++) {
                row.push(data[i]);
            }
            result.push(row);
        }
        return result;
    }
    /**
     * return an 3-dimensional array containing all the values of `data` in arrays numPerRow blocks of numPerBlock
     * @param data simple array of numbers
     * @param numPerBlock number of values in each block at first level down
     */
    static unpackNumbersToNestedArraysIJK(data, numPerBlock, numPerRow) {
        const result = [];
        const n = data.length;
        let i = 0;
        let i1 = 0;
        let i2;
        while (i < n) {
            const row = [];
            i2 = i + numPerBlock * numPerRow;
            while (i < i2) {
                const block = [];
                i1 = i + numPerBlock;
                if (i1 > n)
                    i1 = n;
                for (; i < i1; i++) {
                    block.push(data[i]);
                }
                row.push(block);
            }
            result.push(row);
        }
        return result;
    }
    /**  multiply a transform times each x,y,z triple and replace the x,y,z in the packed array */
    static multiplyInPlace(transform, xyz) {
        const xyz1 = Point3dVector3d_1.Point3d.create();
        const numXYZ = xyz.length;
        for (let i = 0; i + 2 < numXYZ; i += 3) {
            transform.multiplyXYZ(xyz[i], xyz[i + 1], xyz[i + 2], xyz1);
            xyz[i] = xyz1.x;
            xyz[i + 1] = xyz1.y;
            xyz[i + 2] = xyz1.z;
        }
    }
    /** Apply Geometry.isAlmostEqual to corresponding coordinates */
    static isAlmostEqual(dataA, dataB) {
        if (dataA && dataB) {
            if (dataA.length !== dataB.length)
                return false;
            if (dataA instanceof Float64Array && dataB instanceof Float64Array) {
                for (let i = 0; i < dataA.length; i++)
                    if (!Geometry_1.Geometry.isSameCoordinate(dataA[i], dataB[i]))
                        return false;
            }
            else if (Array.isArray(dataA) && Array.isArray(dataB)) {
                for (let i = 0; i < dataA.length; i++)
                    if (!dataA[i].isAlmostEqual(dataB[i]))
                        return false;
            }
            return true;
        }
        // if both are null it is equal, otherwise unequal
        return (dataA === undefined && dataB === undefined);
    }
    /** return simple average of all coordinates.   (000 if empty array) */
    static centroid(points, result) {
        result = Point3dVector3d_1.Point3d.create(0, 0, 0, result);
        const p = Point3dVector3d_1.Point3d.create();
        if (points.length > 0) {
            for (let i = 0; i < points.length; i++) {
                points.getPoint3dAtCheckedPointIndex(i, p);
                result.x += p.x;
                result.y += p.y;
                result.z += p.z;
            }
            result.scaleInPlace(1.0 / points.length);
        }
        return result;
    }
    /** Return the index of the point most distant from spacePoint */
    static indexOfMostDistantPoint(points, spacePoint, farVector) {
        if (points.length === 0)
            return undefined;
        let dMax = -1;
        let d;
        let result = -1;
        for (let i = 0; i < points.length; i++) {
            d = spacePoint.distance(points[i]);
            if (d > dMax) {
                spacePoint.vectorTo(points[i], farVector);
                dMax = d;
                result = i;
            }
        }
        return result;
    }
    /** return the index of the point whose vector from space point has the largest magnitude of cross product with given vector. */
    static indexOfPointWithMaxCrossProductMagnitude(points, spacePoint, vector, farVector) {
        if (points.length === 0)
            return undefined;
        let dMax = -1;
        let d;
        let result = -1;
        let vectorAB; // to be reused in loop !!!
        for (let i = 0; i < points.length; i++) {
            vectorAB = spacePoint.vectorTo(points[i], vectorAB);
            d = vectorAB.crossProductMagnitude(vector);
            if (d > dMax) {
                farVector.setFrom(vectorAB);
                dMax = d;
                result = i;
            }
        }
        return result;
    }
    /** Return the index of the closest point in the array (full xyz) */
    static closestPointIndex(data, spacePoint) {
        let index = -1;
        let dMin = Number.MAX_VALUE;
        let d;
        const x0 = spacePoint.x;
        const y0 = spacePoint.y;
        const z0 = spacePoint.z;
        for (let i = 0; i < data.length; i++) {
            d = Geometry_1.Geometry.distanceXYZXYZ(x0, y0, z0, data[i].x, data[i].y, data[i].z);
            if (d < dMin) {
                index = i;
                dMin = d;
            }
        }
        return index;
    }
    /** return true iff all points' altitudes are within tolerance of the plane.*/
    static isCloseToPlane(data, plane, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        if (Array.isArray(data)) {
            let xyz;
            for (xyz of data) {
                if (Math.abs(plane.altitude(xyz)) > tolerance)
                    return false;
            }
        }
        else if (data instanceof Float64Array) {
            const numXYZ = data.length;
            for (let i = 0; i + 2 < numXYZ; i += 3) {
                if (Math.abs(plane.altitudeXYZ(data[i], data[i + 1], data[i + 2])) > tolerance)
                    return false;
            }
        }
        return true;
    }
    /**
     * Sum lengths of edges.
     * @param data points.
     */
    static sumEdgeLengths(data, addClosureEdge = false) {
        let sum = 0.0;
        if (Array.isArray(data)) {
            const n = data.length - 1;
            for (let i = 0; i < n; i++)
                sum += data[i].distance(data[i + 1]);
            if (addClosureEdge && n > 0)
                sum += data[0].distance(data[n]);
        }
        else if (data instanceof Float64Array) {
            const numXYZ = data.length;
            let i = 0;
            for (; i + 5 < numXYZ; i += 3) { // final i points at final point x
                sum += Geometry_1.Geometry.hypotenuseXYZ(data[i + 3] - data[i], data[i + 4] - data[i + 1], data[i + 5] - data[i + 2]);
            }
            if (addClosureEdge && i >= 3) {
                sum += Geometry_1.Geometry.hypotenuseXYZ(data[0] - data[i], data[1] - data[i + 1], data[2] - data[i + 2]);
            }
        }
        return sum;
    }
    /**
     * Return an array containing clones of the Point3d data[]
     * @param data source data
     */
    static clonePoint3dArray(data) {
        return data.map((p) => Point3dVector3d_1.Point3d.create(p.x, p.y, p.z));
    }
    /**
     * Return an array containing Point2d with xy parts of each Point3d
     * @param data source data
     */
    static clonePoint2dArray(data) {
        return data.map((p) => Point2dVector2d_1.Point2d.create(p.x, p.y));
    }
    /**
     * clone points in the input array, inserting points within each edge to limit edge length.
     * @param points array of points
     * @param maxEdgeLength max length of an edge
     */
    static cloneWithMaxEdgeLength(points, maxEdgeLength) {
        if (points.length === 0)
            return [];
        const result = [points[0]];
        for (let i = 1; i < points.length; i++) {
            const a = points[i - 1].distance(points[i]);
            const n = Geometry_1.Geometry.stepCount(maxEdgeLength, a, 1);
            for (let k = 1; k < n; k++)
                result.push(points[i - 1].interpolate(k / n, points[i]));
            result.push(points[i]);
        }
        return result;
    }
    /** Pack isolated x,y,z args as a json `[x,y,z]` */
    static xyzToArray(x, y, z) { return [x, y, z]; }
    /**
     * return similarly-structured array, array of arrays, etc, with the lowest level point data specifically structured as arrays of 3 numbers `[1,2,3]`
     * @param data point data with various leaf forms such as `[1,2,3]`, `{x:1,y:2,z:3}`, `Point3d`
     */
    static cloneDeepJSONNumberArrays(data) {
        const collector = new PointStreaming_1.PointStringDeepXYZArrayCollector(this.xyzToArray);
        PointStreaming_1.VariantPointDataStream.streamXYZ(data, collector);
        return collector.claimResult();
    }
    /**
     * return similarly-structured array, array of arrays, etc, with the lowest level point data specifically structured as `Point3d`.
     * @param data point data with various leaf forms such as `[1,2,3]`, `{x:1,y:2,z:3}`, `Point3d`
     */
    static cloneDeepXYZPoint3dArrays(data) {
        const collector = new PointStreaming_1.PointStringDeepXYZArrayCollector(Point3dVector3d_1.Point3d.create);
        PointStreaming_1.VariantPointDataStream.streamXYZ(data, collector);
        return collector.claimResult();
    }
    /**
     * `Point3dArray.createRange(data)` is deprecated.  Used `Range3d.createFromVariantData(data: MultiLineStringDataVariant): Range3d`
     * @deprecated Use Range3d.createFromVariantData (data)
     * @param data
     */
    static createRange(data) { return Range_1.Range3d.createFromVariantData(data); }
    /**
     * `Point3dArray.streamXYZ` is deprecated -- use `VariantPointStream.streamXYZ (handler)`
     * @deprecated - use VariantPointStream.streamXYZ (handler)
     * Invoke a callback with each x,y,z from an array of points in variant forms.
     * @param startChainCallback called to announce the beginning of points (or recursion)
     * @param pointCallback (index, x,y,z) = function to receive point coordinates one by one
     * @param endChainCallback called to announce the end of handling of an array.
     */
    static streamXYZ(data, startChainCallback, pointCallback, endChainCallback) {
        let numPoint = 0;
        if (Array.isArray(data)) {
            // If the first entry is a point, expect the entire array to be points.
            // otherwise recurse to each member of this array.
            if (data.length > 0 && Point3dVector3d_1.Point3d.isAnyImmediatePointType(data[0])) {
                if (startChainCallback)
                    startChainCallback(data, true);
                for (const p of data) {
                    const x = Point3dVector3d_1.Point3d.accessX(p);
                    const y = Point3dVector3d_1.Point3d.accessY(p);
                    const z = Point3dVector3d_1.Point3d.accessZ(p, 0);
                    if (x !== undefined && y !== undefined)
                        pointCallback(x, y, z);
                    numPoint++;
                }
                if (endChainCallback)
                    endChainCallback(data, true);
            }
            else {
                // This is an array that does not immediately have points.
                if (startChainCallback)
                    startChainCallback(data, false);
                for (const child of data) {
                    // tslint:disable-next-line: deprecation
                    numPoint += this.streamXYZ(child, startChainCallback, pointCallback, endChainCallback);
                }
                if (endChainCallback)
                    endChainCallback(data, false);
            }
        }
        else if (data instanceof IndexedXYZCollection_1.IndexedXYZCollection) {
            if (startChainCallback)
                startChainCallback(data, true);
            const q = Point3dArray._workPoint = Point3dVector3d_1.Point3d.create(0, 0, 0, Point3dArray._workPoint);
            for (let i = 0; i < data.length; i++) {
                data.getPoint3dAtCheckedPointIndex(i, q);
                numPoint++;
                pointCallback(q.x, q.y, q.z);
            }
            if (endChainCallback)
                endChainCallback(data, true);
        }
        return numPoint;
    }
    /**
       * `Point3dArray.streamXYZXYZ` is deprecated -- use `VariantPointStream.streamXYZXYZ (handler)`
     * @deprecated - use VariantPointStream.streamXYZXYZ (handler)
     * Invoke a callback with each x,y,z from an array of points in variant forms.
     * @param startChainCallback callback of the form `startChainCallback (source, isLeaf)` to be called with the source array at each level.
     * @param segmentCallback callback of the form `segmentCallback (index0, x0,y0,z0, index1, x1,y1,z1)`
     * @param endChainCallback callback of the form `endChainCallback (source, isLeaf)` to be called with the source array at each level.
    */
    static streamXYZXYZ(data, startChainCallback, segmentCallback, endChainCallback) {
        let x0 = 0, y0 = 0, z0 = 0, x1, y1, z1;
        let point0Known = false;
        let numSegment = 0;
        if (Array.isArray(data)) {
            if (data.length > 0 && Point3dVector3d_1.Point3d.isAnyImmediatePointType(data[0])) {
                if (startChainCallback)
                    startChainCallback(data, true);
                for (const p of data) {
                    x1 = Point3dVector3d_1.Point3d.accessX(p);
                    y1 = Point3dVector3d_1.Point3d.accessY(p);
                    z1 = Point3dVector3d_1.Point3d.accessZ(p, 0);
                    if (x1 !== undefined && y1 !== undefined) {
                        if (point0Known) {
                            segmentCallback(x0, y0, z0, x1, y1, z1);
                            numSegment++;
                        }
                        point0Known = true;
                        x0 = x1;
                        y0 = y1;
                        z0 = z1;
                    }
                }
                if (endChainCallback)
                    endChainCallback(data, true);
            }
            else {
                // This is an array that does not immediately have points.
                if (startChainCallback)
                    startChainCallback(data, false);
                for (const child of data) {
                    // tslint:disable-next-line: deprecation
                    numSegment += this.streamXYZXYZ(child, startChainCallback, segmentCallback, endChainCallback);
                }
                if (endChainCallback)
                    endChainCallback(data, false);
            }
        }
        else if (data instanceof IndexedXYZCollection_1.IndexedXYZCollection) {
            if (startChainCallback)
                startChainCallback(data, true);
            const q = Point3dArray._workPoint = Point3dVector3d_1.Point3d.create(0, 0, 0, Point3dArray._workPoint);
            for (let i = 0; i < data.length; i++) {
                data.getPoint3dAtCheckedPointIndex(i, q);
                if (i > 0) {
                    numSegment++;
                    segmentCallback(x0, y0, z0, q.x, q.y, q.z);
                }
                x0 = q.x;
                y0 = q.y;
                z0 = q.z;
            }
            if (endChainCallback)
                endChainCallback(data, true);
        }
        return numSegment;
    }
    /** Computes the hull of the XY projection of points.
     * * Returns the hull as an array of Point3d
     * * Optionally returns non-hull points in `insidePoints[]`
     * * If both arrays empty if less than 3 points.
     * *
     */
    static computeConvexHullXY(points, hullPoints, insidePoints, addClosurePoint = false) {
        hullPoints.length = 0;
        insidePoints.length = 0;
        let n = points.length;
        // Get deep copy
        const xy1 = points.slice(0, n);
        xy1.sort(Geometry_1.Geometry.lexicalXYLessThan);
        if (n < 3) {
            for (const p of xy1)
                hullPoints.push(p);
            if (addClosurePoint && xy1.length > 0)
                hullPoints.push(xy1[0]);
            return;
        }
        hullPoints.push(xy1[0]); // This is sure to stay
        hullPoints.push(xy1[1]); // This one can be removed in loop.
        let numInside = 0;
        // First sweep creates upper hull
        for (let i = 2; i < n; i++) {
            const candidate = xy1[i];
            let top = hullPoints.length - 1;
            while (top >= 1 && hullPoints[top - 1].crossProductToPointsXY(hullPoints[top], candidate) <= 0.0) {
                xy1[numInside++] = hullPoints[top];
                top--;
                hullPoints.pop();
            }
            hullPoints.push(candidate);
        }
        const i0 = hullPoints.length - 1;
        xy1.length = numInside;
        xy1.push(hullPoints[0]); // force first point to be reconsidered as final hull point.
        xy1.sort(Geometry_1.Geometry.lexicalXYLessThan);
        n = xy1.length;
        // xy1.back () is already on stack.
        hullPoints.push(xy1[n - 1]);
        for (let i = n - 1; i-- > 0;) {
            const candidate = xy1[i];
            let top = hullPoints.length - 1;
            while (top > i0 && hullPoints[top - 1].crossProductToPointsXY(hullPoints[top], candidate) <= 0.0) {
                insidePoints.push(hullPoints[top]);
                top--;
                hullPoints.pop();
            }
            if (i > 0) // don't replicate start !!!
                hullPoints.push(candidate);
        }
        if (addClosurePoint)
            hullPoints.push(hullPoints[0]);
    }
    /**
     * Return (clones of) points in data[] with min and max x and y parts.
     * @param data array to examine.
     */
    static minMaxPoints(data) {
        if (data.length === 0)
            return undefined;
        const result = { minXPoint: data[0].clone(), maxXPoint: data[0].clone(), minYPoint: data[0].clone(), maxYPoint: data[0].clone() };
        let q;
        for (let i = 1; i < data.length; i++) {
            q = data[i];
            if (q.x < result.minXPoint.x)
                result.minXPoint.setFromPoint3d(q);
            if (q.x > result.maxXPoint.x)
                result.maxXPoint.setFromPoint3d(q);
            if (q.y < result.minYPoint.y)
                result.minYPoint.setFromPoint3d(q);
            if (q.y > result.maxYPoint.y)
                result.maxYPoint.setFromPoint3d(q);
        }
        return result;
    }
}
exports.Point3dArray = Point3dArray;
Point3dArray._weightUVW = new Float64Array(8);
Point3dArray._weightDU = new Float64Array(8);
Point3dArray._weightDV = new Float64Array(8);
Point3dArray._weightDW = new Float64Array(8);
//# sourceMappingURL=PointHelpers.js.map