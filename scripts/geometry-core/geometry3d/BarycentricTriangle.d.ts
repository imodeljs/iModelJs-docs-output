import { Point3d } from "./Point3dVector3d";
/** @module CartesianGeometry */
/**
 * 3 points defining a triangle to be evaluated with Barycentric coordinates.
 * @public
 */
export declare class BarycentricTriangle {
    /** Array of 3 point coordinates for the triangle. */
    points: Point3d[];
    /** Constructor.
     * * Point references are CAPTURED
     */
    protected constructor(point0: Point3d, point1: Point3d, point2: Point3d);
    /**
     * Return a `BarycentricTriangle` with coordinates given by enumerated x,y,z of the 3 points.
     * @param result optional pre-allocated triangle.
     */
    static createXYZXYZXYZ(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, result?: BarycentricTriangle): BarycentricTriangle;
    /** create a triangle with coordinates cloned from given points. */
    static create(point0: Point3d, point1: Point3d, point2: Point3d, result?: BarycentricTriangle): BarycentricTriangle;
    /** Return a new `BarycentricTriangle` with the same coordinates. */
    clone(result?: BarycentricTriangle): BarycentricTriangle;
    /** Return area divided by sum of squared lengths. */
    readonly aspectRatio: number;
    /** Return the area of the triangle. */
    readonly area: number;
    /** Sum the points with given scales.
     * * In normal use, the scales will add to 1 and the result point is in the plane of the triangle.
     * * If scales do not add to 1, the point is in the triangle scaled (by the scale sum) from the origin.
     */
    fractionToPoint(a0: number, a1: number, a2: number, result?: Point3d): Point3d;
    /** Copy all values from `other`
     */
    setFrom(other: BarycentricTriangle): void;
    /** copy contents of (not pointers to) the given points. */
    set(point0: Point3d | undefined, point1: Point3d | undefined, point2: Point3d | undefined): void;
    private static _workVector0?;
    private static _workVector1?;
    /**
     * * For `this` and `other` BarycentricTriangles, compute cross products of vectors from point0 to point1 and from point0 to point2.
     * * return the dot product of those two
     */
    dotProductOfCrossProductsFromOrigin(other: BarycentricTriangle): number;
    /** Return the centroid of the 3 points. */
    centroid(result?: Point3d): Point3d;
    /** test for point-by-point `isAlmostEqual` relationship. */
    isAlmostEqual(other: BarycentricTriangle): boolean;
}
//# sourceMappingURL=BarycentricTriangle.d.ts.map