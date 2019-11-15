/** @module Solid */
import { XAndY } from "../geometry3d/XYZProps";
import { Vector3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { CurveCollection } from "../curve/CurveCollection";
import { GeometryQuery } from "../curve/GeometryQuery";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { SweepContour } from "./SweepContour";
import { SolidPrimitive } from "./SolidPrimitive";
/**
 * A LinearSweep is a `SolidPrimitive` defined by
 * * A set of curves (any Loop, Path, or parityRegion)
 * * A sweep vector
 * If the object is "capped", the curves must be planar.
 * @public
 */
export declare class LinearSweep extends SolidPrimitive {
    /** String name for schema properties */
    readonly solidPrimitiveType = "linearSweep";
    private _contour;
    private _direction;
    private constructor();
    /**
     * Create a sweep of a starting contour.
     * @param contour contour to be swept
     * @param direction sweep vector.  The contour is swept the full length of the vector.
     * @param capped true to include end caps
     */
    static create(contour: CurveCollection, direction: Vector3d, capped: boolean): LinearSweep | undefined;
    /** Create a z-direction sweep of the polyline or polygon given as xy linestring values.
     * * If not capped, the xyPoints array is always used unchanged.
     * * If capped but the xyPoints array does not close, exact closure will be enforced by one of these:
     * * * If the final point is almost equal to the first, it is replaced by the exact first point.
     * * * if the final point is not close to the first an extra point is added.
     * * If capped, the point order will be reversed if necessary to produce positive volume.
     * @param xyPoints array of xy coordinates
     * @param z z value to be used for all coordinates
     * @param zSweep the sweep distance in the z direction.
     * @param capped true if caps are to be added.
     */
    static createZSweep(xyPoints: XAndY[], z: number, zSweep: number, capped: boolean): LinearSweep | undefined;
    /** get a reference to the swept curves */
    getCurvesRef(): CurveCollection;
    /** Get a reference to the `SweepContour` carrying the plane of the curves */
    getSweepContourRef(): SweepContour;
    /** return a clone of the sweep vector */
    cloneSweepVector(): Vector3d;
    /** Test if `other` is also an instance of `LinearSweep` */
    isSameGeometryClass(other: any): boolean;
    /** Return a deep clone */
    clone(): LinearSweep;
    /** apply a transform to the curves and sweep vector */
    tryTransformInPlace(transform: Transform): boolean;
    /** Return a coordinate frame (right handed unit vectors)
     * * origin on base contour
     * * x, y directions from base contour.
     * * z direction perpendicular
     */
    getConstructiveFrame(): Transform | undefined;
    /** Return a transformed clone */
    cloneTransformed(transform: Transform): LinearSweep;
    /** Test for near-equality of coordinates in `other` */
    isAlmostEqual(other: GeometryQuery): boolean;
    /** Invoke strongly typed `handler.handleLinearSweep(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Return the curves at a fraction along the sweep direction.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    /** Extend `rangeToExtend` to include this geometry. */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /**
     * @return true if this is a closed volume.
     */
    readonly isClosedVolume: boolean;
}
//# sourceMappingURL=LinearSweep.d.ts.map