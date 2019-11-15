/** @module CartesianGeometry */
import { Point2d, Vector2d, XY } from "./geometry3d/Point2dVector2d";
import { XAndY } from "./geometry3d/XYZProps";
import { Point3d, Vector3d, XYZ } from "./geometry3d/Point3dVector3d";
import { Point4d } from "./geometry4d/Point4d";
import { AngleSweep } from "./geometry3d/AngleSweep";
/** Enumeration of the 6 possible orderings of XYZ axis order
 * @public
 */
export declare enum AxisOrder {
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
/** Enumeration of numeric indices of 3 axes AxisIndex.X, AxisIndex.Y, AxisIndex.Z
 * @public
 */
export declare enum AxisIndex {
    /** x axis is index 0 */
    X = 0,
    /** y axis is index 1 */
    Y = 1,
    /** 2 axis is index 2 */
    Z = 2
}
/** Standard views.   Used in `Matrix3d.createStandardViewAxes (index: StandardViewIndex, worldToView :boolean)`
 * @public
 */
export declare enum StandardViewIndex {
    /** X to right, Y up */
    Top = 1,
    /** X to right, negative Y up */
    Bottom = 2,
    /** negative Y to right, Z up */
    Left = 3,
    /**  Y to right, Z up */
    Right = 4,
    /** X to right, Z up */
    Front = 5,
    /** negative X to right, Z up */
    Back = 6,
    /** View towards origin from (-1,-1,1) */
    Iso = 7,
    /** View towards origin from (1,-1,1) */
    RightIso = 8
}
/** Enumeration among choice for how a coordinate transformation should incorporate scaling.
 * @public
 */
export declare enum AxisScaleSelect {
    /** All axes of unit length. */
    Unit = 0,
    /** On each axis, the vector length matches the longest side of the range of the data. */
    LongestRangeDirection = 1,
    /** On each axis, the vector length matches he length of the corresponding edge of the range. */
    NonUniformRangeContainment = 2
}
/** object with a radians value and its associated cosine and sine values.
 * @public
 */
export interface TrigValues {
    /** the cosine value */
    c: number;
    /** the sine value */
    s: number;
    /** the radians value */
    radians: number;
}
/**
 * Interface so various plane representations can be used by algorithms that just want altitude evaluations.
 *
 * Specific implementors are
 * * Plane3dByOriginAndUnitNormal
 * * Point4d (used for homogeneous plane coefficients)
 * @public
 */
export interface PlaneAltitudeEvaluator {
    /**
   * Return the altitude of the point from the plane.
   * @param point point for evaluation
   */
    altitude(point: Point3d): number;
    /**
       * Return the altitude of the point from the plane, with the point supplied as simple x,y,z
       * @param x x coordinate
       * @param y y coordinate
       * @param z z coordinate
       */
    altitudeXYZ(x: number, y: number, z: number): number;
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
/**
 * Interface for `toJSON` and `setFromJSON` methods
 * @public
 */
export interface BeJSONFunctions {
    /**
     * Set content from a JSON object.
     * If the json object is undefined or unrecognized, always set a default value.
     */
    setFromJSON(json: any): void;
    /** Return a json object with this object's contents. */
    toJSON(): any;
}
/** The Properties for a JSON representation of an Angle.
 * If value is a number, it is in *degrees*.
 * If value is an object, it can have either degrees or radians.
 * @public
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
 * @public
 */
export declare type AngleSweepProps = AngleSweep | {
    degrees: [number, number];
} | {
    radians: [number, number];
} | [number, number];
/**
 * Class containing static methods for typical numeric operations.
 * * Experimentally, methods like Geometry.hypotenuse are observed to be faster than the system intrinsics.
 * * This is probably due to
 *    * Fixed length arg lists
 *    * strongly typed parameters
 * @public
 */
export declare class Geometry {
    /** Tolerance for small distances in metric coordinates */
    static readonly smallMetricDistance = 0.000001;
    /** Square of `smallMetricTolerance` */
    static readonly smallMetricDistanceSquared = 1e-12;
    /** tolerance for small angle measured in radians. */
    static readonly smallAngleRadians = 1e-12;
    /** square of `smallAngleRadians` */
    static readonly smallAngleRadiansSquared = 1e-24;
    /** numeric value that may considered huge for numbers expected to be 0..1 fractions.
     * * But note that the "allowed" result value is vastly larger than 1.
     */
    static readonly largeFractionResult = 10000000000;
    /** numeric value that may considered huge for numbers expected to be coordinates.
     * * This allows larger results than `largeFractionResult`.
     */
    static readonly largeCoordinateResult = 10000000000000;
    /** numeric value that may considered infinite for metric coordinates.
     * * This coordinate should be used only as a placeholder indicating "at infinity" -- computing actual points at this coordinate invites numerical problems.
     */
    static readonly hugeCoordinate = 1000000000000;
    /** Test if absolute value of x is huge.
     * * See `Geometry.hugeCoordinate`
     */
    static isHugeCoordinate(x: number): boolean;
    /** Test if a number is odd.
     */
    static isOdd(x: number): boolean;
    /** Radians value for full circle 2PI radians minus `smallAngleRadians` */
    static readonly fullCircleRadiansMinusSmallAngle: number;
    /** Correct `distance` to zero if smaller than metric tolerance.   Otherwise return it unchanged. */
    static correctSmallMetricDistance(distance: number, replacement?: number): number;
    /**
   * If `a` is large enough for safe division, return `1/a`, using Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
   * @param a denominator of division
   */
    static inverseMetricDistance(a: number): number | undefined;
    /**
     * If `a` is large enough, return `1/a`, using the square of Geometry.smallMetricDistance as the tolerance for declaring it as divide by zero.  Otherwise return `undefined`.
     * @param a denominator of division
     */
    static inverseMetricDistanceSquared(a: number): number | undefined;
    /** Boolean test for metric coordinate near-equality */
    static isSameCoordinate(x: number, y: number, tol?: number): boolean;
    /** Boolean test for metric coordinate near-equality, with toleranceFactor applied to the usual smallMetricDistance */
    static isSameCoordinateWithToleranceFactor(x: number, y: number, toleranceFactor: number): boolean;
    /** Boolean test for metric coordinate near-equality of x, y pair */
    static isSameCoordinateXY(x0: number, y0: number, x1: number, y1: number, tol?: number): boolean;
    /** Boolean test for squared metric coordinate near-equality */
    static isSameCoordinateSquared(x: number, y: number): boolean;
    /** boolean test for small `dataA.distance (dataB)`  within `smallMetricDistance` */
    static isSamePoint3d(dataA: Point3d, dataB: Point3d): boolean;
    /** boolean test for distance between `XYZ` objects within `smallMetricDistance`
     *  * Note that Point3d and Vector3d are both derived from XYZ, so this method tolerates mixed types.
     */
    static isSameXYZ(dataA: XYZ, dataB: XYZ): boolean;
    /** boolean test for small `dataA.distanceXY (dataB)`  within `smallMetricDistance` */
    static isSamePoint3dXY(dataA: Point3d, dataB: Point3d): boolean;
    /** boolean test for small `dataA.distanceXY (dataB)`  within `smallMetricDistance` */
    static isSameVector3d(dataA: Vector3d, dataB: Vector3d): boolean;
    /** boolean test for small `dataA.distanceXY (dataB)`  within `smallMetricDistance` */
    static isSamePoint2d(dataA: Point2d, dataB: Point2d): boolean;
    /** boolean test for small `dataA.distanceXY (dataB)`  within `smallMetricDistance` */
    static isSameVector2d(dataA: Vector2d, dataB: Vector2d): boolean;
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with x as first test, y second.
     * * This is appropriate for a horizontal sweep in the plane.
     */
    static lexicalXYLessThan(a: XY | XYZ, b: XY | XYZ): -1 | 0 | 1;
    /**
     * Lexical comparison of (a.x,a.y) (b.x,b.y) with y as first test, x second.
     * * This is appropriate for a vertical sweep in the plane.
     */
    static lexicalYXLessThan(a: XY | XYZ, b: XY | XYZ): -1 | 0 | 1;
    /**
     * Lexical test, based on x first, y second, z third.
     */
    static lexicalXYZLessThan(a: XYZ, b: XYZ): -1 | 0 | 1;
    /** Test if `value` is small compared to `smallAngleRadians`.
     * * This is appropriate if `value` is know to be a typical 0..1 fraction.
     */
    static isSmallRelative(value: number): boolean;
    /** Test if `value` is small compared to `smallAngleRadians` */
    static isSmallAngleRadians(value: number): boolean;
    /** Toleranced equality test, using tolerance `smallAngleRadians * ( 1 + abs(a) + (abs(b)))`
     * * Effectively an absolute tolerance of `smallAngleRadians`, with tolerance increasing for larger values of a and b.
    */
    static isAlmostEqualNumber(a: number, b: number): boolean;
    /** Toleranced equality test, using caller-supplied tolerance. */
    static isDistanceWithinTol(distance: number, tol: number): boolean;
    /** Toleranced equality test, using `smallMetricDistance` tolerance. */
    static isSmallMetricDistance(distance: number): boolean;
    /** Toleranced equality, using `smallMetricDistanceSquared` tolerance. */
    static isSmallMetricDistanceSquared(distanceSquared: number): boolean;
    /** Return `axis modulo 3` with proper handling of negative indices (-1 is z), -2 is y, -3 is x etc) */
    static cyclic3dAxis(axis: number): number;
    /** Return the AxisOrder for which axisIndex is the first named axis.
     * * `axisIndex===0`returns AxisOrder.XYZ
     * * `axisIndex===1`returns AxisOrder.YZX
     * * `axisIndex===2`returns AxisOrder.ZXY
     */
    static axisIndexToRightHandedAxisOrder(axisIndex: AxisIndex): AxisOrder;
    /** Return the largest absolute distance from a to either of b0 or b1 */
    static maxAbsDiff(a: number, b0: number, b1: number): number;
    /** Return the largest absolute absolute value among x,y,z */
    static maxAbsXYZ(x: number, y: number, z: number): number;
    /** Return the largest absolute absolute value among x,y */
    static maxAbsXY(x: number, y: number): number;
    /** Return the largest signed value among a, b, c */
    static maxXYZ(a: number, b: number, c: number): number;
    /** Examine the value (particularly sign) of x.
     * * If x is negative, return outNegative.
     * * If x is true zero, return outZero
     * * If x is positive, return outPositive
     */
    static split3WaySign(x: number, outNegative: number, outZero: number, outPositive: number): number;
    /** Return the largest signed value among a, b */
    static maxXY(a: number, b: number): number;
    /** Return the smallest signed value among a, b */
    static minXY(a: number, b: number): number;
    /** Return the hypotenuse `sqrt(x*x + y*y)`. This is much faster than `Math.hypot(x,y)`. */
    static hypotenuseXY(x: number, y: number): number;
    /** Return the squared `hypotenuse (x*x + y*y)`. */
    static hypotenuseSquaredXY(x: number, y: number): number;
    /** Return the square of x */
    static square(x: number): number;
    /** Return the hypotenuse `sqrt(x*x + y*y + z*z)`. This is much faster than `Math.hypot(x,y,z)`. */
    static hypotenuseXYZ(x: number, y: number, z: number): number;
    /** Return the squared hypotenuse `(x*x + y*y + z*z)`. This is much faster than `Math.hypot(x,y,z)`. */
    static hypotenuseSquaredXYZ(x: number, y: number, z: number): number;
    /** Return the (full 4d) hypotenuse `sqrt(x*x + y*y + z*z + w*w)`. This is much faster than `Math.hypot(x,y,z,w)`. */
    static hypotenuseXYZW(x: number, y: number, z: number, w: number): number;
    /** Return the squared hypotenuse `(x*x + y*y + z*z+w*w)`. This is much faster than `Math.hypot(x,y,z)`. */
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
    /** Returns Returns the triple product of 3 vectors provided as x,y,z number sequences.
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
    /** Returns the determinant of the 4x4 matrix unrolled as the 16 parameters.
     */
    static determinant4x4(xx: number, xy: number, xz: number, xw: number, yx: number, yy: number, yz: number, yw: number, zx: number, zy: number, zz: number, zw: number, wx: number, wy: number, wz: number, ww: number): number;
    /**
   * Returns curvature magnitude from a first and second derivative vector.
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
    /** 2D cross product of vectors layed out as scalars. */
    static crossProductXYXY(ux: number, uy: number, vx: number, vy: number): number;
    /** 3D cross product of vectors layed out as scalars. */
    static crossProductXYZXYZ(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, result?: Vector3d): Vector3d;
    /** magnitude of 3D cross product of vectors, with the vectors presented as */
    static crossProductMagnitude(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number): number;
    /** 3D dot product of vectors layed out as scalars. */
    static dotProductXYZXYZ(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number): number;
    /** 2D dot product of vectors layed out as scalars. */
    static dotProductXYXY(ux: number, uy: number, vx: number, vy: number): number;
    /**
     * Clamp to (min(a,b), max(a,b))
     * @param x
     * @param a
     * @param b
     */
    static clampToStartEnd(x: number, a: number, b: number): number;
    /**
     * Clamp value to (min,max) with no test for order of (min,max)
     * @param value value to clamp
     * @param min smallest allowed output
     * @param max largest allowed result.
     */
    static clamp(value: number, min: number, max: number): number;
    /** If given a number, return it.   If given undefined, return `defaultValue`. */
    static resolveNumber(value: number | undefined, defaultValue?: number): number;
    /** simple interpolation between values, but choosing (based on fraction) a or b as starting point for maximum accuracy. */
    static interpolate(a: number, f: number, b: number): number;
    /** given an axisOrder (e.g. XYZ, YZX, ZXY, XZYLeftHanded etc) and an (integer) offset, resolve to an axis index. */
    static axisOrderToAxis(order: AxisOrder, index: number): number;
    /** Return (a modulo period), e.g. for use as a cyclic index.  Both a and period may be negative. */
    static modulo(a: number, period: number): number;
    /** return 0 if the value is undefined, 1 if defined. */
    static defined01(value: any): number;
    /** normally, return numerator/denominator.
     * but if the ratio would exceed Geometry.largeFractionResult, return undefined.
     */
    static conditionalDivideFraction(numerator: number, denominator: number): number | undefined;
    /** normally, return numerator/denominator.
     * but if the ratio would exceed Geometry.largestResult, return undefined.
     */
    static conditionalDivideCoordinate(numerator: number, denominator: number, largestResult?: number): number | undefined;
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