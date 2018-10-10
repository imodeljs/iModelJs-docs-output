"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty */
const Geometry_1 = require("./Geometry");
const PointVector_1 = require("./PointVector");
const Geometry4d_1 = require("./numerics/Geometry4d");
const AnalyticGeometry_1 = require("./AnalyticGeometry");
const IndexedXYZCollection_1 = require("./IndexedXYZCollection");
class NumberArray {
    /** return the sum of values in an array,   The summation is done with correction terms which
     * improves last-bit numeric accuracy.
     */
    static PreciseSum(data) {
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
        return (!dataA && !dataB);
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
        return (!dataA && !dataB);
    }
    /** return the sum of numbers in an array.  Note that "PreciseSum" may be more accurate. */
    static sum(data) {
        let sum = 0;
        for (const x of data) {
            sum += x;
        }
        return sum;
    }
    static isCoordinateInArray(x, data) {
        if (data) {
            for (const y of data) {
                if (Geometry_1.Geometry.isSameCoordinate(x, y))
                    return true;
            }
        }
        return false;
    }
    static MaxAbsArray(values) {
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
    static MaxAbsTwo(a1, a2) {
        a1 = Math.abs(a1);
        a2 = Math.abs(a2);
        return (a1 > a2) ? a1 : a2;
    }
    static maxAbsDiff(dataA, dataB) {
        let a = 0.0;
        const n = Math.min(dataA.length, dataB.length);
        for (let i = 0; i < n; i++) {
            a = Math.max(a, Math.abs(dataA[i] - dataB[i]));
        }
        return a;
    }
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
class Point2dArray {
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
        return (!dataA && !dataB);
    }
    /**
     * @returns return an array containing clones of the Point3d data[]
     * @param data source data
     */
    static clonePoint2dArray(data) {
        return data.map((p) => p.clone());
    }
    static lengthWithoutWraparound(data) {
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
class Vector3dArray {
    static isAlmostEqual(dataA, dataB) {
        if (dataA && dataB) {
            if (dataA.length !== dataB.length)
                return false;
            for (let i = 0; i < dataA.length; i++)
                if (!dataA[i].isAlmostEqual(dataB[i]))
                    return false;
            return true;
        }
        return (!dataA && !dataB);
    }
    /**
     * @returns return an array containing clones of the Vector3d data[]
     * @param data source data
     */
    static cloneVector3dArray(data) {
        return data.map((p) => PointVector_1.Vector3d.create(p.x, p.y, p.z));
    }
}
exports.Vector3dArray = Vector3dArray;
class Point4dArray {
    /** pack each point and its corresponding weight into a buffer of xyzwxyzw... */
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
    /** unpack from xyzwxyzw... to array of Point4d */
    static unpackToPoint4dArray(data) {
        const result = [];
        for (let i = 0; i + 3 < data.length; i += 4) {
            result.push(Geometry4d_1.Point4d.create(data[i], data[i + 1], data[i + 2], data[i + 3]));
        }
        return result;
    }
    /** unpack from xyzwxyzw... array to array of Point3d and array of weight.
     */
    static unpackFloat64ArrayToPointsAndWeights(data, points, weights, pointFormatter = PointVector_1.Point3d.create) {
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
        return (!dataA && !dataB);
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
Point4dArray._workPoint4d = Geometry4d_1.Point4d.create();
exports.Point4dArray = Point4dArray;
class Point3dArray {
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
    static unpackNumbersToPoint3dArray(data) {
        const result = [];
        for (let i = 0; i + 2 < data.length; i += 3) {
            result.push(PointVector_1.Point3d.create(data[i], data[i + 1], data[i + 2]));
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
    static multiplyInPlace(transform, xyz) {
        const xyz1 = PointVector_1.Point3d.create();
        const numXYZ = xyz.length;
        for (let i = 0; i + 2 < numXYZ; i += 3) {
            transform.multiplyXYZ(xyz[i], xyz[i + 1], xyz[i + 2], xyz1);
            xyz[i] = xyz1.x;
            xyz[i + 1] = xyz1.y;
            xyz[i + 2] = xyz1.z;
        }
    }
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
        return (!dataA && !dataB);
    }
    /** return simple average of all coordinates.   (000 if empty array) */
    static centroid(points, result) {
        result = PointVector_1.Point3d.create(0, 0, 0, result);
        const p = PointVector_1.Point3d.create();
        if (points.length > 0) {
            for (let i = 0; i < points.length; i++) {
                points.atPoint3dIndex(i, p);
                result.x += p.x;
                result.y += p.y;
                result.z += p.z;
            }
            result.scaleInPlace(1.0 / points.length);
        }
        return result;
    }
    /** Return the index of the point most distant from spacePoint */
    static vectorToMostDistantPoint(points, spacePoint, farVector) {
        if (points.length === 0)
            return -1;
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
    static vectorToPointWithMaxCrossProductMangitude(points, spacePoint, vector, farVector) {
        if (points.length === 0)
            return -1;
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
    static sumLengths(data) {
        let sum = 0.0;
        if (Array.isArray(data)) {
            const n = data.length - 1;
            for (let i = 0; i < n; i++)
                sum += data[i].distance(data[i + 1]);
        }
        else if (data instanceof Float64Array) {
            const numXYZ = data.length;
            for (let i = 0; i + 5 < numXYZ; i += 3) {
                sum += Math.hypot(data[i + 3] - data[i], data[i + 4] - data[i + 1], data[i + 5] - data[i + 2]);
            }
        }
        return sum;
    }
    /**
     * @returns return an array containing clones of the Point3d data[]
     * @param data source data
     */
    static clonePoint3dArray(data) {
        return data.map((p) => PointVector_1.Point3d.create(p.x, p.y, p.z));
    }
    /**
     * @returns return an array containing Point2d with xy parts of each Point3d
     * @param data source data
     */
    static clonePoint2dArray(data) {
        return data.map((p) => PointVector_1.Point2d.create(p.x, p.y));
    }
}
exports.Point3dArray = Point3dArray;
/** Static class for operations that treat an array of points as a polygon (with area!) */
class PolygonOps {
    /** Sum areas of triangles from points[0] to each far edge.
    * * Consider triangles from points[0] to each edge.
    * * Sum the areas(absolute, without regard to orientation) all these triangles.
    * @returns sum of absolute triangle areas.
    */
    static sumTriangleAreas(points) {
        let s = 0.0;
        const n = points.length;
        if (n >= 3) {
            const origin = points[0];
            const vector0 = origin.vectorTo(points[1]);
            let vector1 = PointVector_1.Vector3d.create();
            // This will work with or without closure edge.  If closure is given, the last vector is 000.
            for (let i = 2; i < n; i++) {
                vector1 = origin.vectorTo(points[i], vector1);
                s += vector0.crossProductMagnitude(vector1);
                vector0.setFrom(vector1);
            }
        }
        s *= 0.5;
        // console.log ("polygon area ", s, points);
        return s;
    }
    /** Sum areas of triangles from points[0] to each far edge.
    * * Consider triangles from points[0] to each edge.
    * * Sum the areas(absolute, without regard to orientation) all these triangles.
    * @returns sum of absolute triangle areas.
    */
    static sumTriangleAreasXY(points) {
        let s = 0.0;
        const n = points.length;
        if (n >= 3) {
            const origin = points[0];
            const vector0 = origin.vectorTo(points[1]);
            let vector1 = PointVector_1.Vector3d.create();
            // This will work with or without closure edge.  If closure is given, the last vector is 000.
            for (let i = 2; i < n; i++) {
                vector1 = origin.vectorTo(points[i], vector1);
                s += vector0.crossProductXY(vector1);
                vector0.setFrom(vector1);
            }
        }
        s *= 0.5;
        // console.log ("polygon area ", s, points);
        return s;
    }
    /** return a vector which is perpendicular to the polygon and has magnitude equal to the polygon area. */
    static areaNormalGo(points, result) {
        if (!result)
            result = new PointVector_1.Vector3d();
        const n = points.length;
        if (n === 3) {
            points.crossProductIndexIndexIndex(0, 1, 2, result);
        }
        else if (n >= 3) {
            result.setZero();
            // This will work with or without closure edge.  If closure is given, the last vector is 000.
            for (let i = 2; i < n; i++) {
                points.accumulateCrossProductIndexIndexIndex(0, i - 1, i, result);
            }
        }
        // ALL BRANCHES SUM FULL CROSS PRODUCTS AND EXPECT SCALE HERE
        result.scaleInPlace(0.5);
        return result;
    }
    static areaNormal(points, result) {
        if (!result)
            result = PointVector_1.Vector3d.create();
        PolygonOps.areaNormalGo(new Point3dArrayCarrier(points), result);
        return result;
    }
    /** return the area of the polygon (assuming planar) */
    static area(points) {
        return PolygonOps.areaNormal(points).magnitude();
    }
    /** return the projected XY area of the polygon (assuming planar) */
    static areaXY(points) {
        let area = 0.0;
        for (let i = 1; i + 1 < points.length; i++)
            area += points[0].crossProductToPointsXY(points[i], points[i + 1]);
        return 0.5 * area;
    }
    static centroidAreaNormal(points) {
        const n = points.length;
        if (n === 3) {
            const normal = points[0].crossProductToPoints(points[1], points[2]);
            const a = 0.5 * normal.magnitude();
            const result = AnalyticGeometry_1.Ray3d.createCapture(Point3dArray.centroid(new Point3dArrayCarrier(points)), normal);
            if (result.tryNormalizeInPlaceWithAreaWeight(a))
                return result;
            return undefined;
        }
        if (n >= 3) {
            const origin = points[0];
            const vector0 = origin.vectorTo(points[1]);
            let vector1 = PointVector_1.Vector3d.create();
            let cross = PointVector_1.Vector3d.create();
            const centroidSum = PointVector_1.Vector3d.createZero();
            const normalSum = PointVector_1.Vector3d.createZero();
            // This will work with or without closure edge.  If closure is given, the last vector is 000.
            for (let i = 2; i < n; i++) {
                vector1 = origin.vectorTo(points[i], vector1);
                cross = vector0.crossProduct(vector1, cross);
                normalSum.addInPlace(cross); // this grows to twice the area
                const b = cross.magnitude() / 6.0;
                centroidSum.plus2Scaled(vector0, b, vector1, b, centroidSum);
                vector0.setFrom(vector1);
            }
            const area = 0.5 * normalSum.magnitude();
            const inverseArea = Geometry_1.Geometry.conditionalDivideFraction(1, area);
            if (inverseArea !== undefined) {
                const result = AnalyticGeometry_1.Ray3d.createCapture(origin.plusScaled(centroidSum, inverseArea, origin), normalSum);
                result.tryNormalizeInPlaceWithAreaWeight(area);
                return result;
            }
        }
        return undefined;
    }
    // Has the potential to be combined with centroidAreaNormal for point3d array and Ray3d return listed above...
    // Returns undefined if given point array less than 3 or if not safe to divide at any point
    static centroidAndArea(points, centroid) {
        let area = 0.0;
        centroid.set(0, 0);
        if (points.length < 3)
            return undefined;
        const origin = points[0];
        let vectorSum = PointVector_1.Vector2d.create(0, 0); // == sum ((U+V)/3) * (U CROSS V)/2 -- but leave out divisions
        let areaSum = 0.0; // == sum (U CROSS V) / 2 -- but leave out divisions
        for (let i = 1; i + 1 < points.length; i++) {
            const vector0 = origin.vectorTo(points[i]);
            const vector1 = origin.vectorTo(points[i + 1]);
            const tempArea = vector0.crossProduct(vector1);
            vectorSum = vectorSum.plus(vector0.plus(vector1).scale(tempArea));
            areaSum += tempArea;
        }
        area = areaSum * 0.5;
        const a = Geometry_1.Geometry.conditionalDivideFraction(1.0, 6.0 * area);
        if (a === undefined) {
            centroid.setFrom(origin);
            return undefined;
        }
        centroid.setFrom(origin.plusScaled(vectorSum, a));
        return area;
    }
    /**
     *
     * @param points array of points around the polygon.  This is assumed to NOT have closure edge.
     * @param result caller-allocated result vector.
     */
    static unitNormal(points, result) {
        const n = points.length;
        if (n === 3) {
            points.crossProductIndexIndexIndex(0, 1, 2, result);
            return result.normalizeInPlace();
        }
        if (n === 4) {
            // cross product of diagonals is more stable than from single of the points . . .
            points.vectorIndexIndex(0, 2, PolygonOps._vector0);
            points.vectorIndexIndex(1, 3, PolygonOps._vector1);
            PolygonOps._vector0.crossProduct(PolygonOps._vector1, result);
            return result.normalizeInPlace();
        }
        // more than 4 points  ... no shortcuts ...
        PolygonOps.areaNormalGo(points, result);
        return result.normalizeInPlace();
    }
    /** Return the matrix of area products of a polygon with respect to an origin.
     * The polygon is assumed to be planar and non-self-intersecting.
     */
    static addSecondMomentAreaProducts(points, origin, moments) {
        const unitNormal = PolygonOps._normal;
        if (PolygonOps.unitNormal(points, unitNormal)) {
            // The direction of the normal makes the various detJ values positive or negative so that non-convex polygons
            // sum correctly.
            const vector01 = PolygonOps._vector0;
            const vector02 = PolygonOps._vector1;
            const placement = PolygonOps._matrixA;
            const matrixAB = PolygonOps._matrixB;
            const matrixABC = PolygonOps._matrixC;
            const vectorOrigin = points.vectorXYAndZIndex(origin, 0, PolygonOps._vectorOrigin);
            const numPoints = points.length;
            let detJ = 0;
            for (let i2 = 2; i2 < numPoints; i2++) {
                points.vectorIndexIndex(0, i2 - 1, vector01);
                points.vectorIndexIndex(0, i2, vector02);
                detJ = unitNormal.tripleProduct(vector01, vector02);
                placement.setOriginAndVectors(vectorOrigin, vector01, vector02, unitNormal);
                placement.multiplyMatrixMatrix(PolygonOps._triangleMomentWeights, matrixAB);
                matrixAB.multiplyMatrixMatrixTranspose(placement, matrixABC);
                moments.addScaledInPlace(matrixABC, detJ);
            }
        }
    }
    /** Test the direction of turn at the vertices of the polygon, ignoring z-coordinates.
     *
     * *  For a polygon without self intersections, this is a convexity and orientation test: all positive is convex and counterclockwise,
     * all negative is convex and clockwise
     * *  Beware that a polygon which turns through more than a full turn can cross itself and close, but is not convex
     * *  Returns 1 if all turns are to the left, -1 if all to the right, and 0 if there are any zero turns
     */
    static testXYPolygonTurningDirections(pPointArray) {
        // Reduce count by trailing duplicates; leaves iLast at final index
        let numPoint = pPointArray.length;
        let iLast = numPoint - 1;
        while (iLast > 1 && pPointArray[iLast].x === pPointArray[0].x && pPointArray[iLast].y === pPointArray[0].y) {
            numPoint = iLast--;
        }
        if (numPoint > 2) {
            let vector0 = PointVector_1.Point2d.create(pPointArray[iLast].x - pPointArray[iLast - 1].x, pPointArray[iLast].y - pPointArray[iLast - 1].y);
            const vector1 = PointVector_1.Point2d.create(pPointArray[0].x - pPointArray[iLast].x, pPointArray[0].y - pPointArray[iLast].y);
            const baseArea = vector0.x * vector1.y - vector0.y * vector1.x;
            // In a convex polygon, all successive-vector cross products will
            // have the same sign as the base area, hence all products will be
            // positive.
            for (let i1 = 1; i1 < numPoint; i1++) {
                vector0 = vector1.clone();
                PointVector_1.Point2d.create(pPointArray[i1].x - pPointArray[i1 - 1].x, pPointArray[i1].y - pPointArray[i1 - 1].y, vector1);
                const currArea = vector0.x * vector1.y - vector0.y * vector1.x;
                if (currArea * baseArea <= 0.0)
                    return 0;
            }
            // Fall out with all signs same as base area
            return baseArea > 0.0 ? 1 : -1;
        }
        return 0;
    }
    /**
     * Classify a point with respect to a polygon.
     * Returns 1 if point is "in" by parity, 0 if "on", -1 if "out", -2 if nothing worked.
     */
    static parity(pPoint, pPointArray, tol = 0.0) {
        let parity;
        const x = pPoint.x;
        const y = pPoint.y;
        const numPoint = pPointArray.length;
        if (numPoint < 2)
            return (Math.abs(x - pPointArray[0].x) <= tol && Math.abs(y - pPointArray[0].y) <= tol) ? 0 : -1;
        // Try really easy ways first...
        parity = PolygonOps.parityYTest(pPoint, pPointArray, tol);
        if (parity !== undefined)
            return parity;
        parity = PolygonOps.parityXTest(pPoint, pPointArray, tol);
        if (parity !== undefined)
            return parity;
        // Is test point within tol of one of the polygon points in x and y?
        for (let i = 0; i < numPoint; i++)
            if (Math.abs(x - pPointArray[i].x) <= tol && Math.abs(y - pPointArray[i].y) <= tol)
                return 0;
        // Nothing easy worked. Try some ray casts
        const maxTheta = 10.0;
        let theta = 0.276234342921378;
        const dTheta = theta;
        while (theta < maxTheta) {
            parity = PolygonOps.parityVectorTest(pPoint, theta, pPointArray, tol);
            if (parity !== undefined)
                return parity;
            theta += dTheta;
        }
        return -2;
    }
    /**
     * Classify a point with respect to a polygon defined by the xy parts of the points, using only the y
     * coordinate for the tests.
     *
     * *  Return undefined (failure, could not determine answer) if any polygon point has the same y-coord as test point
     * *  Goal is to execute the simplest cases as fast as possible, and fail promptly for others
     */
    static parityYTest(pPoint, pPointArray, tol) {
        // Var names h, crossing to allow closest code correspondence between x,y code
        const numPoint = pPointArray.length;
        const crossing0 = pPoint.x;
        const h = pPoint.y;
        let h0 = h - pPointArray[numPoint - 1].y;
        let h1;
        let crossing;
        let s;
        let numLeft = 0;
        if (Math.abs(h0) <= tol)
            return undefined;
        let i0;
        for (let i = 0; i < numPoint; i++, h0 = h1) { // <-- h0 won't be assigned to h1 until after first iteration
            h1 = h - pPointArray[i].y;
            if (Math.abs(h1) <= tol)
                return undefined;
            if (h0 * h1 < 0.0) {
                s = -h0 / (h1 - h0);
                i0 = i - 1;
                if (i0 < 0)
                    i0 = numPoint - 1;
                crossing = pPointArray[i0].x + s * (pPointArray[i].x - pPointArray[i0].x);
                if (Math.abs(crossing - crossing0) <= tol)
                    return 0;
                else if (crossing < crossing0)
                    numLeft++;
            }
        }
        return (numLeft & 0x01) ? 1 : -1;
    }
    /**
     * Classify a point with respect to a polygon defined by the xy parts of the points, using only the x
     * coordinate for the tests.
     *
     * *  Return undefined (failure, could not determine answer) if any polygon point has the same x coordinate as the test point
     * *  Goal is to execute the simplest cases as fast as possible, and fail promptly for others
     */
    static parityXTest(pPoint, pPointArray, tol) {
        // Var names h, crossing to allow closest code correspondence between x,y code
        const numPoint = pPointArray.length;
        const crossing0 = pPoint.y;
        const h = pPoint.x;
        let h0 = h - pPointArray[numPoint - 1].x;
        let h1;
        let crossing;
        let s;
        let numLeft = 0;
        if (Math.abs(h0) <= tol)
            return undefined;
        let i0;
        for (let i = 0; i < numPoint; i++, h0 = h1) { // <-- h0 won't be assigned to h1 until after first iteration
            h1 = h - pPointArray[i].x;
            if (Math.abs(h1) <= tol)
                return undefined;
            if (h0 * h1 < 0.0) {
                s = -h0 / (h1 - h0);
                i0 = i - 1;
                if (i0 < 0)
                    i0 = numPoint - 1;
                crossing = pPointArray[i0].y + s * (pPointArray[i].y - pPointArray[i0].y);
                if (Math.abs(crossing - crossing0) <= tol)
                    return 0;
                else if (crossing < crossing0)
                    numLeft++;
            }
        }
        return (numLeft & 0x01) ? 1 : -1;
    }
    /**
     * Classify a point with respect to a polygon defined by the xy parts of the points, using a given ray cast
     * direction.
     *
     * *  Return false (failure, could not determine answer) if any polygon point is on the ray
     */
    static parityVectorTest(pPoint, theta, pPointArray, tol) {
        const numPoint = pPointArray.length;
        let v1;
        let u0;
        let u1;
        let u;
        let s;
        let numLeft = 0;
        const tangent = PointVector_1.Vector2d.create(Math.cos(theta), Math.sin(theta));
        const normal = PointVector_1.Vector2d.create(-tangent.y, tangent.x);
        let v0 = normal.dotProductStartEnd(pPoint, pPointArray[numPoint - 1]);
        if (Math.abs(v0) <= tol)
            return undefined;
        let i0;
        for (let i = 0; i < numPoint; i++, v0 = v1) { // <-- v0 won't be assigned to v1 until after first iteration
            v1 = normal.dotProductStartEnd(pPoint, pPointArray[i]);
            if (Math.abs(v1) <= tol)
                return undefined;
            if (v0 * v1 < 0.0) {
                s = -v0 / (v1 - v0);
                i0 = i - 1;
                if (i0 < 0)
                    i0 = numPoint - 1;
                u0 = tangent.dotProductStartEnd(pPoint, pPointArray[i0]);
                u1 = tangent.dotProductStartEnd(pPoint, pPointArray[i]);
                u = u0 + s * (u1 - u0);
                if (Math.abs(u) <= tol)
                    return 0;
                else if (u < 0.0)
                    numLeft++;
            }
        }
        return (numLeft & 0x01) ? 1 : -1;
    }
}
/** These values are the integrated area moment products [xx,xy,xz, x]
 * for a right triangle in the first quadrant at the origin -- (0,0),(1,0),(0,1)
 */
PolygonOps._triangleMomentWeights = Geometry4d_1.Matrix4d.createRowValues(2.0 / 24.0, 1.0 / 24.0, 0, 4.0 / 24.0, 1.0 / 24.0, 2.0 / 24.0, 0, 4.0 / 24.0, 0, 0, 0, 0, 4.0 / 24.0, 4.0 / 24.0, 0, 12.0 / 24.0);
// statics for shared reuse.
// many methods use these.
// only use them in "leaf" methods that are certain not to call other users . . .
PolygonOps._vector0 = PointVector_1.Vector3d.create();
PolygonOps._vector1 = PointVector_1.Vector3d.create();
PolygonOps._vectorOrigin = PointVector_1.Vector3d.create();
PolygonOps._normal = PointVector_1.Vector3d.create();
PolygonOps._matrixA = Geometry4d_1.Matrix4d.createIdentity();
PolygonOps._matrixB = Geometry4d_1.Matrix4d.createIdentity();
PolygonOps._matrixC = Geometry4d_1.Matrix4d.createIdentity();
exports.PolygonOps = PolygonOps;
/**
 * Helper object to access members of a Point3d[] in geometric calculations.
 * * The collection holds only a reference to the actual array.
 * * The actual array may be replaced by the user as needed.
 * * When replaced, there is no cached data to be updated.
*/
class Point3dArrayCarrier extends IndexedXYZCollection_1.IndexedXYZCollection {
    /** CAPTURE caller supplied array ... */
    constructor(data) {
        super();
        this.data = data;
    }
    isValidIndex(index) {
        return index >= 0 && index < this.data.length;
    }
    /**
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    atPoint3dIndex(index, result) {
        if (this.isValidIndex(index)) {
            const source = this.data[index];
            return PointVector_1.Point3d.create(source.x, source.y, source.z, result);
        }
        return undefined;
    }
    /**
     * @param index index of point within the array
     * @param result caller-allocated destination
     * @returns undefined if the index is out of bounds
     */
    atVector3dIndex(index, result) {
        if (this.isValidIndex(index)) {
            const source = this.data[index];
            return PointVector_1.Vector3d.create(source.x, source.y, source.z, result);
        }
        return undefined;
    }
    /**
     * @param indexA index of point within the array
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    vectorIndexIndex(indexA, indexB, result) {
        if (this.isValidIndex(indexA) && this.isValidIndex(indexB))
            return PointVector_1.Vector3d.createStartEnd(this.data[indexA], this.data[indexB], result);
        return undefined;
    }
    /**
     * @param origin origin for vector
     * @param indexB index of point within the array
     * @param result caller-allocated vector.
     * @returns undefined if index is out of bounds
     */
    vectorXYAndZIndex(origin, indexB, result) {
        if (this.isValidIndex(indexB))
            return PointVector_1.Vector3d.createStartEnd(origin, this.data[indexB], result);
        return undefined;
    }
    /**
     * @param origin origin for vector
     * @param indexA index of first target within the array
     * @param indexB index of second target within the array
     * @param result caller-allocated vector.
     * @returns undefined if either index is out of bounds
     */
    crossProductXYAndZIndexIndex(origin, indexA, indexB, result) {
        if (this.isValidIndex(indexA) && this.isValidIndex(indexB))
            return PointVector_1.Vector3d.createCrossProductToPoints(origin, this.data[indexA], this.data[indexB], result);
        return undefined;
    }
    /**
   * @param originIndex index of origin
   * @param indexA index of first target within the array
   * @param indexB index of second target within the array
   * @param result caller-allocated vector.
   * @returns return true if indexA, indexB both valid
   */
    crossProductIndexIndexIndex(originIndex, indexA, indexB, result) {
        if (this.isValidIndex(originIndex) && this.isValidIndex(indexA) && this.isValidIndex(indexB))
            return PointVector_1.Vector3d.createCrossProductToPoints(this.data[originIndex], this.data[indexA], this.data[indexB], result);
        return undefined;
    }
    /**
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
     * read-only property for number of XYZ in the collection.
     */
    get length() {
        return this.data.length;
    }
}
exports.Point3dArrayCarrier = Point3dArrayCarrier;
//# sourceMappingURL=PointHelpers.js.map