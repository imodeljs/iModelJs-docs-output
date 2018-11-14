"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Bspline */
// import { Point2d } from "../Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty no-console*/
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const Bezier1dNd_1 = require("./Bezier1dNd");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
/**
 * Base class for CurvePrimitve (necessarily 3D) with _polygon.
 * * This has a Bezier1dNd polygon as a member, and implements dimension-indendent methods
 * * This exists to support BezeierCurve3d and BezierCurve3dH.
 * * The implementations of "pure 3d" queries is based on calling `getPolePoint3d`.
 * * This has the subtle failure difference that `getPolePoint3d` call with a valid index on on a 3d curve always succeeds, but on 3dH curve fails when weight is zero.
 */
class BezierCurveBase extends CurvePrimitive_1.CurvePrimitive {
    constructor(blockSize, data) {
        super();
        this._polygon = new Bezier1dNd_1.Bezier1dNd(blockSize, data);
        this._workPoint0 = Point3dVector3d_1.Point3d.create();
        this._workPoint1 = Point3dVector3d_1.Point3d.create();
        this._workData0 = new Float64Array(blockSize);
        this._workData1 = new Float64Array(blockSize);
    }
    /** reverse the poles in place */
    reverseInPlace() { this._polygon.reverseInPlace(); }
    /** saturate the pole in place, using knot intervals from `spanIndex` of the `knotVector` */
    saturateInPlace(knotVector, spanIndex) { return this._polygon.saturateInPlace(knotVector, spanIndex); }
    get degree() { return this._polygon.order - 1; }
    get order() { return this._polygon.order; }
    get numPoles() { return this._polygon.order; }
    setInterval(a, b) { this._polygon.setInterval(a, b); }
    fractionToParentFraction(fraction) { return this._polygon.fractionToParentFraction(fraction); }
    /** append stroke points to a linestring, based on `strokeCount` and `fractionToPoint` from derived class*/
    emitStrokes(dest, options) {
        const numPerSpan = this.strokeCount(options);
        const fractionStep = 1.0 / numPerSpan;
        for (let i = 0; i <= numPerSpan; i++) {
            const fraction = i * fractionStep;
            this.fractionToPoint(fraction, this._workPoint0);
            dest.appendStrokePoint(this._workPoint0);
        }
    }
    /** announce intervals with stroke counts */
    emitStrokableParts(handler, _options) {
        const numPerSpan = this.strokeCount(_options);
        handler.announceIntervalForUniformStepStrokes(this, numPerSpan, 0.0, 1.0);
    }
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPolesAsJsonArray() { return this._polygon.unpackToJsonArrays(); }
    /** return true if all poles are on a plane. */
    isInPlane(plane) {
        let point = this._workPoint0;
        for (let i = 0;; i++) {
            point = this.getPolePoint3d(i, point);
            if (!point)
                return true;
            if (!plane.isPointInPlane(point))
                return false;
        }
        return false;
    }
    polygonLength() {
        if (!this.getPolePoint3d(0, this._workPoint0))
            return 0.0;
        let i = 0;
        let sum = 0.0;
        while (this.getPolePoint3d(++i, this._workPoint1)) {
            sum += this._workPoint0.distance(this._workPoint1);
            this._workPoint0.setFrom(this._workPoint1);
        }
        return sum;
    }
    startPoint() {
        const result = this.getPolePoint3d(0);
        if (!result)
            return Point3dVector3d_1.Point3d.createZero();
        return result;
    }
    endPoint() {
        const result = this.getPolePoint3d(this.order - 1);
        if (!result)
            return Point3dVector3d_1.Point3d.createZero();
        return result;
    }
    quickLength() { return this.polygonLength(); }
    /** Extend range by all poles.  */
    extendRange(rangeToExtend, transform) {
        let i = 0;
        if (transform) {
            while (this.getPolePoint3d(i++, this._workPoint0)) {
                rangeToExtend.extendTransformedPoint(transform, this._workPoint0);
            }
        }
        else {
            while (this.getPolePoint3d(i++, this._workPoint0)) {
                rangeToExtend.extend(this._workPoint0);
            }
        }
    }
    /**
     * set up the _workBezier members with specific order.
     * * Try to reuse existing members if their sizes match.
     * * Ignore members corresponding to args that are 0 or negative.
     * @param primaryBezierOrder order of expected bezier
     * @param orderA length of _workCoffsA (simple array)
     * @param orderB length of _workdCoffsB (simple array)
     */
    allocateAndZeroBezierWorkData(primaryBezierOrder, orderA, orderB) {
        if (primaryBezierOrder > 0) {
            if (this._workBezier !== undefined && this._workBezier.order === primaryBezierOrder) {
                this._workBezier.zero();
            }
            else
                this._workBezier = new BezierPolynomials_1.UnivariateBezier(primaryBezierOrder);
        }
        if (orderA > 0) {
            if (this._workCoffsA !== undefined && this._workCoffsA.length === orderA)
                this._workCoffsA.fill(0);
            else
                this._workCoffsA = new Float64Array(orderA);
        }
        if (orderB > 0) {
            if (this._workCoffsB !== undefined && this._workCoffsB.length === orderB)
                this._workCoffsB.fill(0);
            else
                this._workCoffsB = new Float64Array(orderB);
        }
    }
}
exports.BezierCurveBase = BezierCurveBase;
//# sourceMappingURL=BezierCurveBase.js.map