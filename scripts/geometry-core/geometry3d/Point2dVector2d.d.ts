/** @module CartesianGeometry */
import { BeJSONFunctions } from "../Geometry";
import { Angle } from "./Angle";
import { XAndY, XYProps } from "./XYZProps";
/** Minimal object containing x,y and operations that are meaningful without change in both point and vector.
 *  * `XY` is not instantiable.
 *  * The derived (instantiable) classes are
 *    * `Point2d`
 *    * `Vector2d`
 * @public
 */
export declare class XY implements XAndY {
    /** x component */
    x: number;
    /** y component */
    y: number;
    /** Set both x and y. */
    set(x?: number, y?: number): void;
    /** Set both x and y to zero */
    setZero(): void;
    protected constructor(x?: number, y?: number);
    /** Set both x and y from other. */
    setFrom(other?: XAndY): void;
    /** Freeze this instance (and its deep content) so it can be considered read-only */
    freeze(): void;
    /** Returns true if this and other have equal x,y parts within Geometry.smallMetricDistance. */
    isAlmostEqual(other: XAndY, tol?: number): boolean;
    /** Returns true if this and other have equal x,y parts within Geometry.smallMetricDistance. */
    isAlmostEqualXY(x: number, y: number, tol?: number): boolean;
    /** return a json array  `[x,y]`   */
    toJSON(): XYProps;
    /** return a json object `{x: 1, y:2}`  */
    toJSONXY(): XYProps;
    /** Set x and y from a JSON source such as `[1,2]` or `{x:1, y:2}` */
    setFromJSON(json?: XYProps): void;
    /** Return the distance from this point to other */
    distance(other: XAndY): number;
    /** Return squared distance from this point to other */
    distanceSquared(other: XAndY): number;
    /** Return the largest absolute distance between corresponding components */
    maxDiff(other: XAndY): number;
    /** returns true if the x,y components are both small by metric metric tolerance */
    readonly isAlmostZero: boolean;
    /** Return the largest absolute value of any component */
    maxAbs(): number;
    /** Return the magnitude of the vector */
    magnitude(): number;
    /** Return the squared magnitude of the vector.  */
    magnitudeSquared(): number;
    /** returns true if the x,y components are exactly equal. */
    isExactEqual(other: XAndY): boolean;
    /** returns true if x,y match `other` within metric tolerance */
    isAlmostEqualMetric(other: XAndY): boolean;
    /** Return a (full length) vector from this point to other */
    vectorTo(other: XAndY, result?: Vector2d): Vector2d;
    /** Return a unit vector from this point to other */
    unitVectorTo(target: XAndY, result?: Vector2d): Vector2d | undefined;
    /** cross product of vectors from origin to targets */
    static crossProductToPoints(origin: XAndY, targetA: XAndY, targetB: XAndY): number;
}
/** 2D point with `x`,`y` as properties
 * @public
 */
export declare class Point2d extends XY implements BeJSONFunctions {
    /** Constructor for Point2d */
    constructor(x?: number, y?: number);
    /** return a new Point2d with x,y coordinates from this. */
    clone(): Point2d;
    /**
     * Return a point (newly created unless result provided) with given x,y coordinates
     * @param x x coordinate
     * @param y y coordinate
     * @param result optional result
     */
    static create(x?: number, y?: number, result?: Point2d): Point2d;
    /** Convert JSON `[1,2]` or `{x:1, y:2}` to a Point2d instance */
    static fromJSON(json?: XYProps): Point2d;
    /** Create (or optionally reuse) a Point2d from another object with fields x and y */
    static createFrom(xy: XAndY | undefined, result?: Point2d): Point2d;
    /** Create a Point2d with both coordinates zero. */
    static createZero(result?: Point2d): Point2d;
    /** Starting at this point, move along vector by tangentFraction of the vector length, and to the left by leftFraction of
     * the perpendicular vector length.
     * @param tangentFraction distance to move along the vector, as a fraction of vector
     * @param leftFraction distance to move perpendicular to the vector, as a fraction of the rotated vector
     */
    addForwardLeft(tangentFraction: number, leftFraction: number, vector: Vector2d): Point2d;
    /** Interpolate at tangentFraction between this instance and point.   Move by leftFraction along the xy perpendicular
     * of the vector between the points.
     */
    forwardLeftInterpolate(tangentFraction: number, leftFraction: number, point: XAndY): Point2d;
    /** Return a point interpolated between this point and the right param. */
    interpolate(fraction: number, other: XAndY, result?: Point2d): Point2d;
    /** Return a point with independent x,y fractional interpolation. */
    interpolateXY(fractionX: number, fractionY: number, other: XAndY, result?: Point2d): Point2d;
    /** Return this point minus vector */
    minus(vector: XAndY, result?: Point2d): Point2d;
    /** Return point plus vector */
    plus(vector: XAndY, result?: Point2d): Point2d;
    /** Return point plus vector */
    plusXY(dx?: number, dy?: number, result?: Point2d): Point2d;
    /** Return point + vector * scalar */
    plusScaled(vector: XAndY, scaleFactor: number, result?: Point2d): Point2d;
    /** Return point + vectorA * scalarA + vectorB * scalarB */
    plus2Scaled(vectorA: XAndY, scalarA: number, vectorB: XAndY, scalarB: number, result?: Point2d): Point2d;
    /** Return point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC */
    plus3Scaled(vectorA: XAndY, scalarA: number, vectorB: XAndY, scalarB: number, vectorC: XAndY, scalarC: number, result?: Point2d): Point2d;
    /**
     * Return the dot product of vector from this to targetA and vector from this to targetB
     * @param targetA target of first vector
     * @param targetB target of second vector
     */
    dotVectorsToTargets(targetA: XAndY, targetB: XAndY): number;
    /** Returns the (scalar) cross product of two points/vectors, computed from origin to target1 and target2 */
    crossProductToPoints(target1: XAndY, target2: XAndY): number;
    /** Return the fractional coordinate of the projection of this instance x,y onto the line from startPoint to endPoint.
     * @param startPoint start point of line
     * @param endPoint end point of line
     * @param defaultFraction fraction to return if startPoint and endPoint are equal.
     */
    fractionOfProjectionToLine(startPoint: Point2d, endPoint: Point2d, defaultFraction?: number): number;
}
/** 2D vector with `x`,`y` as properties
 * @public
 */
export declare class Vector2d extends XY implements BeJSONFunctions {
    constructor(x?: number, y?: number);
    /** Return a new Vector2d with the same x,y */
    clone(): Vector2d;
    /** Return a new Vector2d with given x and y */
    static create(x?: number, y?: number, result?: Vector2d): Vector2d;
    /** Return a (new) Vector2d with components 1,0 */
    static unitX(scale?: number): Vector2d;
    /** Return a (new) Vector2d with components 0,1 */
    static unitY(scale?: number): Vector2d;
    /** Return a Vector2d with components 0,0 */
    static createZero(result?: Vector2d): Vector2d;
    /** copy contents from another Point3d, Point2d, Vector2d, or Vector3d, or leading entries of Float64Array */
    static createFrom(data: XAndY | Float64Array, result?: Vector2d): Vector2d;
    /** Return a new Vector2d from json structured as `[1,2]` or `{x:1,y:2}` */
    static fromJSON(json?: XYProps): Vector2d;
    /** Return a new Vector2d from polar coordinates for radius and Angle from x axis */
    static createPolar(r: number, theta: Angle): Vector2d;
    /** Return a new Vector2d extending from point0 to point1 */
    static createStartEnd(point0: XAndY, point1: XAndY, result?: Vector2d): Vector2d;
    /**
     * Return a vector that bisects the angle between two normals and extends to the intersection of two offset lines
     * @param unitPerpA unit perpendicular to incoming direction
     * @param unitPerpB  unit perpendicular to outgoing direction
     * @param offset offset distance
     */
    static createOffsetBisector(unitPerpA: Vector2d, unitPerpB: Vector2d, offset: number): Vector2d | undefined;
    /** Return a (new or optionally reused) vector which is `this` divided by denominator
     * * return undefined if denominator is zero.
     */
    safeDivideOrNull(denominator: number, result?: Vector2d): Vector2d | undefined;
    /** Return a unit vector in direction of this instance (undefined if this instance has near zero length) */
    normalize(result?: Vector2d): Vector2d | undefined;
    /** return the fractional projection of spaceVector onto this */
    fractionOfProjectionToVector(target: Vector2d, defaultFraction?: number): number;
    /** Return a new vector with components negated from this instance. */
    negate(result?: Vector2d): Vector2d;
    /** Return a vector same length as this but rotated 90 degrees counter clockwise */
    rotate90CCWXY(result?: Vector2d): Vector2d;
    /** Return a vector same length as this but rotated 90 degrees clockwise */
    rotate90CWXY(result?: Vector2d): Vector2d;
    /** Return a unit vector perpendicular to this instance. */
    unitPerpendicularXY(result?: Vector2d): Vector2d;
    /** return a new Vector2d rotated CCW by given angle */
    rotateXY(angle: Angle, result?: Vector2d): Vector2d;
    /** return the interpolation {this + fraction * (right - this)} */
    interpolate(fraction: number, right: Vector2d, result?: Vector2d): Vector2d;
    /** return {this + vector}. */
    plus(vector: XAndY, result?: Vector2d): Vector2d;
    /** return {this - vector}. */
    minus(vector: XAndY, result?: Vector2d): Vector2d;
    /** Return {point + vector \* scalar} */
    plusScaled(vector: XAndY, scaleFactor: number, result?: Vector2d): Vector2d;
    /** Return {point + vectorA \* scalarA + vectorB \* scalarB} */
    plus2Scaled(vectorA: XAndY, scalarA: number, vectorB: XAndY, scalarB: number, result?: Vector2d): Vector2d;
    /** Return {this + vectorA \* scalarA + vectorB \* scalarB + vectorC \* scalarC} */
    plus3Scaled(vectorA: XAndY, scalarA: number, vectorB: XAndY, scalarB: number, vectorC: XAndY, scalarC: number, result?: Vector2d): Vector2d;
    /** Return {this * scale} */
    scale(scale: number, result?: Vector2d): Vector2d;
    /** return a vector parallel to this but with specified length */
    scaleToLength(length: number, result?: Vector2d): Vector2d | undefined;
    /** return the dot product of this with vectorB */
    dotProduct(vectorB: XAndY): number;
    /** dot product with vector from pointA to pointB */
    dotProductStartEnd(pointA: XAndY, pointB: XAndY): number;
    /** vector cross product {this CROSS vectorB} */
    crossProduct(vectorB: XAndY): number;
    /** return the (signed) angle from this to vectorB.   This is positive if the shortest turn is counterclockwise, negative if clockwise. */
    angleTo(vectorB: XAndY): Angle;
    /**
     * Test if `this` and `other` area parallel, with angle tolerance `Geometry.smallAngleRadiansSquared`.
     * @param other second vector for comparison.
     * @param oppositeIsParallel if true, treat vectors 180 opposite as parallel.  If false, treat those as non-parallel.
     */
    isParallelTo(other: Vector2d, oppositeIsParallel?: boolean): boolean;
    /**
     * Returns `true` if `this` vector is perpendicular to `other`.
     * @param other second vector.
     */
    isPerpendicularTo(other: Vector2d): boolean;
}
//# sourceMappingURL=Point2dVector2d.d.ts.map