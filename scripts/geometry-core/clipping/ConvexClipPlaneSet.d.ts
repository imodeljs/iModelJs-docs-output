/** @module CartesianGeometry */
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { Angle } from "../geometry3d/Angle";
import { Arc3d } from "../curve/Arc3d";
import { ClipPlane } from "./ClipPlane";
import { ClipPlaneContainment, Clipper } from "./ClipUtils";
import { AnnounceNumberNumberCurvePrimitive } from "../curve/CurvePrimitive";
import { Range3d, Range1d } from "../geometry3d/Range";
import { Ray3d } from "../geometry3d/Ray3d";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
/**
 * A ConvexClipPlaneSet is a collection of ClipPlanes, often used for bounding regions of space.
 * @public
 */
export declare class ConvexClipPlaneSet implements Clipper {
    /** Value acting as "at infinity" for coordinates along a ray. */
    static readonly hugeVal = 1e+37;
    private _planes;
    private constructor();
    /** Return an array containing all the planes of the convex set.
     * * Note that this has no leading keyword identifying it as a ConvexClipPlaneSet.
     */
    toJSON(): any;
    /** Extract clip planes from a json array `[  clipPlane, clipPlane ]`.
     * * Non-clipPlane members are ignored.
     */
    static fromJSON(json: any, result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /**
     * Return true if all members are almostEqual to corresponding members of other.  This includes identical order in array.
     * @param other clip plane to compare
     */
    isAlmostEqual(other: ConvexClipPlaneSet): boolean;
    /** create from an array of planes.
     * * Each plane reference in the `planes` array is taken into the result.
     * * The input array itself is NOT taken into the result.
     */
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
    /** create an empty `ConvexClipPlaneSet` */
    static createEmpty(result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /** negate all planes of the set. */
    negateAllPlanes(): void;
    /** Create a convex clip plane set that clips to `x0 <= x <= x1` and `y0 <= y <= y1`.
     * * Note that there is no test for the usual ordering `x0 <= x1` or `y0 <= y1`.
     *    * if the usual ordering is violated, the convex set is an empty set.
     */
    static createXYBox(x0: number, y0: number, x1: number, y1: number, result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /** Create a convex set containing a half space for each edge between points of a polyline.
     * * Caller is responsible for assuring the polyline is convex.
     * @param points array of points.  Only xy parts are considered.
     * @param interior array whose boolean value is used as both the `interior` and `invisible` bits of the plane for the succeeding segment.
     * @param leftIsInside if true, the interior is "to the left" of the segments.  If false, interior is "to the right"
     */
    static createXYPolyLine(points: Point3d[], interior: boolean[], leftIsInside: boolean, result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /**
     * Create a convexClipPlaneSet with planes whose "inside" normal is to the left of each segment.
     * @param points array of points.
     */
    static createXYPolyLineInsideLeft(points: Point3d[], result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /**
     * (re)set a plane and ConvexClipPlaneSet for a convex array, such as a convex facet used for xy clip.
     * * The planeOfPolygon is (re)initialized with the normal from 3 points, but not otherwise referenced.
     * * The ConvexClipPlaneSet is filled with outward normals of the facet edges as viewed to xy plane.
     * @param points
     * @param result
     */
    static setPlaneAndXYLoopCCW(points: GrowableXYZArray, planeOfPolygon: ClipPlane, frustum: ConvexClipPlaneSet): void;
    /** Deep clone of all planes. */
    clone(result?: ConvexClipPlaneSet): ConvexClipPlaneSet;
    /** Return the (reference to the) array of `ClipPlane` */
    readonly planes: ClipPlane[];
    /** Test if there is any intersection with a ray defined by origin and direction.
     * * Optionally record the range (null or otherwise) in caller-allocated result.
     * * If the ray is unbounded inside the clip, result can contain positive or negative "Geometry.hugeCoordinate" values
     * * If no result is provide, there are no object allocations.
     * @param result optional Range1d to receive parameters along the ray.
     */
    hasIntersectionWithRay(ray: Ray3d, result?: Range1d): boolean;
    /**
     * Multiply all the ClipPlanes DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     */
    multiplyPlanesByMatrix4d(matrix: Matrix4d, invert?: boolean, transpose?: boolean): boolean;
    /** Return true if `point` satisfies `point.isPointInside` for all planes */
    isPointInside(point: Point3d): boolean;
    /** Return true if `point` satisfies `point.isPointOnOrInside` for all planes */
    isPointOnOrInside(point: Point3d, tolerance: number): boolean;
    /**
     * Test if a sphere is completely inside the convex set.
     * @param centerPoint center of sphere
     * @param radius radius of sphere.
     */
    isSphereInside(centerPoint: Point3d, radius: number): boolean;
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
    private static _clipArcFractionArray;
    /** Find fractional parts of the arc that are within this ClipPlaneSet, and announce each as
     * * `announce(fraction, fraction, curve)`
     */
    announceClippedArcIntervals(arc: Arc3d, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /** Find the parts of the (unbounded) line segment  (if any) that is within the convex clip volume.
     * @param pointA segment start (fraction 0)
     * @param pointB segment end (fraction 1)
     * @param announce function to be called to announce a fraction interval that is within the convex clip volume.
     * @returns true if a segment was announced, false if entirely outside.
     */
    clipUnboundedSegment(pointA: Point3d, pointB: Point3d, announce?: (fraction0: number, fraction1: number) => void): boolean;
    /** transform each plane in place. */
    transformInPlace(transform: Transform): void;
    /**
     * Clip a polygon to the inside of the convex set.
     * * Results with 2 or fewer points are ignored.
     * * Other than ensuring capacity in the arrays, there are no object allocations during execution of this function.
     * @param xyz input points.
     * @param work work buffer
     * @param tolerance tolerance for "on plane" decision.
     */
    clipConvexPolygonInPlace(xyz: GrowableXYZArray, work: GrowableXYZArray, tolerance?: number): void;
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
    /**
     * Add a plane to the convex set.
     * @param plane plane to add
     */
    addPlaneToConvexSet(plane: ClipPlane | undefined): void;
    /**
     * test many points.  Distribute them to arrays depending on in/out result.
     * @param points points to test
     * @param inOrOn points that are in or on the set
     * @param out points that are out.
     */
    clipPointsOnOrInside(points: Point3d[], inOrOn: Point3d[], out: Point3d[]): void;
    /**
     * Clip a polygon to the planes of the clip plane set.
     * * For a convex input polygon, the output is another convex polygon.
     * * For a non-convex input, the output may have double-back edges along plane intersections.  This is still a valid clip in a parity sense.
     * * The containingPlane parameter allows callers within ConvexClipPlane set to bypass planes known to contain the polygon
     * @param input input polygon, usually convex.
     * @param output output polygon
     * @param work work array.
     * @param containingPlane if this plane is found in the convex set, it is NOT applied.
     */
    polygonClip(input: GrowableXYZArray | Point3d[], output: GrowableXYZArray, work: GrowableXYZArray, planeToSkip?: ClipPlane): void;
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
     * Compute intersections among all combinations of 3 planes in the convex set.
     * * optionally throw out points that are not in the set.
     * * optionally push the points in the caller-supplied point array.
     * * optionally extend a caller supplied range.
     * * In the common case where the convex set is (a) a slab or (b) a view frustum, there will be 8 points and the range is the range of the convex set.
     * * If the convex set is unbounded, the range only contains the range of the accepted (corner) points, and the range is not a representative of the "range of all points in the set" .
     * @param transform (optional) transform to apply to the points.
     * @param points (optional) array to which computed points are to be added.
     * @param range (optional) range to be extended by the computed points
     * @param transform (optional) transform to apply to the accepted points.
     * @param testContainment if true, test each point to see if it is within the convex set.  (Send false if confident that the convex set is rectilinear set such as a slab.  Send true if chiseled corners are possible)
     * @returns number of points.
     */
    computePlanePlanePlaneIntersections(points: Point3d[] | undefined, rangeToExtend: Range3d | undefined, transform?: Transform, testContainment?: boolean): number;
    /**
     * Set the `invisible` property on each plane of the convex set.
     * @param invisible value to store
     */
    setInvisible(invisible: boolean): void;
    /**
     * Add planes for z-direction clip between low and high z levels.
     * @param invisible value to apply to the `invisible` bit for the new planes
     * @param zLow low z value.  The plane clips out points with z below this.
     * @param zHigh high z value.  The plane clips out points with z above this.
     */
    addZClipPlanes(invisible: boolean, zLow?: number, zHigh?: number): void;
}
//# sourceMappingURL=ConvexClipPlaneSet.d.ts.map