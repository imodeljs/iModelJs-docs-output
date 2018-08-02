/** @module CartesianGeometry */
import { AxisScaleSelect } from "./Geometry";
import { Point3d, Vector3d } from "./PointVector";
import { Transform } from "./Transform";
import { Range3d } from "./Range";
/**
 * Helper class to accumulate points and vectors until there is enough data to define a coordinate system.
 *
 * * For the common case of building a right handed frame:
 *
 * ** create the FrameBuilder and make calls to announcePoint and announceVector.
 * ** the frame will be fully determined by an origin and two vectors.
 * ** the first call to announcePoint will set the origin.
 * **  additional calls to announcePoint will produce announceVector call with the vector from the origin.
 * ** After each announcement, call getValidatedFrame(false)
 * ** getValidatedFrame will succeed when it has two independent vectors.
 * *  to build a left handed frame,
 *
 * **  an origin and 3 independent vectors are required.
 * **  annouce as above, but query wtih getValidatedFrame (true).
 * **  this will use the third vector to select right or left handed frame.
 */
export declare class FrameBuilder {
    private origin;
    private vector0;
    private vector1;
    private vector2;
    clear(): void;
    constructor();
    /** Try to assemble the data into a nonsingular transform.
     *
     * * If allowLeftHanded is false, vector0 and vector1 determine a right handed coordinate system.
     * * if allowLeftHanded is true, the z vector of the right handed system can be flipped to agree with vector2 direction.
     */
    getValidatedFrame(allowLeftHanded?: boolean): Transform | undefined;
    applyDefaultUpVector(vector?: Vector3d): void;
    hasOrigin(): boolean;
    /** Return the number of vectors saved.   Because the save process checkes numerics, this should be the rank of the system.
     */
    savedVectorCount(): number;
    /** announce a new point.  If this point is different from the origin, also announce the vector from the origin.*/
    announcePoint(point: Point3d): number;
    announceVector(vector: Vector3d): number;
    /** Inspect the content of the data.  Announce points and vectors.   Return when savedVectorCount becomes
     * sufficient for a coordinate system.
     */
    announce(data: any): void;
    /** create a localToWorld frame for the given data.
     *
     * *  origin is at first point
     * *  x axis in direction of first nonzero vector present or implied by the input.
     * *  y axis is perpendicular to x and contains (in positive side) the next vector present or implied by the input.
     */
    static createRightHandedFrame(defaultUpVector: Vector3d | undefined, ...params: any[]): Transform | undefined;
    /** create a map with
     * *  transform0 = the local to world
     * *  transform1 = world to local
     * * ideally all points in local xy plane
     */
    static createRightHandedLocalToWorld(...params: any[]): Transform | undefined;
    /**
     * try to create a frame whose xy plane is through points.
     *
     * *  if 3 or more distinct points are present, the x axis is from the first point to the most distance, and y direction is toward the
     * point most distant from that line.
     * @param points array of points
     */
    static createFrameToDistantPoints(points: Point3d[]): Transform | undefined;
    /**
     * Create the localToWorld transform from a range to axes of its parent coordinate system.
     * @param range [in] range to inpsect
     * @param fractionX  [in] fractonal coordinate of frame origin x
     * @param fractionY [in] fractional coordinate of frame origin y
     * @param fractionZ [in] fractgional coordinate of frame origin z
     * @param scaleSelect [in] selects size of localToWorld axes.
     * @param defaultAxisLength [in] if true and any axis length is 0, that axis vector takes this physical length.
     */
    static createLocalToWorldTransformInRange(range: Range3d, scaleSelect?: AxisScaleSelect, fractionX?: number, fractionY?: number, fractionZ?: number, defaultAxisLength?: number): Transform;
}
