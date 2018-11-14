/** @module CartesianGeometry */
import { Point3d, Vector3d } from "./Point3dVector3d";
import { Transform } from "./Transform";
import { BeJSONFunctions } from "../Geometry";
import { Point4d } from "../geometry4d/Point4d";
/**
 * A plane defined by
 *
 * * Any point on the plane.
 * * a unit normal.
 */
export declare class Plane3dByOriginAndUnitNormal implements BeJSONFunctions {
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
    static create(origin: Point3d, normal: Vector3d, result?: Plane3dByOriginAndUnitNormal): Plane3dByOriginAndUnitNormal | undefined;
    /** Create a plane defined by two points and an in-plane vector.
     * @param pointA any point in the plane
     * @param pointB any other point in the plane
     * @param vector any vector in the plane but not parallel to the vector from pointA to pointB
     */
    static createPointPointVectorInPlane(pointA: Point3d, pointB: Point3d, vector: Vector3d): Plane3dByOriginAndUnitNormal | undefined;
    isAlmostEqual(other: Plane3dByOriginAndUnitNormal): boolean;
    setFromJSON(json?: any): void;
    /**
     * Convert to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON(): any;
    static fromJSON(json?: any): Plane3dByOriginAndUnitNormal;
    /** @returns a reference to the origin. */
    getOriginRef(): Point3d;
    /** @returns a reference to the unit normal. */
    getNormalRef(): Vector3d;
    /** Copy coordinates from the given origin and normal. */
    set(origin: Point3d, normal: Vector3d): void;
    clone(result?: Plane3dByOriginAndUnitNormal): Plane3dByOriginAndUnitNormal;
    /** Create a clone and return the transform of the clone. */
    cloneTransformed(transform: Transform): Plane3dByOriginAndUnitNormal | undefined;
    /** Copy data from the given plane. */
    setFrom(source: Plane3dByOriginAndUnitNormal): void;
    /** @returns Return the altitude of spacePoint above or below the plane.  (Below is negative) */
    altitude(spacePoint: Point3d): number;
    /** @returns Return the altitude of weighted spacePoint above or below the plane.  (Below is negative) */
    weightedAltitude(spacePoint: Point4d): number;
    /** @returns return a point at specified (signed) altitude */
    altitudeToPoint(altitude: number, result?: Point3d): Point3d;
    /** @returns The dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocityXYZ(x: number, y: number, z: number): number;
    /** @returns The dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocity(spaceVector: Vector3d): number;
    /** @returns the altitude of a point given as separate x,y,z components. */
    altitudeXYZ(x: number, y: number, z: number): number;
    /** @returns the altitude of a point given as separate x,y,z,w components. */
    altitudeXYZW(x: number, y: number, z: number, w: number): number;
    /** @returns Return the projection of spacePoint onto the plane. */
    projectPointToPlane(spacePoint: Point3d, result?: Point3d): Point3d;
    /** @return Returns true of spacePoint is within distance tolerance of the plane. */
    isPointInPlane(spacePoint: Point3d): boolean;
}
//# sourceMappingURL=Plane3dByOriginAndUnitNormal.d.ts.map