"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const Geometry_1 = require("../Geometry");
const PointVector_1 = require("../PointVector");
const AnalyticGeometry_1 = require("../AnalyticGeometry");
const Polynomials_1 = require("./Polynomials");
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
        this._numAccepted = 0;
        this.numIterations = 0;
        this._stepSizeTolerance = stepSizeTolerance;
        this._successiveConvergenceTarget = successiveConvergenceTarget;
        this._maxIterations = maxIterations;
    }
    testConvergence(delta) {
        if (Math.abs(delta) < this._stepSizeTolerance) {
            this._numAccepted++;
            return this._numAccepted >= this._successiveConvergenceTarget;
        }
        this._numAccepted = 0;
        return false;
    }
    runIterations() {
        this._numAccepted = 0;
        this.numIterations = 0;
        while (this.numIterations++ < this._maxIterations && this.computeStep()) {
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
        this._func = func;
        this.setTarget(0);
    }
    setX(x) { this._currentX = x; return true; }
    getX() { return this._currentX; }
    setTarget(y) { this._target = y; }
    applyCurrentStep() { return this.setX(this._currentX - this._currentStep); }
    /** Univariate newton step : */
    computeStep() {
        if (this._func.evaluate(this._currentX)) {
            const dx = Geometry_1.Geometry.conditionalDivideFraction(this._func.currentF - this._target, this._func.currentdFdX);
            if (dx !== undefined) {
                this._currentStep = dx;
                return true;
            }
        }
        return false;
    }
    currentStepSize() {
        return Math.abs(this._currentStep / (1.0 + Math.abs(this._currentX)));
    }
}
exports.Newton1dUnbounded = Newton1dUnbounded;
/** object to evaluate a newton function (without derivative).  The object must retain most-recent function value.
 */
class NewtonEvaluatorRtoR {
}
exports.NewtonEvaluatorRtoR = NewtonEvaluatorRtoR;
/** Newton iteration for a univariate function, using approximate derivatives. */
class Newton1dUnboundedApproximateDerivative extends AbstractNewtonIterator {
    constructor(func) {
        super();
        this._func = func;
        this.derivativeH = 1.0e-8;
    }
    setX(x) { this._currentX = x; return true; }
    getX() { return this._currentX; }
    applyCurrentStep() { return this.setX(this._currentX - this._currentStep); }
    /** Univariate newton step : */
    computeStep() {
        if (this._func.evaluate(this._currentX)) {
            const fA = this._func.currentF;
            if (this._func.evaluate(this._currentX + this.derivativeH)) {
                const fB = this._func.currentF;
                const dx = Geometry_1.Geometry.conditionalDivideFraction(fA, (fB - fA) / this.derivativeH);
                if (dx !== undefined) {
                    this._currentStep = dx;
                    return true;
                }
            }
        }
        return false;
    }
    currentStepSize() {
        return Math.abs(this._currentStep / (1.0 + Math.abs(this._currentX)));
    }
}
exports.Newton1dUnboundedApproximateDerivative = Newton1dUnboundedApproximateDerivative;
/** object to evaluate a 2-parameter newton function (with derivatives!!).
 */
class NewtonEvaluatorRRtoRRD {
    /**
     * constructor.
     * * This creates a crrentF object to (repeatedly) receive function and derivatives.
     */
    constructor() {
        this.currentF = AnalyticGeometry_1.Plane3dByOriginAndVectors.createXYPlane();
    }
}
exports.NewtonEvaluatorRRtoRRD = NewtonEvaluatorRRtoRRD;
/**
 * Implement evaluation steps for newton iteration in 2 dimensions.
 */
class Newton2dUnboundedWithDerivative extends AbstractNewtonIterator {
    constructor(func) {
        super();
        this._func = func;
        this._currentStep = PointVector_1.Vector2d.createZero();
        this._currentUV = PointVector_1.Point2d.createZero();
    }
    setUV(x, y) { this._currentUV.set(x, y); return true; }
    getU() { return this._currentUV.x; }
    getV() { return this._currentUV.y; }
    applyCurrentStep() { return this.setUV(this._currentUV.x - this._currentStep.x, this._currentUV.y - this._currentStep.y); }
    /** Univariate newton step : */
    computeStep() {
        if (this._func.evaluate(this._currentUV.x, this._currentUV.y)) {
            const fA = this._func.currentF;
            if (Polynomials_1.SmallSystem.linearSystem2d(fA.vectorU.x, fA.vectorV.x, fA.vectorU.y, fA.vectorV.y, fA.origin.x, fA.origin.y, this._currentStep))
                return true;
        }
        return false;
    }
    /**
     * @returns the largest relative step of the x,y, components of the current step.
     */
    currentStepSize() {
        return Geometry_1.Geometry.maxAbsXY(this._currentStep.x / (1.0 + Math.abs(this._currentUV.x)), this._currentStep.y / (1.0 + Math.abs(this._currentUV.y)));
    }
}
exports.Newton2dUnboundedWithDerivative = Newton2dUnboundedWithDerivative;
//# sourceMappingURL=Newton.js.map