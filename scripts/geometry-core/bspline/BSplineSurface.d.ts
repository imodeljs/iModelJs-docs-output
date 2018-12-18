import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { KnotVector } from "./KnotVector";
import { Point4d } from "../geometry4d/Point4d";
import { GeometryQuery } from "../curve/GeometryQuery";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
/**
 * UVSelect is an integer indicating uDirection (0) or vDirection (1) in a bspline surface parameterization.
 */
export declare enum UVSelect {
    uDirection = 0,
    VDirection = 1
}
export declare enum WeightStyle {
    /** There are no weights. */
    UnWeighted = 0,
    /**
     * * Data is weighted
     * * point with normalized coordinate `[x,y,z]` and weight `w` has weights already multiplied in as `[x*w,y*w,z*w,w]`
     * */
    WeightsAlreadyAppliedToCoordinates = 1,
    /**
     * * Data is weighted
     * * point with normalized coordinate `[x,y,z]` and weight `w` has is `[x,y,z,w]`
     * */
    WeightsSeparateFromCoordinates = 2
}
/**
 * interface for points returned from getPointGrid, with annotation of physical and weighting dimensions.
 */
export interface PackedPointGrid {
    /**
     * Array of coordinate data.
     * * points[row] is all the data for a grid row.
     * * points[row][j] is the j'th point across the row
     * * points[row][j][k] is numeric value k.
     */
    points: number[][][];
    /**
     * Description of how weights are present in the coordinate data.
    */
    weightStyle?: WeightStyle;
    /**
     * number of cartesian dimensions, e.g. 2 or 3.
     */
    numCartesianDimensions: number;
}
/** Interface for methods supported by both regular (xyz) and weighted (xyzw) bspline surfaces. */
export interface BSplineSurface3dQuery {
    fractionToPoint(uFractioin: number, vFraction: number): Point3d;
    fractionToRigidFrame(uFraction: number, vFraction: number): Transform | undefined;
    knotToPoint(uKnot: number, vKnot: number): Point3d;
    tryTransformInPlace(transform: Transform): boolean;
    clone(): BSplineSurface3dQuery;
    cloneTransformed(transform: Transform): BSplineSurface3dQuery;
    reverseInPlace(select: UVSelect): void;
    isSameGeometryClass(other: any): boolean;
    extendRange(range: Range3d, transform?: Transform): void;
    isAlmostEqual(other: any): boolean;
    isClosable(select: UVSelect): boolean;
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    numPolesTotal(): number;
    /**
     * turn a numeric variable into a UVSelect (strict 0 or 1).
     */
    numberToUVSelect(value: number): UVSelect;
    /**
     * Return the degree in in selected direction (0 for u, 1 for v)
     * @param select 0 for u, 1 for v
     */
    degreeUV(select: UVSelect): number;
    /**
     * Return the order in in selected direction (0 for u, 1 for v)
     * @param select 0 for u, 1 for v
     */
    orderUV(select: UVSelect): number;
    /**
     * Return the number of bezier spans in selected direction (0 for u, 1 for v)
     * @param select 0 for u, 1 for v
     */
    numSpanUV(select: UVSelect): number;
    /**
     * Return the number of poles in selected direction (0 for u, 1 for v)
     * @param select 0 for u, 1 for v
     */
    numPolesUV(select: UVSelect): number;
    /**
     * Return the step between adjacent poles in selected direction (0 for u, 1 for v)
     * @param select 0 for u, 1 for v
     */
    poleStepUV(select: UVSelect): number;
    /**
    * Return control points json arrays.
    * * Each row of points is an an array.
    * * Within the array for each row, each point is an array [x,y,z] or [x,y,z,w].
    * * The PackedPointGrid indicates if weights are present.
    */
    getPointGridJSON(): PackedPointGrid;
}
/** Bspline knots and poles for 2d-to-Nd.
 * * This abstract class in not independently instantiable -- GeometryQuery methods must be implemented by derived classes.
 */
export declare abstract class BSpline2dNd extends GeometryQuery {
    knots: KnotVector[];
    coffs: Float64Array;
    poleDimension: number;
    private _numPoles;
    degreeUV(select: UVSelect): number;
    orderUV(select: UVSelect): number;
    numSpanUV(select: UVSelect): number;
    numPolesTotal(): number;
    numPolesUV(select: UVSelect): number;
    poleStepUV(select: UVSelect): number;
    static validOrderAndPoleCounts(orderU: number, numPolesU: number, orderV: number, numPolesV: number, numUV: number): boolean;
    getPoint3dPole(i: number, j: number, result?: Point3d): Point3d | undefined;
    getPoint3dPoleXYZW(i: number, j: number, result?: Point3d): Point3d | undefined;
    /**
     * @param value numeric value to convert to strict 0 or 1.
     * @returns Return 0 for 0 input, 1 for any nonzero input.
     */
    numberToUVSelect(value: number): UVSelect;
    /** extend a range, treating each block as simple XYZ */
    extendRangeXYZ(rangeToExtend: Range3d, transform?: Transform): void;
    /** extend a range, treating each block as homogeneous xyzw, with weight at offset 3 */
    extendRangeXYZH(rangeToExtend: Range3d, transform?: Transform): void;
    /**
     * abstract declaration for evaluation of (unweighted) 3d point and derivatives.
     * Derived classes must implement to get fractionToRigidFrame support.
     * @param _fractionU u parameter
     * @param _fractionV v parameter
     * @param _result optional result.
     */
    abstract fractionToPointAndDerivatives(_fractionU: number, _fractionV: number, _result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors | undefined;
    /**
       * evaluate the surface at u and v fractions. Return a (squared, right handed) coordinate frame at that point on the surface.
       * @param fractionU u parameter
       * @param fractionV v parameter
       * @param result undefined if surface derivatives are parallel (or either alone is zero)
       */
    fractionToRigidFrame(fractionU: number, fractionV: number, result?: Transform): Transform | undefined;
    protected _basisBufferUV: Float64Array[];
    protected _basisBuffer1UV: Float64Array[];
    protected _poleBuffer: Float64Array;
    protected _poleBuffer1UV: Float64Array[];
    /**
     * initialize arrays for given spline dimensions.
     */
    protected constructor(numPolesU: number, numPolesV: number, poleLength: number, knotsU: KnotVector, knotsV: KnotVector);
    /**
     * Map a position, specified as (uv direction, bezier span, fraction within the bezier), to an overal knot value.
     * @param select selector indicating U or V direction.
     * @param span index of bezier span
     * @param localFraction fractional coordinate within the bezier span
     */
    spanFractionToKnot(select: UVSelect, span: number, localFraction: number): number;
    spanFractionsToBasisFunctions(select: UVSelect, spanIndex: number, spanFraction: number, f: Float64Array, df?: Float64Array): void;
    /** sum poles by the weights in the basisBuffer, using poles for given span */
    sumPoleBufferForSpan(spanIndexU: number, spanIndexV: number): void;
    /** sum derivatives by the weights in the basisBuffer, using poles for given span */
    sumpoleBufferDerivativesForSpan(spanIndexU: number, spanIndexV: number): void;
    evaluateBuffersAtKnot(u: number, v: number, numDerivative?: number): void;
    private swapBlocks;
    /**
     * Reverse the parameter direction for either u or v.
     * @param select direction to reverse -- 0 for u, 1 for v.
     */
    reverseInPlace(select: UVSelect): void;
    /**
     * Set the flag indicating the bspline might be suitable for having wrapped "closed" interpretation.
     */
    setWrappable(select: UVSelect, value: boolean): void;
    /**
     * Test if `degree` leading and trailing (one of U or V) blocks match, as if the data is an unwrapped closed spline in the slected direction.
     * @param select select U or V direction
     * @returns true if coordinates matched.
     */
    isClosable(select: UVSelect): boolean;
}
/**  BSplineSurface3d is a parametric surface in xyz space.
 * * This (BSplineSurface3d) is an unweighted surface.   Use the separate class BSplineSurface3dH for a weighted surface.
 *
 * The various static "create" methods have subtle differences in how grid sizes are conveyed:
 * | Method | control point array | counts |
 * | create | flat array of [x,y,z] | arguments numPolesU, numPolesV |
 * | createGrid | array of array of [x,y,z ] | There are no `numPolesU` or `numPolesV` args. The counts are conveyed by the deep arrays |
 */
export declare class BSplineSurface3d extends BSpline2dNd implements BSplineSurface3dQuery {
    isSameGeometryClass(other: any): boolean;
    tryTransformInPlace(transform: Transform): boolean;
    getPole(i: number, j: number, result?: Point3d): Point3d | undefined;
    private constructor();
    /**
     * Return control points json arrays.
     * * if `flatArray===true`, each point appears as an array [x,y,z] in row-major order of a containing array.
     * * if `flatArray===false` each row of points is an an array of [x,y,z] in an array.  Each of these row arrays is in the result array.
     * @param flatArray if true, retur
     */
    getPointArray(flatArray?: boolean): any[];
    /**
     * Return control points json arrays.
     * * Each row of points is an an array.
     * * Within the array for each row, each point is an array [x,y,z]
     */
    getPointGridJSON(): PackedPointGrid;
    /** Return a simple array of the control points coordinates */
    copyPointsFloat64Array(): Float64Array;
    /**
     * return a simple array form of the knots.  optionally replicate the first and last
     * in classic over-clamped manner
     */
    copyKnots(select: UVSelect, includeExtraEndKnot: boolean): number[];
    /** Create a bspline surface.
     * * This `create` variant takes control points in a "flattened" array, with
     *  points from succeeding U rows packed together in one array.  Use `createGrid` if the points are in
     *  a row-by-row grid structure
     * * knotArrayU and knotArrayV are optional -- uniform knots are implied if they are omited (undefined).
     * *  When knots are given, two knot count conditions are recognized:
     * * + If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * * + If poleArray.length + order == knotArray.length + 2, the knots are in modern form that does not have
     *      the classic unused first and last knot.
     * @param controlPointArray Array of points, ordered along the U direction.
     * @param numPoleU number of poles in each row in the U direction.
     * @param orderU order for the U direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayU knots for the V direction.  See note above about knot counts.
     * @param numPoleV number of poles in each row in the U direction.
     * @param orderV order for the V direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayV knots for the V direction.  See note above about knot counts.
     */
    static create(controlPointArray: Point3d[] | Float64Array, numPolesU: number, orderU: number, knotArrayU: number[] | Float64Array | undefined, numPolesV: number, orderV: number, knotArrayV: number[] | Float64Array | undefined): BSplineSurface3d | undefined;
    /** Create a bspline surface.
     * * This `create` variant takes control points in a "grid" array, with the points from
     * each grid row `[rowIndex]` being an independent array `points[rowIndex][indexAlongRow][x,y,z]`
     * * knotArrayU and knotArrayV are optional -- uniform knots are implied if they are omited (undefined).
     * *  When knots are given, two knot count conditions are recognized:
     * * + If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * * + If poleArray.length + order == knotArray.length + 2, the knots are in modern form that does not have
     *      the classic unused first and last knot.
     * @param controlPointArray Array of points, ordered along the U direction.
     * @param numPoleU number of poles in each row in the U direction.
     * @param orderU order for the U direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayU knots for the V direction.  See note above about knot counts.
     * @param numPoleV number of poles in each row in the U direction.
     * @param orderV order for the V direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayV knots for the V direction.  See note above about knot counts.
     */
    static createGrid(points: number[][][], orderU: number, knotArrayU: number[] | Float64Array | undefined, orderV: number, knotArrayV: number[] | Float64Array | undefined): BSplineSurface3d | undefined;
    /**
     * @returns Return a complete copy of the bspline surface.
     */
    clone(): BSplineSurface3d;
    /**
     * Return a complete copy of the bspline surface, with a transform applied to the control points.
     * @param transform transform to apply to the control points
     */
    cloneTransformed(transform: Transform): BSplineSurface3d;
    /** Evaluate at a position given by u and v coordinates in knot space.
     * @param u u value, in knot range.
     * @param v v value in knot range.
   * @returns Return the xyz coordinates on the surface.
     */
    knotToPoint(u: number, v: number): Point3d;
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivatives(u: number, v: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Evalute at a position given by fractional coordinte in each direction.
       * @param fractionU u coordinate, as a fraction of the knot range.
       * @param fractionV v coordinate, as a fraction of the knot range.
     * @returns Return the xyz coordinates on the surface.
     */
    fractionToPoint(fractionU: number, fractionV: number): Point3d;
    /**
     * evaluate the surface at u and v fractions.
     * @returns plane with origin at the surface point, direction vectors are derivatives in the u and v directions.
     * @param fractionU u coordinate, as a fraction of the knot range.
     * @param fractionV v coordinate, as a fraction of the knot range.
     * @param result optional pre-allocated object for return values.
     * @returns Returns point and derivative directions.
     */
    fractionToPointAndDerivatives(fractionU: number, fractionV: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    isAlmostEqual(other: any): boolean;
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
/**  BsplinceCurve in xyzw homogeneous space */
export declare class BSplineSurface3dH extends BSpline2dNd implements BSplineSurface3dQuery {
    isSameGeometryClass(other: any): boolean;
    tryTransformInPlace(transform: Transform): boolean;
    getPole(i: number, j: number, result?: Point3d): Point3d | undefined;
    private constructor();
    /** Return a simple array of the control points. */
    copyPoints4d(): Point4d[];
    /** Return a simple array of the control points. */
    copyPointsAndWeights(points: Point3d[], weights: number[], formatter?: (x: number, y: number, z: number) => any): void;
    /**
     * return a simple array form of the knots.  optionally replicate the first and last
     * in classic over-clamped manner
     */
    copyKnots(select: UVSelect, includeExtraEndKnot: boolean): number[];
    /** Create a weighted bspline surface, with control points and weights each organized as flattened array of points continuing from one U row to the next.
     * * This `create` variant takes control points in a "flattened" array, with
     *  points from succeeding U rows packed together in one array.  Use `createGrid` if the points are in
     *  a deeper grid array structure.
     * * knotArrayU and knotArrayV are optional -- uniform knots are implied if they are omited (undefined).
     * *  When knots are given, two knot count conditions are recognized:
     * * * If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * * * If poleArray.length + order == knotArray.length + 2, the knots are in modern form that does not have
     *      the classic unused first and last knot.
     * @param controlPointArray Array of points, ordered along the U direction.
     * @param weightArray array of weights, ordered along the U direction.
     * @param numPoleU number of poles in each row in the U direction.
     * @param orderU order for the U direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayU optional knots for the V direction.  See note above about knot counts.
     * @param numPoleV number of poles in each row in the U direction.
     * @param orderV order for the V direction polynomial (`order` is one more than the `degree`.  "cubic" polynomial is order 4.)
     * @param KnotArrayV optional knots for the V direction.  See note above about knot counts.
     */
    static create(controlPointArray: Point3d[], weightArray: number[], numPolesU: number, orderU: number, knotArrayU: number[] | undefined, numPolesV: number, orderV: number, knotArrayV: number[] | undefined): BSplineSurface3dH | undefined;
    /** Create a bspline with given knots.
     *
     *   Two count conditions are recognized in each direction:
     *
     * ** If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * ** If poleArray.length + order == knotArray.length + 2, the knots are in modern form.
     *
     */
    static createGrid(xyzwGrid: number[][][], weightStyle: WeightStyle, orderU: number, knotArrayU: number[], orderV: number, knotArrayV: number[]): BSplineSurface3dH | undefined;
    clone(): BSplineSurface3dH;
    cloneTransformed(transform: Transform): BSplineSurface3dH;
    /**
      * Return control points json arrays.
      * * Each row of points is an an array.
      * * Within the array for each row, each point is an array [wx,wy,wz,w].
      */
    getPointGridJSON(): PackedPointGrid;
    /** Evaluate at a position given by a knot value.  */
    knotToPoint4d(u: number, v: number): Point4d;
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivatives(u: number, v: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    fractionToPoint4d(fractionU: number, fractionV: number): Point4d;
    /**
     * * evaluate the surface and return the cartesian (weight = 1) point.
     * * if the surface XYZW point has weight0, returns point3d at 000.
     * @param fractionU u direction fraction
     * @param fractionV v direction fraction
     * @param result optional result
     */
    fractionToPoint(fractionU: number, fractionV: number, result?: Point3d): Point3d;
    /**
   * * evaluate the surface and return the cartesian (weight = 1) point.
   * * if the surface XYZW point has weight0, returns point3d at 000.
   * @param knotU u direction knot
   * @param knotV v direction knot
   * @param result optional result
   */
    knotToPoint(knotU: number, knotV: number, result?: Point3d): Point3d;
    /**
     * evaluate the surface at u and v fractions.
     * @returns plane with origin at the surface point, direction vectors are derivatives in the u and v directions.
     * @param fractionU u coordinate, as a fraction of the knot range.
     * @param fractionV v coordinate, as a fraction of the knot range.
     * @param result optional pre-allocated object for return values.
     * @returns Returns point and derivative directions.
     */
    fractionToPointAndDerivatives(fractionU: number, fractionV: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    isAlmostEqual(other: any): boolean;
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /**
     * Pass `this` (strongly typed) to `handler.handleBsplineSurface3dH(this)`.
     * @param handler double dispatch handler.
     */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * extend a range to include the (optionally transformed) points of this surface
     * @param rangeToExtend range that is updaatd to include this surface range
     * @param transform transform to apply to the surface points
     */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
//# sourceMappingURL=BSplineSurface.d.ts.map