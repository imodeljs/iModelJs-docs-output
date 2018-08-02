/** @module Solid */
import { Point3d, Vector3d } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { GeometryQuery } from "../curve/CurvePrimitive";
import { GeometryHandler, UVSurface } from "../GeometryHandler";
import { SolidPrimitive } from "./SolidPrimitive";
import { StrokeOptions } from "../curve/StrokeOptions";
import { CurveCollection } from "../curve/CurveChain";
import { Plane3dByOriginAndVectors } from "../AnalyticGeometry";
import { LineString3d } from "../curve/LineString3d";
/**
 * A cone with axis along the z axis of a (possibly skewed) local coordinate system.
 *
 * * In local coordinates, the sections at z=0 and z=1 are circles of radius r0 and r1.
 * * Either one individually  may be zero, but they may not both be zero.
 * * The stored matrix has unit vectors in the xy columns, and full-length z column.
 * *
 */
export declare class Cone extends SolidPrimitive implements UVSurface {
    private localToWorld;
    private radiusA;
    private radiusB;
    private _maxRadius;
    protected constructor(map: Transform, radiusA: number, radiusB: number, capped: boolean);
    clone(): Cone;
    /** Return a coordinate frame (right handed unit vectors)
     * * origin at center of the base circle.
     * * base circle in the xy plane
     * * z axis by right hand rule.
     */
    getConstructiveFrame(): Transform | undefined;
    tryTransformInPlace(transform: Transform): boolean;
    cloneTransformed(transform: Transform): Cone | undefined;
    /** create a cylinder or cone from two endpoints and their radii.   The circular cross sections are perpendicular to the axis line
     * from start to end point.
     */
    static createAxisPoints(centerA: Point3d, centerB: Point3d, radiusA: number, radiusB: number, capped: boolean): Cone | undefined;
    /** create a cylinder or cone from axis start and end with cross section defined by vectors that do not need to be perpendicular to each other or
     * to the axis.
     */
    static createBaseAndTarget(centerA: Point3d, centerB: Point3d, vectorX: Vector3d, vectorY: Vector3d, radiusA: number, radiusB: number, capped: boolean): Cone;
    getCenterA(): Point3d;
    getCenterB(): Point3d;
    getVectorX(): Vector3d;
    getVectorY(): Vector3d;
    getRadiusA(): number;
    getRadiusB(): number;
    getMaxRadius(): number;
    vFractionToRadius(v: number): number;
    isSameGeometryClass(other: any): boolean;
    isAlmostEqual(other: GeometryQuery): boolean;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     *  return strokes for a cross-section (elliptic arc) at specified fraction v along the axis.
     * @param v fractional position along the cone axis
     * @param strokes stroke count or options.
     */
    strokeConstantVSection(v: number, strokes: number | StrokeOptions | undefined): LineString3d;
    /**
     * @returns Return the Arc3d section at vFraction
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    extendRange(range: Range3d, transform?: Transform): void;
    UVFractionToPoint(uFraction: number, vFraction: number, result?: Point3d): Point3d;
    UVFractionToPointAndTangents(uFraction: number, vFraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
}
