/** @module Polyface */
import { Point3d, Vector3d, Point2d } from "../PointVector";
import { Range3d, Range2d } from "../Range";
import { Transform } from "../Transform";
import { GrowableXYZArray } from "../GrowableArray";
import { GeometryQuery } from "../curve/CurvePrimitive";
import { GeometryHandler } from "../GeometryHandler";
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
/**
 * PolyfaceData carries data arrays for point, normal, param, color and their indices.
 *
 * * IndexedPolyface carries a PolyfaceData as a member. (NOT as a base class -- it already has GeometryQuery as base)
 * * IndexedPolyfaceVisitor uses PolyfaceData as a base class.
 */
export declare class PolyfaceData {
    static readonly planarityLocalRelTol: number;
    point: GrowableXYZArray;
    pointIndex: number[];
    edgeVisible: boolean[];
    normal: Vector3d[] | undefined;
    normalIndex: number[] | undefined;
    param: Point2d[] | undefined;
    paramIndex: number[] | undefined;
    color: number[] | undefined;
    colorIndex: number[] | undefined;
    /** Face data will remain empty until a face is specified. */
    face: FacetFaceData[];
    constructor(needNormals?: boolean, needParams?: boolean, needColors?: boolean);
    clone(): PolyfaceData;
    isAlmostEqual(other: PolyfaceData): boolean;
    readonly requireNormals: boolean;
    readonly pointCount: number;
    readonly normalCount: number;
    readonly paramCount: number;
    readonly colorCount: number;
    readonly indexCount: number;
    /** Will return 0 if no faces were specified during construction. */
    readonly faceCount: number;
    /** return indexed point. This is a copy of the coordinates, not a referenc. */
    getPoint(i: number): Point3d;
    /** return indexed normal. This is the REFERENCE to the normal, not a copy. */
    getNormal(i: number): Vector3d;
    /** return indexed param. This is the REFERENCE to the param, not a copy. */
    getParam(i: number): Point2d;
    /** return indexed color */
    getColor(i: number): number;
    /** return indexed visibility */
    getEdgeVisible(i: number): boolean;
    /** Copy the contents (not pointer) of point[i] into dest. */
    copyPointTo(i: number, dest: Point3d): void;
    /** Copy the contents (not pointer) of normal[i] into dest. */
    copyNormalTo(i: number, dest: Vector3d): void;
    /** Copy the contents (not pointer) of param[i] into dest. */
    copyParamTo(i: number, dest: Point2d): void;
    /**
     * * Copy data from other to this.
     * * This is the essense of transfering coordinates spread throughout a large polyface into a visitor's single facet.
     * * "other" is the large polyface
     * * "this" is the visitor
     * * does NOT copy face data - visitors reference the FacetFaceData array for the whole polyface!!
     * @param other polyface data being mined.
     * @param index0 start index in other's index arrays
     * @param index1 end index (one beyond last data accessed0 in other's index arrays
     * @param numWrap number of points to replicate as wraparound.
     */
    gatherIndexedData(other: PolyfaceData, index0: number, index1: number, numWrap: number): void;
    private static trimArray(data, length);
    trimAllIndexArrays(length: number): void;
    resizeAllDataArrays(length: number): void;
    range(result?: Range3d, transform?: Transform): Range3d;
    /** reverse indices facet-by-facet, with the given facetStartIndex array delimiting faces.
     *
     * * facetStartIndex[0] == 0 always -- start of facet zero.
     * * facet k has indices from facetStartIndex[k] <= i < facetStartIndex[k+1]
     * * hence for "internal" k, facetStartIndex[k] is both the upper limit of facet k-1 and the start of facet k.
     * *
     */
    reverseIndices(facetStartIndex?: number[]): void;
    reverseNormals(): void;
    tryTransformInPlace(transform: Transform): boolean;
    compress(): void;
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
    protected facetStart: number[];
    protected facetToFaceData: number[];
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
    isClosedByEdgePairing(): boolean;
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
}
export declare class IndexedPolyfaceVisitor extends PolyfaceData implements PolyfaceVisitor {
    private currentFacetIndex;
    private nextFacetIndex;
    private numWrap;
    private numEdges;
    private polyface;
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
}
