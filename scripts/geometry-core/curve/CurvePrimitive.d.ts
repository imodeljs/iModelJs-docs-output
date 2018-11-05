/** @module Curve */
import { PlaneAltitudeEvaluator } from "../Geometry";
import { StrokeOptions } from "./StrokeOptions";
import { Point3d, Vector3d } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { Plane3dByOriginAndUnitNormal, Ray3d, Plane3dByOriginAndVectors } from "../AnalyticGeometry";
import { GeometryHandler, IStrokeHandler } from "../GeometryHandler";
import { LineString3d } from "./LineString3d";
import { Clipper } from "../clipping/ClipUtils";
/**
 * An enumeration of special conditions being described by a CurveLocationDetail.
 */
export declare enum CurveIntervalRole {
    /** This point is an isolated point NOT at a primary vertex. */
    isolated = 0,
    /**  This point is an isolated vertex hit */
    isolatedAtVertex = 1,
    /** This is the beginning of an interval */
    intervalStart = 10,
    /** This is an interior point of an interval. */
    intervalInterior = 11,
    /** This is the end of an interval */
    intervalEnd = 12
}
/** Type for callback function which announces a pair of numbers, such as a fractional interval, along with a containing CurvePrimitive. */
export declare type AnnounceNumberNumberCurvePrimitive = (a0: number, a1: number, cp: CurvePrimitive) => void;
export declare type AnnounceNumberNumber = (a0: number, a1: number) => void;
export declare type AnnounceCurvePrimitive = (cp: CurvePrimitive) => void;
/**
 * CurveLocationDetail carries point and paramter data about a point evaluated on a curve.
 */
export declare class CurveLocationDetail {
    /** The curve being evaluated */
    curve?: CurvePrimitive;
    /** The fractional position along the curve */
    fraction: number;
    /** Deail condition of the role this point has in some context */
    intervalRole?: CurveIntervalRole;
    /** The point on the curve */
    point: Point3d;
    /** A vector (e.g. tangent vector) in context */
    vector: Vector3d;
    /** A context-specific numeric value.  (E.g. a distance) */
    a: number;
    /** A context-specific addtional point */
    pointQ: Point3d;
    constructor();
    /** Set the (optional) intervalRole field */
    setIntervalRole(value: CurveIntervalRole): void;
    /** test if this is an isolated point. This is true if intervalRole is any of (undefined, isolated, isolatedAtVertex) */
    readonly isIsolated: boolean;
    /** @returns Return a complete copy */
    clone(result?: CurveLocationDetail): CurveLocationDetail;
    setFP(fraction: number, point: Point3d, vector?: Vector3d, a?: number): void;
    setFR(fraction: number, ray: Ray3d, a?: number): void;
    /** Set the CurvePrimitive pointer, leaving all other properties untouched.
     */
    setCurve(curve: CurvePrimitive): void;
    /** record the distance from the CurveLocationDetail's point to the parameter point. */
    setDistanceTo(point: Point3d): void;
    /** create with a CurvePrimitive pointer but no coordinate data.
     */
    static create(curve: CurvePrimitive, result?: CurveLocationDetail): CurveLocationDetail;
    /** create with CurvePrimitive pointer, fraction, and point coordinates.
     */
    static createCurveFractionPoint(curve: CurvePrimitive, fraction: number, point: Point3d, result?: CurveLocationDetail): CurveLocationDetail;
}
/** A pair of CurveLocationDetail. */
export declare class CurveLocationDetailPair {
    detailA: CurveLocationDetail;
    detailB: CurveLocationDetail;
    constructor();
    /** Create a curve detail pair using references to two CurveLocationDetails */
    static createDetailRef(detailA: CurveLocationDetail, detailB: CurveLocationDetail, result?: CurveLocationDetailPair): CurveLocationDetailPair;
    /** Make a deep copy of this CurveLocationDetailPair */
    clone(result?: CurveLocationDetailPair): CurveLocationDetailPair;
}
/** Queries to be supported by Curve, Surface, and Solid objects */
export declare abstract class GeometryQuery {
    /** return the range of the entire (tree) GeometryQuery */
    range(transform?: Transform, result?: Range3d): Range3d;
    /** extend rangeToExtend by the range of this geometry multiplied by the transform */
    abstract extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Attempt to transform in place.
     *
     * * LineSegment3d, Arc3d, LineString3d, BsplineCurve3d always succeed.
     * * Some geometry types may fail if scaling is non-uniform.
     */
    abstract tryTransformInPlace(transform: Transform): boolean;
    /** try to move the geometry by dx,dy,dz */
    tryTranslateInPlace(dx: number, dy?: number, dz?: number): boolean;
    /** return a transformed clone.
     */
    abstract cloneTransformed(transform: Transform): GeometryQuery | undefined;
    /** return a clone */
    abstract clone(): GeometryQuery | undefined;
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    readonly children: GeometryQuery[] | undefined;
    /** test if (other instanceof this.Type).  REQUIRED IN ALL CONCRETE CLASSES */
    abstract isSameGeometryClass(other: GeometryQuery): boolean;
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other: GeometryQuery): boolean;
    abstract dispatchToGeometryHandler(handler: GeometryHandler): any;
}
/**
 * A curve primitive is bounded
 * A curve primitive maps fractions in 0..1 to points in space.
 * As the fraction proceeds from 0 towards 1, the point moves "forward" along the curve.
 * True distance along the curve is not always strictly proportional to fraction.
 * * LineSegment3d always has proportional fraction and distance
 * * an Arc3d which is true circular has proportional fraction and distance
 * *  A LineString3d is not proportional (except for special case of all segments of equal length)
 * * A Spiral3d is proportional
 * * A BsplineCurve3d is only proportional for special cases.
 *
 * For fractions outside 0..1, the curve primitive class may either (a) return the near endpoint or (b) evaluate an extended curve.
 */
export declare abstract class CurvePrimitive extends GeometryQuery {
    protected constructor();
    /** Return the point (x,y,z) on the curve at fractional position.
     * @param fraction fractional position along the geometry.
     * @returns Returns a point on the curve.
     */
    abstract fractionToPoint(fraction: number, result?: Point3d): Point3d;
    /** Return the point (x,y,z) and derivative on the curve at fractional position.
     *
     * * Note that this derivative is "derivative of xyz with respect to fraction."
     * * this derivative shows the speed of the "fractional point" moving along the curve.
     * * this is not generally a unit vector.  use fractionToPointAndUnitTangent for a unit vector.
     * @param fraction fractional position along the geometry.
     * @returns Returns a ray whose origin is the curve point and direction is the derivative with respect to the fraction.
     */
    abstract fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /**
     *
     * @param fraction fractional position on the curve
     * @param result optional receiver for the result.
     * @returns Returns a ray whose origin is the curve point and direction is the unit tangent.
     */
    fractionToPointAndUnitTangent(fraction: number, result?: Ray3d): Ray3d;
    /** Return a plane with
     *
     * * origin at fractional position along the curve
     * * vectorU is the first derivative, i.e. tangent vector with length equal to the rate of change with respect to the fraction.
     * * vectorV is the second derivative, i.e.derivative of vectorU.
     */
    abstract fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors | undefined;
    /** Construct a frenet frame:
     * * origin at the point on the curve
     * * x axis is unit vector along the curve (tangent)
     * * y axis is perpendicular and in the plane of the osculating circle.
     * * z axis perpendicular to those.
     */
    fractionToFrenetFrame(fraction: number, result?: Transform): Transform | undefined;
    /**
     *
     * * Curve length is always positive.
     * @returns Returns a (high accuracy) length of the curve.
     * @returns Returns the length of the curve.
     */
    curveLength(): number;
    /**
     * Compute a length which may be an fast approximation to the true length.
     * This is expected to be either (a) exact or (b) larger than the actual length, but by no more than
     * a small multiple, perhaps up to PI/2, but commonly much closer to 1.
     *
     * * An example use of this is for setting a tolerance which is a small multiple of the curve length.
     * * Simple line, circular arc, and transition spiral may return exact length
     * * Ellipse may return circumference of some circle or polygon that encloses the ellipse.
     * * bspline curve may return control polygon length
     * *
     */
    abstract quickLength(): number;
    /** Search for the curve point that is closest to the spacePoint.
     *
     * * If the space point is exactly on the curve, this is the reverse of fractionToPoint.
     * * Since CurvePrimitive should always have start and end available as candidate points, this method should always succeed
     * @param spacePoint point in space
     * @param extend true to extend the curve (if possible)
     * @returns Returns a CurveLocationDetail structure that holds the details of the close point.
     */
    closestPoint(spacePoint: Point3d, extend: boolean): CurveLocationDetail | undefined;
    /**
     * Find intervals of this curvePrimitive that are interior to a clipper
     * @param clipper clip structure (e.g. clip planes)
     * @param announce (optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(_clipper: Clipper, _announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /** Return (if possible) a curve primitive which is a portion of this curve.
     * @param _fractionA [in] start fraction
     * @param _fractionB [in] end fraction
     */
    clonePartialCurve(_fractionA: number, _fractionB: number): CurvePrimitive | undefined;
    /** Reverse the curve's data so that its fractional stroking moves in the opposite direction. */
    abstract reverseInPlace(): void;
    /**
     * Compute intersections with a plane.
     * The intersections are appended to the result array.
     * The base class implementation emits strokes to an AppendPlaneIntersectionStrokeHandler object, which uses a Newton iteration to get
     * high-accuracy intersection points within strokes.
     * Derived classes should override this default implementation if there are easy analytic solutions.
     * @param plane The plane to be intersected.
     * @param result Array to receive intersections
     * @returns Return the number of CurveLocationDetail's added to the result array.
     */
    appendPlaneIntersectionPoints(plane: PlaneAltitudeEvaluator, result: CurveLocationDetail[]): number;
    /** Ask if the curve is within tolerance of a plane.
     * @returns Returns true if the curve is completely within tolerance of the plane.
     */
    abstract isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** return the start point of the primitive.  The default implementation returns fractionToPoint (0.0) */
    startPoint(result?: Point3d): Point3d;
    /** @returns return the end point of the primitive. The default implementation returns fractionToPoint(1.0) */
    endPoint(result?: Point3d): Point3d;
    /** Add strokes to caller-supplied linestring */
    abstract emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** Ask the curve to announce points and simple subcurve fragments for stroking.
     * See IStrokeHandler for description of the sequence of the method calls.
     */
    abstract emitStrokableParts(dest: IStrokeHandler, options?: StrokeOptions): void;
}
/** A Coordinate is a persistable Point3d */
export declare class CoordinateXYZ extends GeometryQuery {
    private _xyz;
    readonly point: Point3d;
    /**
     * @param xyz point to be CAPTURED.
     */
    private constructor();
    static create(point: Point3d): CoordinateXYZ;
    /** return the range of the point */
    range(): Range3d;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Apply transform to the Coordinate's point. */
    tryTransformInPlace(transform: Transform): boolean;
    /** return a transformed clone.
     */
    cloneTransformed(transform: Transform): GeometryQuery | undefined;
    /** return a clone */
    clone(): GeometryQuery | undefined;
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    /** test if (other instanceof Coordinate).  */
    isSameGeometryClass(other: GeometryQuery): boolean;
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other: GeometryQuery): boolean;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=CurvePrimitive.d.ts.map