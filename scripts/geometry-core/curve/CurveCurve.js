"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurveCurveIntersectXY_1 = require("./CurveCurveIntersectXY");
const CurveCurveIntersectXYZ_1 = require("./CurveCurveIntersectXYZ");
const CurveCollection_1 = require("./CurveCollection");
const CurvePrimitive_1 = require("./CurvePrimitive");
/** @module Curve */
/**
 * `CurveCurve` has static method for various computations that work on a pair of curves or curve collections.
 * @public
 */
class CurveCurve {
    /**
     * Return xy intersections of 2 curves.
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     * @deprecated Use CurveCurve.intersectionXYPairs (..) to get results in preferred directly paired form.
     */
    static intersectionXY(geometryA, extendA, geometryB, extendB) {
        const handler = new CurveCurveIntersectXY_1.CurveCurveIntersectXY(undefined, geometryA, extendA, geometryB, extendB);
        geometryA.dispatchToGeometryHandler(handler);
        return handler.grabResults();
    }
    /**
     * Return xy intersections of 2 curves.
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static intersectionXYPairs(geometryA, extendA, geometryB, extendB) {
        const handler = new CurveCurveIntersectXY_1.CurveCurveIntersectXY(undefined, geometryA, extendA, geometryB, extendB);
        if (geometryB instanceof CurvePrimitive_1.CurvePrimitive) {
            geometryA.dispatchToGeometryHandler(handler);
        }
        else if (geometryB instanceof CurveCollection_1.CurveCollection) {
            const allCurves = geometryB.collectCurvePrimitives();
            for (const child of allCurves) {
                handler.resetGeometry(geometryA, false, child, false);
                geometryA.dispatchToGeometryHandler(handler);
            }
        }
        return handler.grabPairedResults();
    }
    /**
     * Return xy intersections of 2 projected curves
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static intersectionProjectedXY(worldToLocal, geometryA, extendA, geometryB, extendB) {
        const handler = new CurveCurveIntersectXY_1.CurveCurveIntersectXY(worldToLocal, geometryA, extendA, geometryB, extendB);
        geometryA.dispatchToGeometryHandler(handler);
        return handler.grabResults();
    }
    /**
     * Return full 3d xyz intersections of 2 curves.
     *  * Implemented for combinations of LineSegment3d, LineString3d, Arc3d.
     *  * Not Implemented for bspline and bezier curves.
     * @beta
     * @param geometryA second geometry
     * @param extendA true to allow geometryA to extend
     * @param geometryB second geometry
     * @param extendB true to allow geometryB to extend
     */
    static intersectionXYZ(geometryA, extendA, geometryB, extendB) {
        const handler = new CurveCurveIntersectXYZ_1.CurveCurveIntersectXYZ(geometryA, extendA, geometryB, extendB);
        geometryA.dispatchToGeometryHandler(handler);
        return handler.grabResults();
    }
}
exports.CurveCurve = CurveCurve;
//# sourceMappingURL=CurveCurve.js.map