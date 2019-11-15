"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Loop_1 = require("../Loop");
const Plane3dByOriginAndUnitNormal_1 = require("../../geometry3d/Plane3dByOriginAndUnitNormal");
const Angle_1 = require("../../geometry3d/Angle");
const CurveLocationDetail_1 = require("../CurveLocationDetail");
const CurvePrimitive_1 = require("../CurvePrimitive");
const ParityRegion_1 = require("../ParityRegion");
const Geometry_1 = require("../../Geometry");
const Point3dVector3d_1 = require("../../geometry3d/Point3dVector3d");
const UnionRegion_1 = require("../UnionRegion");
/**
 * Context for testing containment in Loop, ParityRegion and UnionRegion.
 * @internal
 */
class PointInOnOutContext {
    /**
     * In-out test for a single loop.
     * * Test by finding intersections with an xy line (xyz plane) in "some" direction.
     * * Test logic gets complicated if the plane has a vertex hit.
     * * If that happens, don't try to figure out the cases.   Just move on to another plane.
     * * Any "on" point triggers immediate 0 return.
     *   * (Hence if there are overlapping lines their self-canceling effect might be wrong.)
     * @param loop
     * @param x tested x coordinate
     * @param y tested y coordinate
     */
    static testPointInOnOutLoopXY(loop, x, y) {
        let plane;
        const xy = Point3dVector3d_1.Point3d.create(x, y);
        for (let radians = 0.0; Math.abs(radians) < 6.0; radians = -1.2313 * (radians + 0.3212897)) {
            plane = Plane3dByOriginAndUnitNormal_1.Plane3dByOriginAndUnitNormal.createXYAngle(x, y, Angle_1.Angle.createRadians(radians));
            const normal = plane.getNormalRef();
            const intersections = [];
            for (const cp of loop.children) {
                if (cp instanceof CurvePrimitive_1.CurvePrimitive)
                    cp.appendPlaneIntersectionPoints(plane, intersections);
            }
            CurvePrimitive_1.CurvePrimitive.snapAndRestrictDetails(intersections, false, true);
            let numLeft = 0;
            let numRight = 0;
            let numTricky = 0;
            let wx, wy;
            // Count simple crossings to left and right.
            // Also count tricky crossings (vertex hits, onEdge)
            // If there are any tricky ones, go around with a different plane.
            // A intently devious tester could make every plane hit tricky things.
            for (const intersection of intersections) {
                if (intersection.intervalRole !== CurveLocationDetail_1.CurveIntervalRole.isolated
                    && intersection.intervalRole !== undefined) {
                    numTricky++;
                }
                wx = intersection.point.x - x;
                wy = intersection.point.y - y;
                if (Geometry_1.Geometry.isSameCoordinateXY(wx, wy, 0, 0))
                    return 0;
                const cross = Geometry_1.Geometry.crossProductXYXY(normal.x, normal.y, wx, wy);
                if (xy.isAlmostEqualXY(intersection.point))
                    return 0;
                if (cross < 0.0)
                    numLeft++;
                else if (cross > 0.0)
                    numRight++;
            }
            if (numTricky !== 0) // try another angle !!
                continue;
            const leftParity = numLeft & (0x01);
            const rightParity = numRight & (0x01);
            if (leftParity === rightParity)
                return leftParity === 1 ? 1 : -1;
        }
        return -1;
    }
    /**
     * strongly-typed parity region handling: XOR of all loops. (But any ON is returned as edge hit.)
     * @param parent
     * @param x
     * @param y
     */
    static testPointInOnOutParityRegionXY(parent, x, y) {
        let result = -1;
        for (const loop of parent.children) {
            if (loop instanceof Loop_1.Loop) {
                const q = this.testPointInOnOutLoopXY(loop, x, y);
                if (q === 0)
                    return 0;
                if (q > 0)
                    result = -result;
            }
        }
        return result;
    }
    static testPointInOnOutUnionRegionXY(parent, x, y) {
        for (const loop of parent.children) {
            const classify = this.testPointInOnOutRegionXY(loop, x, y);
            if (classify >= 0)
                return classify;
        }
        return -1;
    }
    static testPointInOnOutRegionXY(parent, x, y) {
        if (parent instanceof Loop_1.Loop)
            return this.testPointInOnOutLoopXY(parent, x, y);
        else if (parent instanceof ParityRegion_1.ParityRegion)
            return this.testPointInOnOutParityRegionXY(parent, x, y);
        else if (parent instanceof UnionRegion_1.UnionRegion)
            return this.testPointInOnOutUnionRegionXY(parent, x, y);
        return -1;
    }
}
exports.PointInOnOutContext = PointInOnOutContext;
//# sourceMappingURL=InOutTests.js.map