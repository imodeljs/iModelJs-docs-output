"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const Geometry_1 = require("../Geometry");
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Plane3dByOriginAndVectors_1 = require("../geometry3d/Plane3dByOriginAndVectors");
const Polynomials_1 = require("./Polynomials");
/** base class for Newton iterations in various dimensions.
 * Dimension-specific classes carry all dimension-related data and answer generalized queries
 * from this base class.
 * @internal
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
        /** Number of consecutive steps which passed convergence condition */
        this._numAccepted = 0;
        /** number of iterations (incremented at each step) */
        this.numIterations = 0;
        this._stepSizeTolerance = stepSizeTolerance;
        this._successiveConvergenceTarget = successiveConvergenceTarget;
        this._maxIterations = maxIterations;
    }
    /**
     * Test if a step is converged.
     * * Convergence is accepted with enough (_successiveConvergenceTarget) small steps (according to _stepSizeTolerance) occur in succession.
     * @param delta step size as reported by currentStepSize
     */
    testConvergence(delta) {
        if (Math.abs(delta) < this._stepSizeTolerance) {
            this._numAccepted++;
            return this._numAccepted >= this._successiveConvergenceTarget;
        }
        this._numAccepted = 0;
        return false;
    }
    /**
     * Run iterations, calling various methods from base and derived classes:
     * * computeStep -- typically evaluate derivatives and solve lineary system.
     * * currentStepSize -- return numeric measure of the step just computed by computeStep
     * * testConvergence -- test if the step from currentStepSize (along with recent steps) is converged.
     * * applyCurrentStep -- apply the step to the independent variables
     */
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
 * @internal
 */
class NewtonEvaluatorRtoRD {
}
exports.NewtonEvaluatorRtoRD = NewtonEvaluatorRtoRD;
/**
 * Newton iterator for use when both function and derivative can be evaluated.
 * @internal
 */
class Newton1dUnbounded extends AbstractNewtonIterator {
    /**
     * Constructor for 1D newton iteration with approximate derivatives.
     * @param func function that returns both function and derivative.
     */
    constructor(func) {
        super();
        this._func = func;
        this.setTarget(0);
    }
    /** Set the independent variable */
    setX(x) { this._currentX = x; return true; }
    /** Get the independent variable */
    getX() { return this._currentX; }
    /** Set the target function value */
    setTarget(y) { this._target = y; }
    /** move the current X by the just-computed step */
    applyCurrentStep() { return this.setX(this._currentX - this._currentStep); }
    /** Compute the univariate newton step. */
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
    /** Return the current step size as a relative number. */
    currentStepSize() {
        return Math.abs(this._currentStep / (1.0 + Math.abs(this._currentX)));
    }
}
exports.Newton1dUnbounded = Newton1dUnbounded;
/** object to evaluate a newton function (without derivative).  The object must retain most-recent function value.
 * @internal
 */
class NewtonEvaluatorRtoR {
}
exports.NewtonEvaluatorRtoR = NewtonEvaluatorRtoR;
/** Newton iteration for a univariate function, using approximate derivatives.
 * @internal
 */
class Newton1dUnboundedApproximateDerivative extends AbstractNewtonIterator {
    /**
     * Constructor for 1D newton iteration with approximate derivatives.
     * @param func function that returns both function and derivative.
     */
    constructor(func) {
        super();
        this._func = func;
        this.derivativeH = 1.0e-8;
    }
    /** Set the x (independent, iterated) value */
    setX(x) { this._currentX = x; return true; }
    /** Get the independent variable */
    getX() { return this._currentX; }
    /** move the current X by the just-computed step */
    applyCurrentStep() { return this.setX(this._currentX - this._currentStep); }
    /** Univariate newton step computed with APPROXIMATE derivative. */
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
    /** Return the current step size as a relative number. */
    currentStepSize() {
        return Math.abs(this._currentStep / (1.0 + Math.abs(this._currentX)));
    }
}
exports.Newton1dUnboundedApproximateDerivative = Newton1dUnboundedApproximateDerivative;
/** object to evaluate a 2-parameter newton function (with derivatives!!).
 * @internal
 */
class NewtonEvaluatorRRtoRRD {
    /**
     * constructor.
     * * This creates a crrentF object to (repeatedly) receive function and derivatives.
     */
    constructor() {
        this.currentF = Plane3dByOriginAndVectors_1.Plane3dByOriginAndVectors.createXYPlane();
    }
}
exports.NewtonEvaluatorRRtoRRD = NewtonEvaluatorRRtoRRD;
/**
 * Implement evaluation steps for newton iteration in 2 dimensions, using caller supplied NewtonEvaluatorRRtoRRD object.
 * @internal
 */
class Newton2dUnboundedWithDerivative extends AbstractNewtonIterator {
    constructor(func) {
        super();
        this._func = func;
        this._currentStep = Point2dVector2d_1.Vector2d.createZero();
        this._currentUV = Point2dVector2d_1.Point2d.createZero();
    }
    /** Set the current uv coordinates for current iteration */
    setUV(x, y) { this._currentUV.set(x, y); return true; }
    /** Get the current u coordinate */
    getU() { return this._currentUV.x; }
    /** Get the current v coordinate */
    getV() { return this._currentUV.y; }
    /** Move the currentUV coordiante by currentStep. */
    applyCurrentStep() { return this.setUV(this._currentUV.x - this._currentStep.x, this._currentUV.y - this._currentStep.y); }
    /** Evaluate the functions and derivatives at this._currentUV
     * Invert the jacobian and compute the this._currentStep.
     */
    computeStep() {
        if (this._func.evaluate(this._currentUV.x, this._currentUV.y)) {
            const fA = this._func.currentF;
            if (Polynomials_1.SmallSystem.linearSystem2d(fA.vectorU.x, fA.vectorV.x, fA.vectorU.y, fA.vectorV.y, fA.origin.x, fA.origin.y, this._currentStep))
                return true;
        }
        return false;
    }
    /**
     * Return the largest relative step of the x,y, components of the current step.
     */
    currentStepSize() {
        return Geometry_1.Geometry.maxAbsXY(this._currentStep.x / (1.0 + Math.abs(this._currentUV.x)), this._currentStep.y / (1.0 + Math.abs(this._currentUV.y)));
    }
}
exports.Newton2dUnboundedWithDerivative = Newton2dUnboundedWithDerivative;
//# sourceMappingURL=Newton.js.map