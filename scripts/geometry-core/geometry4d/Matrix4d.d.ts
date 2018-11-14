/** @module Numerics */
import { BeJSONFunctions } from "../Geometry";
import { XYAndZ } from "../geometry3d/XYZProps";
import { Point3d, Vector3d, XYZ } from "../geometry3d/Point3dVector3d";
import { Transform } from "../geometry3d/Transform";
import { Matrix3d } from "../geometry3d/Matrix3d";
import { Point4d, Point4dProps } from "./Point4d";
export declare type Matrix4dProps = Point4dProps[];
/**
 * * A Matrix4d is a matrix with 4 rows and 4 columns.
 * * The 4 rows may be described as the x,y,z,w rows.
 * * The 4 columns may be described as the x,y,z,w columns.
 * * The matrix is physically stored as a FLoat64Array with 16 numbers.
 * * The layout in the Float64Array is "by row"
 * * * indices 0,1,2,3 are the "x row".   They may be called the xx,xy,xz,xw entries
 * * * indices 4,5,6,7 are the "y row"    They may be called the yx,yy,yz,yw entries
 * * * indices 8,9,10,11 are the "z row"  They may be called the zx,zy,zz,zw entries
 * * * indices 12,13,14,15 are the "w row".  They may be called the wx,wy,wz,ww entries
 * * If "w row" contains numeric values 0,0,0,1, the Matrix4d is equivalent to a Transform with
 * * * The upper right 3x3 matrix (entries 0,1,2,4,5,6,8,9,10) are the 3x3 matrix part of the transform
 * * * The far right column entries xw,yw,zw are the "origin" (sometimes called "translation") part of the transform.
 */
export declare class Matrix4d implements BeJSONFunctions {
    private _coffs;
    private constructor();
    setFrom(other: Matrix4d): void;
    clone(): Matrix4d;
    /** zero this matrix4d in place. */
    setZero(): void;
    /** set to identity. */
    setIdentity(): void;
    private static is1000;
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
    /**
     * Return a point with entries from positions [i0, i0+step, i0+2*step, i0+3*step].
     * * There are no tests for index going out of the 0..15 range.
     * * Usual uses are:
     * * * i0 at left of row (0,4,8,12), step = 1 to extract a row.
     * * * i0 at top of row (0,1,2,3), step = 4 to extract a column
     * * * i0 = 0, step = 5 to extract the diagonal
     * @returns a Point4d with 4 entries taken from positions at steps in the flat 16-member array.
     * @param i0 start index (for 16 member array)
     * @param step step between members
     * @param result optional preallocated point.
     */
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
    /**
     * @returns true if the 2 row has content other than [0,0,0,1]
     */
    readonly hasPerspective: boolean;
    /**
     * Return a Point4d with the diagonal entries of the matrix
     */
    diagonal(): Point4d;
    /** return the weight component of this matrix */
    weight(): number;
    /** return the leading 3x3 matrix part of this matrix */
    matrixPart(): Matrix3d;
    /**
     * Return the (affine, non-perspective) Transform with the upper 3 rows of this matrix
     * @return undefined if this Matrix4d has perspective effects in the w row.
     */
    readonly asTransform: Transform | undefined;
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
    /** multiply matrix times column vectors [x,y,z,w] where [x,y,z,w] appear in blocks in an array.
     * replace the xyzw in the block
     */
    multiplyBlockedFloat64ArrayInPlace(data: Float64Array): void;
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
    /**
     * Add the product terms [xx,xy,xz,xw, yx, yy, yz, yw, zx, zy, zz, zs, wx, wy, wz, ww] to respective entries in the matrix
     * @param x x component for products
     * @param y y component for products
     * @param z z component for products
     * @param w w component for products
     */
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
    /**
     * Scale each row by respective scale factors.
     * @param ax scale factor for row 0
     * @param ay scale factor for row 1
     * @param az scale factor for row 2
     * @param aw scale factor for row 3
     */
    scaleRowsInPlace(ax: number, ay: number, az: number, aw: number): void;
}
//# sourceMappingURL=Matrix4d.d.ts.map