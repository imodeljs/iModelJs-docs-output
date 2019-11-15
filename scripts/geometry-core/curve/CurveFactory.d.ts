/** @module Curve */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Arc3d } from "./Arc3d";
import { LineString3d } from "./LineString3d";
import { IndexedXYZCollection } from "../geometry3d/IndexedXYZCollection";
import { Path } from "./Path";
/**
 * The `CurveFactory` class contains methods for specialized curve constructions.
 * @public
 */
export declare class CurveFactory {
    /** (cautiously) construct and save a line segment between fractional positions. */
    private static addPartialSegment;
    /**
     * Construct a sequence of alternating lines and arcs with the arcs creating tangent transition between consecutive edges.
     * @param points point source
     * @param radius fillet radius
     * @param allowBackupAlongEdge true to allow edges to be created going "backwards" along edges if needed to create the blend.
     */
    static createFilletsInLineString(points: LineString3d | IndexedXYZCollection | Point3d[], radius: number, allowBackupAlongEdge?: boolean): Path | undefined;
    /**
     * If `arcB` is a continuation of `arcA`, extend `arcA` (in place) to include the range of `arcB`
     * * This only succeeds if the two arcs are part of identical complete arcs and end of `arcA` matches the beginning of `arcB`.
     * * "Reversed"
     * @param arcA
     * @param arcB
     */
    static appendToArcInPlace(arcA: Arc3d, arcB: Arc3d, allowReverse?: boolean): boolean;
}
//# sourceMappingURL=CurveFactory.d.ts.map