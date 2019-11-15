"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Geometry_1 = require("../Geometry");
const TriangleCandidate_1 = require("./TriangleCandidate");
const Angle_1 = require("../geometry3d/Angle");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const IndexedCollectionInterval_1 = require("../geometry3d/IndexedCollectionInterval");
/** @module Polyface */
/**
 * * Context for constructing triangulations between linestrings with dis-similar point counts and distribution.
 * @internal
 */
class GreedyTriangulationBetweenLineStrings {
    constructor(turnRadians) {
        this._turnRadians = turnRadians;
        this._xyzA = Point3dVector3d_1.Point3d.create();
        this._xyzB = Point3dVector3d_1.Point3d.create();
        this._forwardA = Point3dVector3d_1.Vector3d.create();
        this._forwardB = Point3dVector3d_1.Vector3d.create();
        this._vector1 = Point3dVector3d_1.Vector3d.create();
        this._crossA = Point3dVector3d_1.Vector3d.create();
        this._crossB = Point3dVector3d_1.Vector3d.create();
    }
    isForwardVector(candidate, forward, perp) {
        if (candidate.dotProduct(forward) <= 0.0)
            return false;
        const theta = candidate.angleFromPerpendicular(perp);
        if (Math.abs(theta.radians) > this._turnRadians)
            return false;
        return true;
    }
    isPlanarBase(pointsA, baseA, pointsB, baseB, xyzA, crossA, forwardA, xyzB, crossB, forwardB) {
        if (baseA + 1 < pointsA.length && baseB + 1 < pointsB.length) {
            pointsA.getPoint3dAtUncheckedPointIndex(baseA, xyzA);
            pointsB.getPoint3dAtUncheckedPointIndex(baseB, xyzB);
            pointsA.vectorXYAndZIndex(xyzA, baseA + 1, forwardA);
            pointsB.vectorXYAndZIndex(xyzB, baseB + 1, forwardB);
            Point3dVector3d_1.Vector3d.createStartEnd(xyzA, xyzB, this._vector1);
            this._vector1.crossProduct(forwardA, crossA);
            this._vector1.crossProduct(forwardB, crossB);
            if (!xyzA.isAlmostEqual(xyzB) && crossA.angleTo(crossB).radians < this._turnRadians)
                return true;
        }
        return false;
    }
    /**
     * Starting at start in source, examine points to see how long they are close to being "in plane"
     * * child interval begins at parent.begin
     * * child interval end initializes at trialEnd and grows.
     * * child must be predefined by caller
     * * Return the accepted interval
     */
    advanceToPlanarLimit(parent, child, trialEnd, xyzA, perpA, forwardA, perpB, forwardB) {
        child.setFrom(parent, parent.begin, trialEnd); // initialize as empty interval.
        while (child.end < parent.end) {
            child.points.vectorXYAndZIndex(xyzA, child.end, this._vector1);
            if (!this.isForwardVector(this._vector1, forwardA, perpA))
                break;
            if (!this.isForwardVector(this._vector1, forwardB, perpB))
                break;
            if (child.end > 0) {
                child.points.vectorIndexIndex(child.end - 1, child.end, this._vector1);
                if (!this.isForwardVector(this._vector1, forwardA, perpA))
                    break;
            }
            child.end++;
        }
    }
    /** evaluate aspect ratios to select heuristically best triangles with given index intervals.
     * (ASSUME NO DUPLICATES, as in caller.)
     */
    addGreedy(intervalA, intervalB, handler, addOnly1 = false) {
        intervalA.restrictEnd();
        intervalB.restrictEnd();
        while (intervalA.length > 1 && intervalB.length > 1) {
            // triangles A1 and B1 are always valid.
            this._triangleA1 = TriangleCandidate_1.TriangleCandidate.createFromIndexedXYZ(intervalA.points, intervalA.begin, intervalA.points, intervalA.begin + 1, intervalB.points, intervalB.begin, 1, this._triangleA1);
            this._triangleA2 = TriangleCandidate_1.TriangleCandidate.createFromIndexedXYZ(intervalA.points, intervalA.begin + 1, intervalA.points, intervalA.begin + 2, intervalB.points, intervalB.begin, 2, this._triangleA2);
            this._triangleA3 = TriangleCandidate_1.TriangleCandidate.createFromIndexedXYZ(intervalA.points, intervalA.begin, intervalA.points, intervalA.begin + 1, intervalB.points, intervalB.begin + 1, 3, this._triangleA3);
            this._triangleB1 = TriangleCandidate_1.TriangleCandidate.createFromIndexedXYZ(intervalB.points, intervalB.begin + 1, intervalB.points, intervalB.begin, intervalA.points, intervalA.begin, -1, this._triangleB1);
            this._triangleB2 = TriangleCandidate_1.TriangleCandidate.createFromIndexedXYZ(intervalB.points, intervalB.begin + 2, intervalB.points, intervalB.begin + 1, intervalA.points, intervalA.begin, -2, this._triangleB2);
            this._triangleB3 = TriangleCandidate_1.TriangleCandidate.createFromIndexedXYZ(intervalB.points, intervalB.begin + 1, intervalB.points, intervalB.begin, intervalA.points, intervalA.begin + 1, -3, this._triangleB3);
            // Look at pairs of 2 triangles.
            // (each pair begins with 1 or -1)
            // For each pair find the smallest aspect ratio of its two triangles.  (Small is bad)
            // Choose the pair where that (smaller aspect ratio of two) is largest.
            // Advance in that direction.
            this._bestTriangle = TriangleCandidate_1.TriangleCandidate.copyWithLowerQuality(this._triangleA1, this._triangleB3, this._bestTriangle);
            this._workTriangle = TriangleCandidate_1.TriangleCandidate.copyWithLowerQuality(this._triangleB1, this._triangleA3, this._workTriangle);
            TriangleCandidate_1.TriangleCandidate.updateIfOtherHasHigherQuality(this._bestTriangle, this._workTriangle);
            // TestTriangle::UpdateIfOtherHasLargerAspectRatio (bestTriangle, TestTriangle::MergeAspectRatio (triangleB1, triangleB2));
            // TestTriangle::UpdateIfOtherHasLargerAspectRatio (bestTriangle, TestTriangle::MergeAspectRatio (triangleA1, triangleA2));
            if (this._bestTriangle.id > 0) {
                intervalA.advanceBegin();
                handler(this._bestTriangle);
                if (addOnly1)
                    return;
            }
            else {
                intervalB.advanceBegin();
                handler(this._bestTriangle);
                if (addOnly1)
                    return;
            }
        }
        // sweep in trailing points from either side.  At least one of intervalA.begin, intervalB.begin is at its limit, so only one of these will execute any bodies.
        if (intervalA.isSingleton) {
            while (intervalB.length >= 2) {
                this._workTriangle = TriangleCandidate_1.TriangleCandidate.createFromIndexedXYZ(intervalB.points, intervalB.begin + 1, intervalB.points, intervalB.begin, intervalA.points, intervalA.begin, 0, this._workTriangle);
                //  this._workTriangle.scaleFromPointInPlace(this._workTriangle.points[2], 0.95); // crude visualization aid for tracking logic.
                handler(this._workTriangle);
                intervalB.advanceBegin();
            }
        }
        // sweep in trailing points from either side.  At least one of baseA, baseB is at its limit, so only one of these will execute any bodies.
        if (intervalB.isSingleton) {
            while (intervalA.length >= 2) {
                this._workTriangle = TriangleCandidate_1.TriangleCandidate.createFromIndexedXYZ(intervalA.points, intervalA.begin, intervalA.points, intervalA.begin + 1, intervalB.points, intervalB.begin, 0, this._workTriangle);
                // this._workTriangle.scaleFromPointInPlace(this._workTriangle.points[2], 0.95); // crude visualization aid for tracking logic.
                handler(this._workTriangle);
                intervalA.advanceBegin();
            }
        }
    }
    /**
     * Working from start to finish, emit triangles with heuristic lookahead to get pleasing matching between the linestrings.
     * @param pointsA
     * @param pointsB
     * @param handler
     */
    emitTriangles(pointsA, pointsB, handler) {
        /** Clean up duplicates for the real logic . . . */
        this.emitTrianglesGo(resolveToNoDuplicates(pointsA), resolveToNoDuplicates(pointsB), handler);
    }
    /**
     * Run triangle logic on inputs with no duplicates.
     * @param pointsA
     * @param pointsB
     * @param handler
     */
    emitTrianglesGo(pointsA, pointsB, handler) {
        const intervalA = IndexedCollectionInterval_1.IndexedXYZCollectionInterval.createComplete(pointsA);
        const intervalB = IndexedCollectionInterval_1.IndexedXYZCollectionInterval.createComplete(pointsB);
        const childA = IndexedCollectionInterval_1.IndexedXYZCollectionInterval.createComplete(pointsA);
        const childB = IndexedCollectionInterval_1.IndexedXYZCollectionInterval.createComplete(pointsB);
        while (intervalA.length > 0 && intervalB.length > 0 && (intervalA.length > 1 || intervalB.length > 1)) {
            // const lA = intervalA.length;
            // const lB = intervalB.length;
            if (this.isPlanarBase(pointsA, intervalA.begin, pointsB, intervalB.begin, this._xyzA, this._crossA, this._forwardA, this._xyzB, this._crossB, this._forwardB)) {
                this.advanceToPlanarLimit(intervalA, childA, intervalA.begin + 1, this._xyzA, this._crossA, this._forwardA, this._crossB, this._forwardB);
                this.advanceToPlanarLimit(intervalB, childB, intervalB.begin + 1, this._xyzB, this._crossB, this._forwardB, this._crossA, this._forwardA);
                this.addGreedy(childA, childB, handler);
                intervalA.advanceToTail(childA);
                intervalB.advanceToTail(childB);
            }
            else if (this.isPlanarBase(pointsA, intervalA.begin + 1, pointsB, intervalB.begin, this._xyzA, this._crossA, this._forwardA, this._xyzB, this._crossB, this._forwardB)) {
                childA.setFrom(intervalA, intervalA.begin, intervalA.begin + 2);
                childB.setFrom(intervalB, intervalB.begin, intervalB.begin + 1);
                this.addGreedy(childA, childB, handler);
                intervalA.advanceToTail(childA);
                intervalB.advanceToTail(childB);
            }
            else if (this.isPlanarBase(pointsA, intervalA.begin, pointsB, intervalB.begin + 1, this._xyzA, this._crossA, this._forwardA, this._xyzB, this._crossB, this._forwardB)) {
                childA.setFrom(intervalA, intervalA.begin, intervalA.begin + 1);
                childB.setFrom(intervalB, intervalB.begin, intervalB.begin + 2);
                this.addGreedy(childA, childB, handler);
                intervalA.advanceToTail(childA);
                intervalB.advanceToTail(childB);
            }
            else if (intervalA.length > 1 && intervalB.length > 1) {
                childA.setFrom(intervalA, intervalA.begin, intervalA.begin + 2);
                childB.setFrom(intervalB, intervalB.begin, intervalB.begin + 2);
                this.addGreedy(childA, childB, handler, true);
                intervalA.advanceToHead(childA);
                intervalB.advanceToHead(childB);
            }
            else if (intervalA.length > 1) {
                childA.setFrom(intervalA, intervalA.begin, intervalA.begin + 2);
                childB.setFrom(intervalB);
                this.addGreedy(childA, childB, handler);
                intervalA.advanceToTail(childA);
                intervalB.advanceToTail(childB);
            }
            else if (intervalB.length > 1) {
                childA.setFrom(intervalA);
                childB.setFrom(intervalB, intervalB.begin, intervalB.begin + 2);
                this.addGreedy(childA, childB, handler);
                intervalA.advanceToTail(childA);
                intervalB.advanceToTail(childB);
            }
            /*      if (intervalA.length >= lA && intervalB.length >= lB) {
                    // This should not happen == neither one advanced.   Just move ahead in the longer one ..
                    if (intervalA.length > intervalB.length)
                      intervalA.advanceBegin();
                    else intervalB.advanceBegin();
                  } */
        }
        // catch everything else blindly
        this.addGreedy(intervalA, intervalB, handler);
    }
    static createContext(planarTurnAngle = this.defaultNearColinearAngle) {
        return new GreedyTriangulationBetweenLineStrings(planarTurnAngle.radians);
    }
}
exports.GreedyTriangulationBetweenLineStrings = GreedyTriangulationBetweenLineStrings;
/** Default angle for considering two vectors to be colinear */
GreedyTriangulationBetweenLineStrings.defaultNearColinearAngle = Angle_1.Angle.createDegrees(15);
/**
 * * If there are no contiguous duplicated points in `data` return `data` unchanged.
 * * If there are duplicates, compress to a new array.
 * @param data
 * @param tolerance
 */
function resolveToNoDuplicates(data, tolerance = Geometry_1.Geometry.smallMetricDistance) {
    let hasDuplicates = false;
    const n = data.length;
    for (let i = 0; i + 1 < n; i++) {
        if (data.distanceIndexIndex(i, i + 1) <= tolerance) {
            hasDuplicates = true;
            break;
        }
    }
    if (!hasDuplicates)
        return data;
    const result = new GrowableXYZArray_1.GrowableXYZArray(n);
    result.pushXYZ(data.getXAtUncheckedPointIndex(0), data.getYAtUncheckedPointIndex(0), data.getZAtUncheckedPointIndex(0));
    let i0 = 0;
    for (let i = 1; i < n; i++) {
        if (data.distanceIndexIndex(i0, i) > tolerance) {
            result.pushXYZ(data.getXAtUncheckedPointIndex(i), data.getYAtUncheckedPointIndex(i), data.getZAtUncheckedPointIndex(i));
            i0 = i;
        }
    }
    /** enforce exact closure if original was closed. */
    if (data.distanceIndexIndex(0, n - 1) <= tolerance) {
        result.pop();
        result.pushFromGrowableXYZArray(result, 0);
    }
    return result;
}
//# sourceMappingURL=GreedyTriangulationBetweenLineStrings.js.map