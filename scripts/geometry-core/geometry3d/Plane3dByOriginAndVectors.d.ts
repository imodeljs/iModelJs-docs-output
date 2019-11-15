/** @module CartesianGeometry */
import { Point3d, Vector3d } from "./Point3dVector3d";
import { BeJSONFunctions } from "../Geometry";
import { Transform } from "./Transform";
/**
 * A Point3dVector3dVector3d is an origin and a pair of vectors.
 * This defines a plane with a (possibly skewed) uv coordinate grid
 * * The grid directions (`vectorU` and `vectorV`)
 *   * are NOT required to be unit vectors.
 *   * are NOT required to be perpendicular vectors.
 * @public
 */
export declare class Plane3dByOriginAndVectors implements BeJSONFunctions {
    /** origin of plane grid */
    origin: Point3d;
    /** u direction in plane grid */
    vectorU: Vector3d;
    /** v direction in plane grid */
    vectorV: Vector3d;
    private constructor();
    /** create a new plane from origin and vectors. */
    static createOriginAndVectors(origin: Point3d, vectorU: Vector3d, vectorV: Vector3d, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * Return a Plane3dByOriginAndVectors, with
     * * origin is the translation (aka origin) from the Transform
     * * vectorU is the X column of the transform
     * * vectorV is the Y column of the transform.
     * @param transform source transform
     * @param xLength optional length to impose on vectorU.
     * @param yLength optional length to impose on vectorV.
     * @param result optional preexisting result
     */
    static createFromTransformColumnsXYAndLengths(transform: Transform, xLength: number | undefined, yLength: number | undefined, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Capture origin and directions in a new plane. */
    static createCapture(origin: Point3d, vectorU: Vector3d, vectorV: Vector3d, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Set all origin and both vectors from direct numeric parameters */
    setOriginAndVectorsXYZ(x0: number, y0: number, z0: number, ux: number, uy: number, uz: number, vx: number, vy: number, vz: number): Plane3dByOriginAndVectors;
    /** Set all origin and both vectors from coordinates in given origin and vectors.
     * * Note that coordinates are copied out of the parameters -- the given parameters are NOT retained by reference.
     */
    setOriginAndVectors(origin: Point3d, vectorU: Vector3d, vectorV: Vector3d): Plane3dByOriginAndVectors;
    /** Create a new plane from direct numeric parameters */
    static createOriginAndVectorsXYZ(x0: number, y0: number, z0: number, ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Define a plane by three points in the plane.
     * @param origin origin for the parameterization.
     * @param targetU target point for the vectorU starting at the origin.
     * @param targetV target point for the vectorV originating at the origin.
     * @param result optional result.
     */
    static createOriginAndTargets(origin: Point3d, targetU: Point3d, targetV: Point3d, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Create a plane with origin at 000, unit vectorU in x direction, and unit vectorV in the y direction. */
    static createXYPlane(result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** create a plane from data presented as Float64Arrays.
     * @param origin x,y,z of origin.
     * @param vectorU x,y,z of vectorU
     * @param vectorV x,y,z of vectorV
     */
    static createOriginAndVectorsArrays(origin: Float64Array, vectorU: Float64Array, vectorV: Float64Array, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** create a plane from data presented as Float64Array with weights
     * @param origin x,y,z,w of origin.
     * @param vectorU x,y,z,w of vectorU
     * @param vectorV x,y,z,w of vectorV
     */
    static createOriginAndVectorsWeightedArrays(originW: Float64Array, vectorUw: Float64Array, vectorVw: Float64Array, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * Evaluate a point a grid coordinates on the plane.
     * * The computed point is `origin + vectorU * u + vectorV * v`
     * @param u coordinate along vectorU
     * @param v coordinate along vectorV
     * @param result optional result destination.
     * @returns Return the computed coordinate.
     */
    fractionToPoint(u: number, v: number, result?: Point3d): Point3d;
    /** Return the vector from the plane origin to parametric coordinate (u.v) */
    fractionToVector(u: number, v: number, result?: Vector3d): Vector3d;
    /** Set coordinates from a json object such as `{origin: [1,2,3], vectorU:[4,5,6], vectorV[3,2,1]}` */
    setFromJSON(json?: any): void;
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON(): any;
    /** create a new plane.   See `setFromJSON` for layout example. */
    static fromJSON(json?: any): Plane3dByOriginAndVectors;
    /** Test origin and vectors for isAlmostEqual with `other` */
    isAlmostEqual(other: Plane3dByOriginAndVectors): boolean;
}
//# sourceMappingURL=Plane3dByOriginAndVectors.d.ts.map