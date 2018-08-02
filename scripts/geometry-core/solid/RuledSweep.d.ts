import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { CurveCollection } from "../curve/CurveChain";
import { GeometryQuery } from "../curve/CurvePrimitive";
import { GeometryHandler } from "../GeometryHandler";
import { SolidPrimitive } from "./SolidPrimitive";
import { SweepContour } from "./SweepContour";
export declare class RuledSweep extends SolidPrimitive {
    private contours;
    private constructor();
    static create(contours: CurveCollection[], capped: boolean): RuledSweep | undefined;
    /** @returns Return a reference to the array of sweep contours. */
    sweepContoursRef(): SweepContour[];
    cloneSweepContours(): SweepContour[];
    cloneContours(): CurveCollection[];
    clone(): RuledSweep;
    tryTransformInPlace(transform: Transform): boolean;
    cloneTransformed(transform: Transform): RuledSweep;
    /** Return a coordinate frame (right handed unit vectors)
     * * origin on base contour
     * * x, y directions from base contour.
     * * z direction perpenedicular
     */
    getConstructiveFrame(): Transform | undefined;
    isSameGeometryClass(other: any): boolean;
    isAlmostEqual(other: GeometryQuery): boolean;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * @returns Return the section curves at a fraction of the sweep
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
