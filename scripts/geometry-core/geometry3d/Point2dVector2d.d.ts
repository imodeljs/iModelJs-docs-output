/** @module CartesianGeometry */
import { BeJSONFunctions } from "../Geometry";
import { Angle } from "./Angle";
import { XAndY, XYProps } from "./XYZProps";
/** Minimal object containing x,y and operations that are meaningful without change in both point and vector. */
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
    /** Returns true if this and other have equal x,y parts within Geometry.smallMetricDistance. */
    isAlmostEqual(other: XAndY, tol?: number): boolean;
    /** return a json array or object with the [x,y] data.  */
    toJSON(): XYProps;
    toJSONXY(): XYProps;
    /** Set x and y from a JSON source */
    setFromJSON(json?: XYProps): void;
    /** Return the distance from this point to other */
    distance(other: XAndY): number;
    /** Return squared distance from this point to other */
    distanceSquared(other: XAndY): number;
    /** Return the largest absolute distance between corresponding components */
    maxDiff(other: XAndY): number;
    /** @returns true if the x,y components are both small by metric metric tolerance */
    readonly isAlmostZero: boolean;
    /** Return the largest absolute value of any component */
    maxAbs(): number;
    /** Return the magnitude of the vector */
    magnitude(): number;
    /** Return the squared magnitude of the vector.  */
    magnitudeSquared(): number;
    /** @returns true if the x,y components are exactly equal. */
    isExactEqual(other: XAndY): boolean;
    isAlmostEqualMetric(other: XAndY): boolean;
    /** Return a (full length) vector from this point to other */
    vectorTo(other: XAndY, result?: Vector2d): Vector2d;
    /** Return a unit vector from this point to other */
    unitVectorTo(target: XAndY, result?: Vector2d): Vector2d | undefined;
}
export declare class Point2d extends XY implements BeJSONFunctions {
    /** Constructor for Point2d */
    constructor(x?: number, y?: number);
    clone(): Point2d;
    /**
     * Return a point (newly created unless result provided) with given x,y coordinates
     * @param x x coordinate
     * @param y y coordinate
     * @param result optional result
     */
    static create(x?: number, y?: number, result?: Point2d): Point2d;
    static fromJSON(json?: XYProps): Point2d;
    static createFrom(xy: XAndY | undefined, result?: Point2d): Point2d;
    static createZero(result?: Point2d): Point2d;
    addForwardLeft(tangentFraction: number, leftFraction: number, vector: Vector2d): Point2d;
    forwardLeftInterpolate(tangentFraction: number, leftFraction: number, point: XAndY): Point2d;
    /** Return a point interpolated between this point and the right param. */
    interpolate(fraction: number, other: XAndY, result?: Point2d): Point2d;
    /** Return a point with independent x,y fractional interpolation. */
    interpolateXY(fractionX: number, fractionY: number, other: XAndY, result?: Point2d): Point2d;
    /** Return point minus vector */
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
     * @returns dot product of vector from this to targetA and vector from this to targetB
     * @param targetA target of first vector
     * @param targetB target of second vector
     */
    dotVectorsToTargets(targetA: XAndY, targetB: XAndY): number;
    /** Returns the (scalar) cross product of two points/vectors, computed from origin to target1 and target2 */
    crossProductToPoints(target1: XAndY, target2: XAndY): number;
    fractionOfProjectionToLine(startPoint: Point2d, endPoint: Point2d, defaultFraction?: number): number;
}
/** 3D vector with x,y properties */
export declare class Vector2d extends XY implements BeJSONFunctions {
    constructor(x?: number, y?: number);
    clone(): Vector2d;
    static create(x?: number, y?: number, result?: Vector2d): Vector2d;
    static unitX(scale?: number): Vector2d;
    static unitY(scale?: number): Vector2d;
    static createZero(result?: Vector2d): Vector2d;
    /** copy contents from another Point3d, Point2d, Vector2d, or Vector3d */
    static createFrom(data: XAndY | Float64Array, result?: Vector2d): Vector2d;
    static fromJSON(json?: XYProps): Vector2d;
    static createPolar(r: number, theta: Angle): Vector2d;
    static createStartEnd(point0: XAndY, point1: XAndY, result?: Vector2d): Vector2d;
    /**
     * Return a vector that bisects the angle between two normals and extends to the intersection of two offset lines
     * @param unitPerpA unit perpendicular to incoming direction
     * @param unitPerpB  unit perpendicular to outgoing direction
     * @param offset offset distance
     */
    static createOffsetBisector(unitPerpA: Vector2d, unitPerpB: Vector2d, offset: number): Vector2d | undefined;
    safeDivideOrNull(denominator: number, result?: Vector2d): Vector2d | undefined;
    normalize(result?: Vector2d): Vector2d | undefined;
    /** return the fractional projection of spaceVector onto this */
    fractionOfProjectionToVector(target: Vector2d, defaultFraction?: number): number;
    /** Negate components */
    negate(result?: Vector2d): Vector2d;
    rotate90CCWXY(result?: Vector2d): Vector2d;
    rotate90CWXY(result?: Vector2d): Vector2d;
    unitPerpendicularXY(result?: Vector2d): Vector2d;
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
    scaleToLength(length: number, result?: Vector2d): Vector2d;
    /** return the dot product of this with vectorB */
    dotProduct(vectorB: Vector2d): number;
    /** dot product with vector from pointA to pointB */
    dotProductStartEnd(pointA: XAndY, pointB: XAndY): number;
    /** vector cross product {this CROSS vectorB} */
    crossProduct(vectorB: Vector2d): number;
    /** return the (signed) angle from this to vectorB.   This is positive if the shortest turn is counterclockwise, negative if clockwise. */
    angleTo(vectorB: Vector2d): Angle;
    isParallelTo(other: Vector2d, oppositeIsParallel?: boolean): boolean;
    /**
     * @returns `true` if `this` vector is perpendicular to `other`.
     * @param other second vector.
     */
    isPerpendicularTo(other: Vector2d): boolean;
}
//# sourceMappingURL=Point2dVector2d.d.ts.map