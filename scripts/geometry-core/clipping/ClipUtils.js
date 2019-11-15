"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Range_1 = require("../geometry3d/Range");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const UnionOfConvexClipPlaneSets_1 = require("./UnionOfConvexClipPlaneSets");
const ClipPrimitive_1 = require("./ClipPrimitive");
const ConvexClipPlaneSet_1 = require("./ConvexClipPlaneSet");
const Loop_1 = require("../curve/Loop");
const LineString3d_1 = require("../curve/LineString3d");
const ClipVector_1 = require("./ClipVector");
/** @module CartesianGeometry */
/** Enumerated type for describing where geometry lies with respect to clipping planes.
 * @public
 */
var ClipPlaneContainment;
(function (ClipPlaneContainment) {
    /** All points inside */
    ClipPlaneContainment[ClipPlaneContainment["StronglyInside"] = 1] = "StronglyInside";
    /** Inside/outside state unknown. */
    ClipPlaneContainment[ClipPlaneContainment["Ambiguous"] = 2] = "Ambiguous";
    /** All points outside */
    ClipPlaneContainment[ClipPlaneContainment["StronglyOutside"] = 3] = "StronglyOutside";
})(ClipPlaneContainment = exports.ClipPlaneContainment || (exports.ClipPlaneContainment = {}));
/** Enumerated type for describing what must yet be done to clip a piece of geometry.
 * @public
 */
var ClipStatus;
(function (ClipStatus) {
    /** some geometry may cross the clip boundaries */
    ClipStatus[ClipStatus["ClipRequired"] = 0] = "ClipRequired";
    /** geometry is clearly outside */
    ClipStatus[ClipStatus["TrivialReject"] = 1] = "TrivialReject";
    /** geometry is clearly inside */
    ClipStatus[ClipStatus["TrivialAccept"] = 2] = "TrivialAccept";
})(ClipStatus = exports.ClipStatus || (exports.ClipStatus = {}));
/** Static class whose various methods are functions for clipping geometry
 * @public
 */
class ClipUtilities {
    /**
     * * Augment the unsortedFractionsArray with 0 and 1
     * * sort
     * * test the midpoint of each interval with `clipper.isPointOnOrInside`
     * * pass accepted intervals to `announce(f0,f1,curve)`
     */
    static selectIntervals01(curve, unsortedFractions, clipper, announce) {
        unsortedFractions.push(0);
        unsortedFractions.push(1);
        unsortedFractions.sort();
        let f0 = unsortedFractions.atUncheckedIndex(0);
        let f1;
        let fMid;
        const testPoint = ClipUtilities._selectIntervals01TestPoint;
        const n = unsortedFractions.length;
        for (let i = 1; i < n; i++, f0 = f1) {
            f1 = unsortedFractions.atUncheckedIndex(i);
            fMid = 0.5 * (f0 + f1);
            if (f1 > f0 && (fMid >= 0.0 && fMid <= 1.0)) {
                curve.fractionToPoint(fMid, testPoint);
                if (clipper.isPointOnOrInside(testPoint)) {
                    if (announce)
                        announce(f0, f1, curve);
                    else
                        return true;
                }
            }
        }
        return false;
    }
    /**
     * Announce triples of (low, high, cp) for each entry in intervals
     * @param intervals source array
     * @param cp CurvePrimitive for announcement
     * @param announce function to receive data
     */
    static announceNNC(intervals, cp, announce) {
        if (announce) {
            for (const ab of intervals) {
                announce(ab.low, ab.high, cp);
            }
        }
        return intervals.length > 0;
    }
    /** Find portions of the curve that are within the clipper.
     * Collect them into an array of curve primitives.
     */
    static collectClippedCurves(curve, clipper) {
        const result = [];
        curve.announceClipIntervals(clipper, (fraction0, fraction1, curveA) => {
            if (fraction1 !== fraction0) {
                const partialCurve = curveA.clonePartialCurve(fraction0, fraction1);
                if (partialCurve)
                    result.push(partialCurve);
            }
        });
        return result;
    }
    /**
     * Clip a polygon down to regions defined by each shape of a ClipShape.
     * @return An multidimensional array of points, where each array is the boundary of part of the remaining polygon.
     */
    static clipPolygonToClipShape(polygon, clipShape) {
        const outputA = this.clipPolygonToClipShapeReturnGrowableXYZArrays(polygon, clipShape);
        const output = [];
        for (const g of outputA)
            output.push(g.getPoint3dArray());
        return output;
    }
    /**
     * Clip a polygon down to regions defined by each shape of a ClipShape.
     * @return An multidimensional array of points, where each array is the boundary of part of the remaining polygon.
     */
    static clipPolygonToClipShapeReturnGrowableXYZArrays(polygon, clipShape) {
        const output = [];
        const clipper = clipShape.fetchClipPlanesRef();
        // NEEDS WORK -- what if it is a mask !!!!
        if (clipper) {
            clipper.polygonClip(polygon, output);
        }
        return output;
    }
    /** Given an array of points, test for trivial containment conditions.
     * * ClipStatus.TrivialAccept if all points are in any one of the convexSet's.
     * * ClipStatus.ClipRequired if (in any single convexSet) there were points on both sides of any single plane.
     * * ClipStatus.TrivialReject if neither of those occurred.
     */
    static pointSetSingleClipStatus(points, planeSet, tolerance) {
        if (planeSet.convexSets.length === 0)
            return ClipStatus.TrivialAccept;
        for (const convexSet of planeSet.convexSets) {
            let allOutsideSinglePlane = false, anyOutside = false;
            for (const plane of convexSet.planes) {
                let numInside = 0, numOutside = 0;
                const planeDistance = plane.distance - tolerance;
                const currPt = Point3dVector3d_1.Point3d.create();
                const currVec = Point3dVector3d_1.Vector3d.create();
                for (let i = 0; i < points.length; i++) {
                    points.getPoint3dAtUncheckedPointIndex(i, currPt);
                    currVec.setFrom(currPt);
                    currVec.dotProduct(plane.inwardNormalRef) > planeDistance ? numInside++ : numOutside++;
                }
                anyOutside = (numOutside !== 0) ? true : anyOutside;
                if (numInside === 0) {
                    allOutsideSinglePlane = true;
                    break;
                }
            }
            if (!anyOutside) // totally inside this set - no clip required
                return ClipStatus.TrivialAccept;
            if (!allOutsideSinglePlane)
                return ClipStatus.ClipRequired;
        }
        return ClipStatus.TrivialReject;
    }
    /**
     * Emit point loops for intersection of a convex set with a range.
     * * return zero length array for (a) null range or (b) no intersections
     * @param range range to intersect
     * @param includeConvexSetFaces if false, do not compute facets originating as convex set planes.
     * @param includeRangeFaces if false, do not compute facets originating as range faces
     * @param ignoreInvisiblePlanes if true, do NOT compute a facet for convex set faces marked invisible.
     */
    static announceLoopsOfConvexClipPlaneSetIntersectRange(convexSet, range, loopFunction, includeConvexSetFaces = true, includeRangeFaces = true, ignoreInvisiblePlanes = false) {
        const work = new GrowableXYZArray_1.GrowableXYZArray();
        if (includeConvexSetFaces) {
            // Clip convexSet planes to the range and to the rest of the convexSet . .
            for (const plane of convexSet.planes) {
                if (ignoreInvisiblePlanes && plane.invisible)
                    continue;
                const pointsClippedToRange = plane.intersectRange(range, true);
                const finalPoints = new GrowableXYZArray_1.GrowableXYZArray();
                if (pointsClippedToRange) {
                    convexSet.polygonClip(pointsClippedToRange, finalPoints, work, plane);
                    if (finalPoints.length > 0)
                        loopFunction(finalPoints);
                }
            }
        }
        if (includeRangeFaces) {
            // clip range faces to the convex set . . .
            const corners = range.corners();
            for (let i = 0; i < 6; i++) {
                const indices = Range_1.Range3d.faceCornerIndices(i);
                const finalPoints = new GrowableXYZArray_1.GrowableXYZArray();
                const lineString = LineString3d_1.LineString3d.createIndexedPoints(corners, indices);
                convexSet.polygonClip(lineString.packedPoints, finalPoints, work);
                if (finalPoints.length > 0)
                    loopFunction(finalPoints);
            }
        }
    }
    /**
     * Return a (possibly empty) array of geometry (Loops !!) which are facets of the intersection of the convex set intersecting a range.
     * * return zero length array for (a) null range or (b) no intersections
     * @param range range to intersect
     * @param includeConvexSetFaces if false, do not compute facets originating as convex set planes.
     * @param includeRangeFaces if false, do not compute facets originating as range faces
     * @param ignoreInvisiblePlanes if true, do NOT compute a facet for convex set faces marked invisible.
     */
    static loopsOfConvexClipPlaneIntersectionWithRange(convexSet, range, includeConvexSetFaces = true, includeRangeFaces = true, ignoreInvisiblePlanes = false) {
        const result = [];
        this.announceLoopsOfConvexClipPlaneSetIntersectRange(convexSet, range, (points) => {
            if (points.length > 0)
                result.push(Loop_1.Loop.createPolygon(points));
        }, includeConvexSetFaces, includeRangeFaces, ignoreInvisiblePlanes);
        return result;
    }
    /**
     * Return the (possibly null) range of the intersection of the convex set with a range.
     * * The convex set is permitted to be unbounded (e.g. a single plane).  The range parameter provides bounds.
     * @param convexSet convex set for intersection.
     * @param range range to intersect
     */
    static rangeOfConvexClipPlaneSetIntersectionWithRange(convexSet, range) {
        const result = Range_1.Range3d.createNull();
        this.announceLoopsOfConvexClipPlaneSetIntersectRange(convexSet, range, (points) => {
            if (points.length > 0)
                result.extendArray(points);
        }, true, true, false);
        return result;
    }
    /**
     * Return the range of various types of clippers
     * * `ConvexClipPlaneSet` -- dispatch to `rangeOfConvexClipPlaneSetIntersectionWithRange`
     * * `UnionOfConvexClipPlaneSet` -- union of ranges of member `ConvexClipPlaneSet`
     * * `ClipPrimitive` -- access its `UnionOfConvexClipPlaneSet`.
     * * `ClipVector` -- intersection of the ranges of its `ClipPrimitive`.
     * * `undefined` -- entire input range.
     * * If `observeInvisibleFlag` is false, the "invisible" properties are ignored, and this effectively returns the range of the edge work of the members
     * * If `observeInvisibleFlag` is false, the "invisible" properties are observed, and "invisible" parts do not restrict the range.
     * @param clipper
     * @param range non-null range.
     * @param observeInvisibleFlag indicates how "invisible" bit is applied for ClipPrimitive.
     */
    static rangeOfClipperIntersectionWithRange(clipper, range, observeInvisibleFlag = true) {
        if (clipper === undefined)
            return range.clone();
        if (clipper instanceof ConvexClipPlaneSet_1.ConvexClipPlaneSet)
            return this.rangeOfConvexClipPlaneSetIntersectionWithRange(clipper, range);
        if (clipper instanceof UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets) {
            const rangeUnion = Range_1.Range3d.createNull();
            for (const c of clipper.convexSets) {
                const rangeC = this.rangeOfConvexClipPlaneSetIntersectionWithRange(c, range);
                rangeUnion.extendRange(rangeC);
            }
            return rangeUnion;
        }
        if (clipper instanceof ClipPrimitive_1.ClipPrimitive) {
            if (observeInvisibleFlag && clipper.invisible)
                return range.clone();
            return this.rangeOfClipperIntersectionWithRange(clipper.fetchClipPlanesRef(), range);
        }
        if (clipper instanceof ClipVector_1.ClipVector) {
            const rangeIntersection = range.clone();
            for (const c of clipper.clips) {
                if (observeInvisibleFlag && c.invisible) {
                    // trivial range tests do not expose the effects.   Assume the hole allows everything.
                }
                else {
                    const rangeC = this.rangeOfClipperIntersectionWithRange(c, range, observeInvisibleFlag);
                    rangeIntersection.intersect(rangeC, rangeIntersection);
                }
            }
            return rangeIntersection;
        }
        return range.clone();
    }
    /**
     * Test if various types of clippers have any intersection with a range.
     * * This follows the same logic as `rangeOfClipperIntersectionWithRange` but attempts to exit at earliest point of confirmed intersection
     * * `ConvexClipPlaneSet` -- dispatch to `doesConvexClipPlaneSetIntersectRange`
     * * `UnionOfConvexClipPlaneSet` -- union of ranges of member `ConvexClipPlaneSet`
     * * `ClipPrimitive` -- access its `UnionOfConvexClipPlaneSet`.
     * * `ClipVector` -- intersection of the ranges of its `ClipPrimitive`.
     * * `undefined` -- entire input range.
     * * If `observeInvisibleFlag` is false, the "invisible" properties are ignored, and holes do not affect the result.
     * * If `observeInvisibleFlag` is true, the "invisible" properties are observed, and may affect the result.
     * @param clipper
     * @param range non-null range.
     * @param observeInvisibleFlag indicates how "invisible" bit is applied for ClipPrimitive.
     */
    static doesClipperIntersectRange(clipper, range, observeInvisibleFlag = true) {
        if (clipper === undefined)
            return true;
        if (clipper instanceof ConvexClipPlaneSet_1.ConvexClipPlaneSet)
            return this.doesConvexClipPlaneSetIntersectRange(clipper, range);
        if (clipper instanceof UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets) {
            for (const c of clipper.convexSets) {
                if (this.doesConvexClipPlaneSetIntersectRange(c, range))
                    return true;
            }
            return false;
        }
        if (clipper instanceof ClipPrimitive_1.ClipPrimitive) {
            if (observeInvisibleFlag && clipper.invisible) // um is there an easy way to detect range-completely-inside?
                return true;
            return this.doesClipperIntersectRange(clipper.fetchClipPlanesRef(), range);
        }
        if (clipper instanceof ClipVector_1.ClipVector) {
            const rangeIntersection = range.clone();
            for (const c of clipper.clips) {
                if (observeInvisibleFlag && c.invisible) {
                    // trivial range tests do not expose the effects.   Assume the hole allows everything.
                }
                else {
                    const rangeC = this.rangeOfClipperIntersectionWithRange(c, range, observeInvisibleFlag);
                    rangeIntersection.intersect(rangeC, rangeIntersection);
                }
            }
            return !rangeIntersection.isNull;
        }
        /** If the case statement above is complete for the variant inputs, this is unreachable .. */
        return false;
    }
    /**
     * Emit point loops for intersection of a convex set with a range.
     * * return zero length array for (a) null range or (b) no intersections
     * @param range range to intersect
     * @param includeConvexSetFaces if false, do not compute facets originating as convex set planes.
     * @param includeRangeFaces if false, do not compute facets originating as range faces
     * @param ignoreInvisiblePlanes if true, do NOT compute a facet for convex set faces marked invisible.
     */
    static doesConvexClipPlaneSetIntersectRange(convexSet, range, includeConvexSetFaces = true, includeRangeFaces = true, ignoreInvisiblePlanes = false) {
        const work = new GrowableXYZArray_1.GrowableXYZArray();
        if (includeConvexSetFaces) {
            // Clip convexSet planes to the range and to the rest of the convexSet . .
            for (const plane of convexSet.planes) {
                if (ignoreInvisiblePlanes && plane.invisible)
                    continue;
                const pointsClippedToRange = plane.intersectRange(range, true);
                if (pointsClippedToRange) {
                    const finalPoints = new GrowableXYZArray_1.GrowableXYZArray();
                    convexSet.polygonClip(pointsClippedToRange, finalPoints, work, plane);
                    if (finalPoints.length > 0)
                        return true;
                }
            }
        }
        if (includeRangeFaces) {
            // clip range faces to the convex set . . .
            const corners = range.corners();
            for (let i = 0; i < 6; i++) {
                const indices = Range_1.Range3d.faceCornerIndices(i);
                const finalPoints = new GrowableXYZArray_1.GrowableXYZArray();
                const lineString = LineString3d_1.LineString3d.createIndexedPoints(corners, indices);
                convexSet.polygonClip(lineString.packedPoints, finalPoints, work);
                if (finalPoints.length > 0)
                    return true;
            }
        }
        return false;
    }
}
exports.ClipUtilities = ClipUtilities;
ClipUtilities._selectIntervals01TestPoint = Point3dVector3d_1.Point3d.create();
//# sourceMappingURL=ClipUtils.js.map