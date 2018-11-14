/** @module CartesianGeometry */
import { AxisOrder, BeJSONFunctions } from "../Geometry";
import { Point4d } from "../geometry4d/Point4d";
import { Range3d } from "./Range";
import { Point2d } from "./Point2dVector2d";
import { XYAndZ } from "./XYZProps";
import { Point3d, Vector3d } from "./Point3dVector3d";
import { XAndY, TransformProps } from "./XYZProps";
import { XYZ } from "./Point3dVector3d";
import { Matrix3d } from "./Matrix3d";
/** A transform is an origin and a Matrix3d.
 *
 * * This describes a coordinate frame with
 * this origin, with the columns of the Matrix3d being the
 * local x,y,z axis directions.
 * *  Beware that for common transformations (e.g. scale about point,
 * rotate around line, mirror across a plane) the "fixed point" that is used
 * when describing the transform is NOT the "origin" stored in the transform.
 * Setup methods (e.g createFixedPointAndMatrix, createScaleAboutPoint)
 * take care of determining the appropriate origin coordinates.
 */
export declare class Transform implements BeJSONFunctions {
    private static _scratchPoint;
    private _origin;
    private _matrix;
    private constructor();
    private static _identity?;
    /** The identity Transform. Value is frozen and cannot be modified. */
    static readonly identity: Transform;
    freeze(): void;
    setFrom(other: Transform): void;
    /** Set this Transform to be an identity. */
    setIdentity(): void;
    setFromJSON(json?: TransformProps): void;
    /**
     * Test for near equality with other Transform.  Comparison uses the isAlmostEqual methods on
     * the origin and matrix parts.
     * @param other Transform to compare to.
     */
    isAlmostEqual(other: Transform): boolean;
    toJSON(): TransformProps;
    static fromJSON(json?: TransformProps): Transform;
    /** Copy the contents of this transform into a new Transform (or to the result, if specified). */
    clone(result?: Transform): Transform;
    /** @returns Return a copy of this Transform, modified so that its axes are rigid
     */
    cloneRigid(axisOrder?: AxisOrder): Transform | undefined;
    /** Create a copy with the given origin and matrix captured as the Transform origin and Matrix3d. */
    static createRefs(origin: XYZ, matrix: Matrix3d, result?: Transform): Transform;
    /** Create a transform with complete contents given */
    static createRowValues(qxx: number, qxy: number, qxz: number, ax: number, qyx: number, qyy: number, qyz: number, ay: number, qzx: number, qzy: number, qzz: number, az: number, result?: Transform): Transform;
    /**
     * create a Transform with translation provided by x,y,z parts.
     * @param x x part of translation
     * @param y y part of translation
     * @param z z part of translation
     * @param result optional result
     * @returns new or updated transform.
     */
    static createTranslationXYZ(x?: number, y?: number, z?: number, result?: Transform): Transform;
    /** Create a matrix with specified translation part.
     * @param XYZ x,y,z parts of the translation.
     * @returns new or updated transform.
     */
    static createTranslation(translation: XYZ, result?: Transform): Transform;
    /** Return a reference to the matrix within the transform.  (NOT a copy) */
    readonly matrix: Matrix3d;
    /** Return a reference to the origin within the transform.  (NOT a copy) */
    readonly origin: XYZ;
    /** return a (clone of) the origin part of the transform, as a Point3d */
    getOrigin(): Point3d;
    /** return a (clone of) the origin part of the transform, as a Vector3d */
    getTranslation(): Vector3d;
    /** test if the transform has 000 origin and identity Matrix3d */
    readonly isIdentity: boolean;
    /** Return an identity transform, optionally filling existing transform.  */
    static createIdentity(result?: Transform): Transform;
    /** Create by directly installing origin and matrix
     * this is a the appropriate construction when the columns of the matrix are coordinate axes of a local-to-global mapping
     * Note there is a closely related createFixedPointAndMatrix whose point input is the fixed point of the global-to-global transformation.
     */
    static createOriginAndMatrix(origin: XYZ | undefined, matrix: Matrix3d | undefined, result?: Transform): Transform;
    /** Create by directly installing origin and columns of the matrix
     */
    static createOriginAndMatrixColumns(origin: XYZ, vectorX: Vector3d, vectorY: Vector3d, vectorZ: Vector3d, result?: Transform): Transform;
    /** Reinitialize by directly installing origin and columns of the matrix
     */
    setOriginAndMatrixColumns(origin: XYZ, vectorX: Vector3d, vectorY: Vector3d, vectorZ: Vector3d): void;
    /** Create a transform with the specified matrix. Compute an origin (different from the given fixedPoint)
     * so that the fixedPoint maps back to itself.
     */
    static createFixedPointAndMatrix(fixedPoint: Point3d, matrix: Matrix3d, result?: Transform): Transform;
    /** Create a Transform which leaves the fixedPoint unchanged and
     * scales everything else around it by a single scale factor.
     */
    static createScaleAboutPoint(fixedPoint: Point3d, scale: number, result?: Transform): Transform;
    /** Transform the input 2d point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyPoint2d(source: XAndY, result?: Point2d): Point2d;
    /** Transform the input 3d point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyPoint3d(point: XYAndZ, result?: Point3d): Point3d;
    /** Transform the input point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZ(x: number, y: number, z: number, result?: Point3d): Point3d;
    /** Multiply a specific row of the transform times xyz. Return the (number). */
    multiplyComponentXYZ(componentIndex: number, x: number, y: number, z: number): number;
    /** Multiply a specific row of the transform times (weighted!) xyzw. Return the (number). */
    multiplyComponentXYZW(componentIndex: number, x: number, y: number, z: number, w: number): number;
    /** Transform the input homogeneous point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZW(x: number, y: number, z: number, w: number, result?: Point4d): Point4d;
    /** Transform the input homogeneous point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZWToFloat64Array(x: number, y: number, z: number, w: number, result?: Float64Array): Float64Array;
    /** Transform the input homogeneous point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZToFloat64Array(x: number, y: number, z: number, result?: Float64Array): Float64Array;
    /** Multiply the tranposed transform (as 4x4 with 0001 row) by Point4d given as xyzw..  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyTransposeXYZW(x: number, y: number, z: number, w: number, result?: Point4d): Point4d;
    /** for each point:  replace point by Transform*point */
    multiplyPoint3dArrayInPlace(points: Point3d[]): void;
    /** @returns Return product of the transform's inverse times a point. */
    multiplyInversePoint3d(point: XYAndZ, result?: Point3d): Point3d | undefined;
    /**
     * *  for each point:   multiply    transform * point
     * *  if result is given, resize to match source and replace each corresponding pi
     * *  if result is not given, return a new array.
     */
    multiplyInversePoint3dArray(source: Point3d[], result?: Point3d[]): Point3d[] | undefined;
    /**
     * *  for each point:   multiply    transform * point
     * *  if result is given, resize to match source and replace each corresponding pi
     * *  if result is not given, return a new array.
     */
    multiplyInversePoint3dArrayInPlace(source: Point3d[]): void;
    static matchArrayLengths(source: any[], dest: any[], constructionFunction: () => any): number;
    /**
     * *  for each point:   multiply    transform * point
     * *  if result is given, resize to match source and replace each corresponding pi
     * *  if result is not given, return a new array.
     */
    multiplyPoint2dArray(source: Point2d[], result?: Point2d[]): Point2d[];
    /**
     * *  for each point:   multiply    transform * point
     * *  if result is given, resize to match source and replace each corresponding pi
     * *  if result is not given, return a new array.
     */
    multiplyPoint3dArray(source: Point3d[], result?: Point3d[]): Point3d[];
    /** Multiply the vector by the Matrix3d part of the transform.
     *
     * *  The transform's origin is not used.
     * *  Return as new or result by usual optional result convention
     */
    multiplyVector(vector: Vector3d, result?: Vector3d): Vector3d;
    /** Multiply the vector (x,y,z) by the Matrix3d part of the transform.
     *
     * *  The transform's origin is not used.
     * *  Return as new or result by usual optional result convention
     */
    multiplyVectorXYZ(x: number, y: number, z: number, result?: Vector3d): Vector3d;
    /** multiply this Transform times other Transform.
     * @param other right hand transform for multiplication.
     * @param result optional preallocated result to reuse.
     */
    multiplyTransformTransform(other: Transform, result?: Transform): Transform;
    /**
     * multiply transformA * transformB, store to calling instance.
     * @param transformA left operand
     * @param transformB right operand
     */
    setMultiplyTransformTransform(transformA: Transform, transformB: Transform): void;
    /** multiply this Transform times other Matrix3d, with other considered to be a Transform with 0 translation.
     * @param other right hand Matrix3d for multiplication.
     * @param result optional preallocated result to reuse.
     */
    multiplyTransformMatrix3d(other: Matrix3d, result?: Transform): Transform;
    /** transform each of the 8 corners of a range. Return the range of the transformed corers */
    multiplyRange(range: Range3d, result?: Range3d): Range3d;
    /**
     * @returns Return a Transform which is the inverse of this transform. Return undefined if this Transform's matrix is singular.
     */
    inverse(): Transform | undefined;
    /** Initialize transforms that map each direction of a box (axis aligned) to `[0,1]`.
     * @param min the "000" corner of the box
     * @param max the "111" corner of the box
     * @param npcToGlobal (object created by caller, re-initialized) transform that carries 01 coordinates into the min,max box.
     * @param globalToNpc (object created by caller, re-initialized) transform that carries world coordinates into 01
     */
    static initFromRange(min: Point3d, max: Point3d, npcToGlobal?: Transform, globalToNpc?: Transform): void;
}
//# sourceMappingURL=Transform.d.ts.map