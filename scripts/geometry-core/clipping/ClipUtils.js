"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
const PointVector_1 = require("../PointVector");
/** Static class whose various methods are functions for clipping geometry. */
class ClipUtilities {
    static selectIntervals01(curve, unsortedFractions, clipper, announce) {
        unsortedFractions.push(0);
        unsortedFractions.push(1);
        unsortedFractions.sort();
        let f0 = unsortedFractions.at(0);
        let f1;
        let fMid;
        const testPoint = ClipUtilities.sSelectIntervals01TestPoint;
        const n = unsortedFractions.length;
        for (let i = 1; i < n; i++, f0 = f1) {
            f1 = unsortedFractions.at(i);
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
     * @param announce funtion to receive data
     */
    static announceNNC(intervals, cp, announce) {
        if (announce) {
            for (const ab of intervals) {
                announce(ab.low, ab.high, cp);
            }
        }
        return intervals.length > 0;
    }
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
     * Clip a polygon down to regions defined by each shape of a ClipVector.
     * @return An multidimensional array of points, where each array is the boundary of a clipped polygon.
     */
    static clipPolygonToClipVector(polygon, clipVec) {
        const output = [];
        for (const primitive of clipVec.clips) {
            const setOutput = [];
            primitive.fetchClipPlanesRef().polygonClip(polygon, setOutput);
            output.push(setOutput);
        }
        return output;
    }
    /** Given an array of points, return whether or not processing is required to clip to a ClipPlaneSet region. */
    static pointSetSingleClipStatus(points, planeSet, tolerance) {
        if (planeSet.convexSets.length === 0)
            return 2 /* TrivialAccept */;
        for (const convexSet of planeSet.convexSets) {
            let allOutsideSinglePlane = false, anyOutside = false;
            for (const plane of convexSet.planes) {
                let numInside = 0, numOutside = 0;
                const planeDistance = plane.distance - tolerance;
                const currPt = PointVector_1.Point3d.create();
                const currVec = PointVector_1.Vector3d.create();
                for (let i = 0; i < points.length; i++) {
                    points.getPoint3dAt(i, currPt);
                    currVec.setFrom(currPt);
                    currVec.dotProduct(plane.inwardNormalRef) > planeDistance ? numInside++ : numOutside++;
                }
                anyOutside = (numOutside !== 0) ? true : anyOutside;
                if (numInside === 0) {
                    allOutsideSinglePlane = true;
                    break;
                }
            }
            if (!anyOutside)
                return 2 /* TrivialAccept */;
            if (!allOutsideSinglePlane)
                return 0 /* ClipRequired */;
        }
        return 1 /* TrivialReject */;
    }
}
ClipUtilities.sSelectIntervals01TestPoint = PointVector_1.Point3d.create();
exports.ClipUtilities = ClipUtilities;
//# sourceMappingURL=ClipUtils.js.map