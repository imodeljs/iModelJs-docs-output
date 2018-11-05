"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Bspline */
// import { Point2d } from "../Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty no-console*/
const PointVector_1 = require("../PointVector");
const Geometry4d_1 = require("../numerics/Geometry4d");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const StrokeOptions_1 = require("../curve/StrokeOptions");
const Geometry_1 = require("../Geometry");
const LineString3d_1 = require("../curve/LineString3d");
const PointHelpers_1 = require("../PointHelpers");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
const BSplineCurve_1 = require("./BSplineCurve");
/**
 * Implements a multidimensional bezier curve of fixed order.
 * BezierCurve3d implements with blockSize 3.
 * BezierCurve3dH implements with blockSize 4.
 */
class Bezier1dNd {
    // constructor CAPTURES the control points array.
    constructor(blockSize, polygon) {
        this._blockSize = blockSize;
        this._order = polygon.length / blockSize; // This should be an integer!!!
        this._packedData = polygon;
        this._basis = new BezierPolynomials_1.Bezier(this._order);
    }
    /** return a clone of the data array */
    clonePolygon(result) {
        const n = this._packedData.length;
        if (!result || result.length !== n)
            return this._packedData.slice();
        /** move data into the supplied result */
        for (let i = 0; i < n; i++)
            result[i] = this._packedData[i];
        return result;
    }
    /** Return the bezier order */
    get order() { return this._order; }
    /** return the packed data array.  This is a REFERENCE to the array. */
    get packedData() { return this._packedData; }
    /** Create a Bezier1dNd, using the structure of `data[0]` to determine the beizer order. */
    create(data) {
        if (data.length < 1)
            return undefined;
        if (data[0] instanceof PointVector_1.Point3d) {
            const polygon = new Float64Array(data.length * 3);
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = p.z;
            }
            return new Bezier1dNd(3, polygon);
        }
        else if (data[0] instanceof Geometry4d_1.Point4d) {
            const polygon = new Float64Array(data.length * 4);
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = p.z;
                polygon[i++] = p.w;
            }
            return new Bezier1dNd(4, polygon);
        }
        else if (data[0] instanceof PointVector_1.Point2d) {
            const polygon = new Float64Array(data.length * 2);
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
            }
            return new Bezier1dNd(2, polygon);
        }
        return undefined;
    }
    /** Return the curve value at bezier fraction `s`
     * @return buffer of length `blockSize`.
    */
    evaluate(s, buffer) {
        return this._basis.sumBasisFunctions(s, this._packedData, this._blockSize, buffer);
    }
    /** Return the curve derivative value at bezier fraction `s`
    * @return buffer of length `blockSize`.
    */
    evaluateDerivative(s, buffer) {
        return this._basis.sumBasisFunctionDerivatives(s, this._packedData, this._blockSize, buffer);
    }
    /** get a single point of the polygon as a simple array.  */
    getPolygonPoint(i, buffer) {
        if (!buffer)
            buffer = new Float64Array(this._blockSize);
        if (i >= 0 && i < this._order) {
            const k0 = this._blockSize * i;
            for (let k = 0; k < this._blockSize; k++)
                buffer[k] = this._packedData[k0 + k];
            return buffer;
        }
        return undefined;
    }
    /** set a single point of the polygon as a simple array.  */
    setPolygonPoint(i, buffer) {
        if (i >= 0 && i < this._order) {
            const k0 = this._blockSize * i;
            for (let k = 0; k < this._blockSize; k++)
                this._packedData[k0 + k] = buffer[k];
        }
    }
    /** Load order * dimension doubles from data[dimension * spanIndex] as poles
     * @param data packed source array.  block size in `data` assumed to match dimension for this.
     * @param spanIndex block index in data.
     */
    loadSpanPoles(data, spanIndex) {
        let k = spanIndex * this._blockSize;
        for (let i = 0; i < this._packedData.length; i++)
            this._packedData[i] = data[k++];
    }
    /** Load order * (dataDimension + 1)  doubles from data[dataDimension * spanIndex] as poles with weight inserted
     * @param data packed array of data.
     * @param dataDimension dimension of data. Must have `dataDimension+1=this.order`
     * @param spanIndex index of first data block to access.
     * @param weight weight to append to each block
     */
    loadSpanPolesWithWeight(data, dataDimension, spanIndex, weight) {
        let destIndex = 0;
        const order = this._order;
        let dataIndex = spanIndex * dataDimension;
        for (let i = 0; i < order; i++) {
            for (let j = 0; j < dataDimension; j++)
                this._packedData[destIndex++] = data[dataIndex++];
            this._packedData[destIndex++] = weight;
        }
    }
    /**  return a json array of arrays with each control point as a lower level array of numbers */
    unpackToJsonArrays() {
        return PointHelpers_1.Point3dArray.unpackNumbersToNestedArrays(this._packedData, this.order);
    }
    /** equality test with usual metric tolerances */
    isAlmostEqual(other) {
        if (other instanceof Bezier1dNd) {
            if (this._blockSize !== other._blockSize)
                return false;
            if (this._order !== other._order)
                return false;
            if (this._packedData.length !== other._packedData.length)
                return false;
            for (let i = 0; i < this._packedData.length; i++) {
                if (!Geometry_1.Geometry.isSameCoordinate(this._packedData[i], other._packedData[i]))
                    return false;
            }
            return true;
        }
        return false;
    }
    /** block-by-block reversal */
    reverseInPlace() {
        const m = this._blockSize;
        const n = this._order;
        let i, j;
        let a;
        for (i = 0, j = (n - 1) * m; i < j; i += m, j -= m) {
            for (let k = 0; k < m; k++) {
                a = this._packedData[i + k];
                this._packedData[i + k] = this._packedData[j + k];
                this._packedData[j + k] = a;
            }
        }
    }
    //
    /**
     * interpolate at `fraction` between poleA and poleB.
     * @param poleIndexA first pole index
     * @param fraction fractional position
     * @param poleIndexB second pole index
     */
    interpolatePoleInPlace(poleIndexA, fraction, poleIndexB) {
        let i0 = poleIndexA * this._blockSize;
        let i1 = poleIndexB * this._blockSize;
        const data = this._packedData;
        for (let i = 0; i < this._blockSize; i++, i0++, i1++) {
            data[i0] += fraction * (data[i1] - data[i0]);
        }
    }
    /**
     *
     * @param knots
     * @param spanIndex index of span whose (unsaturated) poles are in the bezie.
     * @param optional function for `setInterval (knotA, knotB)` call to announce knot limits.
     */
    saturateInPlace(knots, spanIndex) {
        const degree = knots.degree;
        const kA = spanIndex + degree - 1; // left knot index of the active span
        const kB = kA + 1;
        if (spanIndex < 0 || spanIndex >= knots.numSpans)
            return false;
        const knotArray = knots.knots;
        const knotA = knotArray[kA];
        const knotB = knotArray[kB];
        this.setInterval(knotA, knotB);
        for (let numInsert = degree - 1; numInsert > 0; numInsert--) {
            //  left numInsert poles are pulled forward
            let k0 = kA - numInsert;
            if (knotArray[k0] < knotA) {
                let k1 = kB;
                for (let i = 0; i < numInsert; i++, k0++, k1++) {
                    const knot0 = knotArray[k0];
                    const knot1 = knotArray[k1];
                    const fraction = (knotA - knot0) / (knot1 - knot0);
                    this.interpolatePoleInPlace(i, fraction, i + 1);
                }
            }
        }
        for (let numInsert = degree - 1; numInsert > 0; numInsert--) {
            let k2 = kB + numInsert;
            if (knotArray[k2] > knotB) {
                for (let i = 0; i < numInsert; i++, k2--) {
                    const knot2 = knotArray[k2]; // right side of moving window
                    // left side of window ia always the (previously saturated) knotA
                    const fraction = (knotB - knot2) / (knotA - knot2);
                    this.interpolatePoleInPlace(degree - i, fraction, degree - i - 1);
                }
            }
        }
        return true;
    }
    /** create or update the mapping to parent curve. */
    setInterval(a, b) {
        this.interval = PointVector_1.Segment1d.create(a, b, this.interval);
    }
    /** map a fraction to the parent space. */
    fractionToParentFraction(fraction) { return this.interval ? this.interval.fractionToPoint(fraction) : fraction; }
}
exports.Bezier1dNd = Bezier1dNd;
// ================================================================================================================
// ================================================================================================================
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
        this._polygon = new Bezier1dNd(blockSize, data);
        this._workPoint0 = PointVector_1.Point3d.create();
        this._workPoint1 = PointVector_1.Point3d.create();
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
            return PointVector_1.Point3d.createZero();
        return result;
    }
    endPoint() {
        const result = this.getPolePoint3d(this.order - 1);
        if (!result)
            return PointVector_1.Point3d.createZero();
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
}
exports.BezierCurveBase = BezierCurveBase;
// ================================================================================================================
// ================================================================================================================
/** 3d curve with homogeneous weights. */
class BezierCurve3dH extends BezierCurveBase {
    isSameGeometryClass(other) { return other instanceof BezierCurve3dH; }
    /**
     * Apply (multiply by) an affine transform
     * @param transform
     */
    tryTransformInPlace(transform) {
        const data = this._workData0;
        for (let i = 0; i < this._polygon.order; i++) {
            this._polygon.getPolygonPoint(i, data);
            transform.multiplyXYZWToFloat64Array(data[0], data[1], data[2], data[3], data);
            this._polygon.setPolygonPoint(i, data);
        }
        return true;
    }
    /**
       * Apply (multiply by) a perspective transform
       * @param matrix
       */
    tryMultiplyMatrix4dInPlace(matrix) {
        matrix.multiplyBlockedFloat64ArrayInPlace(this._polygon.packedData);
    }
    /** Return a specific pole as a full `[x,y,z,x] Point4d` */
    getPolePoint4d(i, result) {
        const data = this._polygon.getPolygonPoint(i, this._workData0);
        if (data)
            return Geometry4d_1.Point4d.create(data[0], data[1], data[2], data[3], result);
        return undefined;
    }
    /** Return a specific pole normalized to weight 1
     * */
    getPolePoint3d(i, result) {
        const data = this._polygon.getPolygonPoint(i, this._workData0);
        if (data)
            return PointVector_1.Point3d.createFromPackedXYZW(data, 0, result);
        return undefined;
    }
    /**
     * Capture a polygon as the data for a new `BezierCurve3dH`
     * @param polygon complete packed data and order.
     */
    constructor(polygon) {
        super(4, polygon);
        this._workRay0 = AnalyticGeometry_1.Ray3d.createXAxis();
        this._workRay1 = AnalyticGeometry_1.Ray3d.createXAxis();
    }
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPointsAsJsonArrays() { return this._polygon.unpackToJsonArrays(); }
    /** Create a curve with given points.
     * * If input is `Point2d[]`, the points are promoted with `z=0` and `w=1`
     * * If input is `Point3d[]`, the points are promoted with w=1`
     *
     */
    static create(data) {
        if (data.length < 1)
            return undefined;
        const polygon = new Float64Array(data.length * 4);
        if (data[0] instanceof PointVector_1.Point3d) {
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = p.z;
                polygon[i++] = 1.0;
            }
            return new BezierCurve3dH(polygon);
        }
        else if (data[0] instanceof Geometry4d_1.Point4d) {
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = p.z;
                polygon[i++] = p.w;
            }
            return new BezierCurve3dH(polygon);
        }
        else if (data[0] instanceof PointVector_1.Point2d) {
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = 0.0;
                polygon[i++] = 1.0;
            }
            return new BezierCurve3dH(polygon);
        }
        return undefined;
    }
    /** create a bezier curve of specified order, filled with zeros */
    static createOrder(order) {
        const polygonArray = new Float64Array(order * 4); // and we trust that this is all zeros !!!
        return new BezierCurve3dH(polygonArray);
    }
    /** Load order * 4 doubles from data[3 * spanIndex] as poles (with added weight) */
    loadSpan3dPolesWithWeight(data, spanIndex, weight) {
        this._polygon.loadSpanPolesWithWeight(data, 3, spanIndex, weight);
    }
    /** Load order * 4 doubles from data[3 * spanIndex] as poles (with added weight) */
    loadSpan4dPolesWithWeight(data, spanIndex) {
        this._polygon.loadSpanPoles(data, spanIndex);
    }
    clone() {
        return new BezierCurve3dH(this._polygon.clonePolygon());
    }
    /**
     * Return a curve after transform.
     */
    cloneTransformed(transform) {
        const curve1 = this.clone();
        curve1.tryTransformInPlace(transform);
        return curve1;
    }
    /** Return a (deweighted) point on the curve. If deweight fails, returns 000 */
    fractionToPoint(fraction, result) {
        this._polygon.evaluate(fraction, this._workData0);
        result = PointVector_1.Point3d.createFromPackedXYZW(this._workData0, 0, result);
        return result ? result : PointVector_1.Point3d.createZero();
    }
    /** Return a (deweighted) point on the curve. If deweight fails, returns 000 */
    fractionToPoint4d(fraction, result) {
        this._polygon.evaluate(fraction, this._workData0);
        return Geometry4d_1.Point4d.createFromPackedXYZW(this._workData0, 0, result);
    }
    /** Return the cartesian point and derivative vector. */
    fractionToPointAndDerivative(fraction, result) {
        this._polygon.evaluate(fraction, this._workData0);
        this._polygon.evaluateDerivative(fraction, this._workData1);
        result = AnalyticGeometry_1.Ray3d.createWeightedDerivative(this._workData0, this._workData1, result);
        if (result)
            return result;
        // Bad. Very Bad.  Return origin and x axis.   Should be undefined, but usual cartesian typs do not allow that
        return AnalyticGeometry_1.Ray3d.createXAxis();
    }
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction, result) {
        const epsilon = 1.0e-8;
        const a = 1.0 / (2.0 * epsilon);
        if (!result)
            result = AnalyticGeometry_1.Plane3dByOriginAndVectors.createXYPlane();
        const ray = this.fractionToPointAndDerivative(fraction, this._workRay0);
        result.origin.setFrom(ray.origin);
        result.vectorU.setFrom(ray.direction);
        const ray0 = this.fractionToPointAndDerivative(fraction - epsilon, this._workRay0);
        const ray1 = this.fractionToPointAndDerivative(fraction + epsilon, this._workRay1);
        PointVector_1.Vector3d.createAdd2Scaled(ray0.direction, -a, ray1.direction, a, result.vectorV);
        return result;
    }
    isAlmostEqual(other) {
        if (other instanceof BezierCurve3dH) {
            return this._polygon.isAlmostEqual(other._polygon);
        }
        return false;
    }
    /**
     * Assess legnth and turn to determine a stroke count.
     * @param options stroke options structure.
     */
    strokeCount(options) {
        // ugh.   for pure 3d case, local dx,dy,dz vars worked efficiently.
        // managing the weights is tricky, so just do the easy code with temporary point vars.
        this.getPolePoint3d(0, this._workPoint0);
        this.getPolePoint3d(1, this._workPoint1);
        let numStrokes = 1;
        if (this._workPoint0 && this._workPoint1) {
            let dx0 = this._workPoint1.x - this._workPoint0.x;
            let dy0 = this._workPoint1.y - this._workPoint0.y;
            let dz0 = this._workPoint1.z - this._workPoint0.z;
            let dx1, dy1, dz1; // first differences of leading edge
            let sweepRadians = 0.0;
            let sumLength = Geometry_1.Geometry.hypotenuseXYZ(dx0, dy0, dz0);
            this._workPoint1.setFromPoint3d(this._workPoint0);
            for (let i = 2; this.getPolePoint3d(i, this._workPoint1); i++) {
                dx1 = this._workPoint1.x - this._workPoint0.x;
                dy1 = this._workPoint1.y - this._workPoint0.y;
                dz1 = this._workPoint1.z - this._workPoint0.z;
                sweepRadians += Geometry_1.Angle.radiansBetweenVectorsXYZ(dx0, dy0, dz0, dx1, dy1, dz1);
                sumLength += Geometry_1.Geometry.hypotenuseXYZ(dx1, dy1, dz1);
                dx0 = dx1;
                dy0 = dy1;
                dz0 = dz1;
                this._workPoint0.setFrom(this._workPoint1);
            }
            numStrokes = StrokeOptions_1.StrokeOptions.applyAngleTol(options, StrokeOptions_1.StrokeOptions.applyMaxEdgeLength(options, 1, sumLength), sweepRadians, 0.1);
        }
        return numStrokes;
    }
    dispatchToGeometryHandler(_handler) {
        // NEEDS WORK
    }
    /**
     * Form dot products of each pole with given coefficients. Return as entries in products array.
     * @param products array of (scalar) dot products
     * @param ax x coefficient
     * @param ay y coefficient
     * @param az z coefficient
     * @param aw w coefficient
     */
    poleProductsXYZW(products, ax, ay, az, aw) {
        const n = this.numPoles;
        const data = this._polygon.packedData;
        for (let i = 0, k = 0; i < n; i++, k += 4)
            products[i] = ax * data[k] + ay * data[k + 1] + az * data[k + 2] + aw * data[k + 3];
    }
}
exports.BezierCurve3dH = BezierCurve3dH;
// ================================================================================================================
// ================================================================================================================
// ================================================================================================================
// ================================================================================================================
/** 3d curve (unweighted) */
class BezierCurve3d extends BezierCurveBase {
    isSameGeometryClass(other) { return other instanceof BezierCurve3d; }
    tryTransformInPlace(transform) {
        const data = this._workData0;
        for (let i = 0; i < this._polygon.order; i++) {
            this._polygon.getPolygonPoint(i, data);
            transform.multiplyXYZToFloat64Array(data[0], data[1], data[2], data);
            this._polygon.setPolygonPoint(i, data);
        }
        return true;
    }
    /** Return a specific pole as a full `[x,y,z] Point3d` */
    getPolePoint3d(i, result) {
        const data = this._polygon.getPolygonPoint(i, this._workData0);
        if (data)
            return PointVector_1.Point3d.create(data[0], data[1], data[2], result);
        return undefined;
    }
    /** Return a specific pole as a full `[w*x,w*y,w*z, w] Point4d` */
    getPolePoint4d(i, result) {
        const data = this._polygon.getPolygonPoint(i, this._workData0);
        if (data)
            return Geometry4d_1.Point4d.create(data[0], data[1], data[2], data[3], result);
        return undefined;
    }
    /**
     * Capture a polygon as the data for a new `BezierCurve3d`
     * @param polygon complete packed data and order.
     */
    constructor(polygon) {
        super(3, polygon);
        this._workRay0 = AnalyticGeometry_1.Ray3d.createXAxis();
        this._workRay1 = AnalyticGeometry_1.Ray3d.createXAxis();
    }
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPolesAsJsonArray() { return this._polygon.unpackToJsonArrays(); }
    /** Return poles as a linestring */
    copyPointsAsLineString() {
        const result = LineString3d_1.LineString3d.create();
        for (let i = 0; i < this._polygon.order; i++)
            result.addPoint(this.getPolePoint3d(i));
        return result;
    }
    /** Create a curve with given points.
     * * If input is `Point2d[]`, the points are promoted with `z=0` and `w=1`
     * * If input is `Point3d[]`, the points are promoted with w=1`
     *
     */
    static create(data) {
        if (data.length < 1)
            return undefined;
        const polygon = new Float64Array(data.length * 3);
        if (data[0] instanceof PointVector_1.Point3d) {
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = p.z;
            }
            return new BezierCurve3d(polygon);
        }
        else if (data[0] instanceof PointVector_1.Point2d) {
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = 0.0;
            }
            return new BezierCurve3d(polygon);
        }
        return undefined;
    }
    /** create a bezier curve of specified order, filled with zeros */
    static createOrder(order) {
        const polygonArray = new Float64Array(order * 3); // This is initialized to zeros!!
        return new BezierCurve3d(polygonArray);
    }
    /** Load order * 3 doubles from data[3 * spanIndex] as poles */
    loadSpanPoles(data, spanIndex) {
        this._polygon.loadSpanPoles(data, spanIndex);
    }
    clone() {
        return new BezierCurve3d(this._polygon.clonePolygon());
    }
    /**
     * Return a curve after transform.
     */
    cloneTransformed(transform) {
        const curve1 = this.clone();
        curve1.tryTransformInPlace(transform);
        return curve1;
    }
    /** Return a (deweighted) point on the curve. If deweight fails, returns 000 */
    fractionToPoint(fraction, result) {
        this._polygon.evaluate(fraction, this._workData0);
        return PointVector_1.Point3d.create(this._workData0[0], this._workData0[1], this._workData0[2], result);
    }
    /** Return the cartesian point and derivative vector. */
    fractionToPointAndDerivative(fraction, result) {
        this._polygon.evaluate(fraction, this._workData0);
        this._polygon.evaluateDerivative(fraction, this._workData1);
        return AnalyticGeometry_1.Ray3d.createXYZUVW(this._workData0[0], this._workData0[1], this._workData0[2], this._workData1[0], this._workData1[1], this._workData1[2], result);
    }
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction, result) {
        const epsilon = 1.0e-8;
        const a = 1.0 / (2.0 * epsilon);
        if (!result)
            result = AnalyticGeometry_1.Plane3dByOriginAndVectors.createXYPlane();
        const ray = this.fractionToPointAndDerivative(fraction, this._workRay0);
        result.origin.setFrom(ray.origin);
        result.vectorU.setFrom(ray.direction);
        const ray0 = this.fractionToPointAndDerivative(fraction - epsilon, this._workRay0);
        const ray1 = this.fractionToPointAndDerivative(fraction + epsilon, this._workRay1);
        PointVector_1.Vector3d.createAdd2Scaled(ray0.direction, -a, ray1.direction, a, result.vectorV);
        return result;
    }
    isAlmostEqual(other) {
        if (other instanceof BezierCurve3d) {
            return this._polygon.isAlmostEqual(other._polygon);
        }
        return false;
    }
    /**
     * Assess legnth and turn to determine a stroke count.
     * @param options stroke options structure.
     */
    strokeCount(options) {
        const data = this._polygon.packedData;
        let dx0 = data[3] - data[0];
        let dy0 = data[4] - data[1];
        let dz0 = data[5] - data[2];
        let dx1, dy1, dz1; // first differences of leading edge
        // let ex, ey, ez; // second differences.
        let sweepRadians = 0.0;
        let sumLength = Geometry_1.Geometry.hypotenuseXYZ(dx0, dy0, dz0);
        const n = data.length;
        for (let i = 6; i + 2 < n; i += 3) {
            dx1 = data[i] - data[i - 3];
            dy1 = data[i + 1] - data[i - 2];
            dz1 = data[i + 2] - data[i - 1];
            //        ex = dx1 - dx0; ey = dy1 - dy0; ez = dz1 - dz0;
            sweepRadians += Geometry_1.Angle.radiansBetweenVectorsXYZ(dx0, dy0, dz0, dx1, dy1, dz1);
            sumLength += Geometry_1.Geometry.hypotenuseXYZ(dx1, dy1, dz1);
            dx0 = dx1;
            dy0 = dy1;
            dz0 = dz1;
        }
        const numPerSpan = StrokeOptions_1.StrokeOptions.applyAngleTol(options, StrokeOptions_1.StrokeOptions.applyMaxEdgeLength(options, 1, sumLength), sweepRadians, 0.2);
        return numPerSpan;
    }
    /**
     * convert to bspline curve and dispatch to handler
     * @param handler handelr to receive strongly typed geometry
     */
    dispatchToGeometryHandler(handler) {
        const poles3d = [];
        const order = this.order;
        for (let i = 0; i < order; i++) {
            poles3d.push(this.getPolePoint3d(i));
        }
        const bspline = BSplineCurve_1.BSplineCurve3d.createUniformKnots(poles3d, this.order);
        if (bspline)
            return bspline.dispatchToGeometryHandler(handler);
        return undefined;
    }
}
exports.BezierCurve3d = BezierCurve3d;
//# sourceMappingURL=BezierCurve.js.map