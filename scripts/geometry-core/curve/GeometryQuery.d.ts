/** @module Curve */
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
/** Queries to be supported by Curve, Surface, and Solid objects */
export declare abstract class GeometryQuery {
    /** return the range of the entire (tree) GeometryQuery */
    range(transform?: Transform, result?: Range3d): Range3d;
    /** extend rangeToExtend by the range of this geometry multiplied by the transform */
    abstract extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Attempt to transform in place.
     *
     * * LineSegment3d, Arc3d, LineString3d, BsplineCurve3d always succeed.
     * * Some geometry types may fail if scaling is non-uniform.
     */
    abstract tryTransformInPlace(transform: Transform): boolean;
    /** try to move the geometry by dx,dy,dz */
    tryTranslateInPlace(dx: number, dy?: number, dz?: number): boolean;
    /** return a transformed clone.
     */
    abstract cloneTransformed(transform: Transform): GeometryQuery | undefined;
    /** return a clone */
    abstract clone(): GeometryQuery | undefined;
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    readonly children: GeometryQuery[] | undefined;
    /** test if (other instanceof this.Type).  REQUIRED IN ALL CONCRETE CLASSES */
    abstract isSameGeometryClass(other: GeometryQuery): boolean;
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other: GeometryQuery): boolean;
    abstract dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=GeometryQuery.d.ts.map