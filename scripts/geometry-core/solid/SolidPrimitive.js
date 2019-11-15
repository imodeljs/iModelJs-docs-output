"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const GeometryQuery_1 = require("../curve/GeometryQuery");
/**
 * Base class for SolidPrimitive variants.
 *
 * * The base class holds capped flag for all derived classes.
 * @public
 */
class SolidPrimitive extends GeometryQuery_1.GeometryQuery {
    constructor(capped) {
        super();
        /** String name for schema properties */
        this.geometryCategory = "solid";
        this._capped = capped;
    }
    /** Ask if this is a capped solid */
    get capped() { return this._capped; }
    /** Set the capped flag */
    set capped(capped) { this._capped = capped; }
}
exports.SolidPrimitive = SolidPrimitive;
//# sourceMappingURL=SolidPrimitive.js.map