/** @module CartesianGeometry */
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Segment1d } from "../geometry3d/Segment1d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { LineSegment3d } from "../curve/LineSegment3d";
import { Arc3d } from "../curve/Arc3d";
import { Clipper } from "./ClipUtils";
import { AnnounceNumberNumberCurvePrimitive } from "../curve/CurvePrimitive";
import { ConvexClipPlaneSet } from "./ConvexClipPlaneSet";
/**
 * A collection of ConvexClipPlaneSets.
 * * A point is "in" the clip plane set if it is "in" one or more of  the ConvexClipPlaneSet
 * * Hence the boolean logic is that the ClipPlaneSet is a UNION of its constituents.
 */
export declare class UnionOfConvexClipPlaneSets implements Clipper {
    private _convexSets;
    readonly convexSets: ConvexClipPlaneSet[];
    private constructor();
    toJSON(): any;
    static fromJSON(json: any, result?: UnionOfConvexClipPlaneSets): UnionOfConvexClipPlaneSets;
    static createEmpty(result?: UnionOfConvexClipPlaneSets): UnionOfConvexClipPlaneSets;
    /**
     * @returns Return true if all member convex sets are almostEqual to corresponding members of other.  This includes identical order in array.
     * @param other clip plane to compare
     */
    isAlmostEqual(other: UnionOfConvexClipPlaneSets): boolean;
    static createConvexSets(convexSets: ConvexClipPlaneSet[], result?: UnionOfConvexClipPlaneSets): UnionOfConvexClipPlaneSets;
    clone(result?: UnionOfConvexClipPlaneSets): UnionOfConvexClipPlaneSets;
    addConvexSet(toAdd: ConvexClipPlaneSet): void;
    testRayIntersect(point: Point3d, direction: Vector3d): boolean;
    getRayIntersection(point: Point3d, direction: Vector3d): number | undefined;
    isPointInside(point: Point3d): boolean;
    isPointOnOrInside(point: Point3d, tolerance: number): boolean;
    isSphereInside(point: Point3d, radius: number): boolean;
    /** test if any part of a line segment is within the volume */
    isAnyPointInOrOnFromSegment(segment: LineSegment3d): boolean;
    /** Returns the fractions of the segment that pass through the set region, as 1 dimensional pieces */
    appendIntervalsFromSegment(segment: LineSegment3d, intervals: Segment1d[]): void;
    transformInPlace(transform: Transform): void;
    /** Returns 1, 2, or 3 based on whether point is strongly inside, ambiguous, or strongly outside respectively */
    classifyPointContainment(points: Point3d[], onIsOutside: boolean): number;
    /** Clip a polygon using this ClipPlaneSet, returning new polygon boundaries. Note that each polygon may lie next to the previous, or be disconnected. */
    polygonClip(input: Point3d[], output: Point3d[][]): void;
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
    announceClippedArcIntervals(arc: Arc3d, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /**
     * Returns range if result does not cover a space of infinity, otherwise undefined.
     * Note: If given a range for output, overwrites it, rather than extending it.
     */
    getRangeOfAlignedPlanes(transform?: Transform, result?: Range3d): Range3d | undefined;
    multiplyPlanesByMatrix(matrix: Matrix4d): void;
    setInvisible(invisible: boolean): void;
    addOutsideZClipSets(invisible: boolean, zLow?: number, zHigh?: number): void;
}
//# sourceMappingURL=UnionOfConvexClipPlaneSets.d.ts.map