"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Geometry_1 = require("../Geometry");
const Point2dVector2d_1 = require("./Point2dVector2d");
const Point3dVector3d_1 = require("./Point3dVector3d");
const Matrix4d_1 = require("../geometry4d/Matrix4d");
const Ray3d_1 = require("./Ray3d");
const IndexedXYZCollection_1 = require("./IndexedXYZCollection");
const Point3dArrayCarrier_1 = require("./Point3dArrayCarrier");
const XYParitySearchContext_1 = require("../topology/XYParitySearchContext");
const GrowableXYZArray_1 = require("./GrowableXYZArray");
const Range_1 = require("./Range");
const Point4d_1 = require("../geometry4d/Point4d");
/** Static class for operations that treat an array of points as a polygon (with area!) */
/**
 * Various (static method) computations for arrays of points interpreted as a polygon.
 * @public
 */
class PolygonOps {
    /** Sum areas of triangles from points[0] to each far edge.
     * * Consider triangles from points[0] to each edge.
     * * Sum the areas(absolute, without regard to orientation) all these triangles.
     * @returns sum of absolute triangle areas.
     */
    static sumTriangleAreas(points) {
        let s = 0;
        const n = points.length;
        if (Array.isArray(points)) {
            if (n >= 3) {
                const origin = points[0];
                const vector0 = origin.vectorTo(points[1]);
                let vector1 = Point3dVector3d_1.Vector3d.create();
                // This will work with or without closure edge.  If closure is given, the last vector is 000.
                for (let i = 2; i < n; i++) {
                    vector1 = origin.vectorTo(points[i], vector1);
                    s += vector0.crossProductMagnitude(vector1);
                    vector0.setFrom(vector1);
                }
            }
            return s * 0.5;
        }
        const crossVector = Point3dVector3d_1.Vector3d.create();
        for (let i = 2; i < n; i++) {
            points.crossProductIndexIndexIndex(0, i - 1, i, crossVector);
            s += crossVector.magnitude();
        }
        return s * 0.5;
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
            let vector1 = Point3dVector3d_1.Vector3d.create();
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
            result = new Point3dVector3d_1.Vector3d();
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
    /** return a vector which is perpendicular to the polygon and has magnitude equal to the polygon area. */
    static areaNormal(points, result) {
        if (!result)
            result = Point3dVector3d_1.Vector3d.create();
        PolygonOps.areaNormalGo(new Point3dArrayCarrier_1.Point3dArrayCarrier(points), result);
        return result;
    }
    /** return the area of the polygon.
     * * This assumes the polygon is planar
     * * This does NOT assume the polygon is on the xy plane.
     */
    static area(points) {
        return PolygonOps.areaNormal(points).magnitude();
    }
    /** return the projected XY area of the polygon. */
    static areaXY(points) {
        let area = 0.0;
        if (points instanceof IndexedXYZCollection_1.IndexedXYZCollection) {
            if (points.length > 2) {
                const x0 = points.getXAtUncheckedPointIndex(0);
                const y0 = points.getYAtUncheckedPointIndex(0);
                let u1 = points.getXAtUncheckedPointIndex(1) - x0;
                let v1 = points.getYAtUncheckedPointIndex(1) - y0;
                let u2, v2;
                for (let i = 1; i + 1 < points.length; i++, u1 = u2, v1 = v2) {
                    u2 = points.getXAtUncheckedPointIndex(i) - x0;
                    v2 = points.getYAtUncheckedPointIndex(i) - y0;
                    area += Geometry_1.Geometry.crossProductXYXY(u1, v1, u2, v2);
                }
            }
        }
        else {
            for (let i = 1; i + 1 < points.length; i++)
                area += points[0].crossProductToPointsXY(points[i], points[i + 1]);
        }
        return 0.5 * area;
    }
    /**
     * Return a Ray3d with (assuming the polygon is planar and not self-intersecting)
     * * origin at the centroid of the (3D) polygon
     * * normal is a unit vector perpendicular to the plane
     * * 'a' member is the area.
     * @param points
     */
    static centroidAreaNormal(points) {
        if (Array.isArray(points)) {
            const carrier = new Point3dArrayCarrier_1.Point3dArrayCarrier(points);
            return this.centroidAreaNormal(carrier);
        }
        else if (points instanceof IndexedXYZCollection_1.IndexedXYZCollection) {
            return this.centroidAreaNormalGo(points);
        }
        return undefined;
    }
    /**
     * Return a Ray3d with (assuming the polygon is planar and not self-intersecting)
     * * origin at the centroid of the (3D) polygon
     * * normal is a unit vector perpendicular to the plane
     * * 'a' member is the area.
     * @param points
     */
    static centroidAreaNormalGo(points) {
        if (Array.isArray(points)) {
            const carrier = new Point3dArrayCarrier_1.Point3dArrayCarrier(points);
            return this.centroidAreaNormal(carrier);
        }
        const n = points.length;
        if (n === 3) {
            const normal = points.crossProductIndexIndexIndex(0, 1, 2);
            const a = 0.5 * normal.magnitude();
            const centroid = points.getPoint3dAtCheckedPointIndex(0);
            points.accumulateScaledXYZ(1, 1.0, centroid);
            points.accumulateScaledXYZ(2, 1.0, centroid);
            centroid.scaleInPlace(1.0 / 3.0);
            const result = Ray3d_1.Ray3d.createCapture(centroid, normal);
            if (result.tryNormalizeInPlaceWithAreaWeight(a))
                return result;
            return undefined;
        }
        if (n >= 3) {
            const areaNormal = Point3dVector3d_1.Vector3d.createZero();
            // This will work with or without closure edge.  If closure is given, the last vector is 000.
            for (let i = 2; i < n; i++) {
                points.accumulateCrossProductIndexIndexIndex(0, i - 1, i, areaNormal);
            }
            areaNormal.normalizeInPlace();
            const origin = points.getPoint3dAtCheckedPointIndex(0);
            const vector0 = Point3dVector3d_1.Vector3d.create();
            const vector1 = Point3dVector3d_1.Vector3d.create();
            points.vectorXYAndZIndex(origin, 1, vector0);
            let cross = Point3dVector3d_1.Vector3d.create();
            const centroidSum = Point3dVector3d_1.Vector3d.createZero();
            const normalSum = Point3dVector3d_1.Vector3d.createZero();
            let signedTriangleArea;
            // This will work with or without closure edge.  If closure is given, the last vector is 000.
            for (let i = 2; i < n; i++) {
                points.vectorXYAndZIndex(origin, i, vector1);
                cross = vector0.crossProduct(vector1, cross);
                signedTriangleArea = areaNormal.dotProduct(cross); // well, actually twice the area.
                normalSum.addInPlace(cross); // this grows to twice the area
                const b = signedTriangleArea / 6.0;
                centroidSum.plus2Scaled(vector0, b, vector1, b, centroidSum);
                vector0.setFrom(vector1);
            }
            const area = 0.5 * normalSum.magnitude();
            const inverseArea = Geometry_1.Geometry.conditionalDivideFraction(1, area);
            if (inverseArea !== undefined) {
                const result = Ray3d_1.Ray3d.createCapture(origin.plusScaled(centroidSum, inverseArea), normalSum);
                result.tryNormalizeInPlaceWithAreaWeight(area);
                return result;
            }
        }
        return undefined;
    }
    // Has the potential to be combined with centroidAreaNormal for point3d array and Ray3d return listed above...
    // Returns undefined if given point array less than 3 or if not safe to divide at any point
    /**
     * * Return (in caller-allocated centroid) the centroid of the xy polygon.
     * * Return (as function value)  the area
     */
    static centroidAndAreaXY(points, centroid) {
        let area = 0.0;
        centroid.set(0, 0);
        if (points.length < 3)
            return undefined;
        const origin = points[0];
        let vectorSum = Point2dVector2d_1.Vector2d.create(0, 0); // == sum ((U+V)/3) * (U CROSS V)/2 -- but leave out divisions
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
     * Return a unit normal to the plane of the polygon.
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
    /** Accumulate to the matrix of area products of a polygon with respect to an origin.
     * The polygon is assumed to be planar and non-self-intersecting.
     */
    /** Accumulate to the matrix of area products of a polygon with respect to an origin.
     * * The polygon is assumed to be planar and non-self-intersecting.
     * * Accumulated values are integrals over triangles from point 0 of the polygon to other edges of the polygon.
     * * Integral over each triangle is transformed to integrals from the given origin.
     * @param points array of points around the polygon.   Final closure point is not needed.
     * @param origin origin for global accumulation.
     * @param moments 4x4 matrix where products are accumulated.
     */
    static addSecondMomentAreaProducts(points, origin, moments) {
        this.addSecondMomentTransformedProducts(PolygonOps._triangleMomentWeights, points, origin, 2, moments);
    }
    /** Accumulate to the matrix of volume products of a polygon with respect to an origin.
     * * The polygon is assumed to be planar and non-self-intersecting.
     * * Accumulated values are integrals over tetrahedra from the origin to triangles on the polygon.
     * @param points array of points around the polygon.   Final closure point is not needed.
     * @param origin origin for tetrahedra
     * @param moments 4x4 matrix where products are accumulated.
     */
    static addSecondMomentVolumeProducts(points, origin, moments) {
        this.addSecondMomentTransformedProducts(PolygonOps._tetrahedralMomentWeights, points, origin, 3, moments);
    }
    /** Return the matrix of area products of a polygon with respect to an origin.
     * The polygon is assumed to be planar and non-self-intersecting.
     * * `frameType===2` has xy vectors in the plane of the polygon, plus a unit normal z. (Used for area integrals)
     * * `frameType===3` has vectors from origin to 3 points in the triangle. (Used for volume integrals)
     */
    static addSecondMomentTransformedProducts(firstQuadrantMoments, points, origin, frameType, moments) {
        const unitNormal = PolygonOps._normal;
        if (PolygonOps.unitNormal(points, unitNormal)) {
            // The direction of the normal makes the various detJ values positive or negative so that non-convex polygons
            // sum correctly.
            const vector01 = PolygonOps._vector0;
            const vector02 = PolygonOps._vector1;
            const vector03 = PolygonOps._vector2;
            const placement = PolygonOps._matrixA;
            const matrixAB = PolygonOps._matrixB;
            const matrixABC = PolygonOps._matrixC;
            const vectorOrigin = points.vectorXYAndZIndex(origin, 0, PolygonOps._vectorOrigin);
            const numPoints = points.length;
            let detJ = 0;
            for (let i2 = 2; i2 < numPoints; i2++) {
                if (frameType === 2) {
                    points.vectorIndexIndex(0, i2 - 1, vector01);
                    points.vectorIndexIndex(0, i2, vector02);
                    detJ = unitNormal.tripleProduct(vector01, vector02);
                    placement.setOriginAndVectors(vectorOrigin, vector01, vector02, unitNormal);
                    placement.multiplyMatrixMatrix(firstQuadrantMoments, matrixAB);
                    matrixAB.multiplyMatrixMatrixTranspose(placement, matrixABC);
                    moments.addScaledInPlace(matrixABC, detJ);
                }
                else if (frameType === 3) {
                    points.vectorXYAndZIndex(origin, 0, vector01);
                    points.vectorXYAndZIndex(origin, i2 - 1, vector02);
                    points.vectorXYAndZIndex(origin, i2, vector03);
                    detJ = vector01.tripleProduct(vector02, vector03);
                    placement.setOriginAndVectors(origin, vector01, vector02, vector03);
                    placement.multiplyMatrixMatrix(firstQuadrantMoments, matrixAB);
                    matrixAB.multiplyMatrixMatrixTranspose(placement, matrixABC);
                    moments.addScaledInPlace(matrixABC, detJ);
                }
            }
        }
    }
    /** Test the direction of turn at the vertices of the polygon, ignoring z-coordinates.
     *
     * *  For a polygon without self intersections, this is a convexity and orientation test: all positive is convex and counterclockwise,
     * all negative is convex and clockwise
     * *  Beware that a polygon which turns through more than a full turn can cross itself and close, but is not convex
     * *  Returns 1 if all turns are to the left, -1 if all to the right, and 0 if there are any zero or reverse turns
     */
    static testXYPolygonTurningDirections(pPointArray) {
        // Reduce count by trailing duplicates; leaves iLast at final index
        let numPoint = pPointArray.length;
        let iLast = numPoint - 1;
        while (iLast > 1 && pPointArray[iLast].x === pPointArray[0].x && pPointArray[iLast].y === pPointArray[0].y) {
            numPoint = iLast--;
        }
        if (numPoint > 2) {
            let vector0 = Point2dVector2d_1.Point2d.create(pPointArray[iLast].x - pPointArray[iLast - 1].x, pPointArray[iLast].y - pPointArray[iLast - 1].y);
            const vector1 = Point2dVector2d_1.Point2d.create(pPointArray[0].x - pPointArray[iLast].x, pPointArray[0].y - pPointArray[iLast].y);
            const baseArea = vector0.x * vector1.y - vector0.y * vector1.x;
            // In a convex polygon, all successive-vector cross products will
            // have the same sign as the base area, hence all products will be
            // positive.
            for (let i1 = 1; i1 < numPoint; i1++) {
                vector0 = vector1.clone();
                Point2dVector2d_1.Point2d.create(pPointArray[i1].x - pPointArray[i1 - 1].x, pPointArray[i1].y - pPointArray[i1 - 1].y, vector1);
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
     * Test if point (x,y) is IN, OUT or ON a polygon.
     * @return (1) for in, (-1) for OUT, (0) for ON
     * @param x x coordinate
     * @param y y coordinate
     * @param points array of xy coordinates.
     */
    static classifyPointInPolygon(x, y, points) {
        const context = new XYParitySearchContext_1.XYParitySearchContext(x, y);
        let i0 = 0;
        const n = points.length;
        let i1;
        let iLast = -1;
        // walk to an acceptable start index ...
        for (i0 = 0; i0 < n; i0 = i1) {
            i1 = i0 + 1;
            if (i1 >= n)
                i1 = 0;
            if (context.tryStartEdge(points[i0].x, points[i0].y, points[i1].x, points[i1].y)) {
                iLast = i1;
                break;
            }
        }
        if (iLast < 0)
            return undefined;
        for (let i = 1; i <= n; i++) {
            i1 = iLast + i;
            if (i1 >= n)
                i1 -= n;
            if (!context.advance(points[i1].x, points[i1].y))
                return context.classifyCounts();
        }
        return context.classifyCounts();
    }
    /**
     * Test if point (x,y) is IN, OUT or ON a polygon.
     * @return (1) for in, (-1) for OUT, (0) for ON
     * @param x x coordinate
     * @param y y coordinate
     * @param points array of xy coordinates.
     */
    static classifyPointInPolygonXY(x, y, points) {
        const context = new XYParitySearchContext_1.XYParitySearchContext(x, y);
        let i0 = 0;
        const n = points.length;
        let i1;
        let iLast = -1;
        // walk to an acceptable start index ...
        for (i0 = 0; i0 < n; i0 = i1) {
            i1 = i0 + 1;
            if (i1 >= n)
                i1 = 0;
            if (context.tryStartEdge(points.getXAtUncheckedPointIndex(i0), points.getYAtUncheckedPointIndex(i0), points.getXAtUncheckedPointIndex(i1), points.getYAtUncheckedPointIndex(i1))) {
                iLast = i1;
                break;
            }
        }
        if (iLast < 0)
            return undefined;
        for (let i = 1; i <= n; i++) {
            i1 = iLast + i;
            if (i1 >= n)
                i1 -= n;
            if (!context.advance(points.getXAtUncheckedPointIndex(i1), points.getYAtUncheckedPointIndex(i1)))
                return context.classifyCounts();
        }
        return context.classifyCounts();
    }
    /**
     * Reverse loops as necessary to make them all have CCW orientation for given outward normal.
     * @param loops
     * @param outwardNormal
     * @return the number of loops reversed.
     */
    static orientLoopsCCWForOutwardNormalInPlace(loops, outwardNormal) {
        if (loops instanceof IndexedXYZCollection_1.IndexedXYZCollection)
            return this.orientLoopsCCWForOutwardNormalInPlace([loops], outwardNormal);
        const orientations = [];
        const unitNormal = Point3dVector3d_1.Vector3d.create();
        // orient individually ... (no hole analysis)
        let numReverse = 0;
        for (const loop of loops) {
            if (this.unitNormal(loop, unitNormal)) {
                const q = unitNormal.dotProduct(outwardNormal);
                orientations.push(q);
                if (q <= 0.0)
                    loop.reverseInPlace();
                numReverse++;
            }
            else {
                orientations.push(0.0);
            }
        }
        return numReverse;
    }
    /**
     * If reverse loops as necessary to make them all have CCW orientation for given outward normal.
     * * Return an array of arrays which capture the input pointers.
     * * In each first level array:
     *    * The first loop is an outer loop.
     *    * all subsequent loops are holes
     *    * The outer loop is CCW
     *    * The holes are CW.
     * @param loops multiple loops to sort and reverse.
     */
    static sortOuterAndHoleLoopsXY(loops) {
        const loopAndArea = [];
        for (const loop of loops) {
            SortablePolygon.pushLoop(loopAndArea, loop);
        }
        return SortablePolygon.assignParentsAndDepth(loopAndArea);
    }
}
exports.PolygonOps = PolygonOps;
/** These values are the integrated area moment products [xx,xy,xz, x]
 * for a right triangle in the first quadrant at the origin -- (0,0),(1,0),(0,1)
 */
PolygonOps._triangleMomentWeights = Matrix4d_1.Matrix4d.createRowValues(2.0 / 24.0, 1.0 / 24.0, 0, 4.0 / 24.0, 1.0 / 24.0, 2.0 / 24.0, 0, 4.0 / 24.0, 0, 0, 0, 0, 4.0 / 24.0, 4.0 / 24.0, 0, 12.0 / 24.0);
/** These values are the integrated volume moment products [xx,xy,xz, x, yx,yy,yz,y, zx,zy,zz,z,x,y,z,1]
 * for a tetrahedron in the first quadrant at the origin -- (0,00),(1,0,0),(0,1,0),(0,0,1)
 */
PolygonOps._tetrahedralMomentWeights = Matrix4d_1.Matrix4d.createRowValues(1.0 / 60.0, 1.0 / 120, 1.0 / 120, 1.0 / 24.0, 1.0 / 120, 1.0 / 60.0, 1.0 / 120, 1.0 / 24.0, 1.0 / 120, 1.0 / 120, 1.0 / 60.0, 1.0 / 24.0, 1.0 / 24.0, 1.0 / 24.0, 1.0 / 24.0, 1.0 / 6.0);
// statics for shared reuse.
// many methods use these.
// only use them in "leaf" methods that are certain not to call other users . . .
PolygonOps._vector0 = Point3dVector3d_1.Vector3d.create();
PolygonOps._vector1 = Point3dVector3d_1.Vector3d.create();
PolygonOps._vector2 = Point3dVector3d_1.Vector3d.create();
PolygonOps._vectorOrigin = Point3dVector3d_1.Vector3d.create();
PolygonOps._normal = Point3dVector3d_1.Vector3d.create();
PolygonOps._matrixA = Matrix4d_1.Matrix4d.createIdentity();
PolygonOps._matrixB = Matrix4d_1.Matrix4d.createIdentity();
PolygonOps._matrixC = Matrix4d_1.Matrix4d.createIdentity();
/**
 *  `IndexedXYZCollectionPolygonOps` class contains _static_ methods for typical operations on polygons carried as `IndexedXyZCollection`
 * @public
 */
class IndexedXYZCollectionPolygonOps {
    /**
     * Split a (convex) polygon into 2 parts based on altitude evaluations.
     * * POSITIVE ALTITUDE IS IN
     * @param plane any `PlaneAltitudeEvaluator` object that can evaluate `plane.altitude(xyz)` for distance from the plane.
     * @param xyz original polygon
     * @param xyzPositive array to receive inside part (altitude > 0)
     * @param xyzNegative array to receive outside part
     * @param altitudeRange min and max altitudes encountered.
     */
    static splitConvexPolygonInsideOutsidePlane(plane, xyz, xyzPositive, xyzNegative, altitudeRange) {
        const xyz0 = IndexedXYZCollectionPolygonOps._xyz0Work;
        const xyz1 = IndexedXYZCollectionPolygonOps._xyz1Work;
        const xyzInterpolated = IndexedXYZCollectionPolygonOps._xyz2Work;
        const n = xyz.length;
        xyzPositive.clear();
        xyzNegative.clear();
        // let numSplit = 0;
        const fractionTol = 1.0e-8;
        if (n > 2) {
            xyz.back(xyz0);
            altitudeRange.setNull();
            let a0 = plane.altitude(xyz0);
            altitudeRange.extendX(a0);
            //    if (a0 >= 0.0)
            //      work.push_back (xyz0);
            for (let i1 = 0; i1 < n; i1++) {
                xyz.getPoint3dAtUncheckedPointIndex(i1, xyz1);
                const a1 = plane.altitude(xyz1);
                altitudeRange.extendX(a1);
                let nearZero = false;
                if (a0 * a1 < 0.0) {
                    // simple crossing. . .
                    const f = -a0 / (a1 - a0);
                    if (f > 1.0 - fractionTol && a1 >= 0.0) {
                        // the endpoint will be saved -- avoid the duplicate
                        nearZero = true;
                    }
                    else {
                        xyz0.interpolate(f, xyz1, xyzInterpolated);
                        xyzPositive.push(xyzInterpolated);
                        xyzNegative.push(xyzInterpolated);
                    }
                    // numSplit++;
                }
                if (a1 >= 0.0 || nearZero)
                    xyzPositive.push(xyz1);
                if (a1 <= 0.0 || nearZero)
                    xyzNegative.push(xyz1);
                xyz0.setFromPoint3d(xyz1);
                a0 = a1;
            }
        }
    }
    /**
     * Clip a polygon to one side of a plane.
     * * Results with 2 or fewer points are ignored.
     * * Other than ensuring capacity in the arrays, there are no object allocations during execution of this function.
     * * plane is passed as unrolled Point4d (ax,ay,az,aw) point (x,y,z) acts as homogeneous (x,y,z,1)
     *   * `keepPositive === true` selects positive altitudes.
     * @param plane any type that has `plane.altitude`
     * @param xyz input points.
     * @param work work buffer
     * @param tolerance tolerance for "on plane" decision.
     */
    static clipConvexPolygonInPlace(plane, xyz, work, keepPositive = true, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        work.clear();
        const s = keepPositive ? 1.0 : -1.0;
        const n = xyz.length;
        let numNegative = 0;
        const fractionTol = 1.0e-8;
        const b = -tolerance;
        if (xyz.length > 1) {
            let a1;
            let index0 = xyz.length - 1;
            let a0 = s * xyz.evaluateUncheckedIndexPlaneAltitude(index0, plane);
            //    if (a0 >= 0.0)
            //      work.push_back (xyz0);
            for (let index1 = 0; index1 < n; a0 = a1, index0 = index1++) {
                a1 = s * xyz.evaluateUncheckedIndexPlaneAltitude(index1, plane);
                if (a1 < 0)
                    numNegative++;
                if (a0 * a1 < 0.0) {
                    // simple crossing . . .
                    const f = -a0 / (a1 - a0);
                    if (f > 1.0 - fractionTol && a1 >= 0.0) {
                        // the endpoint will be saved -- avoid the duplicate
                    }
                    else {
                        work.pushInterpolatedFromGrowableXYZArray(xyz, index0, f, index1);
                    }
                }
                if (a1 >= b)
                    work.pushFromGrowableXYZArray(xyz, index1);
                index0 = index1;
                a0 = a1;
            }
        }
        if (work.length <= 2) {
            xyz.clear();
        }
        else if (numNegative > 0) {
            xyz.clear();
            xyz.pushFromGrowableXYZArray(work);
        }
        work.clear();
    }
    /**
     * Return the intersection of the plane with a range cube.
     * @param range
     * @param xyzOut intersection polygon.  This is convex.
     * @return reference to xyz if the polygon still has points; undefined if all points are clipped away.
     */
    static intersectRangeConvexPolygonInPlace(range, xyz) {
        if (range.isNull)
            return undefined;
        const work = new GrowableXYZArray_1.GrowableXYZArray();
        const plane = Point4d_1.Point4d.create();
        plane.set(0, 0, -1, range.high.z);
        this.clipConvexPolygonInPlace(plane, xyz, work, true);
        if (xyz.length === 0)
            return undefined;
        plane.set(0, 0, -1, -range.low.z);
        this.clipConvexPolygonInPlace(plane, xyz, work, true);
        if (xyz.length === 0)
            plane.set(0, -1, 0, -range.high.y);
        this.clipConvexPolygonInPlace(plane, xyz, work, true);
        if (xyz.length === 0)
            return undefined;
        plane.set(0, 1, 0, range.low.y);
        this.clipConvexPolygonInPlace(plane, xyz, work, true);
        if (xyz.length === 0)
            return undefined;
        plane.set(-1, 0, 0, range.high.x);
        this.clipConvexPolygonInPlace(plane, xyz, work, true);
        if (xyz.length === 0)
            return undefined;
        plane.set(1, 0, 0, -range.low.x);
        this.clipConvexPolygonInPlace(plane, xyz, work, true);
        if (xyz.length === 0)
            return undefined;
        return xyz;
    }
}
exports.IndexedXYZCollectionPolygonOps = IndexedXYZCollectionPolygonOps;
IndexedXYZCollectionPolygonOps._xyz0Work = Point3dVector3d_1.Point3d.create();
IndexedXYZCollectionPolygonOps._xyz1Work = Point3dVector3d_1.Point3d.create();
IndexedXYZCollectionPolygonOps._xyz2Work = Point3dVector3d_1.Point3d.create();
/**
 * `Point3dArrayPolygonOps` class contains _static_ methods for typical operations on polygons carried as `Point3d[]`
 * @public
 */
class Point3dArrayPolygonOps {
    //  private static _xyz1Work: Point3d = Point3d.create();
    //  private static _xyz2Work: Point3d = Point3d.create();
    /**
     * Split a (convex) polygon into 2 parts.
     * @param xyz original polygon
     * @param xyzIn array to receive inside part
     * @param xyzOut array to receive outside part
     * @param altitudeRange min and max altitudes encountered.
     */
    static convexPolygonSplitInsideOutsidePlane(plane, xyz, xyzIn, xyzOut, altitudeRange) {
        const xyzCarrier = new Point3dArrayCarrier_1.Point3dArrayCarrier(xyz);
        const xyzInCarrier = new Point3dArrayCarrier_1.Point3dArrayCarrier(xyzIn);
        const xyzOutCarrier = new Point3dArrayCarrier_1.Point3dArrayCarrier(xyzOut);
        IndexedXYZCollectionPolygonOps.splitConvexPolygonInsideOutsidePlane(plane, xyzCarrier, xyzInCarrier, xyzOutCarrier, altitudeRange);
    }
    /** Return an array containing
     * * All points that are exactly on the plane.
     * * Crossing points between adjacent points that are (strictly) on opposite sides.
     */
    static polygonPlaneCrossings(plane, xyz, crossings) {
        crossings.length = 0;
        if (xyz.length >= 2) {
            const xyz0 = this._xyz0Work;
            xyz0.setFromPoint3d(xyz[xyz.length - 1]);
            let a0 = plane.altitude(xyz0);
            for (const xyz1 of xyz) {
                const a1 = plane.altitude(xyz1);
                if (a0 * a1 < 0.0) {
                    // simple crossing. . .
                    const f = -a0 / (a1 - a0);
                    crossings.push(xyz0.interpolate(f, xyz1));
                }
                if (a1 === 0.0) { // IMPORTANT -- every point is directly tested here
                    crossings.push(xyz1.clone());
                }
                xyz0.setFromPoint3d(xyz1);
                a0 = a1;
            }
        }
    }
    /**
     * Clip a polygon, returning the clip result in the same object.
     * @param xyz input/output polygon
     * @param work scratch object
     * @param tolerance tolerance for on-plane decision.
     */
    static convexPolygonClipInPlace(plane, xyz, work, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        if (work === undefined)
            work = [];
        work.length = 0;
        let numNegative = 0;
        const fractionTol = 1.0e-8;
        const b = -tolerance;
        if (xyz.length > 2) {
            let xyz0 = xyz[xyz.length - 1];
            let a0 = plane.altitude(xyz0);
            //    if (a0 >= 0.0)
            //      work.push_back (xyz0);
            for (const xyz1 of xyz) {
                const a1 = plane.altitude(xyz1);
                if (a1 < 0)
                    numNegative++;
                if (a0 * a1 < 0.0) {
                    // simple crossing . . .
                    const f = -a0 / (a1 - a0);
                    if (f > 1.0 - fractionTol && a1 >= 0.0) {
                        // the endpoint will be saved -- avoid the duplicate
                    }
                    else {
                        work.push(xyz0.interpolate(f, xyz1));
                    }
                }
                if (a1 >= b)
                    work.push(xyz1);
                xyz0 = Point3dVector3d_1.Point3d.createFrom(xyz1);
                a0 = a1;
            }
        }
        if (work.length <= 2) {
            xyz.length = 0;
        }
        else if (numNegative > 0) {
            xyz.length = 0;
            for (const xyzI of work) {
                xyz.push(xyzI);
            }
            work.length = 0;
        }
    }
}
exports.Point3dArrayPolygonOps = Point3dArrayPolygonOps;
Point3dArrayPolygonOps._xyz0Work = Point3dVector3d_1.Point3d.create();
/**
 * A `SortablePolygon` carries a (single) loop with data useful for sorting for inner-outer structure.
 * @internal
 */
class SortablePolygon {
    /**
     *
     * @param loop Loop to capture.
     */
    constructor(loop, range, signedArea) {
        this.loop = loop;
        this.range = range;
        this.signedArea = signedArea;
        this.sortKey = Math.abs(this.signedArea);
        this.isHole = false;
    }
    /** Push loop with sort data onto the array.
     * * No action if no clear normal.
     * * return true if pushed.
     */
    static pushLoop(loops, loop) {
        const areaXY = PolygonOps.areaXY(loop);
        if (areaXY > 0.0) {
            loops.push(new SortablePolygon(loop, Range_1.Range3d.createFromVariantData(loop), areaXY));
            return true;
        }
        return true;
    }
    /** Push loop with sort data onto the array.
     * * No action if no clear normal.
     * * return true if pushed.
     */
    static assignParentsAndDepth(loops) {
        const outputSets = [];
        // Sort largest to smallest ...
        loops.sort((loopA, loopB) => (loopB.sortKey - loopA.sortKey));
        outputSets.length = 0;
        // starting with smallest loop, point each loop to smallest containing parent.
        for (let i = loops.length; i-- > 0;) {
            const searchX = loops[i].loop.getXAtUncheckedPointIndex(0);
            const searchY = loops[i].loop.getYAtUncheckedPointIndex(0);
            // find smallest containing parent (search forward only to hit)
            loops[i].parentIndex = undefined;
            loops[i].outputSetIndex = undefined;
            for (let j = i; j-- > 0;) {
                if (loops[j].range.containsXY(searchX, searchY)
                    && 1 === PolygonOps.classifyPointInPolygonXY(searchX, searchY, loops[j].loop)) {
                    loops[i].parentIndex = j;
                    break;
                }
            }
        }
        // In large-to-small order:
        // If a loop has no parent or has a "hole" as parent it is outer.
        // otherwise (i.e. it has a non-hole parent) it becomes a hole in the parent.
        for (const loopData of loops) {
            loopData.isHole = false;
            const parentIndex = loopData.parentIndex;
            if (parentIndex !== undefined)
                loopData.isHole = !loops[parentIndex].isHole;
            if (!loopData.isHole) {
                loopData.reverseLoopForAreaSign(1.0);
                loopData.outputSetIndex = outputSets.length;
                outputSets.push([]);
                outputSets[loopData.outputSetIndex].push(loopData.loop);
            }
            else {
                loopData.reverseLoopForAreaSign(-1.0);
                const outputSetIndex = loops[parentIndex].outputSetIndex;
                outputSets[outputSetIndex].push(loopData.loop);
            }
        }
        return outputSets;
    }
    reverseLoopForAreaSign(areaSign) {
        if (areaSign * this.signedArea < 0.0) {
            this.loop.reverseInPlace();
            this.signedArea *= -1.0;
        }
    }
}
//# sourceMappingURL=PolygonOps.js.map