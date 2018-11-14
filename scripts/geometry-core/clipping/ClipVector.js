"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const ClipPrimitive_1 = require("./ClipPrimitive");
const Range_1 = require("../geometry3d/Range");
const Transform_1 = require("../geometry3d/Transform");
const Geometry_1 = require("../Geometry");
const LineSegment3d_1 = require("../curve/LineSegment3d");
/** Class holding an array structure of shapes defined by clip plane sets */
class ClipVector {
    constructor(clips) {
        this.boundingRange = Range_1.Range3d.createNull();
        this._clips = clips ? clips : [];
    }
    /** Returns a reference to the array of ClipShapes. */
    get clips() { return this._clips; }
    /** Returns true if this ClipVector contains a ClipShape. */
    get isValid() { return this._clips.length > 0; }
    /** Create a ClipVector with an empty set of ClipShapes. */
    static createEmpty(result) {
        if (result) {
            result._clips.length = 0;
            return result;
        }
        return new ClipVector();
    }
    /** Create a ClipVector from an array of ClipShapes */
    static createClipShapeRefs(clips, result) {
        if (result) {
            result._clips = clips;
            return result;
        }
        return new ClipVector(clips);
    }
    /** Create a ClipVector from an array of ClipShapes, each one becoming a deep copy. */
    static createClipShapeClones(clips, result) {
        const clipClones = [];
        for (const clip of clips)
            clipClones.push(clip.clone());
        return ClipVector.createClipShapeRefs(clipClones, result);
    }
    /** Create a deep copy of another ClipVector */
    static createFrom(donor, result) {
        const retVal = result ? result : new ClipVector();
        retVal._clips.length = 0;
        for (const clip of donor._clips) {
            retVal._clips.push(clip.clone());
        }
        retVal.boundingRange.setFrom(donor.boundingRange);
        return retVal;
    }
    /** Parse this ClipVector into a JSON object. */
    toJSON() {
        if (!this.isValid)
            return [];
        const val = [];
        for (const clipShape of this.clips)
            val.push(clipShape.toJSON());
        return val;
    }
    /** Parse a JSON object into a new ClipVector. */
    static fromJSON(json, result) {
        result = result ? result : new ClipVector();
        result.clear();
        try {
            for (const clip of json) {
                const clipPrim = ClipPrimitive_1.ClipShape.fromJSON(clip);
                if (clipPrim)
                    result._clips.push(clipPrim);
            }
        }
        catch (e) {
            result.clear();
        }
        return result;
    }
    /** Returns a deep copy of this ClipVector (optionally stores it in the result param rather than create using new()) */
    clone(result) {
        return ClipVector.createFrom(this, result);
    }
    /** Empties out the array of ClipShapes. */
    clear() {
        this._clips.length = 0;
    }
    /** Append a deep copy of the given ClipShape to this ClipVector. */
    appendClone(clip) {
        this._clips.push(clip.clone());
    }
    /** Append a reference of the given ClipShape to this ClipVector. */
    appendReference(clip) {
        this._clips.push(clip);
    }
    /** Create and append a new ClipPrimitive to the array given a shape as an array of points. Returns true if successful. */
    appendShape(shape, zLow, zHigh, transform, isMask = false, invisible = false) {
        const clip = ClipPrimitive_1.ClipShape.createShape(shape, zLow, zHigh, transform, isMask, invisible);
        if (!clip)
            return false;
        this._clips.push(clip);
        return true;
    }
    /** Returns the three-dimensional range that this ClipVector spans, which may be null. */
    getRange(transform, result) {
        const range = Range_1.Range3d.createNull(result);
        for (const shape of this._clips) {
            const thisRange = shape.getRange(false, transform);
            if (thisRange !== undefined) {
                if (range.isNull)
                    range.setFrom(thisRange);
                else
                    range.intersect(thisRange, range);
            }
        }
        if (!this.boundingRange.isNull)
            range.intersect(this.boundingRange, range);
        return range;
    }
    /** Returns true if the given point lies inside all of this ClipVector's ClipShapes (by rule of intersection). */
    pointInside(point, onTolerance = Geometry_1.Geometry.smallMetricDistanceSquared) {
        if (!this.boundingRange.isNull && !this.boundingRange.containsPoint(point))
            return false;
        for (const clip of this._clips)
            if (!clip.pointInside(point, onTolerance))
                return false;
        return true;
    }
    /** Transforms this ClipVector to a new coordinate-system. Returns true if successful. */
    transformInPlace(transform) {
        for (const clip of this._clips)
            if (clip.transformInPlace(transform) === false)
                return false;
        if (!this.boundingRange.isNull)
            transform.multiplyRange(this.boundingRange, this.boundingRange);
        return true;
    }
    /**
     * A simple way of packaging this ClipVector's ClipShape points into a multidimensional array, while also
     * taking into account each ClipShape's individual transforms.
     *
     * Information out:
     *  - All of the loop points are stored in the multidimensional Point3d array given (will return unchanged upon failure)
     *  - If given a transform, will be set from the transformFromClip of the first ClipShape
     *  - The ClipMask of the final ClipShape is stored in the returned array at index 0
     *  - The last valid zLow found is stored in the returned array at index 1
     *  - The last valid zHigh found is stored in the returned array at index 2
     */
    extractBoundaryLoops(loopPoints, transform) {
        let clipM = 0 /* None */;
        let zBack = -Number.MAX_VALUE;
        let zFront = Number.MAX_VALUE;
        const retVal = [];
        let nLoops = 0;
        if (this._clips.length === 0)
            return retVal;
        const deltaTrans = Transform_1.Transform.createIdentity();
        for (const clip of this._clips) {
            if (clip !== this._clips[0]) { // Is not the first iteration
                let fwdTrans = Transform_1.Transform.createIdentity();
                let invTrans = Transform_1.Transform.createIdentity();
                if (this._clips[0].transformValid && clip.transformValid) {
                    fwdTrans = clip.transformFromClip.clone();
                    invTrans = this._clips[0].transformToClip.clone();
                }
                deltaTrans.setFrom(invTrans.multiplyTransformTransform(fwdTrans));
            }
            loopPoints[nLoops] = [];
            if (clip.polygon !== undefined) {
                clipM = 15 /* XAndY */;
                if (clip.zHighValid) {
                    clipM = clipM | 32 /* ZHigh */;
                    zFront = clip.zHigh;
                }
                if (clip.zLowValid) {
                    clipM = clipM | 16 /* ZLow */;
                    zBack = clip.zLow;
                }
                for (const point of clip.polygon)
                    loopPoints[nLoops].push(point.clone());
                deltaTrans.multiplyPoint3dArray(loopPoints[nLoops], loopPoints[nLoops]);
                nLoops++;
            }
        }
        retVal.push(clipM);
        retVal.push(zBack);
        retVal.push(zFront);
        if (transform)
            transform.setFrom(this._clips[0].transformFromClip);
        return retVal;
    }
    /** Sets this ClipVector and all of its members to the visibility specified. */
    setInvisible(invisible) {
        for (const clip of this._clips)
            clip.setInvisible(invisible);
    }
    /** For every clip, parse the member point array into the member clip plane object (only for clipPlanes member, not the mask) */
    parseClipPlanes() {
        for (const clip of this._clips)
            clip.fetchClipPlanesRef();
    }
    /** Returns true if able to successfully multiply all member ClipShape planes by the matrix given. */
    multiplyPlanesTimesMatrix(matrix) {
        let numErrors = 0;
        for (const clip of this._clips)
            if (clip.multiplyPlanesTimesMatrix(matrix) === false)
                numErrors++;
        return numErrors === 0 ? true : false;
    }
    /**
     * Determines whether the given points fall inside or outside this set of ClipShapes. If any set is defined by masking planes,
     * checks the mask planes only, provided that ignoreMasks is false. Otherwise, checks the _clipplanes member.
     */
    classifyPointContainment(points, ignoreMasks = false) {
        let currentContainment = 2 /* Ambiguous */;
        for (const primitive of this._clips) {
            const thisContainment = primitive.classifyPointContainment(points, ignoreMasks);
            if (2 /* Ambiguous */ === thisContainment)
                return 2 /* Ambiguous */;
            if (2 /* Ambiguous */ === currentContainment)
                currentContainment = thisContainment;
            else if (currentContainment !== thisContainment)
                return 2 /* Ambiguous */;
        }
        return currentContainment;
    }
    /**
     * Determines whether a 3D range lies inside or outside this set of ClipShapes. If any set is defined by masking planes,
     * checks the mask planes only, provided that ignoreMasks is false. Otherwise, checks the _clipplanes member.
     */
    classifyRangeContainment(range, ignoreMasks) {
        const corners = range.corners();
        return this.classifyPointContainment(corners, ignoreMasks);
    }
    /**
     * For an array of points (making up a LineString), tests whether the segment between each point lies inside the ClipVector.
     * If true, returns true immediately.
     */
    isAnyLineStringPointInside(points) {
        for (const clip of this._clips) {
            const clipPlaneSet = clip.fetchClipPlanesRef();
            for (let i = 0; i + 1 < points.length; i++) {
                const segment = LineSegment3d_1.LineSegment3d.create(points[i], points[i + 1]);
                if (clipPlaneSet.isAnyPointInOrOnFromSegment(segment))
                    return true;
            }
        }
        return false;
    }
    /** Note: Line segments are used to represent 1 dimensional intervals here, rather than segments. */
    sumSizes(intervals, begin, end) {
        let s = 0.0;
        for (let i = begin; i < end; i++)
            s += (intervals[i].x1 - intervals[i].x0);
        return s;
    }
    /**
     * For an array of points that make up a LineString, develops a line segment between each point pair,
     * and returns true if all segments lie inside this ClipVector.
     */
    isLineStringCompletelyContained(points) {
        const clipIntervals = [];
        for (let i = 0; i + 1 < points.length; i++) {
            const segment = LineSegment3d_1.LineSegment3d.create(points[i], points[i + 1]);
            let fractionSum = 0.0;
            let index0 = 0;
            for (const clip of this._clips) {
                const clipPlaneSet = clip.fetchClipPlanesRef();
                clipPlaneSet.appendIntervalsFromSegment(segment, clipIntervals);
                const index1 = clipIntervals.length;
                fractionSum += this.sumSizes(clipIntervals, index0, index1);
                index0 = index1;
                // ASSUME primitives are non-overlapping...
                if (fractionSum >= ClipVector._TARGET_FRACTION_SUM)
                    break;
            }
            if (fractionSum < ClipVector._TARGET_FRACTION_SUM)
                return false;
        }
        return true;
    }
}
ClipVector._TARGET_FRACTION_SUM = 0.99999999;
exports.ClipVector = ClipVector;
//# sourceMappingURL=ClipVector.js.map