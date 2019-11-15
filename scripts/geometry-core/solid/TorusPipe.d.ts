/** @module Solid */
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryQuery } from "../curve/GeometryQuery";
import { Angle } from "../geometry3d/Angle";
import { GeometryHandler, UVSurface, UVSurfaceIsoParametricDistance } from "../geometry3d/GeometryHandler";
import { SolidPrimitive } from "./SolidPrimitive";
import { CurveCollection } from "../curve/CurveCollection";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { Vector2d } from "../geometry3d/Point2dVector2d";
/**
 * A torus pipe is a partial torus (donut).  In a local coordinate system
 * * The z axis passes through the hole.
 * * The "major hoop" arc has
 *   * vectorTheta0 = (radiusA,0,0)
 *   * vectorTheta90 = (0, radiusA,0)
 *   * The major arc point at angle theta is `C(theta) = vectorTheta0 * cos(theta) + vectorTheta90 * sin(theta)
 * * The minor hoop at theta various with phi "around the minor hoop"
 *    * (x,y,z) = C(theta) + (radiusB *cos(theta), radiusB * sin(theta)) * cos(phi) + (0,radiusB,0) * sin(phi)
 * * The stored form of the torus pipe is oriented for positive volume:
 *   * Both radii are positive, with r0 >= r1 > 0
 *   * The sweep is positive
 *   * The coordinate system has positive determinant.
 * * For uv parameterization,
 *   * u is around the minor hoop, with (0..1) mapping to phi of (0 degrees ..360 degrees)
 *   * v is along the major hoop with (0..1) mapping to theta of (0 .. sweep)
 *   * a constant v section is a full circle
 *   * a constant u section is an arc with sweep angle matching the torusPipe sweep angle.
 * @public
 */
export declare class TorusPipe extends SolidPrimitive implements UVSurface, UVSurfaceIsoParametricDistance {
    /** String name for schema properties */
    readonly solidPrimitiveType = "torusPipe";
    private _localToWorld;
    private _radiusA;
    private _radiusB;
    private _sweep;
    private _isReversed;
    protected constructor(map: Transform, radiusA: number, radiusB: number, sweep: Angle, capped: boolean);
    /** return a copy of the TorusPipe */
    clone(): TorusPipe;
    /** Apply `transform` to the local coordinate system. */
    tryTransformInPlace(transform: Transform): boolean;
    /** Clone this TorusPipe and transform the clone */
    cloneTransformed(transform: Transform): TorusPipe | undefined;
    /** Create a new `TorusPipe`
     * @param frame local to world transformation
     * @param majorRadius major hoop radius
     * @param minorRadius minor hoop radius
     * @param sweep sweep angle for major circle, with positive sweep from x axis towards y axis.
     * @param capped true for circular caps
     */
    static createInFrame(frame: Transform, majorRadius: number, minorRadius: number, sweep: Angle, capped: boolean): TorusPipe | undefined;
    /** Create a TorusPipe from the typical parameters of the Dgn file */
    static createDgnTorusPipe(center: Point3d, vectorX: Vector3d, vectorY: Vector3d, majorRadius: number, minorRadius: number, sweep: Angle, capped: boolean): TorusPipe | undefined;
    /** Return a coordinate frame (right handed, unit axes)
     * * origin at center of major circle
     * * major circle in xy plane
     * * z axis perpendicular
     */
    getConstructiveFrame(): Transform | undefined;
    /** Return the center of the torus pipe (inside the donut hole) */
    cloneCenter(): Point3d;
    /** return the vector along the x axis (in the major hoops plane) */
    cloneVectorX(): Vector3d;
    /** return the vector along the y axis (in the major hoop plane) */
    cloneVectorY(): Vector3d;
    /** get the minor hoop radius (`radiusA`) */
    getMinorRadius(): number;
    /** get the major hoop radius (`radiusB`) */
    getMajorRadius(): number;
    /** get the sweep angle along the major circle. */
    getSweepAngle(): Angle;
    /** Ask if this TorusPipe is labeled as reversed */
    getIsReversed(): boolean;
    /** Return the sweep angle as a fraction of full 360 degrees (2PI radians) */
    getThetaFraction(): number;
    /** ask if `other` is an instance of `TorusPipe` */
    isSameGeometryClass(other: any): boolean;
    /** test if `this` and `other` have nearly equal geometry */
    isAlmostEqual(other: GeometryQuery): boolean;
    /** Return the angle (in radians) for given fractional position around the major hoop.
     */
    vFractionToRadians(v: number): number;
    /** Second step of double dispatch:  call `handler.handleTorusPipe(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Return the Arc3d section at vFraction.  For the TorusPipe, this is a minor circle.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(v: number): CurveCollection | undefined;
    /** Return an arc at constant u, and arc sweep  matching this TorusPipe sweep. */
    constantUSection(uFraction: number): CurveCollection | undefined;
    /** extend `rangeToExtend` to include this `TorusPipe` */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Evaluate as a uv surface
     * @param u fractional position in minor (phi)
     * @param v fractional position on major (theta) arc
     */
    uvFractionToPoint(u: number, v: number, result?: Point3d): Point3d;
    /** Evaluate as a uv surface, returning point and two vectors.
     * @param u fractional position in minor (phi)
     * @param v fractional position on major (theta) arc
     */
    uvFractionToPointAndTangents(u: number, v: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * Directional distance query
     * * u direction is around the (full) minor hoop
     * * v direction is around the outer radius, sum of (absolute values of) major and minor radii.
     */
    maxIsoParametricDistance(): Vector2d;
    /**
     * @return true if this is a closed volume.
     */
    readonly isClosedVolume: boolean;
}
//# sourceMappingURL=TorusPipe.d.ts.map