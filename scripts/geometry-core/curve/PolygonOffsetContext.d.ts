import { Point3d } from "../geometry3d/Point3dVector3d";
import { CurveCollection } from "./CurveCollection";
import { CurvePrimitive } from "./CurvePrimitive";
import { Path } from "./Path";
import { Loop } from "./Loop";
import { Angle } from "../geometry3d/Angle";
/**
 * * control parameters for joint construction.
 * * Decision order is:
 *   * if turn angle is greater than minArcDegrees, make an arc.
 *   * if turn angle is less than or equal maxChamferTurnDegrees, extend curves along tangent to single intersection point.
 *   * if turn angle is greater than maxChamferTurnDegrees,  construct multiple lines that are tangent to the turn circle "from the outside",
 *           with each equal turn less than maxChamferTurnDegrees.
 *   * otherwise make single edge.
 * @public
 */
export declare class JointOptions {
    /** smallest arc to construct.
     * * If this control angle is large, arcs are never created.
     */
    minArcDegrees: number;
    maxChamferTurnDegrees: number;
    leftOffsetDistance: number;
    /** Construct JointOptions.
     * * leftOffsetDistance is required
     * * minArcDegrees and maxChamferDegrees are optional.
     */
    constructor(leftOffsetDistance: number, minArcDegrees?: number, maxChamferDegrees?: number);
    /**
     * Parse a number of JointOptions up to JointOptions:
     * * If leftOffsetDistanceOptions is a number, create a JointOptions with default arc and chamfer values.
     * * If leftOffsetDistanceOrOptions is a JointOptions, return it unchanged.
     * @param leftOffsetDistanceOrOptions
     */
    static create(leftOffsetDistanceOrOptions: number | JointOptions): JointOptions;
    /** return true if the options indicate this amount of turn should be handled with an arc. */
    needArc(theta: Angle): boolean;
    /** Test if turn by theta should be output as single point. */
    numChamferPoints(theta: Angle): number;
}
/**
 * Context for building a wire offset.
 * @internal
 */
export declare class PolygonWireOffsetContext {
    /** construct a context. */
    constructor();
    private static _unitAlong;
    private static _unitPerp;
    private static _offsetA;
    private static _offsetB;
    private static createOffsetSegment;
    /**
     * Construct curves that are offset from a polygon.
     * * The construction will remove "some" local effects of features smaller than the offset distance, but will not detect self intersection with far-away edges.
     * @param points
     * @param wrap
     * @param offsetDistance
     */
    constructPolygonWireXYOffset(points: Point3d[], wrap: boolean, leftOffsetDistanceOrOptions: number | JointOptions): CurveCollection | undefined;
}
/**
 * Context for building a wire offset from a Path or Loop of CurvePrimitives
 * @internal
 */
export declare class CurveChainWireOffsetContext {
    /** construct a context. */
    constructor();
    private static _unitAlong;
    private static _unitPerp;
    private static _offsetA;
    private static _offsetB;
    private static createOffsetSegment;
    /**
     * Annotate a CurvePrimitive with properties `baseCurveStart` and `baseCurveEnd`.
     * * return cp
     * @param cp primitive to annotate
     * @param startPoint optional start point
     * @param endPoint optional end point
     */
    static applyBasePoints(cp: CurvePrimitive | undefined, startPoint: Point3d | undefined, endPoint: Point3d | undefined): CurvePrimitive | undefined;
    /**
     * Create the offset of a single primitive.
     * * each primitive may be labeled (as an `any` object) with start or end point of base curve:
     *   * `(primitive as any).baseCurveStart: Point3d`
     *   * `(primitive as any).baseCurveEnd: Point3d`
     * @param g primitive to offset
     * @param distanceLeft
     */
    static createSingleOffsetPrimitiveXY(g: CurvePrimitive, distanceLeft: number): CurvePrimitive | CurvePrimitive[] | undefined;
    /**
     * Construct curves that are offset from a Path or Loop
     * * The construction will remove "some" local effects of features smaller than the offset distance, but will not detect self intersection among widely separated edges.
     * * Offset distance is defined as positive to the left.
     * * If offsetDistanceOrOptions is given as a number, default options are applied.
     * * When the offset needs to do an "outside" turn, the first applicable construction is applied:
     *   * If the turn is larger than `options.minArcDegrees`, a circular arc is constructed.
     *   * if the turn is larger than `options.maxChamferDegrees`, the turn is constructed as a sequence of straight lines that are
     *      * outside the arc
     *      * have uniform turn angle less than `options.maxChamferDegrees`
     *      * each line segment (except first and last) touches the arc at its midpoint.
     *   * Otherwise the prior and successor curves are extended to simple intersection.
     * @param curves input curves
     * @param offsetDistanceOrOptions offset controls.
     */
    static constructCurveXYOffset(curves: Path | Loop, options: JointOptions): CurveCollection | undefined;
}
//# sourceMappingURL=PolygonOffsetContext.d.ts.map