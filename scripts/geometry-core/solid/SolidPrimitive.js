"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
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