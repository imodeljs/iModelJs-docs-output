/** @module Numerics */
import { Point2d, Vector2d } from "../geometry3d/Point2dVector2d";
import { Range1d } from "../geometry3d/Range";
export declare class Ray2d {
    private _origin;
    private _direction;
    private constructor();
    static createOriginAndTarget(origin: Point2d, target: Point2d): Ray2d;
    static createOriginAndDirection(origin: Point2d, direction: Vector2d): Ray2d;
    static createOriginAndDirectionCapture(origin: Point2d, direction: Vector2d): Ray2d;
    readonly origin: Point2d;
    readonly direction: Vector2d;
    /**
     *  Return a ray that is parallel at distance to the left, specified as fraction of the ray's direction vector.
     */
    parallelRay(leftFraction: number): Ray2d;
    CCWPerpendicularRay(): Ray2d;
    CWPerpendicularRay(): Ray2d;
    normalizeDirectionInPlace(): boolean;
    /**
     * Intersect this ray (ASSUMED NORMALIZED) with unbounded line defined by points.
     *  (The normalization assumption affects test for parallel vectors.)
     *  Fraction and dhds passed as number[] to use by reference... Sticking to return of true and false in the case fraction is zero after
     *  a true safe divide
     */
    intersectUnboundedLine(linePointA: Point2d, linePointB: Point2d, fraction: number[], dhds: number[]): boolean;
    /** return the ray fraction where point projects to the ray */
    projectionFraction(point: Point2d): number;
    /** return the fraction of projection to the perpendicular ray */
    perpendicularProjectionFraction(point: Point2d): number;
    /** Return point from origin plus a scaled vector */
    fractionToPoint(f: number): Point2d;
}
export declare class ConvexPolygon2d {
    private _hullPoints;
    constructor(points: Point2d[]);
    /** Create the hull */
    static createHull(points: Point2d[]): ConvexPolygon2d;
    /** Create the hull. First try to use the points as given. */
    static createHullIsValidCheck(points: Point2d[]): ConvexPolygon2d;
    /** Return a reference of the hull points. */
    readonly points: Point2d[];
    /** Test if hull points are a convex, CCW polygon */
    static isValidConvexHull(points: Point2d[]): boolean;
    /** Return true if the convex hull (to the left of the edges) contains the test point */
    containsPoint(point: Point2d): boolean;
    /** Return the largest outside. (return 0 if in or on) */
    distanceOutside(xy: Point2d): number;
    /** Offset the entire hull (in place) by distance.
     * Returns false if an undefined occurred from normalizing (could occur after changing some hull points already)
     */
    offsetInPlace(distance: number): boolean;
    /**
     * Return 2 distances bounding the intersection of the ray with a convex hull.
     * ASSUME (for tolerancing) the ray has normalized direction vector.
     * Both negative and positive distances along the ray are possible.
     * Returns range with extremities if less than 3 points, distanceA > distanceB, or if cross product < 0
     */
    clipRay(ray: Ray2d): Range1d;
    /** Return the range of (fractional) ray postions for projections of all points from the arrays. */
    rangeAlongRay(ray: Ray2d): Range1d;
    /** Return the range of (fractional) ray postions for projections of all points from the arrays. */
    rangePerpendicularToRay(ray: Ray2d): Range1d;
    /** Computes the hull of a convex polygon from points given. Returns the hull as a new Point2d array.
     *  Returns an empty hull if less than 3 points are given.
     */
    static computeConvexHull(points: Point2d[]): Point2d[];
}
//# sourceMappingURL=ConvexPolygon2d.d.ts.map