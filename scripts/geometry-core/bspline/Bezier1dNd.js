"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Segment1d_1 = require("../geometry3d/Segment1d");
const Point4d_1 = require("../geometry4d/Point4d");
const Geometry_1 = require("../Geometry");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
/**
 * Implements a multidimensional bezier curve of fixed order.
 * BezierCurve3d implements with blockSize 3.
 * BezierCurve3dH implements with blockSize 4.
 */
class Bezier1dNd {
    // constructor CAPTURES the control points array.
    constructor(blockSize, polygon) {
        this._blockSize = blockSize;
        this._order = Math.floor(polygon.length / blockSize); // This should be an integer!!!
        this._packedData = polygon;
        this._basis = new BezierPolynomials_1.UnivariateBezier(this._order);
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
    static create(data) {
        if (data.length < 1)
            return undefined;
        if (data[0] instanceof Point3dVector3d_1.Point3d) {
            const polygon = new Float64Array(data.length * 3);
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = p.z;
            }
            return new Bezier1dNd(3, polygon);
        }
        else if (data[0] instanceof Point4d_1.Point4d) {
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
        else if (data[0] instanceof Point2dVector2d_1.Point2d) {
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
        return PointHelpers_1.Point3dArray.unpackNumbersToNestedArrays(this._packedData, this._blockSize);
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
     * * Data is left "in place" in poleIndexA
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
    /**
     * Saturate a univaraite bspline coefficient array in place
     * * On input, the array is the coefficients one span of a bspline, packed in an array of `(knots.order)` values.
     * * These are modified in place, and on return are a bezier for the same knot interval.
     * @param coffs input as bspline coefficients, returned as bezier coefficients
     * @param knots knot vector
     * @param spanIndex index of span whose (unsaturated) poles are in the coefficients.
     * @param optional function for `setInterval (knotA, knotB)` call to announce knot limits.
     */
    static saturate1dInPlace(coffs, knots, spanIndex) {
        const degree = knots.degree;
        const kA = spanIndex + degree - 1; // left knot index of the active span
        const kB = kA + 1;
        if (spanIndex < 0 || spanIndex >= knots.numSpans)
            return false;
        const knotArray = knots.knots;
        const knotA = knotArray[kA];
        const knotB = knotArray[kB];
        for (let numInsert = degree - 1; numInsert > 0; numInsert--) {
            //  left numInsert poles are pulled forward
            let k0 = kA - numInsert;
            if (knotArray[k0] < knotA) {
                let k1 = kB;
                for (let i = 0; i < numInsert; i++, k0++, k1++) {
                    const knot0 = knotArray[k0];
                    const knot1 = knotArray[k1];
                    const fraction = (knotA - knot0) / (knot1 - knot0);
                    coffs[i] = coffs[i] + fraction * (coffs[i + 1] - coffs[i]);
                }
            }
        }
        for (let numInsert = degree - 1; numInsert > 0; numInsert--) {
            let k2 = kB + numInsert;
            let k;
            if (knotArray[k2] > knotB) {
                for (let i = 0; i < numInsert; i++, k2--) {
                    const knot2 = knotArray[k2]; // right side of moving window
                    // left side of window ia always the (previously saturated) knotA
                    const fraction = (knotB - knot2) / (knotA - knot2);
                    k = degree - i;
                    coffs[k] += fraction * (coffs[k - 1] - coffs[k]);
                }
            }
        }
        return true;
    }
    /**
     * Apply deCasteljou interpolations to isolate a smaller bezier polygon, representing interval 0..fraction of the original
     * @param fracton "end" fraction for split.
     * @returns false if fraction is 0 -- no changes applied.
     */
    subdivideInPlaceKeepLeft(fraction) {
        if (Geometry_1.Geometry.isAlmostEqualNumber(fraction, 1.0))
            return true;
        if (Geometry_1.Geometry.isAlmostEqualNumber(fraction, 0.0))
            return false;
        const g = 1.0 - fraction; // interpolations will pull towards right indices
        const order = this.order;
        for (let level = 1; level < order; level++) {
            for (let i1 = order - 1; i1 >= level; i1--) {
                this.interpolatePoleInPlace(i1, g, i1 - 1); // leave updates to right
            }
        }
        return true;
    }
    /**
     * Apply deCasteljou interpolations to isolate a smaller bezier polygon, representing interval 0..fraction of the original
     * @param fracton "end" fraction for split.
     * @returns false if fraction is 0 -- no changes applied.
     */
    subdivideInPlaceKeepRight(fraction) {
        if (Geometry_1.Geometry.isAlmostEqualNumber(fraction, 0.0))
            return true;
        if (Geometry_1.Geometry.isAlmostEqualNumber(fraction, 1.0))
            return false;
        const order = this.order;
        for (let level = 1; level < order; level++) {
            for (let i0 = 0; i0 + level < order; i0++)
                this.interpolatePoleInPlace(i0, fraction, i0 + 1); // leave updates to left.
        }
        return true;
    }
    /**
     * Saturate a univaraite bspline coefficient array in place
     * @param fracton0 fracton for first split.   This is the start of the output polygon
     * @param fracton1 fracton for first split.   This is the start of the output polygon
     * @return false if fractions are (almost) identical.
     */
    subdivideToIntervalInPlace(fraction0, fraction1) {
        if (Geometry_1.Geometry.isAlmostEqualNumber(fraction0, fraction1))
            return false;
        if (fraction1 < fraction0) {
            this.subdivideToIntervalInPlace(fraction0, fraction1);
            this.reverseInPlace();
            return true;
        }
        this.subdivideInPlaceKeepLeft(fraction1);
        this.subdivideInPlaceKeepRight(fraction0 / fraction1);
        return true;
    }
    /** create or update the mapping to parent curve. */
    setInterval(a, b) {
        this.interval = Segment1d_1.Segment1d.create(a, b, this.interval);
    }
    /** map a fraction to the parent space. */
    fractionToParentFraction(fraction) { return this.interval ? this.interval.fractionToPoint(fraction) : fraction; }
}
exports.Bezier1dNd = Bezier1dNd;
//# sourceMappingURL=Bezier1dNd.js.map