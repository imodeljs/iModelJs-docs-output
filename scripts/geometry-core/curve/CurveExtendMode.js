"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Geometry_1 = require("../Geometry");
/** module Curve */
/** enumeration of condition for extending a curve beyond start or end point.
 * * Not all CurvePrimitives support these modes.
 * @public
 */
var CurveExtendMode;
(function (CurveExtendMode) {
    /** No extension allowed. */
    CurveExtendMode[CurveExtendMode["None"] = 0] = "None";
    /** Extend along continuation of the end tangent */
    CurveExtendMode[CurveExtendMode["OnTangent"] = 1] = "OnTangent";
    /** Extend along continuation of the curve. */
    CurveExtendMode[CurveExtendMode["OnCurve"] = 2] = "OnCurve";
})(CurveExtendMode = exports.CurveExtendMode || (exports.CurveExtendMode = {}));
/** Logic for deciding how a curve may be extended for closest point or intersection searches.
 * @public
 */
class CurveExtendOptions {
    /** Given an ExtendParameter, isolate the particular CurveExtendOptions in effect at an end.
     * * Return undefined if `param === false`
     * * return the (strongly typed) pointer to the param if it is a single CurveExtendOptions.
     * * Return dereferenced array entry 0 or 1 if the param is an array of CurveExtendOptions.
     */
    static resolveVariantCurveExtendParameterToCurveExtendMode(param, endIndex) {
        if (param === false)
            return CurveExtendMode.None;
        if (param === true)
            return CurveExtendMode.OnCurve;
        if (Array.isArray(param))
            return param[endIndex];
        return param;
    }
    /**
     *
     * * if fraction is between 0 and 1 return it unchanged.
     * * if fraction is less than 0 use the variant param to choose the fraction or 0
     * * if fraction is greater than 1 use the variant param to choose the fraction or 1
     *
     */
    static correctFraction(extendParam, fraction) {
        if (fraction < 0) {
            const mode = CurveExtendOptions.resolveVariantCurveExtendParameterToCurveExtendMode(extendParam, 0);
            if (mode === CurveExtendMode.None)
                fraction = 0.0;
        }
        else if (fraction > 1.0) {
            const mode = CurveExtendOptions.resolveVariantCurveExtendParameterToCurveExtendMode(extendParam, 1);
            if (mode === CurveExtendMode.None)
                fraction = 1.0;
        }
        return fraction;
    }
    /**
     * Adjust a radians value to an angle sweep, allowing the extendParam to affect choice among periodic fractions.
     * * if radians is within the sweep, convert it to a fraction of the sweep.
     * * if radians is outside, use the extendParam to choose among:
     *    * fraction below 0
     *    * fraction above 1
     */
    static resolveRadiansToSweepFraction(extendParam, radians, sweep) {
        let fraction = sweep.radiansToSignedPeriodicFraction(radians);
        if (!sweep.isRadiansInSweep(radians)) {
            const fractionPeriod = sweep.fractionPeriod();
            const mode0 = CurveExtendOptions.resolveVariantCurveExtendParameterToCurveExtendMode(extendParam, 0);
            const mode1 = CurveExtendOptions.resolveVariantCurveExtendParameterToCurveExtendMode(extendParam, 1);
            if (mode0 !== CurveExtendMode.None) {
                if (mode1 !== CurveExtendMode.None) {
                    // both extensions possible ... let the sweep resolve to the "closer" end
                    fraction = sweep.radiansToSignedPeriodicFraction(radians);
                }
                else {
                    // only extend to negative .....
                    if (fraction > 1.0)
                        fraction -= fractionPeriod;
                }
            }
            else if (mode1 !== CurveExtendMode.None) {
                if (fraction < 0.0)
                    fraction += fractionPeriod;
            }
            else { // both clamped !!!!
                fraction = Geometry_1.Geometry.clamp(fraction, 0, 1);
            }
        }
        return fraction;
    }
}
exports.CurveExtendOptions = CurveExtendOptions;
//# sourceMappingURL=CurveExtendMode.js.map