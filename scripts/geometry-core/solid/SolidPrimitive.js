"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
/**
 * Base class for SolidPrimitve variants.
 *
 * * Base class holds capped flag for all derived classes.
 */
class SolidPrimitive extends CurvePrimitive_1.GeometryQuery {
    constructor(capped) { super(); this._capped = capped; }
    /** Ask if this is a capped solid */
    get capped() { return this._capped; }
    /** Set the capped flag */
    set capped(capped) { this._capped = capped; }
}
exports.SolidPrimitive = SolidPrimitive;
//# sourceMappingURL=SolidPrimitive.js.map