"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const ClipPrimitive_1 = require("./ClipPrimitive");
const ClipUtils_1 = require("./ClipUtils");
const Range_1 = require("../geometry3d/Range");
const Transform_1 = require("../geometry3d/Transform");
const Geometry_1 = require("../Geometry");
const LineSegment3d_1 = require("../curve/LineSegment3d");
/** Class holding an array structure of shapes defined by `ClipPrimitive`
 * * The `ClipVector` defines an intersection of the member `ClipPrimitive` regions.
 * * In the most common usage, one of the `ClipPrimitive` will be an outer region, and all others are holes with marker flag indicating that they outside of each hole is live.
 * @public
 */
class ClipVector {
    constructor(clips) {
        /** range acting as first filter.
         * * This is understood as overall range limit, not as precise planes.
         * * applying any rotation to the whole ClipVector generally expands this range, rather than exactly transforming its planes.
         */
        this.boundingRange = Range_1.Range3d.createNull();
        this._clips = clips ? clips : [];
    }
    /** Returns a reference to the array of ClipShapes. */
    get clips() { return this._clips; }
    /** Returns true if this ClipVector contains a ClipPrimitive. */
    get isValid() { return this._clips.length > 0; }
    /** Create a ClipVector with an empty set of ClipShapes. */
    static createEmpty(result) {
        if (result) {
            result._clips.length = 0;
            return result;
        }
        return new ClipVector();
    }
    /** Create a ClipVector from an array of ClipPrimitives (or derived classes) (capture the pointers) */
    static createCapture(clips, result) {
        if (result) {
            result._clips = clips;
            return result;
        }
        return new ClipVector(clips);
    }
    /** Create a ClipVector from (clones of) an array of ClipPrimitives */
    static create(clips, result) {
        const clipClones = [];
        for (const clip of clips)
            clipClones.push(clip.clone());
        return ClipVector.createCapture(clipClones, result);
    }
    /** Create a deep copy of another ClipVector */
    clone(result) {
        const retVal = result ? result : new ClipVector();
        retVal._clips.length = 0;
        for (const clip of this._clips) {
            retVal._clips.push(clip.clone());
        }
        retVal.boundingRange.setFrom(this.boundingRange);
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
                const clipPrim = ClipPrimitive_1.ClipPrimitive.fromJSON(clip);
                if (clipPrim)
                    result._clips.push(clipPrim);
            }
        }
        catch (e) {
            result.clear();
        }
        return result;
    }
    /** Empties out the array of ClipShapes. */
    clear() {
        this._clips.length = 0;
    }
    /** Append a deep copy of the given ClipPrimitive to this ClipVector. */
    appendClone(clip) {
        this._clips.push(clip.clone());
    }
    /** Append a reference of the given ClipPrimitive to this ClipVector. */
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
    /** Returns true if the given point lies inside all of this ClipVector's ClipShapes (by rule of intersection). */
    pointInside(point, onTolerance = Geometry_1.Geometry.smallMetricDistanceSquared) {
        if (!this.boundingRange.isNull && !this.boundingRange.containsPoint(point))
            return false;
        for (const clip of this._clips) {
            if (!clip.pointInside(point, onTolerance))
                return false;
        }
        return true;
    }
    /** Transforms this ClipVector to a new coordinate-system.
     * Note that if the transform has rotate and scale the boundingRange member expands.
     * Returns true if successful.
     */
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
     * taking into account each ClipPrimitive's individual transforms.
     *
     * ClipPrimitives OTHER THAN ClipShape are ignored.
     *
     * Information out:
     *  - All of the loop points are stored in the multidimensional Point3d array given (will return unchanged upon failure)
     *  - If given a transform, will be set from the transformFromClip of the first ClipPrimitive
     *  - The ClipMask of the final ClipPrimitive is stored in the returned array at index 0
     *  - The last valid zLow found is stored in the returned array at index 1
     *  - The last valid zHigh found is stored in the returned array at index 2
     */
    extractBoundaryLoops(loopPoints, transform) {
        let clipM = ClipPrimitive_1.ClipMaskXYZRangePlanes.None;
        let zBack = -Number.MAX_VALUE;
        let zFront = Number.MAX_VALUE;
        const retVal = [];
        let nLoops = 0;
        if (this._clips.length === 0)
            return retVal;
        let firstClipShape;
        const deltaTrans = Transform_1.Transform.createIdentity();
        for (const clip of this._clips) {
            if (clip instanceof ClipPrimitive_1.ClipShape) {
                if (firstClipShape !== undefined && clip !== firstClipShape) { // Is not the first iteration
                    let fwdTrans = Transform_1.Transform.createIdentity();
                    let invTrans = Transform_1.Transform.createIdentity();
                    if (firstClipShape.transformValid && clip.transformValid) {
                        fwdTrans = clip.transformFromClip.clone();
                        invTrans = firstClipShape.transformToClip.clone();
                    }
                    deltaTrans.setFrom(invTrans.multiplyTransformTransform(fwdTrans));
                }
                if (!firstClipShape)
                    firstClipShape = clip;
                loopPoints[nLoops] = [];
                if (clip.polygon !== undefined) {
                    clipM = ClipPrimitive_1.ClipMaskXYZRangePlanes.XAndY;
                    if (clip.zHighValid) {
                        clipM = clipM | ClipPrimitive_1.ClipMaskXYZRangePlanes.ZHigh;
                        zFront = clip.zHigh;
                    }
                    if (clip.zLowValid) {
                        clipM = clipM | ClipPrimitive_1.ClipMaskXYZRangePlanes.ZLow;
                        zBack = clip.zLow;
                    }
                    for (const point of clip.polygon)
                        loopPoints[nLoops].push(point.clone());
                    deltaTrans.multiplyPoint3dArray(loopPoints[nLoops], loopPoints[nLoops]);
                    nLoops++;
                }
            }
        }
        retVal.push(clipM);
        retVal.push(zBack);
        retVal.push(zFront);
        if (transform && firstClipShape)
            transform.setFrom(firstClipShape.transformFromClip);
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
    /**
     * Multiply all ClipPlanes DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     * @returns false if matrix inversion fails.
     */
    multiplyPlanesByMatrix4d(matrix, invert = true, transpose = true) {
        if (invert) { // form inverse once here, reuse for all planes
            const inverse = matrix.createInverse();
            if (!inverse)
                return false;
            return this.multiplyPlanesByMatrix4d(inverse, false, transpose);
        }
        // no inverse necessary -- lower level cannot fail.
        for (const clip of this._clips)
            clip.multiplyPlanesByMatrix4d(matrix, false, transpose);
        return true;
    }
    /**
     * Determines whether the given points fall inside or outside this set of ClipShapes. If any set is defined by masking planes,
     * checks the mask planes only, provided that ignoreMasks is false. Otherwise, checks the _clipplanes member.
     */
    classifyPointContainment(points, ignoreMasks = false) {
        let currentContainment = ClipUtils_1.ClipPlaneContainment.Ambiguous;
        for (const primitive of this._clips) {
            const thisContainment = primitive.classifyPointContainment(points, ignoreMasks);
            if (ClipUtils_1.ClipPlaneContainment.Ambiguous === thisContainment)
                return ClipUtils_1.ClipPlaneContainment.Ambiguous;
            if (ClipUtils_1.ClipPlaneContainment.Ambiguous === currentContainment)
                currentContainment = thisContainment;
            else if (currentContainment !== thisContainment)
                return ClipUtils_1.ClipPlaneContainment.Ambiguous;
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
            if (clipPlaneSet !== undefined) {
                for (let i = 0; i + 1 < points.length; i++) {
                    const segment = LineSegment3d_1.LineSegment3d.create(points[i], points[i + 1]);
                    if (clipPlaneSet.isAnyPointInOrOnFromSegment(segment))
                        return true;
                }
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
                if (clipPlaneSet !== undefined) {
                    clipPlaneSet.appendIntervalsFromSegment(segment, clipIntervals);
                    const index1 = clipIntervals.length;
                    fractionSum += this.sumSizes(clipIntervals, index0, index1);
                    index0 = index1;
                    // ASSUME primitives are non-overlapping...
                    if (fractionSum >= ClipVector._TARGET_FRACTION_SUM)
                        break;
                }
            }
            if (fractionSum < ClipVector._TARGET_FRACTION_SUM)
                return false;
        }
        return true;
    }
}
exports.ClipVector = ClipVector;
ClipVector._TARGET_FRACTION_SUM = 0.99999999;
//# sourceMappingURL=ClipVector.js.map