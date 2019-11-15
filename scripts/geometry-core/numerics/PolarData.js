"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Angle_1 = require("../geometry3d/Angle");
const Geometry_1 = require("../Geometry");
const CoordinateXYZ_1 = require("../curve/CoordinateXYZ");
const LineSegment3d_1 = require("../curve/LineSegment3d");
const Arc3d_1 = require("../curve/Arc3d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** Enumeration of how constraints have been resolved
 * @internal
 */
var ConstraintState;
(function (ConstraintState) {
    ConstraintState[ConstraintState["unknown"] = 0] = "unknown";
    ConstraintState[ConstraintState["singlePoint"] = 1] = "singlePoint";
    ConstraintState[ConstraintState["impossibleValues"] = -1] = "impossibleValues";
    ConstraintState[ConstraintState["onCurve"] = 2] = "onCurve";
})(ConstraintState = exports.ConstraintState || (exports.ConstraintState = {}));
/**
 * PolarData carries (possibly incomplete) data for converting among polar and cartesian coordinates.
 * @internal
 */
class PolarData {
    static get defaultRadius() { return PolarData._defaultRadius; }
    /** Count the number of defined values among x,y,r, theta */
    get numberOfConstrainedScalars() {
        let n = 0;
        if (this.x !== undefined)
            n++;
        if (this.y !== undefined)
            n++;
        if (this.r !== undefined)
            n++;
        if (this.theta !== undefined)
            n++;
        return n;
    }
    /** Create with any combination of known and unknown scalars. */
    static createMixedScalars(state, x, y, r, theta) {
        const result = new PolarData();
        result.x = x;
        result.y = y;
        result.r = r;
        result.theta = theta !== undefined ? theta.clone() : undefined;
        result.state = state;
        return result;
    }
    /** Clone the scalar data, replace the state.
     * * Geometry is NOT cloned.
     */
    cloneScalarsWithState(newState) {
        const result = new PolarData();
        result.x = this.x;
        result.y = this.y;
        result.r = this.r;
        result.theta = this.theta !== undefined ? this.theta.clone() : undefined;
        result.state = newState;
        return result;
    }
    /** Given a possibly incomplete set of x,y,r,theta, determine the possible completions. */
    static solveFromScalars(known) {
        const result = [];
        // .. fill out known combinations (x,y) (x,r) etc.
        // .. any "singlePoints" gets created with no geometry, but geometry fills in at end.
        // .. "free on curve" has curve filled in, with finite curve range controlled by PolarData.defaultRadius.
        if (known.x !== undefined) {
            if (known.y !== undefined) {
                result.push(PolarData.createMixedScalars(ConstraintState.singlePoint, known.x, known.y, Geometry_1.Geometry.hypotenuseXY(known.x, known.y), Angle_1.Angle.createAtan2(known.y, known.x)));
            }
            else if (known.r !== undefined) {
                const rr = known.r * known.r;
                const xx = known.x * known.x;
                const yy = rr - xx;
                if (yy < 0.0) {
                    result.push(known.cloneScalarsWithState(ConstraintState.impossibleValues));
                }
                else {
                    const y = Math.sqrt(yy);
                    result.push(PolarData.createMixedScalars(ConstraintState.singlePoint, known.x, y, known.r, Angle_1.Angle.createAtan2(y, known.x)));
                    result.push(PolarData.createMixedScalars(ConstraintState.singlePoint, known.x, -y, known.r, Angle_1.Angle.createAtan2(-y, known.x)));
                }
            }
            else if (known.theta !== undefined) {
                const r = Geometry_1.Geometry.conditionalDivideFraction(known.x, known.theta.cos());
                // test 4*theta to isolate either positive or negative PI/2 case ...
                if (r === undefined) {
                    // Anywhere on y axis does has x=0, this angle . . .
                    const q = known.cloneScalarsWithState(ConstraintState.onCurve);
                    q.geometry = LineSegment3d_1.LineSegment3d.createXYXY(0, PolarData._defaultRadius, 0, PolarData._defaultRadius);
                }
                else {
                    const y = r * known.theta.sin();
                    result.push(PolarData.createMixedScalars(ConstraintState.singlePoint, known.x, y, r, known.theta));
                }
            }
            else { // only x known --- fill out a vertical line
                const q = known.cloneScalarsWithState(ConstraintState.onCurve);
                q.geometry = LineSegment3d_1.LineSegment3d.createXYZXYZ(known.x, PolarData._defaultRadius, 0, known.x, PolarData._defaultRadius, 0);
            }
        }
        else if (known.y !== undefined) { // and we already know x is undefined .....
            if (known.r !== undefined) {
                const rr = known.r * known.r;
                const yy = known.y * known.y;
                const xx = rr - yy;
                if (xx < 0.0) {
                    result.push(known.cloneScalarsWithState(ConstraintState.impossibleValues));
                }
                else {
                    const x = Math.sqrt(xx);
                    result.push(PolarData.createMixedScalars(ConstraintState.singlePoint, x, known.y, known.r, Angle_1.Angle.createAtan2(known.y, x)));
                    result.push(PolarData.createMixedScalars(ConstraintState.singlePoint, -x, known.y, known.r, Angle_1.Angle.createAtan2(known.y, -x)));
                }
            }
            else if (known.theta !== undefined) {
                const r = Geometry_1.Geometry.conditionalDivideFraction(known.y, known.theta.sin());
                // test 4*theta to isolate either positive or negative PI/2 case ...
                if (r === undefined) {
                    // Anywhere on y axis does has x=0, this angle . . .
                    const q = known.cloneScalarsWithState(ConstraintState.onCurve);
                    q.geometry = LineSegment3d_1.LineSegment3d.createXYZXYZ(0, PolarData._defaultRadius, 0, 0, PolarData._defaultRadius, 0);
                }
                else {
                    const x = r * known.theta.cos();
                    result.push(PolarData.createMixedScalars(ConstraintState.singlePoint, x, known.y, r, known.theta));
                }
            }
            else { // only x known --- fill out a horizontal line
                const q = known.cloneScalarsWithState(ConstraintState.onCurve);
                q.geometry = LineSegment3d_1.LineSegment3d.createXYZXYZ(PolarData._defaultRadius, known.y, 0, PolarData._defaultRadius, known.y, 0);
            }
        }
        else if (known.r !== undefined) {
            if (known.theta !== undefined) {
                result.push(PolarData.createMixedScalars(ConstraintState.singlePoint, known.r * known.theta.cos(), known.r * known.theta.sin(), known.r, known.theta));
            }
            else {
                const q = known.cloneScalarsWithState(ConstraintState.onCurve);
                q.geometry = Arc3d_1.Arc3d.createXY(Point3dVector3d_1.Point3d.create(0, 0, 0), known.r);
                result.push(q);
            }
        }
        else if (known.theta !== undefined) {
            const q = known.cloneScalarsWithState(ConstraintState.onCurve);
            const x = PolarData._defaultRadius * known.theta.cos();
            const y = PolarData._defaultRadius * known.theta.sin();
            q.geometry = LineSegment3d_1.LineSegment3d.createXYXY(-x, -y, x, y);
            result.push(q);
        }
        // ----------------------------------------------------------------------------------------
        // add tangible geometry to single points ...
        for (const r of result) {
            if (r.state === ConstraintState.singlePoint && r.geometry === undefined)
                r.geometry = CoordinateXYZ_1.CoordinateXYZ.createXYZ(r.x, r.y, 0.0);
        }
        return result;
    }
}
exports.PolarData = PolarData;
PolarData._defaultRadius = 1.0;
//# sourceMappingURL=PolarData.js.map