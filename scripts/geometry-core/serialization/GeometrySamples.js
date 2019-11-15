"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Serialization */
const Geometry_1 = require("../Geometry");
const AngleSweep_1 = require("../geometry3d/AngleSweep");
const Angle_1 = require("../geometry3d/Angle");
const Plane3dByOriginAndUnitNormal_1 = require("../geometry3d/Plane3dByOriginAndUnitNormal");
const Ray3d_1 = require("../geometry3d/Ray3d");
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Segment1d_1 = require("../geometry3d/Segment1d");
const Transform_1 = require("../geometry3d/Transform");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const Range_1 = require("../geometry3d/Range");
const Map4d_1 = require("../geometry4d/Map4d");
const Matrix4d_1 = require("../geometry4d/Matrix4d");
const Point4d_1 = require("../geometry4d/Point4d");
const UnionRegion_1 = require("../curve/UnionRegion");
const CurveCollection_1 = require("../curve/CurveCollection");
const ParityRegion_1 = require("../curve/ParityRegion");
const Loop_1 = require("../curve/Loop");
const Path_1 = require("../curve/Path");
const Polyface_1 = require("../polyface/Polyface");
const BSplineCurve_1 = require("../bspline/BSplineCurve");
const BSplineSurface_1 = require("../bspline/BSplineSurface");
const Sphere_1 = require("../solid/Sphere");
const Cone_1 = require("../solid/Cone");
const Box_1 = require("../solid/Box");
const TorusPipe_1 = require("../solid/TorusPipe");
const LinearSweep_1 = require("../solid/LinearSweep");
const RotationalSweep_1 = require("../solid/RotationalSweep");
const RuledSweep_1 = require("../solid/RuledSweep");
const LineSegment3d_1 = require("../curve/LineSegment3d");
const Arc3d_1 = require("../curve/Arc3d");
const TransitionSpiral_1 = require("../curve/TransitionSpiral");
const LineString3d_1 = require("../curve/LineString3d");
const PointString3d_1 = require("../curve/PointString3d");
const ClipPlane_1 = require("../clipping/ClipPlane");
const ConvexClipPlaneSet_1 = require("../clipping/ConvexClipPlaneSet");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const UnionOfConvexClipPlaneSets_1 = require("../clipping/UnionOfConvexClipPlaneSets");
const BSplineCurve3dH_1 = require("../bspline/BSplineCurve3dH");
const BezierCurve3d_1 = require("../bspline/BezierCurve3d");
const BezierCurve3dH_1 = require("../bspline/BezierCurve3dH");
const CurveChainWithDistanceIndex_1 = require("../curve/CurveChainWithDistanceIndex");
const KnotVector_1 = require("../bspline/KnotVector");
const CoordinateXYZ_1 = require("../curve/CoordinateXYZ");
/* tslint:disable:no-console */
/**
 * `Sample` has static methods to create a variety of geometry samples useful in testing.
 * @alpha
 */
class Sample {
    /** Return an array of Point3d, with x,y,z all stepping through a range of values.
     * x varies fastest, then y then z
     */
    static createPoint3dLattice(low, step, high) {
        const points = [];
        for (let z = low; z <= high; z += step)
            for (let y = low; y <= high; y += step)
                for (let x = low; x <= high; x += step)
                    points.push(Point3dVector3d_1.Point3d.create(x, y, z));
        return points;
    }
    /** Return an array of Point2d, with x,y all stepping through a range of values.
     * x varies fastest, then y
     */
    static createPoint2dLattice(low, step, high) {
        const points = [];
        for (let y = low; y <= high; y += step)
            for (let x = low; x <= high; x += step)
                points.push(Point2dVector2d_1.Point2d.create(x, y));
        return points;
    }
    /** Array with assorted nonzero vector samples. */
    static createNonZeroVectors() {
        return [
            Point3dVector3d_1.Vector3d.create(1, 0, 0),
            Point3dVector3d_1.Vector3d.create(0, 1, 0),
            Point3dVector3d_1.Vector3d.create(0, 0, 1),
            Point3dVector3d_1.Vector3d.create(-1, 0, 0),
            Point3dVector3d_1.Vector3d.create(0, -1, 0),
            Point3dVector3d_1.Vector3d.create(0, 0, -1),
            Point3dVector3d_1.Vector3d.createPolar(1.0, Angle_1.Angle.createDegrees(20)),
            Point3dVector3d_1.Vector3d.createSpherical(1.0, Angle_1.Angle.createDegrees(20), Angle_1.Angle.createDegrees(10)),
            Point3dVector3d_1.Vector3d.createPolar(2.0, Angle_1.Angle.createDegrees(20)),
            Point3dVector3d_1.Vector3d.createSpherical(2.0, Angle_1.Angle.createDegrees(20), Angle_1.Angle.createDegrees(10)),
            Point3dVector3d_1.Vector3d.create(2, 3, 0)
        ];
    }
    /** Return an array with assorted Range3d samples */
    static createRange3ds() {
        return [
            Range_1.Range3d.createXYZXYZ(0, 0, 0, 1, 1, 1),
            Range_1.Range3d.createXYZ(1, 2, 3),
            Range_1.Range3d.createXYZXYZ(-2, -3, 1, 200, 301, 8)
        ];
    }
    /** Create 5 points of a (axis aligned) rectangle with corners (x0,y0) and (x1,y1) */
    static createRectangleXY(x0, y0, ax, ay, z = 0) {
        return [
            Point3dVector3d_1.Point3d.create(x0, y0, z),
            Point3dVector3d_1.Point3d.create(x0 + ax, y0, z),
            Point3dVector3d_1.Point3d.create(x0 + ax, y0 + ay, z),
            Point3dVector3d_1.Point3d.create(x0, y0 + ay, z),
            Point3dVector3d_1.Point3d.create(x0, y0, z),
        ];
    }
    /** Access the last point in the array. push another shifted by dx,dy,dz.
     * * No push if all are 0.
     * * If array is empty, push a leading 000
     */
    static pushMove(data, dx, dy, dz = 0.0) {
        if (data.length === 0)
            data.push(Point3dVector3d_1.Point3d.create(0, 0, 0));
        const back = data[data.length - 1];
        if (dx !== 0 || dy !== 0 || dz !== 0)
            data.push(Point3dVector3d_1.Point3d.create(back.x + dx, back.y + dy, back.z + dz));
    }
    /** push a clone of the data[0] */
    static pushClosure(data) {
        if (data.length > 0)
            data.push(data[data.length - 1].clone());
    }
    /** Return an array with numPoints on the unit circle (counting closure) */
    static createUnitCircle(numPoints) {
        const points = [];
        const dTheta = Geometry_1.Geometry.safeDivideFraction(Math.PI * 2, numPoints - 1, 0.0);
        for (let i = 0; i < numPoints; i++) {
            const theta = i * dTheta;
            points.push(Point3dVector3d_1.Point3d.create(Math.cos(theta), Math.sin(theta), 0.0));
        }
        return points;
    }
    /** Create points for an L shaped polygon
     * * lower left at x0,y0.
     * * ax,ay are larger side lengths (lower left to corners along x and y directions)
     * * bx,by are smaller side lengths (inner corner to points along x and y directions)
     */
    static createLShapedPolygon(x0, y0, ax, ay, bx, by, z = 0) {
        return [
            Point3dVector3d_1.Point3d.create(x0, y0, z),
            Point3dVector3d_1.Point3d.create(x0 + ax, y0, z),
            Point3dVector3d_1.Point3d.create(x0 + ax, y0 + by),
            Point3dVector3d_1.Point3d.create(x0 + bx, y0 + by),
            Point3dVector3d_1.Point3d.create(x0 + bx, y0 + ay, z),
            Point3dVector3d_1.Point3d.create(x0, y0 + ay, z),
            Point3dVector3d_1.Point3d.create(x0, y0, z),
        ];
    }
    /** Create assorted clip planes. */
    static createClipPlanes() {
        const plane0 = ClipPlane_1.ClipPlane.createNormalAndDistance(Point3dVector3d_1.Vector3d.create(1, 0, 0), 2.0);
        const plane1 = plane0.cloneNegated();
        const plane2 = plane1.clone();
        plane2.setFlags(true, true);
        return [
            plane0, plane1, plane2,
            ClipPlane_1.ClipPlane.createNormalAndDistance(Point3dVector3d_1.Vector3d.create(3, 4, 0), 2.0),
            ClipPlane_1.ClipPlane.createEdgeXY(Point3dVector3d_1.Point3d.create(1, 0, 0), Point3dVector3d_1.Point3d.create(24, 32, 0))
        ];
    }
    /**
     * * A first-quadrant unit square
     * * Two squares -- first and fourth quadrant unit squares
     * * Three squares -- first, second and fourth quadrant unit squares
     */
    static createClipPlaneSets() {
        const result = [];
        const quadrant1 = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createXYBox(0, 0, 1, 1);
        result.push(UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets.createConvexSets([quadrant1.clone()]));
        const quadrant2 = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createXYBox(-1, 0, 0, 1);
        const quadrant4 = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createXYBox(0, -1, 1, 0);
        result.push(UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets.createConvexSets([
            quadrant1.clone(),
            quadrant4.clone()
        ]));
        result.push(UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets.createConvexSets([
            quadrant1.clone(),
            quadrant2.clone(),
            quadrant4.clone()
        ]));
        return result;
    }
    /** Create (unweighted) bspline curves.
     * order varies from 2 to 5
     */
    static createBsplineCurves(includeMultipleKnots = false) {
        const result = [];
        const yScale = 0.1;
        for (const order of [2, 3, 4, 5]) {
            const points = [];
            for (const x of [0, 1, 2, 3, 4, 5, 7]) {
                points.push(Point3dVector3d_1.Point3d.create(x, yScale * (1 + x * x), 0.0));
            }
            const curve = BSplineCurve_1.BSplineCurve3d.createUniformKnots(points, order);
            result.push(curve);
        }
        if (includeMultipleKnots) {
            const interiorKnotCandidates = [1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 8];
            for (const order of [3, 4]) {
                const numPoints = 8;
                const points = [];
                for (let i = 0; i < numPoints; i++)
                    points.push(Point3dVector3d_1.Point3d.create(i, i * i, 0));
                const knots = [];
                for (let i = 0; i < order - 1; i++)
                    knots.push(0);
                const numInteriorNeeded = numPoints - order;
                for (let i = 0; i < numInteriorNeeded; i++)
                    knots.push(interiorKnotCandidates[i]);
                const lastKnot = knots[knots.length - 1] + 1;
                for (let i = 0; i < order - 1; i++)
                    knots.push(lastKnot);
                const curve = BSplineCurve_1.BSplineCurve3d.create(points, knots, order);
                if (curve)
                    result.push(curve);
            }
        }
        return result;
    }
    /** Create weighted bspline curves.
     * order varies from 2 to 5
     */
    static createBspline3dHCurves() {
        const result = [];
        const yScale = 0.1;
        for (const weightVariation of [0, 0.125]) {
            for (const order of [2, 3, 4, 5]) {
                const points = [];
                for (const x of [0, 1, 2, 3, 4, 5, 7]) {
                    points.push(Point4d_1.Point4d.create(x, yScale * (1 + x * x), 0.0, 1.0 + weightVariation * Math.sin(x * Math.PI * 0.25)));
                }
                const curve = BSplineCurve3dH_1.BSplineCurve3dH.createUniformKnots(points, order);
                result.push(curve);
            }
        }
        return result;
    }
    /** Create weighted bsplines for circular arcs.
     */
    static createBspline3dHArcs() {
        const result = [];
        const halfRadians = Angle_1.Angle.degreesToRadians(60.0);
        const c = Math.cos(halfRadians);
        const s = Math.sin(halfRadians);
        // const sec = 1.0 / c;
        // const t = s / c;
        const points = [
            Point4d_1.Point4d.create(1, 0, 0, 1),
            Point4d_1.Point4d.create(c, s, 0, c),
            Point4d_1.Point4d.create(-c, s, 0, 1),
            Point4d_1.Point4d.create(-1, 0, 0, c),
            Point4d_1.Point4d.create(-c, -s, 0, 1),
            Point4d_1.Point4d.create(c, -s, 0, c),
            Point4d_1.Point4d.create(1, 0, 0, 1)
        ];
        const knots = [0, 0, 1, 1, 2, 2, 3, 3];
        const curve = BSplineCurve3dH_1.BSplineCurve3dH.create(points, knots, 3);
        result.push(curve);
        return result;
    }
    /** Return array   [x,y,z,w] bspline control points for an arc in 90 degree bspline spans.
     * @param points array of [x,y,z,w]
     * @param center center of arc
     * @param axes matrix with 0 and 90 degree axes
     * @param radius0 radius multiplier for x direction.
     * @param radius90 radius multiplier for y direction.
     * @param applyWeightsToXYZ
     */
    static createBsplineArc90SectionToXYZWArrays(center, axes, radius0, radius90, applyWeightsToXYZ) {
        const a = Math.sqrt(0.5);
        const xyz = Point3dVector3d_1.Point3d.create();
        Matrix3d_1.Matrix3d.xyzPlusMatrixTimesCoordinates(center, axes, radius0, 0.0, 0, xyz);
        const controlPoints = [];
        controlPoints.push([xyz.x, xyz.y, xyz.z, 1.0]);
        const cornerTrig = [1, 1, -1, -1, 1];
        const axisTrig = [1, 0, -1, 0, 1];
        for (let i = 0; i < 4; i++) {
            Matrix3d_1.Matrix3d.xyzPlusMatrixTimesCoordinates(center, axes, radius0 * cornerTrig[i + 1], radius90 * cornerTrig[i], 0, xyz);
            controlPoints.push([xyz.x, xyz.y, xyz.z, a]);
            Matrix3d_1.Matrix3d.xyzPlusMatrixTimesCoordinates(center, axes, radius0 * axisTrig[i + 1], radius90 * axisTrig[i], 0, xyz);
            controlPoints.push([xyz.x, xyz.y, xyz.z, 1.0]);
        }
        if (applyWeightsToXYZ) {
            for (const xyzw of controlPoints) {
                const b = xyzw[3];
                xyzw[0] *= b;
                xyzw[1] *= b;
                xyzw[2] *= b;
            }
        }
        return controlPoints;
    }
    /**
     * Create both unweighted and weighted bspline curves.
     * (This is the combined results from createBsplineCurves and createBspline3dHCurves)
     */
    static createMixedBsplineCurves() {
        const arrayA = Sample.createBsplineCurves();
        const arrayB = Sample.createBspline3dHCurves();
        const result = [];
        for (const a of arrayA)
            result.push(a);
        for (const b of arrayB)
            result.push(b);
        return result;
    }
    /** create a plane from origin and normal coordinates -- default to 001 normal if needed. */
    static createPlane(x, y, z, u, v, w) {
        const point = Point3dVector3d_1.Point3d.create(x, y, z);
        const vector = Point3dVector3d_1.Vector3d.create(u, v, w).normalize();
        if (vector) {
            const plane = Plane3dByOriginAndUnitNormal_1.Plane3dByOriginAndUnitNormal.create(point, vector);
            if (plane)
                return plane;
        }
        return Sample.createPlane(x, y, z, u, v, 1);
    }
    /** Create ray from (x,y,z) and direction components.   (Normalize the direction) */
    static createRay(x, y, z, u, v, w) {
        return Ray3d_1.Ray3d.create(Point3dVector3d_1.Point3d.create(x, y, z), Point3dVector3d_1.Vector3d.create(u, v, w).normalize());
    }
    /** Assorted lines strings */
    static createLineStrings() {
        return [
            LineString3d_1.LineString3d.createPoints([
                Point3dVector3d_1.Point3d.create(0, 0, 0),
                Point3dVector3d_1.Point3d.create(1, 0, 0)
            ]),
            LineString3d_1.LineString3d.createPoints([
                Point3dVector3d_1.Point3d.create(0, 0, 0),
                Point3dVector3d_1.Point3d.create(1, 0, 0),
                Point3dVector3d_1.Point3d.create(1, 1, 0)
            ]),
            LineString3d_1.LineString3d.createPoints([
                Point3dVector3d_1.Point3d.create(0, 0, 0),
                Point3dVector3d_1.Point3d.create(1, 0, 0),
                Point3dVector3d_1.Point3d.create(1, 1, 0),
                Point3dVector3d_1.Point3d.create(2, 2, 0)
            ])
        ];
    }
    /** Assorted Matrix3d:
     * * identity
     * * rotation around x
     * * rotation around general vector
     * * uniform scale
     * * nonuniform scale (including negative scales!)
     */
    static createMatrix3dArray() {
        return [
            Matrix3d_1.Matrix3d.createIdentity(),
            Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(1, 0, 0), Angle_1.Angle.createDegrees(10)),
            Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(1, -2, 5), Angle_1.Angle.createDegrees(-6.0)),
            Matrix3d_1.Matrix3d.createUniformScale(2.0),
            Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(1, 2, 3), Angle_1.Angle.createDegrees(49.0)),
            Matrix3d_1.Matrix3d.createScale(1, 1, -1),
            Matrix3d_1.Matrix3d.createScale(2, 3, 4)
        ];
    }
    /** Assorted invertible transforms. */
    static createInvertibleTransforms() {
        return [
            Transform_1.Transform.createIdentity(),
            Transform_1.Transform.createTranslationXYZ(1, 2, 0),
            Transform_1.Transform.createTranslationXYZ(1, 2, 3),
            Transform_1.Transform.createFixedPointAndMatrix(Point3dVector3d_1.Point3d.create(4, 1, -2), Matrix3d_1.Matrix3d.createUniformScale(2.0)),
            Transform_1.Transform.createFixedPointAndMatrix(Point3dVector3d_1.Point3d.create(4, 1, -2), Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(1, 2, 3), Angle_1.Angle.createRadians(10)))
        ];
    }
    /** Return an array of Matrix3d with various skew and scale.  This includes at least:
     * * identity
     * * 3 distinct diagonals.
     * * The distinct diagonal base with smaller value added to
     *    other 6 spots in succession.
     * * the distinct diagonals with all others also smaller non-zeros.
     */
    static createScaleSkewMatrix3d() {
        return [
            Matrix3d_1.Matrix3d.createRowValues(1, 0, 0, 0, 1, 0, 0, 0, 1),
            Matrix3d_1.Matrix3d.createRowValues(5, 0, 0, 0, 6, 0, 0, 0, 7),
            Matrix3d_1.Matrix3d.createRowValues(5, 2, 0, 0, 6, 0, 0, 0, 7),
            Matrix3d_1.Matrix3d.createRowValues(5, 0, 2, 0, 6, 0, 0, 0, 7),
            Matrix3d_1.Matrix3d.createRowValues(5, 0, 0, 1, 6, 0, 0, 0, 7),
            Matrix3d_1.Matrix3d.createRowValues(5, 0, 0, 0, 6, 1, 0, 0, 7),
            Matrix3d_1.Matrix3d.createRowValues(5, 0, 0, 0, 6, 0, 1, 0, 7),
            Matrix3d_1.Matrix3d.createRowValues(5, 0, 0, 0, 6, 0, 0, 1, 7),
            Matrix3d_1.Matrix3d.createRowValues(5, 2, 3, 2, 6, 1, -1, 2, 7)
        ];
    }
    /** Return an array of singular Matrix3d.  This includes at least:
     * * all zeros
     * * one nonzero column
     * * two independent columns, third is zero
     * * two independent columns, third is sum of those
     * * two independent columns, third is copy of one
     */
    static createSingularMatrix3d() {
        const vectorU = Point3dVector3d_1.Vector3d.create(2, 3, 6);
        const vectorV = Point3dVector3d_1.Vector3d.create(-1, 5, 2);
        const vectorUPlusV = vectorU.plus(vectorV);
        const vector0 = Point3dVector3d_1.Vector3d.createZero();
        return [
            Matrix3d_1.Matrix3d.createZero(),
            // one nonzero column
            Matrix3d_1.Matrix3d.createColumns(vectorU, vector0, vector0),
            Matrix3d_1.Matrix3d.createColumns(vector0, vectorU, vector0),
            Matrix3d_1.Matrix3d.createColumns(vector0, vector0, vector0),
            // two independent nonzero columns with zero
            Matrix3d_1.Matrix3d.createColumns(vectorU, vectorV, vector0),
            Matrix3d_1.Matrix3d.createColumns(vector0, vectorU, vectorV),
            Matrix3d_1.Matrix3d.createColumns(vectorV, vector0, vector0),
            // third column dependent
            Matrix3d_1.Matrix3d.createColumns(vectorU, vectorV, vectorUPlusV),
            Matrix3d_1.Matrix3d.createColumns(vectorU, vectorUPlusV, vectorV),
            Matrix3d_1.Matrix3d.createColumns(vectorUPlusV, vectorV, vectorU),
            // two independent with duplicate
            Matrix3d_1.Matrix3d.createColumns(vectorU, vectorV, vectorU),
            Matrix3d_1.Matrix3d.createColumns(vectorU, vectorU, vectorV),
            Matrix3d_1.Matrix3d.createColumns(vectorV, vectorV, vectorU)
        ];
    }
    /**
     * * Return an array of rigid transforms.  This includes (at least)
     *   * Identity
     *   * translation with identity matrix
     *   * rotation around origin and arbitrary vector
     *   * rotation around space point and arbitrary vector
     * * use given refDistance is crude distance of translation and distance to fixed point.
     */
    static createRigidTransforms(distanceScale = 4.0) {
        const distanceScale3 = distanceScale / 3.0;
        const distanceScale4 = distanceScale / 4.0;
        return [
            Transform_1.Transform.createIdentity(),
            Transform_1.Transform.createTranslationXYZ(distanceScale3 * 1, distanceScale3 * 2, distanceScale3 * 3),
            Transform_1.Transform.createFixedPointAndMatrix(Point3dVector3d_1.Point3d.create(0, 0, 0), Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.unitY(), Angle_1.Angle.createDegrees(10))),
            Transform_1.Transform.createFixedPointAndMatrix(Point3dVector3d_1.Point3d.create(distanceScale4 * 4, distanceScale4 * 1, -distanceScale4 * 2), Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(1, 2, 3), Angle_1.Angle.createDegrees(10))),
            Transform_1.Transform.createFixedPointAndMatrix(Point3dVector3d_1.Point3d.create(distanceScale4 * 4, distanceScale4 * 1, -distanceScale4 * 2), Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(-2, 1, 4), Angle_1.Angle.createDegrees(35)))
        ];
    }
    /**
     * Return a single rigid transform with all terms nonzero.
     */
    static createMessyRigidTransform(fixedPoint) {
        return Transform_1.Transform.createFixedPointAndMatrix(fixedPoint ? fixedPoint : Point3dVector3d_1.Point3d.create(1, 2, 3), Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(0.3, -0.2, 1.2), Angle_1.Angle.createDegrees(15.7)));
    }
    /** Return various rigid matrices:
     * * identity
     * * small rotations around x, y, z
     * * small rotation around (1,2,3)
     */
    static createRigidAxes() {
        return [
            Matrix3d_1.Matrix3d.createIdentity(),
            Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.unitX(), Angle_1.Angle.createDegrees(10)),
            Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.unitY(), Angle_1.Angle.createDegrees(10)),
            Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.unitZ(), Angle_1.Angle.createDegrees(10)),
            Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(1, 2, 3), Angle_1.Angle.createDegrees(10)),
        ];
    }
    /**
     * Return various Matrix4d
     * * Simple promotion of each Sample.createInvertibleTransforms ()
     * * optional nasty [1,2,3,4...15] row order
     * @param includeIrregular if true, include [1,2,..15] row major
     */ // promote each transform[] to a Matrix4d.
    static createMatrix4ds(includeIrregular = false) {
        const result = [];
        let transform;
        for (transform of Sample.createInvertibleTransforms())
            result.push(Matrix4d_1.Matrix4d.createTransform(transform));
        if (includeIrregular) {
            result.push(Matrix4d_1.Matrix4d.createRowValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
        }
        return result;
    }
    /**
     * Create full Map4d for each `Sample.createInvertibleTransforms ()`
     */
    static createMap4ds() {
        const result = [];
        let transform;
        for (transform of Sample.createInvertibleTransforms()) {
            const inverse = transform.inverse();
            if (inverse) {
                const map = Map4d_1.Map4d.createTransform(transform, inverse);
                if (map)
                    result.push(map);
            }
        }
        return result;
    }
    /** Assorted simple `Path` objects. */
    static createSimplePaths(withGaps = false) {
        const point0 = Point3dVector3d_1.Point3d.create(0, 0, 0);
        const point1 = Point3dVector3d_1.Point3d.create(10, 0, 0);
        const p1 = [point1, Point3dVector3d_1.Point3d.create(0, 10, 0), Point3dVector3d_1.Point3d.create(6, 10, 0), Point3dVector3d_1.Point3d.create(6, 10, 0), Point3dVector3d_1.Point3d.create(0, 10, 0)];
        const segment1 = LineSegment3d_1.LineSegment3d.create(point0, point1);
        const vectorU = Point3dVector3d_1.Vector3d.unitX(3);
        const vectorV = Point3dVector3d_1.Vector3d.unitY(3);
        const arc2 = Arc3d_1.Arc3d.create(point1.minus(vectorU), vectorU, vectorV, AngleSweep_1.AngleSweep.createStartEndDegrees(0, 90));
        const simplePaths = [
            Path_1.Path.create(segment1),
            Path_1.Path.create(segment1, arc2),
            Path_1.Path.create(LineSegment3d_1.LineSegment3d.create(point0, point1), LineString3d_1.LineString3d.create(p1)),
            Sample.createCappedArcPath(4, 0, 180),
        ];
        if (withGaps)
            simplePaths.push(Path_1.Path.create(LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(10, 0, 0)), LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(10, 10, 0), Point3dVector3d_1.Point3d.create(5, 0, 0))));
        return simplePaths;
    }
    /** Assorted `Path` with lines and arcs.
     * Specifically useful for offset tests.
     */
    static createLineArcPaths() {
        const paths = [];
        const x1 = 10.0;
        const y2 = 5.0;
        const y3 = 10.0;
        for (const y0 of [0, -1, 1]) {
            for (const x2 of [15, 11, 20, 9, 7]) {
                const point0 = Point3dVector3d_1.Point3d.create(0, y0, 0);
                const point1 = Point3dVector3d_1.Point3d.create(x1, 0, 0);
                const point2 = Point3dVector3d_1.Point3d.create(x2, y2, 0);
                const point3 = Point3dVector3d_1.Point3d.create(x1, y3, 0);
                const point4 = Point3dVector3d_1.Point3d.create(0, y3 + y0, 0);
                const path0 = Path_1.Path.create();
                path0.tryAddChild(LineString3d_1.LineString3d.create(point0, point1, point2, point3, point4));
                paths.push(path0);
                const path1 = Path_1.Path.create();
                path1.tryAddChild(LineSegment3d_1.LineSegment3d.create(point0, point1));
                path1.tryAddChild(Arc3d_1.Arc3d.createCircularStartMiddleEnd(point1, Point3dVector3d_1.Point3d.create(x2, y2, 0), point3));
                path1.tryAddChild(LineSegment3d_1.LineSegment3d.create(point3, point4));
                paths.push(path1);
            }
        }
        return paths;
    }
    /** Assorted `PointString3d` objects. */
    static createSimplePointStrings() {
        const p1 = [[Point3dVector3d_1.Point3d.create(0, 10, 0)], [Point3dVector3d_1.Point3d.create(6, 10, 0)], [Point3dVector3d_1.Point3d.create(6, 10, 0), [Point3dVector3d_1.Point3d.create(6, 10, 0)]]];
        const simplePaths = [
            PointString3d_1.PointString3d.create(Point3dVector3d_1.Point3d.create(1, 2, 0)),
            PointString3d_1.PointString3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(10, 0, 0)),
            PointString3d_1.PointString3d.create(Point3dVector3d_1.Point3d.create(10, 0, 0), Point3dVector3d_1.Point3d.create(10, 5, 0)),
            PointString3d_1.PointString3d.create(p1)
        ];
        return simplePaths;
    }
    /** Assorted `Loop` objects */
    static createSimpleLoops() {
        const point0 = Point3dVector3d_1.Point3d.create(0, 0, 0);
        const point1 = Point3dVector3d_1.Point3d.create(10, 0, 0);
        const point2 = Point3dVector3d_1.Point3d.create(10, 5, 0);
        const point3 = Point3dVector3d_1.Point3d.create(0, 5, 0);
        const result = [
            // rectangle with single linestring
            Loop_1.Loop.create(LineString3d_1.LineString3d.create(point0, point1, point2, point3, point0)),
            // unit circle
            Loop_1.Loop.create(Arc3d_1.Arc3d.createUnitCircle()),
            // rectangle, but with individual line segments
            Loop_1.Loop.create(LineSegment3d_1.LineSegment3d.create(point0, point1), LineSegment3d_1.LineSegment3d.create(point1, point2), LineSegment3d_1.LineSegment3d.create(point2, point3), LineSegment3d_1.LineSegment3d.create(point3, point0)),
            // Semicircle
            Sample.createCappedArcLoop(4, -90, 90),
        ];
        return result;
    }
    /**
     * Create a square wave along x direction
     * @param dx0 distance along x axis at y=0
     * @param dy vertical rise
     * @param dx1 distance along x axis at y=dy
     * @param numPhase number of phases of the jump.
     * @param dyReturn y value for return to origin.  If 0, the wave ends at y=0 after then final "down" with one extra horizontal dx0
     *     If nonzero, rise to that y value, return to x=0, and return down to origin.
     *
     */
    static createSquareWave(origin, dx0, dy, dx1, numPhase, dyReturn) {
        const result = [origin.clone()];
        for (let i = 0; i < numPhase; i++) {
            this.pushMove(result, dx0, 0);
            this.pushMove(result, 0, dy);
            this.pushMove(result, dx1, 0);
            this.pushMove(result, 0, -dy);
        }
        this.pushMove(result, dx0, 0);
        if (dyReturn !== 0.0) {
            this.pushMove(result, 0, dyReturn);
            result.push(Point3dVector3d_1.Point3d.create(origin.x, origin.y + dyReturn));
            result.push(result[0].clone());
        }
        return result;
    }
    /**
     * Create multiple interpolated points between two points
     * @param point0 start point (at fraction0)
     * @param point1 end point (at fraction1)
     * @param numPoints total number of points.  This is force to at least 2.
     * @param result optional existing array to receive points.
     * @param index0 optional index of first point.  Default is 0.
     * @param index1 optional index of final point.  Default is numPoints
     */
    static createInterpolatedPoints(point0, point1, numPoints, result, index0, index1) {
        if (numPoints < 2)
            numPoints = 2;
        if (result === undefined)
            result = [];
        if (index0 === undefined)
            index0 = 0;
        if (index1 === undefined)
            index1 = numPoints;
        for (let i = index0; i <= index1; i++) {
            result.push(point0.interpolate(i / numPoints, point1));
        }
        return result;
    }
    /**
     * Append numPhase teeth.  Each tooth starts with dxLow dwell at initial y, then sloped rise, then dwell at top, then sloped fall
     * * If no points are present, start with 000.  (this happens in pushMove) Otherwise start from final point.
     * * return points array reference.
     * @param points point array to receive points
     * @param dxLow starting step along x direction
     * @param riseX width of rising and falling parts
     * @param riseY height of rise
     * @param dxHigh width at top
     * @param numPhase number of phases.
     */
    static appendSawTooth(points, dxLow, riseX, riseY, dxHigh, numPhase) {
        for (let i = 0; i < numPhase; i++) {
            this.pushMove(points, dxLow, 0, 0);
            this.pushMove(points, riseX, riseY, 0);
            this.pushMove(points, dxHigh, 0, 0);
            this.pushMove(points, riseX, -riseY, 0);
        }
        return points;
    }
    /** append sawtooth with x distances successively scaled by xFactor */
    static appendVariableSawTooth(points, dxLow, riseX, riseY, dxHigh, numPhase, xFactor) {
        let factor = 1.0;
        for (let i = 0; i < numPhase; i++) {
            this.appendSawTooth(points, factor * dxLow, factor * riseX, riseY, factor * dxHigh, 1);
            factor *= xFactor;
        }
        return points;
    }
    /**
     * Create a pair of sawtooth patterns, one (nominally) outbound and up, the other inbound and down.
     * * return phase count adjusted to end at start x
     * * enter return dx values as lengths -- sign will be negated in construction.
     * @param origin start of entire path.
     * @param dxLow low outbound dwell
     * @param riseX x part of outbound rise and fall
     * @param riseY y part of outbound rise and fall
     * @param dxHigh high outbound dwell
     * @param numPhaseOutbound number of phases outbound.  Final phase followed by dxLow dwell.
     * @param dyFinal rise after final dwell.
     * @param dxLowReturn dwell at return high
     * @param riseXReturn rise x part of return
     * @param riseYReturn rise y part of return
     * @param dxHighReturn  dwell at return high
     */
    static createBidirectionalSawtooth(origin, dxLow, riseX, riseY, dxHigh, numPhaseOutbound, dyFinal, dxLowReturn, riseXReturn, riseYReturn, dxHighReturn) {
        const data = [origin.clone()];
        const x0 = data[0].x;
        this.appendSawTooth(data, dxLow, riseX, riseY, dxHigh, numPhaseOutbound);
        this.pushMove(data, dxLow, 0, 0);
        this.pushMove(data, 0, dyFinal);
        const x1 = data[data.length - 1].x;
        const returnPhase = Math.abs(dxLowReturn + 2 * riseXReturn + dxHighReturn);
        const totalDX = Math.abs(x1 - x0);
        const numReturnPhase = Math.floor(Math.abs(totalDX / returnPhase));
        this.appendSawTooth(data, -dxLowReturn, -riseXReturn, riseYReturn, -dxHighReturn, numReturnPhase);
        const x2 = data[data.length - 1].x;
        this.pushMove(data, x0 - x2, 0, 0);
        data.push(data[0].clone());
        return data;
    }
    /** append to a linestring, taking steps along given vector directions
     * If the linestring is empty, a 000 point is added.
     * @param linestring LineString3d to receive points.
     * @param numPhase number of phases of the sawtooth
     * @param vectors any number of vector steps.
     */
    static appendPhases(linestring, numPhase, ...vectors) {
        const tailPoint = linestring.endPoint(); // and this defaults to 000 . ..
        if (linestring.numPoints() === 0)
            linestring.addPoint(tailPoint);
        for (let i = 0; i < numPhase; i++) {
            for (const v of vectors) {
                tailPoint.addInPlace(v);
                linestring.addPoint(tailPoint);
            }
        }
    }
    /** Assorted regions with arc boundaries
     * * full circle
     * * with varying sweep:
     *    * partial arc with single chord closure
     *    * partial arc with 2-edge closure via center
     */
    static createArcRegions() {
        const result = [];
        const center = Point3dVector3d_1.Point3d.create(0, 0, 0);
        for (const sweep of [
            AngleSweep_1.AngleSweep.createStartEndDegrees(0, 360),
            AngleSweep_1.AngleSweep.createStartEndDegrees(-20, 20),
            AngleSweep_1.AngleSweep.createStartEndDegrees(0, 90),
            AngleSweep_1.AngleSweep.createStartEndDegrees(0, 180),
        ]) {
            const arc0 = Arc3d_1.Arc3d.createXY(Point3dVector3d_1.Point3d.create(0, 0), 2.0, sweep);
            if (arc0.sweep.isFullCircle) {
                result.push(Loop_1.Loop.create(arc0));
            }
            else {
                const chord = LineSegment3d_1.LineSegment3d.create(arc0.endPoint(), arc0.startPoint());
                result.push(Loop_1.Loop.create(arc0, chord));
                result.push(Loop_1.Loop.create(arc0, LineString3d_1.LineString3d.create(arc0.endPoint(), center, arc0.startPoint())));
            }
        }
        return result;
    }
    /** Assorted loops in xy plane:
     * * unit square
     * * rectangle
     * * L shape
     */
    static createSimpleXYPointLoops() {
        const result = [];
        result.push(Sample.createRectangleXY(0, 0, 1, 1));
        result.push(Sample.createRectangleXY(0, 0, 4, 3));
        result.push(Sample.createLShapedPolygon(0, 0, 5, 4, 1, 2));
        return result;
    }
    /** Assorted `ParityRegion` objects */
    static createSimpleParityRegions(includeBCurves = false) {
        const pointC = Point3dVector3d_1.Point3d.create(-5, 0, 0);
        const point0 = Point3dVector3d_1.Point3d.create(0, 0, 0);
        const point1 = Point3dVector3d_1.Point3d.create(4, 2, 0);
        const point2 = Point3dVector3d_1.Point3d.create(6, 4, 0);
        const point3 = Point3dVector3d_1.Point3d.create(5, 5, 0);
        const point4 = Point3dVector3d_1.Point3d.create(8, 3, 0);
        const reverseSweep = AngleSweep_1.AngleSweep.createStartEndDegrees(0, -360);
        const ax = 10.0;
        const ay = 8.0;
        const bx = -3.0;
        const by = 2.0;
        const r2 = 0.5;
        const r2A = 2.5;
        const pointA = point0.plusXYZ(ax, 0, 0);
        const pointB = pointA.plusXYZ(0, ay, 0);
        const pointC1 = point0.plusXYZ(0, ay);
        const result = [
            ParityRegion_1.ParityRegion.create(Loop_1.Loop.create(LineString3d_1.LineString3d.create(point0, pointA, pointB), Arc3d_1.Arc3d.createCircularStartMiddleEnd(pointB, pointC1, point0)), Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point1, bx, by))),
            ParityRegion_1.ParityRegion.create(Loop_1.Loop.create(Arc3d_1.Arc3d.createXY(pointC, 2.0)), Loop_1.Loop.create(Arc3d_1.Arc3d.createXY(pointC, 1.0, reverseSweep))),
            ParityRegion_1.ParityRegion.create(Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point0, ax, ay)), Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point1, bx, by))),
            ParityRegion_1.ParityRegion.create(Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point0, ax, ay)), Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point1, bx, by)), Loop_1.Loop.create(Arc3d_1.Arc3d.createXY(point2, r2, reverseSweep))),
            ParityRegion_1.ParityRegion.create(Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point0, ax, ay)), Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point1, bx, by)), Loop_1.Loop.create(Arc3d_1.Arc3d.createXY(point2, r2, reverseSweep)), Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point3, bx, by))),
            ParityRegion_1.ParityRegion.create(Loop_1.Loop.create(LineString3d_1.LineString3d.create(point0, pointA, pointB), Arc3d_1.Arc3d.createCircularStartMiddleEnd(pointB, pointC1, point0)), Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point1, bx, by)), Loop_1.Loop.create(Arc3d_1.Arc3d.create(point4, Point3dVector3d_1.Vector3d.create(-r2, 0), Point3dVector3d_1.Vector3d.create(0, r2A))), Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point3, bx, by))),
        ];
        if (includeBCurves) {
            const ey = 1.0;
            result.push(ParityRegion_1.ParityRegion.create(Loop_1.Loop.create(LineSegment3d_1.LineSegment3d.create(point0, pointA), BSplineCurve_1.BSplineCurve3d.createUniformKnots([pointA, Point3dVector3d_1.Point3d.create(ax + 1, ey),
                Point3dVector3d_1.Point3d.create(ax + 1, 2 * ey),
                Point3dVector3d_1.Point3d.create(ax + 2, 3 * ey),
                Point3dVector3d_1.Point3d.create(ax + 1, 4 * ey), pointB], 3), Arc3d_1.Arc3d.createCircularStartMiddleEnd(pointB, pointC1, point0))));
        }
        return result;
    }
    /** Union region. */
    static createSimpleUnions() {
        const parityRegions = Sample.createSimpleParityRegions();
        const parityRange = parityRegions[0].range();
        const ax = 3.0;
        const ay = 1.0;
        const bx = 4.0;
        const by = 2.0;
        const result = [
            UnionRegion_1.UnionRegion.create(Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(Point3dVector3d_1.Point3d.create(0, 0, 0), ax, ay)), Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(Point3dVector3d_1.Point3d.create(0, 2 * ay, 0), bx, by))),
            UnionRegion_1.UnionRegion.create(Loop_1.Loop.create(LineString3d_1.LineString3d.create(Sample.createRectangleXY(parityRange.low.x, parityRange.high.y + 0.5, parityRange.xLength(), parityRange.yLength()))), parityRegions[0])
        ];
        return result;
    }
    /** Assorted unstructured curve sets. */
    static createBagOfCurves() {
        const parityRegions = Sample.createSimpleParityRegions();
        const loops = Sample.createSimpleLoops();
        const result = [
            CurveCollection_1.BagOfCurves.create(loops[0], parityRegions[0], LineSegment3d_1.LineSegment3d.createXYXY(0, 1, 4, 2, 1)),
            // a bag with just an arc
            CurveCollection_1.BagOfCurves.create(Arc3d_1.Arc3d.createUnitCircle()),
            // a bag with just a line segment
            CurveCollection_1.BagOfCurves.create(LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(1, 1, 0))),
            // a bag with just a linestring
            CurveCollection_1.BagOfCurves.create(LineString3d_1.LineString3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(1, 1, 0), Point3dVector3d_1.Point3d.create(2, 1, 0))),
        ];
        return result;
    }
    /** Assorted smooth curve primitives:
     * * line segments
     * * arcs
     */
    static createSmoothCurvePrimitives(size = 1.0) {
        const alpha = 0.1;
        const beta = 0.3;
        return [
            LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(size, 0, 0)),
            LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(size, size, 0)),
            Arc3d_1.Arc3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Vector3d.create(size, 0, 0), Point3dVector3d_1.Vector3d.create(0, size, 0), AngleSweep_1.AngleSweep.createStartEndDegrees(0, 90)),
            Arc3d_1.Arc3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Vector3d.create(size, 0, 0), Point3dVector3d_1.Vector3d.create(0, size, 0), AngleSweep_1.AngleSweep.createStartEndDegrees(-40, 270)),
            Arc3d_1.Arc3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Vector3d.create(size, alpha * size, 0), Point3dVector3d_1.Vector3d.create(-alpha * beta * size, beta * size, 0), AngleSweep_1.AngleSweep.createStartEndDegrees(-40, 270)),
        ];
    }
    /** assorted small polyface grids, possibly expanded by gridMultiplier */
    static createSimpleIndexedPolyfaces(gridMultiplier) {
        return [
            Sample.createTriangularUnitGridPolyface(Point3dVector3d_1.Point3d.create(), Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitY(), gridMultiplier * 3, 2 * gridMultiplier, false, false, false),
            Sample.createTriangularUnitGridPolyface(Point3dVector3d_1.Point3d.create(), Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitY(), 3 * gridMultiplier, 2 * gridMultiplier, true, false, false),
            Sample.createTriangularUnitGridPolyface(Point3dVector3d_1.Point3d.create(), Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitY(), 3 * gridMultiplier, 2 * gridMultiplier, false, true, false),
            Sample.createTriangularUnitGridPolyface(Point3dVector3d_1.Point3d.create(), Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitY(), 3 * gridMultiplier, 2 * gridMultiplier, false, false, true),
            Sample.createTriangularUnitGridPolyface(Point3dVector3d_1.Point3d.create(), Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitY(), 3 * gridMultiplier, 2 * gridMultiplier, true, true, true),
        ];
    }
    /**
     * Build a mesh that is a (possibly skewed) grid in a plane.
     * @param origin "lower left" coordinate
     * @param vectorX step in "X" direction
     * @param vectorY step in "Y" direction
     * @param numXVertices number of vertices in X direction
     * @param numYVertices number of vertices in y direction
     * @param createParams true to create parameters, with paramter value `(i,j)` for point at (0 based) vertex in x,y directions
     * @param createNormals true to create a (single) normal indexed from all facets
     * @param createColors true to create a single color on each quad.  (shared between its triangles)
     * @note edgeVisible is false only on the diagonals
     */
    static createTriangularUnitGridPolyface(origin, vectorX, vectorY, numXVertices, numYVertices, createParams = false, createNormals = false, createColors = false) {
        const mesh = Polyface_1.IndexedPolyface.create(createNormals, createParams, createColors);
        const normal = vectorX.crossProduct(vectorY);
        if (createNormals) {
            normal.normalizeInPlace();
            mesh.addNormalXYZ(normal.x, normal.y, normal.z); // use XYZ to help coverage count!!
        }
        // Push to coordinate arrays
        for (let j = 0; j < numYVertices; j++) {
            for (let i = 0; i < numXVertices; i++) {
                mesh.addPoint(origin.plus2Scaled(vectorX, i, vectorY, j));
                if (createParams)
                    mesh.addParamUV(i, j);
            }
        }
        let color = 10; // arbitrarily start at color 10 so colorIndex is different from color.
        // Push elements to index array (vertices are calculated using i and j positioning for each point)
        let thisColorIndex = 0;
        for (let j = 0; j + 1 < numYVertices; j++) {
            for (let i = 0; i + 1 < numXVertices; i++) {
                const vertex00 = numXVertices * j + i;
                const vertex10 = vertex00 + 1;
                const vertex01 = vertex00 + numXVertices;
                const vertex11 = vertex01 + 1;
                // Push lower triangle
                mesh.addPointIndex(vertex00, true);
                mesh.addPointIndex(vertex10, true);
                mesh.addPointIndex(vertex11, false);
                // make color === faceIndex
                if (createColors) {
                    thisColorIndex = mesh.addColor(color++);
                    mesh.addColorIndex(thisColorIndex);
                    mesh.addColorIndex(thisColorIndex);
                    mesh.addColorIndex(thisColorIndex);
                }
                // param indexing matches points .  .
                if (createParams) {
                    mesh.addParamIndex(vertex00);
                    mesh.addParamIndex(vertex10);
                    mesh.addParamIndex(vertex11);
                }
                if (createNormals) {
                    mesh.addNormalIndex(0);
                    mesh.addNormalIndex(0);
                    mesh.addNormalIndex(0);
                }
                mesh.terminateFacet(false);
                // upper triangle
                mesh.addPointIndex(vertex11, true);
                mesh.addPointIndex(vertex01, true);
                mesh.addPointIndex(vertex00, false);
                // make color === faceIndex
                if (createColors) {
                    mesh.addColorIndex(thisColorIndex);
                    mesh.addColorIndex(thisColorIndex);
                    mesh.addColorIndex(thisColorIndex);
                }
                // param indexing matches points.
                if (createParams) {
                    mesh.addParamIndex(vertex11);
                    mesh.addParamIndex(vertex01);
                    mesh.addParamIndex(vertex00);
                }
                if (createNormals) {
                    mesh.addNormalIndex(0);
                    mesh.addNormalIndex(0);
                    mesh.addNormalIndex(0);
                }
                mesh.terminateFacet(false);
            }
        }
        return mesh;
    }
    /** Create an xy grid of points in single array with x varying fastest. */
    static createXYGrid(numU, numV, dX = 1.0, dY = 1.0) {
        const points = [];
        for (let j = 0; j < numV; j++) {
            for (let i = 0; i < numU; i++) {
                points.push(Point3dVector3d_1.Point3d.create(i * dX, j * dY, 0));
            }
        }
        return points;
    }
    /** Create simple bspline surface on xy plane grid. */
    static createXYGridBsplineSurface(numU, numV, orderU, orderV) {
        return BSplineSurface_1.BSplineSurface3d.create(Sample.createXYGrid(numU, numV, 1.0, 1.0), numU, orderU, undefined, numV, orderV, undefined);
    }
    /**
     * Create a bspline surface whose poles area on circular paths.
     * * (BUT not weighted bspline, therefore although u and v isolines "go around" they are not true circles.)
     * @param radiusU major radius
     * @param radiusV minor radius
     * @param numU number of facets around major hoop
     * @param numV number of facets around minor hoop
     * @param orderU major hoop order
     * @param orderV minor hoop order
     */
    static createPseudoTorusBsplineSurface(radiusU, radiusV, numU, numV, orderU, orderV) {
        const points = [];
        const numUPole = numU + orderU - 1;
        const numVPole = numV + orderV - 1;
        const uKnots = KnotVector_1.KnotVector.createUniformWrapped(numU, orderU - 1, 0, 1);
        const vKnots = KnotVector_1.KnotVector.createUniformWrapped(numV, orderV - 1, 0, 1);
        const dURadians = 2.0 * Math.PI / numU;
        const dVRadians = 2.0 * Math.PI / numV;
        for (let iV = 0; iV < numVPole; iV++) {
            const vRadians = iV * dVRadians;
            const cV = Math.cos(vRadians);
            const sV = Math.sin(vRadians);
            for (let iU = 0; iU < numUPole; iU++) {
                const uRadians = iU * dURadians;
                const cU = Math.cos(uRadians);
                const sU = Math.sin(uRadians);
                const rho = radiusU + cV * radiusV;
                points.push(Point3dVector3d_1.Point3d.create(rho * cU, rho * sU, sV * radiusV));
            }
        }
        const result = BSplineSurface_1.BSplineSurface3d.create(points, numUPole, orderU, uKnots.knots, numVPole, orderV, vKnots.knots);
        if (result) {
            result.setWrappable(0, KnotVector_1.BSplineWrapMode.OpenByAddingControlPoints);
            result.setWrappable(1, KnotVector_1.BSplineWrapMode.OpenByAddingControlPoints);
        }
        return result;
    }
    /**
     * Create a Bspline surface for a cone.
     * @param centerA center at section A
     * @param centerB center at section B
     * @param radiusA radius at point A
     * @param radiusB radius at point B
     */
    static createConeBsplineSurface(centerA, centerB, radiusA, radiusB, numSection) {
        if (numSection < 2)
            numSection = 2;
        const controlPoints = [];
        const numVPole = numSection;
        const q1 = 0.25;
        const q2 = 0.5;
        const q3 = 0.75;
        const uKnots = [0, 0, q1, q1, q2, q2, q3, q3, 1, 1];
        const vKnots = [];
        const dv = 1.0 / (numSection - 1);
        for (let i = 0; i < numSection; i++) {
            vKnots.push(i * dv);
        }
        const center = Point3dVector3d_1.Point3d.create();
        const vectorAB = Point3dVector3d_1.Vector3d.createStartEnd(centerA, centerB);
        const axes = Matrix3d_1.Matrix3d.createRigidHeadsUp(vectorAB, Geometry_1.AxisOrder.ZXY);
        let r0, r90, v;
        for (let iV = 0; iV < numVPole; iV++) {
            v = iV * dv;
            centerA.interpolate(v, centerB, center);
            r0 = r90 = Geometry_1.Geometry.interpolate(radiusA, v, radiusB);
            controlPoints.push(Sample.createBsplineArc90SectionToXYZWArrays(center, axes, r0, r90, false));
        }
        const result = BSplineSurface_1.BSplineSurface3dH.createGrid(controlPoints, BSplineSurface_1.WeightStyle.WeightsSeparateFromCoordinates, 3, uKnots, 2, vKnots);
        // if (result) {
        // result.setWrappable(0, BSplineWrapMode.OpenByAddingControlPoints);
        // result.setWrappable(1, BSplineWrapMode.OpenByAddingControlPoints);
        // }
        return result;
    }
    /** Create bspline surface on xy grid with weights. */
    static createWeightedXYGridBsplineSurface(numU, numV, orderU, orderV, weight00 = 1.0, weight10 = 1.0, weight01 = 1.0, weight11 = 1.0) {
        const xyzPoles = Sample.createXYGrid(numU, numV, 1.0, 1.0);
        const weights = [];
        for (let i = 0; i < numU; i++)
            for (let j = 0; j < numV; j++) {
                const wu0 = Geometry_1.Geometry.interpolate(weight00, i / (numU - 1), weight10);
                const wu1 = Geometry_1.Geometry.interpolate(weight01, i / (numU - 1), weight11);
                weights.push(Geometry_1.Geometry.interpolate(wu0, j / (numV - 1), wu1));
            }
        return BSplineSurface_1.BSplineSurface3dH.create(xyzPoles, weights, numU, orderU, undefined, numV, orderV, undefined);
    }
    /** assorted linear sweeps */
    static createSimpleLinearSweeps() {
        const result = [];
        const base = Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(Point3dVector3d_1.Point3d.create(), 2, 3));
        const vectorZ = Point3dVector3d_1.Vector3d.create(0, 0, 1.234);
        const vectorQ = Point3dVector3d_1.Vector3d.create(0.1, 0.21, 1.234);
        result.push(LinearSweep_1.LinearSweep.create(base, vectorZ, false));
        result.push(LinearSweep_1.LinearSweep.create(base, vectorZ, true));
        result.push(LinearSweep_1.LinearSweep.create(base, vectorQ, false));
        result.push(LinearSweep_1.LinearSweep.create(base, vectorQ, true));
        result.push(LinearSweep_1.LinearSweep.create(Sample.createCappedArcLoop(5, -45, 90), vectorQ, true));
        for (const curve of Sample.createSmoothCurvePrimitives()) {
            const path = Path_1.Path.create(curve);
            result.push(LinearSweep_1.LinearSweep.create(path, vectorZ, false));
        }
        // coordinates for a clearly unclosed linestring ....
        const xyPoints = [
            Point2dVector2d_1.Point2d.create(0, 0),
            Point2dVector2d_1.Point2d.create(1, 0),
            Point2dVector2d_1.Point2d.create(1, 1)
        ];
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, false));
        // this forces artificial closure point . . .
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, true));
        // add a not-quite-exact closure point ...
        const e = 1.0e-11;
        xyPoints.push(Point2dVector2d_1.Point2d.create(e, e));
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, false));
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, true));
        // make it a better closure
        xyPoints.pop();
        xyPoints.push(xyPoints[0]);
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, false));
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, true));
        // negative sweep ...
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, -3, true));
        return result;
    }
    /**
     * Create an array of primitives with an arc centered at origin and a line segment closing back to the arc start.
     * This can be bundled into Path or Loop by caller.
     */
    static createCappedArcPrimitives(radius, startDegrees, endDegrees) {
        const arc = Arc3d_1.Arc3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Vector3d.unitX(radius), Point3dVector3d_1.Vector3d.unitY(radius), AngleSweep_1.AngleSweep.createStartEndDegrees(startDegrees, endDegrees));
        return [arc, LineSegment3d_1.LineSegment3d.create(arc.fractionToPoint(1.0), arc.fractionToPoint(0.0))];
    }
    /** Return a Path structure for a segment of arc, with closure segment */
    static createCappedArcPath(radius, startDegrees, endDegrees) {
        return Path_1.Path.createArray(Sample.createCappedArcPrimitives(radius, startDegrees, endDegrees));
    }
    /** Return a Loop structure for a segment of arc, with closure segment */
    static createCappedArcLoop(radius, startDegrees, endDegrees) {
        return Loop_1.Loop.createArray(Sample.createCappedArcPrimitives(radius, startDegrees, endDegrees));
    }
    /** Create assorted rotational sweeps. */
    static createSimpleRotationalSweeps() {
        const result = [];
        // rectangle in xy plane
        const base = Loop_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(Point3dVector3d_1.Point3d.create(1, 0, 0), 2, 3));
        // rotate around the y axis
        for (const axis of [
            Ray3d_1.Ray3d.createXYZUVW(0, 0, 0, 0, 1, 0),
            Ray3d_1.Ray3d.createXYZUVW(5, 0, 0, 0, 1, 0),
            Ray3d_1.Ray3d.createXYZUVW(-1, 0, 0, -1, 1, 0)
        ]) {
            result.push(RotationalSweep_1.RotationalSweep.create(base, axis, Angle_1.Angle.createDegrees(45.0), false));
            result.push(RotationalSweep_1.RotationalSweep.create(base, axis, Angle_1.Angle.createDegrees(150.0), true));
        }
        return result;
    }
    /** Create assorted spheres */
    static createSpheres(includeEllipsoidal = false) {
        const result = [];
        result.push(Sphere_1.Sphere.createCenterRadius(Point3dVector3d_1.Point3d.create(0, 0, 0), 1.0));
        result.push(Sphere_1.Sphere.createCenterRadius(Point3dVector3d_1.Point3d.create(1, 2, 3), 3.0));
        const s1 = Sphere_1.Sphere.createCenterRadius(Point3dVector3d_1.Point3d.create(1, 2, 3), 2.0, AngleSweep_1.AngleSweep.createStartEndDegrees(-45, 80));
        s1.capped = true;
        result.push(s1);
        // still a sphere, but with axes KIJ . .
        const s2 = Sphere_1.Sphere.createFromAxesAndScales(Point3dVector3d_1.Point3d.create(1, 2, 3), Matrix3d_1.Matrix3d.createRowValues(0, 1, 0, 0, 0, 1, 1, 0, 0), 4, 4, 4, AngleSweep_1.AngleSweep.createStartEndDegrees(-45, 45), true);
        result.push(s2);
        if (includeEllipsoidal)
            result.push(Sphere_1.Sphere.createDgnSphere(Point3dVector3d_1.Point3d.create(1, 2, 3), Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitZ(), 3, 2, AngleSweep_1.AngleSweep.createFullLatitude(), false));
        return result;
    }
    /** Create true (non-spherical) ellipsoids. */
    static createEllipsoids() {
        return [
            Sphere_1.Sphere.createEllipsoid(Transform_1.Transform.createOriginAndMatrix(Point3dVector3d_1.Point3d.create(0, 0, 0), Matrix3d_1.Matrix3d.createRowValues(4, 1, 1, 1, 4, 1, 0.5, 0.2, 5)), AngleSweep_1.AngleSweep.createFullLatitude(), true)
        ];
    }
    /** Create assorted cones. */
    static createCones() {
        const result = [];
        const origin = Point3dVector3d_1.Point3d.create(0, 0, 0);
        const topZ = Point3dVector3d_1.Point3d.create(0, 0, 5);
        const centerA = Point3dVector3d_1.Point3d.create(1, 2, 1);
        const centerB = Point3dVector3d_1.Point3d.create(2, 3, 8);
        result.push(Cone_1.Cone.createAxisPoints(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(0, 0, 1), 0.5, 0.5, false));
        result.push(Cone_1.Cone.createAxisPoints(centerA, centerB, 0.5, 0.5, false));
        result.push(Cone_1.Cone.createAxisPoints(origin, topZ, 1.0, 0.2, true));
        result.push(Cone_1.Cone.createAxisPoints(centerA, centerB, 0.2, 0.5, false));
        result.push(Cone_1.Cone.createAxisPoints(origin, centerB, 1.0, 0.0, false));
        result.push(Cone_1.Cone.createAxisPoints(topZ, origin, 0.0, 1.0, true));
        return result;
    }
    /** Create assorted Torus Pipes */
    static createTorusPipes() {
        const result = [];
        const center = Point3dVector3d_1.Point3d.create(1, 2, 3);
        const frame = Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(1, 2, 3), Angle_1.Angle.createRadians(10));
        const vectorX = frame.columnX();
        const vectorY = frame.columnY();
        const vectorZ = frame.columnZ();
        result.push(TorusPipe_1.TorusPipe.createInFrame(Transform_1.Transform.createIdentity(), 5.0, 0.8, Angle_1.Angle.create360(), false));
        result.push(TorusPipe_1.TorusPipe.createInFrame(Transform_1.Transform.createIdentity(), 5.0, 1.0, Angle_1.Angle.createDegrees(90), true));
        result.push(TorusPipe_1.TorusPipe.createDgnTorusPipe(center, vectorX, vectorY, 10, 1, Angle_1.Angle.createDegrees(180), true));
        result.push(TorusPipe_1.TorusPipe.createDgnTorusPipe(center, vectorY, vectorZ, 10, 1, Angle_1.Angle.createDegrees(45), true));
        return result;
    }
    /** Create assorted boxes. */
    static createBoxes(capped = true) {
        const result = [];
        const cornerA = Point3dVector3d_1.Point3d.create(1, 2, 3);
        const aX = 3.0;
        const aY = 2.0;
        const bX = 1.5;
        const bY = 1.0;
        const h = 5.0;
        const frame = Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(0, 0, 1), Angle_1.Angle.createDegrees(10));
        const vectorX = frame.columnX();
        const vectorY = frame.columnY();
        const cornerB = Matrix3d_1.Matrix3d.xyzPlusMatrixTimesCoordinates(cornerA, frame, 0, 0, h);
        result.push(Box_1.Box.createDgnBox(cornerA, Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitY(), cornerB, aX, aY, aX, aY, capped));
        result.push(Box_1.Box.createDgnBox(cornerA, Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitY(), cornerB, aX, aY, bX, bY, capped));
        result.push(Box_1.Box.createDgnBox(cornerA, vectorX, vectorY, cornerB, aX, aY, bX, bY, capped));
        const frameY = Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.create(0, 1, 0), Angle_1.Angle.createDegrees(10));
        result.push(Box_1.Box.createDgnBox(cornerA, frameY.columnX(), frameY.columnY(), cornerA.plusScaled(frameY.columnZ(), h), aX, aY, bX, bY, capped));
        return result;
    }
    /** create an array of points for a rectangle with corners (x0,y0,z) and (x1,y1,z)
     */
    static createRectangle(x0, y0, x1, y1, z = 0.0, closed = false) {
        const points = [
            Point3dVector3d_1.Point3d.create(x0, y0, z),
            Point3dVector3d_1.Point3d.create(x1, y0, z),
            Point3dVector3d_1.Point3d.create(x1, y1, z),
            Point3dVector3d_1.Point3d.create(x0, y1, z),
        ];
        if (closed)
            points.push(Point3dVector3d_1.Point3d.create(x0, y0, z));
        return points;
    }
    /** create an array of points for a rectangle with corners of a Range2d.
     */
    static createRectangleInRange2d(range, z = 0.0, closed = false) {
        const x0 = range.low.x;
        const x1 = range.high.x;
        const y0 = range.low.y;
        const y1 = range.high.y;
        return this.createRectangle(x0, y0, x1, y1, z, closed);
    }
    /** Create assorted ruled sweeps */
    static createRuledSweeps(includeParityRegion = false, includeBagOfCurves = false) {
        const allSweeps = [];
        const contour0 = Loop_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 3, 2, 0)));
        const contour1 = Loop_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 3, 2.5, 2)));
        const contour2 = Loop_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 4, 3.5, 4)));
        const contour3 = Loop_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 2, 1, 7)));
        const allContours = [contour0, contour1, contour2];
        allSweeps.push(RuledSweep_1.RuledSweep.create([contour0, contour1], true));
        allSweeps.push(RuledSweep_1.RuledSweep.create([contour0, contour1, contour2], true));
        allSweeps.push(RuledSweep_1.RuledSweep.create([contour0, contour1, contour2, contour3], true));
        allSweeps.push(RuledSweep_1.RuledSweep.create(allContours, false));
        const curves = Sample.createSmoothCurvePrimitives();
        for (const c of curves) {
            const frame = c.fractionToFrenetFrame(0.0);
            if (frame) {
                const perpVector = frame.matrix.columnZ();
                perpVector.scaleInPlace(10.0);
                const c1 = c.cloneTransformed(Transform_1.Transform.createTranslation(perpVector));
                allSweeps.push(RuledSweep_1.RuledSweep.create([Path_1.Path.create(c), Path_1.Path.create(c1)], false));
            }
        }
        if (includeParityRegion) {
            const outer = Loop_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 5, 6, 0)));
            const inner = Loop_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(1, 1, 2, 3, 0)));
            const contourA = ParityRegion_1.ParityRegion.create(outer, inner);
            const contourB = contourA.clone();
            contourB.tryTranslateInPlace(0, 0, 2);
            allSweeps.push(RuledSweep_1.RuledSweep.create([contourA, contourB], false));
        }
        if (includeBagOfCurves) {
            const contourA = CurveCollection_1.BagOfCurves.create(LineSegment3d_1.LineSegment3d.createXYZXYZ(1, 1, 0, 3, 1, 0));
            const contourB = CurveCollection_1.BagOfCurves.create(LineSegment3d_1.LineSegment3d.createXYZXYZ(1, 1, 1, 3, 1, 1));
            allSweeps.push(RuledSweep_1.RuledSweep.create([contourA, contourB], false));
        }
        return allSweeps;
    }
    /**
     * Uniformly spaced numbers
     * @param a0 first entry
     * @param delta step between entries
     * @param n number of entries
     */
    static createGrowableArrayCountedSteps(a0, delta, n) {
        const data = new GrowableFloat64Array_1.GrowableFloat64Array(n);
        for (let i = 0; i < n; i++)
            data.push(a0 + i * delta);
        return data;
    }
    /**
     * Create points on a unit circle
     * @param radius first entry
     * @param numEdge number of edges of chorded circle.  Angle step is 2PI/numEdge (whether or not closed)
     * @param closed true to include final point (i.e. return numEdge+1 points)
     */
    static createGrowableArrayCirclePoints(radius, numEdge, closed = false, centerX = 0, centerY = 0, data) {
        if (!data)
            data = new GrowableXYZArray_1.GrowableXYZArray();
        data.ensureCapacity(numEdge + (closed ? 1 : 0));
        const delta = 2.0 * Math.PI / numEdge;
        for (let i = 0; i < numEdge; i++) {
            const radians = i * delta;
            data.push(Point3dVector3d_1.Point3d.create(centerX + radius * Math.cos(radians), centerY + radius * Math.sin(radians)));
        }
        return data;
    }
    static pushIfDistinct(points, xyz, tol = 1.0e-12) {
        if (points.length === 0 || points[points.length - 1].distanceXY(xyz) > tol)
            points.push(xyz);
    }
    static appendToFractalEval(points, pointA, pointB, pattern, numRecursion, perpendicularFactor) {
        const point0 = pointA.clone();
        Sample.pushIfDistinct(points, pointA);
        for (const uv of pattern) {
            const point1 = pointA.interpolatePerpendicularXY(uv.x, pointB, perpendicularFactor * uv.y);
            if (numRecursion > 0)
                Sample.appendToFractalEval(points, point0, point1, pattern, numRecursion - 1, perpendicularFactor);
            Sample.pushIfDistinct(points, point1);
            point0.setFrom(point1);
        }
        Sample.pushIfDistinct(points, pointB);
    }
    /**
     * For each edge of points, construct a transform (with scale, rotate, and translate) that spreads the patter out along the edge.
     * Repeat recursively for each edge
     * @returns Returns an array of recursively generated fractal points
     * @param poles level-0 (coarse) polygon whose edges are to be replaced by recursive fractals
     * @param pattern pattern to map to each edge of poles (and to edges of the recursion)
     * @param numRecursion  number of recursions
     * @param perpendicularFactor factor to apply to perpendicular sizing.
     */
    static createRecursiveFractalPolygon(poles, pattern, numRecursion, perpendicularFactor) {
        const points = [];
        Sample.pushIfDistinct(points, poles[0]);
        for (let i = 0; i + 1 < poles.length; i++) {
            if (numRecursion > 0)
                Sample.appendToFractalEval(points, poles[i], poles[i + 1], pattern, numRecursion - 1, perpendicularFactor);
            Sample.pushIfDistinct(points, poles[i + 1]);
        }
        return points;
    }
    /** Primary shape is a "triangle" with lower edge pushed in so it becomes a mild nonconvex quad.
     *  Fractal effects are gentle.
     */
    static nonConvexQuadSimpleFractal(numRecursion, perpendicularFactor) {
        const pattern = [
            Point2dVector2d_1.Point2d.create(),
            Point2dVector2d_1.Point2d.create(0.5, 0.1),
            Point2dVector2d_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            Point3dVector3d_1.Point3d.create(0, 0, 0),
            Point3dVector3d_1.Point3d.create(0.6, 0.1, 0),
            Point3dVector3d_1.Point3d.create(1, 0.1, 0),
            Point3dVector3d_1.Point3d.create(0.6, 1, 0),
            Point3dVector3d_1.Point3d.create(),
        ];
        return Sample.createRecursiveFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    /** create a diamond with convex fractal */
    static createFractalDiamondConvexPattern(numRecursion, perpendicularFactor) {
        const pattern = [
            Point2dVector2d_1.Point2d.create(),
            Point2dVector2d_1.Point2d.create(0.3, 0.05),
            Point2dVector2d_1.Point2d.create(0.5, 0.10),
            Point2dVector2d_1.Point2d.create(0.7, 0.04),
            Point2dVector2d_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            Point3dVector3d_1.Point3d.create(0, -1, 0),
            Point3dVector3d_1.Point3d.create(1, 0, 0),
            Point3dVector3d_1.Point3d.create(0, 1, 0),
            Point3dVector3d_1.Point3d.create(-1, 0, 0),
            Point3dVector3d_1.Point3d.create(0, -1, 0),
        ];
        return Sample.createRecursiveFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    /** Create l on a square, with pattern shift to both directions. */
    static createFractalSquareReversingPattern(numRecursion, perpendicularFactor) {
        const pattern = [
            Point2dVector2d_1.Point2d.create(),
            Point2dVector2d_1.Point2d.create(0.25, 0),
            Point2dVector2d_1.Point2d.create(0.5, 0.2),
            Point2dVector2d_1.Point2d.create(0.75, -0.1),
            Point2dVector2d_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            Point3dVector3d_1.Point3d.create(),
            Point3dVector3d_1.Point3d.create(1, 0, 0),
            Point3dVector3d_1.Point3d.create(1, 1, 0),
            Point3dVector3d_1.Point3d.create(0, 1, 0),
            Point3dVector3d_1.Point3d.create(0, 0, 0),
        ];
        return Sample.createRecursiveFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    /** Create a fractal on a non-convex base and reversing pattern */
    static createFractalHatReversingPattern(numRecursion, perpendicularFactor) {
        const pattern = [
            Point2dVector2d_1.Point2d.create(),
            Point2dVector2d_1.Point2d.create(0.25, 0),
            Point2dVector2d_1.Point2d.create(0.25, 0.1),
            Point2dVector2d_1.Point2d.create(0.50, 0.1),
            Point2dVector2d_1.Point2d.create(0.50, -0.1),
            Point2dVector2d_1.Point2d.create(0.75, -0.1),
            Point2dVector2d_1.Point2d.create(0.75, 0),
            Point2dVector2d_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            Point3dVector3d_1.Point3d.create(),
            Point3dVector3d_1.Point3d.create(1, 0, 0),
            Point3dVector3d_1.Point3d.create(1, 1, 0),
            Point3dVector3d_1.Point3d.create(0, 1, 0),
            Point3dVector3d_1.Point3d.create(0, 0, 0),
        ];
        return Sample.createRecursiveFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    /** Create a fractal on a primary L shape with a reversing pattern */
    static createFractalLReversingPattern(numRecursion, perpendicularFactor) {
        const pattern = [
            Point2dVector2d_1.Point2d.create(),
            Point2dVector2d_1.Point2d.create(0.25, 0),
            Point2dVector2d_1.Point2d.create(0.5, 0.2),
            Point2dVector2d_1.Point2d.create(0.75, -0.1),
            Point2dVector2d_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            Point3dVector3d_1.Point3d.create(),
            Point3dVector3d_1.Point3d.create(1, 0, 0),
            Point3dVector3d_1.Point3d.create(1, 1, 0),
            Point3dVector3d_1.Point3d.create(2, 2, 0),
            Point3dVector3d_1.Point3d.create(2, 3, 0),
            Point3dVector3d_1.Point3d.create(0, 3, 0),
            Point3dVector3d_1.Point3d.create(),
        ];
        return Sample.createRecursiveFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    /** Fractal with fewer concavity changes.... */
    static createFractalLMildConcavePatter(numRecursion, perpendicularFactor) {
        const pattern = [
            Point2dVector2d_1.Point2d.create(),
            Point2dVector2d_1.Point2d.create(0.25, 0.05),
            Point2dVector2d_1.Point2d.create(0.5, 0.15),
            Point2dVector2d_1.Point2d.create(0.75, 0.05),
            Point2dVector2d_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            Point3dVector3d_1.Point3d.create(),
            Point3dVector3d_1.Point3d.create(1, 0, 0),
            Point3dVector3d_1.Point3d.create(1, 1, 0),
            Point3dVector3d_1.Point3d.create(2, 2, 0),
            Point3dVector3d_1.Point3d.create(1.5, 3, 0),
            Point3dVector3d_1.Point3d.create(0, 3, 0),
            Point3dVector3d_1.Point3d.create(),
        ];
        return Sample.createRecursiveFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    /** append interpolated points from the array tail to the target. */
    static appendSplits(points, target, numSplit, includeTarget) {
        const pointA = points[points.length - 1];
        for (let i = 0; i < numSplit; i++)
            points.push(pointA.interpolate(i / numSplit, target));
        if (includeTarget)
            points.push(target);
    }
    /**
     * Triangle with 3 given vertices, and indicated extra points on each each.
     * @param numSplitAB number of extra points on edge AB
     * @param numSplitBC number of extra points on edge BC
     * @param numSplitCA number of extra points on edge CA
     * @param wrap true to replicate vertexA at end
     * @param xyzA vertexA
     * @param xyzB vertexB
     * @param xyzC vertexC
     */
    static createTriangleWithSplitEdges(numSplitAB, numSplitBC, numSplitCA, wrap = true, xyzA = Point3dVector3d_1.Point3d.create(0, 0, 0), xyzB = Point3dVector3d_1.Point3d.create(1, 0, 0), xyzC = Point3dVector3d_1.Point3d.create(0, 1, 0)) {
        const result = [xyzA.clone()];
        Sample.appendSplits(result, xyzB, numSplitAB, true);
        Sample.appendSplits(result, xyzC, numSplitBC, true);
        Sample.appendSplits(result, xyzA, numSplitCA, wrap);
        return result;
    }
    /** Create a box (xyz) from half-lengths and center. */
    static createCenteredBoxEdges(ax = 1, ay = 1, az = 0, cx = 0, cy = 0, cz = 0, geometry) {
        if (!geometry)
            geometry = [];
        const x0 = cx - ax;
        const y0 = cy - ay;
        const z0 = cz - az;
        const x1 = cx + ax;
        const y1 = cy + ay;
        const z1 = cz + az;
        for (const z of [z0, z1]) {
            geometry.push(LineString3d_1.LineString3d.create(Point3dVector3d_1.Point3d.create(x0, y0, z), Point3dVector3d_1.Point3d.create(x1, y0, z), Point3dVector3d_1.Point3d.create(x1, y1, z), Point3dVector3d_1.Point3d.create(x0, y1, z), Point3dVector3d_1.Point3d.create(x0, y0, z)));
        }
        geometry.push(LineSegment3d_1.LineSegment3d.createXYZXYZ(x0, y0, z0, x0, y0, z1));
        geometry.push(LineSegment3d_1.LineSegment3d.createXYZXYZ(x1, y0, z0, x1, y0, z1));
        geometry.push(LineSegment3d_1.LineSegment3d.createXYZXYZ(x1, y1, z0, x1, y1, z1));
        geometry.push(LineSegment3d_1.LineSegment3d.createXYZXYZ(x0, y1, z0, x0, y1, z1));
        return geometry;
    }
    /** Assorted transition spirals
     * * (All combinations of bearing radius bearing radius length subsets.)
     */
    static createSimpleTransitionSpirals() {
        // 5 spirals exercise the intricate "4 out of 5" input rules for spirals . ..
        const r1 = 1000.0;
        const r0 = 0.0;
        const averageCurvature = TransitionSpiral_1.TransitionSpiral3d.averageCurvatureR0R1(r0, r1);
        const arcLength = 100.0;
        const dThetaRadians = arcLength * averageCurvature;
        return [
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, r1, Angle_1.Angle.createDegrees(0), Angle_1.Angle.createRadians(dThetaRadians), undefined, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, r1, Angle_1.Angle.createDegrees(0), undefined, arcLength, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, r1, undefined, Angle_1.Angle.createRadians(dThetaRadians), arcLength, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, undefined, Angle_1.Angle.createDegrees(0), Angle_1.Angle.createRadians(dThetaRadians), arcLength, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", undefined, r1, Angle_1.Angle.createDegrees(0), Angle_1.Angle.createRadians(dThetaRadians), arcLength, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, r1, Angle_1.Angle.createDegrees(0), Angle_1.Angle.createRadians(dThetaRadians), undefined, Segment1d_1.Segment1d.create(0, 0.5), Transform_1.Transform.createOriginAndMatrix(Point3dVector3d_1.Point3d.create(1, 2, 0), Matrix3d_1.Matrix3d.createRotationAroundVector(Point3dVector3d_1.Vector3d.unitZ(), Angle_1.Angle.createDegrees(15)))),
        ];
    }
    /** Create a Bezier curve with significant twist effects
     * * r and theta are circle in xy plane at steps in thetaStepper
     * * z varies with sin(phi) at steps in phiStepper.
     */
    static createTwistingBezier(order, x0, y0, r, thetaStepper, phiStepper, weightInterval) {
        if (weightInterval !== undefined) {
            const points = [];
            for (let i = 0; i < order; i++) {
                const theta = thetaStepper.fractionToRadians(i);
                const phi = phiStepper.fractionToRadians(i);
                const weight = weightInterval.fractionToPoint(i / (order - 1));
                points.push(Point4d_1.Point4d.create(weight * (x0 + r * Math.cos(theta)), weight * (y0 + r * Math.sin(theta)), weight * Math.sin(phi), weight));
            }
            return BezierCurve3dH_1.BezierCurve3dH.create(points);
        }
        else {
            const points = [];
            for (let i = 0; i < order; i++) {
                const theta = thetaStepper.fractionToRadians(i);
                const phi = phiStepper.fractionToRadians(i);
                points.push(Point3dVector3d_1.Point3d.create(x0 + r * Math.cos(theta), y0 + r * Math.sin(theta), Math.sin(phi)));
            }
            return BezierCurve3d_1.BezierCurve3d.create(points);
        }
        return undefined;
    }
    /**
     * Create various curve chains with distance indexing.
     * * LineSegment
     * * CircularArc
     * * LineString
     * * order 3 bspline
     * * order 4 bspline
     * * alternating lines and arcs
     */
    static createCurveChainWithDistanceIndex() {
        const pointsA = [Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(1, 3, 0), Point3dVector3d_1.Point3d.create(2, 4, 0), Point3dVector3d_1.Point3d.create(3, 3, 0), Point3dVector3d_1.Point3d.create(4, 0, 0)];
        const result = [];
        // one singleton per basic curve type ...
        result.push(CurveChainWithDistanceIndex_1.CurveChainWithDistanceIndex.createCapture(Path_1.Path.create(LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(5, 0, 0)))));
        result.push(CurveChainWithDistanceIndex_1.CurveChainWithDistanceIndex.createCapture(Path_1.Path.create(Arc3d_1.Arc3d.createCircularStartMiddleEnd(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(3, 3, 0), Point3dVector3d_1.Point3d.create(6, 0, 0)))));
        result.push(CurveChainWithDistanceIndex_1.CurveChainWithDistanceIndex.createCapture(Path_1.Path.create(LineString3d_1.LineString3d.create(pointsA))));
        result.push(CurveChainWithDistanceIndex_1.CurveChainWithDistanceIndex.createCapture(Path_1.Path.create(BSplineCurve_1.BSplineCurve3d.createUniformKnots(pointsA, 3))));
        result.push(CurveChainWithDistanceIndex_1.CurveChainWithDistanceIndex.createCapture(Path_1.Path.create(BSplineCurve_1.BSplineCurve3d.createUniformKnots(pointsA, 4))));
        result.push(CurveChainWithDistanceIndex_1.CurveChainWithDistanceIndex.createCapture(Path_1.Path.create(LineSegment3d_1.LineSegment3d.create(pointsA[0], pointsA[1]), Arc3d_1.Arc3d.createCircularStartMiddleEnd(pointsA[1], pointsA[2], pointsA[3]), LineSegment3d_1.LineSegment3d.create(pointsA[3], pointsA[4]))));
        return result;
    }
    /**
     * Create a square wave path.
     * @param numTooth number of teeth.
     * @param dxA x size of "A" part
     * @param dxB x size of "B" part
     * @param yA y for A part
     * @param yB y for B part
     * @param structure 1 for line segments, 2 for one linestring per tooth, 0 for single linestring
     */
    static createSquareWavePath(numTooth, dxA, dxB, yA, yB, structure) {
        const dxAB = dxA + dxB;
        const path = Path_1.Path.create();
        // build the whole linestring ...
        const allPoints = new GrowableXYZArray_1.GrowableXYZArray(4 * numTooth);
        let x2 = 0.0;
        for (let i = 0; i < numTooth; i++) {
            const x0 = i * dxAB;
            const x1 = x0 + dxA;
            x2 = (i + 1) * dxAB;
            allPoints.pushXYZ(x0, yA, 0);
            allPoints.pushXYZ(x1, yA, 0.0);
            allPoints.pushXYZ(x1, yB, 0.0);
            allPoints.pushXYZ(x2, yB, 0.0);
        }
        allPoints.pushXYZ(x2, yA, 0.0);
        const numPoints = allPoints.length;
        if (structure === 1) {
            const pointA = Point3dVector3d_1.Point3d.create();
            const pointB = Point3dVector3d_1.Point3d.create();
            allPoints.getPoint3dAtUncheckedPointIndex(0, pointA);
            for (let i1 = 0; i1 + 1 < numPoints; i1++) {
                allPoints.getPoint3dAtUncheckedPointIndex(i1, pointB);
                path.tryAddChild(LineSegment3d_1.LineSegment3d.create(pointA, pointB));
                pointA.setFromPoint3d(pointB);
            }
        }
        else if (structure === 2) {
            for (let i0 = 0; i0 + 4 < numPoints; i0 += 4) {
                const ls = LineString3d_1.LineString3d.create();
                ls.addSteppedPoints(allPoints, i0, 1, 5);
                path.tryAddChild(ls);
            }
        }
        else {
            const ls = LineString3d_1.LineString3d.create();
            ls.addSteppedPoints(allPoints, 0, 1, numPoints);
            path.tryAddChild(ls);
        }
        return path;
    }
    /**
     * Create various elliptic arcs
     * * circle with vector0, vector90 aligned with x,y
     * * circle with axes rotated
     * *
     * @param radiusRatio = vector90.magnitude / vector0.magnitude
     */
    static createArcs(radiusRatio = 1.0, sweep = AngleSweep_1.AngleSweep.create360()) {
        const arcs = [];
        const center0 = Point3dVector3d_1.Point3d.create(0, 0, 0);
        const a = 1.0;
        const b = radiusRatio;
        const direction0 = Point3dVector3d_1.Vector3d.createPolar(a, Angle_1.Angle.createDegrees(35.0));
        const direction90 = direction0.rotate90CCWXY();
        direction90.scaleInPlace(radiusRatio);
        arcs.push(Arc3d_1.Arc3d.create(center0, Point3dVector3d_1.Vector3d.create(a, 0, 0), Point3dVector3d_1.Vector3d.create(0, b, 0), sweep));
        arcs.push(Arc3d_1.Arc3d.create(center0, direction0, direction90, sweep));
        return arcs;
    }
    /**
     * Create many arcs, optionally including skews
     * * @param skewFactor array of skew factors.  for each skew factor, all base arcs are replicated with vector90 shifted by the factor times vector0
     */
    static createManyArcs(skewFactors = []) {
        const result = [];
        const sweep1 = AngleSweep_1.AngleSweep.createStartEndDegrees(-10, 75);
        const sweep2 = AngleSweep_1.AngleSweep.createStartEndDegrees(160.0, 380.0);
        for (const arcs of [
            Sample.createArcs(1.0), Sample.createArcs(0.5),
            Sample.createArcs(1.0, sweep1), Sample.createArcs(0.3, sweep2)
        ]) {
            for (const arc of arcs)
                result.push(arc);
        }
        const numBase = result.length;
        for (const skewFactor of skewFactors) {
            for (let i = 0; i < numBase; i++) {
                const originalArc = result[i];
                result.push(Arc3d_1.Arc3d.create(originalArc.center, originalArc.vector0, originalArc.vector90.plusScaled(originalArc.vector0, skewFactor), originalArc.sweep));
            }
        }
        return result;
    }
    /**
     * Create edges of a range box.
     * * Line strings on low and high z
     * * single lines on each low z to high z edge.
     * * @param range (possibly null) range
     */
    static createRangeEdges(range) {
        if (range.isNull)
            return undefined;
        const corners = range.corners();
        return CurveCollection_1.BagOfCurves.create(LineString3d_1.LineString3d.create(corners[0], corners[1], corners[3], corners[2], corners[0]), LineString3d_1.LineString3d.create(corners[4], corners[5], corners[7], corners[6], corners[4]), LineSegment3d_1.LineSegment3d.create(corners[0], corners[4]), LineSegment3d_1.LineSegment3d.create(corners[1], corners[5]), LineSegment3d_1.LineSegment3d.create(corners[2], corners[6]), LineSegment3d_1.LineSegment3d.create(corners[3], corners[7]));
    }
    /** Create swept "solids" that can be capped.
     * * At least one of each solid type.
     * * each is within 10 of the origin all directions.
     */
    static createClosedSolidSampler(capped) {
        const result = [];
        result.push(Box_1.Box.createRange(Range_1.Range3d.createXYZXYZ(0, 0, 0, 3, 2, 5), capped));
        result.push(Cone_1.Cone.createAxisPoints(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(0, 0, 5), 1.0, 1.0, capped));
        result.push(Sphere_1.Sphere.createCenterRadius(Point3dVector3d_1.Point3d.create(0, 0, 0), 1.0));
        result.push(TorusPipe_1.TorusPipe.createInFrame(Transform_1.Transform.createIdentity(), 3.0, 1.0, Angle_1.Angle.create360(), capped));
        const arcA = Arc3d_1.Arc3d.createXY(Point3dVector3d_1.Point3d.create(6, 1, 0), 1.0, AngleSweep_1.AngleSweep.createStartEndDegrees(-90, 0));
        const point0 = arcA.fractionAndDistanceToPointOnTangent(0.0, -4);
        const pointQ1 = arcA.fractionAndDistanceToPointOnTangent(1.0, 2);
        const pointQ2 = arcA.fractionAndDistanceToPointOnTangent(1.0, 0.5);
        const pointR1 = Point3dVector3d_1.Point3d.create(point0.x, pointQ1.y);
        const pointR2 = Point3dVector3d_1.Point3d.create(point0.x, pointQ1.y);
        const linestringQ1 = LineString3d_1.LineString3d.create(arcA.fractionToPoint(1.0), pointQ1, pointR1, point0);
        const linestringQ2 = LineString3d_1.LineString3d.create(arcA.fractionToPoint(1.0), pointQ2, pointR2, point0);
        const contourZ = Path_1.Path.create(linestringQ1.clone());
        const contourA = Loop_1.Loop.create(LineSegment3d_1.LineSegment3d.create(point0, arcA.fractionToPoint(0)), arcA.clone(), linestringQ1.clone());
        const contourB = Loop_1.Loop.create(LineSegment3d_1.LineSegment3d.create(point0, arcA.fractionToPoint(0)), arcA.clone(), linestringQ2.clone());
        contourB.tryTransformInPlace(Transform_1.Transform.createTranslationXYZ(1, 1, 3));
        // const contourC = contourB.cloneTransformed(Transform.createTranslationXYZ(2, 1, 4))!;
        result.push(LinearSweep_1.LinearSweep.create(contourA, Point3dVector3d_1.Vector3d.create(0, 0, 5), capped));
        const axis = Ray3d_1.Ray3d.createXYZUVW(0, 8, 0, 1, 0, 0);
        result.push(RotationalSweep_1.RotationalSweep.create(contourA.clone(), axis.clone(), Angle_1.Angle.createDegrees(90), capped));
        if (!capped)
            result.push(RotationalSweep_1.RotationalSweep.create(contourZ.clone(), axis.clone(), Angle_1.Angle.createDegrees(90), false));
        result.push(RuledSweep_1.RuledSweep.create([contourA.clone(), contourB.clone()], capped));
        const transformC = Transform_1.Transform.createScaleAboutPoint(Point3dVector3d_1.Point3d.create(0, 0, 8), 0.5);
        const contourC = contourB.cloneTransformed(transformC);
        result.push(RuledSweep_1.RuledSweep.create([contourA.clone(), contourB.clone(), contourC.clone()], capped));
        return result;
    }
    /** Create a rotational sweep with segment, arc, and linestring in its contour.
     */
    static createRotationalSweepLineSegment3dArc3dLineString3d(capped) {
        const result = [];
        const arcA = Arc3d_1.Arc3d.createXY(Point3dVector3d_1.Point3d.create(6, 1, 0), 1.0, AngleSweep_1.AngleSweep.createStartEndDegrees(-90, 0));
        const point0 = arcA.fractionAndDistanceToPointOnTangent(0.0, -4);
        const pointQ1 = arcA.fractionAndDistanceToPointOnTangent(1.0, 2);
        const pointR1 = Point3dVector3d_1.Point3d.create(point0.x, pointQ1.y);
        const linestringQ1 = LineString3d_1.LineString3d.create(arcA.fractionToPoint(1.0), pointQ1, pointR1, point0);
        const contourZ = Path_1.Path.create(linestringQ1.clone());
        const axis = Ray3d_1.Ray3d.createXYZUVW(0, 8, 0, 1, 0, 0);
        result.push(RotationalSweep_1.RotationalSweep.create(contourZ.clone(), axis.clone(), Angle_1.Angle.createDegrees(90), capped));
        return result;
    }
    /**
     * Create points:
     * *  `numRadialEdges` radially from origin to polar point (r,sweep.start)
     * * `numArcEdges` along arc from (r,sweep.start) to (r,sweep.end)
     * * `numRadialEdges` returning to origin.
     * * optionally include closure point at origin.
     * @param x0 center x
     * @param y0 center y
     * @param radius radius of circle.
     * @param sweep start and end angles of sweep.
     * @param numRadialEdges number of edges from center to arc
     * @param numArcEdges number of edges along arc
     * @param addClosure true to repeat center as closure point
     */
    static createCutPie(x0, y0, radius, sweep, numRadialEdges, numArcEdges, addClosure = false) {
        const points = [];
        const center = Point3dVector3d_1.Point3d.create(x0, y0);
        points.push(center);
        const pointA = Point3dVector3d_1.Point3d.create(x0 + radius * Math.cos(sweep.startRadians), y0 + radius * Math.sin(sweep.startRadians));
        const pointB = Point3dVector3d_1.Point3d.create(x0 + radius * Math.cos(sweep.endRadians), y0 + radius * Math.sin(sweep.endRadians));
        for (let i = 1; i < numRadialEdges; i++)
            points.push(center.interpolate(i / numRadialEdges, pointA));
        points.push(pointA);
        for (let i = 1; i < numArcEdges; i++) {
            const radians = sweep.fractionToRadians(i / numArcEdges);
            points.push(Point3dVector3d_1.Point3d.create(x0 + radius * Math.cos(radians), y0 + radius * Math.sin(radians)));
        }
        points.push(pointB);
        for (let i = 1; i < numRadialEdges; i++)
            points.push(pointB.interpolate(i / numRadialEdges, center));
        if (addClosure)
            points.push(center.clone());
        return points;
    }
    /**
     * * let ay = 4
     * * base polygon has vertices (0,0), (ax,0), (2*ax,0), (2* ax,ay), (ax,ay), (0,ay), (0,0).
     * * shift the x coordinates of vertices 1,4 by indicated amounts (0-based numbering)
     * * shift the y coordinates for points 1,2,3,4 by indicated amounts (in 0-based numbering)
     * * This is useful for testing non-y-monotonic face situations.
     * * Return as points.
     * @param dy1
     * @param dy2
     * @param dy3
     * @param dy4
     */
    static creatVerticalStaggerPolygon(dy1, dy2, dy3, dy4, ax, ay, dx1, dx4) {
        return [Point3dVector3d_1.Point3d.create(0, 0),
            Point3dVector3d_1.Point3d.create(ax + dx1, dy1),
            Point3dVector3d_1.Point3d.create(2 * ax, dy2),
            Point3dVector3d_1.Point3d.create(2 * ax, ay + dy3),
            Point3dVector3d_1.Point3d.create(ax + dx4, ay + dy4),
            Point3dVector3d_1.Point3d.create(0.0, ay),
            Point3dVector3d_1.Point3d.create(0, 0)];
    }
    /**
     * make line segments for each pair of adjacent points.
     * @param points array of points
     * @param forceClosure if true, inspect coordinates to determine if a closure edge is needed.
     */
    static convertPointsToSegments(points, forceClosure = false) {
        const segments = [];
        const n = points.length;
        for (let i = 0; i + 1 < n; i++) {
            segments.push(LineSegment3d_1.LineSegment3d.create(points[i], points[i + 1]));
        }
        if (forceClosure && n > 1 && !points[0].isAlmostEqual(points[n - 1]))
            segments.push(LineSegment3d_1.LineSegment3d.create(points[n - 1], points[0]));
        return segments;
    }
    /**
     * Create a regular polygon
     * @param angle0 angle from x axis to first point.
     * @param numPoint number of points
     * @param close true to add closure edge.
     */
    static createRegularPolygon(cx, cy, cz, angle0, r, numPoint, close) {
        const points = [];
        const angleStepRadians = 2.0 * Math.PI / numPoint;
        let radians;
        for (let i = 0; i < numPoint; i++) {
            radians = angle0.radians + i * angleStepRadians;
            points.push(Point3dVector3d_1.Point3d.create(cx + r * Math.cos(radians), cy + r * Math.sin(radians), cz));
        }
        if (close)
            points.push(points[0].clone());
        return points;
    }
    /**
     * Create a star by alternating radii (with equal angular steps)
     * @param r0 first point radius
     * @param r1 second point radius (if undefined, this is skipped and the result is points on a circle.)
     * @param numPoint number of points
     * @param close true to add closure edge.
     */
    static createStar(cx, cy, cz, r0, r1, numPoint, close, theta0) {
        const points = [];
        const angleStepRadians = Math.PI / numPoint;
        const radians0 = theta0 === undefined ? 0.0 : theta0.radians;
        let radians;
        for (let i = 0; i < numPoint; i++) {
            radians = radians0 + 2 * i * angleStepRadians;
            points.push(Point3dVector3d_1.Point3d.create(cx + r0 * Math.cos(radians), cy + r0 * Math.sin(radians), cz));
            if (r1 !== undefined) {
                radians = radians0 + (2 * i + 1) * angleStepRadians;
                points.push(Point3dVector3d_1.Point3d.create(cx + r1 * Math.cos(radians), cy + r1 * Math.sin(radians), cz));
            }
        }
        if (close)
            points.push(points[0].clone());
        return points;
    }
    /**
     * Create an outer star A
     * Place multiple inner stars B with centers on circle C
     * @param rA0 radius to star tips on starA
     * @param rA1 radius to star tips on starA
     * @param numAPoint number of points on starA
     * @param rB0 radius to star B tips
     * @param rB1 radius to star B  tips
     * @param numBPoint
     * @param rC radius for inner star centers
     * @param numC number of inner stars
     */
    static createStarsInStars(rA0, rA1, numAPoint, rB0, rB1, numBPoint, rC, numC, close) {
        const loops = [];
        loops.push(this.createStar(0, 0, 0, rA0, rA1, numAPoint, close));
        if (numC > 0) {
            const radiansStep = Math.PI * 2.0 / numC;
            for (let i = 0; i < numC; i++) {
                const radians = i * radiansStep;
                loops.push(this.createStar(rC * Math.cos(radians), rC * Math.sin(radians), 0.0, rB0, rB1, numBPoint, close));
            }
        }
        return loops;
    }
    static appendGeometry(source, dest) {
        for (const g of source)
            dest.push(g);
    }
    /** Create a simple example of each GeometryQuery type .... */
    static createAllGeometryQueryTypes() {
        const result = [];
        const pointA = Point3dVector3d_1.Point3d.create(0, 0, 0);
        const pointB = Point3dVector3d_1.Point3d.create(1, 0, 0);
        const pointC = Point3dVector3d_1.Point3d.create(1, 1, 0);
        const pointD = Point3dVector3d_1.Point3d.create(0, 1, 0);
        const pointABC = [pointA, pointB, pointC];
        const pointABCD = [pointA, pointB, pointC, pointD];
        const pointABCDA = [pointA, pointB, pointC, pointD, pointA];
        result.push(LineSegment3d_1.LineSegment3d.create(pointA, pointB));
        result.push(CoordinateXYZ_1.CoordinateXYZ.create(pointA));
        result.push(Arc3d_1.Arc3d.createCircularStartMiddleEnd(pointA, pointB, pointC));
        result.push(PointString3d_1.PointString3d.create(pointA, pointB));
        result.push(TransitionSpiral_1.TransitionSpiral3d.createRadiusRadiusBearingBearing(Segment1d_1.Segment1d.create(0, 100), AngleSweep_1.AngleSweep.createStartEndDegrees(0, 5), Segment1d_1.Segment1d.create(0, 0.5), Transform_1.Transform.createIdentity()));
        result.push(LineString3d_1.LineString3d.create(pointABCD));
        result.push(BezierCurve3d_1.BezierCurve3d.create(pointABC));
        result.push(BezierCurve3dH_1.BezierCurve3dH.create(pointABC));
        result.push(BSplineCurve_1.BSplineCurve3d.createUniformKnots(pointABC, 3));
        result.push(BSplineCurve3dH_1.BSplineCurve3dH.createUniformKnots(pointABC, 3));
        result.push(Loop_1.Loop.create(LineString3d_1.LineString3d.create(pointABCDA)));
        result.push(Path_1.Path.create(LineString3d_1.LineString3d.create(pointABCD)));
        result.push(this.createConeBsplineSurface(pointA, pointC, 1, 2, 4));
        result.push(this.createXYGridBsplineSurface(8, 4, 4, 3));
        this.appendGeometry(this.createClosedSolidSampler(true), result);
        result.push(this.createTriangularUnitGridPolyface(pointA, Point3dVector3d_1.Vector3d.unitX(), Point3dVector3d_1.Vector3d.unitY(), 4, 5));
        this.appendGeometry(this.createSimpleParityRegions(), result);
        this.appendGeometry(this.createSimpleUnions(), result);
        this.appendGeometry(this.createBagOfCurves(), result);
        return result;
    }
}
exports.Sample = Sample;
/** Array with assorted Point2d samples */
Sample.point2d = [
    Point2dVector2d_1.Point2d.create(0, 0),
    Point2dVector2d_1.Point2d.create(1, 0),
    Point2dVector2d_1.Point2d.create(0, 1),
    Point2dVector2d_1.Point2d.create(2, 3)
];
/** Array with assorted Point3d samples */
Sample.point3d = [
    Point3dVector3d_1.Point3d.create(0, 0, 0),
    Point3dVector3d_1.Point3d.create(1, 0, 0),
    Point3dVector3d_1.Point3d.create(0, 1, 0),
    Point3dVector3d_1.Point3d.create(0, 1, 0),
    Point3dVector3d_1.Point3d.create(0, 0, 1),
    Point3dVector3d_1.Point3d.create(2, 3, 0),
    Point3dVector3d_1.Point3d.create(0, 2, 5),
    Point3dVector3d_1.Point3d.create(-3, 0, 5),
    Point3dVector3d_1.Point3d.create(4, 3, -2)
];
/** Array with assorted Point4d samples */
Sample.point4d = [
    Point4d_1.Point4d.create(0, 0, 0, 1),
    Point4d_1.Point4d.create(1, 0, 0, 1),
    Point4d_1.Point4d.create(0, 1, 0, 1),
    Point4d_1.Point4d.create(0, 1, 0, 1),
    Point4d_1.Point4d.create(0, 0, 1, 1),
    Point4d_1.Point4d.create(2, 3, 0, 1),
    Point4d_1.Point4d.create(0, 2, 5, 1),
    Point4d_1.Point4d.create(-3, 0, 5, 1),
    Point4d_1.Point4d.create(-3, 0, 5, 0.3),
    Point4d_1.Point4d.create(-3, 0, 5, -0.2),
    Point4d_1.Point4d.create(4, 3, -2, 1)
];
/** Array with assorted nonzero Vector2d samples */
Sample.vector2d = [
    Point2dVector2d_1.Vector2d.create(1, 0),
    Point2dVector2d_1.Vector2d.create(0, 1),
    Point2dVector2d_1.Vector2d.create(0, 0),
    Point2dVector2d_1.Vector2d.create(-1, 0),
    Point2dVector2d_1.Vector2d.create(0, -1),
    Point2dVector2d_1.Vector2d.create(0, 0),
    Point2dVector2d_1.Vector2d.createPolar(1.0, Angle_1.Angle.createDegrees(20)),
    Point2dVector2d_1.Vector2d.createPolar(2.0, Angle_1.Angle.createDegrees(20)),
    Point2dVector2d_1.Vector2d.create(2, 3)
];
/** Assorted Plane3dBYOriginAndUnitNormal */
Sample.plane3dByOriginAndUnitNormal = [
    Plane3dByOriginAndUnitNormal_1.Plane3dByOriginAndUnitNormal.createXYPlane(),
    Plane3dByOriginAndUnitNormal_1.Plane3dByOriginAndUnitNormal.createYZPlane(),
    Plane3dByOriginAndUnitNormal_1.Plane3dByOriginAndUnitNormal.createZXPlane(),
    Sample.createPlane(0, 0, 0, 3, 0, 1),
    Sample.createPlane(1, 2, 3, 2, 4, -1)
];
/** Assorted Ray3d, not all unit direction vectors. */
Sample.ray3d = [
    Sample.createRay(0, 0, 0, 1, 0, 0),
    Sample.createRay(0, 0, 0, 0, 1, 0),
    Sample.createRay(0, 0, 0, 0, 0, 1),
    Sample.createRay(0, 0, 0, 1, 2, 0),
    Sample.createRay(1, 2, 3, 4, 2, -1)
];
/** Assorted angles.  All principal directions, some others included. */
Sample.angle = [
    Angle_1.Angle.createDegrees(0),
    Angle_1.Angle.createDegrees(90),
    Angle_1.Angle.createDegrees(180),
    Angle_1.Angle.createDegrees(-90),
    Angle_1.Angle.createDegrees(30),
    Angle_1.Angle.createDegrees(-105)
];
/** Assorted angle sweeps */
Sample.angleSweep = [
    AngleSweep_1.AngleSweep.createStartEndDegrees(0, 90),
    AngleSweep_1.AngleSweep.createStartEndDegrees(0, 180),
    AngleSweep_1.AngleSweep.createStartEndDegrees(-90, 0),
    AngleSweep_1.AngleSweep.createStartEndDegrees(0, -90),
    AngleSweep_1.AngleSweep.createStartEndDegrees(0, 30),
    AngleSweep_1.AngleSweep.createStartEndDegrees(45, 110)
];
/** assorted line segments */
Sample.lineSegment3d = [
    LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(1, 0, 0)),
    LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(0, 1, 0)),
    LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(0, 0, 0), Point3dVector3d_1.Point3d.create(0, 0, 1)),
    LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.create(1, 2, 3), Point3dVector3d_1.Point3d.create(-2, -3, 0.5))
];
/** Assorted Range1d:   single point, null, simple forward, simple reverse */
Sample.range1d = [
    Range_1.Range1d.createX(1),
    Range_1.Range1d.createNull(),
    Range_1.Range1d.createXX(1, 2),
    Range_1.Range1d.createXX(2, 1)
];
/** Assorted range2d: single point, null, 2 point with various creation orders. */
Sample.range2d = [
    Range_1.Range2d.createXY(1, 2),
    Range_1.Range2d.createNull(),
    Range_1.Range2d.createXYXY(1, 2, 0, 3),
    Range_1.Range2d.createXYXY(1, 2, 3, 4)
];
/** Assorted range2d: single point, null, 2 point with various creation orders. */
Sample.range3d = [
    Range_1.Range3d.createXYZ(1, 2, 3),
    Range_1.Range3d.createNull(),
    Range_1.Range3d.createXYZXYZ(1, 2, 0, 3, 4, 7),
    Range_1.Range3d.createXYZXYZ(1, 2, 3, -2, -4, -1)
];
//# sourceMappingURL=GeometrySamples.js.map