import { AxisOrder, AxisIndex, BeJSONFunctions, StandardViewIndex } from "../Geometry";
import { Angle } from "./Angle";
import { Point4d } from "../geometry4d/Point4d";
import { Point2d } from "./Point2dVector2d";
import { XYAndZ } from "./XYZProps";
import { Point3d, Vector3d } from "./Point3dVector3d";
import { XAndY, Matrix3dProps } from "./XYZProps";
import { XYZ } from "./Point3dVector3d";
import { Transform } from "./Transform";
/** A Matrix3d is tagged indicating one of the following states:
 * * unknown: it is not know if the matrix is invertible.
 * * inverseStored: the matrix has its inverse stored
 * * singular: the matrix is known to be singular.
 */
export declare enum InverseMatrixState {
    unknown = 0,
    inverseStored = 1,
    singular = 2
}
/** A Matrix3d is a 3x3 matrix.
 * * A very common use is to hold a rigid body rotation (which has no scaling or skew), but the 3x3 contents can
 * also hold scaling and skewing.
 * * The 9 entries are stored in row-major order in the coffs array.
 * * If the matrix inverse is known it is stored in the inverseCoffs array.
 * * The inverse status (unknown, inverseStored, singular) status is indicated by the inverseState property.
 * * constructions method that are able to determine the inverse store it immediately and
 *     note that in the inverseState.
 * * constructions (e.g. createRowValues) for which the inverse is not immediately known mark the
 *     inverseState as unknown.
 * * Later queries for the inverse trigger full computation if needed at that time.
 * * Most matrix queries are present with both "column" and "row" variants.
 * * Usage elsewhere in the library is typically "column" based.  For example, in a Transform
 *     that carries a coordinate frame the matrix columns are the unit vectors for the axes.
 */
export declare class Matrix3d implements BeJSONFunctions {
    static useCachedInverse: boolean;
    static numUseCache: number;
    static numComputeCache: number;
    coffs: Float64Array;
    inverseCoffs: Float64Array | undefined;
    inverseState: InverseMatrixState;
    private static _identity;
    /** The identity Matrix3d. Value is frozen and cannot be modified. */
    static readonly identity: Matrix3d;
    /** Freeze this Matrix3d. */
    freeze(): void;
    /**
     *
     * @param coffs optional coefficient array.  This is captured.
     */
    constructor(coffs?: Float64Array);
    /** Return a json object containing the 9 numeric entries as a single array in row major order,
     * `[ [1, 2, 3],[ 4, 5, 6], [7, 8, 9] ]`
     */
    toJSON(): Matrix3dProps;
    setFromJSON(json?: Matrix3dProps): void;
    /** @returns Return a new Matrix3d constructed from contents of the json value. */
    static fromJSON(json?: Matrix3dProps): Matrix3d;
    /** Test if this Matrix3d and other are within tolerance in all numeric entries.
     * @param tol optional tolerance for comparisons by Geometry.isDistanceWithinTol
     */
    isAlmostEqual(other: Matrix3d, tol?: number): boolean;
    /** Test for exact (bitwise) equality with other. */
    isExactEqual(other: Matrix3d): boolean;
    /** test if all entries in the z row and column are exact 001, i.e. the matrix only acts in 2d */
    readonly isXY: boolean;
    private static _create;
    /** @returns a Matrix3d populated by numeric values given in row-major order.
     *  set all entries in the matrix from call parameters appearing in row - major order.
     * @param axx Row x, column x(0, 0) entry
     * @param axy Row x, column y(0, 1) entry
     * @param axz Row x, column z(0, 2) entry
     * @param ayx Row y, column x(1, 0) entry
     * @param ayy Row y, column y(1, 1) entry
     * @param ayz Row y, column z(1, 2) entry
     * @param azx Row z, column x(2, 0) entry
     * @param azy Row z, column y(2, 2) entry
     * @param azz row z, column z(2, 3) entry
     */
    static createRowValues(axx: number, axy: number, axz: number, ayx: number, ayy: number, ayz: number, azx: number, azy: number, azz: number, result?: Matrix3d): Matrix3d;
    /**
     * Create a Matrix3d with caller-supplied coefficients and optional inverse coefficients.
     * * The inputs are captured into the new Matrix3d.
     * * The caller is responsible for validity of the inverse coefficients.
     * @param coffs (required) array of 9 coefficients.
     * @param inverseCoffs (optional) array of 9 coefficients.
     * @returns a Matrix3d populated by a coffs array.
     */
    static createCapture(coffs: Float64Array, inverseCoffs?: Float64Array): Matrix3d;
    static createColumnsInAxisOrder(axisOrder: AxisOrder, columnA: Vector3d, columnB: Vector3d, columnC: Vector3d | undefined, result?: Matrix3d): Matrix3d;
    /**
     *  set all entries in the matrix from call parameters appearing in row-major order.
     * @param axx Row x, column x (0,0) entry
     * @param axy Row x, column y (0,1) entry
     * @param axz Row x, column z (0,2) entry
     * @param ayx Row y, column x (1,0) entry
     * @param ayy Row y, column y (1,1) entry
     * @param ayz Row y, column z (1,2) entry
     * @param azx Row z, column x (2,0) entry
     * @param azy Row z, column y (2,2) entry
     * @param azz row z, column z (2,3) entry
     */
    setRowValues(axx: number, axy: number, axz: number, ayx: number, ayy: number, ayz: number, azx: number, azy: number, azz: number): void;
    setIdentity(): void;
    setZero(): void;
    setFrom(other: Matrix3d): void;
    clone(result?: Matrix3d): Matrix3d;
    static createZero(): Matrix3d;
    static createIdentity(result?: Matrix3d): Matrix3d;
    /** Create a matrix with uniform scale factors */
    static createUniformScale(scaleFactor: number): Matrix3d;
    /**
     *
     * *  use createHeadsUpPerpendicular to generate a vectorV perpendicular to vectorA
     * *  construct a frame using createRigidFromColumns (vectorA, vectorB, axisOrder)
     */
    static createRigidHeadsUp(vectorA: Vector3d, axisOrder?: AxisOrder, result?: Matrix3d): Matrix3d;
    /**
     *
     * * return a vector that is perpendicular to the input direction.
     * * Among the infinite number of perpendiculars possible, this method
     * favors having one in the xy plane.
     * * Hence, when vectorA is NOT close to the Z axis, the returned vector is Z cross vectorA.
     * * But vectorA is close to the Z axis, the returned vector is unitY cross vectorA.
     */
    static createPerpendicularVectorFavorXYPlane(vector: Vector3d, result?: Vector3d): Vector3d;
    /**
     *
     * * return a vector that is perpendicular to the input direction.
     * * Among the infinite number of perpendiculars possible, this method
     * favors having one near the Z.
     * That is achieved by crossing "this" vector with the result of createHeadsUpPerpendicularFavorXYPlane.
     */
    static createPerpendicularVectorFavorPlaneContainingZ(vector: Vector3d, result?: Vector3d): Vector3d;
    /** Create a matrix with distinct x,y,z diagonal (scale) entries */
    static createScale(scaleFactorX: number, scaleFactorY: number, scaleFactorZ: number, result?: Matrix3d): Matrix3d;
    /** @returns return a rotation of specified angle around an axis */
    static createRotationAroundVector(axis: Vector3d, angle: Angle, result?: Matrix3d): Matrix3d | undefined;
    /** @returns return a rotation of specified angle around an axis
     * @param axisIndex index of axis (AxisIndex.X, AxisIndex.Y, AxisIndex.Z) kept fixed by the rotation.
     * @param angle angle of rotation
     * @param result optional result matrix.
     */
    static createRotationAroundAxisIndex(axisIndex: AxisIndex, angle: Angle, result?: Matrix3d): Matrix3d;
    /** Create a matrix with
     * * ColumnX points in the rightVector direction
     * * ColumnY points in in the upVectorDirection
     * * ColumnZ is a unit cross product.
     * Optinoally rotate the standard cube by 45 to bring its left or right vertical edge to center
     * * leftNoneRight = [-1,0,1] respectively for left edge, no rotation, or right edge
     * * bottomNoneTop = [-1,0,1] respectively for isometric rotation to view the bottom, no isometric rotation, and isometric rotation to view the top
     * This is expected to be used with various principal unit vectors that are perpendicular to each other.
     *  * STANDARD TOP VIEW: (Vector3d.UnitX (), Vector3d.UnitY (), 0, 0)
     *  * STANDARD FRONT VIEW: (Vector3d.UnitX (), Vector3d.UnitZ (), 0, 0)
     *  * STANDARD BACK VIEW: (Vector3d.UnitX (-1), Vector3d.UnitZ (), 0, 0)
     *  * STANDARD RIGHT VIEW: (Vector3d.UnitY (1), Vector3d.UnitZ (), 0, 0)
     *  * STANDARD LEFT VIEW: (Vector3d.UnitY (-1), Vector3d.UnitZ (), 0, 0)
     *  * STANDARD BOTTOM VIEW: (Vector3d.UnitX (1), Vector3d.UnitY (-1), 0, 0)
     * @param leftNoneRight Normally one of {-1,0,1}, where (-1) indicates the left vertical is rotated to center and (1) for right.  Other numbers are used as multiplier for this 45 degree rotation
     * @returns undefined if columNX, columnY are coplanar.
     */
    static createViewedAxes(rightVector: Vector3d, upVector: Vector3d, leftNoneRight?: number, topNoneBottom?: number): Matrix3d | undefined;
    /**
     * Create a rotation matrix for one of the 8 standard views.
     * * With `invert === false` the return is such that `matrix.multiply(worldVector)` returns the vector as seen in the xy (projected) coordinates of the view.
     * * With invert === true the matrix is transposed so that `matrix.mutiply(viewVector` maps the "in view" vector to a world vector.
     *
     * @param index standard veiw index `StandardViewIndex.Top, Bottom, LEft, Right, Front, Back, Iso, LeftIso`
     * @param invert if false (default), the returned Matrix3d "projects" world vectors into XY view vectors.  If true, it is inverted to map view vectors to world.
     * @param result optional result.
     */
    static createStandardWorldToView(index: StandardViewIndex, invert?: boolean, result?: Matrix3d): Matrix3d;
    /**
     * Compute the (unit vector) axis and angle of rotation.
     * @returns Returns with result.ok === true when the conversion succeeded.
     */
    getAxisAndAngleOfRotation(): {
        axis: Vector3d;
        angle: Angle;
        ok: boolean;
    };
    /**
     * @returns return a matrix that rotates from vectorA to vectorB.
     */
    static createRotationVectorToVector(vectorA: Vector3d, vectorB: Vector3d, result?: Matrix3d): Matrix3d | undefined;
    /**
     * Return a matrix that rotates a fraction of the angular sweep from vectorA to vectorB.
     * @param vectorA initial vector position
     * @param fraction fractional rotation.  1.0 is "all the way"
     * @param vectorB final vector position
     * @param result optional result matrix.
     */
    static createPartialRotationVectorToVector(vectorA: Vector3d, fraction: number, vectorB: Vector3d, result?: Matrix3d): Matrix3d | undefined;
    /** Create a 90 degree rotation around a principal axis */
    static create90DegreeRotationAroundAxis(axisIndex: number): Matrix3d;
    /** @returns Return (a copy of) the X column */
    columnX(result?: Vector3d): Vector3d;
    /** @returns Return (a copy of)the Y column */
    columnY(result?: Vector3d): Vector3d;
    /** @returns Return (a copy of)the Z column */
    columnZ(result?: Vector3d): Vector3d;
    /** @returns Return the X column magnitude squared */
    columnXMagnitudeSquared(): number;
    /** @returns Return the Y column magnitude squared */
    columnYMagnitudeSquared(): number;
    /** @returns Return the Z column magnitude squared */
    columnZMagnitudeSquared(): number;
    /** @returns Return the X column magnitude */
    columnXMagnitude(): number;
    /** @returns Return the Y column magnitude */
    columnYMagnitude(): number;
    /** @returns Return the Z column magnitude */
    columnZMagnitude(): number;
    /** @returns Return magntiude of columnX cross columnY. */
    columnXYCrossProductMagnitude(): number;
    /** @returns Return the X row magnitude d */
    rowXMagnitude(): number;
    /** @returns Return the Y row magnitude  */
    rowYMagnitude(): number;
    /** @returns Return the Z row magnitude  */
    rowZMagnitude(): number;
    /** @returns the dot product of column X with column Y */
    /** @returns the dot product of column X with column Y */
    columnXDotColumnY(): number;
    /** Return (a copy of) the X row */
    rowX(result?: Vector3d): Vector3d;
    /** Return (a copy of) the Y row */
    rowY(result?: Vector3d): Vector3d;
    /** Return (a copy of) the Z row */
    rowZ(result?: Vector3d): Vector3d;
    /** @returns Return the dot product of the vector parameter with the X column. */
    dotColumnX(vector: XYZ): number;
    /** @returns Return the dot product of the vector parameter with the Y column. */
    dotColumnY(vector: XYZ): number;
    /** @returns Return the dot product of the vector parameter with the Z column. */
    dotColumnZ(vector: XYZ): number;
    /** @returns Return the dot product of the vector parameter with the X row. */
    dotRowX(vector: XYZ): number;
    /** @returns Return the dot product of the vector parameter with the Y row. */
    dotRowY(vector: XYZ): number;
    /** @returns Return the dot product of the vector parameter with the Z row. */
    dotRowZ(vector: XYZ): number;
    /** @returns Return the dot product of the x,y,z with the X row. */
    dotRowXXYZ(x: number, y: number, z: number): number;
    /** @returns Return the dot product of the x,y,z with the Y row. */
    dotRowYXYZ(x: number, y: number, z: number): number;
    /** @returns Return the dot product of the x,y,z with the Z row. */
    dotRowZXYZ(x: number, y: number, z: number): number;
    /** @returns Return the (vector) cross product of the Z column with the vector parameter. */
    columnZCrossVector(vector: XYZ, result?: Vector3d): Vector3d;
    /**
     * Replace current rows Ui Uj with (c*Ui - s*Uj) and (c*Uj + s*Ui)
     * @param i first row index.  must be 0,1,2 (unchecked)
     * @param j second row index. must be 0,1,2 (unchecked)
     * @param c fist coefficient
     * @param s second coefficient
     */
    private applyGivensRowOp;
    /**
     * Replace current columns Ui Uj with (c*Ui - s*Uj) and (c*Uj + s*Ui)
     * This is used in compute intensive inner loops -- there is no
     * checking for i,j being 0,1,2
     * @param i first row index.  must be 0,1,2 (unchecked)
     * @param j second row index. must be 0,1,2 (unchecked)
     * @param c fist coefficient
     * @param s second coefficient
     */
    applyGivensColumnOp(i: number, j: number, c: number, s: number): void;
    /**
     * create a rigid coordinate frame with:
     * * column z points from origin to x,y,z
     * * column x is perpendicular and in the xy plane
     * * column y is perpendicular to both.  It is the "up" vector on the view plane.
     * * Multiplying a world vector times the transpose of this matrix transforms into the view xy
     * * Multiplying the matrix times the an in-view vector transforms the vector to world.
     * @param x eye x coordinate
     * @param y eye y coordinate
     * @param z eye z coordinate
     * @param result
     */
    static createRigidViewAxesZTowardsEye(x: number, y: number, z: number, result?: Matrix3d): Matrix3d;
    /** Rotate so columns i and j become perpendicular */
    private applyJacobiColumnRotation;
    /**
     * Factor this as a product C * U where C has mutually perpendicular columns and
     * U is orthogonal.
     * @param matrixC (allocate by caller, computed here)
     * @param factor  (allocate by caller, computed here)
     */
    factorPerpendicularColumns(matrixC: Matrix3d, matrixU: Matrix3d): boolean;
    /** Apply a jacobi step to lambda which evolves towards diagonal. */
    private applySymmetricJacobi;
    /**
     * Factor this (symmetrized) as a product U * lambda * UT where U is orthogonal, lambda is diagonal.
     * The upper triangle is mirrored to lower triangle to enforce symmetry.
     * @param matrixC (allocate by caller, computed here)
     * @param factor  (allocate by caller, computed here)
     */
    symmetricEigenvalues(leftEigenvectors: Matrix3d, lambda: Vector3d): boolean;
    /** Apply (in place a jacobi update that zeros out this.at(i,j).
     *
     */
    private applyFastSymmetricJacobiUpdate;
    /**
     * Factor this (symmetrized) as a product U * lambda * UT where U is orthogonal, lambda is diagonal.
     * The upper triangle is mirrored to lower triangle to enforce symmetry.
     * @param matrixC (allocate by caller, computed here)
     * @param factor  (allocate by caller, computed here)
     */
    fastSymmetricEigenvalues(leftEigenvectors: Matrix3d, lambda: Vector3d): boolean;
    /** Create a matrix from column vectors. */
    static createColumns(vectorU: Vector3d, vectorV: Vector3d, vectorW: Vector3d, result?: Matrix3d): Matrix3d;
    /** Create a matrix from column vectors.
     * Each column gets x and y from given XAndY, and z from w.
     */
    static createColumnsXYW(vectorU: XAndY, uz: number, vectorV: XAndY, vz: number, vectorW: XAndY, wz: number, result?: Matrix3d): Matrix3d;
    /** Install data from xyz parts of Point4d  (w part of Point4d ignored) */
    setColumnsPoint4dXYZ(vectorU: Point4d, vectorV: Point4d, vectorW: Point4d): void;
    /**
     * set entries in one column of the matrix.
     * @param columnIndex column index. this is interpreted cyclically.
     * @param value x,yz, values for column.  If undefined, zeros are installed.
     */
    setColumn(columnIndex: number, value: Vector3d | undefined): void;
    /** Set all columns of the matrix. Any undefined vector is zeros. */
    setColumns(vectorX: Vector3d | undefined, vectorY: Vector3d | undefined, vectorZ?: Vector3d | undefined): void;
    setRow(columnIndex: number, value: Vector3d): void;
    /** Return a (copy of) a column of the matrix.
     * @param i column index.  Thnis is corrected to 012 by Geoemtry.cyclic3dAxis.
     */
    getColumn(columnIndex: number, result?: Vector3d): Vector3d;
    /** Return a (copy of) a row of the matrix.
     * @param i row index.  Thnis is corrected to 012 by Geoemtry.cyclic3dAxis.
     */
    getRow(columnIndex: number, result?: Vector3d): Vector3d;
    /** Create a matrix from column vectors, shuffled into place per AxisTriple */
    static createShuffledColumns(vectorU: Vector3d, vectorV: Vector3d, vectorW: Vector3d, axisOrder: AxisOrder, result?: Matrix3d): Matrix3d;
    /** Create a matrix from row vectors. */
    static createRows(vectorU: Vector3d, vectorV: Vector3d, vectorW: Vector3d, result?: Matrix3d): Matrix3d;
    /** Create a matrix that scales along a specified direction. The scale factor can be negative. for instance scale of -1.0 (negative one) is a mirror. */
    static createDirectionalScale(direction: Vector3d, scale: number, result?: Matrix3d): Matrix3d;
    /** Multiply the matrix * vector, i.e. the vector is a column vector on the right.
     * @return the vector result
     */
    multiplyVector(vector: Vector3d, result?: Vector3d): Vector3d;
    /** Multiply the matrix * vector, i.e. the vector is a column vector on the right.
     * @return the vector result
     */
    multiplyVectorArrayInPlace(data: XYZ[]): void;
    static XYZMinusMatrixTimesXYZ(origin: XYZ, matrix: Matrix3d, vector: XYZ, result?: Point3d): Point3d;
    static XYPlusMatrixTimesXY(origin: XAndY, matrix: Matrix3d, vector: XAndY, result?: Point2d): Point2d;
    static XYZPlusMatrixTimesXYZ(origin: XYZ, matrix: Matrix3d, vector: XYAndZ, result?: Point3d): Point3d;
    static XYZPlusMatrixTimesCoordinates(origin: XYZ, matrix: Matrix3d, x: number, y: number, z: number, result?: Point3d): Point3d;
    /**
     * Treat the 3x3 matrix and origin as upper 3x4 part of a 4x4 matrix, with 0001 as the final row.
     * Multiply times point with coordinates `[x,y,z,w]`
     * @param origin translation part (xyz in column 3)
     * @param matrix matrix part (leading 3x3)
     * @param x x part of multiplied point
     * @param y y part of multiplied point
     * @param z z part of multiplied point
     * @param w w part of multiplied point
     * @param result optional result.
     */
    static XYZPlusMatrixTimesWeightedCoordinates(origin: XYZ, matrix: Matrix3d, x: number, y: number, z: number, w: number, result?: Point4d): Point4d;
    /**
     * Treat the 3x3 matrix and origin as upper 3x4 part of a 4x4 matrix, with 0001 as the final row.
     * Multiply times point with coordinates `[x,y,z,w]`
     * @param origin translation part (xyz in column 3)
     * @param matrix matrix part (leading 3x3)
     * @param x x part of multiplied point
     * @param y y part of multiplied point
     * @param z z part of multiplied point
     * @param w w part of multiplied point
     * @param result optional result.
     */
    static XYZPlusMatrixTimesWeightedCoordinatesToFloat64Array(origin: XYZ, matrix: Matrix3d, x: number, y: number, z: number, w: number, result?: Float64Array): Float64Array;
    /**
     * Treat the 3x3 matrix and origin as upper 3x4 part of a 4x4 matrix, with 0001 as the final row.
     * Multiply times point with coordinates `[x,y,z,w]`
     * @param origin translation part (xyz in column 3)
     * @param matrix matrix part (leading 3x3)
     * @param x x part of multiplied point
     * @param y y part of multiplied point
     * @param z z part of multiplied point
     * @param w w part of multiplied point
     * @param result optional result.
     */
    static XYZPlusMatrixTimesCoordinatesToFloat64Array(origin: XYZ, matrix: Matrix3d, x: number, y: number, z: number, result?: Float64Array): Float64Array;
    multiplyTransposeVector(vector: Vector3d, result?: Vector3d): Vector3d;
    /** Multiply the matrix * (x,y,z), i.e. the vector (x,y,z) is a column vector on the right.
     * @return the vector result
     */
    multiplyXYZ(x: number, y: number, z: number, result?: Vector3d): Vector3d;
    /** Multiply the matrix * xyz, place result in (required) return value.
     *   @param xyz right side
     *   @param result result.
     */
    multiplyXYZtoXYZ(xyz: XYZ, result: XYZ): XYZ;
    /** Multiply the matrix * (x,y,0), i.e. the vector (x,y,z) is a column vector on the right.
     *   @return the vector result
     */
    multiplyXY(x: number, y: number, result?: Vector3d): Vector3d;
    originPlusMatrixTimesXY(origin: XYZ, x: number, y: number, result?: Point3d): Point3d;
    /** Multiply matrix * (x, y, z) using any 3d object given containing those members */
    multiplyVectorInPlace(xyzData: XYZ): void;
    /** Multiply matrix * (x, y, z) using any 3d object given containing those members */
    multiplyTransposeVectorInPlace(xyzData: XYZ): void;
    /** Multiply the (x,y,z) * matrix, i.e. the vector (x,y,z) is a row vector on the left.
     *   @return the vector result
     */
    multiplyTransposeXYZ(x: number, y: number, z: number, result?: Vector3d): Vector3d;
    /** Solve matrix * result = vector, i.e. multiply result = matrixInverse * rightHandSide  */
    multiplyInverse(vector: Vector3d, result?: Vector3d): Vector3d | undefined;
    /** Solve matrix * result = vector, i.e. multiply result = matrixInverse * rightHandSide  */
    multiplyInverseTranspose(vector: Vector3d, result?: Vector3d): Vector3d | undefined;
    /**
     *
     * *  multiply matrixInverse * [x,y,z]
     * *  Equivalent to solving matrix * result = [x,y,z]
     * *  return as a Vector3d.
     */
    multiplyInverseXYZAsVector3d(x: number, y: number, z: number, result?: Vector3d): Vector3d | undefined;
    /**
     *
     * *  multiply matrixInverse * [x,y,z]
     * *  Equivalent to solving matrix * result = [x,y,z]
     * *  return as a Point3d.
     */
    multiplyInverseXYZAsPoint3d(x: number, y: number, z: number, result?: Point3d): Point3d | undefined;
    /** Multiply two matrices.
     *   @return the matrix result
     */
    multiplyMatrixMatrix(other: Matrix3d, result?: Matrix3d): Matrix3d;
    /** Matrix multiplication `this * otherTranspose`
     * @return the matrix result
     */
    multiplyMatrixMatrixTranspose(other: Matrix3d, result?: Matrix3d): Matrix3d;
    /** Matrix multiplication `thisTranspose * other`
     *   @return the matrix result
     */
    multiplyMatrixTransposeMatrix(other: Matrix3d, result?: Matrix3d): Matrix3d;
    /** multiply this Matrix3d (considered as a transform with 0 translation) times other Transform.
     * @param other right hand Matrix3d for multiplication.
     * @param result optional preallocated result to reuse.
     */
    multiplyMatrixTransform(other: Transform, result?: Transform): Transform;
    /** return the transposed matrix */
    transpose(result?: Matrix3d): Matrix3d;
    /** return the transposed matrix */
    transposeInPlace(): void;
    /** return the inverse matrix.  The return is  null if the matrix is singular (has columns that are coplanar or colinear) */
    inverse(result?: Matrix3d): Matrix3d | undefined;
    /** copy the transpose of the coffs to the inverseCoffs.
     * * mark the matrix as inverseStored.
     */
    private setupInverseTranspose;
    private static indexedRowCrossProduct;
    private indexedColumnCrossProductInPlace;
    /** Form cross products among axes in axisOrder.
     * For axis order ABC,
     * * form cross product of column A and B, store in C
     * * form cross product of column C and A, store in B.
     * This means that in the final matrix:
     * * column A is strictly parallel to original column A
     * * column B is linear combination of only original A and B
     * * column C is perpenedicular to A and B of both the original and final.
     * * original column C does not participate in the result.
     */
    axisOrderCrossProductsInPlace(axisOrder: AxisOrder): void;
    /** Normalize each column in place.
     * * For false return the magnitudes are stored in the originalMagnitudes vector but no columns are altered.
     * @returns Return true if all columns had nonzero lengths.
     * @param originalMagnitudes optional vector to receive original column magnitudes.
     */
    normalizeColumnsInPlace(originalMagnitudes?: Vector3d): boolean;
    /** Normalize each row in place */
    normalizeRowsInPlace(originalMagnitudes?: Vector3d): boolean;
    private static rowColumnDot;
    /** compute the inverse of this Matrix3d. The inverse is stored for later use.
     * @returns Return true if the inverse computed.  (False if the columns collapse to a point, line or plane.)
     */
    computeCachedInverse(useCacheIfAvailable: boolean): boolean;
    static flatIndexOf(row: number, column: number): number;
    /** Get a column by index (0,1,2), packaged as a Point4d with given weight.   Out of range index is interpreted cyclically.  */
    indexedColumnWithWeight(index: number, weight: number, result?: Point4d): Point4d;
    /** return the entry at specific row and column */
    at(row: number, column: number): number;
    /** Set the entry at specific row and column */
    setAt(row: number, column: number, value: number): void;
    /** create a Matrix3d whose columns are scaled copies of this Matrix3d.
     * @param scaleX scale factor for columns x
     * @param scaleY scale factor for column y
     * @param scaleZ scale factor for column z
     * @param result optional result.
     */
    scaleColumns(scaleX: number, scaleY: number, scaleZ: number, result?: Matrix3d): Matrix3d;
    /** create a Matrix3d whose columns are scaled copies of this Matrix3d.
     * @param scaleX scale factor for columns x
     * @param scaleY scale factor for column y
     * @param scaleZ scale factor for column z
     * @param result optional result.
     */
    scaleColumnsInPlace(scaleX: number, scaleY: number, scaleZ: number): void;
    /** create a Matrix3d whose rows are scaled copies of this Matrix3d.
     * @param scaleX scale factor for row x
     * @param scaleY scale factor for row y
     * @param scaleZ scale factor for row z
     * @param result optional result.
     */
    scaleRows(scaleX: number, scaleY: number, scaleZ: number, result?: Matrix3d): Matrix3d;
    /**
     * add scaled values from other Matrix3d to this Matrix3d
     * @param other Matrix3d with values to be added
     * @param scale scale factor to apply to th eadded values.
     */
    addScaledInPlace(other: Matrix3d, scale: number): void;
    /** create a Matrix3d whose values are uniformly scaled from this.
     * @param scale scale factor to apply.
     * @param result optional result.
     * @returns Return the new or repopulated matrix
     */
    scale(scale: number, result?: Matrix3d): Matrix3d;
    /** Return the determinant of this matrix. */
    determinant(): number;
    /** Return an estimate of how independent the columns are.  Near zero is bad. Near 1 is good
     */
    conditionNumber(): number;
    /** Return the sum of squares of all entries */
    sumSquares(): number;
    /** Return the sum of squares of diagonal entries */
    sumDiagonalSquares(): number;
    /** Return the sum of diagonal entries (also known as the trace) */
    sumDiagonal(): number;
    /** Return the Maximum absolute value of any single entry */
    maxAbs(): number;
    /** Return the maximum absolute difference between corresponding entries */
    maxDiff(other: Matrix3d): number;
    /** Test if the matrix is (very near to) an identity */
    readonly isIdentity: boolean;
    /** Test if the off diagonal entries are all nearly zero */
    readonly isDiagonal: boolean;
    /** Test if the below diagonal entries are all nearly zero */
    readonly isUpperTriangular: boolean;
    /** If the matrix is diagonal and all diagonals are within tolerance, return the first diagonal.  Otherwise return undefined.
     */
    sameDiagonalScale(): number | undefined;
    /** Sum of squared differences between symmetric pairs */
    sumSkewSquares(): number;
    /** Test if the matrix is a pure rotation. */
    isRigid(allowMirror?: boolean): boolean;
    /** Test if all rows and columns are perpendicular to each other and have equal length.
     * If so, the length (or its negative) is the scale factor from a set of rigid axes to these axes.
     * * result.rigidAxes is the rigid axes (with the scale factor removed)
     * * result.scale is the scale factor
     */
    factorRigidWithSignedScale(): {
        rigidAxes: Matrix3d;
        scale: number;
    } | undefined;
    /** Test if the matrix is shuffles and negates columns. */
    readonly isSignedPermutation: boolean;
    /** Test if all rows and columns are length 1 and are perpendicular to each other.  (I.e. the matrix is either a pure rotation with uniform scale factor of 1 or -1) */
    testPerpendicularUnitRowsAndColumns(): boolean;
    /** create a new orthogonal matrix (perpendicular columns, unit length, transpose is inverse)
     * vectorA is placed in the first column of the axis order.
     * vectorB is projected perpendicular to vectorA within their plane and placed in the second column.
     */
    static createRigidFromColumns(vectorA: Vector3d, vectorB: Vector3d, axisOrder: AxisOrder, result?: Matrix3d): Matrix3d | undefined;
    /** create a new orthogonal matrix (perpendicular columns, unit length, transpose is inverse)
     * columns are taken from the source Matrix3d in order indicated by the axis order.
     */
    static createRigidFromMatrix3d(source: Matrix3d, axisOrder?: AxisOrder, result?: Matrix3d): Matrix3d | undefined;
}
//# sourceMappingURL=Matrix3d.d.ts.map