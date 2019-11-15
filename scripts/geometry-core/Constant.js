"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
/** Commonly used constant values.
 * @alpha
 */
class Constant {
}
exports.Constant = Constant;
/** symbolic name for 1 millimeter:  0.001 meter */
Constant.oneMillimeter = 0.001;
/** symbolic name for 1 centimeter:  0.01 meter */
Constant.oneCentimeter = 0.01;
/** symbolic name for 1 meter:  1.0 meter */
Constant.oneMeter = 1.0;
/** symbolic name for 1 kilometer: 1000 meter */
Constant.oneKilometer = 1000.0;
/** Diameter of the earth in kilometers. */
Constant.diameterOfEarth = 12742.0 * Constant.oneKilometer;
/** circumference of the earth in meters. */
Constant.circumferenceOfEarth = 40075.0 * Constant.oneKilometer;
//# sourceMappingURL=Constant.js.map