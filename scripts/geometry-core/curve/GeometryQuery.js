"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Curve */
const Range_1 = require("../geometry3d/Range");
const Transform_1 = require("../geometry3d/Transform");
/** Queries to be supported by Curve, Surface, and Solid objects */
/**
 * * `GeometryQuery` is an abstract base class with (abstract) methods for querying curve, solid primitive, mesh, and bspline surfaces
 * @public
 */
class GeometryQuery {
    /** return the range of the entire (tree) GeometryQuery */
    range(transform, result) {
        if (result)
            result.setNull();
        const range = result ? result : Range_1.Range3d.createNull();
        this.extendRange(range, transform);
        return range;
    }
    /** try to move the geometry by dx,dy,dz */
    tryTranslateInPlace(dx, dy = 0.0, dz = 0.0) {
        return this.tryTransformInPlace(Transform_1.Transform.createTranslationXYZ(dx, dy, dz));
    }
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    get children() { return undefined; }
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other) {
        if (this.isSameGeometryClass(other)) {
            const childrenA = this.children;
            const childrenB = other.children;
            if (childrenA && childrenB) {
                if (childrenA.length !== childrenB.length)
                    return false;
                for (let i = 0; i < childrenA.length; i++) {
                    if (!childrenA[i].isAlmostEqual(childrenB[i]))
                        return false;
                }
                return true;
            }
            else if (childrenA || childrenB) { // CurveCollections start with empty arrays for children.  So these null pointer cases are never reached.
                return false; // plainly different .
            }
            else {
                // both children null. call it equal?   This class should probably have implemented.
                return true;
            }
        }
        return false;
    }
}
exports.GeometryQuery = GeometryQuery;
//# sourceMappingURL=GeometryQuery.js.map