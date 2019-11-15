"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Curve */
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
/**
 * CurveLocationDetail carries point and paramter data about a point evaluated on a curve.
 * * These are returned by a variety of queries.
 * * Particular contents can vary among the queries.
 * @public
 */
class UVSurfaceLocationDetail {
    /** Construct with empty data. */
    constructor(surface, uv, point) {
        this.surface = surface;
        this.point = point ? point : Point3dVector3d_1.Point3d.createZero();
        this.uv = uv ? uv : Point2dVector2d_1.Point2d.createZero();
        this.a = 0.0;
    }
    /**
     * Create a new detail structure.
     * @param surface
     * @param uv coordinates to copy (not capture) into the `detail.uv`
     * @param point coordinates to copy (not capture) into the `detail.point`
     */
    static createSurfaceUVPoint(surface, uv, point) {
        const detail = new UVSurfaceLocationDetail(surface);
        if (uv)
            detail.uv.setFrom(uv);
        detail.point.setFromPoint3d(point);
        return detail;
    }
}
exports.UVSurfaceLocationDetail = UVSurfaceLocationDetail;
/**
 * Carrier for both curve and surface data, e.g. from intersection calculations.
 * @public
 */
class CurveAndSurfaceLocationDetail {
    /** CAPTURE both details . . */
    constructor(curveDetail, surfaceDetail) {
        this.curveDetail = curveDetail;
        this.surfaceDetail = surfaceDetail;
    }
}
exports.CurveAndSurfaceLocationDetail = CurveAndSurfaceLocationDetail;
//# sourceMappingURL=SurfaceLocationDetail.js.map