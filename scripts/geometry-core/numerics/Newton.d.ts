import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
/** base class for Newton iterations in various dimensions.
 * Dimension-specific classes carry all dimension-related data and answer generalized queries
 * from this base class.
 */
export declare abstract class AbstractNewtonIterator {
    /** Compute a step.  The current x and function values must be retained for use in later method calls */
    abstract computeStep(): boolean;
    /** return the current step size, scaled for use in tolerance tests. */
    abstract currentStepSize(): number;
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
    protected _numAccepted: number;
    protected _successiveConvergenceTarget: number;
    protected _stepSizeTolerance: number;
    protected _maxIterations: number;
    numIterations: number;
    testConvergence(delta: number): boolean;
    runIterations(): boolean;
}
/** object to evaluate a newton function.  The object must retain most-recent function and derivative
 * values for immediate query.
 */
export declare abstract class NewtonEvaluatorRtoRD {
    abstract evaluate(x: number): boolean;
    currentF: number;
    currentdFdX: number;
}
export declare class Newton1dUnbounded extends AbstractNewtonIterator {
    private _func;
    private _currentStep;
    private _currentX;
    private _target;
    constructor(func: NewtonEvaluatorRtoRD);
    setX(x: number): boolean;
    getX(): number;
    setTarget(y: number): void;
    applyCurrentStep(): boolean;
    /** Univariate newton step : */
    computeStep(): boolean;
    currentStepSize(): number;
}
/** object to evaluate a newton function (without derivative).  The object must retain most-recent function value.
 */
export declare abstract class NewtonEvaluatorRtoR {
    abstract evaluate(x: number): boolean;
    currentF: number;
}
/** Newton iteration for a univariate function, using approximate derivatives. */
export declare class Newton1dUnboundedApproximateDerivative extends AbstractNewtonIterator {
    private _func;
    private _currentStep;
    private _currentX;
    derivativeH: number;
    constructor(func: NewtonEvaluatorRtoR);
    setX(x: number): boolean;
    getX(): number;
    applyCurrentStep(): boolean;
    /** Univariate newton step : */
    computeStep(): boolean;
    currentStepSize(): number;
}
/** object to evaluate a 2-parameter newton function (with derivatives!!).
 */
export declare abstract class NewtonEvaluatorRRtoRRD {
    /** Iteration controller calls this to ask for evaluation of the function and its two partial derivatives.
     * * The implemention returns true, it must set the currentF object.
     */
    abstract evaluate(x: number, y: number): boolean;
    /** most recent function evaluation */
    currentF: Plane3dByOriginAndVectors;
    /**
     * constructor.
     * * This creates a crrentF object to (repeatedly) receive function and derivatives.
     */
    constructor();
}
/**
 * Implement evaluation steps for newton iteration in 2 dimensions.
 */
export declare class Newton2dUnboundedWithDerivative extends AbstractNewtonIterator {
    private _func;
    private _currentStep;
    private _currentUV;
    constructor(func: NewtonEvaluatorRRtoRRD);
    setUV(x: number, y: number): boolean;
    getU(): number;
    getV(): number;
    applyCurrentStep(): boolean;
    /** Univariate newton step : */
    computeStep(): boolean;
    /**
     * @returns the largest relative step of the x,y, components of the current step.
     */
    currentStepSize(): number;
}
//# sourceMappingURL=Newton.d.ts.map