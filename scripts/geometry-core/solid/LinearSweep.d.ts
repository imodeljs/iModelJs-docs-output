/** @module Solid */
import { Vector3d, XAndY } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { CurveCollection } from "../curve/CurveChain";
import { GeometryQuery } from "../curve/CurvePrimitive";
import { GeometryHandler } from "../GeometryHandler";
import { SweepContour } from "./SweepContour";
import { SolidPrimitive } from "./SolidPrimitive";
/**
 * A LinearSweep is
 *
 * * A planar contour (any Loop, Path, or parityRegion)
 * * A sweep vector
 */
export declare class LinearSweep extends SolidPrimitive {
    private _contour;
    private _direction;
    private constructor();
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
    getCurvesRef(): CurveCollection;
    getSweepContourRef(): SweepContour;
    cloneSweepVector(): Vector3d;
    isSameGeometryClass(other: any): boolean;
    clone(): LinearSweep;
    tryTransformInPlace(transform: Transform): boolean;
    /** Return a coordinate frame (right handed unit vectors)
     * * origin on base contour
     * * x, y directions from base contour.
     * * z direction perpenedicular
     */
    getConstructiveFrame(): Transform | undefined;
    cloneTransformed(transform: Transform): LinearSweep;
    isAlmostEqual(other: GeometryQuery): boolean;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * @returns Return the curves of a constant-v section of the solid.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    extendRange(range: Range3d, transform?: Transform): void;
}
//# sourceMappingURL=LinearSweep.d.ts.map