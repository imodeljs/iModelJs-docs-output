/** @module CartesianGeometry */
import { Point2d, Vector2d, XY } from "./geometry3d/Point2dVector2d";
import { XAndY } from "./geometry3d/XYZProps";
import { Point3d, Vector3d, XYZ } from "./geometry3d/Point3dVector3d";
import { Point4d } from "./geometry4d/Point4d";
import { AngleSweep } from "./geometry3d/AngleSweep";
/** Enumeration of the 6 possible orderings of XYZ axis order */
export declare const enum AxisOrder {
    /** Right handed system, X then Y then Z */
    XYZ = 0,
    /** Right handed system, Y then Z then X */
    YZX = 1,
    /** Right handed system, Z then X then Y */
    ZXY = 2,
    /** Left handed system, X then Z then Y */
    XZY = 4,
    /** Left handed system, Y then X then Z */
    YXZ = 5,
    /** Left handed system, Z then Y then X */
    ZYX = 6
}
export declare const enum AxisIndex {
    X = 0,
    Y = 1,
    Z = 2
}
export declare const enum StandardViewIndex {
    Top = 1,
    Bottom = 2,
    Left = 3,
    Right = 4,
    Front = 5,
    Back = 6,
    Iso = 7,
    RightIso = 8
}
/** Enumeration among choice for how a coordinate transformation should incorporate scaling. */
export declare const enum AxisScaleSelect {
    /** All axes of unit length. */
    Unit = 0,
    /** On each axis, the vector length matches the longest side of the range of the data. */
    LongestRangeDirection = 1,
    /** On each axis, the vector length matches he length of the corresponding edge of the range. */
    NonUniformRangeContainment = 2
}
export interface TrigValues {
    c: number;
    s: number;
    radians: number;
}
/**
 * Interface so various plane representations can be used by algorithms that just want altitude evaluations.
 *
 * Specific implementors are
 * * Plane3dByOriginAndUnitNormal
 * * Point4d (used for homogeneous plane coefficients)
 */
export interface PlaneAltitudeEvaluator {
    /**
     * Return the altitude of the point from the plane.
     * @param point point for evaluation
     */
    altitude(point: Point3d): number;
    /**
     * Return the derivative of altitude wrt motion along a vector.
     * @param point point for evaluation
     */
    velocity(vector: Vector3d): number;
    /**
     * Return the derivative of altitude wrt motion along a vector given by components
     * @param point point for evaluation
     */
    velocityXYZ(x: number, y: number, z: number): number;
    /**
     * Return the weighted altitude
     * @param point xyzw data.
     */
    weightedAltitude(point: Point4d): number;
}
export interface BeJSONFunctions {
    /**
     * Set content from a JSON object.
     * If the json object is undefined or unrecognized, always set a default value.
     */
    setFromJSON(json: any): void;
    toJSON(): any;
}
/** The Properties for a JSON representation of an Angle.
 * If value is a number, it is in *degrees*.
 * If value is an object, it can have either degrees or radians.
 */
export declare type AngleProps = {
    degrees: number;
} | {
    radians: number;
} | {
    _radians: number;
} | {
    _degrees: number;
} | number;
/** The Properties for a JSON representation of an AngleSweep.
 * * The json data is always start and end angles as a pair in an array.
 * If AngleProps data is an array of two numbers, it is an angle in degrees.
 * If the AngleProps is an object with key degrees, the degrees value must be an array with the two degrees angles as numbers
 * If the AngleProps is an object with key radians, the radians value must be an array with the two radians angles as numbers
 */
export declare type AngleSweepProps = AngleSweep | {
    degrees: [number, number];
} | {
    radians: [number, number];
} | [number, number];
export declare class Geometry {
    static readonly smallMetricDistance = 0.000001;
    static readonly smallMetricDistanceSquared = 1e-12;
    static readonly smallAngleRadians = 1e-12;
    static readonly smallAngleRadiansSquared = 1e-24;
    static readonly largeFractionResult = 10000000000;
    static readonly fullCircleRadiansMinusSmallAngle: number;
    /** Points and vectors can be emitted in two forms:
      *
      * *  preferJSONArray === true :       [x,y,z]
      * *  preferJSONArray === false :      {x: 1, y: 2, z: 3}
      */
    static correctSmallMetricDistance(distance: number, replacement?: number): number;
    /**
   * @returns If `a` is large enough, return `1/a`, using Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
   * @param a denominator of division
   */
    static inverseMetricDistance(a: number): number | undefined;
    /**
     * @returns If `a` is large enough, return `1/a`, using the square of Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
     * @param a denominator of division
     */
    static inverseMetricDistanceSquared(a: number): number | undefined;
    static isSameCoordinate(x: number, y: number, tol?: number): boolean;
    static isSameCoordinateSquared(x: number, y: number): boolean;
    static isSamePoint3d(dataA: Point3d, dataB: Point3d): boolean;
    static isSameXYZ(dataA: XYZ, dataB: XYZ): boolean;
    static isSamePoint3dXY(dataA: Point3d, dataB: Point3d): boolean;
    static isSameVector3d(dataA: Vector3d, dataB: Vector3d): boolean;
    static isSamePoint2d(dataA: Point2d, dataB: Point2d): boolean;
    static isSameVector2d(dataA: Vector2d, dataB: Vector2d): boolean;
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with x as first test, y second.
     */
    static lexicalXYLessThan(a: XY | XYZ, b: XY | XYZ): 1 | 0 | -1;
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with y as first test, x second.
     */
    static lexicalYXLessThan(a: XY | XYZ, b: XY | XYZ): 1 | 0 | -1;
    static lexicalXYZLessThan(a: XYZ, b: XYZ): 1 | 0 | -1;
    static isSmallRelative(value: number): boolean;
    static isSmallAngleRadians(value: number): boolean;
    static isAlmostEqualNumber(a: number, b: number): boolean;
    static isDistanceWithinTol(distance: number, tol: number): boolean;
    static isSmallMetricDistance(distance: number): boolean;
    static isSmallMetricDistanceSquared(distanceSquared: number): boolean;
    static cyclic3dAxis(axis: number): number;
    /** Return the AxisOrder for which axisIndex is the first named axis.
     * * `axisIndex===0`returns AxisOrder.XYZ
     * * `axisIndex===1`returns AxisOrder.YZX
     * * `axisIndex===2`returns AxisOrder.ZXY
     */
    static axisIndexToRightHandedAxisOrder(axisIndex: AxisIndex): AxisOrder;
    /** @returns the largest absolute distance from a to either of b0 or b1 */
    static maxAbsDiff(a: number, b0: number, b1: number): number;
    /** @returns the largest absolute absolute value among x,y,z */
    static maxAbsXYZ(x: number, y: number, z: number): number;
    /** @returns the largest absolute absolute value among x,y */
    static maxAbsXY(x: number, y: number): number;
    /** @returns the largest signed value among a, b, c */
    static maxXYZ(a: number, b: number, c: number): number;
    /** @returns the largest signed value among a, b*/
    static maxXY(a: number, b: number): number;
    /** @returns Return the hypotenuse sqrt(x\*x + y\*y). This is much faster than Math.hypot(x,y).*/
    static hypotenuseXY(x: number, y: number): number;
    /** @returns Return the squared hypotenuse (x\*x + y\*y). */
    static hypotenuseSquaredXY(x: number, y: number): number;
    /** @returns Return the square of x */
    static square(x: number): number;
    /** @returns Return the hypotenuse sqrt(x\*x + y\*y). This is much faster than Math.hypot(x,y, z).*/
    static hypotenuseXYZ(x: number, y: number, z: number): number;
    static hypotenuseSquaredXYZ(x: number, y: number, z: number): number;
    static hypotenuseXYZW(x: number, y: number, z: number, w: number): number;
    static hypotenuseSquaredXYZW(x: number, y: number, z: number, w: number): number;
    /**
     * Return the distance between xy points given as numbers.
     * @param x0 x coordinate of point 0
     * @param y0 y coordinate of point 0
     * @param x1 x coordinate of point 1
     * @param y1 y coordinate of point 1
     */
    static distanceXYXY(x0: number, y0: number, x1: number, y1: number): number;
    /**
     * Return the distance between xyz points given as numbers.
     * @param x0 x coordinate of point 0
     * @param y0 y coordinate of point 0
     * @param z0 z coordinate of point 0
     * @param x1 x coordinate of point 1
     * @param y1 y coordinate of point 1
     * @param z1 z coordinate of point 1
     */
    static distanceXYZXYZ(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): number;
    /** @returns Returns the triple product of 3 vectors provided as x,y,z number sequences.
     *
     * * The triple product is the determinant of the 3x3 matrix with the 9 numbers placed in either row or column order.
     * * The triple product is positive if the 3 vectors form a right handed coordinate system.
     * * The triple product is negative if the 3 vectors form a left handed coordinate system.
     * * Treating the 9 numbers as 3 vectors U, V, W, any of these formulas gives the same result:
     *
     * ** U dot (V cross W)
     * ** V dot (W cross U)
     * ** W dot (U cross V)
     * **  (-U dot (W cross V))  -- (note the negative -- reversing cross product order changes the sign)
     * ** (-V dot (U cross W)) -- (note the negative -- reversing cross product order changes the sign)
     * ** (-W dot (V cross U)) -- (note the negative -- reversing cross product order changes the sign)
     * * the triple product is 6 times the (signed) volume of the tetrahedron with the three vectors as edges from a common vertex.
     */
    static tripleProduct(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, wx: number, wy: number, wz: number): number;
    /**
   * @returns Returns curvature magnitude from a first and second derivative vector.
   * @param ux  first derivative x component
   * @param uy first derivative y component
   * @param uz first derivative z component
   * @param vx second derivative x component
   * @param vy second derivative y component
   * @param vz second derivative z component
   */
    static curvatureMagnitude(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number): number;
    /** Returns the determinant of 3x3 matrix with x and y rows taken from 3 points, third row from corresponding numbers.
     *
     */
    static tripleProductXYW(columnA: XAndY, weightA: number, columnB: XAndY, weightB: number, columnC: XAndY, weightC: number): number;
    /** Returns the determinant of 3x3 matrix with x and y rows taken from 3 points, third row from corresponding numbers.
     *
     */
    static tripleProductPoint4dXYW(columnA: Point4d, columnB: Point4d, columnC: Point4d): number;
    /**  2D cross product of vectors layed out as scalars. */
    static crossProductXYXY(ux: number, uy: number, vx: number, vy: number): number;
    /**  3D cross product of vectors layed out as scalars. */
    static crossProductXYZXYZ(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, result?: Vector3d): Vector3d;
    /**  magnitude of 3D cross product of vectors, with the vectors presented as */
    static crossProductMagnitude(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number): number;
    /**  3D dot product of vectors layed out as scalars. */
    static dotProductXYZXYZ(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number): number;
    static clampToStartEnd(x: number, a: number, b: number): number;
    static clamp(value: number, min: number, max: number): number;
    /** simple interpolation between values, but choosing (based on fraction) a or b as starting point for maximum accuracy. */
    static interpolate(a: number, f: number, b: number): number;
    /** given an axisOrder (e.g. XYZ, YZX, ZXY, XZYLeftHanded etc) and an (integer) offset, resolve to an axis index. */
    static axisOrderToAxis(order: AxisOrder, index: number): number;
    /** Return (a modulo period), e.g. for use as a cyclid index.  Both a and period may be negative. */
    static modulo(a: number, period: number): number;
    /** return 0 if the value is undefined, 1 if defined. */
    static defined01(value: any): number;
    /** normally, return numerator/denominator.
     * but if the ratio would exceed Geometry.largeFractionResult, return undefined.
     */
    static conditionalDivideFraction(numerator: number, denominator: number): number | undefined;
    /** return the 0, 1, or 2 pairs of (c,s) values that solve
     * {constCoff + cosCoff * c + sinCoff * s = }
     * with the constraint {c*c+s*s = 1}
     */
    static solveTrigForm(constCoff: number, cosCoff: number, sinCoff: number): Vector2d[] | undefined;
    /** normally,  return the number result of conditionalDivideFraction.
     * but if conditionalDivideFraction fails return specified default number.
     */
    static safeDivideFraction(numerator: number, denominator: number, defaultResult: number): number;
    /** For a line f(x) whose function values at x0 and x1 are f0 and f1, return the x value at which f(x)=fTarget;
     */
    static inverseInterpolate(x0: number, f0: number, x1: number, f1: number, targetF?: number, defaultResult?: number): number | undefined;
    /** For a line f(x) whose function values at x=0 and x=1 are f0 and f1, return the x value at which f(x)=fTarget;
     */
    static inverseInterpolate01(f0: number, f1: number, targetF?: number): number | undefined;
    /** Return true if json is an array with at least minEntries, and all entries are numbers (including those beyond minEntries) */
    static isNumberArray(json: any, minEntries?: number): boolean;
    /** Return true if json is an array of at least numNumberArrays, with at least minEntries in each number array.
     */
    static isArrayOfNumberArray(json: any, numNumberArray: number, minEntries?: number): boolean;
    /** return the number of steps to take so that numSteps * stepSize >= total.
     * minCount is returned for both (a) setSize 0 or less and (b) stepSize > total.
     * A small tolerance is applied for almost
    */
    static stepCount(stepSize: number, total: number, minCount?: number, maxCount?: number): number;
    /** Test if x is in simple 0..1 interval.  But optionally skip the test.  (this odd behavior is very convenient for code that sometimes does not do the filtering.)
     * @param x value to test.
     * @param apply01 if false, accept all x.
     */
    static isIn01(x: number, apply01?: boolean): boolean;
    /** Test if x is in simple 0..1 interval.  But optionally skip the test.  (this odd behavior is very convenient for code that sometimes does not do the filtering.)
     * @param x value to test.
     * @param apply01 if false, accept all x.
     */
    static isIn01WithTolerance(x: number, tolerance: number): boolean;
    /**
     * restrict x so it is in the interval `[a,b]`, allowing a,b to be in either order.
     * @param x
     * @param a (usually the lower) interval limit
     * @param b (usually the upper) interval limit
     */
    static restrictToInterval(x: number, a: number, b: number): number;
}
//# sourceMappingURL=Geometry.d.ts.map