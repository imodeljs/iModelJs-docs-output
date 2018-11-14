"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Polyface */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty*/
// import { Point3d, Vector3d, Point2d } from "./PointVector";
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Polyface_1 = require("./Polyface");
const Matrix4d_1 = require("../geometry4d/Matrix4d");
const CurveCollection_1 = require("../curve/CurveCollection");
const Loop_1 = require("../curve/Loop");
const LineString3d_1 = require("../curve/LineString3d");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
const MomentData_1 = require("../geometry4d/MomentData");
/** PolyfaceQuery is a static class whose methods implement queries on a polyface or polyface visitor provided as a parameter to each mtehod. */
class PolyfaceQuery {
    /** copy the points from a visitor into a Linestring3d in a Loop object */
    static VisitorToLoop(visitor) {
        const ls = LineString3d_1.LineString3d.createPoints(visitor.point.getPoint3dArray());
        return Loop_1.Loop.create(ls);
    }
    /** Create a linestring loop for each facet of the polyface. */
    static IndexedPolyfaceToLoops(polyface) {
        const result = CurveCollection_1.BagOfCurves.create();
        const visitor = polyface.createVisitor(1);
        while (visitor.moveToNextFacet()) {
            const loop = PolyfaceQuery.VisitorToLoop(visitor);
            result.tryAddChild(loop);
        }
        return result;
    }
    /** @returns Return the sum of all facets areas. */
    static sumFacetAreas(source) {
        let s = 0;
        if (source instanceof Polyface_1.Polyface)
            return PolyfaceQuery.sumFacetAreas(source.createVisitor(1));
        const visitor = source;
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            s += PointHelpers_1.PolygonOps.sumTriangleAreas(visitor.point.getPoint3dArray());
        }
        return s;
    }
    /** sum volumes of tetrahedra from origin to all facets.
     * * if origin is omitted, the first point encountered (by the visitor) is used as origin.
     * * If the mesh is closed, this sum is the volume.
     * * If the mesh is not closed, this sum is the volume of a mesh with various additional facets
     * from the origin to facets.
    */
    static sumTetrahedralVolumes(source, origin) {
        let s = 0;
        if (source instanceof Polyface_1.Polyface)
            return PolyfaceQuery.sumTetrahedralVolumes(source.createVisitor(0), origin);
        let myOrigin = origin;
        const visitor = source;
        const facetOrigin = Point3dVector3d_1.Point3d.create();
        const targetA = Point3dVector3d_1.Point3d.create();
        const targetB = Point3dVector3d_1.Point3d.create();
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            if (myOrigin === undefined)
                myOrigin = visitor.point.getPoint3dAt(0);
            visitor.point.getPoint3dAt(0, facetOrigin);
            for (let i = 1; i + 1 < visitor.point.length; i++) {
                visitor.point.getPoint3dAt(i, targetA);
                visitor.point.getPoint3dAt(i + 1, targetB);
                s += myOrigin.tripleProductToPoints(facetOrigin, targetA, targetB);
            }
        }
        return s / 6.0;
    }
    /** Return the inertia products [xx,xy,xz,xw, yw, etc] integrated over all facets. */
    static SumFacetSecondAreaMomentProducts(source, origin) {
        if (source instanceof Polyface_1.Polyface)
            return PolyfaceQuery.SumFacetSecondAreaMomentProducts(source.createVisitor(0), origin);
        const products = Matrix4d_1.Matrix4d.createZero();
        const visitor = source;
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            PointHelpers_1.PolygonOps.addSecondMomentAreaProducts(visitor.point, origin, products);
        }
        return products;
    }
    /** Compute area moments for the mesh. In the returned MomentData:
     * * origin is the centroid.
     * * localToWorldMap has the origin and principal directions
     * * radiiOfGyration radii for rotation aroud the x,y,z axes.
     */
    static computePrincipalAreaMoments(source) {
        const origin = source.data.getPoint(0);
        if (!origin)
            return undefined;
        const inertiaProducts = PolyfaceQuery.SumFacetSecondAreaMomentProducts(source, origin);
        return MomentData_1.MomentData.inertiaProductsToPrincipalAxes(origin, inertiaProducts);
    }
}
exports.PolyfaceQuery = PolyfaceQuery;
//# sourceMappingURL=PolyfaceQuery.js.map