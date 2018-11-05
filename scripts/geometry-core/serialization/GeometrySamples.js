"use strict";
/** @module Serialization */
Object.defineProperty(exports, "__esModule", { value: true });
const Geometry_1 = require("../Geometry");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const PointVector_1 = require("../PointVector");
const Transform_1 = require("../Transform");
const Range_1 = require("../Range");
const Geometry4d_1 = require("../numerics/Geometry4d");
const CurveChain_1 = require("../curve/CurveChain");
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
const GrowableArray_1 = require("../GrowableArray");
const UnionOfConvexClipPlaneSets_1 = require("../clipping/UnionOfConvexClipPlaneSets");
const BSplineCurve3dH_1 = require("../bspline/BSplineCurve3dH");
/* tslint:disable:no-console */
/** Access the last point in the array. push another shifted by dx,dy,dz */
function pushMove(data, dx, dy, dz = 0.0) {
    if (data.length > 0) {
        const back = data[data.length - 1];
        data.push(PointVector_1.Point3d.create(back.x + dx, back.y + dy, back.z + dz));
    }
}
class Sample {
    /** Return an array of Point3d, with x,y,z all stepping through a range of values.
     * x varies fastest, then y then z
     */
    static createPoint3dLattice(low, step, high) {
        const points = [];
        for (let z = low; z <= high; z += step)
            for (let y = low; y <= high; y += step)
                for (let x = low; x <= high; x += step)
                    points.push(PointVector_1.Point3d.create(x, y, z));
        return points;
    }
    /** Return an array of Point2d, with x,y all stepping through a range of values.
     * x varies fastest, then y
     */
    static createPoint2dLattice(low, step, high) {
        const points = [];
        for (let y = low; y <= high; y += step)
            for (let x = low; x <= high; x += step)
                points.push(PointVector_1.Point2d.create(x, y));
        return points;
    }
    static createNonZeroVectors() {
        return [
            PointVector_1.Vector3d.create(1, 0, 0),
            PointVector_1.Vector3d.create(0, 1, 0),
            PointVector_1.Vector3d.create(0, 0, 1),
            PointVector_1.Vector3d.create(-1, 0, 0),
            PointVector_1.Vector3d.create(0, -1, 0),
            PointVector_1.Vector3d.create(0, 0, -1),
            PointVector_1.Vector3d.createPolar(1.0, Geometry_1.Angle.createDegrees(20)),
            PointVector_1.Vector3d.createSpherical(1.0, Geometry_1.Angle.createDegrees(20), Geometry_1.Angle.createDegrees(10)),
            PointVector_1.Vector3d.createPolar(2.0, Geometry_1.Angle.createDegrees(20)),
            PointVector_1.Vector3d.createSpherical(2.0, Geometry_1.Angle.createDegrees(20), Geometry_1.Angle.createDegrees(10)),
            PointVector_1.Vector3d.create(2, 3, 0)
        ];
    }
    static createRange3ds() {
        return [
            Range_1.Range3d.createXYZXYZ(0, 0, 0, 1, 1, 1),
            Range_1.Range3d.createXYZ(1, 2, 3),
            Range_1.Range3d.createXYZXYZ(-2, -3, 1, 200, 301, 8)
        ];
    }
    static createRectangleXY(x0, y0, ax, ay, z = 0) {
        return [
            PointVector_1.Point3d.create(x0, y0, z),
            PointVector_1.Point3d.create(x0 + ax, y0, z),
            PointVector_1.Point3d.create(x0 + ax, y0 + ay, z),
            PointVector_1.Point3d.create(x0, y0 + ay, z),
            PointVector_1.Point3d.create(x0, y0, z),
        ];
    }
    static createUnitCircle(numPoints) {
        const points = [];
        const dTheta = Geometry_1.Geometry.safeDivideFraction(Math.PI * 2, numPoints - 1, 0.0);
        for (let i = 0; i < numPoints; i++) {
            const theta = i * dTheta;
            points.push(PointVector_1.Point3d.create(Math.cos(theta), Math.sin(theta), 0.0));
        }
        return points;
    }
    // Get an "L" shape with lower left at x0,y0.   ax,ay are larger side lengths (outer rectangle, bx,by are smaller box to corner
    static createLShapedPolygon(x0, y0, ax, ay, bx, by, z = 0) {
        return [
            PointVector_1.Point3d.create(x0, y0, z),
            PointVector_1.Point3d.create(x0 + ax, y0, z),
            PointVector_1.Point3d.create(x0 + ax, y0 + by),
            PointVector_1.Point3d.create(x0 + bx, y0 + by),
            PointVector_1.Point3d.create(x0 + bx, y0 + ay, z),
            PointVector_1.Point3d.create(x0, y0 + ay, z),
            PointVector_1.Point3d.create(x0, y0, z),
        ];
    }
    static createClipPlanes() {
        const plane0 = ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.create(1, 0, 0), 2.0);
        const plane1 = plane0.cloneNegated();
        const plane2 = plane1.clone();
        plane2.setFlags(true, true);
        return [
            plane0, plane1, plane2,
            ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.create(3, 4, 0), 2.0),
            ClipPlane_1.ClipPlane.createEdgeXY(PointVector_1.Point3d.create(1, 0, 0), PointVector_1.Point3d.create(24, 32, 0))
        ];
    }
    /**
     * * A first-quadrant unit square
     * * Two squares -- first and fourth quadrant unit squares
     * * Three squares -- first, second and fourtn quarant unit squares
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
    static createBsplineCurves() {
        const result = [];
        const zScale = 0.1;
        for (const order of [2, 3, 4, 5]) {
            const points = [];
            for (const x of [0, 1, 2, 3, 4, 5, 7]) {
                points.push(PointVector_1.Point3d.create(1, x, zScale * (1 + x * x)));
            }
            const curve = BSplineCurve_1.BSplineCurve3d.createUniformKnots(points, order);
            result.push(curve);
        }
        return result;
    }
    static createBspline3dHCurves() {
        const result = [];
        const zScale = 0.1;
        for (const weightVariation of [0, 0.125]) {
            for (const order of [2, 3, 4, 5]) {
                const points = [];
                for (const x of [0, 1, 2, 3, 4, 5, 7]) {
                    points.push(Geometry4d_1.Point4d.create(1, x, zScale * (1 + x * x), 1.0 + weightVariation * Math.sin(x * Math.PI * 0.25)));
                }
                const curve = BSplineCurve3dH_1.BSplineCurve3dH.createUniformKnots(points, order);
                result.push(curve);
            }
        }
        return result;
    }
    // create a plane from origin and normal coordinates -- default to 001 normal if needed.
    static createPlane(x, y, z, u, v, w) {
        const point = PointVector_1.Point3d.create(x, y, z);
        const vector = PointVector_1.Vector3d.create(u, v, w).normalize();
        if (vector) {
            const plane = AnalyticGeometry_1.Plane3dByOriginAndUnitNormal.create(point, vector);
            if (plane)
                return plane;
        }
        return Sample.createPlane(x, y, z, u, v, 1);
    }
    // create a ray with unit direction vector --- no test for 000 vector
    static createRay(x, y, z, u, v, w) {
        return AnalyticGeometry_1.Ray3d.create(PointVector_1.Point3d.create(x, y, z), PointVector_1.Vector3d.create(u, v, w).normalize());
    }
    static createLineStrings() {
        return [
            LineString3d_1.LineString3d.createPoints([
                PointVector_1.Point3d.create(0, 0, 0),
                PointVector_1.Point3d.create(1, 0, 0)
            ]),
            LineString3d_1.LineString3d.createPoints([
                PointVector_1.Point3d.create(0, 0, 0),
                PointVector_1.Point3d.create(1, 0, 0),
                PointVector_1.Point3d.create(1, 1, 0)
            ]),
            LineString3d_1.LineString3d.createPoints([
                PointVector_1.Point3d.create(0, 0, 0),
                PointVector_1.Point3d.create(1, 0, 0),
                PointVector_1.Point3d.create(1, 1, 0),
                PointVector_1.Point3d.create(2, 2, 0)
            ])
        ];
    }
    static createMatrix3dArray() {
        return [
            Transform_1.Matrix3d.createIdentity(),
            Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(1, 0, 0), Geometry_1.Angle.createDegrees(10)),
            Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(1, -2, 5), Geometry_1.Angle.createDegrees(-6.0)),
            Transform_1.Matrix3d.createUniformScale(2.0),
            Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(1, 2, 3), Geometry_1.Angle.createDegrees(49.0)),
            Transform_1.Matrix3d.createScale(1, 1, -1),
            Transform_1.Matrix3d.createScale(2, 3, 4)
        ];
    }
    static createInvertibleTransforms() {
        return [
            Transform_1.Transform.createIdentity(),
            Transform_1.Transform.createTranslationXYZ(1, 2, 0),
            Transform_1.Transform.createTranslationXYZ(1, 2, 3),
            Transform_1.Transform.createFixedPointAndMatrix(PointVector_1.Point3d.create(4, 1, -2), Transform_1.Matrix3d.createUniformScale(2.0)),
            Transform_1.Transform.createFixedPointAndMatrix(PointVector_1.Point3d.create(4, 1, -2), Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(1, 2, 3), Geometry_1.Angle.createRadians(10)))
        ];
    }
    /** Return an array of Matrix3d with various skew and scale.  This includes at least:
     * * identity
     * * 3 disinct diagonals.
     * * The distinct diagonal base with smaller value added to
     *    other 6 spots in succession.
     * * the distinct diagonals with all others also smaller nonzeros.
     */
    static createScaleSkewMatrix3d() {
        return [
            Transform_1.Matrix3d.createRowValues(1, 0, 0, 0, 1, 0, 0, 0, 1),
            Transform_1.Matrix3d.createRowValues(5, 0, 0, 0, 6, 0, 0, 0, 7),
            Transform_1.Matrix3d.createRowValues(5, 2, 0, 0, 6, 0, 0, 0, 7),
            Transform_1.Matrix3d.createRowValues(5, 0, 2, 0, 6, 0, 0, 0, 7),
            Transform_1.Matrix3d.createRowValues(5, 0, 0, 1, 6, 0, 0, 0, 7),
            Transform_1.Matrix3d.createRowValues(5, 0, 0, 0, 6, 1, 0, 0, 7),
            Transform_1.Matrix3d.createRowValues(5, 0, 0, 0, 6, 0, 1, 0, 7),
            Transform_1.Matrix3d.createRowValues(5, 0, 0, 0, 6, 0, 0, 1, 7),
            Transform_1.Matrix3d.createRowValues(5, 2, 3, 2, 6, 1, -1, 2, 7)
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
        const vectorU = PointVector_1.Vector3d.create(2, 3, 6);
        const vectorV = PointVector_1.Vector3d.create(-1, 5, 2);
        const vectorUplusV = vectorU.plus(vectorV);
        const vector0 = PointVector_1.Vector3d.createZero();
        return [
            Transform_1.Matrix3d.createZero(),
            // one nonzero column
            Transform_1.Matrix3d.createColumns(vectorU, vector0, vector0),
            Transform_1.Matrix3d.createColumns(vector0, vectorU, vector0),
            Transform_1.Matrix3d.createColumns(vector0, vector0, vector0),
            // two independent nonzero columns with zero
            Transform_1.Matrix3d.createColumns(vectorU, vectorV, vector0),
            Transform_1.Matrix3d.createColumns(vector0, vectorU, vectorV),
            Transform_1.Matrix3d.createColumns(vectorV, vector0, vector0),
            // third column dependent
            Transform_1.Matrix3d.createColumns(vectorU, vectorV, vectorUplusV),
            Transform_1.Matrix3d.createColumns(vectorU, vectorUplusV, vectorV),
            Transform_1.Matrix3d.createColumns(vectorUplusV, vectorV, vectorU),
            // two independent with duplicate
            Transform_1.Matrix3d.createColumns(vectorU, vectorV, vectorU),
            Transform_1.Matrix3d.createColumns(vectorU, vectorU, vectorV),
            Transform_1.Matrix3d.createColumns(vectorV, vectorV, vectorU)
        ];
    }
    /**
     * Return an array of rigid transforms.  This includes (at least)
     * * Identity
     * * translation with identity matrix
     * * rotation around origin and arbitrary vector
     * * rotation around space point and arbitrary vector
     */
    static createRigidTransforms() {
        return [
            Transform_1.Transform.createIdentity(),
            Transform_1.Transform.createTranslationXYZ(1, 2, 3),
            Transform_1.Transform.createFixedPointAndMatrix(PointVector_1.Point3d.create(0, 0, 0), Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.unitY(), Geometry_1.Angle.createDegrees(10))),
            Transform_1.Transform.createFixedPointAndMatrix(PointVector_1.Point3d.create(4, 1, -2), Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(1, 2, 3), Geometry_1.Angle.createDegrees(10)))
        ];
    }
    /**
     * Return a single rigid transform with all terms nonzero.
     */
    static createMessyRigidTransform() {
        return Transform_1.Transform.createFixedPointAndMatrix(PointVector_1.Point3d.create(1, 2, 3), Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(0.3, -0.2, 1.2), Geometry_1.Angle.createDegrees(15.7)));
    }
    static createRigidAxes() {
        return [
            Transform_1.Matrix3d.createIdentity(),
            Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.unitY(), Geometry_1.Angle.createDegrees(10)),
            Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(1, 2, 3), Geometry_1.Angle.createDegrees(10)),
        ];
    }
    // promote each transform[] to a Matrix4d.
    static createMatrix4ds(includeIrregular = false) {
        const result = [];
        let transform;
        for (transform of Sample.createInvertibleTransforms())
            result.push(Geometry4d_1.Matrix4d.createTransform(transform));
        if (includeIrregular) {
            result.push(Geometry4d_1.Matrix4d.createRowValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
        }
        return result;
    }
    static createMap4ds() {
        const result = [];
        let transform;
        for (transform of Sample.createInvertibleTransforms()) {
            const inverse = transform.inverse();
            if (inverse) {
                const map = Geometry4d_1.Map4d.createTransform(transform, inverse);
                if (map)
                    result.push(map);
            }
        }
        return result;
    }
    static createSimplePaths(withGaps = false) {
        const p1 = [[PointVector_1.Point3d.create(0, 10, 0)], [PointVector_1.Point3d.create(6, 10, 0)], [PointVector_1.Point3d.create(6, 10, 1), [PointVector_1.Point3d.create(0, 10, 0)]]];
        const point0 = PointVector_1.Point3d.create(0, 0, 0);
        const point1 = PointVector_1.Point3d.create(10, 0, 0);
        const segment1 = LineSegment3d_1.LineSegment3d.create(point0, point1);
        const vectorU = PointVector_1.Vector3d.unitX(3);
        const vectorV = PointVector_1.Vector3d.unitY(3);
        const arc2 = Arc3d_1.Arc3d.create(point1.minus(vectorU), vectorU, vectorV, Geometry_1.AngleSweep.createStartEndDegrees(0, 90));
        const simplePaths = [
            CurveChain_1.Path.create(segment1),
            CurveChain_1.Path.create(segment1, arc2),
            CurveChain_1.Path.create(LineSegment3d_1.LineSegment3d.create(point0, point1), LineString3d_1.LineString3d.create(PointVector_1.Point3d.create(10, 0, 0), PointVector_1.Point3d.create(10, 5, 0)), LineString3d_1.LineString3d.create(p1)),
            Sample.createCappedArcPath(4, 0, 180),
        ];
        if (withGaps)
            simplePaths.push(CurveChain_1.Path.create(LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(10, 0, 0)), LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(10, 10, 0), PointVector_1.Point3d.create(5, 0, 0))));
        return simplePaths;
    }
    static createSimplePointStrings() {
        const p1 = [[PointVector_1.Point3d.create(0, 10, 0)], [PointVector_1.Point3d.create(6, 10, 0)], [PointVector_1.Point3d.create(6, 10, 0), [PointVector_1.Point3d.create(6, 10, 0)]]];
        const simplePaths = [
            PointString3d_1.PointString3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(10, 0, 0)),
            PointString3d_1.PointString3d.create(PointVector_1.Point3d.create(10, 0, 0), PointVector_1.Point3d.create(10, 5, 0)),
            PointString3d_1.PointString3d.create(p1)
        ];
        return simplePaths;
    }
    static createSimpleLoops() {
        const point0 = PointVector_1.Point3d.create(0, 0, 0);
        const point1 = PointVector_1.Point3d.create(10, 0, 0);
        const point2 = PointVector_1.Point3d.create(10, 5, 0);
        const point3 = PointVector_1.Point3d.create(0, 5, 0);
        const result = [
            // rectangle with single linestring
            CurveChain_1.Loop.create(LineString3d_1.LineString3d.create(point0, point1, point2, point3, point0)),
            // unit circle
            CurveChain_1.Loop.create(Arc3d_1.Arc3d.createUnitCircle()),
            // rectangle, but with individual line segments
            CurveChain_1.Loop.create(LineSegment3d_1.LineSegment3d.create(point0, point1), LineSegment3d_1.LineSegment3d.create(point1, point2), LineSegment3d_1.LineSegment3d.create(point2, point3), LineSegment3d_1.LineSegment3d.create(point3, point0)),
            // Semicircle
            Sample.createCappedArcLoop(4, -90, 90),
        ];
        return result;
    }
    /**
     *
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
            pushMove(result, dx0, 0);
            pushMove(result, 0, dy);
            pushMove(result, dx1, 0);
            pushMove(result, 0, -dy);
        }
        pushMove(result, dx0, 0);
        if (dyReturn !== 0.0) {
            pushMove(result, 0, dyReturn);
            result.push(PointVector_1.Point3d.create(0, dyReturn));
            result.push(result[0].clone());
        }
        return result;
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
    static createSimpleXYPointLoops() {
        const result = [];
        result.push(Sample.createRectangleXY(0, 0, 1, 1));
        result.push(Sample.createRectangleXY(0, 0, 4, 3));
        result.push(Sample.createLShapedPolygon(0, 0, 5, 4, 1, 2));
        return result;
    }
    static createSimpleParityRegions() {
        const pointC = PointVector_1.Point3d.create(-5, 0, 0);
        const point0 = PointVector_1.Point3d.create(0, 0, 0);
        const point1 = PointVector_1.Point3d.create(1, 2, 0);
        const point2 = PointVector_1.Point3d.create(6, 4, 0);
        const ax = 10.0;
        const ay = 8.0;
        const bx = 3.0;
        const by = 2.0;
        const r2 = 0.5;
        const result = [
            CurveChain_1.ParityRegion.create(CurveChain_1.Loop.create(Arc3d_1.Arc3d.createXY(pointC, 2.0)), CurveChain_1.Loop.create(Arc3d_1.Arc3d.createXY(pointC, 1.0))),
            CurveChain_1.ParityRegion.create(CurveChain_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point0, ax, ay)), CurveChain_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point1, bx, by))),
            CurveChain_1.ParityRegion.create(CurveChain_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point0, ax, ay)), CurveChain_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(point1, bx, by)), CurveChain_1.Loop.create(Arc3d_1.Arc3d.createXY(point2, r2))),
        ];
        return result;
    }
    static createSimpleUnions() {
        const parityRegions = Sample.createSimpleParityRegions();
        const loops = Sample.createSimpleLoops();
        const result = [
            CurveChain_1.UnionRegion.create(loops[0], parityRegions[0]),
        ];
        return result;
    }
    static createBagOfCurves() {
        const parityRegions = Sample.createSimpleParityRegions();
        const loops = Sample.createSimpleLoops();
        const result = [
            CurveChain_1.BagOfCurves.create(loops[0], parityRegions[0], LineSegment3d_1.LineSegment3d.createXYXY(0, 1, 4, 2, 1)),
            // a bag with just an arc
            CurveChain_1.BagOfCurves.create(Arc3d_1.Arc3d.createUnitCircle()),
            // a bag with just a line segment
            CurveChain_1.BagOfCurves.create(LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(1, 1, 0))),
            // a bag with just a linestring
            CurveChain_1.BagOfCurves.create(LineString3d_1.LineString3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(1, 1, 0), PointVector_1.Point3d.create(2, 1, 0))),
        ];
        return result;
    }
    static createSmoothCurvePrimitives(size = 1.0) {
        const alpha = 0.1;
        const beta = 0.3;
        return [
            LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(size, 0, 0)),
            LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(size, size, 0)),
            Arc3d_1.Arc3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Vector3d.create(size, 0, 0), PointVector_1.Vector3d.create(0, size, 0), Geometry_1.AngleSweep.createStartEndDegrees(0, 90)),
            Arc3d_1.Arc3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Vector3d.create(size, 0, 0), PointVector_1.Vector3d.create(0, size, 0), Geometry_1.AngleSweep.createStartEndDegrees(-40, 270)),
            Arc3d_1.Arc3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Vector3d.create(size, alpha * size, 0), PointVector_1.Vector3d.create(-alpha * beta * size, beta * size, 0), Geometry_1.AngleSweep.createStartEndDegrees(-40, 270)),
        ];
    }
    static createSimpleIndexedPolyfaces(gridMultiplier) {
        return [
            Sample.createTriangularUnitGridPolyface(PointVector_1.Point3d.create(), PointVector_1.Vector3d.unitX(), PointVector_1.Vector3d.unitY(), gridMultiplier * 3, 2 * gridMultiplier, false, false, false),
            Sample.createTriangularUnitGridPolyface(PointVector_1.Point3d.create(), PointVector_1.Vector3d.unitX(), PointVector_1.Vector3d.unitY(), 3 * gridMultiplier, 2 * gridMultiplier, true, false, false),
            Sample.createTriangularUnitGridPolyface(PointVector_1.Point3d.create(), PointVector_1.Vector3d.unitX(), PointVector_1.Vector3d.unitY(), 3 * gridMultiplier, 2 * gridMultiplier, false, true, false),
            Sample.createTriangularUnitGridPolyface(PointVector_1.Point3d.create(), PointVector_1.Vector3d.unitX(), PointVector_1.Vector3d.unitY(), 3 * gridMultiplier, 2 * gridMultiplier, false, false, true),
            Sample.createTriangularUnitGridPolyface(PointVector_1.Point3d.create(), PointVector_1.Vector3d.unitX(), PointVector_1.Vector3d.unitY(), 3 * gridMultiplier, 2 * gridMultiplier, true, true, true),
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
        // Push to point array
        for (let j = 0; j < numYVertices; j++) {
            for (let i = 0; i < numXVertices; i++) {
                mesh.addPoint(origin.plus2Scaled(vectorX, i, vectorY, j));
                if (createParams)
                    mesh.addParamXY(i, j);
            }
        }
        let color = 10; // arbitrrily start at color 10 so colorIndex is different from color.
        // Push elements to index array (vertices are calculated using i and j positioning for each point)
        let thisColorIndex = 0;
        for (let j = 0; j + 1 < numYVertices; j++) {
            for (let i = 0; i + 1 < numXVertices; i++) {
                const vertex00 = numYVertices * j + i;
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
    static createXYGrid(numU, numV, dX = 1.0, dY = 1.0) {
        const points = [];
        for (let j = 0; j < numV; j++) {
            for (let i = 0; i < numU; i++) {
                points.push(PointVector_1.Point3d.create(i * dX, j * dY, 0));
            }
        }
        return points;
    }
    static createXYGridBsplineSurface(numU, numV, orderU, orderV) {
        return BSplineSurface_1.BSplineSurface3d.create(Sample.createXYGrid(numU, numV, 1.0, 1.0), numU, orderU, undefined, numV, orderV, undefined);
    }
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
    static createSimpleLinearSweeps() {
        const result = [];
        const base = CurveChain_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(PointVector_1.Point3d.create(), 2, 3));
        const vectorZ = PointVector_1.Vector3d.create(0, 0, 1.234);
        const vectorQ = PointVector_1.Vector3d.create(0.1, 0.21, 1.234);
        result.push(LinearSweep_1.LinearSweep.create(base, vectorZ, false));
        result.push(LinearSweep_1.LinearSweep.create(base, vectorZ, true));
        result.push(LinearSweep_1.LinearSweep.create(base, vectorQ, false));
        result.push(LinearSweep_1.LinearSweep.create(base, vectorQ, true));
        result.push(LinearSweep_1.LinearSweep.create(Sample.createCappedArcLoop(5, -45, 90), vectorQ, true));
        for (const curve of Sample.createSmoothCurvePrimitives()) {
            const path = CurveChain_1.Path.create(curve);
            result.push(LinearSweep_1.LinearSweep.create(path, vectorZ, false));
        }
        // coordinates for a clearly unclosed linestring ....
        const xyPoints = [
            PointVector_1.Point2d.create(0, 0),
            PointVector_1.Point2d.create(1, 0),
            PointVector_1.Point2d.create(1, 1)
        ];
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, false));
        // this forces artificial closure point . . .
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, true));
        // add a not-quite-exact closure point ...
        const e = 1.0e-11;
        xyPoints.push(PointVector_1.Point2d.create(e, e));
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, false));
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, true));
        xyPoints.pop();
        xyPoints.push(xyPoints[0]);
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, false));
        result.push(LinearSweep_1.LinearSweep.createZSweep(xyPoints, 1, 3, true));
        return result;
    }
    /**
     * Create an array of primitives with an arc centerd at origin and a line segment closing back to the arc start.
     * This can be bundled into Path or Loop by caller.
     */
    static createCappedArcPrimitives(radius, startDegrees, endDegrees) {
        const arc = Arc3d_1.Arc3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Vector3d.unitX(radius), PointVector_1.Vector3d.unitY(radius), Geometry_1.AngleSweep.createStartEndDegrees(startDegrees, endDegrees));
        return [arc, LineSegment3d_1.LineSegment3d.create(arc.fractionToPoint(0.0), arc.fractionToPoint(1.0))];
    }
    /** Return a Path structure for a segment of arc, with closure segment */
    static createCappedArcPath(radius, startDegrees, endDegrees) {
        return CurveChain_1.Path.createArray(Sample.createCappedArcPrimitives(radius, startDegrees, endDegrees));
    }
    /** Return a Loop structure for a segment of arc, with closure segment */
    static createCappedArcLoop(radius, startDegrees, endDegrees) {
        return CurveChain_1.Loop.createArray(Sample.createCappedArcPrimitives(radius, startDegrees, endDegrees));
    }
    static createSimpleRotationalSweeps() {
        const result = [];
        // rectangle in xy plane
        const base = CurveChain_1.Loop.create(LineString3d_1.LineString3d.createRectangleXY(PointVector_1.Point3d.create(1, 0, 0), 2, 3));
        // rotate around the y axis
        const axis = AnalyticGeometry_1.Ray3d.createXYZUVW(0, 0, 0, 0, 1, 0);
        result.push(RotationalSweep_1.RotationalSweep.create(base, axis, Geometry_1.Angle.createDegrees(120.0), false));
        result.push(RotationalSweep_1.RotationalSweep.create(base, axis, Geometry_1.Angle.createDegrees(150.0), true));
        return result;
    }
    static createSpheres() {
        const result = [];
        result.push(Sphere_1.Sphere.createCenterRadius(PointVector_1.Point3d.create(0, 0, 0), 1.0));
        result.push(Sphere_1.Sphere.createCenterRadius(PointVector_1.Point3d.create(1, 2, 3), 3.0));
        const s1 = Sphere_1.Sphere.createCenterRadius(PointVector_1.Point3d.create(1, 2, 3), 2.0, Geometry_1.AngleSweep.createStartEndDegrees(-45, 80));
        s1.capped = true;
        result.push(s1);
        // still a sphere, but with axes KIJ . .
        const s2 = Sphere_1.Sphere.createFromAxesAndScales(PointVector_1.Point3d.create(1, 2, 3), Transform_1.Matrix3d.createRowValues(0, 1, 0, 0, 0, 1, 1, 0, 0), 4, 4, 4, Geometry_1.AngleSweep.createStartEndDegrees(-45, 45), true);
        result.push(s2);
        return result;
    }
    // These are promised to be non-spherical than DGN sphere accepts . . .
    static createEllipsoids() {
        return [
            Sphere_1.Sphere.createEllipsoid(Transform_1.Transform.createOriginAndMatrix(PointVector_1.Point3d.create(0, 0, 0), Transform_1.Matrix3d.createRowValues(4, 1, 1, 1, 4, 1, 0.5, 0.2, 5)), Geometry_1.AngleSweep.createFullLatitude(), true)
        ];
    }
    static createCones() {
        const result = [];
        const origin = PointVector_1.Point3d.create(0, 0, 0);
        const topZ = PointVector_1.Point3d.create(0, 0, 5);
        const centerA = PointVector_1.Point3d.create(1, 2, 1);
        const centerB = PointVector_1.Point3d.create(2, 3, 8);
        result.push(Cone_1.Cone.createAxisPoints(centerA, centerB, 0.5, 0.5, false));
        result.push(Cone_1.Cone.createAxisPoints(origin, topZ, 1.0, 0.2, true));
        result.push(Cone_1.Cone.createAxisPoints(centerA, centerB, 0.2, 0.5, false));
        result.push(Cone_1.Cone.createAxisPoints(origin, centerB, 1.0, 0.0, false));
        result.push(Cone_1.Cone.createAxisPoints(topZ, origin, 0.0, 1.0, true));
        return result;
    }
    static createTorusPipes() {
        const result = [];
        const center = PointVector_1.Point3d.create(1, 50, 3);
        const frame = Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(1, 2, 3), Geometry_1.Angle.createRadians(10));
        const vectorX = frame.columnX();
        const vectorY = frame.columnY();
        const vectorZ = frame.columnZ();
        result.push(TorusPipe_1.TorusPipe.createInFrame(Transform_1.Transform.createIdentity(), 5.0, 0.8, Geometry_1.Angle.create360(), false));
        result.push(TorusPipe_1.TorusPipe.createDgnTorusPipe(center, vectorX, vectorY, 10, 1, Geometry_1.Angle.createDegrees(180), true));
        result.push(TorusPipe_1.TorusPipe.createDgnTorusPipe(center, vectorY, vectorZ, 10, 1, Geometry_1.Angle.createDegrees(45), true));
        return result;
    }
    static createBoxes() {
        const result = [];
        const cornerA = PointVector_1.Point3d.create(1, 2, 3);
        const aX = 3.0;
        const aY = 2.0;
        const bX = 1.5;
        const bY = 1.0;
        const h = 5.0;
        const frame = Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(0, 0, 1), Geometry_1.Angle.createDegrees(10));
        const vectorX = frame.columnX();
        const vectorY = frame.columnY();
        const cornerB = Transform_1.Matrix3d.XYZPlusMatrixTimesCoordinates(cornerA, frame, 0, 0, h);
        result.push(Box_1.Box.createDgnBox(cornerA, PointVector_1.Vector3d.unitX(), PointVector_1.Vector3d.unitY(), cornerB, aX, aY, aX, aY, true));
        result.push(Box_1.Box.createDgnBox(cornerA, PointVector_1.Vector3d.unitX(), PointVector_1.Vector3d.unitY(), cornerB, aX, aY, bX, bY, true));
        result.push(Box_1.Box.createDgnBox(cornerA, vectorX, vectorY, cornerB, aX, aY, bX, bY, true));
        const frameY = Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.create(0, 1, 0), Geometry_1.Angle.createDegrees(10));
        result.push(Box_1.Box.createDgnBox(cornerA, frameY.columnX(), frameY.columnY(), cornerA.plusScaled(frameY.columnZ(), h), aX, aY, bX, bY, true));
        return result;
    }
    /** create an array of points for a rectangle with corners (x0,y0,z) and (x1,y1,z)
     */
    static createRectangle(x0, y0, x1, y1, z = 0.0, closed = false) {
        const points = [
            PointVector_1.Point3d.create(x0, y0, z),
            PointVector_1.Point3d.create(x1, y0, z),
            PointVector_1.Point3d.create(x1, y1, z),
            PointVector_1.Point3d.create(x0, y1, z),
        ];
        if (closed)
            points.push(PointVector_1.Point3d.create(x0, y0, z));
        return points;
    }
    static createRuledSweeps() {
        const allSweeps = [];
        const contour0 = CurveChain_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 3, 2, 0)));
        const contour1 = CurveChain_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 3, 2.5, 2)));
        const contour2 = CurveChain_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 4, 3.5, 4)));
        const contour3 = CurveChain_1.Loop.create(LineString3d_1.LineString3d.create(this.createRectangleXY(0, 0, 2, 1, 7)));
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
                allSweeps.push(RuledSweep_1.RuledSweep.create([CurveChain_1.Path.create(c), CurveChain_1.Path.create(c1)], false));
            }
        }
        return allSweeps;
    }
    /**
     *
     * @param a0 first entry
     * @param delta step between entries
     * @param n number of entries
     */
    static createGrowableArrayCountedSteps(a0, delta, n) {
        const data = new GrowableArray_1.GrowableFloat64Array(n);
        for (let i = 0; i < n; i++)
            data.push(a0 + i * delta);
        return data;
    }
    /**
     *
     * @param radius first entry
     * @param numEdge number of edges of chorded circle.  Angle step is 2PI/numEdge (whether or not closed)
     * @param closed true to include final point (i.e. return numEdge+1 points)
     */
    static createGrowableArrayCirclePoints(radius, numEdge, closed = false, centerX = 0, centerY = 0, data) {
        if (!data)
            data = new GrowableArray_1.GrowableXYZArray();
        data.ensureCapacity(numEdge + (closed ? 1 : 0));
        const delta = 2.0 * Math.PI / numEdge;
        for (let i = 0; i < numEdge; i++) {
            const radians = i * delta;
            data.push(PointVector_1.Point3d.create(centerX + radius * Math.cos(radians), centerY + radius * Math.sin(radians)));
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
     * @returns Returns an array of recusively generated fractal points
     * @param poles level-0 (coarse) polygon whose edges are to be replaced by recursive fractals
     * @param pattern pattern to map to each edge of poles (and to edges of the recursion)
     * @param numRecursion  number of recursions
     * @param perpendicularFactor factor to apply to perpendicular sizing.
     */
    static createRecursvieFractalPolygon(poles, pattern, numRecursion, perpendicularFactor) {
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
            PointVector_1.Point2d.create(),
            PointVector_1.Point2d.create(0.5, 0.1),
            PointVector_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            PointVector_1.Point3d.create(0, 0, 0),
            PointVector_1.Point3d.create(0.6, 0.1, 0),
            PointVector_1.Point3d.create(1, 0.1, 0),
            PointVector_1.Point3d.create(0.6, 1, 0),
            PointVector_1.Point3d.create(),
        ];
        return Sample.createRecursvieFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    /** Diamond with simple wave fractal */
    static createFractalDiamonConvexPattern(numRecursion, perpendicularFactor) {
        const pattern = [
            PointVector_1.Point2d.create(),
            PointVector_1.Point2d.create(0.3, 0.1),
            PointVector_1.Point2d.create(0.5, 0.15),
            PointVector_1.Point2d.create(0.7, 0.1),
            PointVector_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            PointVector_1.Point3d.create(0, -1, 0),
            PointVector_1.Point3d.create(1, 0, 0),
            PointVector_1.Point3d.create(0, 1, 0),
            PointVector_1.Point3d.create(-1, 0, 0),
            PointVector_1.Point3d.create(0, -1, 0),
        ];
        return Sample.createRecursvieFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    static createFractalSquareReversingPattern(numRecursion, perpendicularFactor) {
        const pattern = [
            PointVector_1.Point2d.create(),
            PointVector_1.Point2d.create(0.25, 0),
            PointVector_1.Point2d.create(0.5, 0.2),
            PointVector_1.Point2d.create(0.75, -0.1),
            PointVector_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            PointVector_1.Point3d.create(),
            PointVector_1.Point3d.create(1, 0, 0),
            PointVector_1.Point3d.create(1, 1, 0),
            PointVector_1.Point3d.create(0, 1, 0),
            PointVector_1.Point3d.create(0, 0, 0),
        ];
        return Sample.createRecursvieFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    static createFractalLReversingPatterh(numRecursion, perpendicularFactor) {
        const pattern = [
            PointVector_1.Point2d.create(),
            PointVector_1.Point2d.create(0.25, 0),
            PointVector_1.Point2d.create(0.5, 0.2),
            PointVector_1.Point2d.create(0.75, -0.1),
            PointVector_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            PointVector_1.Point3d.create(),
            PointVector_1.Point3d.create(1, 0, 0),
            PointVector_1.Point3d.create(1, 1, 0),
            PointVector_1.Point3d.create(2, 2, 0),
            PointVector_1.Point3d.create(2, 3, 0),
            PointVector_1.Point3d.create(0, 3, 0),
            PointVector_1.Point3d.create(),
        ];
        return Sample.createRecursvieFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
    }
    /** Fractal with fewer concavity changes.... */
    static createFractalLMildConcavePatter(numRecursion, perpendicularFactor) {
        const pattern = [
            PointVector_1.Point2d.create(),
            PointVector_1.Point2d.create(0.25, 0.1),
            PointVector_1.Point2d.create(0.5, 0.15),
            PointVector_1.Point2d.create(0.75, 0.1),
            PointVector_1.Point2d.create(1.0, 0.0),
        ];
        const poles = [
            PointVector_1.Point3d.create(),
            PointVector_1.Point3d.create(1, 0, 0),
            PointVector_1.Point3d.create(1, 1, 0),
            PointVector_1.Point3d.create(2, 2, 0),
            PointVector_1.Point3d.create(2, 3, 0),
            PointVector_1.Point3d.create(0, 3, 0),
            PointVector_1.Point3d.create(),
        ];
        return Sample.createRecursvieFractalPolygon(poles, pattern, numRecursion, perpendicularFactor);
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
     *
     * @param numSplitAB number of extra points on edge AB
     * @param numSplitBC number of extra points on edge BC
     * @param numSplitCA number of extra points on edge CA
     * @param wrap true to replicate vertexA at end
     * @param xyzA vertexA
     * @param xyzB vertexB
     * @param xyzC vertexC
     */
    static createTriangleWithSplitEdges(numSplitAB, numSplitBC, numSplitCA, wrap = true, xyzA = PointVector_1.Point3d.create(0, 0, 0), xyzB = PointVector_1.Point3d.create(1, 0, 0), xyzC = PointVector_1.Point3d.create(0, 1, 0)) {
        const result = [xyzA.clone()];
        Sample.appendSplits(result, xyzB, numSplitAB, true);
        Sample.appendSplits(result, xyzC, numSplitBC, true);
        Sample.appendSplits(result, xyzA, numSplitCA, wrap);
        return result;
    }
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
            geometry.push(LineString3d_1.LineString3d.create(PointVector_1.Point3d.create(x0, y0, z), PointVector_1.Point3d.create(x1, y0, z), PointVector_1.Point3d.create(x1, y1, z), PointVector_1.Point3d.create(x0, y1, z), PointVector_1.Point3d.create(x0, y0, z)));
        }
        geometry.push(LineSegment3d_1.LineSegment3d.createXYZXYZ(x0, y0, z0, x0, y0, z1));
        geometry.push(LineSegment3d_1.LineSegment3d.createXYZXYZ(x1, y0, z0, x1, y0, z1));
        geometry.push(LineSegment3d_1.LineSegment3d.createXYZXYZ(x1, y1, z0, x1, y1, z1));
        geometry.push(LineSegment3d_1.LineSegment3d.createXYZXYZ(x0, y1, z0, x0, y1, z1));
        return geometry;
    }
    static createSimpleTransitionSpirals() {
        // 5 spirals exercise the intricate "4 out of 5" input ruls for spirals . ..
        const r1 = 1000.0;
        const r0 = 0.0;
        const averageCurvature = TransitionSpiral_1.TransitionSpiral3d.averageCurvatureR0R1(r0, r1);
        const arcLength = 100.0;
        const dThetaRadians = arcLength * averageCurvature;
        return [
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, r1, Geometry_1.Angle.createDegrees(0), Geometry_1.Angle.createRadians(dThetaRadians), undefined, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, r1, Geometry_1.Angle.createDegrees(0), undefined, arcLength, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, r1, undefined, Geometry_1.Angle.createRadians(dThetaRadians), arcLength, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, undefined, Geometry_1.Angle.createDegrees(0), Geometry_1.Angle.createRadians(dThetaRadians), arcLength, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", undefined, r1, Geometry_1.Angle.createDegrees(0), Geometry_1.Angle.createRadians(dThetaRadians), arcLength, undefined, Transform_1.Transform.createIdentity()),
            TransitionSpiral_1.TransitionSpiral3d.create("clothoid", r0, r1, Geometry_1.Angle.createDegrees(0), Geometry_1.Angle.createRadians(dThetaRadians), undefined, PointVector_1.Segment1d.create(0, 0.5), Transform_1.Transform.createOriginAndMatrix(PointVector_1.Point3d.create(1, 2, 0), Transform_1.Matrix3d.createRotationAroundVector(PointVector_1.Vector3d.unitZ(), Geometry_1.Angle.createDegrees(15)))),
        ];
    }
}
Sample.point2d = [
    PointVector_1.Point2d.create(0, 0),
    PointVector_1.Point2d.create(1, 0),
    PointVector_1.Point2d.create(0, 1),
    PointVector_1.Point2d.create(2, 3)
];
Sample.point3d = [
    PointVector_1.Point3d.create(0, 0, 0),
    PointVector_1.Point3d.create(1, 0, 0),
    PointVector_1.Point3d.create(0, 1, 0),
    PointVector_1.Point3d.create(0, 1, 0),
    PointVector_1.Point3d.create(0, 0, 1),
    PointVector_1.Point3d.create(2, 3, 0),
    PointVector_1.Point3d.create(0, 2, 5),
    PointVector_1.Point3d.create(-3, 0, 5),
    PointVector_1.Point3d.create(4, 3, -2)
];
Sample.point4d = [
    Geometry4d_1.Point4d.create(0, 0, 0, 1),
    Geometry4d_1.Point4d.create(1, 0, 0, 1),
    Geometry4d_1.Point4d.create(0, 1, 0, 1),
    Geometry4d_1.Point4d.create(0, 1, 0, 1),
    Geometry4d_1.Point4d.create(0, 0, 1, 1),
    Geometry4d_1.Point4d.create(2, 3, 0, 1),
    Geometry4d_1.Point4d.create(0, 2, 5, 1),
    Geometry4d_1.Point4d.create(-3, 0, 5, 1),
    Geometry4d_1.Point4d.create(-3, 0, 5, 0.3),
    Geometry4d_1.Point4d.create(-3, 0, 5, -0.2),
    Geometry4d_1.Point4d.create(4, 3, -2, 1)
];
Sample.vector2d = [
    PointVector_1.Vector2d.create(1, 0),
    PointVector_1.Vector2d.create(0, 1),
    PointVector_1.Vector2d.create(0, 0),
    PointVector_1.Vector2d.create(-1, 0),
    PointVector_1.Vector2d.create(0, -1),
    PointVector_1.Vector2d.create(0, 0),
    PointVector_1.Vector2d.createPolar(1.0, Geometry_1.Angle.createDegrees(20)),
    PointVector_1.Vector2d.createPolar(2.0, Geometry_1.Angle.createDegrees(20)),
    PointVector_1.Vector2d.create(2, 3)
];
Sample.plane3dByOriginAndUnitNormal = [
    AnalyticGeometry_1.Plane3dByOriginAndUnitNormal.createXYPlane(),
    AnalyticGeometry_1.Plane3dByOriginAndUnitNormal.createYZPlane(),
    AnalyticGeometry_1.Plane3dByOriginAndUnitNormal.createZXPlane(),
    Sample.createPlane(0, 0, 0, 3, 0, 1),
    Sample.createPlane(1, 2, 3, 2, 4, -1)
];
Sample.ray3d = [
    Sample.createRay(0, 0, 0, 1, 0, 0),
    Sample.createRay(0, 0, 0, 0, 1, 0),
    Sample.createRay(0, 0, 0, 0, 0, 1),
    Sample.createRay(0, 0, 0, 1, 2, 0),
    Sample.createRay(1, 2, 3, 4, 2, -1)
];
Sample.angle = [
    Geometry_1.Angle.createDegrees(0),
    Geometry_1.Angle.createDegrees(90),
    Geometry_1.Angle.createDegrees(180),
    Geometry_1.Angle.createDegrees(-90),
    Geometry_1.Angle.createDegrees(30),
    Geometry_1.Angle.createDegrees(-105)
];
Sample.angleSweep = [
    Geometry_1.AngleSweep.createStartEndDegrees(0, 90),
    Geometry_1.AngleSweep.createStartEndDegrees(0, 180),
    Geometry_1.AngleSweep.createStartEndDegrees(-90, 0),
    Geometry_1.AngleSweep.createStartEndDegrees(0, -90),
    Geometry_1.AngleSweep.createStartEndDegrees(0, 30),
    Geometry_1.AngleSweep.createStartEndDegrees(45, 110)
];
Sample.lineSegment3d = [
    LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(1, 0, 0)),
    LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(0, 1, 0)),
    LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(0, 0, 0), PointVector_1.Point3d.create(0, 0, 1)),
    LineSegment3d_1.LineSegment3d.create(PointVector_1.Point3d.create(1, 2, 3), PointVector_1.Point3d.create(-2, -3, 0.5))
];
Sample.range1d = [
    Range_1.Range1d.createX(1),
    Range_1.Range1d.createNull(),
    Range_1.Range1d.createXX(1, 2),
    Range_1.Range1d.createXX(2, 1)
];
Sample.range2d = [
    Range_1.Range2d.createXY(1, 2),
    Range_1.Range2d.createNull(),
    Range_1.Range2d.createXYXY(1, 2, 0, 3),
    Range_1.Range2d.createXYXY(1, 2, 3, 4)
];
Sample.range3d = [
    Range_1.Range3d.createXYZ(1, 2, 3),
    Range_1.Range3d.createNull(),
    Range_1.Range3d.createXYZXYZ(1, 2, 0, 3, 4, 7),
    Range_1.Range3d.createXYZXYZ(1, 2, 3, -2, -4, -1)
];
exports.Sample = Sample;
//# sourceMappingURL=GeometrySamples.js.map