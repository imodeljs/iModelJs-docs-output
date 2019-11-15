"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const GeometryHandler_1 = require("../geometry3d/GeometryHandler");
const LineSegment3d_1 = require("./LineSegment3d");
const Arc3d_1 = require("./Arc3d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const LineString3d_1 = require("./LineString3d");
const Geometry_1 = require("../Geometry");
/**
 * Context for constructing a curve that is interpolated between two other curves.
 * * The only callable method is the static `InterpolateBetween`.
 * * Other methods are called only by `dispatchToGeometryHandler`
 * @public
 */
class ConstructCurveBetweenCurves extends GeometryHandler_1.NullGeometryHandler {
    constructor(_geometry0, _fraction, _geometry1) {
        super();
        // this.geometry0 = _geometry0;   <-- Never used
        this._geometry1 = _geometry1;
        this._fraction = _fraction;
    }
    /**
     * * To be directly called only by double dispatcher
     * * Assumes this.geometry1 was set by calling context.
     * * Construct the interpolated curve between this.geometry1 and the supplied segment0.
     */
    handleLineSegment3d(segment0) {
        if (this._geometry1 instanceof LineSegment3d_1.LineSegment3d) {
            const segment1 = this._geometry1;
            return LineSegment3d_1.LineSegment3d.create(segment0.startPoint().interpolate(this._fraction, segment1.startPoint()), segment0.endPoint().interpolate(this._fraction, segment1.endPoint()));
        }
        return undefined;
    }
    /**
     * * To be directly called only by double dispatcher
     * * Assumes this.geometry1 was set by calling context.
     * * Construct the interpolated curve between this.geometry1 and the supplied ls0.
     */
    handleLineString3d(ls0) {
        if (this._geometry1 instanceof LineString3d_1.LineString3d) {
            const ls1 = this._geometry1;
            if (ls0.numPoints() === ls1.numPoints()) {
                const numPoints = ls0.numPoints();
                const ls = LineString3d_1.LineString3d.create();
                const workPoint = Point3dVector3d_1.Point3d.create();
                const workPoint0 = Point3dVector3d_1.Point3d.create();
                const workPoint1 = Point3dVector3d_1.Point3d.create();
                let workVector0;
                let workVector1;
                const fraction = this._fraction;
                for (let i = 0; i < numPoints; i++) {
                    ls0.pointAt(i, workPoint0);
                    ls1.pointAt(i, workPoint1);
                    workPoint0.interpolate(fraction, workPoint1, workPoint);
                    ls.addPoint(workPoint);
                }
                if (ls0.fractions && ls1.fractions) {
                    for (let i = 0; i < numPoints; i++) {
                        ls.addFraction(Geometry_1.Geometry.interpolate(ls0.fractions.atUncheckedIndex(i), fraction, ls1.fractions.atUncheckedIndex(i)));
                    }
                }
                if (ls0.strokeData && ls1.strokeData) {
                    // Policy: simple clone of stroke count map from ls0.
                    // The curveLength will not match.
                    // But we expect to be called at a time compatible count and a0,a1 are the important thing.
                    ls.strokeData = ls0.strokeData.clone();
                }
                if (ls0.packedDerivatives && ls1.packedDerivatives) {
                    if (!workVector0)
                        workVector0 = Point3dVector3d_1.Vector3d.create();
                    if (!workVector1)
                        workVector1 = Point3dVector3d_1.Vector3d.create();
                    for (let i = 0; i < numPoints; i++) {
                        ls0.packedDerivatives.getVector3dAtCheckedVectorIndex(i, workVector0);
                        ls1.packedDerivatives.getVector3dAtCheckedVectorIndex(i, workVector1);
                        ls.addDerivative(workVector0.interpolate(fraction, workVector1));
                    }
                }
                return ls;
            }
        }
        return undefined;
    }
    /**
     * * To be directly called only by double dispatcher
     * * Assumes this.geometry1 was set by calling context.
     * * Construct the interpolated curve between this.geometry1 and the supplied arc0.
     */
    handleArc3d(arc0) {
        if (this._geometry1 instanceof Arc3d_1.Arc3d) {
            const arc1 = this._geometry1;
            return Arc3d_1.Arc3d.create(arc0.center.interpolate(this._fraction, arc1.center), arc0.vector0.interpolate(this._fraction, arc1.vector0), arc0.vector90.interpolate(this._fraction, arc1.vector90), arc0.sweep.interpolate(this._fraction, arc1.sweep));
        }
        return undefined;
    }
    /**
     * Construct a geometry item which is fractionally interpolated between two others.
     * * The construction is only supported between certain types:
     * * * LineSegment3d+LineSegment3d -- endpoints are interpolated
     * * * LineString3d+LineString3d with matching counts.  Each point is interpolated.
     * * * Arc3d+Arc3d -- center, vector0, vector90, and limit angles of the sweep are interpolated.
     * @param geometry0 geometry "at fraction 0"
     * @param fraction  fractional position
     * @param geometry1 geometry "at fraction 1"
     */
    static interpolateBetween(geometry0, fraction, geometry1) {
        const handler = new ConstructCurveBetweenCurves(geometry0, fraction, geometry1);
        return geometry0.dispatchToGeometryHandler(handler);
    }
}
exports.ConstructCurveBetweenCurves = ConstructCurveBetweenCurves;
//# sourceMappingURL=ConstructCurveBetweenCurves.js.map