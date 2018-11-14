"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module CartesianGeometry */
Object.defineProperty(exports, "__esModule", { value: true });
const Segment1d_1 = require("../geometry3d/Segment1d");
const Range_1 = require("../geometry3d/Range");
const GrowableArray_1 = require("../geometry3d/GrowableArray");
const ClipUtils_1 = require("./ClipUtils");
const ConvexClipPlaneSet_1 = require("./ConvexClipPlaneSet");
/**
 * A collection of ConvexClipPlaneSets.
 * * A point is "in" the clip plane set if it is "in" one or more of  the ConvexClipPlaneSet
 * * Hence the boolean logic is that the ClipPlaneSet is a UNION of its constituents.
 */
class UnionOfConvexClipPlaneSets {
    constructor() {
        this._convexSets = [];
    }
    get convexSets() { return this._convexSets; }
    toJSON() {
        const val = [];
        for (const convex of this._convexSets) {
            val.push(convex.toJSON());
        }
        return val;
    }
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
    static createEmpty(result) {
        if (result) {
            result._convexSets.length = 0;
            return result;
        }
        return new UnionOfConvexClipPlaneSets();
    }
    /**
     * @returns Return true if all member convex sets are almostEqual to corresponding members of other.  This includes identical order in array.
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
    static createConvexSets(convexSets, result) {
        result = result ? result : new UnionOfConvexClipPlaneSets();
        for (const set of convexSets)
            result._convexSets.push(set);
        return result;
    }
    clone(result) {
        result = result ? result : new UnionOfConvexClipPlaneSets();
        result._convexSets.length = 0;
        for (const convexSet of this._convexSets)
            result._convexSets.push(convexSet.clone());
        return result;
    }
    addConvexSet(toAdd) {
        this._convexSets.push(toAdd);
    }
    testRayIntersect(point, direction) {
        const tNear = new Float64Array(1);
        for (const planeSet of this._convexSets) {
            if (ConvexClipPlaneSet_1.ConvexClipPlaneSet.testRayIntersections(tNear, point, direction, planeSet))
                return true;
        }
        return false;
    }
    getRayIntersection(point, direction) {
        let nearest = -ConvexClipPlaneSet_1.ConvexClipPlaneSet.hugeVal;
        for (const planeSet of this._convexSets) {
            if (planeSet.isPointInside(point)) {
                return 0.0;
            }
            else {
                const tNear = new Float64Array(1);
                if (ConvexClipPlaneSet_1.ConvexClipPlaneSet.testRayIntersections(tNear, point, direction, planeSet) && tNear[0] > nearest) {
                    nearest = tNear[0];
                }
            }
        }
        if (nearest > -ConvexClipPlaneSet_1.ConvexClipPlaneSet.hugeVal)
            return nearest;
        else
            return undefined;
    }
    isPointInside(point) {
        for (const convexSet of this._convexSets) {
            if (convexSet.isPointInside(point)) {
                return true;
            }
        }
        return false;
    }
    isPointOnOrInside(point, tolerance) {
        for (const convexSet of this._convexSets) {
            if (convexSet.isPointOnOrInside(point, tolerance))
                return true;
        }
        return false;
    }
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
    transformInPlace(transform) {
        for (const convexSet of this._convexSets) {
            convexSet.transformInPlace(transform);
        }
    }
    /** Returns 1, 2, or 3 based on whether point is strongly inside, ambiguous, or strongly outside respectively */
    classifyPointContainment(points, onIsOutside) {
        for (const convexSet of this._convexSets) {
            const thisStatus = convexSet.classifyPointContainment(points, onIsOutside);
            if (thisStatus !== 3 /* StronglyOutside */)
                return thisStatus;
        }
        return 3 /* StronglyOutside */;
    }
    /** Clip a polygon using this ClipPlaneSet, returning new polygon boundaries. Note that each polygon may lie next to the previous, or be disconnected. */
    polygonClip(input, output) {
        output.length = 0;
        for (const convexSet of this._convexSets) {
            const convexSetOutput = [];
            convexSet.polygonClip(input, convexSetOutput, []);
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
     * Returns range if result does not cover a space of infinity, otherwise undefined.
     * Note: If given a range for output, overwrites it, rather than extending it.
     */
    getRangeOfAlignedPlanes(transform, result) {
        const range = Range_1.Range3d.createNull(result);
        for (const convexSet of this._convexSets) {
            const thisRange = Range_1.Range3d.createNull();
            if (convexSet.getRangeOfAlignedPlanes(transform, thisRange))
                range.extendRange(thisRange);
        }
        if (range.isNull)
            return undefined;
        else
            return range;
    }
    multiplyPlanesByMatrix(matrix) {
        for (const convexSet of this._convexSets) {
            convexSet.multiplyPlanesByMatrix(matrix);
        }
    }
    setInvisible(invisible) {
        for (const convexSet of this._convexSets) {
            convexSet.setInvisible(invisible);
        }
    }
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
UnionOfConvexClipPlaneSets._clipArcFractionArray = new GrowableArray_1.GrowableFloat64Array();
exports.UnionOfConvexClipPlaneSets = UnionOfConvexClipPlaneSets;
//# sourceMappingURL=UnionOfConvexClipPlaneSets.js.map