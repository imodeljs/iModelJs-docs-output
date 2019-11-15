"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module CartesianGeometry */
Object.defineProperty(exports, "__esModule", { value: true });
const Segment1d_1 = require("../geometry3d/Segment1d");
const Range_1 = require("../geometry3d/Range");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
const ClipUtils_1 = require("./ClipUtils");
const ConvexClipPlaneSet_1 = require("./ConvexClipPlaneSet");
const Geometry_1 = require("../Geometry");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
/**
 * A collection of ConvexClipPlaneSets.
 * * A point is "in" the clip plane set if it is "in" one or more of  the ConvexClipPlaneSet
 * * Hence the boolean logic is that the ClipPlaneSet is a UNION of its constituents.
 * @public
 */
class UnionOfConvexClipPlaneSets {
    constructor() {
        this._convexSets = [];
    }
    /** (property accessor)  Return the (reference to the) array of `ConvexClipPlaneSet` */
    get convexSets() { return this._convexSets; }
    /** Return an array with the `toJSON` form of each  `ConvexClipPlaneSet` */
    toJSON() {
        const val = [];
        for (const convex of this._convexSets) {
            val.push(convex.toJSON());
        }
        return val;
    }
    /** Convert json `UnionOfConvexClipPlaneSets`, using `setFromJSON`. */
    static fromJSON(json, result) {
        result = result ? result : new UnionOfConvexClipPlaneSets();
        result._convexSets.length = 0;
        if (!Array.isArray(json))
            return result;
        for (const thisJson of json) {
            result._convexSets.push(ConvexClipPlaneSet_1.ConvexClipPlaneSet.fromJSON(thisJson));
        }
        return result;
    }
    /** Create a `UnionOfConvexClipPlaneSets` with no members. */
    static createEmpty(result) {
        if (result) {
            result._convexSets.length = 0;
            return result;
        }
        return new UnionOfConvexClipPlaneSets();
    }
    /**
     * Return true if all member convex sets are almostEqual to corresponding members of other.  This includes identical order in array.
     * @param other clip plane to compare
     */
    isAlmostEqual(other) {
        if (this._convexSets.length !== other._convexSets.length)
            return false;
        for (let i = 0; i < this._convexSets.length; i++)
            if (!this._convexSets[i].isAlmostEqual(other._convexSets[i]))
                return false;
        return true;
    }
    /** Create a `UnionOfConvexClipPlaneSets` with given `ConvexClipPlaneSet` members */
    static createConvexSets(convexSets, result) {
        result = result ? result : new UnionOfConvexClipPlaneSets();
        for (const set of convexSets)
            result._convexSets.push(set);
        return result;
    }
    /** return a deep copy. */
    clone(result) {
        result = result ? result : new UnionOfConvexClipPlaneSets();
        result._convexSets.length = 0;
        for (const convexSet of this._convexSets)
            result._convexSets.push(convexSet.clone());
        return result;
    }
    /** Append `toAdd` to the array of `ConvexClipPlaneSet` */
    addConvexSet(toAdd) {
        this._convexSets.push(toAdd);
    }
    /** Test if there is any intersection with a ray defined by origin and direction.
     * * Optionally record the range (null or otherwise) in caller-allocated result.
     * * If the ray is unbounded inside the clip, result can contain positive or negative "Geometry.hugeCoordinate" values
     * * If no result is provide, there are no object allocations.
     * @param maximalRange optional Range1d to receive parameters along the ray.
     */
    hasIntersectionWithRay(ray, maximalRange) {
        if (maximalRange === undefined) {
            // if complete result is not requested, return after any hit.
            for (const planeSet of this._convexSets) {
                if (planeSet.hasIntersectionWithRay(ray))
                    return true;
            }
            return false;
        }
        maximalRange.setNull();
        const rangeA = Range_1.Range1d.createNull();
        for (const planeSet of this._convexSets) {
            if (planeSet.hasIntersectionWithRay(ray, rangeA))
                maximalRange.extendRange(rangeA);
        }
        return !maximalRange.isNull;
    }
    /** Return true if true is returned for any contained convex set returns true for `convexSet.isPointInside (point, tolerance)`  */
    isPointInside(point) {
        for (const convexSet of this._convexSets) {
            if (convexSet.isPointInside(point)) {
                return true;
            }
        }
        return false;
    }
    /** Return true if true is returned for any contained convex set returns true for `convexSet.isPointOnOrInside (point, tolerance)`  */
    isPointOnOrInside(point, tolerance = Geometry_1.Geometry.smallMetricDistance) {
        for (const convexSet of this._convexSets) {
            if (convexSet.isPointOnOrInside(point, tolerance))
                return true;
        }
        return false;
    }
    /** Return true if true is returned for any contained convex set returns true for `convexSet.isSphereOnOrInside (point, tolerance)`  */
    isSphereInside(point, radius) {
        for (const convexSet of this._convexSets) {
            if (convexSet.isSphereInside(point, radius))
                return true;
        }
        return false;
    }
    /** test if any part of a line segment is within the volume */
    isAnyPointInOrOnFromSegment(segment) {
        for (const convexSet of this._convexSets) {
            if (convexSet.announceClippedSegmentIntervals(0.0, 1.0, segment.point0Ref, segment.point1Ref))
                return true;
        }
        return false;
    }
    // Intervals must be Segment1d array, as there may be multiple intervals along segment that pass through set regions,
    // and so splitting the intervals into segments aids in better organization
    /** Returns the fractions of the segment that pass through the set region, as 1 dimensional pieces */
    appendIntervalsFromSegment(segment, intervals) {
        for (const convexSet of this._convexSets) {
            convexSet.announceClippedSegmentIntervals(0.0, 1.0, segment.point0Ref, segment.point1Ref, (fraction0, fraction1) => intervals.push(Segment1d_1.Segment1d.create(fraction0, fraction1)));
        }
    }
    /** apply `transform` to all the ConvexClipPlaneSet's */
    transformInPlace(transform) {
        for (const convexSet of this._convexSets) {
            convexSet.transformInPlace(transform);
        }
    }
    /** Returns 1, 2, or 3 based on whether point is strongly inside, ambiguous, or strongly outside respectively */
    classifyPointContainment(points, onIsOutside) {
        for (const convexSet of this._convexSets) {
            const thisStatus = convexSet.classifyPointContainment(points, onIsOutside);
            if (thisStatus !== ClipUtils_1.ClipPlaneContainment.StronglyOutside)
                return thisStatus;
        }
        return ClipUtils_1.ClipPlaneContainment.StronglyOutside;
    }
    /** Clip a polygon using this ClipPlaneSet, returning new polygon boundaries. Note that each polygon may lie next to the previous, or be disconnected. */
    polygonClip(input, output) {
        output.length = 0;
        if (Array.isArray(input))
            input = GrowableXYZArray_1.GrowableXYZArray.create(input);
        const work = new GrowableXYZArray_1.GrowableXYZArray();
        for (const convexSet of this._convexSets) {
            const convexSetOutput = new GrowableXYZArray_1.GrowableXYZArray();
            convexSet.polygonClip(input, convexSetOutput, work);
            if (convexSetOutput.length !== 0)
                output.push(convexSetOutput);
        }
    }
    /**
     * * announce clipSegment() for each convexSet in this ClipPlaneSet.
     * * all clipPlaneSets are inspected
     * * announced intervals are for each individual clipPlaneSet -- adjacent intervals are not consolidated.
     * @param f0 active interval start.
     * @param f1 active interval end
     * @param pointA line segment start
     * @param pointB line segment end
     * @param announce function to announce interval.
     * @returns Return true if any announcements are made.
     */
    announceClippedSegmentIntervals(f0, f1, pointA, pointB, announce) {
        let numAnnounce = 0;
        for (const convexSet of this._convexSets) {
            if (convexSet.announceClippedSegmentIntervals(f0, f1, pointA, pointB, announce))
                numAnnounce++;
        }
        return numAnnounce > 0;
    }
    /** Find parts of an arc that are inside any member clipper.
     * Announce each with `announce(startFraction, endFraction, this)`
     */
    announceClippedArcIntervals(arc, announce) {
        const breaks = UnionOfConvexClipPlaneSets._clipArcFractionArray;
        breaks.clear();
        for (const convexSet of this._convexSets) {
            for (const clipPlane of convexSet.planes) {
                clipPlane.appendIntersectionRadians(arc, breaks);
            }
        }
        arc.sweep.radiansArraytoPositivePeriodicFractions(breaks);
        return ClipUtils_1.ClipUtilities.selectIntervals01(arc, breaks, this, announce);
    }
    /**
     * Collect the output from computePlanePlanePlaneIntersections in all the contained convex sets.
     *
     * @param transform (optional) transform to apply to the points.
     * @param points (optional) array to which computed points are to be added.
     * @param range (optional) range to be extended by the computed points
     * @param transform (optional) transform to apply to the accepted points.
     * @param testContainment if true, test each point to see if it is within the convex set.  (Send false if confident that the convex set is rectilinear set such as a slab.  Send true if chiseled corners are possible)
     * @returns number of points.
     */
    computePlanePlanePlaneIntersectionsInAllConvexSets(points, rangeToExtend, transform, testContainment = true) {
        let n = 0;
        for (const convexSet of this._convexSets) {
            n += convexSet.computePlanePlanePlaneIntersections(points, rangeToExtend, transform, testContainment);
        }
        return n;
    }
    /**
     * Multiply all ClipPlanes DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     */
    multiplyPlanesByMatrix4d(matrix, invert = true, transpose = true) {
        if (invert) { // form inverse once here, reuse for all planes
            const inverse = matrix.createInverse();
            if (!inverse)
                return false;
            return this.multiplyPlanesByMatrix4d(inverse, false, transpose);
        }
        // (no inversion -- no failures possible)
        for (const convexSet of this._convexSets) {
            convexSet.multiplyPlanesByMatrix4d(matrix, false, transpose);
        }
        return true;
    }
    /** Recursively call `setInvisible` on all member convex sets. */
    setInvisible(invisible) {
        for (const convexSet of this._convexSets) {
            convexSet.setInvisible(invisible);
        }
    }
    /** add convex sets that accept points below `zLow` and above `zHigh` */
    addOutsideZClipSets(invisible, zLow, zHigh) {
        if (zLow) {
            const convexSet = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createEmpty();
            convexSet.addZClipPlanes(invisible, zLow);
            this._convexSets.push(convexSet);
        }
        if (zHigh) {
            const convexSet = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createEmpty();
            convexSet.addZClipPlanes(invisible, undefined, zHigh);
            this._convexSets.push(convexSet);
        }
    }
}
exports.UnionOfConvexClipPlaneSets = UnionOfConvexClipPlaneSets;
UnionOfConvexClipPlaneSets._clipArcFractionArray = new GrowableFloat64Array_1.GrowableFloat64Array();
//# sourceMappingURL=UnionOfConvexClipPlaneSets.js.map