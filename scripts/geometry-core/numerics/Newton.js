"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const Geometry_1 = require("../Geometry");
/** base class for Newton iterations in various dimensions.
 * Dimension-specific classes carry all dimension-related data and answer generalized queries
 * from this base class.
 */
class AbstractNewtonIterator {
    /**
     * @param stepSizeTarget tolerance to consider a single step converged.
     * This number should be "moderately" strict.   Because 2 successive convergences are required,
     * it is expected that a first "accept" for (say) 10 to 14 digit step will be followed by another
     * iteration.   A well behaved newton would then hypothetically double the number of digits to
     * 20 to 28.  Since the IEEE double only carries 16 digits, this second-convergence step will
     * typically achieve full precision.
     * @param successiveConvergenceTarget number of successive convergences required for acceptance.
     * @param maxIterations max number of iterations.   A typical newton step converges in 3 to 6 iterations.
     *     Allow 15 to 20 to catch difficult cases.
     */
    constructor(stepSizeTolerance = 1.0e-11, successiveConvergenceTarget = 2, maxIterations = 15) {
        this.numAccepted = 0;
        this.numIterations = 0;
        this.stepSizeTolerance = stepSizeTolerance;
        this.successiveConvergenceTarget = successiveConvergenceTarget;
        this.maxIterations = maxIterations;
    }
    testConvergence(delta) {
        if (Math.abs(delta) < this.stepSizeTolerance) {
            this.numAccepted++;
            return this.numAccepted >= this.successiveConvergenceTarget;
        }
        this.numAccepted = 0;
        return false;
    }
    runIterations() {
        this.numAccepted = 0;
        this.numIterations = 0;
        while (this.numIterations++ < this.maxIterations && this.computeStep()) {
            if (this.testConvergence(this.currentStepSize())
                && this.applyCurrentStep(true)) {
                return true;
            }
            this.applyCurrentStep(false);
        }
        return false;
    }
}
exports.AbstractNewtonIterator = AbstractNewtonIterator;
/** object to evaluate a newton function.  The object must retain most-recent function and derivative
 * values for immediate query.
 */
class NewtonEvaluatorRtoRD {
}
exports.NewtonEvaluatorRtoRD = NewtonEvaluatorRtoRD;
class Newton1dUnbounded extends AbstractNewtonIterator {
    constructor(func) {
        super();
        this.func = func;
        this.setTarget(0);
    }
    setX(x) { this.currentX = x; return true; }
    getX() { return this.currentX; }
    setTarget(y) { this.target = y; }
    applyCurrentStep() { return this.setX(this.currentX - this.currentStep); }
    /** Univariate newton step : */
    computeStep() {
        if (this.func.evaluate(this.currentX)) {
            const dx = Geometry_1.Geometry.conditionalDivideFraction(this.func.currentF - this.target, this.func.currentdFdX);
            if (dx !== undefined) {
                this.currentStep = dx;
                return true;
            }
        }
        return false;
    }
    currentStepSize() {
        return Math.abs(this.currentStep / (1.0 + Math.abs(this.currentX)));
    }
}
exports.Newton1dUnbounded = Newton1dUnbounded;
/** object to evaluate a newton function (without derivative).  The object must retain most-recent function value.
 */
class NewtonEvaluatorRtoR {
}
exports.NewtonEvaluatorRtoR = NewtonEvaluatorRtoR;
class Newton1dUnboundedApproximateDerivative extends AbstractNewtonIterator {
    constructor(func) {
        super();
        this.func = func;
        this.derivativeH = 1.0e-8;
    }
    setX(x) { this.currentX = x; return true; }
    getX() { return this.currentX; }
    applyCurrentStep() { return this.setX(this.currentX - this.currentStep); }
    /** Univariate newton step : */
    computeStep() {
        if (this.func.evaluate(this.currentX)) {
            const fA = this.func.currentF;
            if (this.func.evaluate(this.currentX + this.derivativeH)) {
                const fB = this.func.currentF;
                const dx = Geometry_1.Geometry.conditionalDivideFraction(fA, (fB - fA) / this.derivativeH);
                if (dx !== undefined) {
                    this.currentStep = dx;
                    return true;
                }
            }
        }
        return false;
    }
    currentStepSize() {
        return Math.abs(this.currentStep / (1.0 + Math.abs(this.currentX)));
    }
}
exports.Newton1dUnboundedApproximateDerivative = Newton1dUnboundedApproximateDerivative;
//# sourceMappingURL=Newton.js.map