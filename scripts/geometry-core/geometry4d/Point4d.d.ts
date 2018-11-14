/** @module Numerics */
import { BeJSONFunctions } from "../Geometry";
import { XYAndZ } from "../geometry3d/XYZProps";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
export declare type Point4dProps = number[];
/**
 *
 * @param ddg numerator second derivative
 * @param dh denominator derivative
 * @param ddh denominator second derivative
 * @param f primary function (g/h)
 * @param df derivative of (g/h)
 * @param divh = (1/h)
 * @param dgdivh previously computed first derivative of (g/h)
 */
export declare function quotientDerivative2(ddg: number, dh: number, ddh: number, f: number, df: number, divh: number): number;
/** 4 Dimensional point (x,y,z,w) used in perspective calculations.
 * * the coordinates are stored in a Float64Array of length 4.
 * * properties `x`, `y`, `z`, `w` access array members.
 * *
 * * The coordinates are physically stored as a single FLoat64Array with 4 entries. (w last)
 * *
 */
export declare class Point4d implements BeJSONFunctions {
    xyzw: Float64Array;
    /** Set x,y,z,w of this point.  */
    set(x?: number, y?: number, z?: number, w?: number): Point4d;
    /** @returns Return the x component of this point. */
    x: number;
    /** @returns Return the y component of this point. */
    y: number;
    /** @returns Return the z component of this point. */
    z: number;
    /** @returns Return the w component of this point. */
    w: number;
    protected constructor(x?: number, y?: number, z?: number, w?: number);
    /** @returns Return a Point4d with specified x,y,z,w */
    static create(x?: number, y?: number, z?: number, w?: number, result?: Point4d): Point4d;
    setFrom(other: Point4d): Point4d;
    clone(result?: Point4d): Point4d;
    setFromJSON(json?: Point4dProps): void;
    static fromJSON(json?: Point4dProps): Point4d;
    isAlmostEqual(other: Point4d): boolean;
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [[x,y,z,w]
     */
    toJSON(): Point4dProps;
    /** Return the 4d distance from this point to other, with all 4 components squared into the hypotenuse.
     * * x,y,z,w all participate without normalization.
     */
    distanceXYZW(other: Point4d): number;
    /** Return the squared 4d distance from this point to other, with all 4 components squared into the hypotenuse.
     * * x,y,z,w all participate without normalization.
     */
    distanceSquaredXYZW(other: Point4d): number;
    /** Return the distance between the instance and other after normalizing by weights
     */
    realDistanceXY(other: Point4d): number | undefined;
    /** Return the largest absolute distance between corresponding components
     * * x,y,z,w all participate without normalization.
     */
    maxDiff(other: Point4d): number;
    /** @returns Return the largest absolute entry of all 4 components x,y,z,w */
    maxAbs(): number;
    /**  @returns Returns the magnitude including all 4 components x,y,z,w */
    magnitudeXYZW(): number;
    /** @returns Return the difference (this-other) using all 4 components x,y,z,w */
    minus(other: Point4d, result?: Point4d): Point4d;
    /** @returns Return `((other.w * this) -  (this.w * other))` */
    crossWeightedMinus(other: Point4d, result?: Vector3d): Vector3d;
    /** @returns Return the sum of this and other, using all 4 components x,y,z,w */
    plus(other: Point4d, result?: Point4d): Point4d;
    readonly isAlmostZero: boolean;
    static createZero(): Point4d;
    /**
     * Create plane coefficients for the plane containing pointA, pointB, and 0010.
     * @param pointA first point
     * @param pointB second point
     */
    static createPlanePointPointZ(pointA: Point4d, pointB: Point4d, result?: Point4d): Point4d;
    /**
     * extract 4 consecutive numbers from a Float64Array into a Point4d.
     * @param data buffer of numbers
     * @param xIndex first index for x,y,z,w sequence
     */
    static createFromPackedXYZW(data: Float64Array, xIndex?: number, result?: Point4d): Point4d;
    static createFromPointAndWeight(xyz: XYAndZ, w: number): Point4d;
    /** Return `point + vector * scalar` */
    plusScaled(vector: Point4d, scaleFactor: number, result?: Point4d): Point4d;
    /** Return interpolation between instance and pointB at fraction
     */
    interpolate(fraction: number, pointB: Point4d, result?: Point4d): Point4d;
    /** Return `point + vectorA * scalarA + vectorB * scalarB` */
    plus2Scaled(vectorA: Point4d, scalarA: number, vectorB: Point4d, scalarB: number, result?: Point4d): Point4d;
    /** Return `point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC` */
    plus3Scaled(vectorA: Point4d, scalarA: number, vectorB: Point4d, scalarB: number, vectorC: Point4d, scalarC: number, result?: Point4d): Point4d;
    /** Return `point + vectorA * scalarA + vectorB * scalarB` */
    static createAdd2Scaled(vectorA: Point4d, scalarA: number, vectorB: Point4d, scalarB: number, result?: Point4d): Point4d;
    /** Return `point + vectorA \ scalarA + vectorB * scalarB + vectorC * scalarC` */
    static createAdd3Scaled(vectorA: Point4d, scalarA: number, vectorB: Point4d, scalarB: number, vectorC: Point4d, scalarC: number, result?: Point4d): Point4d;
    /** Return dot produt of (4d) vectors from the instance to targetA and targetB */
    dotVectorsToTargets(targetA: Point4d, targetB: Point4d): number;
    /** return (4d) dot product of the instance and other point. */
    dotProduct(other: Point4d): number;
    /** return (4d) dot product of the instance with xyzw */
    dotProductXYZW(x: number, y: number, z: number, w: number): number;
    /** dotProduct with (point.x, point.y, point.z, 1) Used in PlaneAltitudeEvaluator interface */
    altitude(point: Point3d): number;
    /** dotProduct with (point.x, point.y, point.z, 1) Used in PlaneAltitudeEvaluator interface */
    weightedAltitude(point: Point4d): number;
    /** dotProduct with (vector.x, vector.y, vector.z, 0).  Used in PlaneAltitudeEvaluator interface */
    velocity(vector: Vector3d): number;
    /** dotProduct with (x,y,z, 0).  Used in PlaneAltitudeEvaluator interface */
    velocityXYZ(x: number, y: number, z: number): number;
    /** unit X vector */
    static unitX(): Point4d;
    /** unit Y vector */
    static unitY(): Point4d;
    /** unit Z vector */
    static unitZ(): Point4d;
    /** unit W vector */
    static unitW(): Point4d;
    safeDivideOrNull(denominator: number, result?: Point4d): Point4d | undefined;
    /** scale all components (including w!!) */
    scale(scale: number, result?: Point4d): Point4d;
    /** Negate components (including w!!) */
    negate(result?: Point4d): Point4d;
    /**
     * If `this.w` is nonzero, return a 4d point `(x/w,y/w,z/w, 1)`
     * If `this.w` is zero, return undefined.
     * @param result optional result
     */
    normalizeWeight(result?: Point4d): Point4d | undefined;
    /**
     * If `this.w` is nonzero, return a 3d point `(x/w,y/w,z/w)`
     * If `this.w` is zero, return undefined.
     * @param result optional result
     */
    realPoint(result?: Point3d): Point3d | undefined;
    /**
     * * If w is nonzero, return Point3d with x/w,y/w,z/w.
     * * If w is zero, return 000
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param w w coordinate
     * @param result optional result
     */
    static createRealPoint3dDefault000(x: number, y: number, z: number, w: number, result?: Point3d): Point3d;
    /**
     * * If w is nonzero, return Vector3d which is the derivative of the projecte xyz with given w and 4d derivatives.
     * * If w is zero, return 000
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param w w coordinate
     * @param dx x coordinate of derivative
     * @param dy y coordinate of derivative
     * @param dz z coordinate of derivative
     * @param dw w coordinate of derivative
     * @param result optional result
     */
    static createRealDerivativeRay3dDefault000(x: number, y: number, z: number, w: number, dx: number, dy: number, dz: number, dw: number, result?: Ray3d): Ray3d;
    /**
     * * If w is nonzero, return Vector3d which is the derivative of the projecte xyz with given w and 4d derivatives.
     * * If w is zero, return 000
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param w w coordinate
     * @param dx x coordinate of derivative
     * @param dy y coordinate of derivative
     * @param dz z coordinate of derivative
     * @param dw w coordinate of derivative
     * @param result optional result
     */
    static createRealDerivativePlane3dByOriginAndVectorsDefault000(x: number, y: number, z: number, w: number, dx: number, dy: number, dz: number, dw: number, ddx: number, ddy: number, ddz: number, ddw: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * * If this.w is nonzero, return Point3d with x/w,y/w,z/w.
     * * If this.w is zero, return 000
     */
    realPointDefault000(result?: Point3d): Point3d;
    /** divide all components (x,y,z,w) by the 4d magnitude.
     *
     * * This is appropriate for normalizing a quaternion
     * * Use normalizeWeight to divide by the w component.
     */
    normalizeXYZW(result?: Point4d): Point4d | undefined;
}
//# sourceMappingURL=Point4d.d.ts.map