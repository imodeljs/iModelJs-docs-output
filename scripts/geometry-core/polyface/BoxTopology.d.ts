/** @module Polyface */
import { Point3d } from "../geometry3d/Point3dVector3d";
export declare class BoxTopology {
    /**
     * static readonly array with the coordinates of the 8 unit cube corners in standard order, which is:
     * x varies fastest
     * * The point indices for the x edges are (0 to 1), (2 to 3), (4 to 5), (6 to 7)
     * * The point indices for the y edges are (0 to 2), (1 to 3), (4 to 6), (5 to 7)
     * * The point indices for the z edges are (0 to 4), (1 to 5), (2 to 6), (3 to 7)
     */
    static readonly points: Point3d[];
    static readonly primaryCapId = -1;
    static readonly cornerIndexCCW: number[][];
    static readonly partnerFace: number[][];
    static readonly faceId: number[][];
    static readonly faceDirections: number[][][];
    static readonly axisEdgeVertex: number[][][];
}
//# sourceMappingURL=BoxTopology.d.ts.map