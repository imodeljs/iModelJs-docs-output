/** @module Solid */
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryQuery } from "../curve/GeometryQuery";
import { Angle } from "../geometry3d/Angle";
import { GeometryHandler, UVSurface } from "../geometry3d/GeometryHandler";
import { SolidPrimitive } from "./SolidPrimitive";
import { CurveCollection } from "../curve/CurveCollection";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
/**
 * the stored form of the torus pipe is oriented for positive volume:
 *
 * * Both radii are positive, with r0 >= r1 > 0
 * * The sweep is positive
 * * The coordinate system has positive determinant.
 */
export declare class TorusPipe extends SolidPrimitive implements UVSurface {
    private _localToWorld;
    private _radiusA;
    private _radiusB;
    private _sweep;
    private _isReversed;
    protected constructor(map: Transform, radiusA: number, radiusB: number, sweep: Angle, capped: boolean);
    clone(): TorusPipe;
    tryTransformInPlace(transform: Transform): boolean;
    cloneTransformed(transform: Transform): TorusPipe | undefined;
    static createInFrame(frame: Transform, majorRadius: number, minorRadius: number, sweep: Angle, capped: boolean): TorusPipe | undefined;
    /** Create a TorusPipe from the typical parameters of the Dgn file */
    static createDgnTorusPipe(center: Point3d, vectorX: Vector3d, vectorY: Vector3d, majorRadius: number, minorRadius: number, sweep: Angle, capped: boolean): TorusPipe | undefined;
    /** Return a coordinate frame (right handed, unit axes)
     * * origin at center of major circle
     * * major circle in xy plane
     * * z axis perpendicular
     */
    getConstructiveFrame(): Transform | undefined;
    cloneCenter(): Point3d;
    cloneVectorX(): Vector3d;
    cloneVectorY(): Vector3d;
    getMinorRadius(): number;
    getMajorRadius(): number;
    getSweepAngle(): Angle;
    getIsReversed(): boolean;
    getThetaFraction(): number;
    isSameGeometryClass(other: any): boolean;
    isAlmostEqual(other: GeometryQuery): boolean;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * @returns Return the Arc3d section at vFraction.  For the TorusPipe, this is a minor circle.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    constantUSection(uFraction: number): CurveCollection | undefined;
    extendRange(range: Range3d, transform?: Transform): void;
    /** Evaluate as a uv surface
     * @param u fractional position in minor (phi)
     * @param v fractional position on major (theta) arc
     */
    UVFractionToPoint(u: number, v: number, result?: Point3d): Point3d;
    /** Evaluate as a uv surface, returning point and two vectors.
     * @param u fractional position in minor (phi)
     * @param v fractional position on major (theta) arc
     */
    UVFractionToPointAndTangents(u: number, v: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
}
//# sourceMappingURL=TorusPipe.d.ts.map