/** @module Curve */
import { BeJSONFunctions } from "../Geometry";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { GeometryQuery } from "./GeometryQuery";
/**
 * A PointString3d is an array of points.
 * * PointString3D is first class (persistible, displayable) geometry derived from the GeometryQuery base class.
 * * The various points in the PointString3d are NOT connected by line segments for display or other calculations.
 * @public
 */
export declare class PointString3d extends GeometryQuery implements BeJSONFunctions {
    /** String name for schema properties */
    readonly geometryCategory = "pointCollection";
    /** Test if `other` is a PointString3d */
    isSameGeometryClass(other: GeometryQuery): boolean;
    private _points;
    /** return a clone of the points array. */
    readonly points: Point3d[];
    private constructor();
    /** Clone and apply a transform. */
    cloneTransformed(transform: Transform): PointString3d;
    private static flattenArray;
    /** Create a PointString3d from points. */
    static create(...points: any[]): PointString3d;
    /** Add multiple points to the PointString3d */
    addPoints(...points: any[]): void;
    /** Add a single point to the PointString3d */
    addPoint(point: Point3d): void;
    /** Remove the last point added to the PointString3d */
    popPoint(): void;
    /** Replace this PointString3d's point array by a clone of the array in `other` */
    setFrom(other: PointString3d): void;
    /** Create from an array of Point3d */
    static createPoints(points: Point3d[]): PointString3d;
    /** Create a PointString3d from xyz coordinates packed in a Float64Array */
    static createFloat64Array(xyzData: Float64Array): PointString3d;
    /** Return a deep clone. */
    clone(): PointString3d;
    /** Replace this instance's points by those from a json array, e.g. `[[1,2,3], [4,2,2]]` */
    setFromJSON(json?: any): void;
    /**
     * Convert an PointString3d to a JSON object.
     * @return {*} [[x,y,z],...[x,y,z]]
     */
    toJSON(): any;
    /** Create a PointString3d from a json array, e.g. `[[1,2,3], [4,2,2]]` */
    static fromJSON(json?: any): PointString3d;
    /** Access a single point by index. */
    pointAt(i: number, result?: Point3d): Point3d | undefined;
    /** Return the number of points. */
    numPoints(): number;
    /** Reverse the point order */
    reverseInPlace(): void;
    /** Return the number of points. */
    tryTransformInPlace(transform: Transform): boolean;
    /** Return the index and coordinates of the closest point to spacepoint. */
    closestPoint(spacePoint: Point3d): {
        index: number;
        xyz: Point3d;
    };
    /** Return true if all points are in the given plane. */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** Extend a range to include the points in this PointString3d. */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Return true if corresponding points are almost equal. */
    isAlmostEqual(other: GeometryQuery): boolean;
    /** Reduce to empty set of points. */
    clear(): void;
    /** Second step of double dispatch:  call `handler.handlePointString(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=PointString3d.d.ts.map