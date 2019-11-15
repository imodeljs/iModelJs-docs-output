"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurvePrimitive_1 = require("../CurvePrimitive");
const Geometry_1 = require("../../Geometry");
const CurveCollection_1 = require("../CurveCollection");
const CurveCurve_1 = require("../CurveCurve");
const Path_1 = require("../Path");
/**
 * Data about a curve cut.
 */
class CutFractionDescriptor {
    constructor(fraction, otherCurveDetail) {
        this.fraction = fraction;
        this.otherCurveDetail = otherCurveDetail;
    }
    /** Transfer data from other to this.
     * * Optionally look at both to set `otherCurveDetail`
     *   * `other.otherCurveDetail` wins over `this.otherCurveDetail`
     */
    setFrom(other, combineCutFlag) {
        if (combineCutFlag && this.isSameFraction(other))
            this.otherCurveDetail = other.otherCurveDetail ? other.otherCurveDetail : this.otherCurveDetail;
        this.fraction = other.fraction;
    }
    /** Test if a the fractions are almost equal. */
    isSameFraction(other) {
        return Geometry_1.Geometry.isSmallAngleRadians(this.fraction - other.fraction);
    }
    /** set from direct data */
    set(fraction, otherCurveDetail) {
        this.fraction = fraction;
        this.otherCurveDetail = otherCurveDetail;
    }
}
/**
 * Context for splitting curves.
 * @internal
 */
class CurveSplitContext {
    // return true if data has one or more non-endpoint intersections.
    static hasInteriorDetailAIntersections(data, fractionTolerance = Geometry_1.Geometry.smallAngleRadians) {
        if (data.length === 0)
            return false;
        for (const pair of data) {
            if (pair.detailA.fraction > fractionTolerance || pair.detailA.fraction < 1 - fractionTolerance)
                return true;
        }
        return false;
    }
    collectFragmentAndAdvanceCut(curveToCut, cutA, cutB, dest) {
        if (!cutA.isSameFraction(cutB)) {
            const fragment = curveToCut.clonePartialCurve(cutA.fraction, cutB.fraction);
            if (fragment !== undefined) {
                fragment.startCut = cutA.otherCurveDetail;
                fragment.endCut = cutB.otherCurveDetail;
                dest.push(fragment);
            }
        }
        cutA.setFrom(cutB, true);
    }
    /** Collect fragments from an intersections array, with the array detailA entries all referencing to curveToCut.
     * * The `intersections` array is sorted on its detailA field.
     */
    collectSinglePrimitiveFragments(curveToCut, intersections, fragments) {
        if (intersections === undefined || !CurveSplitContext.hasInteriorDetailAIntersections(intersections)) {
            const fragment = curveToCut.clone();
            if (fragment)
                fragments.push(fragment);
            return;
        }
        intersections.sort((pairA, pairB) => (pairA.detailA.fraction - pairB.detailA.fraction));
        const cutA = new CutFractionDescriptor(0.0, undefined);
        const cutB = new CutFractionDescriptor(1.0, undefined); // but those values are immediately reset before use.
        for (const pair of intersections) {
            cutB.set(pair.detailA.fraction, pair.detailB);
            this.collectFragmentAndAdvanceCut(curveToCut, cutA, cutB, fragments);
        }
        cutB.set(1.0, undefined);
        this.collectFragmentAndAdvanceCut(curveToCut, cutA, cutB, fragments);
    }
    static cloneCurvesWithXYSplitFlags(curvesToCut, cutterCurves) {
        const context = new CurveSplitContext();
        if (curvesToCut instanceof CurvePrimitive_1.CurvePrimitive) {
            const result = [];
            const intersections = CurveCurve_1.CurveCurve.intersectionXYPairs(curvesToCut, false, cutterCurves, false);
            context.collectSinglePrimitiveFragments(curvesToCut, intersections, result);
            if (result.length === 1)
                return result[0];
            return Path_1.Path.createArray(result);
        }
        else if (curvesToCut instanceof CurveCollection_1.CurveChain) {
            const result = [];
            for (const primitive of curvesToCut.children) {
                const intersections = CurveCurve_1.CurveCurve.intersectionXYPairs(primitive, false, cutterCurves, false);
                context.collectSinglePrimitiveFragments(primitive, intersections, result);
            }
            return Path_1.Path.createArray(result);
        }
        return undefined;
    }
}
exports.CurveSplitContext = CurveSplitContext;
//# sourceMappingURL=CurveSplitContext.js.map