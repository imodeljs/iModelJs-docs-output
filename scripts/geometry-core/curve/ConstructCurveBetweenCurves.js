"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const GeometryHandler_1 = require("../GeometryHandler");
const LineSegment3d_1 = require("./LineSegment3d");
const Arc3d_1 = require("./Arc3d");
const PointVector_1 = require("../PointVector");
const LineString3d_1 = require("./LineString3d");
/**
 * Context for constructing a curve that is interpolated between two other curves.
 * * The only callable method is the static `InterpolateBetween`.
 * * Other methods are called only by `dispatchToGeometryHandler`
 */
class ConstructCurveBetweenCurves extends GeometryHandler_1.NullGeometryHandler {
    constructor(_geometry0, _fraction, _geometry1) {
        super();
        // this.geometry0 = _geometry0;   <-- Never used
        this._geometry1 = _geometry1;
        this._fraction = _fraction;
    }
    /**
     * * To be directly called only by double displatcher
     * * Assumes this.geometry1 was set by calling context.
     * * Construct the interpoalted curve between this.geomtry1 and the supplied segment0.
     */
    handleLineSegment3d(segment0) {
        if (this._geometry1 instanceof LineSegment3d_1.LineSegment3d) {
            const segment1 = this._geometry1;
            return LineSegment3d_1.LineSegment3d.create(segment0.startPoint().interpolate(this._fraction, segment1.startPoint()), segment0.endPoint().interpolate(this._fraction, segment1.endPoint()));
        }
        return undefined;
    }
    /**
     * * To be directly called only by double displatcher
     * * Assumes this.geometry1 was set by calling context.
     * * Construct the interpoalted curve between this.geomtry1 and the supplied ls0.
     */
    handleLineString3d(ls0) {
        if (this._geometry1 instanceof LineString3d_1.LineString3d) {
            const ls1 = this._geometry1;
            if (ls0.numPoints() === ls1.numPoints()) {
                const ls = LineString3d_1.LineString3d.create();
                const workPoint = PointVector_1.Point3d.create();
                const workPoint0 = PointVector_1.Point3d.create();
                const workPoint1 = PointVector_1.Point3d.create();
                for (let i = 0; i < ls0.numPoints(); i++) {
                    ls0.pointAt(i, workPoint0);
                    ls1.pointAt(i, workPoint1);
                    workPoint0.interpolate(this._fraction, workPoint1, workPoint);
                    ls.addPoint(workPoint);
                }
                return ls;
            }
        }
        return undefined;
    }
    /**
     * * To be directly called only by double displatcher
     * * Assumes this.geometry1 was set by calling context.
     * * Construct the interpoalted curve between this.geomtry1 and the supplied arc0.
     */
    handleArc3d(arc0) {
        if (this._geometry1 instanceof Arc3d_1.Arc3d) {
            const arc1 = this._geometry1;
            return Arc3d_1.Arc3d.create(arc0.center.interpolate(this._fraction, arc1.center), arc0.vector0.interpolate(this._fraction, arc1.vector0), arc0.vector90.interpolate(this._fraction, arc1.vector90), arc0.sweep.interpolate(this._fraction, arc1.sweep));
        }
        return undefined;
    }
    /**
     * Construct a geometry item which is fractionally interpolated btween two others.
     * * The construction is only supported between certain types:
     * * * LineSegment3d+LineSegment3d -- endpoints are interpolated
     * * * LineString3d+LineString3d with matching counts.  Each point is interpolated.
     * * * Arc3d+Arc3d -- center, vector0, vector90, and limit angles of the sweep are interpolated.
     * @param geometry0 geometry "at fraction 0"
     * @param fraction  fractional positon
     * @param geometry1 geometry "at fraction 1"
     */
    static InterpolateBetween(geometry0, fraction, geometry1) {
        const handler = new ConstructCurveBetweenCurves(geometry0, fraction, geometry1);
        return geometry0.dispatchToGeometryHandler(handler);
    }
}
exports.ConstructCurveBetweenCurves = ConstructCurveBetweenCurves;
//# sourceMappingURL=ConstructCurveBetweenCurves.js.map