"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * * `GeometryHandler` defines the base abstract methods for double-dispatch geometry computation.
 * * User code that wants to handle one or all of the commonly known geometry types implements a handler class.
 * * User code that does not handle all types is most likely to start with `NullGeometryHandler`, which will provide no-action implementations for all types.
 * @public
 */
class GeometryHandler {
    /** handle strongly typed  CurveCollection  */
    handleCurveCollection(_g) { }
    /** handle strongly typed Path (base class method calls handleCurveCollection) */
    handlePath(g) { return this.handleCurveCollection(g); }
    /** handle strongly typed  Loop (base class method calls handleCurveCollection) */
    handleLoop(g) { return this.handleCurveCollection(g); }
    /** handle strongly typed  ParityRegion (base class method calls handleCurveCollection) */
    handleParityRegion(g) { return this.handleCurveCollection(g); }
    /** handle strongly typed  UnionRegion (base class method calls handleCurveCollection) */
    handleUnionRegion(g) { return this.handleCurveCollection(g); }
    /** handle strongly typed  BagOfCurves (base class method calls handleCurveCollection) */
    handleBagOfCurves(g) { return this.handleCurveCollection(g); }
}
exports.GeometryHandler = GeometryHandler;
/**
 * `NullGeometryHandler` is a base class for dispatching various geometry types to
 * application specific implementation of some service.
 *
 * To use:
 * * Derive a class from `NullGeometryHandler`
 * * Reimplement any or all of the specific `handleXXXX` methods
 * * Create a handler instance `myHandler`
 * * To send a `GeometryQuery` object `candidateGeometry` through the (fast) dispatch, invoke   `candidateGeometry.dispatchToHandler (myHandler)
 * * The appropriate method or methods will get called with a strongly typed `_g ` value.
 * @public
 */
class NullGeometryHandler extends GeometryHandler {
    /** no-action implementation */
    handleLineSegment3d(_g) { return undefined; }
    /** no-action implementation */
    handleLineString3d(_g) { return undefined; }
    /** no-action implementation */
    handleArc3d(_g) { return undefined; }
    /** no-action implementation */
    handleCurveCollection(_g) { return undefined; }
    /** no-action implementation */
    handleBSplineCurve3d(_g) { return undefined; }
    /** no-action implementation */
    handleBSplineCurve3dH(_g) { return undefined; }
    /** no-action implementation */
    handleBSplineSurface3d(_g) { return undefined; }
    /** no-action implementation */
    handleCoordinateXYZ(_g) { return undefined; }
    /** no-action implementation */
    handleBSplineSurface3dH(_g) { return undefined; }
    /** no-action implementation */
    handleIndexedPolyface(_g) { return undefined; }
    /** no-action implementation
     * @alpha
     */
    handleTransitionSpiral(_g) { return undefined; }
    /** no-action implementation */
    handlePath(_g) { return undefined; }
    /** no-action implementation */
    handleLoop(_g) { return undefined; }
    /** no-action implementation */
    handleParityRegion(_g) { return undefined; }
    /** no-action implementation */
    handleUnionRegion(_g) { return undefined; }
    /** no-action implementation */
    handleBagOfCurves(_g) { return undefined; }
    /** no-action implementation */
    handleSphere(_g) { return undefined; }
    /** no-action implementation */
    handleCone(_g) { return undefined; }
    /** no-action implementation */
    handleBox(_g) { return undefined; }
    /** no-action implementation */
    handleTorusPipe(_g) { return undefined; }
    /** no-action implementation */
    handleLinearSweep(_g) { return undefined; }
    /** no-action implementation */
    handleRotationalSweep(_g) { return undefined; }
    /** no-action implementation */
    handleRuledSweep(_g) { return undefined; }
    /** no-action implementation */
    handlePointString3d(_g) { return undefined; }
    /** no-action implementation */
    handleBezierCurve3d(_g) { return undefined; }
    /** no-action implementation */
    handleBezierCurve3dH(_g) { return undefined; }
}
exports.NullGeometryHandler = NullGeometryHandler;
/**
 * Implement GeometryHandler methods, with all curve collection methods recursing to children.
 * @public
 */
class RecurseToCurvesGeometryHandler extends GeometryHandler {
    /** no-action implementation */
    handleLineSegment3d(_g) { return undefined; }
    /** no-action implementation */
    handleLineString3d(_g) { return undefined; }
    /** no-action implementation */
    handleArc3d(_g) { return undefined; }
    /** no-action implementation */
    handleBSplineCurve3d(_g) { return undefined; }
    /** no-action implementation */
    handleBSplineCurve3dH(_g) { return undefined; }
    /** no-action implementation */
    handleBSplineSurface3d(_g) { return undefined; }
    /** no-action implementation */
    handleCoordinateXYZ(_g) { return undefined; }
    /** no-action implementation */
    handleBSplineSurface3dH(_g) { return undefined; }
    /** no-action implementation */
    handleIndexedPolyface(_g) { return undefined; }
    /** no-action implementation
     * @alpha
     */
    handleTransitionSpiral(_g) { return undefined; }
    /** Invoke `child.dispatchToGeometryHandler(this)` for each child in the array returned by the query `g.children` */
    handleChildren(g) {
        const children = g.children;
        if (children)
            for (const child of children) {
                child.dispatchToGeometryHandler(this);
            }
    }
    /** Recurse to children */
    handleCurveCollection(g) { return this.handleChildren(g); }
    /** Recurse to children */
    handlePath(g) { return this.handleChildren(g); }
    /** Recurse to children */
    handleLoop(g) { return this.handleChildren(g); }
    /** Recurse to children */
    handleParityRegion(g) { return this.handleChildren(g); }
    /** Recurse to children */
    handleUnionRegion(g) { return this.handleChildren(g); }
    /** Recurse to children */
    handleBagOfCurves(g) { return this.handleChildren(g); }
    /** no-action implementation */
    handleSphere(_g) { return undefined; }
    /** no-action implementation */
    handleCone(_g) { return undefined; }
    /** no-action implementation */
    handleBox(_g) { return undefined; }
    /** no-action implementation */
    handleTorusPipe(_g) { return undefined; }
    /** no-action implementation */
    handleLinearSweep(_g) { return undefined; }
    /** no-action implementation */
    handleRotationalSweep(_g) { return undefined; }
    /** no-action implementation */
    handleRuledSweep(_g) { return undefined; }
    /** no-action implementation */
    handlePointString3d(_g) { return undefined; }
    /** no-action implementation */
    handleBezierCurve3d(_g) { return undefined; }
    /** no-action implementation */
    handleBezierCurve3dH(_g) { return undefined; }
}
exports.RecurseToCurvesGeometryHandler = RecurseToCurvesGeometryHandler;
//# sourceMappingURL=GeometryHandler.js.map