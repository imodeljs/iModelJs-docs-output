"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const GeometryHandler_1 = require("../../geometry3d/GeometryHandler");
const Point3dVector3d_1 = require("../../geometry3d/Point3dVector3d");
const LineString3d_1 = require("../LineString3d");
const StrokeOptions_1 = require("../StrokeOptions");
/**
 * Context for computing geometry range around an axis.
 * * The publicly called method is `computeZRRange (ray, geometry)
 */
class CylindricalRangeQuery extends GeometryHandler_1.RecurseToCurvesGeometryHandler {
    /** capture ray and initialize evolving ranges. */
    constructor(ray) {
        super();
        this._localPoint = Point3dVector3d_1.Point3d.create();
        this._worldPoint = Point3dVector3d_1.Point3d.create();
        this._perpVector = Point3dVector3d_1.Vector3d.createZero();
        this._maxDistance = 0.0;
        this._localToWorld = ray.toRigidZFrame();
    }
    announcePoint(xyz) {
        this._localToWorld.multiplyInversePoint3d(xyz, this._localPoint);
        const distance = this._localPoint.magnitudeXY();
        if (distance >= this._maxDistance) {
            this._maxDistance = distance;
            this._perpVector.setFromPoint3d(this._localPoint);
            this._perpVector.z = 0.0;
            this._localToWorld.matrix.multiplyXY(this._localPoint.x, this._localPoint.y, this._perpVector);
        }
    }
    handleLineSegment3d(segment0) {
        this.announcePoint(segment0.startPoint(this._worldPoint));
        this.announcePoint(segment0.endPoint(this._worldPoint));
    }
    handleLineString3d(ls0) {
        for (let i = 0; i < ls0.numPoints(); i++) {
            ls0.pointAt(i, this._worldPoint);
            this.announcePoint(this._worldPoint);
        }
    }
    handleArc3d(arc0) {
        // humbug .. just stroke it ..
        // exact solution is:
        //   project the arc to the z=0 plane of the local system.
        //   find max distance to origin.
        const numStroke = StrokeOptions_1.StrokeOptions.applyAngleTol(undefined, 3, arc0.sweep.sweepRadians, 0.1);
        const df = 1.0 / numStroke;
        for (let i = 0; i <= numStroke; i++) {
            arc0.fractionToPoint(i * df, this._worldPoint);
            this.announcePoint(this._worldPoint);
        }
        return undefined;
    }
    /**
     * Compute the largest vector perpendicular to a ray and ending on the geometry.
     * @param geometry0 geometry to search
     * @returns vector from ray to geometry.
     */
    static computeMaxVectorFromRay(ray, geometry) {
        const accumulator = new CylindricalRangeQuery(ray);
        geometry.dispatchToGeometryHandler(accumulator);
        return accumulator._perpVector.clone();
    }
    /**
     * Recurse through geometry.children to find linestrings.
     * In each linestring, compute the surface normal annotation from
     *  * the curve tangent stored in the linestring
     *  * the axis of rotation
     *  * a default V vector to be used when the linestring point is close to the axis.
     * @param geometry
     * @param axis
     * @param defaultVectorV
     */
    static buildRotationalNormalsInLineStrings(geometry, axis, defaultVectorFromAxis) {
        if (geometry instanceof LineString3d_1.LineString3d) {
            const points = geometry.packedPoints;
            const derivatives = geometry.packedDerivatives;
            const normals = geometry.ensureEmptySurfaceNormals();
            if (derivatives && normals) {
                const vectorU = Point3dVector3d_1.Vector3d.create();
                const vectorV = Point3dVector3d_1.Vector3d.create(); // v direction (forwward along sweep) for surface of rotation.
                const xyz = Point3dVector3d_1.Point3d.create();
                const n = points.length;
                for (let i = 0; i < n; i++) {
                    points.getPoint3dAtUncheckedPointIndex(i, xyz);
                    axis.perpendicularPartOfVectorToTarget(xyz, vectorU);
                    if (vectorU.isAlmostZero)
                        axis.direction.crossProduct(defaultVectorFromAxis, vectorV);
                    else
                        axis.direction.crossProduct(vectorU, vectorV);
                    geometry.packedDerivatives.getVector3dAtCheckedVectorIndex(i, vectorU); // reuse vector U as curve derivative
                    vectorU.crossProduct(vectorV, vectorV); // reuse vector V as normal!
                    vectorV.normalizeInPlace();
                    normals.push(vectorV);
                }
            }
        }
        else if (geometry.children) {
            const children = geometry.children;
            for (const child of children) {
                this.buildRotationalNormalsInLineStrings(child, axis, defaultVectorFromAxis);
            }
        }
    }
}
exports.CylindricalRangeQuery = CylindricalRangeQuery;
//# sourceMappingURL=CylindricalRange.js.map