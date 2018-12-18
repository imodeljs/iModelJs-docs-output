/** @module ArraysAndInterfaces */
import { CurvePrimitive } from "../curve/CurvePrimitive";
import { CoordinateXYZ } from "../curve/CoordinateXYZ";
import { UnionRegion } from "../curve/UnionRegion";
import { BagOfCurves, CurveCollection } from "../curve/CurveCollection";
import { ParityRegion } from "../curve/ParityRegion";
import { Loop } from "../curve/Loop";
import { Path } from "../curve/Path";
import { Point3d, Vector3d } from "./Point3dVector3d";
import { BSplineCurve3d } from "../bspline/BSplineCurve";
import { BSplineCurve3dH } from "../bspline/BSplineCurve3dH";
import { BezierCurve3d } from "../bspline/BezierCurve3d";
import { BezierCurve3dH } from "../bspline/BezierCurve3dH";
import { BSplineSurface3d, BSplineSurface3dH } from "../bspline/BSplineSurface";
import { IndexedPolyface } from "../polyface/Polyface";
import { Sphere } from "../solid/Sphere";
import { Cone } from "../solid/Cone";
import { Box } from "../solid/Box";
import { TorusPipe } from "../solid/TorusPipe";
import { LinearSweep } from "../solid/LinearSweep";
import { RotationalSweep } from "../solid/RotationalSweep";
import { RuledSweep } from "../solid/RuledSweep";
import { TransitionSpiral3d } from "../curve/TransitionSpiral";
import { LineSegment3d } from "../curve/LineSegment3d";
import { Arc3d } from "../curve/Arc3d";
import { LineString3d } from "../curve/LineString3d";
import { PointString3d } from "../curve/PointString3d";
import { Plane3dByOriginAndVectors } from "./Plane3dByOriginAndVectors";
import { BezierCurveBase } from "../bspline/BezierCurveBase";
export declare abstract class GeometryHandler {
    abstract handleLineSegment3d(g: LineSegment3d): any;
    abstract handleLineString3d(g: LineString3d): any;
    abstract handleArc3d(g: Arc3d): any;
    handleCurveCollection(_g: CurveCollection): any;
    abstract handleBSplineCurve3d(g: BSplineCurve3d): any;
    abstract handleBSplineCurve3dH(g: BSplineCurve3dH): any;
    abstract handleBSplineSurface3d(g: BSplineSurface3d): any;
    abstract handleCoordinateXYZ(g: CoordinateXYZ): any;
    abstract handleBSplineSurface3dH(g: BSplineSurface3dH): any;
    abstract handleIndexedPolyface(g: IndexedPolyface): any;
    abstract handleTransitionSpiral(g: TransitionSpiral3d): any;
    handlePath(g: Path): any;
    handleLoop(g: Loop): any;
    handleParityRegion(g: ParityRegion): any;
    handleUnionRegion(g: UnionRegion): any;
    handleBagOfCurves(g: BagOfCurves): any;
    abstract handleSphere(g: Sphere): any;
    abstract handleCone(g: Cone): any;
    abstract handleBox(g: Box): any;
    abstract handleTorusPipe(g: TorusPipe): any;
    abstract handleLinearSweep(g: LinearSweep): any;
    abstract handleRotationalSweep(g: RotationalSweep): any;
    abstract handleRuledSweep(g: RuledSweep): any;
    abstract handlePointString3d(g: PointString3d): any;
    abstract handleBezierCurve3d(g: BezierCurve3d): any;
    abstract handleBezierCurve3dH(g: BezierCurve3dH): any;
}
/**
 * `NullGeometryHandler` is a base class for dispatching various geometry types to
 * appliation specific implementation of some service.
 *
 * To use:
 * * Derive a class from `NullGeometryHandler`
 * * Reimplement any or all of the specific `handleXXXX` methods
 * * Create a handler instance `myHandler`
 * * To send a `GeometryQuery` object `candidateGeometry` through the (fast) dispatch, invoke   `candidateGeometry.dispatchToHandler (myHandler)
 * * The appropriate method or methods will get called with a strongly typed `_g ` value.
 */
export declare class NullGeometryHandler extends GeometryHandler {
    handleLineSegment3d(_g: LineSegment3d): any;
    handleLineString3d(_g: LineString3d): any;
    handleArc3d(_g: Arc3d): any;
    handleCurveCollection(_g: CurveCollection): any;
    handleBSplineCurve3d(_g: BSplineCurve3d): any;
    handleBSplineCurve3dH(_g: BSplineCurve3dH): any;
    handleBSplineSurface3d(_g: BSplineSurface3d): any;
    handleCoordinateXYZ(_g: CoordinateXYZ): any;
    handleBSplineSurface3dH(_g: BSplineSurface3dH): any;
    handleIndexedPolyface(_g: IndexedPolyface): any;
    handleTransitionSpiral(_g: TransitionSpiral3d): any;
    handlePath(_g: Path): any;
    handleLoop(_g: Loop): any;
    handleParityRegion(_g: ParityRegion): any;
    handleUnionRegion(_g: UnionRegion): any;
    handleBagOfCurves(_g: BagOfCurves): any;
    handleSphere(_g: Sphere): any;
    handleCone(_g: Cone): any;
    handleBox(_g: Box): any;
    handleTorusPipe(_g: TorusPipe): any;
    handleLinearSweep(_g: LinearSweep): any;
    handleRotationalSweep(_g: RotationalSweep): any;
    handleRuledSweep(_g: RuledSweep): any;
    handlePointString3d(_g: PointString3d): any;
    handleBezierCurve3d(_g: BezierCurve3d): any;
    handleBezierCurve3dH(_g: BezierCurve3dH): any;
}
/** IStrokeHandler is an interface with methods to receive data about curves being stroked.
 * CurvePrimitives emitStrokes () methods emit calls to a handler object with these methods.
 * The various CurvePrimitive types are free to announce either single points (announcePoint), linear fragments,
 * or fractional intervals of the parent curve.
 *
 * * handler.startCurvePrimitive (cp) -- announce the curve primitive whose strokes will follow.
 * * announcePointTangent (xyz, fraction, tangent) -- annunce a single point on the curve.
 * * announceIntervalForUniformStepStrokes (cp, numStrokes, fraction0, fraction1) -- announce a fraction
 * interval in which the curve can be evaluated (e.g. the handler can call cp->fractionToPointAndDerivative ())
 * * announceSegmentInterval (cp, point0, point1, numStrokes, fraction0, fraction1) -- announce
 *    that the fractional interval fraction0, fraction1 is a straight line which should be broken into
 *    numStrokes strokes.
 *
 * ** A LineSegment would make a single call to this.
 * ** A LineString would make one call to this for each of its segments, with fractions indicating position
 * within the linestring.
 * * endCurvePrimitive (cp) -- announce the end of the curve primitive.
 *
 */
export interface IStrokeHandler {
    /** announce a parent curve primitive
     * * startParentCurvePrimitive() ...endParentCurvePrimitive() are wrapped around startCurvePrimitive and endCurvePrimitive when the interior primitive is a proxy.
     */
    startParentCurvePrimitive(cp: CurvePrimitive): void;
    startCurvePrimitive(cp: CurvePrimitive): void;
    announcePointTangent(xyz: Point3d, fraction: number, tangent: Vector3d): void;
    /** Announce that curve primitive cp should be evaluated in the specified fraction interval. */
    announceIntervalForUniformStepStrokes(cp: CurvePrimitive, numStrokes: number, fraction0: number, fraction1: number): void;
    /** Announce numPoints interpolated between point0 and point1, with associated fractions */
    announceSegmentInterval(cp: CurvePrimitive, point0: Point3d, point1: Point3d, numStrokes: number, fraction0: number, fraction1: number): void;
    endCurvePrimitive(cp: CurvePrimitive): void;
    endParentCurvePrimitive(cp: CurvePrimitive): void;
    /**
     * Announce a bezier curve fragment.
     * * this is usually a section of BsplineCurve
     * * If this function is missing, the same interval will be passed to announceIntervalForUniformSteps.
     * @param bezier bezier fragment
     * @param numStrokes suggested number of strokes (uniform in bezier interval 0..1)
     * @param parent parent curve
     * @param spanIndex spanIndex within parent
     * @param fraction0 start fraction on parent curve
     * @param fraction1 end fraction on parent curve
     */
    announceBezierCurve?(bezier: BezierCurveBase, numStrokes: number, parent: CurvePrimitive, spandex: number, fraction0: number, fraction1: number): void;
}
/**
 * Interface with methods for mapping (u,v) fractional coordinates to surface xyz and derivatives.
 */
export interface UVSurface {
    /**
     * Convert fractional u and v coordinates to surface point
     * @param uFraction fractional coordinate in u direction
     * @param vFraction fractional coordinate in the v direction
     * @param result optional pre-allocated point
     */
    UVFractionToPoint(uFraction: number, vFraction: number, result?: Point3d): Point3d;
    /**
     * Convert fractional u and v coordinates to surface point and partial derivatives
     * @param uFraction fractional coordinate in u direction
     * @param vFraction fractional coordinate in the v direction
     * @param result optional pre-allocated carrier for point and vectors
     */
    UVFractionToPointAndTangents(uFraction: number, vFraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
}
//# sourceMappingURL=GeometryHandler.d.ts.map