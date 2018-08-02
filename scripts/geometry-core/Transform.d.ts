/** @module CartesianGeometry */
import { Angle, AxisOrder, BeJSONFunctions } from "./Geometry";
import { Point4d } from "./numerics/Geometry4d";
import { Range3d } from "./Range";
import { Point2d, Point3d, Vector3d, XYAndZ } from "./PointVector";
import { XAndY, XYZ, RotMatrixProps, TransformProps } from "./PointVector";
/** A RotMatrix is tagged indicating one of the following states:
 * * unknown: it is not know if the matrix is invertible.
 * * inverseStored: the matrix has its inverse stored
 * * singular: the matrix is known to be singular.
 */
export declare enum InverseMatrixState {
    unknown = 0,
    inverseStored = 1,
    singular = 2,
}
/** A RotMatrix (short for RotationMatrix) is a 3x3 matrix.
 * * The name from common use to hold a rigid body rotation,, but its 3x3 contents can
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
export declare class RotMatrix implements BeJSONFunctions {
    static useCachedInverse: boolean;
    static numUseCache: number;
    static numComputeCache: number;
    coffs: Float64Array;
    inverseCoffs: Float64Array | undefined;
    inverseState: InverseMatrixState;
    static readonly identity: RotMatrix;
    /** Freeze this RotMatrix. */
    freeze(): void;
    /**
     *
     * @param coffs optional coefficient array.  This is captured.
     */
    constructor(coffs?: Float64Array);
    /** Return a json object containing the 9 numeric entries as a single array in row major order,
     * `[ [1, 2, 3],[ 4, 5, 6], [7, 8, 9] ]`
     * */
    toJSON(): RotMatrixProps;
    setFromJSON(json?: RotMatrixProps): void;
    /** @returns Return a new RotMatrix constructed from contents of the json value. */
    static fromJSON(json?: RotMatrixProps): RotMatrix;
    /** Test if this RotMatrix and other are within tolerance in all numeric entries.
     * @param tol optional tolerance for comparisons by Geometry.isDistanceWithinTol
     */
    isAlmostEqual(other: RotMatrix, tol?: number): boolean;
    /** Test for exact (bitwise) equality with other. */
    isExactEqual(other: RotMatrix): boolean;
    /** test if all entries in the z row and column are exact 001, i.e. the matrix only acts in 2d */
    isXY(): boolean;
    private static _create(result?);
    /** @returns a RotMatrix populated by numeric values given in row-major order.
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
    static createRowValues(axx: number, axy: number, axz: number, ayx: number, ayy: number, ayz: number, azx: number, azy: number, azz: number, result?: RotMatrix): RotMatrix;
    /**
     * Create a RotMatrix with caller-supplied coefficients and optional inverse coefficients.
     * * The inputs are captured into the new RotMatrix.
     * * The caller is responsible for validity of the inverse coefficients.
     * @param coffs (required) array of 9 coefficients.
     * @param inverseCoffs (optional) array of 9 coefficients.
     * @returns a RotMatrix populated by a coffs array.
     */
    static createCapture(coffs: Float64Array, inverseCoffs?: Float64Array): RotMatrix;
    static createColumnsInAxisOrder(axisOrder: AxisOrder, columnA: Vector3d, columnB: Vector3d, columnC: Vector3d | undefined, result?: RotMatrix): RotMatrix;
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
    setFrom(other: RotMatrix): void;
    clone(result?: RotMatrix): RotMatrix;
    static createZero(): RotMatrix;
    static createIdentity(result?: RotMatrix): RotMatrix;
    /** Create a matrix with uniform scale factors */
    static createUniformScale(scaleFactor: number): RotMatrix;
    /**
     *
     * *  use createHeadsUpPerpendicular to generate a vectorV perpendicular to vectorA
     * *  construct a frame using createRigidFromColumns (vectorA, vectorB, axisOrder)
     */
    static createRigidHeadsUp(vectorA: Vector3d, axisOrder?: AxisOrder, result?: RotMatrix): RotMatrix;
    /**
     *
     * * return a vector that is perpendicular to the input direction.
     * * Among the infinite number of perpendiculars possible, this method
     * favors having one in the xy plane.
     * * Hence, when vectorA is NOT close to the Z axis, the returned vector is Z cross vectorA.
     * * But vectorA is close to the Z axis, the returned vector is unitY cross vectorA.
     */
    static createRigidHeadsUpFavorXYPlane(vector: Vector3d, result?: Vector3d): Vector3d;
    /**
   *
   * * return a vector that is perpendicular to the input direction.
   * * Among the infinite number of perpendiculars possible, this method
   * favors having one near the Z.
   * That is achieved by crossing "this" vector with the result of createHeadsUpPerpendicularFavorXYPlane.
   */
    static createHeadsUpPerpendicularNearZ(vector: Vector3d, result?: Vector3d): Vector3d;
    /** Create a matrix with distinct x,y,z diagonal (scale) entries */
    static createScale(scaleFactorX: number, scaleFactorY: number, scaleFactorZ: number, result?: RotMatrix): RotMatrix;
    /** @returns return a rotation of specified angle around an axis */
    static createRotationAroundVector(axis: Vector3d, angle: Angle, result?: RotMatrix): RotMatrix | undefined;
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
    static createRotationVectorToVector(vectorA: Vector3d, vectorB: Vector3d, result?: RotMatrix): RotMatrix | undefined;
    /**
     * Return a matrix that rotates a fraction of the angular sweep from vectorA to vectorB.
     * @param vectorA initial vector position
     * @param fraction fractional rotation.  1.0 is "all the way"
     * @param vectorB final vector position
     * @param result optional result matrix.
    */
    static createPartialRotationVectorToVector(vectorA: Vector3d, fraction: number, vectorB: Vector3d, result?: RotMatrix): RotMatrix | undefined;
    /** Create a 90 degree rotation around a principal axis */
    static create90DegreeRotationAroundAxis(axisIndex: number): RotMatrix;
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
    /** @returns the dot product of column X with column Y */
    /** @returns Return the X row magnitude squared */
    rowXMagnitude(): number;
    /** @returns Return the Y row magnitude squared */
    rowYMagnitude(): number;
    /** @returns Return the Z row magnitude squared */
    rowZMagnitude(): number;
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
    /** @returns Return the (vector) cross product of the Z column with the vector parameter. */
    columnZCrossVector(vector: XYZ, result?: Vector3d): Vector3d;
    /**
     * Replace current rows Ui Uj with (c*Ui - s*Uj) and (c*Uj + s*Ui)
     * @param i first row index.  must be 0,1,2 (unchecked)
     * @param j second row index. must be 0,1,2 (unchecked)
     * @param c fist coefficient
     * @param s second coefficient
     */
    private applyGivensRowOp(i, j, c, s);
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
    /** Rotate so columns i and j become perpendicular */
    private applyJacobiColumnRotation(i, j, matrixU);
    /**
     * Factor this as a product C * U where C has mutually perpendicular columns and
     * U is orthogonal.
     * @param matrixC (allocate by caller, computed here)
     * @param factor  (allocate by caller, computed here)
     */
    factorPerpendicularColumns(matrixC: RotMatrix, matrixU: RotMatrix): boolean;
    /** Apply a jacobi step to lambda which evolves towards diagonal. */
    private applySymmetricJacobi(i, j, lambda);
    /**
     * Factor this (symmetrized) as a product U * lambda * UT where U is orthogonal, lambda is diagonal.
     * The upper triangle is mirrored to lower triangle to enforce symmetry.
     * @param matrixC (allocate by caller, computed here)
     * @param factor  (allocate by caller, computed here)
     */
    symmetricEigenvalues(leftEigenvectors: RotMatrix, lambda: Vector3d): boolean;
    /** Apply (in place a jacobi update that zeros out this.at(i,j).*/
    private applyFastSymmetricJacobiUpdate(i, j, k, leftEigenVectors);
    /**
   * Factor this (symmetrized) as a product U * lambda * UT where U is orthogonal, lambda is diagonal.
   * The upper triangle is mirrored to lower triangle to enforce symmetry.
   * @param matrixC (allocate by caller, computed here)
   * @param factor  (allocate by caller, computed here)
   */
    fastSymmetricEigenvalues(leftEigenvectors: RotMatrix, lambda: Vector3d): boolean;
    /** Create a matrix from column vectors. */
    static createColumns(vectorU: Vector3d, vectorV: Vector3d, vectorW: Vector3d, result?: RotMatrix): RotMatrix;
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
    static createShuffledColumns(vectorU: Vector3d, vectorV: Vector3d, vectorW: Vector3d, axisOrder: AxisOrder, result?: RotMatrix): RotMatrix;
    /** Create a matrix from row vectors. */
    static createRows(vectorU: Vector3d, vectorV: Vector3d, vectorW: Vector3d, result?: RotMatrix): RotMatrix;
    /** Create a matrix that scales along a specified direction. The scale factor can be negative. for instance scale of -1.0 (negative one) is a mirror. */
    static createDirectionalScale(direction: Vector3d, scale: number, result?: RotMatrix): RotMatrix;
    /** Multiply the matrix * vector, i.e. the vector is a column vector on the right.
        @return the vector result
    */
    multiplyVector(vector: Vector3d, result?: Vector3d): Vector3d;
    /** Multiply the matrix * vector, i.e. the vector is a column vector on the right.
        @return the vector result
    */
    multiplyVectorArrayInPlace(data: XYZ[]): void;
    static XYZMinusMatrixTimesXYZ(origin: XYZ, matrix: RotMatrix, vector: XYZ, result?: Point3d): Point3d;
    static XYPlusMatrixTimesXY(origin: XAndY, matrix: RotMatrix, vector: XAndY, result?: Point2d): Point2d;
    static XYZPlusMatrixTimesXYZ(origin: XYZ, matrix: RotMatrix, vector: XYAndZ, result?: Point3d): Point3d;
    static XYZPlusMatrixTimesCoordinates(origin: XYZ, matrix: RotMatrix, x: number, y: number, z: number, result?: Point3d): Point3d;
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
    static XYZPlusMatrixTimesWeightedCoordinates(origin: XYZ, matrix: RotMatrix, x: number, y: number, z: number, w: number, result?: Point4d): Point4d;
    multiplyTransposeVector(vector: Vector3d, result?: Vector3d): Vector3d;
    /** Multiply the matrix * (x,y,z), i.e. the vector (x,y,z) is a column vector on the right.
        @return the vector result
    */
    multiplyXYZ(x: number, y: number, z: number, result?: Vector3d): Vector3d;
    /** Multiply the matrix * xyz, place result in (required) return value.
        @param xyz right side
        @param result result.
    */
    multiplyXYZtoXYZ(xyz: XYZ, result: XYZ): XYZ;
    /** Multiply the matrix * (x,y,z), i.e. the vector (x,y,z) is a column vector on the right.
        @return the vector result
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
    multiplyMatrixMatrix(other: RotMatrix, result?: RotMatrix): RotMatrix;
    /** Matrix multiplication `this * otherTranspose`
        @return the matrix result
    */
    multiplyMatrixMatrixTranspose(other: RotMatrix, result?: RotMatrix): RotMatrix;
    /** Matrix multiplication `thisTranspose * other`
        @return the matrix result
    */
    multiplyMatrixTransposeMatrix(other: RotMatrix, result?: RotMatrix): RotMatrix;
    /** multiply this RotMatrix (considered as a transform with 0 translation) times other Transform.
     * @param other right hand RotMatrix for multiplication.
     * @param result optional preallocated result to reuse.
    */
    multiplyMatrixTransform(other: Transform, result?: Transform): Transform;
    /** return the transposed matrix */
    transpose(result?: RotMatrix): RotMatrix;
    /** return the transposed matrix */
    transposeInPlace(): void;
    /** return the inverse matrix.  The return is  null if the matrix is singular (has columns that are coplanar or colinear) */
    inverse(result?: RotMatrix): RotMatrix | undefined;
    /** copy the transpose of the coffs to the inverseCoffs.
     * * mark the matrix as inverseStored.
     */
    private setupInverseTranspose();
    private static indexedRowCrossProduct(source, rowStart0, rowStart1, dest, columnStart);
    private indexedColumnCrossProductInPlace(colStart0, colStart1, colStart2);
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
    private static rowColumnDot(coffA, rowStartA, coffB, columnStartB);
    /** compute the inverse of this RotMatrix. The inverse is stored for later use.
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
    /** create a RotMatrix whose columns are scaled copies of this RotMatrix.
     * @param scaleX scale factor for columns x
     * @param scaleY scale factor for column y
     * @param scaleZ scale factor for column z
     * @param result optional result.
     * */
    scaleColumns(scaleX: number, scaleY: number, scaleZ: number, result?: RotMatrix): RotMatrix;
    /** create a RotMatrix whose columns are scaled copies of this RotMatrix.
     * @param scaleX scale factor for columns x
     * @param scaleY scale factor for column y
     * @param scaleZ scale factor for column z
     * @param result optional result.
     * */
    scaleColumnsInPlace(scaleX: number, scaleY: number, scaleZ: number): void;
    /** create a RotMatrix whose rows are scaled copies of this RotMatrix.
     * @param scaleX scale factor for row x
     * @param scaleY scale factor for row y
     * @param scaleZ scale factor for row z
     * @param result optional result.
     * */
    scaleRows(scaleX: number, scaleY: number, scaleZ: number, result?: RotMatrix): RotMatrix;
    /**
     * add scaled values from other RotMatrix to this RotMatrix
     * @param other RotMatrix with values to be added
     * @param scale scale factor to apply to th eadded values.
     */
    addScaledInPlace(other: RotMatrix, scale: number): void;
    /** create a RotMatrix whose values are uniformly scaled from this.
     * @param scale scale factor to apply.
     * @param result optional result.
     * @returns Return the new or repopulated matrix
     */
    scale(scale: number, result?: RotMatrix): RotMatrix;
    /** Return the determinant of this matrix. */
    determinant(): number;
    /** Return an estimate of how independent the columns are.  Near zero is bad. */
    /** Return the sum of squares of all entries */
    sumSquares(): number;
    /** Return the sum of squares of diagonal entries */
    sumDiagonalSquares(): number;
    /** Return the sum of diagonal entries (also known as the trace) */
    sumDiagonal(): number;
    /** Return the Maximum absolute value of any single entry */
    maxAbs(): number;
    /** Return the maximum absolute difference between corresponding entries */
    maxDiff(other: RotMatrix): number;
    /** Test if the matrix is (very near to) an identity */
    isIdentity(): boolean;
    /** Test if the off diagonal entries are all nearly zero */
    isDiagonal(): boolean;
    /** Test if the below diagonal entries are all nearly zero */
    isUpperTriangular(): boolean;
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
        rigidAxes: RotMatrix;
        scale: number;
    } | undefined;
    /** Test if the matrix is shuffles and negates columns. */
    isSignedPermutation(): boolean;
    /** Test if all rows and columns are length 1 and are perpendicular to each other.  (I.e. the matrix is either a pure rotation with uniform scale factor of 1 or -1) */
    hasPerpendicularUnitRowsAndColumns(): boolean;
    /** create a new orthogonal matrix (perpendicular columns, unit length, transpose is inverse)
     * vectorA is placed in the first column of the axis order.
     * vectorB is projected perpendicular to vectorA within their plane and placed in the second column.
     */
    static createRigidFromColumns(vectorA: Vector3d, vectorB: Vector3d, axisOrder: AxisOrder, result?: RotMatrix): RotMatrix | undefined;
    /** create a new orthogonal matrix (perpendicular columns, unit length, transpose is inverse)
     * columns are taken from the source RotMatrix in order indicated by the axis order.
     */
    static createRigidFromRotMatrix(source: RotMatrix, axisOrder?: AxisOrder, result?: RotMatrix): RotMatrix | undefined;
}
/** A transform is an origin and a RotMatrix.
 *
 * * This describes a coordinate frame with
 * this origin, with the columns of the RotMatrix being the
 * local x,y,z axis directions.
 * *  Beware that for common transformations (e.g. scale about point,
 * rotate around line, mirror across a plane) the "fixed point" that is used
 * when describing the transform is NOT the "origin" stored in the transform.
 * Setup methods (e.g createFixedPointAndMatrix, createScaleAboutPoint)
 * take care of determining the appropriate origin coordinates.
 */
export declare class Transform implements BeJSONFunctions {
    private static scratchPoint;
    private _origin;
    private _matrix;
    private constructor();
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
    /** Create a copy with the given origin and matrix captured as the Transform origin and RotMatrix. */
    static createRefs(origin: XYZ, matrix: RotMatrix, result?: Transform): Transform;
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
    readonly matrix: RotMatrix;
    /** Return a reference to the origin within the transform.  (NOT a copy) */
    readonly origin: XYZ;
    /** return a (clone of) the origin part of the transform, as a Point3d */
    getOrigin(): Point3d;
    /** return a (clone of) the origin part of the transform, as a Vector3d */
    getTranslation(): Vector3d;
    /** test if the transform has 000 origin and identity RotMatrix */
    isIdentity(): boolean;
    /** Return an identity transform, optionally filling existing transform.  */
    static createIdentity(result?: Transform): Transform;
    /** Create by directly installing origin and matrix
     * this is a the appropriate construction when the columns of the matrix are coordinate axes of a local-to-global mapping
     * Note there is a closely related createFixedPointAndMatrix whose point input is the fixed point of the global-to-global transformation.
     */
    static createOriginAndMatrix(origin: XYZ | undefined, matrix: RotMatrix | undefined, result?: Transform): Transform;
    /** Create by directly installing origin and columns of the matrix
    */
    static createOriginAndMatrixColumns(origin: XYZ, vectorX: Vector3d, vectorY: Vector3d, vectorZ: Vector3d, result?: Transform): Transform;
    /** Reinitialize by directly installing origin and columns of the matrix
     */
    setOriginAndMatrixColumns(origin: XYZ, vectorX: Vector3d, vectorY: Vector3d, vectorZ: Vector3d): void;
    /** Create a transform with the specified matrix. Compute an origin (different from the given fixedPoint)
     * so that the fixedPoint maps back to itself.
     */
    static createFixedPointAndMatrix(fixedPoint: Point3d, matrix: RotMatrix, result?: Transform): Transform;
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
    /** Transform the input homogeneous point.  Return as a new point or in the pre-allocated result (if result is given) */
    multiplyXYZW(x: number, y: number, z: number, w: number, result?: Point4d): Point4d;
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
    /** Multiply the vector by the RotMatrix part of the transform.
     *
     * *  The transform's origin is not used.
     * *  Return as new or result by usual optional result convention
     */
    multiplyVector(vector: Vector3d, result?: Vector3d): Vector3d;
    /** Multiply the vector (x,y,z) by the RotMatrix part of the transform.
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
    /** multiply this Transform times other RotMatrix, with other considered to be a Transform with 0 translation.
     * @param other right hand RotMatrix for multiplication.
     * @param result optional preallocated result to reuse.
    */
    multiplyTransformRotMatrix(other: RotMatrix, result?: Transform): Transform;
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
