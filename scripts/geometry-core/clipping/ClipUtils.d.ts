import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range1d, Range3d } from "../geometry3d/Range";
import { GrowableFloat64Array } from "../geometry3d/GrowableFloat64Array";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
import { Arc3d } from "../curve/Arc3d";
import { UnionOfConvexClipPlaneSets } from "./UnionOfConvexClipPlaneSets";
import { CurvePrimitive, AnnounceNumberNumber, AnnounceNumberNumberCurvePrimitive } from "../curve/CurvePrimitive";
import { ClipPrimitive } from "./ClipPrimitive";
import { ConvexClipPlaneSet } from "./ConvexClipPlaneSet";
import { GeometryQuery } from "../curve/GeometryQuery";
import { ClipVector } from "./ClipVector";
/** @module CartesianGeometry */
/** Enumerated type for describing where geometry lies with respect to clipping planes.
 * @public
 */
export declare enum ClipPlaneContainment {
    /** All points inside */
    StronglyInside = 1,
    /** Inside/outside state unknown. */
    Ambiguous = 2,
    /** All points outside */
    StronglyOutside = 3
}
/** Enumerated type for describing what must yet be done to clip a piece of geometry.
 * @public
 */
export declare enum ClipStatus {
    /** some geometry may cross the clip boundaries */
    ClipRequired = 0,
    /** geometry is clearly outside */
    TrivialReject = 1,
    /** geometry is clearly inside */
    TrivialAccept = 2
}
/** An object containing clipping planes that can be used to clip geometry.
 * @public
 */
export interface Clipper {
    /** test if `point` is on or inside the Clipper's volume. */
    isPointOnOrInside(point: Point3d, tolerance?: number): boolean;
    /** Find the parts of the line segment  (if any) that is within the convex clip volume.
     * * The input fractional interval from fraction0 to fraction1 (increasing!!) is the active part to consider.
     * * To clip to the usual bounded line segment, start with fractions (0,1).
     * If the clip volume is unbounded, the line interval may also be unbounded.
     * * An unbounded line portion will have fraction coordinates positive or negative Number.MAX_VALUE.
     * @param f0 fraction that is the initial lower fraction of the active interval. (e.g. 0.0 for bounded segment)
     * @param f1 fraction that is the initial upper fraction of the active interval.  (e.g. 1.0 for bounded segment)
     * @param pointA segment start (fraction 0)
     * @param pointB segment end (fraction 1)
     * @param announce function to be called to announce a fraction interval that is within the convex clip volume.
     * @returns true if a segment was announced, false if entirely outside.
     */
    announceClippedSegmentIntervals(f0: number, f1: number, pointA: Point3d, pointB: Point3d, announce?: AnnounceNumberNumber): boolean;
    /** Find the portion (or portions) of the arc (if any) that are within the convex clip volume.
     * * The input fractional interval from fraction0 to fraction1 (increasing!!) is the active part to consider.
     * @param announce function to be called to announce a fraction interval that is within the convex clip volume.
     * @returns true if one or more arcs portions were announced, false if entirely outside.
     */
    announceClippedArcIntervals(arc: Arc3d, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
}
/** Static class whose various methods are functions for clipping geometry
 * @public
 */
export declare class ClipUtilities {
    private static _selectIntervals01TestPoint;
    /**
     * * Augment the unsortedFractionsArray with 0 and 1
     * * sort
     * * test the midpoint of each interval with `clipper.isPointOnOrInside`
     * * pass accepted intervals to `announce(f0,f1,curve)`
     */
    static selectIntervals01(curve: CurvePrimitive, unsortedFractions: GrowableFloat64Array, clipper: Clipper, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /**
     * Announce triples of (low, high, cp) for each entry in intervals
     * @param intervals source array
     * @param cp CurvePrimitive for announcement
     * @param announce function to receive data
     */
    static announceNNC(intervals: Range1d[], cp: CurvePrimitive, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /** Find portions of the curve that are within the clipper.
     * Collect them into an array of curve primitives.
     */
    static collectClippedCurves(curve: CurvePrimitive, clipper: Clipper): CurvePrimitive[];
    /**
     * Clip a polygon down to regions defined by each shape of a ClipShape.
     * @return An multidimensional array of points, where each array is the boundary of part of the remaining polygon.
     */
    static clipPolygonToClipShape(polygon: Point3d[], clipShape: ClipPrimitive): Point3d[][];
    /**
     * Clip a polygon down to regions defined by each shape of a ClipShape.
     * @return An multidimensional array of points, where each array is the boundary of part of the remaining polygon.
     */
    static clipPolygonToClipShapeReturnGrowableXYZArrays(polygon: Point3d[], clipShape: ClipPrimitive): GrowableXYZArray[];
    /** Given an array of points, test for trivial containment conditions.
     * * ClipStatus.TrivialAccept if all points are in any one of the convexSet's.
     * * ClipStatus.ClipRequired if (in any single convexSet) there were points on both sides of any single plane.
     * * ClipStatus.TrivialReject if neither of those occurred.
     */
    static pointSetSingleClipStatus(points: GrowableXYZArray, planeSet: UnionOfConvexClipPlaneSets, tolerance: number): ClipStatus;
    /**
     * Emit point loops for intersection of a convex set with a range.
     * * return zero length array for (a) null range or (b) no intersections
     * @param range range to intersect
     * @param includeConvexSetFaces if false, do not compute facets originating as convex set planes.
     * @param includeRangeFaces if false, do not compute facets originating as range faces
     * @param ignoreInvisiblePlanes if true, do NOT compute a facet for convex set faces marked invisible.
     */
    static announceLoopsOfConvexClipPlaneSetIntersectRange(convexSet: ConvexClipPlaneSet, range: Range3d, loopFunction: (loopPoints: GrowableXYZArray) => void, includeConvexSetFaces?: boolean, includeRangeFaces?: boolean, ignoreInvisiblePlanes?: boolean): void;
    /**
     * Return a (possibly empty) array of geometry (Loops !!) which are facets of the intersection of the convex set intersecting a range.
     * * return zero length array for (a) null range or (b) no intersections
     * @param range range to intersect
     * @param includeConvexSetFaces if false, do not compute facets originating as convex set planes.
     * @param includeRangeFaces if false, do not compute facets originating as range faces
     * @param ignoreInvisiblePlanes if true, do NOT compute a facet for convex set faces marked invisible.
     */
    static loopsOfConvexClipPlaneIntersectionWithRange(convexSet: ConvexClipPlaneSet, range: Range3d, includeConvexSetFaces?: boolean, includeRangeFaces?: boolean, ignoreInvisiblePlanes?: boolean): GeometryQuery[];
    /**
     * Return the (possibly null) range of the intersection of the convex set with a range.
     * * The convex set is permitted to be unbounded (e.g. a single plane).  The range parameter provides bounds.
     * @param convexSet convex set for intersection.
     * @param range range to intersect
     */
    static rangeOfConvexClipPlaneSetIntersectionWithRange(convexSet: ConvexClipPlaneSet, range: Range3d): Range3d;
    /**
     * Return the range of various types of clippers
     * * `ConvexClipPlaneSet` -- dispatch to `rangeOfConvexClipPlaneSetIntersectionWithRange`
     * * `UnionOfConvexClipPlaneSet` -- union of ranges of member `ConvexClipPlaneSet`
     * * `ClipPrimitive` -- access its `UnionOfConvexClipPlaneSet`.
     * * `ClipVector` -- intersection of the ranges of its `ClipPrimitive`.
     * * `undefined` -- entire input range.
     * * If `observeInvisibleFlag` is false, the "invisible" properties are ignored, and this effectively returns the range of the edge work of the members
     * * If `observeInvisibleFlag` is false, the "invisible" properties are observed, and "invisible" parts do not restrict the range.
     * @param clipper
     * @param range non-null range.
     * @param observeInvisibleFlag indicates how "invisible" bit is applied for ClipPrimitive.
     */
    static rangeOfClipperIntersectionWithRange(clipper: ConvexClipPlaneSet | UnionOfConvexClipPlaneSets | ClipPrimitive | ClipVector | undefined, range: Range3d, observeInvisibleFlag?: boolean): Range3d;
    /**
     * Test if various types of clippers have any intersection with a range.
     * * This follows the same logic as `rangeOfClipperIntersectionWithRange` but attempts to exit at earliest point of confirmed intersection
     * * `ConvexClipPlaneSet` -- dispatch to `doesConvexClipPlaneSetIntersectRange`
     * * `UnionOfConvexClipPlaneSet` -- union of ranges of member `ConvexClipPlaneSet`
     * * `ClipPrimitive` -- access its `UnionOfConvexClipPlaneSet`.
     * * `ClipVector` -- intersection of the ranges of its `ClipPrimitive`.
     * * `undefined` -- entire input range.
     * * If `observeInvisibleFlag` is false, the "invisible" properties are ignored, and holes do not affect the result.
     * * If `observeInvisibleFlag` is true, the "invisible" properties are observed, and may affect the result.
     * @param clipper
     * @param range non-null range.
     * @param observeInvisibleFlag indicates how "invisible" bit is applied for ClipPrimitive.
     */
    static doesClipperIntersectRange(clipper: ConvexClipPlaneSet | UnionOfConvexClipPlaneSets | ClipPrimitive | ClipVector | undefined, range: Range3d, observeInvisibleFlag?: boolean): boolean;
    /**
     * Emit point loops for intersection of a convex set with a range.
     * * return zero length array for (a) null range or (b) no intersections
     * @param range range to intersect
     * @param includeConvexSetFaces if false, do not compute facets originating as convex set planes.
     * @param includeRangeFaces if false, do not compute facets originating as range faces
     * @param ignoreInvisiblePlanes if true, do NOT compute a facet for convex set faces marked invisible.
     */
    static doesConvexClipPlaneSetIntersectRange(convexSet: ConvexClipPlaneSet, range: Range3d, includeConvexSetFaces?: boolean, includeRangeFaces?: boolean, ignoreInvisiblePlanes?: boolean): boolean;
}
//# sourceMappingURL=ClipUtils.d.ts.map