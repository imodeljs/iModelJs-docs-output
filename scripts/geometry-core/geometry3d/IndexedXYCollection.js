"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * abstract base class for access to XYZ data with indexed reference.
 * * This allows algorithms to work with Point2d[] or GrowableXYZ.
 * ** GrowableXYZArray implements these for its data.
 * ** Point2dArrayCarrier carries a (reference to) a Point2d[] and implements the methods with calls on that array reference.
 * * In addition to "point by point" accessors, there abstract members compute commonly useful vector data "between points".
 * * Methods that create vectors among multiple indices allow callers to avoid creating temporaries.
 * @public
 */
class IndexedXYCollection {
}
exports.IndexedXYCollection = IndexedXYCollection;
//# sourceMappingURL=IndexedXYCollection.js.map