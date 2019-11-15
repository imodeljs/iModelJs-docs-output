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
import { GeometryQuery } from "../curve/GeometryQuery";
import { Vector2d } from "./Point2dVector2d";
/**
 * * `GeometryHandler` defines the base abstract methods for double-dispatch geometry computation.
 * * User code that wants to handle one or all of the commonly known geometry types implements a handler class.
 * * User code that does not handle all types is most likely to start with `NullGeometryHandler`, which will provide no-action implementations for all types.
 * @public
 */
export declare abstract class GeometryHandler {
    /** handle strongly typed LineSegment3d */
    abstract handleLineSegment3d(g: LineSegment3d): any;
    /** handle strongly typed  LineString3d  */
    abstract handleLineString3d(g: LineString3d): any;
    /** handle strongly typed  Arc3d  */
    abstract handleArc3d(g: Arc3d): any;
    /** handle strongly typed  CurveCollection  */
    handleCurveCollection(_g: CurveCollection): any;
    /** handle strongly typed  BSplineCurve3d  */
    abstract handleBSplineCurve3d(g: BSplineCurve3d): any;
    /** handle strongly typed  BSplineCurve3dH  */
    abstract handleBSplineCurve3dH(g: BSplineCurve3dH): any;
    /** handle strongly typed  BSplineSurface3d  */
    abstract handleBSplineSurface3d(g: BSplineSurface3d): any;
    /** handle strongly typed  CoordinateXYZ  */
    abstract handleCoordinateXYZ(g: CoordinateXYZ): any;
    /** handle strongly typed  BSplineSurface3dH  */
    abstract handleBSplineSurface3dH(g: BSplineSurface3dH): any;
    /** handle strongly typed  IndexedPolyface  */
    abstract handleIndexedPolyface(g: IndexedPolyface): any;
    /** handle strongly typed TransitionSpiral3d
     * @alpha
     */
    abstract handleTransitionSpiral(g: TransitionSpiral3d): any;
    /** handle strongly typed Path (base class method calls handleCurveCollection) */
    handlePath(g: Path): any;
    /** handle strongly typed  Loop (base class method calls handleCurveCollection) */
    handleLoop(g: Loop): any;
    /** handle strongly typed  ParityRegion (base class method calls handleCurveCollection) */
    handleParityRegion(g: ParityRegion): any;
    /** handle strongly typed  UnionRegion (base class method calls handleCurveCollection) */
    handleUnionRegion(g: UnionRegion): any;
    /** handle strongly typed  BagOfCurves (base class method calls handleCurveCollection) */
    handleBagOfCurves(g: BagOfCurves): any;
    /** handle strongly typed  Sphere */
    abstract handleSphere(g: Sphere): any;
    /** handle strongly typed  Cone */
    abstract handleCone(g: Cone): any;
    /** handle strongly typed  Box */
    abstract handleBox(g: Box): any;
    /** handle strongly typed  TorusPipe */
    abstract handleTorusPipe(g: TorusPipe): any;
    /** handle strongly typed  LinearSweep */
    abstract handleLinearSweep(g: LinearSweep): any;
    /** handle strongly typed  RotationalSweep */
    abstract handleRotationalSweep(g: RotationalSweep): any;
    /** handle strongly typed  RuledSweep */
    abstract handleRuledSweep(g: RuledSweep): any;
    /** handle strongly typed  PointString3d */
    abstract handlePointString3d(g: PointString3d): any;
    /** handle strongly typed  BezierCurve3d */
    abstract handleBezierCurve3d(g: BezierCurve3d): any;
    /** handle strongly typed  BezierCurve3dH */
    abstract handleBezierCurve3dH(g: BezierCurve3dH): any;
}
/**
 * `NullGeometryHandler` is a base class for dispatching various geometry types to
 * application specific implementation of some service.
 *
 * To use:
 * * Derive a class from `NullGeometryHandler`
 * * Reimplement any or all of the specific `handleXXXX` methods
 * * Create a handler instance `myHandler`
 * * To send a `GeometryQuery` object `candidateGeometry` through the (fast) dispatch, invoke   `candidateGeometry.dispatchToHandler (myHandler)
 * * The appropriate method or methods will get called with a strongly typed `_g ` value.
 * @public
 */
export declare class NullGeometryHandler extends GeometryHandler {
    /** no-action implementation */
    handleLineSegment3d(_g: LineSegment3d): any;
    /** no-action implementation */
    handleLineString3d(_g: LineString3d): any;
    /** no-action implementation */
    handleArc3d(_g: Arc3d): any;
    /** no-action implementation */
    handleCurveCollection(_g: CurveCollection): any;
    /** no-action implementation */
    handleBSplineCurve3d(_g: BSplineCurve3d): any;
    /** no-action implementation */
    handleBSplineCurve3dH(_g: BSplineCurve3dH): any;
    /** no-action implementation */
    handleBSplineSurface3d(_g: BSplineSurface3d): any;
    /** no-action implementation */
    handleCoordinateXYZ(_g: CoordinateXYZ): any;
    /** no-action implementation */
    handleBSplineSurface3dH(_g: BSplineSurface3dH): any;
    /** no-action implementation */
    handleIndexedPolyface(_g: IndexedPolyface): any;
    /** no-action implementation
     * @alpha
     */
    handleTransitionSpiral(_g: TransitionSpiral3d): any;
    /** no-action implementation */
    handlePath(_g: Path): any;
    /** no-action implementation */
    handleLoop(_g: Loop): any;
    /** no-action implementation */
    handleParityRegion(_g: ParityRegion): any;
    /** no-action implementation */
    handleUnionRegion(_g: UnionRegion): any;
    /** no-action implementation */
    handleBagOfCurves(_g: BagOfCurves): any;
    /** no-action implementation */
    handleSphere(_g: Sphere): any;
    /** no-action implementation */
    handleCone(_g: Cone): any;
    /** no-action implementation */
    handleBox(_g: Box): any;
    /** no-action implementation */
    handleTorusPipe(_g: TorusPipe): any;
    /** no-action implementation */
    handleLinearSweep(_g: LinearSweep): any;
    /** no-action implementation */
    handleRotationalSweep(_g: RotationalSweep): any;
    /** no-action implementation */
    handleRuledSweep(_g: RuledSweep): any;
    /** no-action implementation */
    handlePointString3d(_g: PointString3d): any;
    /** no-action implementation */
    handleBezierCurve3d(_g: BezierCurve3d): any;
    /** no-action implementation */
    handleBezierCurve3dH(_g: BezierCurve3dH): any;
}
/**
 * Implement GeometryHandler methods, with all curve collection methods recursing to children.
 * @public
 */
export declare class RecurseToCurvesGeometryHandler extends GeometryHandler {
    /** no-action implementation */
    handleLineSegment3d(_g: LineSegment3d): any;
    /** no-action implementation */
    handleLineString3d(_g: LineString3d): any;
    /** no-action implementation */
    handleArc3d(_g: Arc3d): any;
    /** no-action implementation */
    handleBSplineCurve3d(_g: BSplineCurve3d): any;
    /** no-action implementation */
    handleBSplineCurve3dH(_g: BSplineCurve3dH): any;
    /** no-action implementation */
    handleBSplineSurface3d(_g: BSplineSurface3d): any;
    /** no-action implementation */
    handleCoordinateXYZ(_g: CoordinateXYZ): any;
    /** no-action implementation */
    handleBSplineSurface3dH(_g: BSplineSurface3dH): any;
    /** no-action implementation */
    handleIndexedPolyface(_g: IndexedPolyface): any;
    /** no-action implementation
     * @alpha
     */
    handleTransitionSpiral(_g: TransitionSpiral3d): any;
    /** Invoke `child.dispatchToGeometryHandler(this)` for each child in the array returned by the query `g.children` */
    handleChildren(g: GeometryQuery): any;
    /** Recurse to children */
    handleCurveCollection(g: CurveCollection): any;
    /** Recurse to children */
    handlePath(g: Path): any;
    /** Recurse to children */
    handleLoop(g: Loop): any;
    /** Recurse to children */
    handleParityRegion(g: ParityRegion): any;
    /** Recurse to children */
    handleUnionRegion(g: UnionRegion): any;
    /** Recurse to children */
    handleBagOfCurves(g: BagOfCurves): any;
    /** no-action implementation */
    handleSphere(_g: Sphere): any;
    /** no-action implementation */
    handleCone(_g: Cone): any;
    /** no-action implementation */
    handleBox(_g: Box): any;
    /** no-action implementation */
    handleTorusPipe(_g: TorusPipe): any;
    /** no-action implementation */
    handleLinearSweep(_g: LinearSweep): any;
    /** no-action implementation */
    handleRotationalSweep(_g: RotationalSweep): any;
    /** no-action implementation */
    handleRuledSweep(_g: RuledSweep): any;
    /** no-action implementation */
    handlePointString3d(_g: PointString3d): any;
    /** no-action implementation */
    handleBezierCurve3d(_g: BezierCurve3d): any;
    /** no-action implementation */
    handleBezierCurve3dH(_g: BezierCurve3dH): any;
}
/** IStrokeHandler is an interface with methods to receive data about curves being stroked.
 * CurvePrimitives emitStrokes () methods emit calls to a handler object with these methods.
 * The various CurvePrimitive types are free to announce either single points (announcePoint), linear fragments,
 * or fractional intervals of the parent curve.
 * * handler.startCurvePrimitive (cp) -- announce the curve primitive whose strokes will follow.
 * * announcePointTangent (xyz, fraction, tangent) -- announce a single point on the curve.
 * * announceIntervalForUniformStepStrokes (cp, numStrokes, fraction0, fraction1) -- announce a fraction
 * interval in which the curve can be evaluated (e.g. the handler can call cp->fractionToPointAndDerivative ())
 * * announceSegmentInterval (cp, point0, point1, numStrokes, fraction0, fraction1) -- announce
 *    that the fractional interval fraction0, fraction1 is a straight line which should be broken into
 *    numStrokes strokes.
 *   * A LineSegment would make a single call to this.
 *   * A LineString would make one call to this for each of its segments, with fractions indicating position
 * within the linestring.
 * * endCurvePrimitive (cp) -- announce the end of the curve primitive.
 * @public
 */
export interface IStrokeHandler {
    /** announce a parent curve primitive
     * * startParentCurvePrimitive() ...endParentCurvePrimitive() are wrapped around startCurvePrimitive and endCurvePrimitive when the interior primitive is a proxy.
     */
    startParentCurvePrimitive(cp: CurvePrimitive): void;
    /** Announce the curve primitive that will be described in subsequent calls. */
    startCurvePrimitive(cp: CurvePrimitive): void;
    /**
     * announce a single point with its fraction and tangent.
     * * (IMPORTANT) the same Point3d and Vector3d will be reset and passed on multiple calls.
     * * (THEREFORE) if the implementation is saving coordinates, it must copy the xyz data out into its own data structure rather than save the references.
     */
    announcePointTangent(xyz: Point3d, fraction: number, tangent: Vector3d): void;
    /** Announce that curve primitive cp should be evaluated in the specified fraction interval. */
    announceIntervalForUniformStepStrokes(cp: CurvePrimitive, numStrokes: number, fraction0: number, fraction1: number): void;
    /** Announce numPoints interpolated between point0 and point1, with associated fractions */
    announceSegmentInterval(cp: CurvePrimitive, point0: Point3d, point1: Point3d, numStrokes: number, fraction0: number, fraction1: number): void;
    /** Announce that all data about `cp` has been announced. */
    endCurvePrimitive(cp: CurvePrimitive): void;
    /** Announce that all data about the parent primitive has been announced. */
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
 * @public
 */
export interface UVSurface {
    /**
     * Convert fractional u and v coordinates to surface point
     * @param uFraction fractional coordinate in u direction
     * @param vFraction fractional coordinate in the v direction
     * @param result optional pre-allocated point
     */
    uvFractionToPoint(uFraction: number, vFraction: number, result?: Point3d): Point3d;
    /**
     * Convert fractional u and v coordinates to surface point and in-surface tangent directions.
     * * Remark: the vectors are expected to be non-zero tangents which can be crossed to get a normal.
     * * Hence the are NOT precisely either (a) partial derivatives or (b) frenet vectors
     * @param uFraction fractional coordinate in u direction
     * @param vFraction fractional coordinate in the v direction
     * @param result optional pre-allocated carrier for point and vectors
     */
    uvFractionToPointAndTangents(uFraction: number, vFraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
}
/**
 * Interface for queries of distance-along in u and v directions
 * @public
 */
export interface UVSurfaceIsoParametricDistance {
    /**
     * * Return a vector whose x and y parts are "size" of the surface in the u and v directions.
     * * Sizes are use for applying scaling to mesh parameters
     * * These sizes are (reasonable approximations of) the max curve length along u and v isoparameter lines.
     *   * e.g. for a sphere, these are:
     *      * u direction = distance around the equator
     *      * v direction = distance from south pole to north pole.
     */
    maxIsoParametricDistance(): Vector2d;
}
//# sourceMappingURL=GeometryHandler.d.ts.map