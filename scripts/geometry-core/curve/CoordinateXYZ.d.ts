/** @module Curve */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { GeometryQuery } from "./GeometryQuery";
/** A Coordinate is a Point3d with supporting methods from the GeometryQuery abstraction.
 * @public
 */
export declare class CoordinateXYZ extends GeometryQuery {
    /** String name for interface properties */
    readonly geometryCategory = "point";
    private _xyz;
    /** Return a (REFERENCE TO) the coordinate data. */
    readonly point: Point3d;
    /**
     * @param xyz point to be CAPTURED.
     */
    private constructor();
    /** Create a new CoordinateXYZ containing a CLONE of point */
    static create(point: Point3d): CoordinateXYZ;
    /** Create a new CoordinateXYZ */
    static createXYZ(x?: number, y?: number, z?: number): CoordinateXYZ;
    /** return the range of the point */
    range(): Range3d;
    /** extend `rangeToExtend` to include this point (optionally transformed) */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Apply transform to the Coordinate's point. */
    tryTransformInPlace(transform: Transform): boolean;
    /** return a transformed clone.
     */
    cloneTransformed(transform: Transform): GeometryQuery | undefined;
    /** return a clone */
    clone(): GeometryQuery | undefined;
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    /** test if (other instanceof Coordinate).  */
    isSameGeometryClass(other: GeometryQuery): boolean;
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other: GeometryQuery): boolean;
    /** Second step of double dispatch:  call `handler.handleCoordinateXYZ(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=CoordinateXYZ.d.ts.map