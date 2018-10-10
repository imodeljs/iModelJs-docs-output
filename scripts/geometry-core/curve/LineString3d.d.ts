/** @module Curve */
import { BeJSONFunctions, PlaneAltitudeEvaluator } from "../Geometry";
import { Point3d, XAndY } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { Plane3dByOriginAndUnitNormal, Plane3dByOriginAndVectors, Ray3d } from "../AnalyticGeometry";
import { GrowableXYZArray, GrowableFloat64Array } from "../GrowableArray";
import { GeometryHandler, IStrokeHandler } from "../GeometryHandler";
import { StrokeOptions } from "../curve/StrokeOptions";
import { CurvePrimitive, GeometryQuery, CurveLocationDetail, AnnounceNumberNumberCurvePrimitive } from "./CurvePrimitive";
import { Clipper } from "../clipping/ClipUtils";
export declare class LineString3d extends CurvePrimitive implements BeJSONFunctions {
    private static _workPointA;
    private static _workPointB;
    private static _workPointC;
    isSameGeometryClass(other: GeometryQuery): boolean;
    private _points;
    /** return the points array (cloned). */
    readonly points: Point3d[];
    /** Return (reference to) point data in packed GrowableXYZArray. */
    readonly packedPoints: GrowableXYZArray;
    private constructor();
    cloneTransformed(transform: Transform): CurvePrimitive;
    private static flattenArray;
    static create(...points: any[]): LineString3d;
    static createXY(points: XAndY[], z: number, enforceClosure?: boolean): LineString3d;
    addPoints(...points: any[]): void;
    /**
     * Add a point to the linestring.
     * @param point
     */
    addPoint(point: Point3d): void;
    /**
     * Add a point to the linestring.
     * @param point
     */
    addPointXYZ(x: number, y: number, z?: number): void;
    /**
     * If the linestring is not already closed, add a closure point.
     */
    addClosurePoint(): void;
    popPoint(): void;
    static createRectangleXY(point0: Point3d, ax: number, ay: number, closed?: boolean): LineString3d;
    /**
     * Create a regular polygon centered
     * @param center center of the polygon.
     * @param edgeCount number of edges.
     * @param radius distance to vertex or edge (see `radiusToVertices`)
     * @param radiusToVertices true if polygon is inscribed in circle (radius measured to vertices); false if polygon is outside circle (radius to edges)
     */
    static createRegularPolygonXY(center: Point3d, edgeCount: number, radius: number, radiusToVertices?: boolean): LineString3d;
    setFrom(other: LineString3d): void;
    static createPoints(points: Point3d[]): LineString3d;
    /** Create a LineString3d from xyz coordinates packed in a Float64Array */
    static createFloat64Array(xyzData: Float64Array): LineString3d;
    clone(): LineString3d;
    setFromJSON(json?: any): void;
    /**
     * Convert an LineString3d to a JSON object.
     * @return {*} [[x,y,z],...[x,y,z]]
     */
    toJSON(): any;
    static fromJSON(json?: any): LineString3d;
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Return point and derivative at fraction, with 000 second derivative. */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * Convert a segment index and local fraction to a global fraction.
     * @param index index of segment being evaluated
     * @param localFraction local fraction within that segment
     */
    segmentIndexAndLocalFractionToGlobalFraction(index: number, localFraction: number): number;
    /** Return a frenet frame, using nearby points to estimate a plane. */
    fractionToFrenetFrame(fraction: number, result?: Transform): Transform;
    startPoint(): Point3d;
    pointAt(i: number, result?: Point3d): Point3d | undefined;
    numPoints(): number;
    endPoint(): Point3d;
    reverseInPlace(): void;
    tryTransformInPlace(transform: Transform): boolean;
    curveLength(): number;
    quickLength(): number;
    closestPoint(spacePoint: Point3d, extend: boolean, result?: CurveLocationDetail): CurveLocationDetail;
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** push a hit, fixing up the prior entry if needed.
     * return the incremented counter.
     */
    private static pushVertexHit;
    /** find intersections with a plane.
     *  Intersections within segments are recorded as CurveIntervalRole.isolated
     *   Intersections at isolated "on" vertex are recoded as CurveIntervalRole.isolatedAtVertex.
     */
    appendPlaneIntersectionPoints(plane: PlaneAltitudeEvaluator, result: CurveLocationDetail[]): number;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    isAlmostEqual(other: GeometryQuery): boolean;
    /** Append (clone of) one point.
     * BUT ... skip if duplicates the tail of prior points.
     */
    appendStrokePoint(point: Point3d): void;
    clear(): void;
    /** Evaluate a curve at uniform fractions.  Append the evaluations to this linestring.
     * @param curve primitive to evaluate.
     * @param numStrokes number of strokes (edges).
     * @param fraction0 starting fraction coordinate
     * @param fraction1 end fraction coordinate
     * @param include01 if false, points at fraction0 and fraction1 are omitted.
     */
    appendFractionalStrokePoints(curve: CurvePrimitive, numStrokes: number, fraction0: number | undefined, fraction1: number | undefined, include01: boolean): void;
    appendInterpolatedStrokePoints(numStrokes: number, point0: Point3d, point1: Point3d, include01: boolean): void;
    /** Emit strokes to caller-supplied linestring */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** Emit strokable parts of the curve to a caller-supplied handler.
     * If the stroke options does not have a maxEdgeLength, one stroke is emited for each segment of the linestring.
     * If the stroke options has a maxEdgeLength, smaller segments are emitted as needed.
     */
    emitStrokableParts(handler: IStrokeHandler, options?: StrokeOptions): void;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Find intervals of this curveprimitve that are interior to a clipper
     * @param clipper clip structure (e.g. clip planes)
     * @param announce (optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(clipper: Clipper, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    private static _indexPoint;
    private addResolvedPoint;
    /** Return (if possible) a LineString which is a portion of this curve.
     * @param fractionA [in] start fraction
     * @param fractionB [in] end fraction
     */
    clonePartialCurve(fractionA: number, fractionB: number): CurvePrimitive | undefined;
}
/** An AnnotatedLineString3d is a linestring with additional data attached to each point
 * * This is useful in facet construction.
 */
export declare class AnnotatedLineString3d {
    curveParam?: GrowableFloat64Array;
    /**
     * uv parameters, stored as uvw with the w possibly used for distinguishing among multiple "faces".
     */
    uvwParam?: GrowableXYZArray;
    vecturU?: GrowableXYZArray;
    vectorV?: GrowableXYZArray;
}
//# sourceMappingURL=LineString3d.d.ts.map