/** @module Polyface */
import { Range1d } from "../geometry3d/Range";
/** The data types of [[AuxChannel]].  The scalar types are used to produce thematic  vertex colors.
 * @public
*/
export declare enum AuxChannelDataType {
    /** General scalar type - no scaling is applied if associated [[Polyface]] is transformed. */
    Scalar = 0,
    /** Distance (scalar) scaling is applied if associated [[Polyface]] is scaled. 3 Data values (x,y.z) per entry. */
    Distance = 1,
    /** Displacement added to  vertex position.  Transformed and scaled with associated [[Polyface]]. 3 Data values (x,y.z) per entry.,*/
    Vector = 2,
    /** Normal -- replaces vertex normal.  Rotated with associated [[Polyface]] transformation. 3 Data values (x,y.z) per entry. */
    Normal = 3
}
/**  Represents the [[AuxChannel]] data at a single input value.
 * @public
*/
export declare class AuxChannelData {
    /** The input value for this data. */
    input: number;
    /** The vertex values for this data.  A single value per vertex for scalar types and 3 values (x,y,z) for normal or vector channels. */
    values: number[];
    /** Construct a new [[AuxChannelData]] from input value and vertex values. */
    constructor(input: number, values: number[]);
    /** Copy blocks of size `blockSize` from (blocked index) `thisIndex` in this AuxChannelData to (blockIndex) `otherIndex` of `other` */
    copyValues(other: AuxChannelData, thisIndex: number, otherIndex: number, blockSize: number): void;
    /** return a deep copy */
    clone(): AuxChannelData;
    /** toleranced comparison of the `input` and `value` fields.
     * * Default tolernace is 1.0e-8
     */
    isAlmostEqual(other: AuxChannelData, tol?: number): boolean;
}
/**  Represents a single [[PolyfaceAuxData]] channel. A channel  may represent a single scalar value such as stress or temperature or may represent displacements from vertex position or replacements for normals.
 * @public
*/
export declare class AuxChannel {
    /** An array of [[AuxChannelData]] that represents the vertex data at one or more input values. */
    data: AuxChannelData[];
    /** type indicator for this channel.  Setting this causes later transformations to be applied to point, vector, and surface normal data in appropriate ways. */
    dataType: AuxChannelDataType;
    /** The channel name. This is used to present the [[AuxChannel]] to the user and also to select the [[AuxChannel]] for display from AnalysisStyle */
    name?: string;
    /** The input name. */
    inputName?: string;
    /** create a [[AuxChannel]] */
    constructor(data: AuxChannelData[], dataType: AuxChannelDataType, name?: string, inputName?: string);
    /** Return a deep clone */
    clone(): AuxChannel;
    /** toleranced comparison of contents. */
    isAlmostEqual(other: AuxChannel, tol?: number): boolean;
    /** return true if the data for this channel is of scalar type (single data entry per value) */
    readonly isScalar: boolean;
    /** return the number of data values per entry (1 for scalar, 3 for point or vector */
    readonly entriesPerValue: number;
    /** return value count */
    readonly valueCount: number;
    /** return the range of the scalar data. (undefined if not scalar) */
    readonly scalarRange: Range1d | undefined;
}
/**  The `PolyfaceAuxData` structure contains one or more analytical data channels for each vertex of a `Polyface`.
 * Typically a `Polyface` will contain only vertex data required for its basic display,the vertex position, normal
 * and possibly texture parameter.  The `PolyfaceAuxData` structure contains supplemental data that is generally computed
 *  in an analysis program or other external data source.  This can be scalar data used to either overide the vertex colors through *Thematic Colorization* or
 *  XYZ data used to deform the mesh by adjusting the vertex postions or normals.
 * @public
 */
export declare class PolyfaceAuxData {
    /** Array with one or more channels of auxilliary data for the associated polyface. */
    channels: AuxChannel[];
    /** indices The indices (shared by all data in all channels) mapping the data to the mesh facets. */
    indices: number[];
    constructor(channels: AuxChannel[], indices: number[]);
    /** return a deep clone */
    clone(): PolyfaceAuxData;
    /** deep test for equality.
     * * Exact equality for discrete number arrays.
     * * approximate test for coordinate data.
     */
    isAlmostEqual(other: PolyfaceAuxData, tol?: number): boolean;
    /**
     * class level almostEqual test, allowing either or both to be undefined at point of call.
     * @param left
     * @param right
     * @param tol
     */
    static isAlmostEqual(left: PolyfaceAuxData | undefined, right: PolyfaceAuxData | undefined, tol?: number): boolean;
    /** Create a PolyfaceAuxData for use by a facet iterator  */
    createForVisitor(): PolyfaceAuxData;
}
//# sourceMappingURL=AuxData.d.ts.map