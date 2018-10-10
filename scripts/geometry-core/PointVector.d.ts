/** @module CartesianGeometry */
import { Angle, BeJSONFunctions, AngleProps } from "./Geometry";
import { Ray3d } from "./AnalyticGeometry";
import { Matrix3d, Transform } from "./Transform";
export interface IsNullCheck {
    isNull(): boolean;
}
export interface WritableXAndY {
    x: number;
    y: number;
}
export interface WriteableHasZ {
    z: number;
}
export interface WritableXYAndZ extends XAndY, WriteableHasZ {
}
export interface WritableLowAndHighXY {
    low: WritableXAndY;
    high: WritableXAndY;
}
export interface WritableLowAndHighXYZ {
    low: WritableXYAndZ;
    high: WritableXYAndZ;
}
export declare type HasZ = Readonly<WriteableHasZ>;
export declare type XAndY = Readonly<WritableXAndY>;
export declare type XYAndZ = Readonly<WritableXYAndZ>;
export declare type LowAndHighXY = Readonly<WritableLowAndHighXY>;
export declare type LowAndHighXYZ = Readonly<WritableLowAndHighXYZ>;
export declare type XYZProps = {
    x?: number;
    y?: number;
    z?: number;
} | number[];
export declare type XYProps = {
    x?: number;
    y?: number;
} | number[];
export declare type Matrix3dProps = number[][] | Matrix3d | number[];
export declare type TransformProps = number[][] | number[] | {
    origin: XYZProps;
    matrix: Matrix3dProps;
};
export declare type Range3dProps = {
    low: XYZProps;
    high: XYZProps;
} | XYZProps[];
export declare type Range2dProps = {
    low: XYProps;
    high: XYProps;
} | XYProps[];
export declare type Range1dProps = {
    low: number;
    high: number;
} | number[];
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
/** Minimal object containing x,y,z and operations that are meaningful without change in both point and vector. */
export declare class XYZ implements XYAndZ {
    x: number;
    y: number;
    z: number;
    /**
     * Set the x,y,z  parts.
     * @param x (optional) x part
     * @param y (optional) y part
     * @param z (optional) z part
     */
    set(x?: number, y?: number, z?: number): void;
    /** Set the x,y,z parts to zero. */
    setZero(): void;
    protected constructor(x?: number, y?: number, z?: number);
    /** Type guard for XAndY.
     * @note this will return true for an XYAndZ. If you wish to distinguish between the two, call isXYAndZ first.
     */
    static isXAndY(arg: any): arg is XAndY;
    /** Type guard to determine whether an object has a member called "z" */
    static hasZ(arg: any): arg is HasZ;
    /** Type guard for XYAndZ.  */
    static isXYAndZ(arg: any): arg is XYAndZ;
    /**
     * Set the x,y,z parts from one of these input types
     *
     * * XYZ -- copy the x,y,z parts
     * * Float64Array -- Copy from indices 0,1,2 to x,y,z
     * * XY -- copy the x, y parts and set z=0
     */
    setFrom(other: Float64Array | XAndY | XYAndZ): void;
    /**
     * Set the x,y,z parts from a Point3d.
     * This is the same effect as `setFrom(other)` with no pretesting of variant input type
     */
    setFromPoint3d(other: Point3d): void;
    /** Returns true if this and other have equal x,y,z parts within Geometry.smallMetricDistance.
     * @param other The other XYAndZ to compare
     * @param tol The tolerance for the comparison. If undefined, use [[Geometry.smallMetricDistance]]
     */
    isAlmostEqual(other: XYAndZ, tol?: number): boolean;
    /** Return true if this and other have equal x,y,z parts within Geometry.smallMetricDistance. */
    isAlmostEqualXYZ(x: number, y: number, z: number, tol?: number): boolean;
    /** Return true if this and other have equal x,y parts within Geometry.smallMetricDistance. */
    isAlmostEqualXY(other: XAndY, tol?: number): boolean;
    /** Return a JSON object as array [x,y,z] */
    toJSON(): XYZProps;
    toJSONXYZ(): XYZProps;
    /** Pack the x,y,z values in a Float64Array. */
    toFloat64Array(): Float64Array;
    /**
     * Set the x,y,z properties from one of several json forms:
     *
     * *  array of numbers: [x,y,z]
     * *  object with x,y, and (optional) z as numeric properties {x: xValue, y: yValue, z: zValue}
     */
    setFromJSON(json?: XYZProps): void;
    /** Return the distance from this point to other */
    distance(other: XYAndZ): number;
    /** Return squared distance from this point to other */
    distanceSquared(other: XYAndZ): number;
    /** Return the XY distance from this point to other */
    distanceXY(other: XAndY): number;
    /** Return squared XY distance from this point to other */
    distanceSquaredXY(other: XAndY): number;
    /** Return the largest absolute distance between corresponding components */
    maxDiff(other: XYAndZ): number;
    /**
     * Return the x,y, z component corresponding to 0,1,2.
     */
    at(index: number): number;
    /** Return the index (0,1,2) of the x,y,z component with largest absolute value */
    indexOfMaxAbs(): number;
    /** Return true if the if x,y,z components are all nearly zero to tolerance Geometry.smallMetricDistance */
    readonly isAlmostZero: boolean;
    /** Return the largest absolute value of any component */
    maxAbs(): number;
    /** Return the sqrt of the sum of squared x,y,z parts */
    magnitude(): number;
    /** Return the sum of squared x,y,z parts */
    magnitudeSquared(): number;
    /** Return sqrt of the sum of squared x,y parts */
    magnitudeXY(): number;
    /** Return the sum of squared x,y parts */
    magnitudeSquaredXY(): number;
    /** exact equality test. */
    isExactEqual(other: XYAndZ): boolean;
    /** equality test with Geometry.smallMetricDistance tolerance */
    isAlmostEqualMetric(other: XYAndZ): boolean;
    /** add x,y,z from other in place. */
    addInPlace(other: XYAndZ): void;
    /** add (in place) the scaled x,y,z of other */
    addScaledInPlace(other: XYAndZ, scale: number): void;
    /** Multiply the x, y, z parts by scale. */
    scaleInPlace(scale: number): void;
    /** Clone strongly typed as Point3d */
    cloneAsPoint3d(): Point3d;
    /** Return a (full length) vector from this point to other */
    vectorTo(other: XYAndZ, result?: Vector3d): Vector3d;
    /** Return a multiple of a the (full length) vector from this point to other */
    scaledVectorTo(other: XYAndZ, scale: number, result?: Vector3d): Vector3d;
    /** Return a unit vector from this vector to other. Return a 000 vector if the input is too small to normalize.
     * @param other target of created vector.
     * @param result optional result vector.
     */
    unitVectorTo(target: XYAndZ, result?: Vector3d): Vector3d | undefined;
    /** Freeze this XYZ */
    freeze(): void;
}
/** 3D vector with x,y,z properties */
export declare class Point3d extends XYZ {
    /** Constructor for Point3d */
    constructor(x?: number, y?: number, z?: number);
    static fromJSON(json?: XYZProps): Point3d;
    /** Return a new Point3d with the same coordinates */
    clone(): Point3d;
    /** Create a new Point3d with given coordinates
     * @param x x part
     * @param y y part
     * @param z z partpubli
     */
    static create(x?: number, y?: number, z?: number, result?: Point3d): Point3d;
    /** Copy contents from another Point3d, Point2d, Vector2d, or Vector3d */
    static createFrom(data: XYAndZ | XAndY | Float64Array, result?: Point3d): Point3d;
    /**
     * Copy x,y,z from
     * @param xyzData flat array of xyzxyz for multiple points
     * @param pointIndex index of point to extract.   This index is multiplied by 3 to obtain starting index in the array.
     * @param result optional result point.
     */
    static createFromPacked(xyzData: Float64Array, pointIndex: number, result?: Point3d): Point3d | undefined;
    /**
     * Copy and unweight xyzw.
     * @param xyzData flat array of xyzwxyzw for multiple points
     * @param pointIndex index of point to extract.   This index is multiplied by 4 to obtain starting index in the array.
     * @param result optional result point.
     */
    static createFromPackedXYZW(xyzData: Float64Array, pointIndex: number, result?: Point3d): Point3d | undefined;
    /** Create a new point with 000 xyz */
    static createZero(result?: Point3d): Point3d;
    /** Return the cross product of the vectors from this to pointA and pointB
     *
     * *  the result is a vector
     * *  the result is perpendicular to both vectors, with right hand orientation
     * *  the magnitude of the vector is twice the area of the triangle.
     */
    crossProductToPoints(pointA: Point3d, pointB: Point3d, result?: Vector3d): Vector3d;
    /** Return the triple product of the vectors from this to pointA, pointB, pointC
     *
     * * This is a scalar (number)
     * *  This is 6 times the (signed) volume of the tetrahedron on the 4 points.
     */
    tripleProductToPoints(pointA: Point3d, pointB: Point3d, pointC: Point3d): number;
    /** Return the cross product of the vectors from this to pointA and pointB
     *
     * *  the result is a scalar
     * *  the magnitude of the vector is twice the signed area of the triangle.
     * *  this is positive for counter-clockwise order of the points, negative for clockwise.
     */
    crossProductToPointsXY(pointA: Point3d, pointB: Point3d): number;
    /** Return a point interpolated between this point and the right param. */
    interpolate(fraction: number, other: Point3d, result?: Point3d): Point3d;
    /**
     * Return a ray whose ray.origin is interpolated, and ray.direction is the vector between points with a
     * scale factor applied.
     * @param fraction fractional position between points.
     * @param other endpoint of interpolation
     * @param tangentScale scale factor to apply to the startToEnd vector
     * @param result  optional receiver.
     */
    interpolatePointAndTangent(fraction: number, other: Point3d, tangentScale: number, result?: Ray3d): Ray3d;
    /** Return a point with independent x,y,z fractional interpolation. */
    interpolateXYZ(fractionX: number, fractionY: number, fractionZ: number, other: Point3d, result?: Point3d): Point3d;
    /** Interpolate between points, then add a shift in the xy plane by a fraction of the XY projection perpendicular. */
    interpolatePerpendicularXY(fraction: number, pointB: Point3d, fractionXYPerp: number, result?: Point3d): Point3d;
    /** Return point minus vector */
    minus(vector: XYAndZ, result?: Point3d): Point3d;
    /** Return point plus vector */
    plus(vector: XYAndZ, result?: Point3d): Point3d;
    /** Return point plus vector */
    plusXYZ(dx?: number, dy?: number, dz?: number, result?: Point3d): Point3d;
    /** Return point + vector * scalar */
    plusScaled(vector: XYAndZ, scaleFactor: number, result?: Point3d): Point3d;
    /** Return point + vectorA * scalarA + vectorB * scalarB */
    plus2Scaled(vectorA: XYAndZ, scalarA: number, vectorB: XYZ, scalarB: number, result?: Point3d): Point3d;
    /** Return point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC */
    plus3Scaled(vectorA: XYAndZ, scalarA: number, vectorB: XYAndZ, scalarB: number, vectorC: XYAndZ, scalarC: number, result?: Point3d): Point3d;
    /**
     * Return a point that is scaled from the source point.
     * @param source existing point
     * @param scale scale factor to apply to its x,y,z parts
     * @param result optional point to receive coordinates
     */
    static createScale(source: XYAndZ, scale: number, result?: Point3d): Point3d;
    /** create a point that is a linear combination (weighted sum) of 2 input points.
     * @param pointA first input point
     * @param scaleA scale factor for pointA
     * @param pointB second input point
     * @param scaleB scale factor for pointB
     */
    static createAdd2Scaled(pointA: XYAndZ, scaleA: number, pointB: XYAndZ, scaleB: number, result?: Point3d): Point3d;
    /** Create a point that is a linear combination (weighted sum) of 3 input points.
     * @param pointA first input point
     * @param scaleA scale factor for pointA
     * @param pointB second input point
     * @param scaleB scale factor for pointB
     * @param pointC third input point.
     * @param scaleC scale factor for pointC
     */
    static createAdd3Scaled(pointA: XYAndZ, scaleA: number, pointB: XYAndZ, scaleB: number, pointC: XYAndZ, scaleC: number, result?: Point3d): Point3d;
    /**
     * Return the dot product of vectors from this to pointA and this to pointB.
     * @param targetA target point for first vector
     * @param targetB target point for second vector
     */
    dotVectorsToTargets(targetA: Point3d, targetB: Point3d): number;
    /** Return the fractional projection of this onto a line between points.
     *
     */
    fractionOfProjectionToLine(startPoint: Point3d, endPoint: Point3d, defaultFraction?: number): number;
}
/** 3D vector with x,y,z properties */
export declare class Vector3d extends XYZ {
    constructor(x?: number, y?: number, z?: number);
    clone(): Vector3d;
    static create(x?: number, y?: number, z?: number, result?: Vector3d): Vector3d;
    /**
     * Create a vector which is cross product of two vectors supplied as separate arguments
     * @param ux x coordinate of vector u
     * @param uy y coordinate of vector u
     * @param uz z coordinate of vector u
     * @param vx x coordinate of vector v
     * @param vy y coordinate of vector v
     * @param vz z coordinate of vector v
     * @param result optional result vector.
     */
    static createCrossProduct(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, result?: Vector3d): Vector3d;
    /**
     * Accumulate a vector which is cross product vectors from origin (ax,ay,az) to targets (bx,by,bz) and (cx,cy,cz)
     * @param ax x coordinate of origin
     * @param ay y coordinate of origin
     * @param az z coordinate of origin
     * @param bx x coordinate of target point b
     * @param by y coordinate of target point b
     * @param bz z coordinate of target point b
     * @param cx x coordinate of target point c
     * @param cy y coordinate of target point c
     * @param cz z coordinate of target point c
     */
    addCrossProductToTargetsInPlace(ax: number, ay: number, az: number, bx: number, by: number, bz: number, cx: number, cy: number, cz: number): void;
    /**
     * Return the cross product of the vectors from origin to pointA and pointB.
     *
     * * the result is a vector
     * * the result is perpendicular to both vectors, with right hand orientation
     * * the magnitude of the vector is twice the area of the triangle.
     */
    static createCrossProductToPoints(origin: XYAndZ, pointA: XYAndZ, pointB: XYAndZ, result?: Vector3d): Vector3d;
    /**
     * Return a vector defined by polar coordinates distance and angle from x axis
     * @param r distance measured from origin
     * @param theta angle from x axis to the vector (in xy plane)
     * @param z optional z coordinate
     */
    static createPolar(r: number, theta: Angle, z?: number): Vector3d;
    /**
     * Return a vector defined in spherical coordinates.
     * @param r sphere radius
     * @param theta angle in xy plane
     * @param phi angle from xy plane to the vector
     */
    static createSpherical(r: number, theta: Angle, phi: Angle): Vector3d;
    static fromJSON(json?: XYZProps): Vector3d;
    /** Copy contents from another Point3d, Point2d, Vector2d, or Vector3d */
    static createFrom(data: XYAndZ | XAndY | Float64Array, result?: Vector3d): Vector3d;
    /**
     * Return a vector defined by start and end points (end - start).
     * @param start start point for vector
     * @param end end point for vector
     * @param result optional result
     */
    static createStartEnd(start: XYAndZ, end: XYAndZ, result?: Vector3d): Vector3d;
    /**
     * @param x0 start point x coordinate
     * @param y0 start point y coordinate
     * @param z0 start point z coordinate
     * @param x1 end point x coordinate
     * @param y1 end point y coordinate
     * @param z1 end point z coordinate
     * @param result optional result vector
     */
    static createStartEndXYZXYZ(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, result?: Vector3d): Vector3d;
    /**
     * Return a vector which is the input vector rotated around the axis vector.
     * @param vector initial vector
     * @param axis axis of rotation
     * @param angle angle of rotation.  If undefined, 90 degrees is implied
     * @param result optional result vector
     */
    static createRotateVectorAroundVector(vector: Vector3d, axis: Vector3d, angle?: Angle): Vector3d | undefined;
    /**
     * Set (replace) xzz components so they are a vector from point0 to point1
     * @param point0 start point of computed vector
     * @param point1 end point of computed vector.
     */
    setStartEnd(point0: XYAndZ, point1: XYAndZ): void;
    /** Return a vector with 000 xyz parts. */
    static createZero(result?: Vector3d): Vector3d;
    /** Return a unit X vector optionally multiplied by a scale  */
    static unitX(scale?: number): Vector3d;
    /** Return a unit Y vector  */
    static unitY(scale?: number): Vector3d;
    /** Return a unit Z vector  */
    static unitZ(scale?: number): Vector3d;
    /** Divide by denominator, but return undefined if denominator is zero. */
    safeDivideOrNull(denominator: number, result?: Vector3d): Vector3d | undefined;
    /**
     * Return a pair object containing (a) property `v` which is a unit vector in the direction
     * of the input and (b) property mag which is the magnitude (length) of the input (instance) prior to normalization.
     * If the instance (input) is a near zero length the `v` property of the output is undefined.
     * @param result optional result.
     */
    normalizeWithLength(result?: Vector3d): {
        v: Vector3d | undefined;
        mag: number;
    };
    /**
     * Return a unit vector parallel with this.  Return undefined if this.magnitude is near zero.
     * @param result optional result.
     */
    normalize(result?: Vector3d): Vector3d | undefined;
    /**
     * If this vector has nonzero length, divide by the length to change to a unit vector.
     * @returns true if normalization completed.
     */
    normalizeInPlace(): boolean;
    /** Return the fractional projection of spaceVector onto this */
    fractionOfProjectionToVector(target: Vector3d, defaultFraction?: number): number;
    /** Return a new vector with components negated from the calling instance.
     * @param result optional result vector.
     */
    negate(result?: Vector3d): Vector3d;
    /** Return a vector same length as this but rotate 90 degrees CCW */
    rotate90CCWXY(result?: Vector3d): Vector3d;
    unitPerpendicularXY(result?: Vector3d): Vector3d;
    rotateXY(angle: Angle, result?: Vector3d): Vector3d;
    rotate90Towards(target: Vector3d, result?: Vector3d): Vector3d | undefined;
    rotate90Around(axis: Vector3d, result?: Vector3d): Vector3d | undefined;
    interpolate(fraction: number, right: Vector3d, result?: Vector3d): Vector3d;
    plus(vector: XYAndZ, result?: Vector3d): Vector3d;
    minus(vector: XYAndZ, result?: Vector3d): Vector3d;
    /** Return vector + vector * scalar */
    plusScaled(vector: XYAndZ, scaleFactor: number, result?: Vector3d): Vector3d;
    /** Return point + vectorA * scalarA + vectorB * scalarB */
    plus2Scaled(vectorA: XYAndZ, scalarA: number, vectorB: XYAndZ, scalarB: number, result?: Vector3d): Vector3d;
    /** Return `point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC` */
    plus3Scaled(vectorA: XYAndZ, scalarA: number, vectorB: XYAndZ, scalarB: number, vectorC: XYAndZ, scalarC: number, result?: Vector3d): Vector3d;
    /** Return `point + vectorA * scalarA + vectorB * scalarB` */
    static createAdd2Scaled(vectorA: XYAndZ, scaleA: number, vectorB: XYAndZ, scaleB: number, result?: Vector3d): Vector3d;
    /** Return `point + vectorA * scalarA + vectorB * scalarB` with all components presented as numbers */
    static createAdd2ScaledXYZ(ax: number, ay: number, az: number, scaleA: number, bx: number, by: number, bz: number, scaleB: number, result?: Vector3d): Vector3d;
    static createAdd3Scaled(vectorA: XYAndZ, scaleA: number, vectorB: XYAndZ, scaleB: number, vectorC: XYAndZ, scaleC: number, result?: Vector3d): Vector3d;
    /** Return vector * scalar */
    scale(scale: number, result?: Vector3d): Vector3d;
    scaleToLength(length: number, result?: Vector3d): Vector3d;
    unitCrossProduct(vectorB: Vector3d, result?: Vector3d): Vector3d | undefined;
    unitCrossProductWithDefault(vectorB: Vector3d, x: number, y: number, z: number, result?: Vector3d): Vector3d;
    normalizeWithDefault(x: number, y: number, z: number, result?: Vector3d): Vector3d;
    tryNormalizeInPlace(smallestMagnitude?: number): boolean;
    sizedCrossProduct(vectorB: Vector3d, productLength: number, result?: Vector3d): Vector3d | undefined;
    crossProductMagnitudeSquared(vectorB: Vector3d): number;
    crossProductMagnitude(vectorB: Vector3d): number;
    dotProduct(vectorB: XYAndZ): number;
    /** Dot product with vector from pointA to pointB */
    dotProductStartEnd(pointA: Point3d, pointB: Point3d): number;
    /** Cross product with vector from pointA to pointB */
    crossProductStartEnd(pointA: Point3d, pointB: Point3d, result?: Vector3d): Vector3d;
    /** Cross product (xy parts only) with vector from pointA to pointB */
    crossProductStartEndXY(pointA: Point3d, pointB: Point3d): number;
    /** Dot product with vector from pointA to pointB, with pointB given as x,y,z */
    dotProductStartEndXYZ(pointA: Point3d, x: number, y: number, z: number): number;
    /** Dot product with vector from pointA to pointB, with pointB given as (weighted) x,y,z,w
     * * pointB is a homogeneous point that has to be unweighted
     * * if the weight is near zero metric, the return is zero.
     */
    dotProductStartEndXYZW(pointA: Point3d, x: number, y: number, z: number, w: number): number;
    /** Return the dot product of the instance and vectorB, using only the x and y parts. */
    dotProductXY(vectorB: Vector3d): number;
    /**
     * Dot product with vector (x,y,z)
     * @param x x component for dot product
     * @param y y component for dot product
     * @param z z component for dot product
     */
    dotProductXYZ(x: number, y: number, z?: number): number;
    /** Return the triple product of the instance, vectorB, and vectorC  */
    tripleProduct(vectorB: Vector3d, vectorC: Vector3d): number;
    /** Return the cross product of the instance and vectorB, using only the x and y parts. */
    crossProductXY(vectorB: Vector3d): number;
    crossProduct(vectorB: Vector3d, result?: Vector3d): Vector3d;
    angleTo(vectorB: Vector3d): Angle;
    angleToXY(vectorB: Vector3d): Angle;
    planarRadiansTo(vector: Vector3d, planeNormal: Vector3d): number;
    planarAngleTo(vector: Vector3d, planeNormal: Vector3d): Angle;
    signedRadiansTo(vector1: Vector3d, vectorW: Vector3d): number;
    signedAngleTo(vector1: Vector3d, vectorW: Vector3d): Angle;
    /**
     * Test if this vector is parallel to other.
     * @param other second vector in comparison
     * @param oppositeIsParallel if the vectors are on the same line but in opposite directions, return this value.
     * @param returnValueIfAnInputIsZeroLength if either vector is near zero length, return this value.
     */
    isParallelTo(other: Vector3d, oppositeIsParallel?: boolean, returnValueIfAnInputIsZeroLength?: boolean): boolean;
    /**
     * Test if this vector is perpendicular to other.
     * @param other second vector in comparison
     * @param returnValueIfAnInputIsZeroLength if either vector is near zero length, return this value.
     */
    isPerpendicularTo(other: Vector3d, returnValueIfAnInputIsZeroLength?: boolean): boolean;
}
export declare class Segment1d {
    x0: number;
    x1: number;
    private constructor();
    set(x0: number, x1: number): void;
    static create(x0?: number, x1?: number, result?: Segment1d): Segment1d;
    setFrom(other: Segment1d): void;
    clone(): Segment1d;
    fractionToPoint(fraction: number): number;
    reverseInPlace(): void;
    /**
     * Near equality test, using Geometry.isSameCoordinate for tolerances.
     */
    isAlmostEqual(other: Segment1d): boolean;
    /**
     * Return true if the segment limits are (exactly) 0 and 1
     */
    readonly isExact01: boolean;
}
/** The properties that define [[YawPitchRollAngles]]. */
export interface YawPitchRollProps {
    yaw?: AngleProps;
    pitch?: AngleProps;
    roll?: AngleProps;
}
/** Three angles that determine the orientation of an object in space. Sometimes referred to as [Tait–Bryan angles](https://en.wikipedia.org/wiki/Euler_angles). */
export declare class YawPitchRollAngles {
    yaw: Angle;
    pitch: Angle;
    roll: Angle;
    constructor(yaw?: Angle, pitch?: Angle, roll?: Angle);
    /** Freeze this YawPitchRollAngles */
    freeze(): void;
    /** constructor for YawPitchRollAngles with angles in degrees. */
    static createDegrees(yawDegrees: number, pitchDegrees: number, rollDegrees: number): YawPitchRollAngles;
    /** constructor for YawPitchRollAngles with angles in radians. */
    static createRadians(yawRadians: number, pitchRadians: number, rollRadians: number): YawPitchRollAngles;
    static fromJSON(json?: YawPitchRollProps): YawPitchRollAngles;
    setFromJSON(json?: YawPitchRollProps): void;
    /** Convert to a JSON object of form { pitch: 20 , roll: 29.999999999999996 , yaw: 10 }. Any values that are exactly zero (with tolerance `Geometry.smallAngleRadians`) are omitted. */
    toJSON(): YawPitchRollProps;
    /**
     * Install all rotations from `other` into `this`.
     * @param other YawPitchRollAngles source
     */
    setFrom(other: YawPitchRollAngles): void;
    /**
     * * Compare angles between `this` and `other`.
     * * Comparisons are via `isAlmostEqualAllowPeriodShift`.
     * @param other YawPitchRollAngles source
     */
    isAlmostEqual(other: YawPitchRollAngles): boolean;
    /**
     * Make a copy of this YawPitchRollAngles.
     */
    clone(): YawPitchRollAngles;
    /**
     * Expand the angles into a (rigid rotation) matrix.
     *
     * * The returned matrix is "rigid" -- unit length rows and columns, and its transpose is its inverse.
     * * The "rigid" matrix is always a right handed coordinate system.
     * @param result optional pre-allocated `Matrix3d`
     */
    toMatrix3d(result?: Matrix3d): Matrix3d;
    /** @returns Return the largest angle in radians */
    maxAbsRadians(): number;
    /** Return the sum of the angles in squared radians */
    sumSquaredRadians(): number;
    /** @returns true if the rotation is 0 */
    isIdentity(allowPeriodShift?: boolean): boolean;
    /** Return the largest difference of angles (in radians) between this and other */
    maxDiffRadians(other: YawPitchRollAngles): number;
    /** Return the largest angle in degrees. */
    maxAbsDegrees(): number;
    /** Return the sum of squared angles in degrees. */
    sumSquaredDegrees(): number;
    /** Return an object from a Transform as an origin and YawPitchRollAngles. */
    static tryFromTransform(transform: Transform): {
        origin: Point3d;
        angles: YawPitchRollAngles | undefined;
    };
    /** Attempts to create a YawPitchRollAngles object from an Matrix3d
     * * This conversion fails if the matrix is not rigid (unit rows and columns, transpose is inverse)
     * * In the failure case the method's return value is `undefined`.
     * * In the failure case, if the optional result was supplied, that result will nonetheless be filled with a set of angles.
     */
    static createFromMatrix3d(matrix: Matrix3d, result?: YawPitchRollAngles): YawPitchRollAngles | undefined;
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
//# sourceMappingURL=PointVector.d.ts.map