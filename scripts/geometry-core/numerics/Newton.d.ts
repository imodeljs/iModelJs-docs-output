import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
/** base class for Newton iterations in various dimensions.
 * Dimension-specific classes carry all dimension-related data and answer generalized queries
 * from this base class.
 * @internal
 */
export declare abstract class AbstractNewtonIterator {
    /** Compute a step.  The current x and function values must be retained for use in later method calls */
    abstract computeStep(): boolean;
    /** return the current step size, scaled for use in tolerance tests.
     * * This is a single number, typically the max of various per-dimension `dx / (1+x)` for the x and dx of that dimension.
     */
    abstract currentStepSize(): number;
    /**
     * Apply the current step (in all dimensions)
     * @param isFinalStep true if this is a final step.
     */
    abstract applyCurrentStep(isFinalStep: boolean): boolean;
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
    protected constructor(stepSizeTolerance?: number, successiveConvergenceTarget?: number, maxIterations?: number);
    /** Number of consecutive steps which passed convergence condition */
    protected _numAccepted: number;
    /** Target number of successive convergences */
    protected _successiveConvergenceTarget: number;
    /** convergence target (the implementation-specific currentStepSize is compared to this) */
    protected _stepSizeTolerance: number;
    /** Max iterations allowed */
    protected _maxIterations: number;
    /** number of iterations (incremented at each step) */
    numIterations: number;
    /**
     * Test if a step is converged.
     * * Convergence is accepted with enough (_successiveConvergenceTarget) small steps (according to _stepSizeTolerance) occur in succession.
     * @param delta step size as reported by currentStepSize
     */
    testConvergence(delta: number): boolean;
    /**
     * Run iterations, calling various methods from base and derived classes:
     * * computeStep -- typically evaluate derivatives and solve lineary system.
     * * currentStepSize -- return numeric measure of the step just computed by computeStep
     * * testConvergence -- test if the step from currentStepSize (along with recent steps) is converged.
     * * applyCurrentStep -- apply the step to the independent variables
     */
    runIterations(): boolean;
}
/** object to evaluate a newton function.  The object must retain most-recent function and derivative
 * values for immediate query.
 * @internal
 */
export declare abstract class NewtonEvaluatorRtoRD {
    /** evaluate the function and its derivative at x. */
    abstract evaluate(x: number): boolean;
    /** most recent function value */
    currentF: number;
    /** most recent evaluated derivative */
    currentdFdX: number;
}
/**
 * Newton iterator for use when both function and derivative can be evaluated.
 * @internal
 */
export declare class Newton1dUnbounded extends AbstractNewtonIterator {
    private _func;
    private _currentStep;
    private _currentX;
    private _target;
    /**
     * Constructor for 1D newton iteration with approximate derivatives.
     * @param func function that returns both function and derivative.
     */
    constructor(func: NewtonEvaluatorRtoRD);
    /** Set the independent variable */
    setX(x: number): boolean;
    /** Get the independent variable */
    getX(): number;
    /** Set the target function value */
    setTarget(y: number): void;
    /** move the current X by the just-computed step */
    applyCurrentStep(): boolean;
    /** Compute the univariate newton step. */
    computeStep(): boolean;
    /** Return the current step size as a relative number. */
    currentStepSize(): number;
}
/** object to evaluate a newton function (without derivative).  The object must retain most-recent function value.
 * @internal
 */
export declare abstract class NewtonEvaluatorRtoR {
    /** Evalute function value into member currentF */
    abstract evaluate(x: number): boolean;
    /** Most recent function evaluation. */
    currentF: number;
}
/** Newton iteration for a univariate function, using approximate derivatives.
 * @internal
 */
export declare class Newton1dUnboundedApproximateDerivative extends AbstractNewtonIterator {
    private _func;
    private _currentStep;
    private _currentX;
    /** Step size for iteration.
     * * Initialized to 1e-8, which is appropriate for iteration in fraction space.
     * * Shoulde larger for iteration with real distance as x.
     */
    derivativeH: number;
    /**
     * Constructor for 1D newton iteration with approximate derivatives.
     * @param func function that returns both function and derivative.
     */
    constructor(func: NewtonEvaluatorRtoR);
    /** Set the x (independent, iterated) value */
    setX(x: number): boolean;
    /** Get the independent variable */
    getX(): number;
    /** move the current X by the just-computed step */
    applyCurrentStep(): boolean;
    /** Univariate newton step computed with APPROXIMATE derivative. */
    computeStep(): boolean;
    /** Return the current step size as a relative number. */
    currentStepSize(): number;
}
/** object to evaluate a 2-parameter newton function (with derivatives!!).
 * @internal
 */
export declare abstract class NewtonEvaluatorRRtoRRD {
    /** Iteration controller calls this to ask for evaluation of the function and its two partial derivatives.
     * * The implemention returns true, it must set the currentF object.
     */
    abstract evaluate(x: number, y: number): boolean;
    /** most recent function evaluation as xy parts of the plane */
    currentF: Plane3dByOriginAndVectors;
    /**
     * constructor.
     * * This creates a crrentF object to (repeatedly) receive function and derivatives.
     */
    constructor();
}
/**
 * Implement evaluation steps for newton iteration in 2 dimensions, using caller supplied NewtonEvaluatorRRtoRRD object.
 * @internal
 */
export declare class Newton2dUnboundedWithDerivative extends AbstractNewtonIterator {
    private _func;
    private _currentStep;
    private _currentUV;
    constructor(func: NewtonEvaluatorRRtoRRD);
    /** Set the current uv coordinates for current iteration */
    setUV(x: number, y: number): boolean;
    /** Get the current u coordinate */
    getU(): number;
    /** Get the current v coordinate */
    getV(): number;
    /** Move the currentUV coordiante by currentStep. */
    applyCurrentStep(): boolean;
    /** Evaluate the functions and derivatives at this._currentUV
     * Invert the jacobian and compute the this._currentStep.
     */
    computeStep(): boolean;
    /**
     * Return the largest relative step of the x,y, components of the current step.
     */
    currentStepSize(): number;
}
//# sourceMappingURL=Newton.d.ts.map