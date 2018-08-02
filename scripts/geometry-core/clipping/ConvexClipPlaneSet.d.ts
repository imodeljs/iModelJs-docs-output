/** @module CartesianGeometry */
import { Point3d, Vector3d } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { Matrix4d } from "../numerics/Geometry4d";
import { Angle } from "../Geometry";
import { Arc3d } from "../curve/Arc3d";
import { ClipPlane } from "./ClipPlane";
import { ClipPlaneContainment, Clipper } from "./ClipUtils";
import { AnnounceNumberNumberCurvePrimitive } from "../curve/CurvePrimitive";
/**
 * A ConvexClipPlaneSet is a collection of ClipPlanes, often used for bounding regions of space.
 */
export declare class ConvexClipPlaneSet implements Clipper {
    static readonly hugeVal: number;
    private _planes;
    private constructor();
    toJSON(): any;
    static fromJSON(json: any, result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /**
     * @returns Return true if all members are almostEqual to corresponding members of other.  This includes identical order in array.
     * @param other clip plane to compare
     */
    isAlmostEqual(other: ConvexClipPlaneSet): boolean;
    static createPlanes(planes: ClipPlane[], result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /**
     * Create new convex set using selected planes of a Range3d.
     * @param range range with coordinates
     * @param lowX true to clip at the low x plane
     * @param highX true to clip at the high x plane
     * @param lowY true to clip at the low y plane
     * @param highY true to clip at the high z plane
     * @param lowZ true to clip at the low z plane
     * @param highZ true to clip at the high z plane
     */
    static createRange3dPlanes(range: Range3d, lowX?: boolean, highX?: boolean, lowY?: boolean, highY?: boolean, lowZ?: boolean, highZ?: boolean): ConvexClipPlaneSet;
    static createEmpty(result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /** negate all planes of the set. */
    negateAllPlanes(): void;
    static createXYBox(x0: number, y0: number, x1: number, y1: number, result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    static createXYPolyLine(points: Point3d[], interior: boolean[], leftIsInside: boolean, result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /**
     * Create a convexClipPlaneSet with planes whose "inside" normal is to the left of each segment.
     * @param points array of points.
     */
    static createXYPolyLineInsideLeft(points: Point3d[], result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    clone(result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    readonly planes: ClipPlane[];
    static testRayIntersections(tNear: Float64Array, origin: Point3d, direction: Vector3d, planes: ConvexClipPlaneSet): boolean;
    multiplyPlanesByMatrix(matrix: Matrix4d): void;
    isPointInside(point: Point3d): boolean;
    isPointOnOrInside(point: Point3d, tolerance: number): boolean;
    isSphereInside(point: Point3d, radius: number): boolean;
    /** Find the parts of the line segment  (if any) that is within the convex clip volume.
     * * The input fractional interval from fraction0 to fraction1 (increasing!!) is the active part to consider.
     * * To clip to the usual bounded line segment, starts with fractions (0,1).
     * If the clip volume is unbounded, the line interval may also be unbounded.
     * * An unbounded line portion will have fraction coordinates positive or negative Number.MAX_VALUE.
     * @param fraction0 fraction that is the initial lower fraction of the active interval. (e.g. 0.0 for bounded segment)
     * @param fraction1 fraction that is the initial upper fraction of the active interval.  (e.g. 1.0 for bounded segment)
     * @param pointA segment start (fraction 0)
     * @param pointB segment end (fraction 1)
     * @param announce function to be called to announce a fraction interval that is within the convex clip volume.
     * @returns true if a segment was announced, false if entirely outside.
     */
    announceClippedSegmentIntervals(f0: number, f1: number, pointA: Point3d, pointB: Point3d, announce?: (fraction0: number, fraction1: number) => void): boolean;
    private static sClipArcFractionArray;
    announceClippedArcIntervals(arc: Arc3d, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /** Find the parts of the (unbounded) line segment  (if any) that is within the convex clip volume.
     * @param pointA segment start (fraction 0)
     * @param pointB segment end (fraction 1)
     * @param announce function to be called to announce a fraction interval that is within the convex clip volume.
     * @returns true if a segment was announced, false if entirely outside.
     */
    clipUnboundedSegment(pointA: Point3d, pointB: Point3d, announce?: (fraction0: number, fraction1: number) => void): boolean;
    transformInPlace(transform: Transform): void;
    /** Returns 1, 2, or 3 based on whether point array is strongly inside, ambiguous, or strongly outside respectively.
     * * This has a peculiar expected use case as a very fast pre-filter for more precise clipping.
     * * The expected point set is for a polygon.
     * * Hence any clipping will eventually have to consider the lines between the points.
     * * This method looks for the special case of a single clip plane that has all the points outside.
     * * In this case the whole polygon must be outside.
     * * Note that this does not detect a polygon that is outside but "crosses a corner" -- it is mixed with respect to
     *     multiple planes.
     */
    classifyPointContainment(points: Point3d[], onIsOutside: boolean): ClipPlaneContainment;
    /**
     * * Create a convex clip set for a polygon swept with possible tilt angle.
     * * planes are constructed by ClipPlane.createEdgeAndUpVector, using successive points from the array.
     * * If the first and last points match, the polygon area is checked.  If the area is negative, points are used in reverse order.
     * * If first and last points do not match, points are used in order given
     * @param points polygon points. (Closure point optional)
     * @param upVector primary sweep direction, as applied by ClipPlane.createEdgeAndUpVector
     * @param tiltAngle angle to tilt sweep planes away from the sweep direction.
     */
    static createSweptPolyline(points: Point3d[], upVector: Vector3d, tiltAngle: Angle): ConvexClipPlaneSet | undefined;
    addPlaneToConvexSet(plane: ClipPlane | undefined): void;
    clipPointsOnOrInside(points: Point3d[], inOrOn: Point3d[], out: Point3d[]): void;
    polygonClip(input: Point3d[], output: Point3d[], work: Point3d[]): void;
    /**
     * * Define new planes in this ConvexClipPlaneSet so it clips to the inside of a polygon.
     * * always create planes for the swept edges of the polygon
     * * optionally (with nonzero sideSelect) create a cap plane using the polygon normal.
     * @param points Points of a bounding polygon
     * @param sweepDirection direction to sweep.
     * @param sideSelect 0 to have no cap polygon, 1 if the sweep vector side is in, -1 if sweep vector side is out.
     */
    reloadSweptPolygon(points: Point3d[], sweepDirection: Vector3d, sideSelect: number): number;
    /**
     * Returns range if result does not cover a space of infinity, otherwise undefined.
     * Note: If given a range for output, overwrites it, rather than extending it.
     */
    getRangeOfAlignedPlanes(transform?: Transform, result?: Range3d): Range3d | undefined;
    setInvisible(invisible: boolean): void;
    addZClipPlanes(invisible: boolean, zLow?: number, zHigh?: number): void;
}
