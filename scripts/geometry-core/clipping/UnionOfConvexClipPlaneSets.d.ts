/** @module CartesianGeometry */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Segment1d } from "../geometry3d/Segment1d";
import { Range3d, Range1d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { LineSegment3d } from "../curve/LineSegment3d";
import { Arc3d } from "../curve/Arc3d";
import { Clipper } from "./ClipUtils";
import { AnnounceNumberNumberCurvePrimitive } from "../curve/CurvePrimitive";
import { ConvexClipPlaneSet } from "./ConvexClipPlaneSet";
import { Ray3d } from "../geometry3d/Ray3d";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
/**
 * A collection of ConvexClipPlaneSets.
 * * A point is "in" the clip plane set if it is "in" one or more of  the ConvexClipPlaneSet
 * * Hence the boolean logic is that the ClipPlaneSet is a UNION of its constituents.
 * @public
 */
export declare class UnionOfConvexClipPlaneSets implements Clipper {
    private _convexSets;
    /** (property accessor)  Return the (reference to the) array of `ConvexClipPlaneSet` */
    readonly convexSets: ConvexClipPlaneSet[];
    private constructor();
    /** Return an array with the `toJSON` form of each  `ConvexClipPlaneSet` */
    toJSON(): any;
    /** Convert json `UnionOfConvexClipPlaneSets`, using `setFromJSON`. */
    static fromJSON(json: any, result?: UnionOfConvexClipPlaneSets): UnionOfConvexClipPlaneSets;
    /** Create a `UnionOfConvexClipPlaneSets` with no members. */
    static createEmpty(result?: UnionOfConvexClipPlaneSets): UnionOfConvexClipPlaneSets;
    /**
     * Return true if all member convex sets are almostEqual to corresponding members of other.  This includes identical order in array.
     * @param other clip plane to compare
     */
    isAlmostEqual(other: UnionOfConvexClipPlaneSets): boolean;
    /** Create a `UnionOfConvexClipPlaneSets` with given `ConvexClipPlaneSet` members */
    static createConvexSets(convexSets: ConvexClipPlaneSet[], result?: UnionOfConvexClipPlaneSets): UnionOfConvexClipPlaneSets;
    /** return a deep copy. */
    clone(result?: UnionOfConvexClipPlaneSets): UnionOfConvexClipPlaneSets;
    /** Append `toAdd` to the array of `ConvexClipPlaneSet` */
    addConvexSet(toAdd: ConvexClipPlaneSet): void;
    /** Test if there is any intersection with a ray defined by origin and direction.
     * * Optionally record the range (null or otherwise) in caller-allocated result.
     * * If the ray is unbounded inside the clip, result can contain positive or negative "Geometry.hugeCoordinate" values
     * * If no result is provide, there are no object allocations.
     * @param maximalRange optional Range1d to receive parameters along the ray.
     */
    hasIntersectionWithRay(ray: Ray3d, maximalRange?: Range1d): boolean;
    /** Return true if true is returned for any contained convex set returns true for `convexSet.isPointInside (point, tolerance)`  */
    isPointInside(point: Point3d): boolean;
    /** Return true if true is returned for any contained convex set returns true for `convexSet.isPointOnOrInside (point, tolerance)`  */
    isPointOnOrInside(point: Point3d, tolerance?: number): boolean;
    /** Return true if true is returned for any contained convex set returns true for `convexSet.isSphereOnOrInside (point, tolerance)`  */
    isSphereInside(point: Point3d, radius: number): boolean;
    /** test if any part of a line segment is within the volume */
    isAnyPointInOrOnFromSegment(segment: LineSegment3d): boolean;
    /** Returns the fractions of the segment that pass through the set region, as 1 dimensional pieces */
    appendIntervalsFromSegment(segment: LineSegment3d, intervals: Segment1d[]): void;
    /** apply `transform` to all the ConvexClipPlaneSet's */
    transformInPlace(transform: Transform): void;
    /** Returns 1, 2, or 3 based on whether point is strongly inside, ambiguous, or strongly outside respectively */
    classifyPointContainment(points: Point3d[], onIsOutside: boolean): number;
    /** Clip a polygon using this ClipPlaneSet, returning new polygon boundaries. Note that each polygon may lie next to the previous, or be disconnected. */
    polygonClip(input: GrowableXYZArray | Point3d[], output: GrowableXYZArray[]): void;
    /**
     * * announce clipSegment() for each convexSet in this ClipPlaneSet.
     * * all clipPlaneSets are inspected
     * * announced intervals are for each individual clipPlaneSet -- adjacent intervals are not consolidated.
     * @param f0 active interval start.
     * @param f1 active interval end
     * @param pointA line segment start
     * @param pointB line segment end
     * @param announce function to announce interval.
     * @returns Return true if any announcements are made.
     */
    announceClippedSegmentIntervals(f0: number, f1: number, pointA: Point3d, pointB: Point3d, announce?: (fraction0: number, fraction1: number) => void): boolean;
    private static _clipArcFractionArray;
    /** Find parts of an arc that are inside any member clipper.
     * Announce each with `announce(startFraction, endFraction, this)`
     */
    announceClippedArcIntervals(arc: Arc3d, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /**
     * Collect the output from computePlanePlanePlaneIntersections in all the contained convex sets.
     *
     * @param transform (optional) transform to apply to the points.
     * @param points (optional) array to which computed points are to be added.
     * @param range (optional) range to be extended by the computed points
     * @param transform (optional) transform to apply to the accepted points.
     * @param testContainment if true, test each point to see if it is within the convex set.  (Send false if confident that the convex set is rectilinear set such as a slab.  Send true if chiseled corners are possible)
     * @returns number of points.
     */
    computePlanePlanePlaneIntersectionsInAllConvexSets(points: Point3d[] | undefined, rangeToExtend: Range3d | undefined, transform?: Transform, testContainment?: boolean): number;
    /**
     * Multiply all ClipPlanes DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     */
    multiplyPlanesByMatrix4d(matrix: Matrix4d, invert?: boolean, transpose?: boolean): boolean;
    /** Recursively call `setInvisible` on all member convex sets. */
    setInvisible(invisible: boolean): void;
    /** add convex sets that accept points below `zLow` and above `zHigh` */
    addOutsideZClipSets(invisible: boolean, zLow?: number, zHigh?: number): void;
}
//# sourceMappingURL=UnionOfConvexClipPlaneSets.d.ts.map