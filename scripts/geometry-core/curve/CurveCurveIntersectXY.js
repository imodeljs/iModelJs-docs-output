"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const GeometryHandler_1 = require("../geometry3d/GeometryHandler");
const CurveLocationDetail_1 = require("./CurveLocationDetail");
const Geometry_1 = require("../Geometry");
const LineSegment3d_1 = require("./LineSegment3d");
const LineString3d_1 = require("./LineString3d");
// import { Arc3d } from "./Arc3d";
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
// import { LineString3d } from "./LineString3d";
const Polynomials_1 = require("../numerics/Polynomials");
const Point4d_1 = require("../geometry4d/Point4d");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Arc3d_1 = require("./Arc3d");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
const BSplineCurve_1 = require("../bspline/BSplineCurve");
const BezierPolynomials_1 = require("../numerics/BezierPolynomials");
const Newton_1 = require("../numerics/Newton");
const Ray3d_1 = require("../geometry3d/Ray3d");
/**
 * * Private class for refining bezier-bezier intersections.
 * * The inputs are assumed pre-transoformed so that the target condition is to match x and y coordinates.
 */
class BezierBezierIntersectionXYRRToRRD extends Newton_1.NewtonEvaluatorRRtoRRD {
    constructor(curveA, curveB) {
        super();
        this._curveA = curveA;
        this._curveB = curveB;
        this._rayA = Ray3d_1.Ray3d.createZero();
        this._rayB = Ray3d_1.Ray3d.createZero();
    }
    evaluate(fractionA, fractionB) {
        this._curveA.fractionToPointAndDerivative(fractionA, this._rayA);
        this._curveB.fractionToPointAndDerivative(fractionB, this._rayB);
        this.currentF.setOriginAndVectorsXYZ(this._rayB.origin.x - this._rayA.origin.x, this._rayB.origin.y - this._rayA.origin.y, 0.0, -this._rayA.direction.x, -this._rayA.direction.y, 0.0, this._rayB.direction.x, this._rayB.direction.y, 0.0);
        return true;
    }
}
/**
 * Data bundle for a pair of arrays of CurveLocationDetail structures such as produced by CurveCurve,IntersectXY and
 * CurveCurve.ClosestApproach
 */
class CurveLocationDetailArrayPair {
    constructor() {
        this.dataA = [];
        this.dataB = [];
    }
}
exports.CurveLocationDetailArrayPair = CurveLocationDetailArrayPair;
/*
 * * Handler class for XY intersections.
 * * This is local to the file (not exported)
 * * Instances are initialized and called from CurveCurve.
 */
class CurveCurveIntersectXY extends GeometryHandler_1.NullGeometryHandler {
    constructor(worldToLocal, _geometryA, extendA, geometryB, extendB) {
        super();
        // this.geometryA = _geometryA;
        this._extendA = extendA;
        this._geometryB = geometryB;
        this._extendB = extendB;
        this._worldToLocalPerspective = undefined;
        this._worldToLocalAffine = undefined;
        if (worldToLocal !== undefined && !worldToLocal.isIdentity()) {
            this._worldToLocalAffine = worldToLocal.asTransform;
            if (!this._worldToLocalAffine)
                this._worldToLocalPerspective = worldToLocal.clone();
        }
        this.reinitialize();
    }
    reinitialize() {
        this._results = new CurveLocationDetailArrayPair();
    }
    /**
     * @param reinitialize if true, a new results structure is created for use by later calls.
     * @returns Return the results structure for the intersection calculation.
     *
     */
    grabResults(reinitialize = false) {
        const result = this._results;
        if (reinitialize)
            this.reinitialize();
        return result;
    }
    acceptFraction(extend0, fraction, extend1) {
        if (!extend0 && fraction < 0.0)
            return false;
        if (!extend1 && fraction > 1.0)
            return false;
        return true;
    }
    /** compute intersection of two line segments.
     * filter by extension rules.
     * record with fraction mapping.
     */
    recordPointWithLocalFractions(localFractionA, cpA, fractionA0, fractionA1, localFractionB, // Computed intersection fraction
    cpB, fractionB0, fractionB1, reversed) {
        const globalFractionA = Geometry_1.Geometry.interpolate(fractionA0, localFractionA, fractionA1);
        const globalFractionB = Geometry_1.Geometry.interpolate(fractionB0, localFractionB, fractionB1);
        // ignore duplicate of most recent point .  ..
        const numPrevious = this._results.dataA.length;
        if (numPrevious > 0) {
            const topFractionA = this._results.dataA[numPrevious - 1].fraction;
            const topFractionB = this._results.dataB[numPrevious - 1].fraction;
            if (reversed) {
                if (Geometry_1.Geometry.isAlmostEqualNumber(topFractionA, globalFractionB) && Geometry_1.Geometry.isAlmostEqualNumber(topFractionB, globalFractionA))
                    return;
            }
            else {
                if (Geometry_1.Geometry.isAlmostEqualNumber(topFractionA, globalFractionA) && Geometry_1.Geometry.isAlmostEqualNumber(topFractionB, globalFractionB))
                    return;
            }
        }
        const detailA = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(cpA, globalFractionA, cpA.fractionToPoint(globalFractionA));
        detailA.setIntervalRole(CurveLocationDetail_1.CurveIntervalRole.isolated);
        const detailB = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(cpB, globalFractionB, cpB.fractionToPoint(globalFractionB));
        detailB.setIntervalRole(CurveLocationDetail_1.CurveIntervalRole.isolated);
        if (reversed) {
            this._results.dataA.push(detailB);
            this._results.dataB.push(detailA);
        }
        else {
            this._results.dataA.push(detailA);
            this._results.dataB.push(detailB);
        }
    }
    /** compute intersection of two line segments.
     * filter by extension rules.
     * record with fraction mapping.
     */
    computeSegmentSegment3D(cpA, extendA0, pointA0, fractionA0, pointA1, fractionA1, extendA1, cpB, extendB0, pointB0, fractionB0, pointB1, fractionB1, extendB1, reversed) {
        const uv = CurveCurveIntersectXY._workVector2dA;
        if (Polynomials_1.SmallSystem.lineSegment3dXYTransverseIntersectionUnbounded(pointA0, pointA1, pointB0, pointB1, uv)
            && this.acceptFraction(extendA0, uv.x, extendA1)
            && this.acceptFraction(extendB0, uv.y, extendB1)) {
            this.recordPointWithLocalFractions(uv.x, cpA, fractionA0, fractionA1, uv.y, cpB, fractionB0, fractionB1, reversed);
        }
    }
    // intersection of PROJECTED homogeneous segments ...  assumes caller knows the _worldToLocal is present
    computeSegmentSegment3DH(cpA, extendA0, pointA0, fractionA0, pointA1, fractionA1, extendA1, cpB, extendB0, pointB0, fractionB0, pointB1, fractionB1, extendB1, reversed) {
        const hA0 = CurveCurveIntersectXY._workPointA0H;
        const hA1 = CurveCurveIntersectXY._workPointA1H;
        const hB0 = CurveCurveIntersectXY._workPointB0H;
        const hB1 = CurveCurveIntersectXY._workPointB1H;
        this._worldToLocalPerspective.multiplyPoint3d(pointA0, 1, hA0);
        this._worldToLocalPerspective.multiplyPoint3d(pointA1, 1, hA1);
        this._worldToLocalPerspective.multiplyPoint3d(pointB0, 1, hB0);
        this._worldToLocalPerspective.multiplyPoint3d(pointB1, 1, hB1);
        const fractionAB = Polynomials_1.SmallSystem.lineSegment3dHXYTransverseIntersectionUnbounded(hA0, hA1, hB0, hB1);
        if (fractionAB !== undefined) {
            const fractionA = fractionAB.x;
            const fractionB = fractionAB.y;
            if (this.acceptFraction(extendA0, fractionA, extendA1) && this.acceptFraction(extendB0, fractionB, extendB1)) {
                // final fraction acceptance uses original world points, with perspective-aware fractions
                this.recordPointWithLocalFractions(fractionA, cpA, fractionA0, fractionA1, fractionB, cpB, fractionB0, fractionB1, reversed);
            }
        }
    }
    // Caller accesses data from a linesegment and passes to here.
    // (The linesegment in question might be (a) a full linesegment or (b) a fragment within a linestring.  The fraction and extend parameters
    // allow all combinations to be passed in)
    // This method applies transform.
    dispatchSegmentSegment(cpA, extendA0, pointA0, fractionA0, pointA1, fractionA1, extendA1, cpB, extendB0, pointB0, fractionB0, pointB1, fractionB1, extendB1, reversed) {
        if (this._worldToLocalAffine) {
            // non-perspective projection
            CurveCurveIntersectXY.setTransformedWorkPoints(this._worldToLocalAffine, pointA0, pointA1, pointB0, pointB1);
            this.computeSegmentSegment3D(cpA, extendA0, CurveCurveIntersectXY._workPointA0, fractionA0, CurveCurveIntersectXY._workPointA1, fractionA1, extendA1, cpB, extendB0, CurveCurveIntersectXY._workPointB0, fractionB0, CurveCurveIntersectXY._workPointB1, fractionB1, extendB1, reversed);
        }
        else if (this._worldToLocalPerspective) {
            this.computeSegmentSegment3DH(cpA, extendA0, pointA0, fractionA0, pointA1, fractionA1, extendA1, cpB, extendB0, pointB0, fractionB0, pointB1, fractionB1, extendB1, reversed);
        }
        else {
            this.computeSegmentSegment3D(cpA, extendA0, pointA0, fractionA0, pointA1, fractionA1, extendA1, cpB, extendB0, pointB0, fractionB0, pointB1, fractionB1, extendB1, reversed);
        }
    }
    // Caller accesses data from a linestring or segment and passes it here.
    // (The linesegment in question might be (a) a full linesegment or (b) a fragment within a linestring.  The fraction and extend parameters
    // allow all combinations to be passed in)
    dispatchSegmentArc(cpA, extendA0, pointA0, fractionA0, pointA1, fractionA1, extendA1, arc, extendB0, extendB1, reversed) {
        // Arc: X = C + cU + sV
        // Line:  contains points A0,A1
        // Arc point colinear with line if det (A0, A1, X) = 0
        // with homogeneous xyw points and vectors.
        // With equational X:   det (A0, A1, C) + c det (A0, A1,U) + s det (A0, A1, V) = 0.
        // solve for theta.
        // evaluate points.
        // project back to line.
        if (this._worldToLocalPerspective) {
            const data = arc.toTransformedPoint4d(this._worldToLocalPerspective);
            const pointA0H = this._worldToLocalPerspective.multiplyPoint3d(pointA0, 1);
            const pointA1H = this._worldToLocalPerspective.multiplyPoint3d(pointA1, 1);
            const alpha = Geometry_1.Geometry.tripleProductPoint4dXYW(pointA0H, pointA1H, data.center);
            const beta = Geometry_1.Geometry.tripleProductPoint4dXYW(pointA0H, pointA1H, data.vector0);
            const gamma = Geometry_1.Geometry.tripleProductPoint4dXYW(pointA0H, pointA1H, data.vector90);
            const cosines = new GrowableFloat64Array_1.GrowableFloat64Array(2);
            const sines = new GrowableFloat64Array_1.GrowableFloat64Array(2);
            const radians = new GrowableFloat64Array_1.GrowableFloat64Array(2);
            const numRoots = Polynomials_1.AnalyticRoots.appendImplicitLineUnitCircleIntersections(alpha, beta, gamma, cosines, sines, radians);
            for (let i = 0; i < numRoots; i++) {
                const arcPoint = data.center.plus2Scaled(data.vector0, cosines.at(i), data.vector90, sines.at(i));
                const arcFraction = data.sweep.radiansToSignedPeriodicFraction(radians.at(i));
                const lineFraction = Polynomials_1.SmallSystem.lineSegment3dHXYClosestPointUnbounded(pointA0H, pointA1H, arcPoint);
                if (lineFraction !== undefined && this.acceptFraction(extendA0, lineFraction, extendA1) && this.acceptFraction(extendB0, arcFraction, extendB1)) {
                    this.recordPointWithLocalFractions(lineFraction, cpA, fractionA0, fractionA1, arcFraction, arc, 0, 1, reversed);
                }
            }
        }
        else {
            const data = arc.toTransformedVectors(this._worldToLocalAffine);
            let pointA0Local = pointA0;
            let pointA1Local = pointA1;
            if (this._worldToLocalAffine) {
                pointA0Local = this._worldToLocalAffine.multiplyPoint3d(pointA0);
                pointA1Local = this._worldToLocalAffine.multiplyPoint3d(pointA1);
            }
            const alpha = Geometry_1.Geometry.tripleProductXYW(pointA0Local, 1, pointA1Local, 1, data.center, 1);
            const beta = Geometry_1.Geometry.tripleProductXYW(pointA0Local, 1, pointA1Local, 1, data.vector0, 0);
            const gamma = Geometry_1.Geometry.tripleProductXYW(pointA0Local, 1, pointA1Local, 1, data.vector90, 0);
            const cosines = new GrowableFloat64Array_1.GrowableFloat64Array(2);
            const sines = new GrowableFloat64Array_1.GrowableFloat64Array(2);
            const radians = new GrowableFloat64Array_1.GrowableFloat64Array(2);
            const numRoots = Polynomials_1.AnalyticRoots.appendImplicitLineUnitCircleIntersections(alpha, beta, gamma, cosines, sines, radians);
            for (let i = 0; i < numRoots; i++) {
                const arcPoint = data.center.plus2Scaled(data.vector0, cosines.at(i), data.vector90, sines.at(i));
                const arcFraction = data.sweep.radiansToSignedPeriodicFraction(radians.at(i));
                const lineFraction = Polynomials_1.SmallSystem.lineSegment3dXYClosestPointUnbounded(pointA0Local, pointA1Local, arcPoint);
                if (lineFraction !== undefined && this.acceptFraction(extendA0, lineFraction, extendA1) && this.acceptFraction(extendB0, arcFraction, extendB1)) {
                    this.recordPointWithLocalFractions(lineFraction, cpA, fractionA0, fractionA1, arcFraction, arc, 0, 1, reversed);
                }
            }
        }
    }
    // Caller accesses data from two arcs.
    // each matrix has [U V C] in (x,y,w) form from projection.
    // invert the projection matrix matrixA.
    // apply the inverse to matrixB. Then arcb is an ellipse in the circular space of A
    dispatchArcArc_thisOrder(cpA, matrixA, // homogeneous xyw projection !!!
    extendA, cpB, matrixB, // homogeneous xyw projection !!!
    extendB, reversed) {
        const inverseA = matrixA.inverse();
        if (inverseA) {
            const localB = inverseA.multiplyMatrixMatrix(matrixB);
            const ellipseRadians = [];
            const circleRadians = [];
            Polynomials_1.TrigPolynomial.SolveUnitCircleHomogeneousEllipseIntersection(localB.coffs[2], localB.coffs[5], localB.coffs[8], // center xyw
            localB.coffs[0], localB.coffs[3], localB.coffs[6], // center xyw
            localB.coffs[1], localB.coffs[4], localB.coffs[7], // center xyw
            ellipseRadians, circleRadians);
            for (let i = 0; i < ellipseRadians.length; i++) {
                const fractionA = cpA.sweep.radiansToSignedPeriodicFraction(circleRadians[i]);
                const fractionB = cpA.sweep.radiansToSignedPeriodicFraction(ellipseRadians[i]);
                // hm .. do we really need to check the fractions?  We know they are internal to the beziers
                if (this.acceptFraction(extendA, fractionA, extendA) && this.acceptFraction(extendB, fractionB, extendB)) {
                    this.recordPointWithLocalFractions(fractionA, cpA, 0, 1, fractionB, cpB, 0, 1, reversed);
                }
            }
        }
    }
    // Caller accesses data from two arcs.
    // Selects the best conditioned arc (in xy parts) as "circle after inversion"
    // Solves the arc-arc equations
    dispatchArcArc(cpA, extendA, cpB, extendB, reversed) {
        // Arc: X = C + cU + sV
        // Line:  contains points A0,A1
        // Arc point colinear with line if det (A0, A1, X) = 0
        // with homogeneous xyw points and vectors.
        // With equational X:   det (A0, A1, C) + c det (A0, A1,U) + s det (A0, A1, V) = 0.
        // solve for theta.
        // evaluate points.
        // project back to line.
        let matrixA;
        let matrixB;
        if (this._worldToLocalPerspective) {
            const dataA = cpA.toTransformedPoint4d(this._worldToLocalPerspective);
            const dataB = cpB.toTransformedPoint4d(this._worldToLocalPerspective);
            matrixA = Matrix3d_1.Matrix3d.createColumnsXYW(dataA.vector0, dataA.vector0.w, dataA.vector90, dataA.vector90.w, dataA.center, dataA.center.w);
            matrixB = Matrix3d_1.Matrix3d.createColumnsXYW(dataB.vector0, dataB.vector0.w, dataB.vector90, dataA.vector90.w, dataB.center, dataB.center.w);
        }
        else {
            const dataA = cpA.toTransformedVectors(this._worldToLocalAffine);
            const dataB = cpB.toTransformedVectors(this._worldToLocalAffine);
            matrixA = Matrix3d_1.Matrix3d.createColumnsXYW(dataA.vector0, 0, dataA.vector90, 0, dataA.center, 1);
            matrixB = Matrix3d_1.Matrix3d.createColumnsXYW(dataB.vector0, 0, dataB.vector90, 0, dataB.center, 1);
        }
        const conditionA = matrixA.conditionNumber();
        const conditionB = matrixB.conditionNumber();
        if (conditionA > conditionB)
            this.dispatchArcArc_thisOrder(cpA, matrixA, extendA, cpB, matrixB, extendB, reversed);
        else
            this.dispatchArcArc_thisOrder(cpB, matrixB, extendB, cpA, matrixA, extendA, !reversed);
    }
    // Caller accesses data from two arcs.
    // Selects the best conditioned arc (in xy parts) as "circle after inversion"
    // Solves the arc-arc equations
    dispatchArcBsplineCurve3d(cpA, extendA, cpB, extendB, reversed) {
        // Arc: X = C + cU + sV
        // implicitize the arc as viewed.  This "3d" matrix is homogeneous "XYW" not "xyz"
        let matrixA;
        if (this._worldToLocalPerspective) {
            const dataA = cpA.toTransformedPoint4d(this._worldToLocalPerspective);
            matrixA = Matrix3d_1.Matrix3d.createColumnsXYW(dataA.vector0, dataA.vector0.w, dataA.vector90, dataA.vector90.w, dataA.center, dataA.center.w);
        }
        else {
            const dataA = cpA.toTransformedVectors(this._worldToLocalAffine);
            matrixA = Matrix3d_1.Matrix3d.createColumnsXYW(dataA.vector0, 0, dataA.vector90, 0, dataA.center, 1);
        }
        // The worldToLocal has moved the arc vectors into screen space.
        // matrixA captures the xyw parts (ignoring z)
        // for any point in world space,
        // THIS CODE ONLY WORKS FOR
        const matrixAinverse = matrixA.inverse();
        if (matrixAinverse) {
            const orderF = cpB.order; // order of the beziers for simple coordinates
            const orderG = 2 * orderF - 1; // order of the (single) bezier for squared coordinates.
            const coffF = new Float64Array(orderF);
            const univariateBezierG = new BezierPolynomials_1.UnivariateBezier(orderG);
            const axx = matrixAinverse.at(0, 0);
            const axy = matrixAinverse.at(0, 1);
            const axz = 0.0;
            const axw = matrixAinverse.at(0, 2);
            const ayx = matrixAinverse.at(1, 0);
            const ayy = matrixAinverse.at(1, 1);
            const ayz = 0.0;
            const ayw = matrixAinverse.at(1, 2);
            const awx = matrixAinverse.at(2, 0);
            const awy = matrixAinverse.at(2, 1);
            const awz = 0.0;
            const aww = matrixAinverse.at(2, 2);
            if (matrixAinverse) {
                let bezier;
                for (let spanIndex = 0;; spanIndex++) {
                    bezier = cpB.getSaturatedBezierSpan3dH(spanIndex, bezier);
                    if (!bezier)
                        break;
                    if (this._worldToLocalPerspective)
                        bezier.tryMultiplyMatrix4dInPlace(this._worldToLocalPerspective);
                    else if (this._worldToLocalAffine)
                        bezier.tryTransformInPlace(this._worldToLocalAffine);
                    univariateBezierG.zero();
                    bezier.poleProductsXYZW(coffF, axx, axy, axz, axw);
                    univariateBezierG.addSquaredSquaredBezier(coffF, 1.0);
                    bezier.poleProductsXYZW(coffF, ayx, ayy, ayz, ayw);
                    univariateBezierG.addSquaredSquaredBezier(coffF, 1.0);
                    bezier.poleProductsXYZW(coffF, awx, awy, awz, aww);
                    univariateBezierG.addSquaredSquaredBezier(coffF, -1.0);
                    const roots = univariateBezierG.roots(0.0, true);
                    if (roots) {
                        for (const root of roots) {
                            const fractionB = bezier.fractionToParentFraction(root);
                            // The univariate bezier (which has been transformed by the view transform) evaluates into xyw space
                            const bcurvePoint4d = bezier.fractionToPoint4d(root);
                            const c = bcurvePoint4d.dotProductXYZW(axx, axy, axz, axw);
                            const s = bcurvePoint4d.dotProductXYZW(ayx, ayy, ayz, ayw);
                            const arcFraction = cpA.sweep.radiansToSignedPeriodicFraction(Math.atan2(s, c));
                            if (this.acceptFraction(extendA, arcFraction, extendA) && this.acceptFraction(extendB, fractionB, extendB)) {
                                this.recordPointWithLocalFractions(arcFraction, cpA, 0, 1, fractionB, cpB, 0, 1, reversed);
                            }
                        }
                    }
                }
            }
        }
    }
    /** apply the transformation to bezier curves. optionally construct ranges.
     *
     */
    transformBeziers(beziers) {
        if (this._worldToLocalAffine) {
            for (const bezier of beziers)
                bezier.tryTransformInPlace(this._worldToLocalAffine);
        }
        else if (this._worldToLocalPerspective) {
            for (const bezier of beziers)
                bezier.tryMultiplyMatrix4dInPlace(this._worldToLocalPerspective);
        }
    }
    getRanges(beziers) {
        const ranges = [];
        ranges.length = 0;
        for (const b of beziers) {
            ranges.push(b.range());
        }
        return ranges;
    }
    dispatchBezierBezierStrokeFirst(bezierA, bcurveA, strokeCountA, bezierB, bcurveB, _strokeCOuntB, univariateBezierB, // caller-allocated for univariate coefficients.
    reversed) {
        if (!this._xyzwA0)
            this._xyzwA0 = Point4d_1.Point4d.create();
        if (!this._xyzwA1)
            this._xyzwA1 = Point4d_1.Point4d.create();
        if (!this._xyzwPlane)
            this._xyzwPlane = Point4d_1.Point4d.create();
        if (!this._xyzwB)
            this._xyzwB = Point4d_1.Point4d.create();
        /*
    
                  const roots = univariateBezierG.roots(0.0, true);
                  if (roots) {
                    for (const root of roots) {
                      const fractionB = bezier.fractionToParentFraction(root);
                      // The univariate bezier (which has been transformed by the view transform) evaluates into xyw space
                      const bcurvePoint4d = bezier.fractionToPoint4d(root);
                      const c = bcurvePoint4d.dotProductXYZW(axx, axy, axz, axw);
                      const s = bcurvePoint4d.dotProductXYZW(ayx, ayy, ayz, ayw);
                      const arcFraction = cpA.sweep.radiansToSignedPeriodicFraction(Math.atan2(s, c));
                      if (this.acceptFraction(extendA, arcFraction, extendA) && this.acceptFraction(extendB, fractionB, extendB)) {
                        this.recordPointWithLocalFractions(arcFraction, cpA, 0, 1,
                          fractionB, cpB, 0, 1, reversed);
                      }
                    }
        */
        bezierA.fractionToPoint4d(0.0, this._xyzwA0);
        let f0 = 0.0;
        let f1 = 1.0;
        const intervalTolerance = 1.0e-5;
        const df = 1.0 / strokeCountA;
        for (let i = 1; i <= strokeCountA; i++, f0 = f1, this._xyzwA0.setFrom(this._xyzwA1)) {
            f1 = i * df;
            bezierA.fractionToPoint4d(f1, this._xyzwA1);
            Point4d_1.Point4d.createPlanePointPointZ(this._xyzwA0, this._xyzwA1, this._xyzwPlane);
            bezierB.poleProductsXYZW(univariateBezierB.coffs, this._xyzwPlane.x, this._xyzwPlane.y, this._xyzwPlane.z, this._xyzwPlane.w);
            let errors = 0;
            const roots = univariateBezierB.roots(0.0, true);
            if (roots)
                for (const r of roots) {
                    let bezierBFraction = r;
                    bezierB.fractionToPoint4d(bezierBFraction, this._xyzwB);
                    const segmentAFraction = Polynomials_1.SmallSystem.lineSegment3dHXYClosestPointUnbounded(this._xyzwA0, this._xyzwA1, this._xyzwB);
                    if (segmentAFraction && Geometry_1.Geometry.isIn01WithTolerance(segmentAFraction, intervalTolerance)) {
                        let bezierAFraction = Geometry_1.Geometry.interpolate(f0, segmentAFraction, f1);
                        const xyMatchingFunction = new BezierBezierIntersectionXYRRToRRD(bezierA, bezierB);
                        const newtonSearcher = new Newton_1.Newton2dUnboundedWithDerivative(xyMatchingFunction);
                        newtonSearcher.setUV(bezierAFraction, bezierBFraction);
                        if (newtonSearcher.runIterations()) {
                            bezierAFraction = newtonSearcher.getU();
                            bezierBFraction = newtonSearcher.getV();
                        }
                        // We have a near intersection at fractions on the two beziers !!!
                        // Iterate on the curves for a true intersection ....
                        // NEEDS WORK -- just accept . . .
                        const bcurveAFraction = bezierA.fractionToParentFraction(bezierAFraction);
                        const bcurveBFraction = bezierB.fractionToParentFraction(bezierBFraction);
                        const xyzA0 = bezierA.fractionToPoint(bezierAFraction);
                        const xyzA1 = bcurveA.fractionToPoint(bcurveAFraction);
                        const xyzB0 = bezierB.fractionToPoint(bezierBFraction);
                        const xyzB1 = bcurveB.fractionToPoint(bcurveBFraction);
                        if (!xyzA0.isAlmostEqualXY(xyzA1))
                            errors++;
                        if (!xyzB0.isAlmostEqualXY(xyzB1))
                            errors++;
                        if (errors > 0 && !xyzA0.isAlmostEqual(xyzB0))
                            errors++;
                        if (errors > 0 && !xyzA1.isAlmostEqual(xyzB1))
                            errors++;
                        if (this.acceptFraction(false, bcurveAFraction, false) && this.acceptFraction(false, bcurveBFraction, false)) {
                            this.recordPointWithLocalFractions(bcurveAFraction, bcurveA, 0, 1, bcurveBFraction, bcurveB, 0, 1, reversed);
                        }
                    }
                }
        }
    }
    // Caller accesses data from two arcs.
    // Selects the best conditioned arc (in xy parts) as "circle after inversion"
    // Solves the arc-arc equations
    dispatchBSplineCurve3dBSplineCurve3d(bcurveA, bcurveB, _reversed) {
        const bezierSpanA = bcurveA.collectBezierSpans(true);
        const bezierSpanB = bcurveB.collectBezierSpans(true);
        const numA = bezierSpanA.length;
        const numB = bezierSpanB.length;
        this.transformBeziers(bezierSpanA);
        this.transformBeziers(bezierSpanB);
        const rangeA = this.getRanges(bezierSpanA);
        const rangeB = this.getRanges(bezierSpanB);
        const orderA = bcurveA.order;
        const orderB = bcurveB.order;
        const univariateCoffsA = new BezierPolynomials_1.UnivariateBezier(orderA);
        const univairateCoffsB = new BezierPolynomials_1.UnivariateBezier(orderB);
        for (let a = 0; a < numA; a++) {
            for (let b = 0; b < numB; b++) {
                if (rangeA[a].intersectsRangeXY(rangeB[b])) {
                    const strokeCountA = bezierSpanA[a].strokeCount();
                    const strokeCountB = bezierSpanB[b].strokeCount();
                    if (strokeCountA < strokeCountB)
                        this.dispatchBezierBezierStrokeFirst(bezierSpanA[a], bcurveA, strokeCountA, bezierSpanB[b], bcurveB, strokeCountB, univairateCoffsB, !_reversed);
                    else
                        this.dispatchBezierBezierStrokeFirst(bezierSpanB[b], bcurveB, strokeCountB, bezierSpanA[a], bcurveA, strokeCountA, univariateCoffsA, _reversed);
                }
            }
        }
    }
    /**
     * Apply the projection transform (if any) to (xyz, w)
     * @param xyz xyz parts of input point.
     * @param w   weight to use for homogeneous effects
     */
    projectPoint(xyz, w = 1.0) {
        if (this._worldToLocalPerspective)
            return this._worldToLocalPerspective.multiplyPoint3d(xyz, w);
        if (this._worldToLocalAffine)
            return this._worldToLocalAffine.multiplyXYZW(xyz.x, xyz.y, xyz.z, w);
        return Point4d_1.Point4d.createFromPointAndWeight(xyz, w);
    }
    mapNPCPlaneToWorld(npcPlane, worldPlane) {
        // for NPC pointY, Y^ * H = 0 is "on" plane H.  (Hat is tranpose)
        // NPC Y is A*X for our transform A and worldPointX.
        // hence (A X)^ * H = 0
        // hence X^ * A^ * H = 0
        // hence K = A^ * H
        if (this._worldToLocalAffine) {
            this._worldToLocalAffine.multiplyTransposeXYZW(npcPlane.x, npcPlane.y, npcPlane.z, npcPlane.w, worldPlane);
        }
        else if (this._worldToLocalPerspective) {
            this._worldToLocalPerspective.multiplyTransposePoint4d(npcPlane, worldPlane);
        }
        else {
            npcPlane.clone(worldPlane);
        }
    }
    // Caller accesses data from segment and bsplineCurve
    // Selects the best conditioned arc (in xy parts) as "circle after inversion"
    // Solves the arc-arc equations
    dispatchSegmentBsplineCurve(cpA, extendA0, pointA0, fractionA0, pointA1, fractionA1, extendA1, bcurve, extendB, reversed) {
        const pointA0H = this.projectPoint(pointA0);
        const pointA1H = this.projectPoint(pointA1);
        const planeCoffs = Point4d_1.Point4d.createPlanePointPointZ(pointA0H, pointA1H);
        this.mapNPCPlaneToWorld(planeCoffs, planeCoffs);
        // NOW .. we have a plane in world space.  Intersect it with the bspline:
        const intersections = [];
        bcurve.appendPlaneIntersectionPoints(planeCoffs, intersections);
        // intersections has WORLD points with bspline fractions.   (The bspline fractions are all good 0..1 fractions within the spline.)
        // accept those that are within the segment range.
        for (const detail of intersections) {
            const fractionB = detail.fraction;
            const curvePoint = detail.point;
            const curvePointH = this.projectPoint(curvePoint);
            const lineFraction = Polynomials_1.SmallSystem.lineSegment3dHXYClosestPointUnbounded(pointA0H, pointA1H, curvePointH);
            if (lineFraction !== undefined && this.acceptFraction(extendA0, lineFraction, extendA1) && this.acceptFraction(extendB, fractionB, extendB)) {
                this.recordPointWithLocalFractions(lineFraction, cpA, fractionA0, fractionA1, fractionB, bcurve, 0, 1, reversed);
            }
        }
    }
    dispatchLineStringBSplineCurve(lsA, extendA, curveB, extendB, reversed) {
        const numA = lsA.numPoints();
        if (numA > 1) {
            const dfA = 1.0 / (numA - 1);
            let fA0;
            let fA1;
            fA0 = 0.0;
            const pointA0 = CurveCurveIntersectXY._workPointA0;
            const pointA1 = CurveCurveIntersectXY._workPointA1;
            lsA.pointAt(0, pointA0);
            for (let iA = 1; iA < numA; iA++, pointA0.setFrom(pointA1), fA0 = fA1) {
                lsA.pointAt(iA, pointA1);
                fA1 = iA * dfA;
                this.dispatchSegmentBsplineCurve(lsA, iA === 1 && extendA, pointA0, fA0, pointA1, fA1, (iA + 1) === numA && extendA, curveB, extendB, reversed);
            }
        }
        return undefined;
    }
    computeSegmentLineString(lsA, extendA, lsB, extendB, reversed) {
        const pointA0 = lsA.point0Ref;
        const pointA1 = lsA.point1Ref;
        const pointB0 = CurveCurveIntersectXY._workPointBB0;
        const pointB1 = CurveCurveIntersectXY._workPointBB1;
        const numB = lsB.numPoints();
        if (numB > 1) {
            const dfB = 1.0 / (numB - 1);
            let fB0;
            let fB1;
            fB0 = 0.0;
            lsB.pointAt(0, pointB0);
            for (let ib = 1; ib < numB; ib++, pointB0.setFrom(pointB1), fB0 = fB1) {
                lsB.pointAt(ib, pointB1);
                fB1 = ib * dfB;
                this.dispatchSegmentSegment(lsA, extendA, pointA0, 0.0, pointA1, 1.0, extendA, lsB, ib === 1 && extendB, pointB0, fB0, pointB1, fB1, (ib + 1) === numB && extendB, reversed);
            }
        }
        return undefined;
    }
    computeArcLineString(arcA, extendA, lsB, extendB, reversed) {
        const pointB0 = CurveCurveIntersectXY._workPointBB0;
        const pointB1 = CurveCurveIntersectXY._workPointBB1;
        const numB = lsB.numPoints();
        if (numB > 1) {
            const dfB = 1.0 / (numB - 1);
            let fB0;
            let fB1;
            fB0 = 0.0;
            lsB.pointAt(0, pointB0);
            for (let ib = 1; ib < numB; ib++, pointB0.setFrom(pointB1), fB0 = fB1) {
                lsB.pointAt(ib, pointB1);
                fB1 = ib * dfB;
                this.dispatchSegmentArc(lsB, ib === 1 && extendB, pointB0, fB0, pointB1, fB1, (ib + 1) === numB && extendB, arcA, extendA, extendA, !reversed);
            }
        }
        return undefined;
    }
    static setTransformedWorkPoints(transform, pointA0, pointA1, pointB0, pointB1) {
        transform.multiplyPoint3d(pointA0, this._workPointA0);
        transform.multiplyPoint3d(pointA1, this._workPointA1);
        transform.multiplyPoint3d(pointB0, this._workPointB0);
        transform.multiplyPoint3d(pointB1, this._workPointB1);
    }
    handleLineSegment3d(segmentA) {
        if (this._geometryB instanceof LineSegment3d_1.LineSegment3d) {
            const segmentB = this._geometryB;
            this.dispatchSegmentSegment(segmentA, this._extendA, segmentA.point0Ref, 0.0, segmentA.point1Ref, 1.0, this._extendA, segmentB, this._extendB, segmentB.point0Ref, 0.0, segmentB.point1Ref, 1.0, this._extendB, false);
        }
        else if (this._geometryB instanceof LineString3d_1.LineString3d) {
            this.computeSegmentLineString(segmentA, this._extendA, this._geometryB, this._extendB, false);
        }
        else if (this._geometryB instanceof Arc3d_1.Arc3d) {
            this.dispatchSegmentArc(segmentA, this._extendA, segmentA.point0Ref, 0.0, segmentA.point1Ref, 1.0, this._extendA, this._geometryB, this._extendB, this._extendB, false);
        }
        else if (this._geometryB instanceof BSplineCurve_1.BSplineCurve3d) {
            this.dispatchSegmentBsplineCurve(segmentA, this._extendA, segmentA.point0Ref, 0.0, segmentA.point1Ref, 1.0, this._extendA, this._geometryB, this._extendB, false);
        }
    }
    handleLineString3d(lsA) {
        if (this._geometryB instanceof LineString3d_1.LineString3d) {
            const lsB = this._geometryB;
            const pointA0 = CurveCurveIntersectXY._workPointAA0;
            const pointA1 = CurveCurveIntersectXY._workPointAA1;
            const pointB0 = CurveCurveIntersectXY._workPointBB0;
            const pointB1 = CurveCurveIntersectXY._workPointBB1;
            const numA = lsA.numPoints();
            const numB = lsB.numPoints();
            if (numA > 1 && numB > 1) {
                lsA.pointAt(0, pointA0);
                const dfA = 1.0 / (numA - 1);
                const dfB = 1.0 / (numB - 1);
                let fA0 = 0.0;
                let fB0;
                let fA1;
                let fB1;
                const extendA = this._extendA;
                const extendB = this._extendB;
                lsA.pointAt(0, pointA0);
                for (let ia = 1; ia < numA; ia++, pointA0.setFrom(pointA1), fA0 = fA1) {
                    fA1 = ia * dfA;
                    fB0 = 0.0;
                    lsA.pointAt(ia, pointA1);
                    lsB.pointAt(0, pointB0);
                    for (let ib = 1; ib < numB; ib++, pointB0.setFrom(pointB1), fB0 = fB1) {
                        lsB.pointAt(ib, pointB1);
                        fB1 = ib * dfB;
                        this.dispatchSegmentSegment(lsA, ia === 1 && extendA, pointA0, fA0, pointA1, fA1, (ia + 1) === numA && extendA, lsB, ib === 1 && extendB, pointB0, fB0, pointB1, fB1, (ib + 1) === numB && extendB, false);
                    }
                }
            }
        }
        else if (this._geometryB instanceof LineSegment3d_1.LineSegment3d) {
            this.computeSegmentLineString(this._geometryB, this._extendB, lsA, this._extendA, true);
        }
        else if (this._geometryB instanceof Arc3d_1.Arc3d) {
            this.computeArcLineString(this._geometryB, this._extendB, lsA, this._extendA, true);
        }
        else if (this._geometryB instanceof BSplineCurve_1.BSplineCurve3d) {
            this.dispatchLineStringBSplineCurve(lsA, this._extendA, this._geometryB, this._extendB, false);
        }
        return undefined;
    }
    handleArc3d(arc0) {
        if (this._geometryB instanceof LineSegment3d_1.LineSegment3d) {
            this.dispatchSegmentArc(this._geometryB, this._extendB, this._geometryB.point0Ref, 0.0, this._geometryB.point1Ref, 1.0, this._extendB, arc0, this._extendA, this._extendA, true);
        }
        else if (this._geometryB instanceof LineString3d_1.LineString3d) {
            this.computeArcLineString(arc0, this._extendA, this._geometryB, this._extendB, false);
        }
        else if (this._geometryB instanceof Arc3d_1.Arc3d) {
            this.dispatchArcArc(arc0, this._extendA, this._geometryB, this._extendB, false);
        }
        else if (this._geometryB instanceof BSplineCurve_1.BSplineCurve3d) {
            this.dispatchArcBsplineCurve3d(arc0, this._extendA, this._geometryB, this._extendB, false);
        }
        return undefined;
    }
    handleBSplineCurve3d(curve) {
        if (this._geometryB instanceof LineSegment3d_1.LineSegment3d) {
            this.dispatchSegmentBsplineCurve(this._geometryB, this._extendB, this._geometryB.point0Ref, 0.0, this._geometryB.point1Ref, 1.0, this._extendB, curve, this._extendA, true);
        }
        else if (this._geometryB instanceof LineString3d_1.LineString3d) {
            this.dispatchLineStringBSplineCurve(this._geometryB, this._extendB, curve, this._extendA, true);
        }
        else if (this._geometryB instanceof Arc3d_1.Arc3d) {
            this.dispatchArcBsplineCurve3d(this._geometryB, this._extendB, curve, this._extendA, true);
        }
        else if (this._geometryB instanceof BSplineCurve_1.BSplineCurve3dBase) {
            this.dispatchBSplineCurve3dBSplineCurve3d(curve, this._geometryB, false);
        }
        return undefined;
    }
    handleBSplineCurve3dH(_curve) {
        /* NEEDS WORK -- make "dispatch" methods tolerant of both 3d and 3dH ..."easy" if both present BezierCurve3dH span loaders
        if (this._geometryB instanceof LineSegment3d) {
          this.dispatchSegmentBsplineCurve(
            this._geometryB, this._extendB, this._geometryB.point0Ref, 0.0, this._geometryB.point1Ref, 1.0, this._extendB,
            curve, this._extendA, true);
        } else if (this._geometryB instanceof LineString3d) {
          this.dispatchLineStringBSplineCurve(this._geometryB, this._extendB, curve, this._extendA, true);
        } else if (this._geometryB instanceof Arc3d) {
          this.dispatchArcBsplineCurve3d(this._geometryB, this._extendB, curve, this._extendA, true);
        }
        */
        return undefined;
    }
}
CurveCurveIntersectXY._workVector2dA = Point2dVector2d_1.Vector2d.create();
CurveCurveIntersectXY._workPointA0H = Point4d_1.Point4d.create();
CurveCurveIntersectXY._workPointA1H = Point4d_1.Point4d.create();
CurveCurveIntersectXY._workPointB0H = Point4d_1.Point4d.create();
CurveCurveIntersectXY._workPointB1H = Point4d_1.Point4d.create();
CurveCurveIntersectXY._workPointAA0 = Point3dVector3d_1.Point3d.create();
CurveCurveIntersectXY._workPointAA1 = Point3dVector3d_1.Point3d.create();
CurveCurveIntersectXY._workPointBB0 = Point3dVector3d_1.Point3d.create();
CurveCurveIntersectXY._workPointBB1 = Point3dVector3d_1.Point3d.create();
CurveCurveIntersectXY._workPointA0 = Point3dVector3d_1.Point3d.create();
CurveCurveIntersectXY._workPointA1 = Point3dVector3d_1.Point3d.create();
CurveCurveIntersectXY._workPointB0 = Point3dVector3d_1.Point3d.create();
CurveCurveIntersectXY._workPointB1 = Point3dVector3d_1.Point3d.create();
class CurveCurve {
    /**
     * Return xy intersections of 2 curves.
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static IntersectionXY(geometryA, extendA, geometryB, extendB) {
        const handler = new CurveCurveIntersectXY(undefined, geometryA, extendA, geometryB, extendB);
        geometryA.dispatchToGeometryHandler(handler);
        return handler.grabResults();
    }
    /**
     * Return xy intersections of 2 projected curves
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static IntersectionProjectedXY(worldToLocal, geometryA, extendA, geometryB, extendB) {
        const handler = new CurveCurveIntersectXY(worldToLocal, geometryA, extendA, geometryB, extendB);
        geometryA.dispatchToGeometryHandler(handler);
        return handler.grabResults();
    }
}
exports.CurveCurve = CurveCurve;
//# sourceMappingURL=CurveCurveIntersectXY.js.map