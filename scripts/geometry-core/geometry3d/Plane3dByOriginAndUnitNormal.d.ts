/** @module CartesianGeometry */
import { Point3d, Vector3d } from "./Point3dVector3d";
import { Transform } from "./Transform";
import { BeJSONFunctions, PlaneAltitudeEvaluator } from "../Geometry";
import { Point4d } from "../geometry4d/Point4d";
import { Angle } from "./Angle";
/**
 * A plane defined by
 *
 * * Any point on the plane.
 * * a unit normal.
 * @public
 */
export declare class Plane3dByOriginAndUnitNormal implements BeJSONFunctions, PlaneAltitudeEvaluator {
    private _origin;
    private _normal;
    private constructor();
    private static _create;
    /**
     * Create a plane parallel to the XY plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createXYPlane(origin?: Point3d): Plane3dByOriginAndUnitNormal;
    /**
     * Create a plane parallel to the YZ plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createYZPlane(origin?: Point3d): Plane3dByOriginAndUnitNormal;
    /**
     * Create a plane parallel to the ZX plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createZXPlane(origin?: Point3d): Plane3dByOriginAndUnitNormal;
    /** create a new  Plane3dByOriginAndUnitNormal with given origin and normal.
     * * The inputs are NOT captured.
     * * Returns undefined if the normal vector is all zeros.
     */
    static create(origin: Point3d, normal: Vector3d, result?: Plane3dByOriginAndUnitNormal): Plane3dByOriginAndUnitNormal | undefined;
    /** create a new  Plane3dByOriginAndUnitNormal with direct coordinates of origin and normal.
     * * Returns undefined if the normal vector is all zeros.
     * * If unable to normalize return undefined. (And if result is given it is left unchanged)
     */
    static createXYZUVW(ax: number, ay: number, az: number, ux: number, uy: number, uz: number, result?: Plane3dByOriginAndUnitNormal): Plane3dByOriginAndUnitNormal | undefined;
    /** create a new  Plane3dByOriginAndUnitNormal with xy origin (at z=0) and normal angle in xy plane.
     * * Returns undefined if the normal vector is all zeros.
     */
    static createXYAngle(x: number, y: number, normalAngleFromX: Angle, result?: Plane3dByOriginAndUnitNormal): Plane3dByOriginAndUnitNormal;
    /** Create a plane defined by two points and an in-plane vector.
     * @param pointA any point in the plane
     * @param pointB any other point in the plane
     * @param vector any vector in the plane but not parallel to the vector from pointA to pointB
     */
    static createPointPointVectorInPlane(pointA: Point3d, pointB: Point3d, vector: Vector3d): Plane3dByOriginAndUnitNormal | undefined;
    /** test for (toleranced) equality with `other` */
    isAlmostEqual(other: Plane3dByOriginAndUnitNormal): boolean;
    /** Parse a json fragment `{origin: [x,y,z], normal: [ux,uy,uz]}`  */
    setFromJSON(json?: any): void;
    /**
     * Convert to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON(): any;
    /**  create a new Plane3dByOriginAndUnitNormal from json fragment.
     * * See `Plane3dByOriginAndUnitNormal.setFromJSON`
     */
    static fromJSON(json?: any): Plane3dByOriginAndUnitNormal;
    /** Return a reference to the origin. */
    getOriginRef(): Point3d;
    /** Return a reference to the unit normal. */
    getNormalRef(): Vector3d;
    /** Return coordinate axes (as a transform) with
     * * origin at plane origin
     * * z axis in direction of plane normal.
     * * x,y axes in plane.
     */
    getLocalToWorld(): Transform;
    /** Return a (singular) transform which projects points to this plane.
     */
    getProjectionToPlane(): Transform;
    /** Copy coordinates from the given origin and normal. */
    set(origin: Point3d, normal: Vector3d): void;
    /** return a deep clone (point and normal cloned) */
    clone(result?: Plane3dByOriginAndUnitNormal): Plane3dByOriginAndUnitNormal;
    /** Create a clone and return the transform of the clone. */
    cloneTransformed(transform: Transform): Plane3dByOriginAndUnitNormal | undefined;
    /** Copy data from the given plane. */
    setFrom(source: Plane3dByOriginAndUnitNormal): void;
    /** Return the altitude of spacePoint above or below the plane.  (Below is negative) */
    altitude(spacePoint: Point3d): number;
    /** Return the altitude of weighted spacePoint above or below the plane.  (Below is negative) */
    weightedAltitude(spacePoint: Point4d): number;
    /** return a point at specified (signed) altitude */
    altitudeToPoint(altitude: number, result?: Point3d): Point3d;
    /** Return the dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocityXYZ(x: number, y: number, z: number): number;
    /** Return the dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocity(spaceVector: Vector3d): number;
    /** Return the altitude of a point given as separate x,y,z components. */
    altitudeXYZ(x: number, y: number, z: number): number;
    /** Return the altitude of a point given as separate x,y,z,w components. */
    altitudeXYZW(x: number, y: number, z: number, w: number): number;
    /** Return the projection of spacePoint onto the plane. */
    projectPointToPlane(spacePoint: Point3d, result?: Point3d): Point3d;
    /** Returns true of spacePoint is within distance tolerance of the plane. */
    isPointInPlane(spacePoint: Point3d): boolean;
}
//# sourceMappingURL=Plane3dByOriginAndUnitNormal.d.ts.map