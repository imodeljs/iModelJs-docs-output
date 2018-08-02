"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Polyface */
const PointVector_1 = require("../PointVector");
//
//      2------------------3
//      | \     F4       / |
//      |   6----------7   |
//      |   |          |   |   (BOTTOM = F0)
//      |F5 |   F1     |F3 |
//      |   |          |   |
//      |   4----------5   |
//      | /     F2       \ |
//      0------------------1
//
class BoxTopology {
}
/**
 * static readonly array with the coordinates of the 8 unit cube corners in standard order, which is:
 * x varies fastest
 * * The point indices for the x edges are (0 to 1), (2 to 3), (4 to 5), (6 to 7)
 * * The point indices for the y edges are (0 to 2), (1 to 3), (4 to 6), (5 to 7)
 * * The point indices for the z edges are (0 to 4), (1 to 5), (2 to 6), (3 to 7)
 */
BoxTopology.points = [
    PointVector_1.Point3d.create(0, 0, 0),
    PointVector_1.Point3d.create(1, 0, 0),
    PointVector_1.Point3d.create(0, 1, 0),
    PointVector_1.Point3d.create(1, 1, 0),
    PointVector_1.Point3d.create(0, 0, 1),
    PointVector_1.Point3d.create(1, 0, 1),
    PointVector_1.Point3d.create(0, 1, 1),
    PointVector_1.Point3d.create(1, 1, 1),
];
BoxTopology.primaryCapId = -1;
// cornerIndexCCW[face][*] = vertices around face
BoxTopology.cornerIndexCCW = [
    [1, 0, 2, 3],
    [4, 5, 7, 6],
    [0, 1, 5, 4],
    [1, 3, 7, 5],
    [3, 2, 6, 7],
    [2, 0, 4, 6]
];
// [partnerFace[faceIndex][*] = adjacent face indices.
BoxTopology.partnerFace = [
    [5, 4, 3, 2],
    [2, 3, 4, 5],
    [0, 3, 1, 5],
    [0, 4, 1, 2],
    [0, 5, 1, 3],
    [0, 2, 1, 4],
];
BoxTopology.faceId = [
    [BoxTopology.primaryCapId, 0],
    [BoxTopology.primaryCapId, 1],
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3]
];
// faceDirections[faceIndex] =[[edge0AxisIndex, edge1AxisIndex, normalAxisIndex],[direction sign for along the axis]
BoxTopology.faceDirections = [
    [[0, 1, 2], [-1, 1, -1]],
    [[0, 1, 2], [1, 1, 1]],
    [[0, 2, 1], [1, -1, 1]],
    [[1, 2, 0], [1, 1, 1]],
    [[0, 2, 1], [-1, 1, 1]],
    [[1, 2, 0], [-1, 1, -1]]
];
// axisEdgeVertex[axisIndex][edgeIndex 0..3][*] = vertex index at end of edge in axisIndex direction.
BoxTopology.axisEdgeVertex = [
    [[0, 1], [2, 3], [4, 5], [6, 7]],
    [[0, 2], [1, 3], [4, 6], [5, 7]],
    [[0, 4], [1, 5], [2, 6], [3, 7]]
];
exports.BoxTopology = BoxTopology;
//# sourceMappingURL=BoxTopology.js.map