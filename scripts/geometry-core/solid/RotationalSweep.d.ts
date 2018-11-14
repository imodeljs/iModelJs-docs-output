/** @module Solid */
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { CurveCollection } from "../curve/CurveCollection";
import { GeometryQuery } from "../curve/GeometryQuery";
import { Ray3d } from "../geometry3d/Ray3d";
import { Angle } from "../geometry3d/Angle";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { SweepContour } from "./SweepContour";
import { SolidPrimitive } from "./SolidPrimitive";
export declare class RotationalSweep extends SolidPrimitive {
    private _contour;
    private _normalizedAxis;
    private _sweepAngle;
    private constructor();
    static create(contour: CurveCollection, axis: Ray3d, sweepAngle: Angle, capped: boolean): RotationalSweep | undefined;
    /** Return a coordinate frame (right handed unit vectors)
     * * origin at origin of rotation ray
     * * z direction along the rotation ray.
     * * y direction perpendicular to the base contour plane
     */
    getConstructiveFrame(): Transform | undefined;
    cloneAxisRay(): Ray3d;
    getCurves(): CurveCollection;
    getSweepContourRef(): SweepContour;
    getSweep(): Angle;
    isSameGeometryClass(other: any): boolean;
    isAlmostEqual(other: GeometryQuery): boolean;
    clone(): RotationalSweep;
    tryTransformInPlace(transform: Transform): boolean;
    cloneTransformed(transform: Transform): RotationalSweep;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    getFractionalRotationTransform(vFraction: number, result?: Transform): Transform;
    /**
     * @returns Return the curves of a constant-v section of the solid.
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    extendRange(range: Range3d): void;
}
//# sourceMappingURL=RotationalSweep.d.ts.map