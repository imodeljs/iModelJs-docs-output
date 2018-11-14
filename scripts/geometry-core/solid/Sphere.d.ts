/** @module Solid */
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix3d } from "../geometry3d/Matrix3d";
import { GeometryQuery } from "../curve/GeometryQuery";
import { StrokeOptions } from "../curve/StrokeOptions";
import { AngleSweep } from "../geometry3d/AngleSweep";
import { GeometryHandler, UVSurface } from "../geometry3d/GeometryHandler";
import { SolidPrimitive } from "./SolidPrimitive";
import { CurveCollection } from "../curve/CurveCollection";
import { LineString3d } from "../curve/LineString3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
/**
 * A Sphere is
 *
 * * A unit sphere (but read on ....)
 * * mapped by an arbitrary (possibly skewed, non-uniform scaled) transform
 * * hence possibly the final geometry is ellipsoidal
 */
export declare class Sphere extends SolidPrimitive implements UVSurface {
    private _localToWorld;
    private _latitudeSweep;
    /** Return the latitude (in radians) all fractional v. */
    vFractionToRadians(v: number): number;
    /** Return the longitude (in radians) all fractional u. */
    uFractionToRadians(u: number): number;
    private constructor();
    clone(): Sphere;
    tryTransformInPlace(transform: Transform): boolean;
    cloneTransformed(transform: Transform): Sphere | undefined;
    /** Return a coordinate frame (right handed, unit axes)
     * * origin at sphere center
     * * equator in xy plane
     * * z axis perpendicular
     */
    getConstructiveFrame(): Transform | undefined;
    static createCenterRadius(center: Point3d, radius: number, latitudeSweep?: AngleSweep): Sphere;
    /** Create an ellipsoid which is a unit sphere mapped to position by an (arbitrary, possibly skewed and scaled) transform. */
    static createEllipsoid(localToWorld: Transform, latitudeSweep: AngleSweep, capped: boolean): Sphere | undefined;
    /** Create a sphere from the typical parameters of the Dgn file */
    static createDgnSphere(center: Point3d, vectorX: Vector3d, vectorZ: Vector3d, radiusXY: number, radiusZ: number, latitudeSweep: AngleSweep, capped: boolean): Sphere | undefined;
    /** Create a sphere from the typical parameters of the Dgn file */
    static createFromAxesAndScales(center: Point3d, axes: undefined | Matrix3d, radiusX: number, radiusY: number, radiusZ: number, latitudeSweep: AngleSweep | undefined, capped: boolean): Sphere | undefined;
    /** return (copy of) sphere center */
    cloneCenter(): Point3d;
    /** return the (full length, i.e. scaled by radius) X vector from the sphere transform */
    cloneVectorX(): Vector3d;
    /** return the (full length, i.e. scaled by radius) Y vector from the sphere transform */
    cloneVectorY(): Vector3d;
    /** return the (full length, i.e. scaled by radius) Z vector from the sphere transform */
    cloneVectorZ(): Vector3d;
    /** return (a copy of) the sphere's angle sweep. */
    cloneLatitudeSweep(): AngleSweep;
    trueSphereRadius(): number | undefined;
    /**
     * @returns Return a (clone of) the sphere's local to world transformation.
     */
    cloneLocalToWorld(): Transform;
    isSameGeometryClass(other: any): boolean;
    isAlmostEqual(other: GeometryQuery): boolean;
    /**
     *  return strokes for a cross-section (elliptic arc) at specified fraction v along the axis.
     * @param v fractional position along the cone axis
     * @param strokes stroke count or options.
     */
    strokeConstantVSection(v: number, strokes: number | StrokeOptions | undefined): LineString3d;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * @returns Return the Arc3d section at vFraction.  For the sphere, this is a latitude circle.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    extendRange(range: Range3d, transform?: Transform): void;
    /** Evaluate as a uv surface
     * @param uFraction fractional position in minor (phi)
     * @param vFraction fractional position on major (theta) arc
     */
    UVFractionToPoint(uFraction: number, vFraction: number, result?: Point3d): Point3d;
    /** Evaluate as a uv surface, returning point and two vectors.
     * @param u fractional position in minor (phi)
     * @param v fractional position on major (theta) arc
     */
    UVFractionToPointAndTangents(uFraction: number, vFraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
}
//# sourceMappingURL=Sphere.d.ts.map