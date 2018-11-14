/** @module Curve */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { GeometryQuery } from "./GeometryQuery";
/** A Coordinate is a persistable Point3d */
export declare class CoordinateXYZ extends GeometryQuery {
    private _xyz;
    readonly point: Point3d;
    /**
     * @param xyz point to be CAPTURED.
     */
    private constructor();
    static create(point: Point3d): CoordinateXYZ;
    /** return the range of the point */
    range(): Range3d;
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
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=CoordinateXYZ.d.ts.map