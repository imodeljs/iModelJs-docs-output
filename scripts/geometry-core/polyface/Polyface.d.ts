/** @module Polyface */
import { Point2d } from "../geometry3d/Point2dVector2d";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range3d, Range2d, Range1d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryQuery } from "../curve/GeometryQuery";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { PolyfaceData } from "./PolyfaceData";
/**
 * Data for a face in a polyface containing facets.
 * This is built up cooperatively by the PolyfaceBuilder and its
 * callers, and stored as a FaceData array in PolyfaceData.
 */
export declare class FacetFaceData {
    private _paramDistanceRange;
    private _paramRange;
    readonly paramDistanceRange: Range2d;
    readonly paramRange: Range2d;
    private constructor();
    /** Create a FacetFaceData with null ranges. */
    static createNull(): FacetFaceData;
    /** Create a deep copy of this FacetFaceData object. */
    clone(result?: FacetFaceData): FacetFaceData;
    /** Restore this FacetFaceData to its null constructor state. */
    null(): void;
    /** Return distance-based parameter from stored parameter value. */
    convertParamToDistance(param: Point2d, result?: Point2d): Point2d;
    /** Return normalized (0-1) parameter from stored parameter value. */
    convertParamToNormalized(param: Point2d, result?: Point2d): Point2d;
    /** Scale distance paramaters. */
    scaleDistances(distanceScale: number): void;
    /**
     * Sets the paramDistance range of this FacetFaceData based on the newly terminated facets that make it up.
     * Takes the polyface itself, the first and last indexes of the facets to be included in the face.
     * Returns true on success, false otherwise.
     */
    setParamDistanceRangeFromNewFaceData(polyface: IndexedPolyface, facetStart: number, facetEnd: number): boolean;
}
/** The data types of [[AuxChannel]].  The scalar types are used to produce thematic  vertex colors. */
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
/**  Represents the [[AuxChannel]] data at a single input value. */
export declare class AuxChannelData {
    /** The input value for this data. */
    input: number;
    /** The vertex values for this data.  A single value per vertex for scalar types and 3 values (x,y,z) for normal or vector channels. */
    values: number[];
    /** Construct a new [[AuxChannelData]] from input value and vertex values. */
    constructor(input: number, values: number[]);
    copyValues(other: AuxChannelData, thisIndex: number, otherIndex: number, blockSize: number): void;
    clone(): AuxChannelData;
    isAlmostEqual(other: AuxChannelData, tol?: number): boolean;
}
/**  Represents a single [[PolyfaceAuxData]] channel. A channel  may represent a single scalar value such as stress or temperature or may represent displacements from vertex position or replacements for normals. */
export declare class AuxChannel {
    /** An array of [[AuxChannelData]] that represents the vertex data at one or more input values. */
    data: AuxChannelData[];
    dataType: AuxChannelDataType;
    /** The channel name. This is used to present the [[AuxChannel]] to the user and also to select the [[AuxChannel]] for display from [[AnalysisStyle]] */
    name?: string;
    /** The input name. */
    inputName?: string;
    /** create a [[AuxChannel]] */
    constructor(data: AuxChannelData[], dataType: AuxChannelDataType, name?: string, inputName?: string);
    clone(): AuxChannel;
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
 */
export declare class PolyfaceAuxData {
    /** @param channels Array with one or more channels of auxilliary data for the associated polyface.
     * @param indices The indices (shared by all data in all channels) mapping the data to the mesh facets.
     */
    channels: AuxChannel[];
    indices: number[];
    constructor(channels: AuxChannel[], indices: number[]);
    clone(): PolyfaceAuxData;
    isAlmostEqual(other: PolyfaceAuxData, tol?: number): boolean;
    createForVisitor(): PolyfaceAuxData;
}
/**
 * A Polyface is n abstract mesh structure (of unspecified implementation) that provides a PolyfaceVisitor
 * to iterate over its facets.
 */
export declare abstract class Polyface extends GeometryQuery {
    data: PolyfaceData;
    protected constructor(data: PolyfaceData);
    /** create and return a visitor for this concrete polyface. */
    abstract createVisitor(_numWrap: number): PolyfaceVisitor;
    private _twoSided;
    twoSided: boolean;
}
export declare class IndexedPolyface extends Polyface {
    isSameGeometryClass(other: any): boolean;
    /** Tests for equivalence between two IndexedPolyfaces. */
    isAlmostEqual(other: any): boolean;
    tryTransformInPlace(transform: Transform): boolean;
    clone(): IndexedPolyface;
    cloneTransformed(transform: Transform): IndexedPolyface;
    reverseIndices(): void;
    reverseNormals(): void;
    protected _facetStart: number[];
    protected _facetToFaceData: number[];
    /** return face data using a facet index. This is the REFERENCE to the FacetFaceData, not a copy. Returns undefined if none found. */
    tryGetFaceData(i: number): FacetFaceData | undefined;
    protected constructor(data: PolyfaceData, facetStart?: number[], facetToFaceData?: number[]);
    /**
     * * Add facets from source to this polyface.
     * * optionally reverse the facets.
     * * optionally apply a transform to points.
     * * will only copy param, normal, color, and face data if we are already tracking them AND/OR the source contains them
     */
    addIndexedPolyface(source: IndexedPolyface, reversed: boolean, transform: Transform | undefined): void;
    /** @returns Return the total number of param indices in zero-terminated style, which includes
     * * all the indices in the packed zero-based table
     * * one additional index for the zero-terminator of each facet.
     * @note Note that all index arrays (point, normal, param, color) have the same counts, so there
     * is not a separate query for each of them.
     */
    readonly zeroTerminatedIndexCount: number;
    static create(needNormals?: boolean, needParams?: boolean, needColors?: boolean): IndexedPolyface;
    /** add (a clone of ) a point. return its 0 based index.
     * @returns Returns the zero-based index of the added point.
     */
    addPoint(point: Point3d): number;
    /** add a point.
     * @returns Returns the zero-based index of the added point.
     */
    addPointXYZ(x: number, y: number, z: number): number;
    addParam(param: Point2d): number;
    addParamXY(x: number, y: number): number;
    addNormal(normal: Vector3d): number;
    addNormalXYZ(x: number, y: number, z: number): number;
    addColor(color: number): number;
    addPointIndex(index: number, visible?: boolean): void;
    addNormalIndex(index: number): void;
    addParamIndex(index: number): void;
    addColorIndex(index: number): void;
    /** clean up the open facet.  return the returnValue (so caller can easily return cleanupOpenFacet("message")) */
    cleanupOpenFacet(): void;
    /** announce the end of construction of a facet.
     *
     * * The "open" facet is checked for:
     *
     * **  Same number of indices among all active index arrays --  point, normal, param, color
     * **  All indices are within bounds of the respective data arrays.
     * *  in error cases, all index arrays are trimmed back to the size when previous facet was terminated.
     * *  "undefined" return is normal.   Any other return is a description of an error.
     */
    terminateFacet(validateAllIndices?: boolean): any;
    /**
     * All terminated facets added since the declaration of the previous face
     * will be grouped into a new face with their own 2D range.
     */
    /** (read-only property) number of facets */
    readonly facetCount: number;
    /** (read-only property) number of faces */
    readonly faceCount: number;
    /** (read-only property) number of points */
    readonly pointCount: number;
    /** (read-only property) number of colors */
    readonly colorCount: number;
    /** (read-only property) number of parameters */
    readonly paramCount: number;
    /** (read-only property) number of normals */
    readonly normalCount: number;
    numEdgeInFacet(facetIndex: number): number;
    isValidFacetIndex(index: number): boolean;
    /** ASSUME valid facet index . .. return its start index in index arrays. */
    facetIndex0(index: number): number;
    /** ASSUME valid facet index . .. return its end index in index arrays. */
    facetIndex1(index: number): number;
    /** create a visitor for this polyface */
    createVisitor(numWrap?: number): PolyfaceVisitor;
    range(transform?: Transform, result?: Range3d): Range3d;
    extendRange(range: Range3d, transform?: Transform): void;
    /** Given the index of a facet, return the data pertaining to the face it is a part of. */
    getFaceDataByFacetIndex(facetIndex: number): FacetFaceData;
    /** Given the index of a face, return the range of that face. */
    getFaceDataByFaceIndex(faceIndex: number): FacetFaceData;
    /**
     * All terminated facets since the last face declaration will be mapped to a single new FacetFaceData object
     * using facetToFaceData[]. FacetFaceData holds the 2D range of the face. Returns true if successful, false otherwise.
     */
    setNewFaceData(endFacetIndex?: number): boolean;
    /** TODO: IMPLEMENT */
    checkIfClosedByEdgePairing(): boolean;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
/**
 * A PolyfaceVisitor manages data while walking through facets.
 *
 * * The polyface visitor holds data for one facet at a time.
 * * The caller can request the position in the addressed facets as a "readIndex."
 * * The readIndex value (as a number) is not promised to be sequential. (I.e. it might be a simple facet count or might be
 */
export interface PolyfaceVisitor extends PolyfaceData {
    moveToReadIndex(index: number): boolean;
    currentReadIndex(): number;
    moveToNextFacet(): boolean;
    reset(): void;
    clientPointIndex(i: number): number;
    clientParamIndex(i: number): number;
    clientNormalIndex(i: number): number;
    clientColorIndex(i: number): number;
    clientAuxIndex(i: number): number;
}
export declare class IndexedPolyfaceVisitor extends PolyfaceData implements PolyfaceVisitor {
    private _currentFacetIndex;
    private _nextFacetIndex;
    private _numWrap;
    private _numEdges;
    private _polyface;
    private constructor();
    readonly numEdgesThisFacet: number;
    static create(polyface: IndexedPolyface, numWrap: number): IndexedPolyfaceVisitor;
    moveToReadIndex(facetIndex: number): boolean;
    moveToNextFacet(): boolean;
    reset(): void;
    /**
     * Attempts to extract the distance parameter for the face of a given point index.
     * Returns the distance parameter as a point. Returns undefined on failure.
     */
    tryGetDistanceParameter(index: number, result?: Point2d): Point2d | undefined;
    /**
     * Attempts to extract the normalized parameter (0,1) for the face of a given point index.
     * Returns the normalized parameter as a point. Returns undefined on failure.
     */
    tryGetNormalizedParameter(index: number, result?: Point2d): Point2d | undefined;
    currentReadIndex(): number;
    clientPointIndex(i: number): number;
    clientParamIndex(i: number): number;
    clientNormalIndex(i: number): number;
    clientColorIndex(i: number): number;
    clientAuxIndex(i: number): number;
}
//# sourceMappingURL=Polyface.d.ts.map