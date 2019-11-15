"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Arc3d_1 = require("./Arc3d");
const LineString3d_1 = require("./LineString3d");
const LineSegment3d_1 = require("./LineSegment3d");
const Point3dArrayCarrier_1 = require("../geometry3d/Point3dArrayCarrier");
const Path_1 = require("./Path");
const Geometry_1 = require("../Geometry");
/**
 * The `CurveFactory` class contains methods for specialized curve constructions.
 * @public
 */
class CurveFactory {
    /** (cautiously) construct and save a line segment between fractional positions. */
    static addPartialSegment(path, allowBackup, pointA, pointB, fraction0, fraction1) {
        if (allowBackup || (fraction1 > fraction0)) {
            if (pointA !== undefined && pointB !== undefined && !Geometry_1.Geometry.isAlmostEqualNumber(fraction0, fraction1))
                path.tryAddChild(LineSegment3d_1.LineSegment3d.create(pointA.interpolate(fraction0, pointB), pointA.interpolate(fraction1, pointB)));
        }
    }
    /**
     * Construct a sequence of alternating lines and arcs with the arcs creating tangent transition between consecutive edges.
     * @param points point source
     * @param radius fillet radius
     * @param allowBackupAlongEdge true to allow edges to be created going "backwards" along edges if needed to create the blend.
     */
    static createFilletsInLineString(points, radius, allowBackupAlongEdge = true) {
        if (Array.isArray(points))
            return this.createFilletsInLineString(new Point3dArrayCarrier_1.Point3dArrayCarrier(points), radius, allowBackupAlongEdge);
        if (points instanceof LineString3d_1.LineString3d)
            return this.createFilletsInLineString(points.packedPoints, radius, allowBackupAlongEdge);
        const n = points.length;
        if (n <= 1)
            return undefined;
        const pointA = points.getPoint3dAtCheckedPointIndex(0);
        const pointB = points.getPoint3dAtCheckedPointIndex(1);
        // remark: n=2 and n=3 cases should fall out from loop logic
        const blendArray = [];
        // build one-sided blends at each end . .
        blendArray.push({ fraction10: 0.0, fraction12: 0.0, point: pointA.clone() });
        for (let i = 1; i + 1 < n; i++) {
            const pointC = points.getPoint3dAtCheckedPointIndex(i + 1);
            blendArray.push(Arc3d_1.Arc3d.createFilletArc(pointA, pointB, pointC, radius));
            pointA.setFromPoint3d(pointB);
            pointB.setFromPoint3d(pointC);
        }
        blendArray.push({ fraction10: 0.0, fraction12: 0.0, point: pointB.clone() });
        if (!allowBackupAlongEdge) {
            // suppress arcs that have overlap with both neighbors or flood either neighbor ..
            for (let i = 1; i + 1 < n; i++) {
                const b = blendArray[i];
                if (b.fraction10 > 1.0
                    || b.fraction12 > 1.0
                    || 1.0 - b.fraction10 < blendArray[i - 1].fraction12
                    || b.fraction12 > 1.0 - blendArray[i + 1].fraction10) {
                    b.fraction10 = 0.0;
                    b.fraction12 = 0.0;
                    blendArray[i].arc = undefined;
                }
            }
            // on edge with conflict, suppress the arc with larger fraction
            for (let i = 1; i < n; i++) {
                const b0 = blendArray[i - 1];
                const b1 = blendArray[i];
                if (b0.fraction12 > 1 - b1.fraction10) {
                    const b = b0.fraction12 > b1.fraction12 ? b1 : b0;
                    b.fraction10 = 0.0;
                    b.fraction12 = 0.0;
                    blendArray[i].arc = undefined;
                }
            }
        }
        const path = Path_1.Path.create();
        this.addPartialSegment(path, allowBackupAlongEdge, blendArray[0].point, blendArray[1].point, blendArray[0].fraction12, 1.0 - blendArray[1].fraction10);
        // add each path and successor edge ...
        for (let i = 1; i + 1 < points.length; i++) {
            const b0 = blendArray[i];
            const b1 = blendArray[i + 1];
            path.tryAddChild(b0.arc);
            this.addPartialSegment(path, allowBackupAlongEdge, b0.point, b1.point, b0.fraction12, 1.0 - b1.fraction10);
        }
        return path;
    }
    /**
     * If `arcB` is a continuation of `arcA`, extend `arcA` (in place) to include the range of `arcB`
     * * This only succeeds if the two arcs are part of identical complete arcs and end of `arcA` matches the beginning of `arcB`.
     * * "Reversed"
     * @param arcA
     * @param arcB
     */
    static appendToArcInPlace(arcA, arcB, allowReverse = false) {
        if (arcA.center.isAlmostEqual(arcB.center)) {
            const sweepSign = Geometry_1.Geometry.split3WaySign(arcA.sweep.sweepRadians * arcB.sweep.sweepRadians, -1, 0, 1);
            // evaluate derivatives wrt radians (not fraction!), but adjust direction for sweep signs
            const endA = arcA.angleToPointAndDerivative(arcA.sweep.fractionToAngle(1.0));
            if (arcA.sweep.sweepRadians < 0)
                endA.direction.scaleInPlace(-1.0);
            const startB = arcB.angleToPointAndDerivative(arcB.sweep.fractionToAngle(0.0));
            if (arcB.sweep.sweepRadians < 0)
                startB.direction.scaleInPlace(-1.0);
            if (endA.isAlmostEqual(startB)) {
                arcA.sweep.setStartEndRadians(arcA.sweep.startRadians, arcA.sweep.startRadians + arcA.sweep.sweepRadians + sweepSign * arcB.sweep.sweepRadians);
                return true;
            }
            // Also ok if negated tangent . ..
            if (allowReverse) {
                startB.direction.scaleInPlace(-1.0);
                if (endA.isAlmostEqual(startB)) {
                    arcA.sweep.setStartEndRadians(arcA.sweep.startRadians, arcA.sweep.startRadians + arcA.sweep.sweepRadians - sweepSign * arcB.sweep.sweepRadians);
                    return true;
                }
            }
        }
        return false;
    }
}
exports.CurveFactory = CurveFactory;
//# sourceMappingURL=CurveFactory.js.map