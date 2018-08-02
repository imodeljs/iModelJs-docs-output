/** @module Curve */
import { Angle, AngleSweep, BeJSONFunctions } from "../Geometry";
import { Point3d, Vector3d, XYAndZ } from "../PointVector";
import { Range3d } from "../Range";
import { Transform, RotMatrix } from "../Transform";
import { Plane3dByOriginAndUnitNormal, Ray3d, Plane3dByOriginAndVectors } from "../AnalyticGeometry";
import { GeometryHandler, IStrokeHandler } from "../GeometryHandler";
import { CurvePrimitive, GeometryQuery, CurveLocationDetail, AnnounceNumberNumberCurvePrimitive } from "./CurvePrimitive";
import { StrokeOptions } from "../curve/StrokeOptions";
import { Clipper } from "../clipping/ClipUtils";
import { LineString3d } from "./LineString3d";
/**
 * Circular or elliptic arc.
 *
 * * The angle to point equation is:
 *
 * **  `X = center + cos(theta) * vector0 + sin(theta) * vector90`
 * * When the two vectors are perpendicular and have equal length, it is a true circle.
 * * Non-perpendicular vectors are always elliptic.
 * *  vectors of unequal length are always elliptic.
 * * To create an ellipse in the common "major and minor axis" form of an ellipse:
 *
 * ** vector0 is the vector from the center to the major axis extreme.
 * ** vector90 is the vector from the center to the minor axis extreme.
 * ** note the constructing the vectors to the extreme points makes them perpendicular.
 * *  The method toScaledRotMatrix () can be called to convert the unrestricted vector0,vector90 to perpendicular form.
 * * The unrestricted form is much easier to work with for common calculations -- stroking, projection to 2d, intersection with plane.
 */
export declare class Arc3d extends CurvePrimitive implements BeJSONFunctions {
    isSameGeometryClass(other: GeometryQuery): boolean;
    private _center;
    private _matrix;
    private _sweep;
    readonly center: Point3d;
    readonly vector0: Vector3d;
    readonly vector90: Vector3d;
    readonly matrix: RotMatrix;
    readonly sweep: AngleSweep;
    private constructor();
    cloneTransformed(transform: Transform): CurvePrimitive;
    setRefs(center: Point3d, matrix: RotMatrix, sweep: AngleSweep): void;
    set(center: Point3d, matrix: RotMatrix, sweep: AngleSweep | undefined): void;
    setFrom(other: Arc3d): void;
    clone(): Arc3d;
    static createRefs(center: Point3d, matrix: RotMatrix, sweep: AngleSweep, result?: Arc3d): Arc3d;
    static createScaledXYColumns(center: Point3d, matrix: RotMatrix, radius0: number, radius90: number, sweep: AngleSweep, result?: Arc3d): Arc3d;
    static create(center: Point3d, vector0: Vector3d, vector90: Vector3d, sweep?: AngleSweep, result?: Arc3d): Arc3d;
    /** Create a circular arc defined by start point, any intermediate point, and end point.
     * If the points are colinear, assemble them into a linestring.
     */
    static createCircularStartMiddleEnd(pointA: XYAndZ, pointB: XYAndZ, pointC: XYAndZ, result?: Arc3d): Arc3d | LineString3d | undefined;
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    radiansToPointAndDerivative(radians: number, result?: Ray3d): Ray3d;
    angleToPointAndDerivative(theta: Angle, result?: Ray3d): Ray3d;
    startPoint(result?: Point3d): Point3d;
    endPoint(result?: Point3d): Point3d;
    curveLength(): number;
    quickLength(): number;
    allPerpendicularAngles(spacePoint: Point3d, _extend?: boolean, _endpoints?: boolean): number[];
    closestPoint(spacePoint: Point3d, extend: boolean, result?: CurveLocationDetail): CurveLocationDetail;
    reverseInPlace(): void;
    tryTransformInPlace(transform: Transform): boolean;
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    isCircular(): boolean;
    /** If the arc is circular, return its radius.  Otherwise return undefined */
    circularRadius(): number | undefined;
    /** Return the larger of the two defining vectors. */
    maxVectorLength(): number;
    appendPlaneIntersectionPoints(plane: Plane3dByOriginAndUnitNormal, result: CurveLocationDetail[]): number;
    extendRange(range: Range3d): void;
    static createUnitCircle(): Arc3d;
    /**
     * @param center center of arc
     * @param radius radius of arc
     * @param sweep sweep limits.  defaults to full circle.
     */
    static createXY(center: Point3d, radius: number, sweep?: AngleSweep): Arc3d;
    static createXYEllipse(center: Point3d, radiusA: number, radiusB: number, sweep?: AngleSweep): Arc3d;
    setVector0Vector90(vector0: Vector3d, vector90: Vector3d): void;
    toScaledRotMatrix(): {
        center: Point3d;
        axes: RotMatrix;
        r0: number;
        r90: number;
        sweep: AngleSweep;
    };
    /** Return the arc definition with center, two vectors, and angle sweep;
     * The center and AngleSweep are references to inside the Arc3d.
     */
    toVectors(): {
        center: Point3d;
        vector0: Vector3d;
        vector90: Vector3d;
        sweep: AngleSweep;
    };
    setFromJSON(json?: any): void;
    /**
     * Convert to a JSON object.
     * @return {*} [center:  [], vector0:[], vector90:[], sweep []}
     */
    toJSON(): any;
    isAlmostEqual(otherGeometry: GeometryQuery): boolean;
    /** Emit strokes to caller-supplied linestring */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** Emit strokes to caller-supplied handler */
    emitStrokableParts(handler: IStrokeHandler, options?: StrokeOptions): void;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /** Return (if possible) an arc which is a portion of this curve.
     * @param fractionA [in] start fraction
     * @param fractionB [in] end fraction
     */
    clonePartialCurve(fractionA: number, fractionB: number): CurvePrimitive | undefined;
    /**
     * Find intervals of this curveprimitve that are interior to a clipper
     * @param clipper clip structure (e.g.clip planes)
     * @param announce(optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(clipper: Clipper, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
}
