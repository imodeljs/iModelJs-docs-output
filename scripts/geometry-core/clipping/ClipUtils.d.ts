import { Point3d } from "../PointVector";
import { Range1d } from "../Range";
import { GrowableFloat64Array, GrowableXYZArray } from "../GrowableArray";
import { Arc3d } from "../curve/Arc3d";
import { UnionOfConvexClipPlaneSets } from "./UnionOfConvexClipPlaneSets";
import { CurvePrimitive, AnnounceNumberNumber, AnnounceNumberNumberCurvePrimitive } from "../curve/CurvePrimitive";
import { ClipShape } from "./ClipPrimitive";
/** Enumerated type for describing where geometry lies with respect to clipping planes. */
export declare const enum ClipPlaneContainment {
    StronglyInside = 1,
    Ambiguous = 2,
    StronglyOutside = 3
}
/** Enumerated type for describing what must yet be done to clip a piece of geometry. */
export declare const enum ClipStatus {
    ClipRequired = 0,
    TrivialReject = 1,
    TrivialAccept = 2
}
/** An object containing clipping planes that can be used to clip geometry. */
export interface Clipper {
    isPointOnOrInside(point: Point3d, tolerance?: number): boolean;
    /** Find the parts of the line segment  (if any) that is within the convex clip volume.
     * * The input fractional interval from fraction0 to fraction1 (increasing!!) is the active part to consider.
     * * To clip to the usual bounded line segment, start with fractions (0,1).
     * If the clip volume is unbounded, the line interval may also be unbounded.
     * * An unbounded line portion will have fraction coordinates positive or negative Number.MAX_VALUE.
     * @param fraction0 fraction that is the initial lower fraction of the active interval. (e.g. 0.0 for bounded segment)
     * @param fraction1 fraction that is the initial upper fraction of the active interval.  (e.g. 1.0 for bounded segment)
     * @param pointA segment start (fraction 0)
     * @param pointB segment end (fraction 1)
     * @param announce function to be called to announce a fraction interval that is within the convex clip volume.
     * @returns true if a segment was announced, false if entirely outside.
     */
    announceClippedSegmentIntervals(f0: number, f1: number, pointA: Point3d, pointB: Point3d, announce?: AnnounceNumberNumber): boolean;
    announceClippedArcIntervals(arc: Arc3d, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
}
/** Static class whose various methods are functions for clipping geometry. */
export declare class ClipUtilities {
    private static _selectIntervals01TestPoint;
    static selectIntervals01(curve: CurvePrimitive, unsortedFractions: GrowableFloat64Array, clipper: Clipper, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /**
     * Announce triples of (low, high, cp) for each entry in intervals
     * @param intervals source array
     * @param cp CurvePrimitive for announcement
     * @param announce funtion to receive data
     */
    static announceNNC(intervals: Range1d[], cp: CurvePrimitive, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    static collectClippedCurves(curve: CurvePrimitive, clipper: Clipper): CurvePrimitive[];
    /**
     * Clip a polygon down to regions defined by each shape of a ClipShape.
     * @return An multidimensional array of points, where each array is the boundary of part of the remaining polygon.
     */
    static clipPolygonToClipShape(polygon: Point3d[], clipShape: ClipShape): Point3d[][];
    /** Given an array of points, return whether or not processing is required to clip to a ClipPlaneSet region. */
    static pointSetSingleClipStatus(points: GrowableXYZArray, planeSet: UnionOfConvexClipPlaneSets, tolerance: number): ClipStatus;
}
//# sourceMappingURL=ClipUtils.d.ts.map