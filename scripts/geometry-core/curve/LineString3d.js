"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Geometry_1 = require("../Geometry");
const PointVector_1 = require("../PointVector");
const Transform_1 = require("../Transform");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const GrowableArray_1 = require("../GrowableArray");
const CurvePrimitive_1 = require("./CurvePrimitive");
/* tslint:disable:variable-name no-empty*/
/* Starting wtih baseIndex and moving index by stepDirection:
If the vector from baseIndex to baseIndex +1 crossed with vectorA can be normalized, accumulate it (scaled) to normal.
Return when successful.
(Do nothing if everything is parallel through limits of the array)
*/
function accumulateGoodUnitPerpendicular(points, vectorA, baseIndex, stepDirection, weight, normal, workVector) {
    const n = points.length;
    if (stepDirection > 0) {
        for (let i = baseIndex; i + 1 < n; i++) {
            points.vectorIndexIndex(i + 1, i, workVector);
            vectorA.crossProduct(workVector, workVector);
            if (workVector.normalizeInPlace()) {
                normal.addScaledInPlace(workVector, weight);
                return true;
            }
        }
    }
    else {
        if (baseIndex + 1 >= n)
            baseIndex = n - 2;
        for (let i = baseIndex; i >= 0; i--) {
            points.vectorIndexIndex(i, i + 1, workVector);
            vectorA.crossProduct(workVector, workVector);
            if (workVector.normalizeInPlace()) {
                normal.addScaledInPlace(workVector, weight);
                return true;
            }
        }
    }
    return false;
}
class LineString3d extends CurvePrimitive_1.CurvePrimitive {
    constructor() {
        super();
        this._points = new GrowableArray_1.GrowableXYZArray();
    }
    isSameGeometryClass(other) { return other instanceof LineString3d; }
    /** return the points array (cloned). */
    get points() { return this._points.getPoint3dArray(); }
    /** Return (reference to) point data in packed GrowableXYZArray. */
    get packedPoints() { return this._points; }
    cloneTransformed(transform) {
        const c = this.clone();
        c.tryTransformInPlace(transform);
        return c;
    }
    static flattenArray(arr) {
        return arr.reduce((flat, toFlatten) => {
            return flat.concat(Array.isArray(toFlatten) ? LineString3d.flattenArray(toFlatten) : toFlatten);
        }, []);
    }
    static create(...points) {
        const result = new LineString3d();
        result.addPoints(points);
        return result;
    }
    static createXY(points, z, enforceClosure = false) {
        const result = new LineString3d();
        const xyz = result._points;
        for (const xy of points) {
            xyz.pushXYZ(xy.x, xy.y, z);
        }
        if (enforceClosure && points.length > 1) {
            const distance = xyz.distance(0, xyz.length - 1);
            if (distance !== 0.0) {
                if (Geometry_1.Geometry.isSameCoordinate(0, distance)) {
                    xyz.pop(); // nonzero but small distance -- to be replaced by point 0 exactly.
                    const xyzA = xyz.front();
                    xyz.push(xyzA);
                }
            }
        }
        result.addPoints(points);
        return result;
    }
    addPoints(...points) {
        const toAdd = LineString3d.flattenArray(points);
        for (const p of toAdd) {
            if (p instanceof PointVector_1.Point3d)
                this._points.push(p);
        }
    }
    addPoint(point) {
        this._points.push(point);
    }
    /**
     * If the linestring is not already closed, add a closure point.
     */
    addClosurePoint() {
        const n = this._points.length;
        if (n > 1) {
            if (!Geometry_1.Geometry.isSameCoordinate(0, this._points.distance(0, n - 1)))
                this._points.pushWrap(1);
        }
    }
    popPoint() {
        this._points.pop();
    }
    static createRectangleXY(point0, ax, ay, closed) {
        const ls = LineString3d.create(point0, point0.plusXYZ(ax, 0), point0.plusXYZ(ax, ay), point0.plusXYZ(0, ay));
        if (closed)
            ls.addPoint(point0);
        return ls;
    }
    setFrom(other) {
        this._points.clear();
        let i = 0;
        while (other._points.isIndexValid(i)) {
            this._points.push(other._points.getPoint3dAt(i));
            i++;
        }
    }
    static createPoints(points) {
        const ls = new LineString3d();
        let point;
        for (point of points)
            ls._points.push(point);
        return ls;
    }
    /** Create a LineString3d from xyz coordinates packed in a Float64Array */
    static createFloat64Array(xyzData) {
        const ls = new LineString3d();
        for (let i = 0; i + 3 <= xyzData.length; i += 3)
            ls._points.push(PointVector_1.Point3d.create(xyzData[i], xyzData[i + 1], xyzData[i + 2]));
        return ls;
    }
    clone() {
        const retVal = new LineString3d();
        retVal.setFrom(this);
        return retVal;
    }
    setFromJSON(json) {
        this._points.clear();
        if (Array.isArray(json)) {
            let xyz;
            for (xyz of json)
                this._points.push(PointVector_1.Point3d.fromJSON(xyz));
        }
    }
    /**
     * Convert an LineString3d to a JSON object.
     * @return {*} [[x,y,z],...[x,y,z]]
     */
    toJSON() {
        const value = [];
        let i = 0;
        while (this._points.isIndexValid(i)) {
            value.push(this._points.getPoint3dAt(i).toJSON());
            i++;
        }
        return value;
    }
    static fromJSON(json) {
        const ls = new LineString3d();
        ls.setFromJSON(json);
        return ls;
    }
    fractionToPoint(fraction, result) {
        const n = this._points.length;
        if (n === 0)
            return PointVector_1.Point3d.createZero();
        if (n === 1)
            return PointVector_1.Point3d.createFrom(this._points.getPoint3dAt(0), result);
        const df = 1.0 / (n - 1);
        if (fraction <= df)
            return this._points.interpolate(0, fraction / df, 1, result);
        if (fraction + df >= 1.0)
            return this._points.interpolate(n - 1, (1.0 - fraction) / df, n - 2, result);
        const index0 = Math.floor(fraction / df);
        return this._points.interpolate(index0, (fraction - index0 * df) / df, index0 + 1, result);
    }
    fractionToPointAndDerivative(fraction, result) {
        result = result ? result : AnalyticGeometry_1.Ray3d.createZero();
        const n = this._points.length;
        if (n <= 1) {
            result.direction.setZero();
            if (n === 1)
                result.origin.setFrom(this._points.getPoint3dAt(0));
            else
                result.origin.setZero();
            return result;
        }
        const numSegment = n - 1;
        const df = 1.0 / numSegment;
        if (fraction <= df) {
            result = result ? result : AnalyticGeometry_1.Ray3d.createZero();
            this._points.interpolate(0, fraction / df, 1, result.origin);
            this._points.vectorIndexIndex(0, 1, result.direction);
            result.direction.scaleInPlace(1.0 / df);
            return result;
        }
        if (fraction + df >= 1.0) {
            result = result ? result : AnalyticGeometry_1.Ray3d.createZero();
            this._points.interpolate(n - 2, 1.0 - (1.0 - fraction) / df, n - 1, result.origin);
            this._points.vectorIndexIndex(n - 2, n - 1, result.direction);
            result.direction.scaleInPlace(1.0 / df);
            return result;
        }
        /* true interior point */
        result = result ? result : AnalyticGeometry_1.Ray3d.createZero();
        const index0 = Math.floor(fraction / df);
        const localFraction = (fraction - index0 * df) / df;
        this._points.interpolate(index0, localFraction, index0 + 1, result.origin);
        this._points.vectorIndexIndex(index0, index0 + 1, result.direction);
        result.direction.scaleInPlace(1.0 / df);
        return result;
    }
    /** Return point and derivative at fraction, with 000 second derivative. */
    fractionToPointAnd2Derivatives(fraction, result) {
        const ray = this.fractionToPointAndDerivative(fraction);
        result = AnalyticGeometry_1.Plane3dByOriginAndVectors.createCapture(ray.origin, ray.direction, PointVector_1.Vector3d.createZero(), result);
        return result;
    }
    /**
     * Convert a segment index and local fraction to a global fraction.
     * @param index index of segment being evaluated
     * @param localFraction local fraction within that segment
     */
    segmentIndexAndLocalFractionToGlobalFraction(index, localFraction) {
        const numSegment = this._points.length - 1;
        if (numSegment < 1)
            return 0.0;
        return (index + localFraction) / numSegment;
    }
    /** Return a frenet frame, using nearby points to estimate a plane. */
    fractionToFrenetFrame(fraction, result) {
        const n = this._points.length;
        if (n <= 1) {
            if (n === 1)
                return Transform_1.Transform.createTranslation(this._points.getPoint3dAt(0), result);
            return Transform_1.Transform.createIdentity(result);
        }
        if (n === 2)
            return Transform_1.Transform.createRefs(this._points.interpolate(0, fraction, 1), Transform_1.RotMatrix.createRigidHeadsUp(this._points.vectorIndexIndex(0, 1), 0 /* XYZ */));
        /** 3 or more points. */
        const numSegment = n - 1;
        const df = 1.0 / numSegment;
        let baseIndex = 0;
        let localFraction = 0;
        if (fraction <= df) {
            localFraction = fraction / df;
            baseIndex = 0;
        }
        else if (fraction + df >= 1.0) {
            baseIndex = n - 2;
            localFraction = 1.0 - (1.0 - fraction) / df;
        }
        else {
            baseIndex = Math.floor(fraction / df);
            localFraction = fraction * numSegment - baseIndex;
        }
        const origin = this._points.interpolate(baseIndex, localFraction, baseIndex + 1);
        const vectorA = this._points.vectorIndexIndex(baseIndex, baseIndex + 1);
        // tricky stuff to handle colinear points.   But if vectorA is zero it is still a mess . ..
        const normal = PointVector_1.Vector3d.create();
        const workVector = PointVector_1.Vector3d.create();
        // try forming normal using both forward and reverse stepping.
        // if at an end segment, only one will succeed.
        // if interior, both produce candidates, both can succeed and will be weighted.
        accumulateGoodUnitPerpendicular(this._points, vectorA, baseIndex - 1, -1, localFraction, normal, workVector);
        accumulateGoodUnitPerpendicular(this._points, vectorA, baseIndex + 1, 1, (1.0 - localFraction), normal, workVector);
        const matrix = Transform_1.RotMatrix.createRigidFromColumns(normal, vectorA, 2 /* ZXY */);
        if (matrix)
            return Transform_1.Transform.createOriginAndMatrix(origin, matrix, result);
        return Transform_1.Transform.createTranslation(origin, result);
    }
    startPoint() {
        if (this._points.length === 0)
            return PointVector_1.Point3d.createZero();
        return this._points.getPoint3dAt(0);
    }
    pointAt(i, result) {
        return this._points.getPoint3dAt(i, result);
    }
    numPoints() { return this._points.length; }
    endPoint() {
        if (this._points.length === 0)
            return PointVector_1.Point3d.createZero();
        return this._points.getPoint3dAt(this._points.length - 1);
    }
    reverseInPlace() {
        if (this._points.length >= 2) {
            let i0 = 0;
            let i1 = this._points.length - 1;
            let a = this._points.getPoint3dAt(0);
            while (i0 < i1) {
                a = this._points.getPoint3dAt(i0);
                this._points.setAt(i0, this._points.getPoint3dAt(i1));
                this._points.setAt(i1, a);
                i0++;
                i1--;
            }
        }
    }
    tryTransformInPlace(transform) {
        this._points.transformInPlace(transform);
        return true;
    }
    curveLength() { return this._points.sumLengths(); }
    quickLength() { return this.curveLength(); }
    closestPoint(spacePoint, extend, result) {
        result = CurvePrimitive_1.CurveLocationDetail.create(this, result);
        const numPoints = this._points.length;
        if (numPoints > 0) {
            const lastIndex = numPoints - 1;
            result.setFP(1.0, this._points.getPoint3dAt(lastIndex), undefined);
            result.setDistanceTo(spacePoint);
            if (numPoints > 1) {
                let segmentFraction = 0;
                let d = 0;
                const df = 1.0 / lastIndex;
                for (let i = 1; i < numPoints; i++) {
                    segmentFraction = spacePoint.fractionOfProjectionToLine(this._points.getPoint3dAt(i - 1), this._points.getPoint3dAt(i));
                    if (segmentFraction < 0) {
                        if (!extend || i > 1)
                            segmentFraction = 0.0;
                    }
                    else if (segmentFraction > 1.0) {
                        if (!extend || i < lastIndex)
                            segmentFraction = 1.0;
                    }
                    this._points.getPoint3dAt(i - 1).interpolate(segmentFraction, this._points.getPoint3dAt(i), result.pointQ);
                    d = result.pointQ.distance(spacePoint);
                    if (d < result.a) {
                        result.setFP((i - 1 + segmentFraction) * df, result.pointQ, undefined, d);
                    }
                }
            }
        }
        return result;
    }
    isInPlane(plane) {
        return this._points.isCloseToPlane(plane, Geometry_1.Geometry.smallMetricDistance);
    }
    /** push a hit, fixing up the prior entry if needed.
     * return the incremented counter.
     */
    static pushVertexHit(result, counter, cp, fraction, point) {
        const detail = CurvePrimitive_1.CurveLocationDetail.createCurveFractionPoint(cp, fraction, point);
        result.push(detail);
        if (counter === 0) {
            detail.setIntervalRole(CurvePrimitive_1.CurveIntervalRole.isolatedAtVertex);
        }
        else if (counter === 1) {
            result[result.length - 2].setIntervalRole(CurvePrimitive_1.CurveIntervalRole.intervalStart);
            detail.setIntervalRole(CurvePrimitive_1.CurveIntervalRole.intervalEnd);
        }
        else {
            result[result.length - 2].setIntervalRole(CurvePrimitive_1.CurveIntervalRole.intervalInterior);
            detail.setIntervalRole(CurvePrimitive_1.CurveIntervalRole.intervalEnd);
        }
    }
    /** find intersections with a plane.
     *  Intersections within segments are recorded as CurveIntervalRole.isolated
     *   Intersections at isolated "on" vertex are recoded as CurveIntervalRole.isolatedAtVertex.
     */
    appendPlaneIntersectionPoints(plane, result) {
        if (this._points.length < 1)
            return 0;
        const initialLength = result.length;
        const n = this._points.length;
        const divisor = n === 1 ? 1.0 : n - 1;
        const pointA = LineString3d.s_workPointA;
        const pointB = LineString3d.s_workPointB;
        const pointC = LineString3d.s_workPointC;
        this._points.getPoint3dAt(0, pointA);
        let hB = 0;
        let numConsecutiveZero = 0;
        let hA = 0;
        let segmentFraction = 0;
        for (let i = 0; i < this._points.length; i++, pointA.setFrom(pointB), hA = hB) {
            this._points.getPoint3dAt(i, pointB);
            hB = Geometry_1.Geometry.correctSmallMetricDistance(plane.altitude(pointB));
            if (hB === 0.0)
                LineString3d.pushVertexHit(result, numConsecutiveZero++, this, i / divisor, pointB);
            else {
                if (hA * hB < 0.0) {
                    segmentFraction = hA / (hA - hB); // this division is safe because the signs are different.
                    pointA.interpolate(segmentFraction, pointB, pointC);
                    const detail = CurvePrimitive_1.CurveLocationDetail.createCurveFractionPoint(this, (i - 1 + segmentFraction) / divisor, pointC);
                    detail.setIntervalRole(CurvePrimitive_1.CurveIntervalRole.isolated);
                    result.push(detail);
                    numConsecutiveZero = 0;
                }
            }
        }
        return result.length - initialLength;
    }
    extendRange(rangeToExtend, transform) { this._points.extendRange(rangeToExtend, transform); }
    isAlmostEqual(other) {
        if (!(other instanceof LineString3d))
            return false;
        if (!GrowableArray_1.GrowableXYZArray.isAlmostEqual(this._points, other._points))
            return false;
        return true;
    }
    /** Append (clone of) one point.
     * BUT ... skip if duplicates the tail of prior points.
     */
    appendStrokePoint(point) {
        const n = this._points.length;
        if (n === 0 || !point.isAlmostEqual(this._points.getPoint3dAt(n - 1)))
            this._points.push(point);
    }
    clear() { this._points.clear(); }
    /** Evaluate a curve at uniform fractions.  Append the evaluations to this linestring.
     * @param curve primitive to evaluate.
     * @param numStrokes number of strokes (edges).
     * @param fraction0 starting fraction coordinate
     * @param fraction1 end fraction coordinate
     * @param include01 if false, points at fraction0 and fraction1 are omitted.
     */
    appendFractionalStrokePoints(curve, numStrokes, fraction0 = 0, fraction1 = 1, include01) {
        if (include01)
            this.appendStrokePoint(curve.fractionToPoint(fraction0));
        if (numStrokes > 1) {
            const df = (fraction1 - fraction0) / numStrokes;
            for (let i = 1; i < numStrokes; i++)
                this.appendStrokePoint(curve.fractionToPoint(fraction0 + i * df));
        }
        if (include01)
            this.appendStrokePoint(curve.fractionToPoint(fraction1));
    }
    appendInterpolatedStrokePoints(numStrokes, point0, point1, include01) {
        if (include01)
            this.appendStrokePoint(point0);
        if (numStrokes > 1) {
            const df = 1.0 / numStrokes;
            for (let i = 1; i < numStrokes; i++)
                this.appendStrokePoint(point0.interpolate(i * df, point1));
        }
        if (include01)
            this.appendStrokePoint(point1);
    }
    /** Emit strokes to caller-supplied linestring */
    emitStrokes(dest, options) {
        const n = this._points.length;
        const pointA = LineString3d.s_workPointA;
        const pointB = LineString3d.s_workPointB;
        if (n > 0) {
            // This is a linestring.
            // There is no need for chordTol and angleTol within a segment.
            // Do NOT apply minstrokes per primitive.
            if (options && options.hasMaxEdgeLength()) {
                dest.appendStrokePoint(this._points.getPoint3dAt(0));
                for (let i = 1; i < n; i++) {
                    this._points.getPoint3dAt(i - 1, pointA);
                    this._points.getPoint3dAt(i, pointB);
                    const numStroke = options.applyMaxEdgeLength(1, pointA.distance(pointB));
                    if (numStroke > 1)
                        dest.appendInterpolatedStrokePoints(numStroke, pointA, pointB, false);
                    dest.appendStrokePoint(pointB);
                }
            }
            else {
                for (let i = 0; i < n; i++) {
                    dest.appendStrokePoint(this._points.getPoint3dAt(i));
                }
            }
        }
    }
    /** Emit strokable parts of the curve to a caller-supplied handler.
     * If the stroke options does not have a maxEdgeLength, one stroke is emited for each segment of the linestring.
     * If the stroke options has a maxEdgeLength, smaller segments are emitted as needed.
     */
    emitStrokableParts(handler, options) {
        const n = this._points.length;
        handler.startCurvePrimitive(this);
        if (n > 1) {
            const df = 1.0 / (n - 1);
            // This is a linestring.
            // There is no need for chordTol and angleTol within a segment.
            // Do NOT apply minstrokes per primitive.
            if (options && options.hasMaxEdgeLength()) {
                for (let i = 1; i < n; i++) {
                    const numStroke = options.applyMaxEdgeLength(1, this._points.getPoint3dAt(i - 1).distance(this._points.getPoint3dAt(i)));
                    handler.announceSegmentInterval(this, this._points.getPoint3dAt(i - 1), this._points.getPoint3dAt(i), numStroke, (i - 1) * df, i * df);
                }
            }
            else {
                for (let i = 1; i < n; i++) {
                    handler.announceSegmentInterval(this, this._points.getPoint3dAt(i - 1), this._points.getPoint3dAt(i), 1, (i - 1) * df, i * df);
                }
            }
        }
        handler.endCurvePrimitive(this);
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleLineString3d(this);
    }
    // HARD TO TEST -- tests that get to announceClipInterval for arc, bspline do NOT get here with
    // linestring because the controller has special case loops through segments?
    /**
     * Find intervals of this curveprimitve that are interior to a clipper
     * @param clipper clip structure (e.g. clip planes)
     * @param announce (optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(clipper, announce) {
        const n = this._points.length;
        if (n < 2)
            return false;
        let globalFractionA = 0.0;
        let globalFractionB = 1.0;
        const capture = (localFraction0, localFraction1) => {
            if (announce)
                announce(Geometry_1.Geometry.interpolate(globalFractionA, localFraction0, globalFractionB), Geometry_1.Geometry.interpolate(globalFractionA, localFraction1, globalFractionB), this);
        };
        const pointA = LineString3d.s_workPointA;
        const pointB = LineString3d.s_workPointB;
        this._points.getPoint3dAt(0, pointA);
        let status = false;
        for (let i = 1; i < n; i++, pointA.setFrom(pointB), globalFractionA = globalFractionB) {
            this._points.getPoint3dAt(i, pointB);
            globalFractionB = i / (n - 1);
            if (clipper.announceClippedSegmentIntervals(0.0, 1.0, pointA, pointB, capture))
                status = true;
        }
        return status;
    }
    addResolvedPoint(index, fraction, dest) {
        const n = this._points.length;
        if (n === 0)
            return;
        if (n === 1) {
            this._points.getPoint3dAt(0, LineString3d.s_indexPoint);
            dest.push(LineString3d.s_indexPoint);
            return;
        }
        if (index < 0)
            index = 0;
        if (index >= n) {
            index = n - 1;
            fraction += 1;
        }
        this._points.interpolate(index, fraction, index + 1, LineString3d.s_indexPoint);
        dest.push(LineString3d.s_indexPoint);
    }
    /** Return (if possible) a LineString which is a portion of this curve.
     * @param fractionA [in] start fraction
     * @param fractionB [in] end fraction
     */
    clonePartialCurve(fractionA, fractionB) {
        if (fractionB < fractionA) {
            const linestringA = this.clonePartialCurve(fractionB, fractionA);
            if (linestringA)
                linestringA.reverseInPlace();
            return linestringA;
        }
        const n = this._points.length;
        const numEdge = n - 1;
        if (n < 2 || fractionA >= 1.0 || fractionB <= 0.0)
            return undefined;
        if (fractionA < 0)
            fractionA = 0;
        if (fractionB > 1)
            fractionB = 1;
        const gA = fractionA * numEdge;
        const gB = fractionB * numEdge;
        const indexA = Math.floor(gA);
        const indexB = Math.floor(gB);
        const localFractionA = gA - indexA;
        const localFractionB = gB - indexB;
        const result = LineString3d.create();
        this.addResolvedPoint(indexA, localFractionA, result._points);
        for (let index = indexA + 1; index <= indexB; index++) {
            this._points.getPoint3dAt(index, LineString3d.s_workPointA);
            result._points.push(LineString3d.s_workPointA);
        }
        if (!Geometry_1.Geometry.isSmallRelative(localFractionB)) {
            this.addResolvedPoint(indexB, localFractionB, result._points);
        }
        return result;
    }
}
LineString3d.s_workPointA = PointVector_1.Point3d.create();
LineString3d.s_workPointB = PointVector_1.Point3d.create();
LineString3d.s_workPointC = PointVector_1.Point3d.create();
LineString3d.s_indexPoint = PointVector_1.Point3d.create(); // private point for indexAndFractionToPoint.
exports.LineString3d = LineString3d;
/** An AnnotatedLineString3d is a linestring with additional data attached to each point
 * * This is useful in facet construction.
 */
class AnnotatedLineString3d {
}
exports.AnnotatedLineString3d = AnnotatedLineString3d;
//# sourceMappingURL=LineString3d.js.map