"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Curve */
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Geometry_1 = require("../Geometry");
/**
 * An enumeration of special conditions being described by a CurveLocationDetail.
 */
var CurveIntervalRole;
(function (CurveIntervalRole) {
    /** This point is an isolated point NOT at a primary vertex. */
    CurveIntervalRole[CurveIntervalRole["isolated"] = 0] = "isolated";
    /**  This point is an isolated vertex hit */
    CurveIntervalRole[CurveIntervalRole["isolatedAtVertex"] = 1] = "isolatedAtVertex";
    /** This is the beginning of an interval */
    CurveIntervalRole[CurveIntervalRole["intervalStart"] = 10] = "intervalStart";
    /** This is an interior point of an interval. */
    CurveIntervalRole[CurveIntervalRole["intervalInterior"] = 11] = "intervalInterior";
    /** This is the end of an interval */
    CurveIntervalRole[CurveIntervalRole["intervalEnd"] = 12] = "intervalEnd";
})(CurveIntervalRole = exports.CurveIntervalRole || (exports.CurveIntervalRole = {}));
/**
 * Return code for CurvePrimitive method `moveSignedDistanceFromFraction`
 */
var CurveSearchStatus;
(function (CurveSearchStatus) {
    /** unimplemented or zero length curve  */
    CurveSearchStatus[CurveSearchStatus["error"] = 0] = "error";
    /** complete success of search */
    CurveSearchStatus[CurveSearchStatus["success"] = 1] = "success";
    /** search ended prematurely (e.g. at incomplete distance moved) at start or end of curve */
    CurveSearchStatus[CurveSearchStatus["stoppedAtBoundary"] = 2] = "stoppedAtBoundary";
})(CurveSearchStatus = exports.CurveSearchStatus || (exports.CurveSearchStatus = {}));
/**
 * use to update a vector in case where source and prior result are both possibly undefined.
 * * Any undefined source returns undefined.
 * * For defined source, reuse optional result if available.
 * @param source optional source
 * @param result optional result
 */
function optionalVectorUpdate(source, result) {
    if (source) {
        return source.clone(result);
    }
    return undefined;
}
/**
 * CurveLocationDetail carries point and paramter data about a point evaluated on a curve.
 */
class CurveLocationDetail {
    constructor() {
        this.pointQ = Point3dVector3d_1.Point3d.createZero();
        this.fraction = 0;
        this.point = Point3dVector3d_1.Point3d.createZero();
        this.a = 0.0;
    }
    /** Set the (optional) intervalRole field */
    setIntervalRole(value) {
        this.intervalRole = value;
    }
    /** test if this is an isolated point. This is true if intervalRole is any of (undefined, isolated, isolatedAtVertex) */
    get isIsolated() {
        return this.intervalRole === undefined
            || this.intervalRole === CurveIntervalRole.isolated
            || this.intervalRole === CurveIntervalRole.isolatedAtVertex;
    }
    /** Return a complete copy, WITH CAVEATS . . .
     * * curve member is copied as a reference.
     * * point and vector members are cloned.
     */
    clone(result) {
        if (result === this)
            return result;
        result = result ? result : new CurveLocationDetail();
        result.curve = this.curve;
        result.fraction = this.fraction;
        result.point.setFromPoint3d(this.point);
        result.vectorInCurveLocationDetail = optionalVectorUpdate(this.vectorInCurveLocationDetail, result.vectorInCurveLocationDetail);
        result.a = this.a;
        result.curveSearchStatus = this.curveSearchStatus;
        return result;
    }
    /**
     * Updated in this instance.
     * * Note that if caller omits `vector` and `a`, those fields are updated to the call-list defaults (NOT left as-is)
     * * point and vector updates are by data copy (not capture of arglist pointers)
     * @param fraction (required) fraction to install
     * @param point  (required) point to install
     * @param vector (optional) vector to install.
     * @param a (optional) numeric value to install.
     */
    setFP(fraction, point, vector, a = 0.0) {
        this.fraction = fraction;
        this.point.setFrom(point);
        this.vectorInCurveLocationDetail = optionalVectorUpdate(vector, this.vectorInCurveLocationDetail);
        this.a = a;
    }
    /**
     * Updated in this instance.
     * * Note that if caller omits a`, that field is updated to the call-list default (NOT left as-is)
     * * point and vector updates are by data copy (not capture of arglist data.
     * @param fraction (required) fraction to install
     * @param ray  (required) point and vector to install
     * @param a (optional) numeric value to install.
     */
    setFR(fraction, ray, a = 0) {
        return this.setFP(fraction, ray.origin, ray.direction, a);
    }
    /** Set the CurvePrimitive pointer, leaving all other properties untouched.
     */
    setCurve(curve) { this.curve = curve; }
    /** record the distance from the CurveLocationDetail's point to the parameter point. */
    setDistanceTo(point) {
        this.a = this.point.distance(point);
    }
    /** create with a CurvePrimitive pointer but no coordinate data.
     */
    static create(curve, result) {
        result = result ? result : new CurveLocationDetail();
        result.curve = curve;
        return result;
    }
    /** create with CurvePrimitive pointer, fraction, and point coordinates.
     */
    static createCurveFractionPoint(curve, fraction, point, result) {
        result = result ? result : new CurveLocationDetail();
        result.curve = curve;
        result.fraction = fraction;
        result.point.setFromPoint3d(point);
        result.vectorInCurveLocationDetail = undefined;
        result.a = 0.0;
        result.curveSearchStatus = undefined;
        return result;
    }
    /** create with CurvePrimitive pointer, fraction, and point coordinates
     */
    static createCurveFractionPointDistanceCurveSearchStatus(curve, fraction, point, distance, status, result) {
        result = result ? result : new CurveLocationDetail();
        result.curve = curve;
        result.fraction = fraction;
        result.point.setFromPoint3d(point);
        result.vectorInCurveLocationDetail = undefined;
        result.a = distance;
        result.curveSearchStatus = status;
        return result;
    }
    /** create with curveSearchStatus affected by allowExtension.
     * *
     */
    static createConditionalMoveSignedDistance(allowExtension, curve, startFraction, endFraction, requestedSignedDistance, result) {
        let a = requestedSignedDistance;
        let status = CurveSearchStatus.success;
        if (!allowExtension && !Geometry_1.Geometry.isIn01(endFraction)) {
            // cap the movement at the endponit
            if (endFraction < 0.0) {
                a = -curve.curveLengthBetweenFractions(startFraction, 0.0);
                endFraction = 0.0;
                status = CurveSearchStatus.stoppedAtBoundary;
            }
            else if (endFraction > 1.0) {
                endFraction = 1.0;
                a = curve.curveLengthBetweenFractions(startFraction, 1.0);
                status = CurveSearchStatus.stoppedAtBoundary;
            }
        }
        result = result ? result : new CurveLocationDetail();
        result.curve = curve;
        result.fraction = endFraction;
        result.point = curve.fractionToPoint(endFraction, result.point);
        result.vectorInCurveLocationDetail = undefined;
        result.a = a;
        result.curveSearchStatus = status;
        return result;
    }
    /** create with CurvePrimitive pointer, fraction, and point coordinates.
     */
    static createCurveEvaluatedFraction(curve, fraction, result) {
        result = result ? result : new CurveLocationDetail();
        result.curve = curve;
        result.fraction = fraction;
        result.point = curve.fractionToPoint(fraction);
        result.vectorInCurveLocationDetail = undefined;
        result.curveSearchStatus = undefined;
        result.a = 0.0;
        return result;
    }
    /** create with CurvePrimitive pointer, fraction, and point coordinates.
     */
    static createCurveFractionPointDistance(curve, fraction, point, a, result) {
        result = result ? result : new CurveLocationDetail();
        result.curve = curve;
        result.fraction = fraction;
        result.point.setFromPoint3d(point);
        result.vectorInCurveLocationDetail = undefined;
        result.a = a;
        result.curveSearchStatus = undefined;
        return result;
    }
    /** update or create if closer than current contents.
     * @param curve candidate curve
     * @param fraction candidate fraction
     * @param point candidate point
     * @param a candidate distance
     * @returns true if the given distance is smaller (and hence this detail was updated.)
     */
    updateIfCloserCurveFractionPointDistance(curve, fraction, point, a) {
        if (this.a < a)
            return false;
        CurveLocationDetail.createCurveFractionPointDistance(curve, fraction, point, a, this);
        return true;
    }
}
exports.CurveLocationDetail = CurveLocationDetail;
/** A pair of CurveLocationDetail. */
class CurveLocationDetailPair {
    constructor() {
        this.detailA = new CurveLocationDetail();
        this.detailB = new CurveLocationDetail();
    }
    /** Create a curve detail pair using references to two CurveLocationDetails */
    static createDetailRef(detailA, detailB, result) {
        result = result ? result : new CurveLocationDetailPair();
        result.detailA = detailA;
        result.detailB = detailB;
        return result;
    }
    /** Make a deep copy of this CurveLocationDetailPair */
    clone(result) {
        result = result ? result : new CurveLocationDetailPair();
        result.detailA = this.detailA.clone();
        result.detailB = this.detailB.clone();
        return result;
    }
}
exports.CurveLocationDetailPair = CurveLocationDetailPair;
//# sourceMappingURL=CurveLocationDetail.js.map