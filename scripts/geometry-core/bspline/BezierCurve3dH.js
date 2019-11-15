"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Point4d_1 = require("../geometry4d/Point4d");
const Ray3d_1 = require("../geometry3d/Ray3d");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const Geometry_1 = require("../Geometry");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
const BezierCurveBase_1 = require("./BezierCurveBase");
/** @module Bspline */
/** 3d curve with homogeneous weights.
 * * A control point with weight w and cartesian (projected) coordinates x,y,z has the weight multiplied into the coordinates,
 *    hence the control point as stored is (xw, yw, zw, w).
 * @public
 */
class BezierCurve3dH extends BezierCurveBase_1.BezierCurveBase {
    /**
     * Capture a polygon as the data for a new `BezierCurve3dH`
     * @param polygon complete packed data and order.
     */
    constructor(polygon) {
        super(4, polygon);
        this._workRay0 = Ray3d_1.Ray3d.createXAxis();
        this._workRay1 = Ray3d_1.Ray3d.createXAxis();
    }
    /** test if `other` is also a BezierCurve3dH. */
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
            return Point4d_1.Point4d.create(data[0], data[1], data[2], data[3], result);
        return undefined;
    }
    /** Return a specific pole normalized to weight 1
     */
    getPolePoint3d(i, result) {
        const data = this._polygon.getPolygonPoint(i, this._workData0);
        if (data)
            return Point3dVector3d_1.Point3d.createFromPackedXYZW(data, 0, result);
        return undefined;
    }
    /**
     * Returns true if all weights are within tolerance of 1.0
     */
    isUnitWeight(tolerance) {
        if (tolerance === undefined)
            tolerance = Geometry_1.Geometry.smallAngleRadians;
        const aLow = 1.0 - tolerance;
        const aHigh = 1.0 + tolerance;
        const data = this._polygon.packedData;
        const n = data.length;
        let a;
        for (let i = 3; i < n; i += 4) {
            a = data[i];
            if (a < aLow || a > aHigh)
                return false;
        }
        return true;
    }
    /** Create a curve with given points.
     * * If input is `Point2d[]`, the points are promoted with `z=0` and `w=1`
     * * If input is `Point3d[]`, the points are promoted with w=1`
     *
     */
    static create(data) {
        if (data.length < 1)
            return undefined;
        const polygon = new Float64Array(data.length * 4);
        if (data[0] instanceof Point3dVector3d_1.Point3d) {
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = p.z;
                polygon[i++] = 1.0;
            }
            return new BezierCurve3dH(polygon);
        }
        else if (data[0] instanceof Point4d_1.Point4d) {
            let i = 0;
            for (const p of data) {
                polygon[i++] = p.x;
                polygon[i++] = p.y;
                polygon[i++] = p.z;
                polygon[i++] = p.w;
            }
            return new BezierCurve3dH(polygon);
        }
        else if (data[0] instanceof Point2dVector2d_1.Point2d) {
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
    loadSpan4dPoles(data, spanIndex) {
        this._polygon.loadSpanPoles(data, spanIndex);
    }
    /** Clone the entire curve. */
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
        result = Point3dVector3d_1.Point3d.createFromPackedXYZW(this._workData0, 0, result);
        return result ? result : Point3dVector3d_1.Point3d.createZero();
    }
    /** Return a (deweighted) point on the curve. If deweight fails, returns 000 */
    fractionToPoint4d(fraction, result) {
        this._polygon.evaluate(fraction, this._workData0);
        return Point4d_1.Point4d.createFromPackedXYZW(this._workData0, 0, result);
    }
    /** Return the cartesian point and derivative vector. */
    fractionToPointAndDerivative(fraction, result) {
        this._polygon.evaluate(fraction, this._workData0);
        this._polygon.evaluateDerivative(fraction, this._workData1);
        result = Ray3d_1.Ray3d.createWeightedDerivative(this._workData0, this._workData1, result);
        if (result)
            return result;
        // Bad. Very Bad.  Return origin and x axis.   Should be undefined, but usual cartesian types do not allow that
        return Ray3d_1.Ray3d.createXAxis();
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
            result = Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createXYPlane();
        const ray = this.fractionToPointAndDerivative(fraction, this._workRay0);
        result.origin.setFrom(ray.origin);
        result.vectorU.setFrom(ray.direction);
        const ray0 = this.fractionToPointAndDerivative(fraction - epsilon, this._workRay0);
        const ray1 = this.fractionToPointAndDerivative(fraction + epsilon, this._workRay1);
        Point3dVector3d_1.Vector3d.createAdd2Scaled(ray0.direction, -a, ray1.direction, a, result.vectorV);
        return result;
    }
    /** test for nearly equal control points */
    isAlmostEqual(other) {
        if (other instanceof BezierCurve3dH) {
            return this._polygon.isAlmostEqual(other._polygon);
        }
        return false;
    }
    /** Second step of double dispatch:  call `handler.handleBezierCurve3dH(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleBezierCurve3dH(this);
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
    /** Find the closest point within the bezier span, using true perpendicular test (but no endpoint test)
     * * If closer than previously recorded, update the CurveLocationDetail
     * * This assumes this bezier is saturated.
     * @param spacePoint point being projected
     * @param detail pre-allocated detail to record (evolving) closest point.
     * @returns true if an updated occurred, false if either (a) no perpendicular projections or (b) perpendiculars were not closer.
     */
    updateClosestPointByTruePerpendicular(spacePoint, detail) {
        let numUpdates = 0;
        let roots;
        if (this.isUnitWeight()) {
            // unweighted !!!
            const productOrder = 2 * this.order - 2;
            this.allocateAndZeroBezierWorkData(productOrder, 0, 0);
            const bezier = this._workBezier;
            // closestPoint condition is:
            //   (spacePoint - curvePoint) DOT curveTangent = 0;
            // Each product (x,y,z) of the DOT is the product of two bezier polynomials
            BezierPolynomials_1.BezierPolynomialAlgebra.accumulateScaledShiftedComponentTimesComponentDelta(bezier.coffs, this._polygon.packedData, 4, this.order, 1.0, 0, -spacePoint.x, 0);
            BezierPolynomials_1.BezierPolynomialAlgebra.accumulateScaledShiftedComponentTimesComponentDelta(bezier.coffs, this._polygon.packedData, 4, this.order, 1.0, 1, -spacePoint.y, 1);
            BezierPolynomials_1.BezierPolynomialAlgebra.accumulateScaledShiftedComponentTimesComponentDelta(bezier.coffs, this._polygon.packedData, 4, this.order, 1.0, 2, -spacePoint.z, 2);
            roots = bezier.roots(0.0, true);
        }
        else {
            // This bezier has weights.
            // The pure cartesian closest point condition is
            //   (spacePoint - X/w) DOT (X' w - w' X)/ w^2 = 0
            // ignoring denominator and using bezier coefficient differences for the derivative, making the numerator 0 is
            //   (w * spacePoint - X) DOT ( DELTA X * w - DELTA w * X) = 0
            const orderA = this.order;
            const orderB = 2 * this.order - 2; // products of component and component difference.
            const productOrder = orderA + orderB - 1;
            this.allocateAndZeroBezierWorkData(productOrder, orderA, orderB);
            const bezier = this._workBezier;
            const workA = this._workCoffsA;
            const workB = this._workCoffsB;
            const packedData = this._polygon.packedData;
            for (let i = 0; i < 3; i++) {
                // x representing loop pass:   (w * spacePoint.x - curve.x(s), 1.0) * (curveDelta.x(s) * curve.w(s) - curve.x(s) * curveDelta.w(s))
                // (and p.w is always 1)
                BezierPolynomials_1.BezierPolynomialAlgebra.scaledComponentSum(workA, packedData, 4, orderA, 3, spacePoint.at(i), // w * spacePoint.x
                i, -1.0); // curve.x(s) * 1.0
                BezierPolynomials_1.BezierPolynomialAlgebra.accumulateScaledShiftedComponentTimesComponentDelta(workB, packedData, 4, orderA, 1.0, 3, 1.0, i);
                BezierPolynomials_1.BezierPolynomialAlgebra.accumulateScaledShiftedComponentTimesComponentDelta(workB, packedData, 4, orderA, -1.0, i, 1.0, 3);
                BezierPolynomials_1.BezierPolynomialAlgebra.accumulateProduct(bezier.coffs, workA, workB);
            }
            roots = bezier.roots(0.0, true);
        }
        if (roots) {
            for (const fraction of roots) {
                const xyz = this.fractionToPoint(fraction);
                const a = xyz.distance(spacePoint);
                numUpdates += detail.updateIfCloserCurveFractionPointDistance(this, fraction, xyz, a) ? 1 : 0;
            }
        }
        return numUpdates > 0;
    }
    /** Extend `rangeToExtend`, using candidate extrema at
     * * both end points
     * * any internal extrema in x,y,z
     */
    extendRange(rangeToExtend, transform) {
        const order = this.order;
        if (!transform) {
            this.allocateAndZeroBezierWorkData(order * 2 - 2, 0, 0);
            const bezier = this._workBezier;
            const data = this._polygon.packedData;
            this.getPolePoint3d(0, this._workPoint0);
            rangeToExtend.extend(this._workPoint0);
            this.getPolePoint3d(order - 1, this._workPoint0);
            rangeToExtend.extend(this._workPoint0);
            // Example:
            // For x component ...
            //     coefficients of (weighted x) are at axisIndex=0
            //     deweighted polynomial is (x(s)/w(s))
            //    its derivative (to be zeroed) is
            //              (x'(s)*w(s) -x(s) * w'(s)) / w^2(s)
            // The coefficients of the derivatives are (degree times) differences of successive coffs.
            // Make the numerator zero to get extrema
            for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
                bezier.zero();
                BezierPolynomials_1.BezierPolynomialAlgebra.accumulateScaledShiftedComponentTimesComponentDelta(bezier.coffs, data, 4, order, 1.0, axisIndex, 0.0, 3);
                BezierPolynomials_1.BezierPolynomialAlgebra.accumulateScaledShiftedComponentTimesComponentDelta(bezier.coffs, data, 4, order, -1.0, 3, 0.0, axisIndex);
                const roots = bezier.roots(0.0, true);
                if (roots) {
                    for (const r of roots) {
                        this.fractionToPoint(r, this._workPoint0);
                        rangeToExtend.extend(this._workPoint0);
                    }
                }
            }
        }
        else {
            this.allocateAndZeroBezierWorkData(order * 2 - 2, order, order);
            const componentCoffs = this._workCoffsA; // to hold transformed copy of x,y,z in turn.
            const weightCoffs = this._workCoffsB; // to hold weights
            const bezier = this._workBezier;
            this.getPolePoint3d(0, this._workPoint0);
            rangeToExtend.extendTransformedPoint(transform, this._workPoint0);
            this.getPolePoint3d(order - 1, this._workPoint0);
            rangeToExtend.extendTransformedPoint(transform, this._workPoint0);
            const data = this._polygon.packedData; // Example:
            // For x component ...
            //     coefficients of (weighted x) are at axisIndex=0
            //     deweighted polynomial is (x(s)/w(s))
            //    its derivative (to be zeroed) is
            //              (x'(s)*w(s) -x(s) * w'(s)) / w^2(s)
            // The coefficients of the derivatives are (degree times) differences of successive coffs.
            // Make the numerator zero to get extrema
            // apply one row of the transform to get the transformed coff by itself
            let weight;
            for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
                bezier.zero();
                for (let i = 0, k = 0; i < order; i++, k += 4) {
                    weight = data[k + 3];
                    componentCoffs[i] = transform.multiplyComponentXYZW(axisIndex, data[k], data[k + 1], data[k + 2], weight);
                    weightCoffs[i] = weight;
                }
                BezierPolynomials_1.BezierPolynomialAlgebra.accumulateProductWithDifferences(bezier.coffs, componentCoffs, weightCoffs, 1.0);
                BezierPolynomials_1.BezierPolynomialAlgebra.accumulateProductWithDifferences(bezier.coffs, weightCoffs, componentCoffs, -1.0);
                const roots = bezier.roots(0.0, true);
                if (roots && roots.length > 0) {
                    for (const r of roots) {
                        this.fractionToPoint(r, this._workPoint0);
                        rangeToExtend.extendTransformedPoint(transform, this._workPoint0);
                    }
                }
            }
        }
    }
}
exports.BezierCurve3dH = BezierCurve3dH;
//# sourceMappingURL=BezierCurve3dH.js.map