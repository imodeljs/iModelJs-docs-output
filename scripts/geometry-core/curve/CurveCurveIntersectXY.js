"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const GeometryHandler_1 = require("../GeometryHandler");
const CurvePrimitive_1 = require("./CurvePrimitive");
const Geometry_1 = require("../Geometry");
const LineSegment3d_1 = require("./LineSegment3d");
const LineString3d_1 = require("./LineString3d");
// import { Arc3d } from "./Arc3d";
const PointVector_1 = require("../PointVector");
// import { LineString3d } from "./LineString3d";
const Polynomials_1 = require("../numerics/Polynomials");
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
    constructor(_geometryA, extendA, geometryB, extendB) {
        super();
        // this.geometryA = _geometryA;
        this.extendA = extendA;
        this.geometryB = geometryB;
        this.extendB = extendB;
        this.reinitialize();
    }
    reinitialize() {
        this.results = new CurveLocationDetailArrayPair();
    }
    /**
     * @param reinitialize if true, a new results structure is created for use by later calls.
     * @returns Return the results structure for the intersection calculation.
     *
     */
    grabResults(reinitialize = false) {
        const result = this.results;
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
    computeSegmentSegment(cpA, extendA0, pointA0, fractionA0, pointA1, fractionA1, extendA1, cpB, extendB0, pointB0, fractionB0, pointB1, fractionB1, extendB1, reversed) {
        const uv = CurveCurveIntersectXY.workVector2dA;
        if (Polynomials_1.SmallSystem.lineSegment3dXYTransverseIntersectionUnbounded(pointA0, pointA1, pointB0, pointB1, uv)
            && this.acceptFraction(extendA0, uv.x, extendA1)
            && this.acceptFraction(extendB0, uv.y, extendB1)) {
            const detailA = CurvePrimitive_1.CurveLocationDetail.createCurveFractionPoint(cpA, Geometry_1.Geometry.interpolate(fractionA0, uv.x, fractionA1), pointA0.interpolate(uv.x, pointA1));
            detailA.setIntervalRole(CurvePrimitive_1.CurveIntervalRole.isolated);
            const detailB = CurvePrimitive_1.CurveLocationDetail.createCurveFractionPoint(cpB, Geometry_1.Geometry.interpolate(fractionB0, uv.y, fractionB1), pointB0.interpolate(uv.y, pointB1));
            detailB.setIntervalRole(CurvePrimitive_1.CurveIntervalRole.isolated);
            if (reversed) {
                this.results.dataA.push(detailB);
                this.results.dataB.push(detailA);
            }
            else {
                this.results.dataA.push(detailA);
                this.results.dataB.push(detailB);
            }
        }
    }
    computeSegmentLineString(lsA, extendA, lsB, extendB, reversed) {
        const pointA0 = lsA.point0Ref;
        const pointA1 = lsA.point1Ref;
        const pointB0 = CurveCurveIntersectXY.workPointB0;
        const pointB1 = CurveCurveIntersectXY.workPointB1;
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
                this.computeSegmentSegment(lsA, extendA, pointA0, 0.0, pointA1, 1.0, extendA, lsB, ib === 1 && extendB, pointB0, fB0, pointB1, fB1, (ib + 1) === numB && extendB, reversed);
            }
        }
        return undefined;
    }
    handleLineSegment3d(segmentA) {
        if (this.geometryB instanceof LineSegment3d_1.LineSegment3d) {
            const segmentB = this.geometryB;
            this.computeSegmentSegment(segmentA, this.extendA, segmentA.point0Ref, 0.0, segmentA.point1Ref, 1.0, this.extendA, segmentB, this.extendB, segmentB.point0Ref, 0.0, segmentB.point1Ref, 1.0, this.extendB, false);
        }
        else if (this.geometryB instanceof LineString3d_1.LineString3d) {
            this.computeSegmentLineString(segmentA, this.extendA, this.geometryB, this.extendB, false);
        }
    }
    handleLineString3d(lsA) {
        if (this.geometryB instanceof LineString3d_1.LineString3d) {
            const lsB = this.geometryB;
            const pointA0 = CurveCurveIntersectXY.workPointA0;
            const pointA1 = CurveCurveIntersectXY.workPointA1;
            const pointB0 = CurveCurveIntersectXY.workPointB0;
            const pointB1 = CurveCurveIntersectXY.workPointB1;
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
                const extendA = this.extendA;
                const extendB = this.extendB;
                lsA.pointAt(0, pointA0);
                for (let ia = 1; ia < numA; ia++, pointA0.setFrom(pointA1), fA0 = fA1) {
                    fA1 = ia * dfA;
                    fB0 = 0.0;
                    lsA.pointAt(ia, pointA1);
                    lsB.pointAt(0, pointB0);
                    for (let ib = 1; ib < numB; ib++, pointB0.setFrom(pointB1), fB0 = fB1) {
                        lsB.pointAt(ib, pointB1);
                        fB1 = ib * dfB;
                        this.computeSegmentSegment(lsA, ia === 1 && extendA, pointA0, fA0, pointA1, fA1, (ia + 1) === numA && extendA, lsB, ib === 1 && extendB, pointB0, fB0, pointB1, fB1, (ib + 1) === numB && extendB, false);
                    }
                }
            }
        }
        else if (this.geometryB instanceof LineSegment3d_1.LineSegment3d) {
            this.computeSegmentLineString(this.geometryB, this.extendB, lsA, this.extendA, true);
        }
        return undefined;
        /*  public handleArc3d(arc0: Arc3d): any {
            if (this.geometryB instanceof Arc3d) {
            }
            return undefined;
          }
          */
    }
}
CurveCurveIntersectXY.workVector2dA = PointVector_1.Vector2d.create();
CurveCurveIntersectXY.workPointA0 = PointVector_1.Point3d.create();
CurveCurveIntersectXY.workPointA1 = PointVector_1.Point3d.create();
CurveCurveIntersectXY.workPointB0 = PointVector_1.Point3d.create();
CurveCurveIntersectXY.workPointB1 = PointVector_1.Point3d.create();
class CurveCurve {
    static IntersectionXY(geometryA, extendA, geometryB, extendB) {
        const handler = new CurveCurveIntersectXY(geometryA, extendA, geometryB, extendB);
        geometryA.dispatchToGeometryHandler(handler);
        return handler.grabResults();
    }
}
exports.CurveCurve = CurveCurve;
//# sourceMappingURL=CurveCurveIntersectXY.js.map