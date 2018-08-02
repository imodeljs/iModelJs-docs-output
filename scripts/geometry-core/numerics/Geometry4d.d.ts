/** @module Numerics */
import { BeJSONFunctions } from "../Geometry";
import { Point3d, Vector3d, XYZ, XYAndZ } from "../PointVector";
import { RotMatrix, Transform } from "../Transform";
export declare type Point4dProps = number[];
export declare type Matrix4dProps = Point4dProps[];
/** 4 Dimensional point (x,y,z,w) used in perspective calculations.
 * * the coordinates are stored in a Float64Array of length 4.
 * * properties `x`, `y`, `z`, `w` access array members.
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
    /** @returns Return ((other.w \* this) -  (this.w \* other)) */
    crossWeightedMinus(other: Point4d, result?: Vector3d): Vector3d;
    /** @returns Return the sum of this and other, using all 4 components x,y,z,w */
    plus(other: Point4d, result?: Point4d): Point4d;
    isAlmostZero(): boolean;
    static createZero(): Point4d;
    /**
     * extract 4 consecutive numbers from a Float64Array into a Point4d.
     * @param data buffer of numbers
     * @param xIndex first index for x,y,z,w sequence
     */
    static createFromPackedXYZW(data: Float64Array, xIndex?: number): Point4d;
    static createFromPointAndWeight(xyz: XYZ, w: number): Point4d;
    /** Return point + vector \* scalar */
    plusScaled(vector: Point4d, scaleFactor: number, result?: Point4d): Point4d;
    /** Return point + vectorA \* scalarA + vectorB \* scalarB */
    plus2Scaled(vectorA: Point4d, scalarA: number, vectorB: Point4d, scalarB: number, result?: Point4d): Point4d;
    /** Return point + vectorA \* scalarA + vectorB \* scalarB + vectorC \* scalarC */
    plus3Scaled(vectorA: Point4d, scalarA: number, vectorB: Point4d, scalarB: number, vectorC: Point4d, scalarC: number, result?: Point4d): Point4d;
    /** Return point + vectorA \* scalarA + vectorB \* scalarB */
    static add2Scaled(vectorA: Point4d, scalarA: number, vectorB: Point4d, scalarB: number, result?: Point4d): Point4d;
    /** Return point + vectorA \* scalarA + vectorB \* scalarB + vectorC \* scalarC */
    static add3Scaled(vectorA: Point4d, scalarA: number, vectorB: Point4d, scalarB: number, vectorC: Point4d, scalarC: number, result?: Point4d): Point4d;
    dotVectorsToTargets(targetA: Point4d, targetB: Point4d): number;
    dotProduct(other: Point4d): number;
    dotProductXYZW(x: number, y: number, z: number, w: number): number;
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
    normalizeWeight(result?: Point4d): Point4d | undefined;
    realPoint(result?: Point3d): Point3d | undefined;
    realPointDefault000(result?: Point3d): Point3d;
    /** divide all components (x,y,z,w) by the 4d magnitude.
     *
     * * This is appropriate for normalizing a quaternion
     * * Use normalizeWeight to divide by the w component.
     */
    normalizeXYZW(result?: Point4d): Point4d | undefined;
}
export declare class Matrix4d implements BeJSONFunctions {
    private coffs;
    private constructor();
    setFrom(other: Matrix4d): void;
    clone(): Matrix4d;
    /** zero this matrix4d in place. */
    setZero(): void;
    /** set to identity. */
    setIdentity(): void;
    private static is1000(a, b, c, d, tol);
    /** set to identity. */
    isIdentity(tol?: number): boolean;
    /** create a Matrix4d filled with zeros. */
    static createZero(result?: Matrix4d): Matrix4d;
    /** create a Matrix4d with values supplied "across the rows" */
    static createRowValues(cxx: number, cxy: number, cxz: number, cxw: number, cyx: number, cyy: number, cyz: number, cyw: number, czx: number, czy: number, czz: number, czw: number, cwx: number, cwy: number, cwz: number, cww: number, result?: Matrix4d): Matrix4d;
    /** directly set columns from typical 3d data:
     *
     * * vectorX, vectorY, vectorZ as columns 0,1,2, with weight0.
     * * origin as column3, with weight 1
     */
    setOriginAndVectors(origin: XYZ, vectorX: Vector3d, vectorY: Vector3d, vectorZ: Vector3d): void;
    /** promote a transform to full Matrix4d (with 0001 in final row) */
    static createTransform(source: Transform, result?: Matrix4d): Matrix4d;
    /** return an identity matrix. */
    static createIdentity(result?: Matrix4d): Matrix4d;
    /** return matrix with translation directly inserted (along with 1 on diagonal) */
    static createTranslationXYZ(x: number, y: number, z: number, result?: Matrix4d): Matrix4d;
    /**
     * Create a Matrix4d with translation and scaling values directly inserted (along with 1 as final diagonal entry)
     * @param tx x entry for translation column
     * @param ty y entry for translation column
     * @param tz z entry for translation column
     * @param scaleX x diagonal entry
     * @param scaleY y diagonal entry
     * @param scaleZ z diagonal entry
     * @param result optional result.
     */
    static createTranslationAndScaleXYZ(tx: number, ty: number, tz: number, scaleX: number, scaleY: number, scaleZ: number, result?: Matrix4d): Matrix4d;
    /**
     * Create a mapping the scales and translates (no rotation) from box A to boxB
     * @param lowA low point of box A
     * @param highA high point of box A
     * @param lowB low point of box B
     * @param highB high point of box B
     */
    static createBoxToBox(lowA: Point3d, highA: Point3d, lowB: Point3d, highB: Point3d, result?: Matrix4d): Matrix4d | undefined;
    setFromJSON(json?: Matrix4dProps): void;
    /**
     * Return the largest (absolute) difference between this and other Matrix4d.
     * @param other matrix to compare to
     */
    maxDiff(other: Matrix4d): number;
    /**
     * Return the largest absolute value in the Matrix4d
     */
    maxAbs(): number;
    isAlmostEqual(other: Matrix4d): boolean;
    /**
     * Convert an Matrix4d to a Matrix4dProps.
     */
    toJSON(): Matrix4dProps;
    static fromJSON(json?: Matrix4dProps): Matrix4d;
    getSteppedPoint(i0: number, step: number, result?: Point4d): Point4d;
    /** @returns Return column 0 as Point4d. */
    columnX(): Point4d;
    /** @returns Return column 1 as Point4d. */
    columnY(): Point4d;
    /** @returns Return column 2 as Point4d. */
    columnZ(): Point4d;
    /** @returns Return column 3 as Point4d. */
    columnW(): Point4d;
    /** @returns Return row 0 as Point4d. */
    rowX(): Point4d;
    /** @returns Return row 1 as Point4d. */
    rowY(): Point4d;
    /** @returns Return row 2 as Point4d. */
    rowZ(): Point4d;
    /** @returns Return row 3 as Point4d. */
    rowW(): Point4d;
    diagonal(): Point4d;
    weight(): number;
    matrixPart(): RotMatrix;
    /** multiply this * other. */
    multiplyMatrixMatrix(other: Matrix4d, result?: Matrix4d): Matrix4d;
    /** multiply this * transpose(other). */
    multiplyMatrixMatrixTranspose(other: Matrix4d, result?: Matrix4d): Matrix4d;
    /** multiply transpose (this) * other. */
    multiplyMatrixTransposeMatrix(other: Matrix4d, result?: Matrix4d): Matrix4d;
    /** Return a transposed matrix. */
    cloneTransposed(result?: Matrix4d): Matrix4d;
    /** multiply matrix times column [x,y,z,w].  return as Point4d.   (And the returned value is NOT normalized down to unit w) */
    multiplyXYZW(x: number, y: number, z: number, w: number, result?: Point4d): Point4d;
    /** multiply matrix times XYAndZ  and w. return as Point4d  (And the returned value is NOT normalized down to unit w) */
    multiplyPoint3d(pt: XYAndZ, w: number, result?: Point4d): Point4d;
    /** multiply matrix times and array  of XYAndZ. return as array of Point4d  (And the returned value is NOT normalized down to unit w) */
    multiplyPoint3dArray(pts: XYAndZ[], results: Point4d[], w?: number): void;
    /** multiply [x,y,z,w] times matrix.  return as Point4d.   (And the returned value is NOT normalized down to unit w) */
    multiplyTransposeXYZW(x: number, y: number, z: number, w: number, result?: Point4d): Point4d;
    /** @returns dot product of row rowIndex of this with column columnIndex of other.
     */
    rowDotColumn(rowIndex: number, other: Matrix4d, columnIndex: number): number;
    /** @returns dot product of row rowIndexThis of this with row rowIndexOther of other.
     */
    rowDotRow(rowIndexThis: number, other: Matrix4d, rowIndexOther: number): number;
    /** @returns dot product of row rowIndexThis of this with row rowIndexOther of other.
     */
    columnDotColumn(columnIndexThis: number, other: Matrix4d, columnIndexOther: number): number;
    /** @returns dot product of column columnIndexThis of this with row rowIndexOther other.
     */
    columnDotRow(columnIndexThis: number, other: Matrix4d, rowIndexOther: number): number;
    /** @returns return a matrix entry by row and column index.
     */
    atIJ(rowIndex: number, columnIndex: number): number;
    /** multiply matrix * [x,y,z,w]. immediately renormalize to return in a Point3d.
     * If zero weight appears in the result (i.e. input is on eyeplane) leave the mapped xyz untouched.
     */
    multiplyXYZWQuietRenormalize(x: number, y: number, z: number, w: number, result?: Point3d): Point3d;
    /** multiply matrix * an array of Point4d. immediately renormalize to return in an array of Point3d. */
    multiplyPoint4dArrayQuietRenormalize(pts: Point4d[], results: Point3d[]): void;
    /** multiply a Point4d, return with the optional result convention. */
    multiplyPoint4d(point: Point4d, result?: Point4d): Point4d;
    /** multiply a Point4d, return with the optional result convention. */
    multiplyTransposePoint4d(point: Point4d, result?: Point4d): Point4d;
    /** multiply matrix * point. This produces a weighted xyzw.
     * Immediately renormalize back to xyz and return (with optional result convention).
     * If zero weight appears in the result (i.e. input is on eyeplane)leave the mapped xyz untouched.
     */
    multiplyPoint3dQuietNormalize(point: XYAndZ, result?: Point3d): Point3d;
    /** multiply each matrix * points[i].   This produces a weighted xyzw.
     * Immediately renormalize back to xyz and replace the original point.
     * If zero weight appears in the result (i.e. input is on eyeplane)leave the mapped xyz untouched.
     */
    multiplyPoint3dArrayQuietNormalize(points: Point3d[]): void;
    addMomentsInPlace(x: number, y: number, z: number, w: number): void;
    /** accumulate all coefficients of other to this. */
    addScaledInPlace(other: Matrix4d, scale?: number): void;
    /**
     * Add scale times rowA to rowB.
     * @param rowIndexA row that is not modified
     * @param rowIndexB row that is modified.
     * @param firstColumnIndex first column modified.  All from there to the right are updated
     * @param scale scale
     */
    rowOperation(rowIndexA: number, rowIndexB: number, firstColumnIndex: number, scale: number): void;
    /** Compute an inverse matrix.
     * * This uses simple Bauss-Jordan elimination -- no pivot.
     * @returns undefined if 1/pivot becomes too large. (i.e. apparent 0 pivot)
     */
    createInverse(): Matrix4d | undefined;
    /** @returns Restructure the matrix rows as separate arrays. (Useful for printing)
     * @param f optional function to provide alternate values for each entry (e.g. force fuzz to zero.)
     */
    rowArrays(f?: (value: number) => any): any;
    scaleRowsInPlace(ax: number, ay: number, az: number, aw: number): void;
}
/** Map4 carries two Matrix4d which are inverses of each other.
 */
export declare class Map4d implements BeJSONFunctions {
    private matrix0;
    private matrix1;
    private constructor();
    /** @returns Return a reference to (not copy of) the "forward" Matrix4d */
    readonly transform0: Matrix4d;
    /** @returns Return a reference to (not copy of) the "reverse" Matrix4d */
    readonly transform1: Matrix4d;
    /** Create a Map4d, capturing the references to the two matrices. */
    static createRefs(matrix0: Matrix4d, matrix1: Matrix4d): Map4d;
    /** Create an identity map. */
    static createIdentity(): Map4d;
    /** Create a Map4d with given transform pair.
     * @returns undefined if the transforms are not inverses of each other.
     */
    static createTransform(transform0: Transform, transform1: Transform): Map4d | undefined;
    /**
     * Create a mapping the scales and translates (no rotation) between boxes.
     * @param lowA low point of box A
     * @param highA high point of box A
     * @param lowB low point of box B
     * @param highB high point of box B
     */
    static createBoxMap(lowA: Point3d, highA: Point3d, lowB: Point3d, highB: Point3d, result?: Map4d): Map4d | undefined;
    /** Copy contents from another Map4d */
    setFrom(other: Map4d): void;
    /** @returns Return a clone of this Map4d */
    clone(): Map4d;
    /** Reinitialize this Map4d as an identity. */
    setIdentity(): void;
    /** Set this map4d from a json object that the two Matrix4d values as properties named matrix0 and matrix1 */
    setFromJSON(json: any): void;
    /** Create a map4d from a json object that the two Matrix4d values as properties named matrix0 and matrix1 */
    static fromJSON(json?: any): Map4d;
    /** @returns a json object `{matrix0: value0, matrix1: value1}` */
    toJSON(): any;
    isAlmostEqual(other: Map4d): boolean;
    /** Create a map between a frustum and world coordinates.
     * @param origin lower left of frustum
     * @param uVector Vector from lower left rear to lower right rear
     * @param vVector Vector from lower left rear to upper left rear
     * @param wVector Vector from lower left rear to lower left front, i.e. lower left rear towards eye.
     * @param fraction front size divided by rear size.
     */
    static createVectorFrustum(origin: Point3d, uVector: Vector3d, vVector: Vector3d, wVector: Vector3d, fraction: number): Map4d | undefined;
    multiplyMapMap(other: Map4d): Map4d;
    reverseInPlace(): void;
    /** return a Map4d whose transform0 is
     * other.transform0 * this.transform0 * other.transform1
     */
    sandwich0This1(other: Map4d): Map4d;
    /** return a Map4d whose transform0 is
     * other.transform1 * this.transform0 * other.transform0
     */
    sandwich1This0(other: Map4d): Map4d;
}
/**
 * A Plane4dByOriginAndVectors is a 4d origin and pair of 4d "vectors" defining a 4d plane.
 *
 * * The parameterization of the plane is    `X = A + U*t + V*v`
 * * The unit coefficient of pointA makes this like a Plane3dByOriginAndVectors. Hence it is not a barycentric combination of 4d points.
 */
export declare class Plane4dByOriginAndVectors {
    origin: Point4d;
    vectorU: Point4d;
    vectorV: Point4d;
    private constructor();
    /** @returns Return a clone of this plane */
    clone(result?: Plane4dByOriginAndVectors): Plane4dByOriginAndVectors;
    /** copy all content from other plane */
    setFrom(other: Plane4dByOriginAndVectors): void;
    /** @returns Return true if origin, vectorU, and vectorV pass isAlmostEqual. */
    isAlmostEqual(other: Plane4dByOriginAndVectors): boolean;
    /** Create a plane with (copies of) origin, vectorU, vectorV parameters
     */
    static createOriginAndVectors(origin: Point4d, vectorU: Point4d, vectorV: Point4d, result?: Plane4dByOriginAndVectors): Plane4dByOriginAndVectors;
    /** Set all numeric data from complete list of (x,y,z,w) in origin, vectorU, and vectorV */
    setOriginAndVectorsXYZW(x0: number, y0: number, z0: number, w0: number, ux: number, uy: number, uz: number, uw: number, vx: number, vy: number, vz: number, vw: number): Plane4dByOriginAndVectors;
    /** Copy the contents of origin, vectorU, vectorV parameters to respective member variables */
    setOriginAndVectors(origin: Point4d, vectorU: Point4d, vectorV: Point4d): Plane4dByOriginAndVectors;
    /** Create from complete list of (x,y,z,w) in origin, vectorU, and vectorV */
    static createOriginAndVectorsXYZW(x0: number, y0: number, z0: number, w0: number, ux: number, uy: number, uz: number, uw: number, vx: number, vy: number, vz: number, vw: number, result?: Plane4dByOriginAndVectors): Plane4dByOriginAndVectors;
    static createOriginAndTargets3d(origin: Point3d, targetU: Point3d, targetV: Point3d, result?: Plane4dByOriginAndVectors): Plane4dByOriginAndVectors;
    fractionToPoint(u: number, v: number, result?: Point4d): Point4d;
    static createXYPlane(result?: Plane4dByOriginAndVectors): Plane4dByOriginAndVectors;
}
