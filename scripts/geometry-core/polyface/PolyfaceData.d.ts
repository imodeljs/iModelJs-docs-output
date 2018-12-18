/** @module Polyface */
import { Point2d } from "../geometry3d/Point2dVector2d";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
import { FacetFaceData, PolyfaceAuxData } from "./Polyface";
/**
 * PolyfaceData carries data arrays for point, normal, param, color and their indices.
 *
 * * IndexedPolyface carries a PolyfaceData as a member. (NOT as a base class -- it already has GeometryQuery as base)
 * * IndexedPolyfaceVisitor uses PolyfaceData as a base class.
 */
export declare class PolyfaceData {
    static readonly planarityLocalRelTol = 1e-13;
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
    auxData: PolyfaceAuxData | undefined;
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
    /** return indexed point. This is a copy of the coordinates, not a reference. */
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
    private static trimArray;
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
    /**
     * Test if facetStartIndex is (minimally!) valid:
     * * length must be nonzero (recall that for "no facets" the facetStartIndexArray still must contain a 0)
     * * Each entry must be strictly smaller than the one that follows.
     * @param facetStartIndex array of facetStart data.  facet `i` has indices at `facetsStartIndex[i]` to (one before) `facetStartIndex[i+1]`
     */
    static isValidFacetStartIndexArray(facetStartIndex: number[]): boolean;
    static reverseIndices<T>(facetStartIndex: number[], indices: T[] | undefined, preserveStart: boolean): boolean;
}
//# sourceMappingURL=PolyfaceData.d.ts.map