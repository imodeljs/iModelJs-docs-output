"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const PointVector_1 = require("../PointVector");
const Range_1 = require("../Range");
const Range_2 = require("../Range");
const Transform_1 = require("../Transform");
const Geometry_1 = require("../Geometry");
const PointHelpers_1 = require("../PointHelpers");
const GrowableArray_1 = require("../GrowableArray");
const ClipPlane_1 = require("./ClipPlane");
const ClipUtils_1 = require("./ClipUtils");
/**
 * A ConvexClipPlaneSet is a collection of ClipPlanes, often used for bounding regions of space.
 */
class ConvexClipPlaneSet {
    // private _parity: number;   <--- Not yet used
    // public get parity() { return this._parity; }
    // public set parity(value: number) { this._parity = value; }
    constructor(planes) {
        // this._parity = 1;
        this._planes = planes ? planes : [];
    }
    toJSON() {
        const val = [];
        for (const plane of this._planes) {
            val.push(plane.toJSON());
        }
        return val;
    }
    static fromJSON(json, result) {
        result = result ? result : new ConvexClipPlaneSet();
        result._planes.length = 0;
        if (!Array.isArray(json))
            return result;
        for (const thisJson of json) {
            const plane = ClipPlane_1.ClipPlane.fromJSON(thisJson);
            if (plane)
                result._planes.push(plane);
        }
        return result;
    }
    /**
     * @returns Return true if all members are almostEqual to corresponding members of other.  This includes identical order in array.
     * @param other clip plane to compare
     */
    isAlmostEqual(other) {
        if (this._planes.length !== other._planes.length)
            return false;
        for (let i = 0; i < this._planes.length; i++)
            if (!this._planes[i].isAlmostEqual(other._planes[i]))
                return false;
        return true;
    }
    static createPlanes(planes, result) {
        result = result ? result : new ConvexClipPlaneSet();
        for (const plane of planes)
            result._planes.push(plane);
        return result;
    }
    /**
     * Create new convex set using selected planes of a Range3d.
     * @param range range with coordinates
     * @param lowX true to clip at the low x plane
     * @param highX true to clip at the high x plane
     * @param lowY true to clip at the low y plane
     * @param highY true to clip at the high z plane
     * @param lowZ true to clip at the low z plane
     * @param highZ true to clip at the high z plane
     */
    static createRange3dPlanes(range, lowX = true, highX = true, lowY = true, highY = true, lowZ = true, highZ = true) {
        const result = ConvexClipPlaneSet.createEmpty();
        if (lowX)
            result.planes.push(ClipPlane_1.ClipPlane.createNormalAndPointXYZXYZ(1, 0, 0, range.low.x, 0, 0));
        if (highX)
            result.planes.push(ClipPlane_1.ClipPlane.createNormalAndPointXYZXYZ(-1, 0, 0, range.high.x, 0, 0));
        if (lowY)
            result.planes.push(ClipPlane_1.ClipPlane.createNormalAndPointXYZXYZ(0, 1, 0, 0, range.low.y, 0));
        if (highY)
            result.planes.push(ClipPlane_1.ClipPlane.createNormalAndPointXYZXYZ(0, -1, 0, 0, range.high.y, 0));
        if (lowZ)
            result.planes.push(ClipPlane_1.ClipPlane.createNormalAndPointXYZXYZ(0, 0, 1, 0, 0, range.low.z));
        if (highZ)
            result.planes.push(ClipPlane_1.ClipPlane.createNormalAndPointXYZXYZ(0, 0, -1, 0, 0, range.high.z));
        return result;
    }
    static createEmpty(result) {
        if (result) {
            result._planes.length = 0;
            return result;
        }
        return new ConvexClipPlaneSet();
    }
    /** negate all planes of the set. */
    negateAllPlanes() {
        for (const plane of this._planes)
            plane.negateInPlace();
    }
    static createXYBox(x0, y0, x1, y1, result) {
        result = result ? result : new ConvexClipPlaneSet();
        result._planes.length = 0;
        const clip0 = ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.create(-1, 0, 0), -x1, false, true);
        const clip1 = ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.create(1, 0, 0), x0, false, true);
        const clip2 = ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.create(0, -1, 0), -y1, false, true);
        const clip3 = ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.create(0, 1, 0), y0, false, true);
        if (clip0 && clip1 && clip2 && clip3) {
            result._planes.push(clip0, clip1, clip2, clip3);
        }
        return result;
    }
    static createXYPolyLine(points, interior, leftIsInside, result) {
        result = result ? result : new ConvexClipPlaneSet();
        result._planes.length = 0;
        for (let i0 = 0; (i0 + 1) < points.length; i0++) {
            const edgeVector = PointVector_1.Vector3d.createStartEnd(points[i0], points[i0 + 1]);
            const perp = edgeVector.unitPerpendicularXY();
            perp.z = 0.0;
            if (!leftIsInside)
                perp.negate();
            const perpNormalized = perp.normalize();
            if (perpNormalized) {
                const clip = ClipPlane_1.ClipPlane.createNormalAndPoint(perp, points[i0], interior[i0], interior[i0]);
                if (clip) {
                    result._planes.push(clip);
                }
            }
        }
        return result;
    }
    /**
     * Create a convexClipPlaneSet with planes whose "inside" normal is to the left of each segment.
     * @param points array of points.
     */
    static createXYPolyLineInsideLeft(points, result) {
        result = result ? result : new ConvexClipPlaneSet();
        result._planes.length = 0;
        for (let i0 = 0; (i0 + 1) < points.length; i0++) {
            const edgeVector = PointVector_1.Vector3d.createStartEnd(points[i0], points[i0 + 1]);
            const perp = edgeVector.unitPerpendicularXY();
            perp.z = 0.0;
            const perpNormalized = perp.normalize();
            if (perpNormalized) {
                const clip = ClipPlane_1.ClipPlane.createNormalAndPoint(perp, points[i0], false, false);
                if (clip) {
                    result._planes.push(clip);
                }
            }
        }
        return result;
    }
    clone(result) {
        result = result ? result : new ConvexClipPlaneSet();
        result._planes.length = 0;
        for (const plane of this._planes)
            result._planes.push(plane.clone());
        return result;
    }
    get planes() {
        return this._planes;
    }
    // tNear passed as Float64Array of size 1 to be used as reference
    static testRayIntersections(tNear, origin, direction, planes) {
        tNear[0] = -ConvexClipPlaneSet.hugeVal;
        let tFar = ConvexClipPlaneSet.hugeVal;
        for (const plane of planes._planes) {
            const vD = plane.dotProductVector(direction);
            const vN = plane.evaluatePoint(origin);
            if (vD === 0.0) {
                // Ray is parallel... No need to continue testing if outside halfspace.
                if (vN < 0.0)
                    return false;
            }
            else {
                const rayDistance = -vN / vD;
                if (vD < 0.0) {
                    if (rayDistance < tFar)
                        tFar = rayDistance;
                }
                else {
                    if (rayDistance > tNear[0])
                        tNear[0] = rayDistance;
                }
            }
        }
        return tNear[0] <= tFar;
    }
    multiplyPlanesByMatrix(matrix) {
        for (const plane of this._planes) {
            plane.multiplyPlaneByMatrix(matrix);
        }
    }
    isPointInside(point) {
        for (const plane of this._planes) {
            if (!plane.isPointInside(point))
                return false;
        }
        return true;
    }
    isPointOnOrInside(point, tolerance) {
        const interiorTolerance = Math.abs(tolerance); // Interior tolerance should always be positive. (TFS# 246598).
        for (const plane of this._planes) {
            if (!plane.isPointOnOrInside(point, (plane.interior ? interiorTolerance : tolerance)))
                return false;
        }
        return true;
    }
    isSphereInside(point, radius) {
        // Note - The sphere logic differ from "PointOnOrInside" only in the handling of interior planes.
        // For a sphere we don't negate the tolerance on interior planes - we have to look for true containment (TFS# 439212).
        for (const plane of this._planes) {
            if (!plane.isPointOnOrInside(point, radius)) {
                return false;
            }
        }
        return true;
    }
    /** Find the parts of the line segment  (if any) that is within the convex clip volume.
     * * The input fractional interval from fraction0 to fraction1 (increasing!!) is the active part to consider.
     * * To clip to the usual bounded line segment, starts with fractions (0,1).
     * If the clip volume is unbounded, the line interval may also be unbounded.
     * * An unbounded line portion will have fraction coordinates positive or negative Number.MAX_VALUE.
     * @param fraction0 fraction that is the initial lower fraction of the active interval. (e.g. 0.0 for bounded segment)
     * @param fraction1 fraction that is the initial upper fraction of the active interval.  (e.g. 1.0 for bounded segment)
     * @param pointA segment start (fraction 0)
     * @param pointB segment end (fraction 1)
     * @param announce function to be called to announce a fraction interval that is within the convex clip volume.
     * @returns true if a segment was announced, false if entirely outside.
     */
    announceClippedSegmentIntervals(f0, f1, pointA, pointB, announce) {
        let fraction;
        if (f1 < f0)
            return false;
        for (const plane of this._planes) {
            const hA = -plane.evaluatePoint(pointA);
            const hB = -plane.evaluatePoint(pointB);
            fraction = Geometry_1.Geometry.safeDivideFraction(-hA, (hB - hA), 0.0);
            if (fraction === undefined) {
                // LIne parallel to the plane.  If positive, it is all OUT
                if (hA > 0.0)
                    return false;
            }
            else if (hB > hA) {
                if (fraction < f0)
                    return false;
                if (fraction < f1)
                    f1 = fraction;
            }
            else if (hA > hB) {
                if (fraction > f1)
                    return false;
                if (fraction > f0)
                    f0 = fraction;
            }
            else {
                // Strictly equal evaluations
                if (hA > 0.0)
                    return false;
            }
        }
        if (f1 >= f0) {
            if (announce)
                announce(f0, f1);
            return true;
        }
        return false;
    }
    announceClippedArcIntervals(arc, announce) {
        const breaks = ConvexClipPlaneSet.sClipArcFractionArray;
        breaks.clear();
        for (const clipPlane of this.planes) {
            clipPlane.appendIntersectionRadians(arc, breaks);
        }
        arc.sweep.radiansArraytoPositivePeriodicFractions(breaks);
        return ClipUtils_1.ClipUtilities.selectIntervals01(arc, breaks, this, announce);
    }
    /** Find the parts of the (unbounded) line segment  (if any) that is within the convex clip volume.
     * @param pointA segment start (fraction 0)
     * @param pointB segment end (fraction 1)
     * @param announce function to be called to announce a fraction interval that is within the convex clip volume.
     * @returns true if a segment was announced, false if entirely outside.
     */
    clipUnboundedSegment(pointA, pointB, announce) {
        return this.announceClippedSegmentIntervals(-Number.MAX_VALUE, Number.MAX_VALUE, pointA, pointB, announce);
    }
    transformInPlace(transform) {
        for (const plane of this._planes) {
            plane.transformInPlace(transform);
        }
    }
    /** Returns 1, 2, or 3 based on whether point array is strongly inside, ambiguous, or strongly outside respectively.
     * * This has a peculiar expected use case as a very fast pre-filter for more precise clipping.
     * * The expected point set is for a polygon.
     * * Hence any clipping will eventually have to consider the lines between the points.
     * * This method looks for the special case of a single clip plane that has all the points outside.
     * * In this case the whole polygon must be outside.
     * * Note that this does not detect a polygon that is outside but "crosses a corner" -- it is mixed with respect to
     *     multiple planes.
     */
    classifyPointContainment(points, onIsOutside) {
        let allInside = true;
        const onTolerance = onIsOutside ? 1.0e-8 : -1.0e-8;
        const interiorTolerance = 1.0e-8; // Interior tolerance should always be positive
        for (const plane of this._planes) {
            let nOutside = 0;
            for (const point of points) {
                if (plane.evaluatePoint(point) < (plane.interior ? interiorTolerance : onTolerance)) {
                    nOutside++;
                    allInside = false;
                }
            }
            if (nOutside === points.length)
                return 3 /* StronglyOutside */;
        }
        return allInside ? 1 /* StronglyInside */ : 2 /* Ambiguous */;
    }
    /**
     * * Create a convex clip set for a polygon swept with possible tilt angle.
     * * planes are constructed by ClipPlane.createEdgeAndUpVector, using successive points from the array.
     * * If the first and last points match, the polygon area is checked.  If the area is negative, points are used in reverse order.
     * * If first and last points do not match, points are used in order given
     * @param points polygon points. (Closure point optional)
     * @param upVector primary sweep direction, as applied by ClipPlane.createEdgeAndUpVector
     * @param tiltAngle angle to tilt sweep planes away from the sweep direction.
     */
    static createSweptPolyline(points, upVector, tiltAngle) {
        const result = ConvexClipPlaneSet.createEmpty();
        let reverse = false;
        if (points.length > 3 && points[0].isAlmostEqual(points[points.length - 1])) {
            const polygonNormal = PointHelpers_1.PolygonOps.areaNormal(points);
            const normalDot = polygonNormal.dotProduct(upVector);
            if (normalDot > 0.0)
                reverse = true;
        }
        for (let i = 0; (i + 1) < points.length; i++) {
            if (reverse) {
                const toAdd = ClipPlane_1.ClipPlane.createEdgeAndUpVector(points[i + 1], points[i], upVector, tiltAngle);
                if (toAdd) {
                    result.addPlaneToConvexSet(toAdd);
                }
                else {
                    return undefined;
                }
            }
            else {
                const toAdd = ClipPlane_1.ClipPlane.createEdgeAndUpVector(points[i], points[i + 1], upVector, tiltAngle);
                if (toAdd) {
                    result.addPlaneToConvexSet(toAdd);
                }
                else {
                    return undefined;
                }
            }
        }
        return result;
    }
    addPlaneToConvexSet(plane) {
        if (plane)
            this._planes.push(plane);
    }
    clipPointsOnOrInside(points, inOrOn, out) {
        inOrOn.length = 0;
        out.length = 0;
        for (const xyz of points) {
            if (this.isPointOnOrInside(xyz, 0.0)) {
                inOrOn.push(xyz);
            }
            else {
                out.push(xyz);
            }
        }
    }
    polygonClip(input, output, work) {
        output.length = 0;
        // Copy input array
        for (const i of input)
            output.push(i);
        for (const plane of this._planes) {
            if (output.length === 0)
                break;
            plane.convexPolygonClipInPlace(output, work);
        }
    }
    /**
     * * Define new planes in this ConvexClipPlaneSet so it clips to the inside of a polygon.
     * * always create planes for the swept edges of the polygon
     * * optionally (with nonzero sideSelect) create a cap plane using the polygon normal.
     * @param points Points of a bounding polygon
     * @param sweepDirection direction to sweep.
     * @param sideSelect 0 to have no cap polygon, 1 if the sweep vector side is in, -1 if sweep vector side is out.
     */
    reloadSweptPolygon(points, sweepDirection, sideSelect) {
        this._planes.length = 0;
        const n = points.length;
        if (n <= 2)
            return 0;
        const planeNormal = PointHelpers_1.PolygonOps.areaNormal(points);
        const isCCW = sweepDirection.dotProduct(planeNormal) > 0.0;
        const delta = isCCW ? 1 : n - 1;
        for (let i = 0; i < n; i++) {
            const i1 = (i + delta) % n;
            const xyz0 = points[i];
            const xyz1 = points[i1];
            if (xyz0.isAlmostEqual(xyz1))
                continue;
            const edgeVector = PointVector_1.Vector3d.createStartEnd(xyz0, xyz1);
            const inwardNormal = PointVector_1.Vector3d.createCrossProduct(sweepDirection.x, sweepDirection.y, sweepDirection.z, edgeVector.x, edgeVector.y, edgeVector.z);
            const inwardNormalNormalized = inwardNormal.normalize();
            let distance;
            if (inwardNormalNormalized) {
                distance = inwardNormalNormalized.dotProduct(xyz0);
                const clipToAdd = ClipPlane_1.ClipPlane.createNormalAndDistance(inwardNormalNormalized, distance, false, false);
                if (clipToAdd) {
                    this._planes.push(clipToAdd);
                } // Clipplane creation could result in undefined
            }
        }
        if (sideSelect !== 0.0) {
            let planeNormalNormalized = planeNormal.normalize();
            if (planeNormalNormalized) {
                const a = sweepDirection.dotProduct(planeNormalNormalized) * sideSelect;
                if (a < 0.0)
                    planeNormalNormalized = planeNormalNormalized.negate();
                const xyz0 = points[0];
                const distance = planeNormalNormalized.dotProduct(xyz0);
                const clipToAdd = ClipPlane_1.ClipPlane.createNormalAndDistance(planeNormalNormalized, distance, false, false);
                if (clipToAdd) {
                    this._planes.push(clipToAdd);
                } // Clipplane creation could result in undefined
            }
        }
        return isCCW ? 1 : -1;
    }
    /**
     * Returns range if result does not cover a space of infinity, otherwise undefined.
     * Note: If given a range for output, overwrites it, rather than extending it.
     */
    getRangeOfAlignedPlanes(transform, result) {
        const idMatrix = Transform_1.RotMatrix.createIdentity();
        const bigRange = Range_2.Range3d.createXYZXYZ(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        const range = bigRange.clone(result);
        for (const clipPlane of this._planes) {
            if (transform)
                clipPlane.transformInPlace(transform);
            // Array of 1-d ranges that will be pieced back together into a Range3d after making adjustments
            const rangePieces = [
                Range_1.Range1d.createXX(range.low.x, range.high.x),
                Range_1.Range1d.createXX(range.low.y, range.high.y),
                Range_1.Range1d.createXX(range.low.z, range.high.z)
            ];
            for (let i = 0; i < 3; i++) {
                // Set values of minP and maxP based on i (we are compensating for pointer arithmetic in native code)
                let minP;
                let maxP;
                minP = rangePieces[i].low;
                maxP = rangePieces[i].high;
                const direction = idMatrix.getColumn(i);
                if (clipPlane.inwardNormalRef.isParallelTo(direction, true)) {
                    if (clipPlane.inwardNormalRef.dotProduct(direction) > 0.0) {
                        if (clipPlane.distance > minP)
                            rangePieces[i].low = clipPlane.distance;
                    }
                    else {
                        if (-clipPlane.distance < maxP)
                            rangePieces[i].high = -clipPlane.distance;
                    }
                }
            }
            // Reassign to Range3d
            range.low.x = rangePieces[0].low;
            range.high.x = rangePieces[0].high;
            range.low.y = rangePieces[1].low;
            range.high.y = rangePieces[1].high;
            range.low.z = rangePieces[2].low;
            range.high.z = rangePieces[2].high;
        }
        if (range.isAlmostEqual(bigRange))
            return undefined;
        else
            return range;
    }
    setInvisible(invisible) {
        for (const plane of this._planes) {
            plane.setInvisible(invisible);
        }
    }
    addZClipPlanes(invisible, zLow, zHigh) {
        if (zLow !== undefined)
            this._planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.create(0, 0, 1), zLow, invisible));
        if (zHigh !== undefined)
            this._planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.create(0, 0, -1), -zHigh, invisible));
    }
}
ConvexClipPlaneSet.hugeVal = 1e37;
ConvexClipPlaneSet.sClipArcFractionArray = new GrowableArray_1.GrowableFloat64Array();
exports.ConvexClipPlaneSet = ConvexClipPlaneSet;
//# sourceMappingURL=ConvexClipPlaneSet.js.map