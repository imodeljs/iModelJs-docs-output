"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const PointVector_1 = require("../PointVector");
const Transform_1 = require("../Transform");
const PointHelpers_1 = require("../PointHelpers");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const KnotVector_1 = require("./KnotVector");
const Geometry_1 = require("../Geometry");
const Geometry4d_1 = require("../numerics/Geometry4d");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
/**
 * UVSelect is an integer indicating uDirection (0) or vDirection (1) in a bspline surface parameterization.
 */
var UVSelect;
(function (UVSelect) {
    UVSelect[UVSelect["uDirection"] = 0] = "uDirection";
    UVSelect[UVSelect["VDirection"] = 1] = "VDirection";
})(UVSelect = exports.UVSelect || (exports.UVSelect = {}));
var WeightStyle;
(function (WeightStyle) {
    /** There are no weights. */
    WeightStyle[WeightStyle["UnWeighted"] = 0] = "UnWeighted";
    /**
     * * Data is weighted
     * * point with normalized coordinate `[x,y,z]` and weight `w` has weights already multiplied in as `[x*w,y*w,z*w,w]`
     * */
    WeightStyle[WeightStyle["WeightsAlreadyAppliedToCoordinates"] = 1] = "WeightsAlreadyAppliedToCoordinates";
    /**
     * * Data is weighted
     * * point with normalized coordinate `[x,y,z]` and weight `w` has is `[x,y,z,w]`
     * */
    WeightStyle[WeightStyle["WeightsSeparateFromCoordinates"] = 2] = "WeightsSeparateFromCoordinates";
})(WeightStyle = exports.WeightStyle || (exports.WeightStyle = {}));
/** Bspline knots and poles for 2d-to-Nd.
 * * This abstract class in not independently instantiable -- GeometryQuery methods must be implemented by derived classes.
 */
class BSpline2dNd extends CurvePrimitive_1.GeometryQuery {
    degreeUV(select) { return this.knots[select].degree; }
    orderUV(select) { return this.knots[select].degree + 1; }
    numSpanUV(select) { return this._numPoles[select] - this.knots[select].degree; }
    numPolesTotal() { return this.coffs.length / this.poleDimension; }
    numPolesUV(select) { return this._numPoles[select]; }
    poleStepUV(select) { return select === 0 ? 1 : this._numPoles[0]; }
    getPoint3dPole(i, j, result) {
        return PointVector_1.Point3d.createFromPacked(this.coffs, i + j * this._numPoles[0], result);
    }
    // Get a pole (from i,j indices) as Point3d, assuming data is stored xyzw
    getPoint3dPoleXYZW(i, j, result) {
        return PointVector_1.Point3d.createFromPackedXYZW(this.coffs, i + j * this._numPoles[0], result);
    }
    /**
     * @param value numeric value to convert to strict 0 or 1.
     * @returns Return 0 for 0 input, 1 for any nonzero input.
     */
    numberToUVSelect(value) { return value === 0 ? 0 : 1; }
    /** extend a range, treating each block as simple XYZ */
    extendRangeXYZ(rangeToExtend, transform) {
        const buffer = this.coffs;
        const pd = this.poleDimension;
        const n = buffer.length + 1 - pd;
        if (transform) {
            for (let i0 = 0; i0 < n; i0 += pd)
                rangeToExtend.extendTransformedXYZ(transform, buffer[i0], buffer[i0 + 1], buffer[i0 + 2]);
        }
        else {
            for (let i0 = 0; i0 < n; i0 += pd)
                rangeToExtend.extendXYZ(buffer[i0], buffer[i0 + 1], buffer[i0 + 2]);
        }
    }
    /** extend a range, treating each block as homogeneous xyzw, with weight at offset 3 */
    extendRangeXYZH(rangeToExtend, transform) {
        const buffer = this.coffs;
        const pd = this.poleDimension;
        const n = buffer.length + 1 - pd;
        let w = 0;
        let divW = 0;
        if (transform) {
            for (let i0 = 0; i0 < n; i0 += pd) {
                w = buffer[i0 + 3];
                if (w !== 0.0) {
                    divW = 1.0 / w;
                    rangeToExtend.extendTransformedXYZ(transform, buffer[i0] * divW, buffer[i0 + 1] * divW, buffer[i0 + 2] * divW);
                }
            }
        }
        else {
            for (let i0 = 0; i0 < n; i0 += pd) {
                w = buffer[i0 + 3];
                if (w !== 0.0) {
                    divW = 1.0 / w;
                    rangeToExtend.extendXYZ(buffer[i0] * divW, buffer[i0 + 1] * divW, buffer[i0 + 2] * divW);
                }
            }
        }
    }
    /**
       * evaluate the surface at u and v fractions. Return a (squared, right handed) coordinate frame at that point on the surface.
       * @param fractionU u parameter
       * @param fractionV v parameter
       * @param result undefined if surface derivatives are parallel (or either alone is zero)
       */
    fractionToRigidFrame(fractionU, fractionV, result) {
        const skewVectors = this.fractionToPointAndDerivatives(fractionU, fractionV);
        if (!skewVectors)
            return undefined;
        const axes = Transform_1.Matrix3d.createColumnsInAxisOrder(0 /* XYZ */, skewVectors.vectorU, skewVectors.vectorV, undefined);
        const axes1 = Transform_1.Matrix3d.createRigidFromMatrix3d(axes, 0 /* XYZ */, axes);
        if (axes1)
            result = Transform_1.Transform.createOriginAndMatrix(skewVectors.origin, axes1, result);
        return result;
    }
    /**
     * initialize arrays for given spline dimensions.
     */
    constructor(numPolesU, numPolesV, poleLength, knotsU, knotsV) {
        super();
        const orderU = knotsU.degree + 1;
        const orderV = knotsV.degree + 1;
        this.knots = [knotsU, knotsV];
        this.coffs = new Float64Array(numPolesU * numPolesV * poleLength);
        this.poleDimension = poleLength;
        this._basisBufferUV = [new Float64Array(orderU), new Float64Array(orderV)];
        this._basisBuffer1UV = [new Float64Array(orderU), new Float64Array(orderV)];
        this._numPoles = [numPolesU, numPolesV];
        this._poleBuffer = new Float64Array(poleLength);
        this._poleBuffer1UV = [new Float64Array(poleLength), new Float64Array(poleLength)];
    }
    /**
     * Map a position, specified as (uv direction, bezier span, fraction within the bezier), to an overal knot value.
     * @param select selector indicating U or V direction.
     * @param span index of bezier span
     * @param localFraction fractional coordinate within the bezier span
     */
    spanFractionToKnot(select, span, localFraction) {
        return this.knots[select].spanFractionToKnot(span, localFraction);
    }
    // ASSUME f is sized for {order} basis funtions !!!
    spanFractionsToBasisFunctions(select, spanIndex, spanFraction, f, df) {
        spanIndex = Geometry_1.Geometry.clampToStartEnd(spanIndex, 0, this.numSpanUV(select));
        const knotIndex0 = spanIndex + this.degreeUV(select) - 1;
        const globalKnot = this.knots[select].baseKnotFractionToKnot(knotIndex0, spanFraction);
        return df ?
            this.knots[select].evaluateBasisFunctions1(knotIndex0, globalKnot, f, df) :
            this.knots[select].evaluateBasisFunctions(knotIndex0, globalKnot, f);
    }
    /** sum poles by the weights in the basisBuffer, using poles for given span */
    sumPoleBufferForSpan(spanIndexU, spanIndexV) {
        const poleBuffer = this._poleBuffer;
        const coffs = this.coffs;
        poleBuffer.fill(0);
        const m = this.poleDimension;
        const stepV = this.poleDimension * this._numPoles[0];
        let kU = m * spanIndexU + spanIndexV * stepV;
        let g = 0;
        for (const fV of this._basisBufferUV[1]) {
            let k = kU;
            for (const fU of this._basisBufferUV[0]) {
                g = fU * fV;
                for (let j = 0; j < m; j++) {
                    poleBuffer[j] += g * coffs[k++];
                }
            }
            kU += stepV;
        }
    }
    /** sum derivatives by the weights in the basisBuffer, using poles for given span */
    sumpoleBufferDerivativesForSpan(spanIndexU, spanIndexV) {
        const poleBuffer1U = this._poleBuffer1UV[0];
        const poleBuffer1V = this._poleBuffer1UV[1];
        poleBuffer1U.fill(0);
        poleBuffer1V.fill(0);
        const m = this.poleDimension;
        const stepV = this.poleDimension * this._numPoles[0];
        let kU = m * spanIndexU + spanIndexV * stepV;
        // U partial derivatives ...
        let g = 0;
        for (const fV of this._basisBufferUV[1]) {
            let k = kU;
            for (const fU of this._basisBuffer1UV[0]) {
                g = fU * fV;
                for (let j = 0; j < m; j++) {
                    poleBuffer1U[j] += g * this.coffs[k++];
                }
            }
            kU += stepV;
        }
        // V partial derivatives ...
        kU = m * spanIndexU + spanIndexV * stepV;
        for (const fV of this._basisBuffer1UV[1]) {
            let k = kU;
            for (const fU of this._basisBufferUV[0]) {
                g = fU * fV;
                for (let j = 0; j < m; j++) {
                    poleBuffer1V[j] += g * this.coffs[k++];
                }
            }
            kU += stepV;
        }
    }
    evaluateBuffersAtKnot(u, v, numDerivative = 0) {
        const knotIndex0U = this.knots[0].knotToLeftKnotIndex(u);
        const knotIndex0V = this.knots[1].knotToLeftKnotIndex(v);
        const poleIndex0U = knotIndex0U - this.degreeUV(0) + 1;
        const poleIndex0V = knotIndex0V - this.degreeUV(1) + 1;
        if (numDerivative < 1) {
            this.knots[0].evaluateBasisFunctions(knotIndex0U, u, this._basisBufferUV[0]);
            this.knots[1].evaluateBasisFunctions(knotIndex0V, v, this._basisBufferUV[1]);
            this.sumPoleBufferForSpan(poleIndex0U, poleIndex0V);
        }
        else {
            this.knots[0].evaluateBasisFunctions1(knotIndex0U, u, this._basisBufferUV[0], this._basisBuffer1UV[0]);
            this.knots[1].evaluateBasisFunctions1(knotIndex0V, v, this._basisBufferUV[1], this._basisBuffer1UV[1]);
            this.sumPoleBufferForSpan(poleIndex0U, poleIndex0V);
            this.sumpoleBufferDerivativesForSpan(poleIndex0U, poleIndex0V);
        }
    }
    // Swap numSwap entries in coffs, starting at i0 and i1 (absolute indices -- not blocks)
    swapBlocks(i0, i1, numSwap) {
        let a;
        for (let i = 0; i < numSwap; i++) {
            a = this.coffs[i0 + i];
            this.coffs[i0 + i] = this.coffs[i1 + i];
            this.coffs[i1 + i] = a;
        }
    }
    /**
     * Reverse the parameter direction for either u or v.
     * @param select direction to reverse -- 0 for u, 1 for v.
     */
    reverseInPlace(select) {
        const m = this.poleDimension;
        const numU = this.numPolesUV(0);
        const numV = this.numPolesUV(1);
        if (select === 0) {
            // reverse within rows.
            for (let j = 0; j < numV; j++) {
                const rowStart = j * numU * m;
                for (let i0 = 0, i1 = numU - 1; i0 < i1; i0++, i1--) {
                    this.swapBlocks(rowStart + i0 * m, rowStart + i1 * m, m);
                }
            }
        }
        else {
            // swap full rows ..
            const numPerRow = m * numU;
            for (let i0 = 0, i1 = (numV - 1) * numPerRow; i0 < i1; i0 += numPerRow, i1 -= numPerRow) {
                this.swapBlocks(i0, i1, numPerRow);
            }
        }
        this.knots[select].reflectKnots();
    }
    /**
     * Set the flag indicating the bspline might be suitable for having wrapped "closed" interpretation.
     */
    setWrappable(select, value) {
        this.knots[select].wrappable = value;
    }
}
exports.BSpline2dNd = BSpline2dNd;
/**  BSplineSurface3d is a parametric surface in xyz space.
 * * This (BSplineSurface3d) is an unweighted surface.   Use the separate class BSplineSurface3dH for a weighted surface.
 *
 * The various static "create" methods have subtle differences in how grid sizes are conveyed:
 * | Method | control point array | counts |
 * | create | flat array of [x,y,z] | arguments numPolesU, numPolesV |
 * | createGrid | array of array of [x,y,z ] | There are no `numPolesU` or `numPolesV` args. The counts are conveyed by the deep arrays |
 */
class BSplineSurface3d extends BSpline2dNd {
    isSameGeometryClass(other) { return other instanceof BSplineSurface3d; }
    tryTransformInPlace(transform) { PointHelpers_1.Point3dArray.multiplyInPlace(transform, this.coffs); return true; }
    getPole(i, j, result) {
        return this.getPoint3dPole(i, j, result);
    }
    constructor(numPolesU, numPolesV, knotsU, knotsV) {
        super(numPolesU, numPolesV, 3, knotsU, knotsV);
    }
    /**
     * Return control points json arrays.
     * * if `flatArray===true`, each point appears as an array [x,y,z] in row-major order of a containing array.
     * * if `flatArray===false` each row of points is an an array of [x,y,z] in an array.  Each of these row arrays is in the result array.
     * @param flatArray if true, retur
     */
    getPointArray(flatArray = true) {
        if (flatArray)
            return PointHelpers_1.Point3dArray.unpackNumbersToNestedArrays(this.coffs, 3);
        return PointHelpers_1.Point3dArray.unpackNumbersToNestedArraysIJK(this.coffs, 3, this.numPolesUV(0));
    }
    /**
     * Return control points json arrays.
     * * Each row of points is an an array.
     * * Within the array for each row, each point is an array [x,y,z]
     */
    getPointGridJSON() {
        const result = {
            points: PointHelpers_1.Point3dArray.unpackNumbersToNestedArraysIJK(this.coffs, 3, this.numPolesUV(0)),
            weighStyle: WeightStyle.UnWeighted,
            numCartesianDimensions: 3,
        };
        return result;
    }
    /** Return a simple array of the control points coordinates */
    copyPointsFloat64Array() { return this.coffs.slice(); }
    /**
     * return a simple array form of the knots.  optionally replicate the first and last
     * in classic over-clamped manner
     */
    copyKnots(select, includeExtraEndKnot) { return this.knots[select].copyKnots(includeExtraEndKnot); }
    /** Create a bspline surface.
     * * This `create` variant takes control points in a "flattened" array, with
     *  points from succeeding U rows packed together in one array.  Use `createGrid` if the points are in
     *  a row-by-row grid structure
     * * knotArrayU and knotArrayV are optional -- uniform knots are implied if they are omited (undefined).
     * *  When knots are given, two knot count conditions are recognized:
     * * + If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * * + If poleArray.length + order == knotArray.length + 2, the knots are in modern form that does not have
     *      the classic unused first and last knot.
     * @param controlPointArray Array of points, ordered along the U direction.
     * @param numPoleU number of poles in each row in the U direction.
     * @param orderU order for the U direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayU knots for the V direction.  See note above about knot counts.
     * @param numPoleV number of poles in each row in the U direction.
     * @param orderV order for the V direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayV knots for the V direction.  See note above about knot counts.
     */
    static create(controlPointArray, numPolesU, orderU, knotArrayU, numPolesV, orderV, knotArrayV) {
        let numPoles = controlPointArray.length;
        if (controlPointArray instanceof Float64Array)
            numPoles /= 3;
        if (numPolesU * numPolesV !== numPoles)
            return undefined;
        // shift knots-of-interest limits for overclampled case ...
        const numKnotsU = knotArrayU ? knotArrayU.length : numPolesU + orderU - 2;
        const numKnotsV = knotArrayV ? knotArrayV.length : numPolesV + orderV - 2;
        const skipFirstAndLastU = (numPolesU + orderU === numKnotsU);
        const skipFirstAndLastV = (numPolesV + orderV === numKnotsV);
        if (orderU < 1 || numPolesU < orderU)
            return undefined;
        if (orderV < 1 || numPolesV < orderV)
            return undefined;
        const knotsU = knotArrayU ?
            KnotVector_1.KnotVector.create(knotArrayU, orderU - 1, skipFirstAndLastU) :
            KnotVector_1.KnotVector.createUniformClamped(numPolesU, orderU - 1, 0.0, 1.0);
        const knotsV = knotArrayV ?
            KnotVector_1.KnotVector.create(knotArrayV, orderV - 1, skipFirstAndLastV) :
            KnotVector_1.KnotVector.createUniformClamped(numPolesV, orderV - 1, 0.0, 1.0);
        const surface = new BSplineSurface3d(numPolesU, numPolesV, knotsU, knotsV);
        if (controlPointArray instanceof Float64Array) {
            let i = 0;
            for (const coordinate of controlPointArray) {
                surface.coffs[i++] = coordinate;
            }
        }
        else {
            let i = 0;
            for (const p of controlPointArray) {
                surface.coffs[i++] = p.x;
                surface.coffs[i++] = p.y;
                surface.coffs[i++] = p.z;
            }
        }
        return surface;
    }
    /** Create a bspline surface.
     * * This `create` variant takes control points in a "grid" array, with the points from
     * each grid row `[rowIndex]` being an independent array `points[rowIndex][indexAlongRow][x,y,z]`
     * * knotArrayU and knotArrayV are optional -- uniform knots are implied if they are omited (undefined).
     * *  When knots are given, two knot count conditions are recognized:
     * * + If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * * + If poleArray.length + order == knotArray.length + 2, the knots are in modern form that does not have
     *      the classic unused first and last knot.
     * @param controlPointArray Array of points, ordered along the U direction.
     * @param numPoleU number of poles in each row in the U direction.
     * @param orderU order for the U direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayU knots for the V direction.  See note above about knot counts.
     * @param numPoleV number of poles in each row in the U direction.
     * @param orderV order for the V direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayV knots for the V direction.  See note above about knot counts.
     */
    static createGrid(points, orderU, knotArrayU, orderV, knotArrayV) {
        const numPolesV = points.length;
        const numPolesU = points[0].length;
        // shift knots-of-interest limits for overclampled case ...
        const numKnotsU = knotArrayU ? knotArrayU.length : numPolesU + orderU - 2;
        const numKnotsV = knotArrayV ? knotArrayV.length : numPolesV + orderV - 2;
        const skipFirstAndLastU = (numPolesU + orderU === numKnotsU);
        const skipFirstAndLastV = (numPolesV + orderV === numKnotsV);
        if (orderU < 1 || numPolesU < orderU)
            return undefined;
        if (orderV < 1 || numPolesV < orderV)
            return undefined;
        const knotsU = knotArrayU ?
            KnotVector_1.KnotVector.create(knotArrayU, orderU - 1, skipFirstAndLastU) :
            KnotVector_1.KnotVector.createUniformClamped(numPolesU, orderU - 1, 0.0, 1.0);
        const knotsV = knotArrayV ?
            KnotVector_1.KnotVector.create(knotArrayV, orderV - 1, skipFirstAndLastV) :
            KnotVector_1.KnotVector.createUniformClamped(numPolesU, orderU - 1, 0.0, 1.0);
        if (orderU < 1 || numPolesU < orderU)
            return undefined;
        if (orderV < 1 || numPolesV < orderV)
            return undefined;
        const surface = new BSplineSurface3d(numPolesU, numPolesV, knotsU, knotsV);
        let i = 0;
        for (const row of points) {
            for (const xyz of row) {
                surface.coffs[i++] = xyz[0];
                surface.coffs[i++] = xyz[1];
                surface.coffs[i++] = xyz[2];
            }
        }
        return surface;
    }
    /**
     * @returns Return a complete copy of the bspline surface.
     */
    clone() {
        const knotVector1U = this.knots[0].clone();
        const knotVector1V = this.knots[1].clone();
        const surface1 = new BSplineSurface3d(this.numPolesUV(0), this.numPolesUV(1), knotVector1U, knotVector1V);
        surface1.coffs = this.coffs.slice();
        return surface1;
    }
    /**
     * Return a complete copy of the bspline surface, with a transform applied to the control points.
     * @param transform transform to apply to the control points
     */
    cloneTransformed(transform) {
        const surface1 = this.clone();
        surface1.tryTransformInPlace(transform);
        return surface1;
    }
    /** Evaluate at a position given by u and v coordinates in knot space.
     * @param u u value, in knot range.
     * @param v v value in knot range.
   * @returns Return the xyz coordinates on the surface.
     */
    knotToPoint(u, v) {
        this.evaluateBuffersAtKnot(u, v);
        return PointVector_1.Point3d.createFrom(this._poleBuffer);
    }
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivatives(u, v, result) {
        this.evaluateBuffersAtKnot(u, v, 1);
        return AnalyticGeometry_1.Plane3dByOriginAndVectors.createOriginAndVectorsArrays(this._poleBuffer, this._poleBuffer1UV[0], this._poleBuffer1UV[1], result);
    }
    /** Evalute at a position given by fractional coordinte in each direction.
       * @param fractionU u coordinate, as a fraction of the knot range.
       * @param fractionV v coordinate, as a fraction of the knot range.
     * @returns Return the xyz coordinates on the surface.
     */
    fractionToPoint(fractionU, fractionV) {
        return this.knotToPoint(this.knots[0].fractionToKnot(fractionU), this.knots[1].fractionToKnot(fractionV));
    }
    /**
     * evaluate the surface at u and v fractions.
     * @returns plane with origin at the surface point, direction vectors are derivatives in the u and v directions.
     * @param fractionU u coordinate, as a fraction of the knot range.
     * @param fractionV v coordinate, as a fraction of the knot range.
     * @param result optional pre-allocated object for return values.
     * @returns Returns point and derivative directions.
     */
    fractionToPointAndDerivatives(fractionU, fractionV, result) {
        const knotU = this.knots[0].fractionToKnot(fractionU);
        const knotV = this.knots[1].fractionToKnot(fractionV);
        return this.knotToPointAndDerivatives(knotU, knotV, result);
    }
    isAlmostEqual(other) {
        if (other instanceof BSplineSurface3d) {
            return this.knots[0].isAlmostEqual(other.knots[0])
                && this.knots[1].isAlmostEqual(other.knots[1])
                && PointHelpers_1.Point3dArray.isAlmostEqual(this.coffs, other.coffs);
        }
        return false;
    }
    isInPlane(plane) {
        return PointHelpers_1.Point3dArray.isCloseToPlane(this.coffs, plane);
    }
    /**
     * return true if the spline is (a) unclamped with (degree-1) matching knot intervals,
     * (b) (degree-1) wrapped points,
     * (c) marked wrappable from construction time.
     */
    isClosable(select) {
        if (!this.knots[select].wrappable)
            return false;
        const degree = this.degreeUV(select);
        const knots = this.knots[select];
        const leftKnotIndex = knots.leftKnotIndex;
        const rightKnotIndex = knots.rightKnotIndex;
        const period = knots.rightKnot - knots.leftKnot;
        const indexDelta = rightKnotIndex - leftKnotIndex;
        for (let k0 = leftKnotIndex - degree + 1; k0 < leftKnotIndex + degree - 1; k0++) {
            const k1 = k0 + indexDelta;
            if (!Geometry_1.Geometry.isSameCoordinate(knots.knots[k0] + period, knots.knots[k1]))
                return false;
        }
        const poleIndexDelta = this.numPolesUV(select) - this.degreeUV(select); // index jump between equal wrapped poles.
        const numStringer = select === 0 ? this.numPolesUV(1) : this.numPolesUV(0);
        const i0Step = select === 0 ? 0 : 1; // to advance stringer
        const j0Step = select === 0 ? 1 : 0; // to advance stringer
        const iStep = 1 - i0Step; // to advance within stringer
        const jStep = 1 - j0Step; // to advance within stringer
        for (let stringer = 0, i0 = 0, j0 = 0; stringer < numStringer; stringer++, i0 += i0Step, j0 += j0Step) {
            for (let p0 = 0; p0 < degree; p0++) {
                const p1 = p0 + poleIndexDelta;
                if (!Geometry_1.Geometry.isSamePoint3d(this.getPole(i0 + p0 * iStep, j0 + p0 * jStep), this.getPole(i0 + p1 * iStep, j0 + p1 * jStep)))
                    return false;
            }
        }
        return true;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleBSplineSurface3d(this);
    }
    extendRange(rangeToExtend, transform) {
        this.extendRangeXYZ(rangeToExtend, transform);
    }
}
exports.BSplineSurface3d = BSplineSurface3d;
/**  BsplinceCurve in xyzw homogeneous space */
class BSplineSurface3dH extends BSpline2dNd {
    isSameGeometryClass(other) { return other instanceof BSplineSurface3dH; }
    tryTransformInPlace(transform) {
        PointHelpers_1.Point4dArray.multiplyInPlace(transform, this.coffs);
        return true;
    }
    getPole(i, j, result) {
        return this.getPoint3dPoleXYZW(i, j, result);
    }
    constructor(numPolesU, numPolesV, knotsU, knotsV) {
        super(numPolesU, numPolesV, 4, knotsU, knotsV);
    }
    /** Return a simple array of the control points. */
    copyPoints4d() { return PointHelpers_1.Point4dArray.unpackToPoint4dArray(this.coffs); }
    /** Return a simple array of the control points. */
    copyPointsAndWeights(points, weights, formatter = PointVector_1.Point3d.create) {
        PointHelpers_1.Point4dArray.unpackFloat64ArrayToPointsAndWeights(this.coffs, points, weights, formatter);
    }
    /**
     * return a simple array form of the knots.  optionally replicate the first and last
     * in classic over-clamped manner
     */
    copyKnots(select, includeExtraEndKnot) { return this.knots[select].copyKnots(includeExtraEndKnot); }
    /** Create a weighted bspline surface, with control points and weights each organized as flattened array of points continuing from one U row to the next.
     * * This `create` variant takes control points in a "flattened" array, with
     *  points from succeeding U rows packed together in one array.  Use `createGrid` if the points are in
     *  a deeper grid array structure.
     * * knotArrayU and knotArrayV are optional -- uniform knots are implied if they are omited (undefined).
     * *  When knots are given, two knot count conditions are recognized:
     * * * If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * * * If poleArray.length + order == knotArray.length + 2, the knots are in modern form that does not have
     *      the classic unused first and last knot.
     * @param controlPointArray Array of points, ordered along the U direction.
     * @param weightArray array of weights, ordered along the U direction.
     * @param numPoleU number of poles in each row in the U direction.
     * @param orderU order for the U direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayU optional knots for the V direction.  See note above about knot counts.
     * @param numPoleV number of poles in each row in the U direction.
     * @param orderV order for the V direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayV optional knots for the V direction.  See note above about knot counts.
     */
    static create(controlPointArray, weightArray, numPolesU, orderU, knotArrayU, numPolesV, orderV, knotArrayV) {
        const numPoles = controlPointArray.length;
        if (numPolesU * numPolesV !== numPoles)
            return undefined;
        const numKnotsU = knotArrayU ? knotArrayU.length : numPolesU + orderU - 2;
        const numKnotsV = knotArrayV ? knotArrayV.length : numPolesV + orderV - 2;
        const skipFirstAndLastU = (numPolesU + orderU === numKnotsU);
        const skipFirstAndLastV = (numPolesV + orderV === numKnotsV);
        if (orderU < 1 || numPolesU < orderU)
            return undefined;
        if (orderV < 1 || numPolesV < orderV)
            return undefined;
        const knotsU = knotArrayU ?
            KnotVector_1.KnotVector.create(knotArrayU, orderU - 1, skipFirstAndLastU) :
            KnotVector_1.KnotVector.createUniformClamped(numPolesU, orderU - 1, 0.0, 1.0);
        const knotsV = knotArrayV ?
            KnotVector_1.KnotVector.create(knotArrayV, orderV - 1, skipFirstAndLastV) :
            KnotVector_1.KnotVector.createUniformClamped(numPolesV, orderV - 1, 0.0, 1.0);
        if (orderU < 1 || numPolesU < orderU)
            return undefined;
        if (orderV < 1 || numPolesV < orderV)
            return undefined;
        const surface = new BSplineSurface3dH(numPolesU, numPolesV, knotsU, knotsV);
        PointHelpers_1.Point4dArray.packPointsAndWeightsToFloat64Array(controlPointArray, weightArray, surface.coffs);
        return surface;
    }
    /** Create a bspline with given knots.
     *
     *   Two count conditions are recognized in each direction:
     *
     * ** If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * ** If poleArray.length + order == knotArray.length + 2, the knots are in modern form.
     *
     */
    static createGrid(xyzwGrid, weightStyle, orderU, knotArrayU, orderV, knotArrayV) {
        const numPolesV = xyzwGrid.length;
        const numPolesU = xyzwGrid[0].length;
        // const numPoles = numPolesU * numPolesV;
        // shift knots-of-interest limits for overclampled case ...
        const numKnotsU = knotArrayU.length;
        const numKnotsV = knotArrayV.length;
        const skipFirstAndLastU = (numPolesU + orderU === numKnotsU);
        const skipFirstAndLastV = (numPolesV + orderV === numKnotsV);
        if (orderU < 1 || numPolesU < orderU)
            return undefined;
        if (orderV < 1 || numPolesV < orderV)
            return undefined;
        const knotsU = KnotVector_1.KnotVector.create(knotArrayU, orderU - 1, skipFirstAndLastU);
        const knotsV = KnotVector_1.KnotVector.create(knotArrayV, orderV - 1, skipFirstAndLastV);
        const surface = new BSplineSurface3dH(numPolesU, numPolesV, knotsU, knotsV);
        if (weightStyle === WeightStyle.WeightsSeparateFromCoordinates) {
            let i = 0;
            for (const row of xyzwGrid) {
                for (const point of row) {
                    const w = point[3];
                    surface.coffs[i++] = point[0] * w;
                    surface.coffs[i++] = point[1] * w;
                    surface.coffs[i++] = point[2] * w;
                    surface.coffs[i++] = point[3];
                }
            }
        }
        else {
            // implicit WeightStyle.WeightsAlreadyAppliedToCoordinates
            let i = 0;
            for (const row of xyzwGrid) {
                for (const point of row) {
                    surface.coffs[i++] = point[0];
                    surface.coffs[i++] = point[1];
                    surface.coffs[i++] = point[2];
                    surface.coffs[i++] = point[3];
                }
            }
        }
        return surface;
    }
    clone() {
        const knotVector1U = this.knots[0].clone();
        const knotVector1V = this.knots[1].clone();
        const surface1 = new BSplineSurface3dH(this.numPolesUV(0), this.numPolesUV(1), knotVector1U, knotVector1V);
        surface1.coffs = this.coffs.slice();
        return surface1;
    }
    cloneTransformed(transform) {
        const surface1 = this.clone();
        surface1.tryTransformInPlace(transform);
        return surface1;
    }
    /**
      * Return control points json arrays.
      * * Each row of points is an an array.
      * * Within the array for each row, each point is an array [wx,wy,wz,w].
      */
    getPointGridJSON() {
        const result = {
            points: PointHelpers_1.Point3dArray.unpackNumbersToNestedArraysIJK(this.coffs, 4, this.numPolesUV(0)),
            numCartesianDimensions: 3,
            weightStyle: WeightStyle.WeightsAlreadyAppliedToCoordinates,
        };
        return result;
    }
    /** Evaluate at a position given by a knot value.  */
    knotToPoint4d(u, v) {
        this.evaluateBuffersAtKnot(u, v);
        return Geometry4d_1.Point4d.createFromPackedXYZW(this._poleBuffer, 0);
    }
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivatives(u, v, result) {
        this.evaluateBuffersAtKnot(u, v, 1);
        return AnalyticGeometry_1.Plane3dByOriginAndVectors.createOriginAndVectorsWeightedArrays(this._poleBuffer, this._poleBuffer1UV[0], this._poleBuffer1UV[1], result);
    }
    fractionToPoint4d(fractionU, fractionV) {
        return this.knotToPoint4d(this.knots[0].fractionToKnot(fractionU), this.knots[1].fractionToKnot(fractionV));
    }
    /**
     * * evaluate the surface and return the cartesian (weight = 1) point.
     * * if the surface XYZW point has weight0, returns point3d at 000.
     * @param fractionU u direction fraction
     * @param fractionV v direction fraction
     * @param result optional result
     */
    fractionToPoint(fractionU, fractionV, result) {
        const point4d = this.knotToPoint4d(this.knots[0].fractionToKnot(fractionU), this.knots[1].fractionToKnot(fractionV));
        return point4d.realPointDefault000(result);
    }
    /**
   * * evaluate the surface and return the cartesian (weight = 1) point.
   * * if the surface XYZW point has weight0, returns point3d at 000.
   * @param knotU u direction knot
   * @param knotV v direction knot
   * @param result optional result
   */
    knotToPoint(knotU, knotV, result) {
        const point4d = this.knotToPoint4d(knotU, knotV);
        return point4d.realPointDefault000(result);
    }
    /**
     * evaluate the surface at u and v fractions.
     * @returns plane with origin at the surface point, direction vectors are derivatives in the u and v directions.
     * @param fractionU u coordinate, as a fraction of the knot range.
     * @param fractionV v coordinate, as a fraction of the knot range.
     * @param result optional pre-allocated object for return values.
     * @returns Returns point and derivative directions.
     */
    fractionToPointAndDerivatives(fractionU, fractionV, result) {
        const knotU = this.knots[0].fractionToKnot(fractionU);
        const knotV = this.knots[1].fractionToKnot(fractionV);
        return this.knotToPointAndDerivatives(knotU, knotV, result);
    }
    isAlmostEqual(other) {
        if (other instanceof BSplineSurface3dH) {
            return this.knots[0].isAlmostEqual(other.knots[0])
                && this.knots[1].isAlmostEqual(other.knots[1])
                && PointHelpers_1.Point4dArray.isAlmostEqual(this.coffs, other.coffs);
        }
        return false;
    }
    isInPlane(plane) {
        return PointHelpers_1.Point4dArray.isCloseToPlane(this.coffs, plane);
    }
    /**
     * return true if the spline is (a) unclamped with (degree-1) matching knot intervals,
     * (b) (degree-1) wrapped points,
     * (c) marked wrappable from construction time.
     */
    isClosable(select) {
        if (!this.knots[select].wrappable)
            return false;
        const degree = this.degreeUV(select);
        const knots = this.knots[select];
        const leftKnotIndex = knots.leftKnotIndex;
        const rightKnotIndex = knots.rightKnotIndex;
        const period = knots.rightKnot - knots.leftKnot;
        const indexDelta = rightKnotIndex - leftKnotIndex;
        for (let k0 = leftKnotIndex - degree + 1; k0 < leftKnotIndex + degree - 1; k0++) {
            const k1 = k0 + indexDelta;
            if (!Geometry_1.Geometry.isSameCoordinate(knots.knots[k0] + period, knots.knots[k1]))
                return false;
        }
        const poleIndexDelta = this.numPolesUV(select) - this.degreeUV(select); // index jump between equal wrapped poles.
        const numStringer = select === 0 ? this.numPolesUV(1) : this.numPolesUV(0);
        const i0Step = select === 0 ? 0 : 1; // to advance stringer
        const j0Step = select === 0 ? 0 : 1; // to advance stringer
        const iStep = 1 - i0Step; // to advance within stringer
        const jStep = 1 - j0Step; // to advance within stringer
        for (let stringer = 0, i0 = 0, j0 = 0; stringer < numStringer; stringer++, i0 += i0Step, j0 += j0Step) {
            for (let p0 = 0; p0 + 1 < degree; p0++) {
                const p1 = p0 + poleIndexDelta;
                if (!Geometry_1.Geometry.isSamePoint3d(this.getPole(i0 + p0 * iStep, j0 + p0 * jStep), this.getPole(i0 + p1 * iStep, j0 + p1 * jStep)))
                    return false;
            }
        }
        return true;
    }
    /**
     * Pass `this` (strongly typed) to `handler.handleBsplineSurface3dH(this)`.
     * @param handler double dispatch handler.
     */
    dispatchToGeometryHandler(handler) {
        return handler.handleBSplineSurface3dH(this);
    }
    /**
     * extend a range to include the (optionally transformed) points of this surface
     * @param rangeToExtend range that is updaatd to include this surface range
     * @param transform transform to apply to the surface points
     */
    extendRange(rangeToExtend, transform) {
        this.extendRangeXYZH(rangeToExtend, transform);
    }
}
exports.BSplineSurface3dH = BSplineSurface3dH;
//# sourceMappingURL=BSplineSurface.js.map